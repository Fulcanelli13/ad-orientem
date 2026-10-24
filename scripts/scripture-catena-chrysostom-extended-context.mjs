#!/usr/bin/env node
/**
 * Recover longer historical print OCR CONTEXT for all 24 compared Chrysostom
 * passages. Interpretive labels and Scripture scene comparisons are research
 * aids, never quoted Father speech or proven duplicates.
 *
 * The OCR is column/page unverified, so a long window is NOT a complete
 * original argument, nor is it a safe excerpt for production Messenger.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
const get=(s,d)=>{const i=process.argv.indexOf(s);return i<0?d:process.argv[i+1]};
const base=resolve(get("--source-dir","dist"));
const output=resolve(get("--output-dir","dist/schaff-chrysostom-extended"));
const researchRoot="data/scripture/catena/research/full-corpus-pass-20261021/";
const json=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const normalize=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g,"$1$2")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const source=json(join(base,"schaff-chrysostom-focused-parallels/focused-chrysostom-source-parallels.v1.json"));
const studies=json(researchRoot+"chrysostom-24-argument-research-hypotheses.v1.json");
const unit=json(join(base,"schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json"));
const original=readFileSync(join(base,"schaff-original-ocr/NPNF1-10.raw-ocr.txt"),"utf8");
if(source.schema!=="ao.catena.chrysostom-focused-literal-parallels.v1"||
 studies.schema!=="ao.catena.chrysostom-focused-parallel-argument-research-hypotheses.v1"||
 unit.units.length!==90||source.packets.length!==24||studies.rows.length!==24||
 sha(original)!==source.originalVolumeSHA256||sha(original)!==unit.sourceVolumeSHA256)
 throw Error("FOCUSED_SOURCE_ORIGINAL_SHA_CHANGED");
const lines=original.replace(/\r/g,"").split("\n");
const prior=new Map(studies.rows.map(x=>[x.sourceId,x]));
const unitByLabel=new Map(unit.units.map(x=>[x.unitLabel,x]));
// These scene labels are original-text research hypotheses based on quoted
// Gospel wording. Not certified source references or Father attributions.
const scene={
 "schaff-ocr-npnf1-10-c7a8114bd012ecd4":{
  originalWorkScriptureScene:"Matthew 4:23–25 (early healings), comparing Matthew 9:28",
  byPericope:{"catena.matthew.9.27":"quoted_later_healing_in_different_narrative_scene"}},
 "schaff-ocr-npnf1-10-f20bd9281a253cb2":{
  originalWorkScriptureScene:"Matthew 6:25–34 (food, clothing and anxiety)",
  byPericope:{"catena.matthew.6.11":"related_sermon_topic_but_different_verse",
   "catena.matthew.6.31":"same_sermon_and_immediate_topic",
   "catena.matthew.10.19":"same_expression_in_distinct_mission_discourse"}},
 "schaff-ocr-npnf1-10-ca77ecdf81002456":{
  originalWorkScriptureScene:"Matthew 12:1–8 (Sabbath dispute)",
  byPericope:{"catena.matthew.12.1":"same_narrative_scene_argument_not_certified",
   "catena.matthew.26.6":"saying_cited_in_different_anointing_scene",
   "catena.matthew.9.9":"same_saying_from_earlier_tax_collector_scene"}},
 "schaff-ocr-npnf1-10-d344aa0205310084":{
  originalWorkScriptureScene:"Matthew 11:7–9 (Christ's questions about John the Baptist)",
  byPericope:{"catena.matthew.11.7":"same_quoted_gospel_passage_argument_not_yet_compared"}},
 "schaff-ocr-npnf1-10-adf2f2cf2247586f":{
  originalWorkScriptureScene:"Matthew 26:6–13 (anointing before the Passion)",
  byPericope:{"catena.matthew.12.1":"saying_cited_in_different_sabbath_scene",
   "catena.matthew.26.6":"same_narrative_scene_argument_not_certified",
   "catena.matthew.9.9":"same_saying_from_earlier_tax_collector_scene"}},
 "SCH-CHR-004":{
  originalWorkScriptureScene:"Matthew 13:36–53 (private explanations of parables)",
  byPericope:{"catena.matthew.13.51":"same_gospel_passage_under_different_inherited_author_label",
   "catena.matthew.9.27":"same_short_reply_in_different_blind_healing_scene"}}
};
const permitted=new Set(["likely_same_original_work_argument",
 "shared_scriptural_language_context_differs","insufficient_printed_context_for_argument"]);
const result=[];
for(const packet of source.packets){
 const hypo=prior.get(packet.id),u=unitByLabel.get(packet.historicalPrintedHomily);
 if(!hypo||!u||!permitted.has(hypo.comparisonHypothesis))
  throw Error("SOURCE_QUESTION_OR_HOMILY_UNRESOLVED");
 const n=packet.historicalPrintedLine;
 if(n<u.startLine||n>u.endLine)throw Error("ORIGINAL_PRINT_OCR_LINE_OUTSIDE_HOMILY");
 // The original 5–15 OCR lines around a question are too short to identify
 // answer extent. Preserve ~165 lines for research, WITHOUT claiming that
 // 165 lines constitute a complete quotation, argument or source paragraph.
 const start=Math.max(u.startLine,n-55),end=Math.min(u.endLine,n+110);
 const expanded=lines.slice(start-1,end).join("\n");
 if(!expanded.includes(packet.exactHistoricalOCRContext))
  throw Error("CANNOT_FIND_PREVIOUS_SOURCE_CONTEXT_IN_EXTENDED_OCR");
 const quoteText=packet.exactOriginalOCRQuestion;
 if(!expanded.includes(quoteText)) {
  // Some original questions start before the focused window or retain a
  // partial prior-line prefix. Neither alters the pinned source.
  if(!expanded.includes(quoteText.slice(-50)))
   throw Error("ORIGINAL_QUESTION_NOT_ANCHORED_IN_EXPANDED_CONTEXT");
 }
 // Structural cues are NOT certified paragraph/footnote boundaries.
 const pageHeadingHints=[],printedNoteHints=[];
 for(let i=start;i<=end;i++){
  const row=lines[i-1].trim();
  if(/^(?:THE\s+GOSPEL\s+OF|HOMILY\s+[IVXLCDM\d]+\.?|CHAP\.\s+[IVXLCDM]+\.?)\b/i.test(row))
   pageHeadingHints.push({line:i,exactOCRLine:lines[i-1],sha256:sha(lines[i-1])});
  if(/^(?:\d{1,2}\s+(?:Matt\.?|Mark\.?|Luke\.?|John\.?|See\b|Cf\.?|Ib(?:id)?\.?)|\*{1,2}\s+\S|\[\s*(?:R\.?\s*V\.?|A\.?\s*V\.?|The\s+Greek))\b/i.test(row))
   printedNoteHints.push({line:i,exactOCRLine:lines[i-1],sha256:sha(lines[i-1])});
 }
 const isMisleading=hypo.comparisonHypothesis==="shared_scriptural_language_context_differs";
 if(isMisleading&&!scene[packet.id])throw Error("MISSING_SIX_CASE_SCENE_COMPARISON");
 if(!isMisleading&&scene[packet.id])throw Error("SCENE_MAP_NOT_SIX_CASE_ONLY");
 const comparisons=packet.catenaParallels.map(p=>{
  const label=scene[packet.id];
  if(isMisleading&&!label?.byPericope[p.pericopeId])
   throw Error("PER_POINTER_SCENE_DISAMBIGUATION_MISSING:"+packet.id+":"+p.pericopeId);
  return {canonicalPointer:p.pointer,canonicalPericopeId:p.pericopeId,
   inheritedAuthor:p.inheritedFatherLabel,
   originalCatenaWords:p.exactOriginalCatenaWords,
   originalCatenaWordsSHA256:sha(p.exactOriginalCatenaWords),
   commonFiveWordStrings:p.matchedPhraseEvidence.map(x=>x.fiveWordPhrase),
   sceneRelationHypothesis:label?.byPericope[p.pericopeId]||"argument_similarity_only_not_source_identity",
   quoteAndSpeakerIdentityUnverified:true,publicationEligible:false};
 });
 result.push({
  id:packet.id,historicalHomily:packet.historicalPrintedHomily,
  originalSourceVolumeSHA256:source.originalVolumeSHA256,
  questionLine:n,sourceLineStart:start,sourceLineEnd:end,
  originalHistoricalOCRExtendedWindow:expanded,extendedWindowSHA256:sha(expanded),
  originalFocusedContextSHA256:packet.historicalContextSHA256,
  originalQuestionSHA256:packet.originalQuestionSHA256,
  sourceWorkUnitId:u.id,originalWorkUnitSHA256:u.originalUnitOCRSHA256,
  originalOCRPageHeadingClues:pageHeadingHints,
  originalOCRPossibleFootnoteClues:printedNoteHints,
  questionAndReplyBoundaryNotVerified:true,
  historicalTwoColumnPageLayoutNotReconstructed:true,
  historicalGreekNotCollated:true,
  sourceAuthorshipNotAuthenticated:true,
  expansionIsBoundedWindowNotCompleteHomilyOrArgument:true,
  sourceQuoteInsideFootnoteUnresolved:true,
  researchInterpretation:hypo.comparisonHypothesis,
  researchReasonNotFatherSpeech:hypo.researchReason,
  provisionalOriginalGospelScene:scene[packet.id]?.originalWorkScriptureScene||null,
  gospelSceneInferredFromSourceContextNotCriticallyAuthenticated:!!scene[packet.id],
  perPointerSceneComparison:comparisons,
  thematicNoveltyStillUnresolved:true,
  publicationEligible:false
 });
}
const counts=Object.fromEntries([...permitted].map(k=>[k,result.filter(r=>r.researchInterpretation===k).length]));
const six=result.filter(r=>r.provisionalOriginalGospelScene);
if(six.length!==6||result.length!==24||
 counts.likely_same_original_work_argument!==16||
 counts.shared_scriptural_language_context_differs!==6||
 counts.insufficient_printed_context_for_argument!==2)
 throw Error("FOCUS_POPULATION_CHANGED");
const summary={
 schema:"ao.catena.chrysostom-24-expanded-primary-source-context-summary.v1",
 originalWorkTranslation:"NPNF First Series Vol X (1888 historical OCR)",
 primarySourceDigest:source.originalVolumeSHA256,
 passagesWithExtendedVerbatimContext:24,
 likelySameArgumentResearchCases:16,
 sharedWordingWithDifferentOrMixedSceneCases:6,
 insufficientPreviouslyCroppedContextCases:2,
 originalGospelScenePerPointerRegisters:6,
 perPointerScriptureSceneJudgments:six.reduce((s,r)=>s+r.perPointerSceneComparison.length,0),
 homilyBoundedOriginalOCRLineContexts:result.reduce((n,r)=>n+r.sourceLineEnd-r.sourceLineStart+1,0),
 sourcePageAndGreekCriticallyVerified:0,fullAnswerBoundariesCertified:0,
 independentlyAuthenticatedDuplicates:0,provenNovelAnswers:0,
 newMessengerMessages:0,publicationApprovals:0
};
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"expanded-historical-source-contexts.v1.json"),
 JSON.stringify({schema:"ao.catena.chrysostom-24-extended-text-and-scene-hypotheses.v1",
  sourceResearchOnly:true,allWordsOriginalHistoricalOCR:true,
  researchInterpretationsAreNotFatherDialogue:true,
  summary,rows:result},null,2)+"\n");
writeFileSync(join(output,"summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
