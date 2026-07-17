import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import { fetchWx, CurrentWx } from "../lib/services";
import { wcode } from "../lib/data";
import { colors } from "../lib/theme";

// Small live-temperature pill. `glass` variant sits on top of a photo.
export function WxBadge({
  lat,
  lng,
  variant = "light",
}: {
  lat: number;
  lng: number;
  variant?: "light" | "glass";
}) {
  const [wx, setWx] = useState<CurrentWx | null | "loading">("loading");

  useEffect(() => {
    let alive = true;
    fetchWx(lat, lng).then((w) => {
      if (alive) setWx(w);
    });
    return () => {
      alive = false;
    };
  }, [lat, lng]);

  if (wx === "loading" || wx === null) {
    // stay quiet until we have a real reading — no "…"/"—" noise
    return null;
  }

  const label = `${wcode(wx.code).i} ${wx.t}°`;
  const glass = variant === "glass";
  return (
    <View style={[styles.badge, glass && styles.glass]}>
      <Text style={[styles.txt, glass && styles.txtGlass]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#eef3fb",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignItems: "center",
  },
  glass: { backgroundColor: "rgba(255,255,255,0.22)" },
  txt: { fontSize: 11, fontWeight: "700", color: "#436" },
  txtGlass: { color: "#fff", fontWeight: "800" },
});
