#!/usr/bin/env python3
"""Reconcile full sacred-art harvest artifacts; never promote proposals into canonical inventory.
Run after GitHub Actions downloads all parallel harvest archives to artifacts/sacred-art-harvest.
Outputs fully verified original hashes, source provenance and an honest capacity/coverage report.
"""
import argparse, hashlib, json, re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SHA = re.compile(r"^[0-9a-f]{64}$")
GROUPS = ("rosary", "devotion", "calendar", "scripture", "persons")
PREFERRED = "PREFERRED_SOURCE_ORIGINAL"
NGA_ACCEPT = "OFFICIAL_NGA_ORIGINAL_ACQUIRED_TECHNICALLY_ONLY"

def read(path):
    return json.loads(path.read_text(encoding="utf-8"))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--harvest", type=Path, default=ROOT / "artifacts/sacred-art-harvest")
    parser.add_argument("--output", type=Path, default=ROOT / "artifacts/sacred-art-harvest-reconciliation")
    args = parser.parse_args()
    out = args.output
    out.mkdir(parents=True, exist_ok=True)
    registry = read(ROOT / "data/calendar/sacred-art-candidates.v1.json")["artworks"]
    acquired = [a for a in registry if SHA.fullmatch((a.get("acquisition") or {}).get("originalSha256") or "")
                and (a.get("acquisition") or {}).get("archiveOriginal")]
    existing_ids = {a["id"]: a for a in registry}
    existing_hashes = {a["acquisition"]["originalSha256"]: a["id"] for a in acquired}
    if len(existing_hashes) != len(acquired):
        raise RuntimeError("Baseline registry violates unique-original-hash invariant")

    source_reports = []
    candidates = []
    missing_reports = []
    for name in GROUPS:
        path = args.harvest / ("sacred-art-full-wide-" + name) / "acquisition.json"
        if not path.is_file():
            missing_reports.append(name)
            continue
        obj = read(path)
        if obj.get("group") != name or not isinstance(obj.get("artworks"), list):
            raise ValueError("Malformed wide acquisition: " + str(path))
        source_reports.append({"lane":name, "artworkRows":len(obj["artworks"]),
                               "preferredClaimed":obj.get("count",0),
                               "borderlineClaimed":obj.get("borderlineHeldCount",0),
                               "targetsSearched":len(obj.get("coverage",[])),
                               "unresolvedTargets":sum(t.get("status") in ("UNRESOLVED","PARTIAL") for t in obj.get("coverage",[]))})
        for item in obj["artworks"]:
            candidates.append((name, item, args.harvest / ("sacred-art-full-wide-" + name) / "originals" / str(item.get("filename",""))))
    path = args.harvest / "sacred-art-full-nga" / "research.json"
    if path.is_file():
        obj = read(path)
        source_reports.append({"lane":"nga", "artworkRows":len(obj.get("artworks",[])),
                               "preferredClaimed":obj.get("originalsAcquired",0),
                               "titleMatches":obj.get("titleMatches",0),
                               "openAccessPaintingMatches":obj.get("openAccessPaintingMatches",0)})
        for item in obj.get("artworks",[]):
            candidates.append(("nga", item, args.harvest / "sacred-art-full-nga" / str(item.get("filename",""))))
    else:
        missing_reports.append("nga")

    proposals, incidents, seen_ids, seen_hashes = [], [], {}, {}
    counters = Counter()
    for lane, item, source_path in candidates:
        ident = item.get("id")
        original_sha = item.get("sha256") or ""
        if not ident or not SHA.fullmatch(original_sha):
            counters["NOT_ACQUIRED_OR_INVALID_HASH"] += 1
            continue
        if lane != "nga" and item.get("qaTier") != PREFERRED:
            counters["BORDERLINE_HELD"] += 1
            continue
        if lane == "nga" and (item.get("imageUsageStatus") != NGA_ACCEPT or str(item.get("imageOpenAccessFlag")) != "1"):
            counters["NGA_IMAGE_RIGHTS_OR_STATUS_HELD"] += 1
            continue
        if not source_path.is_file() or not source_path.resolve().is_relative_to(args.harvest.resolve()):
            incidents.append({"id":ident,"lane":lane,"reason":"MISSING_OR_OUTSIDE_ARTIFACT_FILE"})
            counters["MISSING_ORIGINAL_FILE"] += 1
            continue
        actual = hashlib.sha256(source_path.read_bytes()).hexdigest()
        if actual != original_sha:
            incidents.append({"id":ident,"lane":lane,"reason":"SHA256_MISMATCH","expected":original_sha,"actual":actual})
            counters["HASH_MISMATCH"] += 1
            continue
        if ident in existing_ids:
            if (existing_ids[ident].get("acquisition") or {}).get("originalSha256") == actual:
                counters["ALREADY_IN_CANONICAL_REGISTRY"] += 1
            else:
                incidents.append({"id":ident,"lane":lane,"reason":"ID_COLLISION_WITH_CANONICAL"})
                counters["COLLISION_HELD"] += 1
            continue
        if actual in existing_hashes:
            counters["EXISTING_IMAGE_HASH_REUSED"] += 1
            continue
        if ident in seen_ids or actual in seen_hashes:
            match = seen_ids.get(ident) or seen_hashes.get(actual)
            if match and match["sha256"] == actual and match["id"] == ident:
                counters["CROSS_LANE_REPEAT"] += 1
            else:
                incidents.append({"id":ident,"lane":lane,"reason":"CROSS_LANE_ID_OR_HASH_COLLISION"})
                counters["COLLISION_HELD"] += 1
            continue
        row = {"id":ident,"title":item.get("title"),"artist":item.get("artist"),
               "sourceLane":lane,"museum":"National Gallery of Art" if lane=="nga" else item.get("imageMuseum"),
               "objectUrl":item.get("sourceUrl"),"originalSha256":actual,
               "archiveOriginal":str(source_path.relative_to(args.harvest)),
               "sourceArtifactName":"sacred-art-full-nga" if lane=="nga" else "sacred-art-full-wide-"+lane,
               "targetId":item.get("targetId"),
               "imageRights":"NGA_IMAGE_OPENACCESS_1" if lane=="nga" else item.get("rights"),
               "pixelWidth":item.get("width"),"pixelHeight":item.get("height"),
               "technicalGate":"SOURCE_HASH_AND_IMAGE_FILTER_PASSED",
               "sourceAndIconographyReview":"PENDING","phoneCropReview":"PENDING",
               "copyrightPublicationGate":"INDEPENDENT_FINAL_CHECK_REQUIRED",
               "productionApproved":False}
        proposals.append(row)
        seen_ids[ident]=row
        seen_hashes[actual]=row
        counters["NEW_VERIFIED_SOURCE_FILES_PROPOSED"] += 1

    proposals.sort(key=lambda x:(x["targetId"] or "",x["id"]))
    report={"schema":"AO_SACRED_ART_FULL_HARVEST_RECONCILIATION_V1",
      "scope":"RESEARCH_ONLY_DO_NOT_ADD_TO_CANONICAL_WITHOUT_SOURCE_REVIEW",
      "baseline":{"paintingRecords":len(registry),"acquiredHashedOriginals":len(acquired),
                  "canonicalUniqueSha256":len(existing_hashes)},
      "harvest":{"lanesExpected":list(GROUPS)+["nga"],"lanesPresent":[r["lane"] for r in source_reports],
                 "missingReports":missing_reports,"reports":source_reports,
                 "rawArtworkRows":len(candidates),"proposedNewHashedOriginals":len(proposals),
                 "postReconciliationTechnicalPotential":len(acquired)+len(proposals),
                 "statuses":dict(counters),"collisionsOrIntegrityIncidents":incidents},
      "calendarCoverage":{"baselineSpecificDays":102,"baselineDays":365,
         "newSpecificDaysVerified":None,
         "note":"Recalculate using observed 1962 DayResolver after association of promoted originals. Do not count titles or newly hashed images as exact calendar coverage."},
      "nextGates":["Review proposed identities against source museum records and original scene","Import eligible hashes/source associations into canonical research registry, preserving artifact run IDs","Run full 1962 year association audit","Generate single negative-exception HTML audit; rights, crop and release remain independent"]}
    (out/"report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    (out/"new-originals-proposals.json").write_text(json.dumps(proposals,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("SACRED_ART_FULL_HARVEST_RECONCILED="+json.dumps(report["harvest"],separators=(",",":"),ensure_ascii=True))
    if incidents:
        raise SystemExit("Integrity incidents detected; leave held until investigated")
    if missing_reports:
        print("WARNING_MISSING_HARVEST_LANES="+",".join(missing_reports))
if __name__=="__main__":
    main()
