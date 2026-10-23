#!/usr/bin/env python3
"""Produce research-only artwork contact sheets from acquired, hash-verified binaries.
All compositions, identifications, rights interpretations, Scripture placements,
and publication decisions remain pending human editorial review.
"""
import argparse, csv, hashlib, json, math, pathlib, re, textwrap
from collections import Counter
from datetime import datetime, timezone
from PIL import Image, ImageDraw, ImageFont, ImageOps

EXTS={".jpg",".jpeg",".png",".tif",".tiff",".webp"}
INPUT="data/research/sacred-art-acquisition-245-source-rollup.csv"
FIELDS=["asset_source_id","record_id","title","artist","acquisition_tier","source_url",
        "original_sha256","museum_print_sha256","observed_sha256","sha256_verified",
        "decoded_format","observed_width","observed_height","long_edge_gate",
        "icc_profile_present","exif_orientation","image_mode","dhash64",
        "file_name","contact_sheet","technical_qa","visual_qa","identity_qa","scripture_qa","publication_gate","error"]

def digest(path):
    h=hashlib.sha256()
    with open(path,"rb") as stream:
        for chunk in iter(lambda:stream.read(1048576),b""):h.update(chunk)
    return h.hexdigest()

def font(size=17):
    for name in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf","/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"):
        if pathlib.Path(name).is_file():return ImageFont.truetype(name,size)
    return ImageFont.load_default()

def dhash(image):
    im=image.convert("L").resize((9,8),Image.Resampling.LANCZOS)
    pix=list(im.getdata())
    value=0
    for y in range(8):
        for x in range(8):
            value=(value<<1) | int(pix[y*9+x]>pix[y*9+x+1])
    return f"{value:016x}"

def trim(value,limit):
    value=str(value or "").replace("\n"," ").strip()
    return value if len(value)<=limit else value[:limit-1]+"…"

