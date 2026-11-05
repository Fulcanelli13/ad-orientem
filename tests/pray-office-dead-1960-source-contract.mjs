// AO-AQ-055: source acquisition only. Do not mistake a DO proper for a completed Office.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const registry=read("data/research/office-dead-1960/acquisition-registry.v1.json");
const proper=read(registry.files.properBundle);
const psalms=read(registry.files.vespersPsalmBundle);
const commit="b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0";
const locales=["la","en","fr"],assigned=[114,119,120,129,137],conditional=145;
const gitSha=raw=>{
 const data=Buffer.from(raw,"utf8");
 return createHash("sha1").update(Buffer.from("blob "+data.byteLength+"\0","utf8")).update(data).digest("hex");
};
assert.equal(registry.schema,"ao.pray.office-dead-p0-source-acquisition.v1");
assert.equal(registry.originalAcquisitionId,"AO-AQ-055");
assert.equal(registry.originalPriority,"P0");
assert.equal(registry.originalDisposition,"ROUTED_OTHER_MODULE");
assert.equal(registry.targetOwner,"DIVINE_OFFICE_NOT_PRAYER_TEXT_DUPLICATION");
assert.equal(registry.progress.livePublicationAuthorized,false);
for(const key of ["completeMatinsAssembled","completeLaudsAssembled","completeVespersAssembled","fullAllSoulsOfficeAssembled","independentPrintedBreviaryCertifiedHours","fullTrilingualHourCertificates","publicReaderRoutesAdded"])assert.equal(registry.progress[key],0,key);
assert.deepEqual(registry.files.locales,locales);
assert.deepEqual(registry.files.vespersOrdinaryPsalmIds,assigned);
assert.equal(registry.files.conditionalConclusionPsalm,conditional);
assert.equal(registry.scope.sacrosanctaeNotAppendedWithoutSourceReview,true);
assert.equal(registry.scope.votiveOfficeMajorHours.length,3);
assert.match(registry.scope.allsoulsDayOffice,/short Hours and Compline/);
assert.match(registry.scope.vespers1960Rule,/2 November/);
assert.match(registry.scope.vespers1960Rule,/1 November/);
assert.ok(registry.scope.omitPsalm145On.includes("ALL_SOULS_2_NOVEMBER"));
assert.ok(registry.scope.omitPsalm145On.includes("DAY_OF_DEATH_OR_BURIAL"));
assert.ok(registry.scope.notEquivalentTo.includes("REQUIEM_MASS"));
assert.equal(proper.sourceCommit,commit);
assert.equal(psalms.sourceCommit,commit);
assert.equal(registry.source.commit,commit);
assert.equal(proper.sourceLicense,"MIT");
assert.equal(psalms.sourceLicense,"MIT");
assert.equal(registry.source.historicalPrintCertificate,false);
assert.equal(registry.source.onlineRuntimeDependencyPermitted,false);
assert.equal(proper.entryStatus,"RESEARCH_STAGED_NOT_PUBLIC_READER");
assert.equal(psalms.status,"RESEARCH_ONLY_NOT_COMPLETE_VESPERS");
const rights=readFileSync(resolve(root,registry.source.licenseFile),"utf8");
assert.match(rights,/MIT License/);
assert.match(rights,/Copyright \(c\) 2026 Divinum Officium/);
assert.equal(proper.files.length,6);
assert.equal(psalms.files.length,18);
assert.equal(new Set(proper.files.map(x=>x.locale+":"+x.leaf)).size,6);
assert.equal(new Set(psalms.files.map(x=>x.locale+":"+x.psalm)).size,18);
for(const locale of locales){
 for(const leaf of ["C9","11-02"]){
  const f=proper.files.find(x=>x.locale===locale&&x.leaf===leaf);
  assert.ok(f,locale+leaf);
  assert.ok(f.repositoryPath.includes("/"+(locale==="la"?"Latin":locale==="en"?"English":"Francais")+"/"),"Wrong source locale");
  assert.equal(gitSha(f.raw),f.blobSha,"Unpinned Git byte witness "+locale+":"+leaf);
  assert.ok(f.raw.length>5000);
  if(leaf==="C9"){
   for(const marker of ["[Ant Vespera]","[Ant Matutinum]","[Ant Laudes_]","[Lectio9]","[Responsory9]","[Oratio_Fid]"])assert.ok(f.raw.includes(marker),locale+": "+marker);
   for(const n of assigned)assert.ok(f.raw.includes(";;"+n+"\n"),locale+" missing Vespers antiphon/psalm "+n);
   assert.ok(!f.raw.includes("[PUBLIC_RELEASE_APPROVED]"));
  }else{
   for(const marker of ["[Lectio4]","[Lectio9]","[Special Completorium]"])assert.ok(f.raw.includes(marker),locale+": "+marker);
  }
 }
 for(const n of [...assigned,conditional]){
  const f=psalms.files.find(x=>x.locale===locale&&x.psalm===n);
  assert.ok(f,locale+": Psalm "+n);
  assert.equal(gitSha(f.raw),f.blobSha,"Unpinned Psalm git source "+locale+":"+n);
  assert.ok(f.repositoryPath.endsWith("/Psalm"+n+".txt"));
  assert.ok(f.raw.startsWith(n+":")&&f.raw.includes("*"),"Psalm text wrong or missing: "+locale+":"+n);
 }
}
assert.equal(registry.files.properLeafCount,proper.files.length);
assert.equal(registry.files.psalmLeafCount,psalms.files.length);
// The new corpus is deliberately research-only, never a ninth-door duplicate or a false completed Office.
const doors=readFileSync(resolve(root,"src/pray/prayer-design-pilot.js"),"utf8");
assert.ok(!doors.includes('"pray.office_dead"'));
assert.ok(!doors.includes('"pray.office_of_dead"'));
const ultra=read("data/pray/prayer-ultra-master-97-source-owner-reconciliation-20261105.v1.json");
assert.equal(ultra.records.length,97);
const p0=ultra.records.find(x=>x.acquisitionId==="AO-AQ-055");
assert.ok(p0&&p0.b31Disposition==="ROUTED_OTHER_MODULE");
assert.equal(p0.sourceAcquisition20261105.sourceRegistry,"data/research/office-dead-1960/acquisition-registry.v1.json");
assert.equal(p0.sourceAcquisition20261105.original1857RaccoltaTextCollated,false);
assert.equal(p0.sourceAcquisition20261105.original1961BreviaryPhotoCollated,false);
assert.equal(p0.sourceAcquisition20261105.newRouteReleased,false);
assert.equal(ultra.subsequentOfficeDeadAcquisition20261105.all97AcquisitionIdsRetained,true);
assert.equal(ultra.subsequentOfficeDeadAcquisition20261105.newPublicRoutes,0);
assert.equal(ultra.subsequentOfficeDeadAcquisition20261105.printCertificates,0);
const ghPages=readFileSync(resolve(root,".github/workflows/github-pages.yml"),"utf8");
assert.ok(ghPages.includes("'!data/research/**'"),"Research-only source files must be excluded from GitHub Pages publishing triggers");

