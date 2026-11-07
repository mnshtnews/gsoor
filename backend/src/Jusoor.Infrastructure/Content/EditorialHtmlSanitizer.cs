using AngleSharp.Html.Dom;
using AngleSharp.Dom;
using Ganss.Xss;
using Jusoor.Application.Common.Interfaces;

namespace Jusoor.Infrastructure.Content;

/// <summary>
/// Allow-list HTML sanitizer for editorial article bodies — Slice 21, decision
/// D2 ("store clean HTML; sanitize server-side with an allow-list sanitizer
/// (HtmlSanitizer / Ganss.Xss) — never trust the editor").
///
/// The policy is the deliberately small set of things the CMS editor can
/// produce today; everything else is removed, and the element is dropped WITH
/// its content for tags that are not allowed (a stray &lt;script&gt;,
/// &lt;style&gt;, &lt;form&gt; or &lt;svg&gt; leaves nothing behind). Iframes
/// are retained only for canonical approved providers; images/videos only with media IDs.
/// Raster images and newsroom media links are admitted only as inert references;
/// IEditorialMediaReferenceValidator binds every ID to a ready database asset.
///
///  - Tags: p, br, h2, h3, strong, em, u, blockquote, ul, ol, li, a, hr, figure, figcaption, img,
///    table, thead, tbody, tr, th, td. Table attributes (including colspan and
///    rowspan) are never allowed, which keeps tables simple and unmerged.
///  - Attributes are filtered per element after the sanitizer's global allow-list: href on
///    links, src/alt on images, playback controls on video, fixed sandbox fields on iframes,
///    and opaque data-media-id references.
///  - URL schemes: http, https, mailto (javascript:, data:, vbscript: … dropped).
///  - Every link that keeps an href gets rel="noopener noreferrer" (D2). The
///    attribute is re-derived on every pass, never trusted from the input, so
///    the output is idempotent: Sanitize(Sanitize(x)) == Sanitize(x).
///
/// A new sanitizer is built per call because configuring an instance after
/// first use is not safe for concurrent callers; construction is cheap next to
/// parsing, and article saves are rare. Stateless, so safe as a singleton.
/// </summary>
public sealed class EditorialHtmlSanitizer : IEditorialHtmlSanitizer
{
    public static IReadOnlyCollection<string> AllowedTags { get; } =
        new[] { "p", "br", "h2", "h3", "strong", "em", "u", "span", "blockquote", "ul", "ol", "li", "a", "hr", "figure", "figcaption", "img", "video", "iframe", "table", "thead", "tbody", "tr", "th", "td" };

    public static IReadOnlyCollection<string> AllowedAttributes { get; } = new[] { "href", "src", "alt", "title", "style", "data-media-id", "data-provider", "sandbox", "allow", "allowfullscreen", "loading", "referrerpolicy", "controls", "preload" };

    public static IReadOnlyCollection<string> AllowedSchemes { get; } = new[] { "http", "https", "mailto" };

    public const string LinkRel = "noopener noreferrer";

    public string Sanitize(string html)
    {
        ArgumentNullException.ThrowIfNull(html);
        return CreateSanitizer().Sanitize(html);
    }

