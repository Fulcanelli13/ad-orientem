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
assert.equal(keys.responseIconKey,"response");
assert.equal(keys.priestVoiceIconKey,"priest_silent");
assert.equal(keys.priestPositionIconKey,"priest_centre");
assert.equal(keys.priestActionIconKey,"priest_elevate_host_rich","recovered v4.6 Host elevation art is not wired");
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
assert.equal(keys.priestPositionIconKey,"priest_sedilia",
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

console.log("reader icons: PASS — v1.77 plain position pictograms and exact v4.6 rich action art remain separately owned.");
