import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { WikiImage } from "./WikiImage";
import { WxBadge } from "./WxBadge";
import { Icon } from "./Icons";
import { Stop } from "../lib/data";
import { heroImageFor } from "../lib/heroImages";
import { colors, radius, shadow } from "../lib/theme";

// Image-forward route card: the photo does the talking, text is minimal.
export function StopPhotoCard({ stop, index, next }: { stop: Stop; index: number; next?: Stop }) {
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(420)}>
      <Pressable
        onPress={() => router.push(`/stop/${stop.n}`)}
        style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.985 }] }]}
      >
        <WikiImage
          title={stop.hero}
          city={stop.mapcity}
          lock={stop.n * 100}
          uri={heroImageFor(stop.mapcity)}
          style={styles.img as any}
        />
        <LinearGradient
          colors={["transparent", "rgba(8,10,14,0.15)", "rgba(8,10,14,0.86)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {stop.booked ? (
          <View style={styles.booked}>
            <Text style={styles.bookedTxt}>✓ Stay booked</Text>
          </View>
        ) : null}

        <View style={styles.overlay}>
          <View style={{ flex: 1 }}>
            <Text style={styles.num}>{String(stop.n).padStart(2, "0")}</Text>
            <Text style={styles.name}>{stop.name}</Text>
            <Text style={styles.dates}>{stop.dates}</Text>
          </View>
          <View style={styles.right}>
            <WxBadge lat={stop.c[0]} lng={stop.c[1]} variant="glass" />
            <View style={styles.days}>
              <Text style={styles.daysNum}>{stop.days}</Text>
              <Text style={styles.daysLbl}>days</Text>
            </View>
          </View>
        </View>
      </Pressable>

      {next ? <Connector stop={next} /> : <View style={{ height: 6 }} />}
    </Animated.View>
  );
}

function Connector({ stop }: { stop: Stop }) {
  const isFlight = stop.arrive.cls === "flight";
  const dur = stop.arrive.dur.split("·").slice(-1)[0].trim();
  return (
    <View style={styles.connector}>
      <View style={styles.line} />
      <View style={styles.mode}>
        {isFlight ? (
          <Text style={styles.modeIco}>✈</Text>
        ) : (
          <Icon name="train" size={12} color={colors.muted} />
        )}
        <Text style={styles.modeTxt}>{dur}</Text>
      </View>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 178,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#e4eaf2",
    ...shadow.card,
  },
  img: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  booked: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  bookedTxt: { fontSize: 10.5, fontWeight: "800", color: colors.green },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  num: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  name: { color: "#fff", fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginTop: 2 },
  dates: { color: "rgba(255,255,255,0.82)", fontSize: 12.5, fontWeight: "600", marginTop: 2 },
  right: { alignItems: "flex-end", gap: 8 },
  days: { alignItems: "center" },
  daysNum: { color: "#fff", fontSize: 20, fontWeight: "800", lineHeight: 22 },
  daysLbl: { color: "rgba(255,255,255,0.7)", fontSize: 9.5, fontWeight: "700", letterSpacing: 0.5 },
  connector: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 20 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  mode: { flexDirection: "row", alignItems: "center", gap: 5 },
  modeIco: { fontSize: 11, color: colors.muted },
  modeTxt: { fontSize: 11, fontWeight: "600", color: colors.muted },
});
