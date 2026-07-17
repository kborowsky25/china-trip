import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { WikiImage } from "../../components/WikiImage";
import { Icon } from "../../components/Icons";
import { DecodeText } from "../../components/DecodeText";
import { AddablePlaces } from "../../components/AddablePlaces";
import { BookedStay, StaySearch } from "../../components/HotelCards";
import { STOPS, mapsQ, wcode, hotelLink } from "../../lib/data";
import { heroImageFor } from "../../lib/heroImages";
import { hotelTier } from "../../lib/theme";
import { useProfile } from "../../lib/profile";
import { fetchWx, CurrentWx } from "../../lib/services";
import {
  getNote,
  saveNote,
  getReels,
  addReel,
  deleteReel,
  reelInfo,
  Reel,
} from "../../lib/api";
import { colors, radius } from "../../lib/theme";

type Tab = "ov" | "wx" | "nt" | "rl";

export default function StopDetail() {
  const { n } = useLocalSearchParams<{ n: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const stop = STOPS.find((s) => String(s.n) === String(n));
  const [tab, setTab] = useState<Tab>("ov");

  if (!stop) {
    return (
      <View style={styles.missing}>
        <Text>Stop not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.blue, marginTop: 8 }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.washTop }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.hero}>
            <WikiImage
              title={stop.hero}
              city={stop.mapcity}
              lock={stop.n * 100}
              uri={heroImageFor(stop.mapcity)}
              style={StyleSheet.absoluteFillObject as any}
            />
            <LinearGradient
              colors={["rgba(8,16,32,0.05)", "rgba(8,16,32,0.82)"]}
              style={StyleSheet.absoluteFillObject}
            />
            <Pressable
              onPress={() => router.back()}
              style={[styles.close, { top: insets.top + 8 }]}
              hitSlop={8}
            >
              <Icon name="close" size={16} color="#fff" />
            </Pressable>
            <View style={styles.heroText}>
              <DecodeText text={stop.name} style={styles.heroTitle} />
              <Text style={styles.heroSub}>
                {stop.dates} · {stop.days} days
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {(
              [
                ["ov", "Overview"],
                ["wx", "Weather"],
                ["nt", "Notes"],
                ["rl", "Reels"],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <Pressable key={key} style={styles.tab} onPress={() => setTab(key)}>
                <Text style={[styles.tabTxt, tab === key && styles.tabTxtOn]}>{label}</Text>
                {tab === key ? <View style={styles.tabUnderline} /> : null}
              </Pressable>
            ))}
          </View>

          {tab === "ov" && <Overview stop={stop} />}
          {tab === "wx" && <Weather stop={stop} />}
          {tab === "nt" && <Notes stopN={stop.n} stopName={stop.name} />}
          {tab === "rl" && <Reels stopN={stop.n} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---- Overview ----
function Overview({ stop }: { stop: (typeof STOPS)[number] }) {
  const { width } = useWindowDimensions();
  const galW = width - 28;
  const titles = [stop.hero, ...stop.see.map((a) => a.title)];
  const caps = [stop.name, ...stop.see.map((a) => a.name)];
  const [page, setPage] = useState(0);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / galW);
    if (idx !== page) setPage(idx);
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 14 }}
        style={{ marginTop: 12 }}
      >
        {titles.map((t, i) => (
          <View key={i} style={[styles.galImg, { width: galW }]}>
            <WikiImage
              title={t}
              city={stop.mapcity}
              lock={stop.n * 100 + i}
              uri={i === 0 ? heroImageFor(stop.mapcity) : undefined}
              style={{ width: "100%", height: "100%", borderRadius: 14 } as any}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)"]}
              style={styles.galCapWrap}
            >
              <Text style={styles.galCap}>{caps[i]}</Text>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {titles.map((_, i) => (
          <View key={i} style={[styles.dot, i === page && styles.dotOn]} />
        ))}
      </View>

      {/* quick facts */}
      <View style={styles.facts}>
        <View style={styles.fact}>
          <Text style={styles.factLabel}>CLIMATE</Text>
          <Text style={styles.factValue}>
            <Text style={{ color: colors.red }}>▲{stop.clim.hi}°</Text>{"  "}
            <Text style={{ color: colors.accent2 }}>▼{stop.clim.lo}°</Text>
          </Text>
        </View>
        <View style={styles.factDiv} />
        <View style={styles.fact}>
          <Text style={styles.factLabel}>ARRIVE BY</Text>
          <Text style={styles.factValue}>{stop.arrive.cls === "rail" ? "🚄 Rail" : "✈ Flight"}</Text>
        </View>
      </View>

      {/* stay */}
      <Text style={styles.label}>Stay</Text>
      {stop.booked ? <BookedStay stop={stop} /> : <StaySearch stop={stop} />}
      <AddablePlaces stopN={stop.n} mapcity={stop.mapcity} kind="hotel" addLabel="Add a hotel" />

      {/* getting there */}
      <Text style={styles.label}>Getting there</Text>
      <Pressable style={styles.transport} onPress={() => Linking.openURL(stop.arrive.book)}>
        <Text style={styles.transportMode}>{stop.arrive.mode}</Text>
        <Text style={styles.transportDur}>{stop.arrive.dur}</Text>
        <Text style={styles.transportGo}>Book ↗</Text>
      </Pressable>

      {/* see */}
      <Text style={styles.label}>See</Text>
      <View style={{ paddingHorizontal: 12 }}>
        {stop.see.map((a, i) => (
          <Pressable
            key={i}
            style={styles.dItem}
            onPress={() => Linking.openURL(mapsQ(a.q || `${a.name} ${stop.mapcity}`))}
          >
            <WikiImage
              title={a.title}
              city={stop.mapcity}
              lock={stop.n * 100 + i + 1}
              w={180}
              h={180}
              style={styles.dThumb as any}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.dName}>{a.name}</Text>
              <Text style={styles.dNote} numberOfLines={1}>
                {a.note}
              </Text>
            </View>
            <Icon name="chevron" size={18} color={colors.faint} />
          </Pressable>
        ))}
      </View>
      <AddablePlaces stopN={stop.n} mapcity={stop.mapcity} kind="spot" addLabel="Add a spot" />

      {/* guides */}
      <View style={styles.guides}>
        <Pressable style={styles.guide} onPress={() => Linking.openURL(mapsQ(stop.mapcity))}>
          <Icon name="map" size={15} color={colors.ink} />
          <Text style={styles.guideTxt}>Maps</Text>
        </Pressable>
        <Pressable
          style={styles.guide}
          onPress={() => Linking.openURL("https://en.wikivoyage.org/wiki/" + encodeURIComponent(stop.mapcity))}
        >
          <Icon name="book" size={15} color={colors.ink} />
          <Text style={styles.guideTxt}>Guide</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---- Weather ----
function Weather({ stop }: { stop: (typeof STOPS)[number] }) {
  const [wx, setWx] = useState<CurrentWx | null | "loading">("loading");
  useEffect(() => {
    fetchWx(stop.c[0], stop.c[1]).then(setWx);
  }, [stop.c]);

  const wc = wx && wx !== "loading" ? wcode(wx.code) : null;

  return (
    <View style={{ padding: 16 }}>
      <LinearGradient colors={[colors.heroA, colors.heroB]} style={styles.wxBig}>
        {wx === "loading" ? (
          <View style={styles.wxNow}>
            <Text style={styles.wxIcon}>⏳</Text>
            <View>
              <Text style={styles.wxTemp}>—</Text>
              <Text style={styles.wxCond}>Loading live conditions…</Text>
            </View>
          </View>
        ) : wx === null ? (
          <View style={styles.wxNow}>
            <Text style={styles.wxIcon}>📡</Text>
            <View>
              <Text style={[styles.wxTemp, { fontSize: 18 }]}>Offline</Text>
              <Text style={styles.wxCond}>Live weather needs a connection</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.wxNow}>
              <Text style={styles.wxIcon}>{wc!.i}</Text>
              <View>
                <Text style={styles.wxTemp}>{wx.t}°C</Text>
                <Text style={styles.wxCond}>
                  {wc!.t} right now in {stop.mapcity}
                </Text>
              </View>
            </View>
            <View style={styles.wxMeta}>
              <Text style={styles.wxMetaTxt}>💧 {wx.rh}% humidity</Text>
              <Text style={styles.wxMetaTxt}>💨 {wx.wind} km/h wind</Text>
            </View>
          </>
        )}
      </LinearGradient>

      <View style={styles.wxSeason}>
        <Text style={styles.wxSeasonTitle}>Typical late Aug / early Sep</Text>
        <Text style={styles.wxSeasonNote}>{stop.clim.note}</Text>
        <View style={styles.hilo}>
          <Text style={styles.hi}>▲ {stop.clim.hi}°C</Text>
          <Text style={styles.lo}>▼ {stop.clim.lo}°C</Text>
        </View>
      </View>
    </View>
  );
}

