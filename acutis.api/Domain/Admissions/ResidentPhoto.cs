namespace Acutis.Domain.Admissions;

public class ResidentPhoto
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid ResidentId { get; private set; }
    public Resident Resident { get; private set; } = null!;

    public string Url { get; private set; } = string.Empty;
    public DateTime TakenAt { get; private set; } = DateTime.UtcNow;
    public string TakenBy { get; private set; } = string.Empty;
    public bool IsPrimary { get; private set; }

    private ResidentPhoto() { }
    public ResidentPhoto(Guid residentId, string url, string takenBy, bool isPrimary = true)
    {
        ResidentId = residentId;
        Url = url;
        TakenBy = takenBy;
        IsPrimary = isPrimary;
    }
}
