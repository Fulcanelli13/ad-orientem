import {parseScriptureContext} from "../scripture/context.js";

/*
 * Curated origins, not automatic text matching. A devotional composition may
 * incorporate biblical words without itself being an inspired Bible passage.
 * Identifiers belong to the canonical 48-prayer library and 14 Stations.
 */
const ORIGINS=Object.freeze({
  foundations_our_father:["Matthew 6:9–13","BIBLICAL_PRAYER"],
  foundations_hail_mary:["Luke 1:28–42","COMPOSITE_DEVOTION"],
  foundations_prayer_of_adoration:["John 20:28","SCRIPTURAL_ACCLAMATION"],
  weekday_magnificat:["Luke 1:46–55","BIBLICAL_CANTICLE"],
  adoration_lord_i_am_not_worthy:["Matthew 8:8","LITURGICAL_ADAPTATION"],
  weekday_benedictus:["Luke 1:68–79","BIBLICAL_CANTICLE"],
  dead_de_profundis:["Psalms 129:1–8","BIBLICAL_PSALM_TRADITIONAL_NUMBERING"],
  benediction_adoremus_ps116:["Psalms 116:1–2","LITURGICAL_PSALM_ADAPTATION"],
});
const STATIONS=Object.freeze([
  ["Matthew 27:11–26","GOSPEL_PASSION_CONTEXT"],  // Condemnation
  ["John 19:16–17","GOSPEL_PASSION_CONTEXT"],     // Bearing the Cross
  [null,"DEVOTIONAL_TRADITION"],                 // First fall
  [null,"DEVOTIONAL_TRADITION"],                 // Meeting Mary on the way
  ["Luke 23:26","GOSPEL_PASSION_CONTEXT"],       // Simon of Cyrene
  [null,"DEVOTIONAL_TRADITION"],                 // Veronica
  [null,"DEVOTIONAL_TRADITION"],                 // Second fall
  ["Luke 23:27–31","GOSPEL_PASSION_CONTEXT"],     // Women of Jerusalem
  [null,"DEVOTIONAL_TRADITION"],                 // Third fall
  ["John 19:23–24","GOSPEL_PASSION_CONTEXT"],     // Garments taken
  ["Luke 23:33","GOSPEL_PASSION_CONTEXT"],        // Crucifixion
  ["John 19:25–30","GOSPEL_PASSION_CONTEXT"],     // Death on Cross
  ["John 19:38–40","GOSPEL_PASSION_CONTEXT"],     // Removal and burial preparation
  ["John 19:41–42","GOSPEL_PASSION_CONTEXT"],     // Entombment
]);
function create(entry){
  if(!entry)return null;
  const [reference,relationship]=entry;
  const parsed=reference?parseScriptureContext(reference):null;
  if(reference&&!parsed)throw new Error("Unparseable curated Scripture origin: "+reference);
  return Object.freeze({
    reference:parsed?.reference??null,
    passage:parsed?.passage??null,
    relationship,
    isVerbatimBibleText:["BIBLICAL_PRAYER","BIBLICAL_CANTICLE","BIBLICAL_PSALM_TRADITIONAL_NUMBERING"].includes(relationship),
  });
}
export const PRAYER_SCRIPTURE_ORIGINS=Object.freeze(Object.fromEntries(
  Object.entries(ORIGINS).map(([id,record])=>[id,create(record)])
));
export const STATION_SCRIPTURE_ORIGINS=Object.freeze(STATIONS.map(create));
export function prayerScriptureOrigin(id){return PRAYER_SCRIPTURE_ORIGINS[String(id)]??null}
export function stationScriptureOrigin(index){
  if(!Number.isInteger(index)||index<0||index>=STATION_SCRIPTURE_ORIGINS.length)return null;
  return STATION_SCRIPTURE_ORIGINS[index];
}