    private static HtmlSanitizer CreateSanitizer()
    {
        var sanitizer = new HtmlSanitizer();

        // The parameterless constructor seeds the library's own (much wider)
        // defaults, so every set is cleared first and refilled from OUR list.
        Replace(sanitizer.AllowedTags, AllowedTags);
        Replace(sanitizer.AllowedAttributes, AllowedAttributes);
        Replace(sanitizer.AllowedSchemes, AllowedSchemes);
        sanitizer.AllowedCssProperties.Clear();
        sanitizer.AllowedCssProperties.Add("color");
        sanitizer.AllowedAtRules.Clear();
        sanitizer.AllowedClasses.Clear();
        sanitizer.AllowDataAttributes = false;

        sanitizer.PostProcessNode += (_, e) =>
        {
            if (e.Node is IElement element)
            {
                var allowedForElement = element.LocalName switch
                {
                    "a" => new[] { "href" },
                    "figure" => new[] { "data-media-id" },
                    "img" => new[] { "src", "alt", "data-media-id" },
                    "video" => new[] { "src", "data-media-id", "controls", "preload" },
                    "iframe" => new[] { "src", "title", "data-provider", "sandbox", "allow", "allowfullscreen", "loading", "referrerpolicy" },
                    "span" => new[] { "style" },
                    _ => Array.Empty<string>()
                };
                foreach (var attribute in element.Attributes.Select(attribute => attribute.Name).ToArray())
                {
                    if (!allowedForElement.Contains(attribute, StringComparer.OrdinalIgnoreCase))
                    {
                        element.RemoveAttribute(attribute);
                    }
                }
                if (element.HasAttribute("style"))
                {
                    if (string.Equals(element.LocalName, "span", StringComparison.OrdinalIgnoreCase)
                        && TryNormalizeColor(element.GetAttribute("style"), out var normalizedStyle))
                    {
                        element.SetAttribute("style", normalizedStyle);
                    }
                    else
                    {
                        element.RemoveAttribute("style");
                    }
                }
            }

            if (e.Node is IHtmlAnchorElement anchor && anchor.HasAttribute("href"))
            {
                anchor.SetAttribute("rel", LinkRel);
            }

            if (e.Node is IElement { LocalName: "iframe" } iframe)
            {
                if (!EditorialMediaReferenceValidator.TryNormalizeEmbed(iframe.GetAttribute("src"), out var source, out var provider))
                {
                    iframe.Remove();
                }
                else
                {
                    iframe.SetAttribute("src", source);
                    iframe.SetAttribute("data-provider", provider);
                    iframe.SetAttribute("title", $"محتوى مضمن من {provider}");
                    iframe.SetAttribute("loading", "lazy");
                    iframe.SetAttribute("referrerpolicy", "strict-origin-when-cross-origin");
                    iframe.SetAttribute("sandbox", "allow-scripts allow-same-origin allow-presentation");
                    iframe.SetAttribute("allow", "encrypted-media; picture-in-picture");
                    iframe.SetAttribute("allowfullscreen", string.Empty);
                    iframe.InnerHtml = string.Empty;
                }
            }

            if (e.Node is IElement { LocalName: "video" } video)
            {
                if (!System.Guid.TryParse(video.GetAttribute("data-media-id"), out System.Guid _))
                {
                    video.Remove();
                }
                video.SetAttribute("controls", string.Empty);
                video.SetAttribute("preload", "metadata");
                video.RemoveAttribute("autoplay");
            }

            if (e.Node is IElement { LocalName: "img" } image
                && !System.Guid.TryParse(image.GetAttribute("data-media-id"), out System.Guid _))
            {
                image.Remove();
            }

            // A table in a table cell is valid HTML, but outside this slice's intentionally
            // narrow editorial contract. Drop nested tables rather than preserving their cells.
            if (e.Node is IElement { LocalName: "table" } table)
            {
                foreach (var nestedTable in table.QuerySelectorAll("table").ToArray())
                {
                    nestedTable.Remove();
                }

                var rows = table.QuerySelectorAll("tr").ToArray();
                var hasHeaderRow = rows.Length > 0
                    && rows[0].Children.Length > 0
                    && rows[0].Children.All(cell => cell.LocalName == "th")
                    && rows.Skip(1).All(row => row.Children.All(cell => cell.LocalName == "td"));

                // Only preserve the one supported shape: a non-empty all-header first row,
                // followed by data-only rows. Unsupported/ambiguous tables are dropped whole.
                if (!hasHeaderRow)
                {
                    table.Remove();
                }
            }
        };

        return sanitizer;
    }

    private static bool TryNormalizeColor(string? style, out string normalizedStyle)
    {
        normalizedStyle = string.Empty;
        if (string.IsNullOrWhiteSpace(style)) return false;

        var hexMatch = System.Text.RegularExpressions.Regex.Match(
            style,
            @"^\s*color\s*:\s*(#[0-9a-fA-F]{6})\s*;?\s*$",
            System.Text.RegularExpressions.RegexOptions.CultureInvariant);
        if (hexMatch.Success)
        {
            normalizedStyle = $"color: {hexMatch.Groups[1].Value.ToLowerInvariant()}";
            return true;
        }

        var shortHexMatch = System.Text.RegularExpressions.Regex.Match(
            style,
            @"^\s*color\s*:\s*#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])\s*;?\s*$",
            System.Text.RegularExpressions.RegexOptions.CultureInvariant);
        if (shortHexMatch.Success)
        {
            var r = shortHexMatch.Groups[1].Value;
            var g = shortHexMatch.Groups[2].Value;
            var b = shortHexMatch.Groups[3].Value;
            normalizedStyle = $"color: #{r}{r}{g}{g}{b}{b}".ToLowerInvariant();
            return true;
        }

        var rgbMatch = System.Text.RegularExpressions.Regex.Match(
            style,
            @"^\s*color\s*:\s*rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:1|0|0?\.\d+)\s*)?\)\s*;?\s*$",
            System.Text.RegularExpressions.RegexOptions.CultureInvariant | System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (rgbMatch.Success
            && int.TryParse(rgbMatch.Groups[1].Value, out var cr) && cr >= 0 && cr <= 255
            && int.TryParse(rgbMatch.Groups[2].Value, out var cg) && cg >= 0 && cg <= 255
            && int.TryParse(rgbMatch.Groups[3].Value, out var cb) && cb >= 0 && cb <= 255)
        {
            normalizedStyle = $"color: #{cr:x2}{cg:x2}{cb:x2}";
            return true;
        }

        return false;
    }

    private static void Replace(ISet<string> target, IEnumerable<string> values)
    {
        target.Clear();
        foreach (var value in values)
        {
            target.Add(value);
        }
    }
}
