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
// Derived from the *observed* IV-class weekday's canonical Temporale ID,
// never from a guessed Sunday/week or the translated title of its inherited
// Sunday Mass. Source comparison: two distinct 1962 reconstructed ordos,
// 2024/2027; normative transfer rule: 1960 General Rubrics n.18.
// This projection does NOT change rank/colour, texts, selected Mass or comms.
const WEEKDAY_EN = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKDAY_FR = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const ORDINAL_EN = Object.freeze([
  "", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth",
  "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth", "Fourteenth",
  "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth",
  "Twentieth", "Twenty-first", "Twenty-second", "Twenty-third", "Twenty-fourth",
]);
const ORDINAL_FR = Object.freeze([
  "", "premier", "deuxième", "troisième", "quatrième", "cinquième",
  "sixième", "septième", "huitième", "neuvième", "dixième", "onzième",
  "douzième", "treizième", "quatorzième", "quinzième", "seizième",
  "dix-septième", "dix-huitième", "dix-neuvième", "vingtième",
  "vingt et unième", "vingt-deuxième", "vingt-troisième", "vingt-quatrième",
]);
function sourceFeriaTitle(resolution, language){
  const main=resolution?.day?.main;
  if(!/^:feria:4:[wvgrbp]$/i.test(String(main?.id||"")))return null;
  const date=String(resolution?.date||"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
  const parsed=new Date(date+"T12:00:00Z");
  if(!Number.isFinite(parsed.getTime()))return null;
  const weekday=parsed.getUTCDay();
  if(weekday<1||weekday>5)return null;
  const lang=language==="fr"?"fr":"en";
  const label=lang==="fr"?WEEKDAY_FR[weekday]:WEEKDAY_EN[weekday];
  // Source candidates are NOT all liturgical observances. Use only a
  // single observed Temporale matching this *same weekday* and IV class.
  const temporal=(resolution.day?.tempora||[]).filter(x=>
    /^tempora:(?:Epi\d+|Pasc\d+|Pent\d+|Quadp\d+)-[1-5]:4:[wvgrbp]$/i.test(String(x?.id||"")));
  if(temporal.length!==1)return null;
  const match=/^tempora:(Epi|Pasc|Pent|Quadp)(\d+)-([1-5]):4:([wvgrbp])$/i.exec(temporal[0].id);
  if(!match||Number(match[3])!==weekday)return null;
  const kind=match[1].toLowerCase(),num=Number(match[2]);
  const ord=(lang==="fr"?ORDINAL_FR:ORDINAL_EN)[num];
  if(kind==="quadp"){
    const solemnity={1:["Septuagesima","Septuagésime"],2:["Sexagesima","Sexagésime"],3:["Quinquagesima","Quinquagésime"]}[num];
    return solemnity?(lang==="fr"?label+" après la "+solemnity[1]:label+" after "+solemnity[0]):null;
  }
  if(!ord)return null;
  if(kind==="pasc")
    return lang==="fr"?label+" après le "+ord+" dimanche après Pâques"
      :label+" after the "+ord+" Sunday after Easter";
  if(kind==="pent")
    return lang==="fr"?label+" après le "+ord+" dimanche après la Pentecôte"
      :label+" after the "+ord+" Sunday after Pentecost";
  if(kind==="epi"){
    // n.18 assigns impeded Epiphany Sundays after XXIII Pentecost;
    // the observed Epi ID identifies the actual Mass source. Distinguish
    // a transferred late-autumn occurrence from the January week, without
    // inventing the (different) ordinal of the week after Pentecost.
    const transferred=parsed.getUTCMonth()>=7;
    if(transferred)return lang==="fr"
      ?label+" après le "+ord+" dimanche après l’Épiphanie reporté"
      :label+" after the transferred "+ord+" Sunday after Epiphany";
    return lang==="fr"?label+" après le "+ord+" dimanche après l’Épiphanie"
      :label+" after the "+ord+" Sunday after Epiphany";
  }
  return null;
}

export function calendarObservanceAlias(resolution, language = "en") {
  if (!resolution || resolution.status === "failed" || !resolution.day?.main) return null;
  const id = String(resolution.day.main.id || "");
  const lang = language === "fr" ? "fr" : "en";
  const feria=sourceFeriaTitle(resolution,lang);
  if(feria)return feria;
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
