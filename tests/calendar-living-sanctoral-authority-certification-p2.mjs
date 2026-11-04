import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(name)=>JSON.parse(readFileSync(new URL("../data/calendar/research/living-sanctoral-"+name+".v1.json",import.meta.url),"utf8"));
const edges=read("date-evidence").dateEdges, audit=read("authority-audit"), acts=read("modern-general-acts"), queue=read("authority-adjudication-queue");
const scoped=read("england-wales-propers-certified");
const verdicts=audit.edgeDecisions, byId=new Map(verdicts.map(v=>[v.evidenceEdgeId,v]));
assert.equal(edges.length,338);assert.equal(verdicts.length,338);assert.equal(byId.size,edges.length);
assert.equal(audit.summary.totalEvidenceEdges,338);
assert.equal(queue.counts.totalEvidenceEdges,338);
assert.equal(audit.summary.approvedNationalProperCoveredIndividuals,19);
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
 ARCHIVAL_1962_IDENTITY_REFERENCE:31,
 EPISCOPAL_APPROVED_NATIONAL_PROPER_CALENDAR:24
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
assert.equal(queue.priorities.reduce((n,x)=>n+x.edgeIds.length,0),338);
const national=read("national-propers-certified");
assert.equal(national.certifiedEntries.length,15);
assert.equal(national.counts.uniqueCanonicalIndividuals,13);
assert.equal(national.counts.scopedDifferencesFromPreexistingDateEvidence,7);
assert.equal(national.certifiedEntries.filter(x=>x.jurisdictionCountry==="US").length,9);
assert.equal(national.certifiedEntries.filter(x=>x.jurisdictionCountry==="CA").length,6);
assert.equal(new Set(national.certifiedEntries.map(x=>x.sourceEvidenceId)).size,15);
for(const cert of national.certifiedEntries){
 const source=edges.find(x=>x.edgeId===cert.sourceEvidenceId);
 assert.ok(source);
 assert.equal(source.subjectId,cert.canonicalPersonId);
 assert.equal(source.monthDay,cert.celebrationMonthDay);
 assert.equal(source.universalRomanStatus,"PARTICULAR_NATIONAL_CALENDAR_ONLY");
 assert.equal(source.effective.juridicalEffectiveFrom,null);
 assert.equal(source.importPolicy,"RESEARCH_ONLY");
 assert.equal(source.mass1962Effect,"NONE");
 assert.equal(byId.get(source.edgeId).requiresJurisdictionReview,false);
 assert.equal(byId.get(source.edgeId).runtimeImportAuthorized,false);
}
assert.equal(edges.filter(x=>["USCCB_2026_NATIONAL_PROPER_CALENDAR","CCCB_2025_APPROVED_NATIONAL_PROPER_CALENDAR"].includes(x.authorityScope)).length,15);
const cv=(id,country)=>national.certifiedEntries.find(x=>x.canonicalPersonId===id&&x.jurisdictionCountry===country);
assert.equal(cv("saint.kateri-tekakwitha","US").celebrationMonthDay,"07-14");
assert.equal(cv("saint.kateri-tekakwitha","CA").celebrationMonthDay,"04-17");
assert.equal(cv("saint.andre-bessette","US").celebrationMonthDay,"01-06");
assert.equal(cv("saint.andre-bessette","CA").celebrationMonthDay,"01-07");
assert.equal(cv("saint.marianne-cope","US").celebrationMonthDay,"01-23");
assert.equal(cv("saint.damien-de-veuster","US").celebrationMonthDay,"05-10");
assert.equal(cv("saint.marguerite-dyouville","CA").celebrationMonthDay,"10-16");
assert.ok(audit.edgeDecisions.every(x=>x.runtimeImportAuthorized===false));
assert.equal(scoped.observances.length,9);
assert.equal(new Set(scoped.observances.map(x=>x.subjectId)).size,6);
assert.equal(scoped.observances.filter(x=>x.jurisdiction==="ENGLAND").length,6);
assert.equal(scoped.observances.filter(x=>x.jurisdiction==="WALES").length,3);
assert.ok(scoped.constraints.historical1962Unchanged);
assert.ok(scoped.constraints.NewmanWalesSummarySupersededFor2026);
for(const x of scoped.observances){
 const edge=edges.find(y=>y.edgeId===x.sourceEvidenceId);
 assert.ok(edge && edge.subjectId===x.subjectId && edge.monthDay===x.monthDay);
 assert.equal(edge.dateClaimKind,x.rank);
 assert.equal(edge.mass1962Effect,"NONE");
 assert.equal(edge.importPolicy,"RESEARCH_ONLY");
 assert.equal(edge.effective.juridicalEffectiveFrom,null);
 assert.equal(byId.get(edge.edgeId).liturgicalRank,x.rank);
 assert.equal(byId.get(edge.edgeId).runtimeImportAuthorized,false);
}
for(const country of ["ENGLAND","WALES"]){
 const newman=scoped.observances.find(x=>x.jurisdiction===country&&x.subjectId==="saint.john-henry-newman");
 assert.ok(newman && newman.rank==="FEAST" && newman.monthDay==="10-09");
 assert.ok(newman.sourceUrl.endsWith("/2026/Oct.shtml"));
}
assert.equal(queue.nationalProperDivergences.length,11);
console.log("P2 authority audit PASS: 338/338 source edges with 9 England/Wales native audit verdicts; zero 1962 permissions");
