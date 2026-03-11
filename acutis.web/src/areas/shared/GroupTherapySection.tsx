import { useEffect, useMemo, useState } from "react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import termRatingsData from "@/data/groupTherapyTermsRatings.json";
import termsData from "@/data/groupTherapyTerms.json";
import { User, CheckCircle } from "lucide-react";
import { residentService } from "@/services/residentService";
import { type Resident } from "@/services/mockDataService";
import { groupTherapyService, type GroupTherapyProgram } from "@/services/groupTherapyService";
import QuoteOfTheDay from "./QuoteOfTheDay";

type Participant = {
  id: number;
  firstName: string;
  surname: string;
  age: number;
  photo: string | null;
  hasSpoken: boolean;
};

type TherapyTermRating = {
  id: number;
  label: string;
  description: string;
};

type TherapyTerm = {
  id: number;
  term: string;
  description: string;
  ownerId: string;
  ratingId: number;
};

type GroupModule = {
  id: string;
  title: string;
  text: string;
  questions: string[];
};

type GroupTherapySessionProps = {
  initialModuleKey?: string;
  unitId: Resident["unit"];
};

type ResidentRemarkState = {
  noteLines: string[];
  freeText: string;
};

const therapyTermRatings = termRatingsData as TherapyTermRating[];
const defaultTherapyTerms = (termsData as TherapyTerm[]).filter((term) => term.ownerId === "default");
const defaultQuickComments = [
  "Excellent insight",
  "Good participation",
  "Needs encouragement",
  "Struggling with concept",
  "Very emotional response",
  "Defensive attitude",
  "Making progress",
  "Requires follow-up",
];

const PROGRAM_CODE = "bruree_alcohol_gt";
const TOTAL_SESSIONS_PER_WEEK = 9;
const QUESTIONS_PER_SESSION = 3;
const PARTICIPANTS_PER_SESSION = 12;

const GROUP_MODULES: Record<string, GroupModule> = {
  spirituality: {
    id: "spirituality",
    title: "Module: Spirituality",
    text: "This module explores meaning, purpose, and connection in recovery.",
    questions: [],
  },
  change: {
    id: "change",
    title: "Module: Change",
    text: "This module focuses on behavior change as a daily process.",
    questions: [],
  },
  "healing-the-hurts-of-the-past": {
    id: "healing-the-hurts-of-the-past",
    title: "Module: Healing the Hurts of the Past",
    text: "This module creates space for safe reflection on past pain.",
    questions: [],
  },
  "relapse-prevention": {
    id: "relapse-prevention",
    title: "Module: Relapse Prevention",
    text: "This module is practical planning for high-risk situations.",
    questions: [],
  },
  listening: {
    id: "listening",
    title: "Module: Listening",
    text: "This module develops active listening and empathic response in group work.",
    questions: [],
  },
};

const toModuleKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const mapResidentToParticipant = (resident: Resident): Participant => ({
  id: resident.id,
  firstName: resident.firstName,
  surname: resident.surname,
  age: resident.age,
  photo: resident.photo,
  hasSpoken: false,
});

const mapProgramToModules = (program: GroupTherapyProgram): Record<string, GroupModule> =>
  program.weeks.reduce<Record<string, GroupModule>>((acc, week) => {
    const key = toModuleKey(week.topic);
    acc[key] = {
      id: key,
      title: `Module: ${week.topic}`,
      text: week.introText,
      questions: week.days
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .flatMap((day) => day.questions),
    };
    return acc;
  }, {});

