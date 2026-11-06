// Owner/reviewer handoff: one CSV row for EACH fixed 1961 sung Mass
// participation excerpt. No mutation of canonical scores or score approval.
// To export: node scripts/mass/export-24-participation-review-csv.mjs
import {createHash} from "node:crypto";
import {writeFile,mkdir} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
import {PARTICIPATION_REFERENCE_SCORES} from "../../src/mass/reader-participation-reference-scores.js";
import {printedPlatesForParticipationScore} from "../../src/mass/reader-participation-printed-plates.js";
import {printedPassageForPrefaceScore} from "../../src/mass/reader-preface-1961-print-passage.js";
import {buildParticipationCoverage} from "../../src/mass/reader-participation-coverage.js";

export const PARTICIPATION_SCORE_REVIEW_CSV_SCHEMA="ao-1961-participation-24-score-review-v1";
export const PARTICIPATION_SCORE_REVIEW_HEADERS=Object.freeze([
 "event_id","cue_ids","score_id","source_id","source_name","source_folio",
 "source_url","printed_1961_plate_urls","printed_1961_plate_pages","printed_source_note_parity",
 "printed_preface_phrase_location",
 "tone_family","formula","latin","gabc_sha256","gabc_body",
 "current_print_note_verification","context_review","public_score_approved",
 "editorial_action","reviewer_source_match","reviewer_neume_match",
 "reviewer_rite_scope","reviewer_decision","reviewer_comments"
]);
const toCsv=value=>{
 const raw=String(value??"").replaceAll("\r"," ").replaceAll("\n"," ");
 // Prevent spreadsheet formula evaluation for research-source strings.
 const safe=/^[=+\-@\t]/.test(raw)?"'"+raw:raw;
 return '"'+safe.replaceAll('"','""')+'"';
};
export function buildParticipationScoreReviewCsv(){
 const scores=PARTICIPATION_REFERENCE_SCORES,coverage=buildParticipationCoverage();
 if(scores.length!==24||coverage.counts.fixedResearchExcerpts!==24||
    coverage.counts.exactPublicFragments!==2)
  throw Error("PARTICIPATION_1961_REVIEW_COUNTS_CHANGED");
 const events=coverage.events.filter(e=>e.fixedResearchIds.length>0);
 if(events.length!==15)throw Error("EXPECTED_15_FIXED_SOURCE_EVENT_FAMILIES");
 const byScore=new Map(scores.map(s=>[s.id,s]));
 if(byScore.size!==24)throw Error("DUPLICATE_SOURCE_SCORE");
 const rows=[];
 for(const event of events){
  for(const id of event.fixedResearchIds){
   const s=byScore.get(id);
   if(!s||s.publicScoreApproved!==false||!s.gabc?.includes("%%")||
      !s.sourceUrl?.startsWith("https://gregobase.selapa.net/chant.php?id="))
    throw Error("NON_REVIEW_ONLY_OR_UNSOURCED_GABC_"+id);
   const witness=printedPlatesForParticipationScore(s.sourceId);
   const exactPreface=printedPassageForPrefaceScore(s.id);
   const printedPages=exactPreface?.printWitnesses??witness?.plates;
   if(!witness||witness.sourceNoteByNoteParity!=="UNVERIFIED"||
      witness.publicScoreApproved!==false||witness.plates.length<1)
    throw Error("PRINTED_FACSIMILE_OR_REVIEW_GATE_MISSING_"+s.sourceId);
   const body=s.gabc.slice(s.gabc.indexOf("%%")+2).trim();
   const digest=createHash("sha256").update(s.gabc,"utf8").digest("hex");
   rows.push([
    event.id,s.sourceCueIds.join(" | "),s.id,s.sourceId,
    s.sourceName,s.sourceFolio,s.sourceUrl,
    printedPages.map(p=>p.url).join(" | "),
    printedPages.map(p=>p.book+" p. "+p.page).join(" | "),
    witness.sourceNoteByNoteParity,
    exactPreface?exactPreface.sectionTitle+" — "+exactPreface.position:"",
    s.toneFamily??s.settingId??"",s.formula??"",s.sourceLatin,
    digest,body,s.printVerification??"PENDING_NOTE_BY_NOTE_FACSIMILE_COLLATION",
    "PRINTED_EXCERPT__SELECTED_MASS_VARIANT_NOT_INFERRED",false,
    event.reviewAction,"UNREVIEWED","UNREVIEWED","UNREVIEWED",
    "DO_NOT_PUBLISH",""
   ]);
  }
 }
 if(rows.length!==24||new Set(rows.map(r=>r[2])).size!==24)
  throw Error("MISSING_OR_DUPLICATED_1961_REVIEW_EXCERPT");
 return PARTICIPATION_SCORE_REVIEW_HEADERS.map(toCsv).join(",")+"\n"+
  rows.map(row=>row.map(toCsv).join(",")).join("\n")+"\n";
}
const invoked=process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1];
if(invoked){
 const out=fileURLToPath(new URL("../../.tmp/mass-participation-24-review/score-review.csv",import.meta.url));
 await mkdir(dirname(out),{recursive:true});
 await writeFile(out,buildParticipationScoreReviewCsv(),"utf8");
 console.log("CSV_REVIEW_EXPORTED 24 rows, 15 event families; all scores remain unapproved",out);
}
