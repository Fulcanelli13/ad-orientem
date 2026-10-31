import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const x=JSON.parse(readFileSync(new URL("../data/prayer/artwork-editorial-20261031/approved-existing-art-reassignments-wave1.v1.json",import.meta.url),"utf8"));
test("source-attested existing Prayer artwork reassignment has a closed, unique 267-slot census",()=>{
 assert.equal(x.baseline.slots,267);
 assert.equal(x.wave.coveredAfterWave,226);
 assert.equal(x.wave.stillWithoutApprovedArtAssignment,41);
 assert.equal(x.wave.coveredAfterWave+x.wave.stillWithoutApprovedArtAssignment,267);
 assert.equal(x.assignments.length,74);
 assert.equal(new Set(x.assignments.map(a=>a.targetSlot)).size,x.assignments.length);
 assert.equal(x.remainingWithoutApprovedArt.length,41);
 assert.equal(new Set(x.remainingWithoutApprovedArt.map(a=>a.slot)).size,41);
 for(const a of x.assignments)assert.ok(!x.remainingWithoutApprovedArt.some(r=>r.slot===a.targetSlot));
});
test("prior editorial vetoes, selected final covers and every photo release gate remain preserved",()=>{
 const prohibited=/lybaert|ugolino da siena|fra angelico|el greco/i;
 for(const a of x.assignments){
  assert.ok(!prohibited.test((a.artworkTitle||"")+" "+(a.artist||"")),a.targetSlot);
  assert.ok(!/prado/i.test(a.sourceFilePage||""),a.targetSlot);
  assert.ok(!/PUBLISHED|LIVE_ENABLED/.test(a.imagePublication||""),a.targetSlot);
 }
 assert.equal(x.assignments.filter(a=>a.sourceApprovalStatus==="USER_APPROVED_COMPLETE_14_PAINTING_CYCLE").length,14);
 const stations=x.assignments.filter(a=>a.approvalClass==="DIRECT_USER_SERIES_SELECTION");
 assert.deepEqual(stations.map(x=>x.targetSlot),Array.from({length:14},(_,i)=>"STG-pray.stations-"+String(i+1).padStart(2,"0")));
 assert.ok(stations.every(a=>a.licenceException==="USER_AUTHORIZED_FOURTEEN_FILES_ONLY"));
 assert.ok(stations.every(a=>a.licence==="CC BY-SA 4.0 Didier Descouens / Archaeodontosaurus"));
 assert.ok(x.assignments.some(a=>a.targetSlot==="COV-novena.st_therese"&&a.sourceApprovalStatus==="USER_FINAL_SELECTED_PUBLIC_DOMAIN"));
 assert.ok(x.assignments.some(a=>a.targetSlot==="STG-pray.benediction-03"&&a.relationship.includes("NOT_LITERAL_BLESSING")));
 assert.ok(x.assignments.some(a=>a.targetSlot==="STG-pray.rosary-01"&&a.artist==="Lorenzo Lotto"&&a.sourceApprovalStatus==="USER_FINAL_LOCKED"));
 assert.ok(x.assignments.some(a=>a.targetSlot==="COV-novena.seven_sorrows"&&a.artist.includes("Master of the Female")));
 assert.ok(!x.assignments.some(a=>["COV-pray.rosary","COV-pray.adoration","COV-pray.confession"].includes(a.targetSlot)));
});
