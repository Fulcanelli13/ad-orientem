import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveDevotionalActionScene,approvedOpeningArtworkPool,
  selectSessionArtwork,createDevotionalActionCinematic,
  DEVOTIONAL_ACTION_CINEMATIC_VERSION} from "../src/pray/devotional-action-cinematics.js";
import {resolveAngelusPosture} from "../src/pray/angelus-guide-data.js";
import {getCanonicalAsset} from "../src/assets/asset-registry.js";
import {certifiedPublicStationCue,stationPhaseOfFocusedParagraph,STATIONS_PUBLIC_POSTURE_SOURCE} from "../src/pray/stations-posture-policy.js";

assert.equal(DEVOTIONAL_ACTION_CINEMATIC_VERSION,"devotional-action-v1");
const scene=props=>resolveDevotionalActionScene(props);
// The reviewed Angelus v2 policy is the only Incarnation gesture owner.
// Shared postures must never duplicate its cinematic.
assert.equal(scene({view:"angelus",form:"angelus",cardId:"incarnation",
 cue:"profound-bow",posture:"stand"}),null);
const ben=scene({view:"benediction",benedictionStage:"blessing"});
assert.equal(ben.id,"BENEDICTION.BLESSING");
assert.equal(ben.kind,"SOLEMN_ACTION");
assert.ok(getCanonicalAsset(ben.assetId));
assert.equal(ben.observedNow,false);
assert.equal(ben.auditoryCue.id,"BENEDICTION.BLESSING.BELL");
assert.equal(ben.auditoryCue.instrument,"ALTAR_BELL");
assert.equal(ben.auditoryCue.rubricalWindow,"BLESSING_WITH_MONSTRANCE");
assert.equal(ben.auditoryCue.status,"EXPECTED_NOT_OBSERVED");
assert.equal(ben.auditoryCue.observedNow,false);
assert.equal(ben.auditoryCue.actuallyHeard,"UNKNOWN");
assert.equal(ben.auditoryCue.pattern,"NOT_INFERRED");
for(const stage of ["exposition","adoration","hymn","prayer","praises","reposition",null]){
 assert.equal(scene({view:"benediction",benedictionStage:stage}),null);
}
const visit=scene({view:"adoration",adorationMode:"visit",visitStep:0});
assert.equal(visit.id,"VISIT.ARRIVAL");
assert.ok(getCanonicalAsset(visit.assetId));
for(const [mode,step] of [["open",0],["holy",0],["four",0],["treasury",0],["visit",1]]){
 assert.equal(scene({view:"adoration",adorationMode:mode,visitStep:step}),null);
}
for(let i=0;i<14;i++)assert.equal(scene({view:"stations",stationStep:i}),null,
  "Unverified Stations posture cannot manufacture 14 genuflections");
const publicActions=[["versicle","GENUFLECT"],["meditation","STAND"],["prayer","KNEEL"]];
for(let station=0;station<14;station++){
 for(const [phase,action] of publicActions){
  const cue=certifiedPublicStationCue({stationStep:station,phase,enabled:true,guided:true});
  assert.equal(cue.action,action);
  assert.equal(cue.certified,true);
  assert.equal(cue.performed,false);
  const projected=scene({view:"stations",stationStep:station,stationRitual:cue});
  assert.equal(projected.kind,"POSTURE");
  assert.equal(projected.sourceCue,cue.sourceCueId);
  assert.equal(projected.observedNow,false);
  assert.ok(getCanonicalAsset(projected.assetId));
 }
}
assert.ok(STATIONS_PUBLIC_POSTURE_SOURCE.url.includes("catholicworshipm00oake"));
assert.equal(certifiedPublicStationCue({stationStep:1,phase:"versicle",enabled:false,guided:true}),null);
assert.equal(certifiedPublicStationCue({stationStep:0,phase:"prayer",enabled:true,guided:false}),null);
assert.equal(certifiedPublicStationCue({stationStep:13,phase:"meditation",enabled:true,guided:false}),null);
assert.equal(certifiedPublicStationCue({stationStep:14,phase:"versicle",enabled:true,guided:true}),null);
assert.equal(scene({view:"stations",stationStep:0,stationRitual:{
 certified:true,action:"GENUFLECT",sourceCueId:""}}),null);
assert.equal(stationPhaseOfFocusedParagraph({matches:s=>s===".aoP435930VRLine.leader"}),"versicle");
assert.equal(stationPhaseOfFocusedParagraph({matches:()=>false,closest:s=>s===".aoP435930StationPrayer"}),"prayer");
assert.equal(stationPhaseOfFocusedParagraph({matches:()=>false,closest:s=>s===".aoP435930StationConsider"}),"meditation");
assert.equal(stationPhaseOfFocusedParagraph({matches:()=>false,closest:()=>null}),null);

// Approved art selection excludes unapproved Tanner, new artists, out-of-domain and weak ratings.
const paintings=[
 {id:"a",approval:"APPROVED",rating:4,subject:"ANNUNCIATION",localPath:"assets/art/a.webp",artist:"Approved A",title:"Annunciation A"},
 {id:"b",approval:"APPROVED",rating:5,subject:"ANNUNCIATION",localPath:"assets/art/b.webp",artist:"Approved B",title:"Annunciation B"},
 {id:"pending",approval:"PENDING",rating:5,subject:"ANNUNCIATION",localPath:"assets/art/pending.webp",artist:"Pending",title:"Pending"},
 {id:"else",approval:"APPROVED",rating:5,subject:"VISITATION",localPath:"assets/art/else.webp",artist:"Other",title:"Visit"},
 {id:"weak",approval:"APPROVED",rating:2,subject:"ANNUNCIATION",localPath:"assets/art/weak.webp",artist:"Weak",title:"Weak"},
 {id:"traversal",approval:"APPROVED",rating:5,subject:"ANNUNCIATION",localPath:"assets/../bad.webp",artist:"Bad",title:"Traversal"},
];
const pool=approvedOpeningArtworkPool(paintings);
assert.deepEqual(pool.map(x=>x.id),["a","b"]);
assert.equal(selectSessionArtwork(pool,"a",()=>0)?.id,"b");
assert.equal(selectSessionArtwork(pool,"b",()=>0)?.id,"a");
assert.equal(selectSessionArtwork([],null),null);
assert.equal(createDevotionalActionCinematic({}).current(),null);
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const opening=readFileSync(new URL("../src/pray/devotional-cinematic.js",import.meta.url),"utf8");
const styles=readFileSync(new URL("../src/pray/devotional-action-cinematic-styles.js",import.meta.url),"utf8");
assert.ok(runtime.includes("actionCinematics.sync(scene,{mount:m"));
assert.ok(runtime.includes("benedictionStage:view==='benediction'?benStages()[BEN.step]?.[0]:null"));
assert.ok(runtime.includes("stationRitual:view==='stations'?certifiedPublicStationCue({"));
assert.ok(runtime.includes("resolveAngelusIncarnationCinematic({"));
assert.ok(opening.includes("entry.openingShown"));
assert.ok(opening.includes("selectAngelusOpeningArtwork("));
assert.ok(opening.includes("resolveAngelusArtworkImage("));
assert.ok(styles.includes("aoDevotionalActionIcon"));
assert.ok(styles.includes("prefers-reduced-motion:reduce"));
console.log("PASS: unique Angelus source owner, Benediction exact stage, Eucharistic Visit arrival, Stations fail-closed, approved artwork selection, static accessible cinematic.");
