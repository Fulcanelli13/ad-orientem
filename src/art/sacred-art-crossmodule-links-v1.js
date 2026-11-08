/**
 * Sacred Art cross-module links — Wave 2.
 *
 * A relationship is NOT a new painting selection, date hero approval,
 * image licence, claim of visually verified persons, or navigation event.
 * Canonical IDs are borrowed from Rosary, Bible Atlas and the Mass event graph.
 * Scripture links retain the distinction between a depicted scene and typology.
 */
import {SACRED_ART_CURATED_WORKS_V1,sacredArtWorkById} from "./sacred-art-taxonomy-v1.js";
import {APPROVED_CLASS_I_2026} from "../calendar/approved-class-i-heroes-2026.js";

const freezeList=(values,kind)=>Object.freeze(values.map(id=>Object.freeze({id,relation:kind})));
const ROSARY_SCENES=Object.freeze({
 "released-photo:angelus":["joy1"],
 "released-photo:bouts":["joy1"],
 "released-photo:visit":["joy3"],
 "released-photo:cavallino":["joy3"],
 "released-photo:hondius":["joy5"],
 "released-photo:regina":["glo1"],
 "artwork-pending:01":["sor5"],
 "artwork-pending:03":["glo3"],
 "artwork-pending:04":["sor1"],
 "artwork-pending:05":["joy4"]
});
const ATLAS_SCENES=Object.freeze({
 "released-photo:angelus":["nazareth-e1"],
 "released-photo:bouts":["nazareth-e1"],
 "released-photo:visit":["bethlehem-e1"],
 "released-photo:cavallino":["bethlehem-e1"],
 "released-photo:hondius":["jerusalem-temple-e2"],
 "released-photo:regina":["christ-tomb-e2"],
 "released-photo:giordano-flight":["egypt-e1"],
 "artwork-pending:01":["golgotha-e2"],
 "artwork-pending:04":["gethsemane-e1"],
 "artwork-pending:05":["jerusalem-temple-e1"],
 "artwork-pending:09":["tabgha-e1"]
});
// These are *theological* connections: nobody is claiming the painting
// depicts an actual 1962 Mass, a consecration or a liturgical gesture.
const MASS_THEMES=Object.freeze({
 "released-photo:adoration":["MC-CNS-040"],
 "artwork-pending:01":["MC-CNS-020"],
 "artwork-pending:06":["MC-CNS-040"],
 "artwork-pending:07":["MC-COM-270"],
 "artwork-pending:09":["MC-COM-220"]
});
const byKey=(mapping,key,relation)=>freezeList(mapping[key]??[],relation);
const normal=s=>String(s??"").normalize("NFKC").trim().toLowerCase();
export function sacredArtCrossModuleLinks(workId){
 const art=sacredArtWorkById(workId);
 if(!art)return null;
 // Precise artist+title identity; an existing date decision NEVER grants
 // permission to use a photo in a different app module.
 const calendar=APPROVED_CLASS_I_2026
  .filter(day=>normal(day.title)===normal(art.title)&&normal(day.artist)===normal(art.artist))
  .map(day=>Object.freeze({
    date:day.date,principalId:day.principalId,
    relationship:"EXISTING_DATE_ARTWORK_IDENTITY_MATCH",
    dateEditorialApproval:day.editorialApproval,
    imagePublicationStatus:day.imagePublicationStatus,
    photoReuseApprovedHere:false
  }));
 const scripture=art.scriptureAnchors.map(reference=>Object.freeze({
   reference,
   relation:art.sceneIsDirectScriptureIllustration?"DEPICTED_EVENT":"THEMATIC_OR_TYPOLOGICAL",
   editionTextSupplied:false
 }));
 return Object.freeze({
  workId:art.id,title:art.title,
  currentlyPublicPhoto:!!art.photoModuleId,
  rosary:byKey(ROSARY_SCENES,workId,"DEPICTED_MYSTERY_NOT_BEAD_REPLACEMENT"),
  scripture:Object.freeze(scripture),
  bibleAtlas:byKey(ATLAS_SCENES,workId,"SAME_NARRATIVE_EVENT_NOT_GEOGRAPHIC_PROOF"),
  mass:byKey(MASS_THEMES,workId,"THEOLOGICAL_THEME_NOT_LITURGICAL_DEPICTION"),
  calendar:Object.freeze(calendar),
  prayer:Object.freeze([...art.existingMatching.existingPrayerSlots]),
  publicationAuthorizedByLinks:false
 });
}
export const SACRED_ART_CROSSMODULE_INDEX_V1=Object.freeze(
 SACRED_ART_CURATED_WORKS_V1.map(w=>sacredArtCrossModuleLinks(w.id))
);
export function sacredArtMatchesForTarget(module,targetId){
 if(!["rosary","bibleAtlas","mass","scripture","calendar","prayer"].includes(module))return [];
 return SACRED_ART_CROSSMODULE_INDEX_V1.filter(row=>{
  if(module==="scripture")return row.scripture.some(s=>s.reference===targetId);
  if(module==="calendar")return row.calendar.some(s=>s.date===targetId||s.principalId===targetId);
  if(module==="prayer")return row.prayer.includes(targetId);
  return row[module].some(link=>link.id===targetId);
 });
}
