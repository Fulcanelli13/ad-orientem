#!/usr/bin/env python3
"""Privately preserve B51 visual review HTML as an unpublished draft Release.

Git research branch gets only metadata; 50 embedded review photos never enter
public git tree. Draft GitHub Release (no price, no public release publication)
stores verified byte-identical HTML. Authenticated project owner can download.
"""
import hashlib,json,os,subprocess,tempfile
from pathlib import Path
ROOT=Path("data/research")
HTML=Path("previews/sacred-art-b51-review-batch-01-of-50-offline.html")
REPORT=ROOT/"sacred-art-b51-batch01-50-source-sha-and-thumb-audit.json"
INDEX=ROOT/"sacred-art-b51-review-batch01-index.json"
REPO="Fulcanelli13/ad-orientem"
def run(*args):
    p=subprocess.run(["gh",*args],check=True,text=True,capture_output=True)
    return p.stdout.strip()
def sha(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for piece in iter(lambda:f.read(1024*1024),b""):h.update(piece)
    return h.hexdigest()
def main():
    assert os.environ.get("GH_TOKEN"),"Repository-scoped token needed to create draft Release"
    audit=json.loads(REPORT.read_text())
    assert audit["source_image_orig_sha_verified"]==50
    assert audit["app_publication_decisions_created"]==0
    assert audit["review_decisions_recorded_by_bot"]==0
    assert HTML.stat().st_size==audit["self_contained_html_bytes"]
    assert 200000<HTML.stat().st_size<16000000
    tag=f'ao-art-review-b51-batch01-{os.environ["GITHUB_RUN_ID"]}-1'
    notes=("PRIVATE REVIEW ONLY. Download HTML and open locally. 50 exact-archive "
       "SHA-verified sacred artwork images are embedded as compressed previews. "
       "Mark Keep image / Change image / Reject artwork / Hold and export decisions JSON. "
       "Neither user decisions nor photographic commercial reuse rights are approved "
       "by this research archive. No app or frozen artwork catalogue changes. Free storage.")
    run("release","create",tag,"--repo",REPO,"--draft",
        "--target",os.environ["GITHUB_SHA"],
        "--title","Ad Orientem Sacred Art — first 50 visual review",
        "--notes",notes)
    run("release","upload",tag,str(HTML),"--repo",REPO)
    check=json.loads(run("release","view",tag,"--repo",REPO,"--json","isDraft,assets,url"))
    assert check["isDraft"] is True
    matches=[r for r in check["assets"] if r["name"]==HTML.name]
    assert len(matches)==1 and matches[0]["size"]==HTML.stat().st_size
    with tempfile.TemporaryDirectory() as tmp:
        run("release","download",tag,"--repo",REPO,
            "--pattern",HTML.name,"--dir",tmp)
        remote=Path(tmp)/HTML.name
        assert sha(remote)==sha(HTML)
        assert remote.read_bytes()==HTML.read_bytes()
    audit.update({"unpublished_review_release_tag":tag,
        "unpublished_review_release_url":check["url"],
        "unpublished_review_release_asset_filename":HTML.name,
        "unpublished_review_html_sha256":sha(HTML),
        "remote_download_sha256_verified":True,
        "research_preview_publicly_added_to_git":False})
    REPORT.write_text(json.dumps(audit,ensure_ascii=False,indent=2)+"\n")
    index={key:audit[key] for key in audit if key not in ("audit","source_metadata_records")}
    INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+"\n")
    print("B51_REVIEW50_DRAFT_REMOTE_SHA_VERIFIED",
        json.dumps({"url":check["url"],"tag":tag,"file":HTML.name,"bytes":HTML.stat().st_size,
          "sha256":sha(HTML),"images":50,"public_release":False}),flush=True)
if __name__=="__main__":main()
