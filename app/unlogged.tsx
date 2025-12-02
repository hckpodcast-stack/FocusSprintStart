import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  loadUnloggedFocusBlocks,
  UnloggedFocusBlock,
} from "../lib/focus-blocks";
import { loadQuickMemos, QuickMemo } from "../lib/quick-memos";

export default function Unlogged() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<UnloggedFocusBlock[]>([]);
  const [quickMemos, setQuickMemos] = useState<QuickMemo[]>([]);
  const [tab, setTab] = useState<"blocks" | "memos">("blocks");
  const [selectedMemo, setSelectedMemo] = useState<QuickMemo | null>(null);

  useEffect(() => {
    let mounted = true;
    loadUnloggedFocusBlocks()
      .then((items) => {
        if (!mounted) return;
        const sorted = [...items].sort((a, b) =>
          a.startedAt.localeCompare(b.startedAt),
        );
        setBlocks(sorted);
      })
      .catch((error) => {
        console.log("Failed to load unlogged focus blocks", error);
      });
    loadQuickMemos()
      .then((items) => {
        if (!mounted) return;
        const sorted = [...items].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        );
        setQuickMemos(sorted);
      })
      .catch((error) => {
        console.log("Failed to load quick memos", error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenBlock = (block: UnloggedFocusBlock) => {
    router.push({ pathname: "/block-reflect", params: { blockId: block.id } });
  };

  const renderBlockItem = ({ item }: { item: UnloggedFocusBlock }) => (
    <TouchableOpacity
      style={styles.blockCard}
      activeOpacity={0.9}
      onPress={() => handleOpenBlock(item)}
    >
      <Text style={styles.blockLabel}>Unlabeled block</Text>
      <Text style={styles.blockTime}>
        {new Date(item.startedAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const renderMemoItem = ({ item }: { item: QuickMemo }) => (
    <TouchableOpacity
      style={styles.blockCard}
      activeOpacity={0.9}
      onPress={() => setSelectedMemo(item)}
    >
      <Text style={styles.blockLabel}>{item.title ?? "Untitled memo"}</Text>
      <Text style={styles.blockTime}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  const hasBlocks = blocks.length > 0;
  const hasMemos = quickMemos.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
            <Feather name="arrow-left" size={22} color="#3D4F5F" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, tab === "blocks" && styles.tabButtonActive]}
            onPress={() => setTab("blocks")}
          >
            <Text
              style={[styles.tabText, tab === "blocks" && styles.tabTextActive]}
            >
              Focus Blocks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, tab === "memos" && styles.tabButtonActive]}
            onPress={() => setTab("memos")}
          >
            <Text
              style={[styles.tabText, tab === "memos" && styles.tabTextActive]}
            >
              Quick Memos
            </Text>
          </TouchableOpacity>
        </View>

        {tab === "blocks" ? (
          hasBlocks ? (
            <FlatList
              data={blocks}
              keyExtractor={(item) => item.id}
              renderItem={renderBlockItem}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No unlogged focus blocks 🎉</Text>
            </View>
          )
        ) : hasMemos ? (
          <>
            <FlatList
              data={quickMemos}
              keyExtractor={(item) => item.id}
              renderItem={renderMemoItem}
              contentContainerStyle={styles.listContent}
            />
            {selectedMemo && (
              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>
                  {selectedMemo.title ?? "Untitled memo"}
                </Text>
                <Text style={styles.detailDate}>
                  {new Date(selectedMemo.createdAt).toLocaleString()}
                </Text>
                <Text style={styles.detailSummary}>
                  {selectedMemo.summary ?? "No summary"}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No quick memos yet</Text>
          </View>
        )}
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2F3C4A",
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F5F3EF",
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: "#D4F4E8",
  },
  tabText: {
    fontSize: 14,
    color: "#3D4F5F",
    fontWeight: "500",
  },
  tabTextActive: {
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
  },
  blockCard: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  blockLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2F3C4A",
    marginBottom: 2,
  },
  blockTime: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  emptyCard: {
    borderRadius: 18,
    backgroundColor: "#F5F3EF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 24,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  detailCard: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F3C4A",
    marginBottom: 6,
  },
  detailDate: {
    fontSize: 13,
    color: "#8D9299",
    marginBottom: 8,
  },
  detailSummary: {
    fontSize: 14,
    color: "#111827",
  },
});

