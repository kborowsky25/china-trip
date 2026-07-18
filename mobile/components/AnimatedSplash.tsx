import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SplitFlap } from "./SplitFlap";
import { colors } from "../lib/theme";

const PANDA = require("../assets/splash.png");

// Launch entry: an airport split-flap board flips to spell the destination,
// under the panda mark. Clean and light.
export function AnimatedSplash() {
  return (
    <View style={styles.fill}>
      <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: "center" }}>
        <Image source={PANDA} style={styles.panda} contentFit="contain" />
        <Text style={styles.kicker}>XENIA IN</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ marginTop: 14 }}>
        <SplitFlap text="CHINA" size={48} />
      </Animated.View>

      <Animated.Text entering={FadeIn.delay(1500).duration(600)} style={styles.caption}>
        AUG – SEP 2026
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  panda: { width: 84, height: 84 },
  kicker: { marginTop: 14, fontSize: 12, fontWeight: "800", letterSpacing: 4, color: colors.muted },
  caption: { marginTop: 24, fontSize: 11, fontWeight: "700", letterSpacing: 3, color: colors.faint },
});
