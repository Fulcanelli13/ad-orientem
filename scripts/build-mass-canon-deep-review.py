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
evidence = read("data/learn/research/mass-formation-canon-p0-evidence-bridge-20261016.v1.json")
major = read("data/learn/research/mass-formation-canon-two-major-prayers-deep-20261016.v1.json")
triage = read("data/learn/research/mass-formation-canon-quam-supra-32-claim-triage-20261016.v1.json")
triage_by_id = {item["id"]:item for item in triage["claims"]}
lebrun = read("data/learn/research/mass-formation-lebrun-1843-source-collation-20261016.v1.json")
lebrun_by_id = {item["claim_id"]:item for item in lebrun["claim_rows"]}
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
assert evidence["schema"]=="ao-formation-roman-canon-p0-evidence-bridge-v1"
assert evidence["status"]=="RESEARCH_IDENTITY_CROSSWALK_ONLY_NOT_USER_FACING"
assert evidence["scope"]=="FORMATION_P2_EDITORIAL_ONLY"
assert evidence["governance"]["p0_historical_claims_publication_approved"]==0
assert evidence["governance"]["p0_scripture_candidates_publication_approved"]==0
assert evidence["totals"]=={"source_blocks":15,"deep_studies":8,"mapped_research_units":79,"p0_scripture_candidates":1,"historical_author_candidates":88,"approved_new_p0_publication":0}
assert len(evidence["blocks"])==15 and len(evidence["studies"])==8
assert [r["block_id"] for r in evidence["blocks"]]==["AO.SM.B"+str(n).zfill(3) for n in range(47,62)]
assert all(not v["publication_allowed"] for b in evidence["blocks"] for v in b["historical_author_candidates"])
assert all(not v["publication_allowed"] for b in evidence["blocks"] for v in b["scripture_candidates"])
assert len(evidence["primary_source_spot_checks"])==6
assert major["schema"]=="ao-formation-canon-two-major-prayers-detailed-source-study-v1"
assert major["status"]=="EDITORIAL_DRAFT_NOT_RELEASED"
assert major["scope"]=="FORMATION_P2_EDITORIAL_ONLY"
assert [x["id"] for x in major["studies"]]==["AO.FORM.CANON.DEEP.02","AO.FORM.CANON.DEEP.05"]
assert [x["block_id"] for x in major["studies"]]==["AO.SM.B051","AO.SM.B055"]
assert sum(len(x["chapters"]) for x in major["studies"])==15
assert lebrun["schema"]=="ao-formation-lebrun-1843-source-collation-v1"
assert lebrun["status"]=="SOURCE_LOCATED_CLAIMS_UNCERTIFIED"
assert len(lebrun_by_id)==9
assert all(not v["quotation_approved"] and not v["publication_approved"] and not v["printed_scan_image_checked"] for v in lebrun["claim_rows"])
assert major["source_collation_constraints"]["lebrun_printed_original_text_checked"] is False
assert triage["schema"]=="ao-formation-canon-two-prayers-32-claim-collation-triage-v1"
assert triage["status"]=="EDITORIAL_RESEARCH_ONLY_ALL_CLAIMS_HELD"
assert triage["counts"]["total"]==32 and triage["counts"]["gihr"]==8
assert triage["counts"]["primary_printed_gihr_collated"]==0
assert triage["counts"]["author_citations_approved"]==0
assert triage["counts"]["original_1902_ocr_context_inspected"]==8
assert sum(1 for r in triage["claims"] if r.get("original_1902_ocr_context_read"))==8
assert all(not r.get("printed_page_image_collated",False) for r in triage["claims"] if r["author"]=="Fr Nicholas Gihr")
assert len(triage_by_id)==32
assert all(not x["publication_allowed"] and not x["exact_printed_source_read_in_this_pass"] for x in triage["claims"])
assert len(triage["identified_disputes"])==3
assert sum(len(x["direct_primary_sources"]) for x in major["studies"])==10
for m in major["studies"]:
    assert m["level"]=="EXPANDED_PRIMARY_SOURCE_INTERPRETATION_EDITORIAL_DRAFT"
    assert m["block_id"] in [b for x in doc["studies"] if x["id"]==m["id"] for b in x["block_ids"]]
    assert all(isinstance(m["intro"][l],str) and len(m["intro"][l])>140 for l in ("en","fr"))
    for ch in m["chapters"]:
        assert all(len(ch["heading"][l])>10 for l in ("en","fr"))
        for p in ch["paragraphs"]:
            assert all(len(p[l])>200 for l in ("en","fr"))
    assert all(x["url"].startswith("https://") and x["assessment"] for x in m["direct_primary_sources"])
    assert not any(x.get("publication_allowed",False) for x in m["direct_primary_sources"])
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

