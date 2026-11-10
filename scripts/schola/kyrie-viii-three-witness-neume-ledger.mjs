// KYRIE VIII — exact-source, non-publishing token-by-token comparison ledger.
// This enumerates what must be checked against three printed Solesmes witnesses.
// It does NOT claim that any neume, note, rhythmic mark or alteration was
// independently musically proofread. It never writes to the approval registry.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {KYRIE_VIII_REVIEW_SOURCE,prepareKyrieVIIIReview}
 from "../../src/mass/reader-kyrie-viii-review-queue.js";
import {offlineKyrialeResearchScore}
 from "../../src/mass/reader-kyriale-research-gabc.js";

const WITNESSES=Object.freeze([
 Object.freeze({id:"GRADUALE_ROMANUM_1961",edition:"Graduale Romanum, Solesmes 1961",
   pages:Object.freeze(["28*","29*"]),
   images:Object.freeze([
    "https://gregobase.selapa.net/sources/2/905.png",
    "https://gregobase.selapa.net/sources/2/906.png"
   ])}),
 Object.freeze({id:"LIBER_USUALIS_1961",edition:"Liber Usualis, Solesmes 1961",
   pages:Object.freeze(["37"]),
   images:Object.freeze(["https://gregobase.selapa.net/sources/3/148.png"])}),
 Object.freeze({id:"CHANTS_OF_THE_CHURCH_1956",edition:"Chants of the Church, Solesmes 1956",
   pages:Object.freeze(["19"]),
   images:Object.freeze(["https://gregobase.selapa.net/sources/5/34.png"])})
]);
export const KYRIE_VIII_WITNESSES=WITNESSES;
export const KYRIE_VIII_NEUME_AUDIT_SCHEMA="ao-schola-kyrie-viii-3-print-neume-ledger-v1";
const sourcePath=new URL("../../data/presentation/reader-text-sung.v1.json",import.meta.url);
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const TOKEN=/\([^()]*\)|<clear>\*\*|<clear>\*|\*~\{~\}|<i>iij\.<\/i>|<i>ij\.<\/i>/g;
const expectedCues=[
 ["AO.SM.C0044","AO.SM.C0045","AO.SM.C0046"],
 ["AO.SM.C0047","AO.SM.C0048","AO.SM.C0049"],
 ["AO.SM.C0050","AO.SM.C0051"],
 ["AO.SM.C0052"]
];
// Strict visual sign checks made directly against two *printed* 1961 scans.
// These are RUBRIC/section markers only. Never interpret them as verified notes.
const PRINTED_MARKER_EVIDENCE=Object.freeze({
 "K8-L01-U05":Object.freeze({mark:"*",expected:"*~{~}",folio:"28*",
   observation:"Small intonation asterisk after the opening Kyrie"}),
 "K8-L01-U12":Object.freeze({mark:"iij.",expected:"<i>iij.</i>",folio:"28*",
   observation:"First Kyrie repeat directive visible after eleison"}),
 "K8-L02-U08":Object.freeze({mark:"iij.",expected:"<i>iij.</i>",folio:"28*",
   observation:"Christe repeat directive visible after eleison"}),
 "K8-L03-U09":Object.freeze({mark:"ij.",expected:"<i>ij.</i>",folio:"29*",
   observation:"Returning Kyrie repeat directive appears after page break"}),
 "K8-L04-U04":Object.freeze({mark:"*",expected:"<clear>*",folio:"29*",
   observation:"Single final Kyrie half-choir division"}),
 "K8-L04-U07":Object.freeze({mark:"**",expected:"<clear>**",folio:"29*",
   observation:"Double final Kyrie full-choir division"})
});
export const KYRIE_VIII_PRINTED_MARKER_EVIDENCE=PRINTED_MARKER_EVIDENCE;
const VISUALLY_READ_PRINTS=new Set(["GRADUALE_ROMANUM_1961","LIBER_USUALIS_1961"]);
const SIGN_KIND=new Set(["SINGLE_STAR_INITIAL_INTONATION",
 "PRINTED_REPEAT_DIRECTIVE","SINGLE_STAR_PERFORMER_HANDOFF",
 "DOUBLE_STAR_FULL_CHOIR_ENTRY"]);
