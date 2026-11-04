#!/usr/bin/env python3
"""Native-pixel San Polo QA, for an ephemeral GitHub Actions review artifact ONLY.

Verifies all 14 original checked-in WebP bytes, records image/luma/border
diagnostics, and generates native-resolution edge panels for editorial review.
The original files remain in Git. This script never edits release flags or art.
"""
import hashlib
import json
import os
import shutil
from pathlib import Path
from PIL import Image, ImageOps, ImageStat, ImageDraw, ImageFont, ImageFilter

BASE=Path("data/prayer/stations/san-polo-tiepolo-oils-1747")
OUT=Path(os.environ.get("RUNNER_TEMP","/tmp"))/"san-polo-native-phone-review"
ROMAN=["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV"]
Image.MAX_IMAGE_PIXELS=50_000_000

def stats(im):
    return {"mean":[round(x,1) for x in ImageStat.Stat(im).mean],
            "stddev":[round(x,1) for x in ImageStat.Stat(im).stddev]}

def main():
    source=json.loads((BASE/"cc-by-sa-complete-series-release-candidate.v1.json").read_text())
    assert source["licensing"]["scopedExceptionAuthorized"] is True
    assert source["mobileQA"]=="UNVERIFIED"
    assert source["runtimeImageCount"]==0
    assert len(source["entries"])==14
    out_orig=OUT/"original-webps"
    out_orig.mkdir(parents=True,exist_ok=True)
    sheet=Image.new("RGB",(1400,7*500),(39,39,44))
    drawer=ImageDraw.Draw(sheet)
    results=[]
    for n,row in enumerate(source["entries"],1):
        assert row["station"]==n and row["productionEnabled"] is False
        fn=Path(row["localPublicAsset"].lstrip("/"))
        raw=fn.read_bytes()
        assert hashlib.sha256(raw).hexdigest()==row["sha256"],f"Hash mismatch station {n}"
        assert raw==Path(row["repositoryOriginal"]).read_bytes(),f"Source asset mismatch station {n}"
        with Image.open(fn) as image:
            assert image.format=="WEBP"
            image.verify()
        with Image.open(fn) as image:
            rgb=ImageOps.exif_transpose(image).convert("RGB")
            assert list(rgb.size)==row["nativePixelDimensions"],f"Dimension mismatch station {n}"
            w,h=rgb.size
            grey=ImageOps.grayscale(rgb)
            # Assess true native edge strips, not only the already reviewed 700px thumbnail.
            edge=max(12,min(w,h)//50)
            edge_stats={}
            for side,box in {
               "left":(0,0,edge,h),"right":(w-edge,0,w,h),
               "top":(0,0,w,edge),"bottom":(0,h-edge,w,h)
            }.items():
                section=grey.crop(box)
                st=ImageStat.Stat(section)
                edge_stats[side]={"mean":round(st.mean[0],1),"std":round(st.stddev[0],1)}
            flags=[side for side,v in edge_stats.items() if v["mean"]<23 and v["std"]<14]
            native={"station":n,"roman":ROMAN[n-1],"subject":row["subject"],
                "sha256":row["sha256"],"dimensions":[w,h],"bytes":len(raw),
                "native_luma":stats(grey),
                "native_edge_strips":edge_stats,
                "potential_uniform_black_border":flags,
                "photo_license":"CC BY-SA 4.0",
                "photographer":row["photographer"],
                "exact_source":row["sourceFilePage"],
                "prior_approvals_preserved":row["previouslyApprovedArtworkPreserved"],
                "native_artistic_approval":"PENDING_EDITORIAL_REVIEW",
                "phone_artistic_approval":"PENDING_EDITORIAL_REVIEW",
                "publication_enabled":False}
            results.append(native)
            # Native 1:1 pixel crop panels, never resample the source before selecting crops.
            crop_size=440
            coords=[
               (0,0,crop_size,crop_size),
               (w-crop_size,0,w,crop_size),
               (0,h-crop_size,crop_size,h),
               (w-crop_size,h-crop_size,w,h),
               ((w-crop_size)//2,(h-crop_size)//2,(w+crop_size)//2,(h+crop_size)//2)
            ]
            row_index=n-1
            y0=row_index*250
            # A 5-panel QA row at 1:2 preview; source crops saved at native pixels.
            if n==1:
                (OUT/"native-details").mkdir(exist_ok=True)
            for i,(a,b,c,d) in enumerate(coords):
                cut=rgb.crop((a,b,c,d))
                cut.save(OUT/"native-details"/f"station-{n:02d}-part-{i+1}.png")
                tile=cut.resize((238,238),Image.Resampling.LANCZOS)
                sheet.paste(tile,(24+i*275,y0+9))
            # Complete unmodified WebPs are included only in time-limited workflow artifact.
            shutil.copyfile(fn,out_orig/f"station-{n:02d}.webp")
    # Label guide in separate JSON, keep 1:1 details intact.
    sheet.save(OUT/"all-14-native-edge-review.jpg",quality=91,subsampling=0)
    evidence={"schema":"AO_SAN_POLO_NATIVE_PIXEL_REVIEW_V1",
       "source_branch_intent":"REVIEW_ONLY_NOT_ARTWORK_PUBLICATION",
       "source_archived":14,
       "original_byte_verification":14,
       "phone_capture": "See companion Playwright artifact and report",
       "production_activated":0,
       "records":results}
    (OUT/"native-pixel-evidence.json").write_text(json.dumps(evidence,indent=2)+"\n")
    print("NATIVE_PIXEL_VERIFIED_14_OF_14")
    print("UNIFORM_BORDER_FLAGS "+json.dumps({r["station"]:r["potential_uniform_black_border"] for r in results if r["potential_uniform_black_border"]}))
    print("ARTWORK_PRODUCTION_ENABLED_0_OF_14")

if __name__=="__main__":
    main()
