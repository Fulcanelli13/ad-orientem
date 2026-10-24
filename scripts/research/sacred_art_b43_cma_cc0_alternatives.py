#!/usr/bin/env python3
"""B43: discover + preserve CLEARLY DIFFERENT CMA CC0 artwork alternatives.
Do NOT replace the user's frozen artwork entries. A subject/title match is not
an attribution, source-object match, or editorial selection.
"""
import csv,hashlib,json,re,time
from io import BytesIO
from pathlib import Path
from urllib.parse import urlencode,urlsplit
from urllib.request import Request,urlopen
from PIL import Image

R=Path("data/research"); O=Path("artifacts/b43-cleveland-cc0-alternative-paintings")
Q=R/"sacred-art-b43-cma-19-open-painting-subject-queries.json"
CROSS=R/"sacred-art-b27-451-physical-crosswalk.csv"
ENDPOINT="https://openaccess-api.clevelandart.org/api/artworks/"
UA="AdOrientemHistoricalArtResearch/2026 (https://github.com/Fulcanelli13/ad-orientem)"
HEADERS={"User-Agent":UA,"Accept":"application/json"}
FIELDS=["frozen_artwork_id","theme_query","alternative_object_id","alternative_title",
"alternative_artist","alternative_date","CMA_accession","alternative_museum_object_url",
"share_license_status","provider_CC0_image_rights_evidence","source_image_url",
"original_photo_width","original_photo_height","original_image_bytes","source_image_sha256",
"image_origin_host","full_painting_composition_edited","match_to_frozen_original",
"automatically_replaces_frozen_art","editorial_selected","app_image_published","source_status","hold_reason"]
def api_get(params):
    url=ENDPOINT+"?"+urlencode(params)
    with urlopen(Request(url,headers=HEADERS),timeout=35) as res:
        host=urlsplit(res.geturl()).hostname
        if res.status!=200 or host!="openaccess-api.clevelandart.org":raise RuntimeError("bad CMA response or redirect")
        if "json" not in res.headers.get("Content-Type","").lower():raise RuntimeError("unexpected CMA content type")
        b=res.read(3_000_001)
        if len(b)>3_000_000:raise RuntimeError("large CMA response")
        j=json.loads(b)
        if not isinstance(j.get("data"),list):raise RuntimeError("invalid CMA response")
        return j
def acquire(u):
    loc=urlsplit(u)
    if loc.scheme!="https" or not (loc.hostname=="clevelandart.org" or loc.hostname.endswith(".clevelandart.org")):
        raise RuntimeError("non-CMA image CDN URL")
    with urlopen(Request(u,headers={"User-Agent":UA,"Accept":"image/jpeg,image/png"}),timeout=65) as r:
        fh=urlsplit(r.geturl())
        if r.status!=200 or not(fh.hostname=="clevelandart.org" or fh.hostname.endswith(".clevelandart.org")):raise RuntimeError("unrecognized image redirect")
        typ=r.headers.get("Content-Type","").split(";")[0].lower()
        if typ not in ("image/jpeg","image/png"):raise RuntimeError("unknown image mime "+typ)
        b=r.read(24_000_001)
        if len(b)>24_000_000 or len(b)<4000:raise RuntimeError("image over size limit or missing")
    with Image.open(BytesIO(b)) as im:
        fmt=im.format;w,h=im.size; im.verify()
    if fmt not in ("JPEG","PNG") or min(w,h)<500:raise RuntimeError(f"low-resolution/codec {fmt} {w}x{h}")
    return b,w,h,fmt,fh.hostname

