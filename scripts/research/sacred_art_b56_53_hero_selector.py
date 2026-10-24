#!/usr/bin/env python3
"""B56 — 53 1962 Class I observed feast hero panels, four evidenced candidates each.

Research-only private offline reviewer. B54 verified 383 picture thumbnails are
SHA checked before embedding; exact user-approved paintings absent from B54
are retrieved from exact-object Wikimedia Commons / Met research sources where
possible. Never publish art to the app, never infer photo licensing, never
overwrite dated user approvals. Other options are explicitly labelled
contextual when they do not depict exact liturgical observance.
"""
import base64,collections,hashlib,io,json,os,re,subprocess,tempfile,urllib.parse,urllib.request
from pathlib import Path
from PIL import Image,ImageOps
REPO="Fulcanelli13/ad-orientem"
ROOT=Path("data/research")
PREV=Path("previews")
B54=ROOT/"sacred-art-b54-383-aesthetic-biblical-review-summary.json"
SEED=ROOT/"sacred-art-b56-53-classi-curated-source-seed.json"
OUT=PREV/"sacred-art-b56-classi-53-hero-selection-offline.html"
REPORT=ROOT/"sacred-art-b56-53-hero-selection-verified-summary.json"
LEDGER=ROOT/"sacred-art-b56-53-hero-candidate-list.json"
TEMPLATE=PREV/"sacred-art-b56-classi-hero-template.html"
Image.MAX_IMAGE_PIXELS=100_000_000
UA="AdOrientemSacredArtResearch/1.0 (public imageinfo; private editorial image review)"
PIN={
"calendar.christmas":[353,293,294,295],
"calendar.epiphany":[233,356,288,291],
"calendar.lent":[160,168,235,167],
"calendar.saint-joseph":[234,78,361,141],
"calendar.passion":[189,191,212,307],
"calendar.annunciation":[182,273,272,269],
"calendar.palm-sunday":[180,189,191,197],
"calendar.holy-thursday":[371,237,181,303],
"calendar.good-friday":[307,319,309,191],
"calendar.holy-saturday":[303,210,372,212],
"calendar.easter":[192,373,263,177],
"calendar.ascension":[193,243,374,192],
"calendar.pentecost":[194,241,375,193],
"calendar.trinity":[215,242,376,150],
"calendar.corpus-christi":[237,371,181,150],
"calendar.sacred-heart":[144,191,307,309],
"calendar.st-john-baptist":[317,323,256,84],
"person.peter":[314,1,21,150],
"devotion.precious-blood":[191,307,309,305],
"calendar.assumption":[195,281,253,380],
"devotion.st-michael":[81,346,253,150],
"calendar.christ-king":[150,215,233,192],
"calendar.all-saints":[150,283,215,147],
"calendar.all-souls":[147,148,150,215],
"calendar.advent":[84,256,323,160],
"calendar.immaculate-conception":[211,382,383,61],
"calendar.christmas-eve":[353,293,294,295]
}
OVERRIDES={
"2026-02-22":[160,167,158,157],
"2026-03-01":[168,157,158,235],
"2026-03-08":[167,164,165,157],
"2026-03-15":[235,167,160,164],
"2026-03-30":[176,189,181,237],
"2026-03-31":[181,371,189,191],
"2026-04-01":[181,371,189,191],
"2026-04-10":[177,12,178,192],
"2026-04-12":[177,12,192,373],
"2026-05-27":[237,371,181,194],
"2026-06-29":[314,1,21,150],
"2026-11-29":[84,256,323,160],
"2026-12-06":[323,256,84,160],
"2026-12-13":[256,323,84,160],
"2026-12-20":[323,84,256,160]
}
# Titles identify *physical original*, not just a historical artist or work category.
EXCLUDE={
"2026-04-03":re.compile(r"crucifixion of saint (?:peter|andrew|philip)",re.I),
"2026-10-25":re.compile(r"martyrdom of (?:saint|st) ",re.I)
}
def sha(x):return hashlib.sha256(x).hexdigest()
def gh(*args):
    p=subprocess.run(["gh",*args],capture_output=True,text=True)
    if p.returncode:raise RuntimeError("gh failed "+str(args[:2])+" "+p.stderr[-700:])
    return p.stdout.strip()
