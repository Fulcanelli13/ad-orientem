// Presentation-only speaker annotation for the 1962 ordinary.
// Speaker identity is not identical to the source clock: a sung Ordinary
// intonation may span a PUBLIC_TEXT cue and a SCHOLA_PUBLIC donor cue.
// This layer never alters canonical cues, event timing or source text.
const EXPLICIT=Object.freeze({
  // Exact speaker initials preserved in the 1962 Low Mass text witness;
  // the Sung donor omitted those initials on these opening dialogues.
  "AO.SM.C0001":Object.freeze({role:"PRIEST",evidence:"LOW_MASS_DIALOGUE_PREFIX",prefix:"S."}),
  "AO.SM.C0016":Object.freeze({role:"PRIEST",evidence:"LOW_MASS_DIALOGUE_PREFIX",prefix:"S."}),
  "AO.SM.C0019":Object.freeze({role:"MINISTERS",evidence:"LOW_MASS_DIALOGUE_PREFIX",prefix:"M.",kind:"RESPONSE"}),
  "AO.SM.C0021":Object.freeze({role:"MINISTERS",evidence:"LOW_MASS_DIALOGUE_PREFIX",prefix:"M.",kind:"RESPONSE"}),
  "AO.SM.C0024":Object.freeze({role:"PRIEST",evidence:"LOW_MASS_DIALOGUE_PREFIX",prefix:"S."}),
  "AO.SM.C0026":Object.freeze({role:"PRIEST",evidence:"LOW_MASS_DIALOGUE_PREFIX",prefix:"S."}),
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
// Explicit section ownership is needed because PUBLIC_TEXT only describes
// audibility, not which minister is speaking. These scopes are read with
// the 1962 Ordinary's speaking order; contingent ministries remain conditional.
const BLOCK_ACTORS=Object.freeze({
  "AO.SM.B001":"PRIEST",
  "AO.SM.B005":"PRIEST",
  "AO.SM.B006":"MINISTERS",
  "AO.SM.B007":"MINISTERS",
  "AO.SM.B008":"PRIEST",
  "AO.SM.B009":"PRIEST",
  "AO.SM.B013":"PRIEST",
  "AO.SM.B018":"PRIEST",
  "AO.SM.B025":"GOSPEL_PROCLAIMER",
  "AO.SM.B029":"PRIEST",
  "AO.SM.B039":"PRIEST",
  "AO.SM.B041":"PRIEST",
  "AO.SM.B044":"PRIEST",
  "AO.SM.B058":"PRIEST",
  "AO.SM.B062":"PRIEST",
  "AO.SM.B063":"PRIEST",
  "AO.SM.B077":"MINISTERS",
  "AO.SM.B078":"PRIEST",
  "AO.SM.B079":"PRIEST",
  "AO.SM.B080":"PRIEST",
  "AO.SM.B081":"RESPONDERS",
  "AO.SM.B082":"PRIEST",
  "AO.SM.B087":"PRIEST",
  "AO.SM.B092":"PRIEST",
  "AO.SM.B094":"PRIEST",
  "AO.SM.B095":"PRIEST",
});
const VERSICLE_ACTORS=Object.freeze({
  // Dismissal/Gospel dialogues belong to the celebrant at Missa Cantata,
  // but to the sacred minister where prescribed at Solemn Mass.
  "AO.SM.B024":"GOSPEL_PROCLAIMER",
  "AO.SM.B090":"DISMISSAL_MINISTER",
});
export const SUNG_ORDINARY_INTONATION_CUES=Object.freeze(["AO.SM.C0053","AO.SM.C0054","AO.SM.C0089","AO.SM.C0090"]);

export function resolveOrdinarySpeaker(unit,{form="SUNG",blockId=null}={}){
  const cueId=String(unit?.cue_id??"");
  const override=EXPLICIT[cueId];
  if(override)return override;
  const text=String(unit?.latin??"").trim();
  const clock=String(unit?.clock??"").toUpperCase();
  // The generic SUNG audit intentionally retains conditional speaker roles.
  // An actual selected form may resolve the public Gospel and dismissal
  // ministers without attributing the priest's silent text to the deacon.
  const actualForm=String(form??"").toUpperCase();
  const actualForms=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
  if(clock==="PUBLIC_TEXT" && actualForms.has(actualForm) &&
    ["AO.SM.B024","AO.SM.B025","AO.SM.B090"].includes(String(blockId))){
    return Object.freeze({
      role:actualForm==="SOLEMN"?"DEACON":"PRIEST",
      evidence:"1962_MASS_FORM_PUBLIC_MINISTER",
    });
  }
  if(/^S\.\s*/u.test(text))return Object.freeze({role:"PRIEST",evidence:"EXPLICIT_S_PREFIX"});
  if(/^M\.\s*/u.test(text))return Object.freeze({role:"MINISTERS",evidence:"EXPLICIT_M_PREFIX"});
  if(/^(?:℟\.|R\.)\s*/u.test(text))return Object.freeze({role:"RESPONDERS",evidence:"EXPLICIT_R_PREFIX"});
  if(clock==="PRIEST_PRIVATE")return Object.freeze({role:"PRIEST",evidence:"CANONICAL_PRIVATE_CLOCK"});
  if(clock==="SCHOLA_PUBLIC")return Object.freeze({role:"SCHOLA",evidence:"CANONICAL_SCHOLA_CLOCK"});
  if(clock==="MINISTER_RESPONSE")return Object.freeze({role:"MINISTERS",evidence:"CANONICAL_RESPONSE_CLOCK"});
  if(clock==="USER_RESPONSE")return Object.freeze({role:"RESPONDERS",evidence:"CANONICAL_RESPONSE_CLOCK"});
  if(clock==="PRIEST_ACTION")return Object.freeze({role:"PRIEST_ACTION",evidence:"CANONICAL_ACTION_CLOCK"});
  if(clock==="GUIDE")return Object.freeze({role:"EDITORIAL_GUIDE",evidence:"CANONICAL_GUIDE_CLOCK"});
  if(clock==="PUBLIC_TEXT" && BLOCK_ACTORS[String(blockId)]){
    return Object.freeze({role:BLOCK_ACTORS[String(blockId)],evidence:"1962_BLOCK_CEREMONIAL_SCOPE"});
  }
  // V. by itself specifies a versicle, not necessarily the celebrant:
  // Gospel ministers vary between Low, Missa Cantata and Solemn forms.
  if(/^(?:℣\.|V\.)\s*/u.test(text)){
    return Object.freeze({role:VERSICLE_ACTORS[String(blockId)]??"PRIEST",evidence:"1962_VERSICLE_CEREMONIAL_SCOPE"});
  }
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

// Add only initials whose exact source witness survives in the Low Mass
// corpus; never prefix a priest's private prayer or a public chant by guess.
export function applySungSpeakerPrefix(cueId,text,{form="SUNG"}={}){
  if(String(form).toUpperCase()!=="SUNG")return text;
  const first=EXPLICIT[String(cueId)]?.prefix;
  const raw=String(text??"").trim();
  if(!first||!raw||/^(?:S\.|M\.|R\.|V\.|℟\.|℣\.)\s*/u.test(raw))return text;
  return first+" "+raw;
}
export function ordinarySpeakerOverrides(){
  return EXPLICIT;
}
