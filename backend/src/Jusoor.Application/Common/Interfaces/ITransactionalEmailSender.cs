namespace Jusoor.Application.Common.Interfaces;

public interface ITransactionalEmailSender
{
    bool IsConfigured { get; }
    Task<bool> SendLoginCodeAsync(string recipient, string code, CancellationToken cancellationToken);
}
