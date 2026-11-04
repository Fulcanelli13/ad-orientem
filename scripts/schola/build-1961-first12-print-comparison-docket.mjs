// First twelve source-bound 1961 printed-score comparison dossiers.
// This is an independent *comparison workbench*, not an assertion that a
// machine can see printed pitches/neumes/ictus from an image file.
import {createHash} from "node:crypto";
import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {FIRST12_1961_FACSIMILES}
 from "../../src/mass/reader-proper-first12-1961-facsimile-locators.js";
import {sourceNoteGroupInventory}
 from "../../src/mass/reader-kyriale-source-note-groups.js";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const read=async path=>JSON.parse(await readFile(resolve(root,path),"utf8"));
const captures=".tmp/schola-1961-first12-original-facsimiles/";
const images=await read(captures+"1961-original-first12-source-image-manifest.json");
const archived=(await Promise.all(Array.from({length:6},(_,i)=>
 read("data/mass/chant-corpus/gr1961-proper-"+String(i+1).padStart(3,"0")+".json"))))
 .flatMap(batch=>batch.items);
const lookup=new Map(archived.map(x=>[x.id,x]));
const scanByUrl=new Map(images.pages.map(x=>[x.sourceUrl,x]));
if(images.schema!=="ao-schola-1961-first12-original-printed-source-image-capture-v1"||
 lookup.size!==1195||FIRST12_1961_FACSIMILES.length!==12)
 throw Error("FIRST12_ORIGINAL_BOOK_OR_ARCHIVE_CENSUS_INVALID");
const scores=FIRST12_1961_FACSIMILES.map(locator=>{
 const original=lookup.get(locator.scoreId);
 if(!original||original.sourceEditionId!==2||original.officePart!==locator.part||
   original.gradualeRomanum1961Page!==locator.folio||
   original.sourceUrl!==locator.sourceUrl||
   original.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED"||
   createHash("sha256").update(original.gabc,"utf8").digest("hex")!==original.sha256)
  throw Error("FIRST12_GABC_SOURCE_SHA_ROLE_OR_FOLIO_DRIFT_"+locator.scoreId);
 const notes=sourceNoteGroupInventory(
  "name: "+locator.scoreId+";\n%%\n"+original.gabc);
 const pages=locator.scannedFolios.map(folio=>{
  const scan=scanByUrl.get(folio.url);
  if(!scan||scan.page!==folio.folio||scan.imageNumber!==folio.imageNumber)
   throw Error("FIRST12_PRINTED_FOLIO_OR_SCAN_IDENTITY_DRIFT_"+locator.scoreId);
  return {folio:folio.folio,original1961ScanUrl:folio.url,
   imageSha256:scan.pngSha256??null,imageWidth:scan.width??null,
   imageHeight:scan.height??null,imageBytes:scan.bytes??0,
   scanStatus:scan.status,staffLinesManuallyInspected:false,
   printedPitchNeumeRhythmTranscribed:false};
 });
 const originalPagesCaptured=pages.every(x=>x.imageSha256!=null);
 return {
  scoreId:original.id,title:original.title,officePart:original.officePart,
  sourceEdition:"Graduale Romanum Solesmes 1961",original1961PrintedFolio:locator.folio,
  originalSourceUrl:original.sourceUrl,originalGabcSha256:original.sha256,
  originalGabcMode:original.mode??null,sourceTranscriber:original.transcriber??null,
  sourceTranscriptionIndependentFromScans:false,
  pages,completeSourcePagesLocated:true,completeSourceImagesCaptured:originalPagesCaptured,
  gabcSourceNoteGroupCount:notes.noteBearingSourceTokens,
  sourceSyllableTokens:notes.syllableBearingTokens,
  continuationNoteGroups:notes.continuationTokens,
  sourceSegmentation:notes.groups.map(g=>({
   ordinal:g.ordinal,gabcOriginalNotes:g.gabcOriginalNotes,
   originalGabcSyllable:g.syllable,sourceTokenType:g.sourceTokenType,
   sourceGabcOffset:g.sourceGabcOffset,
   printedPitch:null,printedNeume:null,printedRhythm:null,
   printedUnderlay:null,printedLocation:null,
   manualComparison:"NOT_YET_COMPLETED"})),
  checks:{
   immutableGabcSha256:"MATCH",
   originalEditionAndRole:"MATCH",
   originalPrintedFolioMetadata:"MATCH",
   sourceImageCapture:originalPagesCaptured?"CAPTURED_NOT_MUSICALLY_COMPARED":
     "INCOMPLETE_IMAGE_ACCESS_HOLD",
   printedPitches:"PENDING_INDEPENDENT_VISUAL_READING",
   printedNeumes:"PENDING_INDEPENDENT_VISUAL_READING",
   printedRhythmicSigns:"PENDING_INDEPENDENT_VISUAL_READING",
   printedSyllabicUnderlay:"PENDING_INDEPENDENT_VISUAL_READING",
   1962SelectedProperUsage:"PENDING_EXACT_SOURCE_SELECTION",
   editorialDecision:"NOT_APPROVED"},
  verifiedMusicalNoteCount:0,
  certifiedSourceUnderlay:false,approvedForNativeReader:false,publicScore:false,
  reviewStatus:originalPagesCaptured?
   "SOURCE_IMAGE_AND_GABC_EVIDENCE_READY_FOR_MANUAL_MUSIC_COMPARISON":
   "ORIGINAL_PRINT_IMAGE_ACCESS_HOLD"
 };
});
const totalGroups=scores.reduce((n,s)=>n+s.gabcSourceNoteGroupCount,0);
const docket={
 schema:"ao-schola-1961-first12-independent-printed-music-docket-v1",
 status:"REVIEW_DOSSIERS_SOURCE_IDENTITIES_VALID_MUSIC_STILL_UNCERTIFIED",
 originalEdition:"Graduale Romanum Solesmes 1961",
 archiveCorpus:"1195_SHA_AUTHENTICATED_GREGORIAN_CANDIDATES",
 sourceScanEditionId:2,
 counts:{scores:scores.length,sourcePages:images.pages.length,
  fullCapturedScoreSpans:scores.filter(s=>s.completeSourceImagesCaptured).length,
  originalGabcNoteGroups:totalGroups,
  independentlyVerifiedPrintedNotes:0,
  musicallyCertifiedScores:0,editoriallyApprovedScores:0,publishedScores:0},
 scores,
 publication:{userEditorialSignoffRequired:true,rawGabcNotPublished:true,
  selected1962LatinNotAltered:true,automaticScoreApproval:false,publicScores:0}
};
await writeFile(resolve(root,captures+"1961-first12-printed-music-comparison-docket.json"),
 JSON.stringify(docket,null,2)+"\n");
console.log("SCHOLA_FIRST12_PRINT_COMPARISON_DOCKET "+JSON.stringify(docket.counts));
