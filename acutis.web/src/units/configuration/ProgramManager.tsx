"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardCheck,
  Plus,
  Trash2,
  CheckCircle2,
  FileEdit,
  Layers,
  PlayCircle,
  HelpCircle,
  GripVertical,
  CornerDownLeft,
} from "lucide-react";

type UnitId = "Alcohol" | "Detox" | "Drugs" | "Ladies";
type ProgramStatus = "draft" | "active";

type SessionMedia = {
  id: string;
  type: "video" | "animation" | "audio" | "image" | "link";
  label: string;
  url?: string;
};

type Session = {
  id: string;
  title: string;
  content: string;
  questions: string[];
  discussionPoints: string[];
  media: SessionMedia[];
};

type Topic = {
  id: string;
  title: string;
  sessions: Session[];
};

type Program = {
  id: string;
  name: string;
  unit: UnitId;
  status: ProgramStatus;
  description: string;
  topicIds: string[];
};

const Units: UnitId[] = ["Alcohol", "Detox", "Drugs", "Ladies"];

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const buildInitialTopics = (): Topic[] => [
  {
    id: "topic-01",
    title: "Accountability & Structure",
    sessions: [
      {
        id: "session-01",
        title: "Morning Intentions",
        content: "Introduce daily reflection and commitment to goals.",
        questions: ["What is one intention you can keep today?", "Who will you ask for support?"],
        discussionPoints: ["Consistency builds trust", "Shared accountability"],
        media: [{ id: "media-01", type: "video", label: "Short intro video", url: "" }],
      },
    ],
  },
  {
    id: "topic-02",
    title: "Relapse Prevention",
    sessions: [],
  },
];

const buildInitialPrograms = (): Program[] => [
  {
    id: "program-01",
    name: "Foundations of Recovery",
    unit: "Alcohol",
    status: "active",
    description: "Core program covering daily practices, accountability, and group reflection.",
    topicIds: ["topic-01"],
  },
  {
    id: "program-02",
    name: "Renewal Pathway",
    unit: "Detox",
    status: "draft",
    description: "Gentle program with guided reflection and step-based recovery sessions.",
    topicIds: [],
  },
];

