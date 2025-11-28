import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BackButton } from "../components/BackButton";
import { updateDraftInfo } from "../lib/goal-draft";
import type { FrictionType, GoalFeeling, GoalType } from "../lib/goals-storage";

const GOAL_TYPES = [
  { key: "launch", label: "Launch", emoji: "🚀" },
  { key: "build", label: "Build", emoji: "🧱" },
  { key: "revenue", label: "Revenue", emoji: "💰" },
  { key: "audience", label: "Audience", emoji: "📣" },
  { key: "learning", label: "Learning", emoji: "🧠" },
] as const;

const EMOTIONS = [
  { key: "calm", label: "Calm", emoji: "😊" },
  { key: "scattered", label: "Scattered", emoji: "🌀" },
  { key: "in_control", label: "In control", emoji: "🎯" },
  { key: "drained", label: "Drained", emoji: "😮‍💨" },
  { key: "motivated", label: "Motivated", emoji: "💪" },
] as const;

const FRICTIONS = [
  { key: "not-sure", label: "Not sure what to do first", emoji: "❓" },
  { key: "slow", label: "Slow execution", emoji: "🐢" },
  { key: "context", label: "Context switching", emoji: "🧷" },
  { key: "fake", label: "Fake productivity", emoji: "🍌" },
] as const;

export default function AddInfo() {
  const router = useRouter();

  const [goalType, setGoalType] = useState<string | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [friction, setFriction] = useState<string | null>(null);

  const canContinue = useMemo(
    () => goalType != null && feeling != null,
    [goalType, feeling],
  );

  const handleNext = () => {
    if (!canContinue) return;

    updateDraftInfo({
      goalType: goalType as GoalType,
      feeling: feeling as GoalFeeling,
      friction: (friction ?? null) as FrictionType,
    });

    router.push("/signature");
  };

  const renderChip = (
    item: { key: string; label: string; emoji?: string },
    selectedKey: string | null,
    onSelect: (key: string | null) => void,
    large?: boolean,
  ) => {
    const isSelected = selectedKey === item.key;
    return (
      <TouchableOpacity
        key={item.key}
        style={[
          large ? styles.largeChip : styles.chip,
          isSelected && (large ? styles.largeChipSelected : styles.chipSelected),
        ]}
        onPress={() => onSelect(isSelected ? null : item.key)}
        activeOpacity={0.9}
      >
        {item.emoji && <Text style={styles.chipEmoji}>{item.emoji}</Text>}
        <Text
          style={[
            large ? styles.largeChipLabel : styles.chipLabel,
            isSelected && styles.chipLabelSelected,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <BackButton />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.introText}>
            Just a few quick taps to tailor your experience.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Goal type:</Text>
            <View style={styles.goalTypeRow}>
              {GOAL_TYPES.map((item) =>
                renderChip(item, goalType, setGoalType),
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              How are you feeling about this goal:
            </Text>
            <View style={styles.emotionRow}>
              {EMOTIONS.map((item) =>
                renderChip(item, feeling, setFeeling),
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Biggest friction right now:</Text>
            <View style={styles.frictionColumn}>
              {FRICTIONS.map((item) =>
                renderChip(item, friction, setFriction, true),
              )}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.nextButton,
            canContinue ? styles.nextButtonEnabled : styles.nextButtonDisabled,
          ]}
          activeOpacity={canContinue ? 0.9 : 1}
          disabled={!canContinue}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  introText: {
    fontSize: 15,
    color: "#4B5563",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },
  goalTypeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emotionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frictionColumn: {
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  chipSelected: {
    backgroundColor: "#D4F4E8",
  },
  largeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  largeChipSelected: {
    backgroundColor: "#FDF2E9",
  },
  chipEmoji: {
    marginRight: 8,
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 14,
    color: "#111827",
  },
  largeChipLabel: {
    fontSize: 14,
    color: "#111827",
  },
  chipLabelSelected: {
    fontWeight: "600",
  },
  nextButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonEnabled: {
    backgroundColor: "#3D4F5F",
  },
  nextButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
