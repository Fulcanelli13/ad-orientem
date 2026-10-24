#!/usr/bin/env python3
"""B51: 50-per-batch user-facing Sacred Art visual review, offline, €0.

Take first 50 historically approved artwork IDs from frozen B49 queue. Exact
full-resolution archived bytes come from unpublished original B26/B29-B33 TARs.
Independently re-SHA each actual image; decode and embed optimized WebP only.
Any missing image is an explicit candidate hold, never silent replacement.
User's KEEP / CHANGE IMAGE / REJECT ARTWORK / HOLD decisions exist only in
local browser memory and an exportable JSON; no registry, app or GitHub writes.
"""
import base64,csv,hashlib,io,json,os,subprocess,tarfile,tempfile,re,warnings
from pathlib import Path
from PIL import Image,ImageOps
R=Path("data/research")
Q=R/"sacred-art-b49-95-frozen-approved-rights-review-queue.csv"
B50=R/"sacred-art-b50-95-exact-photo-version-evidence.csv"
OLD=R/"sacred-art-b27-physical-image-inventory.csv"
P0=R/"sacred-art-b33-p0-64-complete-research-coverage.json"
OUTPUT=Path("previews/sacred-art-b51-review-batch-01-of-50-offline.html")
AUDIT=R/"sacred-art-b51-batch01-50-source-sha-and-thumb-audit.json"
INDEX=R/"sacred-art-b51-review-batch01-index.json"
REPO="Fulcanelli13/ad-orientem"
B26_TAG="sacred-art-originals-b26-20261024"
MAX_ORIG=110_000_000
Image.MAX_IMAGE_PIXELS=500_000_000
def rows(path):
    with path.open("r",encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def digest(b):return hashlib.sha256(b).hexdigest()
def gh(*args):
    p=subprocess.run(["gh",*args],text=True,capture_output=True,check=True)
    return p.stdout.strip()
def render_jpeg_preview(b,which):
    with Image.open(io.BytesIO(b)) as im:
        im.draft("RGB",(1200,1200))
        ImageOps.exif_transpose(im,in_place=True)
        width,height=im.size
        if min(width,height)<220:raise RuntimeError(f"Image under minimum review quality {which} {im.size}")
        im.thumbnail((1190,1190),Image.Resampling.LANCZOS)
        im=im.convert("RGB")
        size=im.size
        out=io.BytesIO()
        im.save(out,format="WEBP",quality=77,method=4)
        bb=out.getvalue()
    with Image.open(io.BytesIO(bb)) as check:
        assert check.format=="WEBP" and check.size==size
        check.verify()
    return bb,size,(width,height)
def asset_for_tag(tag):
    info=json.loads(gh("release","view",tag,"--repo",REPO,"--json","isDraft,assets"))
    if info.get("isDraft") is not True:raise RuntimeError("Research archive unexpectedly not draft: "+tag)
    tars=[a["name"] for a in info["assets"] if a["name"].endswith(".tar") and a["name"].startswith("ao-originals-")]
    if len(tars)!=1:raise RuntimeError(f"Missing/ambiguous primary original archive for {tag}: {tars}")
    return tars[0]
def read_new_tar(path):
    with tarfile.open(path,"r") as f:
        manifest=json.load(f.extractfile("AO_ARCHIVE_ACQUISITION_INDEX.json"))
        assert manifest["publication_rights_approved"] is False
        lookup={}
        for record in manifest["files"]:
            if not record.get("image_file"):continue
            if record["sha256"] in lookup:raise RuntimeError("Duplicate original SHA entry")
            lookup[record["sha256"]]=(record["path"],record["bytes"])
        return lookup
def release_download(tag,asset,dest):
    gh("release","download",tag,"--repo",REPO,
       "--pattern",asset,"--dir",str(dest))
    p=dest/asset
    if not p.is_file() or p.stat().st_size<10000:raise RuntimeError(f"Missing archive {tag} {asset}")
    return p
def main():
    assert os.getenv("GH_TOKEN"),"Authenticated access to unpublished Releases required"
    queue=rows(Q)[:50];versions={x["artwork_id"]:x for x in rows(B50)}
    old={x["sha256"]:x for x in rows(OLD)}
    p0={x["artwork_id"]:x for x in json.loads(P0.read_text())["rows"]}
    assert len(queue)==50 and len({q["artwork_id"] for q in queue})==50
    expected=[]
    for i,q in enumerate(queue):
        assert int(q["rank"])==i+1 and q["historically_approved_artwork"]=="True"
        assert q["source_image_is_complete_candidate"]=="True"
        vv=versions.get(q["artwork_id"])
        assert vv is not None and vv["frozen_artwork_approved"]=="True"
        sha=vv["chosen_archived_sha256"] or q["source_image_hashes"].split(" | ")[0]
        assert re.fullmatch(r"[a-f0-9]{64}",sha)
        if sha in old:
            wave=old[sha]["archive_wave"]
            tag=B26_TAG
            asset=f"ao-source-b26-{wave}.tar"
            member=old[sha]["file_path"]
        else:
            row=p0.get(q["artwork_id"])
            if not row or row["archived_source_sha256"]!=sha:
                raise RuntimeError("No trusted archived source for "+q["artwork_id"]+" SHA "+sha)
            tag=row["draft_release_tag"];asset=asset_for_tag(tag);member=None
        expected.append({**q,"archived_sha":sha,"source_tag":tag,"source_asset":asset,
            "source_member":member,"version_record":vv})
    groups={}
    for item in expected:groups[(item["source_tag"],item["source_asset"])]=None
    assert len(groups)<=8
    audit=[]
    cards=[]
    with tempfile.TemporaryDirectory(prefix="ao-b51-batch50-archives-") as tmp:
        dest=Path(tmp)
        paths={}
        for tag,asset in groups:
            print("B51_RETRIEVE_UNPUBLISHED",tag,asset,flush=True)
            paths[(tag,asset)]=release_download(tag,asset,dest)
        for tag,asset in groups:
            path=paths[(tag,asset)]
            lookups=read_new_tar(path) if tag!=B26_TAG else None
            selected=[x for x in expected if x["source_tag"]==tag and x["source_asset"]==asset]
            with tarfile.open(path,"r") as f:
                # Do not extract all 600MB of TAR to workspace; just read selected files.
                names={m.name.lstrip("./"):m for m in f.getmembers() if m.isfile()}
                for x in selected:
                    original=x["archived_sha"]
                    if lookups is not None:
                        if original not in lookups:
                            raise RuntimeError("Selected original SHA is absent from archived acquisition manifest: "+x["artwork_id"])
                        name,count=lookups[original]
                    else:
                        name=x["source_member"];count=int(old[original]["bytes"])
                    entry=names.get(name)
                    if entry is None:raise RuntimeError("Image archive member unavailable: "+name)
                    if entry.size!=count or entry.size>MAX_ORIG:
                        raise RuntimeError(f"Member size invalid for {x['artwork_id']} {entry.size} != {count}")
                    with f.extractfile(entry) as stream:
                        binary=stream.read(MAX_ORIG+1)
                    if len(binary)!=count or digest(binary)!=original:
                        raise RuntimeError("Archived original hash or byte length wrong: "+x["artwork_id"])
                    thumb,size,native=render_jpeg_preview(binary,x["artwork_id"])
                    photo=b"data:image/webp;base64,"+base64.b64encode(thumb)
                    v=x["version_record"]
                    c={
                      "number":int(x["rank"]),
                      "id":x["artwork_id"],"title":x["title"],"artist":x["artist"],
                      "priority":x["priority"],"image":photo.decode("ascii"),
                      "imageAlt":x["title"]+" — "+x["artist"],
                      "sourceHash":original,"originalBytes":len(binary),
                      "sourceArchive":tag,"sourceArchiveMember":name,
                      "sourcePage":v.get("chosen_source_page") or "",
                      "licenseClaim":v.get("current_commons_claimed_license") or v.get("archived_source_license_metadata") or "License review outstanding",
                      "sourcePhotoHistoricalMatch":v["historical_selected_photo_SHA_exact_match_in_P0_source_ledger"]=="True",
                      "originalLongEdge":max(native),
                      "previewWidth":size[0],"previewHeight":size[1],
                      "archiveVerified":True,
                      "readyToPublish":False
                    }
                    cards.append(c)
                    audit.append({
                      "batch_number":1,"review_number":int(x["rank"]),
                      "artwork_id":x["artwork_id"],"title":x["title"],
                      "sha256":original,"archive":tag,"asset":asset,"member":name,
                      "full_original_bytes":len(binary),
                      "thumbnail_sha256":digest(thumb),"thumbnail_bytes":len(thumb),
                      "thumbnail_dimensions":list(size),
                      "archived_full_original_independently_sha_verified":True,
                      "photograph_rights_published":False,
                      "previous_editorial_artwork_selection_preserved":True
                    })
                    print("B51_IMAGE_READY",x["rank"],x["artwork_id"],size,len(thumb),flush=True)
    cards.sort(key=lambda x:x["number"]);audit.sort(key=lambda x:x["review_number"])
    assert len(cards)==len(audit)==50 and [x["number"] for x in cards]==list(range(1,51))
    assert all(x["archiveVerified"] and not x["readyToPublish"] for x in cards)
    html=html_page(cards)
    OUTPUT.parent.mkdir(parents=True,exist_ok=True)
    OUTPUT.write_text(html,encoding="utf-8")
    noimg=[{k:v for k,v in c.items() if k!="image"} for c in cards]
    meta={
      "schema":"AO_B51_BATCH01_OF_50_SACRED_ART_REVIEW_SOURCE_V1",
      "date":"2026-10-24","batch_number":1,"review_artworks":50,
      "entire_approved_queue_artworks":95,"next_approved_review_batch_size":45,
      "artwork_ids_in_order":[x["id"] for x in cards],
      "source_image_orig_sha_verified":50,
      "source_metadata_records":noimg,
      "original_archive_groups":[{"draft_tag":x[0],"archive_asset":x[1]} for x in groups],
      "originals_newly_acquired":0,
      "full_resolution_originals_embedded":0,
      "offline_preview_webp_bytes":sum(z["thumbnail_bytes"] for z in audit),
      "self_contained_html_bytes":OUTPUT.stat().st_size,
      "offline_gallery_with_50_real_photos":True,
      "visual_decision_vocabulary":["keep_image","replace_image","reject_artwork","hold"],
      "review_decisions_recorded_by_bot":0,
      "user_review_action_only_no_catalogue_change":True,
      "user_exports_decisions_via_browser_json":True,
      "resume_via_import_json_and_optional_browser_local_cache":True,
      "unchanged_frozen_active_artworks":383,
      "unchanged_complete_source_artworks":358,
      "unchanged_incomplete_sources":25,
      "photo_reuse_permissions_newly_granted":0,
      "app_publication_decisions_created":0,
      "strict_zero_euro":True,
      "audit":audit
    }
    AUDIT.write_text(json.dumps(meta,indent=2)+"\n")
    INDEX.write_text(json.dumps({k:meta[k] for k in meta if k not in ("audit","source_metadata_records")},indent=2)+"\n")
    print("B51_OFFLINE_50_SUCCESS",json.dumps({
      "images":len(cards),"sha_verified":len(audit),
      "html_bytes":meta["self_contained_html_bytes"],
      "preview_webp_bytes":meta["offline_preview_webp_bytes"],
      "groups":len(groups),"new_source":0,"new_publications":0
    }),flush=True)
def html_page(cards):
    data=json.dumps(cards,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c").replace("</script","<\\/script")
    template=Path("previews/sacred-art-b51-review-template.html").read_text(encoding="utf-8")
    assert template.count("__B51_ARTWORK_DATA__")==1
    return template.replace("__B51_ARTWORK_DATA__",data)
if __name__=="__main__":main()
