#!/usr/bin/env python3
"""Acquires the *human-selected* Antwerp 403, never title-matched unrelated Van Dycks.
Research only. Keep Oct12 artwork choice, historic ratings and live app unchanged.
"""
import io,hashlib,importlib.util,json
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/"data/calendar/sacred-art-review-uploads/20261016-antwerp-selected-403-identity.v1.json"
OUT=ROOT/"artifacts/sacred-art-antwerp-403-exact-selected"
sp=importlib.util.spec_from_file_location("sacred_shared",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
lib=importlib.util.module_from_spec(sp);sp.loader.exec_module(lib)
Image.MAX_IMAGE_PIXELS=110_000_000
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    record=json.loads(DATA.read_text())
    file=record["photographicSource"]["commonsFile"]
    source=lib.commons_info(file)
    if not source["licenseSupported"]:raise ValueError("File-specific Commons license not eligible")
    # The source itself is >50MB; use a full-composition thumb, enough for a phone.
    url=source.get("display") or source["url"]
    raw,actual=lib.fetch(url,limit=45_000_000)
    with Image.open(io.BytesIO(raw)) as verify:verify.verify()
    with Image.open(io.BytesIO(raw)) as photo:
        picture=ImageOps.exif_transpose(photo).convert("RGB")
        w,h=picture.size
        natural=record["exactObject"]["dimensionsCm"][0]/record["exactObject"]["dimensionsCm"][1]
        error=abs((w/h)/natural-1)
        if error>.06:raise ValueError(f"Aspect ratio {w}/{h} differs from selected painting shape by {error:.3f}")
        phone=picture.copy()
        phone.thumbnail((390,500),Image.Resampling.LANCZOS)
        review=picture.copy()
        review.thumbnail((1600,1600),Image.Resampling.LANCZOS)
    sha=hashlib.sha256(raw).hexdigest()
    fname=f"anthony-vandyck-KMSKA403-{sha[:12]}"
    (OUT/(fname+".source")).write_bytes(raw)
    phone.save(OUT/(fname+"-phone.png"),"PNG")
    review.save(OUT/(fname+"-review.webp"),"WEBP",quality=88)
    output={"schema":"AO_SACRED_ART_SELECTED_ANTWERP_403_SOURCE_QA_V1",
        "selectedSubjectId":"DEV-09","selectedArtworkId":record["oct12Selected"]["artworkId"],
        "originalAccession":"KMSKA Antwerp 403","wrongAlternativesExcluded":record["forbiddenSubstitutions"],
        "sourceUrl":actual,"commonsPage":source["sourcePage"],"rights":"CC0 collection and Commons",
        "downloadedDimensions":[w,h],"phoneProofSize":list(phone.size),
        "ratioDeviation":round(error,5),"sourceSHA256":sha,
        "sourceFile":fname+".source","phoneProof":fname+"-phone.png","reviewPhoto":fname+"-review.webp",
        "status":"EXACT_HUMAN_SELECTED_ORIGINAL_PHOTO_ACQUIRED_ASPECT_OK_MANUAL_EDGE_CHECK_REQUIRED",
        "noNewSelectionMade":True,"historicalUserRatingsUnchanged":True,"appUnchanged":True}
    (OUT/"exact-antwerp-403-qa.json").write_text(json.dumps(output,indent=2)+"\n")
    print("EXACT_SELECTED_403",json.dumps(output),flush=True)
if __name__=="__main__":main()
