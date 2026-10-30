#!/usr/bin/env python3
"""P102: promote exact, visually reviewed P101 WebP bytes; no transcoding."""
import hashlib
import json
import subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/directory/research/p102-three-photo-approved-media-source-lock.json"
OUTPUT=ROOT/"data/directory/research/p102-three-photo-approved-bytes-audit.json"

def git_read(commit,path):
    return subprocess.run(["git","show",commit+":"+path],cwd=ROOT,capture_output=True,check=True).stdout

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main():
    j=json.loads(INPUT.read_text())
    if j["schema"]!="AO_P102_THREE_SOURCE_LOCKED_CHURCH_COVERS_RELEASE_INPUT_V1":
        raise ValueError("Wrong production media input")
    commit=j["source_p101_staged_commit"]
    if len(commit)!=40 or any(k not in "0123456789abcdef" for k in commit):
        raise ValueError("Invalid source commit")
    archive=json.loads(git_read(commit,j["source_p101_results"]))
    if archive["status"]!="STAGING_ONLY_NO_APPROVAL_NO_APP_VISIBILITY":
        raise ValueError("Source is not P101 staged state")
    if len(j["records"])!=3: raise ValueError("Not exactly three approved candidates")
    rows=[]
    for p in j["records"]:
        sr=next((s for s in archive["records"] if s["place_id"]==p["place_id"]),None)
        if not sr or sr["staged_sha256"]!=p["sha256"] or sr["source_sha1_verified"]!=p["source_sha1"]:
            raise ValueError("P101 provenance mismatch "+p["place_id"])
        if sr["staged_dimensions"]!=[p["width"],p["height"]] or sr["staged_bytes"]!=p["bytes"]:
            raise ValueError("P101 dimensions/length mismatch")
        if sr["status"]!="STAGED_ONLY_NOT_APPROVED":
            raise ValueError("Source not staged")
        if not p["approved_path"].startswith("assets/approved/place-media/"):
            raise ValueError("Path outside canonical place-media")
        raw=git_read(commit,p["source_path"])
        if sha(raw)!=p["sha256"] or len(raw)!=p["bytes"] or raw[:4]!=b"RIFF" or raw[8:12]!=b"WEBP":
            raise ValueError("WebP binary digest/signature mismatched")
        dest=ROOT/p["approved_path"]
        dest.parent.mkdir(parents=True,exist_ok=True)
        if dest.exists() and dest.read_bytes()!=raw:
            raise ValueError("Existing approved asset differs; never overwrite silently")
        dest.write_bytes(raw)
        rows.append({"place_id":p["place_id"],"source_commit":commit,"from":p["source_path"],"to":p["approved_path"],"sha256":sha(raw),"bytes":len(raw),"source_sha1":p["source_sha1"],"width":p["width"],"height":p["height"],"copy_exact":True,"reencoded":False})
    out={"schema":"AO_P102_PHOTO_SOURCE_BYTES_RELEASE_AUDIT_V1","source_p101_commit":commit,"stage":"PR_BRANCH_NOT_DEPLOYED","copied":len(rows),"records":rows,"production_media_requires_separate_approved_registry_entry":True}
    OUTPUT.write_text(json.dumps(out,indent=2)+"\n")
    print("P102 PASS: exact WebP byte copies; SHA-256, native provenance and dimensions preserved")
if __name__=="__main__": main()
