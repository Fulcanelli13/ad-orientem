import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const hash=s=>createHash("sha256").update(s,"utf8").digest("hex");
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="dist/schaff-chrysostom-replies/";
const data=read(root+"chrysostom-question-ensuing-prose.v1.json");
const summary=read(root+"summary.v1.json");
const unit=read("dist/schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json");
const raw=readFileSync("dist/schaff-original-ocr/NPNF1-10.raw-ocr.txt","utf8");
const lines=raw.replace(/\r/g,"").split("\n");
assert.equal(hash(raw),data.originalVolumeSHA256);
assert.equal(data.schema,"ao.catena.chrysostom-historical-OCR-question-ensuing-prose.v1");
assert.equal(summary.schema,"ao.catena.chrysostom-question-ensuing-prose-summary.v1");
assert.equal(data.originalHomilies,90);
assert.equal(data.questionMarkWindowsScreened,3650);
assert.equal(data.homiliesRepresented,90);
assert.equal(data.sampledSourceExactEnvelopes,180);
assert.ok(data.structuralQuestionAndProseCandidates>=350&&
 data.structuralQuestionAndProseCandidates<=2500);
assert.equal(data.knownPreviouslyResearchedSourceLoci,4);
assert.equal(data.rows.length,180);
assert.equal(data.homilies.length,90);
for(const key of ["questionSpeakersConfirmed","sourceAnswerBoundariesConfirmed",
 "confirmedNewPatristicAnswers","publicationApprovals"])
 assert.equal(data[key],0);
assert.equal(data.eligibleForProductionMessenger,false);
const units=new Map(unit.units.map(x=>[x.id,x])),candidates=new Map(unit.questions.map(x=>[x.id,x]));
const used=new Set(),counted=new Map();
for(const row of data.rows){
 const u=units.get(row.sourceWorkUnitId),source=candidates.get(row.id);
 assert.ok(u&&source);
 assert.ok(!used.has(row.id));used.add(row.id);
 assert.equal(row.sourceWorkUnitId,source.workUnitId);
 assert.equal(row.originalQuestionLine,source.ocrLine);
 assert.equal(row.exactQuestionLineOCR,source.originalQuestionLineOCR);
 assert.equal(row.exactQuestionLineSHA256,source.originalQuestionLineSHA256);
 assert.equal(hash(row.exactQuestionLineOCR),row.exactQuestionLineSHA256);
 assert.ok(row.questionMarkOffset>=0);
 assert.equal(row.exactQuestionLineOCR[row.questionMarkOffset],"?");
 assert.equal(row.originalQuestionSourceSpan,
  lines.slice(row.originalQuestionSourceSpanStartLine-1,row.originalQuestionLine).join("\n"));
 assert.equal(hash(row.originalQuestionSourceSpan),row.originalQuestionSourceSpanSHA256);
 assert.equal(hash(row.originalEnsuingProseOCR),row.originalEnsuingProseSHA256);
 assert.ok(row.originalEnsuingProseOCR.length>=45);
 assert.ok(row.ensuingProseEndLine>=row.originalQuestionLine&&
  row.ensuingProseEndLine<=u.endLine);
 assert.ok(row.originalContextLineStart>=u.startLine&&
  row.originalContextLineEnd<=u.endLine);
 assert.equal(row.originalContextOCR,
  lines.slice(row.originalContextLineStart-1,row.originalContextLineEnd).join("\n"));
 assert.equal(hash(row.originalContextOCR),row.originalContextSHA256);
 assert.ok(["reported_interlocutor_or_objection",
  "question_about_Scripture_speaker","author_rhetorical_form_unverified"]
  .includes(row.questionFormHypothesis));
 for(const field of ["originalPrintPageCollated","sourceQuestionSpeakerResolved",
  "sourceReplySpeakerResolved","sourceParagraphBoundaryVerified",
  "materialBeyondCatenaVerified","publicationEligible"])
  assert.equal(row[field],false);
 assert.equal(Object.hasOwn(row,"attributedFatherResponse"),false);
 assert.equal(Object.hasOwn(row,"generatedAnswer"),false);
 counted.set(u.id,(counted.get(u.id)||0)+1);
}
assert.equal(counted.size,90);
assert.ok([...counted.values()].every(x=>x===2));
assert.equal(data.homilies.reduce((a,b)=>a+b.structuralQuestionAndProseCandidates,0),
 data.structuralQuestionAndProseCandidates);
