"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DynamicFormRenderer from "./DynamicFormRenderer";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import {
  activateFormVersion,
  createAdmissionForm,
  createAlcoholScreeningForm,
  createSurveyForm,
  deleteAdmissionForm,
  deleteAlcoholScreeningForm,
  deleteSurveyForm,
  editAdmissionForm,
  editAlcoholScreeningForm,
  editAsDraftAdmissionForm,
  editAsDraftAlcoholScreeningForm,
  editAsDraftSurveyForm,
  editSurveyForm,
  getActiveForm,
  getFormVersions,
  save,
  saveAsDraftAdmissionForm,
  saveAsDraftAlcoholScreeningForm,
  saveAsDraftSurveyForm,
  saveProgress,
  type FormConfigurationVersionDto,
  type GetActiveFormResponse,
  type JsonValue,
  type SaveProgressResponse,
  type SaveResponse,
  type UpsertFormDefinitionRequest,
} from "./ApiClient";
import { isAuthorizationDisabled, isAuthorizedClient } from "@/lib/authMode";

type SubjectType = "anonymous_call" | "resident" | "admission";

const DEFAULT_SUBJECT_TYPE: SubjectType = "anonymous_call";
const DEFAULT_FORM_CODE = "alcohol_screening_call";
type ConfigMode = "alcohol" | "admission" | "survey" | "unsupported";

