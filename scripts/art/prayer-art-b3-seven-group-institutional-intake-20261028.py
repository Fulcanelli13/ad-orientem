#!/usr/bin/env python3
"""B3 seven-source gate audit with one exact, rights-labelled institutional image intake.

The KMSKA 4000-wide JPEG is an institutional IIIF service derivative of an
original photograph, NOT a full native source file or pristine certificate.
All seven cases retain editorial, photography, and release holds.
"""
import hashlib, io, json, urllib.request, urllib.error
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/research/prayer-sacred-art-b3-seven-group-source-gates-20261028.v1.json"
OUT = ROOT / "assets/staged/prayer-art-b3-institutional-source-20261028"
OUT.mkdir(parents=True, exist_ok=True)
data = json.loads(MANIFEST.read_text())
assert data["schema"] == "AO_PRAYER_ART_B3_SEVEN_UNRESOLVED_SOURCE_GROUPS_V1"
assert len(data["cases"]) == 7
assert sum(bool(c["acquire"]) for c in data["cases"]) == 1
UA = "AdOrientem-sacred-art-research/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
LIMIT = 18_000_000

def read_url(url, limit=LIMIT, timeout=50):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json,image/jpeg,*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        b = r.read(limit+1)
        if len(b)>limit:
            raise ValueError("SOURCE_LARGER_THAN_RESEARCH_BYTE_LIMIT")
        return b

def checksum(b):
    return hashlib.sha256(b).hexdigest()

result = {"schema": "AO_PRAYER_B3_SEVEN_GROUP_INTAKE_RESULTS_V1",
          "date": "2026-10-28", "case_count": len(data["cases"]),
          "source_candidate_count": 1, "research_images_acquired": 0,
          "pristine_certifications": 0, "production_activations": 0,
          "cost_eur": 0, "cases": []}
for c in data["cases"]:
    rec = {"case_id": c["id"], "object": c["object"],
           "source": c["source"], "status": c["status"],
           "archived_image": False, "pristine_certified": False,
           "photo_rights_final_certified": False, "publication_allowed": False}
    if not c["acquire"]:
        rec["gate_evidence"] = c["evidence"]
        result["cases"].append(rec)
        continue
    try:
        m = json.loads(read_url(c["iiif_manifest"],limit=350_000).decode("utf-8"))
        assert m.get("@id")==c["iiif_manifest"], "MANIFEST_ID_MISMATCH"
        rec["manifest_license_seen"] = m.get("license")
        assert "publicdomain/mark/1.0" in m.get("license",""), "NO_PUBLIC_DOMAIN_MARK"
        meta = {}
        for item in m.get("metadata",[]):
            lab=item.get("label")
            if isinstance(lab,list):
                lab=" ".join(x.get("@value","") for x in lab)
            val=item.get("value")
            if isinstance(val,list):
                val=" ".join(x.get("@value","") for x in val)
            meta[str(lab)] = str(val)
        assert any("Peter Paul Rubens" in x for x in meta.values()), "ARTIST_IDENTITY_HOLD"
        assert any(x.strip()=="314" for x in meta.values()), "OBJECT_314_MISSING"
        canvas=m["sequences"][0]["canvases"][0]
        assert canvas["width"] >= 10000 and canvas["height"] >= 10000, "MASTER_CANVAS_SMALL"
        source_service=canvas["images"][0]["resource"]["service"]["@id"]
        assert source_service.startswith("https://iiif.kmska.be/c/iiif/2/public@28958.tif"), "UNEXPECTED_HOST_OR_OBJECT"
        width=int(c["acquire_width_px"])
        assert 3000<=width<=5000
        url=source_service+"/full/"+str(width)+",/0/default.jpg"
        raw=read_url(url)
        im=Image.open(io.BytesIO(raw))
        im.load()
        assert im.format=="JPEG", "UNEXPECTED_RASTER_FORMAT"
        assert width-4 <= im.width <= width+4 and im.height>=3000, "IIIF_DERIVATIVE_DIMENSION_HOLD"
        assert abs(im.width/im.height - canvas["width"]/canvas["height"]) < .025, "IIIF_ASPECT_MISMATCH"
        target=OUT/"rubens-trinity-kmska-314-official-iiif-4000.jpg"
        target.write_bytes(raw)
        rgb=ImageOps.exif_transpose(im).convert("RGB")
        panel=Image.new("RGB",(1160,370),(18,22,27))
        d=ImageDraw.Draw(panel)
        d.text((10,8),"KMSKA 314 - OFFICIAL 4000px IIIF DERIVATIVE, PHOTO AND EDITORIAL HOLD",fill=(235,225,210))
        whole=rgb.copy()
        whole.thumbnail((250,324),Image.Resampling.LANCZOS)
        panel.paste(whole,(12+(250-whole.width)//2,36+(324-whole.height)//2))
        side=180
        for i,(x,y) in enumerate([(0,0),(rgb.width-side,0),(0,rgb.height-side),(rgb.width-side,rgb.height-side)]):
            crop=rgb.crop((x,y,x+side,y+side))
            panel.paste(crop,(278+i*218,65))
            d.text((278+i*218,252),("TOP-LEFT","TOP-RIGHT","BOTTOM-LEFT","BOTTOM-RIGHT")[i],fill=(220,220,220))
        preview=OUT/"rubens-trinity-kmska-314-qa.jpg"
        panel.save(preview,"JPEG",quality=90)
        rec.update(status="RESEARCH_IIIF_DERIVATIVE_ARCHIVED_IDENTITY_AND_PRISTINE_HOLD",
                   archived_image=True, image_path=str(target.relative_to(ROOT)),
                   image_sha256=checksum(raw), image_dimensions=[im.width,im.height], image_bytes=len(raw),
                   institutional_manifest=c["iiif_manifest"], institutional_render_url=url,
                   original_canvas_dimensions=[canvas["width"],canvas["height"]],
                   image_derivative_not_native_master=True, photo_license_from_manifest=m.get("license"),
                   manifest_attribution=m.get("attribution"), photographer=meta.get("Photographer Fotograaf",""),
                   qa_preview=str(preview.relative_to(ROOT)),
                   qa_preview_sha256=checksum(preview.read_bytes()))
        result["research_images_acquired"]+=1
    except Exception as e:
        rec.update(status="RESEARCH_IIIF_FETCH_OR_VALIDATION_FAILED_HOLD",
                   failure_type=type(e).__name__, failure_detail=str(e)[:500])
    result["cases"].append(rec)
(OUT/"seven-group-intake-results.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"case_count":result["case_count"],
                  "research_images_acquired":result["research_images_acquired"],
                  "pristine_certifications":0,"production_activations":0},sort_keys=True))
