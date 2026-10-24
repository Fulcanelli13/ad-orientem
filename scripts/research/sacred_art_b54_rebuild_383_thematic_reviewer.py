#!/usr/bin/env python3
"""B54: Build thematic/curatorial all-383 private reviewer from B53 verified file.

No second multi-gigabyte download: verify each B53 WebP thumbnail against its
archived B53 preview SHA, verify exact B53 release HTML SHA before copy, then
add unapproved Scripture subject + style-affinity suggestion metadata.
Never modify frozen artwork IDs, art choice, image selection or publication.
"""
import base64,collections,csv,hashlib,json,os,re,subprocess,tempfile
from pathlib import Path
from sacred_art_b54_subject_aesthetic_triage import classify
R=Path("data/research")
REPO="Fulcanelli13/ad-orientem"
B53_INDEX=R/"sacred-art-b53-all383-placement-index.json"
B53_AUDIT=R/"sacred-art-b53-383-review-image-audit.json"
TEMPLATE=Path("previews/sacred-art-b54-biblical-baroque-review-template.html")
OUTPUT=Path("previews/sacred-art-b54-all383-biblical-baroque-offline.html")
SUMMARY=R/"sacred-art-b54-383-aesthetic-biblical-review-summary.json"
LEDGER=R/"sacred-art-b54-383-aesthetic-biblical-review-ledger.csv"
def gh(*args):
    result=subprocess.run(["gh",*args],text=True,capture_output=True,check=True)
    return result.stdout.strip()
