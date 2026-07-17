import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TRIP } from "../lib/data";
import { colors } from "../lib/theme";

// Live countdown to departure — days · hours · minutes.
export function Countdown() {
  const [t, setT] = useState<{ d: number; h: number; m: number; s: number; started: boolean }>({
    d: 0,
    h: 0,
    m: 0,
    s: 0,
    started: false,
  });

  useEffect(() => {
    const depart = new Date(TRIP.departISO).getTime();
    const tick = () => {
      const diff = depart - Date.now();
      if (diff <= 0) {
        setT({ d: 0, h: 0, m: 0, s: 0, started: true });
        return;
      }
      setT({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff % 864e5) / 36e5),
        m: Math.floor((diff % 36e5) / 6e4),
        s: Math.floor((diff % 6e4) / 1e3),
        started: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>DEPARTS 16 AUG · LGW</Text>
      {t.started ? (
        <Text style={styles.started}>Trip underway ✈</Text>
      ) : (
        <View style={styles.units}>
          <Unit n={t.d} l="days" />
          <Unit n={t.h} l="hrs" />
          <Unit n={t.m} l="min" />
          <Unit n={t.s} l="sec" />
        </View>
      )}
    </View>
  );
}

function Unit({ n, l }: { n: number; l: string }) {
  return (
    <View style={styles.unit}>
      <Text style={styles.num}>{String(n).padStart(2, "0")}</Text>
      <Text style={styles.unitLabel}>{l}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 6 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 1.6, color: colors.muted },
  units: { flexDirection: "row", alignItems: "flex-end", gap: 20, marginTop: 8 },
  unit: { alignItems: "center", minWidth: 40 },
  num: { fontSize: 30, fontWeight: "800", letterSpacing: -1, color: colors.ink, fontVariant: ["tabular-nums"] },
  unitLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6, color: colors.muted, marginTop: -2 },
  started: { fontSize: 26, fontWeight: "800", color: colors.ink, marginTop: 8 },
});
