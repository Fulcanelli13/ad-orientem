#!/usr/bin/env python3
"""Art Institute of Chicago paintings for missing sacred-art subjects.
Museum public-domain objects only, official IIIF previews at 3000px.
Source research only: checksum success is NOT iconographic or publication approval.
Respects the museum's single-thread, one-request-per-second access guidance.
"""
import hashlib, io, json, re, time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-artic-bulk"
IMAGES=OUT/"originals"
BASE="https://api.artic.edu/api/v1/artworks/search?"
AGENT="AdOrientemArtResearch/1.0 public domain source archive"
MAX_NEW=70
MAX_SEARCHES=150
def normalize(s):
    return re.sub(r"\s+"," ",re.sub(r"[^a-z0-9]+"," ",str(s or "").lower())).strip()
def get(u,size):
    if not u.startswith("https://"):
        raise ValueError("HTTPS required")
    time.sleep(1.1)
    with urlopen(Request(u,headers={"User-Agent":AGENT,"Accept":"application/json,image/jpeg,*/*"}),timeout=45) as f:
        if int(f.headers.get("Content-Length") or 0)>size:
            raise ValueError("over source budget")
        data=f.read(size+1)
    if len(data)>size:
        raise ValueError("over byte budget")
    return data
def main():
    IMAGES.mkdir(parents=True,exist_ok=True)
    all_targets=json.loads((ROOT/"data/calendar/sacred-art-subject-targets.v2.json").read_text(encoding="utf-8"))["targets"]
    registry=json.loads((ROOT/"data/calendar/sacred-art-candidates.v1.json").read_text(encoding="utf-8"))["artworks"]
    known={a["id"] for a in registry}
    # Acquire broad subjects, not duplicating already-hashed first-pass inventory.
    def acquired_for(t):
        key=t["id"];short=key.split(".",1)[1]
        for a in registry:
            if not (a.get("acquisition") or {}).get("originalSha256"):continue
            tags=a.get("tags") or {}
            if key.startswith("scripture.") and short in (tags.get("scriptureIdentityKeys") or []):return True
            if key.startswith("person.") and short==tags.get("portraitSubjectId"):return True
            if key.startswith("calendar.") and short in (tags.get("iconography") or []):return True
        return False
    all_targets.sort(key=lambda t:(0 if not acquired_for(t) else 1,{"P0":0,"P1":1,"P2":2}.get(t.get("priority"),3),-int(t.get("observed2026GapDatesEstimated") or 0),t["id"]))
    results=[];searches=[];total_queries=0
    for t in all_targets:
        if len(results)>=MAX_NEW or total_queries>=MAX_SEARCHES:break
        for q in (t.get("queries") or [])[:2]:
            if len(results)>=MAX_NEW or total_queries>=MAX_SEARCHES:break
            total_queries+=1
            rec={"targetId":t["id"],"query":q,"inspected":0,"sourceMatches":0,"errors":[]}
            params={"q":q,"limit":30,"fields":"id,title,artist_title,is_public_domain,image_id,artwork_type_title,date_display,medium_display",
                    "query[term][is_public_domain]":"true"}
            try:
                data=json.loads(get(BASE+urlencode(params),4000000))
                hits=data.get("data") or []
                rec["inspected"]=len(hits)
                for obj in hits[:30]:
                    if len(results)>=MAX_NEW:break
                    ident="artic-"+str(obj.get("id",""))
                    if ident in known:continue
                    if obj.get("is_public_domain") is not True or obj.get("artwork_type_title")!="Painting":continue
                    title=normalize(obj.get("title"));needle=normalize(q)
                    if len(needle)<7 or not (title==needle or " "+needle+" " in " "+title+" "):continue
                    image_id=obj.get("image_id") or ""
                    if not re.fullmatch("[0-9a-f-]{36}",image_id):continue
                    rec["sourceMatches"]+=1
                    url="https://www.artic.edu/iiif/2/"+image_id+"/full/3000,/0/default.jpg"
                    try:
                        raw=get(url,30000000)
                        with Image.open(io.BytesIO(raw)) as im:
                            im.load()
                            if im.format!="JPEG":raise ValueError("Not JPEG")
                            picture=ImageOps.exif_transpose(im)
                            w,h=picture.size
                            if max(w,h)<2500:raise ValueError("Below 2500px")
                            preview=picture.convert("RGB");preview.thumbnail((100,100))
                            pix=list(preview.getdata())
                            frac=sum(max(p)-min(p)>18 for p in pix)/len(pix)
                            if frac<.07:raise ValueError("Nearly monochrome")
                        fname=ident+".jpg"
                        (IMAGES/fname).write_bytes(raw)
                        result={"id":ident,"targetId":t["id"],"title":obj.get("title"),
                                "artist":obj.get("artist_title"),"dated":obj.get("date_display"),
                                "medium":obj.get("medium_display"),"imageMuseum":"Art Institute of Chicago",
                                "sourceUrl":"https://www.artic.edu/artworks/"+str(obj["id"]),
                                "sourceApi":BASE+urlencode({"q":q}),
                                "originalUrl":url,"rights":"ARTIC_PUBLIC_DOMAIN_IMAGE",
                                "rightsEvidence":"ArtIC is_public_domain=true, artwork_type_title=Painting, official IIIF image",
                                "qaTier":"PREFERRED_SOURCE_ORIGINAL",
                                "sha256":hashlib.sha256(raw).hexdigest(),"filename":fname,
                                "width":w,"height":h,"bytes":len(raw),
                                "originalReviewed":False,"cropReviewed":False,"publicationApproved":False}
                        results.append(result);known.add(ident)
                        print("ACQUIRED",ident,t["id"],w,h,flush=True)
                    except Exception as e:
                        rec["errors"].append(ident+": "+str(e)[:110])
            except Exception as e:
                rec["errors"].append("search: "+str(e)[:140])
            searches.append(rec)
    output={"schema":"AO_SACRED_ART_ARTIC_BULK_RESEARCH_V1","source":"Art Institute of Chicago",
            "note":"Official public domain object + image metadata and source bytes; human scene, phone crop and publication checks pending",
            "count":len(results),"artworks":results,"searches":searches,"totalQueries":total_queries}
    (OUT/"research.json").write_text(json.dumps(output,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("ARTIC_HARVEST="+json.dumps({"originals":len(results),"searches":total_queries,"targets":len(all_targets)}),flush=True)
if __name__=="__main__":main()
