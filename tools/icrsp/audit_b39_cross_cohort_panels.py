#!/usr/bin/env python3
"""B39 exact cross-cohort ICRSP commentary-panel audit.

Mechanical integrity only: hashes and host labels cannot authenticate a
printed author, establish a 1962 norm, confer text rights, or approve content.
Never persist source prose.
"""
import argparse
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

FILES = (
    ("B21", "icrsp-france-b21-140-automated-commentary-signals.v1.json", 140, 535),
    ("B23", "icrsp-france-b23-233-automated-commentary-signals.v1.json", 233, 1072),
    ("B29", "icrsp-france-b29-200-automated-commentary-signals.v1.json", 200, 551),
    ("B32", "icrsp-france-b32-final210-automated-signals.v1.json", 210, 761),
)
SHA = re.compile(r"^[0-9a-f]{64}$")
FORBIDDEN = {"bodyText", "fullText", "bodyHtml", "html", "sourceProse", "verbatim"}
HISTORICAL = ("avant 1955", "avant pie xii", "office", "matines", "octave")

def canon_label(label):
    return "".join(c for c in unicodedata.normalize("NFD", label.casefold())
                   if unicodedata.category(c) != "Mn")

def family(label, machine_hint):
    n = canon_label(label + " " + (machine_hint or ""))
    if "francois de sales" in n or "salesian" in n:
        return "FRANCIS_DE_SALES_HOST_ATTRIBUTION_UNVERIFIED"
    if "gueranger" in n or "annee liturgique" in n:
        return "GUERANGER_HOST_ATTRIBUTION_FROMAGE_CONTINUATION_CHECK"
    if "schuster" in n or "sacramentorum" in n:
        return "SCHUSTER_LIBER_SACRAMENTORUM_EDITION_CHECK"
    if "parsch" in n:
        return "PARSCH_GUIDE_LITURGIQUE_EDITION_CHECK"
    if "lefevre" in n or "lefebvre" in n:
        return "LEFEBVRE_MISSAL_EDITION_CHECK"
    if "presentation" in n:
        return "WEBSITE_PRESENTATION_UNATTRIBUTED"
    if "office du jour" in n or "matines" in n:
        return "OFFICE_OR_LITURGICAL_TEXT_SCOPE_CHECK"
    if "la messe" in n or "propre" in n or "ordo" in n:
        return "LITURGICAL_FORMULARY_UNATTRIBUTED"
    return "OTHER_HOST_PANEL_PROVENANCE_CHECK"

def verify_prohibited_raw_prose(panel):
    assert not any(k in panel for k in FORBIDDEN), "Raw copyrighted prose key found"

