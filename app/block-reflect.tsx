import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import {
  Goal,
  GoalFeeling,
  updateGoal,
} from "../lib/goals-storage";
import {
  loadUnloggedFocusBlocks,
  removeUnloggedFocusBlock,
  UnloggedFocusBlock,
} from "../lib/focus-blocks";
import { loadGoals } from "../lib/goals-storage";
import { incrementFocusBlocks } from "../lib/focus-stats";

type FocusEmotion =
  | "calm"
  | "scattered"
  | "in_control"
  | "drained"
  | "motivated";

const FOCUS_EMOTIONS: { key: FocusEmotion; label: string }[] = [
  { key: "calm", label: "Calm" },
  { key: "scattered", label: "Scattered" },
  { key: "in_control", label: "In control" },
  { key: "drained", label: "Drained" },
  { key: "motivated", label: "Motivated" },
];

type MemoMode = "voice" | "text";

const MAX_RECORD_SECONDS = 3 * 60;

export default function BlockReflect() {
  const router = useRouter();
  const { blockId } = useLocalSearchParams<{ blockId?: string }>();

  const [block, setBlock] = useState<UnloggedFocusBlock | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const [emotion, setEmotion] = useState<FocusEmotion | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [memoMode, setMemoMode] = useState<MemoMode>("voice");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [textMemo, setTextMemo] = useState("");

  useEffect(() => {
    let mounted = true;
    loadUnloggedFocusBlocks()
      .then((blocks) => {
        if (!mounted) return;
        const found = blocks.find((b) => b.id === blockId) ?? null;
        setBlock(found);
      })
      .catch((error) => {
        console.log("Failed to load focus block", error);
      });
    loadGoals()
      .then((items) => {
        if (!mounted) return;
        setGoals(items);
      })
      .catch((error) => {
        console.log("Failed to load goals for block reflect", error);
      });
    return () => {
      mounted = false;
    };
  }, [blockId]);

  const hasVoiceMemo = memoMode === "voice" && recordSeconds > 0;
  const hasTextMemo = memoMode === "text" && textMemo.trim().length > 0;
  const hasMemo = hasVoiceMemo || hasTextMemo;

  const canSave = useMemo(
    () =>
      focusLevel != null &&
      emotion != null &&
      selectedGoalId != null,
    [focusLevel, emotion, selectedGoalId],
  );

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
    if (!block || !selectedGoalId || focusLevel == null || !emotion) {
      router.back();
      return;
    }
    const goalId = selectedGoalId;
    await updateGoal(goalId, (goal) => ({
      ...goal,
      // Store focus block data under the goal for future analysis
      additionalMemos: goal.additionalMemos ?? [],
      insightsHistory: goal.insightsHistory ?? [],
    }));
    try {
      await incrementFocusBlocks(block.blockCount ?? 0);
    } catch (error) {
      console.log("Failed to increment focus block stats", error);
    }
    await removeUnloggedFocusBlock(block.id);
    router.push("/");
  };

  const selectedGoal = goals.find((g) => g.id === selectedGoalId) ?? null;

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
            <Text style={styles.title}>How did this block go?</Text>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Level of focus</Text>
              <View style={styles.focusRow}>
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => {
                  const isSelected = focusLevel === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.focusButton,
                        isSelected && styles.focusButtonSelected,
                      ]}
                      activeOpacity={0.9}
                      onPress={() => setFocusLevel(value)}
                    >
                      <Text
                        style={[
                          styles.focusButtonText,
                          isSelected && styles.focusButtonTextSelected,
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
              <Text style={styles.sectionLabel}>Emotion (pick one)</Text>
              <View style={styles.emotionRow}>
                {FOCUS_EMOTIONS.map((item) => {
                  const isSelected = emotion === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.emotionChip,
                        isSelected && styles.emotionChipSelected,
                      ]}
                      activeOpacity={0.9}
                      onPress={() => setEmotion(item.key)}
                    >
                      <Text
                        style={[
                          styles.emotionChipLabel,
                          isSelected && styles.emotionChipLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>What were you working on?</Text>
              <TouchableOpacity
                style={styles.goalSelect}
                activeOpacity={0.9}
                onPress={() => {
                  if (goals.length === 0) return;
                  // For now, cycle through goals on each tap
                  const currentIndex = goals.findIndex((g) => g.id === selectedGoalId);
                  const next =
                    currentIndex === -1 || currentIndex === goals.length - 1
                      ? goals[0]
                      : goals[currentIndex + 1];
                  setSelectedGoalId(next.id);
                }}
              >
                <Text style={styles.goalSelectText}>
                  {selectedGoal ? selectedGoal.title : "Select goal"}
                </Text>
                <Feather name="chevron-down" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <View style={styles.memoHeaderRow}>
                <Text style={styles.sectionLabel}>Optional memo</Text>
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
                      placeholder="Add a quick note about this block..."
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
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#8D9299",
    marginBottom: 8,
  },
  focusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  focusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  focusButtonSelected: {
    backgroundColor: "#3D4F5F",
    borderColor: "#3D4F5F",
  },
  focusButtonText: {
    fontSize: 12,
    color: "#111827",
  },
  focusButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emotionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emotionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emotionChipSelected: {
    backgroundColor: "#D4F4E8",
    borderColor: "#D4F4E8",
  },
  emotionChipLabel: {
    fontSize: 13,
    color: "#111827",
  },
  emotionChipLabelSelected: {
    fontWeight: "600",
  },
  goalSelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  goalSelectText: {
    fontSize: 14,
    color: "#111827",
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
