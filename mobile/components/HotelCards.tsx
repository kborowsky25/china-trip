import React from "react";
import { View, Text, StyleSheet, Pressable, Linking } from "react-native";
import { Stop, hotelLink } from "../lib/data";
import { colors, hotelTier } from "../lib/theme";

export function BookedStay({ stop }: { stop: Stop }) {
  const b = stop.booked!;
  return (
    <View style={styles.booked}>
      <View style={styles.head}>
        <Text style={styles.name} numberOfLines={2}>
          {b.name}
        </Text>
        <View style={styles.tag}>
          <Text style={styles.tagTxt}>BOOKED</Text>
        </View>
      </View>
      <Text style={styles.addr}>{b.addr}</Text>
      <View style={styles.grid}>
        <Cell label="IN" value={b.cinTxt} />
        <Cell label="OUT" value={b.coutTxt} />
        <Cell label="ROOM" value={b.room} />
      </View>
      <View style={styles.btns}>
        <Pressable style={[styles.btn, { backgroundColor: "#0071c2" }]} onPress={() => Linking.openURL(b.url)}>
          <Text style={styles.btnTxt}>Booking.com ↗</Text>
        </Pressable>
        <Pressable style={[styles.btn, { backgroundColor: colors.ink }]} onPress={() => Linking.openURL(b.maps)}>
          <Text style={styles.btnTxt}>Maps ↗</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function StaySearch({ stop }: { stop: Stop }) {
  const tiers = [
    { key: "budget" as const, tone: hotelTier.red, t: "Hostel £", s: "cheapest" },
    { key: "mid" as const, tone: hotelTier.yellow, t: "Mid ££", s: "average" },
    { key: "best" as const, tone: hotelTier.green, t: "4★ £££", s: "best value" },
  ];
  return (
    <View style={styles.hotels}>
      {tiers.map((tier) => (
        <Pressable
          key={tier.key}
          style={[styles.htl, { backgroundColor: tier.tone.bg, borderColor: tier.tone.border }]}
          onPress={() => Linking.openURL(hotelLink(stop.mapcity, stop.cin, stop.cout, tier.key))}
        >
          <Text style={[styles.htlP, { color: tier.tone.text }]}>{tier.t}</Text>
          <Text style={[styles.htlS, { color: tier.tone.text }]}>{tier.s}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  booked: {
    marginHorizontal: 16,
    backgroundColor: "#E7F5EC",
    borderColor: "#B5DEC2",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flex: 1, fontSize: 14, fontWeight: "800", color: "#14532d" },
  tag: { backgroundColor: "#1F7A39", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  tagTxt: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  addr: { fontSize: 11, color: "#4b6b56", marginTop: 6, lineHeight: 16 },
  grid: { flexDirection: "row", gap: 6, marginTop: 10 },
  cell: { flex: 1, backgroundColor: "#fff", borderColor: "#d5e9db", borderWidth: 1, borderRadius: 9, padding: 7 },
  cellLabel: { fontSize: 8.5, fontWeight: "800", letterSpacing: 0.6, color: "#6b8a76" },
  cellValue: { fontSize: 10.5, fontWeight: "800", marginTop: 2, color: "#14532d" },
  btns: { flexDirection: "row", gap: 6, marginTop: 10 },
  btn: { flex: 1, borderRadius: 9, paddingVertical: 9, alignItems: "center" },
  btnTxt: { color: "#fff", fontSize: 11.5, fontWeight: "800" },
  hotels: { flexDirection: "row", gap: 8, marginHorizontal: 16 },
  htl: { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  htlP: { fontSize: 13, fontWeight: "800" },
  htlS: { fontSize: 10, marginTop: 2, fontWeight: "600" },
});
