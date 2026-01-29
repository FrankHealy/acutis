using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Acutis.Domain.Entities;

namespace Acutis.Domain.Entities;
public class Prescription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ResidentId { get; set; }
    public Resident Resident { get; set; } = null!;
    public string MedicationName { get; set; } = string.Empty; // e.g., "Chlordiazepoxide (Librium)"
    public string Dosage { get; set; } = string.Empty;         // "10mg"
    public string Frequency { get; set; } = string.Empty;      // "TID" / "3x daily"
    public string PrescribedBy { get; set; } = string.Empty;   // doctor name or ID
    public DateTime PrescribedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}
