#!/usr/bin/env python3
"""B5B research-only curved Lotto altarpiece alpha-matte proof.

Only flood-connected near-white external corners are made transparent;
painting and all roundels are retained as the untouched RGB source pixels.
No crop, no resampling, no inpainting, no generative image conversion.
"""
import hashlib,io,json,urllib.request,urllib.parse
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageOps

ROOT=Path(__file__).resolve().parents[2]
REG=ROOT/"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json"
OUT=ROOT/"assets/staged/prayer-art-b5b-lotto-exterior-matte-20261028"
OUT.mkdir(parents=True,exist_ok=True)
r=json.loads(REG.read_text())
x=next(e for e in r["primary_artworks"] if e["module_id"]=="rosary")
s=x["original"].get("recovered_location") or x["original"]
ref=s.get("ref") or s.get("git_ref")
path=s["path"]
url="https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/"+urllib.parse.quote(ref,safe="/")+"/"+"/".join(urllib.parse.quote(a,safe="") for a in path.split("/"))
with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"AdOrientem-Lotto-Silhouette-Arch-Proof/1.0"}),timeout=70) as h:
    raw=h.read(25000000)
if hashlib.sha256(raw).hexdigest()!=x["original"]["sha256"]:
    raise ValueError("SOURCE_HASH_MISMATCH")
with Image.open(io.BytesIO(raw)) as src:
    src.load()
    assert list(src.size)==[1880,2886]
    img=ImageOps.exif_transpose(src).convert("RGB")
rgb=np.asarray(img)
assert rgb.shape==(2886,1880,3)
pixel_high=rgb.min(axis=2)
pixel_low=rgb.max(axis=2)-pixel_high
records=[]
panels=[]
for cutoff,spread in [(248,20),(238,32),(224,45)]:
    near=(pixel_high>=cutoff)&(pixel_low<=spread)
    # Only the contiguous neutral-white prefix/suffix of each row can be
    # removed. Stop at the first darker/coloured pixel on either side. This
    # avoids general background segmentation and cannot leap across pigment
    # to erase a bright patch inside the painting.
    alpha=np.full((img.height,img.width),255,dtype=np.uint8)
    for y in range(img.height):
        dark=np.where(~near[y])[0]
        if not len(dark):
            continue
        first,last=int(dark[0]),int(dark[-1])
        if first>4 and near[y,0]:
            alpha[y,:first-3]=0
        if last<img.width-5 and near[y,-1]:
            alpha[y,last+4:]=0
    # The selected arch crown, centre medallions and lower scene must remain.
    assert alpha[0,img.width//2]==255,"ARCH_CROWN_LOST"
    assert alpha[img.height//2,img.width//2]==255,"CENTRAL_SCENES_LOST"
    assert alpha[-1,img.width//2]==255,"BOTTOM_ALTARPIECE_LOST"
    assert alpha[:,img.width//2].min()==255,"CENTRAL_COLUMN_MASKED"
    a=Image.fromarray(alpha,"L")
    rgba=img.copy().convert("RGBA");rgba.putalpha(a)
    fraction=round(float((alpha==0).sum()/alpha.size),6)
    assert 0.0001<fraction<.30,f"EXTERIOR_WHITE_MASK_OUT_OF_RANGE fraction={fraction}"
    thumb=rgba.copy();thumb.thumbnail((380,520),Image.Resampling.LANCZOS)
    panels.append((cutoff,spread,thumb,fraction))
    record={"threshold_min_channel":cutoff,"max_channel_spread":spread,
        "external_near_white_connected_pixels_transparent":int((alpha==0).sum()),
        "transparent_pixel_fraction":fraction,
        "method":"ROW_EDGE_NEARWHITE_PREFIX_SUFFIX_ONLY","all_original_rgb_pixels_unchanged":True,
        "full_painting_rectangular_bounds":[0,0,img.width,img.height],
        "central_column_all_opaque":True,"15_ROUNDELS_VISUALLY_PENDING":True,
        "painted_silhouette_fidelity_final_accepted":False,
        "photo_rights_certified":False,"pristine_certified":False}
    if cutoff==238:
        target=OUT/"lotto-exterior-nearwhite-matte-research-only.png"
        rgba.save(target,"PNG",optimize=True)
        record["full_native_alpha_proof"]={"path":str(target.relative_to(ROOT)),
            "sha256":hashlib.sha256(target.read_bytes()).hexdigest(),
            "pixels":[img.width,img.height],"bytes":target.stat().st_size,
            "not_approved_for_app":True}
    records.append(record)
    a.close();rgba.close();matte.close()
W=1350;H=675
sheet=Image.new("RGB",(W,H),(23,26,30));d=ImageDraw.Draw(sheet)
d.text((20,12),"LOTTO ROSARY: FULL ARCH, ALL FIFTEEN ROUNDELS | EXTERIOR WHITE-CORNER MATTE PROOFS",fill=(232,221,190))
for idx,(th,spread,t,fraction) in enumerate(panels):
    col=idx*445
    d.text((col+14,40),f"NEARWHITE >= {th}; RGB spread <= {spread}; removed {fraction:.2%}",fill=(228,219,194))
    # Gray background and a magenta checkered grid help expose white fringe.
    bg=Image.new("RGB",(390,535),(90,90,94));p=ImageDraw.Draw(bg)
    for gy in range(0,535,24):
        for gx in range(0,390,24):
            if (gx//24+gy//24)%2==0:p.rectangle((gx,gy,gx+23,gy+23),fill=(145,136,142))
    bg.paste(t,((390-t.width)//2,5),t)
    sheet.paste(bg,(col+14,72))
    d.text((col+14,615),"NOT RELEASED - exact original SHA retained",fill=(220,200,184))
    bg.close();t.close()
preview=OUT/"lotto-white-exterior-matte-three-thresholds.jpg"
sheet.save(preview,"JPEG",quality=91)
report={"schema":"AO_PRAYER_B5B_LOTTO_WHOLE_ARCH_ALPHA_MATTE_V1",
    "date":"2026-10-28","painting":"Lorenzo Lotto, Madonna del Rosario",
    "source_sha256":x["original"]["sha256"],"source_ref":ref,"source_path":path,
    "unchanged_full_native_dimensions":[img.width,img.height],
    "original_bytes_never_modified":True,
    "all_fifteen_roundels_required":True,
    "external_near_white_only_not_general_background_removal":True,
    "research_variants":records,
    "overview_proof_path":str(preview.relative_to(ROOT)),
    "overview_sha256":hashlib.sha256(preview.read_bytes()).hexdigest(),
    "rights_cleared":False,"painted_edges_accepted":False,
    "pristine_final_certified":False,"production_activated":False,"cost_eur":0}
(OUT/"matte-proofs.json").write_text(json.dumps(report,indent=2)+"\n")
print(json.dumps({"source_dimensions":report["unchanged_full_native_dimensions"],
                   "transparent_fractions":[v["transparent_pixel_fraction"] for v in records],
                   "alpha_proofs_archived":1,"publication":0}))