// ---- Notes (synced) ----
function Notes({ stopN, stopName }: { stopN: number; stopName: string }) {
  const { profile } = useProfile();
  const [text, setText] = useState("");
  const [meta, setMeta] = useState<{ by: string; updatedAt: number } | null>(null);
  const [status, setStatus] = useState("Loading…");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    getNote(stopN).then((doc) => {
      if (!alive) return;
      setText(doc.text);
      setMeta(doc.updatedAt ? { by: doc.by, updatedAt: doc.updatedAt } : null);
      setStatus("Synced across the group");
    });
    return () => {
      alive = false;
    };
  }, [stopN]);

  function onChange(v: string) {
    setText(v);
    setStatus("Saving…");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const by = profile?.name ?? "someone";
      const doc = await saveNote(stopN, v, by);
      setMeta({ by: doc.by, updatedAt: doc.updatedAt });
      setStatus("✓ Synced");
      setTimeout(() => setStatus("Synced across the group"), 1200);
    }, 700);
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.label2}>Shared notes — {stopName}</Text>
      <TextInput
        style={styles.notes}
        value={text}
        onChangeText={onChange}
        multiline
        placeholder="Reservations, confirmation numbers, must-eats, friends' tips, opening hours, anything the group should remember here…"
        placeholderTextColor={colors.muted}
        textAlignVertical="top"
      />
      <View style={styles.saved}>
        <Text style={styles.savedTxt}>{status}</Text>
        {meta ? (
          <Text style={styles.savedTxt}>
            · last edited by {meta.by} {timeAgo(meta.updatedAt)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ---- Reels (synced) ----
function Reels({ stopN }: { stopN: number }) {
  const { profile } = useProfile();
  const [reels, setReels] = useState<Reel[]>([]);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    getReels(stopN).then((r) => alive && setReels(r));
    return () => {
      alive = false;
    };
  }, [stopN]);

  async function add() {
    const u = url.trim();
    if (!u) return;
    setBusy(true);
    const next = await addReel(stopN, u, label.trim(), profile?.name ?? "someone");
    setReels(next);
    setUrl("");
    setLabel("");
    setBusy(false);
  }

  async function remove(id: string) {
    const next = await deleteReel(stopN, id);
    setReels(next);
  }

  return (
    <View style={{ padding: 16 }}>
      <View style={styles.reelForm}>
        <TextInput
          style={styles.reelInput}
          value={url}
          onChangeText={setUrl}
          placeholder="Paste an Instagram / TikTok / YouTube link"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.reelInput}
          value={label}
          onChangeText={setLabel}
          placeholder="Label (optional) e.g. 'best noodle spot'"
          placeholderTextColor={colors.muted}
        />
        <Pressable style={styles.reelAdd} onPress={add} disabled={busy}>
          <Text style={styles.reelAddTxt}>{busy ? "Saving…" : "+ Save reel"}</Text>
        </Pressable>
      </View>

      {reels.length === 0 ? (
        <Text style={styles.reelEmpty}>
          No reels yet. Paste links the group finds so they're ready when you arrive.
        </Text>
      ) : (
        reels.map((r) => {
          const info = reelInfo(r.url);
          return (
            <View key={r.id} style={styles.reel}>
              <Pressable
                style={styles.reelThumb}
                onPress={() => Linking.openURL(r.url)}
              >
                {info.thumb ? (
                  <Image source={{ uri: info.thumb }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Icon
                    name={info.platform === "YouTube" ? "play" : info.platform === "TikTok" ? "music" : "link"}
                    size={20}
                    color="#fff"
                  />
                )}
              </Pressable>
              <Pressable style={{ flex: 1 }} onPress={() => Linking.openURL(r.url)}>
                <Text style={styles.reelPlatform}>
                  {info.platform}
                  {r.label ? " · " + r.label : ""}
                </Text>
                <Text style={styles.reelUrl} numberOfLines={1}>
                  {r.url}
                </Text>
                {r.by ? <Text style={styles.reelBy}>added by {r.by}</Text> : null}
              </Pressable>
              <Pressable style={styles.reelDel} onPress={() => remove(r.id)} hitSlop={6}>
                <Icon name="trash" size={14} color="#a33" />
              </Pressable>
            </View>
          );
        })
      )}
    </View>
  );
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const styles = StyleSheet.create({
  missing: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { height: 220, backgroundColor: "#cfd8e6", justifyContent: "flex-end" },
  close: {
    position: "absolute",
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(10,18,32,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { padding: 16 },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 8,
  },
  heroSub: { color: "#fff", opacity: 0.96, fontSize: 12.5, marginTop: 2 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabTxt: { fontSize: 12.5, fontWeight: "700", color: colors.muted },
  tabTxtOn: { color: colors.accent2 },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    height: 2.5,
    width: "60%",
    backgroundColor: colors.accent2,
    borderRadius: 2,
  },
  galImg: { height: 175, marginRight: 8, borderRadius: 14, overflow: "hidden" },
  galCapWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 8,
  },
  galCap: { color: "#fff", fontSize: 11.5, fontWeight: "600" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 5, paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#cfd8e6" },
  dotOn: { width: 16, borderRadius: 4, backgroundColor: colors.accent2 },
  blurb: {
    paddingHorizontal: 16,
    paddingTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSoft,
  },
  label: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: colors.muted,
  },
  label2: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: colors.muted,
    marginBottom: 8,
  },
  dItem: {
    flexDirection: "row",
    gap: 11,
    alignItems: "center",
    paddingVertical: 8,
  },
  dThumb: { width: 62, height: 62, borderRadius: 10 },
  dName: { fontSize: 14, fontWeight: "700", color: colors.ink },
  dNote: { fontSize: 11.5, color: colors.muted, marginTop: 2, lineHeight: 15 },
  dGo: { fontSize: 10, color: colors.accent2, fontWeight: "700", marginTop: 2 },

  // quick facts
  facts: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: colors.surface2,
    borderRadius: 14,
    paddingVertical: 12,
  },
  fact: { flex: 1, alignItems: "center" },
  factDiv: { width: StyleSheet.hairlineWidth, height: 28, backgroundColor: colors.line },
  factLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1.5, color: colors.muted },
  factValue: { fontSize: 15, fontWeight: "800", color: colors.ink, marginTop: 4 },

  // transport
  transport: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  transportMode: { flex: 1, fontSize: 13.5, fontWeight: "700", color: colors.ink },
  transportDur: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  transportGo: { fontSize: 12, fontWeight: "800", color: colors.red },

  // booked stay
  booked: {
    marginHorizontal: 16,
    backgroundColor: "#E7F5EC",
    borderColor: "#B5DEC2",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
  },
  bookedHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  bookedName: { flex: 1, fontSize: 14, fontWeight: "800", color: "#14532d" },
  bookedTag: { backgroundColor: "#1F7A39", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  bookedTagTxt: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  bookedAddr: { fontSize: 11, color: "#4b6b56", marginTop: 6, lineHeight: 16 },
  bookedGrid: { flexDirection: "row", gap: 6, marginTop: 10 },
  cell: { flex: 1, backgroundColor: "#fff", borderColor: "#d5e9db", borderWidth: 1, borderRadius: 9, padding: 7 },
  cellLabel: { fontSize: 8.5, fontWeight: "800", letterSpacing: 0.6, color: "#6b8a76" },
  cellValue: { fontSize: 10.5, fontWeight: "800", marginTop: 2, color: "#14532d" },
  bookedBtns: { flexDirection: "row", gap: 6, marginTop: 10 },
  bbtn: { flex: 1, borderRadius: 9, paddingVertical: 9, alignItems: "center" },
  bbtnTxt: { color: "#fff", fontSize: 11.5, fontWeight: "800" },

  // hotel search
  hotels: { flexDirection: "row", gap: 8, marginHorizontal: 16 },
  htl: { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 12, alignItems: "center" },
  htlP: { fontSize: 13, fontWeight: "800" },
  htlS: { fontSize: 10, marginTop: 2, fontWeight: "600" },

  // guides
  guides: { flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 18 },
  guide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 13,
  },
  guideTxt: { fontSize: 13, fontWeight: "700", color: colors.ink },
  cool: { paddingHorizontal: 16, gap: 7, paddingBottom: 8 },
  coolLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eef3fb",
    borderColor: "#d9e4f5",
    borderWidth: 1,
    borderRadius: 10,
    padding: 11,
  },
  coolTxt: { fontSize: 12, fontWeight: "600", color: colors.accent2 },

  // weather
  wxBig: { borderRadius: 14, padding: 16 },
  wxNow: { flexDirection: "row", alignItems: "center", gap: 12 },
  wxIcon: { fontSize: 42 },
  wxTemp: { fontSize: 34, fontWeight: "800", color: "#fff" },
  wxCond: { fontSize: 12.5, color: "#cdddf5" },
  wxMeta: { flexDirection: "row", gap: 16, marginTop: 10 },
  wxMetaTxt: { fontSize: 11.5, color: "#cdddf5" },
  wxSeason: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
  },
  wxSeasonTitle: { fontWeight: "800", color: colors.ink, fontSize: 13 },
  wxSeasonNote: { fontSize: 12.5, color: colors.textSoft, marginTop: 4, lineHeight: 18 },
  hilo: { flexDirection: "row", gap: 14, marginTop: 7 },
  hi: { color: colors.accent, fontWeight: "800" },
  lo: { color: colors.accent2, fontWeight: "800" },

  // notes
  notes: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 13,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    backgroundColor: "#fff",
  },
  saved: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 },
  savedTxt: { fontSize: 11, color: colors.muted },

  // reels
  reelForm: {
    gap: 8,
    backgroundColor: "#f6f9ff",
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  reelInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    padding: 10,
    fontSize: 13,
    backgroundColor: "#fff",
    color: colors.ink,
  },
  reelAdd: {
    backgroundColor: colors.accent,
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: "center",
  },
  reelAddTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  reelEmpty: { textAlign: "center", color: colors.muted, fontSize: 12, padding: 14 },
  reel: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 9,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 11,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  reelThumb: {
    width: 52,
    height: 52,
    borderRadius: 9,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  reelPlatform: { fontSize: 12.5, fontWeight: "800", color: colors.ink },
  reelUrl: { fontSize: 10.5, color: colors.muted, marginTop: 1 },
  reelBy: { fontSize: 10, color: colors.accent2, marginTop: 1 },
  reelDel: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f3f4f7",
    alignItems: "center",
    justifyContent: "center",
  },
});
