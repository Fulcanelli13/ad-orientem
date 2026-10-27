#!/usr/bin/env python3
"""Read-only integrity check for permanently committed Sacred Art research files.

Run from the production code checkout with --archive-root pointing to a separate
checkout of an existing research branch. No downloads, writes or approvals.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

def rows(value):
    if isinstance(value, dict):
        if isinstance(value.get("sha256"), str) and (value.get("path") or value.get("file")):
            yield value
        for part in value.values():
            yield from rows(part)
    elif isinstance(value, list):
        for part in value:
            yield from rows(part)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--archive-root",required=True)
    parser.add_argument("--source-prefix",required=True)
    parser.add_argument("--report",action="append",required=True)
    parser.add_argument("--min-originals",type=int,required=True)
    parser.add_argument("--check-previews",action="store_true")
    args=parser.parse_args()
    assert args.min_originals>0
    root=Path(args.archive_root).resolve(strict=True)
    prefix=(root/args.source_prefix).resolve(strict=True)
    assert prefix.is_relative_to(root/"assets/staged"),"Only staged research images can be checked"
    files=sorted(p for p in prefix.rglob("*") if p.is_file() and p.suffix.lower() in {".jpg",".jpeg",".png",".webp"})
    assert len(files)>=args.min_originals,(args.source_prefix,len(files),args.min_originals)
    discovered=set(files)
    attestations=[]
    for rel in args.report:
        report=(root/rel).resolve(strict=True)
        assert report.is_relative_to(root/"data/research"),"Source report outside archive research"
        data=json.loads(report.read_text(encoding="utf-8"))
        assert not (isinstance(data,dict) and (data.get("app_published") is True or
                                                  data.get("editorial_change") is True))
        for item in rows(data):
            src=(root/(item.get("path") or item.get("file"))).resolve()
            if src not in discovered: continue
            digest=item["sha256"].lower()
            assert len(digest)==64 and all(c in "0123456789abcdef" for c in digest)
            source_bytes=src.read_bytes()
            assert hashlib.sha256(source_bytes).hexdigest()==digest,(src,"archive digest mismatch")
            declared_size=item.get("bytes",item.get("original_bytes"))
            if declared_size is not None:
                assert len(source_bytes)==int(declared_size),(src,"byte length mismatch")
            assert not (item.get("app_released") is True or item.get("visual_quality_passed") is True or
                        item.get("master_visual_pass") is True), "An unreviewed photograph was marked approved"
            attestations.append(src)
    assert len(set(attestations))>=args.min_originals,("Missing source checksum provenance",len(set(attestations)),args.min_originals)
    for src in files:
        assert src.stat().st_size>1000,("Empty or thumbnail-only source file",src)
        with Image.open(src) as img:
            assert img.format in {"JPEG","MPO","PNG","WEBP"},(src,img.format)
            assert min(img.size)>350,(src,img.size)
            img.verify()
    if args.check_previews:
        previews=root/"assets/staged/module-hero-preview-jpegs"
        assert (previews/"preview-manifest.json").is_file(),"Preview source manifest absent"
        json.loads((previews/"preview-manifest.json").read_text(encoding="utf-8"))
        assert list(previews.glob("*-whole-preview.jpg")), "No already archived unenhanced overview"
        assert list(previews.glob("*-centre-detail.jpg")), "No already archived native detail"
    print(json.dumps({"status":"PASS","archived_originals":len(files),
       "checksum_attested":len(set(attestations)),"reports":args.report,
       "scope":"research archive integrity only, not visual/rights/crop/publication approval"},
       ensure_ascii=False))
if __name__=="__main__":
    main()
