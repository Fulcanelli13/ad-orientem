import { canonicalKey, canonicalIconKeysForReaderState } from "./reader-canonical-icons.js";
// Exact v1.80 / Asset Bank v4.6 semantic mapping for the native reader.
// Presentation authority: uploaded definitive v1.80 donor, AO_V46_ASSETS + v1.30 mapping.
// R17/R19 remains the state/liturgical owner; this file only resolves semantic art.

// Every rail resolves through the canonical icon set (21 Oct 2026): one
// approved asset per meaning, with the priest's position, action and voice as
// independent lanes. These tables are kept for callers that read them directly
// (Gloria/Credo faithful customs); their values are canonical keys.
const C=canonicalKey;
export const R17_ICON_KEYS=Object.freeze({
  posture:Object.freeze({
    STAND:C("faithful.posture.stand"),SIT:C("faithful.posture.sit"),
    KNEEL:C("faithful.posture.kneel"),GENUFLECT:C("faithful.gesture.genuflect"),
  }),
  gesture:Object.freeze({
    SIGN_OF_CROSS:C("faithful.gesture.sign_of_cross"),
    GOSPEL_CROSSES:C("faithful.gesture.gospel_crosses"),
    THREE_GOSPEL_CROSSES:C("faithful.gesture.gospel_crosses"),
    BREAST_STRIKE:C("faithful.gesture.strike_breast"),
    HEAD_BOW:C("faithful.gesture.bow_head"),
    PROFOUND_BOW:C("faithful.gesture.bow_profound"),
    BOW:C("faithful.gesture.bow_head"),
    GENUFLECT:C("faithful.gesture.genuflect"),
    HANDS_JOINED:C("faithful.gesture.hands_joined"),
    RISE:C("faithful.posture.stand"),
  }),
  response:C("response.people"),
  schola:C("schola.sings"),
  bell:C("bell.altar_bells"),
});

function voiceIconKey(value){
  const voice=String(value??"").trim().toUpperCase();
  if(!voice || /NO COMPETING|MINISTER RESPONSE/.test(voice))return null;
  if(/^LISTENS(?:$|\s*\/)/.test(voice))return "listen";
  if(/QUIET|SILENT|SECRET|PRIVATE|LOW/.test(voice))return "priest_silent";
  if(/SUNG|PUBLIC|CLEAR|AUDIBLE|SPOKEN|SINGS|CHANTED/.test(voice))return "priest_audible";
  return null;
}

// v1.80 attention lane is the faithful's instruction, not a second
// representation of the right-rail priest voice or response.
export function readerAttentionForState({priestVoice=null,response=null}={}){
  if(response)return null; // Dedicated response cue already owns this.
  const voice=priestVoice?.value??priestVoice?.label;
  return voiceIconKey(voice)==="priest_audible"
    ? Object.freeze({label:"LISTEN",iconKey:"listen",owner:"R17_PRIEST_PUBLIC_VOICE"})
    : null;
}

export function iconKeysForReaderState(state={}){
  return canonicalIconKeysForReaderState(state);
}

export function createHostIconResolver({
  assets=globalThis.AO_R17_ICON_ASSETS??null,
}={}){
  const bank=assets && typeof assets==="object" ? assets : null;
  return function resolve(key){
    const id=String(key??"").trim();
    if(!id || !bank)return null;
    const value=bank[id];
    return typeof value==="string" && value.trim() ? value : null;
  };
}

export const R17_FROZEN_ACTIVE_ICON_KEYS=Object.freeze([
  "stand","sit","kneel","genuflect","bow","profound_bow","cross","gospel_crosses",
  "hands_joined","breast_strike","head_bow","faithful","response","schola","bells",
  "priest_audible","priest_silent","listen","priest_centre","priest_chair","priest_sedilia",
  "priest_facing_people","priest_foot","priest_ascending","priest_rail","priest_incense_altar",
  "priest_incense_people","priest_genuflect","priest_elevation","communion","lavabo","fraction",
  "commingling","blessing","chalice_elevation","incense","gospel","epistle","preaching","canon",
  "priest_centre_rich","priest_centre_hands_rich","priest_centre_arms_rich","priest_epistle_rich",
  "priest_gospel_rich","priest_facing_people_rich","priest_turn_people_rich","priest_return_altar_rich",
  "priest_sedilia_rich","priest_sedilia_standing_rich","priest_sedilia_rising_rich","priest_rail_rich",
  "priest_communion_rich","priest_rail_after_rich","priest_incense_altar_rich","priest_incense_people_rich",
  "priest_profound_bow_rich","priest_kiss_altar_rich","priest_elevate_host_rich","priest_elevate_chalice_rich",
  "priest_blessing_rich","priest_foot_rich","priest_ascending_rich","priest_ambo_rich",
  "priest_procession_rich","priest_turn_altar_move_rich","priest_turn_people_move_rich",
]);

export const R17_FROZEN_EXCLUDED_ICON_KEYS=Object.freeze([]);

export function auditHostIconBank(assets){
  const resolver=createHostIconResolver({assets});
  const required=[...R17_FROZEN_ACTIVE_ICON_KEYS];
  const missing=required.filter(key=>!resolver(key));
  return Object.freeze({
    required:Object.freeze(required),
    excluded:R17_FROZEN_EXCLUDED_ICON_KEYS,
    missing:Object.freeze(missing),
    complete:missing.length===0,
  });
}
