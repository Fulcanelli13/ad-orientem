#!/usr/bin/env python3
"""Research CC0 religious paintings across Met + Art Institute, review-only.

Search matches are proposals, NEVER automatically made production approved.
Downloads whole original with source records; no scraping site HTML.
Both museum APIs provide object-level public-domain flags.
"""
import csv,hashlib,io,json,re,time,urllib.parse
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from PIL import Image,ImageOps,ImageDraw
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-research-batch2"
IMAGES=OUT/"museum-originals"
PREVIOUS=ROOT/"data/calendar/sacred-art-candidates.v1.json"
MET_API="https://collectionapi.metmuseum.org/public/collection/"
AIC_API="https://api.artic.edu/api/v1/artworks/"
TASKS=[
 ("angelus","Annunciation",r"\bannunciation\b",4),
 ("angelus","Virgin and Child",r"\bvirgin and child\b",2),
 ("joy2","Visitation",r"\bvisitation\b",3),
 ("joy3","Nativity",r"\bnativity\b|\badoration of the shepherds\b",2),
 ("joy4","Presentation of Christ",r"\bpresentation\b.{0,30}\btemple\b",2),
 ("joy5","Christ among the Doctors",r"\bdoctors\b|\bchrist.{0,30}temple\b",2),
 ("sor1","Agony in the Garden",r"\bagony\b|\bchrist.{0,30}garden\b",2),
 ("sor2","Flagellation",r"\bflagellation\b|\bscourg",2),
 ("sor3","Crowning with Thorns",r"\bcrown(?:ing|ed)? with thorns\b",2),
 ("sor4","Christ Carrying the Cross",r"\bcarrying the cross\b",2),
 ("sor5","Crucifixion",r"\bcrucifixion\b|\bchrist on the cross\b",2),
 ("glo1","Resurrection of Christ",r"\bresurrection\b",3),
 ("glo2","Ascension",r"\bascension\b",2),
 ("glo3","Pentecost",r"\bpentecost\b|\bdescent of the holy spirit\b",3),
 ("glo4","Assumption of the Virgin",r"\bassumption\b",3),
 ("glo5","Coronation of the Virgin",r"\bcoronation of (the )?virgin\b",3),
 ("regina-caeli","Resurrection",r"\bresurrection\b",2),
 ("regina-caeli","Virgin and Child",r"\bvirgin and child\b",2),
 ("adoration","Last Supper",r"\blast supper\b",2),
 ("adoration","Christ Blessing",r"\bchrist blessing\b",1),
 ("holy-family","Holy Family",r"\bholy family\b",2),
 ("saint-joseph","Saint Joseph",r"\bsaint joseph\b|\bst[.]? joseph\b",2),
 ("saint-mary-magdalene","Mary Magdalene",r"\bmagdalene\b",2),
 ("lum2","Marriage at Cana",r"\bcana\b|\bwedding at cana\b",2),
 ("lum4","Transfiguration",r"\btransfiguration\b",2),
 ("lum1","Baptism of Christ",r"\bbaptism\b",2),
 ("sacred-heart","Sacred Heart",r"\bsacred heart\b",2),
]
MAX_TOTAL=46
UA="Ad-Orientem/1.0 Sacred-art-source-research; original images, noncommercial traffic"
def get(url, max_bytes=35_000_000):
    assert url.startswith("https://")
    last=""
    for n in range(3):
        try:
            with urlopen(Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/jpeg,*/*"}),timeout=30) as response:
                data=response.read(max_bytes+1)
                if len(data)>max_bytes: raise ValueError("download too large")
                return data
        except (HTTPError,URLError,TimeoutError,ConnectionError) as exc:
            last=str(exc)
            if isinstance(exc,HTTPError) and exc.code not in (403,429,500,502,503,504): break
            time.sleep(2*(n+1))
    raise RuntimeError(last)
def jget(url): return json.loads(get(url,2_000_000))
def imageQA(b):
    with Image.open(io.BytesIO(b)) as x:
        x.load(); x=ImageOps.exif_transpose(x)
        w,h=x.size
        if max(w,h)<2500: raise ValueError("image under 2500px")
        p=x.convert("RGB");p.thumbnail((240,240))
        a=np.asarray(p,dtype=np.int16)
        fraction=float(np.mean((np.max(a,axis=2)-np.min(a,axis=2))>18))
        if fraction<.07: raise ValueError("image near monochrome")
        return w,h,round(fraction,4)
def draw_sheet(passed):
    passed=sorted(passed,key=lambda x:(x["pool"],x["id"]))
    for offset in range(0,len(passed),8):
        piece=passed[offset:offset+8]
        board=Image.new("RGB",(1600,2000),(236,233,227)); d=ImageDraw.Draw(board)
        for i,row in enumerate(piece):
            xx=i%4*400;yy=i//4*1000
            try:
                with Image.open(IMAGES/row["filename"]) as im:
                    pic=ImageOps.exif_transpose(im).convert("RGB")
                    pic.thumbnail((370,870),Image.Resampling.LANCZOS)
                    board.paste(pic,(xx+(400-pic.width)//2,yy+5+(870-pic.height)//2))
            except Exception as exc: row["contactError"]=str(exc)
            d.text((xx+8,yy+895),row["pool"]+"  "+row["id"],fill=(30,30,30))
            d.text((xx+8,yy+920),str(row.get("title",""))[:45],fill=(30,30,30))
            d.text((xx+8,yy+945),str(row.get("artist",""))[:45],fill=(65,65,65))
        board.save(OUT/("contact-%02d.jpg"%(1+offset//8)),quality=90,optimize=True)
def research():
    IMAGES.mkdir(parents=True,exist_ok=True)
    existing={x["id"] for x in json.loads(PREVIOUS.read_text(encoding="utf-8"))["artworks"]}
    chosen=set(existing); rows=[]; query_stats=[]
    for pool,term,pattern,max_pool in TASKS:
        if len([r for r in rows if r["result"]=="TECHNICAL_PASS"])>=MAX_TOTAL: break
        for museum in ("met","artic"):
            accepted_here=0
            query={"pool":pool,"query":term,"museum":museum,"status":"SEARCHED","found":0,"selected":0}
            try:
                if museum=="met":
                    url=MET_API+"v1.1/search?"+urllib.parse.urlencode({"q":term,"hasImages":"true","limit":40})
                    results=jget(url).get("objectIDs") or []
                else:
                    url=AIC_API+"search?"+urllib.parse.urlencode({"q":term,"limit":30,"fields":"id,title,artist_title,is_public_domain,image_id,artwork_type_title,date_display"})
                    results=jget(url).get("data") or []
                query["found"]=len(results)
                for hit in results[:40]:
                    if accepted_here>=max_pool or len([r for r in rows if r["result"]=="TECHNICAL_PASS"])>=MAX_TOTAL:break
                    try:
                        if museum=="met":
                            id=str(hit); key="met-"+id
                            if key in chosen: continue
                            metadata=jget(MET_API+"v1/objects/"+id)
                            title=metadata.get("title") or ""
                            artist=metadata.get("artistDisplayName") or ""
                            kind=metadata.get("classification")
                            rights=metadata.get("isPublicDomain")
                            imageurl=metadata.get("primaryImage") or ""
                            url="https://www.metmuseum.org/art/collection/search/"+id
                            artwork_date=metadata.get("objectDate")
                            if kind!="Paintings" or rights is not True: continue
                            if not re.fullmatch(r"https://images\.metmuseum\.org/CRDImages/[^/]+/original/[^?#]+[.]jpe?g",imageurl,re.I): continue
                            imageurl=urllib.parse.quote(imageurl,safe=":/-_.~%")
                        else:
                            hitid=str(hit["id"]);key="artic-"+hitid
                            if key in chosen:continue
                            metadata=jget(AIC_API+hitid+"?fields=id,title,artist_title,image_id,is_public_domain,artwork_type_title,date_display,main_reference_number")
                            obj=metadata.get("data") or {}
                            title=obj.get("title") or ""
                            artist=obj.get("artist_title") or ""
                            kind=obj.get("artwork_type_title") or ""
                            rights=obj.get("is_public_domain")
                            image_id=obj.get("image_id") or ""
                            url="https://www.artic.edu/artworks/"+hitid
                            artwork_date=obj.get("date_display")
                            if kind!="Painting" or rights is not True or not re.fullmatch(r"[a-z0-9-]{36}",image_id):continue
                            imageurl="https://www.artic.edu/iiif/2/"+image_id+"/full/3000,/0/default.jpg"
                        if not re.search(pattern,title,re.I):continue
                        record={"id":key,"museum":museum,"title":title,"artist":artist,
                                "date":artwork_date,"pool":pool,"sourceUrl":url,
                                "apiUrl":MET_API+"v1/objects/"+id if museum=="met" else AIC_API+hitid,
                                "originalUrl":imageurl,"medium":kind,"publicDomain":True,
                                "review":"NEEDS_ARTISTIC_AND_CROP_REVIEW","result":"REJECTED"}
                        try:
                            img=get(imageurl)
                            width,height,colour=imageQA(img)
                            filename=key+".jpg"
                            (IMAGES/filename).write_bytes(img)
                            record.update(width=width,height=height,colourFraction=colour,
                                          sha256=hashlib.sha256(img).hexdigest(),
                                          bytes=len(img),filename=filename,result="TECHNICAL_PASS")
                            chosen.add(key);accepted_here+=1;query["selected"]+=1
                            print("ACQUIRED",pool,key,title[:48],f"{width}x{height}",flush=True)
                        except Exception as exc:
                            record["rejectionReason"]=str(exc)
                        rows.append(record)
                        time.sleep(.7 if museum=="met" else 1.1)
                    except Exception as exc:
                        query.setdefault("errors",[]).append(str(exc)[:130])
            except Exception as exc:
                query["status"]="SEARCH_FAILED"; query["reason"]=str(exc)
            query_stats.append(query)
            print("SEARCH",pool,museum,"hits",query["found"],"approved-screen",query["selected"],flush=True)
    passed=[x for x in rows if x["result"]=="TECHNICAL_PASS"]
    draw_sheet(passed)
    report={"schema":"AO_SACRED_ART_RESEARCH_BATCH2_V1","publicationApproved":False,
            "notes":["Technical screening does NOT establish masterpiece status, actual crop quality, art attribution confidence, or release rights beyond the museum's stated API flags.","Never substitute a search query for actual fixed 1962 calendar identity.","Portraits for recent popes require separate underlying artist/reproduction rights and authenticity checks."],
            "searches":query_stats,"artworks":rows}
    (OUT/"research.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    cols=["id","museum","pool","title","artist","date","sourceUrl","originalUrl","width","height","result","rejectionReason","sha256"]
    with (OUT/"summary.csv").open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=cols,extrasaction="ignore");w.writeheader();w.writerows(rows)
    print("FINAL: %s new originals out of %s qualified candidates"%(len(passed),len(rows)),flush=True)
    if not passed:raise SystemExit("No works passed; see search errors.")
if __name__=="__main__":research()
