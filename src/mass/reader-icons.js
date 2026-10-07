// Exact v1.80 / Asset Bank v4.6 semantic mapping for the native reader.
// Presentation authority: uploaded definitive v1.80 donor, AO_V46_ASSETS + v1.30 mapping.
// R17/R19 remains the state/liturgical owner; this file only resolves semantic art.

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
    RISE:"stand",
  }),
  priestPosition:Object.freeze({
    // v1.77 FINAL authority: top PRIEST summary is position-only and uses
    // the plain v4.6 pictogram family. Rich art remains action-only.
    FOOT_CENTER:"priest_foot",
    ALTAR_STEPS_ASCENDING:"priest_ascending",
    ALTAR_CENTER:"priest_centre",
    ALTAR_EPISTLE_MISSAL:"priest_centre",
    ALTAR_EPISTLE_SIDE:"priest_centre",
    ALTAR_FRONT_EPISTLE_HALF:"priest_centre",
    ALTAR_GOSPEL_MISSAL:"priest_centre",
    ALTAR_GOSPEL_SIDE:"priest_centre",
    ALTAR_FRONT_GOSPEL_HALF:"priest_centre",
    ALTAR_BACK_ROUTE:"priest_centre",
    SEDILIA:"priest_sedilia",
    COMMUNION_RAIL:"priest_rail",
    PREACHING_PLACE:"preaching",
    ROUTE_CONTROLLED:"priest_centre",
    PRIEST_TRACK_ASYNC:"priest_centre",
    PROCESSION_ROUTE:"priest_centre",
  }),
  response:"response",
  schola:"schola",
  bell:"bells",
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

const ACTION_ICON_KEYS=Object.freeze({
  "INCENSES ALTAR":"priest_incense_altar_rich",
  "INCENSES PEOPLE":"priest_incense_people_rich",
  "BLESSES INCENSE":"priest_incense_altar_rich",
  "RECEIVES INCENSE":"priest_incense_people_rich",
  "GENUFLECTS":"priest_genuflect",
  "PROFOUND BOW":"priest_profound_bow_rich",
  "KISSES ALTAR":"priest_kiss_altar_rich",
  "ELEVATES HOST":"priest_elevate_host_rich",
  "SHOWS SACRED HOST":"priest_elevate_host_rich",
  "ELEVATES CHALICE":"priest_elevate_chalice_rich",
  "MINOR ELEVATION":"canon",
  "OFFERS HOST":"priest_elevate_host_rich",
  "OFFERS CHALICE":"priest_elevate_chalice_rich",
  "GIVES COMMUNION":"priest_communion_rich",
  "RECEIVES HOST":"communion",
  "RECEIVES CHALICE":"chalice_elevation",
  "WASHES / PURIFIES":"lavabo",
  "BREAKS HOST":"fraction",
  "PLACES PARTICLE":"commingling",
  "BLESSES PEOPLE":"priest_blessing_rich",
  "PROCLAIMS GOSPEL":"priest_gospel_rich",
  "READS EPISTLE":"priest_epistle_rich",
  "TURNS TO PEOPLE":"priest_turn_people_rich",
  "TURNS TO ALTAR":"priest_return_altar_rich",
  "TURNS TO MISSAL":"priest_epistle_rich",
  "GOES TO GOSPEL SIDE":"priest_gospel_rich",
  "GOES TO EPISTLE SIDE":"priest_epistle_rich",
  "READS GRADUAL":"priest_epistle_rich",
  "READS ALLELUIA":"priest_epistle_rich",
  "READS COMMUNION":"priest_epistle_rich",
  "ASCENDS ALTAR":"priest_ascending_rich",
  "RETURNS TO ALTAR":"priest_return_altar_rich",
  "GOES TO SEDILIA":"priest_sedilia_standing_rich",
  "KISSES GOSPEL":"priest_gospel_rich",
  "SIGNS BOOK":"gospel_crosses",
  "SIGNS WITH PATEN":"cross",
  "THREE CROSSES":"cross",
  "SIGNS HOST":"cross",
  "SIGNS CHALICE":"cross",
  "SIGNS HIMSELF":"cross",
  "STRIKES BREAST":"breast_strike",
  "INTONES GLORIA":"priest_centre_arms_rich",
  "INTONES CREDO":"priest_centre_arms_rich",
  "UNCOVERS CHALICE":"canon",
});

function token(value){
  return String(value??"").trim().toUpperCase().replace(/[ -]+/g,"_");
}

function priestActionKey(action){
  const direct=String(action?.iconKey??"").trim();
  if(direct)return direct;
  const label=String(action?.label??action?.action??action?.value??"").trim().toUpperCase();
  return ACTION_ICON_KEYS[label]??null;
}

function gestureKey(gesture){
  if(!gesture)return null;
  const direct=token(gesture.type??gesture.value);
  if(R17_ICON_KEYS.gesture[direct])return R17_ICON_KEYS.gesture[direct];
  const raw=String(gesture.action??gesture.label??"").toLowerCase();
  if(/^rise$|\brise\b/.test(raw))return "stand";
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
  const facing=token(state.priestPosition?.facing);
  return Object.freeze({
    postureIconKey:R17_ICON_KEYS.posture[posture]??null,
    gestureIconKey:gestureKey(state.gesture),
    responseIconKey:state.response ? R17_ICON_KEYS.response : null,
    priestVoiceIconKey:R17_ICON_KEYS.priestVoice[voice]??(
      /LOW|QUIET|SILENT|SECRET|INAUDIBLE|LISTEN/.test(voice) ? "priest_silent" :
      voice ? "priest_audible" : null
    ),
    scholaIconKey:state.schola ? R17_ICON_KEYS.schola : null,
    priestPositionIconKey:/PEOPLE/.test(facing)
      ? "priest_facing_people"
      : (R17_ICON_KEYS.priestPosition[station]??null),
    priestActionIconKey:priestActionKey(state.priestAction),
    bellIconKey:state.bell ? R17_ICON_KEYS.bell : null,
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
