#!/usr/bin/env python3
"""Generate immutable-hash-guarded 1:1 source-pixel QA crops; never auto-approve."""
import argparse, hashlib, io, json
from pathlib import Path
from PIL import Image, ImageCms, ImageOps

TARGETS = {
 'scripture': [('jerome-face',.715,.285),('writing-hand',.370,.485),('skull',.210,.370),('red-drapery',.795,.720)],
 'michael': [('michael-face',.530,.185),('breastplate',.475,.370),('satan-face',.805,.815),('wing-feathers',.800,.230)],
 'visit': [('christ-child-face',.700,.680),('mary-face',.550,.405),('lower-right-source-mark',.955,.940)],
 'mass': [('priest-and-host',.350,.370),('nearby-congregation',.535,.615)]
}

def source_to_srgb(img):
    im = ImageOps.exif_transpose(img)
    icc = im.info.get('icc_profile')
    if icc:
        try:
            return ImageCms.profileToProfile(
                im.convert('RGB'),ImageCms.ImageCmsProfile(io.BytesIO(icc)),
                ImageCms.createProfile('sRGB'),outputMode='RGB'), 'icc_to_srgb'
        except Exception as exc:
            return im.convert('RGB'),'embedded_icc_conversion_failed_'+type(exc).__name__
    return im.convert('RGB'),'no_icc_assumed_srgb_not_color_verified'

def crop_rect(w,h,cx,cy,size):
    if not all(0<=v<=1 for v in (cx,cy)):
        raise ValueError('Invalid normalized position')
    side=min(w,h,size)
    x=max(0,min(w-side,round(cx*w-side/2)))
    y=max(0,min(h-side,round(cy*h-side/2)))
    return (x,y,x+side,y+side)

def review(repo,output,targets,hashes,size):
    rows=[]
    for module,points in targets.items():
        src=repo/'assets/staged/module-hero-masters'/f'{module}.jpg'
        if not src.is_file():
            rows.append({'module':module,'status':'SOURCE_MISSING'})
            continue
        raw=src.read_bytes(); sha=hashlib.sha256(raw).hexdigest()
        if not hashes.get(module) or sha!=hashes[module]:
            raise ValueError(f'Original archive checksum mismatch: {module} {sha}')
        with Image.open(io.BytesIO(raw)) as img: img.verify()
        with Image.open(io.BytesIO(raw)) as img:
            converted,color=source_to_srgb(img)
            output.mkdir(parents=True,exist_ok=True)
            for title,cx,cy in points:
                rect=crop_rect(*converted.size,cx,cy,size)
                target=output/f'{module}-{title}-native.png'
                crop=converted.crop(rect)
                crop.save(target,'PNG',optimize=False)
                rows.append({'module_id':module,'subject':title,'source_sha256':sha,
                             'pixel_rect':list(rect),'output_size':list(crop.size),
                             'source_dimensions':list(converted.size),
                             'no_upscaling':True,'colour_handling':color,
                             'subject_label_human_confirmed':False,
                             'pristine_photography_approved':False,
                             'publication_approved':False})
    return rows

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--repo',type=Path,default=Path('.'))
    ap.add_argument('--output',type=Path,default=Path('assets/staged/module-hero-subject-details-v2'))
    ap.add_argument('--crop-size',type=int,default=540)
    args=ap.parse_args(); root=args.repo.resolve()
    output=args.output if args.output.is_absolute() else root/args.output
    register=json.loads((root/'data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json').read_text())
    hashes={e['module_id']:e.get('sha256') for e in register['entries']}
    rows=review(root,output,TARGETS,hashes,args.crop_size)
    output.mkdir(parents=True,exist_ok=True)
    (output/'review-manifest.json').write_text(json.dumps(rows,indent=2)+'\n')
    print(json.dumps({'native_pixel_crops':sum(x.get('no_upscaling',False) for x in rows),
                      'missing_sources':[x['module'] for x in rows if x.get('status')=='SOURCE_MISSING'],
                      'pristine_approvals':0}))

if __name__=='__main__': main()
