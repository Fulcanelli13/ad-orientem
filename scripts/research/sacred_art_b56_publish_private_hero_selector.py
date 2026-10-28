#!/usr/bin/env python3
"""Save B56 53 Class I hero selector HTML in UNPUBLISHED draft GitHub Release."""
import hashlib,json,os,subprocess,tempfile
from pathlib import Path
ROOT=Path("data/research")
HTML=Path("previews/sacred-art-b56-classi-53-hero-selection-offline.html")
REPORT=ROOT/"sacred-art-b56-53-hero-selection-verified-summary.json"
REPO="Fulcanelli13/ad-orientem"
def gh(*args):
 p=subprocess.run(["gh",*args],capture_output=True,text=True)
 if p.returncode:raise RuntimeError("Github release failure "+str(args[:3])+" "+p.stderr[-700:])
 return p.stdout.strip()
def sha(path):
 h=hashlib.sha256()
 with path.open("rb") as f:
  for b in iter(lambda:f.read(1048576),b""):h.update(b)
 return h.hexdigest()
def main():
 assert os.environ.get("GH_TOKEN") and os.environ.get("GITHUB_RUN_ID")
 j=json.loads(REPORT.read_text())
 assert j["class_i_dates_2026"]==53 and j["historical_user_date_approved"]==10
 assert j["historical_user_dates_reselected_automatically"]==0 and j["zero_app_publication_rights_approved"] is True
 assert j["each_feast_3_to_4_options"] is True
 assert j["candidate_slots_with_actual_picture"]>=100
 assert j["output_html_bytes"]==HTML.stat().st_size
 assert sha(HTML)==j["output_html_sha256"]
 tag="ao-sacred-art-b56-class-i-53-heroes-"+os.environ["GITHUB_RUN_ID"]+"-1"
 notes=("UNPUBLISHED reviewer only. The 53 observed Class I 2026 dates display three/four painting candidates each. "
  "Ten existing date-specific user selections remain separately protected. Research thumbnails were matched to "
  "SHA-verified B54 source images or exact official object/Commons records. User picks and None suitable flags "
  "are local, can be exported/imported, and DO NOT publish art to Ad Orientem or certify photographic reuse rights. "
  "Cost €0. Download the HTML asset and open it in a browser.")
 gh("release","create",tag,"--repo",REPO,"--draft","--target",os.environ["GITHUB_SHA"],
    "--title","Ad Orientem — 53 Class I feast hero painting selector",
    "--notes",notes)
 gh("release","upload",tag,str(HTML),"--repo",REPO)
 record=json.loads(gh("release","view",tag,"--repo",REPO,"--json","isDraft,assets,url"))
 assert record["isDraft"]
 assets=[x for x in record["assets"] if x["name"]==HTML.name]
 assert len(assets)==1 and assets[0]["size"]==HTML.stat().st_size
 with tempfile.TemporaryDirectory(prefix="b56-hero-remote-proof-") as temp:
  gh("release","download",tag,"--repo",REPO,"--pattern",HTML.name,"--dir",temp)
  remote=Path(temp)/HTML.name
  assert remote.read_bytes()==HTML.read_bytes() and sha(remote)==sha(HTML)
 j.update({"unpublished_private_release_tag":tag,
    "unpublished_private_release_url":record["url"],
    "unpublished_asset_file":HTML.name,
    "remote_asset_re_download_sha_match":True,
    "published_app_image_count":0,
    "public_git_html_image_derivative_count":0})
 REPORT.write_text(json.dumps(j,ensure_ascii=False,indent=2)+"\n")
 print("B56_PRIVATE_53_FEAST_HERO_SELECTOR_VERIFIED",
   json.dumps({"release":record["url"],"tag":tag,"asset":HTML.name,
    "sha256":sha(HTML),"bytes":HTML.stat().st_size,
    "candidates":j["total_picture_options"],
    "visible_images":j["candidate_slots_with_actual_picture"]}),flush=True)
if __name__=="__main__":main()
