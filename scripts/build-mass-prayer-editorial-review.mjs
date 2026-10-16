import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {validatePrayerReadingPilot,validateMassTransitionReadingPilot,validateRomanCanonReadingPilot,validateCommunionReadingPilot} from "../src/learn/mass-prayer-reading-pilot.js";
const root=fileURLToPath(new URL("..",import.meta.url));
const read=path=>JSON.parse(readFileSync(resolve(root,path),"utf8"));
const corpus=read("data/presentation/reader-text-sung.v1.json");
const formation=read("data/learn/mass-formation-campion.v1.json");
const guide=read("data/presentation/guide-registry.v1.json");
const first=validatePrayerReadingPilot(
 read("data/learn/research/mass-formation-offertory-prayer-reading-pilot-20261016.v1.json"),corpus,formation);
const second=validateMassTransitionReadingPilot(
 read("data/learn/research/mass-formation-orate-preface-reading-pilot-20261016.v1.json"),corpus,formation,guide);
assert.equal(first.ok,true,first.reason);
assert.equal(second.ok,true,second.reason);
const third=validateRomanCanonReadingPilot(
 read("data/learn/research/mass-formation-roman-canon-reading-pilot-20261016.v1.json"),corpus,formation,guide);
assert.equal(third.ok,true,third.reason);
const fourth=validateCommunionReadingPilot(
 read("data/learn/research/mass-formation-communion-prayer-reading-pilot-20261016.v1.json"),corpus,formation,guide);
assert.equal(fourth.ok,true,fourth.reason);
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const blocks=new Map(corpus.blocks.map(x=>[x.Block_ID,x]));
const records=[...first.readings,...second.readings,...third.readings,...fourth.readings];
const chapter=(rec,index)=>{
 const source=blocks.get(rec.block_id);
 const original=source.units.map(unit=>{
  if(!unit.latin&&!unit.english)return "";
  const action=unit.clock==="PRIEST_ACTION";
  const voiceLabels={PRIEST_PRIVATE:"Priest · quiet",PUBLIC_TEXT:"Public text",USER_RESPONSE:"Response",
      SCHOLA_PUBLIC:"Schola",PRIEST_ACTION:"Priest action"};
  return '<div class="sourceLine'+(action?" action":"")+'" data-cue="'+esc(unit.cue_id)+
    '" data-source-voice="'+esc(unit.clock)+'">'+
     '<small class="voiceLabel">'+esc(voiceLabels[unit.clock]||unit.clock)+'</small>'+
     '<p lang="la">'+esc(unit.latin||"")+'</p><p lang="en">'+esc(unit.english||"")+'</p>'+
     '</div>';
 }).join("");
 return '<details class="entry" id="'+esc(rec.block_id)+'"'+(index===0?" open":"")+'>'+
   '<summary><span class="number">'+String(index+1).padStart(2,"0")+'</span>'+
   '<span><strong>'+esc(source.Title)+'</strong><small>'+esc(rec.block_id)+' · '+
   esc(rec.moment_id)+' · '+esc(rec.stage_id)+'</small>'+
   (rec.branch==="OPTIONAL_LOCAL_OLDER_CUSTOM"?'<em class="optional" aria-label="Older local Communion custom, optional">OPTIONAL LOCAL CUSTOM</em>':"")+
   '</span><span class="openHint">+</span></summary>'+
   '<div class="entryContent"><section class="original" aria-label="Published Mass text">'+
    '<h3>Published Mass text · Latin / English</h3>'+original+'</section>'+
    '<section class="commentary" aria-label="Editorial commentary"><span class="eyebrow">EDITORIAL DRAFT — NOT PUBLISHED</span>'+
    '<div data-lang="en"><h3>'+esc(rec.heading.en)+'</h3><p>'+esc(rec.reading.en)+'</p><h4>Read the words and actions</h4><p>'+esc(rec.observe.en)+'</p></div>'+
    '<div data-lang="fr" hidden><h3>'+esc(rec.heading.fr)+'</h3><p>'+esc(rec.reading.fr)+'</p><h4>Observer les paroles</h4><p>'+esc(rec.observe.fr)+'</p></div>'+
    (rec.scripture_within_text?.length?
      '<p class="direct">Biblical passage explicitly identified in the source: '+
      rec.scripture_within_text.map(esc).join(", ")+'</p>':"")+
    '</section></div></details>';
};
const held=[...second.withheld,...fourth.withheld].map(item=>'<li><strong>'+esc(item.proper_slot)+'</strong>'+
 ' <code>'+esc(item.block_id)+'</code> — '+esc(item.reason)+'</li>').join("");
