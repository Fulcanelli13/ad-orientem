import assert from "node:assert/strict";
import {createScholaPerformanceLedger} from "../src/mass/reader-schola-performance-ledger.js";
const freeze=Object.freeze;
const make=(events,supported=true)=>freeze({
 supported,events,activeClock:"SCHOLA_INDEPENDENT",sourceCardCount:65
});
const event=(id,kind,extras={})=>freeze({id,kind,label:id,...extras});
const baseline=make([
 event("KYRIE","CHANT",{trackId:"KYRIE"}),
 event("GLORIA","CHANT",{trackId:"GLORIA"}),
 event("CANON","QUIET_INTERVAL"),
 event("GLORIA_INTONATION","PRIEST_VOICE"),
 event("BENEDICTUS_CONTINUOUS","CHANT",{trackId:"SANCTUS_BENEDICTUS"}),
 event("BENEDICTUS_AFTER_CHALICE","CHANT",{trackId:"SANCTUS_BENEDICTUS",manualOnly:true}),
 event("OFFERTORY_LOCAL_MOTET","LOCAL_OPTION",{localPlan:{selected:true}}),
 event("COMMUNION_LOCAL_MOTET","LOCAL_OPTION",{localPlan:{selected:false}}),
 event("OFFERTORY_ORGAN_OPTION","ORGAN_OPTION",{
   localPlan:{selected:true},organPermission:{status:"SOLO_POTENTIALLY_PERMITTED"}}),
 event("ENTRANCE_ORGAN_OPTION","ORGAN_OPTION",{
   localPlan:{selected:true},organPermission:{status:"REQUIRES_CONTEXT"}}),
 event("RECESSIONAL_ORGAN_OPTION","ORGAN_OPTION",{
   localPlan:{selected:true},organPermission:{status:"SOLO_FORBIDDEN"}}),
 event("OFFERTORY_UNVERIFIED","LOCAL_OPTION",{
   localPlan:{selected:true},musicWindow:{status:"SOURCE_ANCHORS_UNVERIFIED"}})
]);
const ledger=createScholaPerformanceLedger();
let displayed=ledger.project(baseline);
assert.equal(displayed.counts.started,0);
assert.equal(displayed.counts.finished,0);
assert.equal(displayed.counts.skipped,0);
assert.equal(displayed.counts.expected,4); // Kyrie, Gloria, selected motet, permitted organ.
assert.equal(displayed.events.find(e=>e.id==="KYRIE").performance.status,
 "EXPECTED_NOT_OBSERVED");
assert.equal(displayed.events.find(e=>e.id==="KYRIE").performance.selectedForDisplay,false);
displayed=ledger.project(baseline,{selectedEventId:"KYRIE"});
assert.equal(displayed.events.find(e=>e.id==="KYRIE").performance.selectedForDisplay,true);
assert.equal(displayed.events.find(e=>e.id==="KYRIE").performance.observed,false,
 "Display selection must not be construed as heard music");
const begin=ledger.change(baseline,{eventId:"KYRIE",action:"START"});
assert.equal(begin.ok,true);
assert.equal(begin.status,"STARTED_OBSERVED");
assert.equal(ledger.project(baseline).counts.started,1);
assert.equal(ledger.change(baseline,{eventId:"KYRIE",action:"START"}).ok,false);
assert.equal(ledger.change(baseline,{eventId:"GLORIA",action:"FINISH"}).ok,false);
const finish=ledger.change(baseline,{eventId:"KYRIE",action:"FINISH"});
assert.equal(finish.ok,true);
assert.equal(finish.status,"FINISHED_OBSERVED");
assert.equal(ledger.project(baseline).counts.finished,1);
assert.equal(ledger.change(baseline,{eventId:"KYRIE",action:"SKIP"}).ok,false);
assert.equal(ledger.change(baseline,{eventId:"OFFERTORY_LOCAL_MOTET",action:"SKIP"}).ok,true);
assert.equal(ledger.project(baseline).counts.skipped,1);
assert.equal(ledger.change(baseline,{eventId:"OFFERTORY_LOCAL_MOTET",action:"RESET"}).ok,true);
assert.equal(ledger.project(baseline).counts.skipped,0);
assert.equal(ledger.change(baseline,{eventId:"OFFERTORY_ORGAN_OPTION",action:"START"}).ok,true);
assert.equal(ledger.change(baseline,{eventId:"ENTRANCE_ORGAN_OPTION",action:"START"}).reason,
 "ORGAN_PERMISSION_NOT_CONFIRMED");
