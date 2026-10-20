import { R17_DONOR_PNG_ICON_KEYS } from "../src/mass/reader-icon-bank.js";
import { R17_REVIEWED_POSTURE_ASSETS } from "../src/mass/reader-reviewed-posture-assets.js";
import { extractDonorRichMaskUri } from "../src/mass/reader-dom.js";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import {
  R17_ICON_KEYS,
  R17_FROZEN_ACTIVE_ICON_KEYS,
  R17_FROZEN_EXCLUDED_ICON_KEYS,
  iconKeysForReaderState,
  readerAttentionForState,
  createHostIconResolver,
  auditHostIconBank,
} from "../src/mass/reader-icons.js";

// All newly approved presentation assets are real files and do not extend
// the frozen 67-master donor contract.
for(const [name,url] of Object.entries(R17_REVIEWED_POSTURE_ASSETS)){
  assert.ok(url.startsWith("file:"),"approved browser asset not bundled: "+name);
  const file=readFileSync(new URL(url));
  assert.ok(file.length>100,"approved posture image missing: "+name);
  assert.ok(!R17_FROZEN_ACTIVE_ICON_KEYS.includes(name),
    "reviewed posture alias leaked into 67 exact donor masters");
  if(name!=="review_posture_sit"&&name!=="review_faithful_bow"){
    const svg=String(file);
    assert.match(svg,/<svg[^>]*viewBox="[\d ]+"/,
      "approved normalized SVG has malformed viewBox: "+name);
    assert.doesNotMatch(svg,/\sviewbox=/,
      "frozen bank's malformed lowercase viewbox was copied: "+name);
  }
}
const required=auditHostIconBank({}).required;
const bank=Object.fromEntries(required.map(key=>[key,"data:image/svg+xml;base64,"+Buffer.from("<svg/>").toString("base64")]));
const audit=auditHostIconBank(bank);
assert.equal(audit.complete,true);
assert.deepEqual(audit.missing,[]);
assert.deepEqual(audit.required,[...R17_FROZEN_ACTIVE_ICON_KEYS]);
assert.deepEqual(audit.excluded,[...R17_FROZEN_EXCLUDED_ICON_KEYS]);
for(const key of R17_FROZEN_EXCLUDED_ICON_KEYS)assert.equal(bank[key],undefined,
  key+" unexpectedly became a mandatory frozen asset");

const resolve=createHostIconResolver({assets:bank});
assert.match(resolve("stand"),/^data:image/);
assert.equal(resolve("missing"),null);

let keys=iconKeysForReaderState({
  posture:{value:"KNEEL"},
  gesture:{type:"GOSPEL_CROSSES"},
  response:{text:"Amen"},
  priestVoice:{value:"LOW_VOICE"},
  priestPosition:{station:"ALTAR_GOSPEL_MISSAL"},
  priestAction:{label:"ELEVATES HOST"},
  schola:{label:"Credo"},
});
assert.equal(keys.postureIconKey,"review_posture_kneel");
assert.equal(keys.gestureIconKey,"gospel_crosses");
keys=iconKeysForReaderState({gesture:{owner:"GESTURE_MATRIX_SOT",
  label:"Customary bow may follow local practice",iconKey:null}});
assert.equal(keys.gestureIconKey,null,"quarantined customary gesture obtained an invented icon");
keys=iconKeysForReaderState({priestAction:{owner:"GESTURE_MATRIX_SOT",
  label:"RAISES EYES AND HANDS",iconKey:null}});
assert.equal(keys.priestActionIconKey,null,"pending priest art was guessed from fallback labels");
// Restore the primary test projection for all remaining claims.
keys=iconKeysForReaderState({
  posture:{value:"KNEEL"},gesture:{type:"GOSPEL_CROSSES"},
  response:{text:"Amen"},priestVoice:{value:"LOW_VOICE"},
  priestPosition:{station:"ALTAR_GOSPEL_MISSAL"},
  priestAction:{label:"ELEVATES HOST"},schola:{label:"Credo"}
});
assert.equal(keys.responseIconKey,"response");
assert.equal(keys.priestVoiceIconKey,"priest_silent");
assert.equal(keys.priestPositionIconKey,"priest_epistle_rich","Oct 19 review: physical Gospel-side art is the former epistle file");
assert.equal(keys.priestActionIconKey,"priest_elevation","user-selected original v1.80 Host elevation artwork is not wired");
assert.equal(keys.scholaIconKey,"schola");

