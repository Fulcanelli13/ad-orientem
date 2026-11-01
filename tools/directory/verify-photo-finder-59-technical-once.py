#!/usr/bin/env python3
"""One source pass over 59 frozen rank-one technical holds; research only."""
import collections,csv,datetime,hashlib,importlib.util,json,os,pathlib,shutil,tempfile,time,urllib.parse
ROOT=pathlib.Path(__file__).resolve().parents[2]
D=ROOT/"data/geography/research/photo-finder-20261030"
LEDGER=D/"releases/sacred-atlas-530-cover-closure-106-v1.json"
REPORT=D/"releases/technical-59-one-pass-source-results-20261101.v1.json"
ASSETS=D/"recovered-technical-59"
spec=importlib.util.spec_from_file_location("ao_photo",ROOT/"tools/directory/release-photo-finder-decisions.py")
release=importlib.util.module_from_spec(spec);spec.loader.exec_module(release)
stage=release.stage
CATS=("no_persisted_exception","source_metadata_mismatch","source_size_format")
def selected():
 ledger=release.load_json(LEDGER)
 assert (ledger["schema"]=="AO_SACRED_ATLAS_530_PLACE_COVER_CLOSEOUT_V1" and
  ledger["approved_cover_count"]==307 and ledger["chosen_pending"]==106)
 remaining=[x for x in ledger["items"] if x["disposition"] in CATS]
 assert len(remaining)==59 and len({x["place_id"] for x in remaining})==59
 assert collections.Counter(x["disposition"] for x in remaining)=={
  "no_persisted_exception":9,"source_metadata_mismatch":24,"source_size_format":26}
 with release.CREDITS.open(encoding="utf-8-sig",newline="") as f:credits=list(csv.DictReader(f))
 covers=release.load_json(release.COVERS);gallery=release.load_json(release.GALLERY)
 first,secondary=release.frozen_original_schedule(covers,gallery)
 plan=release.source_status(credits,release.load_json(release.DECISIONS),
  release.load_json(release.PLACES),first,secondary)
 byid={x["place_id"]:x for x in plan["tasks"] if x["role"]=="cover" and x["rank"]==1}
 published={x["place_id"] for x in covers["items"]}
 selected=[]
 for x in remaining:
  pid=x["place_id"]
  assert pid not in published
  task=byid.get(pid)
  if task:
   assert task["title"]==x["selected_file"]
   assert task["sha1"]==x["source_sha1_claim"]
   assert task["license"]==release.POLICY[x["claimed_licence"]]
  selected.append((x,task))
 return selected
