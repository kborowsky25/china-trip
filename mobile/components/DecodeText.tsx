import React, { useEffect, useRef, useState } from "react";
import { Text, StyleProp, TextStyle } from "react-native";

// Scrambles through Chinese glyphs then resolves left-to-right into the English
// target — a "characters decoding into English" reveal for page entries.
const POOL = "中国北京成都重庆张家界上海台北香港龙山水云门天路江湖ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function DecodeText({
  text,
  style,
  frameMs = 45,
  settleStep = 3,
  head = 5,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  frameMs?: number;
  settleStep?: number;
  head?: number;
}) {
  const [display, setDisplay] = useState(text);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const chars = text.split("");
    const settleAt = chars.map((_, i) => head + i * settleStep);
    const maxFrame = Math.max(head, ...settleAt) + 1;
    let frame = 0;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      frame += 1;
      const out = chars
        .map((c, i) => {
          if (c === " ") return " ";
          if (frame >= settleAt[i]) return c;
          return POOL[Math.floor(Math.random() * POOL.length)];
        })
        .join("");
      setDisplay(out);
      if (frame > maxFrame) {
        if (timer.current) clearInterval(timer.current);
        setDisplay(text);
      }
    }, frameMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [text]);

  return <Text style={style}>{display}</Text>;
}
