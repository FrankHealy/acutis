"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Camera, Pill, Shield, UserRoundCheck, Venus, Wine } from "lucide-react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import DynamicFormRenderer from "@/areas/screening/forms/DynamicFormRenderer";
import {
  getActiveForm,
  save,
  saveProgress,
  type GetActiveFormResponse,
  type JsonValue,
  type SaveProgressResponse,
  type SaveResponse,
} from "@/areas/screening/forms/ApiClient";
import {
  screeningSchedulingService,
  type ScreeningSchedulingAssignment,
} from "@/areas/screening/services/screeningSchedulingService";
import type { UnitId, UnitDefinition } from "@/areas/shared/unit/unitTypes";
import { isAuthorizedClient } from "@/lib/authMode";

interface UnitAdmissionFormProps {
  unitId: UnitId;
  unitName: string;
  unitIconKey: UnitDefinition["iconKey"];
  admissionFormCode: string;
  setCurrentStep: (step: string) => void;
}

const iconByUnit: Record<UnitDefinition["iconKey"], React.ComponentType<{ className?: string }>> = {
  wine: Wine,
  shield: Shield,
  pill: Pill,
  venus: Venus,
};

const PHOTO_ANSWER_KEY = "residentPhotoDataUrl";

const isSameLocalDate = (scheduledDate: string, targetDate: Date): boolean => {
  const normalizedDate = scheduledDate.slice(0, 10);
  const [yearText, monthText, dayText] = normalizedDate.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return false;
  }

  return (
    year === targetDate.getFullYear() &&
    month === targetDate.getMonth() + 1 &&
    day === targetDate.getDate()
  );
};

