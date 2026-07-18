import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { Easing, FadeIn, FadeInUp } from "react-native-reanimated";
import { Avatar } from "../components/Avatar";
import { useProfile } from "../lib/profile";
import { TRAVELLERS } from "../lib/data";
import { colors } from "../lib/theme";

const PANDA = require("../assets/splash.png");
const EASE = Easing.out(Easing.cubic);

export default function ProfileSelect() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profileId, setProfile } = useProfile();
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    if (!chosen) return;
    const t = setTimeout(async () => {
      await setProfile(chosen);
      if (router.canGoBack()) router.back();
      else router.replace("/home");
    }, 700);
    return () => clearTimeout(t);
  }, [chosen]);

  const chosenT = chosen ? TRAVELLERS.find((t) => t.id === chosen) : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      <Animated.View entering={FadeIn.duration(500)} style={styles.brand}>
        <Image source={PANDA} style={styles.panda} contentFit="contain" />
        <Text style={styles.kicker}>XENIA IN CHINA</Text>
      </Animated.View>

      <Animated.Text entering={FadeInUp.delay(120).duration(460).easing(EASE)} style={styles.title}>
        {profileId ? "Switch traveller" : "Who's travelling?"}
      </Animated.Text>

      <View style={styles.grid}>
        {TRAVELLERS.map((t, i) => (
          <Animated.View key={t.id} entering={FadeInUp.delay(200 + i * 70).duration(460).easing(EASE)}>
            <Pressable
              onPress={() => setChosen(t.id)}
              style={({ pressed }) => [styles.person, pressed && { opacity: 0.6 }]}
            >
              <Avatar id={t.id} name={t.name} size={84} ring={t.id === profileId} />
              <Text style={styles.name}>{t.name}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <Text style={styles.foot}>Change anytime from the map.</Text>

      {/* clean fade take-over on selection */}
      {chosenT ? (
        <Animated.View entering={FadeIn.duration(260)} style={styles.overlay}>
          <Animated.View entering={FadeIn.duration(420)} style={{ alignItems: "center" }}>
            <Avatar id={chosenT.id} name={chosenT.name} size={128} ring />
            <View style={styles.rule} />
            <Text style={styles.enterName}>{chosenT.name}</Text>
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: "center" },
  brand: { alignItems: "center", marginTop: 32 },
  panda: { width: 116, height: 116 },
  kicker: { fontSize: 11, fontWeight: "800", letterSpacing: 3, color: colors.muted, marginTop: 4 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.6, color: colors.ink, marginTop: 22 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 26,
    marginTop: 40,
    paddingHorizontal: 24,
  },
  person: { alignItems: "center", gap: 12, width: 96 },
  name: { fontSize: 16, fontWeight: "700", color: colors.ink },
  foot: { position: "absolute", bottom: 40, fontSize: 12.5, color: colors.faint, fontWeight: "600" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  rule: { width: 28, height: 2, borderRadius: 2, backgroundColor: colors.gold, marginTop: 22 },
  enterName: { fontSize: 24, fontWeight: "800", letterSpacing: -0.4, color: colors.ink, marginTop: 16 },
});
