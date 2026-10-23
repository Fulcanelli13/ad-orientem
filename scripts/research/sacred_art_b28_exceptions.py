#!/usr/bin/env python3
"""Evidence-first exception adjudication for the 451-artwork Sacred Art register.

Inputs are verified research CSVs already committed to Git.  No web requests,
image downloads, destructive edits, editorial decisions or publication changes.
"""
import ast
from collections import Counter, defaultdict
import csv
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

R = Path("data/research")
OUT = Path("artifacts/sacred-art-b28-exception-adjudication")
SHARE = "research/b19-original-image-acquisition-probe-20261023"
HASH = re.compile(r"^[a-f0-9]{64}$")
SRCID = re.compile(r"AO-SRC-[A-F0-9]+")


def load(name):
    with (R / name).open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write(path, rows, fields):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def normalized_url(url):
    if not url:
        return ""
    try:
        parts = urlsplit(url.strip())
        if parts.scheme != "https" or not parts.netloc:
            return ""
        return parts.hostname.casefold() + unquote(parts.path).replace("_", " ").rstrip("/").casefold()
    except (ValueError, UnicodeError):
        return ""


def b19_records():
    workflow = Path(".github/workflows/ao-b19-original-image-acquisition.yml").read_text(encoding="utf-8")
    expression = re.search(r"^\s*data\s*=\s*json\.loads\((.+)\)\s*$", workflow, re.MULTILINE)
    assert expression, "B19 source array missing from acquisition workflow"
    text = ast.literal_eval(expression.group(1))
    records = json.loads(text)
    assert len(records) == 12
    return {r["id"]: r for r in records}


