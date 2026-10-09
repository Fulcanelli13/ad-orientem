import { GESTURE_PROFILES } from "./reader-state.js";

const PROFILE_LEVEL = Object.freeze({
  ESSENTIAL: 0,
  GUIDED_1962: 1,
  TRADITIONAL: 2,
});

// The vernacular anchor fragments below are transcribed from the paired
// canonical reader-text-sung.v1.json (English) and the pinned French
// reader-french-ordinary.v1.json byCue witness. They never create a cue:
// each is selectable only after its exact AO.SM.C.... Latin cue owns focus.
export const GLORIA_CREDO_FAITHFUL_GESTURES = Object.freeze({
  "AO.SM.C0056": Object.freeze({phase:"GLORIA",action:"HEAD_BOW",anchorLat:"Adorámus te",anchorEn:"We adore thee",anchorFr:"Nous vous adorons",minimumProfile:"TRADITIONAL"}),
  "AO.SM.C0058": Object.freeze({phase:"GLORIA",action:"HEAD_BOW",anchorLat:"Grátias ágimus tibi",anchorEn:"We give thee thanks",anchorFr:"Nous vous rendons grâces",minimumProfile:"TRADITIONAL"}),
  "AO.SM.C0061": Object.freeze({phase:"GLORIA",action:"HEAD_BOW",anchorLat:"Iesu Christe",anchorEn:"Jesus Christ",anchorFr:"Jésus-Christ",minimumProfile:"TRADITIONAL"}),
  "AO.SM.C0064": Object.freeze({phase:"GLORIA",action:"HEAD_BOW",anchorLat:"súscipe deprecatiónem nostram",anchorEn:"receive our prayer",anchorFr:"accueillez notre prière",minimumProfile:"TRADITIONAL"}),
  "AO.SM.C0067": Object.freeze({phase:"GLORIA",action:"HEAD_BOW",anchorLat:"Iesu Christe",anchorEn:"Jesus Christ",anchorFr:"Jésus-Christ",minimumProfile:"TRADITIONAL"}),
  "AO.SM.C0068": Object.freeze({phase:"GLORIA",action:"SIGN_OF_CROSS",anchorLat:"Cum Sancto Spíritu ✠",anchorEn:"With the Holy Ghost",anchorFr:"avec le Saint-Esprit ✠",minimumProfile:"TRADITIONAL"}),
  "AO.SM.C0090": Object.freeze({phase:"CREDO",action:"HEAD_BOW",anchorLat:"in unum Deum",anchorEn:"in one God",anchorFr:"en un seul Dieu",minimumProfile:"TRADITIONAL"}),
  "AO.SM.C0093": Object.freeze({phase:"CREDO",action:"HEAD_BOW",anchorLat:"Iesum Christum",anchorEn:"Jesus Christ",anchorFr:"Jésus-Christ",minimumProfile:"TRADITIONAL"}),
  "AO.SM.C0096": Object.freeze({phase:"CREDO",action:"INCARNATUS_RESOLVER",anchorLat:"Et incarnátus est … et homo factus est",anchorEn:"And was incarnate … and was made man",anchorFr:"Il a pris chair … et s’est fait homme",minimumProfile:"ESSENTIAL"}),
  "AO.SM.C0101": Object.freeze({phase:"CREDO",action:"HEAD_BOW",anchorLat:"simul adorátur",anchorEn:"is together adored",anchorFr:"il reçoit même adoration",minimumProfile:"TRADITIONAL"}),
  "AO.SM.C0104": Object.freeze({phase:"CREDO",action:"SIGN_OF_CROSS",anchorLat:"Et vitam ✠",anchorEn:"And the life",anchorFr:"Et la vie ✠",minimumProfile:"TRADITIONAL"}),
});

export const GLORIA_CREDO_SOURCE_GESTURE_CUES=Object.freeze(new Set([
  "AO.SM.C0055","AO.SM.C0056","AO.SM.C0057","AO.SM.C0058","AO.SM.C0059",
  "AO.SM.C0060","AO.SM.C0061","AO.SM.C0062","AO.SM.C0063","AO.SM.C0064",
  "AO.SM.C0066","AO.SM.C0067","AO.SM.C0068","AO.SM.C0069",
  "AO.SM.C0089","AO.SM.C0090","AO.SM.C0092","AO.SM.C0093","AO.SM.C0094",
  "AO.SM.C0096","AO.SM.C0097","AO.SM.C0100","AO.SM.C0101","AO.SM.C0102",
  "AO.SM.C0104","AO.SM.C0105",
]));

export function isGloriaCredoGestureSourceCue(cueId){
  return GLORIA_CREDO_SOURCE_GESTURE_CUES.has(String(cueId??""));
}

function normalizeProfile(value) {
  const profile=String(value ?? "GUIDED_1962").toUpperCase();
  if(!GESTURE_PROFILES.includes(profile)) throw new Error("Unknown gesture profile: "+profile);
  return profile;
}

function labelFor(action) {
  return ({
    HEAD_BOW:"BOW HEAD",
    SIGN_OF_CROSS:"SIGN OF CROSS",
    INCARNATUS_RESOLVER:"GENUFLECT / INCARNATUS",
  })[action] ?? action.replaceAll("_"," ");
}

export function resolveFaithfulGestureForCue({cueId,gestureProfile,incarnatusAction="GENUFLECT"}={}) {
  const id=String(cueId ?? "");
  const spec=GLORIA_CREDO_FAITHFUL_GESTURES[id];
  if(!spec) return null;
  const profile=normalizeProfile(gestureProfile);
  if(PROFILE_LEVEL[profile] < PROFILE_LEVEL[spec.minimumProfile]) return null;

  const action=spec.action==="INCARNATUS_RESOLVER"
    ? String(incarnatusAction || "GENUFLECT").toUpperCase()
    : spec.action;

  return Object.freeze({
    label:labelFor(action),
    type:action,
    transient:true,
    owner:spec.action==="INCARNATUS_RESOLVER" ? "R17_RUBRICAL_CUE" : "R17_PROFILE_CUE",
    canonicalCueId:id,
    profile,
    authorityClass:spec.action==="INCARNATUS_RESOLVER"
      ? "1962_RULE_PLUS_1962_ERA_GUIDANCE"
      : "TRADITIONAL_FAITHFUL_CUSTOM",
    anchorLat:spec.anchorLat,
    anchorEn:spec.anchorEn,
    anchorFr:spec.anchorFr,
  });
}

const CUE_KEYS=new Set(["canonicalCueId","currentCueId","cueId","activeCueId","sourceCueId"]);
export function extractCanonicalCueId(input,{maxDepth=4}={}) {
  const seen=new Set();
  function walk(value,depth,key=null){
    if(depth>maxDepth || value==null) return null;
    if(typeof value==="string"){
      const raw=value.trim();
      if(/^AO\.SM\.C\d{4}$/.test(raw) && (CUE_KEYS.has(key)||depth===0)) return raw;
      return null;
    }
    if(typeof value!=="object" || seen.has(value)) return null;
    seen.add(value);
    for(const k of CUE_KEYS){
      const hit=walk(value[k],depth+1,k);
      if(hit) return hit;
    }
    for(const k of ["current","active","event","cursor","state","reader","runtime","paragraph"]){
      const hit=walk(value[k],depth+1,k);
      if(hit) return hit;
    }
    return null;
  }
  return walk(input,0,null);
}
