import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadQuickMemos } from "../lib/quick-memos";
import { loadGoals } from "../lib/goals-storage";
import { generateOptimizeInsights } from "../lib/ai";

type TimeWindow = "day" | "week" | "month";
const WINDOW_LABELS: Record<TimeWindow, string> = {
  day: "Last day",
  week: "Last week",
  month: "Last month",
};

type Lens =
  | "focus_timing"
  | "consistency"
  | "emotion"
  | "focus_progression";

const LENS_LABELS: Record<Lens, string> = {
  focus_timing: "Focus timing",
  consistency: "Consistency",
  emotion: "Emotion",
  focus_progression: "Focus progression",
};

const LENS_DESCRIPTIONS: Record<Lens, string> = {
  focus_timing: "Time of day and focus patterns",
  consistency: "Streaks, showing up daily, habits",
  emotion: "Moods, check-ins, journaling patterns",
  focus_progression: "Focus level progression",
};

const nowMs = () => Date.now();

function cutoffForWindow(window: TimeWindow): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  if (window === "day") return nowMs() - msPerDay;
  if (window === "week") return nowMs() - msPerDay * 7;
  return nowMs() - msPerDay * 30;
}

export default function Optimize() {
  const router = useRouter();
  const [windowSelection, setWindowSelection] = useState<TimeWindow>("day");
  const [lensSelection, setLensSelection] = useState<Lens>("focus_timing");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [bullets, setBullets] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const gatherTexts = useCallback(async () => {
    const cutoff = cutoffForWindow(windowSelection);
    const goals = await loadGoals().catch(() => []);
    const memos = await loadQuickMemos().catch(() => []);

    const texts: string[] = [];

    // Quick memos: text, transcript, summary
    memos.forEach((memo) => {
      const createdAtMs = new Date(memo.createdAt).getTime();
      if (Number.isNaN(createdAtMs) || createdAtMs < cutoff) return;
      if (memo.textMemo && memo.textMemo.trim()) texts.push(memo.textMemo.trim());
      if (memo.voiceMemoTranscript && memo.voiceMemoTranscript.trim()) {
        texts.push(memo.voiceMemoTranscript.trim());
      }
      if (memo.summary && memo.summary.trim()) texts.push(memo.summary.trim());
      if (memo.title && memo.title.trim()) texts.push(`Title: ${memo.title.trim()}`);
    });

    // Goals: whySummary, memo text, reflection (if present)
    goals.forEach((goal) => {
      const createdAtMs = new Date(goal.createdAt).getTime();
      if (Number.isNaN(createdAtMs) || createdAtMs < cutoff) return;
      if (goal.whySummary) texts.push(goal.whySummary);
      if (goal.textMemo) texts.push(goal.textMemo);
      if ((goal as any).voiceMemoTranscript) {
        const t = (goal as any).voiceMemoTranscript as string;
        if (t?.trim()) texts.push(t.trim());
      }
      if ((goal as any).reflection) {
        const refl = (goal as any).reflection as any;
        if (refl?.textMemo) texts.push(refl.textMemo);
        if (refl?.voiceMemoTranscript) texts.push(refl.voiceMemoTranscript);
        if (refl?.whySummary) texts.push(refl.whySummary);
      }
    });

    return texts.filter(Boolean);
  }, [windowSelection]);

  const handleOptimize = async () => {
    setIsLoading(true);
    setSummary(null);
    setBullets([]);
    setError(null);
    try {
      const texts = await gatherTexts();
      if (!texts.length) {
        setError("Not enough data for insights.");
        return;
      }
      const result = await generateOptimizeInsights({
        texts,
        lens: LENS_LABELS[lensSelection],
        windowLabel: WINDOW_LABELS[windowSelection],
      });
      if (!result.summary) {
        setError("Not enough data for insights.");
        return;
      }
      setSummary(result.summary);
      setBullets(result.bullets);
    } catch (err) {
      console.log("Optimize failed", err);
      setError("Not enough data for insights.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clear outputs when selection changes
    setSummary(null);
    setBullets([]);
    setError(null);
  }, [windowSelection, lensSelection]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
            <Feather name="arrow-left" size={22} color="#3D4F5F" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Optimize</Text>
          <Text style={styles.subtitle}>
            Pick a time window and lens. We’ll generate a concise insight (150–200 words +
            3 bullets).
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Time window</Text>
            <View style={styles.chipRow}>
              {(["day", "week", "month"] as TimeWindow[]).map((win) => {
                const isActive = windowSelection === win;
                return (
                  <TouchableOpacity
                    key={win}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setWindowSelection(win)}
                  >
                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                      {WINDOW_LABELS[win]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Lens of analysis</Text>
            <View style={styles.chipColumn}>
              {(Object.keys(LENS_LABELS) as Lens[]).map((lens) => {
                const isActive = lensSelection === lens;
                return (
                  <TouchableOpacity
                    key={lens}
                    style={[styles.lensChip, isActive && styles.lensChipActive]}
                    onPress={() => setLensSelection(lens)}
                  >
                    <Text style={[styles.lensTitle, isActive && styles.lensTitleActive]}>
                      {LENS_LABELS[lens]}
                    </Text>
                    <Text style={styles.lensSubtitle}>{LENS_DESCRIPTIONS[lens]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              isLoading ? styles.primaryButtonDisabled : styles.primaryButtonEnabled,
            ]}
            activeOpacity={isLoading ? 1 : 0.9}
            disabled={isLoading}
            onPress={handleOptimize}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Generating..." : "Optimize"}
            </Text>
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {summary && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Insight</Text>
              <Text style={styles.resultSummary}>{summary}</Text>
              {bullets.length > 0 && (
                <View style={styles.bulletList}>
                  {bullets.map((b, idx) => (
                    <View key={idx} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.bulletText}>{b}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EFECE5" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scrollContent: { paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "700", color: "#2F3C4A", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#8D9299", marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#F5F3EF",
  },
  chipActive: { backgroundColor: "#D4F4E8" },
  chipText: { fontSize: 14, color: "#2F3C4A" },
  chipTextActive: { fontWeight: "700" },
  chipColumn: { gap: 10 },
  lensChip: {
    borderRadius: 14,
    backgroundColor: "#F5F3EF",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  lensChipActive: { backgroundColor: "#D4F4E8" },
  lensTitle: { fontSize: 14, color: "#2F3C4A", fontWeight: "600" },
  lensTitleActive: { fontWeight: "700" },
  lensSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonEnabled: { backgroundColor: "#3D4F5F" },
  primaryButtonDisabled: { backgroundColor: "#9CA3AF" },
  primaryButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9A3412",
  },
  resultCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultTitle: { fontSize: 15, fontWeight: "700", color: "#2F3C4A", marginBottom: 8 },
  resultSummary: { fontSize: 14, color: "#111827", marginBottom: 12 },
  bulletList: { gap: 6 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#3D4F5F", marginTop: 6 },
  bulletText: { flex: 1, fontSize: 14, color: "#111827" },
});
