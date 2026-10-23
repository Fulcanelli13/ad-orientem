#!/usr/bin/env python3
"""Assemble offline human review gallery from six independently hash-verified
contact-sheet exports. NO automated image suitability, identity or release verdicts.
"""
import argparse, csv, html, json, pathlib, shutil
from collections import Counter
from itertools import combinations
from datetime import datetime, timezone
from PIL import Image

MASTER=pathlib.Path("data/research/sacred-art-acquisition-245-source-rollup.csv")
FIELDS=["asset_source_id","record_id","title","artist","source_url","source_type","acquisition_tier",
"source_sha256","technical_status","measured_width","measured_height","resolution_gate",
"icc_profile_present","original_contact_sheet","review_thumbnail","visual_review",
"object_identity_review","scripture_placement_review","editorial_publication_gate",
"potential_duplicate_group","manual_review_note"]
EXPECTED={"B19":9,"B20":45,"B21":74,"B21R1":12,"B21R2":9,"B20R1":10}
def loadcsv(path):
    with open(path,encoding="utf-8",newline="") as stream:return list(csv.DictReader(stream))
def savecsv(path,fields,rows):
    with path.open("w",newline="",encoding="utf-8") as stream:
        w=csv.DictWriter(stream,fieldnames=fields,extrasaction="ignore");w.writeheader();w.writerows(rows)
def now():return datetime.now(timezone.utc).isoformat(timespec="seconds")
def hamming(a,b):
    return (int(a,16)^int(b,16)).bit_count()
