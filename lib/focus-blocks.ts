import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FocusBlock } from "./goals-storage";

const ACTIVE_BLOCK_KEY = "@focusSprint/active-focus-block-v1";
const UNLOGGED_BLOCKS_KEY = "@focusSprint/unlogged-focus-blocks-v1";

export type ActiveFocusBlock = {
  id: string;
  startedAt: string;
};

export type UnloggedFocusBlock = FocusBlock;

export async function getActiveFocusBlock(): Promise<ActiveFocusBlock | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_BLOCK_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveFocusBlock;
  } catch {
    return null;
  }
}

export async function setActiveFocusBlock(
  block: ActiveFocusBlock | null,
): Promise<void> {
  if (!block) {
    await AsyncStorage.removeItem(ACTIVE_BLOCK_KEY);
    return;
  }
  await AsyncStorage.setItem(ACTIVE_BLOCK_KEY, JSON.stringify(block));
}

export async function loadUnloggedFocusBlocks(): Promise<UnloggedFocusBlock[]> {
  const raw = await AsyncStorage.getItem(UNLOGGED_BLOCKS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as UnloggedFocusBlock[];
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveUnloggedFocusBlocks(
  blocks: UnloggedFocusBlock[],
): Promise<void> {
  await AsyncStorage.setItem(UNLOGGED_BLOCKS_KEY, JSON.stringify(blocks));
}

export async function appendUnloggedFocusBlock(
  block: UnloggedFocusBlock,
): Promise<void> {
  const current = await loadUnloggedFocusBlocks();
  const next = [...current, block];
  await saveUnloggedFocusBlocks(next);
}

export async function removeUnloggedFocusBlock(blockId: string): Promise<void> {
  const current = await loadUnloggedFocusBlocks();
  const next = current.filter((block) => block.id !== blockId);
  await saveUnloggedFocusBlocks(next);
}

export async function cancelActiveFocusBlock(): Promise<void> {
  await setActiveFocusBlock(null);
}

export async function completeActiveFocusBlock(): Promise<UnloggedFocusBlock | null> {
  const active = await getActiveFocusBlock();
  if (!active) return null;

  const startedAtMs = new Date(active.startedAt).getTime();
  const endedAtMs = Date.now();
  const durationSeconds = Math.max(
    0,
    Math.round((endedAtMs - startedAtMs) / 1000),
  );
  const blockLengthSeconds = 25 * 60;
  const blockCount =
    blockLengthSeconds > 0
      ? Math.max(0, Math.floor(durationSeconds / blockLengthSeconds))
      : 0;

  const block: UnloggedFocusBlock = {
    id: active.id,
    startedAt: active.startedAt,
    endedAt: new Date(endedAtMs).toISOString(),
    durationSeconds,
    blockCount,
  };

  await appendUnloggedFocusBlock(block);
  await setActiveFocusBlock(null);

  return block;
}
