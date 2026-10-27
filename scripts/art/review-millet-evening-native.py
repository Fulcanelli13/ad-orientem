#!/usr/bin/env python3
"""Research-only, original-pixel QA atlas for Millet's Angelus candidate.

Preserves the unmodified Google Art Project source; no editing of painting,
no publication rights inference and no change to Evening Prayer's final selection.
"""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, io, json

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'assets/staged/module-hero-evening-candidate-20261027'
SOURCE=BASE/'millet-angelus-google-art-original.jpg'
MANIFEST=BASE/'millet-acquisition.json'
OUT=BASE/'review'
EXPECTED_SHA256='77de352e8d7d0c540274464f618a336eef05cf376858e7da94d0b69bf7bd1aa2'
FOCI=[
 ('man-face',.40,.24),
 ('woman-face',.72,.27),
 ('man-praying-hands',.41,.44),
 ('woman-praying-hands',.73,.41),
 ('distant-church-steeple',.90,.33),
 ('field-paint-texture',.15,.75),
 ('harvest-basket',.61,.83),
 ('sky-light-transition',.53,.12),
]

def main():
    meta=json.loads(MANIFEST.read_text())
    if meta['sha256']!=EXPECTED_SHA256 or meta['editorial_final_selected'] or meta['app_publication_approved']:
        raise ValueError('Candidate baseline changed')
    raw=SOURCE.read_bytes()
    if hashlib.sha256(raw).hexdigest()!=EXPECTED_SHA256 or len(raw)!=meta['bytes']:
        raise ValueError('Actual original bytes do not match archive checksum')
    with Image.open(io.BytesIO(raw)) as im:
        im.verify()
    with Image.open(io.BytesIO(raw)) as im:
        if im.format!='JPEG' or im.size!=(7053,5864):
            raise ValueError('Millet source pixels / encoding changed')
        icc=bool(im.info.get('icc_profile'))
        a=ImageOps.exif_transpose(im).convert('RGB')
    OUT.mkdir(parents=True,exist_ok=True)
    overview=a.copy()
    overview.thumbnail((1150,1150),Image.Resampling.LANCZOS)
    overview.save(OUT/'millet-overview.jpg',quality=91)
    rows=[]
    for name,cx,cy in FOCI:
        side=600
        x=max(0,min(a.width-side,round(cx*a.width-side/2)))
        y=max(0,min(a.height-side,round(cy*a.height-side/2)))
        filename=f'millet-{name}-native.png'
        a.crop((x,y,x+side,y+side)).save(OUT/filename,format='PNG')
        rows.append({'subject':name,'file':filename,'source_rect_px':[x,y,x+side,y+side],
                     'native_pixels_unscaled':True,'subject_verified_by_human':False,
                     'photo_quality_approved':False})
    report={'module':'Evening Prayer','candidate':'Jean-Francois Millet — The Angelus',
            'source_sha256':EXPECTED_SHA256,'source_dimensions':[7053,5864],
            'icc_embedded':icc,'overview':'millet-overview.jpg','crops':rows,
            'source_original_preserved':True,'editorial_selected':False,
            'pristine_quality_approved':False,'image_rights_cleared':False,
            'production_released':False}
    (OUT/'millet-native-photo-review.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'created_native_crops':len(rows),'overview':overview.size,
                      'source_hash_ok':True,'pristine_approved':False}))

if __name__=='__main__': main()
