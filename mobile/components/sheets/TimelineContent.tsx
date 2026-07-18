import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Icon } from "../Icons";
import { STOPS } from "../../lib/data";
import { colors } from "../../lib/theme";

const nightsOf = (cin: string, cout: string) =>
  Math.round((new Date(cout + "T00:00:00").getTime() - new Date(cin + "T00:00:00").getTime()) / 86400000);

export function TimelineContent() {
  const total = STOPS.reduce((a, s) => a + nightsOf(s.cin, s.cout), 0);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.caption}>{STOPS.length} stops · {total} nights</Text>

      <Terminal label="Fly out" sub="16 Aug · London → Beijing" first />
      {STOPS.map((s, i) => (
        <React.Fragment key={s.n}>
          {i > 0 ? <Travel stop={s} /> : null}
          <StopNode n={s.n} name={s.name.replace(" + Macau", "")} dates={s.dates} nights={nightsOf(s.cin, s.cout)} />
        </React.Fragment>
      ))}
      <Terminal label="Fly home" sub="9–10 Sep · Hong Kong → London" last />
    </ScrollView>
  );
}

function Rail({ hideTop, hideBot, children }: { hideTop?: boolean; hideBot?: boolean; children: React.ReactNode }) {
  return (
    <View style={styles.rail}>
      {!hideTop ? <View style={[styles.line, { top: 0, bottom: "50%" }]} /> : null}
      {!hideBot ? <View style={[styles.line, { top: "50%", bottom: 0 }]} /> : null}
      {children}
    </View>
  );
}

function StopNode({ n, name, dates, nights }: { n: number; name: string; dates: string; nights: number }) {
  return (
    <View style={styles.row}>
      <Rail>
        <View style={styles.node}>
          <Text style={styles.nodeNum}>{n}</Text>
        </View>
      </Rail>
      <View style={styles.stopContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.stopName}>{name}</Text>
          <Text style={styles.stopDates}>{dates}</Text>
        </View>
        <View style={styles.nightsWrap}>
          <Text style={styles.nightsNum}>{nights}</Text>
          <Text style={styles.nightsLbl}>nights</Text>
        </View>
      </View>
    </View>
  );
}

// travel INTO a stop = that stop's arrival leg (shown above the stop node)
function Travel({ stop }: { stop: (typeof STOPS)[number] }) {
  const isFlight = stop.arrive.cls === "flight";
  const dur = stop.arrive.dur.split("·").slice(-1)[0].trim();
  return (
    <View style={styles.travelRow}>
      <Rail hideTop={stop.n === 1 ? false : false}>
        <View />
      </Rail>
      <View style={styles.travelContent}>
        {isFlight ? <Text style={styles.travelIco}>✈</Text> : <Icon name="train" size={13} color={colors.muted} />}
        <Text style={styles.travelTxt}>{dur}</Text>
      </View>
    </View>
  );
}

function TravelInto({ skip }: { stop: (typeof STOPS)[number]; skip?: boolean }) {
  if (skip) return null;
  return null;
}

function Terminal({ label, sub, first, last }: { label: string; sub: string; first?: boolean; last?: boolean }) {
  return (
    <View style={styles.row}>
      <Rail hideTop={first} hideBot={last}>
        <View style={styles.termNode}>
          <Text style={styles.termIco}>✈</Text>
        </View>
      </Rail>
      <View style={styles.stopContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.termName}>{label}</Text>
          <Text style={styles.stopDates}>{sub}</Text>
        </View>
      </View>
    </View>
  );
}

const RAIL = 46;

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 28 },
  caption: { fontSize: 12.5, color: colors.muted, marginBottom: 10, fontWeight: "600" },
  row: { flexDirection: "row", minHeight: 62 },
  travelRow: { flexDirection: "row", minHeight: 34 },
  rail: { width: RAIL, alignItems: "center", justifyContent: "center" },
  line: { position: "absolute", left: RAIL / 2 - 1, width: 2, backgroundColor: colors.line },
  node: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.red,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.bg,
  },
  nodeNum: { color: "#fff", fontWeight: "800", fontSize: 12 },
  termNode: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.bg,
  },
  termIco: { color: "#fff", fontSize: 12 },
  stopContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 6,
  },
  stopName: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3, color: colors.ink },
  termName: { fontSize: 15, fontWeight: "800", color: colors.ink },
  stopDates: { fontSize: 12.5, color: colors.muted, marginTop: 2, fontWeight: "600" },
  nightsWrap: { alignItems: "center", minWidth: 46 },
  nightsNum: { fontSize: 20, fontWeight: "800", color: colors.ink, lineHeight: 22 },
  nightsLbl: { fontSize: 9.5, fontWeight: "700", color: colors.faint, letterSpacing: 0.4 },
  travelContent: { flexDirection: "row", alignItems: "center", gap: 7, paddingLeft: 6 },
  travelIco: { fontSize: 12, color: colors.muted },
  travelTxt: { fontSize: 12, color: colors.muted, fontWeight: "600" },
});