def build_page(entries,summary):
    compact=[{k:r.get(k,"") for k in ("asset_source_id","title","artist","source_url","source_type","acquisition_tier","resolution_gate","measured_width","measured_height","icc_profile_present","review_thumbnail","original_contact_sheet","potential_duplicate_group")} for r in entries]
    js=json.dumps(compact,ensure_ascii=False).replace("</","<\\/")
    stats=json.dumps(summary,ensure_ascii=False)
    return """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ad Orientem — Sacred-Art Editorial Review</title>
<style>
:root{color-scheme:dark;--bg:#080d13;--card:#161e27;--line:#34404b;--fg:#e9e4d8;--soft:#a9afb0;--accent:#bea77d}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font-family:system-ui,-apple-system,Segoe UI,sans-serif}
header{padding:23px max(18px,calc((100vw - 1480px)/2));border-bottom:1px solid var(--line);background:#111821;position:sticky;top:0;z-index:10}
h1{margin:4px 0 6px;font:normal 29px Georgia,serif;letter-spacing:.025em}p{margin:5px 0;color:var(--soft);font-size:13px;line-height:1.55}.eyebrow{color:var(--accent);font-size:11px;letter-spacing:.13em}
.controls{display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin:16px 0 2px}
input,select,button,textarea{font:inherit;background:#121b24;color:var(--fg);border:1px solid #48515a;border-radius:6px;padding:9px 11px}
input[type=search]{min-width:290px;flex:1}button{cursor:pointer}button:hover{border-color:var(--accent)}
main{max-width:1480px;margin:auto;padding:17px}.status{font-size:12px;color:#bbc3c1;margin:8px 0 18px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(252px,1fr));gap:14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:9px;overflow:hidden}
.picture{width:100%;height:194px;object-fit:contain;background:#0b111a;display:block}.body{padding:12px}
.name{font:normal 18px/1.23 Georgia,serif;min-height:44px;margin:0 0 5px}.artist{font-size:12px;color:var(--soft);min-height:16px}
.ref{color:#a7b6be;font:11px ui-monospace,monospace;overflow-wrap:anywhere;margin-top:8px}
.meta{font-size:12px;color:#d7d0bf;margin-top:8px}.flag{color:#dba88d}.chip{display:inline-block;border:1px solid #5a5d54;padding:2px 7px;border-radius:12px;font-size:10px;color:#c9b896}
.control-title{margin-top:14px;font-size:11px;letter-spacing:.08em;color:#aab8bb}.card select,.card textarea{width:100%;margin-top:6px;font-size:12px}.card textarea{resize:vertical;min-height:48px}
.links{display:flex;gap:12px;margin-top:11px;font-size:12px}a{color:#cdb791}
footer{padding:32px;text-align:center;color:var(--soft);font-size:12px}
</style></head><body>
<header><div class="eyebrow">AD ORIENTEM / RESEARCH / SOURCED IMAGE REVIEW</div><h1>Visual Review — 159 Acquired Sources</h1>
<p>Human curation only. A visual choice here never certifies copyright, artwork identity, Scripture placement, or publication.</p>
<div class="controls"><input type="search" id="q" placeholder="Search artwork, artist, source ID…"/>
<select id="tier"><option value="">All image tiers</option><option>ORIGINAL</option><option>MUSEUM_PRINT_DERIVATIVE</option></select>
<select id="resolution"><option value="">All resolutions</option><option value="low">Below 2,400 pixels</option><option value="high">2,400+ pixels</option></select>
<select id="decision"><option value="">All visual decisions</option><option value="PENDING">Pending</option><option value="SUITABLE_VISUALLY">Suitable visually</option><option value="REJECT_VISUALLY">Reject visually</option><option value="NEEDS_SOURCE_RECHECK">Source recheck</option></select>
<button id="export" type="button">Export review decisions CSV</button></div>
</header><main><div class="status" id="status"></div><div class="grid" id="grid"></div></main>
<footer>Review decisions are kept in this browser only until exported. The canonical Ad Orientem registry and frozen approvals are not modified.</footer>
<script>
const records=__RECORDS__;
const STORE='ao-sacred-art-manual-review-v1';
let reviews={};try{reviews=JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){reviews={}}
const $=id=>document.getElementById(id);
function esc(t){return String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function save(){try{localStorage.setItem(STORE,JSON.stringify(reviews))}catch(e){}}
const opts=['PENDING','SUITABLE_VISUALLY','REJECT_VISUALLY','NEEDS_SOURCE_RECHECK'];
function visible(r){const query=$('q').value.toLocaleLowerCase().trim(), d=reviews[r.asset_source_id]||{};return
 (!query||[r.title,r.artist,r.asset_source_id].some(v=>v.toLocaleLowerCase().includes(query)))&&
 (!$('tier').value||r.acquisition_tier===$('tier').value)&&
 (!$('resolution').value||($('resolution').value==='low'?Math.max(+r.measured_width,+r.measured_height)<2400:Math.max(+r.measured_width,+r.measured_height)>=2400))&&
 (!$('decision').value||(d.visual||'PENDING')===$('decision').value);}
function render(){
 const shown=records.filter(visible);
 const reviewed=records.filter(r=>(reviews[r.asset_source_id]?.visual||'PENDING')!=='PENDING').length;
 $('status').textContent=shown.length+' visible · '+reviewed+' visually annotated / '+records.length+' · 0 editorial publication approvals';
 $('grid').innerHTML=shown.map(r=>{const d=reviews[r.asset_source_id]||{},value=d.visual||'PENDING';
 return `<article class="card"><img class="picture" loading="lazy" src="${esc(r.review_thumbnail)}" alt="${esc(r.title)}"/>
 <div class="body"><h2 class="name">${esc(r.title)}</h2><div class="artist">${esc(r.artist)}</div>
 <div class="meta"><span class="chip">${esc(r.acquisition_tier.replaceAll('_',' '))}</span> ${r.measured_width} × ${r.measured_height}
 ${Math.max(+r.measured_width,+r.measured_height)<2400?'<span class="flag">· resolution review</span>':''}</div>
 <div class="ref">${esc(r.asset_source_id)}</div>
 <div class="control-title">PRELIMINARY VISUAL IMPRESSION ONLY</div>
 <select data-id="${esc(r.asset_source_id)}" class="review-choice">${opts.map(o=>`<option ${o===value?'selected':''}>${o}</option>`).join('')}</select>
 <textarea data-id="${esc(r.asset_source_id)}" class="review-notes" placeholder="Object, composition, colour, crop, further verification…">${esc(d.notes||'')}</textarea>
 <div class="links"><a href="${esc(r.source_url)}" target="_blank" rel="noopener noreferrer">Source record ↗</a><a href="${esc(r.original_contact_sheet)}" target="_blank">Review sheet ↗</a></div></div></article>`}).join('');
 document.querySelectorAll('.review-choice').forEach(el=>el.addEventListener('change',()=>{reviews[el.dataset.id]={...(reviews[el.dataset.id]||{}),visual:el.value};save();render()}));
 document.querySelectorAll('.review-notes').forEach(el=>el.addEventListener('input',()=>{reviews[el.dataset.id]={...(reviews[el.dataset.id]||{}),notes:el.value};save()}));
}
for(const id of ['q','tier','resolution','decision'])$(id).addEventListener(id==='q'?'input':'change',render);
$('export').addEventListener('click',()=>{
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const lines=[['asset_source_id','visual_decision','visual_notes','identity_review','scripture_placement_review','publication_gate'].join(',')];
for(const r of records){const rev=reviews[r.asset_source_id]||{};lines.push([r.asset_source_id,rev.visual||'PENDING',rev.notes||'','NOT_CHECKED','NOT_CHECKED','HOLD'].map(quote).join(','))}
const blob=new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ao-sacred-art-human-visual-decisions.csv';a.click();URL.revokeObjectURL(url);
});
render();
</script></body></html>""".replace("__RECORDS__",js)

