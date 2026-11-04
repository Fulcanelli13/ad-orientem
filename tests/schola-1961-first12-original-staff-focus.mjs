import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {existsSync,readFileSync} from "node:fs";
import {FIRST12_1961_FACSIMILES} from "../src/mass/reader-proper-first12-1961-facsimile-locators.js";
import {FIRST12_1961_PRINTED_STAFF_FOCI,first12PrintedStaffFocus,
 PRINTED_1961_FIRST12_STAFF_FOCUS_SCHEMA}
 from "../src/mass/reader-proper-first12-1961-staff-focus.js";
import {sourceNoteGroupInventory}
 from "../src/mass/reader-kyriale-source-note-groups.js";

const requireImages=process.argv.includes("--require-images");
const base=new URL("../",import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,base),"utf8"));
const candidates=Array.from({length:6},(_,i)=>
 read("data/mass/chant-corpus/gr1961-proper-"+
  String(i+1).padStart(3,"0")+".json")).flatMap(x=>x.items);
const sourceById=new Map(candidates.map(x=>[x.id,x]));
const originalById=new Map(FIRST12_1961_FACSIMILES.map(x=>[x.scoreId,x]));
assert.equal(PRINTED_1961_FIRST12_STAFF_FOCUS_SCHEMA,
 "ao-schola-first12-1961-first-staff-facsimile-focus-v1");
assert.equal(FIRST12_1961_PRINTED_STAFF_FOCI.length,12);
assert.equal(new Set(FIRST12_1961_PRINTED_STAFF_FOCI.map(x=>x.scoreId)).size,12);
assert.deepEqual(new Set(FIRST12_1961_PRINTED_STAFF_FOCI.map(x=>x.scoreId)),
 new Set(FIRST12_1961_FACSIMILES.map(x=>x.scoreId)));
let groups=0,verifiedBytes=0;
const boundingByImage=new Map();
for(const row of FIRST12_1961_PRINTED_STAFF_FOCI){
 const loc=originalById.get(row.scoreId),chant=sourceById.get(row.scoreId);
 assert.ok(loc&&chant,"Original source ID is missing: "+row.scoreId);
 assert.equal(row.originalFolio,loc.folio);
 assert.equal(row.originalImageUrl,loc.scanned1961PageUrl);
 assert.equal(row.originalScoreSourceUrl,loc.sourceUrl);
 assert.equal(row.continuationFolio,loc.scannedFolios[1]?.folio??null);
 assert.equal(row.originalImageWidth,480);
 assert.match(row.originalImageSha256,/^[a-f0-9]{64}$/);
 const box=row.firstStaffBoundingBox;
 assert.ok([box.xMin,box.yMin,box.xMax,box.yMax].every(Number.isInteger));
 assert.ok(box.xMin>=0&&box.xMax<=row.originalImageWidth&&
  box.yMin>=0&&box.yMax<=row.originalImageHeight&&
  box.xMin<box.xMax&&box.yMin<box.yMax);
 assert.equal(first12PrintedStaffFocus(row.scoreId),row);
 assert.equal(chant.sourceEditionId,2);
 assert.equal(chant.gradualeRomanum1961Page,row.originalFolio);
 assert.equal(chant.sourceUrl,row.originalScoreSourceUrl);
 assert.equal(chant.releaseStatus,"RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED");
 assert.equal(createHash("sha256").update(chant.gabc).digest("hex"),chant.sha256);
 const noteInventory=sourceNoteGroupInventory("name: "+chant.id+";\n%%\n"+chant.gabc);
 groups+=noteInventory.noteBearingSourceTokens;
 assert.ok(row.visiblePrintedOpening.length>=12);
 for(const field of ["pitchParityCertified","neumeParityCertified",
  "rhythmParityCertified","syllableUnderlayCertified","allSystemsCollated",
  "scoreApproved","publicScore"])assert.equal(row[field],false,
   field+" improperly promoted original 1961 staff to approved notation");
 assert.equal(row.observation,"PRINTED_STAFF_LOCATED_NOT_NOTE_FOR_NOTE_VERIFIED");
 const img=loc.scannedFolios[0],path=".tmp/schola-1961-first12-original-facsimiles/"+
  "graduale-romanum-1961-original-p"+img.folio+"-source2-"+img.imageNumber+".png";
 const url=new URL(path,base);
 if(existsSync(url)){
  const bytes=readFileSync(url);
  assert.equal(createHash("sha256").update(bytes).digest("hex"),
   row.originalImageSha256,"Original folio image SHA changed: "+row.scoreId);
  assert.equal(bytes.readUInt32BE(16),row.originalImageWidth);
  assert.equal(bytes.readUInt32BE(20),row.originalImageHeight);
  verifiedBytes++;
 }else if(requireImages)throw Error("ORIGINAL_PRINTED_PNG_MISSING_"+row.scoreId);
 let others=boundingByImage.get(img.imageNumber)??[];
 others.push(row);boundingByImage.set(img.imageNumber,others);
}
// Two different chants share folio 59 and two share folio 362.
// Their first-staff focus bounds must not overlap or present the wrong chant.
for(const rows of boundingByImage.values())for(let i=0;i<rows.length;i++)
 for(let j=i+1;j<rows.length;j++){
  const a=rows[i].firstStaffBoundingBox,b=rows[j].firstStaffBoundingBox;
  assert.ok(a.yMax<=b.yMin||b.yMax<=a.yMin,
   "Original printed first-staff loci overlap unrelated chants");
 }
assert.equal(groups,633,"All 633 original GABC groups must remain held");
assert.equal(FIRST12_1961_PRINTED_STAFF_FOCI.filter(x=>x.continuationFolio).length,4);
if(requireImages)assert.equal(verifiedBytes,12);
console.log("PASS first12 original 1961 printed-staff loci and scan SHA identities: "+
 "12 scores, "+groups+" GABC groups held, "+verifiedBytes+
 "/12 source-image SHA witnesses checked; zero musical approvals");