const expected=[
 ["SCH-CHR-001",44,42321,42323,42333,"catena.matthew.13.1:17"],
 ["SCH-CHR-002",47,43840,43841,43844,null],
 ["SCH-CHR-003",47,43868,43870,43879,null],
 ["SCH-CHR-004",47,44008,44010,44018,null]
];
assert.equal(data.pinnedOriginalWorkEvidence.length,4);
for(let i=0;i<expected.length;i++){
 const [id,num,first,qline,last,ptr]=expected[i];
 const row=data.pinnedOriginalWorkEvidence[i],u=unit.units[num-1];
 assert.equal(row.seedId,id);
 assert.equal(row.sourceWorkUnitId,u.id);
 assert.equal(row.originalLineStart,first);
 assert.equal(row.questionMarkLine,qline);
 assert.equal(row.originalLineEnd,last);
 assert.equal(row.priorCanonicalCatenaPointer,ptr);
 assert.equal(row.completeOriginalOCR,lines.slice(first-1,last).join("\n"));
 assert.equal(hash(row.completeOriginalOCR),row.completeOCRSHA256);
 assert.equal(row.exactOCRQuestionUpToMark+row.exactOCREnsuingProse,row.completeOriginalOCR);
 assert.equal(row.questionAndProsePrintedContiguously,true);
 assert.equal(row.sourceQuoteOwnershipUnverified,true);
 assert.equal(row.ensuingProseMayIncludeBiblicalQuotation,
  row.ensuingProseQuotationEvidence.visiblePrintedQuoteMarks>0);
 assert.equal(row.ensuingProseQuotationEvidence.sourceQuotationCandidates.length,
  [0,1,0,1][i],"Preserve exact paired quotation spans in two historic Gospel-heavy examples");
 assert.equal(row.ensuingProseQuotationEvidence.unpairedOrOutsideContextQuotationPossible,
  [false,false,true,false][i]);
 for(const quoted of row.ensuingProseQuotationEvidence.sourceQuotationCandidates){
  assert.equal(row.exactOCREnsuingProse.slice(quoted.startOffset,quoted.endOffset),
   quoted.originalQuotedOCR);
  assert.equal(hash(quoted.originalQuotedOCR),quoted.originalQuoteSHA256);
  assert.equal(quoted.sourceRole,
   "unresolved_printed_quotation_not_automatically_Father_speech");
 }

 for(const field of ["speakerOriginalGreekAuthenticated","printedPageCollated",
  "sourceResponseBoundaryEditoriallyAuthenticated",
  "noveltyComparedAgainstFullCatena","publicationEligible"])
  assert.equal(row[field],false);
}
assert.match(data.pinnedOriginalWorkEvidence[0].exactOCRQuestionUpToMark,/sow\s+among\s+the\s+thorns/);
assert.match(data.pinnedOriginalWorkEvidence[1].exactOCREnsuingProse,/They\s+had\s+been/);
assert.match(data.pinnedOriginalWorkEvidence[2].exactOCREnsuingProse,/They\s+let/);
assert.match(data.pinnedOriginalWorkEvidence[3].exactOCREnsuingProse,/They\s+had\s+become/);
assert.equal(summary.sourceExactResearchEnvelopes,180);
assert.equal(summary.answersCertified,0);
assert.equal(summary.catenaNoveltyCertified,0);
assert.equal(summary.publicationApprovals,0);
console.log("PASS: 90 Chrysostom homilies; 180 source-exact question/prose research envelopes; four prior source-locus spans remain unapproved");
