#!/usr/bin/env node
// Self-contained editorial review — never imported by the published Mass reader.
import assert from "node:assert/strict";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildMassExplorerCatalog,massExplorerMomentHtml,massExplorerCss} from "../src/learn/mass-explorer.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=async name=>JSON.parse(await readFile(resolve(root,name),"utf8"));
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const [draft,manifest,guides,sung,french,formation]=await Promise.all([
 "data/learn/research/mass-explorer-first-two-release-candidates-20261016.v1.json",
 "data/learn/mass-explorer-approved-studies.v1.json",
 "data/presentation/guide-registry.v1.json",
 "data/presentation/reader-text-sung.v1.json",
 "data/presentation/reader-french-ordinary.v1.json",
 "data/learn/mass-formation-campion.v1.json"
].map(read));
assert.equal(draft.status,"EDITORIAL_CANDIDATES_NOT_HUMAN_APPROVED");
assert.equal(draft.certification.human_reviewed,false);
const catalog=buildMassExplorerCatalog(guides,sung,french,formation,manifest);
assert.equal(catalog.approvedStudyByBlock.size,0);
const local=(value,lang)=>esc(value?.[lang]);
function studyHtml(study,lang){
 const fr=lang==="fr",stage=formation.stages.find(x=>x.id===study.stage_id);
 assert.ok(stage);
 const claims=study.claim_ids.map(id=>{const x=stage.claims.find(c=>c.id===id);assert.ok(x);return '<li><code>'+esc(id)+'</code> · '+local(x.text,lang)+'</li>'}).join("");
 return '<section class="aoCandidate" data-ao-candidate-block="'+esc(study.block_ids[0])+'">'+
 '<small class="aoCandidateTag">'+(fr?"PROPOSITION ÉDITORIALE · NON PUBLIÉE":"EDITORIAL RELEASE CANDIDATE · NOT PUBLISHED")+'</small>'+
 '<h2>'+local(study.title,lang)+'</h2><p class="aoCandidateLead">'+local(study.lead,lang)+'</p>'+
 study.sections.map((section,i)=>'<details data-ao-candidate-section="'+(i+1)+'"'+(i===0?' open':'')+'>'+
 '<summary>'+local(section.heading,lang)+'</summary><p>'+local(section.body,lang)+'</p>'+
 '<small class="aoCandidateClaim">'+esc((fr?"Affirmation(s) P1 : ":"P1 claim(s): ")+section.claim_ids.join(", "))+'</small></details>').join("")+
 '<details class="aoCandidateEvidence"><summary>'+(fr?"Appui doctrinal déjà publié":"Existing published doctrinal support")+'</summary><ol>'+claims+'</ol></details>'+
 '<p class="aoCandidateHeld">'+(fr?"Relecture éditoriale et vérification des droits en attente. Aucun extrait d’auteur contesté n’est inclus.":"Editorial and rights sign-off pending. No disputed historical-author excerpt is included.")+'</p></section>';
}
const pages={};
for(const lang of ["en","fr"]){
 pages[lang]={};
 for(const study of draft.studies){
  const id=study.block_ids[0],owner=catalog.byBlock.get(id);
  assert.ok(owner);
  const raw=massExplorerMomentHtml(catalog,owner.key,{blockId:id,french:lang==="fr"});
  const marker='<details id="ao-mx-guide"';
  assert.ok(raw.includes(marker));
  pages[lang][id]=raw.replace(marker,studyHtml(study,lang)+marker);
 }
}
const css=[
"html,body{margin:0;background:#080c12;color:#eee9df;height:100%}",
"#ao-mass-explorer-root{inset:0!important}",
".aoCandidateToolbar{position:sticky;top:0;z-index:10;display:flex;flex-wrap:wrap;gap:7px;padding:10px;justify-content:center;background:#101a24;border-bottom:1px solid #51452f}",
".aoCandidateToolbar button{min-height:44px;padding:9px 12px;border:1px solid #43505a;border-radius:8px;background:#182430;color:#e5dfd5;font:.78rem system-ui;cursor:pointer}",
".aoCandidateToolbar button[aria-pressed=true]{border-color:#d0b484;color:#d0b484}",
".aoCandidate{border:1px solid #695634;border-radius:12px;background:#111b27;margin:22px 0;padding:17px}",
".aoCandidate h2{font:500 clamp(1.5rem,5vw,2rem)/1.24 Georgia,serif}",
".aoCandidate p{line-height:1.65;overflow-wrap:anywhere}",
".aoCandidateTag{font:600 .71rem/1.5 system-ui;color:#d3b580;letter-spacing:.08em}",
".aoCandidateLead{color:#e6dbc9;font-size:1.05rem}",
".aoCandidate details{border-top:1px solid #3b454e;padding:8px 0}",
".aoCandidate summary{cursor:pointer;color:#d0b484;min-height:42px;padding:9px 0}",
".aoCandidateClaim{font:.69rem/1.5 system-ui;color:#a9b1b7}",
".aoCandidateEvidence li{font:.83rem/1.58 system-ui;margin:9px 0}",
".aoCandidateHeld{border-left:2px solid #a58b5a;padding:8px 12px;color:#cbb37e;font:.79rem/1.55 system-ui}",
"@media(max-width:430px){.aoCandidate{padding:12px}.aoCandidateToolbar{padding:7px 4px}}"
].join("\n");
const js=[
 'const data=JSON.parse(document.getElementById("ao-candidate-pages").textContent);',
 'let lang="en",block="AO.SM.B051";const root=document.getElementById("ao-mass-explorer-root");',
 'function show(){const fr=lang==="fr";root.innerHTML=',
 '\'<nav class="aoCandidateToolbar"><button data-lang="en" aria-pressed="\'+(!fr)+\'">English</button>\'+',
 '\'<button data-lang="fr" aria-pressed="\'+fr+\'">Français</button>\'+',
 '\'<button data-block="AO.SM.B051" aria-pressed="\'+(block==="AO.SM.B051")+\'">Quam oblationem</button>\'+',
 '\'<button data-block="AO.SM.B055" aria-pressed="\'+(block==="AO.SM.B055")+\'">Supra quae</button></nav>\'+data[lang][block];',
 'root.scrollTop=0;}',
 'root.addEventListener("click",e=>{const button=e.target.closest("button");if(!button)return;',
 'if(button.dataset.lang){lang=button.dataset.lang;document.documentElement.lang=lang;show();return;}',
 'if(button.dataset.block&&data[lang][button.dataset.block]){block=button.dataset.block;show();return;}',
 'if(button.dataset.aoMxJump){const el=root.querySelector(\'[data-ao-mx-anchor="\'+button.dataset.aoMxJump+\'"]\');if(el){if(el.tagName==="DETAILS")el.open=true;el.scrollIntoView({block:"start",behavior:"instant"});}}',
 '});show();'
].join("\n");
const json=JSON.stringify(pages).replace(/</g,"\\u003c");
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mass Explorer — first two study approval candidates</title><style>'+
 massExplorerCss()+css+'</style></head><body><main id="ao-mass-explorer-root"></main>'+
 '<script type="application/json" id="ao-candidate-pages">'+json+'</script><script>'+js+'</script></body></html>';
for(const lang of ["en","fr"])for(const id of ["AO.SM.B051","AO.SM.B055"]){
 assert.equal((pages[lang][id].match(/data-ao-candidate-section=/g)||[]).length,5);
 assert.ok(pages[lang][id].includes('data-ao-mx-cue='));
 assert.ok(pages[lang][id].includes('data-ao-candidate-block="'+id+'"'));
}
const dir=resolve(root,"artifacts/p2-first-two-review");
await mkdir(dir,{recursive:true});
await writeFile(resolve(dir,"index.html"),html);
console.log("PASS first two reviewed-source ownership candidates; EN/FR, ten sections, zero release entries; "+html.length+" bytes");
