using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Acutis.Domain.Enums;

public enum AdmissionPhase
{
    PreAdmission = 0,
    PhoneEvaluation = 1,
    AcceptedPendingArrival = 2,
    Intake = 3,
    InitialAssessment = 4,
    MedicalReview = 5,
    Programme = 6,
    Completed = 7
}

