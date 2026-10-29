import { R17_DONOR_PNG_ICON_KEYS } from "../src/mass/reader-icon-bank.js";
import { R17_REVIEWED_POSTURE_ASSETS } from "../src/mass/reader-reviewed-posture-assets.js";
import { extractDonorRichMaskUri } from "../src/mass/reader-dom.js";
import { readFileSync } from "node:fs";
import { CANONICAL_ICON_ASSETS } from "../src/mass/reader-canonical-icons.js";
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

// The approved Chant icon represents the priest's ACTUAL sung delivery,
// across supported Sung modes, never Low Mass or Solemn minister-owned texts.
const C=m=>"canon:"+m;
const priestChantAt=(form,cueId,voice="SUNG / CLEAR")=>iconKeysForReaderState({
 form,cueId,priestVoice:{value:voice,label:voice,cueId}
}).priestVoiceIconKey;
assert.equal(priestChantAt("MISSA_CANTATA_SIMPLE","AO.SM.C0144"),C("priest.voice.chant"));
assert.equal(priestChantAt("MISSA_CANTATA_INCENSE","AO.SM.C0070"),C("priest.voice.chant"));
assert.equal(priestChantAt("SOLEMN","AO.SM.C0053","SUNG / PUBLIC"),C("priest.voice.chant"));
assert.equal(priestChantAt("LOW","AO.SM.C0144"),C("priest.voice.aloud"),
 "Low Mass priest voice is audible speech, not sung Chant");
assert.equal(priestChantAt("SOLEMN","AO.SM.C0075"),null,
 "Subdeacon owns Solemn Epistle; celebrant must not show Chant");
assert.equal(priestChantAt("SOLEMN","AO.SM.C0086"),null,
 "Deacon owns Solemn Gospel; celebrant must not show Chant");
assert.equal(priestChantAt("MISSA_CANTATA_SIMPLE","AO.SM.C0130","AUDIBLE / ELEVATED"),C("priest.voice.aloud"),
 "Audible Orate fratres is not sung");
assert.equal(priestChantAt("MISSA_CANTATA_SIMPLE","AO.SM.C0150","SECRET / LOW"),C("priest.voice.low"),
 "Secret prayer is the low-voice icon: not Chant, and not silence");
assert.equal(priestChantAt("MISSA_CANTATA_SIMPLE","AO.SM.C0074"),null,
 "Server's sung response is not the priest chanting (Ultra Master voice audit)");


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
assert.equal(keys.postureIconKey,C("faithful.posture.kneel"));
assert.equal(keys.gestureIconKey,C("faithful.gesture.gospel_crosses"));
assert.equal(keys.responseIconKey,C("response.people"));
assert.equal(keys.priestVoiceIconKey,C("priest.voice.low"),"low voice is not silence");
assert.equal(keys.priestPositionIconKey,C("priest.position.gospel_side"),"Gospel side uses the user's Gospel-side picture (file v46 priest_epistle_rich)");
assert.equal(keys.priestActionIconKey,C("priest.action.elevate_host"));
assert.equal(keys.scholaIconKey,C("schola.sings"));
keys=iconKeysForReaderState({gesture:{owner:"GESTURE_MATRIX_SOT",
  label:"Customary bow may follow local practice",iconKey:null}});
assert.equal(keys.gestureIconKey,null,"held-back customary gesture obtained an invented icon");
keys=iconKeysForReaderState({priestAction:{owner:"GESTURE_MATRIX_SOT",
  label:"RAISES EYES AND HANDS",iconKey:null}});
assert.equal(keys.priestActionIconKey,null,"no approved art: raising eyes and hands stays text");

keys=iconKeysForReaderState({
  posture:{label:"STAND"},
  gesture:{label:"Bow the head"},
  priestVoice:{label:"AUDIBLE"},
  priestPosition:{station:"FOOT_CENTER"},
});
assert.equal(keys.postureIconKey,R17_ICON_KEYS.posture.STAND);
assert.equal(keys.gestureIconKey,null,"a free-text gesture label is never matched by keyword");
assert.equal(keys.priestVoiceIconKey,C("priest.voice.aloud"));
assert.equal(keys.priestPositionIconKey,C("priest.position.foot"),"21 Oct: the user chose an icon for the foot of the altar");
assert.equal(keys.priestActionIconKey,null,"position-only state must remain action-art free");

