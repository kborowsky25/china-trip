import React, { useState } from "react";
import { View, ScrollView, Text, StyleSheet, Pressable } from "react-native";
import { Countdown } from "../Countdown";
import { StopPhotoCard } from "../StopPhotoCard";
import { TimelineContent } from "./TimelineContent";
import { STOPS } from "../../lib/data";
import { colors, radius } from "../../lib/theme";

export function ItineraryContent() {
  const [tab, setTab] = useState<"route" | "timeline">("route");

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.top}>
        <Countdown />
        <View style={styles.seg}>
          <SegBtn label="Route" on={tab === "route"} onPress={() => setTab("route")} />
          <SegBtn label="Timeline" on={tab === "timeline"} onPress={() => setTab("timeline")} />
        </View>
      </View>

      {tab === "route" ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {STOPS.map((s, i) => (
            <StopPhotoCard key={s.n} stop={s} index={i} next={STOPS[i + 1]} />
          ))}
        </ScrollView>
      ) : (
        <TimelineContent />
      )}
    </View>
  );
}

function SegBtn({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.segBtn, on && styles.segBtnOn]} onPress={onPress}>
      <Text style={[styles.segTxt, on && styles.segTxtOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 16, paddingBottom: 8 },
  seg: {
    flexDirection: "row",
    backgroundColor: colors.surface2,
    borderRadius: radius.pill,
    padding: 4,
    marginTop: 14,
  },
  segBtn: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: radius.pill },
  segBtnOn: { backgroundColor: colors.ink },
  segTxt: { fontSize: 13, fontWeight: "800", color: colors.muted },
  segTxtOn: { color: "#fff" },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 130 },
});
