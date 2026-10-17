#!/usr/bin/env node
/** Standalone comprehensive Roman Canon editorial review, not a public app import. */
import assert from "node:assert/strict";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildMassExplorerCatalog,massExplorerMomentHtml,massExplorerCss} from "../src/learn/mass-explorer.js";
import {approvedMassExplorerStudies} from "../src/learn/mass-explorer-study-publication.js";
import {canonStudyDigest} from "./mass-explorer-canon-decision-core.mjs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=async name=>JSON.parse(await readFile(resolve(root,name),"utf8"));
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sources=[
 "data/learn/research/mass-explorer-first-two-release-candidates-20261016.v1.json",
 "data/learn/research/mass-explorer-remaining-six-release-candidates-20261016.v1.json",
 "data/learn/mass-explorer-approved-studies.v1.json",
 "data/presentation/guide-registry.v1.json",
 "data/presentation/reader-text-sung.v1.json",
 "data/presentation/reader-french-ordinary.v1.json",
 "data/learn/mass-formation-campion.v1.json"
];
const [a,b,manifest,guides,sung,french,formation]=await Promise.all(sources.map(read));
assert.equal(a.status,"EDITORIAL_CANDIDATES_NOT_HUMAN_APPROVED");
assert.equal(b.status,"EDITORIAL_CANDIDATES_NOT_HUMAN_APPROVED");
const draft=[...a.studies,...b.studies].sort((x,y)=>x.id.localeCompare(y.id));
assert.equal(draft.length,8);
assert.equal(draft.reduce((n,x)=>n+x.sections.length,0),34);
const catalog=buildMassExplorerCatalog(guides,sung,french,formation,manifest);
assert.equal(catalog.approvedStudyByBlock.size,0);
assert.equal(approvedMassExplorerStudies(manifest,catalog,formation).size,0);
const blocks=draft.flatMap(x=>x.block_ids);
assert.deepEqual([...blocks].sort(),Array.from({length:15},(_,i)=>"AO.SM.B"+String(47+i).padStart(3,"0")));
const idToStudy=new Map(draft.flatMap(x=>x.block_ids.map(id=>[id,x])));
function noteHtml(study,blockId,lang){
 const fr=lang==="fr",local=x=>esc(x?.[lang]);
 const stage=formation.stages.find(s=>s.id===study.stage_id);
 assert.ok(stage);
 const claimRows=study.claim_ids.map(id=>{
  const claim=stage.claims.find(x=>x.id===id);
  assert.ok(claim,id+" not published");
  return '<li><code>'+esc(id)+'</code> · '+local(claim.text)+'</li>';
 }).join("");
 return '<section class="aoCanonCandidate" data-ao-candidate-block="'+esc(blockId)+'" data-ao-candidate-study="'+esc(study.id)+'">'+
  '<small>'+(fr?"FORMATION · TEXTE PROPOSÉ NON APPROUVÉ":"FORMATION · UNAPPROVED RELEASE CANDIDATE")+'</small>'+
  '<h2>'+local(study.title)+'</h2>'+
  (study.block_ids.length>1?'<p class="aoCanonMeta">'+(fr?
    "Étude commune à plusieurs prières ; le texte original affiché correspond à la prière sélectionnée.":
    "Shared study covering several prayers; the original text above is for the selected prayer only.")+'</p>':"")+
  '<p class="aoCanonLead">'+local(study.lead)+'</p>'+
  study.sections.map((s,i)=>
   '<details class="aoCanonSection" data-ao-candidate-section="'+(i+1)+'"'+(i===0?' open':'')+'>'+
    '<summary>'+local(s.heading)+'</summary><p>'+local(s.body)+'</p>'+
    '<small class="aoCanonClaim">'+esc((fr?"Affirmations publiées : ":"Published claims: ")+s.claim_ids.join(", "))+'</small>'+
   '</details>').join("")+
  '<details class="aoCanonEvidence"><summary>'+(fr?"Correspondance avec les leçons existantes":"Published Formation claim references")+
   '</summary><ol>'+claimRows+'</ol></details>'+
  '<p class="aoCanonHeld">'+(fr?
   "Proposition de contenu originale, sans approbation éditoriale ni contrôle formel des droits. Aucun nouveau rite ou commentaire historique controversé n’est publié.":
   "Original content candidate; editorial and formal rights review not yet recorded. No new ritual or contested historical interpretation has been published.")+'</p></section>';
}
const pages={};
for(const lang of ["en","fr"]){
 pages[lang]={};
 for(const id of blocks){
  const owner=catalog.byBlock.get(id);assert.ok(owner,id);
  const study=idToStudy.get(id);
  const raw=massExplorerMomentHtml(catalog,owner.key,{blockId:id,french:lang==="fr"});
  const anchor='<details id="ao-mx-guide"';
  assert.ok(raw.includes(anchor));
  pages[lang][id]=raw.replace(anchor,noteHtml(study,id,lang)+anchor);
 }
}
const owners=Object.fromEntries(draft.flatMap(x=>x.block_ids.map(id=>[id,x.id])));
const studies=draft.map(x=>({id:x.id,block_ids:x.block_ids,content_sha256:canonStudyDigest(x)}));
const labels=Object.fromEntries(draft.map(x=>[x.block_ids[0],x.title]));
const nav=draft.map(x=>x.block_ids[0]);
const css=[
 "html,body{margin:0;height:100%;background:#080c12;color:#eee9df}",
 "#ao-mass-explorer-root{inset:0!important}",
 ".aoCanonToolbar{position:sticky;top:0;z-index:15;background:#101923;border-bottom:1px solid #4b4539;padding:8px 10px;display:flex;gap:8px;align-items:center}",
 ".aoCanonToolbar select{flex:1;min-width:0;min-height:46px;border:1px solid #6a583d;border-radius:9px;background:#182431;color:#eee8da;padding:7px;font:.79rem system-ui}",
 ".aoCanonToolbar button{min-height:44px;padding:8px 10px;border:1px solid #495460;border-radius:8px;background:#182431;color:#ddd5ca;font:.73rem system-ui}",
 ".aoCanonToolbar button[aria-pressed=true]{border-color:#cbb282;color:#cbb282}",
 ".aoCanonCandidate{margin:20px 0;border:1px solid #635139;border-radius:12px;background:#111b27;padding:17px}",
 ".aoCanonCandidate>small{font:600 .7rem/1.5 system-ui;color:#cdb07c;letter-spacing:.07em}",
 ".aoCanonCandidate h2{font:500 clamp(1.5rem,5vw,2rem)/1.3 Georgia,serif}",
 ".aoCanonCandidate p{line-height:1.64;overflow-wrap:anywhere}",
 ".aoCanonLead{font-size:1.08rem;color:#e8dbc8}",
 ".aoCanonMeta{font:.79rem/1.5 system-ui!important;color:#aab1b9}",
 ".aoCanonSection{border-top:1px solid #3f4751;margin:9px 0;padding:8px 0}",
 ".aoCanonSection summary,.aoCanonEvidence summary{min-height:42px;cursor:pointer;color:#d0b888;padding:9px 0}",
 ".aoCanonClaim{font:.68rem/1.45 system-ui;color:#b0bac1}",
 ".aoCanonEvidence{margin-top:18px;border-top:1px solid #3f4751}",
 ".aoCanonEvidence li{font:.82rem/1.5 system-ui;margin:9px 0}",
 ".aoCanonHeld{border-left:2px solid #a28a58;padding:9px 12px;font:.78rem/1.54 system-ui!important;color:#d1ba8a}",
 ".aoCanonReview{background:#17222d;border-bottom:1px solid #514734;padding:13px 18px;display:grid;gap:8px;font:.8rem/1.5 system-ui}",
 ".aoCanonReviewTop{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}",
 ".aoCanonReviewTop span{color:#cbb386}",
 ".aoCanonReviewActions{display:flex;flex-wrap:wrap;gap:8px}",
 ".aoCanonReview button{min-height:44px;border:1px solid #565e65;border-radius:8px;color:#eee5d7;background:#111b27;padding:9px 12px;font:.78rem system-ui}",
 ".aoCanonReview button[aria-pressed=true]{border-color:#d4b783;color:#d4b783}",
 ".aoCanonReview label{display:grid;gap:5px}",
 ".aoCanonReview textarea,.aoCanonReview input{width:100%;box-sizing:border-box;background:#0c141d;border:1px solid #46515b;border-radius:8px;color:#eee8de;padding:10px;font:inherit}",
 ".aoCanonReview p{font:.72rem/1.4 system-ui;color:#a6b0b8;margin:0}",
 "@media(max-width:430px){.aoCanonCandidate{padding:12px}.aoCanonToolbar{gap:5px;padding:6px}.aoCanonToolbar button{padding:8px}}"
].join("\n");
const js="const pages=JSON.parse(document.getElementById('ao-canon-data').textContent);\nconst nav=JSON.parse(document.getElementById('ao-canon-nav').textContent);\nconst labels=JSON.parse(document.getElementById('ao-canon-labels').textContent);\nconst owners=JSON.parse(document.getElementById('ao-canon-owners').textContent);\nconst studies=JSON.parse(document.getElementById('ao-canon-studies').textContent);\nlet lang='en',block=nav[0],reviewer='',statusMessage='';\nconst decisions={};\nconst root=document.getElementById('ao-mass-explorer-root');\nconst escReview=value=>String(value??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\nconst byStudy=new Map(studies.map(s=>[s.id,s]));\nconst savedKey='ao-canon-review-draft-sha256-'+studies.map(s=>s.content_sha256).join('.');\nfunction exported(){\n return {schema:'ao-mass-explorer-canon-owner-decisions-v1',\n  scope:'EDITORIAL_WORDING_ONLY_NOT_PUBLICATION',reviewer:reviewer||null,\n  decisions:studies.map(s=>{\n   const d=decisions[s.id]||{decision:'pending',note:''};\n   return {study_id:s.id,block_ids:s.block_ids,content_sha256:s.content_sha256,\n    decision:d.decision,note:d.note||''};\n  }),human_review_required:true,formal_rights_check_outstanding:true};\n}\nfunction validate(data){\n if(!data||data.schema!=='ao-mass-explorer-canon-owner-decisions-v1'||\n  data.scope!=='EDITORIAL_WORDING_ONLY_NOT_PUBLICATION'||\n  data.human_review_required!==true||data.formal_rights_check_outstanding!==true||\n  !Array.isArray(data.decisions)||data.decisions.length!==studies.length)\n   throw Error('Wrong review export format or missing study decisions');\n const name=data.reviewer;\n if(name!==null&&name!==undefined&&\n  (typeof name!=='string'||name.trim()!==name||name.length<3||name.length>120))\n   throw Error('Reviewer name must contain 3–120 characters');\n const imported={},seen=new Set();\n for(const row of data.decisions){\n  const target=byStudy.get(row?.study_id);\n  if(!target||seen.has(row.study_id))throw Error('Unknown or repeated study ID');\n  seen.add(row.study_id);\n  if(!Array.isArray(row.block_ids)||row.block_ids.join('|')!==target.block_ids.join('|'))\n   throw Error('Canonical Mass block mismatch for '+row.study_id);\n  if(row.content_sha256!==target.content_sha256)\n   throw Error('This study changed after the exported review: '+row.study_id);\n  if(!['approve','revise','pending'].includes(row.decision))\n   throw Error('Unrecognized review decision for '+row.study_id);\n  if(typeof row.note!=='string'||row.note.length>4000)\n   throw Error('Invalid reviewer note for '+row.study_id);\n  imported[row.study_id]={decision:row.decision,note:row.note};\n }\n return {reviewer:name||'',decisions:imported};\n}\nfunction persist(){\n try{localStorage.setItem(savedKey,JSON.stringify(exported()))}catch{}\n}\nfunction restore(){\n try{\n  const raw=localStorage.getItem(savedKey);\n  if(!raw)return;\n  const draft=validate(JSON.parse(raw));\n  reviewer=draft.reviewer;\n  Object.assign(decisions,draft.decisions);\n }catch{}\n}\nfunction render(){\n const fr=lang==='fr',id=owners[block],current=decisions[id]||{decision:'pending',note:''};\n const approved=studies.filter(s=>decisions[s.id]?.decision==='approve').length;\n const changes=studies.filter(s=>decisions[s.id]?.decision==='revise').length;\n const pending=studies.length-approved-changes;\n const reviewerWarning=approved&&!reviewer?(fr?' · nom du relecteur manquant':' · reviewer name missing'):'';\n root.innerHTML='<nav class=\"aoCanonToolbar\">'+\n  '<select aria-label=\"Roman Canon study\" data-canon-select>'+nav.map(key=>{\n    const d=decisions[owners[key]]?.decision;\n    const marker=d==='approve'?'✓ ':d==='revise'?'✎ ':'○ ';\n    return '<option value=\"'+key+'\" '+(key===block?'selected':'')+'>'+marker+escReview(labels[key][lang])+'</option>';\n  }).join('')+'</select>'+\n  '<button data-canon-lang=\"en\" aria-pressed=\"'+(!fr)+'\">EN</button>'+\n  '<button data-canon-lang=\"fr\" aria-pressed=\"'+fr+'\">FR</button></nav>'+\n  '<section class=\"aoCanonReview\" aria-label=\"Editorial review\">'+\n  '<div class=\"aoCanonReviewTop\"><strong>'+(fr?'Décision sur le texte':'Decision on wording')+'</strong>'+\n  '<span data-canon-progress>'+approved+'/8 '+(fr?'acceptées':'accepted')+' · '+changes+\n  ' '+(fr?'à corriger':'to revise')+' · '+pending+' '+(fr?'en attente':'pending')+\n  escReview(reviewerWarning)+'</span></div>'+\n  '<div class=\"aoCanonReviewActions\">'+\n  '<button type=\"button\" data-canon-decision=\"approve\" aria-pressed=\"'+(current.decision==='approve')+'\">'+\n  (fr?'Accepter le texte':'Accept wording')+'</button>'+\n  '<button type=\"button\" data-canon-decision=\"revise\" aria-pressed=\"'+(current.decision==='revise')+'\">'+\n  (fr?'Modifications requises':'Request changes')+'</button>'+\n  '<button type=\"button\" data-canon-next>'+(fr?'Étude suivante en attente':'Next pending study')+'</button></div>'+\n  '<label>'+(fr?'Commentaires (facultatif)':'Reviewer notes (optional)')+\n  '<textarea data-canon-note maxlength=\"4000\" rows=\"2\" placeholder=\"'+\n  (fr?'Modifications ou observations':'Edits or reservations')+'\"></textarea></label>'+\n  '<label>'+(fr?'Nom du relecteur':'Reviewer name')+\n  '<input data-canon-reviewer maxlength=\"120\" placeholder=\"'+\n  (fr?'Nom à indiquer avant la validation':'Enter before wording sign-off')+'\"></label>'+\n  '<div class=\"aoCanonReviewActions\"><button type=\"button\" data-canon-export>'+\n  (fr?'Exporter les décisions (.json)':'Export decisions (.json)')+'</button>'+\n  '<button type=\"button\" data-canon-choose-file>'+\n  (fr?'Reprendre depuis un fichier (.json)':'Import earlier decisions (.json)')+'</button>'+\n  '<input data-canon-import type=\"file\" accept=\".json,application/json\" aria-label=\"Import review decisions\" hidden></div>'+\n  '<p>'+(fr?'Les décisions restent locales. Aucun envoi, approbation des droits ni publication automatique.':\n   'Decisions stay local. There is no automatic upload, rights approval or publication.')+'</p>'+\n  (statusMessage?'<p role=\"status\" data-canon-import-status>'+escReview(statusMessage)+'</p>':'')+\n  '</section>'+pages[lang][block];\n root.querySelector('[data-canon-note]').value=current.note||'';\n root.querySelector('[data-canon-reviewer]').value=reviewer;\n root.scrollTop=0;\n}\nfunction exportDecisions(){\n const payload=exported();\n const blob=new Blob([JSON.stringify(payload,null,2)+'\\n'],{type:'application/json'});\n const url=URL.createObjectURL(blob),link=document.createElement('a');\n link.href=url;link.download='ad-orientem-roman-canon-review-decisions.json';\n document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);\n}\nroot.addEventListener('input',event=>{\n if(event.target.matches('[data-canon-note]')){\n  const id=owners[block],value=event.target.value;\n  decisions[id]={...decisions[id],decision:decisions[id]?.decision||'pending',note:value};\n  persist();\n }else if(event.target.matches('[data-canon-reviewer]')){\n  reviewer=event.target.value;\n  persist();\n }\n});\nroot.addEventListener('change',async event=>{\n const target=event.target;\n if(target.matches('[data-canon-select]')){block=target.value;render();return}\n if(target.matches('[data-canon-import]')){\n  const file=target.files?.[0];if(!file)return;\n  try{\n   if(file.size>512000)throw Error('Review file is too large');\n   const imported=validate(JSON.parse(await file.text()));\n   for(const key of Object.keys(decisions))delete decisions[key];\n   Object.assign(decisions,imported.decisions);\n   reviewer=imported.reviewer;\n   persist();\n   statusMessage=lang==='fr'?'Décisions restaurées : huit identifiants vérifiés.':\n                            'Decisions restored: all eight study identities verified.';\n  }catch(error){\n   statusMessage=(lang==='fr'?'Import refusé : ':'Import refused: ')+error.message;\n  }\n  render();\n }\n});\nroot.addEventListener('click',event=>{\n const t=event.target.closest('button');if(!t)return;\n if(t.dataset.canonLang){lang=t.dataset.canonLang;document.documentElement.lang=lang;render();return}\n if(t.dataset.aoMxBlock&&pages[lang][t.dataset.aoMxBlock]){block=t.dataset.aoMxBlock;render();return}\n if(t.dataset.canonDecision){\n  const id=owners[block],prev=decisions[id]||{note:''};\n  decisions[id]={decision:prev.decision===t.dataset.canonDecision?'pending':t.dataset.canonDecision,note:prev.note||''};\n  statusMessage='';\n  persist();render();return;\n }\n if(t.hasAttribute('data-canon-next')){\n  const ix=studies.findIndex(s=>s.id===owners[block]);\n  const next=[...studies.slice(ix+1),...studies.slice(0,ix+1)].find(s=>!decisions[s.id]||decisions[s.id].decision==='pending');\n  if(next){block=next.block_ids[0];render()}else{\n   statusMessage=lang==='fr'?'Aucune étude en attente.':'No remaining pending studies.';\n   render();\n  }return;\n }\n if(t.hasAttribute('data-canon-export')){exportDecisions();return}\n if(t.hasAttribute('data-canon-choose-file')){root.querySelector('[data-canon-import]').click();return}\n if(t.dataset.aoMxJump){\n  const x=root.querySelector('[data-ao-mx-anchor=\"'+t.dataset.aoMxJump+'\"]');\n  if(x){if(x.tagName==='DETAILS')x.open=true;x.scrollIntoView({block:'start',behavior:'instant'})}\n }\n});\nrestore();render();";
const json=obj=>JSON.stringify(obj).replace(/</g,"\\u003c");
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>Ad Orientem · Roman Canon eight editorial studies</title><style>'+massExplorerCss()+css+'</style></head><body>'+
 '<main id="ao-mass-explorer-root"></main><script type="application/json" id="ao-canon-data">'+json(pages)+'</script>'+
 '<script type="application/json" id="ao-canon-nav">'+json(nav)+'</script>'+
 '<script type="application/json" id="ao-canon-labels">'+json(labels)+'</script>'+
 '<script type="application/json" id="ao-canon-owners">'+json(owners)+'</script>'+
 '<script type="application/json" id="ao-canon-studies">'+json(studies)+'</script>'+
 '<script>'+js+'</script></body></html>';
for(const lang of ["en","fr"])for(const id of blocks){
 assert.ok(pages[lang][id].includes('data-ao-candidate-block="'+id+'"'));
 assert.ok(pages[lang][id].includes('data-ao-mx-cue='));
}
const dest=resolve(root,"artifacts/p2-all-canon-candidates");
await mkdir(dest,{recursive:true});
await writeFile(resolve(dest,"index.html"),html);
console.log("PASS all eight Roman Canon editorial candidates, 15 canonical source blocks, 34 bilingual sections; no public release; bytes",html.length);
