#!/usr/bin/env python3
"""Produce faithfully downsampled, review-only Morning/Sorrows photographs.
No cropping, framing, AI, recolouring, paid API or production file mutation.
Master SHA-256 must match the locked Wave 1 research register.
"""
from pathlib import Path
import hashlib, io, json, urllib.request
from PIL import Image, ImageCms, ImageOps

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/staged/prayer-wave1-morning-sorrows-proof-20261028"
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=[
 {"id":"morning","title":"Jules Breton — The Song of the Lark",
  "ref":"research/module-hero-rescue-20261026",
  "path":"assets/staged/module-hero-rescue/morning.jpg",
  "sha256":"381db59fa47aee7603c4b9eb12f8dff8de4841eb0a4fd50c6d229e0fbd3cb63c",
  "size":[2548,3300],"source_page":"https://www.artic.edu/artworks/94841/the-song-of-the-lark",
  "rights":"EXACT_REPRODUCTION_TERMS_PENDING_PRODUCTION_CHECK"},
 {"id":"seven-sorrows","title":"Master of the Female Half-Lengths (attributed) — Virgin of the Seven Sorrows",
  "ref":"research/module-hero-museum-photos-20261026",
  "path":"assets/staged/module-hero-masters/sorrows.jpg",
  "sha256":"c9c338596bc2a1f069535facfab1fe11cee1aaad7d67e5440c2114cfe9f09f2a",
  "size":[2220,3000],
  "source_page":"https://commons.wikimedia.org/wiki/File:Master_of_the_Half_Lengths_-_Virgin_of_the_Seven_Sorrows_-_Google_Art_Project.jpg",
  "rights":"SOURCE_FILE_AND_JURISDICTION_RECHECK_BEFORE_PRODUCTION"}
]
results=[]
for src in SOURCE:
  url="https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/"+src["ref"]+"/"+src["path"]
  req=urllib.request.Request(url,headers={"User-Agent":"AdOrientem-Free-Review-Masters/1.0"})
  with urllib.request.urlopen(req,timeout=35) as response:
    raw=response.read(13000001)
  assert 0<len(raw)<=13000000
  assert hashlib.sha256(raw).hexdigest()==src["sha256"],"Wrong original bytes: "+src["id"]
  with Image.open(io.BytesIO(raw)) as original:
    original.load()
    assert list(original.size)==src["size"],"Source dimensions changed "+src["id"]
    base=ImageOps.exif_transpose(original)
    icc=base.info.get("icc_profile")
    if icc:
      base=ImageCms.profileToProfile(base.convert("RGB"),
        ImageCms.ImageCmsProfile(io.BytesIO(icc)),ImageCms.createProfile("sRGB"),outputMode="RGB")
      transform="embedded_icc_to_sRGB"
    else:
      base=base.convert("RGB")
      transform="untagged_RGB_as_is_no_auto_colouring"
    exports=[]
    for target_width,quality in [(720,90),(1440,92)]:
      scaled=base.copy()
      scaled.thumbnail((target_width,6000),Image.Resampling.LANCZOS)
      assert scaled.width==target_width and scaled.height<=src["size"][1]
      fname=src["id"]+"-whole-"+str(target_width)+"-proof.webp"
      fp=OUT/fname
      scaled.save(fp,"WEBP",quality=quality,method=6)
      blob=fp.read_bytes()
      exports.append({"path":str(fp.relative_to(ROOT)),"sha256":hashlib.sha256(blob).hexdigest(),
       "bytes":len(blob),"pixels":list(scaled.size),"full_original_composition":True,
       "cropped":False,"retouched":False,"upscaled":False,"production":False})
    results.append({"module":src["id"],"editorial_primary":src["title"],
      "source":{"repository":"Fulcanelli13/ad-orientem","ref":src["ref"],"path":src["path"],
        "sha256":src["sha256"],"pixels":src["size"],"source_page":src["source_page"]},
      "color_transform":transform,"rights_status":src["rights"],"files":exports,
      "final_photographic_clearance":False,"app_published":False})
manifest={"schema":"AO_WAVE1_MORNING_SORROWS_REVIEW_ONLY_V1","created":"2026-10-28",
 "no_editorial_reselection":True,"no_publication":True,"cost_eur":0,
 "note":"Full image, natural aspect, sRGB only; proves file production, not licensing, artistic approval, or app compatibility.",
 "records":results}
(OUT/"photo-proof-manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"result":"RESEARCH_ONLY_TWO_SOURCE_SHA256_VERIFIED",
 "artworks":len(results),"proof_derivatives":sum(len(r["files"]) for r in results),
 "published":0},indent=2))
