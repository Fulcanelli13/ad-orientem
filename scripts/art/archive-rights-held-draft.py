#!/usr/bin/env python3
"""Save rights-conditioned originals into an UNPUBLISHED GitHub draft release.

No public release, no commercial licensing claims, no production deployment.
The draft is visible only to repository writers.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import zipfile

TAG="sacred-art-rights-held-draft-20261028"

def digest(b):
    return hashlib.sha256(b).hexdigest()

def gh(*args):
    return subprocess.run(["gh",*args],capture_output=True,text=True,check=True).stdout

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--manifest",type=Path,required=True)
    parser.add_argument("--cache",type=Path,required=True)
    parser.add_argument("--out",type=Path,required=True)
    args=parser.parse_args()
    rows=json.loads(args.manifest.read_text())["records"]
    if len(rows)!=10 or len(set(r["artifactId"] for r in rows))!=3:
        raise RuntimeError("Rights-hold subset must be exactly 10 sources in three artifacts")
    allowed={"PUBLIC_DOMAIN_PD_ART_PDM","PUBLIC_DOMAIN_KRESS_REUSE_HOLD"}
    if any(x["rightsClass"] not in allowed for x in rows):
        raise RuntimeError("Unexpected rights class")
    if not os.environ.get("GITHUB_TOKEN"):
        raise RuntimeError("GITHUB_TOKEN required")
    repo=os.environ.get("GITHUB_REPOSITORY","Fulcanelli13/ad-orientem")
    args.cache.mkdir(parents=True,exist_ok=True)
    args.out.mkdir(parents=True,exist_ok=True)
    groups={}
    for r in rows:
        groups.setdefault(r["artifactId"],[]).append(r)
    results=[]
    for artid, group in sorted(groups.items()):
        orig=args.cache/f"{artid}.zip"
        if not orig.exists():
            url=f"https://api.github.com/repos/{repo}/actions/artifacts/{artid}/zip"
            subprocess.run([
                "curl","--fail","--location","--silent","--show-error",
                "--header",f"Authorization: Bearer {os.environ['GITHUB_TOKEN']}",
                "--header","Accept: application/vnd.github+json",
                "--output",str(orig),url],check=True)
        if not zipfile.is_zipfile(orig):
            raise RuntimeError(f"ZIP download failed: {artid}")
        out=args.out/f"research-hold-{artid}.zip"
        proofs=[]
        with zipfile.ZipFile(orig) as source,zipfile.ZipFile(out,"w",compression=zipfile.ZIP_STORED,allowZip64=True) as archive:
            for record in group:
                old=record["archiveZipMember"]
                if old.startswith("/") or ".." in old.split("/"):
                    raise RuntimeError("Unsafe archive member")
                with source.open(old) as fh: data=fh.read()
                hashed=digest(data)
                if hashed!=record["sha256"]:
                    raise RuntimeError("SHA256 mismatch for "+record["artworkId"])
                new="held-research/"+record["artworkId"]+(Path(old).suffix or ".jpg")
                archive.writestr(new,data)
                proofs.append({"id":record["artworkId"],"sha256":hashed,"bytes":len(data),
                               "path":new,"source":record["sourceObjectUrl"],
                               "rights":record["rightsClass"]})
            archive.writestr("RIGHTS-HOLD.json",json.dumps({"unpublished":True,"rightsReviewRequired":True,
                "artifactId":artid,"records":proofs},indent=2))
        results.append({"asset":out.name,"bytes":out.stat().st_size,"sha256":digest(out.read_bytes()),
                        "sourceArtifact":artid,"images":len(group)})
        print("VERIFIED_PRIVATE_SOURCE",artid,len(group),flush=True)
    if sum(x["images"] for x in results)!=10:
        raise RuntimeError("Not all ten rights-held originals verified")
    index={"schema":"AO_UNPUBLISHED_SACRED_ART_SOURCE_BACKUP_V1","date":"2026-10-28",
           "rightsStatus":"NOT_LICENSED_FOR_PRODUCTION_OR_PUBLIC_RELEASE",
           "originalsSHA256Verified":10,"sources":results}
    (args.out/"private-draft-index.json").write_text(json.dumps(index,indent=2)+"\n")
    notes=args.out/"DRAFT-NOTES.md"
    notes.write_text("# UNPUBLISHED RIGHTS-REVIEW BACKUP — DO NOT PUBLISH\n\n"
        "Ten SHA-256-verified research originals. Five Commons PD-Art/PDM "
        "and five Kress Foundation reuse-held originals. No public distribution "
        "or commercial-licence approval. Retain solely as a temporary research "
        "preservation copy until source rights are resolved. No permission "
        "requests or fees have been incurred.\n")
    try:
        current=json.loads(gh("release","view",TAG,"--repo",repo,"--json","isDraft"))
        if not current.get("isDraft"):
            raise RuntimeError("Refuse upload: destination release is NOT DRAFT")
    except subprocess.CalledProcessError:
        gh("release","create",TAG,"--repo",repo,"--draft","--title",
           "UNPUBLISHED: Ad Orientem rights-held Sacred Art originals",
           "--notes-file",str(notes),"--target",os.getenv("GITHUB_SHA","HEAD"))
    assets=[str(args.out/x["asset"]) for x in results]+[str(args.out/"private-draft-index.json")]
    gh("release","upload",TAG,*assets,"--repo",repo,"--clobber")
    j=json.loads(gh("release","view",TAG,"--repo",repo,"--json","isDraft,assets"))
    if not j.get("isDraft"):
        raise RuntimeError("CRITICAL: Backup release is not draft")
    sizes={x["name"]:x["size"] for x in j["assets"]}
    if any(sizes.get(x["asset"])!=x["bytes"] for x in results):
        raise RuntimeError("Draft asset sizes differ from validated zip")
    if "private-draft-index.json" not in sizes:
        raise RuntimeError("Missing private proof manifest")
    print(json.dumps({"success":True,"draft":True,"backedUp":10,
                      "assets":len(assets),"rightsApproved":False}),flush=True)

if __name__=="__main__":
    main()
