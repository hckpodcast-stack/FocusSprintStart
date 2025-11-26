import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type BackButtonProps = {
  onPressOverride?: () => void;
};

export function BackButton({ onPressOverride }: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPressOverride) {
      onPressOverride();
      return;
    }
    router.back();
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={16} style={styles.button}>
      <Feather name="arrow-left" size={22} color="#3D4F5F" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 4,
  },
});

