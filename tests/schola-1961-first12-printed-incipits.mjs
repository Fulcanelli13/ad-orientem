import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {FIRST12_1961_FACSIMILES}
 from "../src/mass/reader-proper-first12-1961-facsimile-locators.js";
const root=new URL("../",import.meta.url);
const read=(path)=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
const observed=read("data/research/schola-first12-1961-original-printed-incipits-20261104.v1.json");
const batches=Array.from({length:6},(_,i)=>read(
 "data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json"));
const original=new Map(batches.flatMap(b=>b.items).map(s=>[s.id,s]));
const pinned=new Map(FIRST12_1961_FACSIMILES.map(x=>[x.scoreId,x]));
const normalize=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/[^a-z ]/gi," ").replace(/\s+/g," ").trim().toLowerCase();
assert.equal(observed.schema,"ao-schola-1961-first12-original-printed-incipit-observations-v1");
assert.equal(observed.scores.length,12);
assert.equal(observed.counts.independentVisibleIncipits,12);
assert.equal(observed.counts.fullyNoteCompared,0);
assert.equal(observed.counts.editoriallyApproved,0);
assert.equal(observed.counts.publicScores,0);
assert.deepEqual(observed.scores.map(x=>x.scoreId),
 FIRST12_1961_FACSIMILES.map(x=>x.scoreId));
for(const x of observed.scores){
 const loc=pinned.get(x.scoreId),src=original.get(x.scoreId);
 assert.ok(loc&&src,"Visual record lacks original archived score");
 assert.equal(x.part,src.officePart);
 assert.equal(x.folio,src.gradualeRomanum1961Page);
 assert.equal(x.originalPrintPageUrl,loc.scanned1961PageUrl);
 assert.equal(x.independentlyVisuallyObservedIncipit,true);
 assert.equal(x.printedIncipitEqualsSourceGabcOpening,true);
 const sourceOpening=normalize(src.incipit.split("(")[0]);
 const printedOpening=normalize(x.printedIncipit);
 assert.ok(sourceOpening.length>3&&printedOpening.startsWith(sourceOpening),
   "Visual printed incipit does not match original GABC opening: "+x.scoreId);
 assert.match(x.status,/FULL_MUSIC_COMPARISON_PENDING/);
 for(const k of ["printedPitchParityVerified","printedNeumeParityVerified",
   "printedRhythmicSignParityVerified","printedSyllabicUnderlayVerified",
   "originalScanSystemBySystemCollated","editorialApproval","publicScore"])
  assert.equal(x[k],false,k+" cannot be certified by visually seeing an incipit");
}
assert.equal(observed.publication.publicScoreCount,0);
assert.equal(observed.publication.automaticallyApproved,false);
console.log("PASS 12 original-print incipits visually located on their 1961 folios, GABC source identity preserved; 633 notes still require manual comparison");
