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
import { appendQuickMemo } from "../lib/quick-memos";
import { generateQuickMemoTitleAndSummary, getTranscriptAndSummary } from "../lib/ai";

type MemoMode = "voice" | "text";

const MAX_RECORD_SECONDS = 3 * 60;
const TITLE_WORD_LIMIT = 5;

export default function AddMemoQuick() {
  const router = useRouter();

  const [memoMode, setMemoMode] = useState<MemoMode>("voice");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [textMemo, setTextMemo] = useState("");

  const hasVoiceMemo = memoMode === "voice" && recordSeconds > 0;
  const hasTextMemo = memoMode === "text" && textMemo.trim().length > 0;
  const canSave = hasVoiceMemo || hasTextMemo;

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

  const handleSave = async () => {
    if (!canSave) return;
    const now = new Date().toISOString();
    let title: string | null = null;
    let summary: string | null = null;
    let transcript: string | null = null;

    if (memoMode === "text") {
      const baseText = textMemo.trim();
      if (baseText) {
        const result = await generateQuickMemoTitleAndSummary(baseText);
        title = result.title;
        summary = result.summary;
      }
    } else if (memoMode === "voice" && recordingUri) {
      const result = await getTranscriptAndSummary({
        audioUri: recordingUri,
        textMemo: null,
      });
      transcript = result.transcript ?? null;
      summary = result.summary ?? null;
      const source = transcript || summary || "";
      if (source.trim()) {
        const ai = await generateQuickMemoTitleAndSummary(source);
        title = ai.title ?? null;
        // If we didn't get a summary from transcription, use AI summary
        if (!summary && ai.summary) {
          summary = ai.summary;
        }
      }
    }

    await appendQuickMemo({
      id: `${Date.now()}`,
      createdAt: now,
      memoType: memoMode,
      durationSeconds: recordSeconds > 0 ? Math.round(recordSeconds) : undefined,
      voiceMemoFileUri: memoMode === "voice" ? recordingUri : undefined,
      voiceMemoTranscript: transcript ?? undefined,
      textMemo: memoMode === "text" ? textMemo : undefined,
      title:
        title ??
        summary ??
        transcript ??
        (memoMode === "text" ? textMemo.trim() || "Untitled memo" : "Untitled memo"),
      summary:
        summary ??
        transcript ??
        (memoMode === "text" ? textMemo.trim() || "No summary" : "No summary"),
    });
    router.back();
  };

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
              Quick memo that isn’t tied to a goal or focus block
            </Text>

            <View style={styles.section}>
              <View style={styles.memoHeaderRow}>
                <Text style={styles.sectionLabel}>Record a memo</Text>
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
                      placeholder="Jot down your thoughts..."
                      placeholderTextColor="#B2B6BE"
                      multiline
                      textAlignVertical="top"
                      value={textMemo}
                      onChangeText={setTextMemo}
                    />
                  </View>
                  <Text style={styles.wordCountText}>Optional</Text>
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
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Memo</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
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
  section: { marginBottom: 24 },
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
  memoToggleIcon: { padding: 4 },
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
  wordCountText: { marginTop: 6, fontSize: 12, color: "#8D9299" },
  saveButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonEnabled: { backgroundColor: "#3D4F5F" },
  saveButtonDisabled: { backgroundColor: "#9CA3AF" },
  saveButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});
