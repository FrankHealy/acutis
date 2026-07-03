import * as ImagePicker from "expo-image-picker";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useMemo, useRef, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { t } from "../../i18n";
import { colors, spacing } from "../../theme/tokens";

const DICTATION_LOCALE = "en-IE";
const ANDROID_ON_DEVICE_SPEECH_SERVICE = "com.google.android.as";

type Point = { x: number; y: number; pressure?: number; capturedAt: number };
export type SignatureStroke = Point[];

type DictationNotesProps = {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  placeholder?: string;
};

type PhotoCaptureProps = {
  uri?: string | null;
  onChange: (uri: string | null) => void;
};

type SignaturePadProps = {
  strokes: SignatureStroke[];
  onChange: (strokes: SignatureStroke[]) => void;
};

export function DictationNotes({ value, onChange, title, placeholder }: DictationNotesProps) {
  const [recognizing, setRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSpeechRecognitionEvent("start", () => {
    setError(null);
    setRecognizing(true);
  });
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("error", (event) => {
    setRecognizing(false);
    setError(event.message || event.error);
  });
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript?.trim();
    if (!transcript) return;
    onChange(value.trim() ? `${value.trim()}\n${transcript}` : transcript);
  });

  const ensureOfflineDictationReady = async () => {
    if (Platform.OS !== "android") {
      return true;
    }

    if (!ExpoSpeechRecognitionModule.supportsOnDeviceRecognition()) {
      setError(t("admissions.capture.offlineDictationUnavailable", "On-device dictation is not available on this tablet."));
      return false;
    }

    try {
      const locales = await ExpoSpeechRecognitionModule.getSupportedLocales({
        androidRecognitionServicePackage: ANDROID_ON_DEVICE_SPEECH_SERVICE,
      });
      const installedLocales = locales.installedLocales.map((locale) => locale.toLowerCase());

      if (installedLocales.includes(DICTATION_LOCALE.toLowerCase())) {
        return true;
      }

      await ExpoSpeechRecognitionModule.androidTriggerOfflineModelDownload({
        locale: DICTATION_LOCALE,
      });
      setError(t("admissions.capture.offlineDictationDownload", "Irish English dictation is being prepared on this tablet. Try dictation again once the language pack finishes installing."));
      return false;
    } catch {
      setError(t("admissions.capture.offlineDictationUnavailable", "On-device dictation is not available on this tablet."));
      return false;
    }
  };

  const startDictation = async () => {
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError(t("admissions.capture.dictationDenied", "Microphone permission is required for dictation."));
      return;
    }

    const offlineReady = await ensureOfflineDictationReady();
    if (!offlineReady) {
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: DICTATION_LOCALE,
      interimResults: false,
      continuous: false,
      addsPunctuation: true,
      requiresOnDeviceRecognition: Platform.OS === "android",
      androidRecognitionServicePackage: Platform.OS === "android" ? ANDROID_ON_DEVICE_SPEECH_SERVICE : undefined,
      androidIntentOptions: Platform.OS === "android"
        ? {
            EXTRA_LANGUAGE_MODEL: "free_form",
            EXTRA_PREFER_OFFLINE: true,
            EXTRA_SECURE: true,
          }
        : undefined,
    });
  };

  return (
    <View style={styles.captureBlock}>
      <View style={styles.captureHeader}>
        <Text style={styles.captureTitle}>{title ?? t("admissions.capture.dictationTitle", "Admission Notes")}</Text>
        <Pressable
          onPress={() => recognizing ? ExpoSpeechRecognitionModule.stop() : void startDictation()}
          style={[styles.captureButton, recognizing ? styles.captureButtonActive : null]}
        >
          <Text style={[styles.captureButtonText, recognizing ? styles.captureButtonTextActive : null]}>
            {recognizing ? t("admissions.capture.stopDictation", "Stop") : t("admissions.capture.startDictation", "Dictate")}
          </Text>
        </Pressable>
      </View>
      <TextInput
        multiline
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? t("admissions.capture.notesPlaceholder", "Type or dictate arrival notes, risks and immediate needs.")}
        style={styles.notesInput}
        textAlignVertical="top"
      />
      {error ? <Text style={styles.captureError}>{error}</Text> : null}
    </View>
  );
}

