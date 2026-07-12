using System.Text.Json;
using System.Text.RegularExpressions;
using Acutis.Api.Contracts;

namespace Acutis.Api.Services.Screening;

public interface IFormValidationService
{
    List<ValidationErrorDto> ValidateBasic(JsonSchemaDto schema, Dictionary<string, JsonElement> answers);
    List<ValidationErrorDto> ValidateStrict(JsonSchemaDto schema, Dictionary<string, JsonElement> answers);
}

public sealed class FormValidationService : IFormValidationService
{
    public List<ValidationErrorDto> ValidateBasic(JsonSchemaDto schema, Dictionary<string, JsonElement> answers)
    {
        var errors = new List<ValidationErrorDto>();
        foreach (var property in schema.Properties)
        {
            if (!answers.TryGetValue(property.Key, out var value) || value.ValueKind == JsonValueKind.Null)
            {
                continue;
            }

            ValidateType(property.Key, property.Value, value, errors);
        }

        return errors;
    }

    public List<ValidationErrorDto> ValidateStrict(JsonSchemaDto schema, Dictionary<string, JsonElement> answers)
    {
        var errors = new List<ValidationErrorDto>();

        foreach (var requiredField in schema.Required)
        {
            if (!answers.TryGetValue(requiredField, out var value) || value.ValueKind == JsonValueKind.Null || value.ValueKind == JsonValueKind.Undefined)
            {
                errors.Add(new ValidationErrorDto
                {
                    FieldKey = requiredField,
                    Message = "Field is required."
                });
            }
        }

        foreach (var property in schema.Properties)
        {
            if (!answers.TryGetValue(property.Key, out var value) || value.ValueKind == JsonValueKind.Null)
            {
                continue;
            }

            ValidateType(property.Key, property.Value, value, errors);
            ValidateConstraints(property.Key, property.Value, value, errors);
        }

        return errors;
    }

    private static void ValidateType(
        string fieldKey,
        JsonSchemaPropertyDto schemaProperty,
        JsonElement value,
        List<ValidationErrorDto> errors)
    {
        bool valid = schemaProperty.Type switch
        {
            "string" or "text" or "date" or "datetime" or "enum" => value.ValueKind == JsonValueKind.String,
            "integer" => value.ValueKind == JsonValueKind.Number && value.TryGetInt64(out _),
            "number" => value.ValueKind == JsonValueKind.Number,
            "boolean" => value.ValueKind is JsonValueKind.True or JsonValueKind.False,
            "multiEnum" => value.ValueKind == JsonValueKind.Array,
            _ => true
        };

        if (!valid)
        {
            errors.Add(new ValidationErrorDto
            {
                FieldKey = fieldKey,
                Message = $"Invalid type. Expected {schemaProperty.Type}."
            });
        }
    }

    private static void ValidateConstraints(
        string fieldKey,
        JsonSchemaPropertyDto schemaProperty,
        JsonElement value,
        List<ValidationErrorDto> errors)
    {
        if ((schemaProperty.Type is "string" or "text" or "enum" or "date" or "datetime") && value.ValueKind == JsonValueKind.String)
        {
            var textValue = value.GetString() ?? string.Empty;

            if (schemaProperty.MinLength.HasValue && textValue.Length < schemaProperty.MinLength.Value)
            {
                errors.Add(new ValidationErrorDto
                {
                    FieldKey = fieldKey,
                    Message = $"Must be at least {schemaProperty.MinLength.Value} characters."
                });
            }

            if (schemaProperty.MaxLength.HasValue && textValue.Length > schemaProperty.MaxLength.Value)
            {
                errors.Add(new ValidationErrorDto
                {
                    FieldKey = fieldKey,
                    Message = $"Must be at most {schemaProperty.MaxLength.Value} characters."
                });
            }

            if (!string.IsNullOrWhiteSpace(schemaProperty.Pattern) && !Regex.IsMatch(textValue, schemaProperty.Pattern))
            {
                errors.Add(new ValidationErrorDto
                {
                    FieldKey = fieldKey,
                    Message = "Value does not match the required format."
                });
            }
        }

        if ((schemaProperty.Type is "integer" or "number") && value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var numberValue))
        {
            if (schemaProperty.Minimum.HasValue && numberValue < schemaProperty.Minimum.Value)
            {
                errors.Add(new ValidationErrorDto
                {
                    FieldKey = fieldKey,
                    Message = $"Must be at least {schemaProperty.Minimum.Value}."
                });
            }

            if (schemaProperty.Maximum.HasValue && numberValue > schemaProperty.Maximum.Value)
            {
                errors.Add(new ValidationErrorDto
                {
                    FieldKey = fieldKey,
                    Message = $"Must be at most {schemaProperty.Maximum.Value}."
                });
            }
        }
    }
}