def sheet(rows, previews, output, wave):
    CW,CH,COLS=330,325,4
    N=24
    pages=[]
    for index in range(0,len(rows),N):
        part=rows[index:index+N]
        canvas=Image.new("RGB",(CW*COLS,CH*math.ceil(len(part)/COLS)+68),(11,17,26))
        draw=ImageDraw.Draw(canvas)
        draw.text((20,15),f"AD ORIENTEM  ·  {wave}   |   Visual review only   |   sheet {index//N+1}",fill=(233,228,214),font=font(20))
        draw.text((20,41),"Source images are not publication-approved. Compare object identity, composition and exact Scripture context.",fill=(163,177,186),font=font(12))
        for number,r in enumerate(part):
            x=(number%COLS)*CW+10
            y=(number//COLS)*CH+68
            draw.rounded_rectangle((x,y,x+CW-18,y+CH-9),radius=9,fill=(24,32,42),outline=(54,64,76),width=1)
            img=previews.get(r["asset_source_id"])
            if img:
                left=x+(CW-18-img.width)//2
                top=y+8+(209-img.height)//2
                canvas.paste(img,(left,top))
            else:
                draw.text((x+12,y+90),"PREVIEW MISSING",fill=(226,149,129),font=font(18))
            draw.text((x+10,y+222),trim(r["title"],39),fill=(230,227,216),font=font(14))
            draw.text((x+10,y+246),trim(r["artist"],42),fill=(181,185,181),font=font(12))
            draw.text((x+10,y+269),trim(r["asset_source_id"],39),fill=(144,184,204),font=font(12))
            suffix=("ORIGINAL" if r["acquisition_tier"]=="ORIGINAL" else "MUSEUM PRINT")
            draw.text((x+10,y+289),f"{suffix} · {r['observed_width']}×{r['observed_height']} · {r['technical_qa']}",fill=(156,180,161) if r["technical_qa"]=="HASH_DECODE_PASS" else (224,144,124),font=font(11))
        path=output/(f"{wave}-review-{index//N+1:02d}.jpg")
        canvas.save(path,"JPEG",quality=87,optimize=True)
        pages.append(path.name)
    return pages

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--wave",required=True)
    p.add_argument("--incoming",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    source={};hash_index={}
    with open(INPUT,encoding="utf-8",newline="") as stream:
        for row in csv.DictReader(stream):
            source[row["asset_source_id"]]=row
            for tier,key in (("ORIGINAL","original_sha256"),("MUSEUM_PRINT_DERIVATIVE","museum_print_sha256")):
                val=row.get(key,"")
                if re.fullmatch(r"[0-9a-f]{64}",val):
                    if val in hash_index:raise ValueError("Same binary SHA associated with multiple source IDs: "+val)
                    hash_index[val]=(row,tier)
    out=pathlib.Path(a.output);out.mkdir(parents=True,exist_ok=True)
    imgs=[f for f in pathlib.Path(a.incoming).rglob("*") if f.is_file() and f.suffix.lower() in EXTS]
    if not imgs:raise ValueError("No source image files extracted from GitHub artifact: "+a.incoming)
    results=[];previews={};unexpected=[]
    for path in sorted(imgs):
        sha=digest(path)
        matched=hash_index.get(sha)
        if not matched:
            unexpected.append({"name":str(path),"sha256":sha,"bytes":path.stat().st_size})
            continue
        record,tier=matched
        x={key:"" for key in FIELDS}
        x.update(asset_source_id=record["asset_source_id"],record_id=record["record_id"],
                 title=record["title"],artist=record["artist"],acquisition_tier=tier,
                 source_url=record["source_url"],original_sha256=record["original_sha256"],
                 museum_print_sha256=record["museum_print_sha256"],observed_sha256=sha,
                 sha256_verified="YES",file_name=path.name,technical_qa="NOT_CHECKED",
                 visual_qa="HUMAN_REVIEW_REQUIRED",identity_qa="HUMAN_REVIEW_REQUIRED",
                 scripture_qa="HUMAN_REVIEW_REQUIRED",publication_gate="HOLD")
        try:
            with Image.open(path) as im:
                x["decoded_format"]=im.format or ""
                x["observed_width"],x["observed_height"]=im.size
                x["image_mode"]=im.mode
                x["icc_profile_present"]="YES" if im.info.get("icc_profile") else "NO"
                x["exif_orientation"]=im.getexif().get(274,1)
                x["long_edge_gate"]="PASS" if max(im.size)>=2400 else "REVIEW_UNDER_2400"
                im.draft("RGB",(600,600))
                oriented=ImageOps.exif_transpose(im)
                oriented.thumbnail((CW_LIMIT:=300,205),Image.Resampling.LANCZOS)
                if oriented.mode!="RGB":oriented=oriented.convert("RGB")
                x["dhash64"]=dhash(oriented)
                img=oriented.copy()
                # Thumbnails preserve the original crop: no synthetic extension or retouching.
                previews[record["asset_source_id"]]=img
                x["technical_qa"]="HASH_DECODE_PASS"
        except Exception as exc:
            x["technical_qa"]="DECODE_FAILURE"
            x["error"]=str(exc)[:350]
        results.append(x)
    got={r["asset_source_id"] for r in results}
    if len(got)!=len(results):raise ValueError("Duplicate acquired source identities in one wave")
    sheets=sheet(results,previews,out,a.wave)
    for i,r in enumerate(results):
        r["contact_sheet"]=sheets[i//24] if sheets else ""
    with (out/"Technical_visual_review_queue.csv").open("w",newline="",encoding="utf-8") as stream:
        w=csv.DictWriter(stream,fieldnames=FIELDS);w.writeheader();w.writerows(results)
    summary={
        "wave":a.wave,"source_files_found":len(imgs),"matched_source_identities":len(results),
        "unrecognized_image_files":unexpected,"technical_status_counts":dict(Counter(r["technical_qa"] for r in results)),
        "below_2400_long_edge":sum(r["long_edge_gate"]=="REVIEW_UNDER_2400" for r in results),
        "exif_nondefault":sum(str(r["exif_orientation"]) not in ("","1") for r in results),
        "icc_profile_present":sum(r["icc_profile_present"]=="YES" for r in results),
        "contact_sheets":sheets,"visual_reviews_performed":0,
        "identity_reviews_performed":0,"scripture_reviews_performed":0,"publication_approvals":0,
        "source_of_truth":INPUT,"generated_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")
    }
    (out/"Review_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY",json.dumps(summary,ensure_ascii=False),flush=True)
    if unexpected or any(r["technical_qa"]!="HASH_DECODE_PASS" for r in results):
        raise ValueError("Hash reconciliation or image decode discrepancy; see review summary")
if __name__=="__main__":main()