const html='<!doctype html><html lang="en"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>Ad Orientem · Formation P2 editorial review</title>'+
 '<style>'+
 ':root{color-scheme:dark;--bg:#080c12;--panel:#121923;--ink:#eee8dd;--muted:#afa9a1;--gold:#c4aa78;--line:#434046}'+
 '*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font:1rem/1.55 Georgia,serif}'+
 'h1,h2,h3,h4{font-weight:500}h1{font-size:clamp(1.75rem,4vw,2.65rem);margin:6px 0 12px}'+
 '.wrap{max-width:1130px;margin:auto;padding:20px 17px 70px}.deck{color:var(--muted);max-width:80ch}'+
 '.eyebrow{color:var(--gold);font:600 .7rem/1.5 system-ui;letter-spacing:.09em}'+
 '.toolbar{position:sticky;top:0;z-index:4;padding:9px 0;background:var(--bg);display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--line)}'+
 '.toolbar button{min-height:44px;border:1px solid var(--line);border-radius:9px;background:var(--panel);color:var(--ink);padding:10px 14px;cursor:pointer}.toolbar button[aria-pressed=true]{color:var(--gold);border-color:var(--gold)}'+
 '.toc{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 21px}.toc a{padding:6px 9px;border:1px solid var(--line);border-radius:7px;text-decoration:none;color:var(--muted);font:.73rem/1.4 system-ui}'+
 '.toc a:focus-visible,.toc a:hover{color:var(--gold);border-color:var(--gold)}'+
 '.entry{border-top:1px solid var(--line);scroll-margin-top:120px}.entry:last-of-type{border-bottom:1px solid var(--line)}'+
 '.entry>summary{display:flex;align-items:center;gap:12px;min-height:65px;padding:10px 0;cursor:pointer;list-style:none}.entry>summary::-webkit-details-marker{display:none}'+
 '.entry summary strong{display:block;font:500 1.12rem/1.38 Georgia,serif}.entry summary small{display:block;color:var(--muted);font:.68rem/1.4 system-ui;margin-top:5px}'+
 '.optional{display:inline-block;margin-top:7px;padding:4px 8px;border:1px solid var(--gold);border-radius:6px;color:var(--gold);font:600 .66rem/1.2 system-ui;letter-spacing:.035em}.number{font:.79rem/1.3 system-ui;color:var(--gold)}.openHint{margin-left:auto;color:var(--gold)}.entry[open] .openHint{transform:rotate(45deg)}'+
 '.entryContent{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:17px;padding:9px 0 25px}'+
 '.original,.commentary{border:1px solid var(--line);padding:14px;border-radius:10px;min-width:0}.original{background:var(--panel)}'+
 '.original h3{font:.74rem/1.5 system-ui;color:var(--gold);margin:0 0 15px}.sourceLine{margin:0 0 13px;border-bottom:1px solid var(--line);padding-bottom:7px}'+
 '.voiceLabel{display:block;margin-bottom:6px;color:var(--gold);font:600 .67rem/1.35 system-ui;letter-spacing:.04em}.sourceLine p{margin:0 0 5px;overflow-wrap:anywhere}.sourceLine p[lang=en]{color:var(--muted);font-size:.91rem}.sourceLine.action{opacity:.76}'+
 '.commentary h3{font-size:1.35rem;line-height:1.3;margin:9px 0}.commentary h4{font:600 .8rem/1.5 system-ui;color:var(--gold);margin:17px 0 5px}'+
 '.commentary p{margin:7px 0 12px}.commentary .direct{border-top:1px solid var(--line);padding-top:12px;color:var(--gold);font-size:.8rem}'+
 '.held{margin-top:25px;padding:17px;border:1px solid var(--line);border-radius:10px}.held h2{margin:0}.held li{padding:5px 0}.held code{color:var(--gold)}'+
 'footer{margin-top:30px;border-top:1px solid var(--line);padding-top:12px;color:var(--muted);font:.76rem/1.5 system-ui}'+
 '@media(max-width:740px){.entryContent{grid-template-columns:1fr}.wrap{padding:15px 12px 50px}}'+
 '@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}'+
 '</style></head><body><main class="wrap"><span class="eyebrow">AD ORIENTEM · FORMATION P2 · EDITORIAL PREVIEW</span>'+
 '<h1>Prayer-by-prayer readings · 52 source-anchored texts</h1>'+
 '<p class="deck">Eight Offertory prayers, six fixed texts from Orate, fratres to the Sanctus, fifteen Roman Canon prayers and twenty-three Communion text blocks (including three explicitly optional local/older custom prayers). The left column reproduces existing published liturgical text; the right column contains unpublished interpretive notes. Original Latin and existing English remain unchanged. The French toggle changes the editorial notes only. Nothing here is released in Formation or LIVE/Missal.</p>'+
 '<div class="toolbar" role="group" aria-label="Editorial reading language"><button type="button" data-select-lang="en" aria-pressed="true">English commentary</button>'+
 '<button type="button" data-select-lang="fr" aria-pressed="false">Commentaires français</button>'+
 '<span class="eyebrow">52 DRAFTS · 3 PROPER HOLDS · 3 LOCAL CUSTOMS</span></div>'+
 '<nav class="toc" aria-label="Prayer list">'+records.map((r,i)=>'<a href="#'+esc(r.block_id)+'">'+String(i+1).padStart(2,"0")+
 ' '+esc(blocks.get(r.block_id).Title)+'</a>').join("")+'</nav>'+
 '<h2>Published Offertory fixed texts</h2>'+first.readings.map((r,i)=>chapter(r,i)).join("")+
 '<h2>Orate, Preface dialogue and Sanctus</h2>'+second.readings.map((r,i)=>chapter(r,i+8)).join("")+
 '<h2>The Roman Canon — original Guide divisions</h2>'+third.readings.map((r,i)=>chapter(r,i+14)).join("")+
 '<h2>The Lord’s Prayer and Communion rites</h2>'+fourth.readings.map((r,i)=>chapter(r,i+29)).join("")+
 '<section class="held"><h2>Variable Propers — explicitly held</h2><p>These three source slots depend on the selected Mass. No generic text or per-prayer exposition has been invented.</p><ul>'+held+'</ul></section>'+
 '<footer>Review-only artifact; all editorial statements remain drafts. P0 certifies any deeper historical/doctrinal/scriptural research independently.</footer>'+
 '</main><script>'+
 'document.querySelectorAll("[data-select-lang]").forEach(button=>button.addEventListener("click",()=>{'+
 'const language=button.dataset.selectLang;document.querySelectorAll("[data-select-lang]").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));'+
 'document.querySelectorAll("[data-lang]").forEach(x=>{x.hidden=x.dataset.lang!==language});'+
 'document.documentElement.lang=language;}));'+
 'document.querySelectorAll(".toc a").forEach(a=>a.addEventListener("click",()=>{const target=document.getElementById(a.getAttribute("href").slice(1));if(target)target.open=true;}));'+
 '</script></body></html>';
assert.equal((html.match(/class="entry" id=/g)||[]).length,52);
assert.equal((html.match(/data-ao-formation-prayer-block=/g)||[]).length,0);
assert.equal((html.match(/class="entry" id="AO.SM.B0/g)||[]).length,52);
assert.equal((html.match(/OPTIONAL LOCAL CUSTOM/g)||[]).length,3);
assert.equal((html.match(/<li><strong>/g)||[]).length,3);
assert.ok(html.includes('data-source-voice="USER_RESPONSE"'));
assert.ok(html.includes('data-source-voice="PRIEST_PRIVATE"'));
assert.ok(html.includes('data-source-voice="SCHOLA_PUBLIC"'));
const out=resolve(root,"artifacts/p2-formation-prayer-review/index.html");
mkdirSync(dirname(out),{recursive:true});
writeFileSync(out,html);
console.log("PASS Formation P2 editorial review: 52 published text-block witnesses, 52 bilingual draft notes, three optional older/local custom blocks, three expressly held variable Propers → "+out);
