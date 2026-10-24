namespace Jusoor.Application.Common.Interfaces;

public interface IEditorialTextTranslator
{
    bool IsConfigured { get; }
    Task<string> TranslateAsync(string text, string targetLocale, CancellationToken cancellationToken);
}
