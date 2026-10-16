#!/usr/bin/env python3
"""Research-only P2 Roman Canon deep editorial preview; never a reader import."""
from pathlib import Path
import json, re, html

ROOT = Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))
def h(value):
    return html.escape(str(value or ""), quote=True)
def bilingual(obj):
    return '<span data-lang="en">'+h(obj["en"])+'</span><span data-lang="fr" hidden>'+h(obj["fr"])+'</span>'
doc = read("data/learn/research/mass-formation-canon-deep-exemplar-20261016.v1.json")
sung = read("data/presentation/reader-text-sung.v1.json")
old = read("data/learn/research/mass-formation-roman-canon-reading-pilot-20261016.v1.json")
formation = read("data/learn/mass-formation-campion.v1.json")
scripture_js = (ROOT/"src/learn/mass-formation-scripture-context.js").read_text(encoding="utf-8")
scripture_pattern = r'id:"(MFS[0-9]+)",stageId:"(MF[0-9]+)",reference:"([^"]+)",relationship:"([A-Z_]+)",title:\{en:"([^"]+)",fr:"([^"]+)"\}'
scriptures = {m[0]:{"reference":m[2],"type":m[3],"title":{"en":m[4],"fr":m[5]}}
             for m in re.findall(scripture_pattern,scripture_js)}
blocks = {b["Block_ID"]:b for b in sung["blocks"]}
old_ids = {e["block_id"] for e in old["entries"]}
assert len(scriptures) >= 18, "Published Scripture anchor parser changed"
assert doc["schema"] == "ao-formation-canon-deep-exemplar-v1"
assert doc["scope"] == "FORMATION_EDITORIAL_ONLY"
assert doc["status"] == "EDITORIAL_DRAFT_NOT_RELEASED"
assert doc["liturgical_profile"] == "ORDINARY_SUNG"
assert len(doc["studies"]) == 8
all_ids = [id for entry in doc["studies"] for id in entry["block_ids"]]
assert all_ids == ["AO.SM.B"+str(n).zfill(3) for n in range(47,62)]
assert len(set(all_ids))==15
assert "P0" in " ".join(doc["editorial_rules"])
for i,entry in enumerate(doc["studies"],1):
    assert entry["id"]=="AO.FORM.CANON.DEEP."+str(i).zfill(2)
    assert entry["status"]=="EDITORIAL_DRAFT_NOT_RELEASED"
    assert any(s["id"]==entry["stage_id"] for s in formation["stages"])
    assert all(id in old_ids and blocks[id]["Proper_Slot"] is None for id in entry["block_ids"])
    for prop in ["title","question","overview","deep","liturgical_note"]:
        for lang in ["en","fr"]:
            txt=entry[prop][lang]
            assert isinstance(txt,str) and len(txt)> (350 if prop=="deep" else 25), (entry["id"],prop,lang)
    assert all(k in scriptures for k in entry["scripture_anchor_ids"])
    assert all(k in doc["source_references"] for k in entry["source_keys"])
    assert "AO.V3." not in json.dumps(entry) and "VER-" not in json.dumps(entry)

LABELS={"PRIEST_PRIVATE":"Priest · quiet","PUBLIC_TEXT":"Public text","USER_RESPONSE":"Response","PRIEST_ACTION":"Priest action","SCHOLA_PUBLIC":"Schola"}
def source_block(id):
    block=blocks[id]
    lines=[]
    for u in block["units"]:
        if not u.get("latin") and not u.get("english"):
            continue
        lines.append('<div class="lit-line"><small class="voice">'+h(LABELS.get(u.get("clock"),u.get("clock")))+'</small>'+
                     '<p lang="la">'+h(u.get("latin"))+'</p><p class="translation">'+h(u.get("english"))+'</p></div>')
    return ('<details class="lit-block"><summary><span>'+h(block["Title"])+'</span><small>'+h(id)+'</small></summary>'+
            "".join(lines)+'</details>')
def link_context(key):
    a=scriptures[key]
    return ('<div class="relation"><small class="ref">'+h(a["reference"])+'</small><strong>'+bilingual(a["title"])+
            '</strong><p class="hint">'+h(a["type"].replace("_"," ").title())+
            ' · Existing Formation Scripture link '+h(key)+'; not a new Missal quotation</p></div>')
def source_link(key):
    a=doc["source_references"][key]
    assert a["url"].startswith("https://")
    status="Additional interpretative source · editorial review" if a["authority"].startswith("ADDITIONAL") else "Existing Formation source"
    return ('<li><a href="'+h(a["url"])+'" target="_blank" rel="noopener noreferrer">'+
            h(a["label"])+'</a><small>'+status+'</small></li>')
