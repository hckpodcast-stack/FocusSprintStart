import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "@focusSprint/focus-stats-v1";

export type FocusStats = {
  totalBlocks: number;
};

export async function loadFocusStats(): Promise<FocusStats> {
  const raw = await AsyncStorage.getItem(STATS_KEY);
  if (!raw) {
    return { totalBlocks: 0 };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<FocusStats> | null;
    if (!parsed || typeof parsed.totalBlocks !== "number") {
      return { totalBlocks: 0 };
    }
    return { totalBlocks: Math.max(0, Math.floor(parsed.totalBlocks)) };
  } catch {
    return { totalBlocks: 0 };
  }
}

export async function saveFocusStats(stats: FocusStats): Promise<void> {
  const normalized: FocusStats = {
    totalBlocks: Math.max(0, Math.floor(stats.totalBlocks)),
  };
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(normalized));
}

export async function incrementFocusBlocks(blockCount: number): Promise<void> {
  if (blockCount <= 0) return;
  const current = await loadFocusStats();
  const next: FocusStats = {
    totalBlocks: current.totalBlocks + blockCount,
  };
  await saveFocusStats(next);
}

