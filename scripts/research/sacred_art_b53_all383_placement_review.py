#!/usr/bin/env python3
"""B53 all 383 ACTIVE frozen works in canonical catalogue order.

Build a standalone offline placement-review gallery. Source artwork images
exclusively from SHA-verified private draft original archives. Never use
replacement paintings, or treat visual placement choices as publication rights.
No image is committed to the public git tree. Existing 451 frozen IDs retained.
"""
from pathlib import Path
from collections import defaultdict,Counter
from functools import lru_cache
import base64,csv,hashlib,io,json,os,re,subprocess,tarfile,tempfile
from PIL import Image,ImageOps,UnidentifiedImageError
from sacred_art_b52_placement_proposals import propose

ROOT=Path("data/research")
REPO="Fulcanelli13/ad-orientem"
BASE=Path("previews")
OUT=BASE/"sacred-art-b53-review-all383-placement-offline.html"
REPORT=ROOT/"sacred-art-b53-383-review-image-audit.json"
INDEX=ROOT/"sacred-art-b53-all383-placement-index.json"
TEMPLATE=BASE/"sacred-art-b53-review-all383-template.html"
ORIGINAL_SHA=re.compile("^[a-f0-9]{64}$")
MAX_ORIGINAL=160_000_000
MAX_GALLERY=130_000_000
Image.MAX_IMAGE_PIXELS=500_000_000
B26="sacred-art-originals-b26-20261024"
B37="ao-art-originals-40081406021-1"
B41="ao-art-originals-40086279346-1"
B40="ao-art-originals-40085750675-1"
B34="ao-art-originals-40078052162-1"
B37_TARGETS={"G32-001","W40-006","ART-uan-orrea-de-ivar-aint-awrence-aint-ilary-two-sided-altarpiece-panel"}
B41_TARGETS={"W04-009","G28-003"}
def digest(b):return hashlib.sha256(b).hexdigest()
def csvrows(path):
    with path.open(encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def rawjson(name):return json.loads((ROOT/name).read_text(encoding="utf-8"))
def gh(*args):
    p=subprocess.run(["gh",*args],capture_output=True,text=True,check=True)
    return p.stdout.strip()
@lru_cache(maxsize=32)
def tag_asset(tag):
    j=json.loads(gh("release","view",tag,"--repo",REPO,"--json","isDraft,assets"))
    if j.get("isDraft") is not True:raise RuntimeError("Private research archive unexpectedly non-draft "+tag)
    files=[v["name"] for v in j["assets"] if v["name"].endswith(".tar") and v["name"].startswith("ao-originals-")]
    if len(files)!=1:raise RuntimeError("Ambiguous original TAR for "+tag+" "+str(files))
    return files[0]
def thumb(source,id_):
    try:
        with Image.open(io.BytesIO(source)) as im:
            original=im.size
            im.draft("RGB",(970,970))
            ImageOps.exif_transpose(im,in_place=True)
            if min(original)<120:raise ValueError("Source too small to inspect")
            im.thumbnail((980,980),Image.Resampling.LANCZOS)
            im=im.convert("RGB")
            target=im.size
            out=io.BytesIO()
            im.save(out,"WEBP",quality=71,method=4)
            b=out.getvalue()
        with Image.open(io.BytesIO(b)) as im:
            assert im.format=="WEBP" and im.size==target
            im.verify()
        return b,target,original,None
    except (OSError,UnidentifiedImageError,MemoryError,ValueError) as e:
        return None,None,None,type(e).__name__+": "+str(e)[:150]
def main():
    if os.environ.get("GITHUB_REPOSITORY") not in (None,REPO):
        raise RuntimeError("Unexpected GitHub repository")
    if not os.environ.get("GH_TOKEN"):raise RuntimeError("GitHub draft-release read token required")
    cat=csvrows(ROOT/"sacred-art-catalogue451-after-b25.csv")
    ledger={x["artwork_id"]:x for x in csvrows(ROOT/"sacred-art-b48-383-photo-preservation-ledger.csv")}
    b27=csvrows(ROOT/"sacred-art-b27-physical-image-inventory.csv")
    b27sha=defaultdict(list)
    for x in b27:b27sha[x["sha256"]].append(x)
    p0={x["artwork_id"]:x for x in rawjson("sacred-art-b33-p0-64-complete-research-coverage.json")["rows"]}
    b34={x["artwork_id"]:x for x in rawjson("sacred-art-b34-74-final-physical-and-rights-matrix.json")["rows"]}
    b37={x["artwork_id"]:x for x in rawjson("sacred-art-b37-383-research-source-coverage-closeout.json")["scope_30_cases"]}
    b40=csvrows(ROOT/"sacred-art-b40-wuilleret-commons-crossmatch-results.csv")
    b41=csvrows(ROOT/"sacred-art-b41-three-institution-source-results.csv")
    b40by={x["artwork_id"]:x for x in b40}
    crosswalk={x["artwork_id"]:x for x in csvrows(ROOT/"sacred-art-b27-451-physical-crosswalk.csv")}
    archived_alias_cases={x["frozen_id"]:x for x in rawjson("sacred-art-b48-three-alias-photo-identity-and-kmska-exception-casebook.json")["alias_cases"]}
    b41by={x["artwork_id"]:x for x in b41}
    active=sorted((x for x in cat if x["frozen_decision"]!="PERMANENTLY_REJECTED"),key=lambda x:int(x["catalogue_row"]))
    assert len(cat)==451 and len(active)==383
    batch=active
    assert len({x["artwork_id"] for x in batch})==383
    # Metadata assignment is strict: same frozen ID + already recorded source SHA.
    selected=[]
    for n,x in enumerate(batch,1):
        id_=x["artwork_id"]
        record=ledger[id_]
        hashes=[z.strip() for z in record["recorded_source_sha256"].split(" | ") if ORIGINAL_SHA.fullmatch(z.strip())]
        original=None
        hold=""
        # Source identity aliases are visually reviewable but not auto-promoted.
        if b34.get(id_,{}).get("state")=="PREEXISTING_ARCHIVE_SOURCE_ALIAS":
            # Photograph attached under a different historic frozen ID.
            # No automatic merging of preparatory sketches vs final paintings.
            aliases=[v[4:] for v in b34[id_].get("preexisting_archival_refs",[]) if v.startswith("B27:")]
            if aliases:
                alias_record=crosswalk.get(aliases[0],{})
                alias_hashes=[h.strip() for h in alias_record.get("matching_file_hashes","").split(" | ") if ORIGINAL_SHA.fullmatch(h.strip())]
                hashes=alias_hashes or hashes
            if not hashes and id_ in archived_alias_cases:
                alternative=archived_alias_cases[id_].get("source_sha256","")
                if ORIGINAL_SHA.fullmatch(alternative):hashes=[alternative]
            hold="Archived photo belongs to a different frozen artwork ID; this is an identity-comparison candidate, not an approved replacement."
        sha=None;tag=None;asset=None;oldmember=None
        pp=p0.get(id_)
        if pp and pp.get("archived_source_sha256") in hashes and pp.get("original_file_available_in_research_archive") is True:
            sha=pp["archived_source_sha256"];tag=pp["draft_release_tag"]
            if tag==B26:
                # P0 aliases into B26 must select their B27 per-wave TAR.
                if sha not in b27sha:
                    raise RuntimeError("P0 B26 alias missing byte-verified index: "+id_)
                src=b27sha[sha][0]
                oldmember=src["file_path"]
                asset=f'ao-source-b26-{src["archive_wave"]}.tar'
        if sha is None:
            for h in hashes:
                if h in b27sha:
                    src=b27sha[h][0];sha=h;tag=B26;oldmember=src["file_path"];asset=f'ao-source-b26-{src["archive_wave"]}.tar'
                    break
        if sha is None and id_ in b34:
            x34=b34[id_]
            for h in x34.get("new_archived_sha",[]):
                if h in hashes:
                    sha=h;tag=x34.get("release_tag") or B34;break
        if sha is None and id_=="W14-004" and archived_alias_cases.get(id_):
            # Existing B33 source is a Rubens *finished* painting, rather
            # than necessarily this frozen modello: display with a hold.
            h=archived_alias_cases[id_].get("source_sha256")
            if h and h in hashes:
                sha=h
                tag=archived_alias_cases[id_].get("draft_release_tag") or "ao-art-originals-40076138511-1"
        if sha is None and id_ in B37_TARGETS and b37.get(id_):
            h=b37[id_].get("B37_original_SHA")
            if h in hashes:sha=h;tag=B37
        if sha is None and id_ in B41_TARGETS and b41by.get(id_):
            h=b41by[id_]["sha256"]
            if h in hashes:sha=h;tag=B41
        if sha is None and id_=="G30-012" and id_ in b40by:
            h=b40by[id_]["commons_sha256"]
            if h in hashes:sha=h;tag=B40
        if sha is not None and tag is None:raise RuntimeError("SHA without archival tag")
        if sha and asset is None:asset=tag_asset(tag)
        if record["provisional_complete_work_photo_source"]!="True":
            hold=("Incomplete two-sided or unresolved artwork identity/source composition. "+
                    hold).strip() if sha else "Exact complete-artwork image has not been preserved. Do not substitute unrelated paintings."
        slots=propose(x["title"],x["artist"],id_)
        assert slots and len({s["slot_id"] for s in slots})==len(slots)
        selected.append({"n":n,"catalogue_row":int(x["catalogue_row"]),
            "artwork_id":id_,"title":x["title"],"artist":x["artist"],
            "frozen_decision":x["frozen_decision"],"priority":x["priority"],
            "artwork_is_previously_selected":x["frozen_decision"] in ("APPROVED_LOCKED","APPROVED_5"),
            "source_coverage":record["preservation_evidence_cohort"],
            "complete_original_candidate":record["provisional_complete_work_photo_source"]=="True",
            "original_sha256":sha,"archive_tag":tag,"archive_asset":asset,
            "old_archive_member":oldmember,"sha_candidates":hashes,
            "image_identity_hold":hold,"suggested_places":slots})
    # For later B35–B41 source recoveries, find the pre-registered SHA
    # inside actual acquisition manifests; neither saint names nor titles
    # can establish identity or justify an artwork substitution.
    with tempfile.TemporaryDirectory(prefix="ao-b53-383-verification-") as tmp:
        dest=Path(tmp)
        tarpaths={}
        unresolved=[r for r in selected if not r["original_sha256"] and r["sha_candidates"]]
        if unresolved:
            target_hashes={h for r in unresolved for h in r["sha_candidates"]}
            releases=json.loads(gh("api",f"repos/{REPO}/releases?per_page=100"))
            late=[]
            for rel in releases:
                tag=rel.get("tag_name","")
                if not re.fullmatch(r"ao-art-originals-\d+-1",tag) or rel.get("draft") is not True:continue
                archive_names=[a["name"] for a in rel.get("assets",[])
                    if a["name"].endswith(".tar") and re.match(r"ao-originals-b(?:35|36|37|40|41)-",a["name"])]
                if len(archive_names)==1:late.append((tag,archive_names[0]))
            assert len(late)>=7
            index={}
            for tag,asset in sorted(late):
                print("B53_SCAN_LATE_SOURCE",tag,asset,flush=True)
                gh("release","download",tag,"--repo",REPO,"--pattern",asset,"--dir",str(dest))
                tarpath=dest/asset
                with tarfile.open(tarpath,"r") as tar:
                    manifest=json.load(tar.extractfile("AO_ARCHIVE_ACQUISITION_INDEX.json"))
                    assert manifest["research_only"] and manifest["publication_rights_approved"] is False
                    for file in manifest["files"]:
                        h=file.get("sha256","")
                        if file.get("image_file") and h in target_hashes and h not in index:
                            index[h]=(tag,asset)
                tarpaths[(tag,asset)]=tarpath
            for row in unresolved:
                for sha_candidate in row["sha_candidates"]:
                    if sha_candidate in index:
                        row["original_sha256"]=sha_candidate
                        row["archive_tag"],row["archive_asset"]=index[sha_candidate]
                        break
                if not row["original_sha256"]:
                    row["image_identity_hold"]+=(" " if row["image_identity_hold"] else "")+"The recorded research source SHA could not be matched to a surviving archived image; source review required."
        groups={}
        for row in selected:
            if row["original_sha256"]:
                assert row["archive_tag"] and row["archive_asset"]
                groups[(row["archive_tag"],row["archive_asset"])]=None
        print("B53_SOURCE_GROUPS",json.dumps([{"tag":t,"asset":a} for t,a in groups]),flush=True)
        for tag,asset in groups:
            if (tag,asset) in tarpaths:continue
            print("B53_DOWNLOAD_PRIVATE",tag,asset,flush=True)
            gh("release","download",tag,"--repo",REPO,"--pattern",asset,"--dir",str(dest))
            p=dest/asset
            if not p.exists():raise RuntimeError("Remote original preservation absent "+asset)
            tarpaths[(tag,asset)]=p
        cases=[];audit=[]
        for tag,asset in groups:
            with tarfile.open(tarpaths[(tag,asset)],mode="r") as archive:
                members={m.name.lstrip("./"):m for m in archive.getmembers() if m.isfile()}
                index={}
                if tag!=B26:
                    idx=json.load(archive.extractfile(members["AO_ARCHIVE_ACQUISITION_INDEX.json"]))
                    assert idx["research_only"] and idx["publication_rights_approved"] is False
                    for item in idx["files"]:
                        if item.get("image_file") and item.get("sha256"):
                            index[item["sha256"]]=(item["path"].lstrip("./"),int(item["bytes"]))
                for entry in [e for e in selected if e["archive_tag"]==tag and e["archive_asset"]==asset]:
                    h=entry["original_sha256"]
                    src=b27sha[h][0] if tag==B26 else None
                    name=entry["old_archive_member"] if tag==B26 else index.get(h,(None,None))[0]
                    bytes_expected=int(src["bytes"]) if tag==B26 else index.get(h,(None,None))[1]
                    if name is None or name not in members:
                        entry["image_error"]="Exact-SHA source absent in this TAR's index"
                        continue
                    member=members[name]
                    if bytes_expected is None or member.size!=bytes_expected or member.size>MAX_ORIGINAL:
                        raise RuntimeError("Remote archive original SHA/size evidence conflict: "+entry["artwork_id"])
                    with archive.extractfile(member) as f: binary=f.read(MAX_ORIGINAL+1)
                    if digest(binary)!=h or len(binary)!=bytes_expected:
                        raise RuntimeError("Remote image SHA mismatch: "+entry["artwork_id"])
                    visual,dims,native,error=thumb(binary,entry["artwork_id"])
                    if visual:
                        entry["image"]="data:image/webp;base64,"+base64.b64encode(visual).decode("ascii")
                        entry["preview_w"],entry["preview_h"]=dims
                        entry["source_w"],entry["source_h"]=native
                        entry["display_source_sha_verified"]=True
                        entry["archival_member"]=name
                        entry["preview_sha256"]=digest(visual)
                        entry["preview_bytes"]=len(visual)
                    else:entry["image_error"]=error
                    print("B53_SHA_VERIFIED",entry["n"],entry["artwork_id"],"preview",bool(visual),flush=True)
    # Security: strip source binaries from git. HTML exists only in draft Release.
    embedded=0;part=0;missing=0;held=0;source_count=0
    cards=[];audit=[]
    for row in selected:
        if row["original_sha256"]:source_count+=1
        has_image=bool(row.get("image"))
        if has_image:embedded+=1
        else:missing+=1
        if has_image and not row["complete_original_candidate"]:part+=1
        if row["image_identity_hold"]:held+=1
        cards.append({
            "n":row["n"],"id":row["artwork_id"],"catalogueRow":row["catalogue_row"],
            "title":row["title"],"artist":row["artist"],
            "artworkDecision":row["frozen_decision"],
            "previouslySelected":row["artwork_is_previously_selected"],
            "sourceCohort":row["source_coverage"],
            "image":row.get("image"),
            "imageMissingReason":row.get("image_error") or row["image_identity_hold"] if not has_image else "",
            "imageHold":row["image_identity_hold"],
            "originalSHA":row["original_sha256"] or "",
            "sourceArchive":row["archive_tag"] or "",
            "completeResearchSource":row["complete_original_candidate"],
            "places":row["suggested_places"],
            "previewWidth":row.get("preview_w",0),
            "previewHeight":row.get("preview_h",0),
            "sourceWidth":row.get("source_w",0),
            "sourceHeight":row.get("source_h",0),
            "sourceSHAReverified":bool(row.get("display_source_sha_verified")),
            "photoCommercialRightsCleared":False,
            "userPlacementDecision":None
        })
        audit.append({
            "review_number":row["n"],"artwork_id":row["artwork_id"],
            "catalogue_row":row["catalogue_row"],
            "source_archive":row["archive_tag"],
            "source_original_sha256":row["original_sha256"],
            "image_displayed":has_image,
            "preview_sha256":row.get("preview_sha256"),
            "preview_bytes":row.get("preview_bytes",0),
            "preview_dimensions":[row.get("preview_w",0),row.get("preview_h",0)],
            "source_sha256_validated_from_draft_release":bool(row.get("display_source_sha_verified")),
            "source_identity_or_completeness_hold":row["image_identity_hold"],
            "source_missing_or_unsupported":row.get("image_error") if not has_image else None,
            "placement_suggestions":[{"slot_id":x["slot_id"],"label":x["label"],"confidence":x["confidence"]} for x in row["suggested_places"]],
            "photo_app_rights_cleared":False,
            "user_decision_preselected":False
        })
    html=TEMPLATE.read_text(encoding="utf-8")
    assert html.count("__B53_DATA__")==1
    content=json.dumps(cards,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c").replace("</script","<\\/script")
    html=html.replace("__B53_DATA__",content)
    BASE.mkdir(exist_ok=True)
    OUT.write_text(html,encoding="utf-8")
    if OUT.stat().st_size>MAX_GALLERY:raise RuntimeError("Gallery too large")
    result={
        "schema":"AO_B53_FULL_383_CANONICAL_ORDER_PLACEMENTS_OFFLINE_V1",
        "date":"2026-10-24","active_total":383,"frozen_catalogue_total":451,
        "batch_number":"all","batch_size":383,"next_batch_start":None,
        "ordered_ids":[x["id"] for x in cards],
        "paintings_with_archived_source_SHA":source_count,
        "images_actually_embedded_and_SHA_verified":embedded,
        "cases_without_displayable_image":missing,
        "incomplete_work_image_previews_displayed":part,
        "separate_identity_or_missing_source_holds":held,
        "total_placement_proposals":sum(len(x["places"]) for x in cards),
        "average_placement_proposals_per_artwork":round(sum(len(x["places"]) for x in cards)/383,2),
        "total_offline_webp_bytes":sum(x["preview_bytes"] for x in audit),
        "offline_HTML_bytes":OUT.stat().st_size,
        "source_archive_groups":[{"tag":t,"asset":a} for t,a in groups],
        "source_research_images_newly_downloaded_from_original_providers":0,
        "image_fullresolution_originals_copied_to_public_git":0,
        "frozen_decisions_automatically_mutated":0,
        "photo_reuse_approvals_automatically_granted":0,
        "placement_decisions_automatically_marked_yes_or_no":0,
        "user_custom_destination_supported":True,
        "placement_suggestions_are_proposals_not_app_slot_certifications":True,
        "calendar_date_links_require_1962_source_verification":True,
        "export_import_user_decisions_supported":True,
        "HTML_review_in_unpublished_release_only":True,
        "single_review_for_all_383":True,
        "batch_navigation_100_100_100_83":True,
        "cost_eur":0,
        "images":audit
    }
    REPORT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    INDEX.write_text(json.dumps({k:result[k] for k in result if k!="images"},ensure_ascii=False,indent=2)+"\n")
    assert len(cards)==383
    assert result["images_actually_embedded_and_SHA_verified"]>=300
    print("B53_ALL383_COMPLETE",json.dumps({k:result[k] for k in (
        "images_actually_embedded_and_SHA_verified","cases_without_displayable_image",
        "total_placement_proposals","source_archive_groups","offline_HTML_bytes","cost_eur"
    )}),flush=True)
if __name__=="__main__":main()
