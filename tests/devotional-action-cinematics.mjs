import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveDevotionalActionScene,approvedOpeningArtworkPool,
  selectSessionArtwork,createDevotionalActionCinematic,
  DEVOTIONAL_ACTION_CINEMATIC_VERSION} from "../src/pray/devotional-action-cinematics.js";
import {resolveAngelusPosture} from "../src/pray/angelus-guide-data.js";
import {getCanonicalAsset} from "../src/assets/asset-registry.js";

assert.equal(DEVOTIONAL_ACTION_CINEMATIC_VERSION,"devotional-action-v1");
const scene=props=>resolveDevotionalActionScene(props);
const tuesday=resolveAngelusPosture({form:"angelus",weekday:2});
const sunday=resolveAngelusPosture({form:"angelus",weekday:0});
const saturdayMorning=resolveAngelusPosture({form:"angelus",weekday:6,saturdayAfterVespers:false});
const saturdayVespers=resolveAngelusPosture({form:"angelus",weekday:6,saturdayAfterVespers:true});
assert.equal(tuesday.posture,"kneel");
assert.equal(sunday.posture,"stand");
assert.equal(saturdayMorning.posture,"kneel");
assert.equal(saturdayVespers.posture,"stand");
const incarnation=posture=>scene({
  view:"angelus",form:"angelus",cardId:"incarnation",cue:"profound-bow",posture,
});
assert.equal(incarnation(tuesday.posture)?.id,"ANGELUS.INCARNATION.KNEEL");
assert.equal(incarnation(sunday.posture)?.id,"ANGELUS.INCARNATION.BOW");
for(const x of [incarnation("kneel"),incarnation("stand")]){
 assert.equal(x.kind,"POSTURE");assert.ok(getCanonicalAsset(x.assetId));
 assert.equal(x.observedNow,false);assert.equal(x.assertsPerformedGesture,false);
 assert.equal(x.canonicalAuthority,false);assert.ok(Object.isFrozen(x));
}
assert.equal(incarnation("invalid"),null);
assert.equal(scene({view:"angelus",form:"regina",cardId:"incarnation",cue:"profound-bow",posture:"stand"}),null);
assert.equal(scene({view:"angelus",form:"angelus",cardId:"fiat",cue:"profound-bow",posture:"stand"}),null);
assert.equal(scene({view:"angelus",form:"angelus",cardId:"incarnation",cue:null,posture:"stand"}),null);
const ben=scene({view:"benediction",benedictionStage:"blessing"});
assert.equal(ben.id,"BENEDICTION.BLESSING");
assert.equal(ben.kind,"SOLEMN_ACTION");
assert.ok(getCanonicalAsset(ben.assetId));
assert.equal(ben.observedNow,false);
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
assert.equal(scene({view:"stations",stationStep:0,stationRitual:{
 certified:true,action:"GENUFLECT",sourceCueId:""} })?.kind,"POSTURE");
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
assert.ok(runtime.includes("actionCinematics.sync(resolveDevotionalActionScene({"));
assert.ok(runtime.includes("benedictionStage:view==='benediction'?BEN_STAGES[BEN.step]?.[0]:null"));
assert.ok(runtime.includes("stationRitual:null"));
assert.ok(runtime.includes("view:'angelus',form,cardId:card?.id,cue"));
assert.ok(opening.includes('card?.id!=="announcement"'));
assert.ok(opening.includes("shown.has(sheet)"));
assert.ok(opening.includes("approvedOpeningArtworkPool("));
assert.ok(styles.includes("aoDevotionalActionIcon"));
assert.ok(styles.includes("prefers-reduced-motion:reduce"));
console.log("PASS: Angelus posture and Incarnation cue, Benediction exact stage, Eucharistic Visit arrival, Stations fail-closed, approved artwork selection, static accessible cinematic.");
