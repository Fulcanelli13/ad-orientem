// Independent collation handoff only; GABC-source equality does not certify print.
import {writeFile,mkdir} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {PARTICIPATION_REFERENCE_SCORES} from "../../src/mass/reader-participation-reference-scores.js";
import {PREFACE_SOLEMNIOR_RESEARCH_SCORES} from "../../src/mass/reader-preface-solemnior-reference-scores.js";
import {printedPassageForPrefaceScore} from "../../src/mass/reader-preface-1961-print-passage.js";

export const PREFACE_PRINT_NEUME_WORKLIST_SCHEMA="ao-preface-1961-12-response-independent-print-worklist-v1";
const families=Object.freeze([
 ["SOLEMN",4449],["FERIAL",4450],["SOLEMNIOR",4451]
]);
const cues=["AO.SM.C0136","AO.SM.C0138","AO.SM.C0140","AO.SM.C0143"];
const csvCell=x=>'"'+String(x??"").replaceAll('"','""').replaceAll("\n"," ")+'"';
const syllables=gabc=>{
 const body=gabc.slice(gabc.indexOf("%%")+2);
 const matches=[...body.matchAll(/([^\s()]+)\(([^()]*)\)/gu)]
  .map(m=>({printedSyllable:m[1],gabcNoteGroup:m[2]}));
 if(matches.length<2||matches.some(x=>!x.gabcNoteGroup||x.gabcNoteGroup==="::"))
  throw Error("PREFACE_NOTATION_SYLLABLE_PARSING_FAILED");
 return matches;
};
export function buildPreface12PrintWorklist(){
 const scores=[...PARTICIPATION_REFERENCE_SCORES.filter(s=>[4449,4450].includes(s.sourceId)),
  ...PREFACE_SOLEMNIOR_RESEARCH_SCORES];
 if(scores.length!==12)throw Error("EXPECTED_12_PREFACE_SOURCE_EXCERPTS");
 const rows=[];
 for(const [family,sourceId] of families){
  for(const cueId of cues){
   const score=scores.find(s=>s.sourceId===sourceId&&s.sourceCueIds.length===1&&s.sourceCueIds[0]===cueId);
   if(!score||score.publicScoreApproved!==false||!score.gabc?.includes("%%"))
    throw Error("PREFACE_SOURCE_IDENTITY_OR_PUBLIC_GATE_CHANGED_"+sourceId+"_"+cueId);
   const location=sourceId===4451?null:printedPassageForPrefaceScore(score.id);
   const witnesses=sourceId===4451?score.printWitnesses:location?.printWitnesses;
   if(!witnesses||witnesses.length!==2)throw Error("TWO_PRINTED_WITNESSES_REQUIRED_"+score.id);
   const groups=syllables(score.gabc);
   rows.push({scoreId:score.id,family,sourceId,sourceUrl:score.sourceUrl,
    cueId,sourceLatin:score.sourceLatin,sourcePhraseIndex:score.sourcePhraseIndex,
    originalGabcPhrase:score.gabc.slice(score.gabc.indexOf("%%")+2).trim(),
    sourceSyllableNoteGroups:groups,sourceSyllableGroups:groups.length,
    printedSection:sourceId===4451?"3. Tonus solemnior":location.sectionTitle,
    printedPosition:sourceId===4451?"response phrase "+score.sourcePhraseIndex:location.position,
    printWitnesses:witnesses.map(w=>({book:w.book,page:w.page,url:w.url,
     staffLocated:true,printedSyllablesIndependentlyTranscribed:null,
     printedNoteGroupsIndependentlyTranscribed:null,
     printedSolesmesMarksIndependentlyTranscribed:null,
     neumeParity:"NOT_CERTIFIED",rhythmicMarkParity:"NOT_CERTIFIED"})),
    comparisonMethod:"Independent manual transcription from EACH printed 1961 witness; compare syllable-by-syllable with sourceSyllableNoteGroups, then verify neume shapes, clef, episemata, dots, bars and alignment.",
    independentPrintedNeumeCertification:"PENDING",reviewerDecision:"DO_NOT_PUBLISH",
    publicScoreApproved:false});
  }
 }
 const pages=new Set(rows.flatMap(r=>r.printWitnesses.map(w=>w.url)));
 if(rows.length!==12||pages.size!==5||new Set(rows.map(r=>r.scoreId)).size!==12||
     rows.some(r=>r.printWitnesses.some(w=>w.neumeParity!=="NOT_CERTIFIED")))
  throw Error("PREFACE_PRINT_WORKLIST_SCOPE_OR_CERTIFICATION_CHANGED");
 return {schema:PREFACE_PRINT_NEUME_WORKLIST_SCHEMA,
  witnesses:"Liber Usualis (1961) pp.109–110; Graduale Romanum (1961) pp.130*–132*",
  counts:{responseExcerpts:12,toneFamilies:3,liturgicalCues:4,
   witnessComparisons:24,distinctPrintedPages:5,independentlyCertifiedResponses:0,
   newPublicApprovals:0},
  editorialBoundary:"GABC source-phrase equality, plate-location and preliminary visual reading are NOT proof of independent printed-neume parity. Empty printed transcriptions require human comparison; the file does not authorize public score display or tone selection.",
  rows};
}
export function buildPreface12PrintWorklistCsv(){
 const data=buildPreface12PrintWorklist();
 const header=["score_id","tone","cue_id","source_id","latin","source_gabc_phrase",
  "source_syllable_neume_groups","printed_section","book","printed_page","plate_url",
  "printed_transcription","printed_solesmes_marks","note_parity","marks_parity","reviewer","decision"];
 const lines=[header.map(csvCell).join(",")];
 for(const row of data.rows)for(const w of row.printWitnesses)
  lines.push([row.scoreId,row.family,row.cueId,row.sourceId,row.sourceLatin,
   row.originalGabcPhrase,row.sourceSyllableNoteGroups.map(x=>x.printedSyllable+"="+x.gabcNoteGroup).join(" | "),
   row.printedSection,w.book,w.page,w.url,"","",w.neumeParity,w.rhythmicMarkParity,"",row.reviewerDecision]
   .map(csvCell).join(","));
 if(lines.length!==25)throw Error("TWENTY_FOUR_INDEPENDENT_WITNESS_ROWS_REQUIRED");
 return lines.join("\n")+"\n";
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const base=new URL("../../.tmp/mass-participation-28-review/",import.meta.url);
 await mkdir(fileURLToPath(base),{recursive:true});
 const data=buildPreface12PrintWorklist();
 await writeFile(new URL("preface-12-independent-neume-worklist.json",base),JSON.stringify(data,null,2)+"\n","utf8");
 await writeFile(new URL("preface-12-independent-neume-worklist.csv",base),buildPreface12PrintWorklistCsv(),"utf8");
 console.log("PASS 12 Preface responses × 2 original printed witnesses = 24 independent-review slots; 0 certifications; 0 new public approvals");
}