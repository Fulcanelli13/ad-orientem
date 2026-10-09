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
  "tempora:Adv2-6": Object.freeze({
    en: "Saturday after the Second Sunday of Advent",
    fr: "Samedi après le deuxième dimanche de l’Avent",
  }),
});
// The actual Saturday BVM *celebration* remains different from the appointed
// seasonal Common Mass formulary. Keep that variant intact in Mass/Proper.
const BVM_SATURDAY_COMMONS = new Set([
  "commune:C10b:4:w", "commune:C10c:4:w",
  "commune:C10Pasc:4:w", "commune:C10t:4:w",
]);
export function calendarObservanceAlias(resolution, language = "en") {
  if (!resolution || resolution.status === "failed" || !resolution.day?.main) return null;
  const id = String(resolution.day.main.id || "");
  const lang = language === "fr" ? "fr" : "en";
  // Strict source-identity test: no accidental matching of e.g. 12-020 or
  // a Proper path with different semantics; no translated-title heuristics.
  const key = id.split(":").slice(0, 2).join(":");
  const found = NAMES[key];
  if (found && /^((tempora|sancti):[^:]+):[1-4]:[a-z]+$/i.test(id)) return found[lang];
  // A Common C10 Mass can also be selected votively on another weekday;
  // only a resolved Saturday principal observance may acquire this headline.
  const date = String(resolution.date || "");
  if (BVM_SATURDAY_COMMONS.has(id) && /^\d{4}-\d{2}-\d{2}$/.test(date)
      && new Date(date + "T12:00:00Z").getUTCDay() === 6) {
    return lang === "fr" ? "Sainte Vierge Marie le samedi" : "Blessed Virgin Mary on Saturday";
  }
  return null;
}