keys=iconKeysForReaderState({
  posture:{label:"STAND"},
  gesture:{label:"Bow the head"},
  priestVoice:{label:"AUDIBLE"},
  priestPosition:{station:"FOOT_CENTER"},
});
assert.equal(keys.postureIconKey,R17_ICON_KEYS.posture.STAND);
assert.equal(keys.gestureIconKey,null,"head-bow illustrations were explicitly rejected by user");
assert.equal(keys.priestVoiceIconKey,"priest_audible");
assert.equal(keys.priestPositionIconKey,"priest_foot");
assert.equal(keys.priestActionIconKey,null,"position-only state must remain action-art free");

const broken={...bank}; delete broken.priest_ascending_rich;
assert.equal(auditHostIconBank(broken).complete,false);
assert.ok(auditHostIconBank(broken).missing.includes("priest_ascending_rich"));

keys=iconKeysForReaderState({priestPosition:{station:"ALTAR_CENTER",facing:"PEOPLE"}});
assert.equal(keys.priestPositionIconKey,"priest_facing_people","top PRIEST position ignored facing-people state");
keys=iconKeysForReaderState({priestPosition:{
  station:"SEDILIA",facing:"PEOPLE_OR_ALTAR_ACCORDING_TO_LAYOUT"
}});
assert.equal(keys.priestPositionIconKey,"priest_sedilia_rich",
  "layout-dependent sedilia stole the explicit facing-people pictogram");
keys=iconKeysForReaderState({priestPosition:{
  station:"ALTAR_CENTER",facing:"PEOPLE_DURING_TURN"
}});
assert.equal(keys.priestPositionIconKey,"priest_facing_people",
  "explicit short turn to the people lost its donor pictogram");


keys=iconKeysForReaderState({priestAction:{label:"GENUFLECTS"}});
assert.equal(keys.priestActionIconKey,null,"priest genuflect donor is unreviewed for this owner");
keys=iconKeysForReaderState({priestAction:{label:"WASHES / PURIFIES"}});
assert.equal(keys.priestActionIconKey,"lavabo");
keys=iconKeysForReaderState({priestAction:{label:"UNMAPPED SOURCE ACTION"}});
assert.equal(keys.priestActionIconKey,null,"unmapped action guessed an unrelated icon");

// Source-owned gesture matrix uses labels different from the 77-row
// action inventory. They must still resolve to the exact donor bank.
for(const [label,key] of [
  ["BOWS HEAD",null],
  ["BOWS SLIGHTLY","bow"],
  ["BOWS OVER THE ALTAR",null],
  ["RAISES EYES AND HANDS","priest_centre_arms_rich"],
  ["CROSSES WITH CHALICE","cross"],
  ["THREE CROSSES WITH PARTICLE","cross"],
  ["HANDS OVER OBLATIONS","priest_centre_hands_rich"],
]){
  assert.equal(iconKeysForReaderState({priestAction:{label}}).priestActionIconKey,key,
    "unbound primary gesture matrix label: "+label);
}
assert.equal(iconKeysForReaderState({
  priestVoice:{label:"NO COMPETING PUBLIC PRIEST TEXT"},
}).priestVoiceIconKey,null,"absence of priest speech wrongly rendered as audible");
assert.equal(iconKeysForReaderState({
  priestVoice:{label:"LISTENS"},
}).priestVoiceIconKey,"listen");
assert.equal(iconKeysForReaderState({
  priestVoice:{label:"SUNG / CLEAR"},
}).priestVoiceIconKey,"priest_audible");
assert.equal(readerAttentionForState({
  priestVoice:{label:"SUNG / CLEAR"},response:null,
})?.iconKey,"listen","public reading lost the faithful LISTEN cue");
assert.equal(readerAttentionForState({
  priestVoice:{label:"SUNG / CLEAR"},response:{label:"Amen"},
}),null,"response and attention must not duplicate the same cue");
assert.equal(readerAttentionForState({
  priestVoice:{label:"SECRET / QUIET"},
}),null,"silent priest text wrongly generated a listening instruction");

