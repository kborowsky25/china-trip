import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "../Icons";
import { budgetRows, budgetTotal, tierName, Tier, TRANSPORT_EST, STOPS } from "../../lib/data";
import { loadFx, FxRates } from "../../lib/services";
import { colors, radius } from "../../lib/theme";

export function BudgetContent() {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>("m");
  const [amount, setAmount] = useState("100");
  const [fx, setFx] = useState<FxRates | null>(null);

  useEffect(() => {
    loadFx().then(setFx);
  }, []);

  const rows = useMemo(() => budgetRows(tier), [tier]);
  const total = useMemo(() => budgetTotal(tier), [tier]);
  const amt = parseFloat(amount || "0") || 0;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* hero total */}
      <Text style={styles.kicker}>PER PERSON · {tierName[tier].toUpperCase()}</Text>
      <Text style={styles.total}>£{total.toLocaleString()}</Text>
      <Text style={styles.caption}>24 days on the ground · excludes UK⇄China flights</Text>

      <View style={styles.tiers}>
        {(["b", "m", "c"] as Tier[]).map((t) => (
          <Pressable key={t} onPress={() => setTier(t)} style={[styles.tier, t === tier && styles.tierOn]}>
            <Text style={[styles.tierTxt, t === tier && styles.tierTxtOn]}>{tierName[t]}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.list}>
        {rows.map((r, i) => (
          <Pressable key={r.name} style={styles.row} onPress={() => router.push(`/stop/${STOPS[i].n}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{r.name}</Text>
              <Text style={styles.rowSub}>
                {r.days}d · £{r.daily}/day + £{r.acc} stay{r.booked ? " · booked" : ""}
              </Text>
            </View>
            <Text style={styles.rowVal}>£{r.sub.toLocaleString()}</Text>
            <Icon name="chevron" size={16} color={colors.faint} />
          </Pressable>
        ))}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowName}>Intercity transport</Text>
            <Text style={styles.rowSub}>trains · 3 flights · Macau ferry</Text>
          </View>
          <Text style={styles.rowVal}>£{TRANSPORT_EST}</Text>
          <View style={{ width: 16 }} />
        </View>
      </View>

      {/* FX */}
      <Text style={styles.fxLabel}>Currency</Text>
      <View style={styles.fxInput}>
        <Text style={styles.pound}>£</Text>
        <TextInput
          style={styles.field}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="100"
          placeholderTextColor={colors.faint}
        />
      </View>
      <View style={styles.fxRows}>
        <Fx label="CNY" symbol="¥" value={fx ? amt * fx.CNY : null} />
        <Fx label="HKD" symbol="HK$" value={fx ? amt * fx.HKD : null} />
        <Fx label="TWD" symbol="NT$" value={fx ? amt * fx.TWD : null} />
      </View>
    </ScrollView>
  );
}

function Fx({ label, symbol, value }: { label: string; symbol: string; value: number | null }) {
  return (
    <View style={styles.fxCell}>
      <Text style={styles.fxCur}>{label}</Text>
      <Text style={styles.fxVal}>{value === null ? "—" : symbol + Math.round(value).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 130 },
  kicker: { fontSize: 10, fontWeight: "800", letterSpacing: 2, color: colors.muted },
  total: { fontSize: 52, fontWeight: "800", letterSpacing: -2, color: colors.ink, marginTop: 6 },
  caption: { fontSize: 12.5, color: colors.muted, marginTop: 2, fontWeight: "600" },
  tiers: { flexDirection: "row", gap: 8, marginTop: 20 },
  tier: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: "center",
  },
  tierOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  tierTxt: { fontWeight: "800", fontSize: 12.5, color: colors.muted },
  tierTxtOn: { color: "#fff" },
  list: { marginTop: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowName: { fontSize: 15, fontWeight: "700", color: colors.ink },
  rowSub: { fontSize: 11, color: colors.muted, marginTop: 2, fontWeight: "500" },
  rowVal: { fontSize: 15, fontWeight: "800", color: colors.ink, fontVariant: ["tabular-nums"] },
  fxLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 2, color: colors.muted, marginTop: 28, marginBottom: 12 },
  fxInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  pound: { fontSize: 20, fontWeight: "800", color: colors.red },
  field: { flex: 1, fontSize: 20, fontWeight: "700", paddingVertical: 12, color: colors.ink },
  fxRows: { flexDirection: "row", gap: 10, marginTop: 12 },
  fxCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
  },
  fxCur: { fontSize: 10, fontWeight: "800", letterSpacing: 1, color: colors.muted },
  fxVal: { fontSize: 15, fontWeight: "800", color: colors.ink, marginTop: 3 },
});
