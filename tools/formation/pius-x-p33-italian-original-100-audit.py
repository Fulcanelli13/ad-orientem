#!/usr/bin/env python3
"""P1.33 Italian primary-text witness acquisition for 100 research-only openings.

Fetches the existing 1905 Museo San Pio X *digital transcription* and
reuses the already-reviewed full 1905 Q&A extraction routine.
Only original source Q&A and factual provenance are stored. All editorial
English/French replies remain in the unchanged original source-owner files.
Source presence and matching a question's wording are NOT translated-claim
approval, print-facsimile collation, or evidence of Pius X personal authorship.
"""
import argparse
import difflib
import hashlib
import json
from pathlib import Path
import runpy
import unicodedata
import re

ROOT = Path("artifacts/pius-x-study-expanded")
RESEARCH = Path("data/learn/research")
PARSER = Path("tools/formation/extract-pius-x-1905-crosswalk.py")
SOURCE_URL = ("https://www.museosanpiox.it/documenti-scritti-da-pio-x/"
              "il-catechismo-maggiore-di-san-pio-x/parte-quarta-dei-sacramenti/")
SLUG = "parte-quarta-dei-sacramenti/"


def normalize(text):
    text = unicodedata.normalize("NFKD", text.casefold())
    text = "".join(c for c in text if not unicodedata.combining(c))
    return " ".join(re.findall(r"\w+", text, flags=re.UNICODE))


def fingerprint(text):
    return hashlib.sha256(normalize(text).encode("utf-8")).hexdigest()


def source_rows(raw_html):
    """Borrow the *existing* validated parser; don't invent new Q numbering."""
    p = runpy.run_path(str(PARSER))
    records = p["extract_long"](raw_html, SLUG, 517, 855)
    if len(records) != 339 or [r["n"] for r in records] != list(range(517, 856)):
        raise ValueError("Original Italian 1905 sacrament text is not sequential 517–855")
    return {row["id"]: row for row in records}


def fetch_source():
    p = runpy.run_path(str(PARSER))
    return p["fetch"](SOURCE_URL)


