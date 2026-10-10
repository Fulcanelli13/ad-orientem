import { R17_DONOR_PNG_ICON_KEYS } from "../src/mass/reader-icon-bank.js";
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
assert.equal(keys.postureIconKey,"kneel");
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
assert.equal(keys.priestPositionIconKey,"priest_gospel_rich");
assert.equal(keys.priestActionIconKey,"priest_elevation","user-selected original v1.80 Host elevation artwork is not wired");
assert.equal(keys.scholaIconKey,"schola");

keys=iconKeysForReaderState({
  posture:{label:"STAND"},
  gesture:{label:"Bow the head"},
  priestVoice:{label:"AUDIBLE"},
  priestPosition:{station:"FOOT_CENTER"},
});
assert.equal(keys.postureIconKey,R17_ICON_KEYS.posture.STAND);
assert.equal(keys.gestureIconKey,"head_bow");
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
assert.equal(keys.priestActionIconKey,"priest_genuflect");
keys=iconKeysForReaderState({priestAction:{label:"WASHES / PURIFIES"}});
assert.equal(keys.priestActionIconKey,"lavabo");
keys=iconKeysForReaderState({priestAction:{label:"UNMAPPED SOURCE ACTION"}});
assert.equal(keys.priestActionIconKey,null,"unmapped action guessed an unrelated icon");

// Source-owned gesture matrix uses labels different from the 77-row
// action inventory. They must still resolve to the exact donor bank.
for(const [label,key] of [
  ["BOWS HEAD","head_bow"],
  ["BOWS SLIGHTLY","head_bow"],
  ["BOWS OVER THE ALTAR","priest_profound_bow_rich"],
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
assert.deepEqual(unmapped.map(x=>x.cueId+":"+x.label),[],
  "source priest gestures missing a real v1.80 icon or rubric binding");


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
  ALTAR_EPISTLE_MISSAL:"priest_epistle_rich",
  ALTAR_EPISTLE_SIDE:"priest_epistle_rich",
  ALTAR_GOSPEL_MISSAL:"priest_gospel_rich",
  ALTAR_GOSPEL_SIDE:"priest_gospel_rich",
  SEDILIA:"priest_sedilia_rich",
  COMMUNION_RAIL:"priest_rail_after_rich",
  PREACHING_PLACE:"priest_ambo_rich",
  PROCESSION_ROUTE:"priest_procession_rich",
};
for(const [station,wanted] of Object.entries(approvedPosition)){
  assert.equal(iconKeysForReaderState({priestPosition:{station}}).priestPositionIconKey,wanted,
    station+" did not render the approved v1.80 Mass art");
}
assert.equal(iconKeysForReaderState({priestPosition:{station:"FOOT_CENTER"}}).priestPositionIconKey,"priest_foot",
  "unresolved foot-of-altar must not be marked as user-approved");
assert.equal(iconKeysForReaderState({priestAction:{label:"ELEVATES HOST",owner:"GESTURE_MATRIX_SOT",iconKey:"priest_elevate_host_rich"}}).priestActionIconKey,
  "priest_elevation","exact source-owned Host elevation did not honor the reviewed icon");
assert.equal(iconKeysForReaderState({priestAction:{label:"ELEVATES CHALICE",owner:"GESTURE_MATRIX_SOT",iconKey:"priest_elevate_chalice_rich"}}).priestActionIconKey,
  "priest_elevate_chalice_rich","Chalice elevation lost its own selected art");
assert.equal(iconKeysForReaderState({priestAction:{label:"OFFERS HOST"}}).priestActionIconKey,
  "priest_elevate_host_rich","Host offering was incorrectly replaced by Host elevation");
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

console.log("reader icons: PASS — user-reviewed v1.80 position/action artwork and cue ownership.");
