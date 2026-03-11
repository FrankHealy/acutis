"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

const UnitAdmissionForm: React.FC<UnitAdmissionFormProps> = ({
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const Icon = iconByUnit[unitIconKey];

  useEffect(() => {
    void loadKeys([
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
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

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
          setError("Session expired.");
          return;
        }
        const response = await getActiveForm(
          accessToken,
          locale,
          "admission",
          null,
          admissionFormCode
        );

        if (!active) return;
        setFormData(response);
        mergeTranslations(response.translations);
        setError(null);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load admission form.");
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
  }, [admissionFormCode, locale, mergeTranslations, session?.accessToken, status]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (openError) {
      setCameraError(openError instanceof Error ? openError.message : "Unable to access camera.");
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
        <h2 className="text-lg font-semibold text-amber-900">{unitName} Admission</h2>
        <p className="mt-2 text-sm text-amber-800">{text("admission.session_expired", "Session expired.")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-900">{unitName} Admission</h2>
        <p className="mt-2 text-sm text-amber-800">{error}</p>
        <p className="mt-2 text-xs text-amber-700">
          Configure or activate <code>{admissionFormCode}</code> in the forms generator.
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
      subjectId: null,
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
      subjectId: null,
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
              <h2 className="text-xl font-semibold text-slate-900">{unitName} Admission</h2>
              <p className="mt-1 text-sm text-slate-600">
                Unit-scoped generated form: <code>{formData.form.code}</code> v{formData.form.version}
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

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Camera className="h-4 w-4 text-blue-600" />
          {text("admission.photo_capture", "Resident Photo Capture")}
        </h3>

        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="h-52 w-full overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="Captured resident" className="h-full w-full object-cover" />
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
                <video ref={videoRef} className="h-52 w-full rounded-lg border border-gray-200 bg-black object-cover" muted playsInline />
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
        onSaveProgress={onSaveProgress}
        onSave={onSave}
      />
    </div>
  );
};

export default UnitAdmissionForm;
