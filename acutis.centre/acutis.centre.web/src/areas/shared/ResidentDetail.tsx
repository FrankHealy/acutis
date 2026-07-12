"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, User, Calendar, MapPin, Heart, Brain, BookOpen, Shield, Clock, CheckCircle, XCircle, LogOut, AlertTriangle, BriefcaseMedical, Plus, Pencil, Trash2, Layers3 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { Resident } from '../../services/mockDataService';
import {
  residentService,
  type DischargeExitType,
  type ResidentPreviousTreatment,
  type UpsertResidentPreviousTreatmentRequest,
} from '../../services/residentService';
import { isAuthorizedClient } from '@/lib/authMode';

// lightweight mock history for demo
const mockMeetingHistory = [
  { date: "2025-10-15", type: "Group Therapy", attended: true, notes: "Good participation, shared openly" },
  { date: "2025-10-14", type: "Individual Session", attended: true, notes: "Discussed family relationships" },
  { date: "2025-10-13", type: "Group Therapy", attended: false, notes: "Sick - excused absence" },
  { date: "2025-10-12", type: "Focus Meeting", attended: true, notes: "Excellent engagement" },
  { date: "2025-10-11", type: "Group Therapy", attended: true, notes: "Supportive to other residents" },
];

type ResidentDetailProps = {
  resident: Resident;
  onBack: () => void;
  onDischarged?: () => void;
  onOpenIncidentCapture?: (resident: Resident) => void;
};

type DischargeModalState = {
  open: boolean;
  exitType: DischargeExitType;
  eventDate: string;
  reason: string;
  saving: boolean;
  error: string | null;
};

type PreviousTreatmentFormState = {
  treatmentId: string | null;
  centreName: string;
  treatmentType: string;
  startYear: string;
  durationValue: string;
  durationUnit: string;
  completedTreatment: string;
  sobrietyAfterwardsValue: string;
  sobrietyAfterwardsUnit: string;
  notes: string;
};

const EXIT_TYPE_OPTIONS: { value: DischargeExitType; label: string; description: string }[] = [
  { value: "Completed", label: "Programme Completed", description: "Resident has completed their programme." },
  { value: "ExtendedStay", label: "Extended Stay", description: "Resident is staying on past their programme end date." },
  { value: "SelfDischarge", label: "Self Discharge", description: "Resident has chosen to leave voluntarily." },
  { value: "ClinicalDischarge", label: "Clinical Discharge", description: "Discharge on clinical or administrative grounds." },
  { value: "Ejected", label: "Ejected", description: "Resident has been removed from the programme." },
];

const EMPTY_PREVIOUS_TREATMENT_FORM: PreviousTreatmentFormState = {
  treatmentId: null,
  centreName: "",
  treatmentType: "",
  startYear: "",
  durationValue: "",
  durationUnit: "",
  completedTreatment: "",
  sobrietyAfterwardsValue: "",
  sobrietyAfterwardsUnit: "",
  notes: "",
};

