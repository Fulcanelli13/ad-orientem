#!/usr/bin/env python3
"""Copy exactly four P105 SHA-locked staged WebPs into canonical media; never reencode."""
import hashlib
import json
import subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/directory/research/p106-four-photo-approved-media-input.json"
OUTPUT=ROOT/"data/directory/research/p106-four-approved-bytes-audit.json"
def git_read(commit,path):
    return subprocess.run(["git","show",commit+":"+path],cwd=ROOT,check=True,capture_output=True).stdout
def digest(content):
    return hashlib.sha256(content).hexdigest()
def main():
    manifest=json.loads(INPUT.read_text(encoding="utf-8"))
    assert manifest["schema"]=="AO_P106_FOUR_EDITORIALLY_CHOSEN_DIRECTORY_COVERS_INPUT_V1"
    commit=manifest["p105_source_staged_commit"]
    if len(commit)!=40 or any(c not in "0123456789abcdef" for c in commit):
        raise ValueError("Unpinned input commit")
    build=json.loads(git_read(commit,manifest["p105_build"]))
    if build["schema"]!="AO_P105_SEVEN_CHECKSUM_VERIFIED_WEBP_STAGING_RESULTS_V1":
        raise ValueError("Unexpected P105 staging schema")
    if build["status"]!="STAGING_ONLY_NO_APPROVAL_NO_APP_VISIBILITY":
        raise ValueError("P105 stage not certified research-only")
    photos=manifest["records"]
    if len(photos)!=4 or {x["row"] for x in photos}!={349,356,375,380}:
        raise ValueError("Unexpected selection; preserve editorial holds")
    results=[]
    for item in photos:
        original=next((p for p in build["records"] if p["row"]==item["row"]),None)
        if original is None or original["place_id"]!=item["place_id"]:
            raise ValueError("Place/source mismatch")
        for ours,theirs in [
            ("source_sha1","source_sha1_verified"),
            ("sha256","staged_sha256"),
            ("source_path","staged_path"),
            ("bytes","staged_bytes")]:
            if item[ours]!=original[theirs]:
                raise ValueError("P105 source metadata mismatch "+item["place_id"]+" "+ours)
        if [item["width"],item["height"]]!=original["staged_dimensions"]:
            raise ValueError("P105 dimensions mismatch")
        if original["status"]!="STAGED_ONLY_NOT_APPROVED":
            raise ValueError("Upstream stage unexpectedly approved")
        if not item["approved_path"].startswith("assets/approved/place-media/"):
            raise ValueError("Only canonical approved-media destination permitted")
        raw=git_read(commit,item["source_path"])
        if digest(raw)!=item["sha256"] or len(raw)!=item["bytes"] or raw[:4]!=b"RIFF" or raw[8:12]!=b"WEBP":
            raise ValueError("Binary digest, length or format mismatch")
        dest=ROOT/item["approved_path"]
        dest.parent.mkdir(parents=True,exist_ok=True)
        if dest.exists() and dest.read_bytes()!=raw:
            raise ValueError("Refuse overwriting different photo")
        dest.write_bytes(raw)
        results.append({"row":item["row"],"place_id":item["place_id"],"source_git_commit":commit,
                        "from":item["source_path"],"to":item["approved_path"],
                        "sha256":digest(raw),"bytes":len(raw),"width":item["width"],
                        "height":item["height"],"source_sha1":item["source_sha1"],
                        "byte_identical":True,"reencoded":False})
    audit={"schema":"AO_P106_EXACT_FOUR_WEBP_BYTES_AUDIT_V1",
           "source_p105_commit":commit,"status":"PROPOSED_PR_NOT_DEPLOYED",
           "copied":4,"records":results,"approved_media_registry_separate_gate":True}
    OUTPUT.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("P106 PASS: four byte-identical source-pinned WebPs; no reencoding")
if __name__=="__main__":
    main()
