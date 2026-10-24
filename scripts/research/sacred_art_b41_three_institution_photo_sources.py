#!/usr/bin/env python3
"""B41 strictly €0 institutional photo research acquisition for 3 exact IDs.
Source URI must be on an institutional record and the binary must be decoded.
NO publication approval, frozen identity rewriting, or app changes.
"""
import csv,hashlib,json
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlsplit
from PIL import Image
from io import BytesIO

R=Path("data/research")
C=R/"sacred-art-b41-three-institutional-source-candidates.json"
O=Path("artifacts/b41-three-exact-institutional-research-photos")
MAX_BYTES=25_000_000
FIELDS=["artwork_id","title","artist","museum","accession","official_object_page","image_url",
"identity_evidence_class","result_status","response_final_host","content_type",
"bytes","sha256","image_width","image_height","visual_identity_still_to_check",
"provisional_complete_object_candidate","app_photo_reuse_rights_approved",
"editorial_selected","publication_approved","hold_reason"]

def request(url,expected_host):
    if urlsplit(url).scheme!="https" or urlsplit(url).hostname!=expected_host:
        raise ValueError("Unexpected source host")
    headers={"User-Agent":"AdOrientemSacredArtResearch/2026 (+https://github.com/Fulcanelli13/ad-orientem)","Accept":"image/jpeg,image/png,image/webp"}
    with urlopen(Request(url,headers=headers),timeout=50) as r:
        if r.status!=200: raise ValueError(f"HTTP {r.status}")
        u=urlsplit(r.geturl())
        if u.scheme!="https" or u.hostname!=expected_host:
            raise ValueError("Redirect leaves official image host")
        t=r.headers.get("Content-Type","").split(";")[0].lower().strip()
        if t not in {"image/jpeg","image/png","image/webp"}:
            raise ValueError("Not accepted image MIME: "+t)
        b=r.read(MAX_BYTES+1)
    if not b or len(b)>MAX_BYTES: raise ValueError("Missing or oversized binary")
    return b,t,u.hostname

def main():
    manifest=json.loads(C.read_text())
    candidates=manifest["candidates"]
    assert len(candidates)==3 and len({c["artwork_id"] for c in candidates})==3
    assert manifest["app_rights_approved"]==0 and manifest["strictly_zero_euro"]
    O.mkdir(parents=True,exist_ok=True);(O/"originals").mkdir(exist_ok=True)
    results=[]
    for c in candidates:
        x={k:"" for k in FIELDS}
        x.update(artwork_id=c["artwork_id"],title=c["title"],artist=c["artist"],
          museum=c["museum"],accession=c["accession"],official_object_page=c["official_object_page"],
          image_url=c["image_url"],identity_evidence_class=c["source_identity_evidence_class"],
          app_photo_reuse_rights_approved="NO",editorial_selected="NO",
          publication_approved="NO",provisional_complete_object_candidate="NO",
          visual_identity_still_to_check="YES" if not c["provisional_full_object_candidate"] else "VISUALLY_CHECKED_ON_OFFICIAL_SOURCE_WEB",
          hold_reason=c["licensing_gate"])
        try:
            b,t,host=request(c["image_url"],c["expected_origin_host"])
            with Image.open(BytesIO(b)) as im:
                fmt=im.format;w,h=im.size
                im.verify()
            if fmt not in {"JPEG","PNG","WEBP"} or w<c["min_width"] or h<c["min_height"]:
                raise ValueError(f"Not suitable {fmt} or {w}x{h}; hold exact photo")
            ext={"JPEG":"jpg","PNG":"png","WEBP":"webp"}[fmt]
            digest=hashlib.sha256(b).hexdigest()
            (O/"originals"/(c["artwork_id"]+"-"+digest[:16]+"."+ext)).write_bytes(b)
            x.update(result_status="EXACT_INSTITUTION_LINKED_RESEARCH_ORIGINAL_SHA_VERIFIED_PENDING_RIGHTS",
              bytes=len(b),sha256=digest,image_width=w,image_height=h,
              response_final_host=host,content_type=t,
              provisional_complete_object_candidate=("YES_RESEARCH_ONLY" if c["provisional_full_object_candidate"] else "NO_OBJECT_PHOTO_NEEDS_VISUAL_CHECK"))
        except Exception as e:
            x["result_status"]="INSTITUTION_PHOTO_UNAVAILABLE_OR_TECHNICAL_HOLD"
            x["hold_reason"]=c["licensing_gate"]+"; "+type(e).__name__+": "+str(e)[:210]
        print("B41_INSTITUTION",x["artwork_id"],x["result_status"],x.get("bytes",""),flush=True)
        results.append(x)
    with (O/"source-results.csv").open("w",newline="",encoding="utf-8") as f:
        wr=csv.DictWriter(f,fieldnames=FIELDS);wr.writeheader();wr.writerows(results)
    ok=[r for r in results if r["result_status"]=="EXACT_INSTITUTION_LINKED_RESEARCH_ORIGINAL_SHA_VERIFIED_PENDING_RIGHTS"]
    summary={"schema":"AO_B41_THREE_INSTITUTION_EXACT_SOURCE_RESEARCH_V1",
       "candidate_cases":3,"downloaded_image_originals":len(ok),
       "new_image_bytes":sum(int(r["bytes"]) for r in ok),
       "provisionally_complete_object_source_candidates":sum(r["provisional_complete_object_candidate"]=="YES_RESEARCH_ONLY" for r in ok),
       "other_image_photo_identity_holds":sum(r["provisional_complete_object_candidate"]=="NO_OBJECT_PHOTO_NEEDS_VISUAL_CHECK" for r in ok),
       "technical_or_access_holds":3-len(ok),
       "publication_approvals":0,"editorial_approvals":0,"app_reuse_rights_approvals":0,
       "catalogue_master_mutations":0,"strictly_zero_euro":True,
       "draft_remote_SHA_archive_required":True}
    (O/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
    print("B41_SOURCE_RESULT",json.dumps(summary),flush=True)
if __name__=="__main__":main()
