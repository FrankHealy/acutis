using Acutis.Domain.Lookups;

namespace Acutis.Domain.Admissions;

public class ResidentDocument
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid ResidentId { get; private set; }
    public Resident Resident { get; private set; } = null!;

    public Guid DocumentTypeId { get; private set; }
    public DocumentType DocumentType { get; private set; } = null!;

    public string Url { get; private set; } = string.Empty;
    public DateTime UploadedAt { get; private set; } = DateTime.UtcNow;
    public string UploadedBy { get; private set; } = string.Empty;
    public bool SignatureCaptured { get; private set; }

    private ResidentDocument() { }
    public ResidentDocument(Guid residentId, Guid documentTypeId, string url, string uploadedBy, bool signatureCaptured = false)
    {
        ResidentId = residentId;
        DocumentTypeId = documentTypeId;
        Url = url;
        UploadedBy = uploadedBy;
        SignatureCaptured = signatureCaptured;
    }
}
