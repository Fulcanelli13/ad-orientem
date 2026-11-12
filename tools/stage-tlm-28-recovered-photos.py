#!/usr/bin/env python3
"""Copy the 28 recovered WebPs from the owner ZIP into a cloned Ad Orientem repository.

Research staging only: refuses to write the public approved venue media registry.
Call: python tools/stage-tlm-28-recovered-photos.py --kit /path/to/Ad_Orientem_TLM_28_Ready_To_Integrate_20261112.zip
"""
import argparse
import hashlib
import json
import pathlib
import re
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]

def stage(package):
    with zipfile.ZipFile(package) as archive:
        manifest = json.loads(archive.read("release_manifest.json"))
        assert manifest["schema"] == "AO_TLM_28_VERIFIED_WEBP_TRANSFER_AND_APPROVAL_GATES_V1"
        records = manifest["entries"]
        assert len(records) == len({x["venue_id"] for x in records}) == 28
        # V2 package integrity: the contact sheet must enumerate the exact
        # review set, never the explicitly held Lewiston address conflict.
        assert "RG-A1C02A9EC71D" not in {x["cl2_anchor"] for x in records}
        if "contact_index.json" in archive.namelist():
            contact = json.loads(archive.read("contact_index.json"))
            assert contact["schema"] == "AO_TLM_28_CONTACT_SHEET_INTEGRITY_V2"
            assert contact["count"] == 28
            assert len(contact["entries"]) == 28
            by_anchor = {x["cl2_anchor"]: x for x in records}
            assert len(by_anchor) == 28
            for row in contact["entries"]:
                original = by_anchor[row["cl2_anchor"]]
                assert row["venue_id"] == original["venue_id"]
                assert row["asset_path"] == original["package_asset_path"]
                assert row["sha256"] == original["derivative_sha256"]
        assert len({x["cl2_anchor"] for x in records}) == 28
        assert not any(x["publication_approved"] or x["status"] == "APPROVED" for x in records)
        idx = json.loads((ROOT / "data/directory/generated/cl2-physical-site-index.v1.json").read_text())
        identities = {x[0]: x[1] for x in idx["records"]}
        approved = json.loads((ROOT / "data/directory/approved-venue-media.v1.json").read_text())
        existing = {x["venue_id"] for x in approved["items"]}
        geographic = json.loads((ROOT / "data/geography/seed-registry.v1.json").read_text())
        place_linked = {x["venue_id"] for x in geographic["directoryPlaceLinks"]}
        todo = []
        for item in records:
            anchor, venue, p = item["cl2_anchor"], item["venue_id"], item["package_asset_path"]
            if venue not in identities.get(anchor, []):
                raise ValueError("Exact CL2 venue mismatch: " + anchor)
            if venue in existing or venue in place_linked:
                raise ValueError("Approved-media or Place collision: " + venue)
            if not re.fullmatch(r"assets/staged/directory-photo-recovery-20261111/RG-[A-Z0-9-]+\.webp", p):
                raise ValueError("Unsafe image path: " + p)
            if any(item[k] for k in ("rights_verified", "subject_verified", "crop_reviewed")):
                raise ValueError("An image is incorrectly flagged as approved: " + anchor)
            blob = archive.read(p)
            if not (blob.startswith(b"RIFF") and blob[8:12] == b"WEBP"):
                raise ValueError("Invalid WebP " + anchor)
            if hashlib.sha256(blob).hexdigest() != item["derivative_sha256"]:
                raise ValueError("Changed binary SHA-256 " + anchor)
            target = ROOT / p
            if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() != item["derivative_sha256"]:
                raise ValueError("Conflicting staged image already exists: " + p)
            todo.append((target, blob))
        for target, blob in todo:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(blob)
        meta = ROOT / "data/directory/research/tlm-28-release-candidates-20261112.v1.json"
        meta.parent.mkdir(parents=True, exist_ok=True)
        meta.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
        print("STAGED_ONLY_NOT_PUBLISHED: 28 exact CL2-to-venue WebPs; approved registry unchanged.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--kit", type=pathlib.Path, required=True)
    stage(parser.parse_args().kit)
