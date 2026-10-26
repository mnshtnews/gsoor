namespace Jusoor.Infrastructure.Security;

/// <summary>
/// What actually gets stored (base64-of-JSON) in every encrypted Case column.
/// One of these per encrypted field, per row — not one per row shared across
/// fields; see the provider service's comment on why a
/// field-scoped (not row-scoped) data-encryption key was chosen given EF
/// Core value converters' single-property scope.
/// </summary>
internal sealed class EncryptionEnvelope
{
    public int Version { get; set; } = 1;

    /// <summary>The provider key identifier INCLUDING its version
    /// (Azure key URI or "jusoor-vps-keyring:<key-id>"),
    /// decryption must target the exact version the
    /// data-encryption key was wrapped with, which may no longer be Key
    /// Vault's "current" version by the time this row is read back.</summary>
    public required string KeyId { get; set; }

    /// <summary>Base64: the per-field AES-256 data-encryption key, wrapped
    /// by the configured provider key identified by <see cref="KeyId"/>.
    /// Never stored anywhere in unwrapped form.</summary>
    public required string WrappedDek { get; set; }

    /// <summary>Base64, 12 bytes — the AES-GCM nonce for this field's
    /// ciphertext. Freshly random per encryption; never reused.</summary>
    public required string Nonce { get; set; }

    /// <summary>Base64, 16 bytes — the AES-GCM authentication tag.</summary>
    public required string Tag { get; set; }

    /// <summary>Base64 — the AES-256-GCM ciphertext of the plaintext field
    /// value (UTF-8 encoded before encryption).</summary>
    public required string Ciphertext { get; set; }
}
