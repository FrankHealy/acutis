namespace Acutis.Forms.Schema;

public enum FormFieldType { Text, LongText, Integer, Decimal, Boolean, Date, DateTime, SingleChoice, MultipleChoice, Signature, RepeatingGroup }
public sealed record LocalizedText(string Key, string DefaultText);
public sealed record FormOption(string Value, LocalizedText Label);
public sealed record FormField(string Key, FormFieldType Type, LocalizedText Label, LocalizedText? Instructions, bool Required, IReadOnlyCollection<FormOption> Options, string? VisibilityExpression, string? ScoreExpression, IReadOnlyCollection<FormField> Children);
public sealed record FormSection(string Key, LocalizedText Title, bool Repeatable, IReadOnlyCollection<FormField> Fields);
public sealed record CanonicalFormSchema(string Code, int Version, LocalizedText Title, IReadOnlyCollection<FormSection> Sections);