def build(directory):
    directory = Path(directory)
    articles = []
    panel_rows = []
    sources = {}
    counts = Counter()
    seen_article = set()
    mismatches = []
    for tag, filename, expected_articles, expected_panels in FILES:
        raw = (directory / filename).read_bytes()
        obj = json.loads(raw)
        if "publicationApproved" in obj:
            assert obj["publicationApproved"] is False
        if "sourceProseCopied" in obj:
            assert obj["sourceProseCopied"] is False
        if "rawFrenchCommentaryStored" in obj:
            assert obj["rawFrenchCommentaryStored"] is False
        rows = obj["records"]
        assert len(rows) == expected_articles, (tag, len(rows))
        panel_count = 0
        for article in rows:
            aid = article["articleId"]
            assert aid not in seen_article, ("Repeated article in cohorts", aid)
            seen_article.add(aid)
            panels = article["panels"]
            assert isinstance(panels, list) and panels, ("No panels", aid)
            assert article["sourceUrl"].split("article=")[-1] == aid
            if article.get("panelCountMatchesMetadata") is False:
                assert article.get("originalPanelCountFromMetadata") is not None
                assert len(panels) == article["originalPanelCountFromMetadata"] + 1, aid
                mismatches.append(aid)
            source_rec = {"articleId": aid, "sourceUrl": article["sourceUrl"],
                          "sourceTitle": article["sourceTitle"], "section": article["section"],
                          "sourceCohort": tag, "panelCount": len(panels),
                          "htmlSha256": article.get("htmlSha256")}
            articles.append(source_rec)
            sources[aid] = source_rec
            for panel in panels:
                verify_prohibited_raw_prose(panel)
                sha = panel["bodySha256"]
                assert SHA.fullmatch(sha), ("Invalid body hash", aid)
                label = panel.get("hostWorkLabel", "")
                ordinal = panel["blockOrdinal"]
                assert isinstance(ordinal, int) and ordinal >= 0
                chars = panel.get("normalizedBodyCharCount")
                assert isinstance(chars, int) and chars >= 0
                flags = sorted((panel.get("topicSignals") or {}).keys())
                assert not panel.get("claimApproved", False), ("Unexpected owner approved claim", aid)
                assert not panel.get("editoriallyReviewed", False), ("Unexpected editorial certification", aid)
                work = family(label, panel.get("candidateWorkFamily"))
                panel_rows.append({
                    "panelRef": f"{aid}#{ordinal}", "articleId": aid,
                    "sourceCohort": tag, "section": article["section"],
                    "ordinal": ordinal, "bodySha256": sha, "hostWorkLabel": label,
                    "candidateWorkFamily": work, "normalizedBodyChars": chars,
                    "lexicalSignalFamilies": flags,
                    "originalPrintedEditionVerified": False,
                    "authorshipCertified": False,
                    "rightsCleared": False, "appContentApproved": False
                })
                counts[("family", work)] += 1
                for key in flags: counts[("signal", key)] += 1
                panel_count += 1
        assert panel_count == expected_panels, (tag, panel_count, expected_panels)
        counts[("articles", tag)] = len(rows)
        counts[("panels", tag)] = panel_count
        counts[("inputSHA256", tag)] = hashlib.sha256(raw).hexdigest()
    assert len(seen_article) == 783
    assert len(panel_rows) == 2919
    assert len(mismatches) == 63, ("Expected 63 +1 metadata drifts", len(mismatches))
    assert len(set(mismatches)) == len(mismatches)
    assert {r["panelRef"] for r in panel_rows}.__len__() == len(panel_rows), "Duplicate panel references"
    hashes = defaultdict(list)
    family_rows = defaultdict(list)
    for row in panel_rows:
        hashes[row["bodySha256"]].append(row)
        family_rows[row["candidateWorkFamily"]].append(row)
    duplicates = []
    for sha, group in hashes.items():
        if len(group) < 2: continue
        ids = sorted({x["articleId"] for x in group})
        labels = sorted({x["hostWorkLabel"] for x in group})
        families = sorted({x["candidateWorkFamily"] for x in group})
        duplicates.append({
            "bodySha256": sha, "occurrences": len(group),
            "distinctArticleCount": len(ids), "articleIds": ids,
            "panelRefs": sorted(x["panelRef"] for x in group),
            "hostLabels": labels, "candidateFamilies": families,
            "crossArticle": len(ids) > 1,
            "potentialLabelConflict": len(families) > 1,
            "editorialCertification": False, "contentPublicationApproved": False
        })
    duplicates.sort(key=lambda x: (-x["occurrences"], x["bodySha256"]))
    edition_queue = []
    for fam, rows in sorted(family_rows.items(), key=lambda z: (-len(z[1]), z[0])):
        edition_queue.append({
            "candidateFamily": fam,
            "panelOccurrences": len(rows), "distinctArticleIds": len({x["articleId"] for x in rows}),
            "distinctBodyHashes": len({x["bodySha256"] for x in rows}),
            "hostLabels": sorted(set(x["hostWorkLabel"] for x in rows))[:35],
            "examplePanelRefs": sorted(x["panelRef"] for x in rows)[:12],
            "originalEditionNotYetCollated": True, "workAttributionNotCertified": True,
            "reproductionPermissionNotEstablished": True
        })
    paired_ids = [
        ("a0184_nouveau", "a0514_ancien"),
        ("a0048_nouveau", "a0322_ancien"),
        ("a0050_nouveau", "a0324_ancien"),
        ("a0047_nouveau", "a0321_ancien"),
        ("a0056_nouveau", "a0330_ancien")
    ]
    per_article = defaultdict(set)
    for row in panel_rows:
        per_article[row["articleId"]].add(row["bodySha256"])
    known_dup = [{
        "articleIds": [a, b],
        "commonNormalizedBodyHashes": len(per_article[a] & per_article[b]),
        "comparisonIsHashOnly": True
    } for a, b in paired_ids]
    mary = ["a0071_nouveau","a0072_nouveau","a0073_nouveau",
            "a0074_nouveau","a0075_nouveau"]
    assert all(a in per_article for a in mary)
    saturday_shared = set.intersection(*(per_article[a] for a in mary))
    totals = {
        "sourceArticleIds": 783, "panelOccurrences": len(panel_rows),
        "legacyMetadataPanelCount": 2856,
        "newlyObservedPanelOccurrences": len(panel_rows) - 2856,
        "b29AddedSalesianPanels": 24, "b32AddedSalesianPanels": 39,
        "metadataDriftArticleCount": len(mismatches),
        "distinctNormalizedBodyHashes": len(hashes),
        "repeatedBodyHashGroups": len(duplicates),
        "repeatedPanelOccurrences": sum(len(g) for g in hashes.values() if len(g)>1),
        "extraOccurrencesBeyondUniqueHashes": len(panel_rows)-len(hashes),
        "crossArticleRepeatedBodyGroups": sum(x["crossArticle"] for x in duplicates),
        "mixedCandidateWorkFamilyHashGroups": sum(x["potentialLabelConflict"] for x in duplicates),
        "sourceEditionVerified": 0, "rightsCleared": 0,
        "appContentPublished": 0
    }
    summary = {
        "schema": "AO_ICRSP_B39_CROSS_COHORT_PANEL_BODY_HASH_AUDIT_V1",
        "asOf": "2026-10-26", "ownerPR": 1666,
        "scope": "Cross-cohort mechanical panel SHA and host label reconciliation, not critical edition, rights, rubric or app-owner parity.",
        "sourceCohorts": [{ "tag": tag, "filename": name,
            "sourceArticles": expected_articles, "observedPanels": expected_panels,
            "sourceFileSha256": counts[("inputSHA256",tag)] }
            for tag, name, expected_articles, expected_panels in FILES],
        "totals": totals,
        "metadataDriftArticleIds": sorted(mismatches),
        "familyEditorialIntake": edition_queue,
        "topicSignalPanelOccurrences": {k[1]:v for k,v in counts.items() if k[0]=="signal"},
        "duplicateGroups": duplicates,
        "knownCrossSourceDuplicatePairChecks": known_dup,
        "saturdayMarianFiveArticleSharedBodyHashes": sorted(saturday_shared),
        "qualityGates": {
            "allSourceArticleBodiesAutomated": "COMPLETE",
            "allArticleSelectedPassages": "COMPLETE_WITH_ONE_INDEXED_EXCEPTION",
            "crossCohortPanelHashesAndHostLabels": "COMPLETE",
            "printedOriginalEditionAndAuthorship": "OPEN",
            "historicalAnd1962LiturgicalScope": "OPEN",
            "canonicalAppOwnerExactContentParity": "OPEN",
            "copyrightAndTranslationRights": "NOT_CLEARED",
            "editorialPublishing": "NOT_APPROVED"
        },
        "sourceProseCopied": False, "publicationApproved": False
    }
    index = {
        "schema": "AO_ICRSP_B39_FULL2919_PANEL_REFERENCE_INDEX_V1",
        "ownerPR": 1666, "sourceCohortFiles": [n for _,n,_,_ in FILES],
        "scope": "Reference identifiers, host labels, hashes, character counts, lexical signals only. No source prose.",
        "totals": {"articles": len(articles), "panels": len(panel_rows)},
        "articles": sorted(articles, key=lambda x: x["articleId"]),
        "panels": sorted(panel_rows, key=lambda x: (x["articleId"], x["ordinal"])),
        "rightsCleared": False, "originalPrintedEditionVerified": False,
        "publicationApproved": False
    }
    return summary, index

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--source-dir", default="data/source-text")
    p.add_argument("--summary-out", required=True)
    p.add_argument("--index-out", required=True)
    a = p.parse_args()
    summary, index = build(a.source_dir)
    for path, obj in ((a.summary_out, summary), (a.index_out, index)):
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(json.dumps(obj, ensure_ascii=False, indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary["totals"], indent=2))

if __name__ == "__main__":
    main()
