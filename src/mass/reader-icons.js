// Approved Ad Orientem icon-bank mapping for the native R17 reader.
// Only semantics marked FROZEN_ACTIVE in the v4 asset ledger are mandatory.
// FROZEN_EXCLUDED semantics deliberately remain text-only.

export const R17_ICON_KEYS=Object.freeze({
  posture:Object.freeze({
    STAND:"stand",SIT:"sit",KNEEL:"kneel",GENUFLECT:"genuflect",
  }),
  gesture:Object.freeze({
    SIGN_OF_CROSS:"cross",
    GOSPEL_CROSSES:"gospel_crosses",
    THREE_GOSPEL_CROSSES:"gospel_crosses",
    BREAST_STRIKE:"breast_strike",
    HEAD_BOW:"head_bow",
    PROFOUND_BOW:"profound_bow",
    BOW:"bow",
    GENUFLECT:"genuflect",
    HANDS_JOINED:"hands_joined",
  }),
  priestPosition:Object.freeze({
    FOOT_CENTER:"priest_foot",
    ALTAR_STEPS_ASCENDING:"priest_steps",
    ALTAR_CENTER:"priest_centre",
    ROUTE_CONTROLLED:"priest_centre",
    PRIEST_TRACK_ASYNC:"priest_centre",
    ALTAR_EPISTLE_MISSAL:"priest_epistle",
    ALTAR_EPISTLE_SIDE:"priest_epistle",
    ALTAR_GOSPEL_MISSAL:"priest_gospel",
    ALTAR_GOSPEL_SIDE:"priest_gospel",
    SEDILIA:"priest_sedilia",
    COMMUNION_RAIL:"priest_rail",
    PREACHING_PLACE:"priest_people",
  }),
  response:"response",
  schola:"schola",
  priestVoice:Object.freeze({
    AUDIBLE:"priest_audible",
    PUBLIC:"priest_audible",
    CHANTED:"priest_audible",
    SINGS:"priest_audible",
    SPEAKS:"priest_audible",
    LOW_VOICE:"priest_silent",
    QUIET:"priest_silent",
    SILENT:"priest_silent",
    SECRET:"priest_silent",
    INAUDIBLE:"priest_silent",
    LISTENS:"priest_silent",
    NONE:"priest_silent",
  }),
});

function token(value){
  return String(value??"").trim().toUpperCase().replace(/[ -]+/g,"_");
}

function priestActionKey(action){
  const label=token(action?.value??action?.label??action?.action);
  if(["ELEVATES_HOST","ELEVATES_CHALICE","MINOR_ELEVATION","SHOWS_SACRED_HOST"].includes(label))return "priest_elevation";
  if(label==="BLESSES_PEOPLE")return "blessing";
  if(label==="GIVES_COMMUNION")return "communion";
  if(label==="WASHES_/_PURIFIES" || label==="WASHES_PURIFIES")return "lavabo";
  if(label==="INCENSES_ALTAR")return "priest_incense_altar";
  if(label==="PROFOUND_BOW")return "profound_bow";
  if(label==="STRIKES_BREAST")return "breast_strike";
  // ACTOR.PRIEST.GENUFLECT remains quarantined by KNOWN-ERRATA.md because the
  // recovered archive bytes do not match the frozen manifest hash.
  return null;
}

function gestureKey(gesture){
  if(!gesture)return null;
  const direct=token(gesture.type??gesture.value);
  if(R17_ICON_KEYS.gesture[direct])return R17_ICON_KEYS.gesture[direct];
  const raw=String(gesture.action??gesture.label??"").toLowerCase();
  if(/forehead.*lips.*breast|three.*cross/.test(raw))return "gospel_crosses";
  if(/sign of (the )?cross|cross oneself/.test(raw))return "cross";
  if(/strike.*breast|breast strike/.test(raw))return "breast_strike";
  if(/genuflect/.test(raw))return "genuflect";
  if(/profound.*bow/.test(raw))return "profound_bow";
  if(/bow.*head|head.*bow/.test(raw))return "head_bow";
  if(/hands joined/.test(raw))return "hands_joined";
  if(/bow/.test(raw))return "bow";
  return null;
}

export function iconKeysForReaderState(state={}){
  const posture=token(state.posture?.value??state.posture?.label);
  const voice=token(state.priestVoice?.value??state.priestVoice?.label);
  const station=token(state.priestPosition?.station??state.priestPosition?.value);
  return Object.freeze({
    postureIconKey:R17_ICON_KEYS.posture[posture]??null,
    gestureIconKey:gestureKey(state.gesture),
    responseIconKey:state.response ? R17_ICON_KEYS.response : null,
    priestVoiceIconKey:R17_ICON_KEYS.priestVoice[voice]??(
      /LOW|QUIET|SILENT|SECRET|INAUDIBLE|LISTEN/.test(voice) ? "priest_silent" :
      voice ? "priest_audible" : null
    ),
    scholaIconKey:state.schola ? R17_ICON_KEYS.schola : null,
    priestPositionIconKey:R17_ICON_KEYS.priestPosition[station]??null,
    // v1.80 separates persistent priest position from transient priest action.
    // No frozen active priest-action asset exists yet, so action art fails closed
    // instead of borrowing a position pictogram.
    priestActionIconKey:priestActionKey(state.priestAction),
    bellIconKey:state.bell ? "bells" : null,
  });
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
  "stand","sit","kneel","genuflect","bow",
  "breast_strike","head_bow","profound_bow","hands_joined",
  "response","schola","priest_audible","priest_silent",
  "priest_foot","priest_steps","priest_centre","priest_epistle","priest_gospel",
  "priest_rail","priest_people",
  "bells","priest_elevation","blessing","communion","lavabo","priest_incense_altar",
]);

export const R17_FROZEN_EXCLUDED_ICON_KEYS=Object.freeze([
  "cross","gospel_crosses","priest_sedilia",
]);

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