const ProgramManager: React.FC = () => {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(() => buildInitialTopics());
  const [programs, setPrograms] = useState<Program[]>(() => buildInitialPrograms());
  const [selectedId, setSelectedId] = useState(programs[0]?.id ?? "");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(topics[0]?.id ?? null);
  const [topicFilter, setTopicFilter] = useState("");

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === selectedId) ?? programs[0],
    [programs, selectedId],
  );

  const filteredTopics = useMemo(() => {
    if (!topicFilter.trim()) return topics;
    const needle = topicFilter.toLowerCase();
    return topics.filter((topic) => topic.title.toLowerCase().includes(needle));
  }, [topics, topicFilter]);

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) ?? topics[0],
    [topics, selectedTopicId],
  );

  const updateProgram = (updater: (program: Program) => Program) => {
    if (!selectedProgram) return;
    setPrograms((prev) =>
      prev.map((program) => (program.id === selectedProgram.id ? updater(program) : program)),
    );
  };

  const updateTopic = (topicId: string, updater: (topic: Topic) => Topic) => {
    setTopics((prev) => prev.map((topic) => (topic.id === topicId ? updater(topic) : topic)));
  };

  const updateSession = (topicId: string, sessionId: string, updater: (session: Session) => Session) => {
    updateTopic(topicId, (topic) => ({
      ...topic,
      sessions: topic.sessions.map((session) => (session.id === sessionId ? updater(session) : session)),
    }));
  };

  const addProgram = () => {
    const id = makeId("program");
    const newProgram: Program = {
      id,
      name: "New Recovery Program",
      unit: "Alcohol",
      status: "draft",
      description: "",
      topicIds: [],
    };
    setPrograms((prev) => [...prev, newProgram]);
    setSelectedId(id);
  };

  const deleteProgram = (programId: string) => {
    setPrograms((prev) => {
      const next = prev.filter((program) => program.id !== programId);
      if (selectedId === programId) {
        setSelectedId(next[0]?.id ?? "");
      }
      return next;
    });
  };

  const setProgramStatus = (programId: string, status: ProgramStatus) => {
    setPrograms((prev) =>
      prev.map((program) => {
        if (program.id === programId) {
          return { ...program, status };
        }
        if (status === "active") {
          const target = prev.find((item) => item.id === programId);
          if (target && program.unit === target.unit) {
            return { ...program, status: "draft" };
          }
        }
        return program;
      }),
    );
  };

  const addTopic = () => {
    const id = makeId("topic");
    setTopics((prev) => [...prev, { id, title: "New Topic", sessions: [] }]);
    setSelectedTopicId(id);
  };

  const deleteTopic = (topicId: string) => {
    setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
    setPrograms((prev) =>
      prev.map((program) => ({
        ...program,
        topicIds: program.topicIds.filter((id) => id !== topicId),
      })),
    );
    if (selectedTopicId === topicId) {
      setSelectedTopicId(topics.find((topic) => topic.id !== topicId)?.id ?? null);
    }
  };

  const addSession = (topicId: string) => {
    updateTopic(topicId, (topic) => ({
      ...topic,
      sessions: [
        ...topic.sessions,
        {
          id: makeId("session"),
          title: "New Session",
          content: "",
          questions: [],
          discussionPoints: [],
          media: [],
        },
      ],
    }));
  };

  const deleteSession = (topicId: string, sessionId: string) => {
    updateTopic(topicId, (topic) => ({
      ...topic,
      sessions: topic.sessions.filter((session) => session.id !== sessionId),
    }));
  };

  const addListItem = (
    topicId: string,
    sessionId: string,
    field: "questions" | "discussionPoints",
  ) => {
    updateSession(topicId, sessionId, (session) => ({
      ...session,
      [field]: [...session[field], ""],
    }));
  };

  const updateListItem = (
    topicId: string,
    sessionId: string,
    field: "questions" | "discussionPoints",
    index: number,
    value: string,
  ) => {
    updateSession(topicId, sessionId, (session) => ({
      ...session,
      [field]: session[field].map((item, idx) => (idx === index ? value : item)),
    }));
  };

  const removeListItem = (
    topicId: string,
    sessionId: string,
    field: "questions" | "discussionPoints",
    index: number,
  ) => {
    updateSession(topicId, sessionId, (session) => ({
      ...session,
      [field]: session[field].filter((_, idx) => idx !== index),
    }));
  };

  const addMedia = (topicId: string, sessionId: string) => {
    updateSession(topicId, sessionId, (session) => ({
      ...session,
      media: [...session.media, { id: makeId("media"), type: "video", label: "", url: "" }],
    }));
  };

  const updateMedia = (
    topicId: string,
    sessionId: string,
    mediaId: string,
    field: keyof SessionMedia,
    value: string,
  ) => {
    updateSession(topicId, sessionId, (session) => ({
      ...session,
      media: session.media.map((item) => (item.id === mediaId ? { ...item, [field]: value } : item)),
    }));
  };

  const removeMedia = (topicId: string, sessionId: string, mediaId: string) => {
    updateSession(topicId, sessionId, (session) => ({
      ...session,
      media: session.media.filter((item) => item.id !== mediaId),
    }));
  };

  const ensureTopicInProgram = (topicId: string) => {
    updateProgram((program) =>
      program.topicIds.includes(topicId)
        ? program
        : { ...program, topicIds: [...program.topicIds, topicId] },
    );
  };

  const removeTopicFromProgram = (topicId: string) => {
    updateProgram((program) => ({
      ...program,
      topicIds: program.topicIds.filter((id) => id !== topicId),
    }));
  };

  const moveTopic = (topicIds: string[], draggedId: string, targetId: string | null) => {
    const next = topicIds.filter((id) => id !== draggedId);
    if (!targetId) {
      next.push(draggedId);
      return next;
    }
    const targetIndex = next.indexOf(targetId);
    if (targetIndex === -1) {
      next.push(draggedId);
      return next;
    }
    next.splice(targetIndex, 0, draggedId);
    return next;
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, payload: Record<string, string>) => {
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleProgramDrop = (
    event: React.DragEvent<HTMLDivElement>,
    targetId: string | null,
  ) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData("application/json");
    if (!raw) return;
    const payload = JSON.parse(raw) as { type: "library" | "program"; id: string };
    if (!payload?.id || !selectedProgram) return;

    if (payload.type === "library") {
      updateProgram((program) => ({
        ...program,
        topicIds: program.topicIds.includes(payload.id)
          ? program.topicIds
          : targetId
            ? moveTopic([...program.topicIds, payload.id], payload.id, targetId)
            : [...program.topicIds, payload.id],
      }));
      return;
    }

    if (payload.type === "program") {
      updateProgram((program) => ({
        ...program,
        topicIds: moveTopic(program.topicIds, payload.id, targetId),
      }));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  if (!selectedProgram) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-gray-500">No programs available.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/configuration")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Configuration</span>
          </button>
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-7 w-7 text-gray-700" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Program Manager</h1>
              <p className="text-gray-600">Design recovery programmes by unit and topic.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr_2fr]">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Programmes</h2>
              <button
                onClick={addProgram}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
            <div className="space-y-2">
              {programs.map((program) => (
                <button
                  key={program.id}
                  onClick={() => setSelectedId(program.id)}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                    program.id === selectedProgram.id
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{program.name}</p>
                      <p className="text-xs text-gray-500">{program.unit} Unit</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        program.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {program.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 h-fit">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <input
                  value={selectedProgram.name}
                  onChange={(event) =>
                    updateProgram((program) => ({ ...program, name: event.target.value }))
                  }
                  className="w-full text-xl font-semibold text-gray-900 border border-transparent focus:border-blue-200 rounded-lg px-2 py-1"
                />
                <textarea
                  value={selectedProgram.description}
                  onChange={(event) =>
                    updateProgram((program) => ({ ...program, description: event.target.value }))
                  }
                  placeholder="Describe the purpose and outcomes for this programme."
                  className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 min-h-[80px]"
                />
                <div className="flex flex-wrap gap-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Unit
                    <select
                      value={selectedProgram.unit}
                      onChange={(event) =>
                        updateProgram((program) => ({
                          ...program,
                          unit: event.target.value as UnitId,
                        }))
                      }
                      className="mt-1 block rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                    >
                      {Units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => setProgramStatus(selectedProgram.id, "draft")}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                          selectedProgram.status === "draft"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <FileEdit className="h-4 w-4 inline mr-1" />
                        Draft
                      </button>
                      <button
                        onClick={() => setProgramStatus(selectedProgram.id, "active")}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                          selectedProgram.status === "active"
                            ? "bg-green-600 text-white"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4 inline mr-1" />
                        Active
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={() => deleteProgram(selectedProgram.id)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Delete programme
              </button>
            </div>

            <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
              Drag topics from the library or reorder the list below. Only the topics referenced
              here appear in the programme.
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Topics in this programme</h3>
              <div
                className="space-y-2 min-h-[120px]"
                onDrop={(event) => handleProgramDrop(event, null)}
                onDragOver={handleDragOver}
              >
                {selectedProgram.topicIds.length === 0 ? (
                  <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg p-4">
                    Drop topics here to add them.
                  </div>
                ) : (
                  selectedProgram.topicIds.map((topicId) => {
                    const topic = topics.find((item) => item.id === topicId);
                    if (!topic) return null;
                    return (
                      <div
                        key={topicId}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, { type: "program", id: topicId })
                        }
                        onDrop={(event) => handleProgramDrop(event, topicId)}
                        onDragOver={handleDragOver}
                        className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 cursor-grab"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-semibold text-gray-900">{topic.title}</p>
                            <p className="text-xs text-gray-500">{topic.sessions.length} sessions</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTopicFromProgram(topicId)}
                          className="text-gray-400 hover:text-red-500"
                          title="Remove from programme"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-500" />
                Topic Library
              </h2>
              <button
                onClick={addTopic}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add topic
              </button>
            </div>

            <input
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value)}
              placeholder="Filter topics"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />

            {filteredTopics.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                No topics found.
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                {filteredTopics.map((topic) => {
                  const inProgram = selectedProgram.topicIds.includes(topic.id);
                  return (
                    <div
                      key={topic.id}
                      draggable
                      onDragStart={(event) => handleDragStart(event, { type: "library", id: topic.id })}
                      className={`rounded-lg border px-3 py-3 text-sm cursor-grab ${
                        inProgram ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => setSelectedTopicId(topic.id)}
                          className="text-left"
                        >
                          <p className="font-semibold text-gray-900">{topic.title}</p>
                          <p className="text-xs text-gray-500">{topic.sessions.length} sessions</p>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              inProgram ? removeTopicFromProgram(topic.id) : ensureTopicInProgram(topic.id)
                            }
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              inProgram ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {inProgram ? "In programme" : "Add"}
                          </button>
                          <button
                            onClick={() => deleteTopic(topic.id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Delete topic"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedTopic ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Topic editor</p>
                    <p className="text-xs text-gray-500">Editing one topic at a time keeps the view fast.</p>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <CornerDownLeft className="h-3 w-3" />
                    {selectedTopic.sessions.length} sessions
                  </div>
                </div>

                <input
                  value={selectedTopic.title}
                  onChange={(event) =>
                    updateTopic(selectedTopic.id, (current) => ({ ...current, title: event.target.value }))
                  }
                  className="text-lg font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
                />

                <div className="space-y-4">
                  {selectedTopic.sessions.map((session) => (
                    <div key={session.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <input
                          value={session.title}
                          onChange={(event) =>
                            updateSession(selectedTopic.id, session.id, (current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          className="text-base font-semibold text-gray-900 border border-transparent focus:border-blue-200 rounded-lg px-2 py-1 w-full"
                        />
                        <button
                          onClick={() => deleteSession(selectedTopic.id, session.id)}
                          className="text-gray-400 hover:text-red-500 ml-3"
                          title="Delete session"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <label className="block text-sm text-gray-600">
                        Session text
                        <textarea
                          value={session.content}
                          onChange={(event) =>
                            updateSession(selectedTopic.id, session.id, (current) => ({
                              ...current,
                              content: event.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[90px]"
                        />
                      </label>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                              <HelpCircle className="h-4 w-4 text-gray-400" />
                              Questions
                            </span>
                            <button
                              onClick={() => addListItem(selectedTopic.id, session.id, "questions")}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                              + Add
                            </button>
                          </div>
                          {session.questions.length === 0 ? (
                            <p className="text-xs text-gray-400">No questions yet.</p>
                          ) : (
                            session.questions.map((question, index) => (
                              <div key={`${session.id}-q-${index}`} className="flex items-center gap-2">
                                <input
                                  value={question}
                                  onChange={(event) =>
                                    updateListItem(
                                      selectedTopic.id,
                                      session.id,
                                      "questions",
                                      index,
                                      event.target.value,
                                    )
                                  }
                                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                />
                                <button
                                  onClick={() => removeListItem(selectedTopic.id, session.id, "questions", index)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                              <PlayCircle className="h-4 w-4 text-gray-400" />
                              Discussion points
                            </span>
                            <button
                              onClick={() => addListItem(selectedTopic.id, session.id, "discussionPoints")}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                            >
                              + Add
                            </button>
                          </div>
                          {session.discussionPoints.length === 0 ? (
                            <p className="text-xs text-gray-400">No discussion points yet.</p>
                          ) : (
                            session.discussionPoints.map((point, index) => (
                              <div key={`${session.id}-d-${index}`} className="flex items-center gap-2">
                                <input
                                  value={point}
                                  onChange={(event) =>
                                    updateListItem(
                                      selectedTopic.id,
                                      session.id,
                                      "discussionPoints",
                                      index,
                                      event.target.value,
                                    )
                                  }
                                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                />
                                <button
                                  onClick={() =>
                                    removeListItem(selectedTopic.id, session.id, "discussionPoints", index)
                                  }
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">Multimedia</span>
                          <button
                            onClick={() => addMedia(selectedTopic.id, session.id)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            + Add media
                          </button>
                        </div>
                        {session.media.length === 0 ? (
                          <p className="text-xs text-gray-400">No multimedia linked.</p>
                        ) : (
                          session.media.map((media) => (
                            <div key={media.id} className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
                              <select
                                value={media.type}
                                onChange={(event) =>
                                  updateMedia(selectedTopic.id, session.id, media.id, "type", event.target.value)
                                }
                                className="rounded-lg border border-gray-200 px-2 py-2 text-sm"
                              >
                                {['video', 'animation', 'audio', 'image', 'link'].map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <input
                                value={media.label}
                                onChange={(event) =>
                                  updateMedia(selectedTopic.id, session.id, media.id, "label", event.target.value)
                                }
                                placeholder="Label"
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                              />
                              <button
                                onClick={() => removeMedia(selectedTopic.id, session.id, media.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <input
                                value={media.url ?? ""}
                                onChange={(event) =>
                                  updateMedia(selectedTopic.id, session.id, media.id, "url", event.target.value)
                                }
                                placeholder="URL (optional)"
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm sm:col-span-2"
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addSession(selectedTopic.id)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add session
                </button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                Select a topic to edit sessions.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProgramManager;
