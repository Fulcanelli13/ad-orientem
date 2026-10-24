#!/usr/bin/env python3
"""B42: five accession-keyed Italian national cultural-record photo checks.
Preserve only exact-record-linked research images with safe hosts/TLS/MIME/SHA.
Linked-data license != embedded photo reuse license; never publish or promote.
"""
import csv,hashlib,json,re,time,html
from io import BytesIO
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlsplit
from PIL import Image

R=Path("data/research")
IN=R/"sacred-art-b42-five-iccd-exact-photo-targets.json"
OUT=Path("artifacts/b42-five-iccd-exact-object-research")
UA="AdOrientemResearch/2026 (+https://github.com/Fulcanelli13/ad-orientem; historical sources)"
ALLOWED_IMAGE_HOSTS={"sigecweb.beniculturali.it"}
META_HOSTS={"dati.cultura.gov.it","catalogo.beniculturali.it","catalogo.cultura.gov.it"}
MAX_RECORD_BYTES=8_000_000
MAX_IMAGE_BYTES=16_000_000
FIELDS=["artwork_id","accession","title","artist","records_attempted","metadata_status",
 "recorded_photo_urls","image_source","image_status","width","height","bytes","sha256",
 "photo_exact_object_identity_certified","full_work_composition_certified",
 "app_reuse_rights_approved","editorial_approved","hold_reason"]
PATTERN=re.compile(r'https?://sigecweb\.beniculturali\.it/images/fullsize/[^\s<>\"\'\\]+',re.I)
def fetch_record(url):
    u=urlsplit(url)
    if u.scheme!="https" or u.hostname not in META_HOSTS:raise ValueError("unapproved record host")
    req=Request(url,headers={"User-Agent":UA,"Accept":"text/html,application/xhtml+xml,application/ld+json,application/rdf+xml"})
    with urlopen(req,timeout=28) as f:
        u2=urlsplit(f.geturl())
        if f.status!=200 or u2.hostname not in META_HOSTS or u2.scheme!="https":raise ValueError("bad record HTTP or redirect")
        typ=f.headers.get("Content-Type","").split(";")[0].lower()
        if typ not in ("text/html","application/xhtml+xml","application/ld+json","application/rdf+xml","text/plain"):raise ValueError("unexpected record mime: "+typ)
        b=f.read(MAX_RECORD_BYTES+1)
        if len(b)>MAX_RECORD_BYTES:raise ValueError("oversize record")
        return b.decode("utf-8",errors="replace")
def fetch_image(url):
    u=urlsplit(url)
    if u.scheme!="https" or u.hostname not in ALLOWED_IMAGE_HOSTS or not u.path.startswith("/images/fullsize/"):raise ValueError("image host/path disallowed")
    req=Request(url,headers={"User-Agent":UA,"Accept":"image/jpeg,image/png"})
    with urlopen(req,timeout=45) as f:
        u2=urlsplit(f.geturl())
        if f.status!=200 or u2.hostname not in ALLOWED_IMAGE_HOSTS or u2.scheme!="https":raise ValueError("bad media response or redirect")
        typ=f.headers.get("Content-Type","").split(";")[0].lower()
        if typ not in ("image/jpeg","image/png"):raise ValueError("not JPEG/PNG MIME")
        b=f.read(MAX_IMAGE_BYTES+1)
        if len(b)>MAX_IMAGE_BYTES or len(b)<2000:raise ValueError("image size unavailable")
    with Image.open(BytesIO(b)) as im:
        fmt=im.format
        wh=im.size
        im.verify()
    if fmt not in ("JPEG","PNG") or wh[0]<200 or wh[1]<200:raise ValueError(f"image codec/dimensions unsuitable {fmt} {wh}")
    return b,fmt,wh
