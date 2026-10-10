import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

// Reconcile historical donor content with current source ownership.
// Historical HTML is NOT a liturgical authority or production owner.
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const donor=readFileSync(new URL("../legacy/v43.33.parts/chunk-005-p00.txt",import.meta.url),"utf8");
const ledger=load("../data/mass/holy-week-legacy-reconciliation.v1.json");
const archive=load("../legacy/v43.33.parts/IMPORT-STATUS.json");
const core=load("../data/mass/special-days-core.v1.1.json");
const extension=load("../data/mass/special-days-extension.v1.3.json");
const gf=load("../data/presentation/reader-good-friday.v1.json");
const vigil=load("../data/presentation/reader-easter-vigil.v1.json");
const prophecies=load("../data/presentation/reader-easter-vigil-prophecies.v1.json");
const htReader=readFileSync(new URL("../src/mass/reader-holy-thursday-mandatum.js",import.meta.url),"utf8");

assert.equal(ledger.schema,"ao.holy-week.legacy-reconciliation.v1");
assert.equal(ledger.recordsReviewed,20);
assert.equal(ledger.records.length,20);
assert.equal(new Set(ledger.records.map(x=>x.id)).size,20);
assert.equal(ledger.sourcePolicy.donorNotAuthority,true);
assert.equal(archive.fullSha256,ledger.donorPreservation.fullV4333Archive.sha256);
assert.equal(archive.fullBytes,ledger.donorPreservation.fullV4333Archive.fullBytes);
assert.equal(archive.complete,true);

// Archived Exsultet is IDENTICAL to what production already owns.
const oldExPos=donor.indexOf('"id":"vigil-exsultet"');
assert.ok(oldExPos>0,"Archived Exsultet not found in frozen v43.33");
const exMatch=donor.slice(oldExPos,oldExPos+28000).match(/"text":\{"lat":"((?:\\.|[^"])*)","en":/);
assert.ok(exMatch,"Archived full Exsultet Latin not found");
const oldExsultet=JSON.parse('"'+exMatch[1]+'"');
assert.equal(oldExsultet.length,4020);
assert.equal(oldExsultet,vigil.donor.exsultet.lat,"Never recopy/retranslate existing exact Exsultet");

// Nine archived bilingual Good Friday prayers survived as donor evidence;
// the active Good Friday native payload is still Latin-only.
const fromDonor=[];
for(let index=1;index<=9;index++){
 const at=donor.indexOf('"id":"gf-solemn-prayer-'+index+'"');
 assert.ok(at>=0,"Archive lost Good Friday prayer "+index);
 const m=donor.slice(at,at+5000).match(/"text":\{"lat":"((?:\\.|[^"])*)","en":"((?:\\.|[^"])*)","fr":"((?:\\.|[^"])*)"\}/);
 assert.ok(m,"Archived GF "+index+" lost trilingual donor fields");
 fromDonor.push(m.slice(1).map(x=>JSON.parse('"'+x+'"')));
}
assert.equal(gf.solemnPrayers.length,9);
assert.equal(gf.status,"SOURCE_PINNED_1962_GOOD_FRIDAY_LATIN");
assert.ok(fromDonor.every(([lat,en,fr])=>lat.length>150&&en.length>150&&fr.length>150));
assert.ok(gf.solemnPrayers.every(x=>!x.fr&&!x.en&&!x.french&&!x.english),
 "Original Latin-only production payload has changed: re-evaluate archived translations hold");

// CRITICAL EDITION FIREWALL. Older donor mixed later text into '1962'.
// #7 is the later 'all brethren believing in Christ' instead of printed-1962;
// #8 uses the new 2008 intention, not the printed-1962 version.
assert.match(fromDonor[6][0],/frátribus nostris, qui in Christum credunt/);
assert.match(gf.solemnPrayers[6].intention,/haereticis et schismaticis/);
assert.match(fromDonor[7][0],/illúminet corda eórum/);
assert.match(gf.solemnPrayers[7].variants.PRINTED_1962.intention,/auferat velamen/);
assert.match(gf.solemnPrayers[7].variants.HOLY_SEE_2008.intention,/illuminet corda/);
assert.notEqual(fromDonor[7][0],gf.solemnPrayers[7].variants.PRINTED_1962.intention);

// The old Mandatum choreography is not a new research gap. Its core 6-step
// actor-scope graph exists. The new B08 reader is still a single text surface,
// without linkage to these IDs; don't call the lost linkage certified.
const mand=core.optional_inserts.HOLY_THURSDAY_MANDATUM;
assert.equal(mand.events.length,6);
assert.equal(mand.return_target,"MC-0026");
assert.deepEqual(mand.events.map(x=>x.id),Array.from({length:6},(_,i)=>
 "SP-HT-MAND-"+String((i+1)*10).padStart(3,"0")));
assert.equal(mand.events[1].actor_scope,"MANDATUM_PARTICIPANT");
assert.equal(mand.events[1].action_state,"REMOVE_RIGHT_SHOE_AND_SOCK");
assert.equal(mand.events[3].action_state,"REPLACE_SOCK_AND_SHOE");
assert.ok(htReader.includes('sectionId:"AO.HT.MANDATUM"'));
assert.ok(!htReader.includes("SP-HT-MAND-"),
 "Mandatum graph now wired: reassess ledger HW-L04 and update this expected-debt gate");
assert.equal(ledger.records.find(x=>x.id==="HW-L04").status,"CANONICAL_SOURCE_PRESENT_READER_GAP");

// Structural denominators are not promises of textual completeness.
assert.equal(extension.graphs.PALM.length,12);
assert.equal(extension.graphs.HT_POST.length,6);
assert.equal(core.graphs.GF.length,56);
assert.equal(core.graphs.EV.length,38);
assert.equal(prophecies.readings.length,4);
assert.equal(prophecies.readings[2].reference,"Isaiah 4:2–6");
assert.equal(vigil.font1962.segments.length,17);
assert.equal(vigil.font1962.conditionalBaptism.status,"RITUAL_OWNER_UNRESOLVED__DO_NOT_PRESENT_AS_COMPLETE");
assert.equal(vigil.bridge.litanyI.lat.split("\n").filter(x=>x.startsWith("℣.")).length,46);
assert.equal(vigil.bridge.litanyII.lat.split("\n").filter(x=>x.startsWith("℣.")).length,30);
assert.equal(ledger.donorPreservation.goodFridayNineOrations.archivedFrench,9);
assert.equal(ledger.records.find(x=>x.id==="HW-L20").status,"UNVERIFIED_SOURCE_PENDING");

console.log("Holy Week legacy reconciliation: PASS — 20 source-owned deltas; archived Exsultet EXACT; 9 archived trilingual orations; unsafe Good Friday 7/8 editions quarantined; six-event Mandatum gap explicit; Palm/GF/Vigil graph totals preserved.");
