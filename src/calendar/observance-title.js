// Calendar-only bilingual display aliases for corroborated defects in pinned
// 1962 source identities. Do not mutate the principal day, appointed Proper,
// commemoration, Mass mode, or calendar rank/colour. All three source IDs are
// attested in 2024/2027 independent ordo comparison artifacts.
const NAMES = Object.freeze({
  "tempora:Pasc6-6": Object.freeze({
    en: "Vigil of Pentecost",
    fr: "Vigile de la Pentecôte",
  }),
  "sancti:12-02": Object.freeze({
    en: "St Bibiana, Virgin and Martyr",
    fr: "Sainte Bibiane, vierge et martyre",
  }),
  "sancti:06-30": Object.freeze({
    en: "Commemoration of St Paul, Apostle",
    fr: "Commémoraison de saint Paul, apôtre",
  }),
});
export function calendarObservanceAlias(resolution, language = "en") {
  if (!resolution || resolution.status === "failed" || !resolution.day?.main) return null;
  const id = String(resolution.day.main.id || "");
  // Strict source-identity test: no accidental matching of e.g. 12-020 or
  // a Proper path with different semantics; no translated-title heuristics.
  const key = id.split(":").slice(0, 2).join(":");
  const found = NAMES[key];
  return found && /^((tempora|sancti):[^:]+):[1-4]:[a-z]+$/i.test(id)
    ? found[language === "fr" ? "fr" : "en"]
    : null;
}
