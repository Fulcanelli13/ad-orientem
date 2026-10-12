// Review-only evidence. No imported relationship becomes canonical from this component.
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const url=v=>typeof v==="string"&&/^https:\/\/[a-z0-9.-]+\//i.test(v)?v:null;
const arr=v=>Array.isArray(v)?v:[];
export const BIBLE_REVIEW_DEFAULT=Object.freeze({surface:"timeline",lineage:"genesis",root:"adam",depth:3,page:0,apostle:"mary"});
export function validateLineageReviewCorpus(data){
 const g=data?.genealogies??{};
 return data?.schema==="BIBLICAL_LINEAGE_DISPERSION_CURATED_V1"&&data?.status==="EDITORIAL_PILOT_CORRECTED_PENDING_REVIEW"
   &&arr(g.matthew?.nodes).length===41&&arr(g.luke?.nodes).length===76
   &&arr(g.genesis?.edges).length===90&&arr(data.profiles).length===20&&arr(data.events).length===55
   &&arr(data.guards).length>=10;
}
export function lineageSequence(data,key){
 if(!validateLineageReviewCorpus(data)||!["matthew","luke"].includes(key))return [];
 return arr(data.genealogies[key].nodes).map(n=>({id:n.id,person:n.person,reference:n.reference,
  url:url(n.url),kind:n.type,associatedWomen:arr(n.associatedWomen)}));
}
export function genesisGenerationRows(data,{root="adam",depth=3}={}){
 if(!validateLineageReviewCorpus(data))return [];
 const byParent=new Map();
 for(const e of data.genealogies.genesis.edges){
  if(!e.parentId||!e.childId||!e.reference||!url(e.url))continue;
  if(!byParent.has(e.parentId))byParent.set(e.parentId,[]);
  byParent.get(e.parentId).push(e);
 }
 const start=["adam","noah","abraham","jacob","joseph"].includes(root)?root:"adam";
 const max=Math.max(1,Math.min(6,Number(depth)||3)),result=[],queue=[{id:start,level:0}],visited=new Set([start]);
 while(queue.length&&result.length<=90){
  const item=queue.shift();if(item.level>=max)continue;
  for(const e of byParent.get(item.id)??[]){
   result.push({id:e.id,parentId:e.parentId,childId:e.childId,parent:e.parent,child:e.child,
    mother:e.mother||null,reference:e.reference,url:e.url,generation:item.level+1});
   if(!visited.has(e.childId)){visited.add(e.childId);queue.push({id:e.childId,level:item.level+1});}
  }
 }
 return result;
}
export function apostolicProfile(data,id){
 if(!validateLineageReviewCorpus(data))return null;
 const profile=data.profiles.find(p=>p.id===id)||data.profiles[0];
 return {profile,events:data.events.filter(e=>e.person===profile.id)
  .sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0))
  .map(e=>({...e,source:url(e.source),location:data.locations.find(l=>l.id===e.place)||null}))};
}
const BUTTON=(attr,k,active,label)=>'<button type="button" '+attr+'="'+esc(k)+'" aria-pressed="'+String(active)+'">'+esc(label)+'</button>';
export function renderLineageReview(data,{language="en",surface="genealogies",lineage="genesis",root="adam",depth=3,page=0,apostle="mary"}={}){
 const lang=language==="fr"?"fr":"en",review=validateLineageReviewCorpus(data);
 const tabs=[["timeline","Chronology","Chronologie"],["genealogies","Genealogies","Généalogies"],["apostles","Apostolic lives","Vies apostoliques"]]
  .map(([k,en,fr])=>BUTTON("data-bible-review-surface",k,k===surface,L(lang,en,fr))).join("");
 const head='<div class="aoBibleReviewTop"><button type="button" data-bible-atlas-close aria-label="'+esc(L(lang,"Back to Explore","Retour à Explorer"))+'">←</button>'+
 '<div><small>'+esc(L(lang,"EXPLORE · SCRIPTURE","EXPLORER · ÉCRITURE"))+'</small><h1>'+esc(L(lang,"Biblical Atlas","Atlas biblique"))+'</h1></div></div>'+
 '<nav class="aoBibleReviewTabs" aria-label="'+esc(L(lang,"Biblical Atlas views","Vues de l’Atlas biblique"))+'">'+tabs+'</nav>';
 const wrapper=body=>'<style>'+CSS+'</style><section class="aoFindSurface aoBibleReview" data-ao-find-owner="AO_FIND_APP_V1" data-ao-bible-review>'+head+'<div class="aoBibleReviewScroll">'+body+'</div></section>';
 if(!review)return wrapper('<p class="aoBibleReviewEmpty">'+esc(L(lang,"The reviewed genealogical evidence is unavailable. The 151-event chronology is unaffected.","Les données généalogiques ne sont pas disponibles. La chronologie de 151 étapes reste intacte."))+'</p>');
 const warning='<p class="aoBibleReviewNotice" role="note"><strong>'+esc(L(lang,"Research preview — not approved for publication.","Aperçu de recherche — publication non autorisée."))+'</strong> '+esc(L(lang,"Scripture, patristic witnesses and later traditions are classified separately. Location names do not certify GPS or historical routes.","Les Écritures, les témoignages patristiques et les traditions tardives sont distingués. Les lieux ne certifient aucune coordonnée ni route historique."))+'</p>';
 let body="";
 if(surface==="genealogies"){
  const key=["genesis","matthew","luke"].includes(lineage)?lineage:"genesis";
  body='<div class="aoBibleReviewChoices" role="group" aria-label="'+esc(L(lang,"Choose genealogy","Choisir une généalogie"))+'">'+
   [["genesis","Genesis","Genèse"],["matthew","Matthew 1","Matthieu 1"],["luke","Luke 3","Luc 3"]]
    .map(([k,en,fr])=>BUTTON("data-bible-review-lineage",k,k===key,L(lang,en,fr))).join("")+'</div>';
  if(key==="genesis"){
   const rows=genesisGenerationRows(data,{root,depth});
   body+='<h2>'+esc(L(lang,"Families of Genesis","Familles de la Genèse"))+'</h2><p>'+
   esc(L(lang,"90 source-referenced family links in the curated review set; the full 3,231-person index is not an approved family tree.","90 liens familiaux référencés dans la sélection ; l’index des 3 231 personnes n’est pas un arbre généalogique validé."))+'</p>'+
   '<div class="aoBibleReviewChoices" role="group" aria-label="'+esc(L(lang,"Choose family","Choisir une famille"))+'">'+
   [["adam","Adam","Adam"],["noah","Noah","Noé"],["abraham","Abraham","Abraham"],["jacob","Jacob","Jacob"],["joseph","Joseph","Joseph"]]
    .map(([k,en,fr])=>BUTTON("data-bible-review-root",k,k===root,L(lang,en,fr))).join("")+'</div>';
   body+='<div class="aoBibleReviewControls"><span>'+esc(L(lang,"Generations","Générations"))+': '+Number(depth||3)+'</span>'+
   '<button type="button" data-bible-review-depth="-1" '+(Number(depth)<=1?'disabled':'')+'>−</button>'+
   '<button type="button" data-bible-review-depth="1" '+(Number(depth)>=6?'disabled':'')+'>+</button></div>';
   body+='<ol class="aoBibleReviewList">'+rows.map(r=>'<li class="aoBibleReviewFamily" style="--generation:'+Math.min(r.generation,6)+'">'+
    '<small>'+esc(L(lang,"Generation","Génération"))+' '+r.generation+'</small><strong>'+esc(r.parent)+' → '+esc(r.child)+'</strong>'+
    (r.mother?'<small>'+esc(L(lang,"Mother","Mère"))+': '+esc(r.mother)+'</small>':"")+
    '<a href="'+esc(r.url)+'" rel="noopener noreferrer" target="_blank">'+esc(r.reference)+' ↗</a></li>').join("")+'</ol>';
   if(!rows.length)body+='<p class="aoBibleReviewEmpty">'+esc(L(lang,"No source-linked descendants at this depth.","Aucun descendant référencé à ce niveau."))+'</p>';
  }else{
   const seq=lineageSequence(data,key),pg=Math.max(0,Math.min(Math.ceil(seq.length/12)-1,Number(page)||0)),first=pg*12;
   body+='<h2>'+esc(key==="matthew"?L(lang,"St Matthew’s textual genealogy","Généalogie selon saint Matthieu"):L(lang,"St Luke’s textual genealogy","Généalogie selon saint Luc"))+'</h2>'+
   '<p>'+esc(L(lang,"Independent textual sequences, not one merged biological genealogy. Joseph is legal/putative father of Jesus, not His biological father.","Deux séquences textuelles distinctes, non fusionnées en une seule généalogie biologique. Joseph est père légal/putatif de Jésus, non son père biologique."))+'</p>'+
   '<div class="aoBibleReviewControls"><button type="button" data-bible-review-page="-1" '+(pg===0?'disabled':'')+'>'+esc(L(lang,"Previous","Précédent"))+'</button>'+
   '<span>'+(first+1)+'–'+Math.min(seq.length,first+12)+' / '+seq.length+'</span>'+
   '<button type="button" data-bible-review-page="1" '+(first+12>=seq.length?'disabled':'')+'>'+esc(L(lang,"Next","Suivant"))+'</button></div>'+
   '<ol class="aoBibleReviewList" start="'+(first+1)+'">'+seq.slice(first,first+12).map(n=>
    '<li><strong>'+esc(n.person)+'</strong>'+
    (n.kind==="legal-or-putative"?'<small>'+esc(L(lang,"Legal/putative — not biological","Légal/putatif — non biologique"))+'</small>':"")+
    (n.url?'<a href="'+esc(n.url)+'" rel="noopener noreferrer" target="_blank">'+esc(n.reference)+' ↗</a>':"")+
    n.associatedWomen.map(w=>'<small>'+esc(w.person)+' — '+esc(L(lang,w.note,w.fr||w.note))+'</small>').join("")+'</li>').join("")+'</ol>';
  }
 }else{
  const chosen=apostolicProfile(data,apostle);
  body='<h2>'+esc(L(lang,"Apostolic Dispersion","Dispersion apostolique"))+'</h2>'+
   '<p>'+esc(L(lang,"Source-linked witness records, never reconstructed ancient roads or automatic travel pins.","Témoignages sourcés, jamais des routes antiques reconstruites ni des repères inventés."))+'</p>'+
   '<div class="aoBibleReviewChoices aoBibleReviewPeople" role="group" aria-label="'+esc(L(lang,"Select person","Choisir une personne"))+'">'+
   data.profiles.map(p=>BUTTON("data-bible-review-apostle",p.id,chosen.profile.id===p.id,L(lang,p.name,p.fr))).join("")+'</div>'+
   '<h3>'+esc(L(lang,chosen.profile.name,chosen.profile.fr))+'</h3>';
  if(!chosen.events.length)body+='<p class="aoBibleReviewEmpty">'+esc(L(lang,"No verified itinerary; no route is inferred.","Aucun itinéraire vérifié ; aucun trajet n’est inféré."))+'</p>';
  else body+='<ol class="aoBibleReviewList">'+chosen.events.map(e=>{
   const kind=e.kind==="scripture"?L(lang,"Scripture","Écriture"):e.kind==="patristic"?L(lang,"Patristic testimony","Témoignage patristique"):e.kind==="later"?L(lang,"Later tradition","Tradition tardive"):e.kind==="identification"?L(lang,"Identification disputed","Identification discutée"):L(lang,"Research hold","Réserve de recherche");
   return '<li data-evidence-kind="'+esc(e.kind)+'"><small class="aoBibleReviewEvidence">'+esc(kind)+'</small><strong>'+esc(L(lang,e.title,e.fr))+'</strong>'+
    (e.location?.name?'<small>'+esc(e.location.name)+' · '+esc(e.location.kind)+'</small>':"")+
    (e.note?'<p>'+esc(e.note)+'</p>':"")+
    (e.source?'<a href="'+esc(e.source)+'" rel="noopener noreferrer" target="_blank">'+esc(e.reference||L(lang,"Original source","Source originale"))+' ↗</a>':"")+
    (e.kind==="scripture"&&/^[1-3]?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+/.test(e.reference||"")?'<button type="button" data-ao-scripture-context="'+esc(e.reference)+'">'+esc(L(lang,"Read Scripture","Lire les Écritures"))+'</button>':"")+'</li>';
  }).join("")+'</ol>';
 }
 return wrapper(warning+body);
}
const CSS=[
".aoBibleReview{height:100%;min-height:0;display:flex;flex-direction:column;background:#080c12;color:#ede4d2;font-family:Georgia,serif;overflow:hidden}",
".aoBibleReviewTop{display:flex;gap:12px;align-items:center;padding:12px 16px 9px;border-bottom:1px solid #c9ae7540;flex:none}",
".aoBibleReviewTop>div{flex:1}.aoBibleReviewTop small{font:600 10px system-ui;color:#b6a27d;letter-spacing:.1em}.aoBibleReviewTop h1{font:500 23px Georgia,serif;margin:3px 0}",
".aoBibleReviewTop button{min-width:44px;min-height:44px;border-radius:50%;border:1px solid #c9ae7577;background:#17202b;color:#e8d2a0;font-size:22px}",
".aoBibleReviewTabs{display:flex;gap:6px;flex:none;overflow-x:auto;padding:9px 12px;border-bottom:1px solid #c9ae7529}",
".aoBibleReviewTabs button,.aoBibleReviewChoices button,.aoBibleReviewControls button{min-height:44px;flex:none;border:1px solid #c9ae7546;border-radius:8px;padding:8px 12px;background:#17202b;color:#cfc5b2;font:600 12px system-ui;cursor:pointer}",
".aoBibleReviewTabs button[aria-pressed=true],.aoBibleReviewChoices button[aria-pressed=true]{background:#3d3326;border-color:#c9ae75;color:#f4e3b8}",
".aoBibleReview button:focus-visible{outline:2px solid #e6c47b;outline-offset:2px}.aoBibleReviewControls button:disabled{opacity:.35}",
".aoBibleReviewScroll{padding:14px clamp(14px,3vw,30px) 35px;overflow-y:auto;overscroll-behavior:contain;min-height:0;flex:1}",
".aoBibleReview h2{font:500 24px/1.2 Georgia,serif;margin:22px 0 8px}.aoBibleReview h3{font:500 20px Georgia,serif;margin:20px 0 10px}.aoBibleReview p{font:14px/1.55 Georgia,serif;color:#d1c5ae;max-width:750px}",
".aoBibleReviewNotice{border-left:2px solid #927a4d;padding:8px 11px;margin:0 0 15px!important;background:#14191e;color:#c4b8a4!important;font:12px/1.5 system-ui!important}",
".aoBibleReviewNotice strong{display:block;color:#ead3a3}.aoBibleReviewChoices{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.aoBibleReviewPeople{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr))}",
".aoBibleReviewPeople button{white-space:normal;text-align:left;max-width:100%;min-height:48px}.aoBibleReviewControls{display:flex;gap:9px;align-items:center;margin:15px 0;color:#baa983;font:12px system-ui}.aoBibleReviewControls span{flex:1}",
".aoBibleReviewList{display:grid;gap:8px;list-style:none;padding:0;margin:16px 0;max-width:830px}.aoBibleReviewList li{display:flex;flex-direction:column;gap:5px;padding:11px 12px;background:#111923;border:1px solid #d9c59a2a;border-radius:10px;min-width:0}",
".aoBibleReviewList strong{font:500 16px/1.25 Georgia,serif;color:#f0e3cf}.aoBibleReviewList small{font:11px/1.4 system-ui;color:#baa98d}.aoBibleReviewList a{font:12px/1.5 system-ui;color:#dec28a;width:max-content;max-width:100%;overflow-wrap:anywhere}",
".aoBibleReviewFamily{margin-left:calc(min(var(--generation),4)*5px)}.aoBibleReviewEvidence{font:600 10px system-ui;letter-spacing:.06em;text-transform:uppercase;color:#a99472}",
".aoBibleReviewList p{font:12px/1.5 system-ui;margin:2px 0;color:#bcb1a0}.aoBibleReviewList button{align-self:flex-start;min-height:44px;border:1px solid #d0b87966;border-radius:8px;background:#22251d;color:#edd09a;padding:8px 13px;font:600 12px system-ui}.aoBibleReviewEmpty{padding:16px;border:1px dashed #a0895f77;border-radius:10px;max-width:700px}",
"@media(max-width:480px){.aoBibleReviewTop{padding:8px 12px}.aoBibleReviewTabs{padding:7px 9px}.aoBibleReviewScroll{padding:12px 14px 32px}.aoBibleReview h2{font-size:21px}.aoBibleReviewPeople{grid-template-columns:1fr 1fr}.aoBibleReviewPeople button{font-size:11px}}",
"@media(prefers-reduced-motion:reduce){.aoBibleReview *{scroll-behavior:auto!important}}"
].join("\n");
