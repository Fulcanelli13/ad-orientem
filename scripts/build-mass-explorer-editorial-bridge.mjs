#!/usr/bin/env node
/**
 * Review-only bridge using the real Mass Explorer presentation owners.
 * NEVER imported by the public app or the R17 ceremonial reader.
 */
import assert from "node:assert/strict";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildMassExplorerCatalog,massExplorerMomentHtml,massExplorerIndexHtml,massExplorerCss} from "../src/learn/mass-explorer.js";
import {massMapHtml} from "../src/learn/mass-map.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=async name=>JSON.parse(await readFile(resolve(root,name),"utf8"));
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sourceNames=[
 "data/presentation/guide-registry.v1.json",
 "data/presentation/reader-text-sung.v1.json",
 "data/presentation/reader-french-ordinary.v1.json",
 "data/learn/mass-formation-campion.v1.json",
 "data/learn/research/mass-formation-canon-deep-exemplar-20261016.v1.json",
 "data/learn/research/mass-formation-canon-two-major-prayers-deep-20261016.v1.json",
 "data/learn/research/mass-formation-canon-p0-evidence-bridge-20261016.v1.json",
 "data/learn/research/mass-formation-canon-quam-supra-32-claim-triage-20261016.v1.json",
 "data/learn/research/mass-formation-lebrun-1843-source-collation-20261016.v1.json",
 "data/learn/research/mass-formation-lebrun-epiclesis-tome-iii-20261016.v1.json"
];
const [guides,sung,french,formation,deep,major,evidence,triage,lebrun,volumeIII]=await Promise.all(sourceNames.map(read));
const catalog=buildMassExplorerCatalog(guides,sung,french,formation);
const blocks=Array.from({length:15},(_,i)=>"AO.SM.B"+String(i+47).padStart(3,"0"));
assert.deepEqual(deep.studies.flatMap(x=>x.block_ids),blocks);
assert.equal(catalog.sequence.length,32);
assert.equal(catalog.byBlock.size,96);
assert.equal(catalog.crosswalkStatus,"P0_PENDING");
assert.equal(deep.status,"EDITORIAL_DRAFT_NOT_RELEASED");
assert.equal(major.status,"EDITORIAL_DRAFT_NOT_RELEASED");
assert.equal(evidence.totals.approved_new_p0_publication,0);
assert.equal(evidence.totals.mapped_research_units,79);
assert.equal(evidence.totals.historical_author_candidates,88);
assert.equal(triage.claims.length,32);
assert.ok(triage.claims.every(x=>x.publication_allowed===false));
assert.equal(lebrun.census.publication_approved,0);
assert.equal(volumeIII.certification.normative_new_rubrics_authorized,false);
assert.equal(major.studies.reduce((sum,x)=>sum+x.chapters.length,0),16);
const byBlock=new Map(deep.studies.flatMap(study=>study.block_ids.map(id=>[id,study])));
const byTheme=new Map(major.studies.map(study=>[study.id,study]));
const phrase=(v,lang)=>String(v?.[lang]??"");
function researchHtml(blockId,lang){
 const study=byBlock.get(blockId);
 if(!study)return "";
 const advanced=byTheme.get(study.id);
 const fr=lang==="fr";
 let html='<section class="aoEditorialStudy" data-ao-mx-anchor="deep-study" data-ao-editorial-block="'+esc(blockId)+'" data-ao-editorial-study="'+esc(study.id)+'">'+
  '<small class="aoEditorialBadge">'+(fr?"FORMATION · ÉBAUCHE NON PUBLIÉE":"FORMATION · UNPUBLISHED EDITORIAL DRAFT")+'</small>'+
  '<h2>'+esc(phrase(study.title,lang))+'</h2>'+
  (study.block_ids.length>1?'<p class="aoEditorialHint">'+(fr?"Étude commune à plusieurs prières. Le texte latin ci-dessus reste celui de la prière sélectionnée.":"A theme shared by several prayers. The Latin text above remains the original selected prayer alone.")+'</p>':"")+
  '<p class="aoEditorialQuestion">'+esc(phrase(study.question,lang))+'</p>'+
  '<h3>'+(fr?"En bref":"At a glance")+'</h3><p>'+esc(phrase(study.overview,lang))+'</p>'+
  '<h3>'+(fr?"Comprendre":"Understand")+'</h3><p>'+esc(phrase(study.deep,lang))+'</p>';
 if(advanced){
  html+='<h3>'+(fr?"Étude approfondie":"In-depth study")+'</h3><p>'+esc(phrase(advanced.intro,lang))+'</p>';
  html+=advanced.chapters.map((chapter,index)=>
    '<details class="aoEditorialChapter" data-ao-editorial-chapter="'+(index+1)+'"><summary>'+esc(phrase(chapter.heading,lang))+'</summary>'+
     chapter.paragraphs.map(p=>'<p>'+esc(phrase(p,lang))+'</p>').join("")+
     (chapter.glosses?.length?'<dl>'+chapter.glosses.map(g=>'<div class="aoEditorialGloss"><dt lang="la">'+esc(g.latin)+'</dt><dd>'+esc(g[lang])+'</dd></div>').join("")+'</dl>':"")+
     '</details>').join("");
  html+='<details class="aoEditorialSources"><summary>'+(fr?"Sources et vérification éditoriale":"Historical sources and verification")+'</summary>'+
   '<p class="aoEditorialHint">'+(fr?"Interprétations encore retenues pour examen ; aucune citation P0 supplémentaire n’est autorisée.":"Historical interpretations under review; no additional P0 source claim is approved.")+'</p><ul>'+
   advanced.direct_primary_sources.map(src=>'<li><a href="'+esc(src.url)+'" target="_blank" rel="noopener noreferrer">'+esc(src.author+" · "+src.locus)+'</a><small>'+esc(src.assessment)+'</small></li>').join("")+'</ul></details>';
 }
 html+='<details class="aoEditorialChapter"><summary>'+(fr?"Dans la Messe":"Within the Mass")+'</summary><p>'+
  esc(phrase(study.liturgical_note,lang))+'</p></details>'+
  '<p class="aoEditorialHint">'+(fr?"Aucun changement au Missel, aux rubriques, au lecteur rituel ou aux liens bibliques publiés.":"No change to Missal, rubrics, ritual reader or approved Scripture relationships.")+'</p></section>';
 return html;
}
function momentHtml(key,blockId,lang){
 let html=massExplorerMomentHtml(catalog,key,{blockId,french:lang==="fr"});
 const chosen=blockId||catalog.byKey.get(key)?.blocks.find(b=>!b.Proper_Slot)?.Block_ID;
 const extra=chosen?researchHtml(chosen,lang):"";
 if(extra){
  const marker='<details id="ao-mx-guide"';
  assert(html.includes(marker),"Published Mass Explorer Guide owner changed");
  html=html.replace(marker,extra+marker);
  const navEnd=html.indexOf("</nav>");
  assert(navEnd>0);
  html=html.slice(0,navEnd)+'<button type="button" data-ao-mx-jump="deep-study">'+(lang==="fr"?"Étude approfondie":"Deeper study")+'</button>'+html.slice(navEnd);
 }
 return html;
}
const pages={},owners={};
for(const [id,owner] of catalog.byBlock)owners[id]=owner.key;
for(const lang of ["en","fr"]){
 const fr=lang==="fr",moments={};
 for(const key of catalog.sequence){
  const blocks=catalog.byKey.get(key).blocks;
  moments[key]={default:momentHtml(key,null,lang),blocks:{}};
  for(const block of blocks)moments[key].blocks[block.Block_ID]=momentHtml(key,block.Block_ID,lang);
 }
 pages[lang]={map:massMapHtml(catalog,{french:fr}),list:massExplorerIndexHtml(catalog,{french:fr}),moments};
}
const css=[
"html,body{height:100%;margin:0;background:#080c12;color:#eee8de}",
"#ao-mass-explorer-root{inset:0!important;z-index:1!important}",
".aoEditorialNotice{background:#1a2028;color:#d1b884;border-bottom:1px solid #5c4b30;padding:10px 14px;font:600 .72rem/1.5 system-ui}",
".aoEditorialToolbar{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;padding:9px 12px;border-bottom:1px solid #39424c}",
".aoEditorialToolbar button,.aoEditorialJump{min-height:44px;padding:9px 12px;border:1px solid #47515c;border-radius:8px;color:#eee4d3;background:#17212b;font:.78rem system-ui;cursor:pointer}",
".aoEditorialToolbar [aria-pressed=true]{border-color:#cdb482;color:#cdb482}",
".aoEditorialStudy{border:1px solid #5c4b30;border-radius:12px;background:#111a24;margin:20px 0;padding:17px;scroll-margin-top:95px}",
".aoEditorialStudy h2{font:500 clamp(1.45rem,3vw,1.95rem)/1.28 Georgia,serif}",
".aoEditorialStudy h3{font:600 .77rem/1.4 system-ui;color:#cdb482;text-transform:uppercase;margin:24px 0 9px}",
".aoEditorialStudy p{line-height:1.65;overflow-wrap:anywhere}",
".aoEditorialBadge{color:#cdb482;font:600 .69rem/1.35 system-ui;letter-spacing:.08em}",
".aoEditorialQuestion{font-style:italic;color:#d6cbb9;font-size:1.08rem}",
".aoEditorialHint{font:.76rem/1.5 system-ui;color:#aeb4ba}",
".aoEditorialChapter{margin:8px 0;border-top:1px solid #38434e;padding:6px 0}",
".aoEditorialChapter summary,.aoEditorialSources summary{min-height:44px;cursor:pointer;color:#cdb482;padding:10px 0}",
".aoEditorialSources{margin:19px 0;border-top:1px solid #38434e}",
".aoEditorialSources li{margin:11px 0;font:.82rem/1.45 system-ui;overflow-wrap:anywhere}",
".aoEditorialSources li a{color:#cdb482}.aoEditorialSources small{display:block;color:#aeb4ba}",
".aoEditorialGloss{border-left:2px solid #cdb482;background:#18232f;padding:10px;margin:10px 0}",
".aoEditorialGloss dt{color:#cdb482}.aoEditorialGloss dd{margin:5px 0}",
"#ao-mass-explorer-root :is(button,summary,a):focus-visible{outline:2px solid #cdb482;outline-offset:3px}",
"@media(max-width:430px){.aoEditorialStudy{padding:12px}.aoEditorialToolbar{padding:8px 6px}}"
].join("\n");
const client=[
"const pages=JSON.parse(document.getElementById('ao-review-data').textContent);",
"const owners=JSON.parse(document.getElementById('ao-review-owners').textContent);",
"const sequence=JSON.parse(document.getElementById('ao-review-sequence').textContent);",
"const root=document.getElementById('ao-mass-explorer-root');",
"let lang='en',view='map',moment=null,block=null;",
"function show(){",
" const fr=lang==='fr',data=pages[lang];",
" const content=moment?(data.moments[moment].blocks[block]||data.moments[moment].default):data[view];",
" root.innerHTML='<p class=\"aoEditorialNotice\">'+(fr?'APERÇU ÉDITORIAL NON PUBLIÉ — Messe de 1962':'UNPUBLISHED EDITORIAL PREVIEW — 1962 Sung Mass')+'</p>'+",
" '<header class=\"aoMXTop\"><button type=\"button\" data-ao-mx-index aria-label=\"Back\">←</button><div><small>FORMATION</small><strong>Mass Explorer · P2</strong></div><button type=\"button\" data-review-canon>Canon</button></header>'+",
" '<nav class=\"aoEditorialToolbar\"><button type=\"button\" data-review-view=\"map\" aria-pressed=\"'+(!moment&&view==='map')+'\">'+(fr?'Carte':'Map')+'</button>'+",
" '<button type=\"button\" data-review-view=\"list\" aria-pressed=\"'+(!moment&&view==='list')+'\">'+(fr?'Index':'List')+'</button>'+",
" '<button type=\"button\" data-review-lang=\"en\" aria-pressed=\"'+(!fr)+'\">English</button>'+",
" '<button type=\"button\" data-review-lang=\"fr\" aria-pressed=\"'+fr+'\">Français</button></nav>'+content;",
" root.scrollTop=0;",
"}",
"function openMoment(key,id=null){if(!pages[lang].moments[key])return;moment=key;block=id;show()}",
"root.addEventListener('click',event=>{",
"const t=event.target.closest('button');if(!t)return;",
"if(t.dataset.reviewLang){lang=t.dataset.reviewLang;document.documentElement.lang=lang;show();return}",
"if(t.dataset.reviewView){view=t.dataset.reviewView;moment=null;block=null;show();return}",
"if(t.hasAttribute('data-review-canon')){openMoment(owners['AO.SM.B047'],'AO.SM.B047');return}",
"if(t.hasAttribute('data-ao-mx-index')){moment=null;block=null;show();return}",
"if(t.dataset.aoMxMapBlock){const id=t.dataset.aoMxMapBlock;if(owners[id])openMoment(owners[id],id);return}",
"if(t.dataset.aoMxMoment){openMoment(t.dataset.aoMxMoment);return}",
"if(t.dataset.aoMxBlock){openMoment(moment,t.dataset.aoMxBlock);return}",
"if(t.hasAttribute('data-ao-mx-prev')){const i=sequence.indexOf(moment);if(i>0)openMoment(sequence[i-1]);return}",
"if(t.hasAttribute('data-ao-mx-next')){const i=sequence.indexOf(moment);if(i>=0&&i<sequence.length-1)openMoment(sequence[i+1]);return}",
"if(t.dataset.aoMxView){view=t.dataset.aoMxView;moment=null;block=null;show();return}",
"if(t.dataset.aoMxPhase!==undefined){root.querySelector('[data-ao-mx-phase-section=\"'+t.dataset.aoMxPhase+'\"]').scrollIntoView({behavior:'instant',block:'start'});return}",
"if(t.dataset.aoMxJump){const el=root.querySelector('[data-ao-mx-anchor=\"'+t.dataset.aoMxJump+'\"]');if(el){if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({behavior:'instant',block:'start'})}return}",
"});",
"show();"
].join("\n");
const json=s=>JSON.stringify(s).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028");
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'+
 '<title>Ad Orientem — Mass Explorer editorial bridge</title><style>'+massExplorerCss()+css+'</style></head><body>'+
 '<div id="ao-mass-explorer-root"></div><script type="application/json" id="ao-review-data">'+json(pages)+'</script>'+
 '<script type="application/json" id="ao-review-owners">'+json(owners)+'</script>'+
 '<script type="application/json" id="ao-review-sequence">'+json(catalog.sequence)+'</script>'+
 '<script>'+client+'</script></body></html>';
assert.equal(blocks.length,15);
assert.equal(deep.studies.length,8);
assert.equal(major.studies.length,2);
for(const lg of ["en","fr"])for(const id of blocks){
 const owner=owners[id];assert(pages[lg].moments[owner].blocks[id].includes('data-ao-editorial-block="'+id+'"'));
}
const folder=resolve(root,"artifacts/p2-mass-explorer-bridge");
await mkdir(folder,{recursive:true});
const path=resolve(folder,"index.html");
await writeFile(path,html,"utf8");
console.log("PASS Mass Explorer editorial bridge: 32 Guide moments, 96 Sung blocks, 15 attached Canon drafts, 16 advanced chapters, zero new release approvals; bytes "+html.length+" -> "+path);
