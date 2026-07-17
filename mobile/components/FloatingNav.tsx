import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "./Icons";
import { colors, radius, shadow } from "../lib/theme";

export type SheetKey = "itinerary" | "hotels" | "budget" | "flights";

const NAV: { key: SheetKey; icon: string; label: string }[] = [
  { key: "itinerary", icon: "list", label: "Trip" },
  { key: "hotels", icon: "bed", label: "Hotels" },
  { key: "budget", icon: "budget", label: "Budget" },
  { key: "flights", icon: "plane", label: "Flights" },
];

export function FloatingNav({
  active,
  playing,
  onSelect,
  onPlay,
}: {
  active: SheetKey | null;
  playing: boolean;
  onSelect: (k: SheetKey) => void;
  onPlay: () => void;
}) {
  const insets = useSafeAreaInsets();

  const item = (k: SheetKey) => {
    const spec = NAV.find((n) => n.key === k)!;
    const on = active === k;
    return (
      <Pressable
        key={k}
        style={styles.tab}
        hitSlop={6}
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onSelect(k);
        }}
      >
        <Icon name={spec.icon} size={22} color={on ? colors.red : colors.faint} />
        {on ? <Text style={styles.label}>{spec.label}</Text> : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom ? insets.bottom - 6 : 10 }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {item("itinerary")}
        {item("hotels")}
        <View style={styles.fabSlot}>
          <PlayFab playing={playing} onPress={onPlay} />
        </View>
        {item("budget")}
        {item("flights")}
      </View>
    </View>
  );
}

function PlayFab({ playing, onPress }: { playing: boolean; onPress: () => void }) {
  const pulse = useSharedValue(0);
  const press = useSharedValue(0);

  useEffect(() => {
    if (playing) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 0 })
      ),
      -1
    );
  }, [playing]);

  const ring = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.55 }],
  }));
  const fab = useAnimatedStyle(() => ({ transform: [{ scale: 1 - press.value * 0.08 }] }));

  return (
    <Pressable
      onPressIn={() => (press.value = withTiming(1, { duration: 90 }))}
      onPressOut={() => (press.value = withTiming(0, { duration: 140 }))}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPress();
      }}
      hitSlop={10}
    >
      <Animated.View style={[styles.pulse, ring]} />
      <Animated.View style={[styles.fab, fab]}>
        <View style={styles.fabRing} />
        {playing ? (
          <View style={styles.stopRow}>
            <View style={styles.stopBar} />
            <View style={styles.stopBar} />
          </View>
        ) : (
          <Icon name="play" size={24} color="#fff" />
        )}
      </Animated.View>
    </Pressable>
  );
}

const FAB = 60;

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, bottom: 0, alignItems: "center" },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paper,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: 10,
    height: 62,
    marginHorizontal: 16,
    ...shadow.card,
  },
  tab: { width: 58, alignItems: "center", justifyContent: "center", gap: 3 },
  label: { fontSize: 10, fontWeight: "800", color: colors.red, letterSpacing: 0.2 },
  fabSlot: { width: 74, alignItems: "center", justifyContent: "center" },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    ...shadow.fab,
  },
  fabRing: {
    position: "absolute",
    width: FAB - 8,
    height: FAB - 8,
    borderRadius: (FAB - 8) / 2,
    borderWidth: 1.5,
    borderColor: "rgba(245,192,66,0.9)",
  },
  pulse: {
    position: "absolute",
    alignSelf: "center",
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    backgroundColor: colors.red,
    marginTop: -28,
  },
  playLabel: {
    position: "absolute",
    bottom: -3,
    alignSelf: "center",
    fontSize: 10,
    fontWeight: "800",
    color: colors.red,
  },
  stopRow: { flexDirection: "row", gap: 4 },
  stopBar: { width: 5, height: 18, borderRadius: 1.5, backgroundColor: "#fff" },
});
