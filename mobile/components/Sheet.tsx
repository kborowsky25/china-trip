import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors, radius, shadow } from "../lib/theme";

const SCREEN_H = Dimensions.get("window").height;
const SHEET_H = Math.round(SCREEN_H * 0.86);
const CLOSED = SCREEN_H + 40;
const OPEN = SCREEN_H - SHEET_H;

// Controlled swipeable sheet over the map. Drag the header down (or tap the
// backdrop) to dismiss.
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const ty = useSharedValue(CLOSED);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      ty.value = withSpring(OPEN, { damping: 24, stiffness: 220, mass: 0.9 });
    } else {
      ty.value = withTiming(CLOSED, { duration: 230, easing: Easing.in(Easing.cubic) }, (f) => {
        if (f) runOnJS(setMounted)(false);
      });
    }
  }, [open]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
  const backdropStyle = useAnimatedStyle(() => {
    const p = 1 - (ty.value - OPEN) / (CLOSED - OPEN);
    return { opacity: Math.max(0, Math.min(1, p)) * 0.28 };
  });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      ty.value = OPEN + Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 110 || e.velocityY > 800) runOnJS(onClose)();
      else ty.value = withSpring(OPEN, { damping: 24, stiffness: 220 });
    });

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />
      </Pressable>

      <Animated.View style={[styles.sheet, { height: SHEET_H }, sheetStyle]}>
        <GestureDetector gesture={pan}>
          <View style={styles.header}>
            <View style={styles.handle} />
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </View>
        </GestureDetector>
        <View style={{ flex: 1, paddingBottom: insets.bottom }}>{children}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0B1220" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: colors.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...shadow.card,
  },
  header: { alignItems: "center", paddingTop: 10, paddingBottom: 6 },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  title: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: colors.muted,
  },
});