export function PhotoCapture({ uri, onChange }: PhotoCaptureProps) {
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.72,
      allowsEditing: false,
    });

    if (!result.canceled) {
      onChange(result.assets[0]?.uri ?? null);
    }
  };

  return (
    <View style={styles.captureBlock}>
      <View style={styles.captureHeader}>
        <Text style={styles.captureTitle}>{t("admissions.capture.photoTitle", "Admission Photo")}</Text>
        <Pressable onPress={() => void takePhoto()} style={styles.captureButton}>
          <Text style={styles.captureButtonText}>
            {uri ? t("admissions.capture.retakePhoto", "Retake") : t("admissions.capture.takePhoto", "Take Photo")}
          </Text>
        </Pressable>
      </View>
      {uri ? (
        <Image source={{ uri }} style={styles.photoPreview} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>{t("admissions.capture.noPhoto", "No photo captured")}</Text>
        </View>
      )}
    </View>
  );
}

export function SignaturePad({ strokes, onChange }: SignaturePadProps) {
  const currentStroke = useRef<Point[]>([]);
  const [padSize, setPadSize] = useState({ width: 1, height: 1 });

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        const point = {
          x: event.nativeEvent.locationX,
          y: event.nativeEvent.locationY,
          pressure: event.nativeEvent.touches[0]?.force,
          capturedAt: Date.now(),
        };
        currentStroke.current = [point];
        onChange([...strokes, currentStroke.current]);
      },
      onPanResponderMove: (event) => {
        const point = {
          x: Math.max(0, Math.min(padSize.width, event.nativeEvent.locationX)),
          y: Math.max(0, Math.min(padSize.height, event.nativeEvent.locationY)),
          pressure: event.nativeEvent.touches[0]?.force,
          capturedAt: Date.now(),
        };
        currentStroke.current = [...currentStroke.current, point];
        onChange([...strokes, currentStroke.current]);
      },
      onPanResponderRelease: () => {
        currentStroke.current = [];
      },
    }),
    [onChange, padSize.height, padSize.width, strokes],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    setPadSize({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    });
  };

  const segments = strokes.flatMap((stroke, strokeIndex) =>
    stroke.slice(1).map((point, index) => ({
      key: `${strokeIndex}-${index}`,
      start: stroke[index],
      end: point,
    })),
  );

  return (
    <View style={styles.captureBlock}>
      <View style={styles.captureHeader}>
        <Text style={styles.captureTitle}>{t("admissions.capture.signatureTitle", "Signature")}</Text>
        <Pressable onPress={() => onChange([])} style={styles.captureButton}>
          <Text style={styles.captureButtonText}>{t("admissions.capture.clearSignature", "Clear")}</Text>
        </Pressable>
      </View>
      <View style={styles.signaturePad} onLayout={onLayout} {...panResponder.panHandlers}>
        {segments.map((segment) => {
          const dx = segment.end.x - segment.start.x;
          const dy = segment.end.y - segment.start.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = `${Math.atan2(dy, dx)}rad`;

          return (
            <View
              key={segment.key}
              style={[
                styles.signatureSegment,
                {
                  left: segment.start.x,
                  top: segment.start.y,
                  width: Math.max(2, length),
                  transform: [{ rotate: angle }],
                },
              ]}
            />
          );
        })}
        {strokes.length === 0 ? (
          <Text style={styles.signaturePlaceholder}>{t("admissions.capture.signHere", "Sign here")}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  captureBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: "#F8FAFC",
  },
  captureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  captureTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  captureButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  captureButtonActive: {
    borderColor: "#0E7490",
    backgroundColor: "#ECFEFF",
  },
  captureButtonText: {
    color: colors.primary,
    fontWeight: "800",
  },
  captureButtonTextActive: {
    color: "#0E7490",
  },
  notesInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  captureError: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontSize: 13,
  },
  photoPreview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },
  photoPlaceholder: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  photoPlaceholderText: {
    color: colors.textMuted,
    fontWeight: "800",
  },
  signaturePad: {
    height: 190,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  signaturePlaceholder: {
    position: "absolute",
    alignSelf: "center",
    top: 78,
    color: "#CBD5E1",
    fontSize: 24,
    fontWeight: "900",
  },
  signatureSegment: {
    position: "absolute",
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.text,
    transformOrigin: "left center",
  },
});