assert.equal(ledger.change(baseline,{eventId:"RECESSIONAL_ORGAN_OPTION",action:"START"}).reason,
 "ORGAN_PERMISSION_NOT_CONFIRMED");
assert.equal(ledger.change(baseline,{eventId:"COMMUNION_LOCAL_MOTET",action:"START"}).reason,
 "OPTION_NOT_SELECTED");
assert.equal(ledger.change(baseline,{eventId:"OFFERTORY_UNVERIFIED",action:"START"}).reason,
 "SOURCE_ANCHORS_UNVERIFIED");
assert.equal(ledger.change(baseline,{eventId:"CANON",action:"START"}).reason,
 "NOT_A_MUSIC_PERFORMANCE");
assert.equal(ledger.change(baseline,{eventId:"GLORIA_INTONATION",action:"START"}).reason,
 "NOT_A_MUSIC_PERFORMANCE");
assert.equal(ledger.change(baseline,{eventId:"BENEDICTUS_CONTINUOUS",action:"START"}).reason,
 "CONTINUOUS_WITH_SANCTUS");
assert.equal(ledger.change(baseline,{eventId:"BENEDICTUS_AFTER_CHALICE",action:"START"}).reason,
 "BENEDICTUS_MANUAL_RELEASE_REQUIRED");
assert.equal(ledger.change(baseline,{
 eventId:"BENEDICTUS_AFTER_CHALICE",action:"FINISH",manualRelease:true
}).reason,"BENEDICTUS_MANUAL_RELEASE_REQUIRED");
assert.equal(ledger.change(baseline,{
 eventId:"BENEDICTUS_AFTER_CHALICE",action:"START",manualRelease:true
}).ok,true,"Only the existing guarded post-Chalice choir release may start the delayed piece");
assert.equal(ledger.project(baseline).events.find(e=>e.id==="BENEDICTUS_AFTER_CHALICE")
 .performance.status,"STARTED_OBSERVED");
assert.equal(ledger.project(baseline).events.find(e=>e.id==="BENEDICTUS_AFTER_CHALICE")
 .performance.eligible,false,"Menu cannot bypass the manual-release ownership");
assert.equal(ledger.change(baseline,{eventId:"SYNTHETIC_HYMN",action:"START"}).reason,
 "NOT_IN_THIS_MASS");
assert.equal(ledger.change(make([],false),{eventId:"KYRIE",action:"START"}).reason,
 "NOT_IN_THIS_MASS");
assert.equal(ledger.change(baseline,{eventId:"KYRIE",action:"NOOP"}).reason,
 "INVALID_ACTION");
assert.equal(ledger.change(baseline,{eventId:"KYRIE",action:"RESET"}).ok,true);
assert.equal(ledger.project(baseline).events.find(e=>e.id==="KYRIE")
 .performance.status,"EXPECTED_NOT_OBSERVED");
const fresh=createScholaPerformanceLedger();
assert.equal(fresh.project(baseline).counts.started,0,
 "Session observation must not leak to a new Mass");
assert.equal(fresh.project(baseline).counts.finished,0);
assert.equal(fresh.project(baseline).counts.skipped,0);
// A changed source itinerary is authoritative; stale observations are not
// presented as events in an omitted Gloria, Requiem or Low Mass.
const withoutGloria=make(baseline.events.filter(e=>e.id!=="GLORIA"));
assert.equal(ledger.project(withoutGloria).events.find(e=>e.id==="GLORIA"),undefined);
assert.equal(ledger.project(make([],false)).supported,false);
assert.equal(Object.isFrozen(ledger.project(baseline).events),true);
console.log("PASS user-only Schola observation ledger, source gates, Benedictus, organ, state transitions and session isolation");
