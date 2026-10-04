import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildGenericProcessionReader, createGenericProcessionReaderController } from "../src/mass/reader-generic-procession.js";
import { compileMassPlan, makeResolvedMass } from "../src/mass/session-engine.js";
import { projectSpecialStructure } from "../src/mass/reader-special-structure.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const ext=load("../data/mass/special-days-extension.v1.3.json");
const payload=load("../data/presentation/reader-generic-procession.v1.json");
const registry=load("../data/mass/rite-overlay-registry.v1.json");
const core=load("../data/mass/special-days-core.v1.1.json");
const graph=ext.graphs.PROC;

assert.equal(graph.length,7);
const built=buildGenericProcessionReader({graph,payload});
assert.equal(built.sourceRecordCount,7);
assert.equal(built.massEndingRecordCount,4);
assert.equal(built.readerRecordCount,3);
assert.equal(built.feastSpecificTextOwned,false);
assert.deepEqual(built.surfaces.map(x=>x.recordId),["PROC-100-010","PROC-100-020","PROC-100-030"]);
assert.ok(built.surfaces.every(x=>x.paragraphs.length===0));
assert.ok(!built.surfaces.some(x=>/^PROC-000-/.test(x.recordId)),"Mass-ending resolver rows leaked into post-Mass reader");

const ctrl=createGenericProcessionReaderController({graph,payload});
assert.equal(ctrl.project().card.recordId,"PROC-100-010");
ctrl.next();
assert.equal(ctrl.project().posture,"LOCAL");
ctrl.setParticipating(true);
assert.equal(ctrl.project().posture,"PROCESSIONAL");
ctrl.next();
assert.equal(ctrl.project().card.recordId,"PROC-100-030");
assert.equal(ctrl.project().handoff,"POST_MASS_LIFECYCLE");

const resolved=makeResolvedMass({
  date:"2026-10-04",form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE",
  calendarCelebration:{id:"dominica-xix",type:"CALENDAR"},
  followingActions:["GENERIC_PROCESSION"],
});
const plan=compileMassPlan(resolved);
assert.deepEqual([...plan.followingGraphs],["GENERIC_PROCESSION"]);
const projection=projectSpecialStructure({session:{resolvedMass:resolved,plan}}, {registry,extension:ext,core});
const seg=projection.segments.find(x=>x.id==="GENERIC_PROCESSION");
assert.ok(seg);
assert.equal(seg.readerPayload,"NATIVE_READER_PAYLOAD");
assert.equal(seg.renderable,true);
assert.equal(projection.releaseSupport,true);
assert.equal(plan.dismissal,"ITE_OR_BENEDICAMUS_AS_RESOLVED","generic procession must preserve resolver-owned dismissal rather than forcing Benedicamus");
assert.equal(plan.blessingAllowed,true,"generic procession must not invent blessing suppression");
assert.equal(plan.normalLastGospel,true,"generic procession must not invent Last Gospel suppression");

console.log("Generic Procession: PASS — seven-record contract, plan-owned Mass ending, three structural following-action surfaces, no invented feast text.");
