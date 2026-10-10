#!/usr/bin/env python3
"""Coverage-first acquisition from Cleveland Museum of Art's CC0 open-access API.

Research originals/contact sheets stay in CI artifacts until human curation.
Never auto-approve paintings or copy non-CC0 images to the app.
"""
import csv,hashlib,io,json,re,time,urllib.parse
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from PIL import Image, ImageOps, ImageDraw
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-cma-gaps"
ORIGINALS=OUT/"museum-originals"
REGISTRY=ROOT/"data/calendar/sacred-art-candidates.v1.json"
BASE="https://openaccess-api.clevelandart.org/api/artworks/"
USER_AGENT="AdOrientem/1.0 SacredArtCoverageReview"
# Exact-title subject checks are a candidate triage, not proof of final iconography.
TASKS=[
 ("rosary.joy2","Visitation",r"\bvisitation\b",3),
 ("rosary.joy5","Christ among the Doctors",r"\bchrist\b.*\bdoctors\b|\bjesus\b.*\btemple\b|\bfinding\b.*\btemple\b",3),
 ("rosary.joy5","Christ in the Temple",r"\bchrist\b.*\btemple\b|\bjesus\b.*\btemple\b",3),
 ("rosary.sor1","Agony in the Garden",r"\bagony\b.*\bgarden\b|\bchrist\b.*\bgarden\b|\bgethsemane\b",3),
 ("rosary.sor1","Christ in the Garden of Gethsemane",r"\bagony\b|\bgarden of gethsemane\b|\bchrist\b.*\bgarden\b",3),
 ("rosary.sor2","Flagellation of Christ",r"\bflagellation\b|\bscourging\b|\bchrist at the column\b",3),
 ("rosary.sor2","Christ at the Column",r"\bchrist at the column\b|\bflagellation\b|\bscourging\b",3),
 ("rosary.sor3","Crowning with Thorns",r"\bcrown(?:ed|ing)? with thorns\b|\bmocking of christ\b",3),
 ("rosary.sor3","Mocking of Christ",r"\bmocking of christ\b|\bcrown(?:ed|ing)? with thorns\b",3),
 ("rosary.glo3","Pentecost",r"\bpentecost\b|\bdescent of the holy (?:ghost|spirit)\b",3),
 ("rosary.glo3","Descent of the Holy Spirit",r"\bpentecost\b|\bdescent of the holy (?:ghost|spirit)\b",3),
 ("rosary.glo5","Coronation of the Virgin",r"\bcoronation of (?:the )?(?:virgin|mary)\b|\bvirgin.*\bcrowned\b",3),
 ("rosary.glo5","Coronation of Mary",r"\bcoronation\b.*\b(?:virgin|mary)\b",3),
 ("rosary.glo2","Ascension of Christ",r"\bascension\b",2),
 ("rosary.glo4","Assumption of the Virgin",r"\bassumption\b",2),
 ("regina-caeli","The Resurrection",r"\bresurrection of christ\b|\bchrist's resurrection\b|\bthe resurrection\b",2),
 ("adoration","The Supper at Emmaus",r"\b(?:supper|disciples) at emmaus\b|\bthe last supper\b",2),
]
MAX_ACQUIRED=34
MAX_BYTES=30_000_000
def receive(url,max_bytes=MAX_BYTES):
    if not url.startswith("https://"):raise ValueError("Non HTTPS")
    last=""
    for attempt in range(3):
        try:
            with urlopen(Request(url,headers={"User-Agent":USER_AGENT,"Accept":"application/json,image/jpeg,*/*"}),timeout=24) as response:
                if response.headers.get("Content-Length") and int(response.headers["Content-Length"])>max_bytes:
                    raise ValueError("Source size exceeds maximum")
                body=response.read(max_bytes+1)
                if len(body)>max_bytes: raise ValueError("Source size exceeds maximum")
                return body
        except (HTTPError,URLError,TimeoutError,OSError) as e:
            last=str(e)
            if isinstance(e,HTTPError) and e.code not in (403,429,500,502,503,504):break
            time.sleep(attempt*2+2)
    raise RuntimeError(last)
def qc(raw):
    with Image.open(io.BytesIO(raw)) as im:
        im.load()
        im=ImageOps.exif_transpose(im)
        w,h=im.size
        if max(w,h)<2500:raise ValueError("Image under 2500px longest dimension")
        im=im.convert("RGB")
        im.thumbnail((220,220))
        pixels=np.asarray(im,dtype=np.int16)
        pct=float(np.mean((np.max(pixels,axis=2)-np.min(pixels,axis=2))>18))
        if pct<.07:raise ValueError("Near-monochrome")
        return w,h,round(pct,4)
