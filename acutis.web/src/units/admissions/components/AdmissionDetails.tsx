import React, { useState } from 'react';
import { ArrowLeft, Download, Edit, History, Printer, User, Phone, Home, Image, Heart, Pill, Users, Scale, Bed, CheckCircle, Calendar, Clock } from 'lucide-react';

interface AdmissionData {
  id: string;
  version: number;
  status: 'complete' | 'incomplete' | 'needs-review';
  
  // Personal Identity
  firstName: string;
  middleName?: string;
  surname: string;
  alias?: string;
  sex: string;
  dateOfBirth: string;
  ppsNumber: string;
  isPreviousResident: boolean;

  // Contact
  phoneNumber?: string;
  email?: string;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  county?: string;
  postcode?: string;
  country: string;

  // Photo & Documents
  hasPhoto: boolean;
  photoUrl?: string;
  photoDeclinedReason?: string;
  documents: string[];

  // Medical & Insurance
  hasMedicalCard: boolean;
  medicalCardNumber?: string;
  hasPrivateInsurance: boolean;
  insuranceProvider?: string;
  policyNumber?: string;
  hasMobilityIssues: boolean;

  // Addiction & Treatment
  primaryAddiction: string;
  secondaryAddictions: string[];
  preferredStepDown?: string;

  // Next of Kin
  nokFirstName?: string;
  nokSurname?: string;
  nokPhone?: string;

  // Religious & Legal
  religiousAffiliation?: string;
  hasProbationRequirement: boolean;
  probationRequirement?: string;

  // Prescriptions
  prescriptions: Prescription[];

  // Room & Finance
  roomNumber?: string;
  depositAmount?: number;
  assignedDoctor?: string;
  assignedNurse?: string;

  // Metadata
  admissionDate: string;
  completedDate: string;
  completedBy: string;
  unit: string;
}

interface Prescription {
  medicationName: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  notes?: string;
}