def research_docket(entry):
    group = next(x for x in evidence["studies"] if x["study_id"] == entry["id"])
    rows = [x for x in evidence["blocks"] if x["block_id"] in entry["block_ids"]]
    refs = [dict(x,block_id=row["block_id"]) for row in rows for x in row["historical_author_candidates"]]
    candidates = [x for row in rows for x in row["scripture_candidates"]]
    assert len(refs)==group["historical_author_candidate_count"]
    assert len(candidates)==group["p0_scripture_candidate_count"]
    assert sum(len(x["research_unit_ids"]) for x in rows)==group["unit_count"]
    by_author={}
    for ref in refs:
        by_author.setdefault(ref["author"],[]).append(ref)
    groups=[]
    for author,items in sorted(by_author.items()):
        references=[]
        for item in items:
            references.append(
                '<li data-p0-author-ref="'+h(item["claim_id"])+'"><code>'+
                h(item["claim_id"])+'</code> · <strong>'+h(item["block_id"])+'</strong> · '+
                h(item["source_locator"])+
                '<small>'+h(item["research_grade"])+
                ' · RESEARCH ONLY, NOT APPROVED FOR PUBLICATION</small>'+
                ('<p data-source-triage="'+h(item["claim_id"])+'"><strong>'+
                 h(triage_by_id[item["claim_id"]]["collation_status"])+'</strong> · '+
                 h(triage_by_id[item["claim_id"]]["editorial_observation"])+
                 '</p>' if item["claim_id"] in triage_by_id else '')+
                ('<p data-lebrun-held="'+h(item["claim_id"])+'"><strong>Le Brun 1843 volume I: original French page collation outstanding.</strong> '+
                 h(lebrun_by_id[item["claim_id"]]["p0_caution"])+
                 ' · provisional Wikisource scan index '+h(lebrun_by_id[item["claim_id"]]["provisional_djvu_first_page"])+
                 ' (offset inferred; not verified for this page).</p>' if item["claim_id"] in lebrun_by_id else '')+'</li>'
            )
        groups.append('<details class="author-record"><summary>'+h(author)+' · '+
                      str(len(items))+' candidate references</summary><ol>'+
                      ''.join(references)+'</ol></details>')
    if not groups:
        groups.append('<p class="hint">No P0 historical-author candidates mapped here. No sources have been invented to fill the gap.</p>')
    checked=[x for x in evidence["primary_source_spot_checks"] if x["study_id"]==entry["id"]]
    source_checks=''.join(
        '<li data-primary-check="'+h(x["locus"])+'"><a href="'+h(x["url"])+
        '" rel="noopener noreferrer" target="_blank">'+h(x["locus"])+'</a>'+
        '<small>'+h(x["finding"])+' · Direct text located, not an editorial publication approval</small></li>'
        for x in checked
    )
    held=''.join(
        '<p data-p0-scripture-held="'+h(x["unit_id"])+'"><strong>P0 Scripture held:</strong> '+
        h(x["reference_as_received"])+' · '+h(x["relationship_type"])+
        ' · original edition/versification still requires verification.</p>'
        for x in candidates
    )
    return (
        '<details class="research-docket"><summary>'+
        bilingual({"en":"P0 source dossier and editorial gaps","fr":"Dossier des sources P0 et lacunes éditoriales"})+
        ' · '+str(len(refs))+' candidate references</summary><div class="docket-body">'+
        '<p class="docket-warning">SOURCE RESEARCH ONLY · NOT CERTIFIED FOR PUBLICATION</p>'+
        '<p class="hint">'+str(group["unit_count"])+' mapped source units · '+
        str(len(refs))+' author references · '+str(len(candidates))+' held P0 Scripture candidates</p>'+
        '<h4>'+bilingual({"en":"Next editorial question","fr":"Question éditoriale prioritaire"})+'</h4>'+
        '<p>'+bilingual(group["editorial_question"])+'</p>'+held+
        ('<h4>'+bilingual({"en":"Direct primary-text checks","fr":"Vérifications directes des textes primaires"})+
         '</h4><ul>'+source_checks+'</ul>' if source_checks else '')+
        '<h4>'+bilingual({"en":"Historical locators by author","fr":"Références historiques par auteur"})+'</h4>'+
        ''.join(groups)+'</div></details>'
    )


