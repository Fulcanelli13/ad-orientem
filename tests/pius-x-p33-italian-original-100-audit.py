#!/usr/bin/env python3
"""Static integrity of live acquired Italian 1905 witnesses; no publication."""
import hashlib
import json
from pathlib import Path
import re

artifact=Path("artifacts/pius-x-study-expanded")
research=Path("data/learn/research")
source=json.loads((artifact/"SPX_P33_OriginalItalian_100_Opening_Audit.json").read_text())
prior=json.loads((artifact/"SPX_P32_Bulk200_Source_Question_Crosswalk.json").read_text())
triage=json.loads((research/"pius-x-100answer-editorial-release-triage-20261020.v1.json").read_text())
assert source["schema"]=="AO_SPX_P33_ORIGINAL_ITALIAN_100_OPENING_WITNESS_AUDIT_V1"
assert source["status"]=="PRIVATE_ORIGINAL_TEXT_ACQUISITION_NOT_CLAIM_CERTIFICATION"
assert source["sourceUrl"]=="https://www.museosanpiox.it/documenti-scritti-da-pio-x/il-catechismo-maggiore-di-san-pio-x/parte-quarta-dei-sacramenti/"
assert source["sourceSectionQuestionsParsed"]==339
assert re.fullmatch("[0-9a-f]{64}",source["sourceDigitalPageRawSha256"])
c=source["counts"]
assert c["openingQuestionsAudited"]==100
assert c["originalItalianAnswersLocated"]==100
assert c["multipleSourceReferenceOpeningHolds"]==7
assert c["additionalItalianSupportPassages"]==9
assert c["normalizedExactQuestionIdentities"]==95
assert c["questionIdentityMismatchesOrHolds"]==5
assert c["unverifiedEnglishFrenchEditorialAnswerPairs"]==100
assert c["pastoralHistoricalHolds"]==30
assert c["sourceTranslationReview"]==57
assert c["precisionRewriteReview"]==13
assert c["questionIdentityMismatchesOrHolds"]==len(source["holds"])
assert c["originalItalianAnswerClaimsFullyCertified"]==0
assert c["englishFrenchTranslationsCertified"]==0
assert c["publicationApprovals"]==0
known={x["turnId"]:x for x in prior["turns"] if x["turnIndex"]==1}
queued={x["turnId"]:x for x in triage["records"]}
assert len(known)==len(queued)==100
assert len(source["records"])==100
seen=set();qids=set()
for r in source["records"]:
    assert r["turnId"] in known and r["turnId"] in queued
    assert r["turnId"] not in seen;seen.add(r["turnId"])
    qids.add(r["sourceQid"])
    assert r["sourceQid"] in known[r["turnId"]]["source1905QuestionIds"]
    assert r["sourceQid"]==queued[r["turnId"]]["id"]
    assert r["sourceOwner"]==known[r["turnId"]]["originalOwnerPath"]
    assert r["italianQuestionFromWitness"] and r["italianAnswerFromWitness"]
    assert re.fullmatch("[0-9a-f]{64}",r["witnessQuestionFingerprintSha256"])
    assert re.fullmatch("[0-9a-f]{64}",r["witnessAnswerFingerprintSha256"])
    assert r["italianAnswerLocated"] is True
    assert r["sourceQid"] in r["allOriginalSourceQuestionIds"]
    assert r["allOriginalSourceQuestionIds"]==known[r["turnId"]]["source1905QuestionIds"]
    assert len(r["supplementarySourceWitnesses"])==len(r["allOriginalSourceQuestionIds"])-1
    assert r["multiSourceEditorialAnswerHold"]==(len(r["supplementarySourceWitnesses"])>0)
    for sup in r["supplementarySourceWitnesses"]:
        assert sup["sourceQid"] in r["allOriginalSourceQuestionIds"]
        assert sup["sourceQid"]!=r["sourceQid"]
        assert sup["italianQuestion"] and sup["italianAnswer"]
        assert re.fullmatch("[0-9a-f]{64}",sup["answerFingerprintSha256"])
    assert r["original1905PrintedQuestionNumber"] is False
    assert r["bilingualTranslationCertified"] is False
    assert r["printFacsimileCertified"] is False
    assert r["papalAutographSpeechCertified"] is False
    assert r["humanDoctrinalAccepted"] is False
    assert r["publicationApproved"] is False
    assert r["englishFrenchClaimAssessment"]=="UNASSESSED_NEEDS_HUMAN_PARALLEL_TEXT_REVIEW"
    assert r["historicalPastoralHold"]==(queued[r["turnId"]]["lane"]=="HISTORICAL_PASTORAL_HOLD")
    assert r["triageReasons"]==queued[r["turnId"]]["reviewReasons"]
    assert r["ownerQuestionIdentityStatus"] in (
      "QUESTION_TRANSCRIPTION_NORMALIZED_EXACT",
      "QUESTION_TRANSCRIPTION_HIGH_SIMILARITY_REQUIRES_MANUAL_REVIEW",
      "QUESTION_TRANSCRIPTION_MISMATCH_HOLD")
    assert 0<=r["ownerToWitnessQuestionSimilarity"]<=1
    assert "originalDraftEN" not in r and "originalDraftFR" not in r
assert len(seen)==len(qids)==100
assert set(known)==seen
assert set(queued)==seen
first=next(x for x in source["records"] if x["sourceQid"]=="PX1905-Q567")
assert "martirio" in first["italianAnswerFromWitness"].casefold()
assert "battesimo" in first["italianAnswerFromWitness"].casefold()
print("PASS SPX_P33_100_SOURCE_WITNESSES",json.dumps({
 "openingQuestions":100,"uniqueOriginalItalianAnswers":100,
 "normalizedExactQuestions":c["normalizedExactQuestionIdentities"],
 "identityHolds":c["questionIdentityMismatchesOrHolds"],
 "historicalPastoralHolds":30,
 "multiSourceQuestionHolds":c["multipleSourceReferenceOpeningHolds"],
 "bilingualClaimsApproved":0,"printFacsimileApproved":0,"published":0
}))
