import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const j=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const dir="dist/schaff-chrysostom-bulk-research/";
const summary=j(dir+"summary.v1.json");
const all=j(dir+"all-1938-structural-question-screening.v1.json");
const longer=j(dir+"all-180-extended-source-contexts.v1.json");
const old=j("dist/schaff-chrysostom-replies/chrysostom-question-ensuing-prose.v1.json");
const originals=j("dist/schaff-chrysostom-replies/chrysostom-all-structural-candidates.v1.json");
const units=j("dist/schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json");
const catena=j("data/scripture/catena/matthew.json");
const raw=readFileSync("dist/schaff-original-ocr/NPNF1-10.raw-ocr.txt","utf8");
const lines=raw.replace(/\r/g,"").split("\n");
assert.equal(all.schema,"ao.catena.chrysostom-1938-candidate-source-screen.v1");
assert.equal(longer.schema,"ao.catena.chrysostom-180-long-source-contexts.v1");
assert.equal(summary.schema,"ao.catena.chrysostom-bulk-source-screening-summary.v1");
assert.deepEqual(all.summary,summary);
assert.deepEqual(longer.summary,summary);
assert.equal(summary.scanSHA256,sha(raw));
assert.equal(summary.scanSHA256,old.originalVolumeSHA256);
assert.equal(summary.scanSHA256,originals.historicalVolumeSHA256);
assert.equal(summary.historicalHomiliesCovered,90);
assert.equal(summary.historicalOCRQuestionMarksInspected,3650);
assert.equal(summary.structuralOCRQuestionProseCandidatesPreserved,1938);
assert.equal(summary.sampledResearchContextsExpanded,180);
assert.equal(summary.distinctHomiliesRepresented,90);
assert.equal(summary.canonicalMatthewCatenaExcerptsCompared,4825);
assert.equal(all.sourceResearchOnly,true);
assert.equal(all.originalWordsHeldInHashedSourceRegister,true);
assert.equal(all.noCandidateIsFatherAuthenticated,true);
assert.equal(all.noAbsentCatenaOverlapImpliesNovelty,true);
assert.equal(longer.sourceResearchOnly,true);
assert.equal(longer.originalWordsAreUnmodified,true);
assert.equal(longer.notCompleteOriginalParagraphs,true);
assert.equal(all.rows.length,originals.records.length);
assert.equal(longer.rows.length,old.rows.length);
for(const key of ["sourceOwnedAuthorQuestionsConfirmed","sourceOwnedCompleteRepliesConfirmed",
 "independentlyEstablishedNovelAnswers","publicationApprovals"])assert.equal(summary[key],0);
const originalMap=new Map(originals.records.map(x=>[x.id,x]));
const sampleMap=new Map(old.rows.map(x=>[x.id,x]));
const unitMap=new Map(units.units.map(x=>[x.id,x]));
const canonical=new Map(catena.pericopes.flatMap(p=>p.segments.map((s,i)=>[
 p.id+":"+i,{father:s.father,text:s.text}])));