def major_exegesis(entry):
    match = next((x for x in major["studies"] if x["id"] == entry["id"]), None)
    if match is None:
        return ""
    chapters = []
    for index, chapter in enumerate(match["chapters"], 1):
        paras = ''.join('<p>'+bilingual(p)+'</p>' for p in chapter["paragraphs"])
        glosses = chapter.get("glosses", [])
        glossary = ""
        if glosses:
            glossary = '<dl class="five-words">'+''.join(
                '<div class="latin-item"><dt lang="la">'+h(g["latin"])+'</dt><dd>'+
                bilingual(g)+'</dd></div>' for g in glosses
            )+'</dl>'
        chapters.append('<section class="detailed-chapter" data-major-chapter="'+str(index)+'"><h4>'+
                        bilingual(chapter["heading"])+'</h4>'+paras+glossary+'</section>')
    refs = ''.join('<li class="source-link"><a href="'+h(s["url"])+
                   '" target="_blank" rel="noopener noreferrer">'+h(s["author"])+
                   ' · '+h(s["locus"])+'</a><small>'+h(s["assessment"])+
                   '</small></li>' for s in match["direct_primary_sources"])
    parallels = ''.join(
        '<li data-existing-scripture-owner="'+h(n["link_owner_id"])+'"><strong>'+
        h(n["reference"])+'</strong> · '+h(n["relationship"])+
        ' · existing Formation source '+h(n["link_owner_id"])+'</li>'
        for n in match["study_navigation"]
    )
    return '<section class="major-exegesis" data-major-exegesis="'+h(match["block_id"])+'">'+(
        '<div class="major-kicker">'+bilingual({"en":"Deeper study · two principal Canon prayers",
                                                "fr":"Étude approfondie · deux prières majeures du Canon"})+'</div>'+
        '<p class="major-intro">'+bilingual(match["intro"])+'</p>'+
        ''.join(chapters)+
        '<details class="major-sources"><summary>'+bilingual({"en":"Primary texts used for this study",
                                                               "fr":"Textes primaires consultés"})+'</summary>'+
        '<ul>'+refs+'</ul></details>'+
        ('<div class="major-parallels"><h4>'+bilingual({"en":"Existing Scripture study pathway",
                                                        "fr":"Parcours biblique existant"})+'</h4><ul>'+
          parallels+'</ul></div>' if parallels else '')+
        '<p class="docket-warning">'+h(match["held_source_warning"])+'</p></section>'
    )