def main():
    p=argparse.ArgumentParser();p.add_argument("--incoming",required=True);p.add_argument("--output",required=True);a=p.parse_args()
    inp=pathlib.Path(a.incoming);out=pathlib.Path(a.output);out.mkdir(parents=True,exist_ok=True)
    thumbnails=out/"thumbnails";thumbnails.mkdir(exist_ok=True)
    sheets=out/"sheets";sheets.mkdir(exist_ok=True)
    sources=loadcsv(MASTER)
    source_by_id={r["asset_source_id"]:r for r in sources}
    if len(sources)!=245 or len(source_by_id)!=245:raise ValueError("Invalid canonical rollup")
    all_rows=[];wave_stats={}
    found=list(inp.rglob("Technical_visual_review_queue.csv"))
    if len(found)!=6:raise ValueError("Expected 6 hash-reviewed wave CSV files; got "+str(len(found)))
    for file in found:
        folder=file.parent
        summary_path=folder/"Review_summary.json"
        if not summary_path.is_file():raise ValueError("Missing wave summary for "+str(file))
        detail=json.loads(summary_path.read_text(encoding="utf-8"))
        wave=detail["wave"]
        if wave not in EXPECTED:raise ValueError("Unknown review wave "+wave)
        if wave in wave_stats:raise ValueError("Duplicate wave "+wave)
        records=loadcsv(file)
        if len(records)!=EXPECTED[wave]:raise ValueError("Wave file total mismatch: "+wave)
        wave_stats[wave]=detail
        for index,r in enumerate(records):
            sid=r["asset_source_id"]
            if sid not in source_by_id:raise ValueError("Unknown source "+sid)
            orig=source_by_id[sid]
            if r["technical_qa"]!="HASH_DECODE_PASS":raise ValueError("Technical QA failure: "+sid)
            tier=orig["acquisition_tier"]
            expected_hash=orig["original_sha256"] if tier=="ORIGINAL" else orig["museum_print_sha256"]
            if expected_hash!=r["observed_sha256"]:raise ValueError("SHA mismatch in review queue: "+sid)
            file_name=r["contact_sheet"];fromfile=folder/file_name
            if not fromfile.is_file():raise ValueError("Missing review page: "+str(fromfile))
            target=sheets/file_name
            if not target.exists():shutil.copy2(fromfile,target)
            # Cropping a contact sheet is for visual preview only, never a new art master.
            col=index%4; row=(index%24)//4; x=col*330+10; y=row*325+68
            with Image.open(fromfile) as page:
                card=page.crop((x+2,y+7,x+313,y+218))
                outfile=thumbnails/(sid+".jpg");card.save(outfile,"JPEG",quality=85,optimize=True)
            item={k:"" for k in FIELDS}
            item.update(asset_source_id=sid,record_id=orig["record_id"],title=orig["title"],artist=orig["artist"],
                source_url=orig["source_url"],source_type=orig["source_type"],acquisition_tier=tier,
                source_sha256=expected_hash,technical_status="HASH_DECODE_PASS",measured_width=r["observed_width"],
                measured_height=r["observed_height"],resolution_gate=r["long_edge_gate"],icc_profile_present=r["icc_profile_present"],
                original_contact_sheet="sheets/"+file_name,review_thumbnail="thumbnails/"+sid+".jpg",
                visual_review="PENDING_HUMAN",object_identity_review="PENDING_HUMAN",
                scripture_placement_review="PENDING_HUMAN",editorial_publication_gate="HOLD")
            item["_hash64"]=r["dhash64"]
            all_rows.append(item)
    if len(all_rows)!=159 or len({r["asset_source_id"] for r in all_rows})!=159:
        raise ValueError("Image coverage must be exactly 159 unique sources")
    image_ids={r["asset_source_id"] for r in all_rows}
    if image_ids!={r["asset_source_id"] for r in sources if r["acquisition_tier"]!="NONE"}:
        raise ValueError("Contact sheets do not cover every acquired source identity")
    duplicates=[]
    for a,b in combinations(all_rows,2):
        if a["_hash64"] and b["_hash64"] and hamming(a["_hash64"],b["_hash64"])<=2:
            duplicates.append(dict(a=a["asset_source_id"],b=b["asset_source_id"],distance=hamming(a["_hash64"],b["_hash64"]),disposition="HUMAN_CHECK_ONLY"))
    savecsv(out/"potential-visual-duplicates.csv",["a","b","distance","disposition"],duplicates)
    full=[]
    for s in sources:
        r=next((x for x in all_rows if x["asset_source_id"]==s["asset_source_id"]),None)
        if r:full.append(r)
        else:
            item={k:"" for k in FIELDS}
            item.update(asset_source_id=s["asset_source_id"],record_id=s["record_id"],title=s["title"],artist=s["artist"],
                source_url=s["source_url"],source_type=s["source_type"],acquisition_tier="NONE",
                technical_status=s["technical_status"],visual_review="NOT_AVAILABLE",
                object_identity_review="PENDING_HUMAN",scripture_placement_review="PENDING_HUMAN",
                editorial_publication_gate="HOLD")
            full.append(item)
    savecsv(out/"visual-review-245-source-queue.csv",FIELDS,full)
    summary={"source_count":245,"image_files_prepared_for_visual_review":159,
        "genuine_originals":sum(r["acquisition_tier"]=="ORIGINAL" for r in all_rows),
        "museum_print_derivatives":sum(r["acquisition_tier"]=="MUSEUM_PRINT_DERIVATIVE" for r in all_rows),
        "resolution_review_under_2400":sum(r["resolution_gate"]=="REVIEW_UNDER_2400" for r in all_rows),
        "icc_embedded":sum(r["icc_profile_present"]=="YES" for r in all_rows),
        "unacquired_source_records":86,"possible_visual_duplicate_pairs":len(duplicates),
        "individual_thumbnails":159,
        "contact_sheet_pages":sum(len(x["contact_sheets"]) for x in wave_stats.values()),
        "hash_and_decode_verification":"PASS_ALL_SIX_WAVES",
        "manual_visual_approvals":0,"identity_approvals":0,"scripture_approvals":0,"publication_approvals":0,
        "source_of_truth":str(MASTER),"generated_utc":now()}
    (out/"review-summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    (out/"index.html").write_text(build_page(all_rows,summary),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
