#!/usr/bin/env python3
"""Research-only photographic QA from archived Coello originals, no enhancement.

Outputs are review copies; the immutable source remains unchanged and unapproved.
"""
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'assets/staged/module-hero-coello-20261027'
EXPECTED_SHA256 = '2cf2cc0b4742849df4a80474d7ab4f1922d749d7c663596f2ad727acdb1b81b1'
FILENAME = 'coello-commons-bookscan-original.jpg'
FOCI = {
    'joseph-face': (.403,.255),
    'christ-child-face': (.525,.325),
    'joseph-garment': (.454,.50),
    'upper-right-arched-boundary': (.90,.075),
    'lower-carpentry-tools': (.825,.915),
    'angel-and-flowers': (.50,.090),
}
MAX_SOURCE_BYTES=12_000_000

def main():
    src=BASE/FILENAME
    raw=src.read_bytes()
    if not raw or len(raw)>MAX_SOURCE_BYTES or hashlib.sha256(raw).hexdigest()!=EXPECTED_SHA256:
        raise ValueError('Source original hash or size mismatch; no review outputs produced')
    with Image.open(io.BytesIO(raw)) as image:
        image.verify()
    with Image.open(io.BytesIO(raw)) as image:
        im=ImageOps.exif_transpose(image).convert('RGB')
    if im.size!=(2215,3926):
        raise ValueError(f'Unexpected source pixels: {im.size}')
    out=BASE/'review'
    out.mkdir(parents=True,exist_ok=True)
    overview=im.copy()
    overview.thumbnail((800,1100),Image.Resampling.LANCZOS)
    overview.save(out/'coello-source-overview.jpg',format='JPEG',quality=90)
    records=[]
    for label,(nx,ny) in FOCI.items():
        s=540
        cx=round(im.width*nx)
        cy=round(im.height*ny)
        left=min(max(cx-s//2,0),im.width-s)
        top=min(max(cy-s//2,0),im.height-s)
        rect=(left,top,left+s,top+s)
        crop=im.crop(rect)
        name='coello-'+label+'-native.png'
        crop.save(out/name,format='PNG')
        records.append({
           'region':label,'crop':name,'rect_source_px':list(rect),
           'source_sha256':EXPECTED_SHA256,'native_pixels_no_upscaling':True,
           'source_photo':'2016 book reproduction: image fidelity / halftone unverified',
           'region_label_human_confirmed':False,
           'visual_quality_approved':False,
        })
    report={'artwork':'Claudio Coello, St Joseph and Christ Child, Toledo 1981.44',
            'source':str(src.relative_to(ROOT)), 'source_dimensions':list(im.size),
            'source_sha256':EXPECTED_SHA256,'source_icc_profile_embedded':False,
            'color_assumption':'Unprofiled RGB; do not claim calibrated color fidelity',
            'overview':str((out/'coello-source-overview.jpg').relative_to(ROOT)),
            'native_crops':records,'pristine_quality_approved':False,
            'publication_approved':False,
            'source_unmodified':True}
    (out/'coello-native-pixel-review.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'file_count':len(records)+1,
                      'source_pixels':list(im.size),
                      'source_hash':EXPECTED_SHA256,
                      'status':'PHOTO_QUALITY_PENDING'}))

if __name__ == '__main__':
    main()