export default function ScreeningFormPage() {
  const { data: session, status } = useSession();
  const { locale, mergeTranslations } = useLocalization();
  const [formData, setFormData] = useState<GetActiveFormResponse | null>(null);
  const [subjectType, setSubjectType] = useState<SubjectType>(DEFAULT_SUBJECT_TYPE);
  const [selectedFormCode, setSelectedFormCode] = useState(DEFAULT_FORM_CODE);
  const [formCodeInput, setFormCodeInput] = useState(DEFAULT_FORM_CODE);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [versions, setVersions] = useState<FormConfigurationVersionDto[]>([]);
  const [isVersionsLoading, setIsVersionsLoading] = useState(true);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [activatingVersion, setActivatingVersion] = useState<number | null>(null);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [deletingVersion, setDeletingVersion] = useState<number | null>(null);
  const [editorTitleKey, setEditorTitleKey] = useState("");
  const [editorDescriptionKey, setEditorDescriptionKey] = useState("");
  const [editorSchemaJson, setEditorSchemaJson] = useState("");
  const [editorUiJson, setEditorUiJson] = useState("");
  const [editorRulesJson, setEditorRulesJson] = useState("");
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorResult, setEditorResult] = useState<string | null>(null);
  const [editorSubmitting, setEditorSubmitting] = useState(false);
  const [isPingingConfigApi, setIsPingingConfigApi] = useState(false);
  const [pingConfigApiMessage, setPingConfigApiMessage] = useState<string | null>(null);
  const [pingConfigApiError, setPingConfigApiError] = useState<string | null>(null);
  const normalizedFormCode = selectedFormCode.trim().toLowerCase();
  const configMode: ConfigMode =
    normalizedFormCode === DEFAULT_FORM_CODE
      ? "alcohol"
      : normalizedFormCode.startsWith("admission_")
        ? "admission"
        : normalizedFormCode.startsWith("survey_")
          ? "survey"
          : "unsupported";

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!isAuthorizedClient(status, session?.accessToken)) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const accessToken = session?.accessToken;
        if (!accessToken && !isAuthorizationDisabled) {
          setErrorMessage("Session expired.");
          return;
        }
        const response = await getActiveForm(
          accessToken,
          locale,
          subjectType,
          null,
          selectedFormCode
        );
        if (!active) return;
        setFormData(response);
        mergeTranslations(response.translations);
        setErrorMessage(null);
      } catch (error) {
        if (!active) return;
        setErrorMessage(error instanceof Error ? error.message : "Unable to load screening form.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [locale, mergeTranslations, reloadKey, selectedFormCode, session?.accessToken, status, subjectType]);

  useEffect(() => {
    let active = true;

    const loadVersions = async () => {
      if (!isAuthorizedClient(status, session?.accessToken)) {
        if (active) {
          setIsVersionsLoading(false);
          setVersions([]);
        }
        return;
      }

      try {
        setIsVersionsLoading(true);
        const accessToken = session?.accessToken;
        if (!accessToken && !isAuthorizationDisabled) {
          setVersions([]);
          setVersionsError("Session expired.");
          return;
        }
        const response = await getFormVersions(accessToken, selectedFormCode);
        if (!active) return;
        setVersions(response);
        setVersionsError(null);
      } catch (error) {
        if (!active) return;
        setVersions([]);
        setVersionsError(error instanceof Error ? error.message : "Unable to load form versions.");
      } finally {
        if (active) {
          setIsVersionsLoading(false);
        }
      }
    };

    void loadVersions();

    return () => {
      active = false;
    };
  }, [reloadKey, selectedFormCode, session?.accessToken, status]);

  useEffect(() => {
    if (!formData) {
      return;
    }

    setEditorTitleKey(formData.form.titleKey);
    setEditorDescriptionKey(formData.form.descriptionKey ?? "");
    setEditorSchemaJson(JSON.stringify(formData.form.schema, null, 2));
    setEditorUiJson(JSON.stringify(formData.form.ui, null, 2));
    setEditorRulesJson(JSON.stringify(formData.form.rules, null, 2));
    setEditorError(null);
    setEditorResult(null);
  }, [formData?.form.code, formData?.form.version]);

  const handleLoadSelectedForm = () => {
    const next = formCodeInput.trim().toLowerCase();
    if (!next) return;
    setSelectedFormCode(next);
    setActivationError(null);
  };

  const handleActivateVersion = async (version: number) => {
    if (!session?.accessToken && !isAuthorizationDisabled) {
      return;
    }

    try {
      setActivatingVersion(version);
      await activateFormVersion(session?.accessToken, selectedFormCode, version);
      setActivationError(null);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setActivationError(error instanceof Error ? error.message : "Unable to activate version.");
    } finally {
      setActivatingVersion(null);
    }
  };

  const handleDeleteVersion = async (version: number) => {
    if (!session?.accessToken && !isAuthorizationDisabled) {
      return;
    }

    const confirmed = window.confirm(
      `Soft delete form version v${version}? This will archive the version but keep audit history.`
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeletingVersion(version);
      setActivationError(null);
      if (configMode === "alcohol") {
        await deleteAlcoholScreeningForm(session?.accessToken, version);
      } else if (configMode === "admission") {
        await deleteAdmissionForm(session?.accessToken, selectedFormCode, version);
      } else if (configMode === "survey") {
        await deleteSurveyForm(session?.accessToken, selectedFormCode, version);
      } else {
        throw new Error("Unsupported form code for delete action.");
      }
      setReloadKey((value) => value + 1);
    } catch (deleteError) {
      setActivationError(deleteError instanceof Error ? deleteError.message : "Unable to soft delete version.");
    } finally {
      setDeletingVersion(null);
    }
  };

  const handlePingConfigApi = async () => {
    if (!session?.accessToken && !isAuthorizationDisabled) {
      return;
    }

    try {
      setIsPingingConfigApi(true);
      setPingConfigApiError(null);
      const startedAt = performance.now();
      const response = await getFormVersions(session?.accessToken, selectedFormCode);
      const elapsedMs = Math.round(performance.now() - startedAt);
      setPingConfigApiMessage(
        `Config API OK (${response.length} version(s), ${elapsedMs} ms, ${new Date().toLocaleTimeString()}).`
      );
    } catch (error) {
      setPingConfigApiMessage(null);
      setPingConfigApiError(error instanceof Error ? error.message : "Config API ping failed.");
    } finally {
      setIsPingingConfigApi(false);
    }
  };

  const requireValidJson = (label: string, rawValue: string): string => {
    try {
      const parsed = JSON.parse(rawValue);
      return JSON.stringify(parsed);
    } catch {
      throw new Error(`${label} must be valid JSON.`);
    }
  };

  const handleFormatJson = () => {
    try {
      setEditorSchemaJson(JSON.stringify(JSON.parse(editorSchemaJson), null, 2));
      setEditorUiJson(JSON.stringify(JSON.parse(editorUiJson), null, 2));
      setEditorRulesJson(JSON.stringify(JSON.parse(editorRulesJson), null, 2));
      setEditorError(null);
    } catch {
      setEditorError("One or more JSON fields are invalid and could not be formatted.");
    }
  };

  const runDefinitionAction = async (action: "create" | "edit", makeActive: boolean) => {
    if (!session?.accessToken && !isAuthorizationDisabled) {
      return;
    }

    if (!formData) {
      setEditorError("No active form is loaded.");
      return;
    }

    if (configMode === "unsupported") {
      setEditorError(
        `Unsupported form code '${selectedFormCode}'. Use '${DEFAULT_FORM_CODE}', 'admission_*', or 'survey_*'.`
      );
      return;
    }

    try {
      setEditorSubmitting(true);
      setEditorError(null);
      setEditorResult(null);

      const payload: UpsertFormDefinitionRequest = {
        titleKey: editorTitleKey.trim(),
        descriptionKey: editorDescriptionKey.trim() || null,
        schemaJson: requireValidJson("Schema", editorSchemaJson),
        uiJson: requireValidJson("UI", editorUiJson),
        rulesJson: requireValidJson("Rules", editorRulesJson),
        makeActive,
      };

      if (!payload.titleKey) {
        throw new Error("Title key is required.");
      }

      const response =
        configMode === "alcohol"
          ? action === "create"
            ? makeActive
              ? await createAlcoholScreeningForm(session?.accessToken, payload)
              : await saveAsDraftAlcoholScreeningForm(session?.accessToken, payload)
            : makeActive
              ? await editAlcoholScreeningForm(session?.accessToken, formData.form.version, payload)
              : await editAsDraftAlcoholScreeningForm(session?.accessToken, formData.form.version, payload)
          : configMode === "admission"
            ? action === "create"
              ? makeActive
                ? await createAdmissionForm(session?.accessToken, selectedFormCode, payload)
                : await saveAsDraftAdmissionForm(session?.accessToken, selectedFormCode, payload)
              : makeActive
                ? await editAdmissionForm(session?.accessToken, selectedFormCode, formData.form.version, payload)
                : await editAsDraftAdmissionForm(
                    session?.accessToken,
                    selectedFormCode,
                    formData.form.version,
                    payload
                  )
            : action === "create"
              ? makeActive
                ? await createSurveyForm(session?.accessToken, selectedFormCode, payload)
                : await saveAsDraftSurveyForm(session?.accessToken, selectedFormCode, payload)
              : makeActive
                ? await editSurveyForm(session?.accessToken, selectedFormCode, formData.form.version, payload)
                : await editAsDraftSurveyForm(
                    session?.accessToken,
                    selectedFormCode,
                    formData.form.version,
                    payload
                  );

      setEditorResult(
        `Saved ${response.code} v${response.version} (${response.status}).`
      );
      setReloadKey((value) => value + 1);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "Unable to save form definition.");
    } finally {
      setEditorSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Loading screening form...
      </div>
    );
  }

  if (!isAuthorizedClient(status, session?.accessToken)) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Please sign in to access screening forms.
      </div>
    );
  }

  const accessToken = session?.accessToken;
  if (!accessToken && !isAuthorizationDisabled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Session expired.
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        No active screening form was returned.
      </div>
    );
  }

  const handleSaveProgress = async (payload: {
    submissionId: string | null;
    answers: Record<string, JsonValue>;
  }): Promise<SaveProgressResponse> => {
    return saveProgress(accessToken, {
      formCode: formData.form.code,
      formVersion: formData.form.version,
      locale,
      subjectType,
      subjectId: null,
      submissionId: payload.submissionId,
      answers: payload.answers,
    });
  };

  const handleSave = async (payload: {
    submissionId: string | null;
    answers: Record<string, JsonValue>;
  }): Promise<SaveResponse> => {
    return save(accessToken, {
      formCode: formData.form.code,
      formVersion: formData.form.version,
      locale,
      subjectType,
      subjectId: null,
      submissionId: payload.submissionId,
      answers: payload.answers,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Screening Form Configuration</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose the form code and activate a version to change which screening form is live.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="screening-form-code">
              Form Code
            </label>
            <input
              id="screening-form-code"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={formCodeInput}
              onChange={(event) => setFormCodeInput(event.target.value)}
              placeholder="alcohol_screening_call"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="screening-subject-type">
              Subject Type
            </label>
            <select
              id="screening-subject-type"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={subjectType}
              onChange={(event) => setSubjectType(event.target.value as SubjectType)}
            >
              <option value="anonymous_call">anonymous_call</option>
              <option value="resident">resident</option>
              <option value="admission">admission</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="rounded bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              onClick={handleLoadSelectedForm}
            >
              Load Form
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
          Loaded: <span className="font-semibold">{formData.form.code}</span> v
          <span className="font-semibold">{formData.form.version}</span> ({formData.form.status})
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={handlePingConfigApi}
            disabled={isPingingConfigApi}
          >
            {isPingingConfigApi ? "Pinging..." : "Ping Config API"}
          </button>
        </div>

        {pingConfigApiMessage && <p className="mt-2 text-sm text-green-700">{pingConfigApiMessage}</p>}
        {pingConfigApiError && <p className="mt-2 text-sm text-red-600">{pingConfigApiError}</p>}
        {activationError && <p className="mt-3 text-sm text-red-600">{activationError}</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-900">Versions</h3>
        {isVersionsLoading ? (
          <p className="mt-3 text-sm text-slate-600">Loading versions...</p>
        ) : versionsError ? (
          <p className="mt-3 text-sm text-red-600">{versionsError}</p>
        ) : versions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No versions found.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Version</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions
                  .slice()
                  .sort((left, right) => right.version - left.version)
                  .map((item) => {
                    const isCurrent =
                      item.code === formData.form.code && item.version === formData.form.version;

                    return (
                      <tr key={`${item.code}-${item.version}`} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-medium text-slate-900">v{item.version}</td>
                        <td className="py-2 pr-4 text-slate-700">{item.status}</td>
                        <td className="py-2 pr-4 text-slate-700">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="rounded border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              onClick={() => handleActivateVersion(item.version)}
                              disabled={isCurrent || activatingVersion === item.version || deletingVersion === item.version}
                            >
                              {isCurrent
                                ? "Active"
                                : activatingVersion === item.version
                                  ? "Activating..."
                                  : "Activate"}
                            </button>
                            <button
                              type="button"
                              className="rounded border border-red-300 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              onClick={() => handleDeleteVersion(item.version)}
                              disabled={deletingVersion === item.version}
                            >
                              {deletingVersion === item.version ? "Deleting..." : "Soft Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-900">Define / Edit Form</h3>
        <p className="mt-1 text-sm text-slate-600">
          Edit `titleKey`, `descriptionKey`, `schema`, `ui`, and `rules`, then create a new version or edit from the active version.
        </p>

        {configMode === "unsupported" && (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Unsupported form code for definition actions. Use <code>{DEFAULT_FORM_CODE}</code>,{" "}
            <code>admission_*</code>, or <code>survey_*</code>.
          </p>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="editor-title-key">
              Title Key
            </label>
            <input
              id="editor-title-key"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={editorTitleKey}
              onChange={(event) => setEditorTitleKey(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="editor-description-key">
              Description Key
            </label>
            <input
              id="editor-description-key"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              value={editorDescriptionKey}
              onChange={(event) => setEditorDescriptionKey(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="editor-schema-json">
              Schema JSON
            </label>
            <textarea
              id="editor-schema-json"
              className="h-56 w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs"
              value={editorSchemaJson}
              onChange={(event) => setEditorSchemaJson(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="editor-ui-json">
              UI JSON
            </label>
            <textarea
              id="editor-ui-json"
              className="h-56 w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs"
              value={editorUiJson}
              onChange={(event) => setEditorUiJson(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-800" htmlFor="editor-rules-json">
              Rules JSON
            </label>
            <textarea
              id="editor-rules-json"
              className="h-40 w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs"
              value={editorRulesJson}
              onChange={(event) => setEditorRulesJson(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={handleFormatJson}
            disabled={editorSubmitting}
          >
            Format JSON
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setEditorTitleKey(formData.form.titleKey);
              setEditorDescriptionKey(formData.form.descriptionKey ?? "");
              setEditorSchemaJson(JSON.stringify(formData.form.schema, null, 2));
              setEditorUiJson(JSON.stringify(formData.form.ui, null, 2));
              setEditorRulesJson(JSON.stringify(formData.form.rules, null, 2));
              setEditorError(null);
              setEditorResult(null);
            }}
            disabled={editorSubmitting}
          >
            Reload Active Into Editor
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={() => runDefinitionAction("create", false)}
            disabled={editorSubmitting || configMode === "unsupported"}
          >
            {editorSubmitting ? "Saving..." : "Create Draft Version"}
          </button>
          <button
            type="button"
            className="rounded bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            onClick={() => runDefinitionAction("create", true)}
            disabled={editorSubmitting || configMode === "unsupported"}
          >
            {editorSubmitting ? "Saving..." : "Create and Activate"}
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            onClick={() => runDefinitionAction("edit", false)}
            disabled={editorSubmitting || configMode === "unsupported"}
          >
            {editorSubmitting ? "Saving..." : "Edit Active as Draft"}
          </button>
          <button
            type="button"
            className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={() => runDefinitionAction("edit", true)}
            disabled={editorSubmitting || configMode === "unsupported"}
          >
            {editorSubmitting ? "Saving..." : "Edit Active and Activate"}
          </button>
        </div>

        {editorError && <p className="mt-3 text-sm text-red-600">{editorError}</p>}
        {editorResult && <p className="mt-3 text-sm text-green-700">{editorResult}</p>}
      </section>

      <DynamicFormRenderer
        form={formData.form}
        optionSets={formData.optionSets}
        locale={locale}
        initialSubmissionId={formData.submissionId}
        initialAnswers={formData.draftAnswers}
        subjectType={subjectType}
        subjectId={null}
        onSaveProgress={handleSaveProgress}
        onSave={handleSave}
      />
    </div>
  );
}
