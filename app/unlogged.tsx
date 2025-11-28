import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  loadUnloggedFocusBlocks,
  UnloggedFocusBlock,
} from "../lib/focus-blocks";

export default function Unlogged() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<UnloggedFocusBlock[]>([]);

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
    return () => {
      mounted = false;
    };
  }, []);

  const handleOpenBlock = (block: UnloggedFocusBlock) => {
    router.push({ pathname: "/block-reflect", params: { blockId: block.id } });
  };

  const renderItem = ({ item }: { item: UnloggedFocusBlock }) => (
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

  const hasBlocks = blocks.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16}>
            <Feather name="arrow-left" size={22} color="#3D4F5F" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Unlogged Focus Blocks</Text>

        {hasBlocks ? (
          <FlatList
            data={blocks}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No unlogged focus blocks 🎉</Text>
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
});

