import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
} from "react-native";
import { Avatar } from "./Avatar";
import { Icon } from "./Icons";
import { useProfile } from "../lib/profile";
import { TRAVELLERS, travLegs, fr24, FlightLeg, Traveller } from "../lib/data";
import { colors, radius, shadow } from "../lib/theme";

export function FlightsCard() {
  const { profileId } = useProfile();
  const [selected, setSelected] = useState<string>(profileId ?? "sam");

  // Follow the active profile when it changes.
  useEffect(() => {
    if (profileId) setSelected(profileId);
  }, [profileId]);

  const t = TRAVELLERS.find((x) => x.id === selected) ?? TRAVELLERS[0];
  const { out, ret } = travLegs(t);

  return (
    <View style={styles.card}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {TRAVELLERS.map((tr) => {
          const on = tr.id === selected;
          return (
            <Pressable
              key={tr.id}
              onPress={() => setSelected(tr.id)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Avatar id={tr.id} name={tr.name} size={22} />
              <Text style={[styles.chipName, on && styles.chipNameOn]}>{tr.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.body}>
        <FlightSection title="Outbound" legs={out} />
        <FlightSection title="Return" legs={ret} />
        {t.note ? (
          <View style={styles.note}>
            <Text style={styles.noteText}>{t.note}</Text>
          </View>
        ) : null}
        {t.price ? (
          <Text style={styles.price}>
            Booked · <Text style={styles.priceB}>{t.price}</Text>
          </Text>
        ) : null}
        {t.bag ? (
          <View style={styles.bags}>
            <Bag icon="handbag" label="Hand baggage" value={t.bag.hand} />
            <Bag icon="luggage" label="Checked baggage" value={t.bag.checked} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function FlightSection({ title, legs }: { title: string; legs: FlightLeg[] }) {
  if (!legs.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>✈︎ {title}</Text>
      {legs.map((l, i) => (
        <Leg key={i} l={l} />
      ))}
    </View>
  );
}

function Leg({ l }: { l: FlightLeg }) {
  const inner = (
    <>
      <View style={{ flex: 1 }}>
        <Text style={styles.legRoute}>
          <Text style={{ fontWeight: "700" }}>{l.from}</Text> →{" "}
          <Text style={{ fontWeight: "700" }}>{l.to}</Text>
        </Text>
        {l.via ? <Text style={styles.via}>↳ via {l.via}</Text> : null}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.time}>
          {l.date ? <Text style={styles.date}>{l.date} </Text> : null}
          {l.dep} → {l.arr}
          {l.arrPlus ? <Text style={styles.plus}> {l.arrPlus}</Text> : null}
        </Text>
        {l.code ? <Text style={styles.code}>{l.code} · track ↗</Text> : null}
        {l.dur ? <Text style={styles.dur}>{l.dur}</Text> : null}
      </View>
    </>
  );
  if (l.code) {
    return (
      <Pressable style={styles.leg} onPress={() => Linking.openURL(fr24(l.code!))}>
        {inner}
      </Pressable>
    );
  }
  return <View style={styles.leg}>{inner}</View>;
}

function Bag({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.bag}>
      <Icon name={icon} size={18} color={colors.accent2} />
      <View>
        <Text style={styles.bagLabel}>{label}</Text>
        <Text style={styles.bagValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    ...shadow.soft,
  },
  chips: { gap: 6, padding: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingLeft: 5,
    paddingRight: 12,
    paddingVertical: 5,
  },
  chipOn: { backgroundColor: colors.blue, borderColor: "transparent" },
  chipName: { fontSize: 12.5, fontWeight: "700", color: colors.ink },
  chipNameOn: { color: "#fff" },
  body: { paddingHorizontal: 14, paddingBottom: 12 },
  section: { paddingVertical: 4 },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.muted,
    marginVertical: 4,
  },
  leg: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  legRoute: { fontSize: 12.5, lineHeight: 18, color: colors.ink },
  via: { fontSize: 11, color: colors.muted, marginTop: 2 },
  time: { fontSize: 12, color: colors.ink },
  date: { color: colors.muted, fontSize: 11 },
  plus: { color: colors.accent, fontWeight: "800", fontSize: 11 },
  code: { fontSize: 10, color: colors.blue, fontWeight: "700", marginTop: 2 },
  dur: { fontSize: 10, color: colors.muted, marginTop: 1 },
  note: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#fff7e6",
    borderColor: "#f0d79a",
    borderWidth: 1,
    borderRadius: 12,
  },
  noteText: { fontSize: 11.5, color: "#7a5800", lineHeight: 16 },
  price: { marginTop: 8, fontSize: 12.5, color: colors.ink },
  priceB: { fontWeight: "800", fontSize: 14 },
  bags: { flexDirection: "row", gap: 8, marginTop: 10 },
  bag: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#f7f9fc",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
  },
  bagLabel: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.muted,
  },
  bagValue: { fontSize: 12, fontWeight: "800", marginTop: 1, color: colors.ink },
});
