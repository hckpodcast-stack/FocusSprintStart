import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Goal,
  GoalInsight,
  loadGoals,
  updateGoal,
} from "../lib/goals-storage";
import { generateInsightsForGoals } from "../lib/ai";

export default function Insights() {
  const router = useRouter();
  const { goalIds } = useLocalSearchParams<{ goalIds?: string }>();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [insight, setInsight] = useState<GoalInsight | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedIds = useMemo(
    () => (goalIds ? goalIds.split(",").filter(Boolean) : []),
    [goalIds],
  );

  useEffect(() => {
    let isMounted = true;
    loadGoals()
      .then((all) => {
        if (!isMounted) return;
        const subset = all.filter((goal) => selectedIds.includes(goal.id));
        setGoals(subset);
        // Try to surface the latest existing insight for this exact selection
        if (subset.length === 0) return;
        const allInsights = subset.flatMap((goal) => goal.insightsHistory ?? []);
        const matching = allInsights
          .filter((entry) => {
            if (!entry.goalIds || entry.goalIds.length !== selectedIds.length) {
              return false;
            }
            const sortedA = [...entry.goalIds].sort();
            const sortedB = [...selectedIds].sort();
            return sortedA.every((id, index) => id === sortedB[index]);
          })
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        if (matching[0]) {
          setInsight(matching[0]);
        }
      })
      .catch((error) => {
        console.log("Failed to load goals for insights", error);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedIds]);

  const handleGenerate = async () => {
    if (goals.length === 0 || selectedIds.length === 0) return;
    setIsGenerating(true);
    try {
      const result = await generateInsightsForGoals(goals);
      const entry: GoalInsight = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        goalIds: selectedIds,
        paragraph: result.paragraph,
        clarityScore: result.clarityScore,
        clarityExplanation: result.clarityExplanation,
      };
      setInsight(entry);

      // Persist to each involved goal
      await Promise.all(
        selectedIds.map((goalId) =>
          updateGoal(goalId, (goal) => ({
            ...goal,
            insightsHistory: [...(goal.insightsHistory ?? []), entry],
          })),
        ),
      );
    } catch (error) {
      console.log("Failed to generate insights", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const headerTitle =
    goals.length === 1
      ? `Insights about: ${goals[0]?.title ?? ""}`
      : "Insights across your goals";

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>{headerTitle}</Text>

          {insight ? (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Deep dive</Text>
              {insight.paragraph ? (
                <Text style={styles.paragraphText}>{insight.paragraph}</Text>
              ) : (
                <Text style={styles.paragraphText}>
                  Not enough data to generate a full insight yet.
                </Text>
              )}

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>Clarity score</Text>
              {insight.clarityScore != null ? (
                <Text style={styles.clarityScoreText}>
                  Clarity: {insight.clarityScore}/100
                </Text>
              ) : (
                <Text style={styles.clarityScoreText}>Not enough data</Text>
              )}
              {insight.clarityExplanation && (
                <Text style={styles.clarityExplanationText}>
                  {insight.clarityExplanation}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>
                No insights generated yet for this selection.
              </Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.generateButton,
            goals.length > 0 ? styles.generateButtonEnabled : styles.generateButtonDisabled,
          ]}
          activeOpacity={goals.length > 0 && !isGenerating ? 0.9 : 1}
          disabled={goals.length === 0 || isGenerating}
          onPress={handleGenerate}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? "Generating..." : "Generate Insights Again"}
          </Text>
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
  card: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 13,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  paragraphText: {
    fontSize: 15,
    color: "#111827",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  clarityScoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  clarityExplanationText: {
    fontSize: 14,
    color: "#4B5563",
  },
  placeholderCard: {
    borderRadius: 18,
    backgroundColor: "#F5F3EF",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  generateButton: {
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  generateButtonEnabled: {
    backgroundColor: "#3D4F5F",
  },
  generateButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

