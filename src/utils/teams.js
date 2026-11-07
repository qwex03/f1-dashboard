// Livery colors, keyed by Ergast constructorId and by normalized team name.
const BY_ID = {
  mclaren: "#FF8000",
  ferrari: "#E8002D",
  mercedes: "#27F4D2",
  red_bull: "#3671C6",
  williams: "#64C4FF",
  aston_martin: "#229971",
  alpine: "#0093CC",
  haas: "#B6BABD",
  rb: "#6692FF",
  alphatauri: "#5E8FAA",
  sauber: "#52E252",
  audi: "#BB0A30",
  cadillac: "#C9A34E",
};

const ALIASES = {
  redbull: "red_bull",
  astonmartin: "aston_martin",
  alpinef1team: "alpine",
  haasf1team: "haas",
  rbf1team: "rb",
  racingbulls: "rb",
  kicksauber: "sauber",
  cadillacf1team: "cadillac",
};

const FALLBACK = "#8A8A96";

export function teamColor(idOrName = "") {
  if (BY_ID[idOrName]) return BY_ID[idOrName];
  const key = String(idOrName).toLowerCase().replace(/[^a-z]/g, "");
  return BY_ID[ALIASES[key] ?? key] ?? FALLBACK;
}

export function constructorColor(constructor) {
  if (!constructor) return FALLBACK;
  const byId = BY_ID[constructor.constructorId];
  return byId ?? teamColor(constructor.name);
}
