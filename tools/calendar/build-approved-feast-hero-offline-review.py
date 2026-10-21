#!/usr/bin/env python3
"""Create one offline, self-contained, NON-PUBLISHING review file.

The ten user-selected PAINTINGS are immutable. Reviewers mark only the particular
downloaded photographic versions as suitable or hold. Decisions export to a JSON
file for optional later reconciliation; no app, rights, or repo mutation happens.
"""
import base64
import html
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
META=ROOT/"data/calendar/approved-feast-hero-packaged-candidates-20261021.v1.json"
OUT=ROOT/"artifacts/approved-feast-hero-offline-review/ten-approved-feast-hero-photo-review.html"

def H(v):
    return html.escape(str(v),quote=True)

def main():
    meta=json.loads(META.read_text(encoding="utf-8"))
    assert meta["candidateWebpFilesWritten"]==10
    assert meta["humanAcceptedImagePhotos"]==0
    blocks=[]
    for i,item in enumerate(meta["photographs"],1):
        photo=item["candidateFile"]
        data=(ROOT/photo["path"]).read_bytes()
        import hashlib
        assert hashlib.sha256(data).hexdigest()==photo["sha256"]
        mime="data:image/webp;base64,"+base64.b64encode(data).decode("ascii")
        source=H(item["sourcePhotoPage"])
        right=H(item["rightsReview"]["status"])
        tags=["Source file staged locally","Source-byte checksum verified","Painting already approved",
              "Photographic reuse rights still require clearance"]
        blocks.append(f"""
        <article class="piece" data-date="{H(item['date'])}">
          <div class="info"><span class="occasion">{H(item['date'])} · {H(item['occasion'])}</span>
           <h2>{H(item['title'])}</h2><p class="artist">{H(item['artist'])}</p>
           <div class="rights">Reproduction terms: {right}</div>
          </div>
          <div class="view"><img src="{mime}" alt="{H(item['artist'])} — {H(item['title'])}" width="{photo['width']}" height="{photo['height']}"></div>
          <div class="review">
            <div class="choice" role="group" aria-label="Photo quality decision for {H(item['occasion'])}">
              <button type="button" data-decision="pass">Photograph acceptable</button>
              <button type="button" data-decision="hold">Hold this photograph</button>
              <button type="button" data-decision="pending" class="selected">Pending</button>
            </div>
            <label>Optional reason (photograph only, not painting selection)
              <textarea rows="2" placeholder="E.g. glare, frame, crop, insufficient definition, different original..."></textarea>
            </label>
            <p class="sources">Source: <a href="{source}" target="_blank" rel="noopener noreferrer">{H(item['sourcePhotoPage'])}</a></p>
          </div>
        </article>""")
    stylesheet=r"""
    :root{color-scheme:dark;--bg:#080c12;--ink:#ebe4d9;--gold:#c9b38b}
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--ink);font-family:Georgia,"Times New Roman",serif}
    header{max-width:900px;margin:auto;padding:28px 16px 18px}
    .kicker{font:650 11px system-ui,sans-serif;letter-spacing:.13em;color:var(--gold)}
    h1{font-size:clamp(26px,6vw,42px);font-weight:400;margin:.3em 0}
    header p,.hint{font:400 13px/1.6 system-ui,sans-serif;color:#bab4ab}
    .toolbar{position:sticky;top:0;z-index:50;background:#0d151f;border-block:1px solid #38404c;padding:8px 12px;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px;font:600 12px system-ui,sans-serif}
    button{background:#17222c;color:#dcd8cf;border:1px solid #46515a;border-radius:7px;min-height:39px;padding:7px 11px;cursor:pointer}
    button.selected{background:#bba577;border-color:#dccca6;color:#0a1218}
    button:focus-visible,textarea:focus-visible,a:focus-visible{outline:2px solid #dec492;outline-offset:2px}
    main{max-width:900px;margin:22px auto;padding:0 12px 32px}
    article{margin:0 auto 24px;border:1px solid #303d48;background:#111922;max-width:800px}
    .info{padding:17px 16px 10px}
    .info h2{font-size:23px;font-weight:400;margin:5px 0}
    .artist{margin:0;color:#cbc1b2}
    .occasion{font:600 11px system-ui,sans-serif;letter-spacing:.05em;color:#cdb98d}
    .rights{margin-top:10px;font:500 11px/1.4 system-ui,sans-serif;color:#a99f93}
    .view{height:min(56vh,480px);width:100%;background:#05090e;display:grid;place-items:center;padding:8px}
    .view img{width:100%;height:100%;object-fit:contain;min-height:0;min-width:0;display:block}
    .review{padding:14px 15px 18px}
    .choice{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 13px}
    .review label{display:block;font:500 12px/1.5 system-ui,sans-serif;color:#c9c1b3}
    textarea{display:block;margin-top:7px;width:100%;padding:9px 10px;border-radius:5px;background:#0b1219;color:var(--ink);border:1px solid #46505b;resize:vertical;font:13px/1.4 system-ui,sans-serif}
    .sources{font:11px/1.5 system-ui,sans-serif;overflow-wrap:anywhere;color:#a7a297;margin:13px 0 0}
    a{color:#dbc6a2;text-underline-offset:3px}
    .status{color:#c8bca6;font:600 12px system-ui,sans-serif}
    body.device-320 main{max-width:320px}
    body.device-390 main{max-width:390px}
    @media(min-width:721px){body.device-320 main,body.device-390 main{padding:0;box-shadow:0 0 0 8px #0e1520}}
    @media(max-width:720px){header{padding:19px 13px 13px}.toolbar{position:relative}
      main{padding:0 8px}.view{height:min(54vh,370px)}
      body.device-320 main{max-width:320px}body.device-390 main{max-width:390px}}
    """
    js=r"""
    const choices={};
    document.querySelectorAll(".piece").forEach(p=>{
      const date=p.dataset.date;
      choices[date]={date,photoDecision:"pending",photoNotes:""};
      p.querySelectorAll("[data-decision]").forEach(button=>{
        button.addEventListener("click",()=>{
          choices[date].photoDecision=button.dataset.decision;
          p.querySelectorAll("[data-decision]").forEach(b=>{
            b.classList.toggle("selected",b===button);
            b.setAttribute("aria-pressed",String(b===button));
          });
          update();
        });
      });
      p.querySelector("textarea").addEventListener("input",e=>{
        choices[date].photoNotes=e.target.value;
      });
    });
    function update(){
      const all=Object.values(choices);
      document.querySelector("#decisionCount").textContent=
        all.filter(x=>x.photoDecision==="pass").length+" photographs acceptable · "+
        all.filter(x=>x.photoDecision==="hold").length+" on hold · "+
        all.filter(x=>x.photoDecision==="pending").length+" pending";
    }
    document.querySelectorAll("[data-width]").forEach(b=>{
      b.addEventListener("click",()=>{
        document.body.classList.toggle("device-320",b.dataset.width==="320");
        document.body.classList.toggle("device-390",b.dataset.width==="390");
        document.querySelectorAll("[data-width]").forEach(x=>x.classList.toggle("selected",x===b));
      });
    });
    document.querySelector("#export").addEventListener("click",()=>{
      const output={schema:"AO_FEAST_HERO_PHOTOGRAPH_REVIEW_NOT_PAINTING_SELECTION_V1",
        scope:"PHOTO_REPRODUCTION_QA_ONLY_PAINTINGS_ALREADY_APPROVED",
        artworkSelectionsRevised:0,rightsApprovalsIssued:0,
        photos:Object.values(choices)};
      const blob=new Blob([JSON.stringify(output,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download="ad-orientem-ten-hero-photo-reviews.json";
      document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    });
    update();
    """
    markup=''.join(blocks)
    doc=f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Ad Orientem · 10 Approved Hero Photographs · Offline Review</title>
    <style>{stylesheet}</style></head><body class="device-390">
    <header><div class="kicker">AD ORIENTEM · HUMAN PHOTOGRAPH QA · OCTOBER 2026</div>
    <h1>Ten approved feast paintings</h1>
    <p>The <strong>paintings are already selected</strong>. Inspect only the specific
    photograph: visible surface, colour, glare, frame, clarity and whether it
    is the correct physical original. Toggle mobile widths to assess readability.
    Your choices are private to this local file until exported. Approval here
    does not certify copyright, alter Ad Orientem, or publish a photo.</p>
    </header>
    <div class="toolbar"><button type="button" data-width="320">320px</button>
    <button type="button" data-width="390" class="selected">390px</button>
    <span id="decisionCount" class="status"></span>
    <button type="button" id="export">Export photo decisions (JSON)</button></div>
    <main>{markup}</main><script>{js}</script></body></html>"""
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(doc,encoding="utf-8")
    print("HERO_OFFLINE_REVIEW_GENERATED",{"count":len(meta["photographs"]),"bytes":OUT.stat().st_size,
        "selfContained":True,"paintingChanges":0,"rightsClearances":0},flush=True)

if __name__=="__main__":
    main()
