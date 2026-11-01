import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditM11SourceRoleRecovery,findM11SourceRole,
 normalizeM11Latin,promoteM11Score}
 from "../src/mass/reader-m11-source-role-audit.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const segments=Array.from({length:4},(_,i)=>
 read("data/research/mass-music-m11-source-segment-00"+(i+1)+".v1.json"));
const m07Batches=Array.from({length:6},(_,i)=>
 read("data/research/mass-music-m07-gr1961-review-00"+(i+1)+".v1.json"));
const sourceCorrected=read("data/research/mass-music-m11-source-role-corrected45.v1.json");
const residual15=read("data/research/mass-music-m11-residual15.v1.json");
const priorResidual45=read("data/research/mass-music-m10-residual45-priority.v1.json");
const args={segments,sourceCorrected,residual15,priorResidual45,m07Batches};
const actual=auditM11SourceRoleRecovery(args);
assert.equal(actual.status,"SOURCE_ROLE_RESEARCH_RECONCILED",JSON.stringify(actual));
assert.equal(actual.pinnedSourceFiles,28);
assert.equal(actual.pinnedSourceShaMatches,28);
assert.equal(actual.originallyWeakOccurrences,45);
assert.equal(actual.correctedRoleConflicts,37);
assert.equal(actual.candidatesFoundAfterCorrectRole,30);
assert.equal(actual.remainingNoTextCandidate,15);
assert.equal(actual.recoveredTextRelationships,35);
assert.equal(actual.multiCandidateOccurrences,5);
assert.deepEqual({...actual.sourceRoleParts},{
 GRADUAL:36,ALLELUIA:4,TRACT:3,OFFERTORY:1,COMMUNION:1});
assert.equal(actual.automatedReassignments,0);
assert.equal(actual.actualSelected1962ProperVerified,0);
assert.equal(actual.printed1961NeumesCompared,0);
assert.equal(actual.publicScores,0);
const same=(source,donor,expected,section="Graduale")=>{
 const x=findM11SourceRole(source,donor,section);
 assert.equal(x.status,"SOURCE_LINE_LOCATED",JSON.stringify(x));
 assert.deepEqual(x.foundRoles.map(y=>y.role),[expected]);
};
const source=[
 "[Officium]","Test","[Graduale]","!Ps 20:1",
 "Dóminus in virtúte tua lætábitur.",
 "V. Dómine, Deus virtútum, exáudi preces servórum tuórum.",
 "Allelúja, allelúja.","!Ps 1:1",
 "Laudáte Dóminum, omnes gentes. Allelúja.",
 "[Offertorium]","Benedícam Dóminum, qui tríbuit mihi intelléctum.",
 "[Communio]","Benedícimus Deum cœli et coram ómnibus vivéntibus."
].join("\n");
same(source,"Domine Deus virtutum exaudi preces servorum tuorum","GRADUAL");
same(source,"Laudate Dominum omnes gentes Alleluia","ALLELUIA");
same(source,"Benedicam Dominum qui tribuit mihi intellectum","OFFERTORY","Offertorium");
same(source,"Benedicimus Deum coeli et coram omnibus viventibus","COMMUNION","Communio");
const lent=["[Graduale]","!Ps 24:17",
 "Tribulatiónes cordis mei dilatátæ sunt.","V. Vide humilitátem meam.",
 "_","!Tractus","!Ps 105",
 "Confitémini Dómino, quóniam bonus.","V. Quis loquétur poténtias Dómini.",
 "[Gospel]","text"].join("\n");
same(lent,"Confitemini Domino quoniam bonus","TRACT");
same(lent,"Tribulationes cordis mei dilatatae sunt","GRADUAL");
assert.equal(findM11SourceRole(source,"Quae non sunt bona").status,"SOURCE_LINE_NOT_FOUND");
assert.equal(findM11SourceRole(source,"test","Sequentia").status,"NO_SOURCE_SECTION");
assert.equal(normalizeM11Latin("Cǽli, et Jerúsalem!"),"caeli et ierusalem");
const x=sourceCorrected.records.find(r=>r.originalScoreId==="GREGOBASE-249"&&
 r.sourcePath==="Sancti/06-24");
assert.equal(x.originalScorePart,"tr");
assert.equal(x.correctedRoleCandidate,"gr");
assert.ok(x.candidates.some(c=>c.id==="GREGOBASE-647"));
const paschal=sourceCorrected.records.find(r=>r.originalScoreId==="GREGOBASE-56"&&
 r.sourcePath==="Tempora/Pasc2-0");
assert.equal(paschal.correctedRoleCandidate,"al");
assert.ok(paschal.candidates.some(c=>c.id==="GREGOBASE-1220"));
const clone=x=>JSON.parse(JSON.stringify(x));
{
 const changed=clone(segments);changed[0].sourceFiles[0].sourceBlobSha="0".repeat(40);
 assert.equal(auditM11SourceRoleRecovery({...args,segments:changed}).status,
  "SOURCE_OR_EDITORIAL_HOLD");
}
{
 const changed=clone(sourceCorrected);changed.records[0].correctedRoleCandidate="tr";
 assert.equal(auditM11SourceRoleRecovery({...args,sourceCorrected:changed}).status,
  "SOURCE_OR_EDITORIAL_HOLD");
}
{
 const changed=clone(sourceCorrected);
 const r=changed.records.find(x=>x.candidates.length);
 r.candidates[0].part=r.candidates[0].part==="tr"?"gr":"tr";
 assert.equal(auditM11SourceRoleRecovery({...args,sourceCorrected:changed}).status,
  "SOURCE_OR_EDITORIAL_HOLD");
}
{
 const changed=clone(sourceCorrected);changed.records[0].userApproved=true;
 assert.equal(auditM11SourceRoleRecovery({...args,sourceCorrected:changed}).status,
  "SOURCE_OR_EDITORIAL_HOLD");
}
{
 const changed=clone(residual15);changed.stillUnresolved[0].rejected=true;
 assert.equal(auditM11SourceRoleRecovery({...args,residual15:changed}).status,
  "SOURCE_OR_EDITORIAL_HOLD");
}
assert.equal(promoteM11Score({id:"GREGOBASE-647",verified:true},{
 facsimileVerified:true},{editorialApproved:true}),null);
const schola=readFileSync(new URL("../src/mass/reader-schola-event-timeline.js",import.meta.url),"utf8");
assert.doesNotMatch(schola,/reader-m11-source-role-audit/);
console.log("PASS M11 28 source SHA matches; 45 occurrences; 37 source-role conflicts; 30 text alternatives; 15 held");