def chapter(entry,ix):
    rel=''.join(link_context(id) for id in entry["scripture_anchor_ids"])
    return ('<article class="study" id="'+h(entry["id"])+'">'+
            '<div class="study-head"><span class="seq">'+str(ix).zfill(2)+'</span><div><p class="eyebrow">'+h(" · ".join(entry["block_ids"]))+
            ' · '+h(entry["stage_id"])+'</p><h2>'+bilingual(entry["title"])+'</h2><p class="question">'+bilingual(entry["question"])+'</p></div></div>'+
            '<div class="study-grid"><div class="prose"><h3>'+bilingual({"en":"At a glance","fr":"En bref"})+
            '</h3><p class="lead">'+bilingual(entry["overview"])+'</p><h3>'+
            bilingual({"en":"Understand the prayer","fr":"Comprendre la prière"})+'</h3><p>'+
            bilingual(entry["deep"])+'</p>'+major_exegesis(entry)+'<h3>'+bilingual({"en":"Within the Mass","fr":"Dans la Messe"})+
            '</h3><p>'+bilingual(entry["liturgical_note"])+'</p>'+
            ('<div class="related"><h3>'+bilingual({"en":"Follow in Scripture","fr":"Approfondir dans l’Écriture"})+'</h3>'+
             '<p class="hint">Pre-existing, typed Formation study relationships · Bible passages and translation remain owned by the Scripture module.</p>'+rel+'</div>' if rel else '')+
            '<details class="sources"><summary>'+bilingual({"en":"Sources and attribution","fr":"Sources et attribution"})+
            '</summary><ul>'+''.join(source_link(k) for k in entry["source_keys"])+'</ul></details>'+research_docket(entry)+'</div>'+
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
.major-exegesis{border-top:1px solid var(--line);margin:21px 0 28px;padding-top:12px}.major-kicker{font:600 .72rem/1.4 system-ui;color:var(--gold);letter-spacing:.07em;text-transform:uppercase;margin-top:10px}.major-intro{font-size:1.07rem!important;color:var(--soft)}.detailed-chapter{padding:9px 0 13px;border-bottom:1px solid var(--line)}.detailed-chapter h4{font:600 .98rem/1.45 Georgia,serif;margin:12px 0 10px;color:var(--gold)}.five-words{margin:14px 0}.latin-item{border-left:2px solid var(--gold);margin:0 0 10px;padding:9px 11px;background:var(--panel)}.latin-item dt{font:600 1rem/1.35 Georgia,serif;color:var(--gold)}.latin-item dd{margin:5px 0 0;font-size:.94rem}.major-sources{margin-top:21px}.major-sources summary{font:.86rem system-ui;color:var(--gold);cursor:pointer}.major-sources li{margin:10px 0;font-size:.8rem}.major-sources small{display:block;color:var(--muted);font:.69rem/1.5 system-ui}.major-sources li,.major-sources small,.docket-warning,.latin-item,.major-parallels li{overflow-wrap:anywhere;word-break:break-word}.major-parallels ul{margin-top:4px;padding-left:18px}.major-parallels li{font:.86rem/1.55 system-ui;margin:6px 0}.research-docket{margin-top:21px;border:1px solid var(--line);border-radius:10px;background:#0e161f;padding:12px}.research-docket>summary{font:600 .82rem/1.5 system-ui;color:var(--gold);cursor:pointer}.docket-body{margin-top:14px}.docket-body h4{font:600 .78rem/1.5 system-ui;color:var(--gold);margin:16px 0 7px}.docket-body li{font-size:.82rem;margin:9px 0;overflow-wrap:anywhere}.docket-body li small{display:block;font:.69rem/1.55 system-ui;color:var(--muted)}.docket-warning{font:600 .72rem/1.5 system-ui;color:var(--gold)}.author-record{padding:10px 0;border-top:1px solid var(--line)}.author-record summary{font:.8rem/1.5 system-ui;cursor:pointer}.docket-body code{color:var(--gold);font:.73rem system-ui}
.footer{padding-top:26px;font:.77rem/1.6 system-ui;color:var(--muted)}[hidden]{display:none!important}
@media(max-width:800px){.study-grid{grid-template-columns:1fr}.wrap{padding:16px 13px 45px}.ribbon>span{display:none}.study{padding-top:27px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
"""
layout="""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem · Roman Canon · Deep review</title><style>__CSS__</style></head><body><main class="wrap">
<header class="hero"><p class="eyebrow">AD ORIENTEM · FORMATION P2 · DEEP EDITORIAL PROTOTYPE</p><h1>The Roman Canon</h1>
<p>Eight connected, substantive studies across fifteen unchanged source prayers: their meaning, their theology, existing Scripture pathways, and original liturgical words with traceable sources.</p></header>
<div class="ribbon"><span>8 themes · 15 source blocks · 88 held historical candidates · 7 Scripture anchors</span><div role="group" aria-label="Commentary language"><button type="button" data-select-lang="en" aria-pressed="true">English</button> <button type="button" data-select-lang="fr" aria-pressed="false">Français</button></div></div>
<div class="notice">EDITORIAL DRAFT — NOT PUBLIC. This is the intended deeper layer of Mass Explorer, not a change to LIVE, Simple, or Missal. The eight theme dossiers map 79 P0 source units, 88 historical-author candidates and one held Scripture candidate; none is approved for publication. These research identities have <strong>not</strong> been converted to new public claims. Additional Aquinas and Benedict XVI interpretations remain to be editorially approved.</div>
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
assert markup.count('class="relation"')==8
assert markup.count('class="research-docket"')==8
assert markup.count('class="major-exegesis"')==2
assert markup.count('class="detailed-chapter"')==15
assert markup.count('data-lebrun-held=')==9
assert markup.count('data-source-triage=')==32
assert markup.count('class="latin-item"')==5
assert markup.count('class="source-link"')==10
assert markup.count('data-p0-author-ref=')==88
assert markup.count('data-primary-check=')==6
assert markup.count('data-p0-scripture-held=')==1
assert "EDITORIAL DRAFT — NOT PUBLIC" in markup
out=ROOT/"artifacts/p2-formation-prayer-review/roman-canon-deep/index.html"
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(markup,encoding="utf-8")
print("PASS Roman Canon deep review: 8 bilingual studies, 15 source blocks, 2 expanded essays with 15 chapters, 8 checked Gihr OCR contexts, 9 held Le Brun facsimile loci, 32 claim-specific triage notes, five Latin glosses, 10 cited source records; 79 P0 units, 88 held author refs, no publication ->",out)
