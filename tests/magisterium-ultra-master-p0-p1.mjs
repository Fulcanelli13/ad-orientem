import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
const read=async p=>JSON.parse(await readFile(new URL(p,root),"utf8"));
const docs=await read("data/learn/magisterium-ultra-master-documents.v1.json");
const doctrines=await read("data/learn/magisterium-ultra-master-doctrines.v1.json");
const passages=await read("data/learn/magisterium-source-passages-pilot.v1.json");
const apol=await read("data/learn/apologetics-canonical.v1.json");
const crisis=await read("data/learn/church-crisis-canonical.v1.json");
const pius=await read("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
assert.equal(docs.schema,"AO_MAGISTERIUM_ULTRA_MASTER_DOCUMENTS_V1");
assert.equal(doctrines.schema,"AO_MAGISTERIUM_ULTRA_MASTER_DOCTRINES_V1");
assert.equal(passages.schema,"AO_MAGISTERIUM_SOURCE_PASSAGE_PILOT_V1");
assert.equal(docs.status,"P0_P1_RESEARCH_ONLY");
assert.equal(doctrines.policy.publishable,false);
assert.equal(passages.publicationAllowed,false);
const ids=new Set(docs.records.map(x=>x.id));
assert.equal(ids.size,docs.records.length);
assert.equal(ids.size,83);
assert.equal(docs.metrics.documentCandidates,83);
assert.equal(docs.records.filter(x=>x.historicalLayer==="HISTORICAL_THROUGH_1962").length,68);
assert.equal(docs.records.filter(x=>x.historicalLayer==="AFTER_1962").length,15);
assert.equal(docs.records.filter(x=>x.primarySource.verifiedAtDocumentLevel).length,7);
assert.equal(docs.records.filter(x=>x.existingResearchReferences.length).length,27);
assert.equal(docs.records.reduce((sum,x)=>sum+x.existingResearchReferences.length,0),31);
const fams=new Set(docs.families.map(x=>x.id));
const validForms=new Set(["ecumenical_council","encyclical","papal_bull","motu_proprio","apostolic_constitution","apostolic_letter","congregational_decree","congregational_declaration","papal_syllabus","apostolic_exhortation","catechism"]);
for(const item of docs.records){
 assert.ok(validForms.has(item.documentForm),item.id);
 assert.ok(item.year>=325&&item.year<=2026);
 assert.equal(item.year<=1962,item.historicalLayer==="HISTORICAL_THROUGH_1962");
 assert.ok(item.doctrineFamilies.every(x=>fams.has(x)));
 assert.equal(item.publicationGate,"INDEX_ONLY");
 assert.equal(item.originalPassagesImported,0);
 assert.equal(item.claimLevelAuthorityReview,"NOT_ASSESSED");
 assert.equal(item.denzingerCrosswalk.matchStatus,"NOT_VERIFIED");
 for(const key of ["oldDenzinger","denzingerSchonmetzer","denzingerHunermann"])
  assert.equal(item.denzingerCrosswalk[key],null,"Denzinger concordance not yet edition certified "+item.id);
 for(const source of item.existingResearchReferences){
  assert.match(source.sourcePack,/^data\/learn\//);
  assert.ok(source.sourceId);
  assert.equal(source.editorialStatus,"RESEARCH_LINK_ONLY_UNAPPROVED");
 }
}
const sourcePacks=[...new Set(docs.records.flatMap(x=>x.existingResearchReferences.map(r=>r.sourcePack)))];
const sourceRowsByPath=new Map();
for(const path of sourcePacks){
 const pack=await read(path);
 assert.ok(Array.isArray(pack.source_registry),path);
 sourceRowsByPath.set(path,new Set(pack.source_registry.map(x=>x.id)));
}
for(const entry of docs.records)for(const ref of entry.existingResearchReferences)
 assert.ok(sourceRowsByPath.get(ref.sourcePack).has(ref.sourceId),
  "Unresolved original repository source: "+entry.id+" "+ref.sourcePack+" "+ref.sourceId);
const apolIds=new Set(apol.dossiers.map(x=>x.id));
const crisisIds=new Set(crisis.dossiers.map(x=>x.id));
const qids=new Set(pius.entries.map(x=>"PX1912-Q"+String(x.q).padStart(3,"0")));
const subjectIds=new Set(doctrines.records.map(x=>x.id));
assert.equal(subjectIds.size,doctrines.records.length);
assert.equal(subjectIds.size,51);
let links=0,apolCount=0,crCount=0;
for(const subject of doctrines.records){
 assert.ok(fams.has(subject.family),subject.id);
 assert.equal(subject.allPassagesVerified,false);
 for(const item of subject.documentCandidates){
  assert.ok(ids.has(item.documentId),subject.id+"->"+item.documentId);
  assert.equal(item.linkStatus,"TOPIC_RELATIONSHIP_PROPOSED_UNVERIFIED_PASSAGE");
  links++;
 }
 for(const link of subject.existingOwners){
  if(link.owner==="APOLOGETICS_CANONICAL_V1"){assert.ok(apolIds.has(link.ref));apolCount++;}
  else if(link.owner==="CHURCH_CRISIS_CANONICAL_V1"){assert.ok(crisisIds.has(link.ref));crCount++;}
  else if(link.owner==="LTF_PIUS_X_CATECHISM_INDEX")assert.ok(qids.has(link.ref));
  else throw Error("Unexpected owner "+link.owner);
 }
}
assert.equal(links,101);
assert.equal(apolCount,53);
assert.equal(crCount,10);
assert.equal(doctrines.metrics.originalPassageCertifications,0);
assert.equal(passages.records.length,61);
assert.equal(passages.records.filter(x=>x.crosswalkCandidate.modernNumber).length,41);
const passageIds=new Set();
for(const p of passages.records){
 assert.ok(!passageIds.has(p.passageId));passageIds.add(p.passageId);
 assert.ok(ids.has(p.documentId));
 assert.ok(p.doctrineIds.length&&p.doctrineIds.every(id=>subjectIds.has(id)));
 assert.ok(/^https:\/\//.test(p.verifiedSourceUrl));
 assert.equal(p.textCopied,false);
 assert.equal(p.publisherFacingApproved,false);
 assert.equal(p.sourceTextVerificationLevel,"LATIN_LOCATOR_WITNESSED_NOT_CRITICAL_EDITION_COLLATED");
 assert.equal(p.primaryLatinChecked,true);
 assert.equal(p.publisherFacingApproved,false);
 assert.ok(p.sourceWitnesses.length>0);
 for(const w of p.sourceWitnesses){assert.match(w.url,/^https:\/\//);assert.equal(w.editionAndRightsStatus,"NOT_CERTIFIED_FOR_REPRODUCTION");}
 assert.equal(p.teologicalClaimCertified,undefined);
 assert.equal(p.theologicalClaimCertified,false);
 assert.equal(p.publicationPermission,"NOT_CLEARED");
 if(p.crosswalkCandidate.modernNumber!==null){
  assert.equal(p.exactCrosswalkStatus,"CANDIDATE_NEEDS_EDITION_CONFIRMATION");
  assert.ok(p.crosswalkCandidate.sourceEvidence);
 }
}
assert.equal(passages.metrics.authoritativeFullOriginalPassagesCertified,0);
assert.equal(passages.editionVerifiedCrosswalks,0);
assert.equal(passages.metrics.additionalLocatorRecords,53);
assert.equal(passages.metrics.b3AddedLocatorRecords,35);
assert.equal(passages.metrics.publicationReadyRecords,0);
assert.equal(passages.sourceMethodology.authoritativeSourceQuoteGate,"CLOSED");
assert.equal(passages.metrics.originalLatinLocatorChecks,passages.records.filter(x=>x.primaryLatinChecked).length);
// An example of why document authorship cannot be inferred from pontifical approval:
assert.equal(docs.records.find(x=>x.id==="QUAM-SINGULARI-1910").documentForm,"congregational_decree");
assert.match(docs.records.find(x=>x.id==="QUAM-SINGULARI-1910").issuer,/Sacred Congregation/);
assert.equal(docs.records.find(x=>x.id==="SACRA-TRIDENTINA-SYNODUS-1905").documentForm,"congregational_decree");
console.log("PASS Magisterium P0/P1: 83 distinct documents; 51 canonical doctrine subjects; 101 provisional links; 61 nonpublished source locators; no fabricated Denzinger crosswalks or new answers");