const broken={...bank}; delete broken.priest_ascending_rich;
assert.equal(auditHostIconBank(broken).complete,false);
assert.ok(auditHostIconBank(broken).missing.includes("priest_ascending_rich"));

keys=iconKeysForReaderState({priestPosition:{station:"ALTAR_CENTER",facing:"PEOPLE"}});
assert.equal(keys.priestPositionIconKey,C("priest.position.facing_people"),"facing the people is part of the position");
keys=iconKeysForReaderState({priestPosition:{station:"SEDILIA",facing:"PEOPLE_OR_ALTAR_ACCORDING_TO_LAYOUT"}});
assert.equal(keys.priestPositionIconKey,C("priest.position.sedilia_seated"),"layout-dependent sedilia keeps the sedilia picture");
keys=iconKeysForReaderState({priestPosition:{station:"ALTAR_CENTER",facing:"PEOPLE_DURING_TURN"}});
assert.equal(keys.priestPositionIconKey,C("priest.position.facing_people"));

assert.equal(iconKeysForReaderState({priestAction:{label:"GENUFLECTS"}}).priestActionIconKey,C("priest.action.genuflect"));
assert.equal(iconKeysForReaderState({priestAction:{label:"WASHES / PURIFIES"}}).priestActionIconKey,null,
  "without its cue, WASHES / PURIFIES is ambiguous (Lavabo or one of two ablutions); the cue decides");
assert.equal(iconKeysForReaderState({priestAction:{label:"WASHES / PURIFIES",cueId:"AO.SM.C0125"}}).priestActionIconKey,null,
  "Source C0125 is the priest washing, not an image of the server pouring water");
assert.equal(iconKeysForReaderState({priestAction:{label:"UNMAPPED SOURCE ACTION"}}).priestActionIconKey,null,"unmapped action guessed an unrelated icon");

// Gesture-matrix labels resolve to the canonical meaning; no art means text only.
for(const [label,key] of [
  ["BOWS HEAD",null],
  ["BOWS SLIGHTLY",null],
  ["BOWS OVER THE ALTAR",null],
  ["BOWS PROFOUNDLY",C("priest.action.profound_bow")],
  ["RAISES EYES AND HANDS",null],
  ["CROSSES WITH CHALICE",C("priest.action.sign_of_cross")],
  ["THREE CROSSES WITH PARTICLE",C("priest.action.sign_of_cross")],
  ["HANDS OVER OBLATIONS",null],
  ["MAKES ONE SIGN OF THE CROSS OVER THE PEOPLE",null],
]){
  assert.equal(iconKeysForReaderState({priestAction:{label}}).priestActionIconKey,key,
    "gesture matrix label: "+label);
}
assert.equal(iconKeysForReaderState({priestVoice:{label:"NO COMPETING PUBLIC PRIEST TEXT"}}).priestVoiceIconKey,null,"absence of priest speech wrongly rendered as audible");
assert.equal(iconKeysForReaderState({priestVoice:{label:"LISTENS"}}).priestVoiceIconKey,null,"a listening priest shows no voice icon; the response lane carries the cue");
assert.equal(iconKeysForReaderState({priestVoice:{label:"SUNG / CLEAR"}}).priestVoiceIconKey,C("priest.voice.aloud"),"no form known: never Chant");

assert.equal(readerAttentionForState({
  priestVoice:{label:"SUNG / CLEAR"},response:null,
})?.iconKey,"listen","public reading lost the faithful LISTEN cue");
assert.equal(readerAttentionForState({
  priestVoice:{label:"SUNG / CLEAR"},response:{label:"Amen"},
}),null,"response and attention must not duplicate the same cue");
assert.equal(readerAttentionForState({
  priestVoice:{label:"SECRET / QUIET"},
}),null,"silent priest text wrongly generated a listening instruction");