// Every actual source-only matrix action without a higher-priority explicit
// priest action must have an available donor icon, or a rubric-bound identity
// for the same cue. Do not certify the bank simply because its files exist.
const readJson=file=>JSON.parse(readFileSync(new URL(file,import.meta.url),"utf8"));
const explicitCues=new Set(readJson("../data/presentation/reader-priest-actions.v1.json").items.map(x=>x.cueId));
const rubricByCue=new Map(readJson("../data/presentation/reader-rubric-events.v1.json").items
  .filter(x=>x.actor==="PRIEST"&&x.displayPrimary).map(x=>[x.cueId,x]));
const primaryMatrix=readJson("../data/mass/gesture-matrix.v1.json").items
  .filter(x=>x.actor==="PRIEST"&&x.displayPrimary&&!explicitCues.has(x.cueId));
const unmapped=primaryMatrix.filter(row=>{
  const matchedRubric=rubricByCue.get(row.cueId);
  const art=iconKeysForReaderState({priestAction:{
    label:row.label,iconKey:row.iconKey??matchedRubric?.iconKey??null,
  }}).priestActionIconKey;
  return !art || !resolve(art);
});
// Reviewed 19 October: unavailable *art* must not be fabricated to satisfy
// the older blanket requirement that every priest gesture have an image.
assert.equal(unmapped.length,17,"unexpected size of approved icon-quarantine set");
assert.ok(unmapped.every(row=>["BOWS HEAD","BOWS OVER THE ALTAR","PROFOUND BOW"]
  .includes(row.label)),"unreviewed priest action lost its exact image");