const AdmissionDetails = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with API call
  const admission: AdmissionData = {
    id: '1',
    version: 3,
    status: 'complete',
    firstName: 'Michael',
    middleName: 'James',
    surname: 'O\'Brien',
    alias: 'Mick',
    sex: 'Male',
    dateOfBirth: '1985-03-15',
    ppsNumber: '1234567T',
    isPreviousResident: false,
    phoneNumber: '087 123 4567',
    email: 'michael.obrien@email.ie',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'Dublin',
    county: 'Dublin',
    postcode: 'D02 XY12',
    country: 'Ireland',
    hasPhoto: true,
    photoUrl: undefined,
    photoDeclinedReason: undefined,
    documents: ['ID Card', 'Insurance Card'],
    hasMedicalCard: false,
    hasPrivateInsurance: true,
    insuranceProvider: 'Laya Healthcare',
    policyNumber: 'LAYA-789012',
    hasMobilityIssues: false,
    primaryAddiction: 'Alcohol',
    secondaryAddictions: ['Gambling'],
    preferredStepDown: 'Dublin',
    nokFirstName: 'Mary',
    nokSurname: 'O\'Brien',
    nokPhone: '087 987 6543',
    religiousAffiliation: 'Catholic',
    hasProbationRequirement: false,
    prescriptions: [
      {
        medicationName: 'Chlordiazepoxide (Librium)',
        dosage: '15mg',
        frequency: 'TID (3x daily)',
        prescribedBy: 'Dr. Murphy',
        notes: 'For alcohol withdrawal management'
      },
      {
        medicationName: 'Thiamine',
        dosage: '100mg',
        frequency: 'Daily',
        prescribedBy: 'Dr. Murphy'
      }
    ],
    roomNumber: 'A-205',
    depositAmount: 500,
    assignedDoctor: 'Dr. Murphy',
    assignedNurse: 'Nurse Kelly',
    admissionDate: '2026-01-15',
    completedDate: '2026-01-15 09:30',
    completedBy: 'Sarah Murphy',
    unit: 'Alcohol'
  };

  const getStatusConfig = () => {
    switch (admission.status) {
      case 'complete':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: 'Complete'
        };
      case 'needs-review':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          label: 'Needs Review'
        };
      case 'incomplete':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          label: 'Incomplete'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const InfoRow = ({ label, value }: { label: string; value: string | number | boolean | undefined }) => {
    if (value === undefined || value === null || value === '') return null;
    
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
    
    return (
      <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
        <dt className="text-sm font-semibold text-gray-600">{label}</dt>
        <dd className="col-span-2 text-sm text-gray-900 font-medium">{displayValue}</dd>
      </div>
    );
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <dl className="space-y-0">{children}</dl>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button className="p-3 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admission Details</h1>
            <p className="text-gray-500">{admission.firstName} {admission.surname} - {admission.unit} Unit</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
            <History className="h-5 w-5" />
            <span>View History</span>
          </button>
          <button className="flex items-center space-x-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
            <Printer className="h-5 w-5" />
            <span>Print</span>
          </button>
          <button className="flex items-center space-x-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-semibold">
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-semibold">
            <Edit className="h-5 w-5" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Status & Meta Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Status */}
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">Status</p>
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl border-2 ${statusConfig.bg} ${statusConfig.border}`}>
              <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
              <span className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>
          </div>

          {/* Admission Date */}
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">Admission Date</p>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="font-semibold text-gray-900">
                {new Date(admission.admissionDate).toLocaleDateString('en-IE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Completed By */}
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">Completed By</p>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="font-semibold text-gray-900">{admission.completedBy}</span>
            </div>
          </div>

          {/* Form Version */}
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">Form Version</p>
            <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold">
              Version {admission.version}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Personal Identity */}
        <Section title="Personal Identity" icon={User}>
          <InfoRow label="First Name" value={admission.firstName} />
          <InfoRow label="Middle Name" value={admission.middleName} />
          <InfoRow label="Surname" value={admission.surname} />
          <InfoRow label="Alias / Known As" value={admission.alias} />
          <InfoRow label="Sex" value={admission.sex} />
          <InfoRow label="Date of Birth" value={
            new Date(admission.dateOfBirth).toLocaleDateString('en-IE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          } />
          <InfoRow label="Age" value={
            Math.floor((new Date().getTime() - new Date(admission.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          } />
          <InfoRow label="PPS Number" value={admission.ppsNumber} />
          <InfoRow label="Previous Resident" value={admission.isPreviousResident} />
        </Section>

        {/* Contact Information */}
        <Section title="Contact Information" icon={Phone}>
          <InfoRow label="Phone Number" value={admission.phoneNumber} />
          <InfoRow label="Email Address" value={admission.email} />
        </Section>

        {/* Address */}
        <Section title="Address" icon={Home}>
          <InfoRow label="Address Line 1" value={admission.addressLine1} />
          <InfoRow label="Address Line 2" value={admission.addressLine2} />
          <InfoRow label="City" value={admission.city} />
          <InfoRow label="County" value={admission.county} />
          <InfoRow label="Postcode" value={admission.postcode} />
          <InfoRow label="Country" value={admission.country} />
        </Section>

        {/* Photo & Documents */}
        <Section title="Photo & Documents" icon={Image}>
          <InfoRow label="Photo Captured" value={admission.hasPhoto} />
          {admission.photoDeclinedReason && (
            <InfoRow label="Photo Declined Reason" value={admission.photoDeclinedReason} />
          )}
          {admission.documents.length > 0 && (
            <div className="py-3">
              <dt className="text-sm font-semibold text-gray-600 mb-2">Documents</dt>
              <dd className="flex flex-wrap gap-2">
                {admission.documents.map((doc, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    {doc}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </Section>

        {/* Medical & Insurance */}
        <Section title="Medical & Insurance" icon={Heart}>
          <InfoRow label="Has Medical Card" value={admission.hasMedicalCard} />
          <InfoRow label="Medical Card Number" value={admission.medicalCardNumber} />
          <InfoRow label="Has Private Insurance" value={admission.hasPrivateInsurance} />
          <InfoRow label="Insurance Provider" value={admission.insuranceProvider} />
          <InfoRow label="Policy Number" value={admission.policyNumber} />
          <InfoRow label="Has Mobility Issues" value={admission.hasMobilityIssues} />
        </Section>

        {/* Addiction & Treatment */}
        <Section title="Addiction & Treatment" icon={Pill}>
          <InfoRow label="Primary Addiction" value={admission.primaryAddiction} />
          {admission.secondaryAddictions.length > 0 && (
            <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
              <dt className="text-sm font-semibold text-gray-600">Secondary Addictions</dt>
              <dd className="col-span-2 flex flex-wrap gap-2">
                {admission.secondaryAddictions.map((addiction, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                    {addiction}
                  </span>
                ))}
              </dd>
            </div>
          )}
          <InfoRow label="Preferred Step-Down House" value={admission.preferredStepDown} />
        </Section>

        {/* Next of Kin */}
        <Section title="Next of Kin" icon={Users}>
          <InfoRow label="First Name" value={admission.nokFirstName} />
          <InfoRow label="Surname" value={admission.nokSurname} />
          <InfoRow label="Phone Number" value={admission.nokPhone} />
        </Section>

        {/* Religious & Legal */}
        <Section title="Religious & Legal" icon={Scale}>
          <InfoRow label="Religious Affiliation" value={admission.religiousAffiliation} />
          <InfoRow label="Has Probation Requirement" value={admission.hasProbationRequirement} />
          <InfoRow label="Probation Requirement" value={admission.probationRequirement} />
        </Section>

        {/* Medical Prescriptions */}
        {admission.prescriptions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Pill className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Medical Prescriptions</h3>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                  {admission.prescriptions.length} prescriptions
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {admission.prescriptions.map((prescription, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Medication</p>
                      <p className="text-base font-bold text-gray-900">{prescription.medicationName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Dosage</p>
                      <p className="text-base font-medium text-gray-900">{prescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Frequency</p>
                      <p className="text-base font-medium text-gray-900">{prescription.frequency}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Prescribed By</p>
                      <p className="text-base font-medium text-gray-900">{prescription.prescribedBy}</p>
                    </div>
                    {prescription.notes && (
                      <div className="col-span-2">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Room & Finance */}
        <Section title="Room & Finance" icon={Bed}>
          <InfoRow label="Room Number" value={admission.roomNumber} />
          <InfoRow label="Deposit Amount" value={admission.depositAmount ? `€${admission.depositAmount}` : undefined} />
          <InfoRow label="Assigned Doctor" value={admission.assignedDoctor} />
          <InfoRow label="Assigned Nurse" value={admission.assignedNurse} />
        </Section>
      </div>
    </div>
  );
};

export default AdmissionDetails;
