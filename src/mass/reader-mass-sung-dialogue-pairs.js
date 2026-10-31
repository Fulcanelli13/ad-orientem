// M02: SOURCE-ONLY paired sung-dialogue map for the existing R17 Mass.
// Cue IDs belong to the pinned Sung corpus and existing reader projection.
// No copied Latin, invented chant notation, actual singing, or tone inference.
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";

const freeze=Object.freeze;
const SUNG_FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const cue=n=>"AO.SM.C"+String(n).padStart(4,"0");
const pair=(id,block,lead,response,roles="RESPONDERS",relationship="VERSICLE_RESPONSE")=>
 freeze({id,sourceBlockId:"AO.SM.B"+String(block).padStart(3,"0"),
  leaderCueIds:freeze(lead.map(cue)),responseCueIds:freeze(response.map(cue)),
  responseRole:roles,relationship});
const spec=(id,exchanges,context=[])=>freeze({
 id,sourceOwner:"PINNED_1962_SUNG_ORDINARY",
 exchanges:freeze(exchanges),contextCueIds:freeze(context.map(cue))
});

/** Read-only exact cue map, NOT a musical score catalogue. Compound cue
 * groups intentionally preserve the source's split Gloria/Credo intonation
 * and Preface Grátias agámus / Deo nostro as one celebrant turn.
 *
 * C0074 and C0255 are placeholder response cues, not fixed Latin words.
 * They require the actual resolved Collect/Postcommunion source and are
 * deliberately NOT asserted to be the text or melody of Amen here.
 */
export const MASS_SUNG_DIALOGUE_SPECS=freeze({
 GLORIA_INTONATION:spec("GLORIA_INTONATION",[
  pair("GLORIA_PRIEST_SCHOLA",16,[53,54],[55],"SCHOLA","INTONATION_CONTINUATION")
 ]),
 GLORIA:spec("GLORIA",[
  pair("GLORIA_PRIEST_SCHOLA",16,[53,54],[55],"SCHOLA","INTONATION_CONTINUATION")
 ]),
 COLLECT:spec("COLLECT",[
  pair("COLLECT_GREETING",17,[70],[71])
 ],[72,73,74]),
 GOSPEL:spec("GOSPEL",[
  pair("GOSPEL_GREETING",24,[82],[83]),
  pair("GOSPEL_PROCLAMATION",25,[84],[85])
 ],[87]),
 CREDO_INTONATION:spec("CREDO_INTONATION",[
  pair("CREDO_PRIEST_SCHOLA",27,[89,90],[91],"SCHOLA","INTONATION_CONTINUATION")
 ]),
 CREDO:spec("CREDO",[
  pair("CREDO_PRIEST_SCHOLA",27,[89,90],[91],"SCHOLA","INTONATION_CONTINUATION")
 ]),
 PREFACE_DIALOGUE:spec("PREFACE_DIALOGUE",[
  pair("PREFACE_GREETING",42,[137],[138]),
  pair("PREFACE_SURSUM_CORDA",43,[139],[140]),
  pair("PREFACE_GRATIAS_AGAMUS",44,[141,142],[143])
 ],[144]),
 PATERNOSTER:spec("PATERNOSTER",[
  pair("PATERNOSTER_CONCLUSION",63,[209],[210])
 ],[208]),
 POSTCOMMUNION:spec("POSTCOMMUNION",[
  pair("POSTCOMMUNION_GREETING",86,[251],[252])
 ],[253,254,255]),
 DISMISSAL:spec("DISMISSAL",[
  pair("DISMISSAL_GREETING",89,[257],[258]),
  pair("DISMISSAL_FORMULA",90,[259],[260])
 ])
});
export const MASS_SUNG_DIALOGUE_EVENT_IDS=freeze(Object.keys(MASS_SUNG_DIALOGUE_SPECS));