def build(html):
    owners = json.loads((RESEARCH /
      "pius-x-100answer-editorial-release-triage-20261020.v1.json").read_text())
    cross = json.loads((ROOT /
      "SPX_P32_Bulk200_Source_Question_Crosswalk.json").read_text())
    historical = json.loads((RESEARCH /
      "pius-x-200answer-spx-chanoine-denzinger-crosswalk-20261020.v1.json").read_text())
    assert len(owners["records"]) == 100
    assert len(cross["turns"]) == 200
    assert len(historical["answerEvidence"]) == 200
    cross_index = {r["turnId"]: r for r in cross["turns"]}
    historic_index = {r["answerTurnId"]: r for r in historical["answerEvidence"]}
    witness = source_rows(html)
    family_sources = {}
    loaded_owner_paths = set()
    for row in historical["answerEvidence"]:
        if row["turnIndex"] != 1:
            continue
        path = row["originalAnswerOwner"]["path"]
        if path not in loaded_owner_paths:
            loaded_owner_paths.add(path)
            content = json.loads(Path(path).read_text())
            for fam in content["records"]:
                if fam["id"] in family_sources:
                    raise ValueError("Owner source family duplicated")
                family_sources[fam["id"]] = fam
    assert len(loaded_owner_paths) == 10, len(loaded_owner_paths)
    assert len(family_sources) == 100, len(family_sources)

    records, mismatch = [], []
    lanes = {}
    claim_candidates = 0
    for triage in owners["records"]:
        turn_id = triage["turnId"]
        row = cross_index[turn_id]
        owner = historic_index[turn_id]
        fam = family_sources[row["familyId"]]
        source = fam["source"]
        if source["questionId"] != triage["id"]:
            raise ValueError("Original editorial question ID mismatch: " + turn_id)
        if row["source1905QuestionIds"][0] != source["questionId"]:
            raise ValueError("Reconciliation source ID differs from owner")
        original_question = source["originalQuestionItalian"]
        qid = source["questionId"]
        original = witness[qid]
        score = difflib.SequenceMatcher(None, normalize(original_question),
                                        normalize(original["question"])).ratio()
        exact = normalize(original_question) == normalize(original["question"])
        status = ("QUESTION_TRANSCRIPTION_NORMALIZED_EXACT" if exact else
                  "QUESTION_TRANSCRIPTION_HIGH_SIMILARITY_REQUIRES_MANUAL_REVIEW"
                  if score >= 0.93 else
                  "QUESTION_TRANSCRIPTION_MISMATCH_HOLD")
        if not exact:
            mismatch.append({"turnId":turn_id, "sourceQid":qid,
                             "score":round(score, 4), "status":status})
        if original["answer"].strip() == "":
            raise ValueError("Empty original Italian answer in " + qid)
        if triage["originalDraftEN"].strip() == "" or triage["originalDraftFR"].strip() == "":
            raise ValueError("Missing editorial bilingual specimen: " + turn_id)
        lanes[triage["lane"]] = lanes.get(triage["lane"], 0) + 1
        claim_candidates += 1
        records.append({
          "turnId":turn_id,
          "familyId":row["familyId"],
          "sourceQid":qid,
          "sourceUrl":SOURCE_URL,
          "sourceOwner":row["originalOwnerPath"],
          "italianQuestionFromOwner":original_question,
          "italianQuestionFromWitness":original["question"],
          "italianAnswerFromWitness":original["answer"],
          "witnessQuestionFingerprintSha256":fingerprint(original["question"]),
          "witnessAnswerFingerprintSha256":fingerprint(original["answer"]),
          "ownerToWitnessQuestionSimilarity":round(score, 4),
          "ownerQuestionIdentityStatus":status,
          "italianAnswerLocated":True,
          "witnessKind":"MUSEO_1905_DIGITAL_TRANSCRIPTION_NOT_PRINT_FACSIMILE",
          "original1905PrintedQuestionNumber":False,
          "englishFrenchEditorialDraftOwner":row["originalOwnerPath"],
          "englishFrenchClaimAssessment":"UNASSESSED_NEEDS_HUMAN_PARALLEL_TEXT_REVIEW",
          "bilingualTranslationCertified":False,
          "printFacsimileCertified":False,
          "papalAutographSpeechCertified":False,
          "humanDoctrinalAccepted":False,
          "historicalPastoralHold":triage["lane"]=="HISTORICAL_PASTORAL_HOLD",
          "triageLane":triage["lane"],
          "triageReasons":triage["reviewReasons"],
          "publicationApproved":False,
        })
    unique = {r["sourceQid"] for r in records}
    if len(unique) != 100:
        raise ValueError("Opening source IDs are not unique")
    if lanes != {
       "HISTORICAL_PASTORAL_HOLD":30,
       "SOURCE_TRANSLATION_REVIEW":57,
       "PRECISION_REWRITE_REVIEW":13
    }:
        raise ValueError("Original editorial review queue drift: " + str(lanes))
    return {
      "schema":"AO_SPX_P33_ORIGINAL_ITALIAN_100_OPENING_WITNESS_AUDIT_V1",
      "asOf":"2026-10-24",
      "status":"PRIVATE_ORIGINAL_TEXT_ACQUISITION_NOT_CLAIM_CERTIFICATION",
      "sourceUrl":SOURCE_URL,
      "sourceEdition":"1905 Catechismo maggiore, museum digital transcription",
      "sourceDigitalPageRawSha256":hashlib.sha256(html.encode("utf-8")).hexdigest(),
      "extractor":"tools/formation/extract-pius-x-1905-crosswalk.py::extract_long",
      "sourceSectionQuestionsParsed":len(witness),
      "counts":{
        "openingQuestionsAudited":len(records),
        "originalItalianAnswersLocated":sum(r["italianAnswerLocated"] for r in records),
        "normalizedExactQuestionIdentities":sum(
         r["ownerQuestionIdentityStatus"]=="QUESTION_TRANSCRIPTION_NORMALIZED_EXACT"
         for r in records),
        "questionIdentityMismatchesOrHolds":len(mismatch),
        "unverifiedEnglishFrenchEditorialAnswerPairs":claim_candidates,
        "pastoralHistoricalHolds":lanes["HISTORICAL_PASTORAL_HOLD"],
        "sourceTranslationReview":lanes["SOURCE_TRANSLATION_REVIEW"],
        "precisionRewriteReview":lanes["PRECISION_REWRITE_REVIEW"],
        "originalItalianAnswerClaimsFullyCertified":0,
        "englishFrenchTranslationsCertified":0,
        "publicationApprovals":0
      },
      "holds":mismatch,
      "records":records,
      "methodology":{
        "positiveResultMeans":"An original Italian Q&A is present at the expected editorial-number locator in the live museum digital transcription.",
        "positiveResultDoesNotMean":"The English/French editorial draft is entailed by the source, the 1905 photographed print edition has been checked, or the answer personally authored/spoken by Sarto.",
        "originalTextRights":"Historical Italian 1905 source text retained privately in an ephemeral CI artifact for manual comparison.",
        "websiteChanges":"Full-page SHA256 and each question/answer SHA256 enable later change detection; hashes of text after normalized Unicode formatting.",
        "nextClaimGate":"Independent bilingual clause-by-clause comparison with the Italian answer, careful handling of private moral cases and 1905-vs-current disciplinary changes."
      }
    }


def selftest():
    # A tiny controlled source fixture, not copied from a live page.
    src = "<body>"+ "".join(f"<p>{n} D. Domanda {n}?</p><p>R. Risposta {n}.</p>"
               for n in range(517,856))+"</body>"
    parsed = source_rows(src)
    assert len(parsed)==339
    assert parsed["PX1905-Q567"]["answer"]=="Risposta 567."
    assert normalize("L’età di oggi?")==normalize("L'ETA' DI OGGI")
    print("PASS SPX_P33_SOURCE_PARSER_SELFTEST",len(parsed))


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--selftest",action="store_true")
    parser.add_argument("--output",default=str(ROOT/"SPX_P33_OriginalItalian_100_Opening_Audit.json"))
    args=parser.parse_args()
    if args.selftest:
        selftest()
    else:
        html=fetch_source()
        result=build(html)
        destination=Path(args.output)
        destination.parent.mkdir(parents=True,exist_ok=True)
        destination.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
        print("PASS SPX_P33_ORIGINAL_ITALIAN_100",json.dumps({
            "path":str(destination),"counts":result["counts"],
            "sourceRawSha256":result["sourceDigitalPageRawSha256"],
            "allClaimsApproved":False
        }))
