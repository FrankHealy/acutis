import { useMemo, useState } from 'react';
import termRatingsData from '../../data/groupTherapyTermsRatings.json';
import termsData from '../../data/groupTherapyTerms.json';
import { User, CheckCircle } from 'lucide-react';

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

const therapyTermRatings = termRatingsData as TherapyTermRating[];
const defaultTherapyTerms = (termsData as TherapyTerm[]).filter((term) => term.ownerId === 'default');
const defaultQuickComments = [
  'Excellent insight',
  'Good participation',
  'Needs encouragement',
  'Struggling with concept',
  'Very emotional response',
  'Defensive attitude',
  'Making progress',
  'Requires follow-up',
];

const GroupTherapySession = () => {
  const [sessionNotes, setSessionNotes] = useState<Record<number, string>>({});
  const [selectedResident, setSelectedResident] = useState<Participant | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState('');
  const [usedComments, setUsedComments] = useState<Set<string>>(() => new Set());
  const [termSearch, setTermSearch] = useState('');
  const [selectedRatingId, setSelectedRatingId] = useState<number | 'all'>('all');

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
      selectedRatingId === 'all'
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

  const activeRating = selectedRatingId === 'all' ? null : ratingLookup.get(selectedRatingId);

  const currentModule = {
    id: 1,
    title: "Step 1: Powerlessness",
    text: "We admitted we were powerless over alcohol - that our lives had become unmanageable. This step is about accepting that we cannot control our drinking and that our attempts to do so have failed. It requires honesty about the extent of our problem and the impact it has had on our lives and relationships.\n\nPowerlessness is one of the most difficult concepts for many people entering recovery to accept. Our society teaches us that we should be in control of our lives, that willpower and determination can overcome any obstacle. For those struggling with addiction, this belief often becomes a source of shame and frustration as repeated attempts to control drinking through willpower alone continue to fail.\n\nThe admission of powerlessness is not an admission of weakness or failure as a person. Rather, it is the recognition of a fundamental truth about the nature of addiction. Alcohol dependency creates changes in brain chemistry and neural pathways that make it extremely difficult, if not impossible, to control drinking through willpower alone. Understanding this can actually be liberating - it removes the burden of self-blame and opens the door to seeking help.\n\nWhen we speak of our lives becoming 'unmanageable,' we're acknowledging the chaos that alcohol has created in various areas of our existence. This might manifest in damaged relationships, where trust has been broken repeatedly through broken promises and alcohol-fueled incidents. Family members may have distanced themselves, friends may have been alienated, and romantic relationships may have deteriorated or ended entirely.\n\nProfessional consequences are often part of this unmanageability. Many people find their work performance declining due to hangovers, missed days, or drinking during work hours. Some lose jobs entirely, while others live in constant fear of being discovered. Financial problems frequently accompany drinking problems, as money that should go toward necessities gets diverted to alcohol, or poor decision-making while intoxicated leads to costly mistakes.\n\nHealth consequences add another layer to the unmanageability. Physical health may deteriorate through poor nutrition, injuries sustained while intoxicated, or the direct effects of alcohol on organs like the liver, heart, and brain. Mental health often suffers as well, with increased anxiety, depression, or other psychological symptoms that may have started the drinking pattern or been exacerbated by it.\n\nLegal troubles can result from drinking and driving, public intoxication, or other alcohol-related offenses. These consequences create additional stress and complications that make life feel even more out of control. The shame and secrecy that often accompany drinking problems can lead to isolation and a sense of living a double life.\n\nPerhaps most significantly, many people find that their values and their actions become increasingly misaligned. They may do things while drinking that go against their fundamental beliefs about how they want to treat others or how they want to live their lives. This internal conflict creates deep psychological distress and contributes to the sense that life has become unmanageable.\n\nThe process of admitting powerlessness often involves grieving. There's a loss involved - the loss of the belief that we can handle this on our own, the loss of alcohol as a coping mechanism, and sometimes the loss of an identity built around being strong and self-reliant. This grief is natural and necessary, and it's important to allow space for these feelings while also recognizing that this admission opens the door to real change and recovery.\n\nAccepting powerlessness over alcohol doesn't mean accepting powerlessness over everything in life. In fact, it often leads to discovering areas where we do have power and choice - in seeking treatment, in building supportive relationships, in developing healthy coping strategies, and in making daily decisions that support our recovery. The paradox of the first step is that by admitting our powerlessness in one specific area, we often find ourselves more empowered in other areas of life than we have been in years.",
    questions: [
      "How did you first realize you were powerless over alcohol?",
      "What does 'unmanageable' mean to you?",
      {
        main: "Can you share an example of when you tried to control your drinking?",
        parts: [
          "What specific strategies or rules did you try to implement?",
          "How long were you able to maintain these strategies?", 
          "What ultimately led to these attempts failing?"
        ]
      },
      "How has admitting powerlessness changed your perspective?",
      "What resistance did you have to accepting this step?"
    ]
  };

  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, firstName: 'Michael', surname: 'Anderson', age: 34, photo: null, hasSpoken: false },
    { id: 2, firstName: 'James', surname: 'Burke', age: 45, photo: null, hasSpoken: true },
    { id: 3, firstName: 'David', surname: 'Casey', age: 28, photo: null, hasSpoken: false },
    { id: 4, firstName: 'John', surname: 'Doyle', age: 52, photo: null, hasSpoken: true },
    { id: 5, firstName: 'Robert', surname: 'Flynn', age: 31, photo: null, hasSpoken: false },
    { id: 6, firstName: 'Thomas', surname: 'Kelly', age: 38, photo: null, hasSpoken: false },
    { id: 7, firstName: 'Patrick', surname: 'Murphy', age: 29, photo: null, hasSpoken: false },
    { id: 8, firstName: 'Sean', surname: 'O\'Brien', age: 41, photo: null, hasSpoken: true },
    { id: 9, firstName: 'Daniel', surname: 'Ryan', age: 35, photo: null, hasSpoken: false },
    { id: 10, firstName: 'Kevin', surname: 'Walsh', age: 48, photo: null, hasSpoken: false },
    { id: 11, firstName: 'Mark', surname: 'Collins', age: 33, photo: null, hasSpoken: true },
    { id: 12, firstName: 'Brian', surname: 'McCarthy', age: 44, photo: null, hasSpoken: false },
    { id: 13, firstName: 'Alan', surname: 'O\'Connor', age: 37, photo: null, hasSpoken: false },
    { id: 14, firstName: 'Paul', surname: 'Fitzgerald', age: 42, photo: null, hasSpoken: false },
    { id: 15, firstName: 'Gary', surname: 'Kennedy', age: 39, photo: null, hasSpoken: true }
  ]);

  const appendNoteLine = (value: string, key: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }

    setCurrentNotes((prev) => {
      const bulletLine = `• ${trimmedValue}`;
      const trimmedPrev = prev.trimEnd();
      return trimmedPrev ? `${trimmedPrev}
${bulletLine}` : bulletLine;
    });

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
    const noteBody = ratingLabel
      ? `${term.term} [${ratingLabel}]: ${term.description}`
      : `${term.term}: ${term.description}`;

    appendNoteLine(noteBody, key);
  };

  const openResidentModal = (resident: Participant) => {
    setSelectedResident(resident);
    setCurrentNotes(sessionNotes[resident.id]?.trimEnd() ?? '');
    setUsedComments(new Set());
    setTermSearch('');
    setSelectedRatingId('all');
  };

  const closeModal = () => {
    setSelectedResident(null);
    setCurrentNotes('');
    setUsedComments(new Set());
    setTermSearch('');
    setSelectedRatingId('all');
  };

  const markAsSpoken = (participantId: number) => {
    setParticipants((prev) =>
      prev.map((participant) =>
        participant.id === participantId ? { ...participant, hasSpoken: true } : participant
      )
    );
  };

  const saveNotes = () => {
    if (!selectedResident) {
      return;
    }

    const sanitizedNotes = currentNotes.trimEnd();

    setSessionNotes((prev) => ({
      ...prev,
      [selectedResident.id]: sanitizedNotes,
    }));

    markAsSpoken(selectedResident.id);
    closeModal();
    alert('Notes saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 max-w-6xl mx-auto">
      {/* Session Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentModule.title}</h1>
        <p className="text-gray-600 text-lg">Group Therapy Morning Session - {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Module Text */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-indigo-800">Module Text</h3>
          <textarea
            readOnly
            value={currentModule.text}
            className="w-full h-80 p-4 border-2 border-gray-200 rounded-xl resize-none text-gray-700 leading-relaxed text-base overflow-y-auto"
          />
        </div>

        {/* Participants Grid */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-indigo-800">Participants</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {participants.map((resident) => (
              <div 
                key={resident.id}
                onClick={() => openResidentModal(resident)}
                className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedResident?.id === resident.id 
                    ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{resident.firstName} {resident.surname}</p>
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
          </div>
        </div>

        {/* Questions Panel */}
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 text-indigo-800">Discussion Questions</h3>
          <div className="space-y-3">
            {currentModule.questions.map((question, index) => (
              <div key={index}>
                {typeof question === 'string' ? (
                  <button
                    onClick={() => setActiveQuestion(question)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      activeQuestion === question 
                        ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-800">{question}</p>
                  </button>
                ) : (
                  <div className="border-2 border-gray-200 rounded-xl p-4">
                    <button
                      onClick={() => setActiveQuestion(question.main)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 mb-3 ${
                        activeQuestion === question.main 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-800">{question.main}</p>
                    </button>
                    <div className="ml-4 space-y-2">
                      {question.parts.map((part, partIndex) => (
                        <button
                          key={partIndex}
                          onClick={() => setActiveQuestion(part)}
                          className={`w-full text-left p-2 rounded-lg border transition-all duration-200 ${
                            activeQuestion === part 
                              ? 'border-indigo-400 bg-indigo-25' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="text-xs text-gray-700">{String.fromCharCode(97 + partIndex)}) {part}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-indigo-800 mb-4">Observation Term Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ratingSummaries.map((summary) => (
            <div
              key={summary.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-gray-800">{summary.label}</p>
                <span className="text-xs font-medium text-indigo-600">
                  {summary.count} terms
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">{summary.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comment Modal */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-indigo-800">
                Comment - {selectedResident.firstName} {selectedResident.surname}
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
                            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-800 border-indigo-200 hover:from-blue-200 hover:to-indigo-200'
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
                    onClick={() => setSelectedRatingId('all')}
                    className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                      selectedRatingId === 'all'
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
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
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {summary.label} ({summary.count})
                      </button>
                    );
                  })}
                </div>

                {activeRating && (
                  <p className="text-[11px] text-gray-500 mb-3">{activeRating.description}</p>
                )}

                <input
                  value={termSearch}
                  onChange={(event) => setTermSearch(event.target.value)}
                  type="text"
                  placeholder="Search by term or description..."
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
                            ? 'border-green-200 bg-green-50 text-green-700 cursor-not-allowed'
                            : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm bg-white'
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
                      No matching terms. Try adjusting your filters.
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-gray-800">Session Notes</h4>
                <textarea
                  value={currentNotes}
                  onChange={(event) => setCurrentNotes(event.target.value)}
                  className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
                  placeholder="Record observations, responses, and notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button 
                type="button"
                onClick={closeModal}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={saveNotes}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:from-indigo-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {activeQuestion && (
        <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl shadow-lg border border-indigo-200 p-6">
          <h3 className="text-lg font-semibold mb-3 text-indigo-800">Active Question</h3>
          <p className="text-gray-700 text-base italic">"{activeQuestion}"</p>
        </div>
      )}
    </div>
  );
};

export default GroupTherapySession;