// Every primary gesture-matrix priest action without an explicit registry action
// must resolve to a canonical meaning; when that meaning has no approved art it
// must be a recorded gap, never a fabricated image.
const readJson=file=>JSON.parse(readFileSync(new URL(file,import.meta.url),"utf8"));
const canonSet=readJson("../data/presentation/mass-icon-canonical-set-20261021.v1.json");
const gapIds=new Set(canonSet.gaps.map(g=>g.meaningId));
const explicitCues=new Set(readJson("../data/presentation/reader-priest-actions.v1.json").items.map(x=>x.cueId));
const primaryMatrix=readJson("../data/mass/gesture-matrix.v1.json").items
  .filter(x=>x.actor==="PRIEST"&&x.displayPrimary&&!explicitCues.has(x.cueId));
for(const row of primaryMatrix){
  const target=canonSet.actionLabelMap[row.label];
  assert.ok(target,"gesture matrix label has no canonical mapping: "+row.label);
  const art=iconKeysForReaderState({priestAction:{label:row.label,cueId:row.cueId,owner:"GESTURE_MATRIX_SOT",iconKey:row.iconKey}}).priestActionIconKey;
  if(art)assert.ok(CANONICAL_ICON_ASSETS[art],row.label+" resolved to a key with no canonical asset");
  else assert.ok(gapIds.has(target)||target==="TEXT_ONLY_NO_ART",row.label+" lost its approved art");
}