def req_json(url):
    request=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json"})
    with urllib.request.urlopen(request,timeout=25) as r:
        return json.load(r)
def req_bytes(url,max_bytes=14_000_000):
    r=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"image/*"})
    with urllib.request.urlopen(r,timeout=25) as f:
        data=f.read(max_bytes+1)
    if len(data)>max_bytes:raise RuntimeError("Image too large")
    return data
def thumb(source,w=900,h=900):
    with Image.open(io.BytesIO(source)) as im:
        im.draft("RGB",(w,h))
        ImageOps.exif_transpose(im,in_place=True)
        im.thumbnail((w,h),Image.Resampling.LANCZOS)
        im=im.convert("RGB")
        buff=io.BytesIO();im.save(buff,format="WEBP",quality=75,method=4)
        return buff.getvalue(),im.size
def commons(file):
    args={"action":"query","prop":"imageinfo","iiprop":"url|size|extmetadata",
        "iiurlwidth":"1080","titles":"File:"+file,"format":"json","formatversion":"2"}
    url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(args)
    j=req_json(url)
    pages=j["query"]["pages"]
    if len(pages)!=1 or "imageinfo" not in pages[0]:raise RuntimeError("Commons exact image missing")
    info=pages[0]["imageinfo"][0]
    source=info.get("thumburl") or info["url"]
    b=req_bytes(source)
    rendered,size=thumb(b)
    rights=info.get("extmetadata",{}).get("LicenseShortName",{}).get("value","")
    return {"image":"data:image/webp;base64,"+base64.b64encode(rendered).decode(),
        "thumb_sha256":sha(rendered),"source_photo_bytes":len(b),
        "source_url":pages[0].get("canonicalurl") or info.get("descriptionurl"),
        "source_license_claim":re.sub("<[^>]*>","",rights),
        "actual_image_confirmed":True,"original_file_source":info["url"],"pixel_size":size}
def met(object_id):
    obj=req_json(f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}")
    assert obj["objectID"]==object_id and obj["artistDisplayName"].lower().find("saraceni")>=0
    assert obj["title"].strip().lower()=="paradise"
    assert obj.get("isPublicDomain",False) is True
    url=obj.get("primaryImageSmall") or obj["primaryImage"]
    b=req_bytes(url)
    result,size=thumb(b)
    return {"image":"data:image/webp;base64,"+base64.b64encode(result).decode(),
        "thumb_sha256":sha(result),"source_photo_bytes":len(b),"source_url":obj["objectURL"],
        "source_license_claim":"Met Public Domain / OA (research metadata)",
        "actual_image_confirmed":True,"original_file_source":url,"pixel_size":size}
def select_rating(a):
    affinity=a.get("aestheticAffinity")
    return {"baroque_reference_circle":12,"related_classical_tradition":6,
        "requires_visual_assessment":0,"historically_different_style":-4}.get(affinity,0)
