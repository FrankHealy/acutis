# Ambulatory data ownership inventory

| Source table | Classification | Migration rule |
|---|---|---|
| AmbulatoryParticipant | Product-owned root | `ProgrammeType=Practitioner` becomes a Practitioner Client; `ProgrammeType=Community` becomes a Community Participant. |
| AmbulatoryAppointment | Product-owned root | Discriminate by `ProgrammeType`; preserve nullable participant/client relationship. |
| AmbulatoryAssessment | Dependent | Follow participant relationship; never classify independently. |
| AmbulatoryCarePlan | Dependent | Follow participant relationship; never classify independently. |
| VideoConsultation | Dependent | Follow appointment relationship. |
| VideoConsultationInvitation | Dependent secret metadata | Follow consultation and appointment relationship; preserve hash only. |

The current ambulatory database has no ambulatory-owned form-definition, form-assignment, form-response, diary, journal, consent, file, document, audit, lookup, or programme tables. New product-owned tables exist independently in the target databases. If such source tables are introduced before production cutover, the inventory and closure script must be updated before it is run.

The Practitioner and Community migration scripts are idempotent, preserve identifiers, print expected counts before copying, verify every classified table, and never delete the source. Source deletion is a separate post-backup release action and is intentionally not automated here.
