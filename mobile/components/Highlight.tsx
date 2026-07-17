import React from "react";
import { Text, StyleProp, TextStyle } from "react-native";
import { parseHighlights } from "../lib/data";
import { colors } from "../lib/theme";

// Renders a description string that contains <span class='hl'>…</span> markers,
// bolding the highlighted runs (mirrors the web app's .hl styling).
export function Highlight({
  text,
  style,
  hlStyle,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  hlStyle?: StyleProp<TextStyle>;
}) {
  const segs = parseHighlights(text);
  return (
    <Text style={style}>
      {segs.map((s, i) => (
        <Text
          key={i}
          style={s.hl ? [{ fontWeight: "700", color: colors.ink }, hlStyle] : undefined}
        >
          {s.text}
        </Text>
      ))}
    </Text>
  );
}
