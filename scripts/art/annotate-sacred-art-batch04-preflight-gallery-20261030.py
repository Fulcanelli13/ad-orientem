#!/usr/bin/env python3
"""Surface native-original preflight alerts in Batch 04 without losing one-click UX.

An unresolved exact-file mismatch must be held, even if old browser localStorage
contains a visual selection. Existing source-bound exports and prior decisions
remain preserved. No original files or production state are changed.
"""
from __future__ import annotations
from pathlib import Path
import json,re
ROOT=Path("data/calendar/sacred-art-master-v2")
P=Path("docs/SACRED_ART_FAST_GRID_REVIEW_BATCH04_20261030.html")
REPORT=ROOT/"native-photo-preflight-batch04-20261030.v1.json"
SUMMARY=ROOT/"native-photo-preflight-batch04-gallery-ui-20261030.v1.json"
report=json.loads(REPORT.read_text(encoding="utf-8"))
rows=report["records"]
lookup={r["physicalWorkGroup"]:r for r in rows}
assert len(rows)==len(lookup)==104
html=P.read_text(encoding="utf-8")
m=re.search(r"const data=(\[[\s\S]*?\]);\s*const KEY=",html)
assert m,"GALLERY_DATA_NOT_FOUND"
cards=json.loads(m.group(1))
assert len(cards)==104 and {c["id"] for c in cards}==set(lookup)
assert all(c["available"] and (c["preview"] or "").startswith("data:image/") for c in cards)
assert "reviewed_exact_image_url" in html,"SOURCE_BOUND_EXPORT_REQUIRED"
for card in cards:
    r=lookup[card["id"]]
    assert card["sourceOriginalSha256"]==r["expectedSha256"],("MISMATCH_ORIGINAL_FILE_ID",card["id"])
    flags=r.get("advisoryFlags",[])
    hold=r["status"].startswith("HOLD_")
    parts=[]
    if hold:
        parts=["SOURCE HOLD: pinned original SHA mismatch; no selection"]
    else:
        if any("EXTERIOR_MARGIN" in f or "FRAME_OR_MATTE" in f for f in flags):
            parts.append("Inspect possible margin / frame")
        if any("PIXEL_DENSITY" in f or "RESPONSIVE_CROP" in f for f in flags):
            parts.append("Check resolution / crop")
        if any("ICC" in f for f in flags):
            parts.append("Compare museum colour")
        if any("EDGE_CONTRAST" in f for f in flags):
            parts.append("Inspect painted detail")
    card["nativeQAStatus"]=r["status"]
    card["nativeQaFlags"]=flags
    card["nativeSourceHold"]=hold
    card["nativeQaNote"]=" · ".join(parts)
    card["nativeQaSourceSha256"]=r["expectedSha256"]
