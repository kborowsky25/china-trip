import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Linking } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Icon } from "./Icons";
import { useProfile } from "../lib/profile";
import { mapsQ } from "../lib/data";
import { getPlaces, addPlace, deletePlace, Place } from "../lib/api";
import { colors, radius } from "../lib/theme";

type Form = { name: string; addr: string; cin: string; cout: string; room: string; link: string; note: string };
const EMPTY: Form = { name: "", addr: "", cin: "", cout: "", room: "", link: "", note: "" };

// Lets the group add hotels (with address → map, check-in/out, room, booking
// link) or spots — synced, offline-cached, tagged with who added them.
export function AddablePlaces({
  stopN,
  mapcity,
  kind,
  addLabel,
}: {
  stopN: number;
  mapcity: string;
  kind: "hotel" | "spot";
  addLabel: string;
}) {
  const { profile } = useProfile();
  const [places, setPlaces] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getPlaces(stopN).then((p) => alive && setPlaces(p.filter((x) => x.kind === kind)));
    return () => {
      alive = false;
    };
  }, [stopN, kind]);

  const set = (k: keyof Form) => (v: string) => setF((prev) => ({ ...prev, [k]: v }));

  async function save() {
    const name = f.name.trim();
    if (!name) return;
    setBusy(true);
    const next = await addPlace(stopN, {
      kind,
      name,
      url: f.link.trim(),
      note: f.note.trim(),
      addr: f.addr.trim(),
      cin: f.cin.trim(),
      cout: f.cout.trim(),
      room: f.room.trim(),
      by: profile?.name ?? "someone",
    });
    setPlaces(next.filter((x) => x.kind === kind));
    setF(EMPTY);
    setOpen(false);
    setBusy(false);
  }

  async function remove(id: string) {
    const next = await deletePlace(stopN, id);
    setPlaces(next.filter((x) => x.kind === kind));
  }

  return (
    <View style={{ marginHorizontal: 16, marginTop: 10 }}>
      {places.map((p) =>
        kind === "hotel" ? (
          <AddedHotel key={p.id} p={p} mapcity={mapcity} onDelete={() => remove(p.id)} />
        ) : (
          <AddedSpot key={p.id} p={p} mapcity={mapcity} onDelete={() => remove(p.id)} />
        )
      )}

      {open ? (
        <Animated.View entering={FadeIn.duration(160)} style={styles.form}>
          <TextInput style={styles.input} value={f.name} onChangeText={set("name")} placeholder={kind === "hotel" ? "Hotel name *" : "Place name *"} placeholderTextColor={colors.faint} autoFocus />
          <TextInput style={styles.input} value={f.addr} onChangeText={set("addr")} placeholder="Address / area (opens in Maps)" placeholderTextColor={colors.faint} />
          {kind === "hotel" ? (
            <>
              <View style={styles.rowInputs}>
                <TextInput style={[styles.input, { flex: 1 }]} value={f.cin} onChangeText={set("cin")} placeholder="Check-in" placeholderTextColor={colors.faint} />
                <TextInput style={[styles.input, { flex: 1 }]} value={f.cout} onChangeText={set("cout")} placeholder="Check-out" placeholderTextColor={colors.faint} />
              </View>
              <TextInput style={styles.input} value={f.room} onChangeText={set("room")} placeholder="Room / price (e.g. Twin · £120)" placeholderTextColor={colors.faint} />
            </>
          ) : (
            <TextInput style={styles.input} value={f.note} onChangeText={set("note")} placeholder="Note (optional)" placeholderTextColor={colors.faint} />
          )}
          <TextInput style={styles.input} value={f.link} onChangeText={set("link")} placeholder="Booking link (optional)" placeholderTextColor={colors.faint} autoCapitalize="none" autoCorrect={false} />
          <View style={styles.formBtns}>
            <Pressable onPress={() => { setOpen(false); setF(EMPTY); }} style={styles.cancel}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </Pressable>
            <Pressable onPress={save} style={styles.save} disabled={busy}>
              <Text style={styles.saveTxt}>{busy ? "Saving…" : "Save"}</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : (
        <Pressable style={styles.addBtn} onPress={() => setOpen(true)}>
          <Text style={styles.addPlus}>+</Text>
          <Text style={styles.addTxt}>{addLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function AddedHotel({ p, mapcity, onDelete }: { p: Place; mapcity: string; onDelete: () => void }) {
  const maps = mapsQ(p.addr && p.addr.length ? p.addr : `${p.name} ${mapcity}`);
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardName} numberOfLines={2}>
          {p.name}
        </Text>
        <View style={styles.tag}>
          <Text style={styles.tagTxt}>BOOKED</Text>
        </View>
        <Pressable onPress={onDelete} hitSlop={8} style={{ padding: 4 }}>
          <Icon name="trash" size={14} color={colors.muted} />
        </Pressable>
      </View>
      {p.addr ? <Text style={styles.cardAddr}>{p.addr}</Text> : null}
      {p.cin || p.cout || p.room ? (
        <View style={styles.grid}>
          {p.cin ? <Mini label="IN" value={p.cin} /> : null}
          {p.cout ? <Mini label="OUT" value={p.cout} /> : null}
          {p.room ? <Mini label="ROOM" value={p.room} /> : null}
        </View>
      ) : null}
      <View style={styles.cardBtns}>
        {p.url ? (
          <Pressable style={[styles.cbtn, { backgroundColor: "#0071c2" }]} onPress={() => Linking.openURL(p.url!)}>
            <Text style={styles.cbtnTxt}>Booking ↗</Text>
          </Pressable>
        ) : null}
        <Pressable style={[styles.cbtn, { backgroundColor: colors.ink }]} onPress={() => Linking.openURL(maps)}>
          <Text style={styles.cbtnTxt}>Maps ↗</Text>
        </Pressable>
      </View>
      <Text style={styles.by}>booked · added by {p.by}</Text>
    </View>
  );
}

function AddedSpot({ p, mapcity, onDelete }: { p: Place; mapcity: string; onDelete: () => void }) {
  const maps = p.url && p.url.length ? p.url : mapsQ(p.addr && p.addr.length ? p.addr : `${p.name} ${mapcity}`);
  return (
    <View style={styles.spot}>
      <Pressable style={{ flex: 1 }} onPress={() => Linking.openURL(maps)}>
        <Text style={styles.spotName}>{p.name}</Text>
        {p.note ? <Text style={styles.spotNote}>{p.note}</Text> : null}
        <Text style={styles.spotMeta}>Open in Maps ↗ · by {p.by}</Text>
      </Pressable>
      <Pressable onPress={onDelete} hitSlop={8} style={{ padding: 4 }}>
        <Icon name="trash" size={14} color={colors.muted} />
      </Pressable>
    </View>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.mini}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#E7F5EC", borderColor: "#B5DEC2", borderWidth: 1, borderRadius: radius.md, padding: 13, marginBottom: 8 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardName: { flex: 1, fontSize: 14, fontWeight: "800", color: "#14532d" },
  tag: { backgroundColor: "#1F7A39", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  tagTxt: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  cardAddr: { fontSize: 11, color: "#4b6b56", marginTop: 6, lineHeight: 16 },
  grid: { flexDirection: "row", gap: 6, marginTop: 10 },
  mini: { flex: 1, backgroundColor: "#fff", borderColor: "#d5e9db", borderWidth: 1, borderRadius: 9, padding: 7 },
  miniLabel: { fontSize: 8.5, fontWeight: "800", letterSpacing: 0.6, color: "#6b8a76" },
  miniValue: { fontSize: 10.5, fontWeight: "800", marginTop: 2, color: "#14532d" },
  cardBtns: { flexDirection: "row", gap: 6, marginTop: 10 },
  cbtn: { flex: 1, borderRadius: 9, paddingVertical: 9, alignItems: "center" },
  cbtnTxt: { color: "#fff", fontSize: 11.5, fontWeight: "800" },
  by: { fontSize: 10.5, color: "#4b6b56", marginTop: 8, fontWeight: "600" },

  spot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 13,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    marginBottom: 8,
  },
  spotName: { fontSize: 14, fontWeight: "700", color: colors.ink },
  spotNote: { fontSize: 12, color: colors.muted, marginTop: 2 },
  spotMeta: { fontSize: 10.5, color: colors.accent2, marginTop: 3, fontWeight: "600" },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: "dashed",
    borderRadius: radius.md,
    paddingVertical: 13,
  },
  addPlus: { fontSize: 17, color: colors.red, fontWeight: "800", marginTop: -2 },
  addTxt: { fontSize: 13.5, fontWeight: "700", color: colors.ink },
  form: { gap: 8, backgroundColor: colors.surface2, borderRadius: radius.md, padding: 12 },
  rowInputs: { flexDirection: "row", gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: colors.ink,
    backgroundColor: "#fff",
  },
  formBtns: { flexDirection: "row", gap: 8, marginTop: 2 },
  cancel: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line },
  cancelTxt: { fontSize: 13, fontWeight: "700", color: colors.muted },
  save: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 10, backgroundColor: colors.red },
  saveTxt: { fontSize: 13, fontWeight: "800", color: "#fff" },
});
