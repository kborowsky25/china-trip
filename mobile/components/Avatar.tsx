import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Panda } from "./Panda";
import { avatarFor } from "../lib/data";
import { colors } from "../lib/theme";

export function Avatar({
  id,
  name,
  size = 40,
  ring = false,
}: {
  id: string;
  name: string;
  size?: number;
  ring?: boolean;
}) {
  const src = avatarFor(id);
  const radius = size / 2;
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: ring ? 2 : 0,
          borderColor: "#fff",
        },
      ]}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={{ width: size, height: size, borderRadius: radius }}
          contentFit="cover"
          transition={120}
        />
      ) : (
        <Panda size={size} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.accent,
  },
  initial: { color: "#fff", fontWeight: "800" },
});
