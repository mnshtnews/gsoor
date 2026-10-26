using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace Jusoor.Infrastructure.Security;

/// <summary>
/// Loads the offline key ring mounted into the API container as a read-only
/// Docker secret. Keep previous key versions in the ring until every value
/// encrypted with them has been retired. The key ring is not application data
/// and must be backed up separately from PostgreSQL.
/// </summary>
internal sealed class FieldEncryptionKeyRing
{
    private const int KeySizeBytes = 32;
    private const int MaxKeyCount = 32;
    private static readonly Regex KeyIdPattern = new("^[A-Za-z0-9._-]{1,64}$", RegexOptions.Compiled | RegexOptions.CultureInvariant);

    private readonly IReadOnlyDictionary<string, byte[]> _keys;

    private FieldEncryptionKeyRing(
        string currentKeyId,
        string? legacyDirectKeyId,
        IReadOnlyDictionary<string, byte[]> keys)
    {
        CurrentKeyId = currentKeyId;
        LegacyDirectKeyId = legacyDirectKeyId;
        _keys = keys;
    }

    public string CurrentKeyId { get; }

    /// <summary>The old local AES-GCM format did not include a key id. This
    /// explicit id lets us continue decrypting those values after migration.</summary>
    public string? LegacyDirectKeyId { get; }

    public byte[] CurrentKey => GetKey(CurrentKeyId);

    public byte[] GetKey(string keyId) => _keys.TryGetValue(keyId, out var key)
        ? key
        : throw new InvalidOperationException(
            $"Field-encryption key version '{keyId}' is missing from the mounted key ring. " +
            "Restore the matching version before reading encrypted records.");

    public static FieldEncryptionKeyRing Load(IConfiguration configuration)
    {
        var path = configuration["FieldEncryption:KeyRingFile"];
        if (string.IsNullOrWhiteSpace(path))
        {
            throw new InvalidOperationException(
                "FieldEncryption:KeyRingFile is missing. Mount the VPS field-encryption key ring as a Docker secret.");
        }

        if (!File.Exists(path))
        {
            throw new InvalidOperationException(
                $"The field-encryption key-ring file '{path}' is not mounted or is unreadable.");
        }

        try
        {
            var fileInfo = new FileInfo(path);
            if (fileInfo.Length is <= 0 or > 32 * 1024)
                throw new InvalidOperationException("The field-encryption key ring has an invalid size.");

            var json = File.ReadAllText(path);
            var document = JsonSerializer.Deserialize<KeyRingDocument>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (document is null || !IsValidKeyId(document.CurrentKeyId) || document.Keys is null ||
                document.Keys.Count is < 1 or > MaxKeyCount)
            {
                throw new InvalidOperationException("The field-encryption key ring is incomplete or invalid.");
            }

            var currentKeyId = document.CurrentKeyId!;

            if (document.LegacyDirectKeyId is not null && !IsValidKeyId(document.LegacyDirectKeyId))
                throw new InvalidOperationException("The legacy field-encryption key id is invalid.");

            var keys = new Dictionary<string, byte[]>(StringComparer.Ordinal);
            foreach (var (keyId, encodedKey) in document.Keys)
            {
                if (!IsValidKeyId(keyId) || string.IsNullOrWhiteSpace(encodedKey))
                    throw new InvalidOperationException("The field-encryption key ring contains an invalid entry.");

                byte[] key;
                try
                {
                    key = Convert.FromBase64String(encodedKey);
                }
                catch (FormatException ex)
                {
                    throw new InvalidOperationException(
                        $"Field-encryption key version '{keyId}' is not valid Base64.", ex);
                }

                if (key.Length != KeySizeBytes)
                    throw new InvalidOperationException(
                        $"Field-encryption key version '{keyId}' must decode to exactly 32 bytes.");

                if (!keys.TryAdd(keyId, key))
                    throw new InvalidOperationException("The field-encryption key ring contains duplicate key ids.");
            }

            if (!keys.ContainsKey(currentKeyId))
                throw new InvalidOperationException("The current field-encryption key id is not present in the key ring.");

            if (document.LegacyDirectKeyId is not null && !keys.ContainsKey(document.LegacyDirectKeyId))
                throw new InvalidOperationException("The legacy direct-encryption key id is not present in the key ring.");

            return new FieldEncryptionKeyRing(currentKeyId, document.LegacyDirectKeyId, keys);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException("The field-encryption key-ring file is not valid JSON.", ex);
        }
        catch (IOException ex)
        {
            throw new InvalidOperationException("The field-encryption key-ring file cannot be read.", ex);
        }
        catch (UnauthorizedAccessException ex)
        {
            throw new InvalidOperationException("The API process does not have read access to the field-encryption key ring.", ex);
        }
    }

    private static bool IsValidKeyId(string? keyId) =>
        !string.IsNullOrWhiteSpace(keyId) && KeyIdPattern.IsMatch(keyId);

    private sealed class KeyRingDocument
    {
        [JsonPropertyName("currentKeyId")]
        public string? CurrentKeyId { get; set; }

        [JsonPropertyName("legacyDirectKeyId")]
        public string? LegacyDirectKeyId { get; set; }

        [JsonPropertyName("keys")]
        public Dictionary<string, string>? Keys { get; set; }
    }
}
