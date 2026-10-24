#!/usr/bin/env python3
"""Save B53 all383 review UI in an UNPUBLISHED GitHub draft Release, never git."""
from pathlib import Path
import hashlib,json,os,subprocess,tempfile
ROOT=Path("data/research")
HTML=Path("previews/sacred-art-b53-review-all383-placement-offline.html")
REPORT=ROOT/"sacred-art-b53-383-review-image-audit.json"
INDEX=ROOT/"sacred-art-b53-all383-placement-index.json"
REPO="Fulcanelli13/ad-orientem"
def gh(*args):
    p=subprocess.run(["gh",*args],capture_output=True,text=True,check=True)
    return p.stdout.strip()
def sha(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for part in iter(lambda:f.read(1048576),b""):h.update(part)
    return h.hexdigest()
def main():
    assert os.environ.get("GH_TOKEN") and os.environ.get("GITHUB_RUN_ID")
    j=json.loads(REPORT.read_text(encoding="utf-8"))
    assert j["schema"]=="AO_B53_FULL_383_CANONICAL_ORDER_PLACEMENTS_OFFLINE_V1"
    assert j["batch_size"]==383 and j["placement_decisions_automatically_marked_yes_or_no"]==0
    assert j["images_actually_embedded_and_SHA_verified"]>=300
    assert j["source_research_images_newly_downloaded_from_original_providers"]==0
    assert j["cost_eur"]==0
    assert HTML.stat().st_size==j["offline_HTML_bytes"]
    tag=f'ao-art-review-b53-all383-placements-{os.environ["GITHUB_RUN_ID"]}-1'
    notes=("PRIVATE 383-artwork review — original canonical order. "
      "Visual yes/no/unsure painting opinions, independent yes/no per proposed "
      "Ad Orientem placement and your own custom destination text field. "
      "Some artworks have no photograph and remain explicit source holds. "
      "Save by Export review JSON. No permanent source identity, artwork "
      "selection, commercial photo reuse or application publication is "
      "approved here. No-cost archived review preview; images are embedded "
      "derivatives of research originals, not published app assets.")
    gh("release","create",tag,"--repo",REPO,"--draft",
       "--target",os.environ["GITHUB_SHA"],
       "--title","Ad Orientem — Sacred Art complete placement review, all 383 active artworks",
       "--notes",notes)
    gh("release","upload",tag,str(HTML),"--repo",REPO)
    remote=json.loads(gh("release","view",tag,"--repo",REPO,"--json","isDraft,assets,url"))
    assert remote["isDraft"] is True
    assets=[a for a in remote["assets"] if a["name"]==HTML.name]
    assert len(assets)==1 and assets[0]["size"]==HTML.stat().st_size
    with tempfile.TemporaryDirectory(prefix="b52-private-review-readback-") as d:
        gh("release","download",tag,"--repo",REPO,"--pattern",HTML.name,"--dir",d)
        copied=Path(d)/HTML.name
        assert copied.read_bytes()==HTML.read_bytes()
        assert sha(copied)==sha(HTML)
    j.update({
      "review_private_draft_release_tag":tag,
      "review_private_draft_release_url":remote["url"],
      "review_file_name":HTML.name,
      "review_HTML_SHA256":sha(HTML),
      "remote_re_read_verification":True,
      "private_100_review_file_committed_to_public_git":False
    })
    REPORT.write_text(json.dumps(j,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    INDEX.write_text(json.dumps({k:v for k,v in j.items() if k!="images"},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("B53_PRIVATE_REVIEW_VERIFIED",json.dumps({
      "release":remote["url"],"tag":tag,"name":HTML.name,
      "bytes":HTML.stat().st_size,"sha256":sha(HTML),
      "verified_images":j["images_actually_embedded_and_SHA_verified"],
      "missing_images":j["cases_without_displayable_image"],
      "placements":j["total_placement_proposals"]
    }),flush=True)
if __name__=="__main__":main()
