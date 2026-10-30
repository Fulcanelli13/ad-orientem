#!/usr/bin/env python3
"""P108 copy of exactly one source-verified P107 Jihlava WebP. No transcoding."""
import hashlib
import json
import subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
CONFIG=ROOT/"data/directory/research/p108-jihlava-source-locked-approved-cover-input.v1.json"
AUDIT=ROOT/"data/directory/research/p108-jihlava-approved-cover-byte-audit.v1.json"
def git_blob(commit,path):
    return subprocess.run(["git","show",commit+":"+path],cwd=ROOT,check=True,capture_output=True).stdout
def digest(data,algo="sha256"):
    return hashlib.new(algo,data).hexdigest()
def main():
    m=json.loads(CONFIG.read_text(encoding="utf-8"))
    if m["schema"]!="AO_P108_JIHLAVA_SOURCE_LOCKED_COVER_INPUT_V1": raise ValueError("Schema mismatch")
    commit=m["exact_research_source_commit"]
    if len(commit)!=40 or any(c not in "0123456789abcdef" for c in commit): raise ValueError("Commit SHA not immutable")
    p=m["record"]
    if p["row"]!=309 or p["place_id"]!="place:CZ:st-ignatius-jihlava": raise ValueError("Wrong church")
    archived=json.loads(git_blob(commit,m["source_audit_path"]))
    if archived["status"]!="RESEARCH_ONLY_NO_APPROVED_PLACE_MEDIA" or len(archived["records"])!=1:
        raise ValueError("P107 stage provenance missing")
    source=archived["records"][0]
    if source["row"]!=309 or source["place_id"]!=p["place_id"] or not source["no_crop"]:
        raise ValueError("Stage image is wrong site or cropped")
    for r,v in [
      ("original_sha1_verified",p["source_sha1"]),
      ("staged_sha256",p["derivative_sha256"]),
      ("staged_bytes",p["derivative_bytes"]),
      ("staged_path",p["staged_webp_path"])
    ]:
        if source[r]!=v: raise ValueError("Pinned P107 metadata changed: "+r)
    raw=git_blob(commit,p["staged_webp_path"])
    if digest(raw)!=p["derivative_sha256"] or len(raw)!=p["derivative_bytes"]:
        raise ValueError("Actual source WebP does not match SHA256 and length")
    if raw[:4]!=b"RIFF" or raw[8:12]!=b"WEBP" or source["staged_dimensions"]!=[p["width"],p["height"]]:
        raise ValueError("Wrong binary encoding or image dimensions")
    dest=ROOT/p["approved_asset_path"]
    if not p["approved_asset_path"].startswith("assets/approved/place-media/"):
        raise ValueError("Invalid approved destination")
    dest.parent.mkdir(parents=True,exist_ok=True)
    if dest.exists() and dest.read_bytes()!=raw: raise ValueError("Refuse different existing asset")
    dest.write_bytes(raw)
    audit={"schema":"AO_P108_ONE_EXACT_JIHLAVA_WEBP_BYTE_AUDIT_V1",
       "source_commit":commit,"stage":"DRAFT_PR_ONLY_NOT_MERGED",
       "place_id":p["place_id"],"source":p["staged_webp_path"],
       "approved_path":p["approved_asset_path"],
       "source_original_sha1":p["source_sha1"],"approved_sha256":digest(raw),
       "bytes":len(raw),"dimensions":[p["width"],p["height"]],
       "byte_identical":True,"reencoded":False,
       "media_ledger_updated_independently":False}
    AUDIT.write_text(json.dumps(audit,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("P108 Jihlava SHA256 exact verified",audit["approved_sha256"],audit["bytes"])
if __name__=="__main__": main()
