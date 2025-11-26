import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { VoiceMemoCard } from "../components/VoiceMemoCard";

type MemoMode = "voice" | "text";

const MAX_RECORD_SECONDS = 3 * 60;
const SAMPLE_GOAL_TITLE = "Design new components";

export default function AddMemo() {
  const router = useRouter();

  const [memoMode, setMemoMode] = useState<MemoMode>("voice");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [textMemo, setTextMemo] = useState("");

  const formatDuration = (seconds: number) => {
    const whole = Math.floor(seconds);
    const mins = Math.floor(whole / 60);
    const secs = whole % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleMode = () => {
    setRecordSeconds(0);
    setRecordingUri(null);
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
    <View />
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
    // visual handled by VoiceMemoCard
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
