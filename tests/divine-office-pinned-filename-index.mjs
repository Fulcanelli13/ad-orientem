import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
 validateOfficePinnedFilenameIndex,createOfficePinnedFilenameLookup
} from "../src/office/pinned-filename-index.js";

const original=JSON.parse(readFileSync(new URL(
 "../data/office/source-index/roman-1960-pinned-latin-filenames.json",
 import.meta.url),"utf8"));
test("one pinned GitHub directory metadata inventory contains 1185 filenames only",()=>{
 const s=validateOfficePinnedFilenameIndex(original);
 assert.equal(s.size,1185);
 assert.equal(s.sourceRevision,DIVINUM_OFFICIUM_PIN);
 assert.deepEqual(original.counts,{Tempora:638,Sancti:486,Commune:61});
 assert.equal(original.metadataOnly,true);
 assert.equal(original.sourceTextDownloadedOrBundled,false);
 assert.equal(original.published,false);
 assert.ok(!("officeTexts" in original));
});
test("directory listing presence never becomes a 1960 Office assignment",()=>{
 const l=createOfficePinnedFilenameLookup(original);
 for(const path of ["Tempora/Adv1-0","Tempora/Adv4-0",
  "Sancti/11-01","Sancti/11-02","Sancti/11-29","Commune/C9"]){
  const r=l.lookup(path);
  assert.equal(r.filenameStatus,"PINNED_LATIN_FILENAME_LISTED");
  assert.equal(r.officeAppointed,false);
  assert.equal(r.rankVerified,false);
  assert.equal(r.translationsVerified,false);
  assert.equal(r.publishable,false);
 }
 const absent=l.lookup("Sancti/12-01");
 assert.equal(absent.filenameStatus,"EXACT_LATIN_FILENAME_NOT_LISTED");
 assert.equal(absent.officeAppointed,false);
});
test("all 2026 candidate keys are checked against pinned filenames without file reads",()=>{
 const l=createOfficePinnedFilenameLookup(original);
 const result=l.analyzeYear(2026);
 assert.equal(result.totalDirectoryFilenames,1185);
 assert.equal(result.candidatePaths,391);
 assert.equal(result.exactFilenamesListed,311);
 assert.equal(result.exactFilenamesNotListed,80);
 assert.equal(result.actualOfficeTextsParsed,0);
 assert.equal(result.independentlyAppointedOffices,0);
 assert.equal(result.publishedOffices,0);
 assert.equal(result.dates.length,365);
 const advent=result.dates.find(d=>d.date==="2026-11-29");
 assert.deepEqual(advent.keys.map(k=>k.path),
  ["Sancti/11-29","Tempora/Adv1-0"]);
 assert.ok(advent.keys.every(k=>k.filenameStatus==="PINNED_LATIN_FILENAME_LISTED"));
});
test("2028 leap year and movable Advent are indexed with true filename status",()=>{
 const result=createOfficePinnedFilenameLookup(original).analyzeYear(2028);
 assert.equal(result.candidatePaths,388);
 assert.equal(result.exactFilenamesListed,307);
 assert.equal(result.exactFilenamesNotListed,81);
 assert.equal(result.dates.length,366);
 const leap=result.dates.find(d=>d.date==="2028-02-29");
 assert.equal(leap.keys[0].filenameStatus,"EXACT_LATIN_FILENAME_NOT_LISTED");
 const advent=result.dates.find(d=>d.date==="2028-12-03");
 assert.equal(advent.keys[1].path,"Tempora/Adv1-0");
});
test("unverified source revision, missing filenames and forged certification are rejected",()=>{
 for(const change of [
  {sourceRevision:"0".repeat(40)},{published:true},
  {sourceTextDownloadedOrBundled:true},{rubricalVariantSelectionCertified:true},
  {metadataOnly:false}
 ]){
  assert.throws(()=>validateOfficePinnedFilenameIndex({...original,...change}),
   /OFFICE_PINNED_FILENAME_INDEX_PROVENANCE_INVALID/);
 }
 const corrupted=structuredClone(original);
 corrupted.paths.Sancti.pop();
 assert.throws(()=>validateOfficePinnedFilenameIndex(corrupted),
  /OFFICE_PINNED_FILENAME_INDEX_COUNT_INVALID/);
 const injected=structuredClone(original);
 injected.paths.Commune[0]="../../bad";
 assert.throws(()=>validateOfficePinnedFilenameIndex(injected),
  /OFFICE_PINNED_FILENAME_INDEX_PATH_INVALID/);
});
