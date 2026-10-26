using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Jusoor.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Jusoor.Infrastructure.Security;

/// <summary>
/// Production envelope encryption for a single-VPS deployment without an
/// external KMS. A random AES-256 DEK encrypts each field; a versioned
/// AES-256 key from the root-owned, read-only Docker secret wraps that DEK.
/// This protects database-only backups, but does not protect against a full
/// compromise of the VPS that holds both the API and the key ring.
/// </summary>
public sealed class VpsFieldEncryptionService : IFieldEncryptionService
{
    private const int DekSizeBytes = 32;
    private const int NonceSizeBytes = 12;
    private const int TagSizeBytes = 16;
    private const string KeyIdPrefix = "jusoor-vps-keyring:";

    private readonly FieldEncryptionKeyRing _keyRing;

    public VpsFieldEncryptionService(IConfiguration configuration)
    {
        _keyRing = FieldEncryptionKeyRing.Load(configuration);
    }

    public string Encrypt(string plaintext)
    {
        ArgumentNullException.ThrowIfNull(plaintext);

        var keyId = KeyIdPrefix + _keyRing.CurrentKeyId;
        var masterKey = _keyRing.CurrentKey;
        var dek = RandomNumberGenerator.GetBytes(DekSizeBytes);
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);

        try
        {
            var dataNonce = RandomNumberGenerator.GetBytes(NonceSizeBytes);
            var dataTag = new byte[TagSizeBytes];
            var ciphertext = new byte[plaintextBytes.Length];

            using (var aes = new AesGcm(dek, TagSizeBytes))
                aes.Encrypt(dataNonce, plaintextBytes, ciphertext, dataTag);

            var wrapNonce = RandomNumberGenerator.GetBytes(NonceSizeBytes);
            var wrapTag = new byte[TagSizeBytes];
            var wrappedDek = new byte[DekSizeBytes];
            using (var aes = new AesGcm(masterKey, TagSizeBytes))
                aes.Encrypt(wrapNonce, dek, wrappedDek, wrapTag, Encoding.UTF8.GetBytes(keyId));

            var wrappedDekEnvelope = new byte[NonceSizeBytes + TagSizeBytes + DekSizeBytes];
            Buffer.BlockCopy(wrapNonce, 0, wrappedDekEnvelope, 0, NonceSizeBytes);
            Buffer.BlockCopy(wrapTag, 0, wrappedDekEnvelope, NonceSizeBytes, TagSizeBytes);
            Buffer.BlockCopy(wrappedDek, 0, wrappedDekEnvelope, NonceSizeBytes + TagSizeBytes, DekSizeBytes);

            var envelope = new EncryptionEnvelope
            {
                KeyId = keyId,
                WrappedDek = Convert.ToBase64String(wrappedDekEnvelope),
                Nonce = Convert.ToBase64String(dataNonce),
                Tag = Convert.ToBase64String(dataTag),
                Ciphertext = Convert.ToBase64String(ciphertext)
            };

            return Convert.ToBase64String(JsonSerializer.SerializeToUtf8Bytes(envelope));
        }
        finally
        {
            CryptographicOperations.ZeroMemory(dek);
            CryptographicOperations.ZeroMemory(plaintextBytes);
        }
    }

    public string Decrypt(string ciphertext)
    {
        ArgumentNullException.ThrowIfNull(ciphertext);

        byte[] payload;
        try
        {
            payload = Convert.FromBase64String(ciphertext);
        }
        catch (FormatException ex)
        {
            throw new InvalidOperationException("Encrypted field is not valid Base64.", ex);
        }

        if (payload.Length == 0)
            throw new InvalidOperationException("Encrypted field is empty.");

        // The demo/development provider stores version + nonce + tag + data
        // directly. Keep this reader so existing preview rows remain readable
        // when the same key is transferred into the key ring.
        if (payload[0] != (byte)'{' && payload[0] != (byte)'[')
            return DecryptLegacyDirect(payload);

        EncryptionEnvelope envelope;
        try
        {
            envelope = JsonSerializer.Deserialize<EncryptionEnvelope>(payload)
                ?? throw new InvalidOperationException("Encrypted field envelope is empty.");
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException("Encrypted field envelope is invalid.", ex);
        }

        if (envelope.Version != 1)
            throw new InvalidOperationException($"Unsupported field-encryption envelope version: {envelope.Version}.");

        if (!envelope.KeyId.StartsWith(KeyIdPrefix, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                "This field was encrypted by a different key provider. It must be migrated with its original provider before switching to VPS encryption.");
        }

        var keyId = envelope.KeyId[KeyIdPrefix.Length..];
        var masterKey = _keyRing.GetKey(keyId);
        var wrapped = DecodeBase64(envelope.WrappedDek, "wrapped data key");
        if (wrapped.Length != NonceSizeBytes + TagSizeBytes + DekSizeBytes)
            throw new InvalidOperationException("Wrapped data key has an invalid size.");

        var wrapNonce = wrapped[..NonceSizeBytes];
        var wrapTag = wrapped[NonceSizeBytes..(NonceSizeBytes + TagSizeBytes)];
        var encryptedDek = wrapped[(NonceSizeBytes + TagSizeBytes)..];
        var dek = new byte[DekSizeBytes];

        try
        {
            using (var aes = new AesGcm(masterKey, TagSizeBytes))
                aes.Decrypt(wrapNonce, encryptedDek, wrapTag, dek, Encoding.UTF8.GetBytes(envelope.KeyId));

            var dataNonce = DecodeBase64(envelope.Nonce, "nonce");
            var dataTag = DecodeBase64(envelope.Tag, "authentication tag");
            var encryptedData = DecodeBase64(envelope.Ciphertext, "ciphertext");
            if (dataNonce.Length != NonceSizeBytes || dataTag.Length != TagSizeBytes)
                throw new InvalidOperationException("Encrypted field nonce or authentication tag has an invalid size.");

            var plaintext = new byte[encryptedData.Length];
            using (var aes = new AesGcm(dek, TagSizeBytes))
                aes.Decrypt(dataNonce, encryptedData, dataTag, plaintext);

            try
            {
                return Encoding.UTF8.GetString(plaintext);
            }
            finally
            {
                CryptographicOperations.ZeroMemory(plaintext);
            }
        }
        catch (CryptographicException ex)
        {
            throw new InvalidOperationException(
                "Encrypted field authentication failed. The key ring may be incomplete or the data may be corrupted.", ex);
        }
        finally
        {
            CryptographicOperations.ZeroMemory(dek);
        }
    }

    private string DecryptLegacyDirect(byte[] payload)
    {
        if (payload.Length < 1 + NonceSizeBytes + TagSizeBytes || payload[0] != 1)
            throw new InvalidOperationException("Encrypted field is neither a supported envelope nor a legacy local value.");

        var legacyKeyId = _keyRing.LegacyDirectKeyId
            ?? throw new InvalidOperationException(
                "A legacy local encrypted field was found, but the key ring has no legacyDirectKeyId.");
        var key = _keyRing.GetKey(legacyKeyId);
        var nonce = payload[1..(1 + NonceSizeBytes)];
        var tag = payload[(1 + NonceSizeBytes)..(1 + NonceSizeBytes + TagSizeBytes)];
        var encryptedData = payload[(1 + NonceSizeBytes + TagSizeBytes)..];
        var plaintext = new byte[encryptedData.Length];

        try
        {
            using var aes = new AesGcm(key, TagSizeBytes);
            aes.Decrypt(nonce, encryptedData, tag, plaintext);
            return Encoding.UTF8.GetString(plaintext);
        }
        catch (CryptographicException ex)
        {
            throw new InvalidOperationException(
                "Legacy encrypted field authentication failed. Restore its original key before reading the record.", ex);
        }
        finally
        {
            CryptographicOperations.ZeroMemory(plaintext);
        }
    }

    private static byte[] DecodeBase64(string value, string fieldName)
    {
        try
        {
            return Convert.FromBase64String(value);
        }
        catch (FormatException ex)
        {
            throw new InvalidOperationException($"Encrypted field {fieldName} is not valid Base64.", ex);
        }
    }
}