const getIsoWeekKey = (date: Date): string => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${target.getUTCFullYear()}-W${weekNo}`;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const pickResidentsForSession = (
  residents: Participant[],
  unitCode: string,
  moduleKey: string,
  sessionNumber: number
): Participant[] => {
  const weekKey = getIsoWeekKey(new Date());
  const sorted = [...residents].sort((a, b) => {
    const aScore = hashString(`${weekKey}:${unitCode}:${moduleKey}:${sessionNumber}:${a.id}`);
    const bScore = hashString(`${weekKey}:${unitCode}:${moduleKey}:${sessionNumber}:${b.id}`);
    return aScore - bScore || a.id - b.id;
  });

  return sorted.slice(0, Math.min(PARTICIPANTS_PER_SESSION, sorted.length));
};

const pickQuestionsForSession = (questions: string[], sessionNumber: number): string[] => {
  if (questions.length === 0) {
    return [];
  }

  const offset = (sessionNumber - 1) * QUESTIONS_PER_SESSION;
  const selected: string[] = [];

  for (let index = 0; index < QUESTIONS_PER_SESSION; index += 1) {
    const question = questions[(offset + index) % questions.length];
    selected.push(question);
  }

  return selected;
};

const GroupTherapySession = ({ initialModuleKey, unitId }: GroupTherapySessionProps) => {
  const { loadKeys, t } = useLocalization();
  const [sessionRemarks, setSessionRemarks] = useState<Record<number, ResidentRemarkState>>({});
  const [selectedResident, setSelectedResident] = useState<Participant | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [currentNoteLines, setCurrentNoteLines] = useState<string[]>([]);
  const [currentFreeText, setCurrentFreeText] = useState("");
  const [usedComments, setUsedComments] = useState<Set<string>>(() => new Set());
  const [termSearch, setTermSearch] = useState("");
  const [selectedRatingId, setSelectedRatingId] = useState<number | "all">("all");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);
  const [modules, setModules] = useState<Record<string, GroupModule>>(GROUP_MODULES);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSessionNumber, setCurrentSessionNumber] = useState(1);

  useEffect(() => {
    void loadKeys([
      "group_therapy.no_module",
      "group_therapy.loading_participants",
      "group_therapy.no_participants",
      "group_therapy.no_questions",
      "group_therapy.observation_search",
      "group_therapy.observation_empty",
      "group_therapy.categorized_notes_placeholder",
      "group_therapy.free_text_placeholder",
      "group_therapy.cancel",
      "group_therapy.saving",
      "group_therapy.save_notes",
      "group_therapy.active_question",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const ratingLookup = useMemo(() => {
    const lookup = new Map<number, TherapyTermRating>();
    therapyTermRatings.forEach((rating) => {
      lookup.set(rating.id, rating);
    });
    return lookup;
  }, []);

  const termsByRating = useMemo(() => {
    const lookup = new Map<number, TherapyTerm[]>();
    therapyTermRatings.forEach((rating) => {
      lookup.set(
        rating.id,
        defaultTherapyTerms.filter((term) => term.ratingId === rating.id)
      );
    });
    return lookup;
  }, []);

  const ratingSummaries = useMemo(
    () =>
      therapyTermRatings.map((rating) => ({
        ...rating,
        count: termsByRating.get(rating.id)?.length ?? 0,
      })),
    [termsByRating]
  );

  const filteredTerms = useMemo(() => {
    const searchValue = termSearch.trim().toLowerCase();
    const baseTerms =
      selectedRatingId === "all"
        ? defaultTherapyTerms
        : termsByRating.get(selectedRatingId) ?? [];

    if (!searchValue) {
      return baseTerms;
    }

    return baseTerms.filter(
      (term) =>
        term.term.toLowerCase().includes(searchValue) ||
        term.description.toLowerCase().includes(searchValue)
    );
  }, [selectedRatingId, termSearch, termsByRating]);

  const activeRating = selectedRatingId === "all" ? null : ratingLookup.get(selectedRatingId);
  const moduleValues = useMemo(() => Object.values(modules), [modules]);

  const currentModule = useMemo(() => {
    if (initialModuleKey && modules[initialModuleKey]) {
      return modules[initialModuleKey];
    }

    if (modules.spirituality) {
      return modules.spirituality;
    }

    return moduleValues[0];
  }, [initialModuleKey, moduleValues, modules]);

  const sessionParticipants = useMemo(() => {
    if (!currentModule) {
      return [];
    }

    return pickResidentsForSession(participants, unitId, currentModule.id, currentSessionNumber);
  }, [currentModule, currentSessionNumber, participants, unitId]);

  const sessionQuestions = useMemo(() => {
    if (!currentModule) {
      return [];
    }

    return pickQuestionsForSession(currentModule.questions, currentSessionNumber);
  }, [currentModule, currentSessionNumber]);

  useEffect(() => {
    let isCancelled = false;

    const loadParticipants = async () => {
      setParticipantsLoading(true);
      try {
        const residents = await residentService.getResidents(unitId);
        if (isCancelled) {
          return;
        }
        setParticipants(residents.map(mapResidentToParticipant));
      } catch {
        if (!isCancelled) {
          setParticipants([]);
        }
      } finally {
        if (!isCancelled) {
          setParticipantsLoading(false);
        }
      }
    };

    loadParticipants();
    return () => {
      isCancelled = true;
    };
  }, [unitId]);

  useEffect(() => {
    let isCancelled = false;

    const loadProgram = async () => {
      try {
        const program = await groupTherapyService.getProgram(unitId, PROGRAM_CODE);
        if (!program || isCancelled) {
          return;
        }

        const apiModules = mapProgramToModules(program);
        if (Object.keys(apiModules).length > 0) {
          setModules((prev) => ({ ...prev, ...apiModules }));
        }
      } catch {
        // Keep local fallback modules when API is unavailable.
      }
    };

    loadProgram();
    return () => {
      isCancelled = true;
    };
  }, [unitId]);

  useEffect(() => {
    if (!currentModule) {
      return;
    }

    let isCancelled = false;

    const loadRemarks = async () => {
      try {
        const remarks = await groupTherapyService.getRemarks(unitId, PROGRAM_CODE, currentModule.id);
        if (isCancelled) {
          return;
        }

        const remarksByResident = remarks.reduce<Record<number, ResidentRemarkState>>((acc, remark) => {
          acc[remark.residentId] = {
            noteLines: remark.noteLines ?? [],
            freeText: remark.freeText ?? "",
          };
          return acc;
        }, {});

        setSessionRemarks(remarksByResident);
        setParticipants((prev) =>
          prev.map((participant) => ({
            ...participant,
            hasSpoken: Boolean(remarksByResident[participant.id]),
          }))
        );
      } catch {
        setSessionRemarks({});
      }
    };

    loadRemarks();
    return () => {
      isCancelled = true;
    };
  }, [currentModule, unitId]);

  useEffect(() => {
    setActiveQuestion(null);
    closeModal();
  }, [currentModule?.id, currentSessionNumber]);

  const appendNoteLine = (value: string, key: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }

    setCurrentNoteLines((prev) => (prev.includes(trimmedValue) ? prev : [...prev, trimmedValue]));
    setUsedComments((prev) => {
      if (prev.has(key)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const handleQuickComment = (comment: string) => {
    const key = `quick-${comment}`;
    if (usedComments.has(key)) {
      return;
    }
    appendNoteLine(comment, key);
  };

  const handleTermClick = (term: TherapyTerm) => {
    const key = `term-${term.id}`;
    if (usedComments.has(key)) {
      return;
    }

    const ratingLabel = ratingLookup.get(term.ratingId)?.label;
    const line = ratingLabel ? `${term.term} [${ratingLabel}]: ${term.description}` : `${term.term}: ${term.description}`;
    appendNoteLine(line, key);
  };

  const openResidentModal = (resident: Participant) => {
    setSelectedResident(resident);
    const saved = sessionRemarks[resident.id];
    setCurrentNoteLines(saved?.noteLines ?? []);
    setCurrentFreeText(saved?.freeText ?? "");
    setUsedComments(new Set());
    setTermSearch("");
    setSelectedRatingId("all");
  };

  const closeModal = () => {
    setSelectedResident(null);
    setCurrentNoteLines([]);
    setCurrentFreeText("");
    setUsedComments(new Set());
    setTermSearch("");
    setSelectedRatingId("all");
  };

  const markAsSpoken = (participantId: number) => {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === participantId ? { ...participant, hasSpoken: true } : participant
      )
    );
  };

  const saveNotes = async () => {
    if (!selectedResident || !currentModule) {
      return;
    }

    setIsSaving(true);
    try {
      const saved = await groupTherapyService.upsertRemark({
        unitId,
        programCode: PROGRAM_CODE,
        residentId: selectedResident.id,
        moduleKey: currentModule.id,
        noteLines: currentNoteLines,
        freeText: currentFreeText,
      });

      setSessionRemarks((prev) => ({
        ...prev,
        [selectedResident.id]: {
          noteLines: saved.noteLines ?? [],
          freeText: saved.freeText ?? "",
        },
      }));

      markAsSpoken(selectedResident.id);
      closeModal();
      alert(text("group_therapy.save_notes", "Save Notes"));
    } catch {
      alert("Failed to save notes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentModule) {
    return <div className="p-6 text-sm text-gray-600">{text("group_therapy.no_module", "No group therapy module is available.")}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <QuoteOfTheDay unitId={unitId} />
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentModule.title}</h1>
        <p className="text-gray-600 text-lg">Group Therapy Morning Session - {new Date().toLocaleDateString()}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: TOTAL_SESSIONS_PER_WEEK }, (_, index) => index + 1).map((sessionNumber) => {
            const isActive = currentSessionNumber === sessionNumber;
            return (
              <button
                key={sessionNumber}
                type="button"
                onClick={() => setCurrentSessionNumber(sessionNumber)}
                className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                Session {sessionNumber}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-indigo-800">Module Text</h3>
          <textarea
            readOnly
            value={currentModule.text}
            className="w-full h-80 p-4 border-2 border-gray-200 rounded-xl resize-none text-gray-700 leading-relaxed text-base overflow-y-auto"
          />
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-indigo-800">Participants</h3>
          {participantsLoading ? (
            <p className="text-sm text-gray-500">{text("group_therapy.loading_participants", "Loading participants from API...")}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {sessionParticipants.map((resident) => (
                <div
                  key={resident.id}
                  onClick={() => openResidentModal(resident)}
                  className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedResident?.id === resident.id
                      ? "border-indigo-500 bg-indigo-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
                    {resident.photo ? (
                      <img src={resident.photo} alt={`${resident.firstName} ${resident.surname}`} className="h-10 w-10 object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {resident.firstName} {resident.surname}
                    </p>
                    <div className="flex items-center mt-1">
                      {resident.hasSpoken ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600 font-medium">Spoke</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full border border-gray-400 mr-1"></div>
                          <span className="text-xs text-gray-400">Not yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {sessionParticipants.length === 0 && (
                <div className="col-span-full text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
                  {text("group_therapy.no_participants", "No participants found for unit")} <span className="font-semibold">{unitId}</span>.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-indigo-800">Discussion Questions</h3>
          <div className="space-y-3">
            {sessionQuestions.map((question, index) => (
              <button
                key={`${question}-${index}`}
                onClick={() => setActiveQuestion(question)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  activeQuestion === question
                    ? "border-indigo-500 bg-indigo-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <p className="text-sm font-medium text-gray-800">{question}</p>
              </button>
            ))}
            {sessionQuestions.length === 0 && (
              <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
                {text("group_therapy.no_questions", "No questions available for this session.")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4">Observation Term Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ratingSummaries.map((summary) => (
            <div key={summary.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-gray-800">{summary.label}</p>
                <span className="text-xs font-medium text-indigo-600">{summary.count} terms</span>
              </div>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">{summary.description}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedResident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-indigo-800">
                Notes - {selectedResident.firstName} {selectedResident.surname}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-gray-800">Quick Comments</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {defaultQuickComments.map((comment) => {
                    const key = `quick-${comment}`;
                    const isUsed = usedComments.has(key);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleQuickComment(comment)}
                        disabled={isUsed}
                        className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                          isUsed
                            ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 border-indigo-200 hover:from-blue-200 hover:to-indigo-200"
                        }`}
                      >
                        <span>{comment}</span>
                        {isUsed && <CheckCircle className="inline ml-1 h-3 w-3 text-green-600" />}
                      </button>
                    );
                  })}
                </div>

                <h4 className="font-semibold mb-2 text-gray-800">Observation Library</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Filter and insert behavioural terms with pre-written context.
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRatingId("all")}
                    className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                      selectedRatingId === "all"
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    All Ratings ({defaultTherapyTerms.length})
                  </button>
                  {ratingSummaries.map((summary) => {
                    const isActive = selectedRatingId === summary.id;
                    return (
                      <button
                        key={summary.id}
                        type="button"
                        onClick={() => setSelectedRatingId(summary.id)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-500 text-white border-indigo-500"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        {summary.label} ({summary.count})
                      </button>
                    );
                  })}
                </div>

                {activeRating && <p className="text-[11px] text-gray-500 mb-3">{activeRating.description}</p>}

                <input
                  value={termSearch}
                  onChange={(event) => setTermSearch(event.target.value)}
                  type="text"
                  placeholder={text("group_therapy.observation_search", "Search by term or description...")}
                  className="w-full mb-3 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {filteredTerms.map((term) => {
                    const key = `term-${term.id}`;
                    const isUsed = usedComments.has(key);
                    const rating = ratingLookup.get(term.ratingId);

                    return (
                      <button
                        key={term.id}
                        type="button"
                        onClick={() => handleTermClick(term)}
                        disabled={isUsed}
                        className={`text-left border-2 rounded-lg p-3 transition ${
                          isUsed
                            ? "border-green-200 bg-green-50 text-green-700 cursor-not-allowed"
                            : "border-gray-200 hover:border-indigo-300 hover:shadow-sm bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{term.term}</p>
                            <p className="text-xs text-gray-600 mt-1 leading-snug">{term.description}</p>
                          </div>
                          {isUsed && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                        </div>
                        {rating && (
                          <span className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-wide text-indigo-700 bg-indigo-100 border border-indigo-200 rounded-full px-2 py-1">
                            {rating.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {filteredTerms.length === 0 && (
                    <div className="col-span-full text-center text-sm text-gray-500 py-6 border-2 border-dashed border-gray-200 rounded-lg">
                      {text("group_therapy.observation_empty", "No matching terms. Try adjusting your filters.")}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800">Categorized Notes</h4>
                  <textarea
                    readOnly
                    value={currentNoteLines.map((line) => `- ${line}`).join("\n")}
                    className="w-full h-36 p-3 border-2 border-gray-200 rounded-xl text-sm text-gray-700 resize-none bg-gray-50"
                    placeholder={text("group_therapy.categorized_notes_placeholder", "Use quick comments and observation terms to build categorized notes.")}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Terms/comments selected from the left are stored as structured note lines.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800">Free Text Note</h4>
                  <textarea
                    value={currentFreeText}
                    onChange={(event) => setCurrentFreeText(event.target.value)}
                    className="w-full h-44 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                    placeholder={text("group_therapy.free_text_placeholder", "Add clinician free text for context, detail, and follow-up...")}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold"
              >
                {text("group_therapy.cancel", "Cancel")}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={saveNotes}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg disabled:opacity-60"
              >
                {isSaving ? text("group_therapy.saving", "Saving...") : text("group_therapy.save_notes", "Save Notes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeQuestion && (
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-lg border border-indigo-200 p-6">
          <h3 className="text-lg font-semibold mb-3 text-indigo-800">{text("group_therapy.active_question", "Active Question")}</h3>
          <p className="text-gray-700 text-base italic">&quot;{activeQuestion}&quot;</p>
        </div>
      )}
    </div>
  );
};

export default GroupTherapySession;
