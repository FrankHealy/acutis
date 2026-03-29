"use client";

import React from "react";
import { CalendarClock, CalendarPlus2, Pencil, Trash2, UserPlus2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Toast from "@/units/shared/ui/Toast";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { isAuthorizedClient } from "@/lib/authMode";
import { type UnitId } from "@/areas/shared/unit/unitTypes";
import {
  screeningSchedulingService,
  type ScreeningSchedulingApiError,
  type ScreeningSchedulingAssignment,
  type ScreeningSchedulingAwaitingItem,
  type ScreeningSchedulingBoard,
  type ScreeningSchedulingSlot,
} from "@/areas/screening/services/screeningSchedulingService";

type CapacityManagementProps = {
  unitId?: UnitId;
};

type ToastState = {
  open: boolean;
  message: string;
  type: "success" | "warning" | "error" | "info";
};

type ConfirmationState =
  | {
      open: false;
    }
  | {
      open: true;
      mode: "edit" | "delete";
      slotId: string;
      scheduledDate: string;
      assignmentCount: number;
    };

type DraggedCard =
  | {
      caseId: string;
      scheduledIntakeId: string | null;
      origin: "awaiting" | "slot";
      originSlotId: string | null;
    }
  | null;

const emptyToast: ToastState = {
  open: false,
  message: "",
  type: "info",
};

const getApiMessage = (error: unknown, fallback: string): string => {
  const typedError = error as ScreeningSchedulingApiError;
  if (typeof typedError?.payload === "string" && typedError.payload.trim()) {
    return typedError.payload;
  }

  if (typedError?.payload && typeof typedError.payload === "object") {
    const payload = typedError.payload as { message?: string };
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const getConfirmationPayload = (error: unknown): { assignmentCount: number } | null => {
  const typedError = error as ScreeningSchedulingApiError;
  if (typedError?.status !== 409 || !typedError.payload || typeof typedError.payload !== "object") {
    return null;
  }

  const payload = typedError.payload as { requiresConfirmation?: boolean; assignmentCount?: number };
  if (!payload.requiresConfirmation) {
    return null;
  }

  return {
    assignmentCount: typeof payload.assignmentCount === "number" ? payload.assignmentCount : 0,
  };
};

const CapacityManagement: React.FC<CapacityManagementProps> = ({ unitId = "alcohol" }) => {
  const { data: session, status } = useSession();
  const { locale, loadKeys, t } = useLocalization();
  const [board, setBoard] = React.useState<ScreeningSchedulingBoard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [newDate, setNewDate] = React.useState("");
  const [editingSlotId, setEditingSlotId] = React.useState<string | null>(null);
  const [editingDate, setEditingDate] = React.useState("");
  const [assignmentSelections, setAssignmentSelections] = React.useState<Record<string, string>>({});
  const [assigningCaseId, setAssigningCaseId] = React.useState<string | null>(null);
  const [savingSlot, setSavingSlot] = React.useState(false);
  const [toast, setToast] = React.useState<ToastState>(emptyToast);
  const [confirmation, setConfirmation] = React.useState<ConfirmationState>({ open: false });
  const [draggedCard, setDraggedCard] = React.useState<DraggedCard>(null);
  const [dragTarget, setDragTarget] = React.useState<string | null>(null);

  React.useEffect(() => {
    void loadKeys([
      "screening.tab.scheduling",
      "screening.scheduling.title",
      "screening.scheduling.subtitle",
      "screening.scheduling.awaiting.title",
      "screening.scheduling.awaiting.empty",
      "screening.scheduling.awaiting.completed_at",
      "screening.scheduling.awaiting.phone",
      "screening.scheduling.awaiting.queue",
      "screening.scheduling.awaiting.assign",
      "screening.scheduling.awaiting.choose_date",
      "screening.scheduling.dates.title",
      "screening.scheduling.dates.subtitle",
      "screening.scheduling.date_label",
      "screening.scheduling.add_date",
      "screening.scheduling.save_date",
      "screening.scheduling.cancel",
      "screening.scheduling.edit",
      "screening.scheduling.delete",
      "screening.scheduling.assigned",
      "screening.scheduling.none_assigned",
      "screening.scheduling.confirm.edit.title",
      "screening.scheduling.confirm.edit.body",
      "screening.scheduling.confirm.delete.title",
      "screening.scheduling.confirm.delete.body",
      "screening.scheduling.confirm.confirm",
      "screening.scheduling.success.date_added",
      "screening.scheduling.success.date_updated",
      "screening.scheduling.success.date_deleted",
      "screening.scheduling.success.assigned",
      "screening.scheduling.loading",
      "screening.scheduling.retry",
      "toast.action.close",
    ]);
  }, [loadKeys]);

  const text = React.useCallback(
    (key: string, fallback: string, fallbackArabic?: string) => {
      const resolved = t(key);
      if (resolved !== key) {
        return resolved;
      }

      return locale.startsWith("ar") && fallbackArabic ? fallbackArabic : fallback;
    },
    [locale, t],
  );

  const formatDate = React.useCallback(
    (value: string) => {
      const date = new Date(`${value}T00:00:00`);
      const dateLocale = locale.startsWith("ar") ? "ar-EG" : "en-IE";
      return date.toLocaleDateString(dateLocale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
    [locale],
  );

  const formatDateTime = React.useCallback(
    (value: string) => {
      const date = new Date(value);
      const dateLocale = locale.startsWith("ar") ? "ar-EG" : "en-IE";
      return date.toLocaleString(dateLocale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [locale],
  );

  const loadBoard = React.useCallback(async () => {
    if (!isAuthorizedClient(status, session?.accessToken)) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const nextBoard = await screeningSchedulingService.getBoard(unitId, session?.accessToken);
      setBoard(nextBoard);
      setAssignmentSelections((current) => {
        const updated = { ...current };
        const firstSlotId = nextBoard.slots[0]?.slotId ?? "";
        for (const item of nextBoard.awaiting) {
          if (!updated[item.caseId] || !nextBoard.slots.some((slot) => slot.slotId === updated[item.caseId])) {
            updated[item.caseId] = firstSlotId;
          }
        }
        return updated;
      });
    } catch (error) {
      setErrorMessage(getApiMessage(error, text("screening.scheduling.loading", "Unable to load scheduling.", "تعذر تحميل الجدولة.")));
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status, text, unitId]);

  React.useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const showToast = React.useCallback((message: string, type: ToastState["type"]) => {
    setToast({ open: true, message, type });
  }, []);

  const beginEditing = React.useCallback((slot: ScreeningSchedulingSlot) => {
    setEditingSlotId(slot.slotId);
    setEditingDate(slot.scheduledDate);
  }, []);

  const cancelEditing = React.useCallback(() => {
    setEditingSlotId(null);
    setEditingDate("");
  }, []);

  const handleAddDate = React.useCallback(async () => {
    if (!newDate || !isAuthorizedClient(status, session?.accessToken)) {
      return;
    }

    setSavingSlot(true);
    try {
      await screeningSchedulingService.createSlot(unitId, newDate, session?.accessToken);
      setNewDate("");
      showToast(
        text("screening.scheduling.success.date_added", "Admission date added.", "تمت إضافة تاريخ القبول."),
        "success",
      );
      await loadBoard();
    } catch (error) {
      showToast(getApiMessage(error, "Unable to add admission date."), "error");
    } finally {
      setSavingSlot(false);
    }
  }, [loadBoard, newDate, session?.accessToken, showToast, status, text, unitId]);

  const handleSaveEdit = React.useCallback(
    async (slot: ScreeningSchedulingSlot, force = false) => {
      if (!editingDate || !isAuthorizedClient(status, session?.accessToken)) {
        return;
      }

      setSavingSlot(true);
      try {
        await screeningSchedulingService.updateSlot(slot.slotId, unitId, editingDate, session?.accessToken, force);
        cancelEditing();
        setConfirmation({ open: false });
        showToast(
          text("screening.scheduling.success.date_updated", "Admission date updated.", "تم تحديث تاريخ القبول."),
          "success",
        );
        await loadBoard();
      } catch (error) {
        const confirmationPayload = getConfirmationPayload(error);
        if (confirmationPayload) {
          setConfirmation({
            open: true,
            mode: "edit",
            slotId: slot.slotId,
            scheduledDate: editingDate,
            assignmentCount: confirmationPayload.assignmentCount,
          });
          return;
        }

        showToast(getApiMessage(error, "Unable to update admission date."), "error");
      } finally {
        setSavingSlot(false);
      }
    },
    [cancelEditing, editingDate, loadBoard, session?.accessToken, showToast, status, text, unitId],
  );

  const handleDeleteSlot = React.useCallback(
    async (slot: ScreeningSchedulingSlot, force = false) => {
      if (!isAuthorizedClient(status, session?.accessToken)) {
        return;
      }

      setSavingSlot(true);
      try {
        await screeningSchedulingService.deleteSlot(slot.slotId, session?.accessToken, force);
        cancelEditing();
        setConfirmation({ open: false });
        showToast(
          text("screening.scheduling.success.date_deleted", "Admission date deleted.", "تم حذف تاريخ القبول."),
          "success",
        );
        await loadBoard();
      } catch (error) {
        const confirmationPayload = getConfirmationPayload(error);
        if (confirmationPayload) {
          setConfirmation({
            open: true,
            mode: "delete",
            slotId: slot.slotId,
            scheduledDate: slot.scheduledDate,
            assignmentCount: confirmationPayload.assignmentCount,
          });
          return;
        }

        showToast(getApiMessage(error, "Unable to delete admission date."), "error");
      } finally {
        setSavingSlot(false);
      }
    },
    [cancelEditing, loadBoard, session?.accessToken, showToast, status, text],
  );

  const handleAssign = React.useCallback(
    async (caseId: string) => {
      const slotId = assignmentSelections[caseId];
      if (!slotId || !isAuthorizedClient(status, session?.accessToken)) {
        return;
      }

      setAssigningCaseId(caseId);
      try {
        await screeningSchedulingService.assignToSlot(slotId, caseId, session?.accessToken);
        showToast(
          text("screening.scheduling.success.assigned", "Awaiting case added to admission date.", "تمت إضافة الحالة إلى تاريخ القبول."),
          "success",
        );
        await loadBoard();
      } catch (error) {
        showToast(getApiMessage(error, "Unable to assign case."), "error");
      } finally {
        setAssigningCaseId(null);
      }
    },
    [assignmentSelections, loadBoard, session?.accessToken, showToast, status, text],
  );

  const handleAssignToSlot = React.useCallback(
    async (slotId: string, caseId: string) => {
      if (!isAuthorizedClient(status, session?.accessToken)) {
        return;
      }

      setAssigningCaseId(caseId);
      try {
        await screeningSchedulingService.assignToSlot(slotId, caseId, session?.accessToken);
        showToast(
          text("screening.scheduling.success.assigned", "Awaiting case added to admission date.", "تمت إضافة الحالة إلى تاريخ القبول."),
          "success",
        );
        await loadBoard();
      } catch (error) {
        showToast(getApiMessage(error, "Unable to assign case."), "error");
      } finally {
        setAssigningCaseId(null);
        setDraggedCard(null);
        setDragTarget(null);
      }
    },
    [loadBoard, session?.accessToken, showToast, status, text],
  );

  const handleUnschedule = React.useCallback(
    async (scheduledIntakeId: string) => {
      if (!isAuthorizedClient(status, session?.accessToken)) {
        return;
      }

      setAssigningCaseId(scheduledIntakeId);
      try {
        await screeningSchedulingService.unscheduleAssignment(scheduledIntakeId, session?.accessToken);
        showToast(
          text(
            "screening.scheduling.success.unscheduled",
            "Assignment returned to awaiting scheduling.",
            "تمت إعادة التخصيص إلى انتظار الجدولة.",
          ),
          "success",
        );
        await loadBoard();
      } catch (error) {
        showToast(getApiMessage(error, "Unable to unschedule assignment."), "error");
      } finally {
        setAssigningCaseId(null);
        setDraggedCard(null);
        setDragTarget(null);
      }
    },
    [loadBoard, session?.accessToken, showToast, status, text],
  );

  const handleConfirmation = React.useCallback(async () => {
    if (!confirmation.open || !board) {
      return;
    }

    const slot = board.slots.find((item) => item.slotId === confirmation.slotId);
    if (!slot) {
      setConfirmation({ open: false });
      return;
    }

    if (confirmation.mode === "edit") {
      await handleSaveEdit(slot, true);
      return;
    }

    await handleDeleteSlot(slot, true);
  }, [board, confirmation, handleDeleteSlot, handleSaveEdit]);

  const assignedCount = board?.slots.reduce((sum, slot) => sum + slot.assignmentCount, 0) ?? 0;
  const closeLabel = text("toast.action.close", "Close", "إغلاق");
  const isRtl = locale.startsWith("ar");

  const handleDragStart = React.useCallback(
    (card: DraggedCard) => {
      setDraggedCard(card);
    },
    [],
  );

  const handleDragEnd = React.useCallback(() => {
    setDraggedCard(null);
    setDragTarget(null);
  }, []);

  const handleDropToAwaiting = React.useCallback(async () => {
    if (!draggedCard) {
      return;
    }

    if (draggedCard.origin === "slot" && draggedCard.scheduledIntakeId) {
      await handleUnschedule(draggedCard.scheduledIntakeId);
      return;
    }

    setDraggedCard(null);
    setDragTarget(null);
  }, [draggedCard, handleUnschedule]);

  const handleDropToSlot = React.useCallback(
    async (slotId: string) => {
      if (!draggedCard) {
        return;
      }

      if (draggedCard.origin === "slot" && draggedCard.originSlotId === slotId) {
        setDraggedCard(null);
        setDragTarget(null);
        return;
      }

      await handleAssignToSlot(slotId, draggedCard.caseId);
    },
    [draggedCard, handleAssignToSlot],
  );

  const renderEntityCard = React.useCallback(
    (
      item: ScreeningSchedulingAwaitingItem | ScreeningSchedulingAssignment,
      options: {
        key: string;
        metaLine: string;
        acceptedLine?: string;
        draggable: boolean;
        dragPayload: DraggedCard;
        action?: React.ReactNode;
      },
    ) => (
      <article
        key={options.key}
        draggable={options.draggable}
        onDragStart={() => handleDragStart(options.dragPayload)}
        onDragEnd={handleDragEnd}
        className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div>
              <h4 className="text-base font-semibold text-[var(--app-text)]">
                {[item.name, item.surname].join(" ").trim()}
              </h4>
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">{options.metaLine}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 font-semibold text-[var(--app-primary-strong)]">
                {item.queueType}
              </span>
              <span className="rounded-full bg-[var(--app-surface-muted)] px-2.5 py-1 font-semibold text-[var(--app-text-muted)]">
                {item.phoneNumber || "—"}
              </span>
            </div>
            {options.acceptedLine ? (
              <p className="text-xs text-[var(--app-text-muted)]">{options.acceptedLine}</p>
            ) : null}
          </div>
          {options.action}
        </div>
      </article>
    ),
    [handleDragEnd, handleDragStart],
  );

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-primary)] text-white">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-[var(--app-text)]">
                {text("screening.scheduling.title", "Scheduling", "الجدولة")}
              </h2>
              <p className="text-sm text-[var(--app-text-muted)]">
                {text(
                  "screening.scheduling.subtitle",
                  "Move accepted alcohol assessments from awaiting scheduling into the next admission dates.",
                  "انقل التقييمات المقبولة للكحول من قائمة انتظار الجدولة إلى تواريخ القبول التالية.",
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                {text("screening.scheduling.awaiting.title", "Awaiting Scheduling", "بانتظار الجدولة")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--app-text)]">{board?.awaiting.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
                {text("screening.scheduling.assigned", "Assigned", "المعيّنون")}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[var(--app-text)]">{assignedCount}</p>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-sm text-[var(--app-text-muted)]">
          {text("screening.scheduling.loading", "Loading scheduling board...", "جارٍ تحميل لوحة الجدولة...")}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-3xl border border-[color:color-mix(in_srgb,var(--app-danger)_30%,var(--app-border))] bg-[color:color-mix(in_srgb,var(--app-danger)_8%,white)] p-6">
          <p className="text-sm text-[var(--app-danger)]">{errorMessage}</p>
          <button
            type="button"
            onClick={() => void loadBoard()}
            className="mt-4 rounded-xl bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            {text("screening.scheduling.retry", "Retry", "إعادة المحاولة")}
          </button>
        </div>
      ) : null}

      {!loading && !errorMessage ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr,1.3fr]">
          <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-[var(--app-text)]">
                {text("screening.scheduling.awaiting.title", "Awaiting Scheduling", "بانتظار الجدولة")}
              </h3>
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                {text(
                  "screening.scheduling.awaiting.empty",
                  "Accepted assessments with no admission date appear here until scheduled.",
                  "تظهر هنا التقييمات المقبولة التي لا تملك تاريخ قبول حتى تتم جدولتها.",
                )}
              </p>
            </div>

            <div className="space-y-4">
              {board?.awaiting.length ? (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragTarget("awaiting");
                  }}
                  onDragLeave={() => {
                    if (dragTarget === "awaiting") {
                      setDragTarget(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleDropToAwaiting();
                  }}
                  className={`space-y-4 rounded-2xl border-2 border-dashed p-3 transition-colors ${
                    dragTarget === "awaiting"
                      ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
                      : "border-transparent bg-transparent"
                  }`}
                >
                  {board.awaiting.map((item) =>
                    renderEntityCard(item, {
                      key: item.caseId,
                      draggable: true,
                      dragPayload: {
                        caseId: item.caseId,
                        scheduledIntakeId: null,
                        origin: "awaiting",
                        originSlotId: null,
                      },
                      metaLine: `${text("screening.scheduling.awaiting.phone", "Phone", "الهاتف")}: ${item.phoneNumber || "—"}`,
                      acceptedLine: `${text("screening.scheduling.awaiting.completed_at", "Accepted", "تم القبول")}: ${formatDateTime(item.completedAt)}`,
                      action: (
                        <div className="w-full max-w-xs space-y-2">
                          <select
                            value={assignmentSelections[item.caseId] ?? ""}
                            onChange={(event) =>
                              setAssignmentSelections((current) => ({
                                ...current,
                                [item.caseId]: event.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                          >
                            <option value="">
                              {text("screening.scheduling.awaiting.choose_date", "Choose admission date", "اختر تاريخ القبول")}
                            </option>
                            {board.slots.map((slot) => (
                              <option key={slot.slotId} value={slot.slotId}>
                                {formatDate(slot.scheduledDate)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={!assignmentSelections[item.caseId] || assigningCaseId === item.caseId}
                            onClick={() => void handleAssign(item.caseId)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <UserPlus2 className="h-4 w-4" />
                            {text("screening.scheduling.awaiting.assign", "Add to Date", "أضف إلى التاريخ")}
                          </button>
                        </div>
                      ),
                    }),
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragTarget("awaiting");
                  }}
                  onDragLeave={() => {
                    if (dragTarget === "awaiting") {
                      setDragTarget(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleDropToAwaiting();
                  }}
                  className={`rounded-2xl border border-dashed p-5 text-sm transition-colors ${
                    dragTarget === "awaiting"
                      ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]"
                      : "border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]"
                  }`}
                >
                  {text("screening.scheduling.awaiting.empty", "No cases are awaiting scheduling.", "لا توجد حالات بانتظار الجدولة.")}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-[var(--app-text)]">
                  {text("screening.scheduling.dates.title", "Alcohol Admission Dates", "تواريخ قبول الكحول")}
                </h3>
                <p className="mt-1 text-sm text-[var(--app-text-muted)]">
                  {text(
                    "screening.scheduling.dates.subtitle",
                    "The board always works from the next 3 Monday admission dates and skips Irish bank holidays.",
                    "تعمل اللوحة دائماً من تواريخ القبول لثلاثة أسابيع مقبلة يوم الاثنين وتتجنب العطل المصرفية الأيرلندية.",
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={newDate}
                  onChange={(event) => setNewDate(event.target.value)}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                />
                <button
                  type="button"
                  disabled={!newDate || savingSlot}
                  onClick={() => void handleAddDate()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CalendarPlus2 className="h-4 w-4" />
                  {text("screening.scheduling.add_date", "Add Date", "أضف تاريخاً")}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {board?.slots.map((slot) => {
                const isEditing = editingSlotId === slot.slotId;

                return (
                  <article
                    key={slot.slotId}
                    className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-[var(--app-text-muted)]">
                          {text("screening.scheduling.date_label", "Admission Date", "تاريخ القبول")}
                        </p>
                        {isEditing ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input
                              type="date"
                              value={editingDate}
                              onChange={(event) => setEditingDate(event.target.value)}
                              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-text)]"
                            />
                            <button
                              type="button"
                              disabled={!editingDate || savingSlot}
                              onClick={() => void handleSaveEdit(slot)}
                              className="rounded-xl bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-white"
                            >
                              {text("screening.scheduling.save_date", "Save", "حفظ")}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
                            >
                              {text("screening.scheduling.cancel", "Cancel", "إلغاء")}
                            </button>
                          </div>
                        ) : (
                          <p className="mt-1 text-lg font-semibold text-[var(--app-text)]">{formatDate(slot.scheduledDate)}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[var(--app-primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--app-primary-strong)]">
                          {text("screening.scheduling.assigned", "Assigned", "المعيّنون")}: {slot.assignmentCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => beginEditing(slot)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold text-[var(--app-text)]"
                        >
                          <Pencil className="h-4 w-4" />
                          {text("screening.scheduling.edit", "Edit", "تعديل")}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteSlot(slot)}
                          className="inline-flex items-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--app-danger)_35%,var(--app-border))] bg-[var(--app-surface)] px-3 py-2 text-sm font-semibold text-[var(--app-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          {text("screening.scheduling.delete", "Delete", "حذف")}
                        </button>
                      </div>
                    </div>

                    <div
                      className={`mt-4 space-y-3 rounded-2xl border-2 border-dashed p-3 transition-colors ${
                        dragTarget === slot.slotId
                          ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
                          : "border-transparent bg-transparent"
                      }`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragTarget(slot.slotId);
                      }}
                      onDragLeave={() => {
                        if (dragTarget === slot.slotId) {
                          setDragTarget(null);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        void handleDropToSlot(slot.slotId);
                      }}
                    >
                      {slot.assignments.length ? (
                        slot.assignments.map((assignment: ScreeningSchedulingAssignment) =>
                          renderEntityCard(assignment, {
                            key: assignment.scheduledIntakeId,
                            draggable: true,
                            dragPayload: {
                              caseId: assignment.caseId,
                              scheduledIntakeId: assignment.scheduledIntakeId,
                              origin: "slot",
                              originSlotId: slot.slotId,
                            },
                            metaLine: `${text("screening.scheduling.awaiting.phone", "Phone", "الهاتف")}: ${assignment.phoneNumber || "—"}`,
                            action: (
                              <button
                                type="button"
                                disabled={assigningCaseId === assignment.scheduledIntakeId}
                                onClick={() => void handleUnschedule(assignment.scheduledIntakeId)}
                                className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {text("screening.scheduling.awaiting.title", "Awaiting Scheduling", "بانتظار الجدولة")}
                              </button>
                            ),
                          }),
                        )
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-4 text-sm text-[var(--app-text-muted)]">
                          {text("screening.scheduling.none_assigned", "No entities assigned to this date yet.", "لا توجد كيانات مخصّصة لهذا التاريخ بعد.")}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}

      {confirmation.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-2xl">
            <h4 className="text-lg font-semibold text-[var(--app-text)]">
              {confirmation.mode === "edit"
                ? text("screening.scheduling.confirm.edit.title", "Confirm Date Change", "تأكيد تغيير التاريخ")
                : text("screening.scheduling.confirm.delete.title", "Confirm Date Deletion", "تأكيد حذف التاريخ")}
            </h4>
            <p className="mt-3 text-sm text-[var(--app-text-muted)]">
              {confirmation.mode === "edit"
                ? text(
                    "screening.scheduling.confirm.edit.body",
                    `This date already has ${confirmation.assignmentCount} assigned entities. Editing it will move them to the new date.`,
                    `هذا التاريخ يحتوي بالفعل على ${confirmation.assignmentCount} كيانات مخصّصة. سيؤدي تعديله إلى نقلها إلى التاريخ الجديد.`,
                  )
                : text(
                    "screening.scheduling.confirm.delete.body",
                    `This date already has ${confirmation.assignmentCount} assigned entities. Deleting it will return them to awaiting scheduling.`,
                    `هذا التاريخ يحتوي بالفعل على ${confirmation.assignmentCount} كيانات مخصّصة. سيؤدي حذفه إلى إعادتها إلى قائمة انتظار الجدولة.`,
                  )}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmation({ open: false })}
                className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2 text-sm font-semibold text-[var(--app-text)]"
              >
                {text("screening.scheduling.cancel", "Cancel", "إلغاء")}
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmation()}
                className="rounded-xl bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white"
              >
                {text("screening.scheduling.confirm.confirm", "Confirm", "تأكيد")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        closeLabel={closeLabel}
        onClose={() => setToast(emptyToast)}
      />
    </div>
  );
};

export default CapacityManagement;