const reviewed=JSON.parse(readFileSync(new URL("../data/presentation/mass-icon-user-selections-20261010.v1.json",import.meta.url),"utf8"));
assert.deepEqual(reviewed.selectionCounts,{selected:42,investigate:10,total:52});
assert.equal(Object.keys(reviewed.selected).length,42);
assert.equal(reviewed.investigate.length,10);
for(const [group,path] of Object.entries(reviewed.selected)){
  assert.match(path,/^assets\/active\//,"untrusted icon path "+group);
  assert.ok(readFileSync(new URL("../"+path,import.meta.url)).length>0,group+" preference has no real GitHub asset");
}
const approvedPosition={
  ALTAR_STEPS_ASCENDING:"priest_ascending_rich",
  ALTAR_CENTER:"priest_centre_rich",
  ALTAR_EPISTLE_MISSAL:"priest_gospel_rich",
  ALTAR_EPISTLE_SIDE:"priest_gospel_rich",
  ALTAR_GOSPEL_MISSAL:"priest_epistle_rich",
  ALTAR_GOSPEL_SIDE:"priest_epistle_rich",
  SEDILIA:"priest_sedilia_rich",
  COMMUNION_RAIL:null, // Giving Communion artwork is an action, not an idle position
  PREACHING_PLACE:"priest_ambo_rich",
  PROCESSION_ROUTE:"priest_procession_rich",
};
for(const [station,wanted] of Object.entries(approvedPosition)){
  assert.equal(iconKeysForReaderState({priestPosition:{station}}).priestPositionIconKey,wanted,
    station+" did not render the reviewed 19 October 2026 Mass art");
}
assert.equal(iconKeysForReaderState({priestPosition:{station:"FOOT_CENTER"}}).priestPositionIconKey,"priest_foot",
  "unresolved foot-of-altar must not be marked as user-approved");
assert.equal(iconKeysForReaderState({priestAction:{label:"ELEVATES HOST",owner:"GESTURE_MATRIX_SOT",iconKey:"priest_elevate_host_rich"}}).priestActionIconKey,
  "priest_elevation","exact source-owned Host elevation did not honor the reviewed icon");
assert.equal(iconKeysForReaderState({priestAction:{label:"ELEVATES CHALICE",owner:"GESTURE_MATRIX_SOT",iconKey:"priest_elevate_chalice_rich"}}).priestActionIconKey,
  "priest_elevate_chalice_rich","Chalice elevation lost its own selected art");
assert.equal(iconKeysForReaderState({priestAction:{label:"OFFERS HOST"}}).priestActionIconKey,
  null,"Offertory Host offering must not borrow the major Host elevation artwork");
assert.equal(iconKeysForReaderState({priestAction:{label:"TURNS TO PEOPLE"}}).priestActionIconKey,
  "priest_facing_people","turning-to-people did not honor the review");
assert.ok(reviewed.investigate.includes("priest:blessing"));
assert.ok(reviewed.investigate.includes("priest:profound_bow"));
assert.equal(reviewed.selected["you:head_bow"],"assets/active/mass-v46/head_bow.svg");
assert.equal(reviewed.selected["other:ao-live-head-bow"],"assets/active/live-gesture/ao-live-head-bow.png");
assert.equal(R17_DONOR_PNG_ICON_KEYS.length,57,"original embedded-PNG inventory incomplete");
for(const key of ["bells","priest_elevation","priest_audible","priest_silent","breast_strike","priest_facing_people"]){
  assert.ok(R17_DONOR_PNG_ICON_KEYS.includes(key),key+" PNG will flatten into an opaque SVG mask");
  const wrapped=readFileSync(new URL("../assets/active/mass-v46/"+key+".svg",import.meta.url),"utf8");
  assert.match(extractDonorRichMaskUri(wrapped)??"",/^data:image\/png;base64,/,
    key+" embedded PNG alpha could not be unwrapped");
}
for(const key of ["stand","sit","cross","priest_genuflect"]){
  assert.ok(!R17_DONOR_PNG_ICON_KEYS.includes(key),key+" is an original vector, not PNG");
}

// Latest user review (19 Oct 2026) supersedes contradictory 10 Oct art labels.
// The actual source cue and rubric must survive even when art fails closed.
for(const station of ["ALTAR_EPISTLE_MISSAL","ALTAR_EPISTLE_SIDE","ALTAR_FRONT_EPISTLE_HALF"]){
  assert.equal(iconKeysForReaderState({priestPosition:{station}}).priestPositionIconKey,
    "priest_gospel_rich","Epistle station used artwork now assigned to Gospel");
}
for(const station of ["ALTAR_GOSPEL_MISSAL","ALTAR_GOSPEL_SIDE","ALTAR_FRONT_GOSPEL_HALF"]){
  assert.equal(iconKeysForReaderState({priestPosition:{station}}).priestPositionIconKey,
    "priest_epistle_rich","Gospel station used artwork now assigned to Epistle");
}
for(const [label,want] of [
  ["READS EPISTLE","priest_gospel_rich"],
  ["GOES TO EPISTLE SIDE","priest_gospel_rich"],
  ["PROCLAIMS GOSPEL","priest_epistle_rich"],
  ["GOES TO GOSPEL SIDE","priest_epistle_rich"],
  ["GIVES COMMUNION","priest_rail_after_rich"],
  ["ELEVATES CHALICE","priest_elevate_chalice_rich"],
  ["ELEVATES HOST","priest_elevation"],
  ["OFFERS HOST",null],
  ["OFFERS CHALICE",null],
  ["KISSES GOSPEL",null],
  ["TURNS TO ALTAR",null],
  ["INTONES CREDO","review_priest_credo_chant"],
  ["INCENSES PEOPLE",null],
  ["RECEIVES INCENSE",null],
  ["RECEIVES HOST",null],
  ["RECEIVES CHALICE","review_priest_receive_chalice"],
  ["BREAKS HOST","review_priest_fraction_host"],
  ["PLACES PARTICLE","review_priest_commingling"],
]){
  assert.equal(iconKeysForReaderState({priestAction:{label}}).priestActionIconKey,
    want,label+" projected a misleading or reversed icon");
}
for(const [label,iconKey,want] of [
  ["READS EPISTLE","priest_epistle_rich","priest_gospel_rich"],
  ["PROCLAIMS GOSPEL","priest_gospel_rich","priest_epistle_rich"],
  ["ELEVATES CHALICE","chalice_elevation","priest_elevate_chalice_rich"],
  ["GIVES COMMUNION","priest_communion_rich","priest_rail_after_rich"],
  ["BREAKS HOST","fraction","review_priest_fraction_host"],
  ["RECEIVES CHALICE","chalice_elevation","review_priest_receive_chalice"],
  ["INCENSES PEOPLE","priest_incense_people_rich",null],
]){
  assert.equal(iconKeysForReaderState({priestAction:{
    label,iconKey,owner:"R17_V180_PRIEST_ACTION_SOURCE",
  }}).priestActionIconKey,want,
  label+" direct donor icon bypassed reviewed semantic mapping");
}
assert.equal(iconKeysForReaderState({
  priestAction:{label:"CUSTOMARY EXTRA",owner:"GESTURE_MATRIX_SOT",iconKey:null},
}).priestActionIconKey,null,"unapproved icon was inferred for a source-owned gesture");
assert.equal(iconKeysForReaderState({
  priestPosition:{station:"COMMUNION_RAIL"},
  priestAction:{label:"GIVES COMMUNION"},
}).priestPositionIconKey,null,"Communion distribution art reused as idle position");
assert.equal(iconKeysForReaderState({
  priestPosition:{station:"COMMUNION_RAIL"},
  priestAction:{label:"GIVES COMMUNION"},
}).priestActionIconKey,"priest_rail_after_rich");
assert.deepEqual(
  readFileSync(new URL("../assets/active/mass-v46/chalice_elevation.svg",import.meta.url)),
  readFileSync(new URL("../assets/active/mass-v46/priest_elevation.svg",import.meta.url)),
  "Donor collision changed without review — recorded Host duplication must remain visible");
assert.deepEqual(
  readFileSync(new URL("../assets/active/mass-v46/fraction.svg",import.meta.url)),
  readFileSync(new URL("../assets/active/mass-v46/commingling.svg",import.meta.url)),
  "Donor collision changed without review — do not silently alter original masters");
const liveRenderer=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.match(liveRenderer,
  /setChannel\(root,"priest-action",current\.priestAction\)/,
  "source-owned priest action was suppressed solely because its art is unapproved");
assert.match(liveRenderer,
  /setText\(root,"priest-action",textValue\(current\.priestAction\)\)/,
  "withholding unapproved action art must not erase the priest's source action");
// P1: approved posture bank in a separate resolver namespace.
for(const [posture,art] of Object.entries({
  STAND:"review_posture_stand",
  SIT:"review_posture_sit",
  KNEEL:"review_posture_kneel",
  GENUFLECT:"review_posture_genuflect",
})){
  assert.equal(iconKeysForReaderState({posture:{value:posture}}).postureIconKey,art,
    posture+" failed to use user-preferred bank artwork");
}
assert.equal(iconKeysForReaderState({
  gesture:{type:"BOW"},
}).gestureIconKey,"review_faithful_bow");
assert.equal(iconKeysForReaderState({
  gesture:{owner:"GESTURE_MATRIX_SOT",iconKey:"bow",label:"Faithful bow"},
}).gestureIconKey,"review_faithful_bow");
for(const cue of [
  {owner:"GESTURE_MATRIX_SOT",iconKey:"head_bow",label:"Bow head"},
  {label:"Bow head"},
  {type:"HEAD_BOW"},
]){
  assert.equal(iconKeysForReaderState({gesture:cue}).gestureIconKey,null,
    "rejected head-bow art was reintroduced");
}
for(const action of [
  {label:"BOWS HEAD",iconKey:"head_bow"},
  {label:"BOWS PROFOUNDLY",iconKey:"priest_profound_bow_rich"},
  {label:"PROFOUND BOW"},
]){
  assert.equal(iconKeysForReaderState({priestAction:action}).priestActionIconKey,
    null,"rejected priest bow depiction returned");
}
assert.equal(iconKeysForReaderState({priestAction:{label:"BOWS SLIGHTLY"}})
  .priestActionIconKey,"bow","reviewed priest bow image was assigned to faithful");
console.log("reader icons: PASS — 19 October reviewed P0/P1 artwork and cue ownership.");