payload=json.dumps(cards,ensure_ascii=False,separators=(",",":")).replace("<",r"\u003c").replace(">",r"\u003e")
html=html[:m.start(1)]+payload+html[m.end(1):]
if "native-qa-status-v1" not in html:
    # Stably augment the source-bound review, without changing its local key.
    old="function mark(id){const x=data.find(d=>d.id===id);if(!x||!x.available)return;"
    new="function mark(id){const x=data.find(d=>d.id===id);if(!x||!x.available||x.nativeSourceHold)return;"
    assert old in html,"EXPECTED_MARK_FUNCTION_NOT_FOUND"
    html=html.replace(old,new,1)
    replacements={
      "approved[x.id]&&x.available":"approved[x.id]&&x.available&&!x.nativeSourceHold",
      "const yes=approved[x.id]&&x.available;":"const yes=approved[x.id]&&x.available&&!x.nativeSourceHold;",
      "(!x.available?\"disabled\":\"\")":"(!x.available||x.nativeSourceHold?\"disabled\":\"\")",
      "'<small>'+safe(x.module||\"Sacred Art\")+'</small>'":
          "'<small>'+safe(x.module||\"Sacred Art\")+'</small>'+(x.nativeQaNote?'<small class=\"native-qa\">'+safe(x.nativeQaNote)+'</small>':'')",
      "'<span class=\"status\">'+(yes?\"Approved for final publication gate\":\"Queue 2 — retain for research\")+'</span>'":
          "'<span class=\"status\">'+(x.nativeSourceHold?\"Queue 2 — native source changed; held\":yes?\"Approved for final publication gate\":\"Queue 2 — retain for research\")+'</span>'",
      "(filter===\"MISSING\"&&!x.available)))":
          "(filter===\"MISSING\"&&!x.available)||(filter===\"NATIVE_FLAG\"&&x.nativeQaFlags?.length>0)||(filter===\"SOURCE_HOLD\"&&x.nativeSourceHold)))",
      "<option value=\"MISSING\">Missing image</option>":
          "<option value=\"MISSING\">Missing image</option><option value=\"NATIVE_FLAG\">Native QA · inspect flags</option><option value=\"SOURCE_HOLD\">Original file · hold</option>"
    }
    for old,new in replacements.items():
        assert old in html,("MISSING_HTML_REWRITE_ANCHOR",old)
        html=html.replace(old,new,1)
    # The first status replacement only sees one occurrence. Download filter
    # and accepted-count are separate occurrences and are also hold-aware.
    assert 'data.filter(x=>approved[x.id]&&x.available&&!x.nativeSourceHold)' in html
    assert 'const yes=approved[x.id]&&x.available&&!x.nativeSourceHold;' in html
    assert 'if(!x||!x.available||x.nativeSourceHold)return;' in html
    assert '<option value="SOURCE_HOLD">' in html
    html=html.replace("</style>","<style data-name=\"native-qa-status-v1\">.native-qa{font-size:12px;color:#dfc58a;line-height:1.35}</style></style>",1)
    # Invalid nested style element would be parsed literally; fold into CSS.
    html=html.replace('<style data-name="native-qa-status-v1">.native-qa{font-size:12px;color:#dfc58a;line-height:1.35}</style></style>',
                      '.native-qa{font-size:12px;color:#dfc58a;line-height:1.35}/* native-qa-status-v1 */</style>')
else:
    assert "native-qa-status-v1" in html
check=re.search(r"const data=(\[[\s\S]*?\]);\s*const KEY=",html)
after=json.loads(check.group(1))
assert len(after)==104 and sum(c["nativeSourceHold"] for c in after)==report["heldSourceVersions"]
assert sum(bool(c["nativeQaFlags"]) for c in after)==report["casesWithAdvisoryFlags"]
assert all(c["preview"]==next(x for x in cards if x["id"]==c["id"])["preview"] for c in after)
assert html.count('data:image/jpeg;base64,')>=104
assert 'approved[x.id]&&x.available&&!x.nativeSourceHold' in html
assert 'if(!x||!x.available||x.nativeSourceHold)return;' in html
P.write_text(html,encoding="utf-8")
meta={
  "schema":"AO_SACRED_ART_B04_NATIVE_QA_REVIEW_UI_V1",
  "gallery":str(P),"sourcePreflight":str(REPORT),"stableCards":104,
  "embeddedPreviewsPreserved":104,"holdsBlocked":report["heldSourceVersions"],
  "flaggedCards":report["casesWithAdvisoryFlags"],"priorDecisionsAltered":0,
  "sourcePhotoFingerprintsAltered":0,"rightsCertifications":0,
  "automatedPristineApprovals":0,"queue1Promotions":0,
  "productionMutations":0,"costEur":0,
  "notes":"Browser-local earlier selections on held photos are preserved locally but are excluded from status, export and new selection until resolved."}
SUMMARY.write_text(json.dumps(meta,indent=2)+"\n")
print("NATIVE_QA_UI",json.dumps({"images":104,"holds":meta["holdsBlocked"],"flagged":meta["flaggedCards"],"approval":0}))
