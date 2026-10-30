import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectP1InternalMissalLink} from "../src/calendar/p1-internal-missal-link-resolution.js";
import {READER_PROPER_SLOTS} from "../src/mass/proper-reader-slots.js";

// SYNTHETIC PROJECTION TEST ONLY. These are deliberately NOT purported
// historical prayer texts or live confirmations of a particular 1962 day.
const reference=JSON.parse(readFileSync(new URL("../data/calendar/p1-internal-missal-navigation.v1.json",import.meta.url),"utf8"));
const anchors=reference.exampleInternalAnchors;
const source="Sancti/10-09"; // artificial fixture path; not a live source lookup
const id="sancti:10-09:3:w";
const commId="fixture:1962:martyrs:oct9"; // fictional test-only identifier
const commPath="Sancti/10-09cc"; // fictional test-only section
const wording=(key,path)=>Object.freeze({
 lat:"SYNTHETIC LAT "+key+" data word "+key+" text.",
 en:"SYNTHETIC ENG "+key+" data word "+key+" text.",
 fr:"SYNTHETIC FRA "+key+" data word "+key+" text.",
 sourcePath:path,
});
const common=Object.fromEntries(
 ["introit","epistle","gradual","gospel","offertory","preface","communion"]
   .map(k=>[k,wording(k,source)])
);
const main={id,path:source,rank:3};
const comm={id:commId,path:commPath,rank:3};
function day(includeComm=true){
 return {status:"ready",date:"2026-10-09",
   day:{main,commemorations:includeComm?[comm]:[]}};
}
function proper(includeComm=true){
 const owners=includeComm?[source,commPath]:[source];
 const arr=k=>owners.map(path=>wording(k,path));
 return {
  sourcePath:source,
  ...common,
  collects:arr("collect"),
  secrets:arr("secret"),
  postcommunions:arr("postcommunion"),
  calendarCommemorations:includeComm?[{id:commId,path:commPath,prayerSourcePath:commPath}]:[],
  appliedCommemorations:includeComm?[comm]:[],
  commemorationFormDecision:includeComm
   ?{status:"CERTIFIED",source:"1962_PROPER_RESOLVER",appliedCount:1,prayerGroupCount:2}
   :{status:"CERTIFIED",source:"1962_PROPER_RESOLVER",appliedCount:0,prayerGroupCount:1},
 };
}
assert.equal(anchors.length,6);
assert.deepEqual(new Set(anchors.map(a=>a.slot)),new Set(["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]));
assert.ok(anchors.every(a=>READER_PROPER_SLOTS.includes(a.slot)&&a.route===null&&a.resolvedSourcePath==="Sancti/10-09"));
assert.ok(anchors.filter(a=>a.sourceKind==="HISTORICAL_COMMEMORATION").every(a=>a.calendarCommemorationId==="sancti:10-09t:4:r"));
const principal=anchors.filter(a=>a.sourceKind==="PRINCIPAL_1962");
const commemorations=anchors.filter(a=>a.sourceKind==="HISTORICAL_COMMEMORATION");
for(const a of principal){
 const r=inspectP1InternalMissalLink({anchor:a,calendarResolution:day(),proper:proper()});
 assert.equal(r.status,"SOURCE_READY_ROUTER_NOT_IMPLEMENTED",a.anchorId+": "+r.reason);
 assert.equal(r.sourcePath,source);
 assert.equal(r.sourceIdentityId,id);
 assert.equal(r.prayerIndex,0);
 assert.equal(r.readerParagraphId,a.slot+".1");
 assert.equal(r.route,null);assert.equal(r.externalUrl,null);
 assert.equal(r.readOnly,true);assert.equal(r.maySelectCelebrantMass,false);
 assert.equal(r.liturgicalRecitationStatus,"NOT_ASSERTED_BY_THIS_LINK");
}
for(const a of commemorations){
 let r=inspectP1InternalMissalLink({anchor:{...a,calendarCommemorationId:null},calendarResolution:day(),proper:proper()});
 assert.equal(r.reason,"CANONICAL_COMMEMORATION_ID_MISSING");
 r=inspectP1InternalMissalLink({anchor:{...a,calendarCommemorationId:commId},
  calendarResolution:day(),proper:proper()});
 assert.equal(r.status,"SOURCE_READY_ROUTER_NOT_IMPLEMENTED",a.anchorId+": "+r.reason);
 assert.equal(r.prayerOwnerPath,commPath);
 assert.equal(r.prayerIndex,1);
 assert.equal(r.readerParagraphId,a.slot+".2");
 assert.equal(r.referenceNotProofOfMassFormSelection,true);
}
const pa=principal[0],ca={...commemorations[0],calendarCommemorationId:commId};
const modified=(p,props)=>({...p,...props});
assert.equal(inspectP1InternalMissalLink({anchor:pa,calendarResolution:{...day(),date:"2027-10-09"},proper:proper()}).status,"SOURCE_READY_ROUTER_NOT_IMPLEMENTED","Works for future 1962 year with same verified calendar source");
assert.equal(inspectP1InternalMissalLink({anchor:pa,calendarResolution:{...day(),date:"2027-10-08"},proper:proper()}).reason,"SOURCE_DATE_NOT_VERIFIED");
assert.equal(inspectP1InternalMissalLink({anchor:pa,calendarResolution:day(),proper:modified(proper(),{sourcePath:"Sancti/10-08"})}).reason,"PROPER_OWNER_PATH_MISMATCH");
assert.equal(inspectP1InternalMissalLink({anchor:pa,calendarResolution:modified(day(),{day:{...day().day,main:{id:"fake",path:source}}}),proper:proper()}).reason,"PRINCIPAL_ID_MISMATCH");
assert.equal(inspectP1InternalMissalLink({anchor:ca,calendarResolution:day(),proper:modified(proper(),{commemorationFormDecision:{status:"UNVERIFIED"}})}).status,"SOURCE_READY_ROUTER_NOT_IMPLEMENTED","Historical Missal reference survives unresolved Mass-form selection");
assert.equal(inspectP1InternalMissalLink({anchor:ca,calendarResolution:day(),proper:modified(proper(),{appliedCommemorations:[]})}).liturgicalRecitationStatus,"NOT_ASSERTED_BY_THIS_LINK","Read-only commemoration links must not claim prayer was recited");
assert.equal(inspectP1InternalMissalLink({anchor:ca,calendarResolution:day(),proper:modified(proper(),{calendarCommemorations:[{id:commId,path:"Sancti/10-08",prayerSourcePath:commPath}]})}).reason,"SOURCE_COMMEMORATION_OWNER_MISMATCH");
// A missing prayer may still be reconstructed by a source-owned singular
// field; do not confuse that with an independent second commemoration prayer.
const incomplete=proper();
incomplete.postcommunions=[incomplete.postcommunions[0]];
assert.equal(inspectP1InternalMissalLink({anchor:ca,calendarResolution:day(),proper:incomplete}).reason,"FULL_READER_PROPER_INCOMPLETE");
assert.equal(inspectP1InternalMissalLink({anchor:{...ca,calendarCommemorationId:"different"},calendarResolution:day(),proper:proper()}).reason,"CALENDAR_COMMEMORATION_ID_MISMATCH");
assert.equal(inspectP1InternalMissalLink({anchor:{...pa,slot:"PDF_FOLIO"},calendarResolution:day(),proper:proper()}).reason,"NON_CANONICAL_ORATION_SLOT");
assert.equal(inspectP1InternalMissalLink({anchor:{...pa,requestedSurface:"MASS_LIVE"},calendarResolution:day(),proper:proper()}).reason,"NOT_A_READ_ONLY_MISSAL_REQUEST");
assert.ok(reference.contractValidation.currentDirectPrayerDeepLinksVerified===0,"No user-facing route is implemented");
console.log("P1 internal Missal resolution PASS: 3 principal and 3 read-only commemoration targets checked against exact 1962 source-owned slot projection; external/public URL prohibited; live lookup remains pending.");
