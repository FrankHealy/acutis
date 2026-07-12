import type { AmbulatoryProgramme } from "@/services/ambulatoryService";

export type AmbulatoryIconKey =
  | "assessment"
  | "calendar"
  | "care-plan"
  | "location"
  | "meeting"
  | "participant"
  | "programme"
  | "report"
  | "therapy"
  | "video";

export type AmbulatoryQuickLinkKey =
  | "today"
  | "new-appointment"
  | "start-remote"
  | "report"
  | "assessment"
  | "programmes";

export type AmbulatoryLocalConfig = {
  programme: AmbulatoryProgramme;
  titleKey: string;
  eyebrowKey: string;
  participantLabelKey: string;
  accent: "community" | "practitioner";
  primaryClass: string;
  selectedClass: string;
  badgeClass: string;
  calendar: {
    defaultMode: "day" | "work-week" | "week" | "month";
    workWeekDays: number;
    startHour: number;
    endHour: number;
    slotMinutes: number;
  };
  quickLinks: Array<{
    key: AmbulatoryQuickLinkKey;
    labelKey: string;
    icon: AmbulatoryIconKey;
  }>;
};

export const ambulatoryLocalConfigs: Record<AmbulatoryProgramme, AmbulatoryLocalConfig> = {
  community: {
    programme: "community",
    titleKey: "ambulatory.community.title",
    eyebrowKey: "ambulatory.community.eyebrow",
    participantLabelKey: "ambulatory.community.participant_label",
    accent: "community",
    primaryClass: "bg-cyan-700 hover:bg-cyan-800",
    selectedClass: "border-cyan-500 bg-cyan-50 text-cyan-800",
    badgeClass: "border-cyan-200 text-cyan-800",
    calendar: {
      defaultMode: "work-week",
      workWeekDays: 5,
      startHour: 8,
      endHour: 19,
      slotMinutes: 30,
    },
    quickLinks: [
      { key: "today", labelKey: "ambulatory.quick.today", icon: "calendar" },
      { key: "new-appointment", labelKey: "ambulatory.quick.new_appointment", icon: "calendar" },
      { key: "assessment", labelKey: "ambulatory.quick.assessment", icon: "assessment" },
      { key: "report", labelKey: "ambulatory.quick.report", icon: "report" },
      { key: "programmes", labelKey: "ambulatory.quick.programmes", icon: "programme" },
    ],
  },
  practitioner: {
    programme: "practitioner",
    titleKey: "ambulatory.practitioner.title",
    eyebrowKey: "ambulatory.practitioner.eyebrow",
    participantLabelKey: "ambulatory.practitioner.participant_label",
    accent: "practitioner",
    primaryClass: "bg-indigo-700 hover:bg-indigo-800",
    selectedClass: "border-indigo-500 bg-indigo-50 text-indigo-800",
    badgeClass: "border-indigo-200 text-indigo-800",
    calendar: {
      defaultMode: "work-week",
      workWeekDays: 5,
      startHour: 8,
      endHour: 19,
      slotMinutes: 30,
    },
    quickLinks: [
      { key: "today", labelKey: "ambulatory.quick.today", icon: "calendar" },
      { key: "new-appointment", labelKey: "ambulatory.quick.new_appointment", icon: "calendar" },
      { key: "start-remote", labelKey: "ambulatory.quick.start_remote", icon: "video" },
      { key: "assessment", labelKey: "ambulatory.quick.assessment", icon: "assessment" },
      { key: "report", labelKey: "ambulatory.quick.report", icon: "report" },
      { key: "programmes", labelKey: "ambulatory.quick.programmes", icon: "programme" },
    ],
  },
};

export const ambulatoryLocalTranslations: Record<string, string> = {
  "ambulatory.community.title": "Acutis Community",
  "ambulatory.community.eyebrow": "Community recovery",
  "ambulatory.community.participant_label": "Service User",
  "ambulatory.practitioner.title": "Acutis Practitioner",
  "ambulatory.practitioner.eyebrow": "Private practice",
  "ambulatory.practitioner.participant_label": "Participant",
  "ambulatory.quick.today": "Today",
  "ambulatory.quick.new_appointment": "New Appointment",
  "ambulatory.quick.start_remote": "Start Remote",
  "ambulatory.quick.assessment": "Assessment",
  "ambulatory.quick.report": "Report",
  "ambulatory.quick.programmes": "Programmes",
  "ambulatory.metric.appointments_today": "Appointments Today",
  "ambulatory.metric.in_office": "In Office",
  "ambulatory.metric.outreach": "Outreach",
  "ambulatory.metric.reports_due": "Reports Due",
  "ambulatory.calendar.title": "Schedule",
  "ambulatory.calendar.today": "Today",
  "ambulatory.calendar.new_appointment": "Appointment",
  "ambulatory.agenda.title": "Today",
  "ambulatory.agenda.subtitle": "Sessions, outreach and report work for the selected day.",
  "ambulatory.caseload.title": "Caseload",
  "ambulatory.programmes.title": "Programmes",
  "ambulatory.service_users.title": "Service Users",
  "ambulatory.service_users.start_date": "Start Date",
  "ambulatory.service_users.next_appointment_date": "Next Appointment Date",
  "ambulatory.service_users.tbc": "TBC",
  "ambulatory.service_users.sort_ascending": "Sort ascending",
  "ambulatory.service_users.sort_descending": "Sort descending",
  "ambulatory.service_users.back": "Back to Service Users",
  "ambulatory.service_users.full_details": "Full details",
  "ambulatory.service_users.therapy_history": "Therapy history",
  "ambulatory.service_users.care_plan_history": "Care plan history",
  "ambulatory.calendar.previous": "Previous",
  "ambulatory.calendar.next": "Next",
  "ambulatory.calendar.day": "Day",
  "ambulatory.calendar.work_week": "{{count}} Day",
  "ambulatory.calendar.month": "Month",
  "ambulatory.calendar.time": "Time",
};