def chapter(entry,ix):
    rel=''.join(link_context(id) for id in entry["scripture_anchor_ids"])
    return ('<article class="study" id="'+h(entry["id"])+'">'+
            '<div class="study-head"><span class="seq">'+str(ix).zfill(2)+'</span><div><p class="eyebrow">'+h(" · ".join(entry["block_ids"]))+
            ' · '+h(entry["stage_id"])+'</p><h2>'+bilingual(entry["title"])+'</h2><p class="question">'+bilingual(entry["question"])+'</p></div></div>'+
            '<div class="study-grid"><div class="prose"><h3>'+bilingual({"en":"At a glance","fr":"En bref"})+
            '</h3><p class="lead">'+bilingual(entry["overview"])+'</p><h3>'+
            bilingual({"en":"Understand the prayer","fr":"Comprendre la prière"})+'</h3><p>'+
            bilingual(entry["deep"])+'</p><h3>'+bilingual({"en":"Within the Mass","fr":"Dans la Messe"})+
            '</h3><p>'+bilingual(entry["liturgical_note"])+'</p>'+
            ('<div class="related"><h3>'+bilingual({"en":"Follow in Scripture","fr":"Approfondir dans l’Écriture"})+'</h3>'+
             '<p class="hint">Pre-existing, typed Formation study relationships · Bible passages and translation remain owned by the Scripture module.</p>'+rel+'</div>' if rel else '')+
            '<details class="sources"><summary>'+bilingual({"en":"Sources and attribution","fr":"Sources et attribution"})+
            '</summary><ul>'+''.join(source_link(k) for k in entry["source_keys"])+'</ul></details></div>'+
            '<aside class="sourcepanel"><h3>'+bilingual({"en":"1962 Mass text · Latin / English","fr":"Texte de la Messe de 1962 · Latin / Anglais"})+
            '</h3><p class="hint">Original source words and priest/response voices retained. Open a prayer for the full text.</p>'+
            ''.join(source_block(id) for id in entry["block_ids"])+'</aside></div></article>')