def contact_sheets(rows):
    rows=sorted([r for r in rows if r["status"]=="ORIGINAL_ACQUIRED"],key=lambda x:(x["prayerKey"],x["id"]))
    for offset in range(0,len(rows),8):
        sheet=Image.new("RGB",(1600,1980),(241,238,231))
        draw=ImageDraw.Draw(sheet)
        for i,item in enumerate(rows[offset:offset+8]):
            px=i%4*400;py=i//4*990
            with Image.open(ORIGINALS/item["filename"]) as original:
                im=ImageOps.exif_transpose(original).convert("RGB")
                im.thumbnail((374,840),Image.Resampling.LANCZOS)
                sheet.paste(im,(px+(400-im.width)//2,py+8+(840-im.height)//2))
            draw.text((px+8,py+875),item["prayerKey"]+" "+item["id"],fill=(25,25,25))
            draw.text((px+8,py+901),item["title"][:51],fill=(25,25,25))
            draw.text((px+8,py+925),item["creator"][:50],fill=(55,55,55))
        sheet.save(OUT/("gap-contact-sheet-%02d.jpg"%(1+offset//8)),quality=90,optimize=True)
def main():
    ORIGINALS.mkdir(parents=True,exist_ok=True)
    existing=json.loads(REGISTRY.read_text(encoding="utf8"))["artworks"]
    known={row["id"] for row in existing}
    rows=[]; search_log=[];count_by_pool={}
    for prayerKey,term,title_regex,need in TASKS:
        if len([x for x in rows if x["status"]=="ORIGINAL_ACQUIRED"])>=MAX_ACQUIRED:break
        if count_by_pool.get(prayerKey,0)>=need:continue
        query=urllib.parse.urlencode({"q":term,"cc0":"","type":"Painting","has_image":"1","limit":"50"})
        api=BASE+"?"+query
        search={"prayerKey":prayerKey,"term":term,"url":api,"hits":0,"newAcquired":0}
        try:
            result=json.loads(receive(api,3_000_000))
            matches=result.get("data") or []
            search["hits"]=len(matches)
            for obj in matches:
                if count_by_pool.get(prayerKey,0)>=need:break
                key="cma-"+str(obj.get("id"))
                if key in known:continue
                title=obj.get("title") or ""
                if not re.search(title_regex,title,re.I):continue
                if obj.get("type")!="Painting" or obj.get("share_license_status")!="CC0":continue
                url=(obj.get("images") or {}).get("print",{}).get("url") or ""
                if not url.startswith("https://openaccess-cdn.clevelandart.org/"):continue
                art_url=obj.get("url") or ""
                if not art_url.startswith("https://"):continue
                creator=", ".join(c.get("description","") for c in (obj.get("creators") or []))[:150]
                record={"id":key,"prayerKey":prayerKey,"title":title,"creator":creator,
                    "date":obj.get("creation_date"),"sourceUrl":art_url,
                    "apiUrl":api,"imageUrl":url,"accession":obj.get("accession_number"),
                    "rights":"CC0","type":"Painting","status":"REJECTED",
                    "humanArtisticApproval":False,"cropApproval":False,"liturgicalMatchApproved":False}
                try:
                    raw=receive(url)
                    w,h,colour=qc(raw)
                    filename=key+".jpg"
                    (ORIGINALS/filename).write_bytes(raw)
                    record.update(filename=filename,width=w,height=h,colourFraction=colour,
                        bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest(),status="ORIGINAL_ACQUIRED")
                    known.add(key);search["newAcquired"]+=1
                    count_by_pool[prayerKey]=count_by_pool.get(prayerKey,0)+1
                    print("COLLECTED",prayerKey,key,title[:60],w,h,flush=True)
                except Exception as e:
                    record["reason"]=str(e)
                rows.append(record)
                time.sleep(0.45)
        except Exception as exc:
            search["error"]=str(exc)
        search_log.append(search)
        print("SEARCH",prayerKey,term,"hits",search["hits"],"acquired",search["newAcquired"],"error",search.get("error",""),flush=True)
        time.sleep(.65)
    contact_sheets(rows)
    report={"schema":"AO_SACRED_ART_CMA_GAP_ACQUISITION_V1",
      "purpose":"Fill missing Rosary and recurring-prayer subject pools prior to artistic selection",
      "hardStop":"These are museum-licensed original painting candidates. All require separate final artistic and composition assessment.",
      "searches":search_log,"entries":rows}
    (OUT/"gap-acquisition.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    columns=["id","prayerKey","title","creator","sourceUrl","imageUrl","rights","width","height","status","reason","sha256"]
    with (OUT/"gap-summary.csv").open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=columns,extrasaction="ignore")
        writer.writeheader();writer.writerows(rows)
    accepted=[x for x in rows if x["status"]=="ORIGINAL_ACQUIRED"]
    print("GAP COLLECTION: %s originals across %s pools."%(len(accepted),len({x["prayerKey"] for x in accepted})),flush=True)
    if not accepted: raise SystemExit("No acquisition; consult search log for source gaps.")
if __name__=="__main__":main()
