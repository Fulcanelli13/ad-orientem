// Every cue of every Mass form, through the real cue-state engines and the
// canonical icon resolver. Fails if any source state reaches the resolver
// without an explicit mapping, and prints the lane x form coverage table.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { projectAllCues, ICON_FORMS } from "../tools/mass/collect-icon-inputs.mjs";
import { canonicalMeaningsForReaderState, canonicalIconKeysForReaderState, positionMeaning, actionMeaning, voiceMeaning, CANONICAL_ICON_ASSETS } from "../src/mass/reader-canonical-icons.js";
import { iconKeysForReaderState } from "../src/mass/reader-icons.js";
import { FINAL_65_CUE_ICON_KEYS } from "../src/mass/reader-final65-icon-keys.js";
import { readFileSync } from "node:fs";
import { CANONICAL_ICON_SET as SET } from "../src/mass/reader-canonical-icon-set.js";

// The generated runtime module must match the JSON it is built from.
execFileSync(process.execPath, [new URL("../tools/mass/build-canonical-icon-module.mjs", import.meta.url).pathname, "--check"], { stdio: "pipe" });

const NON_ICON = new Set(["POSITION_TRANSITION", "NO_ACTION_LISTENS", "TEXT_ONLY_NO_ART", "VOICE_LANE", "OTHER_ACTOR", "COVERED_BY_POSITION_AND_FAITHFUL"]);
const KNOWN = new Set([...SET.meanings.map(m => m.meaningId), ...SET.gaps]);
const VOICES = new Set(Object.values(SET.voiceMap).flat().map(v => v.toUpperCase()));
const lanes = ["posture", "gesture", "priestPosition", "priestAction", "priestVoice"];
const table = {};
const unmapped = [];

for (const { form, cueId, state } of projectAllCues()) {
  const s = { ...state, form, cueId };
  const m = canonicalMeaningsForReaderState(s);
  const keys = canonicalIconKeysForReaderState(s);
  assert.deepEqual(iconKeysForReaderState(s), keys, `${form} ${cueId}: reader-icons does not delegate to the canonical resolver`);
  for (const [lane, key] of Object.entries(keys)) if (key) assert.ok(CANONICAL_ICON_ASSETS[key], `${form} ${cueId}: ${lane} key ${key} has no asset`);

  // Every source state must be mapped explicitly.
  if (s.priestPosition) {
    const st = String(s.priestPosition.station).toUpperCase(), fa = String(s.priestPosition.facing ?? "").toUpperCase();
    if (!(st + "|" + fa in SET.stationMap) && !(st in SET.stationMap)) unmapped.push(`${form} ${cueId} station ${st}|${fa}`);
  }
  if (s.priestAction) {
    const a = actionMeaning(s.priestAction, s);
    if (a == null || !(KNOWN.has(a) || NON_ICON.has(a))) unmapped.push(`${form} ${cueId} action "${s.priestAction.label}" -> ${a}`);
  }
  if (s.priestVoice) {
    const v = String(s.priestVoice.value ?? s.priestVoice.label ?? "").trim().toUpperCase();
    if (!VOICES.has(v) && !SET.voiceCueOverrides[cueId]) unmapped.push(`${form} ${cueId} voice "${v}"`);
  }
  // Lane separation at the cue: position and action never show the same file.
  if (keys.priestPositionIconKey && keys.priestActionIconKey)
    assert.notEqual(CANONICAL_ICON_ASSETS[keys.priestPositionIconKey], CANONICAL_ICON_ASSETS[keys.priestActionIconKey], `${form} ${cueId}: same picture in position and action`);
  // Movement never produces an action icon.
  if (actionMeaning(s.priestAction, s) === "POSITION_TRANSITION") assert.equal(keys.priestActionIconKey, null);
  // Low Mass never shows Chant.
  if (form === "LOW") assert.notEqual(m.priestVoice, "priest.voice.chant", `${cueId}: Chant in Low Mass`);

  for (const lane of lanes) {
    const t = (table[lane] ??= {}); const row = (t[form] ??= { source: 0, icon: 0 });
    const src = { posture: s.posture, gesture: s.gesture, priestPosition: s.priestPosition, priestAction: s.priestAction, priestVoice: s.priestVoice }[lane];
    if (src) { row.source++; if (keys[lane + "IconKey"] ?? keys[{ posture: "postureIconKey", gesture: "gestureIconKey" }[lane]]) row.icon++; }
  }
}
assert.deepEqual(unmapped, [], "Source states without a canonical mapping:\n" + unmapped.join("\n"));