function priestOrMinister(eventId,exchangeId,form,requiem){
 if((eventId==="GOSPEL"||eventId==="DISMISSAL")&&form==="SOLEMN"){
  // Requiem's altar-facing dismissal is not a licence to infer who sang it.
  if(requiem&&exchangeId==="DISMISSAL_FORMULA")
   return "LITURGICAL_MINISTER_REQUIRES_EXACT_FORM_PROOF";
  return "DEACON";
 }
 return "CELEBRANT";
}
function dismissalVariant({resolvedMass,massPlan,requiem}){
 if(requiem)return freeze({formula:"REQUIESCANT_IN_PACE",authority:"EXPLICIT_REQUIEM_MASS",
  seasonalAlleluia:"NOT_APPLICABLE"});
 const planned=String(massPlan?.dismissal??"").toUpperCase();
 if(planned==="BENEDICAMUS_DOMINO")
  return freeze({formula:planned,authority:"SOURCE_SELECTED_MASS_PLAN",
   seasonalAlleluia:"NOT_APPLICABLE"});
 if(planned==="ITE_MISSA_EST")
  return freeze({formula:planned,authority:"SOURCE_SELECTED_MASS_PLAN",
   // An Eastertide date by itself cannot certify the octave-specific melody.
   seasonalAlleluia:"EXACT_1962_EASTER_OCTAVE_PROPER_REQUIRED"});
 return freeze({formula:"UNRESOLVED",authority:"NO_VERIFIED_DISMISSAL_PLAN",
  seasonalAlleluia:"NOT_INFERRED"});
}

/** A pairing proves WHICH exact reader turns correspond, not WHAT tune
 * must be sung. It is only projected when the current 36-event Schola
 * itinerary has actually retained this event for the selected Mass.
 */
export function projectMassSungDialogue({
 eventId,form,resolvedMass=null,massPlan=null
}={}){
 const selected=String(form??"").toUpperCase();
 if(!SUNG_FORMS.has(selected))return null;
 const id=String(eventId??"");
 const source=MASS_SUNG_DIALOGUE_SPECS[id];
 if(!source)return null;
 const requiem=isExplicitRequiemMass({session:{resolvedMass}});
 if((id==="GLORIA"||id==="GLORIA_INTONATION") &&
   (requiem||resolvedMass?.provenance?.gloria===false))return null;
 if((id==="CREDO"||id==="CREDO_INTONATION") &&
   (requiem||resolvedMass?.provenance?.credo===false))return null;
 const exchanges=source.exchanges.map(exchange=>freeze({
  ...exchange,
  leaderRole:priestOrMinister(id,exchange.id,selected,requiem),
  cueAuthority:"EXACT_PINNED_SUNG_SOURCE",
  sourceText:"OWNED_BY_EXISTING_READER_NOT_COPIED",
  tonePair:"UNVERIFIED_MUSICAL_SETTING",
  performance:"NOT_OBSERVED"
 }));
 return freeze({
  schema:"ao-mass-sung-dialogue-source-pairs-v1",
  eventId:id,form:selected,sourceOwner:source.sourceOwner,
  exchanges:freeze(exchanges),contextCueIds:source.contextCueIds,
  dismissal:id==="DISMISSAL"?dismissalVariant({resolvedMass,massPlan,requiem}):null,
  toneSelection:freeze({
   status:"NOT_SOURCE_CERTIFIED",
   celebrant:"NOTATION_NOT_APPROVED",
   response:"NOTATION_NOT_APPROVED",
   match:"NOT_MUSICALLY_VERIFIED",
   seasonRule:"RESOLVED_1962_CELEBRATION_AND_PRINTED_TONE_REQUIRED",
   // Even on known Sundays, a presumed festal tone must not become
   // a published melody without the corresponding musical source.
   noDateOrFeastTitleGuessing:true
  }),
  textVariants:"SOURCE_READER_ONLY",actuallySung:"UNKNOWN",
  advancesPriestClock:false,advancesScholaClock:false
 });
}
