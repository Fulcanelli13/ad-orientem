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
// Exact canonical ordinary-Sung word fragments outside Gloria/Credo.
// Each is a literal fragment of the same cue in reader-text-sung.v1.json
// (Latin/English) or the pinned French Ordinary witness. These are only
// presentation anchors; they NEVER manufacture a gesture or relax its profile
// and local-condition gates. Cue actions without a text-bound instant stay unlit.
export const ORDINARY_SUNG_GESTURE_ANCHORS=Object.freeze({
  "AO.SM.C0001":Object.freeze({anchorLat:"In nómine Patris",anchorEn:"In the Name of the Father",anchorFr:"Au nom du Père"}),
  "AO.SM.C0014":Object.freeze({anchorLat:"Adiutórium nostrum ✠",anchorEn:"Our help ✠",anchorFr:"Notre secours ✠"}),
  "AO.SM.C0021":Object.freeze({anchorLat:"Confíteor Deo omnipoténti",anchorEn:"I confess to Almighty God",anchorFr:"Je confesse à Dieu tout-puissant"}),
  "AO.SM.C0022":Object.freeze({anchorLat:"mea culpa, mea culpa, mea máxima culpa",anchorEn:"through my fault, through my fault, through my most grievous fault",anchorFr:"C’est ma faute, c’est ma faute, c’est ma très grande faute"}),
  "AO.SM.C0023":Object.freeze({anchorLat:"Ideo precor",anchorEn:"Therefore I beseech",anchorFr:"C’est pourquoi je supplie"}),
  "AO.SM.C0026":Object.freeze({anchorLat:"Indulgéntiam, ✠",anchorEn:"pardon, ✠",anchorFr:"accorde ✠"}),
  "AO.SM.C0084":Object.freeze({anchorLat:"Sequéntia ✠",anchorEn:"Continuation ✠",anchorFr:"Suite ✠"}),
  "AO.SM.C0141":Object.freeze({anchorLat:"Grátias agámus Dómino",anchorEn:"Let us give thanks to the Lord",anchorFr:"Rendons grâces au Seigneur"}),
  "AO.SM.C0142":Object.freeze({anchorLat:"Deo nostro",anchorEn:"our God",anchorFr:"notre Dieu"}),
  "AO.SM.C0145":Object.freeze({anchorLat:"Sanctus, Sanctus, Sanctus",anchorEn:"Holy, Holy, Holy",anchorFr:"Saint, Saint, Saint"}),
  "AO.SM.C0148":Object.freeze({anchorLat:"Benedíctus qui venit",anchorEn:"Blessed is He who comes",anchorFr:"Béni soit celui qui vient"}),
  "AO.SM.C0196":Object.freeze({anchorLat:"Nobis quoque peccatóribus",anchorEn:"To us also, thy sinful servants",anchorFr:"À nous aussi, pécheurs"}),
  "AO.SM.C0222":Object.freeze({anchorLat:"Agnus Dei",anchorEn:"Lamb of God",anchorFr:"Agneau de Dieu"}),
  "AO.SM.C0223":Object.freeze({anchorLat:"Agnus Dei",anchorEn:"Lamb of God",anchorFr:"Agneau de Dieu"}),
  "AO.SM.C0224":Object.freeze({anchorLat:"Agnus Dei",anchorEn:"Lamb of God",anchorFr:"Agneau de Dieu"}),
  "AO.SM.C0235":Object.freeze({anchorLat:"Confíteor Deo omnipoténti",anchorEn:"I confess to Almighty God",anchorFr:"Je confesse à Dieu tout-puissant"}),
  "AO.SM.C0236":Object.freeze({anchorLat:"mea culpa, mea culpa, mea máxima culpa",anchorEn:"through my fault, through my fault, through my most grievous fault",anchorFr:"C’est ma faute, c’est ma faute, c’est ma très grande faute"}),
  "AO.SM.C0237":Object.freeze({anchorLat:"Ideo precor",anchorEn:"Therefore I beseech",anchorFr:"C’est pourquoi je supplie"}),
  "AO.SM.C0240":Object.freeze({anchorLat:"Indulgéntiam, ✠",anchorEn:"pardon, ✠",anchorFr:"accorde ✠"}),
  "AO.SM.C0242":Object.freeze({anchorLat:"Ecce Agnus Dei",anchorEn:"Behold the Lamb of God",anchorFr:"Voici l’Agneau de Dieu"}),
  "AO.SM.C0243":Object.freeze({anchorLat:"Dómine, non sum dignus",anchorEn:"Lord, I am not worthy",anchorFr:"Seigneur, je ne suis pas digne"}),
  "AO.SM.C0244":Object.freeze({anchorLat:"Dómine, non sum dignus",anchorEn:"Lord, I am not worthy",anchorFr:"Seigneur, je ne suis pas digne"}),
  "AO.SM.C0245":Object.freeze({anchorLat:"Dómine, non sum dignus",anchorEn:"Lord, I am not worthy",anchorFr:"Seigneur, je ne suis pas digne"}),
  "AO.SM.C0265":Object.freeze({anchorLat:"Pater, et Fílius, ✠",anchorEn:"the Father, and the Son, ✠",anchorFr:"le Père, le Fils, ✠"}),
  "AO.SM.C0269":Object.freeze({anchorLat:"Initium ✠ sancti Evangélii",anchorEn:"The beginning ✠ of the holy Gospel",anchorFr:"Commencement ✠ du saint Évangile"}),
  "AO.SM.C0273":Object.freeze({anchorLat:"ET VERBUM CARO FACTUM EST",anchorEn:"AND THE WORD WAS MADE FLESH",anchorFr:"ET LE VERBE S’EST FAIT CHAIR"}),
  "AO.SM.C0274":Object.freeze({anchorLat:"Et habitávit in nobis",anchorEn:"And dwelt among us",anchorFr:"et il a habité parmi nous"}),
});

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
