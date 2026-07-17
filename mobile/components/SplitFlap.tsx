import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../lib/theme";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// A single flap cell that rapidly cycles characters then settles on its target —
// the classic airport departure-board (Solari) effect.
function Cell({ target, delay, size }: { target: string; delay: number; size: number }) {
  const [ch, setCh] = useState(target === " " ? " " : CHARS[0]);

  useEffect(() => {
    if (target === " ") {
      setCh(" ");
      return;
    }
    const spin = setInterval(() => {
      setCh(CHARS[Math.floor(Math.random() * CHARS.length)]);
    }, 55);
    const stop = setTimeout(() => {
      clearInterval(spin);
      setCh(target);
    }, delay);
    return () => {
      clearInterval(spin);
      clearTimeout(stop);
    };
  }, [target, delay]);

  if (target === " ") return <View style={{ width: size * 0.4 }} />;

  return (
    <View style={[styles.cell, { width: size, height: size * 1.28, borderRadius: size * 0.16 }]}>
      <Text style={[styles.char, { fontSize: size * 0.62 }]}>{ch}</Text>
      <View style={styles.seam} />
    </View>
  );
}

// A row of flap cells that resolves left-to-right into `text`.
export function SplitFlap({
  text,
  size = 46,
  baseDelay = 650,
  step = 95,
}: {
  text: string;
  size?: number;
  baseDelay?: number;
  step?: number;
}) {
  const chars = text.toUpperCase().split("");
  let letterIdx = 0;
  return (
    <View style={styles.row}>
      {chars.map((c, i) => {
        const delay = c === " " ? 0 : baseDelay + letterIdx * step;
        if (c !== " ") letterIdx += 1;
        return <Cell key={i} target={c} delay={delay} size={size} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  cell: {
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  char: { color: "#fff", fontWeight: "800", fontVariant: ["tabular-nums"], letterSpacing: -0.5 },
  seam: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
});
