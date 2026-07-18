import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, {
  Marker,
  MarkerAnimated,
  Polyline,
  AnimatedRegion,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import * as Location from "expo-location";
import { STOPS, COORDS, LatLng } from "../lib/data";
import { buildRoutes, decimate, LL, Route } from "../lib/geo";
import { colors } from "../lib/theme";

export interface TripMapHandle {
  play: () => void;
  fit: () => void;
  locate: () => Promise<boolean>;
}

const CHINA_REGION = { latitude: 28, longitude: 110, latitudeDelta: 34, longitudeDelta: 34 };
const ALL: LL[] = [
  ...STOPS.map((s) => ({ latitude: s.c[0], longitude: s.c[1] })),
  { latitude: COORDS.Macau[0], longitude: COORDS.Macau[1] },
];

export const TripMap = forwardRef<
  TripMapHandle,
  { onSelectStop: (n: number) => void; onPlayState?: (on: boolean) => void }
>(({ onSelectStop, onPlayState }, ref) => {
  const mapRef = useRef<MapView>(null);
  const routes = useMemo(() => buildRoutes(), []);
  const playing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showUser, setShowUser] = useState(false);

  function fit() {
    mapRef.current?.fitToCoordinates(ALL, {
      edgePadding: { top: 90, right: 60, bottom: 130, left: 60 },
      animated: true,
    });
  }

  function stopPlay() {
    playing.current = false;
    if (timer.current) clearTimeout(timer.current);
    onPlayState?.(false);
  }

  useImperativeHandle(ref, () => ({
    fit,
    play: () => {
      if (playing.current) {
        stopPlay();
        fit();
        return;
      }
      playing.current = true;
      onPlayState?.(true);
      let i = 0;
      const step = () => {
        if (!playing.current) return;
        if (i >= STOPS.length) {
          playing.current = false;
          onPlayState?.(false);
          fit();
          return;
        }
        const s = STOPS[i];
        mapRef.current?.animateToRegion(
          { latitude: s.c[0], longitude: s.c[1], latitudeDelta: 2.6, longitudeDelta: 2.6 },
          1300
        );
        i += 1;
        timer.current = setTimeout(step, 2300);
      };
      mapRef.current?.animateToRegion(
        { latitude: COORDS.Beijing[0], longitude: COORDS.Beijing[1], latitudeDelta: 9, longitudeDelta: 9 },
        1000
      );
      timer.current = setTimeout(step, 900);
    },
    locate: async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return false;
        setShowUser(true);
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        mapRef.current?.animateToRegion(
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude, latitudeDelta: 2, longitudeDelta: 2 },
          800
        );
        return true;
      } catch {
        return false;
      }
    },
  }));

  useEffect(() => () => stopPlay(), []);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      provider={PROVIDER_DEFAULT}
      initialRegion={CHINA_REGION}
      mapType="mutedStandard"
      showsUserLocation={showUser}
      showsMyLocationButton={false}
      showsCompass={false}
      showsPointsOfInterest={false}
      pitchEnabled={false}
      rotateEnabled={false}
      onMapReady={fit}
    >
      {routes.map((r, i) => (
        <Polyline
          key={"r" + i}
          coordinates={r.coords}
          strokeColor={r.kind === "boat" ? colors.gold : r.kind === "train" ? "#C8102E" : colors.red}
          strokeWidth={r.kind === "train" ? 3 : 2.6}
          lineDashPattern={r.kind === "boat" ? [6, 7] : undefined}
          lineCap="round"
        />
      ))}

      {STOPS.map((s) => (
        <Marker
          key={s.n}
          coordinate={{ latitude: s.c[0], longitude: s.c[1] }}
          anchor={{ x: 0.12, y: 0.5 }}
          onPress={() => onSelectStop(s.n)}
          tracksViewChanges={false}
        >
          <View style={styles.pinRow}>
            <View style={styles.dot} />
            <Text style={styles.label}>{s.name}</Text>
          </View>
        </Marker>
      ))}

      <Terminal coord={COORDS.Macau} label="Macau" gold />
      <Terminal coord={COORDS.CDG} label="Paris" />
      <Terminal coord={COORDS.London} label="London" />

      {routes.map((r, i) => (
        <Mover key={"m" + i} coords={r.coords} kind={r.kind} />
      ))}
    </MapView>
  );
});

TripMap.displayName = "TripMap";

function Terminal({ coord, label, gold }: { coord: LatLng; label: string; gold?: boolean }) {
  return (
    <Marker
      coordinate={{ latitude: coord[0], longitude: coord[1] }}
      anchor={{ x: 0.12, y: 0.5 }}
      tracksViewChanges={false}
    >
      <View style={styles.pinRow}>
        <View style={[styles.dotTerm, gold && { backgroundColor: colors.gold }]} />
        <Text style={styles.labelTerm}>{label}</Text>
      </View>
    </Marker>
  );
}

function Mover({ coords, kind }: { coords: LL[]; kind: Route["kind"] }) {
  const path = useMemo(() => decimate(coords, 22), [coords]);
  const region = useRef(
    new AnimatedRegion({
      latitude: path[0].latitude,
      longitude: path[0].longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  useEffect(() => {
    let idx = 0;
    let cancelled = false;
    const total = kind === "train" ? 9000 : kind === "boat" ? 6000 : 12000;
    const stepDur = total / path.length;
    const run = () => {
      if (cancelled) return;
      idx += 1;
      if (idx >= path.length) {
        region.setValue({
          latitude: path[0].latitude,
          longitude: path[0].longitude,
          latitudeDelta: 0,
          longitudeDelta: 0,
        });
        idx = 0;
        timer = setTimeout(run, 40);
        return;
      }
      region
        .timing({
          latitude: path[idx].latitude,
          longitude: path[idx].longitude,
          latitudeDelta: 0,
          longitudeDelta: 0,
          duration: stepDur,
          useNativeDriver: false,
        } as any)
        .start(() => run());
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    run();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const icon = kind === "train" ? "🚄" : kind === "boat" ? "⛴️" : "✈️";
  return (
    <MarkerAnimated coordinate={region as any} anchor={{ x: 0.5, y: 0.5 }} flat tracksViewChanges={false}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
    </MarkerAnimated>
  );
}

const styles = StyleSheet.create({
  pinRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 13, height: 13, borderRadius: 7, backgroundColor: colors.red, borderWidth: 2.5, borderColor: "#fff" },
  dotTerm: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.faint, borderWidth: 2, borderColor: "#fff" },
  label: {
    marginLeft: 4,
    fontSize: 12.5,
    fontWeight: "800",
    color: colors.ink,
    textShadowColor: "rgba(255,255,255,0.95)",
    textShadowRadius: 3,
  },
  labelTerm: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700",
    color: colors.muted,
    textShadowColor: "rgba(255,255,255,0.95)",
    textShadowRadius: 3,
  },
});
