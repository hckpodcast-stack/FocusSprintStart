import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

type MemoMode = "voice" | "text";

const MAX_RECORD_SECONDS = 3 * 60;
const SAMPLE_GOAL_TITLE = "Design new components";

export default function AddMemo() {
  const router = useRouter();

  const [memoMode, setMemoMode] = useState<MemoMode>("voice");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [waveformValues, setWaveformValues] = useState<number[]>(
    () => new Array(40).fill(0.3),
  );
  const [textMemo, setTextMemo] = useState("");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds((previous) => {
          const next = Math.min(previous + 0.1, MAX_RECORD_SECONDS);
          if (next >= MAX_RECORD_SECONDS) {
            setIsRecording(false);
          }
          return next;
        });
        setWaveformValues((previous) => previous.map(() => 0.3 + Math.random() * 0.7));
      }, 120);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((previous) => {
          const next = previous + 0.1;
          if (next >= recordSeconds) {
            setIsPlaying(false);
            return recordSeconds;
          }
          return next;
        });
      }, 120);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, recordSeconds]);

  const formatDuration = (seconds: number) => {
    const whole = Math.floor(seconds);
    const mins = Math.floor(whole / 60);
    const secs = whole % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleRecord = () => {
    if (memoMode !== "voice") return;
    if (!isRecording) {
      setIsPlaying(false);
      setRecordSeconds(0);
      setPlaybackSeconds(0);
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  };

  const handleTogglePlayback = () => {
    if (memoMode !== "voice") return;
    if (recordSeconds <= 0 || isRecording) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (playbackSeconds >= recordSeconds) {
        setPlaybackSeconds(0);
      }
      setIsPlaying(true);
    }
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
  const canSave = hasVoiceMemo || hasTextMemo;

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
            <Text style={styles.title}>Add Memo</Text>
            <Text style={styles.subtitle}>
              Add additional thoughts about "{SAMPLE_GOAL_TITLE}"
            </Text>

            <View style={styles.section}>
              <View style={styles.memoHeaderRow}>
                <Text style={styles.sectionLabel}>Record a voice memo</Text>
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
                <View style={styles.memoCard}>
                  {renderWaveform()}
                  <View style={styles.voiceBottomRow}>
                    <View style={styles.voiceTimerRow}>
                      <Text style={styles.voiceTimerText}>
                        {formatDuration(
                          isPlaying ? playbackSeconds : recordSeconds,
                        )}{" "}
                        / {formatDuration(MAX_RECORD_SECONDS)}
                      </Text>
                      {recordSeconds > 0 && !isRecording && (
                        <TouchableOpacity
                          style={styles.voicePlayButton}
                          onPress={handleTogglePlayback}
                          activeOpacity={0.9}
                        >
                          <Feather
                            name={isPlaying ? "pause" : "play"}
                            size={18}
                            color="#3D4F5F"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.voiceRecordButton}
                    activeOpacity={0.9}
                    onPress={handleToggleRecord}
                  >
                    <Feather
                      name={isRecording ? "stop" : "mic"}
                      size={20}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.textMemoShell}>
                    <TextInput
                      style={styles.textMemoInput}
                      placeholder="Share additional thoughts..."
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
              console.log("Save memo", { memoMode, hasVoiceMemo, hasTextMemo });
              router.back();
            }}
          >
            <Text style={styles.saveButtonText}>Save Memo</Text>
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
  memoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  memoToggleIcon: {
    padding: 4,
  },
  memoCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 40,
    marginBottom: 16,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    marginHorizontal: 1,
    backgroundColor: "#38B2AC",
  },
  voiceBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voiceTimerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  voiceTimerText: {
    fontSize: 13,
    color: "#8D9299",
  },
  voicePlayButton: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4D7DD",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceRecordButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7DD3C0",
    alignItems: "center",
    justifyContent: "center",
  },
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

