import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(name)=>JSON.parse(readFileSync(new URL("../data/calendar/research/living-sanctoral-"+name+".v1.json",import.meta.url),"utf8"));
const edges=read("date-evidence").dateEdges, audit=read("authority-audit"), acts=read("modern-general-acts"), queue=read("authority-adjudication-queue");
const verdicts=audit.edgeDecisions, byId=new Map(verdicts.map(v=>[v.evidenceEdgeId,v]));
assert.equal(edges.length,314);assert.equal(verdicts.length,314);assert.equal(byId.size,edges.length);
assert.deepEqual(Object.keys(audit.summary).sort(),Object.keys(queue.counts).sort());
for(const edge of edges){
 const result=byId.get(edge.edgeId);assert.ok(result,"Missing edge verdict "+edge.edgeId);
 assert.equal(result.subjectId,edge.subjectId);assert.equal(result.monthDay,edge.monthDay);
 assert.equal(result.sourceUrl,edge.source.url);assert.equal(result.runtimeImportAuthorized,false);
 assert.equal(result.eligibleForNewTraditionalMass,false);assert.equal(result.historical1962LegalSourceConfirmed,false);
 if(["p2-extra-067","p2-extra-068"].includes(edge.edgeId)){assert.equal(result.independentJuridicalEffectiveFrom,"2000-05-13");assert.equal(result.historicalEffectiveDateRank,"BLESSED_NOT_SAINT");assert.equal(result.requiresEffectiveDateReview,false);}else{assert.equal(result.independentJuridicalEffectiveFrom,null);assert.equal(result.requiresEffectiveDateReview,true);}
 if(edge.authorityScope==="HOLY_SEE_DICASTERY_SAINT_PROFILE")assert.equal(result.authorityDecision,"DICASTERY_LITURGICAL_DATE_NOT_INSCRIPTION");
}
const byDecision={};for(const x of verdicts)byDecision[x.authorityDecision]=(byDecision[x.authorityDecision]||0)+1;
assert.deepEqual(byDecision,{
 MODERN_GENERAL_ROMAN_EXPLICIT_DECREE:9,
 MODERN_GENERAL_ROMAN_PAPAL_PUBLIC_ANNOUNCEMENT:1,
 DICASTERY_LITURGICAL_DATE_NOT_INSCRIPTION:252,
 PAPAL_PARTICULAR_PLACES_PERMISSION:2,
 EPISCOPAL_LOCAL_CALENDAR_WITNESS:11,
 PARTICULAR_INSTITUTE_OR_CHAPEL_WITNESS:8,
 ARCHIVAL_1962_IDENTITY_REFERENCE:31
});
const ins=acts.acts;
assert.equal(ins.length,10);assert.equal(new Set(ins.map(a=>a.subjectId)).size,10);
assert.equal(ins.filter(a=>a.documentType==="FORMAL_DECREE").length,9);
assert.equal(ins.filter(a=>a.documentType==="PAPAL_ANGELUS").length,1);
for(const act of ins){
 const edge=edges.find(e=>e.edgeId===act.evidenceEdgeId);
 assert.ok(edge&&edge.subjectId===act.subjectId);
 assert.equal(edge.effective.juridicalEffectiveFrom,null);
 assert.equal(edge.effective.documentDated,act.documentDated);
 assert.equal(edge.effective.documentPublicReleaseDate,act.publiclyReleasedOn);
 assert.equal(act.specificJuridicalEffectiveFrom,null);
 assert.equal(act.claimsTraditional1962MassPermission,false);
 assert.equal(act.scope,"CURRENT_GENERAL_ROMAN_CALENDAR_ONLY");
}
const newman=ins.find(a=>a.subjectId==="saint.john-henry-newman");
assert.equal(newman.documentDated,"2025-11-09");assert.equal(newman.publiclyReleasedOn,"2026-02-03");
const calcutta=ins.find(a=>a.subjectId==="saint.teresa-calcutta");
assert.equal(calcutta.documentDated,"2024-12-24");assert.equal(calcutta.publiclyReleasedOn,"2025-02-11");
const paul=ins.find(a=>a.subjectId==="saint.paul-vi");
assert.equal(paul.documentDated,"2019-01-25");assert.equal(paul.publiclyReleasedOn,"2019-02-06");
assert.equal(audit.summary.modernGeneralFormalDecree,9);
assert.equal(audit.summary.newTraditionalMassPermissionsCreated,0);
assert.equal(audit.summary.legalEffectiveDatesCertifiedByThisPass,2);
assert.equal(audit.summary.modernGeneralJuridicalEffectiveDatesCertifiedByThisPass,0);
assert.equal(queue.particularBeatificationGrant.rankAtGrant,"BLESSED");
const local=read("particular-source-verification");assert.equal(local.records.length,8);
assert.ok(local.records.find(x=>x.subjectId==="saint.jadwiga-queen-poland").sourceUrl.includes("/chrystus-na-krowodrzy/"));
assert.equal(queue.priorities.reduce((n,x)=>n+x.edgeIds.length,0),314);
assert.ok(audit.edgeDecisions.every(x=>x.runtimeImportAuthorized===false));
console.log("P2 authority and jurisdiction audit PASS: 314/314 edges, 9 official decrees, 1 papal statement; no assumed legal effective dates or 1962 permissions");
