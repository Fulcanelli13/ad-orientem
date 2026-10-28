#!/usr/bin/env python3
"""Read-only acquisition and native-pixel perimeter sheets for three locked Prayer heroes.

Source originals remain on their pinned GitHub research branches and are NEVER edited.
Outputs are explicitly research-only, not licensed/approved production assets.
Python stdlib + Pillow, no cloud account, paid endpoint, secret, AI upscaling, or retouching.
"""
import hashlib, io, json, os, urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageCms

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/staged/prayer-wave1-native-perimeter-20261028"
OUT.mkdir(parents=True,exist_ok=True)
SOURCES=[
 {"module":"morning","title":"Jules Breton — The Song of the Lark",
  "branch":"research/module-hero-rescue-20261026",
  "path":"assets/staged/module-hero-rescue/morning.jpg",
  "sha256":"381db59fa47aee7603c4b9eb12f8dff8de4841eb0a4fd50c6d229e0fbd3cb63c",
  "dimensions":[2548,3300]},
 {"module":"confession","title":"Bartolomé Esteban Murillo — The Return of the Prodigal Son",
  "branch":"research/module-hero-museum-photos-20261026",
  "path":"assets/staged/module-hero-masters/confession.jpg",
  "sha256":"b1e3d47e65f4367fd11fc23d9a63fb25ff3d8c934c3147606f1a3eba703beaa7",
  "dimensions":[4096,3712]},
 {"module":"seven-sorrows","title":"Master of the Female Half-Lengths — Virgin of the Seven Sorrows",
  "branch":"research/module-hero-museum-photos-20261026",
  "path":"assets/staged/module-hero-masters/sorrows.jpg",
  "sha256":"c9c338596bc2a1f069535facfab1fe11cee1aaad7d67e5440c2114cfe9f09f2a",
  "dimensions":[2220,3000]}
]
def fetch(s):
    url="https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/"+s["branch"]+"/"+s["path"]
    req=urllib.request.Request(url,headers={"User-Agent":"AdOrientem-Review-20261028/1.0"})
    with urllib.request.urlopen(req,timeout=30) as f:
        b=f.read(13000001)
    if len(b)>13000000:raise ValueError("File too large")
    if hashlib.sha256(b).hexdigest()!=s["sha256"]:raise ValueError("SHA256 mismatch for "+s["module"])
    return b
def source_rgb(raw):
    image=Image.open(io.BytesIO(raw))
    image.load()
    image=ImageOps.exif_transpose(image)
    icc=image.info.get("icc_profile")
    note="no embedded ICC; source RGB numeric values retained for preview only"
    if icc:
      try:
        image=ImageCms.profileToProfile(image.convert("RGB"),ImageCms.ImageCmsProfile(io.BytesIO(icc)),
          ImageCms.createProfile("sRGB"),outputMode="RGB")
        note="ICC converted to sRGB for comparison preview only"
      except Exception as e:
        image=image.convert("RGB")
        note="ICC transform failed: "+str(e)[:200]
    else:image=image.convert("RGB")
    return image,note
def save_sheet(s,base):
    w,h=base.size
    # 512x512 source-native pixels at each of the FOUR external corners, no upscale.
    tile=min(512,w,h)
    positions={"top-left":(0,0),"top-right":(w-tile,0),
               "bottom-left":(0,h-tile),"bottom-right":(w-tile,h-tile)}
    margin=28; thumbw=620; tw=tile; gutter=18
    canvas=Image.new("RGB",(margin*3+thumbw+2*tw+gutter,
                            margin*3+max(900,2*tw+gutter)+125),(18,23,29))
    d=ImageDraw.Draw(canvas)
    d.text((margin,margin),s["module"].upper()+"  |  FULL COMPOSITION + FOUR TRUE NATIVE CORNERS",fill="white")
    d.text((margin,margin+26),"RESEARCH PREVIEW ONLY — NOT A RELEASED ASSET",fill="#e5c38a")
    whole=base.copy();whole.thumbnail((thumbw,900),Image.Resampling.LANCZOS)
    top=margin+66
    canvas.paste(whole,(margin+(thumbw-whole.width)//2,top+(900-whole.height)//2))
    box=[]
    for i,(label,(x,y)) in enumerate(positions.items()):
        px=margin*2+thumbw+(i%2)*(tw+gutter)
        py=top+(i//2)*(tw+gutter)
        canvas.paste(base.crop((x,y,x+tile,y+tile)),(px,py))
        d.text((px,py+tile+2),label+" (512 native px)",fill="#e5c38a")
        box.append({"name":label,"xyxy":[x,y,x+tile,y+tile]})
    target=OUT/(s["module"]+"-perimeter-grid.jpg")
    canvas.save(target,"JPEG",quality=89,optimize=True,subsampling=0)
    return target,box
def main():
  results=[]
  for s in SOURCES:
    raw=fetch(s)
    with Image.open(io.BytesIO(raw)) as original:
      original.load()
      native=[original.width,original.height]
    if native!=s["dimensions"]:raise AssertionError("Dimensions changed "+s["module"])
    converted,color_note=source_rgb(raw)
    target,boxes=save_sheet(s,converted)
    results.append({
      "module":s["module"],"title":s["title"],"ref":s["branch"],
      "source_repo_path":s["path"],"original_sha256_verified":s["sha256"],
      "native_dimensions_verified":native,"icc_preview_handling":color_note,
      "perimeter_preview_path":str(target.relative_to(ROOT)),
      "native_corner_coordinates":boxes,
      "perimeter_certified":False,"color_approved":False,"responsive_crop_approved":False,
      "human_quality_approved":False,"production_activated":False,
      "original_image_bytes_modified":False
    })
  (OUT/"inspection-evidence.json").write_text(json.dumps({
    "schema":"AO_PRAYER_WAVE1_THREE_NATIVE_PERIMETER_INSPECTION_V1",
    "date":"2026-10-28","scope":"three already approved source artworks",
    "no_edits_to_originals":True,"cost_eur":0,"production_approved":0,
    "note":"The stitched sheets are visual inspection evidence only. Full-sized pixels appear unscaled in four 512px corner tiles; whole painting is downsampled for context.",
    "records":results
  },indent=2,ensure_ascii=False)+"\n",encoding="utf8")
  print(json.dumps({"result":"PREPARED_RESEARCH_PREVIEWS_ONLY","modules":len(results),
   "sha_verified":len(results),"final_photo_approvals":0,"release_changes":0},indent=2))
if __name__=="__main__":main()
