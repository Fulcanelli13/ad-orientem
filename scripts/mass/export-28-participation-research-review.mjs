// Standalone consolidated editorial export; the existing 24-row export
// remains unchanged and independently regression-tested.
import {createHash} from "node:crypto";
import {writeFile,mkdir} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
import {PARTICIPATION_SCORE_REVIEW_HEADERS,buildParticipationScoreReviewCsv}
 from "./export-24-participation-review-csv.mjs";
import {buildParticipation28ResearchReview}
 from "../../src/mass/reader-participation-28-research-inventory.js";
export const PARTICIPATION_REVIEW_28_EXPORT_SCHEMA="ao-28-gregorian-participation-editorial-export-v1";
const sha=text=>createHash("sha256").update(text,"utf8").digest("hex");
const csvCell=value=>{
 const raw=String(value??"").replaceAll("\r"," ").replaceAll("\n"," ");
 const safe=/^[=+\-@\t]/.test(raw)?"'"+raw:raw;
 return '"'+safe.replaceAll('"','""')+'"';
};
export function build28ResearchReviewCsv(){
 const review=buildParticipation28ResearchReview();
 const baseline=buildParticipationScoreReviewCsv().trimEnd().split("\n");
 if(baseline.length!==25||review.rows.length!==28||
    baseline[0]!==PARTICIPATION_SCORE_REVIEW_HEADERS.map(csvCell).join(","))
  throw Error("CANONICAL_24_CSV_BASELINE_CHANGED");
 const append=review.rows.filter(x=>x.researchCatalogue==="SOLEMNIOR_FOUR_SOURCE_ONLY");
 if(append.length!==4)throw Error("MISSING_ALL_FOUR_1961_SOLEMNIOR_CUES");
 const after=append.map(r=>{
  const map={
   event_id:r.eventId,cue_ids:r.cueIds.join(" | "),score_id:r.id,
   source_id:r.sourceId,source_name:r.sourceName,source_folio:r.sourceFolio,
   source_url:r.sourceUrl,
   printed_1961_plate_urls:r.originalPrintedWitnesses.map(x=>x.url).join(" | "),
   printed_1961_plate_pages:r.originalPrintedWitnesses.map(x=>x.book+" p. "+x.page).join(" | "),
   printed_source_note_parity:"UNVERIFIED",
   printed_preface_phrase_location:r.printedPosition,
   tone_family:r.toneFamily,
   formula:"ORIGINAL_GABC_SOURCE_PHRASE_INDEX_"+r.sourcePhraseIndex,
   latin:r.sourceLatin,
   gabc_sha256:sha(r.gabc),
   gabc_body:r.gabc.slice(r.gabc.indexOf("%%")+2).trim(),
   current_print_note_verification:"PENDING_INDEPENDENT_NOTE_BY_NOTE_REVIEW",
   context_review:"NO_1962_MASS_CONTEXT_OR_PARISH_TONE_SELECTION",
   public_score_approved:false,
   editorial_action:"Independently collate 1961 Tonus solemnior printed neumes and assign only to proven ritual context",
   reviewer_source_match:"SOURCE_GABC_EXACT_ONLY",
   reviewer_neume_match:"UNREVIEWED",
   reviewer_rite_scope:"UNREVIEWED",
   reviewer_decision:"DO_NOT_PUBLISH",
   reviewer_comments:"Source record #4451 · third Preface tone kept research-only"
  };
  return PARTICIPATION_SCORE_REVIEW_HEADERS.map(k=>csvCell(map[k])).join(",");
 });
 const combined=[...baseline,...after];
 if(combined.length!==29||new Set(review.rows.map(r=>r.id)).size!==28)
  throw Error("RESEARCH_28_EXPORT_ROWS_CHANGED");
 return combined.join("\n")+"\n";
}
export function build28ResearchReviewManifest(){
 const review=buildParticipation28ResearchReview();
 return {
  schema:PARTICIPATION_REVIEW_28_EXPORT_SCHEMA,
  scope:"RESEARCH_ONLY_24_FIXED_PLUS_4_SOLEMNIOR",
  counts:review.counts,
  approvalBoundary:"Source GABC matching is not printed-neume verification, 1962 ritual-context attribution, user musical approval or public release.",
  rows:review.rows.map(r=>({
   scoreId:r.id,eventId:r.eventId,cueIds:r.cueIds,sourceId:r.sourceId,
   sourceName:r.sourceName,sourceUrl:r.sourceUrl,sourceFolio:r.sourceFolio,
   sourcePhraseIndex:r.sourcePhraseIndex,printedWitnesses:r.originalPrintedWitnesses,
   printedPosition:r.printedPosition,sourceGabcSha256:sha(r.gabc),
   toneFamily:r.toneFamily,researchCatalogue:r.researchCatalogue,
   printedNoteParity:r.printedNoteParity,
   contextCertified:false,publicScoreApproved:false,
   reviewerDecision:"DO_NOT_PUBLISH"
  }))
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const base=new URL("../../.tmp/mass-participation-28-review/",import.meta.url);
 const folder=fileURLToPath(base);await mkdir(folder,{recursive:true});
 const csv=build28ResearchReviewCsv();
 const master=build28ResearchReviewManifest();
 await writeFile(new URL("consolidated-28-research.csv",base),csv,"utf8");
 await writeFile(new URL("consolidated-28-research.json",base),JSON.stringify(master,null,2)+"\n","utf8");
 console.log("PASS 28-score consolidated reviewer CSV and JSON; 24 fixed + 4 Tonus solemnior, 0 new public approvals",folder);
}
