import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  GestureResponderEvent,
  PanResponder,
  PanResponderInstance,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton } from "../components/BackButton";
import { useRouter } from "expo-router";
import {
  appendGoal,
  Goal,
  SignatureStrokePoint,
} from "../lib/goals-storage";
import {
  clearDraft,
  getDraft,
  updateDraftContract,
} from "../lib/goal-draft";
import { getTranscriptAndSummary } from "../lib/ai";

type Point = SignatureStrokePoint;

export default function Signature() {
  const router = useRouter();
  const [points, setPoints] = useState<Point[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [aiTranscript, setAiTranscript] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const panRef = useRef<PanResponderInstance | null>(null);

  const draft = getDraft();
  const goalTitle = draft?.title ?? "Your goal";
  const whySummaryToShow =
    aiSummary ??
    draft?.whySummary ??
    aiTranscript ??
    draft?.voiceMemoTranscript ??
    draft?.textMemo ??
    "Your reasons for this goal will appear here.";
  const timeWindow = draft
    ? new Date(draft.dueAt).toLocaleString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const hasSignature = useMemo(() => points.length > 0, [points]);

  const addPoint = (x: number, y: number) => {
    setPoints((previous) => [...previous, { x, y }]);
  };

  if (!panRef.current) {
    panRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent;
        addPoint(locationX, locationY);
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent;
        addPoint(locationX, locationY);
      },
    });
  }

  // Run transcription + summary as soon as we arrive on this screen
  useEffect(() => {
    let cancelled = false;

    async function runAiPipeline() {
      if (!draft) return;
      if (!(draft.voiceMemoFileUri || draft.textMemo)) return;
      if (aiSummary || aiTranscript) return;

      try {
        const result = await getTranscriptAndSummary({
          audioUri: draft.voiceMemoFileUri,
          textMemo: draft.textMemo ?? null,
        });
        if (cancelled) return;

        if (result.transcript) {
          setAiTranscript(result.transcript);
        }
        if (result.summary) {
          setAiSummary(result.summary);
        }
      } catch (error) {
        console.log("AI pipeline (mount) failed", error);
      }
    }

    runAiPipeline();

    return () => {
      cancelled = true;
    };
  }, [draft, aiSummary, aiTranscript]);

  const handleLock = async () => {
    if (!hasSignature || isSaving) return;
    const draft = getDraft();
    if (!draft || !draft.goalType || !draft.feeling) {
      return;
    }

    setIsSaving(true);

    let transcript: string | null = aiTranscript ?? draft.voiceMemoTranscript ?? null;
    let summary: string | null = aiSummary ?? draft.whySummary ?? null;

    // Fallback: if we still don't have anything, try once more
    if (!summary && !transcript && (draft.voiceMemoFileUri || draft.textMemo)) {
      try {
        const result = await getTranscriptAndSummary({
          audioUri: draft.voiceMemoFileUri,
          textMemo: draft.textMemo ?? null,
        });
        transcript = result.transcript ?? transcript;
        summary = result.summary ?? summary;
      } catch (error) {
        console.log("AI pipeline (lock) failed", error);
      }
    }

    const contract = {
      strokes: points,
      signedAt: new Date().toISOString(),
    };
    updateDraftContract(contract);

    const goal: Goal = {
      id: draft.id,
      title: draft.title,
      dueAt: draft.dueAt,
      reminders: draft.reminders,
      memoType: draft.memoType,
      voiceMemoFileUri: draft.voiceMemoFileUri,
      voiceMemoTranscript: transcript ?? undefined,
      textMemo: draft.textMemo,
      goalType: draft.goalType,
      feeling: draft.feeling,
      friction: draft.friction ?? null,
      whySummary: summary ?? transcript ?? draft.textMemo ?? undefined,
      contract,
      createdAt: new Date().toISOString(),
    };

    await appendGoal(goal);
    clearDraft();
    setIsSaving(false);

    router.push({ pathname: "/", params: { banner: "goalLocked" } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <BackButton />
        </View>

        <Text style={styles.headerText}>
          You just made a promise to your future self:
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>GOAL</Text>
          <Text style={styles.cardValue}>{goalTitle}</Text>

          <View style={styles.cardDivider} />

          <Text style={styles.sectionLabel}>WHY IT MATTERS</Text>
          <Text style={styles.cardValue}>{whySummaryToShow}</Text>

          <View style={styles.cardDivider} />

          <Text style={styles.sectionLabel}>TIME WINDOW</Text>
          <Text style={styles.cardValue}>{timeWindow}</Text>
        </View>

        <Text style={styles.signaturePrompt}>✍️</Text>

        <View style={styles.signatureBoxOuter}>
          <View style={styles.signatureBox} {...panRef.current!.panHandlers}>
            {!hasSignature && (
              <Text style={styles.signaturePlaceholder}>Awaiting signature</Text>
            )}
            {hasSignature && (
              <Svg style={StyleSheet.absoluteFill}>
                <Path
                  d={
                    points.length === 0
                      ? ""
                      : `M ${points[0].x} ${points[0].y}` +
                        points
                          .slice(1)
                          .map((p) => ` L ${p.x} ${p.y}`)
                          .join("")
                  }
                  stroke="#111827"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>

          {hasSignature && (
            <TouchableOpacity
              style={styles.clearButton}
              activeOpacity={0.9}
              onPress={() => setPoints([])}
            >
              <Text style={styles.clearButtonText}>Clear signature</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.lockButton,
            hasSignature && !isSaving
              ? styles.lockButtonEnabled
              : styles.lockButtonDisabled,
          ]}
          activeOpacity={hasSignature && !isSaving ? 0.9 : 1}
          disabled={!hasSignature || isSaving}
          onPress={handleLock}
        >
          <Text style={styles.lockButtonText}>
            {isSaving ? "Locking in..." : "Lock this in"}
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
    marginBottom: 16,
  },
  headerText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 24,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  signaturePrompt: {
    textAlign: "center",
    fontSize: 18,
    marginBottom: 8,
  },
  signatureBoxOuter: {
    marginBottom: 24,
  },
  signatureBox: {
    height: 160,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  signaturePlaceholder: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  clearButton: {
    position: "absolute",
    right: 12,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  clearButtonText: {
    fontSize: 12,
    color: "#374151",
  },
  lockButton: {
    marginTop: "auto",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  lockButtonEnabled: {
    backgroundColor: "#3D4F5F",
  },
  lockButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  lockButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