const UnitAdmissionForm: React.FC<UnitAdmissionFormProps> = ({
  unitId,
  unitName,
  unitIconKey,
  admissionFormCode,
  setCurrentStep,
}) => {
  const { data: session, status } = useSession();
  const { locale, mergeTranslations, loadKeys, t } = useLocalization();
  const [formData, setFormData] = useState<GetActiveFormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [todaysAdmissions, setTodaysAdmissions] = useState<ScreeningSchedulingAssignment[]>([]);
  const [loadingTodaysAdmissions, setLoadingTodaysAdmissions] = useState(false);
  const [todaysAdmissionsError, setTodaysAdmissionsError] = useState<string | null>(null);
  const [selectedAdmissionCaseId, setSelectedAdmissionCaseId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const textRef = useRef<(key: string, fallback: string, values?: Record<string, string | number>) => string>(
    (_key, fallback, values) => {
      if (!values) {
        return fallback;
      }

      return Object.entries(values).reduce(
        (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
        fallback
      );
    }
  );
  const Icon = iconByUnit[unitIconKey];

  useEffect(() => {
    void loadKeys([
      "admission.page.header",
      "admission.generated_form",
      "admission.configure_activate",
      "admission.loading",
      "admission.sign_in_required",
      "admission.session_expired",
      "admission.unable_to_load",
      "admission.no_active_form",
      "admission.back_to_dashboard",
      "admission.photo_capture",
      "admission.no_photo",
      "admission.open_camera",
      "admission.capture",
      "admission.cancel_camera",
      "admission.upload_photo",
      "admission.photo.alt",
      "admission.error.start_camera_preview",
      "admission.error.access_camera",
      "admission.due_today.title",
      "admission.due_today.description",
      "admission.due_today.none",
      "admission.due_today.loading",
      "admission.due_today.name",
      "admission.due_today.phone",
      "admission.due_today.queue",
      "admission.due_today.status",
      "admission.due_today.prefill",
      "admission.due_today.click_to_prefill",
    ]);
  }, [loadKeys]);

  const text = useCallback((key: string, fallback: string, values?: Record<string, string | number>) => {
    const resolved = t(key);
    const template = resolved === key ? fallback : resolved;
    if (!values) {
      return template;
    }

    return Object.entries(values).reduce(
      (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
      template
    );
  }, [t]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!isAuthorizedClient(status, session?.accessToken)) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const accessToken = session?.accessToken;
        if (!accessToken) {
          setError(textRef.current("admission.session_expired", "Session expired."));
          return;
        }
        const response = await getActiveForm(
          accessToken,
          locale,
          "admission",
          selectedAdmissionCaseId,
          admissionFormCode
        );

        if (!active) return;
        setFormData(response);
        mergeTranslations(response.translations);
        setError(null);
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : textRef.current("admission.unable_to_load", "Unable to load admission form.")
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [admissionFormCode, locale, mergeTranslations, selectedAdmissionCaseId, session?.accessToken, status]);

  const loadTodaysAdmissions = useCallback(async () => {
    try {
      if (unitId !== "detox") {
        setTodaysAdmissions([]);
        setTodaysAdmissionsError(null);
        setLoadingTodaysAdmissions(false);
        return;
      }

      if (!isAuthorizedClient(status, session?.accessToken)) {
        setTodaysAdmissions([]);
        setTodaysAdmissionsError(null);
        setLoadingTodaysAdmissions(false);
        return;
      }

      setLoadingTodaysAdmissions(true);
      const board = await screeningSchedulingService.getBoard(unitId, session?.accessToken);
      const now = new Date();
      const todaysAssignments = board.slots
        .filter((slot) => isSameLocalDate(slot.scheduledDate, now))
        .flatMap((slot) => slot.assignments);

      setTodaysAdmissions(todaysAssignments);
      setTodaysAdmissionsError(null);
    } catch (nextError) {
      setTodaysAdmissions([]);
      setTodaysAdmissionsError(
        nextError instanceof Error
          ? nextError.message
          : textRef.current("admission.unable_to_load", "Unable to load admission form.")
      );
    } finally {
      setLoadingTodaysAdmissions(false);
    }
  }, [session?.accessToken, status, unitId]);

  useEffect(() => {
    void loadTodaysAdmissions();
  }, [loadTodaysAdmissions]);

  useEffect(() => {
    if (todaysAdmissions.length === 0) {
      setSelectedAdmissionCaseId(null);
      return;
    }

    const selectedStillPresent = todaysAdmissions.some((assignment) => assignment.caseId === selectedAdmissionCaseId);
    if (!selectedStillPresent) {
      setSelectedAdmissionCaseId(todaysAdmissions[0]?.caseId ?? null);
    }
  }, [selectedAdmissionCaseId, todaysAdmissions]);

  useEffect(() => {
    const savedPhoto = formData?.draftAnswers?.[PHOTO_ANSWER_KEY];
    setPhotoDataUrl(typeof savedPhoto === "string" && savedPhoto.trim().length > 0 ? savedPhoto : null);
  }, [formData]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!cameraOpen || !video || !stream) {
      return;
    }

    video.srcObject = stream;
    void video.play().catch((playError) => {
      setCameraError(
        playError instanceof Error
          ? playError.message
          : textRef.current("admission.error.start_camera_preview", "Unable to start camera preview.")
      );
    });
  }, [cameraOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  const openCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (openError) {
      setCameraError(openError instanceof Error ? openError.message : text("admission.error.access_camera", "Unable to access camera."));
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  };

  const onPhotoFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const mergedInitialAnswers = useMemo(() => {
    if (!formData) return {};
    if (!photoDataUrl) return formData.draftAnswers;
    return { ...formData.draftAnswers, [PHOTO_ANSWER_KEY]: photoDataUrl } as Record<string, JsonValue>;
  }, [formData, photoDataUrl]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        {text("admission.loading", "Loading admission form...")}
      </div>
    );
  }

  if (!isAuthorizedClient(status, session?.accessToken)) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        {text("admission.sign_in_required", "Please sign in to access admissions.")}
      </div>
    );
  }

  const accessToken = session?.accessToken;
  if (!accessToken) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-900">{text("admission.page.header", "{unitName} Admission", { unitName })}</h2>
        <p className="mt-2 text-sm text-amber-800">{text("admission.session_expired", "Session expired.")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-900">{text("admission.page.header", "{unitName} Admission", { unitName })}</h2>
        <p className="mt-2 text-sm text-amber-800">{error}</p>
        <p className="mt-2 text-xs text-amber-700">
          {text("admission.configure_activate", "Configure or activate {formCode} in the forms generator.", { formCode: admissionFormCode })}
        </p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        {text("admission.no_active_form", "No active admission form available.")}
      </div>
    );
  }

  const onSaveProgress = async (payload: {
    submissionId: string | null;
    answers: Record<string, JsonValue>;
  }): Promise<SaveProgressResponse> => {
    const answers = photoDataUrl
      ? { ...payload.answers, [PHOTO_ANSWER_KEY]: photoDataUrl }
      : payload.answers;

    return saveProgress(accessToken, {
      formCode: formData.form.code,
      formVersion: formData.form.version,
      locale,
      subjectType: "admission",
      subjectId: selectedAdmissionCaseId,
      submissionId: payload.submissionId,
      answers,
    });
  };

  const onSave = async (payload: {
    submissionId: string | null;
    answers: Record<string, JsonValue>;
  }): Promise<SaveResponse> => {
    const answers = photoDataUrl
      ? { ...payload.answers, [PHOTO_ANSWER_KEY]: photoDataUrl }
      : payload.answers;

    return save(accessToken, {
      formCode: formData.form.code,
      formVersion: formData.form.version,
      locale,
      subjectType: "admission",
      subjectId: selectedAdmissionCaseId,
      submissionId: payload.submissionId,
      answers,
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <Icon className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{text("admission.page.header", "{unitName} Admission", { unitName })}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {text("admission.generated_form", "Unit-scoped generated form: {formCode} v{version}", {
                  formCode: formData.form.code,
                  version: formData.form.version,
                })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentStep("dashboard")}
            className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <UserRoundCheck className="h-4 w-4" />
            {text("admission.back_to_dashboard", "Back to Dashboard")}
          </button>
        </div>
      </div>

      {unitId === "detox" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-slate-900">
              {text("admission.due_today.title", "Due For Admission Today")}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {text("admission.due_today.description", "Screened people scheduled for admission on today's date.")}
            </p>
            {selectedAdmissionCaseId ? (
              <p className="mt-2 text-xs font-medium text-blue-700">
                {text("admission.due_today.prefill", "Admission fields are being prefilled from the selected screening case.")}
              </p>
            ) : null}
          </div>

          {loadingTodaysAdmissions ? (
            <p className="text-sm text-slate-600">{text("admission.due_today.loading", "Loading today's admissions...")}</p>
          ) : todaysAdmissionsError ? (
            <p className="text-sm text-amber-700">{todaysAdmissionsError}</p>
          ) : todaysAdmissions.length === 0 ? (
            <p className="text-sm text-slate-600">{text("admission.due_today.none", "Nobody is due for admission today.")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">{text("admission.due_today.name", "Name")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">{text("admission.due_today.phone", "Phone")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">{text("admission.due_today.queue", "Queue")}</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">{text("admission.due_today.status", "Status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaysAdmissions.map((assignment) => (
                    <tr
                      key={assignment.scheduledIntakeId}
                      className={
                        assignment.caseId === selectedAdmissionCaseId
                          ? "cursor-pointer bg-blue-50 ring-1 ring-inset ring-blue-200"
                          : "cursor-pointer bg-white hover:bg-slate-50"
                      }
                      onClick={() => setSelectedAdmissionCaseId(assignment.caseId)}
                      title={text("admission.due_today.click_to_prefill", "Select this resident to prefill the admission form.")}
                    >
                      <td className="px-4 py-3 text-slate-900">{[assignment.name, assignment.surname].filter(Boolean).join(" ")}</td>
                      <td className="px-4 py-3 text-slate-700">{assignment.phoneNumber || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{assignment.queueType || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{assignment.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Camera className="h-4 w-4 text-blue-600" />
          {text("admission.photo_capture", "Resident Photo Capture")}
        </h3>

        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="h-52 w-full overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt={text("admission.photo.alt", "Captured resident")} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">{text("admission.no_photo", "No photo captured")}</div>
            )}
          </div>

          <div className="space-y-3">
            {!cameraOpen ? (
              <button
                type="button"
                onClick={() => void openCamera()}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {text("admission.open_camera", "Open Camera")}
              </button>
            ) : (
              <div className="space-y-2">
                <video ref={videoRef} className="h-52 w-full rounded-lg border border-gray-200 bg-black object-cover" muted playsInline autoPlay />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    {text("admission.capture", "Capture")}
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {text("admission.cancel_camera", "Cancel Camera")}
                  </button>
                </div>
              </div>
            )}

            <label className="inline-flex cursor-pointer items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              {text("admission.upload_photo", "Upload Photo")}
              <input type="file" accept="image/*" onChange={onPhotoFileSelected} className="hidden" />
            </label>
            {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}
          </div>
        </div>
      </div>

      <DynamicFormRenderer
        form={formData.form}
        optionSets={formData.optionSets}
        locale={locale}
        initialSubmissionId={formData.submissionId}
        initialAnswers={mergedInitialAnswers}
        subjectType="admission"
        subjectId={null}
        renderMode="wizard"
        onSaveProgress={onSaveProgress}
        onSave={onSave}
      />
    </div>
  );
};

export default UnitAdmissionForm;
