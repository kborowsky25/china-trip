import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import Animated, { FadeOut } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProfileProvider, useProfile } from "../lib/profile";
import { AnimatedSplash } from "../components/AnimatedSplash";
import { colors } from "../lib/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNav() {
  const { ready } = useProfile();
  const [minDone, setMinDone] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // hand the native static splash off to the animated one right away
    SplashScreen.hideAsync().catch(() => {});
    const t = setTimeout(() => setMinDone(true), 2400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (ready && minDone) setShowSplash(false);
  }, [ready, minDone]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.night }}>
      {ready && (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.washTop },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="profile-select" options={{ animation: "fade" }} />
          <Stack.Screen
            name="stop/[n]"
            options={{ presentation: "card", animation: "slide_from_right" }}
          />
        </Stack>
      )}

      {showSplash && (
        <Animated.View exiting={FadeOut.duration(520)} style={StyleSheet.absoluteFill}>
          <AnimatedSplash />
        </Animated.View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProfileProvider>
          <StatusBar style="dark" />
          <RootNav />
        </ProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