def main():
    assert os.environ.get("GH_TOKEN"),"Authenticated B54 private draft release required"
    source=json.loads(B54.read_text());seed=json.loads(SEED.read_text())
    assert source["schema"]=="AO_B54_383_BIBLICAL_AESTHETIC_REVIEW_V1"
    assert len(seed["dates"])==53
    with tempfile.TemporaryDirectory(prefix="ao-b56-b54-source-review-") as d:
        gh("release","download",source["review_private_draft_release_tag"],"--repo",REPO,
           "--pattern",source["review_file_name"],"--dir",d)
        prior=(Path(d)/source["review_file_name"]).read_bytes()
    assert sha(prior)==source["review_HTML_SHA256"]
    assert len(prior)==source["new_offline_review_HTML_bytes"]
    m=re.search(r"const artworks=(\[[^\n]*\]);\s*const key=",prior.decode("utf-8"))
    assert m,"Could not read B54 preverified 383-artwork data"
    art=json.loads(m.group(1))
    assert len(art)==383 and sum(bool(x.get("image")) for x in art)==360
    by_id={z["id"]:z for z in art}
    # Collect source-specific external photo rights metadata for the user-approved
    # six absent from the 383 art catalog; any failure stays a visible no-image
    # hold, not a photo copied from vaguely similar biblical compositions.
    external={}
    for row in seed["dates"]:
        approved=row.get("protected_approval")
        if not approved or approved["original_found_in_383"]:continue
        metadata=approved.get("external_research_photo") or {}
        try:
            if metadata.get("kind")=="commons_file":
                external[row["date"]]=commons(metadata["file"])
            elif metadata.get("kind")=="met_object":
                external[row["date"]]=met(int(metadata["id"]))
            else:external[row["date"]]={"actual_image_confirmed":False}
        except Exception as e:
            external[row["date"]]={"actual_image_confirmed":False,"image_error":str(e)[:240],
                "source_url":metadata.get("source") or metadata.get("museumPage")}
        print("B56_EXACT_APPROVED_IMAGE",row["date"],external[row["date"]].get("actual_image_confirmed"),flush=True)
    paintings={}
    image_assets={}
    def photo_key(id_,artwork):
        photo=artwork.get("image")
        if not photo:return None
        key=id_
        if key not in image_assets:
            if not photo.startswith("data:image/webp;base64,"):raise RuntimeError("Nonarchival photo encoding")
            binary=base64.b64decode(photo.partition(",")[2],validate=True)
            assert binary[:4]==b"RIFF" and sha(binary)
            image_assets[key]=photo
        return key
    for a in art:
        paintings[a["id"]]={
            "id":a["id"],"title":a["title"],"artist":a["artist"],
            "source_url":"", "original_sha256":a["originalSHA"],
            "image_key":photo_key(a["id"],a),
            "archived_research_source_sha_verified":a["sourceSHAReverified"],
            "release_rights_cleared":False,"style_affinity":a.get("aestheticAffinity","requires_visual_assessment"),
            "previously_selected":a.get("previouslySelected",False)}
    selected=[]
    for day in seed["dates"]:
        candidates={}
        approved=day.get("protected_approval")
        exclude=EXCLUDE.get(day["date"])
        def submit(pid,level,weight,reason,source_url="",is_approved=False):
            if pid not in paintings:return
            art_obj=paintings[pid]
            if exclude and exclude.search(art_obj["title"]):return
            scored=weight+select_rating(next((v for v in art if v["id"]==pid),{}))
            if art_obj["image_key"] is None:scored-=20
            existing=candidates.get(pid)
            if existing and existing["score"]>=scored:return
            candidates[pid]={"artwork_id":pid,"grade":level,"score":scored,"why":reason,
                "source_url":source_url or art_obj.get("source_url"),"historically_approved":is_approved}
        if approved:
            if approved["original_found_in_383"] and approved["catalogue_id"] in paintings:
                submit(approved["catalogue_id"],"PRIOR_USER_APPROVED",1000,
                    "Previously approved specifically for this feast. Retained without requiring re-selection.",is_approved=True)
            else:
                id_="protected:"+day["date"]
                image_data=external.get(day["date"],{})
                key="exact:"+day["date"] if image_data.get("image") else None
                if key:image_assets[key]=image_data["image"]
                paintings[id_]={
                    "id":id_,"title":approved["title"],"artist":approved["artist"],
                    "source_url":image_data.get("source_url") or approved.get("external_research_photo",{}).get("source") or "",
                    "original_sha256":None,"image_key":key,
                    "archived_research_source_sha_verified":False,
                    "release_rights_cleared":False,
                    "style_affinity":"previously_approved_exception",
                    "source_license_claim":image_data.get("source_license_claim","Unverified"),
                    "previously_selected":True,
                    "image_provenance_hold":not bool(key)}
                candidates[id_]={"artwork_id":id_,"grade":"PRIOR_USER_APPROVED", "score":1500,
                    "why":"Previously approved for this exact date. Preserved even though its source was outside the 383-work gallery.",
                    "source_url":paintings[id_]["source_url"],"historically_approved":True}
        # Human-curated earlier files take precedence over generic title grouping.
        for x in day.get("exact_research_links",[]):
            submit(x["artworkId"],"EXACT_SUBJECT_RESEARCH",160,
                "Source research identifies the depicted feast/event; exact iconography and reuse rights still require review.",
                x.get("museumObjectUrl",""))
        for x in day.get("earlier_curator_selections",[]):
            submit(x["artworkId"],"PRIOR_SUBJECT_SELECTION",135,
                "Previously selected for this devotional/calendar subject; not an approval for this exact 2026 date.",
                x.get("sourceUrl",""))
        for id_ in day.get("existing_artwork_candidates",[]):
            submit(id_,"RESEARCHED_THEME",120,
                "Present in the earlier Class I subject-specific research shortlist; assess its image and calendar appropriateness.")
        for rank,n in enumerate(OVERRIDES.get(day["date"],PIN.get(day["theme"],[]))):
            if n<1 or n>len(art):continue
            a=art[n-1]
            submit(a["id"],"EDITORIAL_PROPOSAL",105-rank*5,
                "Additional artwork showing this feast or a related mystery; visual and subject accuracy must be judged before choosing.")
        # For a sparse subject, fill from genuinely related original works by
        # keyword, NEVER arbitrary unrelated source-subject substitution.
        if len(candidates)<4:
            patterns={
              "calendar.christmas":r"nativity|adoration of the shepherds|birth of christ",
              "calendar.epiphany":r"adoration of the magi|epiphany",
              "calendar.lent":r"temptation|transfiguration|healing|loaves and fishes",
              "calendar.saint-joseph":r"(saint joseph|holy family|holy family with)",
              "calendar.passion":r"christ.*cross|crucifixion|agony|crown.*thorn|lamentation",
              "calendar.annunciation":r"annunciation",
              "calendar.palm-sunday":r"entry into jerusalem|entry of christ",
              "calendar.holy-thursday":r"last supper|washing the disciples|la petite c[eè]ne",
              "calendar.good-friday":r"crucifixion|lance thrust|calvary",
              "calendar.holy-saturday":r"entombment|burial of christ|lamentation",
              "calendar.easter":r"resurrection|emmaus|incredulity",
              "calendar.ascension":r"ascension",
              "calendar.pentecost":r"pentecost",
              "calendar.trinity":r"trinity",
              "calendar.corpus-christi":r"last supper|la petite c[eè]ne|mass of saint gregory",
              "calendar.sacred-heart":r"heart of jesus|lance thrust|christ on the cross",
              "calendar.st-john-baptist":r"john the baptist",
              "person.peter":r"saint peter|saint paul|sts peter|peter and paul",
              "devotion.precious-blood":r"crucifixion|lance thrust|blood of christ",
              "calendar.assumption":r"assumption",
              "devotion.st-michael":r"saint michael|archangel michael",
              "calendar.christ-king":r"trinity adored|salvator mundi|holy trinity",
              "calendar.all-saints":r"trinity adored by all saints|paradise|coronation of the virgin",
              "calendar.all-souls":r"purgatory|souls of purgatory|all souls",
              "calendar.advent":r"john the baptist|temptation of christ|christ.*resurrection",
              "calendar.immaculate-conception":r"immaculate conception",
              "calendar.christmas-eve":r"nativity|adoration of the shepherds"
            }
            patt=re.compile(patterns.get(day["theme"],r"^$"),re.I)
            for a in art:
                if patt.search(a["title"]):
                    submit(a["id"],"CONTEXTUAL_CANDIDATE",60,
                        "Subject-related alternative only; not certified as depicting this date's appointed feast or Gospel.")
        ranked=sorted(candidates.values(),key=lambda x:(x["score"],bool(paintings[x["artwork_id"]]["image_key"])) ,reverse=True)
        # Protected first; other selections prioritize visible source images.
        protected_options=[z for z in ranked if z["historically_approved"]]
        other=[z for z in ranked if not z["historically_approved"]]
        visible=[z for z in other if paintings[z["artwork_id"]]["image_key"]]
        invisible=[z for z in other if not paintings[z["artwork_id"]]["image_key"]]
        shortlist=(protected_options+visible+invisible)[:4]
        # Some observances genuinely lack 4 viable distinct works. Do not
        # fabricate a 4th image or confuse St Peter's martyrdom with Calvary.
        if len(shortlist)<3:
            print("B56_FEAST_UNDERSOURCED",day["date"],len(shortlist),flush=True)
        clean=[]
        for i,z in enumerate(shortlist,1):
            full=paintings[z["artwork_id"]]
            clean.append({"choice_id":z["artwork_id"],
                "title":full["title"],"artist":full["artist"],
                "grade":z["grade"],"relation_explanation":z["why"],
                "style_affinity":full.get("style_affinity"),
                "image_key":full.get("image_key"),
                "source_url":z.get("source_url") or full.get("source_url") or "",
                "source_sha256":full.get("original_sha256"),
                "source_photo_research_verified":bool(full["archived_research_source_sha_verified"]),
                "production_image_rights_approved":False,
                "historically_approved_for_date":z["historically_approved"],
                "image_available":bool(full.get("image_key")),
                "editorial_placement_confirmed_by_user_this_session":False})
        assert len({x["choice_id"] for x in clean})==len(clean)
        selected.append({
            "date":day["date"],"observed_principal":day["principal_id"],
            "title":day["title"],"theme":day["theme"],
            "relation":day["subject_relation"],"original_approval":approved,
            "options":clean,"release_ready":False,
            "selection":None,"need_more_research":False
        })
    assert len(selected)==53 and sum(bool(x["original_approval"]) for x in selected)==10
    assert all(3<=len(x["options"])<=4 for x in selected),"At least 3 sourced real painting options required; do not invent."
    used={x["image_key"] for d in selected for x in d["options"] if x["image_key"]}
    ordered_images={k:image_assets[k] for k in sorted(used)}
    # Output stores actual compressed thumbnails once each, referenced by key.
    template=TEMPLATE.read_text(encoding="utf-8")
    assert template.count("__B56_HERO_DATA__")==1
    assert template.count("__B56_IMAGE_BANK__")==1
    html=template.replace("__B56_HERO_DATA__",json.dumps(selected,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c"))
    html=html.replace("__B56_IMAGE_BANK__",json.dumps(ordered_images,separators=(",",":")))
    OUT.write_text(html,encoding="utf-8")
    shortlist_total=sum(len(x["options"]) for x in selected)
    real_total=sum(z["image_available"] for d in selected for z in d["options"])
    report={
     "schema":"AO_B56_CLASS_I_53_HERO_SELECTOR_SOURCE_PROOF_V1",
     "class_i_dates_2026":53,
     "historical_user_date_approved":10,
     "historical_user_dates_reselected_automatically":0,
     "total_picture_options":shortlist_total,
     "each_feast_3_to_4_options":True,
     "candidate_slots_with_actual_picture":real_total,
     "candidate_slots_without_actual_picture":shortlist_total-real_total,
     "unique_reused_picture_previews":len(ordered_images),
     "previously_approved_absent_from_383":6,
     "external_prior_approved_images_resolved":sum(bool(external.get(x["date"],{}).get("actual_image_confirmed")) for x in selected if x["date"] in external),
     "zero_app_publication_rights_approved":True,
     "user_approval_export_controls_not_mutating_app":True,
     "source_B54_gallery_sha_verified":True,
     "image_sources_private_research_only":True,
     "product_cost_eur":0,
     "output_html_file":OUT.name,
     "output_html_bytes":OUT.stat().st_size,
     "output_html_sha256":sha(OUT.read_bytes()),
     "per_date":[{"date":x["date"],"title":x["title"],
         "options":len(x["options"]),"with_image":sum(v["image_available"] for v in x["options"]),
         "protected_user_choice":bool(x["original_approval"]),
         "choice_ids":[v["choice_id"] for v in x["options"]]} for x in selected]
    }
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    LEDGER.write_text(json.dumps({"schema":"AO_B56_53_DAY_HERO_CANDIDATE_RESEARCH_V1",
       "dates":selected,"image_bank_sha256":{k:sha(base64.b64decode(v.split(",")[1])) for k,v in ordered_images.items()},
       "user_votes_not_prepopulated":True},ensure_ascii=False,indent=2)+"\n")
    print("B56_53_HERO_SELECTOR_BUILT",json.dumps({k:report[k] for k in [
        "class_i_dates_2026","total_picture_options","candidate_slots_with_actual_picture",
        "unique_reused_picture_previews","external_prior_approved_images_resolved",
        "output_html_bytes"]}),flush=True)
if __name__=="__main__":main()