def main():
 tasks=selected()
 if os.getenv("AO_59_DRY_RUN")=="1":
  print("PASS 59 frozen technical original choices; no network");return
 assert not REPORT.exists() and not ASSETS.exists(),"Prior one-shot source report exists"
 last=[0.0]
 def request(url,limit):
  gap=12-(time.monotonic()-last[0])
  if last[0] and gap>0:time.sleep(gap)
  last[0]=time.monotonic()
  return stage.fetch(url,limit)
 states={x["place_id"]:{"place_id":x["place_id"],"frozen_disposition":x["disposition"],
  "file":x["selected_file"],"sha1_claim":x["source_sha1_claim"],"status":"PENDING"}
  for x,_ in tasks}
 usable=[(x,t) for x,t in tasks if t]
 for x,t in tasks:
  if not t:states[x["place_id"]].update(status="EXISTING_EXACT_IDENTITY_HOLD",
    reason="Frozen source plan excludes this first choice")
 cached={}
 for off in range(0,len(usable),12):
  rows=usable[off:off+12]
  url=stage.COMMONS+"?"+urllib.parse.urlencode({"action":"query","format":"json",
   "formatversion":"2","titles":"|".join(t["title"] for _,t in rows),
   "prop":"imageinfo","iiprop":"url|size|sha1|mime|extmetadata"})
  try:
   data=json.loads(request(url,3_000_000))
   pages={p.get("title"):p for p in data.get("query",{}).get("pages",[])}
   if not pages:raise ValueError("Missing Commons pages")
  except Exception as exc:
   for x,_ in rows:states[x["place_id"]].update(status="BATCH_METADATA_UNAVAILABLE",
      reason=type(exc).__name__+": "+str(exc)[:180])
   continue
  for x,t in rows:
   s=states[x["place_id"]]
   try:
    page=pages.get(t["title"])
    if not page or not page.get("imageinfo") or page.get("missing"):
     raise ValueError("Exact Commons title missing or redirected")
    info=page["imageinfo"][0]
    w,h=int(info.get("width") or 0),int(info.get("height") or 0)
    size=int(info.get("size") or 0)
    sha=info.get("sha1");mime=info.get("mime")
    s.update(live_sha1=sha,live_original_bytes=size,live_dimensions=[w,h],live_mime=mime)
    if sha!=t["sha1"]:raise ValueError("Live source SHA1 differs")
    if mime not in {"image/jpeg","image/png","image/webp"}:
     raise ValueError("Unsupported original MIME")
    if min(w,h)<650:raise ValueError("Original below 650 pixels")
    if w*h>stage.MAX_IMAGE_PIXELS:raise ValueError("Original over 32MP safety bound")
    if not 1000<=size<=stage.MAX_ORIGINAL_BYTES:raise ValueError("Original over 16MB or invalid size")
    license,author=stage.license_from_metadata(info)
    if license!=t["license"]:raise ValueError("Exact live licence differs")
    stage.checked_https(info.get("url"),{"upload.wikimedia.org"})
    cached[x["place_id"]]=(info,license,author)
    s.update(status="READY_FOR_FULL_ORIGINAL",live_license=license,live_credit=author)
   except Exception as exc:s.update(status="METADATA_SAFETY_OR_PROVENANCE_HOLD",
     reason=type(exc).__name__+": "+str(exc)[:180])
 verified=[]
 with tempfile.TemporaryDirectory(prefix="ao-tech59-") as tmp:
  work=[t for _,t in usable if t["place_id"] in cached]
  for off in range(0,len(work),10):
   batch=work[off:off+10]
   result=release.verify_and_stage(batch,pathlib.Path(tmp)/("verified-"+str(off)),
     apply=False,metadata_loader=lambda q:cached[q["venue_id"]],downloader=request)
   assert result["attempted"]==len(batch) and result["new_files_in_app_tree"]==0
   assert len(result["media_records"])+len(result["exceptions"])==len(batch)
   for e in result["exceptions"]:
    states[e["place_id"]].update(status="ORIGINAL_BYTE_OR_DECODER_HOLD",reason=e["reason"])
   for rec in result["media_records"]:
    item=rec["item"];src=pathlib.Path(rec.pop("local"))
    if not ASSETS.exists():ASSETS.mkdir()
    dst=ASSETS/src.name
    assert not dst.exists() and dst.name==pathlib.Path(item["asset_path"]).name
    shutil.copyfile(src,dst)
    assert hashlib.sha256(dst.read_bytes()).hexdigest()==item["derivative_sha256"]
    rec["research_blob_path"]=dst.relative_to(ROOT).as_posix()
    rec["publication_status"]="RESEARCH_ONLY_NOT_APPROVED_FOR_MAIN"
    states[item["place_id"]].update(status="VERIFIED_RESEARCH_ONLY",
      asset=rec["research_blob_path"],derivative_sha256=item["derivative_sha256"])
    verified.append(rec)
 outcomes=list(states.values())
 assert len(outcomes)==59 and all(x["status"]!="PENDING" for x in outcomes)
 counts=dict(collections.Counter(x["status"] for x in outcomes))
 assert counts.get("VERIFIED_RESEARCH_ONLY",0)==len(verified)
 payload={"schema":"AO_PHOTO_FINDER_TECHNICAL_59_ONE_PASS_V1",
  "date":datetime.datetime.now(datetime.timezone.utc).isoformat(),
  "source_ledger":LEDGER.relative_to(ROOT).as_posix(),
  "exact_first_choice_attempted":59,"metadata_batches":(len(usable)+11)//12,
  "verified_research_only":len(verified),"held":59-len(verified),
  "outcome_counts":counts,"outcomes":outcomes,"staged":verified,
  "editorial_choices_changed":False,"approved_assets_changed":False,
  "gallery_changed":False,"size_or_rights_safety_bypassed":False,
  "new_photos_published":0}
 REPORT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("FINISHED_59",json.dumps({"verified":len(verified),"held":59-len(verified),
  "outcomes":counts}))
if __name__=="__main__":main()
