// Light, airy, super-minimal — white base, warm off-white surfaces, near-black
// text, China-flag accents (deep red + gold). Thin hairlines, tiny tracked-out
// labels, generous negative space. The destination photos provide the colour.

export const colors = {
  // base — white / warm paper
  bg: "#FFFFFF",
  night: "#FFFFFF",
  night2: "#F5F5F2",
  surface: "#FFFFFF",
  surface2: "#F6F6F3",
  card: "#FFFFFF",
  paper: "#FFFFFF",
  washTop: "#FBFBF9",
  washBottom: "#F3F3F0",

  // brand — China red + gold
  red: "#DE2910",
  redDeep: "#B31E12",
  redSoft: "#FBEAE7",
  gold: "#E0A400",
  goldSoft: "#FBF1D2",

  // text — near-black warm neutrals
  ink: "#15171B",
  ink2: "#3D424B",
  ink3: "rgba(21,23,27,0.6)",
  muted: "#8A8F98",
  faint: "#B7BBC2",

  // lines
  line: "rgba(17,19,23,0.09)",
  hair: "rgba(17,19,23,0.06)",

  // semantic (kept for existing components)
  accent: "#DE2910",
  accent2: "#DE2910",
  blue: "#DE2910",
  navy: "#15171B", // dark ink used for a few contrast chips
  green: "#1F7A39",
  glass: "rgba(255,255,255,0.72)",
  glassBorder: "rgba(17,19,23,0.07)",
  text: "#15171B",
  textSoft: "#3D424B",

  // dark accent gradient (small contrast cards on white: budget total, weather)
  heroA: "#1B1E24",
  heroB: "#0E1014",

  // on-dark text (for the few dark accent surfaces)
  onDark: "#FFFFFF",
  onDarkSoft: "rgba(255,255,255,0.7)",
  onDarkFaint: "rgba(255,255,255,0.45)",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const type = {
  display: { fontSize: 44, fontWeight: "800" as const, letterSpacing: -1.4, color: colors.ink },
  h1: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.8, color: colors.ink },
  h2: { fontSize: 20, fontWeight: "800" as const, letterSpacing: -0.4, color: colors.ink },
  title: { fontSize: 16, fontWeight: "700" as const, letterSpacing: -0.2, color: colors.ink },
  body: { fontSize: 14, fontWeight: "400" as const, color: colors.ink2, lineHeight: 20 },
  // tiny tracked-out uppercase label — the minimalist signature
  label: {
    fontSize: 10,
    fontWeight: "800" as const,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    color: colors.muted,
  },
  caption: { fontSize: 12, fontWeight: "500" as const, color: colors.muted },
};

export const shadow = {
  card: {
    shadowColor: "#0B1220",
    shadowOpacity: 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  soft: {
    shadowColor: "#0B1220",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  fab: {
    shadowColor: "#DE2910",
    shadowOpacity: 0.36,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

// Hotel tier colours
export const hotelTier = {
  red: { bg: "#FBEAE7", border: "#F1C3BC", text: "#B31E12" },
  yellow: { bg: "#FBF1D2", border: "#EBD48C", text: "#8A6300" },
  green: { bg: "#E7F5EC", border: "#B5DEC2", text: "#1F7A39" },
};
