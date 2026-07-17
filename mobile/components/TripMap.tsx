import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import * as Location from "expo-location";
import { buildMapHtml } from "../lib/mapHtml";
import { colors } from "../lib/theme";

export interface TripMapHandle {
  play: () => void;
  fit: () => void;
  locate: () => Promise<boolean>;
}

export interface Leg {
  i: number;
  total: number;
  from: string;
  to: string;
  mode: string;
}

export const TripMap = forwardRef<
  TripMapHandle,
  {
    onSelectStop: (n: number) => void;
    onPlayState?: (on: boolean) => void;
    onLeg?: (leg: Leg | null) => void;
  }
>(({ onSelectStop, onPlayState, onLeg }, ref) => {
  const webRef = useRef<WebView>(null);
  const html = useMemo(() => buildMapHtml(), []);

  useImperativeHandle(ref, () => ({
    play: () => webRef.current?.injectJavaScript("window.__play&&window.__play();true;"),
    fit: () => webRef.current?.injectJavaScript("window.__fit&&window.__fit();true;"),
    locate: async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return false;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude, accuracy } = pos.coords;
        webRef.current?.injectJavaScript(
          `window.__setNativeLocation&&window.__setNativeLocation(${latitude},${longitude},${accuracy || 50});true;`
        );
        return true;
      } catch {
        return false;
      }
    },
  }));

  function onMessage(e: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg?.type === "stop" && msg.n) onSelectStop(msg.n);
      else if (msg?.type === "play") onPlayState?.(!!msg.on);
      else if (msg?.type === "leg") onLeg?.(msg.done ? null : (msg as Leg));
    } catch {
      // ignore
    }
  }

  return (
    <View style={styles.fill}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        onMessage={onMessage}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.red} />
            <Text style={styles.loadingTxt}>Loading map…</Text>
          </View>
        )}
        style={styles.fill}
      />
    </View>
  );
});

TripMap.displayName = "TripMap";

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#eef0ee" },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#f4f5f3",
  },
  loadingTxt: { color: colors.muted, fontSize: 13 },
});