const norm=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g,"$1$2")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const sourceIds=new Set(),homilies=new Set();
let withLexical=0,sameLabel=0,otherLabelOnly=0,risky=0;
for(const r of all.rows){
 assert.ok(!sourceIds.has(r.id));sourceIds.add(r.id);
 const original=originalMap.get(r.id),unit=unitMap.get(r.workUnitId);
 assert.ok(original&&unit,"Every bulk row points to the exact original scan record");
 homilies.add(unit.id);
 assert.equal(r.workUnitId,original.sourceWorkUnitId);
 assert.equal(r.originalOCRLine,original.originalQuestionLine);
 assert.equal(r.originalOCRQuestionSHA256,original.originalQuestionSourceSpanSHA256);
 assert.equal(r.originalOCRQuestionLineSHA256,original.exactQuestionLineSHA256);
 assert.equal(r.originalFollowingTextSHA256,original.originalEnsuingProseSHA256);
 assert.equal(r.originalSourceContextSHA256,original.originalContextSHA256);
 assert.equal(sha(original.originalQuestionSourceSpan),r.originalOCRQuestionSHA256);
 assert.equal(sha(original.exactQuestionLineOCR),r.originalOCRQuestionLineSHA256);
 assert.equal(sha(original.originalEnsuingProseOCR),r.originalFollowingTextSHA256);
 assert.equal(sha(original.originalContextOCR),r.originalSourceContextSHA256);
 assert.equal(original.exactQuestionLineOCR,lines[r.originalOCRLine-1]);
 assert.equal(original.originalContextOCR,
  lines.slice(original.originalContextLineStart-1,original.originalContextLineEnd).join("\n"));
 assert.equal(original.originalQuestionSourceSpan,
  lines.slice(original.originalQuestionSourceSpanStartLine-1,r.originalOCRLine).join("\n"));
 assert.equal(r.structuralCandidateOnly,true);
 assert.equal(r.sourceQuestionIsAuthenticallyFatherOwned,false);
 assert.equal(r.exactPatristicAnswerBoundaryEstablished,false);
 assert.equal(r.newMaterialBeyondCatenaEstablished,false);
 assert.equal(r.publicationEligible,false);
 assert.equal(r.lexicalNonmatchCannotProveNovelty,true);
 assert.equal(r.originalOCRProseQuoteDelimiters,
  [...original.originalEnsuingProseOCR.matchAll(/["“”]/g)].length);
 assert.equal(r.originalOCRProseQuestionMarks,
  [...original.originalEnsuingProseOCR.matchAll(/\?/g)].length);
 assert.deepEqual(r.originalLayerRisks,original.sourceLayerRisks);
 assert.ok(r.lexicalCatenaCandidates.length<=3);
 const matches=[];
 for(const match of r.lexicalCatenaCandidates){
  const prior=canonical.get(match.canonicalPointer);
  assert.ok(prior);
  assert.equal(match.canonicalInheritedFather,prior.father);
  assert.equal(match.commonWordingOnlyNotSamePatristicArgument,true);
  assert.ok(match.matchedFiveWordPhrases>=2);
  assert.ok(match.firstExactCommonPhrases.length>=1&&
   match.firstExactCommonPhrases.length<=4);
  for(const phrase of match.firstExactCommonPhrases){
   assert.equal(phrase.split(/\s+/).length,5);
   assert.ok(norm(original.originalEnsuingProseOCR).includes(phrase));
   assert.ok(norm(prior.text).includes(phrase));
  }
  matches.push(match.canonicalInheritedFather);
 }
 withLexical+=Number(matches.length>0);
 sameLabel+=Number(matches.includes("Chrysostom"));
 otherLabelOnly+=Number(matches.length>0&&!matches.includes("Chrysostom"));
 risky+=Number(r.requiresSpeakerDisambiguation);
}
assert.equal(sourceIds.size,1938);
assert.equal(homilies.size,90);
assert.equal(summary.structuralCasesWithAnyLexicalMatthewCatenaLead,withLexical);
assert.equal(summary.structuralCasesWithLexicalInheritedChrysostomLead,sameLabel);
assert.equal(summary.structuralCasesLexicallyMatchingOnlyOtherInheritedLabels,otherLabelOnly);
assert.equal(summary.structuralCasesWithVisibleSpeakerOrQuoteRisk,risky);
const intervals=new Map(),longIds=new Set();
for(const r of longer.rows){
 const orig=sampleMap.get(r.id),unit=unitMap.get(r.workUnitId);
 assert.ok(orig&&unit);
 assert.ok(!longIds.has(r.id));longIds.add(r.id);
 assert.ok(sourceIds.has(r.id));
 assert.equal(r.printedHomily,unit.unitLabel);
 assert.equal(r.originalSourceVolumeSHA256,sha(raw));
 assert.equal(r.questionOriginalLine,orig.originalQuestionLine);
 assert.equal(r.originalLongWindowFirstLine,Math.max(unit.startLine,r.questionOriginalLine-55));
 assert.equal(r.originalLongWindowLastLine,Math.min(unit.endLine,r.questionOriginalLine+110));
 assert.equal(r.originalLongOCR,lines.slice(r.originalLongWindowFirstLine-1,r.originalLongWindowLastLine).join("\n"));
 assert.equal(r.originalLongOCRSHA256,sha(r.originalLongOCR));
 assert.equal(r.preExistingShortContextSHA256,orig.originalContextSHA256);
 assert.equal(r.questionOriginalSHA256,orig.originalQuestionSourceSpanSHA256);
 assert.equal(r.followingProseSHA256,orig.originalEnsuingProseSHA256);
 assert.ok(r.originalLongOCR.includes(orig.originalContextOCR));
 for(const field of ["printedQuotationBoundaryNotAuthenticated","originalSpeakerNotAuthenticated",
  "textIsBoundedWindowNotCompleteAnswer","sourceNotCriticallyCollated"])
  assert.equal(r[field],true);
 assert.equal(r.publicationEligible,false);
 if(!intervals.has(unit.id))intervals.set(unit.id,[]);
 intervals.get(unit.id).push([r.originalLongWindowFirstLine,r.originalLongWindowLastLine]);
}
assert.equal(longIds.size,180);
assert.equal(intervals.size,90);
let unique=0,allLines=0;
for(const records of intervals.values()){
 records.sort((a,b)=>a[0]-b[0]);
 allLines+=records.reduce((s,r)=>s+r[1]-r[0]+1,0);
 let [start,end]=records[0];
 for(const [a,b] of records.slice(1)){
  if(a<=end+1)end=Math.max(end,b);
  else{unique+=end-start+1;start=a;end=b}
 }
 unique+=end-start+1;
}
assert.equal(summary.totalLineOccurrencesAcrossLongContexts,allLines);
assert.equal(summary.uniqueOriginalOCRLinesAcrossLongContexts,unique);
assert.ok(unique>0&&unique<=allLines);
console.log("PASS Chrysostom bulk research: 1938 source-exact structural candidate indexes, 180 SHA-verified extended contexts, 90/90 homilies and Matthew Catena phrase checks; zero published Father answers");
