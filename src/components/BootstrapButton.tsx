import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "success" | "warning" | "danger" | "secondary";
  disabled?: boolean;
  width?: number | string;
};

export default function BootstrapButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  width = 200,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        {
          width,
          opacity: disabled ? 0.5 : 1,
          backgroundColor: pressed
            ? darkenColor(colors[variant])
            : colors[variant],
        },
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const colors: any = {
  primary: "#0d6efd",
  success: "#198754",
  warning: "#ffc107",
  danger: "#dc3545",
  secondary: "#6c757d",
};

// Oscurecer color (efecto pressed tipo Bootstrap)
const darkenColor = (hex: string) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max((num >> 16) - 20, 0);
  const g = Math.max(((num >> 8) & 0x00ff) - 20, 0);
  const b = Math.max((num & 0x0000ff) - 20, 0);
  return `rgb(${r}, ${g}, ${b})`;
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3, // sombra Android
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