def main():
    inp=json.loads(IN.read_text())
    cands=inp["candidates"]
    assert len(cands)==5 and len({x["id"] for x in cands})==5
    assert inp["strictly_zero_euro"] and inp["publication_approvals"]==0
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"originals").mkdir(exist_ok=True)
    rows=[];allattempts=[]
    for row in cands:
        id_=row["id"]; acc=row["accession"]
        targets=[
          f"https://dati.cultura.gov.it/lodview-arco/resource/HistoricOrArtisticProperty/{acc}",
          f"https://catalogo.beniculturali.it/detail/HistoricOrArtisticProperty/{acc}"
        ]
        photo_links=set()
        status=[]
        for target in targets:
            try:
                content=fetch_record(target)
                if acc not in content:
                    status.append({"url":target,"status":"RESPONSE_NO_EXACT_ACCESSION"})
                    continue
                content=html.unescape(content).replace("\\/","/")
                links={x.rstrip(".,);]") for x in PATTERN.findall(content)}
                photo_links.update(links)
                status.append({"url":target,"status":"RECORD_FETCHED_ACCESSION_GROUNDED","media_count":len(links)})
            except Exception as e:
                status.append({"url":target,"status":"ACCESS_ERROR_NOT_NO_IMAGE_PROOF","message":type(e).__name__+": "+str(e)[:190]})
            time.sleep(.25)
        urls=sorted(photo_links)
        out={key:"" for key in FIELDS}
        out.update(artwork_id=id_,accession=acc,title=row["title"],artist=row["artist"],
           records_attempted=len(status),recorded_photo_urls="; ".join(urls[:6]),
           metadata_status="EXACT_RECORD_MEDIA_POINTERS" if urls else "NO_MEDIA_POINTER_FROM_ACCESSED_PAGES",
           app_reuse_rights_approved="NO",editorial_approved="NO",
           photo_exact_object_identity_certified="NO",
           full_work_composition_certified="NO",
           image_status="NOT_DOWNLOADED",
           hold_reason="Research only. Linked-data/catalogue CC licensing does not certify photo ownership, exact composition or commercial app reuse.")
        for url in urls[:3]:
            try:
                b,fmt,(w,h)=fetch_image(url)
                digest=hashlib.sha256(b).hexdigest()
                ext="jpg" if fmt=="JPEG" else "png"
                p=OUT/"originals"/(id_+"-"+digest[:16]+"."+ext)
                if not p.exists():p.write_bytes(b)
                out.update(image_source=url,image_status="INSTITUTION_LINKED_ORIGINAL_BYTES_SHA_VERIFIED_OBJECT_PHOTO_VISUAL_HOLD",
                  width=w,height=h,bytes=len(b),sha256=digest)
                break
            except Exception as e:
                out["image_status"]="ACCESS_OR_VALIDATION_HOLD_NO_DOWNLOAD"
                out["hold_reason"]+="; "+type(e).__name__+": "+str(e)[:160]
        print("B42_ICCD",id_,out["metadata_status"],len(urls),out["image_status"],flush=True)
        rows.append(out);allattempts.append({"artwork_id":id_,"accession":acc,"record_attempts":status,"media_urls":urls[:10]})
    with (OUT/"source-results.csv").open("w",encoding="utf-8",newline="") as fh:
        writer=csv.DictWriter(fh,fieldnames=FIELDS);writer.writeheader();writer.writerows(rows)
    (OUT/"metadata-attempts.json").write_text(json.dumps(allattempts,indent=2,ensure_ascii=False)+"\n")
    yes=[r for r in rows if r["sha256"]]
    summary={
        "schema":"AO_B42_FIVE_ICCD_PRECISE_RECORD_IMAGES_V1",
        "object_records_checked":len(rows),
        "exact_record_media_pointers":sum(r["metadata_status"]=="EXACT_RECORD_MEDIA_POINTERS" for r in rows),
        "source_binary_image_count":len(yes),
        "source_original_bytes":sum(int(r["bytes"]) for r in yes),
        "new_complete_work_images_certified":0,
        "new_artworks_publication_approved":0,
        "new_editorial_artworks_approved":0,
        "new_curatorial_identity_certifications":0,
        "all_image_rights_pending":True,
        "strictly_zero_euro":True,
        "mandatory_unpublished_remote_archive_sha_verification":True
    }
    (OUT/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
    print("B42_ICCD_SUMMARY",json.dumps(summary),flush=True)
if __name__=="__main__":main()
