// Presentation-only speaker annotation for the 1962 ordinary.
// Speaker identity is not identical to the source clock: a sung Ordinary
// intonation may span a PUBLIC_TEXT cue and a SCHOLA_PUBLIC donor cue.
// This layer never alters canonical cues, event timing or source text.
const EXPLICIT=Object.freeze({
  // In the preparatory prayers the Low Mass witness identifies the
  // priest's Amen followed by responses from the minister(s).
  "AO.SM.C0020":Object.freeze({role:"PRIEST",evidence:"LOW_MASS_PUBLISHED_DIALOGUE",prefix:"S.",kind:"TEXT"}),
  "AO.SM.C0025":Object.freeze({role:"MINISTERS",evidence:"LOW_MASS_PUBLISHED_DIALOGUE",prefix:"M.",kind:"RESPONSE"}),
  "AO.SM.C0027":Object.freeze({role:"MINISTERS",evidence:"LOW_MASS_PUBLISHED_DIALOGUE",prefix:"M.",kind:"RESPONSE"}),
  // The celebrant intones the complete first clause. The choir begins
  // Et in terra pax / Patrem omnipotentem; see Psallite Sapienter §§43-45
  // and the Roman Missal. Keep the donor cue identities unchanged.
  "AO.SM.C0053":Object.freeze({role:"PRIEST",evidence:"SUNG_INTONATION",prefix:null,kind:"TEXT"}),
  "AO.SM.C0054":Object.freeze({role:"PRIEST",evidence:"SUNG_INTONATION",prefix:null,kind:"TEXT"}),
  "AO.SM.C0089":Object.freeze({role:"PRIEST",evidence:"SUNG_INTONATION",prefix:null,kind:"TEXT"}),
  "AO.SM.C0090":Object.freeze({role:"PRIEST",evidence:"SUNG_INTONATION",prefix:null,kind:"TEXT"}),
});
export const SUNG_ORDINARY_INTONATION_CUES=Object.freeze(["AO.SM.C0053","AO.SM.C0054","AO.SM.C0089","AO.SM.C0090"]);

export function resolveOrdinarySpeaker(unit,{form="SUNG"}={}){
  const cueId=String(unit?.cue_id??"");
  const override=EXPLICIT[cueId];
  if(override)return override;
  const text=String(unit?.latin??"").trim();
  const clock=String(unit?.clock??"").toUpperCase();
  if(/^S\.\s*/u.test(text))return Object.freeze({role:"PRIEST",evidence:"EXPLICIT_S_PREFIX"});
  if(/^M\.\s*/u.test(text))return Object.freeze({role:"MINISTERS",evidence:"EXPLICIT_M_PREFIX"});
  if(/^(?:℟\.|R\.)\s*/u.test(text))return Object.freeze({role:"RESPONDERS",evidence:"EXPLICIT_R_PREFIX"});
  if(clock==="PRIEST_PRIVATE")return Object.freeze({role:"PRIEST",evidence:"CANONICAL_PRIVATE_CLOCK"});
  if(clock==="SCHOLA_PUBLIC")return Object.freeze({role:"SCHOLA",evidence:"CANONICAL_SCHOLA_CLOCK"});
  if(clock==="MINISTER_RESPONSE")return Object.freeze({role:"MINISTERS",evidence:"CANONICAL_RESPONSE_CLOCK"});
  if(clock==="USER_RESPONSE")return Object.freeze({role:"RESPONDERS",evidence:"CANONICAL_RESPONSE_CLOCK"});
  if(clock==="PRIEST_ACTION")return Object.freeze({role:"PRIEST_ACTION",evidence:"CANONICAL_ACTION_CLOCK"});
  // V. by itself specifies a versicle, not necessarily the celebrant:
  // Gospel ministers vary between Low, Missa Cantata and Solemn forms.
  if(/^(?:℣\.|V\.)\s*/u.test(text))return Object.freeze({role:"VERSICLE_LEADER",evidence:"EXPLICIT_V_PREFIX"});
  return Object.freeze({role:"UNRESOLVED",evidence:"NO_SPEAKER_CLAIM"});
}

// Only apply to the Sung donor's unlabelled opening-Amens; the Low
// corpus already prints these labels. Avoid cross-form string heuristics.
export function correctSungPreparatoryAmen(cueId,latin,{form="SUNG"}={}){
  if(String(form).toUpperCase()!=="SUNG")return latin;
  const explicit=EXPLICIT[String(cueId)];
  if(!explicit?.prefix || !/^Amen\.$/iu.test(String(latin??"").trim()))return latin;
  return explicit.prefix+" "+String(latin).trim();
}

export function ordinarySpeakerOverrides(){
  return EXPLICIT;
}
