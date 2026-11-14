#!/usr/bin/env python3
"""Inspect all 16 preserved museum images and produce research-only review sheets."""
import hashlib,json,math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT=Path(__file__).resolve().parent.parent
manifest=json.loads((ROOT/"assets/prayer/research/r5d-bulk-museum-originals/manifest.json").read_text())
legacy=json.loads((ROOT/"data/pray/artwork-r5d-museum-source-verification-20261104.v1.json").read_text())
queue=json.loads((ROOT/"data/pray/artwork-r5c-bulk-acquisition-73-source-groups-20261103.v1.json").read_text())
OUT=ROOT/"r5d-visual-review"
OUT.mkdir(exist_ok=True)
rows=[]
for record in legacy["records"]:
    item=record["imageSourceRetrieval"]
    rows.append(dict(id=record["sourcePage"].rstrip("/").split("/")[-1],name=record["title"],artist=record["catalogAttribution"],path=f"assets/prayer/research/r5d-museum-originals/{'cleveland-1916.786.jpg' if 'cleveland' in record['sourcePage'] else 'met-437542.jpg'}",slots=record["slots"],source=record["sourcePage"],sha256=item["sha256"],bytes=item["bytes"]))
for item in manifest["artworks"]:
    artist=item["curatorial_artist"]
    if isinstance(artist,list): artist="; ".join((a.get("qualifier","") or "")+" "+a.get("description","") for a in artist)
    museum=item["museum"]
    rows.append(dict(id=item["object_id"],name=item["curatorial_title"],artist=artist.strip(),path=f"assets/prayer/research/r5d-bulk-museum-originals/{museum}-{item['object_id']}.{ 'tif' if item['format']=='TIFF' else 'png' if item['format']=='PNG' else 'jpg'}",slots=item["approved_slots"],source=item["source_page"],sha256=item["sha256"],bytes=item["bytes"]))
assert len(rows)==16
assert len({r["id"] for r in rows})==16
assignments=[s for r in rows for s in r["slots"]]
assert len(assignments)==37 and len(set(assignments))==37
assert all("rosary-" not in s for s in assignments)
assert not manifest["publication_authorized"]
catalog={r["sourcePage"].replace("www.","").rstrip("/"):r for r in queue["groups"] if r["sourcePage"]}
font=ImageFont.load_default()
for row in rows:
    candidate=catalog.get(row["source"].replace("www.","").rstrip("/"))
    assert candidate is not None,(row["id"],"not in approval master")
    assert sorted(row["slots"])==sorted(x for x in candidate["slots"] if x not in candidate["rosaryDeferred"])
    data=(ROOT/row["path"]).read_bytes()
    assert len(data)==row["bytes"]
    assert hashlib.sha256(data).hexdigest()==row["sha256"],"Original image modified: "+row["id"]
    with Image.open(ROOT/row["path"]) as im:
        im.verify()
    with Image.open(ROOT/row["path"]) as im:
        assert min(im.size)>=1200
        row["dimensions"]=list(im.size)
        row["image_format"]=im.format
        thumbnail=im.convert("RGB")
        thumbnail.thumbnail((260,310))
        row["_thumb"]=thumbnail.copy()
        for width in (320,390):
            image=ImageOps.contain(thumbnail,(width,400))
            assert image.width<=width and image.height<=400
# Two sheets of 8, legible on a desktop and printable for the editor.
for batch in range(2):
    chunk=rows[batch*8:(batch+1)*8]
    w,h=1200,1000
    canvas=Image.new("RGB",(w,h),"#f7f5f0")
    pen=ImageDraw.Draw(canvas)
    pen.text((24,12),f"Ad Orientem Prayer R5D — research-only visual review {batch+1}/2",fill="#181818",font=font)
    for idx,row in enumerate(chunk):
        col=idx%4;line=idx//4
        x,y=20+col*300,55+line*470
        img=row.pop("_thumb")
        canvas.paste(img,(x+max(0,(270-img.width)//2),y))
        pen.text((x,y+322),f"{row['id']} | {len(row['slots'])} approved positions",fill="#151515",font=font)
        label=row["name"][:41]
        pen.text((x,y+340),label,fill="#151515",font=font)
        pen.text((x,y+358),f"{row['dimensions'][0]}x{row['dimensions'][1]}",fill="#555555",font=font)
        pen.text((x,y+381),"VISUAL / ATTRIBUTION / CROP: UNREVIEWED",fill="#8b261e",font=font)
    canvas.save(OUT/f"contact-sheet-{batch+1}.jpg",quality=88,optimize=True)
# No copyright/visual approvals can arise from a generated contact sheet.
for row in rows:
    row.pop("_thumb",None)
    row.update(visual_review_status="PENDING",attribution_reconciliation_status="PENDING",reader_browser_qa="PENDING",publication_authorized=False)
(OUT/"review-manifest.json").write_text(json.dumps({"schema":"AO_PRAYER_R5D_16_WORK_VISUAL_QA_V1","count":16,"eligible_slots":37,"publication_authorized":False,"review":rows},indent=2)+"\n")
print("Verified 16 original hashes, 37 unique approved slots; created 2 research-only contact sheets.")
