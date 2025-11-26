import type {
  FrictionType,
  GoalContractSignature,
  GoalFeeling,
  GoalType,
  Reminder,
} from "./goals-storage";

export type GoalDraft = {
  id: string;
  title: string;
  dueAt: string;
  reminders: Reminder[];
  memoType: "voice" | "text" | null;
  voiceMemoFileUri?: string;
  voiceMemoTranscript?: string;
  textMemo?: string;
  goalType?: GoalType;
  feeling?: GoalFeeling;
  friction?: FrictionType;
  contract?: GoalContractSignature;
};

let currentDraft: GoalDraft | null = null;

export function startGoalDraft(input: {
  title: string;
  dueAt: string;
  reminders: Reminder[];
  memoType: "voice" | "text" | null;
  textMemo?: string;
  voiceMemoTranscript?: string;
  voiceMemoFileUri?: string;
}) {
  currentDraft = {
    id: `${Date.now()}`,
    title: input.title,
    dueAt: input.dueAt,
    reminders: input.reminders,
    memoType: input.memoType,
    textMemo: input.textMemo,
    voiceMemoTranscript: input.voiceMemoTranscript,
    voiceMemoFileUri: input.voiceMemoFileUri,
  };
}

export function updateDraftInfo(info: {
  goalType: GoalType;
  feeling: GoalFeeling;
  friction: FrictionType;
}) {
  if (!currentDraft) return;
  currentDraft = { ...currentDraft, ...info };
}

export function updateDraftContract(contract: GoalContractSignature) {
  if (!currentDraft) return;
  currentDraft = { ...currentDraft, contract };
}

export function getDraft(): GoalDraft | null {
  return currentDraft;
}

export function clearDraft() {
  currentDraft = null;
}

