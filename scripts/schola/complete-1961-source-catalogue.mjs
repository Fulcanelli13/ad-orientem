// Source-preserving MASS score study catalogue: no music is composed, resampled
// or automatically assigned to a Mass. 1961 GABC already exists in the repo.
// This is a research/export builder, NOT a public reader approval registry.
import {createHash} from "node:crypto";
import {index1961GradualeGabc} from "../../src/mass/reader-proper-gabc-bulk-join.js";
import {KYRIALE_RESEARCH_NOTATION_EXAMPLES} from "../../src/mass/reader-kyriale-catalogue.js";
import {offlineKyrialeResearchScore} from "../../src/mass/reader-kyriale-research-gabc.js";
import {schola1961OriginalFacsimile} from "../../src/mass/reader-schola-original-facsimile.js";

export const FULL_SCORE_STUDY_SCHEMA="ao-1961-original-gabc-1215-source-study-v1";
const SHA=/^[a-f0-9]{64}$/;
const PARTS=Object.freeze({
 in:"INTROIT",gr:"GRADUAL",al:"ALLELUIA",tr:"TRACT",
 of:"OFFERTORY",co:"COMMUNION"
});
const VALID_PATH=/^(?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
const sha256=value=>createHash("sha256").update(value,"utf8").digest("hex");
const fail=reason=>{throw Error(reason)};
const seq=Object.freeze([
 ["Victimae paschali",1086,"242","EASTER"],
 ["Veni Sancte Spiritus",68,"294","PENTECOST"],
 ["Lauda Sion",308,"315","CORPUS_CHRISTI"],
 ["Dies irae",1198,"96*","REQUIEM"],
 ["Stabat Mater",681,"597","SEPTEMBER_15"]
].map(([title,id,folio,context])=>Object.freeze({
 title,sourceId:id,sourceUrl:"https://gregobase.selapa.net/chant.php?id="+id,
 folio,context,scoreImported:false,status:"SEPARATE_SEQUENCE_IMPORT_REQUIRED"
})));
export const FULL_SCORE_STUDY_SEQUENCE_LEADS=seq;

function properRows(archive){
 const found=[],ids=new Set();
 for(const [part,rows] of Object.entries(archive.byRole)){
  if(!Object.hasOwn(PARTS,part))fail("UNKNOWN_PROPER_MUSIC_ROLE");
  for(const row of rows){
   if(ids.has(row.id)||row.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED"||
      row.sourceEditionId!==2||!SHA.test(row.sha256)||
      sha256(row.gabc)!==row.sha256 ||
      row.sourceUrl!=="https://gregobase.selapa.net/chant.php?id="+row.gregobaseId)
    fail("ORIGINAL_PROPER_TRANSCRIPTION_IDENTITY_OR_HASH_DRIFT:"+row.id);
   ids.add(row.id);
   // The archive's original GABC body remains byte-for-byte unchanged. A
   // syntactic header is attached for the already vendored Exsurge renderer.
   const title=String(row.incipit??row.title??row.id).trim();
   const gabc="name: "+title.replace(/[\r\n;]/g," ")+
     ";\noffice-part: "+part+";\n%%\n"+row.gabc;
   found.push({
    id:row.id,sourceId:row.gregobaseId,
    category:"PROPER",role:PARTS[part],part,
    title,mode:row.mode??null,folio:row.gradualeRomanum1961Page??null,
    edition:"GRADUALE_ROMANUM_SOLESMES_1961",
    settingId:null,transcriber:row.transcriber??null,
    sourceUrl:row.sourceUrl,originalGabcSha256:row.sha256,
    gabc,sourceMatch2026:[],
    publication:"RESEARCH_ONLY_NOT_MUSICALLY_APPROVED"
   });
  }
 }
 if(found.length!==1195)fail("FULL_1961_PROPER_CENSUS_DRIFT");
 return found;
}
function ordinaryRows(existingIds){
 const rows=[],settings=new Set();
 for(const ref of KYRIALE_RESEARCH_NOTATION_EXAMPLES){
  const s=offlineKyrialeResearchScore(ref.movement,ref.catalogueId);
  const id=ref.scoreId,setting=ref.movement+"|"+ref.catalogueId;
  if(!s||s.scoreId!==id||s.movement!==ref.movement||
     s.catalogueId!==ref.catalogueId||s.scoreApproved!==false||
     existingIds.has(id)||settings.has(setting)||
     !/^GREGOBASE-\d+$/.test(id)||
     s.sourceUrl!=="https://gregobase.selapa.net/chant.php?id="+id.slice(10)||
     typeof s.gabc!=="string"||!s.gabc.includes("%%")||
     !s.gabc.includes("(::)"))
   fail("ORDINARY_SOURCE_SELECTION_OR_GABC_INVALID:"+setting);
  existingIds.add(id);settings.add(setting);
  const printed=schola1961OriginalFacsimile(ref.movement,ref.catalogueId);
  rows.push({
   id,sourceId:Number(id.slice(10)),category:"ORDINARY",
   role:ref.movement,part:null,title:ref.title,mode:null,
   folio:ref.printedWitness,
   edition:"GRADUALE_ROMANUM_SOLESMES_1961",
   settingId:ref.catalogueId,transcriber:null,
   sourceUrl:s.sourceUrl,originalGabcSha256:sha256(s.gabc),
   gabc:s.gabc,sourceMatch2026:[],
   originalPrintedPages:printed?.printedPages??[],
   original1961EditionUrl:printed?.originalEditionPdf??null,
   publication:"RESEARCH_ONLY_NOT_MUSICALLY_APPROVED"
  });
 }
 if(rows.length!==20)fail("EXISTING_ORDINARY_SOURCE_CENSUS_DRIFT");
 return rows;
}
function joinSelected2026(entries,annual){
 if(annual==null)return {occurrences:0,distinctScores:0,matched:false};
 if(annual?.schema!=="ao-schola-2026-selected-full-1049-source-gabc-review-v1"||
    annual.status!=="ANNUAL_CALENDAR_SELECTED_1049_SOURCE_REVIEW_ONLY"||
    annual.counters?.calendarDays!==365||
    annual.counters?.approvedPublicScores!==0||
    annual.provenance?.pinnedLatinSourceFiles!==1049||
    annual.publication?.publicScores!==0||
    !Array.isArray(annual.matchedReviewOccurrences))
   fail("2026_SELECTED_SOURCE_CROSSWALK_INVALID");
 const byId=new Map(entries.filter(e=>e.category==="PROPER").map(e=>[e.id,e]));
 const seen=new Set(),used=new Set();
 for(const item of annual.matchedReviewOccurrences){
  const score=byId.get(item?.scoreId);
  const key=[item?.date,item?.sourcePath,item?.part,item?.selectedParagraphId,item?.scoreId].join("|");
  if(!score||score.part!==item.part||
     score.originalGabcSha256!==item.scoreGabcSha256||
     score.sourceUrl!==item.sourceUrl||
     item.status!=="UNIQUE_1962_SOURCE_AND_SCORE_HASH_REVIEW_ONLY"||
     item.publicScore!==false||!VALID_PATH.test(item.sourcePath)||
     !VALID_PATH.test(item.sourceOwner??"")||
     !/^2026-\d\d-\d\d$/.test(item.date)||!item.principalId||
     !item.selectedParagraphId||!item.pinned1962SourceBlobSha||
     !/^[a-f0-9]{40}$/.test(item.pinned1962SourceBlobSha)||seen.has(key))
   fail("2026_SELECTED_PROPER_SCORE_SOURCE_OR_ROLE_DRIFT:"+key);
  seen.add(key);used.add(score.id);
  score.sourceMatch2026.push({
   date:item.date,principalId:item.principalId,
   sourcePath:item.sourcePath,sourceOwner:item.sourceOwner,
   sourceSection:item.sourceSection,
   sourceBlobSha:item.pinned1962SourceBlobSha,
   selectedParagraphId:item.selectedParagraphId,
   status:"UNIQUE_PINNED_SOURCE_TEXT_MATCH_NOT_MUSICAL_APPROVAL"
  });
 }
 return {occurrences:seen.size,distinctScores:used.size,matched:true};
}
/** All 1215 previously stored original transcriptions, not invented scores.
 * Selected-year source matches only annotate Propers; never pick a Kyriale.
 */
export function buildFull1961SourceStudy({batches,selected2026=null}={}){
 const archive=index1961GradualeGabc(batches);
 if(archive.count!==1195||archive.approvedDigitalScores!==0)
  fail("FULL_1961_ARCHIVE_NOT_RESEARCH_ONLY");
 const propers=properRows(archive),ids=new Set(propers.map(s=>s.id));
 const ordinary=ordinaryRows(ids),entries=[...propers,...ordinary]
   .sort((a,b)=>a.category.localeCompare(b.category)||
     a.role.localeCompare(b.role)||a.title.localeCompare(b.title)||a.sourceId-b.sourceId);
 if(entries.length!==1215||ids.size!==1215)
  fail("COMPLETE_ORIGINAL_RESEARCH_CENSUS_INVALID");
 const selected=joinSelected2026(entries,selected2026);
 const byRole={};
 for(const score of entries)byRole[score.role]=(byRole[score.role]??0)+1;
 return {
  schema:FULL_SCORE_STUDY_SCHEMA,
  source:"EXISTING_GREGOBASE_2024_SNAPSHOT_AND_EXISTING_ORDINARY_GABC",
  rights:"CC0 source transcriptions; printed scans and sound not included",
  counts:{originalProperGabc:1195,existingOrdinaryGabc:20,
   sourceGabcTotal:1215,byRole,selected2026: selected,
   separateUnimportedSequenceLeads:seq.length,publicScores:0},
  entries,sequenceLeads:seq,
  publication:{status:"RESEARCH_ONLY_NOT_PUBLIC",
   automaticMassSettingSelection:false,automaticScholaCueProgression:false,
   publicScores:0,musicalApprovals:0,recordings:0}
 };
}