def sha(buf):return hashlib.sha256(buf).hexdigest()
def main():
    assert os.environ.get("GH_TOKEN"),"Private draft Release access required"
    index=json.loads(B53_INDEX.read_text())
    evidence=json.loads(B53_AUDIT.read_text())
    assert index["schema"]=="AO_B53_FULL_383_CANONICAL_ORDER_PLACEMENTS_OFFLINE_V1"
    assert index["review_private_draft_release_tag"]==evidence["review_private_draft_release_tag"]
    assert index["images_actually_embedded_and_SHA_verified"]==360
    assert index["cases_without_displayable_image"]==23
    audits={x["artwork_id"]:x for x in evidence["images"]}
    assert len(audits)==383
    with tempfile.TemporaryDirectory(prefix="ao-b54-old-383-review-") as dirname:
        d=Path(dirname)
        gh("release","download",index["review_private_draft_release_tag"],
           "--repo",REPO,"--pattern",index["review_file_name"],"--dir",dirname)
        file=d/index["review_file_name"]
        buf=file.read_bytes()
        assert len(buf)==index["offline_HTML_bytes"]
        assert sha(buf)==index["review_HTML_SHA256"]
        old=buf.decode("utf-8")
        raw=re.search(r"const artworks=(\[[^\n]*\]);\s*const key=",old)
        assert raw,"Expected valid B53 visual review content"
        photos=json.loads(raw.group(1))
    assert len(photos)==383
    assert [a["id"] for a in photos]==index["ordered_ids"]
    rows=[];sty=collections.Counter();subjects=collections.Counter();primary=collections.Counter()
    bib=[];photo=0
    for a in photos:
        audit=audits[a["id"]]
        assert a["n"]==audit["review_number"]
        assert a["catalogueRow"]==audit["catalogue_row"]
        assert a["originalSHA"]==(audit["source_original_sha256"] or "")
        assert a["places"] and not a["photoCommercialRightsCleared"]
        assert all(p["decision_default"]=="unreviewed" for p in a["places"])
        if a.get("image"):
            assert audit["source_sha256_validated_from_draft_release"] is True
            prefix="data:image/webp;base64,"
            assert a["image"].startswith(prefix)
            encoded=a["image"][len(prefix):]
            decoded=base64.b64decode(encoded,validate=True)
            assert sha(decoded)==audit["preview_sha256"],"Embedded preview SHA mismatch: "+a["id"]
            assert len(decoded)==audit["preview_bytes"]
            photo+=1
        else:assert audit["image_displayed"] is False
        tags=classify(a["title"],a["artist"],a["id"])
        assert tags["aestheticMachineApproved"] is False
        a.update(tags)
        sty[tags["aestheticAffinity"]]+=1
        for category in tags["subjects"]:subjects[category]+=1
        primary[tags["primarySubject"]]+=1
        if tags["biblicalEpisodeCandidate"]:bib.append(a["id"])
        rows.append({
          "review_order":a["n"],"artwork_id":a["id"],"title":a["title"],
          "artist":a["artist"],"archived_original_sha256":a["originalSHA"],
          "source_image_displayable":bool(a.get("image")),
          "previous_383_placement_slot_count":len(a["places"]),
          "biblical_episode_candidate_from_title":tags["biblicalEpisodeCandidate"],
          "primary_subject":tags["primarySubject"],
          "all_subject_tags":" | ".join(tags["subjects"]),
          "artist_affinity_heuristic":tags["aestheticAffinity"],
          "aesthetic_artist_heuristic_not_visual_certification":True,
          "user_artwork_visual_judgement_status":"UNREVIEWED",
          "user_aesthetic_standard_verdict":"UNREVIEWED",
          "user_placements_approved":0,
          "photo_rights_for_app_approved":False
        })
    assert photo==360
    assert len(rows)==383
    assert len(bib)>50
    template=TEMPLATE.read_text(encoding="utf-8")
    assert template.count("__B54_DATA__")==1
    inline=json.dumps(photos,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c").replace("</script","<\\/script")
    render=template.replace("__B54_DATA__",inline)
    OUTPUT.write_text(render,encoding="utf-8")
    assert 15_000_000<OUTPUT.stat().st_size<60_000_000
    with LEDGER.open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]))
        writer.writeheader();writer.writerows(rows)
    report={
      "schema":"AO_B54_383_BIBLICAL_AESTHETIC_REVIEW_V1",
      "date":"2026-10-24","frozen_artwork_count":383,
      "photos_exactly_preserved_from_B53_rehash":photo,
      "missing_source_photos":23,
      "biblical_episode_candidates_by_title":len(bib),
      "biblical_candidate_original_ids":bib,
      "subject_tag_counts":dict(subjects),
      "primary_subject_counts":dict(primary),
      "artist_historical_affinity_triage_counts":dict(sty),
      "all_383_unreviewed_aesthetic_user_verdict":True,
      "zero_automated_aesthetic_rejections":True,
      "zero_copyright_photo_reuse_clearances":True,
      "zero_canonical_selection_changes":True,
      "all_383_previous_placement_options_retained":True,
      "previous_placement_count":sum(len(a["places"]) for a in photos),
      "new_offline_review_HTML_bytes":OUTPUT.stat().st_size,
      "new_offline_review_HTML_SHA256":sha(OUTPUT.read_bytes()),
      "source_visual_archive":index["review_private_draft_release_tag"],
      "source_visual_archive_SHA256":index["review_HTML_SHA256"],
      "source_exact_images_still_provisional_research_rights":True,
      "subject_and_affinity_are_title_artist_triage_only":True,
      "review_opens_on_biblical_episodes":True,
      "can_filter_biblical_and_historical_style":True,
      "export_schema":"AO_SACRED_ART_USER_REVIEW_PLACEMENTS_V4",
      "prior_V3_and_V2_reviews_importable":True,
      "no_public_git_html_asset":True,
      "free_eur":0,
      "complete_ledger":str(LEDGER)
    }
    SUMMARY.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print("B54_ALL383_BIBLICAL_AESTHETIC_READY",json.dumps({
      "images":photo,"biblical":len(bib),"subjects":dict(primary),
      "artist_affinity":dict(sty),"options":report["previous_placement_count"],
      "html_bytes":OUTPUT.stat().st_size,"cost_eur":0
    }),flush=True)
if __name__=="__main__":main()
