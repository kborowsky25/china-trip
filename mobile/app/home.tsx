import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TripMap, TripMapHandle } from "../components/TripMap";
import { FloatingNav, SheetKey } from "../components/FloatingNav";
import { Sheet } from "../components/Sheet";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icons";
import { ItineraryContent } from "../components/sheets/ItineraryContent";
import { HotelsContent } from "../components/sheets/HotelsContent";
import { BudgetContent } from "../components/sheets/BudgetContent";
import { FlightsContent } from "../components/sheets/FlightsContent";
import { useProfile } from "../lib/profile";
import { colors, shadow } from "../lib/theme";

const TITLES: Record<SheetKey, string> = {
  itinerary: "Itinerary",
  hotels: "Hotels",
  budget: "Budget",
  flights: "Flights",
};

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const mapRef = useRef<TripMapHandle>(null);

  const [active, setActive] = useState<SheetKey | null>(null);
  const [last, setLast] = useState<SheetKey>("itinerary");
  const [playing, setPlaying] = useState(false);

  function select(k: SheetKey) {
    setActive((prev) => {
      const next = prev === k ? null : k;
      if (next) setLast(next);
      return next;
    });
  }

  function content(k: SheetKey) {
    switch (k) {
      case "itinerary":
        return <ItineraryContent />;
      case "hotels":
        return <HotelsContent />;
      case "budget":
        return <BudgetContent />;
      case "flights":
        return <FlightsContent />;
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.washTop }}>
      <StatusBar style="dark" />

      <TripMap ref={mapRef} onSelectStop={(n) => router.push(`/stop/${n}`)} onPlayState={setPlaying} />

      {/* floating top row: identity + locate */}
      <View style={[styles.top, { top: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable
          onPress={() => router.push("/profile-select")}
          style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
          hitSlop={6}
        >
          {profile ? (
            <>
              <Avatar id={profile.id} name={profile.name} size={28} />
              <Text style={styles.chipName}>{profile.name}</Text>
              <Text style={styles.caret}>⌄</Text>
            </>
          ) : (
            <Text style={styles.chipName}>Choose</Text>
          )}
        </Pressable>

        <Pressable onPress={() => mapRef.current?.locate()} style={styles.locate} hitSlop={6}>
          <Icon name="loc" size={20} color={colors.ink} />
        </Pressable>
      </View>

      {/* floating nav */}
      <FloatingNav
        active={active}
        playing={playing}
        onSelect={select}
        onPlay={() => mapRef.current?.play()}
      />

      {/* sheet host */}
      <Sheet open={active !== null} onClose={() => setActive(null)} title={TITLES[last]}>
        {content(last)}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    position: "absolute",
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.paper,
    borderRadius: 999,
    paddingLeft: 5,
    paddingRight: 12,
    paddingVertical: 5,
    ...shadow.soft,
  },
  chipName: { fontSize: 14, fontWeight: "700", color: colors.ink },
  caret: { fontSize: 13, color: colors.muted, marginLeft: -3, marginTop: -2 },
  locate: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
});