const supplement=read("data/research/office-dead-1960/vespers-supplemental-source-leaves.v1.json");
assert.equal(supplement.schema,"ao.office-dead.1960-vespers-supplemental-sources.v1");
assert.equal(supplement.sourceCommit,commit);
assert.equal(supplement.entryStatus,"RESEARCH_NOT_PUBLIC_READER");
assert.equal(supplement.files.length,6);
assert.equal(registry.files.supplementalLeafCount,6);
assert.equal(registry.files.supplementalBundle,"data/research/office-dead-1960/vespers-supplemental-source-leaves.v1.json");
assert.equal(registry.progress.votiveVespersSourceModelAssembled,1);
assert.equal(registry.progress.votiveVespersSourceModelStageCount,11);
assert.equal(registry.progress.completeVespersAssembled,0,"Model is not a published/independently verified complete hour");
assert.equal(registry.vespersModel20261105.publicMobileReaderReleased,false);
assert.equal(registry.vespersModel20261105.allSoulsNovember2ProperCertified,false);
assert.equal(registry.scope.psalm145In1960.includes("Omitted"),true);
assert.ok(registry.scope.omitPsalm145On.includes("VOTIVE_1960_GENERAL_DEPARTED"));
for(const locale of locales){
 for(const part of ["MAGNIFICAT","ORDINARY"]){
  const f=supplement.files.find(x=>x.locale===locale&&x.part===part);
  assert.ok(f,"Missing "+locale+" "+part);
  assert.equal(gitSha(f.raw),f.blobSha,"Supplement source Git SHA mismatch "+locale+" "+part);
  if(part==="MAGNIFICAT"){
   assert.match(f.repositoryPath,/Psalterium\/Psalmorum\/Psalm232\.txt$/);
   assert.ok(f.raw.includes("1:46")&&f.raw.includes("1:55"));
  }else{
   assert.match(f.repositoryPath,/Psalterium\/Common\/Prayers\.txt$/);
   for(const k of ["[Requiem]","[Aportainferi]","[Pater noster Et]","[Oremus]","[Qui vivis]"])
    assert.ok(f.raw.includes(k),locale+" "+k);
  }
 }
}

console.log("Office of Dead P0 source PASS: six language-specific C9 / 11-02 source leaves, 18 Vespers psalm leaves, git blob SHA parity, MIT license; zero complete or public Offices.");
