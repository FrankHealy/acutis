import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: {
      transcript: string;
    };
  }>;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
};

const getDictationErrorMessage = (error?: string) => {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is blocked. Allow microphone access for this site and try again.";
    case "audio-capture":
      return "No microphone was found. Connect or enable a microphone and try again.";
    case "network":
      return "The speech-recognition service is unavailable. Check the network connection and try again.";
    case "language-not-supported":
      return "Irish English dictation is not available in this browser.";
    case "no-speech":
      return "No speech was heard. Try again and speak after the stop icon appears.";
    default:
      return error ? `Dictation stopped: ${error}.` : "Dictation stopped unexpectedly.";
  }
};

export const useSectionDictation = (locale: string) => {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isSupported = Boolean(getSpeechRecognition());

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const clear = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    finalTranscriptRef.current = "";
    setTranscript("");
    setError(null);
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError("Speech recognition is not available in this browser. Type notes into the transcript box instead.");
      return;
    }

    recognitionRef.current?.abort();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = locale || "en-IE";
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let nextFinalTranscript = finalTranscriptRef.current;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const resultTranscript = result[0]?.transcript ?? "";
        if (result.isFinal) {
          nextFinalTranscript = `${nextFinalTranscript} ${resultTranscript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${resultTranscript}`.trim();
        }
      }

      finalTranscriptRef.current = nextFinalTranscript;
      setTranscript([nextFinalTranscript, interimTranscript].filter(Boolean).join(" "));
    };
    recognition.onerror = (event) => {
      setError(getDictationErrorMessage(event.error));
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setError(null);
    try {
      recognition.start();
      setIsListening(true);
    } catch (startError) {
      recognitionRef.current = null;
      setIsListening(false);
      setError(startError instanceof Error ? `Could not start dictation: ${startError.message}` : "Could not start dictation. Try again.");
    }
  }, [locale]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      finalTranscriptRef.current = "";
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    setTranscript,
    start,
    stop,
    clear,
  };
};
