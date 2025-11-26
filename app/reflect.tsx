import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { VoiceMemoCard } from "../components/VoiceMemoCard";

type MemoMode = "voice" | "text";

const EMOTIONS = [
  { key: "great", label: "Great", emoji: "😊" },
  { key: "calm", label: "Calm", emoji: "😌" },
  { key: "okay", label: "Okay", emoji: "😐" },
  { key: "tough", label: "Tough", emoji: "😓" },
  { key: "frustrated", label: "Frustrated", emoji: "😤" },
] as const;

const MAX_RECORD_SECONDS = 3 * 60;
const SAMPLE_GOAL_TITLE = "Design new components";

export default function Reflect() {
  const router = useRouter();

  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [memoMode, setMemoMode] = useState<MemoMode>("voice");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [textMemo, setTextMemo] = useState("");

  const recordingRef = useRef<null>(null);
  const playbackSoundRef = useRef<null>(null);

  const formatDuration = (seconds: number) => {
    const whole = Math.floor(seconds);
    const mins = Math.floor(whole / 60);
    const secs = whole % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleRecord = async () => {
    // handled inside VoiceMemoCard
  };

  const handleTogglePlayback = async () => {
    // handled inside VoiceMemoCard
  };

  const handleToggleMode = () => {
    setIsRecording(false);
    setIsPlaying(false);
    setRecordSeconds(0);
    setPlaybackSeconds(0);
    if (memoMode === "voice") {
      setMemoMode("text");
    } else {
      setMemoMode("voice");
      setTextMemo("");
    }
  };

  const hasVoiceMemo = memoMode === "voice" && recordSeconds > 0;
  const hasTextMemo = memoMode === "text" && textMemo.trim().length > 0;
  const hasMemo = hasVoiceMemo || hasTextMemo;
  const canSave = Boolean(selectedEmotion && satisfaction !== null && hasMemo);

  const renderWaveform = () => (
    <View style={styles.waveformRow}>
      {waveformValues.map((value, index) => (
        <View
          key={index}
          style={[
            styles.waveformBar,
            {
              height: 16 + value * 16,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={24}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
              <Feather name="arrow-left" size={22} color="#3D4F5F" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Reflect</Text>
            <Text style={styles.subtitle}>Take a moment to capture how it went</Text>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                How are you feeling about this goal?
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.emotionScroll}
                contentContainerStyle={styles.emotionRow}
              >
                {EMOTIONS.map((emotion) => {
                  const isSelected = selectedEmotion === emotion.key;
                  return (
                    <TouchableOpacity
                      key={emotion.key}
                      style={[
                        styles.emotionChip,
                        isSelected && styles.emotionChipSelected,
                      ]}
                      onPress={() => setSelectedEmotion(emotion.key)}
                    >
                      <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                      <Text
                        style={[
                          styles.emotionLabel,
                          isSelected && styles.emotionLabelSelected,
                        ]}
                      >
                        {emotion.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.satisfactionHeaderRow}>
                <Text style={styles.sectionLabel}>Satisfaction Level</Text>
                <Text style={styles.satisfactionValueText}>
                  {satisfaction ?? 0}/10
                </Text>
              </View>
              <View style={styles.satisfactionButtonsRow}>
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => {
                  const isSelected = satisfaction === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.satisfactionButton,
                        isSelected && styles.satisfactionButtonSelected,
                      ]}
                      activeOpacity={0.9}
                      onPress={() => setSatisfaction(value)}
                    >
                      <Text
                        style={[
                          styles.satisfactionButtonText,
                          isSelected && styles.satisfactionButtonTextSelected,
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.memoHeaderRow}>
                <Text style={styles.sectionLabel}>Record a reflection</Text>
                <TouchableOpacity
                  onPress={handleToggleMode}
                  hitSlop={12}
                  style={styles.memoToggleIcon}
                >
                  <Feather
                    name={memoMode === "voice" ? "chevron-right" : "chevron-left"}
                    size={18}
                    color="#8D9299"
                  />
                </TouchableOpacity>
              </View>

              {memoMode === "voice" ? (
                <VoiceMemoCard
                  maxSeconds={MAX_RECORD_SECONDS}
                  initialUri={recordingUri}
                  onChange={({ uri, durationSeconds }) => {
                    setRecordingUri(uri);
                    setRecordSeconds(durationSeconds);
                  }}
                />
              ) : (
                <View>
                  <View style={styles.textMemoShell}>
                    <TextInput
                      style={styles.textMemoInput}
                      placeholder="Share your thoughts about this goal..."
                      placeholderTextColor="#B2B6BE"
                      multiline
                      textAlignVertical="top"
                      value={textMemo}
                      onChangeText={setTextMemo}
                    />
                  </View>
                  <Text style={styles.wordCountText}>0 / 300 words</Text>
                </View>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.saveButton,
              canSave ? styles.saveButtonEnabled : styles.saveButtonDisabled,
            ]}
            activeOpacity={canSave ? 0.9 : 1}
            disabled={!canSave}
            onPress={() => {
              console.log("Save reflection", {
                selectedEmotion,
                satisfaction,
                memoMode,
                hasVoiceMemo,
                hasTextMemo,
              });
              router.back();
            }}
          >
            <Text style={styles.saveButtonText}>Save Reflection</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#EFECE5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2F3C4A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#8D9299",
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#8D9299",
    marginBottom: 8,
  },
  emotionScroll: {
    marginHorizontal: -16,
  },
  emotionRow: {
    paddingHorizontal: 16,
  },
  emotionChip: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F5F3EF",
    marginRight: 8,
  },
  emotionChipSelected: {
    backgroundColor: "#D4F4E8",
  },
  emotionEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  emotionLabel: {
    fontSize: 12,
    color: "#3D4F5F",
  },
  emotionLabelSelected: {
    fontWeight: "600",
  },
  satisfactionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  satisfactionValueText: {
    fontSize: 14,
    color: "#3D4F5F",
    fontWeight: "600",
  },
  sliderTrack: {
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "#111827",
  },
  sliderThumb: {
    position: "absolute",
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D4D7DD",
  },
  sliderLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: "#8D9299",
  },
  satisfactionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  satisfactionButton: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  satisfactionButtonSelected: {
    backgroundColor: "#3D4F5F",
    borderColor: "#3D4F5F",
  },
  satisfactionButtonText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "500",
  },
  satisfactionButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  memoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  memoToggleIcon: {
    padding: 4,
  },
  memoCard: {},
  textMemoShell: {
    borderRadius: 18,
    backgroundColor: "#F5F3EF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 120,
  },
  textMemoInput: {
    fontSize: 15,
    color: "#2F3C4A",
    flexGrow: 1,
  },
  wordCountText: {
    marginTop: 6,
    fontSize: 12,
    color: "#8D9299",
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonEnabled: {
    backgroundColor: "#3D4F5F",
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
