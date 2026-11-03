// Deterministic first batch of 60 ACTUAL calendar-anchored Proper scores.
// Uses the existing 2026 + 1049-source CI research artifacts and the six
// original, unmodified GABC batches. Never publishes a score.
import {readFile,writeFile} from "node:fs/promises";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {index1961GradualeGabc}
 from "../../src/mass/reader-proper-gabc-bulk-join.js";
import {build2026ProperFirst60ScoreReview}
 from "../../src/mass/reader-proper-first60-print-review.js";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const read=async path=>JSON.parse(await readFile(join(root,path),"utf8"));
const inputs=".tmp/schola-1962-selected-annual/";
const annual=await read(inputs+"2026-selected-gabc-coverage.json");
const crosswalk=await read(inputs+"2026-selected-full1049-inline-crosswalk.json");
const batches=await Promise.all(Array.from({length:6},(_,i)=>read(
 "data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json")));
const archive=index1961GradualeGabc(batches);
const report=build2026ProperFirst60ScoreReview({
 annualReport:annual,fullSourceCrosswalk:crosswalk,archive});
if(report.batch.candidates!==60||report.batch.distinctScoreIds!==60||
 report.publication.publicScores!==0||report.candidates.some(x=>
 x.publication!=="EDITORIAL_HOLD_NOT_PUBLIC"||
 x.approvedForMassReader!==false||
 Object.values(x.review).some(v=>v!==false)))
 throw Error("FIRST_60_CANDIDATE_PUBLICATION_GATE_FAILED");
const directory=join(root,inputs);
await writeFile(join(directory,"2026-selected-proper-first60-print-review.json"),
 JSON.stringify(report,null,2)+"\n");
await writeFile(join(directory,"2026-selected-proper-first60-summary.json"),
 JSON.stringify({schema:report.schema,batch:report.batch,
  publication:report.publication,scoreReviewIds:report.candidates.map(c=>c.scoreId),
  note:"Source-screened release candidate only. Requires independent original print comparison AND user final approval."},null,2)+"\n");
console.log("FIRST_60_ACTUAL_2026_PROPER_PRINT_REVIEW "+
 JSON.stringify({batch:report.batch,published:report.publication.publicScores}));
