/**
 * Seven already-rendered, independent historical prayer/work identities.
 * Source ownership remains with B27, B26, Novena B25, the Golden Arrow,
 * and Good Death / Dying Companion modules. This index holds navigation
 * intents and titles only; never new prayer bodies or invented translations.
 *
 * 2026-11-07 rendered-witness inventory: draft PR #2594 Stage 7.
 * Neither the 1962 printed edition nor separate historic French versions
 * are certified by these route links.
 */
import {GOLDEN_ARROW_REPARATION_V1} from "./icksp-golden-arrow-reparation.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "./holy-face-janvier-1887-b25.js";
import {MONTFORT_B27_PRAYERS} from "./montfort-original-prayers-b27.js";
import {GOOD_DEATH_DYING_V384} from "./good-death-data.js";

export const PRAYER_SEVEN_SOURCE_WORK_LINKS_V1=Object.freeze([
 Object.freeze({
  id:"holy_face_golden_arrow",subject:"II",
  en:GOLDEN_ARROW_REPARATION_V1.title,fr:GOLDEN_ARROW_REPARATION_V1.titleFr,
  route:"pray.sacred_heart",mode:"external",options:Object.freeze({prayer:"golden_arrow"}),
  sourceNoteEn:"Distinct historical English and French Holy Face witnesses; no Latin witness certified.",
  sourceNoteFr:"Témoins historiques anglais et français distincts ; aucun latin attesté."
 }),
 Object.freeze({
  id:"holy_face_1887",subject:"II",en:NOVENA_HOLY_FACE_1887_B25.title.en,
  fr:NOVENA_HOLY_FACE_1887_B25.title.fr,route:"pray.novenas",mode:"external",
  options:Object.freeze({novenaId:"holy_face_1887",novenaDay:1}),
  sourceNoteEn:"Complete historical English nine-day novena; original printed pages remain uncollated.",
  sourceNoteFr:"Neuf jours complets en anglais historique ; aucune traduction française historique certifiée."
 }),
 Object.freeze({
  id:"holy_spirit_litany",subject:"IV",en:MONTFORT_B27_PRAYERS.holySpirit.titleEn,
  fr:MONTFORT_B27_PRAYERS.holySpirit.titleFr,route:"pray.montfort_consecration",mode:"internal",
  options:Object.freeze({day:13,historicalPrayer:"holySpirit"}),
  sourceNoteEn:"Historical English digital witness; separate 1897 printed recension not certified.",
  sourceNoteFr:"Témoin numérique anglais historique ; recension imprimée de 1897 non vérifiée."
 }),
 Object.freeze({
  id:"montfort_augustine_prayer",subject:"V",en:MONTFORT_B27_PRAYERS.augustine.titleEn,
  fr:MONTFORT_B27_PRAYERS.augustine.titleFr,route:"pray.montfort_consecration",mode:"internal",
  options:Object.freeze({day:27,historicalPrayer:"augustine"}),
  sourceNoteEn:"Historical English and transmitted Latin in Montfort; not an Augustinian autograph.",
  sourceNoteFr:"Anglais historique et latin transmis par Montfort ; non un autographe augustinien."
 }),
 Object.freeze({
  id:"montfort_consecration_act_1863",subject:"V",
  en:"Montfort Act of Consecration · Faber 1863",fr:"Acte de consécration selon Montfort · Faber 1863",
  route:"pray.montfort_consecration",mode:"internal",options:Object.freeze({day:34}),
  sourceNoteEn:"Original 1863 English act; no invented French translation.",
  sourceNoteFr:"Acte original de 1863 en anglais ; traduction française non inventée."
 }),
 Object.freeze({
  id:"good_death_jesus_mary_joseph",subject:"IX",
  en:GOOD_DEATH_DYING_V384.aspirations.title,
  fr:GOOD_DEATH_DYING_V384.aspirations.titleFr,
  route:"pray.dying_companion",mode:"external",options:Object.freeze({dyingStep:"pray"}),
  sourceNoteEn:"Traditional three invocations; bedside companion does not replace a priest.",
  sourceNoteFr:"Trois invocations traditionnelles ; le guide ne remplace pas le prêtre."
 }),
 Object.freeze({
  id:"good_death_proficiscere",subject:"IX",
  en:GOOD_DEATH_DYING_V384.proficiscere.title,
  fr:GOOD_DEATH_DYING_V384.proficiscere.titleFr,
  route:"pray.dying_companion",mode:"external",options:Object.freeze({dyingStep:"commend"}),
  sourceNoteEn:"Latin post-1922 Roman Ritual order; English/French editorial renderings, exact 1962 edition uncollated.",
  sourceNoteFr:"Ordre latin postérieur à 1922 ; textes anglais/français éditoriaux, édition exacte de 1962 non collationnée."
 })
]);
const indexed=new Map(PRAYER_SEVEN_SOURCE_WORK_LINKS_V1.map(x=>[x.id,x]));
export function prayerSevenSourceWork(id){return indexed.get(String(id||""))||null}
export function prayerSevenSourceWorksForSubject(subject,query=""){
 const q=String(query||"").trim().toLocaleLowerCase();
 return PRAYER_SEVEN_SOURCE_WORK_LINKS_V1.filter(w=>
  (w.subject===subject||(subject==="all"&&!!q))&&
  (!q||[w.id,w.en,w.fr,w.sourceNoteEn,w.sourceNoteFr].some(x=>x.toLocaleLowerCase().includes(q))));
}