const err=reason=>Object.freeze({
 schema:KYRIE_VIII_NEUME_AUDIT_SCHEMA,status:"HOLD_SOURCE_OR_CORPUS_DRIFT",
 reason,phrases:Object.freeze([]),reviewUnits:0,approvedScores:0,publishedScores:0
});
export function buildKyrieVIIIThreeWitnessNeumeLedger({corpus,source}={}){
 const original=source??offlineKyrialeResearchScore("KYRIE","MASS_08");
 if(!original||sha(original.gabc??"")!==KYRIE_VIII_REVIEW_SOURCE.sourceGabcSha256)
  return err("PINNED_1961_GABC_SHA256_DRIFT");
 const textCorpus=corpus??JSON.parse(readFileSync(sourcePath,"utf8"));
 const check=prepareKyrieVIIIReview({corpus:textCorpus,source:original});
 if(check.status!=="READY_FOR_NOTE_BY_NOTE_PRINT_REVIEW_NOT_PUBLISHABLE" ||
   check.rows.length!==9)return err("NINE_CANONICAL_CUE_AND_FOUR_PHRASE_CROSSWALK_DRIFT");
 const sourceLines=original.gabc.split("%%")[1]?.split(/\r?\n/)
  .map(x=>x.trim()).filter(x=>x.includes("(::)"))??[];
 if(sourceLines.length!==4)return err("FOUR_AUTHENTIC_PRINTED_MELODIES_REQUIRED");
 const phrases=sourceLines.map((line,i)=>{
   const raws=[...line.matchAll(TOKEN)].map(x=>x[0]);
   if(!raws.length||raws.at(-1)!=="(::)")return null;
   const assignment=check.rows.filter(r=>r.sourceLine===i);
   if(JSON.stringify(assignment.map(r=>r.cueId))!==JSON.stringify(expectedCues[i]))
    return null;
   const units=raws.map((raw,j)=>{
     const id="K8-L"+String(i+1).padStart(2,"0")+"-U"+String(j+1).padStart(2,"0");
     const evidence=PRINTED_MARKER_EVIDENCE[id];
     if(evidence&&evidence.expected!==raw)return null;
     const kind=raw==="(c3)"?"CLEF":
       raw==="*~{~}"?"SINGLE_STAR_INITIAL_INTONATION":
       raw==="<clear>*"?"SINGLE_STAR_PERFORMER_HANDOFF":
       raw==="<clear>**"?"DOUBLE_STAR_FULL_CHOIR_ENTRY":
       raw.startsWith("<i>")?"PRINTED_REPEAT_DIRECTIVE":
       raw==="(::)"?"FINAL_BAR":
       raw==="(,)"?"PAUSE":"NEUME_GROUP";
     const visuallyReviewed=Boolean(evidence&&SIGN_KIND.has(kind));
     return Object.freeze({
       id,ordinal:j+1,sourceLine:i,rawGabc:raw,kind,
       reviewStatus:"NOT_NOTE_BY_NOTE_CERTIFIED",
       witnessChecks:Object.freeze(WITNESSES.map(w=>{
         const printRead=visuallyReviewed&&VISUALLY_READ_PRINTS.has(w.id);
         const visualImageUrl=printRead?(w.id==="GRADUALE_ROMANUM_1961"?
           w.images[evidence.folio==="29*"?1:0]:w.images[0]):null;
         return Object.freeze({
           witnessId:w.id,verified:false,
           visuallyReadPrintedRubric:printRead,
           printedMark:printRead?evidence.mark:null,
           printedFolio:printRead?(w.id==="GRADUALE_ROMANUM_1961"?
             evidence.folio:"37"):null,
           printImageUrl:visualImageUrl,
           observation:printRead?evidence.observation:null,
           issue:printRead?"PRINTED_STRUCTURAL_MARK_MATCH_NOT_MUSICAL_APPROVAL":
             "NOT_EXAMINED_NOTE_BY_NOTE"
         });
       }))
     });
   });
   if(units.some(x=>!x))return null;
   const stars=units.filter(u=>u.kind.includes("HANDOFF")||u.kind==="DOUBLE_STAR_FULL_CHOIR_ENTRY");
   const directives=units.filter(u=>u.kind==="PRINTED_REPEAT_DIRECTIVE");
   const expectedRepeat=i<2?"iij.":i===2?"ij.":null;
   if((i===0&&units.filter(u=>u.kind==="SINGLE_STAR_INITIAL_INTONATION").length!==1) ||
      (i!==0&&units.some(u=>u.kind==="SINGLE_STAR_INITIAL_INTONATION")) ||
      (expectedRepeat&&!directives.some(u=>u.rawGabc.includes(expectedRepeat))) ||
      (!expectedRepeat&&directives.length!==0) ||
      (i<3&&stars.length!==0) ||
      (i===3&&(stars.length!==2||stars[0].rawGabc!=="<clear>*"||
        stars[1].rawGabc!=="<clear>**")))return null;
   return Object.freeze({
     phrase:i+1,role:["KYRIE_FIRST","CHRISTE","KYRIE_RETURN","FINAL_KYRIE"][i],
     originalCueIds:Object.freeze(assignment.map(r=>r.cueId)),
     folios:assignment[0].facsimileFolios,
     displayedLatin:assignment[0].sourceLatin,
     rawGabcSha256:sha(line),originalGabcLine:line,
     musicalSourceUnits:units.length,units:Object.freeze(units),
     structuralReview:"THREE_PRINTED_WITNESSES_LOCATED",
     pitchByPitchVerified:false,neumeByNeumeVerified:false,
     rhythmicSignsVerified:false,alterationsVerified:false,
     independentEditorialApproval:false
   });
 });
 if(phrases.some(x=>!x))return err("ORIGINAL_REPEAT_HANDOFF_OR_TOKEN_STRUCTURE_DRIFT");
 const reviewUnits=phrases.reduce((a,x)=>a+x.musicalSourceUnits,0);
 if(reviewUnits!==45)return err("PINNED_SOURCE_UNIT_COUNT_DRIFT");
 return Object.freeze({
   schema:KYRIE_VIII_NEUME_AUDIT_SCHEMA,
   status:"45_SOURCE_MARKS_3_WITNESSES_PENDING_INDEPENDENT_MUSICAL_REVIEW",
   sourceId:"GREGOBASE-1184",sourceGabcSha256:sha(original.gabc),
   witnessCount:WITNESSES.length,witnesses:WITNESSES,
   printPages:4,printedMelodyLines:4,
   invocationPattern:Object.freeze([3,3,2,1]),sourceCueCount:9,
   reviewUnits,printedComparisonTasks:reviewUnits*WITNESSES.length,
   printedStructuralMarkerTypes:Object.freeze(Object.keys(PRINTED_MARKER_EVIDENCE)),
   printedStructuralMarksVisuallyRead:6,
   printedWitnessMarkerComparisonsVisuallyRead:12,
   printedComparisonTasksStillUnread:reviewUnits*WITNESSES.length-12,
   noteByNoteComparisonsCertified:0,
   comparisonTasksCertified:0,
   sourceNotationCertified:false,editorialPublicationApproved:false,
   approvedScores:0,publishedScores:0,
   phrases:Object.freeze(phrases)
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 process.stdout.write(JSON.stringify(buildKyrieVIIIThreeWitnessNeumeLedger(),null,2)+"\n");
}
