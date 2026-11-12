#!/usr/bin/env python3
"""Validate the 28 recovered Atlas photos in Git staging; never promote covers."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "data/directory/research/tlm-28-release-candidate-staged-20261112.v1.json").read_text())
contact = json.loads((ROOT / "data/directory/research/tlm-28-contact-index-staged-20261112.v1.json").read_text())
approved = json.loads((ROOT / "data/directory/approved-venue-media.v1.json").read_text())
physical = json.loads((ROOT / "data/directory/generated/cl2-physical-site-index.v1.json").read_text())
geography = json.loads((ROOT / "data/geography/seed-registry.v1.json").read_text())

assert manifest["schema"] == "AO_TLM_28_VERIFIED_WEBP_TRANSFER_AND_APPROVAL_GATES_V1"
records = manifest["entries"]
assert len(records) == len(contact["entries"]) == 28
by_anchor = {r["cl2_anchor"]: r for r in records}
assert len(by_anchor) == 28
assert len({r["venue_id"] for r in records}) == 28
assert "RG-A1C02A9EC71D" not in by_anchor, "Lewiston hold must stay excluded"
assert manifest["summary"]["publication_approved"] == 0
known = {r[0]: r[1] for r in physical["records"]}
approved_ids = {r["venue_id"] for r in approved["items"]}
linked_ids = {r["venue_id"] for r in geography["directoryPlaceLinks"]}
for r in records:
    anchor, venue = r["cl2_anchor"], r["venue_id"]
    rel = r["package_asset_path"]
    assert venue in known.get(anchor, []), "CL2/Directory mismatch: " + anchor
    assert venue not in approved_ids and venue not in linked_ids, "Existing approved link: " + anchor
    assert rel == "assets/staged/directory-photo-recovery-20261111/" + anchor + ".webp"
    assert r["status"] == "STAGED_NOT_APPROVED" and not r["publication_approved"]
    assert not r["rights_verified"] and not r["subject_verified"] and not r["crop_reviewed"]
    payload = (ROOT / rel).read_bytes()
    assert payload[:4] == b"RIFF" and payload[8:12] == b"WEBP"
    assert len(payload) == 8 + int.from_bytes(payload[4:8], "little")
    assert hashlib.sha256(payload).hexdigest() == r["derivative_sha256"], "Checksum: " + anchor
for row in contact["entries"]:
    original = by_anchor[row["cl2_anchor"]]
    assert row["venue_id"] == original["venue_id"]
    assert row["asset_path"] == original["package_asset_path"]
    assert row["sha256"] == original["derivative_sha256"]
print("PASS: 28 exact binaries + CL2 links + contact index; Lewiston excluded; zero approvals")
