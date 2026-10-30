#!/usr/bin/env python3
"""P109 exactly copy Jihlava approved photo from P107 permanent research archive on main."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
CONFIG=ROOT/"data/directory/research/p108-jihlava-source-locked-approved-cover-input.v1.json"
AUDIT=ROOT/"data/directory/research/p108-jihlava-approved-cover-byte-audit.v1.json"
def h(raw,algo="sha256"): return hashlib.new(algo,raw).hexdigest()
def main():
 m=json.loads(CONFIG.read_text(encoding="utf-8"));p=m["record"]
 if m["schema"]!="AO_P108_JIHLAVA_SOURCE_LOCKED_COVER_INPUT_V1":raise ValueError("Wrong release manifest")
 if p["place_id"]!="place:CZ:st-ignatius-jihlava" or p["row"]!=309:raise ValueError("Wrong source site")
 original=(ROOT/p["source_original_path"]).read_bytes()
 if h(original,"sha1")!=p["source_sha1"]:raise ValueError("Original source SHA1 changed")
 raw=(ROOT/p["staged_webp_path"]).read_bytes()
 if h(raw)!=p["derivative_sha256"] or len(raw)!=p["derivative_bytes"]:raise ValueError("WebP source hash/size changed")
 if raw[:4]!=b"RIFF" or raw[8:12]!=b"WEBP":raise ValueError("Source not WebP")
 if p["approved_asset_path"]!="assets/approved/place-media/CZ-st-ignatius-jihlava.webp":raise ValueError("Unexpected destination")
 target=ROOT/p["approved_asset_path"];target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists() and target.read_bytes()!=raw:raise ValueError("Cannot replace different approved photo")
 target.write_bytes(raw)
 j={"schema":"AO_P108_ONE_EXACT_JIHLAVA_WEBP_BYTE_AUDIT_V1","source_commit":m["exact_research_source_commit"],
    "stage":"DRAFT_PR_ONLY_NOT_MERGED","place_id":p["place_id"],
    "source":p["staged_webp_path"],"approved_path":p["approved_asset_path"],
    "source_original_sha1":p["source_sha1"],"approved_sha256":h(raw),
    "bytes":len(raw),"dimensions":[p["width"],p["height"]],
    "byte_identical":True,"reencoded":False,"media_ledger_updated_independently":True,
    "clean_rebase_note":"Restored from same SHA-pinned source on latest main with Hannover Place preserved"}
 AUDIT.write_text(json.dumps(j,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 print("P109 passed",j["approved_sha256"],j["bytes"])
if __name__=="__main__":main()
