using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Jusoor.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Jusoor.Infrastructure.Translation;

/// <summary>Server-side Microsoft Translator v3 client. Credentials are never returned to the browser.</summary>
public sealed class AzureEditorialTextTranslator(HttpClient httpClient, IConfiguration configuration) : IEditorialTextTranslator
{
    private const int MaxBatchCharacters = 4_800;
    private const int MaxBatchItems = 25;
    private const int ChunkCharacters = 4_400;
    private string Endpoint => (configuration["AzureTranslator:Endpoint"] ?? "https://api.cognitive.microsofttranslator.com").TrimEnd('/');
    private string? Key => configuration["AzureTranslator:Key"] ?? configuration["AZURE_TRANSLATOR_KEY"];
    private string? Region => configuration["AzureTranslator:Region"] ?? configuration["AZURE_TRANSLATOR_REGION"];
    public bool IsConfigured => !string.IsNullOrWhiteSpace(Key);

    public async Task<string> TranslateAsync(string text, string targetLocale, CancellationToken cancellationToken)
    {
        if (targetLocale is not ("en" or "fr")) throw new ArgumentException("Only English and French are supported.", nameof(targetLocale));
        if (!IsConfigured) throw new InvalidOperationException("Azure Translator is not configured on the server.");
        if (string.IsNullOrWhiteSpace(text)) return text;

        // Article bodies are sanitized HTML. Translate text nodes only and retain the server-sanitized tags/attributes.
        if (text.Contains('<') && Regex.IsMatch(text, "<[^>]+>"))
        {
            var builder = new StringBuilder(text.Length);
            var matches = Regex.Matches(text, "<[^>]+>|[^<]+", RegexOptions.CultureInvariant);
            var segments = new List<(bool IsTag, string Value)>();
            foreach (Match match in matches)
                segments.Add(match.Value.StartsWith('<') ? (true, match.Value) : (false, WebUtility.HtmlDecode(match.Value)));
            var textSegments = segments.Where(x => !x.IsTag).SelectMany(x => Split(x.Value, ChunkCharacters)).ToArray();
            var translated = await TranslateManyAsync(textSegments, targetLocale, cancellationToken);
            var index = 0;
            foreach (var segment in segments)
            {
                if (segment.IsTag) builder.Append(segment.Value);
                else
                {
                    var chunkCount = Split(segment.Value, ChunkCharacters).Count;
                    builder.Append(WebUtility.HtmlEncode(string.Concat(translated.Skip(index).Take(chunkCount))));
                    index += chunkCount;
                }
            }
            return builder.ToString();
        }
        return string.Concat(await TranslateManyAsync(Split(text, ChunkCharacters), targetLocale, cancellationToken));
    }

    private async Task<IReadOnlyList<string>> TranslateManyAsync(IReadOnlyList<string> segments, string locale, CancellationToken ct)
    {
        var output = new string[segments.Count];
        var start = 0;
        while (start < segments.Count)
        {
            var batch = new List<string>(); var chars = 0;
            while (start + batch.Count < segments.Count && batch.Count < MaxBatchItems)
            {
                var next = segments[start + batch.Count];
                if (batch.Count > 0 && chars + next.Length > MaxBatchCharacters) break;
                batch.Add(next); chars += next.Length;
            }
            using var request = new HttpRequestMessage(HttpMethod.Post, $"{Endpoint}/translate?api-version=3.0&to={locale}&textType=plain")
            { Content = JsonContent.Create(batch.Select(value => new TranslationInput(value))) };
            request.Headers.TryAddWithoutValidation("Ocp-Apim-Subscription-Key", Key);
            if (!string.IsNullOrWhiteSpace(Region)) request.Headers.TryAddWithoutValidation("Ocp-Apim-Subscription-Region", Region);
            using var response = await httpClient.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode) throw new HttpRequestException($"Azure Translator returned HTTP {(int)response.StatusCode}.", null, response.StatusCode);
            var result = await response.Content.ReadFromJsonAsync<TranslationOutput[]>(cancellationToken: ct)
                ?? throw new InvalidOperationException("Azure Translator returned an empty response.");
            if (result.Length != batch.Count || result.Any(x => x.Translations.Length == 0)) throw new InvalidOperationException("Azure Translator returned an incomplete response.");
            for (var i = 0; i < result.Length; i++) output[start + i] = result[i].Translations[0].Text;
            start += batch.Count;
        }
        return output;
    }

    private static IReadOnlyList<string> Split(string text, int maxLength)
    {
        if (text.Length <= maxLength) return new[] { text };
        var chunks = new List<string>();
        while (text.Length > maxLength)
        {
            var splitAt = text.LastIndexOf(' ', maxLength, maxLength);
            if (splitAt <= maxLength / 2) splitAt = maxLength;
            chunks.Add(text[..splitAt]);
            text = text[splitAt..];
        }
        if (text.Length > 0) chunks.Add(text);
        return chunks;
    }

    private sealed record TranslationInput([property: JsonPropertyName("Text")] string Text);
    private sealed record TranslationOutput([property: JsonPropertyName("translations")] TranslationItem[] Translations);
    private sealed record TranslationItem([property: JsonPropertyName("text")] string Text);
}
