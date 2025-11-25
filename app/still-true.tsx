import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SAMPLE_GOAL_TITLE = "Design new components";
const SAMPLE_AI_SUMMARY =
  "You set this goal with clear intention and motivation. Your voice memo captured your commitment.";

export default function StillTrue() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
            <Feather name="arrow-left" size={22} color="#3D4F5F" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.promptText}>You said this mattered. Still true?</Text>

          <View style={styles.goalBlock}>
            <Text style={styles.goalTitle}>{SAMPLE_GOAL_TITLE}</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeaderRow}>
                <Feather name="activity" size={16} color="#3D4F5F" />
                <Text style={styles.summaryHeaderText}>AI Summary</Text>
              </View>
              <Text style={styles.summaryBodyText}>{SAMPLE_AI_SUMMARY}</Text>
            </View>

            <TouchableOpacity
              style={styles.reviewButton}
              activeOpacity={0.9}
              onPress={() => console.log("Review original memo")}
            >
              <Text style={styles.reviewButtonText}>Review Memo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.choiceButton, styles.choiceButtonPrimary]}
              activeOpacity={0.9}
              onPress={() => console.log("User confirmed goal is still true")}
            >
              <Text style={styles.choiceButtonPrimaryText}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceButton, styles.choiceButtonSecondary]}
              activeOpacity={0.9}
              onPress={() => console.log("User indicated goal is not still true")}
            >
              <Text style={styles.choiceButtonSecondaryText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  promptText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
    color: "#3D4F5F",
    marginTop: 16,
  },
  goalBlock: {
    marginTop: 40,
    alignItems: "center",
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2F3C4A",
    marginBottom: 16,
  },
  summaryCard: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#E6FBF4",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  summaryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryHeaderText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#3D4F5F",
  },
  summaryBodyText: {
    fontSize: 14,
    color: "#3D4F5F",
  },
  reviewButton: {
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  bottomButtons: {
    marginTop: 40,
  },
  choiceButton: {
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  choiceButtonPrimary: {
    backgroundColor: "#243B53",
  },
  choiceButtonSecondary: {
    backgroundColor: "#FFFFFF",
  },
  choiceButtonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  choiceButtonSecondaryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
});

