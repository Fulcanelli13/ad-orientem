// Machine-readable eight-phrase editorial handoff, not an approval registry.
import {writeFile,mkdir} from "node:fs/promises";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {PREFACE_1961_PRINTED_PASSAGES,PREFACE_PRINTED_PASSAGE_SCHEMA,
 comparePrefaceToneFormulae} from "../../src/mass/reader-preface-1961-print-passage.js";
export function prefaceEightPrintedComparisonReport(){
 const pairs=comparePrefaceToneFormulae();
 if(PREFACE_1961_PRINTED_PASSAGES.length!==8||pairs.length!==4)
  throw Error("PREFACE_1961_8_SCORE_BIDOCUMENT_REPORT_INCOMPLETE");
 return {
  schema:"ao-preface-1961-eight-printed-passage-editorial-report-v1",
  generatedFrom:PREFACE_PRINTED_PASSAGE_SCHEMA,
  printedEdition:["Liber Usualis (Solesmes 1961) p.109",
                  "Graduale Romanum (Solesmes 1961) pp.130*–131*"],
  counts:{phrases:8,sourceBooks:2,distinctPrintedPages:3,
   sourceGabcExact:8,printedPhraseLocationsFound:8,
   independentlyCertifiedPrintedNeumes:0,newPublicApprovals:0},
  evidenceLimit:"Section headings, exact phrase position and 1961 source plate IDs are located; direct note-by-note comparison of all staff marks remains pending independent review.",
  tonePairs:pairs,
  rows:PREFACE_1961_PRINTED_PASSAGES.map(row=>({
   ...row,printedSourceLocationStatus:"TWO_1961_WITNESSES_PHRASE_LOCATED",
   editorialStatus:"PRINTED_NOTE_AND_SOLESMES_RHYTHMIC_MARKS_PENDING",
   approvedPublicly:false
  }))
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const report=prefaceEightPrintedComparisonReport();
 const path=fileURLToPath(new URL("../../.tmp/mass-participation-24-review/preface-eight-1961-print-locations.json",import.meta.url));
 await mkdir(dirname(path),{recursive:true});
 await writeFile(path,JSON.stringify(report,null,2)+"\n","utf8");
 console.log("PASS 8 Preface printed phrase locations; two 1961 books, three physical pages, 0 new notation approvals",path);
}