def main():
    queries=json.loads(Q.read_text(encoding="utf-8"))["queries"]
    assert len(queries)==19
    with CROSS.open(encoding="utf-8",newline="") as f:
        ids={row["artwork_id"] for row in csv.DictReader(f)}
    O.mkdir(parents=True,exist_ok=True);(O/"originals").mkdir(exist_ok=True)
    metadata=[]; selections=[];rows=[];downloaded=set()
    for q in queries:
        query=q["query"];pattern=re.compile(q["title_regex"],re.I)
        item={"frozen_artwork_id":q["frozen_artwork_id"],"subject_query":query,"search_status":"NOT_RUN","total_results":None,"candidates":[]}
        try:
            response=api_get({"q":query,"cc0":"","has_image":1,"limit":15,"skip":0,
              "fields":"id,accession_number,title,creation_date,creators,type,technique,share_license_status,images,url"})
            item["search_status"]="OK"
            item["total_results"]=response.get("info",{}).get("total")
            for art in response["data"]:
                title=art.get("title") or ""
                is_title=bool(pattern.search(title))
                if q["frozen_artwork_id"]=="ART-eter-aul-ubens-oly-amily-with-aint-nne":
                    is_title=is_title and bool(re.search(r"anne|anna",title,re.I))
                kind=(art.get("type") or "").lower()
                technique=(art.get("technique") or "").lower()
                # Prefer standalone painted object to prints, engravings, manuscripts, illustrations.
                painting=("paint" in kind or any(v in technique for v in ["oil on","tempera on","watercolor on","gouache on"]))
                license_ok=art.get("share_license_status")=="CC0"
                aid=art.get("id")
                identifier=f"cma-{aid}"
                is_duplicate=identifier in ids
                img=art.get("images") or {}
                photo=img.get("print") or img.get("web") or {}
                u=photo.get("url") if isinstance(photo,dict) else None
                # Provider artwork page, never infer user source from title/artist.
                rec={"cma_id":aid,"accession":art.get("accession_number"),"title":title,
                     "artist":"; ".join(c.get("description","") for c in (art.get("creators") or []) if isinstance(c,dict))[:300],
                     "date":art.get("creation_date"),"type":art.get("type"),"technique":art.get("technique"),
                     "cc0":license_ok,"painting_like":painting,"title_subject_match":is_title,
                     "already_in_451_frozen_ids":is_duplicate,
                     "download_eligible":bool(is_title and painting and license_ok and not is_duplicate and u),
                     "image_url":u,"source":"https://www.clevelandart.org/art/"+str(art.get("accession_number") or "")}
                item["candidates"].append(rec)
        except Exception as e:
            item["search_status"]="ACCESS_OR_API_ERROR"
            item["error"]=type(e).__name__+": "+str(e)[:210]
        metadata.append(item)
        possible=[x for x in item["candidates"] if x["download_eligible"]]
        # At most one candidate for each query; same museum object only archived once
        if possible and len(downloaded)<19:
            x=possible[0]; i=x["cma_id"]; accession=x["accession"]
            if i not in downloaded:
                v={key:"" for key in FIELDS}
                v.update(frozen_artwork_id=q["frozen_artwork_id"],theme_query=query,alternative_object_id=i,
                  alternative_title=x["title"],alternative_artist=x["artist"],alternative_date=x["date"],
                  CMA_accession=accession,alternative_museum_object_url=x["source"],
                  share_license_status="CC0",provider_CC0_image_rights_evidence="CMA_OWN_OPEN_ACCESS_CC0_RECORD",
                  source_image_url=x["image_url"],
                  full_painting_composition_edited="NO",
                  match_to_frozen_original="NO_DIFFERENT_OBJECT_ALTERNATIVE",
                  automatically_replaces_frozen_art="NO",editorial_selected="NO",app_image_published="NO",
                  hold_reason="No editorial review of iconography, composition, liturgical fitness or prior selected artworks; publication NOT automatic")
                try:
                    b,w,h,fmt,host=acquire(x["image_url"])
                    digest=hashlib.sha256(b).hexdigest()
                    ext="jpg" if fmt=="JPEG" else "png"
                    (O/"originals"/(f"cma-{i}-{digest[:16]}.{ext}")).write_bytes(b)
                    v.update(source_status="EXACT_CMA_CC0_ALTERNATIVE_RESEARCH_ORIGINAL_SHA_VERIFIED",
                      original_photo_width=w,original_photo_height=h,original_image_bytes=len(b),
                      source_image_sha256=digest,image_origin_host=host)
                    downloaded.add(i)
                except Exception as e:
                    v["source_status"]="IMAGE_DOWNLOAD_UNAVAILABLE_HOLD"
                    v["hold_reason"]+="; "+type(e).__name__+": "+str(e)[:170]
                rows.append(v)
        print("B43_CMA",query,"status",item["search_status"],"total",item["total_results"],
              "title_matches",sum(c["title_subject_match"] for c in item["candidates"]),
              "new_exact_painting_candidates",len(possible),flush=True)
        time.sleep(.25)
    with (O/"source-results.csv").open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=FIELDS);writer.writeheader();writer.writerows(rows)
    (O/"discovery-evidence.json").write_text(json.dumps(metadata,indent=2,ensure_ascii=False)+"\n")
    ok=[r for r in rows if r["source_image_sha256"]]
    summary={"schema":"AO_B43_CMA_CC0_ALT_PAINTINGS_V1","subject_queries":19,
             "queries_successful":sum(m["search_status"]=="OK" for m in metadata),
             "queries_failed":sum(m["search_status"]!="OK" for m in metadata),
             "case_theme_candidate_pairs":sum(len(m["candidates"]) for m in metadata),
             "candidate_title_matches":sum(sum(c["title_subject_match"] for c in m["candidates"]) for m in metadata),
             "new_painted_subject_alternative_attempts":len(rows),
             "sha_verified_CMA_CC0_alternative_originals":len(ok),
             "new_alternative_image_bytes":sum(int(r["original_image_bytes"]) for r in ok),
             "original_frozen_cases_completed":0,"editorial_approvals":0,
             "original_artwork_identity_adjudications":0,
             "app_publication_decisions":0,"strictly_zero_euro":True,
             "remote_draft_archive_checksum_required":True}
    (O/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
    print("B43_CMA_SUMMARY",json.dumps(summary),flush=True)
if __name__=="__main__":main()
