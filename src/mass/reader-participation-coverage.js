// Machine-reproducible coverage of the existing 20 participation opportunities.
// Administrative/research inventory ONLY: no score approval or UI selection.
// Derived from the same policy, fixed 1961 excerpt catalogue and exact public
// selector consumed by the 65-card Mass reader.
import {PARTICIPATION_NEUME_POLICY} from "./reader-participation-neume-policy.js";
import {PARTICIPATION_REFERENCE_SCORES} from "./reader-participation-reference-scores.js";
import {APPROVED_MASS_INLINE_GABC} from "./reader-inline-chant-approved.js";
import {FESTIVE_ORATION_AMEN_SOURCE} from "./reader-oration-festive-amen-reference.js";
import {OLD_SOLEMN_ORATION_AMEN_SOURCE} from "./reader-oration-old-solemn-amen-reference.js";

export const PARTICIPATION_COVERAGE_SCHEMA="ao-mass-participation-20-event-coverage-v1";
export const PARTICIPATION_COVERAGE_SOURCES=Object.freeze({
 policy:"src/mass/reader-participation-neume-policy.js",
 canonicalCueCorpus:"data/presentation/reader-text-sung.v1.json",
 speakerAudit:"data/mass/ordinary-sung-speaker-audit.v1.json",
 referenceCatalogue:"src/mass/reader-participation-reference-scores.js",
 approvedCatalogue:"src/mass/reader-inline-chant-approved.js",
 orationSourceGate:"src/mass/reader-oration-amen-source-handoff.js",
 orationToneGate:"src/mass/reader-oration-amen-tone-policy.js",
 gospelConclusionNonSungAuthority:"https://media.musicasacra.com/pdf/highmass.pdf",
 gospelConclusionCeremonialCorroboration:"https://acss.sspxusa.org/rubrics/highmass/HighMass-Master-of-Ceremonies.pdf",
 publication:"ONLY_EXACT_ITE_VIII_2_FRAGMENTS_APPROVED_AS_OF_2026_11_06"
});
const unresolved=Object.freeze({
 GOSPEL_CONCLUSION:"This 1962 High-Mass response is made after the Gospel but NOT sung by the choir; preserve its Latin/vernacular text, without a score (Haynes 2007, p. 5; SSPX high-Mass MC guide).",
 OFFERTORY_GREETING:"Verify an independent 1961 Offertory greeting source and its actual liturgical tone; same words do not license borrowing Collect or Preface notes.",
 DISMISSAL_GREETING:"Identify the printed 1961 greeting tone applicable to the dismissal context; do not copy the preceding Collect/Postcommunion dialogue."
});
const dynamic=Object.freeze({
 COLLECT_AMEN:Object.freeze({eventId:"COLLECT",sourceGate:"EXACT_1962_SELECTED_PROPER_AND_UNIQUE_AMEN_CUE",sourceFolio:["1961 Graduale Romanum 114*","1961 Graduale Romanum 116*"],sourceUrls:[FESTIVE_ORATION_AMEN_SOURCE.sourceUrl,OLD_SOLEMN_ORATION_AMEN_SOURCE.facsimile],variants:["DEFAULT_FESTIVE","FERIAL_RECTO_TONO_TEXT_ONLY","EXPLICIT_OLD_SOLEMN"],publicScoreApproved:false}),
 POSTCOMMUNION_AMEN:Object.freeze({eventId:"POSTCOMMUNION",sourceGate:"EXACT_1962_SELECTED_PROPER_AND_UNIQUE_AMEN_CUE",sourceFolio:["1961 Graduale Romanum 114*","1961 Graduale Romanum 116*"],sourceUrls:[FESTIVE_ORATION_AMEN_SOURCE.sourceUrl,OLD_SOLEMN_ORATION_AMEN_SOURCE.facsimile],variants:["DEFAULT_FESTIVE","FERIAL_RECTO_TONO_TEXT_ONLY","EXPLICIT_OLD_SOLEMN"],publicScoreApproved:false})
});
const action=Object.freeze({
 GLORIA_INTONATION:"Collate selected Gloria VIII 1961 first phrase; add other settings only from independently authenticated selections.",
 COLLECT_GREETING:"Collate printed 1961 festive Et cum spiritu tuo; keep ferial and older tone choices distinct.",
 COLLECT_AMEN:"Verify full selected Proper conclusion and the 1961 p.114*/116* response; no automatic pitch inference or public score.",
 GOSPEL_GREETING:"Collate both standard/ad-lib 1961 Gospel greetings and require explicit selection of the alternative.",
 GOSPEL_ACCLAMATION:"Collate both standard/ad-lib 1961 Gloria tibi Domine source responses.",
 GOSPEL_CONCLUSION:unresolved.GOSPEL_CONCLUSION,
 CREDO_INTONATION:"Collate selected Credo III 1961 incipit; source-score setting must match the Mass programme.",
 OFFERTORY_GREETING:unresolved.OFFERTORY_GREETING,
 SECRET_CONCLUSION:"Collate the exact 1961 Preface-opening Amen; never borrow an oration Amen by identical text.",
 PREFACE_GREETING:"Collate solemn/ferial 1961 Preface dialogue response against their separate printed witnesses.",
 PREFACE_SURSUM_CORDA:"Collate solemn/ferial Habemus ad Dominum responses; no guessed tone from priest pitch.",
 PREFACE_GRATIAS:"Collate solemn/ferial Dignum et iustum est responses against their exact source.",
 CANON_CONCLUSION:"Collate 1961 Canon-ending Amen from source #7282, never a generic Amen.",
 LIBERA_NOS_CONCLUSION:"Collate the distinct 1961 Pax-prelude Amen from source #4327.",
 PATERNOSTER_RESPONSE:"Verify printed phrase equality for both Pater noster tones; retain exact response #7282.",
 PAX_DOMINI_RESPONSE:"Collate 1961 Pax Domini Et cum spiritu tuo from source #4327.",
 POSTCOMMUNION_GREETING:"Collate 1961 festive greeting; do not assume identical notes for ferial.",
 POSTCOMMUNION_AMEN:"Source-bind selected 1962 Postcommunion (including commemorations), then collate 1961 festive/old solemn excerpts; ferial stays recto tono.",
 DISMISSAL_GREETING:unresolved.DISMISSAL_GREETING,
 DISMISSAL_EXCHANGE:"Keep two approved Ite VIII score fragments restricted to that setting; review Benedicamus VIII and Requiescant alternatives separately."
});
const stableUnique=values=>[...new Set(values)];
export function buildParticipationCoverage(){
 const events=PARTICIPATION_NEUME_POLICY.map(event=>{
  const cues=event.cueIds;
  const research=PARTICIPATION_REFERENCE_SCORES.filter(s=>
   s.sourceCueIds?.length&&s.sourceCueIds.every(c=>cues.includes(c)));
  const publicExcerpts=APPROVED_MASS_INLINE_GABC.filter(s=>cues.includes(s.sourceCueId));
  const conditional=dynamic[event.id]??null;
  const nonSung=event.sungExclusion??null;
  const state=nonSung?"EXCLUDED_NON_SUNG_RESPONSE":
   publicExcerpts.length?"LIMITED_PUBLIC_EXACT_SETTING":
   conditional?"DYNAMIC_SOURCE_BOUND_RESEARCH_ONLY":
   research.length?"FIXED_SOURCE_RESEARCH_ONLY":"SOURCE_CUE_UNMAPPED";
  return {
   id:event.id,kind:event.kind,eventId:event.eventId,variant:event.variant,
   cueIds:[...cues],sungExclusion:nonSung,
   state,
   publicScoreIds:publicExcerpts.map(s=>s.scoreId),
   fixedResearchIds:research.map(s=>s.id),
   fixedResearchSourceIds:stableUnique(research.map(s=>s.sourceId)),
   fixedResearchWitnesses:stableUnique(research.map(s=>s.sourceUrl)),
   conditionalSources:conditional,
   reviewAction:action[event.id]??"SOURCE_OWNER_NOT_DEFINED"
  };
 });
 const cueIds=events.flatMap(e=>e.cueIds);
 const counts=Object.freeze({
  events:events.length,uniqueCueIds:new Set(cueIds).size,
  exactPublicFragments:APPROVED_MASS_INLINE_GABC.length,
  fixedResearchExcerpts:PARTICIPATION_REFERENCE_SCORES.length,
  eventsLimitedPublic:events.filter(e=>e.state==="LIMITED_PUBLIC_EXACT_SETTING").length,
  eventsFixedResearchOnly:events.filter(e=>e.state==="FIXED_SOURCE_RESEARCH_ONLY").length,
  eventsDynamicSourceBound:events.filter(e=>e.state==="DYNAMIC_SOURCE_BOUND_RESEARCH_ONLY").length,
  eventsSourceUnmapped:events.filter(e=>e.state==="SOURCE_CUE_UNMAPPED").length,
  eventsExcludedNonSung:events.filter(e=>e.state==="EXCLUDED_NON_SUNG_RESPONSE").length,
  sungEligibleEvents:events.filter(e=>e.state!=="EXCLUDED_NON_SUNG_RESPONSE").length,
  sungEligibleCueIds:new Set(events.filter(e=>e.state!=="EXCLUDED_NON_SUNG_RESPONSE").flatMap(e=>e.cueIds)).size,
  eventsWithAnyFixedResearch:events.filter(e=>e.fixedResearchIds.length>0).length
 });
 return {schema:PARTICIPATION_COVERAGE_SCHEMA,
  scope:"Source-anchored singing opportunities, not guaranteed congregation practice and not a public score-completeness claim",
  sourcePolicy:PARTICIPATION_COVERAGE_SOURCES,
  counts,events};
}
