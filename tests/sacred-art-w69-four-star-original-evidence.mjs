import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const root=new URL("../data/calendar/",import.meta.url);
const a=JSON.parse(readFileSync(new URL("sacred-art-w69-existing-four-star-physical-object-evidence-20261015.v1.json",root),"utf8"));
const w49=JSON.parse(readFileSync(new URL("sacred-art-w49-post-w48-ratings-and-gaps-20261014.v1.json",root),"utf8"));
let checks=0;const test=(x,m)=>{assert.ok(x,m);checks++;};
test(a.schema==="AO_SACRED_ART_W69_FOUR_EXISTING_4STAR_OBJECT_EVIDENCE_V1","source schema");
test(a.records.length===4&&new Set(a.records.map(x=>x.candidateId)).size===4,"exact four previously rated IDs");
const bySubject=new Map(w49.subjects.map(x=>[x.subjectId,x]));
for(const row of a.records){const w=bySubject.get(row.subjectId);test(Boolean(w&&w.awaiting4.some(x=>x.candidateId===row.candidateId)),row.candidateId+" W49 pending");
test(row.previousHumanRating===4,row.candidateId+" rating preserved");test(row.reviewReuse===false && row.reviewedPhotographMatchesExactPhysicalObject===false,row.candidateId+" no release");}
test(a.records.filter(x=>x.originalPainting.exactMuseumInventoryNumberConfirmed).length===2,"two museum accessions");
test(a.records.find(x=>x.originalPainting.accession==="M.P.2004.17.34")?.originalPainting.artist.includes("attributed"),"Allori attributed not certified autograph");
test(a.records.every(x=>x.viewedFile.startsWith("https://commons.wikimedia.org/wiki/File:")),"original source page");
test(a.globalConstraints.noPermissionRequests&&a.globalConstraints.noPaidLicenses&&a.globalConstraints.scoresUnchanged,"global guards");
console.log("W69 source-original evidence checks: "+checks+"/"+checks+" passed");