css="""
:root{color-scheme:dark;--bg:#080c12;--panel:#131b26;--ink:#eee8df;--soft:#d1c8ba;--muted:#a9a49c;--gold:#c5aa7b;--line:#3b434c}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.62 Georgia,serif}
button:focus-visible,a:focus-visible,summary:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
a{color:var(--gold)}.wrap{max-width:1160px;margin:auto;padding:23px 20px 75px}.eyebrow{font:600 .71rem/1.5 system-ui;letter-spacing:.08em;color:var(--gold)}
.hero{border-bottom:1px solid var(--line)}.hero h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:normal;line-height:1.1;margin:9px 0}
.hero p{max-width:84ch;color:var(--soft)}.ribbon{position:sticky;top:0;z-index:5;background:var(--bg);display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--line)}
.ribbon span{font:.75rem system-ui;color:var(--muted)}.ribbon button{min-height:44px;border:1px solid var(--line);border-radius:9px;color:var(--ink);padding:10px 13px;background:var(--panel);font:600 .79rem system-ui;cursor:pointer}
.ribbon button[aria-pressed=true]{border-color:var(--gold);color:var(--gold)}.notice{background:var(--panel);border-left:3px solid var(--gold);padding:16px;margin:20px 0;color:var(--soft);font-size:.87rem}
.toc{display:flex;flex-wrap:wrap;gap:6px;margin:18px 0}.toc a{border:1px solid var(--line);border-radius:7px;padding:7px 9px;font:.77rem system-ui;text-decoration:none;color:var(--soft)}
.study{border-bottom:1px solid var(--line);padding:28px 0 42px;scroll-margin-top:100px}.study-head{display:flex;align-items:start;gap:15px}.seq{color:var(--gold);font:600 1rem system-ui;padding-top:7px}
.study h2{font-weight:normal;font-size:clamp(1.7rem,3vw,2.4rem);line-height:1.2;margin:4px 0}.question{font-size:1.16rem;font-style:italic;color:var(--soft);margin:5px 0 24px}
.study-grid{display:grid;grid-template-columns:minmax(0,1.23fr) minmax(0,.77fr);gap:25px}.study h3{font:600 .78rem/1.5 system-ui;color:var(--gold);text-transform:uppercase;letter-spacing:.06em;margin:22px 0 7px}
.study .prose{max-width:72ch}.study p{margin:0 0 15px}.lead{font-size:1.12rem}.sourcepanel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:5px 17px 17px;align-self:start;min-width:0}
.hint{font:.78rem/1.55 system-ui;color:var(--muted)}.lit-block{border-top:1px solid var(--line);padding:11px 0}.lit-block summary{display:flex;justify-content:space-between;gap:7px;align-items:center;cursor:pointer;list-style:none}
.lit-block summary::-webkit-details-marker{display:none}.lit-block[open] summary{color:var(--gold)}.lit-block summary small{font:.65rem system-ui;color:var(--muted)}
.lit-line{border-top:1px solid var(--line);margin-top:12px;padding-top:9px}.lit-line p{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.91rem;margin:4px 0}
.lit-line .translation{font-size:.84rem;color:var(--muted)}.voice{font:.68rem system-ui;color:var(--gold)}
.related{border-top:1px solid var(--line);margin-top:24px}.relation{border:1px solid var(--line);border-radius:9px;padding:11px 13px;margin:9px 0}
.relation .ref{font:.74rem system-ui;color:var(--gold);display:block}.relation strong{font-size:.97rem;font-weight:normal;display:block}.relation .hint{margin:5px 0}
.sources{margin-top:24px;border-top:1px solid var(--line);padding-top:12px}.sources summary{font:.83rem system-ui;color:var(--gold);cursor:pointer}.sources li{margin:9px 0}.sources li small{display:block;color:var(--muted);font:.7rem system-ui}
.footer{padding-top:26px;font:.77rem/1.6 system-ui;color:var(--muted)}[hidden]{display:none!important}
@media(max-width:800px){.study-grid{grid-template-columns:1fr}.wrap{padding:16px 13px 45px}.ribbon>span{display:none}.study{padding-top:27px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
"""
layout="""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem · Roman Canon · Deep review</title><style>__CSS__</style></head><body><main class="wrap">
<header class="hero"><p class="eyebrow">AD ORIENTEM · FORMATION P2 · DEEP EDITORIAL PROTOTYPE</p><h1>The Roman Canon</h1>
<p>Eight connected, substantive studies across fifteen unchanged source prayers: their meaning, their theology, existing Scripture pathways, and original liturgical words with traceable sources.</p></header>
<div class="ribbon"><span>8 themes · 15 source blocks · 7 existing Scripture anchors</span><div role="group" aria-label="Commentary language"><button type="button" data-select-lang="en" aria-pressed="true">English</button> <button type="button" data-select-lang="fr" aria-pressed="false">Français</button></div></div>
<div class="notice">EDITORIAL DRAFT — NOT PUBLIC. This is the intended deeper layer of Mass Explorer, not a change to LIVE, Simple, or Missal. The P0 research candidates (48 Scripture and 139 author claims) have <strong>not</strong> been silently promoted. Additional Aquinas and Benedict XVI interpretations remain to be editorially approved.</div>
<nav class="toc" aria-label="Canon themes">__TOC__</nav>__STUDIES__
<p class="footer">This file is a research-only editorial review. 1962 original prayers, priest voices and their precise order remain owned by the existing Mass reader; language switching changes commentary only. No release or merge authorization.</p>
</main><script>
document.querySelectorAll('[data-select-lang]').forEach(button=>button.addEventListener('click',()=>{
const lang=button.dataset.selectLang;
document.querySelectorAll('[data-select-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
document.querySelectorAll('[data-lang]').forEach(el=>el.hidden=el.dataset.lang!==lang);
document.documentElement.lang=lang;
}));
</script></body></html>"""
toc=''.join('<a href="#'+h(s["id"])+'">'+str(i).zfill(2)+' · '+h(s["title"]["en"])+'</a>' for i,s in enumerate(doc["studies"],1))
markup=layout.replace("__CSS__",css).replace("__TOC__",toc).replace("__STUDIES__","".join(chapter(s,i) for i,s in enumerate(doc["studies"],1)))
assert markup.count('class="study" id=')==8
assert markup.count('class="lit-block"')==15
assert markup.count('class="relation"')==7
assert "EDITORIAL DRAFT — NOT PUBLIC" in markup
out=ROOT/"artifacts/p2-formation-prayer-review/roman-canon-deep/index.html"
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(markup,encoding="utf-8")
print("PASS Roman Canon deep review: 8 bilingual thematic studies, 15 original prayers, 7 existing Scripture links; editorial only ->",out)
