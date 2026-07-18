import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { BookedStay, StaySearch } from "../HotelCards";
import { AddablePlaces } from "../AddablePlaces";
import { Icon } from "../Icons";
import { STOPS } from "../../lib/data";
import { colors } from "../../lib/theme";

// Every hotel across the trip in one place — booked stays, group-added hotels,
// and search links per city.
export function HotelsContent() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {STOPS.map((s) => (
        <View key={s.n} style={styles.block}>
          <Pressable style={styles.cityRow} onPress={() => router.push(`/stop/${s.n}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.city}>{s.name}</Text>
              <Text style={styles.dates}>
                {s.dates} · {s.booked ? "1 booked" : "not booked yet"}
              </Text>
            </View>
            <Icon name="chevron" size={18} color={colors.faint} />
          </Pressable>
          {s.booked ? <BookedStay stop={s} /> : <StaySearch stop={s} />}
          <AddablePlaces stopN={s.n} mapcity={s.mapcity} kind="hotel" addLabel="Add a hotel" />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 4, paddingBottom: 28 },
  block: { marginBottom: 22 },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  city: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3, color: colors.ink },
  dates: { fontSize: 12, color: colors.muted, marginTop: 2, fontWeight: "600" },
});