// Spot checks of the user's rules.
const sung = { form: "MISSA_CANTATA_SIMPLE" };
assert.equal(actionMeaning({ label: "TURNS TO PEOPLE", cueId: "AO.SM.C0131" }, sung), "POSITION_TRANSITION");
assert.equal(actionMeaning({ label: "TURNS TO PEOPLE", cueId: "AO.SM.C0070" }, sung), "priest.action.greeting");
assert.equal(actionMeaning({ label: "WASHES / PURIFIES", cueId: "AO.SM.C0247" }, sung), "priest.action.purify_chalice", "Quod ore sumpsimus is the first ablution (chalice)");
assert.equal(actionMeaning({ label: "WASHES / PURIFIES", cueId: "AO.SM.C0248" }, sung), "priest.action.purify_fingers", "Corpus tuum is the ablution of the fingers");
// The exact published C0072/C0253 action is turning to the Missal, not
// the subsequent orans prayer. Keep orans on the actual Low Mass proper
// C0073/C0254, but never put extended hands beside the Oremus movement.
// Lavabo art depicts the minister pouring water, not a priest-only action.
for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN","LOW"]){
 for(const [cue,label,reason] of [
  ["AO.SM.C0072","TURNS TO MISSAL","POSITION_TRANSITION"],
  ["AO.SM.C0253","TURNS TO MISSAL","POSITION_TRANSITION"],
  ["AO.SM.C0125","WASHES / PURIFIES","TEXT_ONLY_NO_ART"],
 ]){
  const state={form,cueId:cue,priestAction:{cueId:cue,label,owner:"R17_V180_EXACT_CUE_ACTION"}};
  assert.equal(actionMeaning(state.priestAction,state),reason,form+" "+cue+" role/action drift");
  assert.equal(canonicalIconKeysForReaderState(state).priestActionIconKey,null,
   form+" "+cue+" painted the wrong priest-action icon");
 }
}
for(const cue of ["AO.SM.C0073","AO.SM.C0254"]){
 const state={form:"LOW",cueId:cue,priestAction:{cueId:cue,label:"PRAYS COLLECT",owner:"R18_LOW_CUE_SOURCE"}};
 assert.equal(canonicalIconKeysForReaderState(state).priestActionIconKey,"canon:priest.action.orans",
  "Source-owned orans proper lost its original approved graphic: "+cue);
}
// Correct the 20 Oct crosswalk's reversed ablution images in place without
// changing immutable artist/user asset IDs, names, paths or original hashes.
const sourceCrosswalk=JSON.parse(readFileSync(new URL("../data/presentation/mass-icon-final-cue-crosswalk-20261020.v1.json",import.meta.url),"utf8"));
for(const [cue,asset,key,meaning,opening] of [
 ["AO.SM.C0247","ao_purify_chalice","final_ao_purify_chalice","priest.action.purify_chalice","Quod ore"],
 ["AO.SM.C0248","ao_purify_fingers","final_ao_purify_fingers","priest.action.purify_fingers","Corpus tuum"],
]){
 const row=sourceCrosswalk.rows.find(x=>x.lane==="priest_action"&&x.cueId===cue);
 assert.equal(row?.assetId,asset,cue+" historical crosswalk returned the wrong ablution");
 assert.equal(row?.runtimeAssetKey,key,cue+" exact approved original mismatch");
 assert.equal(FINAL_65_CUE_ICON_KEYS.priestAction[cue],key,cue+" curated art reversed");
 assert.equal(actionMeaning({cueId:cue,label:"WASHES / PURIFIES"},{form:"MISSA_CANTATA_SIMPLE",cueId:cue}),meaning);
 const sungText=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
 const paragraph=sungText.blocks.flatMap(b=>b.units??[]).find(u=>u.cue_id===cue);
 assert.ok(paragraph?.latin?.startsWith(opening),cue+" is not the certified 1962 prayer");
}

assert.equal(positionMeaning({ station: "ALTAR_EPISTLE_MISSAL", facing: "MISSAL" }), "priest.position.epistle_side");
assert.equal(positionMeaning({ station: "ALTAR_CENTER", facing: "PEOPLE" }), "priest.position.facing_people");
assert.equal(voiceMeaning({ value: "SECRET", cueId: "AO.SM.C0150" }, { form: "LOW" }), "priest.voice.low", "Secret is low voice, not silence");
assert.equal(voiceMeaning({ value: "SUNG / CLEAR", cueId: "AO.SM.C0075" }, { form: "SOLEMN" }), null, "Solemn Epistle is sung by the subdeacon");
// Collect: position Epistle side + action hands extended, as two separate icons.
const collect = canonicalIconKeysForReaderState({ form: "LOW", cueId: "AO.SM.C0073", priestPosition: { station: "ALTAR_EPISTLE_MISSAL", facing: "MISSAL" }, priestAction: { label: "x", owner: "R18_LOW_CUE_SOURCE", cueId: "AO.SM.C0073" } });
assert.equal(collect.priestPositionIconKey, "canon:priest.position.epistle_side");
assert.equal(collect.priestActionIconKey, "canon:priest.action.orans");

console.log("mass-icon-canonical-coverage: all source states mapped. Cues with an icon / cues with that source state:");
const pad = (x, n) => String(x).padEnd(n);
console.log(pad("lane", 16) + ICON_FORMS.map(f => pad(f, 24)).join(""));
for (const lane of lanes) console.log(pad(lane, 16) + ICON_FORMS.map(f => { const r = table[lane]?.[f] ?? { source: 0, icon: 0 }; return pad(`${r.icon}/${r.source}`, 24); }).join(""));