const reviewed=JSON.parse(readFileSync(new URL("../data/presentation/mass-icon-user-selections-20261010.v1.json",import.meta.url),"utf8"));
assert.deepEqual(reviewed.selectionCounts,{selected:42,investigate:10,total:52});
assert.equal(Object.keys(reviewed.selected).length,42);
assert.equal(reviewed.investigate.length,10);
for(const [group,path] of Object.entries(reviewed.selected)){
  assert.match(path,/^assets\/active\//,"untrusted icon path "+group);
  assert.ok(readFileSync(new URL("../"+path,import.meta.url)).length>0,group+" preference has no real GitHub asset");
}
const approvedPosition={
  ALTAR_STEPS_ASCENDING:C("priest.position.ascending"),
  ALTAR_CENTER:C("priest.position.centre"),
  ALTAR_EPISTLE_MISSAL:C("priest.position.epistle_side"),
  ALTAR_EPISTLE_SIDE:C("priest.position.epistle_side"),
  ALTAR_FRONT_EPISTLE_HALF:C("priest.position.epistle_side"),
  ALTAR_GOSPEL_MISSAL:C("priest.position.gospel_side"),
  ALTAR_GOSPEL_SIDE:C("priest.position.gospel_side"),
  ALTAR_FRONT_GOSPEL_HALF:C("priest.position.gospel_side"),
  SEDILIA:C("priest.position.sedilia_seated"),
  COMMUNION_RAIL:C("priest.position.communion_rail"), // 21 Oct: the user chose a rail position picture
  PREACHING_PLACE:C("priest.position.pulpit"),
  PROCESSION_ROUTE:null, // procession is a special-rite icon, not a priest station
  ROUTE_CONTROLLED:null,
  PRIEST_TRACK_ASYNC:null,
};
for(const [station,wanted] of Object.entries(approvedPosition)){
  assert.equal(iconKeysForReaderState({priestPosition:{station}}).priestPositionIconKey,wanted,
    station+" did not render the canonical position picture");
}
// Position and action are separate lanes: movements never become action icons,
// reading at the book is an action whatever the station, and the Epistle/Gospel
// pictures are chosen by meaning, never by filename.
for(const [label,want] of [
  ["READS EPISTLE",C("priest.action.reads_missal")],
  ["PROCLAIMS GOSPEL",C("priest.action.reads_missal")],
  ["GOES TO EPISTLE SIDE",null],
  ["GOES TO GOSPEL SIDE",null],
  ["TURNS TO PEOPLE",null],
  ["TURNS TO MISSAL",null],
  ["TURNS TO ALTAR",null],
  ["ASCENDS ALTAR",null],
  ["GIVES COMMUNION",null],
  ["ELEVATES CHALICE",C("priest.action.elevate_chalice")],
  ["ELEVATES HOST",C("priest.action.elevate_host")],
  ["OFFERS HOST",C("priest.action.offer_host")],
  ["OFFERS CHALICE",C("priest.action.offer_chalice")],
  ["INCENSES PEOPLE",C("priest.action.incense_people")],
  ["RECEIVES INCENSE",null],
  ["RECEIVES HOST",C("priest.action.receive_host")],
  ["RECEIVES CHALICE",C("priest.action.receive_chalice")],
  ["BREAKS HOST",C("priest.action.fraction")],
  ["PLACES PARTICLE",C("priest.action.commingling")],
  ["STRIKES BREAST",C("priest.action.strike_breast")],
  ["BLESSES PEOPLE",null],
]){
  assert.equal(iconKeysForReaderState({priestAction:{label}}).priestActionIconKey,
    want,label+" projected a misleading icon");
}
// A donor iconKey carried on the state can never override the canonical meaning.
for(const [label,iconKey,want] of [
  ["READS EPISTLE","priest_epistle_rich",C("priest.action.reads_missal")],
  ["ELEVATES CHALICE","chalice_elevation",C("priest.action.elevate_chalice")],
  ["GIVES COMMUNION","priest_communion_rich",null],
  ["BREAKS HOST","fraction",C("priest.action.fraction")],
]){
  assert.equal(iconKeysForReaderState({priestAction:{label,iconKey,owner:"R17_V180_PRIEST_ACTION_SOURCE"}}).priestActionIconKey,want,
    label+" donor icon bypassed the canonical mapping");
}
assert.equal(iconKeysForReaderState({priestAction:{label:"CUSTOMARY EXTRA",owner:"GESTURE_MATRIX_SOT",iconKey:null}}).priestActionIconKey,null,
  "unapproved icon was inferred for a source-owned gesture");
keys=iconKeysForReaderState({priestPosition:{station:"COMMUNION_RAIL"},priestAction:{label:"GIVES COMMUNION"}});
assert.equal(keys.priestPositionIconKey,C("priest.position.communion_rail"));
assert.equal(keys.priestActionIconKey,null,"the rail position and the faithful Communion lane carry this moment");

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
for(const [posture,art] of Object.entries({
  STAND:C("faithful.posture.stand"),SIT:C("faithful.posture.sit"),
  KNEEL:C("faithful.posture.kneel"),GENUFLECT:C("faithful.gesture.genuflect"),
})){
  assert.equal(iconKeysForReaderState({posture:{value:posture}}).postureIconKey,art,posture+" failed to use the canonical posture");
}
assert.equal(iconKeysForReaderState({gesture:{type:"BOW"}}).gestureIconKey,C("faithful.gesture.bow_head"));
for(const cue of [{owner:"GESTURE_MATRIX_SOT",iconKey:"head_bow",label:"Bow head"},{type:"HEAD_BOW"}]){
  assert.equal(iconKeysForReaderState({gesture:cue}).gestureIconKey,C("faithful.gesture.bow_head"),
    "21 Oct: head bow uses the user-approved Faithful Bow");
}
assert.equal(iconKeysForReaderState({gesture:{label:"Bow head"}}).gestureIconKey,null,"no keyword matching on free text");
for(const action of [{label:"BOWS HEAD",iconKey:"head_bow"},{label:"BOWS SLIGHTLY"}]){
  assert.equal(iconKeysForReaderState({priestAction:action}).priestActionIconKey,null,
    "no vested head/moderate bow art: the faithful figure is never used for the priest");
}
for(const action of [{label:"BOWS PROFOUNDLY",iconKey:"priest_profound_bow_rich"},{label:"PROFOUND BOW"}]){
  assert.equal(iconKeysForReaderState({priestAction:action}).priestActionIconKey,C("priest.action.profound_bow"));
}
// Exact approved generic gesture; never infer the actor from artwork.
assert.equal(iconKeysForReaderState({
  priestAction:{label:"STRIKES BREAST",cueId:"AO.SM.C0196"},
  cueId:"AO.SM.C0196"
}).priestActionIconKey,C("priest.action.strike_breast"));
assert.notEqual(C("priest.action.strike_breast"),C("faithful.gesture.strike_breast"),
  "The two actor lanes retain distinct semantic keys despite shared approved art");
console.log("reader icons: PASS — canonical 21 October set, separate priest position/action/voice lanes.");
