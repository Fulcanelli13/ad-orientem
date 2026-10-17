import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {projectVisibleMassSanctuary} from "../previews/visible-mass-3d/photographic-scene-bridge.mjs";
import {projectVisibleMassObjectActions} from "../previews/visible-mass-3d/photographic-object-mass-bridge.mjs";

const base="previews/visible-mass-3d/";
const pilot=JSON.parse(fs.readFileSync(base+"PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json","utf8"));
const html=fs.readFileSync(base+"sanctuary-hotspot-pilot.html","utf8");
const match=html.match(/const SPOTS\\s*=\\s*(\\[[\\s\\S]*?\\]);/);
assert.ok(match,"source-owner original photo coordinates required");
const marks=vm.runInNewContext("("+match[1]+")",Object.create(null));
const glossary={};
for(const filename of ["concepts-001-150.v1.json","concepts-151-300.v1.json","concepts-301-450.v1.json"]){
 const records=JSON.parse(fs.readFileSync("data/glossary/"+filename,"utf8"));
 for(const entry of records.entries)glossary[entry.id]=entry;
}
const sanctuary=projectVisibleMassSanctuary(pilot,glossary,marks);
const guide=JSON.parse(fs.readFileSync("data/presentation/guide-registry.v1.json","utf8"));
const formation=JSON.parse(fs.readFileSync("data/learn/mass-formation-campion.v1.json","utf8"));
const p=projectVisibleMassObjectActions(sanctuary,guide,formation);
assert.equal(p.photoSubjectCount,6);
assert.equal(p.edgeCount,6);
assert.equal(p.linkedSubjectCount,4);
assert.equal(p.guideProfile,"SUNG");
assert.equal(p.publishesMassActions,false);
assert.equal(p.publishesQuestionAnswers,false);
assert.deepEqual(p.records.filter(x=>x.edges.length).map(x=>x.objectId),["AL01","AL06","AL07","SN02"]);
const byId=new Map(p.records.map(x=>[x.objectId,x]));
assert.deepEqual(byId.get("SN02").edges.map(x=>x.guideId),["AO.CARD.024","AO.CARD.025"]);
assert.deepEqual(byId.get("AL01").edges.map(x=>x.guideId),["AO.CARD.010","AO.CARD.015"]);
assert.equal(byId.get("SN02").edges[0].photoContext[0].photoIndex,2);
assert.equal(byId.get("SN02").edges[1].photoContext.length,0,"no verified photograph of this precise rail distribution");
assert.equal(byId.get("AL06").glossaryRelation,"RELATED_PARENT_ONLY");
assert.equal(byId.get("AL07").glossaryRelation,"RELATED_PARENT_ONLY");
assert.equal(byId.get("AL19").edges.length,0);
assert.equal(byId.get("SN04").edges.length,0);
assert.ok(p.records.every(x=>x.photoId==="BROMPTON_ALTAR_2019_B"));
assert.ok(p.records.flatMap(x=>x.edges).every(x=>
  x.ritualPublicationStatus==="CONTEXTUAL_UNREVIEWED"&&
  !x.assertsPhotoIsSameMass&&!x.confirms1962ObjectRubric));
assert.throws(()=>projectVisibleMassObjectActions(sanctuary,guide,formation,{massForm:"LOW"}),/Only published Sung Guide/);
assert.throws(()=>projectVisibleMassObjectActions(
 sanctuary.map(x=>x.id==="SN02"?{...x,glossaryId:"G190"}:x),guide,formation
),/cannot rebind/);
assert.throws(()=>projectVisibleMassObjectActions(
 sanctuary.map(x=>x.id==="AL01"?{...x,photoId:"NEWMAN_360"}:x),guide,formation
),/cannot rebind/);
console.log("PASS P5: six original sanctuary photo subjects, six contextual edges, 4 linked objects, no invented answers, photo claims or ritual events.");
