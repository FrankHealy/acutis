using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace Acutis.Infrastructure.Auditing;

public static class AuditJsonSanitizer
{
    private const string RedactedValue = "[REDACTED]";
    private static readonly Regex EmailPattern = new(@"[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex PpsPattern = new(@"\b\d{7}[A-Z]{1,2}\b", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex PhonePattern = new(@"(?<!\w)(?:\+?\d[\d\-\s()]{6,}\d)(?!\w)", RegexOptions.Compiled);
    private static readonly string[] SensitiveFieldMarkers =
    [
        "pps",
        "personal_public_service",
        "personalpublicservice",
        "first_name",
        "firstname",
        "given_name",
        "forename",
        "surname",
        "last_name",
        "lastname",
        "family_name",
        "phone",
        "mobile",
        "email",
        "date_of_birth",
        "dateofbirth",
        "birth_date",
        "birthdate",
        "dob",
        "address",
        "addressline",
        "eircode",
        "postcode",
        "postal_code",
        "next_of_kin",
        "emergency_contact",
        "medical_card_number",
        "signature",
        "photo",
        "image",
        "dataurl",
        "caller"
    ];
    private static readonly string[] FreeTextFieldMarkers =
    [
        "notes",
        "free_text",
        "freetext",
        "comment",
        "payload",
        "details",
        "summary",
        "reason",
        "description",
        "content",
        "body",
        "message"
    ];
    private static readonly string[] SafeIdentifierFieldMarkers =
    [
        "referral_reference",
        "referralreference",
        "case_reference",
        "casereference",
        "reference_code",
        "referencecode"
    ];

    public static string? Serialize(object? value, JsonSerializerOptions options)
    {
        if (value is null)
        {
            return null;
        }

        var element = JsonSerializer.SerializeToElement(value, options);
        var sanitized = SanitizeJsonElement(element, currentKey: null);
        return JsonSerializer.Serialize(sanitized, options);
    }

    public static object? SanitizeJsonElement(JsonElement element, string? currentKey)
    {
        if (IsSensitiveKey(currentKey))
        {
            return RedactedValue;
        }

        return element.ValueKind switch
        {
            JsonValueKind.Object => SanitizeObject(element),
            JsonValueKind.Array => element.EnumerateArray().Select(item => SanitizeJsonElement(item, currentKey)).ToList(),
            JsonValueKind.String => SanitizeStringValue(element.GetString(), currentKey),
            JsonValueKind.Number => element.TryGetInt64(out var longValue)
                ? longValue
                : element.TryGetDecimal(out var decimalValue)
                    ? decimalValue
                    : element.GetDouble(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Null => null,
            _ => element.ToString()
        };
    }

    private static Dictionary<string, object?> SanitizeObject(JsonElement element)
    {
        var result = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
        foreach (var property in element.EnumerateObject())
        {
            result[property.Name] = SanitizeJsonElement(property.Value, property.Name);
        }

        return result;
    }

    private static bool IsSensitiveKey(string? key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return false;
        }

        var normalized = Regex.Replace(key, "[^A-Za-z0-9]+", "_").Trim('_').ToLowerInvariant();
        return SensitiveFieldMarkers.Any(marker => normalized.Contains(marker, StringComparison.OrdinalIgnoreCase));
    }

    private static string? SanitizeStringValue(string? value, string? currentKey)
    {
        if (value is null)
        {
            return null;
        }

        if (IsSafeIdentifierKey(currentKey))
        {
            return value;
        }

        if (IsFreeTextKey(currentKey) && !string.IsNullOrWhiteSpace(value))
        {
            return RedactedValue;
        }

        if (LooksLikeSensitiveContent(value))
        {
            return RedactedValue;
        }

        return value;
    }

    private static bool IsFreeTextKey(string? key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return false;
        }

        var normalized = Regex.Replace(key, "[^A-Za-z0-9]+", "_").Trim('_').ToLowerInvariant();
        return FreeTextFieldMarkers.Any(marker => normalized.Contains(marker, StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsSafeIdentifierKey(string? key)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return false;
        }

        var normalized = Regex.Replace(key, "[^A-Za-z0-9]+", "_").Trim('_').ToLowerInvariant();
        return SafeIdentifierFieldMarkers.Any(marker => normalized.Contains(marker, StringComparison.OrdinalIgnoreCase));
    }

    private static bool LooksLikeSensitiveContent(string value)
    {
        return EmailPattern.IsMatch(value) ||
               PpsPattern.IsMatch(value) ||
               PhonePattern.IsMatch(value) ||
               value.Contains("data:image/", StringComparison.OrdinalIgnoreCase);
    }
}