const ResidentDetailPage: React.FC<ResidentDetailProps> = ({ resident, onBack, onDischarged, onOpenIncidentCapture }) => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [previousTreatments, setPreviousTreatments] = useState<ResidentPreviousTreatment[]>([]);
  const [previousTreatmentsLoading, setPreviousTreatmentsLoading] = useState(false);
  const [previousTreatmentsError, setPreviousTreatmentsError] = useState<string | null>(null);
  const [treatmentEditorOpen, setTreatmentEditorOpen] = useState(false);
  const [treatmentSaving, setTreatmentSaving] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState<PreviousTreatmentFormState>(EMPTY_PREVIOUS_TREATMENT_FORM);
  const fallbackPhoto = resident.fallbackPhoto || `https://i.pravatar.cc/150?img=${((resident.id - 1) % 70) + 1}`;
  const [heroImageSrc, setHeroImageSrc] = useState(resident.photo ?? fallbackPhoto);
  const [discharge, setDischarge] = useState<DischargeModalState>({
    open: false,
    exitType: "Completed",
    eventDate: new Date().toISOString().slice(0, 10),
    reason: "",
    saving: false,
    error: null,
  });

  const getDietaryNeeds = (code: number) => {
    const dietary: Record<number, string> = {
      0: "No restrictions",
      1: "Vegetarian",
      2: "Vegan",
      3: "Halal",
      4: "Kosher",
      5: "Gluten-free"
    };
    return dietary[code] ?? "Not specified";
  };

  const formatEnumLabel = (value: string | null | undefined) =>
    value ? value.replace(/([a-z])([A-Z])/g, "$1 $2") : "Not set";

  const formatCaseStatus = (value: string | null | undefined) =>
    value
      ? value
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "Not set";

  const formatEntryValue = (value: number | null | undefined) =>
    value == null ? "Not set" : String(value);

  const resetTreatmentForm = () => {
    setTreatmentForm(EMPTY_PREVIOUS_TREATMENT_FORM);
    setTreatmentEditorOpen(false);
  };

  const mapTreatmentToFormState = (treatment: ResidentPreviousTreatment): PreviousTreatmentFormState => ({
    treatmentId: treatment.id,
    centreName: treatment.centreName,
    treatmentType: treatment.treatmentType ?? "",
    startYear: treatment.startYear != null ? String(treatment.startYear) : "",
    durationValue: treatment.durationValue != null ? String(treatment.durationValue) : "",
    durationUnit: treatment.durationUnit ?? "",
    completedTreatment:
      treatment.completedTreatment == null
        ? ""
        : treatment.completedTreatment
          ? "true"
          : "false",
    sobrietyAfterwardsValue:
      treatment.sobrietyAfterwardsValue != null ? String(treatment.sobrietyAfterwardsValue) : "",
    sobrietyAfterwardsUnit: treatment.sobrietyAfterwardsUnit ?? "",
    notes: treatment.notes ?? "",
  });

  const buildTreatmentPayload = (): UpsertResidentPreviousTreatmentRequest => ({
    centreName: treatmentForm.centreName.trim(),
    treatmentType: treatmentForm.treatmentType.trim() || null,
    startYear: treatmentForm.startYear.trim() ? Number(treatmentForm.startYear) : null,
    durationValue: treatmentForm.durationValue.trim() ? Number(treatmentForm.durationValue) : null,
    durationUnit: treatmentForm.durationUnit.trim() || null,
    completedTreatment:
      treatmentForm.completedTreatment === ""
        ? null
        : treatmentForm.completedTreatment === "true",
    sobrietyAfterwardsValue:
      treatmentForm.sobrietyAfterwardsValue.trim() ? Number(treatmentForm.sobrietyAfterwardsValue) : null,
    sobrietyAfterwardsUnit: treatmentForm.sobrietyAfterwardsUnit.trim() || null,
    notes: treatmentForm.notes.trim() || null,
  });

  const ScaleIndicator: React.FC<{ label: string; value: number; max?: number; color?: 'blue' | 'yellow' | 'red' | 'green' }> = ({ label, value, max = 5, color = "blue" }) => {
    const percentage = (value / max) * 100;
    const colorClasses = { blue: "bg-blue-500", yellow: "bg-yellow-500", red: "bg-red-500", green: "bg-green-500" };
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value}/{max}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all duration-300 ${colorClasses[color]}`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  };

  const StatusBadge: React.FC<{ condition: boolean; label: string; variant?: 'danger' | 'success' }> = ({ condition, label, variant = 'danger' }) => {
    const trueStyles = variant === 'danger'
      ? { box: 'bg-red-50 border border-red-200', icon: 'text-red-600', text: 'text-red-900' }
      : { box: 'bg-yellow-50 border border-yellow-200', icon: 'text-yellow-600', text: 'text-yellow-900' };
    const falseStyles = { box: 'bg-green-50 border border-green-200', icon: 'text-green-600', text: 'text-green-900' };
    const styles = condition ? trueStyles : falseStyles;
    return (
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${styles.box}`}>
        {condition ? <XCircle className={`h-5 w-5 ${styles.icon}`} /> : <CheckCircle className={`h-5 w-5 ${styles.icon}`} />}
        <span className={`font-medium ${styles.text}`}>{label}</span>
      </div>
    );
  };

  const calculateProgress = () => {
    const totalWeeks = 12;
    const wk = resident.weekNumber ?? 0;
    return Math.max(0, Math.min(100, Math.round((wk / totalWeeks) * 100)));
  };

  useEffect(() => {
    setHeroImageSrc(resident.photo ?? fallbackPhoto);
  }, [resident.photo, fallbackPhoto]);

  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!resident.residentGuid || !isAuthorizedClient(status, accessToken)) {
      setPreviousTreatments([]);
      setPreviousTreatmentsLoading(false);
      return;
    }

    let active = true;

    const loadPreviousTreatments = async () => {
      setPreviousTreatmentsLoading(true);
      setPreviousTreatmentsError(null);
      try {
        const rows = await residentService.getPreviousTreatments(resident.residentGuid!, accessToken!);
        if (!active) {
          return;
        }
        setPreviousTreatments(rows);
      } catch (err) {
        if (!active) {
          return;
        }
        setPreviousTreatmentsError(err instanceof Error ? err.message : "Failed to load previous treatments.");
      } finally {
        if (active) {
          setPreviousTreatmentsLoading(false);
        }
      }
    };

    void loadPreviousTreatments();

    return () => {
      active = false;
    };
  }, [resident.residentGuid, session?.accessToken, status]);

  const handleDischargeSubmit = async () => {
    if (!resident.residentGuid) {
      setDischarge((d) => ({ ...d, error: "Discharge is only available for residents loaded from the live system." }));
      return;
    }

    const accessToken = session?.accessToken;
    if (!isAuthorizedClient(status, accessToken)) {
      setDischarge((d) => ({ ...d, error: "Session expired. Please sign in again." }));
      return;
    }

    setDischarge((d) => ({ ...d, saving: true, error: null }));
    try {
      await residentService.recordDischarge(
        resident.residentGuid,
        discharge.exitType,
        discharge.eventDate,
        discharge.reason.trim() || null,
        accessToken!,
      );
      setDischarge((d) => ({ ...d, open: false, saving: false }));
      onDischarged?.();
      onBack();
    } catch (err) {
      setDischarge((d) => ({
        ...d,
        saving: false,
        error: err instanceof Error ? err.message : "Failed to record discharge.",
      }));
    }
  };

  const handlePreviousTreatmentSubmit = async () => {
    if (!resident.residentGuid) {
      setPreviousTreatmentsError("Previous treatments are only available for residents loaded from the live system.");
      return;
    }

    const accessToken = session?.accessToken;
    if (!isAuthorizedClient(status, accessToken)) {
      setPreviousTreatmentsError("Session expired. Please sign in again.");
      return;
    }

    if (!treatmentForm.centreName.trim()) {
      setPreviousTreatmentsError("Centre name is required.");
      return;
    }

    setTreatmentSaving(true);
    setPreviousTreatmentsError(null);

    try {
      const payload = buildTreatmentPayload();
      const saved = treatmentForm.treatmentId
        ? await residentService.updatePreviousTreatment(resident.residentGuid, treatmentForm.treatmentId, payload, accessToken!)
        : await residentService.createPreviousTreatment(resident.residentGuid, payload, accessToken!);

      setPreviousTreatments((current) => {
        const next = treatmentForm.treatmentId
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current];

        return next.sort((a, b) => {
          const yearA = a.startYear ?? 0;
          const yearB = b.startYear ?? 0;
          return yearB - yearA;
        });
      });
      resetTreatmentForm();
    } catch (err) {
      setPreviousTreatmentsError(err instanceof Error ? err.message : "Failed to save previous treatment.");
    } finally {
      setTreatmentSaving(false);
    }
  };

  const handlePreviousTreatmentDelete = async (treatmentId: string) => {
    if (!resident.residentGuid) {
      return;
    }

    const accessToken = session?.accessToken;
    if (!isAuthorizedClient(status, accessToken)) {
      setPreviousTreatmentsError("Session expired. Please sign in again.");
      return;
    }

    setPreviousTreatmentsError(null);

    try {
      await residentService.deletePreviousTreatment(resident.residentGuid, treatmentId, accessToken!);
      setPreviousTreatments((current) => current.filter((item) => item.id !== treatmentId));
      if (treatmentForm.treatmentId === treatmentId) {
        resetTreatmentForm();
      }
    } catch (err) {
      setPreviousTreatmentsError(err instanceof Error ? err.message : "Failed to delete previous treatment.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Residents</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="absolute inset-0 bg-black opacity-10" />
          </div>
          <div className="relative px-8 pb-8">
            <div className="absolute -top-24 left-8">
              <div className="relative">
                <Image
                  src={heroImageSrc}
                  alt={`${resident.firstName} ${resident.surname}`}
                  className="w-48 h-48 rounded-2xl object-cover border-8 border-white shadow-2xl"
                  onError={() => setHeroImageSrc(fallbackPhoto)}
                  width={192}
                  height={192}
                />
                <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                  Week {resident.weekNumber ?? '-'}
                </div>
              </div>
            </div>

            <div className="pt-28 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{resident.firstName} {resident.surname}</h1>
                <p className="text-lg text-gray-600 mb-4">PSN: {resident.psn}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{resident.age} years old</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{resident.nationality}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Room {resident.roomNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenIncidentCapture?.(resident)}
                    className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-lg font-medium hover:bg-amber-100 transition-colors"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    <span>Log Incident</span>
                  </button>
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <Heart className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{formatEnumLabel(resident.programmeType)}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{formatEnumLabel(resident.participationMode)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDischarge((d) => ({ ...d, open: true, error: null }))}
                    className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Record Discharge</span>
                  </button>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none" className="text-gray-200" />
                    <circle
                      cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - calculateProgress() / 100)}`}
                      className="text-blue-500 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{calculateProgress()}%</span>
                    <span className="text-sm text-gray-600">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {['overview', 'history', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-medium text-sm transition-colors capitalize ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="h-6 w-6 text-red-500 mr-2" />
                Addiction & Program
              </h3>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Primary Addiction</p>
                  <p className="text-xl font-bold text-red-900">{resident.primaryAddiction}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Admission Date</p>
                    <p className="font-bold text-blue-900">{new Date(resident.admissionDate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Expected Completion</p>
                    <p className="font-bold text-green-900">{new Date(resident.expectedCompletion).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Programme Type</p>
                    <p className="font-bold text-indigo-900">{formatEnumLabel(resident.programmeType)}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Participation Mode</p>
                    <p className="font-bold text-amber-900">{formatEnumLabel(resident.participationMode)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resident.isDrug && <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Drug History</span>}
                  {resident.isGambeler && <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Gambling Issues</span>}
                  {resident.isPreviousResident && <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Previous Resident</span>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Layers3 className="h-6 w-6 text-indigo-500 mr-2" />
                Case & Episode Context
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Centre Episode Code</p>
                  <p className="font-bold text-indigo-900">{resident.centreEpisodeCode?.trim() || "Not set"}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Case Status</p>
                  <p className="font-bold text-emerald-900">{formatCaseStatus(resident.caseStatus)}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Entry Year</p>
                  <p className="font-bold text-blue-900">{formatEntryValue(resident.entryYear)}</p>
                </div>
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Entry Week</p>
                  <p className="font-bold text-cyan-900">{formatEntryValue(resident.entryWeek)}</p>
                </div>
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Entry Sequence</p>
                  <p className="font-bold text-violet-900">{formatEntryValue(resident.entrySequence)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Case / Episode IDs</p>
                  <p className="font-semibold text-slate-900 break-all text-sm">{resident.residentCaseId ?? "Case not set"}</p>
                  <p className="mt-1 text-xs text-slate-500 break-all">{resident.episodeId ?? "Episode not set"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="h-6 w-6 text-pink-500 mr-2" />
                Medical & Lifestyle
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Dietary Requirements</p>
                  <p className="font-bold text-gray-900">{getDietaryNeeds(resident.dietaryNeedsCode)}</p>
                </div>
                <StatusBadge condition={resident.isSnorer} label={resident.isSnorer ? "Snorer - Room consideration needed" : "No snoring issues"} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="h-6 w-6 text-blue-500 mr-2" />
                Legal Status
              </h3>
              <div className="space-y-3">
                <StatusBadge condition={resident.hasCriminalHistory} label={resident.hasCriminalHistory ? "Criminal History on Record" : "No Criminal History"} variant="success" />
                <StatusBadge condition={resident.isOnProbation} label={resident.isOnProbation ? "Currently on Probation" : "Not on Probation"} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Brain className="h-6 w-6 text-purple-500 mr-2" />
                Behavioral Indicators
              </h3>
              <div className="space-y-4">
                <ScaleIndicator label="Argumentative Scale" value={resident.argumentativeScale} color={resident.argumentativeScale > 3 ? "red" : resident.argumentativeScale > 1 ? "yellow" : "green"} />
                <ScaleIndicator label="Learning Difficulty" value={resident.learningDifficultyScale} color={resident.learningDifficultyScale > 3 ? "red" : "yellow"} />
                <ScaleIndicator label="Literacy Level" value={resident.literacyScale} color="blue" />
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Scales range from 0 (none/low) to 5 (high). These indicators help staff provide appropriate support and accommodations.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <BriefcaseMedical className="h-6 w-6 text-teal-500 mr-2" />
                    Previous Treatments
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Existing treatment history attached to this resident record.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTreatmentForm(EMPTY_PREVIOUS_TREATMENT_FORM);
                    setTreatmentEditorOpen(true);
                    setPreviousTreatmentsError(null);
                  }}
                  className="inline-flex items-center justify-center space-x-2 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Treatment</span>
                </button>
              </div>

              {!resident.residentGuid && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Previous treatments are only available when connected to the live system.
                </div>
              )}

              {previousTreatmentsError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {previousTreatmentsError}
                </div>
              )}

              {treatmentEditorOpen && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Centre Name
                      <input
                        type="text"
                        value={treatmentForm.centreName}
                        onChange={(e) => setTreatmentForm((current) => ({ ...current, centreName: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Treatment Type
                      <input
                        type="text"
                        value={treatmentForm.treatmentType}
                        onChange={(e) => setTreatmentForm((current) => ({ ...current, treatmentType: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Year
                      <input
                        type="number"
                        value={treatmentForm.startYear}
                        onChange={(e) => setTreatmentForm((current) => ({ ...current, startYear: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration Value
                      <input
                        type="number"
                        value={treatmentForm.durationValue}
                        onChange={(e) => setTreatmentForm((current) => ({ ...current, durationValue: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration Unit
                      <input
                        type="text"
                        value={treatmentForm.durationUnit}
                        onChange={(e) => setTreatmentForm((current) => ({ ...current, durationUnit: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Completed
                      <select
                        value={treatmentForm.completedTreatment}
                        onChange={(e) => setTreatmentForm((current) => ({ ...current, completedTreatment: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="">Not set</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Sobriety Afterward Value
                      <input
                        type="number"
                        value={treatmentForm.sobrietyAfterwardsValue}
                        onChange={(e) => setTreatmentForm((current) => ({ ...current, sobrietyAfterwardsValue: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Sobriety Afterward Unit
                      <input
                        type="text"
                        value={treatmentForm.sobrietyAfterwardsUnit}
                        onChange={(e) => setTreatmentForm((current) => ({ ...current, sobrietyAfterwardsUnit: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                      Notes
                      <textarea
                        rows={3}
                        value={treatmentForm.notes}
                        onChange={(e) => setTreatmentForm((current) => ({ ...current, notes: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetTreatmentForm}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void handlePreviousTreatmentSubmit()}
                      disabled={treatmentSaving}
                      className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                    >
                      {treatmentSaving ? "Saving..." : treatmentForm.treatmentId ? "Update Treatment" : "Save Treatment"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                {previousTreatmentsLoading ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    Loading previous treatments...
                  </div>
                ) : previousTreatments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                    No previous treatments recorded yet.
                  </div>
                ) : (
                  previousTreatments.map((treatment) => (
                    <div key={treatment.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="text-base font-bold text-gray-900">{treatment.centreName}</h4>
                          <p className="mt-1 text-sm text-gray-500">
                            {treatment.treatmentType?.trim() || "Treatment type not set"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTreatmentForm(mapTreatmentToFormState(treatment));
                              setTreatmentEditorOpen(true);
                              setPreviousTreatmentsError(null);
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handlePreviousTreatmentDelete(treatment.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Start Year</p>
                          <p className="font-semibold text-slate-900">{treatment.startYear ?? "Not set"}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Duration</p>
                          <p className="font-semibold text-slate-900">
                            {treatment.durationValue != null
                              ? `${treatment.durationValue} ${treatment.durationUnit ?? ""}`.trim()
                              : "Not set"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Completed</p>
                          <p className="font-semibold text-slate-900">
                            {treatment.completedTreatment == null ? "Not set" : treatment.completedTreatment ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Sobriety Afterward</p>
                          <p className="font-semibold text-slate-900">
                            {treatment.sobrietyAfterwardsValue != null
                              ? `${treatment.sobrietyAfterwardsValue} ${treatment.sobrietyAfterwardsUnit ?? ""}`.trim()
                              : "Not set"}
                          </p>
                        </div>
                      </div>
                      {treatment.notes && (
                        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                          {treatment.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="h-6 w-6 text-blue-500 mr-2" />
                Meeting & Session History
              </h3>
              <div className="space-y-3">
                {mockMeetingHistory.map((meeting, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 transition-all ${meeting.attended ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {meeting.attended ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                          <span className="font-bold text-gray-900">{meeting.type}</span>
                          <span className="text-sm text-gray-500">{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-700 ml-8">{meeting.notes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-6 w-6 text-indigo-500 mr-2" />
              Staff Notes & Observations
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-blue-900">Week 13 Progress Review</p>
                  <span className="text-xs text-blue-600">Oct 15, 2025</span>
                </div>
                <p className="text-sm text-gray-700">Miles continues to show strong engagement in group therapy sessions. Has become more open about sharing personal experiences and provides supportive feedback to other residents.</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-yellow-900">Literacy Support Plan</p>
                  <span className="text-xs text-yellow-600">Oct 10, 2025</span>
                </div>
                <p className="text-sm text-gray-700">Given literacy level 4/5, Miles is receiving additional one-on-one support with workbook materials. Shows good progress and positive attitude toward learning.</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-green-900">Admission Assessment</p>
                  <span className="text-xs text-green-600">Jul 15, 2025</span>
                </div>
                <p className="text-sm text-gray-700">Previous resident returning for additional support. Shows strong motivation for recovery. Cooperative during admission process. Criminal history noted but no current probation requirements.</p>
              </div>
            </div>
            <div className="mt-6">
              <button className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                + Add New Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discharge Modal */}
      {discharge.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Record Discharge</h2>
              <p className="text-sm text-gray-500 mt-1">{resident.firstName} {resident.surname} &middot; PSN: {resident.psn}</p>
            </div>

            <div className="px-6 py-5 space-y-5">
              {!resident.residentGuid && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Discharge recording is only available when connected to the live system. This resident is currently loaded from mock data.
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exit Type</label>
                <div className="space-y-2">
                  {EXIT_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="exitType"
                        value={opt.value}
                        checked={discharge.exitType === opt.value}
                        onChange={() => setDischarge((d) => ({ ...d, exitType: opt.value }))}
                        className="mt-0.5 accent-blue-600"
                      />
                      <span>
                        <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                        <span className="block text-xs text-gray-500">{opt.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Exit</label>
                <input
                  type="date"
                  value={discharge.eventDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDischarge((d) => ({ ...d, eventDate: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reason <span className="font-normal text-gray-400">(optional — avoid clinical detail here)</span>
                </label>
                <textarea
                  rows={2}
                  value={discharge.reason}
                  onChange={(e) => setDischarge((d) => ({ ...d, reason: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {discharge.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {discharge.error}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDischarge((d) => ({ ...d, open: false, error: null }))}
                disabled={discharge.saving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDischargeSubmit()}
                disabled={discharge.saving || !resident.residentGuid}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {discharge.saving ? "Recording..." : "Confirm Discharge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDetailPage;