def main():
    catalogue = load("sacred-art-catalogue451-after-b25.csv")
    crosswalk = load("sacred-art-b27-451-physical-crosswalk.csv")
    physical = load("sacred-art-b27-physical-image-inventory.csv")
    b23r2 = load("sacred-art-b23r2-commons47.audit.csv")
    legacy = load("sacred-art-b26-legacy108-repo-photo-audit.csv")
    missing = load("sacred-art-missing30-after-b25.csv")
    baseline = json.loads((R / "sacred-art-b27-physical-summary.json").read_text(encoding="utf-8"))

    assert len(catalogue) == len(crosswalk) == 451
    assert len({r["artwork_id"] for r in catalogue}) == 451
    assert len(physical) == 290 and len(b23r2) == 47
    assert len(legacy) == 108 and len(missing) == 30
    assert baseline["archive_file_instances_not_linked_to_canonical_id"] == 45
    assert baseline["active_artwork_ids_without_exact_sha256_linked_archive_file"] == 138
    cat = {r["artwork_id"]: r for r in catalogue}
    phy_sha = {r["sha256"].lower() for r in physical}
    cw = {r["artwork_id"]: r for r in crosswalk}
    assert set(cat) == set(cw)
    source_id_map = {r["asset_source_id"]: r for r in b23r2}
    b19 = b19_records()
    canonical_urls = defaultdict(set)
    for c in catalogue:
        for field in ("legacy_source_url", "legacy_object_url", "b23_source_url",
                      "b23_file_url", "b24_original_url", "b25_source_file_url"):
            norm = normalized_url(c.get(field, ""))
            if norm:
                canonical_urls[norm].add(c["artwork_id"])

    # B27's 45 cases are physically present; determine their originating corpus.
    unlinked = [f for f in physical if f["catalogue_match_count"] == "0"]
    assert len(unlinked) == 45
    unmatched_rows, strict_links = [], []
    for item in unlinked:
        wave, path = item["archive_wave"], item["file_path"]
        extra = {"record_id": "", "source_sheet": "", "asset_source_id": "",
                 "art_title": "", "artist": "", "audit_sha256": "",
                 "audit_sha_matches_binary": "NOT_TESTED", "source_url": "",
                 "source_identity_match": "", "candidate_canonical_ids": "",
                 "triage_status": "", "next_action": ""}
        if wave == "b23r2commons46":
            match = SRCID.search(path)
            sourceid = match.group(0) if match else ""
            audit = source_id_map.get(sourceid)
            assert audit, f"B23R2 physical file lacks same-source-ID audit: {path}"
            extra.update(record_id=audit["record_id"], source_sheet=audit["source_sheet"],
                         asset_source_id=sourceid, art_title=audit["title"],
                         artist=audit["artist"], audit_sha256=audit["sha256"],
                         source_url=audit["source_url"])
            equal = audit["sha256"].lower() == item["sha256"].lower()
            extra["audit_sha_matches_binary"] = "YES" if equal else "NO_HOLD"
            if not equal:
                extra["triage_status"] = "SOURCE_HASH_DISCREPANCY_HOLD"
                extra["next_action"] = "RECHECK_ACQUISITION_AUDIT_AGAINST_ARCHIVED_FILE"
            elif audit["source_sheet"] == "PAINTING CATALOGUE" and audit["record_id"] in cat:
                # Source record claims a canonical painting-catalogue stable ID,
                # and the actual archived image matches that audit SHA.
                canonical_id = audit["record_id"]
                extra["triage_status"] = "DIRECT_STABLE_CATALOGUE_ID_AND_EXACT_FILE_SHA"
                extra["source_identity_match"] = "STABLE_ID_PLUS_BYTE_HASH"
                extra["candidate_canonical_ids"] = canonical_id
                extra["next_action"] = "REGISTER_RESEARCH_SHA_LINK_DO_NOT_APPROVE_PUBLICATION"
                strict_links.append({"artwork_id": canonical_id, "source_id": sourceid,
                                     "sha256": item["sha256"], "wave": wave})
            else:
                extra["triage_status"] = "SEPARATE_SOURCE_RESEARCH_NOT_IN_451_BY_STABLE_ID"
                extra["next_action"] = "RETAIN_AS_SEPARATE_RESEARCH_CANDIDATE_NO_FORCED_IDENTITY"
        elif wave == "b19":
            id_match = re.search(r"B17-\d+", path)
            sourceid = id_match.group(0) if id_match else ""
            audit = b19.get(sourceid)
            assert audit, f"B19 archive lacks original research source ID: {path}"
            urls = [audit.get("url", ""), audit.get("source", "")]
            aliases = sorted({ident for link in urls for ident in canonical_urls.get(normalized_url(link), set())})
            extra.update(record_id=sourceid, source_sheet="B17 SEPARATE HISTORIA ART RESEARCH",
                         asset_source_id=sourceid, art_title=audit["artwork"], artist=audit["artist"],
                         source_url=urls[0] or urls[1], candidate_canonical_ids=" | ".join(aliases),
                         source_identity_match="URL_CANDIDATE_ONLY" if aliases else "NO_CANONICAL_ID_PROVEN")
            extra["triage_status"] = "B19_SEPARATE_CANDIDATE_URL_REVIEW" if aliases else "B19_SEPARATE_CANDIDATE_NO_EXACT_ID"
            extra["next_action"] = "VERIFY_CANONICAL_IDENTITY_BEFORE_LINKING_NO_AUTOMATIC_PROMOTION"
        else:
            raise AssertionError(f"Unexpected unlinked archive wave: {wave}")
        unmatched_rows.append({**item, **extra})
    assert sum(r["archive_wave"] == "b23r2commons46" for r in unmatched_rows) == 37
    assert sum(r["archive_wave"] == "b19" for r in unmatched_rows) == 8
    assert all(r["audit_sha_matches_binary"] != "NO_HOLD" for r in unmatched_rows
               if r["archive_wave"] == "b23r2commons46")
    strict_ids = {r["artwork_id"] for r in strict_links}
    assert len(strict_links) == 2 and len(strict_ids) == 2
    assert all(cw[cid]["verified_distinct_sha256"] == "0" for cid in strict_ids)
    assert all(cat[cid]["frozen_decision"] != "PERMANENTLY_REJECTED" for cid in strict_ids)

    # The 108 preview-only entries have already been checked against tracked Git
    # assets. Repeat the check specifically against all 290 recovered image hashes.
    legacy_rows = []
    for row in legacy:
        id = row["artwork_id"]
        assert id in cat and cw[id]["verified_distinct_sha256"] == "0"
        selected = row["selected_photo_expected_sha256"].lower()
        if selected:
            assert HASH.fullmatch(selected), "Invalid workbook selected SHA " + id
        selected_found = bool(selected and selected in phy_sha)
        highres = bool(cat[id]["legacy_highres_url"])
        urls = bool(cat[id]["legacy_source_url"] or cat[id]["legacy_object_url"])
        if selected_found:
            action = "EXACT_LEGACY_SELECTED_HASH_RECOVERED_MANUAL_RIGHTS_REVIEW"
        elif selected:
            action = "LOCATE_EXACT_HISTORIC_SELECTED_FILENAME_OR_SHA_IN_OWNED_STORES"
        elif highres:
            action = "VERIFY_RECORDED_HIGHRES_URL_RIGHTS_AND_SOURCE_FILE"
        elif urls:
            action = "LOCATE_LEGACY_MASTER_OR_VERIFY_PRECISE_INSTITUTIONAL_OBJECT"
        else:
            action = "LOCATE_ORIGINAL_WORKBOOK_BINARY_AND_PROVENANCE_FIRST"
        legacy_rows.append({
            "artwork_id": id, "title": cat[id]["title"], "artist": cat[id]["artist"],
            "frozen_decision": row["frozen_decision"], "priority": cw[id]["priority"],
            "selected_photo_expected_sha256": selected,
            "selected_photo_expected_filename": row["selected_photo_expected_filename"],
            "selected_hash_matched_archived_file": "YES" if selected_found else "NO",
            "recorded_highres_url": cat[id]["legacy_highres_url"],
            "recorded_object_or_source_url": cat[id]["legacy_object_url"] or cat[id]["legacy_source_url"],
            "legacy_qa_holds": cat[id]["legacy_qa_holds"],
            "legacy_photo_count": cat[id]["legacy_photo_count"],
            "publication_allowed": "NO_NEW_APPROVAL",
            "next_action": action,
        })

    # Already on the canonical no-image list: record exact reason and source,
    # not a speculative new acquisition request.
    missing_rows = []
    for row in missing:
        id = row["artwork_id"]
        assert id in cat and cw[id]["verified_distinct_sha256"] == "0"
        source = row["legacy_object_url"] or row["legacy_source_url"]
        if not source:
            gate = "OBJECT_DISCOVERY_REQUIRED"
        elif row["legacy_qa_holds"] or row["legacy_permission_free_status"] == "NOT VERIFIED":
            gate = "SOURCE_IDENTITY_AND_RIGHTS_CONFIRMATION"
        else:
            gate = "OBJECT_PAGE_KNOWN_IMAGE_FILE_STILL_UNVERIFIED"
        missing_rows.append({
            "artwork_id": id, "title": row["title"], "artist": row["artist"],
            "priority": row["priority"], "recorded_source_page": source,
            "recorded_rights_claim": row["legacy_source_rights_claim"],
            "recorded_permission_status": row["legacy_permission_free_status"],
            "recorded_hold": row["legacy_qa_holds"],
            "source_gate": gate,
            "actual_original_acquired": "NO_RECENT_MATCH",
            "editorial_approval": "NONE_CREATED",
            "next_action": "RESEARCH_EXACT_OBJECT_AND_FILE_RIGHTS_BEFORE_ANY_DOWNLOAD",
        })

    # B27's multiple-ID evidence is preserved as ambiguity; never dedupe artworks.
    aliases = [r for r in physical if int(r["catalogue_match_count"]) > 1]
    assert len(aliases) == 3
    alias_rows = [{
        "archive_wave": r["archive_wave"], "file_path": r["file_path"],
        "sha256": r["sha256"], "catalogue_ids": r["catalogue_ids_with_recorded_hash"],
        "identity_hold": "YES", "resolution": "CHECK_STABLE_OBJECT_ACCESSION_AND_CATALOGUE_ALIASES",
        "automatic_merge_allowed": "NO",
    } for r in aliases]

    active = [r for r in crosswalk if r["frozen_decision"] != "PERMANENTLY_REJECTED"]
    assert len(active) == 383
    report = {
        "catalogue_total": 451,
        "active_total": 383, "frozen_rejected_unmodified": 68,
        "frozen_approved_unmodified": baseline["frozen_approved_preserved"],
        "previously_sha_matched_active": 245,
        "new_provisional_direct_id_and_byte_sha_links": len(strict_ids),
        "active_with_stable_id_and_sha_research_link_after_adjudication": 245 + len(strict_ids),
        "active_without_a_stable_id_sha_research_link_after_adjudication": 138 - len(strict_ids),
        "unlinked_physical_file_instances_reviewed": 45,
        "b23r2_unlinked_files": 37, "b23r2_direct_catalogue_sha_links": len(strict_ids),
        "b23r2_other_research_file_instances": 37 - len(strict_ids),
        "b19_other_research_file_instances": 8,
        "b19_url_only_candidates": sum("URL_REVIEW" in x["triage_status"] for x in unmatched_rows),
        "b23r2_audit_hash_discrepancies": sum(x["audit_sha_matches_binary"] == "NO_HOLD" for x in unmatched_rows),
        "legacy_only_items_reviewed": len(legacy_rows),
        "legacy_only_by_priority": dict(Counter(r["priority"] for r in legacy_rows)),
        "legacy_selected_sha_recorded": sum(bool(r["selected_photo_expected_sha256"]) for r in legacy_rows),
        "legacy_selected_sha_present_in_b26_archives": sum(r["selected_hash_matched_archived_file"] == "YES" for r in legacy_rows),
        "image_less_p2_reviewed": len(missing_rows),
        "image_less_by_source_gate": dict(Counter(r["source_gate"] for r in missing_rows)),
        "physical_sha_with_multiple_catalogue_ids_held": len(alias_rows),
        "editorial_approvals_created": 0, "publication_approvals_created": 0,
        "canonical_master_modified": False,
        "scope": "Research evidence and byte identities, not proof of artwork identity, sufficient reproduction rights, or release approval",
        "source_references": [
            "data/research/sacred-art-catalogue451-after-b25.csv",
            "data/research/sacred-art-b27-451-physical-crosswalk.csv",
            "data/research/sacred-art-b27-physical-image-inventory.csv",
            "data/research/sacred-art-b23r2-commons47.audit.csv",
            "data/research/sacred-art-b26-legacy108-repo-photo-audit.csv",
            "data/research/sacred-art-missing30-after-b25.csv",
            ".github/workflows/ao-b19-original-image-acquisition.yml",
        ],
    }
    OUT.mkdir(parents=True, exist_ok=True)
    write(OUT / "sacred-art-b28-unlinked45-identity-ledger.csv", unmatched_rows, list(unmatched_rows[0]))
    write(OUT / "sacred-art-b28-legacy108-master-recovery.csv", legacy_rows, list(legacy_rows[0]))
    write(OUT / "sacred-art-b28-missing30-object-source-gates.csv", missing_rows, list(missing_rows[0]))
    write(OUT / "sacred-art-b28-multiple-id-holds.csv", alias_rows, list(alias_rows[0]))
    write(OUT / "sacred-art-b28-direct2-sha-links.csv", strict_links, list(strict_links[0]))
    (OUT / "sacred-art-b28-summary.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("B28_EXCEPTION_BULK_RECONCILED", json.dumps(report, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
