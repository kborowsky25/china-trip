import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { FlightsCard } from "../FlightsCard";
import { colors } from "../../lib/theme";

export function FlightsContent() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.hint}>Tap a name to see their flights.</Text>
      <FlightsCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 28 },
  hint: { fontSize: 12.5, color: colors.muted, marginBottom: 12, fontWeight: "600" },
});
