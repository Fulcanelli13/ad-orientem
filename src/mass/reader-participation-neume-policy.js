// Participation-first Gregorian notation policy for the existing 65-card Sung Mass.
// This is an inventory of specific SOURCE CUES, not a claim that the faithful
// sing each cue in every parish. The Schola/ministers may supply responses.
// Only a separately approved, exact cue+text+setting GABC can be rendered.
// Non-sung preparatory prayers, Last Gospel, all Propers, full Kyriale and
// dynamic/source-unresolved Amen responses are NOT automatically scored here.
// Source: ordinary-sung-speaker-audit, source text corpus, paired dialogue map.
export const PARTICIPATION_NEUME_SCHEMA="ao-mass-compact-participation-neumes-v1";
export const PARTICIPATION_NEUME_POLICY=Object.freeze([
  {
    "id": "GLORIA_INTONATION",
    "kind": "CELEBRANT_INTONATION",
    "cueIds": [
      "AO.SM.C0053",
      "AO.SM.C0054"
    ],
    "eventId": "SUNG_GLORIA",
    "variant": "INTONATION_TO_CHORAL_CONTINUATION",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "COLLECT_GREETING",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0071"
    ],
    "eventId": "COLLECT",
    "variant": "GREETING_RESPONSE",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "COLLECT_AMEN",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0074"
    ],
    "eventId": "COLLECT",
    "variant": "SOURCE_PROPER_RESOLUTION_REQUIRED",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "GOSPEL_GREETING",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0083"
    ],
    "eventId": "GOSPEL",
    "variant": "GREETING_RESPONSE",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "GOSPEL_ACCLAMATION",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0085"
    ],
    "eventId": "GOSPEL",
    "variant": "BEFORE_GOSPEL",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "GOSPEL_CONCLUSION",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0087"
    ],
    "eventId": "GOSPEL",
    "variant": "SOURCE_PROPER_RESOLUTION_REQUIRED",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "CREDO_INTONATION",
    "kind": "CELEBRANT_INTONATION",
    "cueIds": [
      "AO.SM.C0089",
      "AO.SM.C0090"
    ],
    "eventId": "SUNG_CREDO",
    "variant": "INTONATION_TO_CHORAL_CONTINUATION",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "SECRET_CONCLUSION",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0136"
    ],
    "eventId": "ORATION",
    "variant": "APPROPRIATE_SUNG_CONCLUSION",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "PREFACE_GREETING",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0138"
    ],
    "eventId": "PREFACE_DIALOGUE",
    "variant": "MATCH_SELECTED_PREFACE_TONE",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "PREFACE_SURSUM_CORDA",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0140"
    ],
    "eventId": "PREFACE_DIALOGUE",
    "variant": "MATCH_SELECTED_PREFACE_TONE",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "PREFACE_GRATIAS",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0143"
    ],
    "eventId": "PREFACE_DIALOGUE",
    "variant": "MATCH_SELECTED_PREFACE_TONE",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "CANON_CONCLUSION",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0207"
    ],
    "eventId": "CANON",
    "variant": "APPROPRIATE_SUNG_CONCLUSION",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "PATERNOSTER_RESPONSE",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0210"
    ],
    "eventId": "PATERNOSTER",
    "variant": "PATERNOSTER_MATCHED_ENDING",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "PAX_DOMINI_RESPONSE",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0220"
    ],
    "eventId": "PAX_DOMINI",
    "variant": "FORM_GUARD",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "POSTCOMMUNION_GREETING",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0252"
    ],
    "eventId": "POSTCOMMUNION",
    "variant": "GREETING_RESPONSE",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "POSTCOMMUNION_AMEN",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0255"
    ],
    "eventId": "POSTCOMMUNION",
    "variant": "SOURCE_PROPER_RESOLUTION_REQUIRED",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "DISMISSAL_GREETING",
    "kind": "PEOPLE_RESPONSE",
    "cueIds": [
      "AO.SM.C0258"
    ],
    "eventId": "DISMISSAL",
    "variant": "GREETING_RESPONSE",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  },
  {
    "id": "DISMISSAL_EXCHANGE",
    "kind": "DISMISSAL_PAIR",
    "cueIds": [
      "AO.SM.C0259",
      "AO.SM.C0260"
    ],
    "eventId": "DISMISSAL",
    "variant": "SELECTED_DISMISSAL_FORM_AND_TONE",
    "source": "data/mass/ordinary-sung-speaker-audit.v1.json"
  }
].map(row=>Object.freeze({...row,cueIds:Object.freeze(row.cueIds)})));
const cueMap=new Map(PARTICIPATION_NEUME_POLICY.flatMap(row=>row.cueIds.map(cueId=>[cueId,row])));
const SUNG_FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
/** Return a source-backed UI opportunity, never a fabricated score/tone. */
export function participationNeumeOpportunity({cueId,form,paragraph=null}={}){
 if(!SUNG_FORMS.has(String(form??"").toUpperCase()))return null;
 const id=String(cueId??"");const row=cueMap.get(id);
 if(!row||!paragraph||paragraph.kind==="RUBRIC")return null;
 const paragraphCues=Array.isArray(paragraph.sourceCueIds)?paragraph.sourceCueIds.map(String):[];
 if(!paragraphCues.includes(id))return null;
 // Missing dynamically selected Proper/response text must not get a guessed Amen.
 if(![paragraph.primary,paragraph.secondary,paragraph.alternate].some(v=>
   typeof v==="string"&&v.trim()))return null;
 return row;
}
export function participationNotationDecision({cueId,form,paragraph=null,score=null}={}){
 const opportunity=participationNeumeOpportunity({cueId,form,paragraph});
 if(!opportunity)return Object.freeze({status:"NOT_SUNG_PARTICIPATION_CUE",score:null});
 // Score authority and Latin-text identity must already have been certified
 // by selectApprovedInlineScore; this function cannot promote research leads.
 if(!score||score.publication!=="PUBLIC_APPROVED"||
   score.approval!=="USER_AND_MUSICAL_SOURCE_REVIEWED"||
   score.sourceTextVerified!==true||score.musicalNotationVerified!==true||
   !(Array.isArray(score.sourceCueIds)?score.sourceCueIds:[score.sourceCueId])
     .every(id=>id&&opportunity.cueIds.includes(id)))
   return Object.freeze({status:"SOURCE_SCORE_REVIEW_PENDING",opportunity,score:null});
 return Object.freeze({status:"COMPACT_APPROVED",opportunity,score});
}
