// Review-only evidence. No imported relationship becomes canonical from this component.
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const url=v=>typeof v==="string"&&/^https:\/\/[a-z0-9.-]+\//i.test(v)?v:null;
const arr=v=>Array.isArray(v)?v:[];
const passageKey=v=>String(v??"").toLowerCase().replace(/[–—]/g,"-").replace(/\s+/g," ").trim();
// Textual reference equality only. It neither equates two historical scenes nor certifies a place.
export function exactAtlasReferenceIndex(milestones,reference){
 const wanted=passageKey(reference);
 if(!wanted)return null;
 const hits=arr(milestones).filter(m=>passageKey(m.reference)===wanted);
 return hits.length===1&&Number.isInteger(hits[0].index)?hits[0].index:null;
}
export const BIBLE_REVIEW_DEFAULT=Object.freeze({surface:"timeline",lineage:"genesis",root:"adam",depth:3,page:0,apostle:"mary"});
// Editorial pilot only: integrity of source associations is necessary but
// cannot by itself certify genealogical history, Scripture variants or routes.
// Fail closed when an upstream vendor edge is injected into the small curated set.
export function validateLineageReviewCorpus(data){
 const g=data?.genealogies??{},edges=g.genesis?.edges,matthew=g.matthew?.nodes,luke=g.luke?.nodes;
 if(data?.schema!=="BIBLICAL_LINEAGE_DISPERSION_CURATED_V1"||
    data?.status!=="EDITORIAL_PILOT_CORRECTED_PENDING_REVIEW"||
    arr(matthew).length!==41||arr(luke).length!==76||
    arr(edges).length!==90||arr(data.profiles).length!==20||arr(data.events).length!==55||
    arr(data.guards).length<10)return false;
 const pairIds=new Set(),edgeIds=new Set(),parents=new Map(),personNames=new Map();
 for(const e of edges){
  if(!e.id||edgeIds.has(e.id)||!e.parentId||!e.childId||e.parentId===e.childId||
     !e.parent||!e.child||e.kind!=="scripture-parentage"||
     !e.reference||!url(e.url))return false;
  // One stable person ID must not secretly name different ancestors.
  // Different IDs may legitimately share a name (two Enochs, two Lamechs).
  for(const [personId,name] of [[e.parentId,e.parent],[e.childId,e.child]]){
   if(personNames.has(personId)&&personNames.get(personId)!==name)return false;
   personNames.set(personId,name);
  }
  const pair=e.parentId+" -> "+e.childId;
  if(pairIds.has(pair))return false;
  pairIds.add(pair);edgeIds.add(e.id);
  if(!parents.has(e.parentId))parents.set(e.parentId,new Set());
  parents.get(e.parentId).add(e.childId);
 }
 // A visually connected tree may not contain circular parentage.
 const visited=new Set(),active=new Set();
 const walk=id=>{
  if(active.has(id))return false;
  if(visited.has(id))return true;
  active.add(id);
  for(const child of parents.get(id)||[])if(!walk(child))return false;
  active.delete(id);visited.add(id);return true;
 };
 for(const id of parents.keys())if(!walk(id))return false;
 for(const [key,nodes] of [["Matthew",matthew],["Luke",luke]]){
  const ids=new Set();
  for(const [i,n] of nodes.entries()){
   if(!n.id||ids.has(n.id)||n.index!==i||!n.person||!n.reference||!url(n.url)||
      !n.reference.startsWith(key+" ")||!["textual-lineage","legal-or-putative","terminus"].includes(n.type))return false;
   ids.add(n.id);
   for(const w of arr(n.associatedWomen))
    if(!w.person||w.kind!=="scriptural-association"||!w.reference||!url(w.url))return false;
  }
  const joseph=nodes[nodes.length-2],jesus=nodes.at(-1);
  if(joseph.person!=="Joseph"||joseph.type!=="legal-or-putative"||
     jesus.person!=="Jesus"||jesus.type!=="terminus")return false;
 }
 const profiles=arr(data.profiles),locations=arr(data.locations);
 const people=new Set(profiles.map(p=>p.id)),placeIds=new Set(locations.map(p=>p.id));
 if(people.size!==20||profiles.some(p=>!p.id||!p.name||!p.fr)||
    placeIds.size!==locations.length||locations.some(p=>p.certified!==false))return false;
 const eventIds=new Set();
 for(const e of data.events){
  if(!e.id||eventIds.has(e.id)||!people.has(e.person)||!e.title||!e.fr||
     !e.reference||!url(e.source)||!["scripture","patristic","later","identification","hold"].includes(e.kind)||
     (e.place&&!placeIds.has(e.place)))return false;
  eventIds.add(e.id);
 }
 return true;
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
// An actual nested source-edge tree rather than a flat chronological parent list.
// Every child node is backed by one named Genesis relation; no shared surname merges.
export function renderGenesisBranchTree(rows,{root="adam",language="en"}={}){
 const lang=language==="fr"?"fr":"en",out=new Map();
 for(const edge of arr(rows)){
  if(!out.has(edge.parentId))out.set(edge.parentId,[]);
  out.get(edge.parentId).push(edge);
 }
 const names={adam:["Adam","Adam"],noah:["Noah","Noé"],abraham:["Abraham","Abraham"],jacob:["Jacob","Jacob"],joseph:["Joseph","Joseph"]};
 const start=Object.hasOwn(names,root)?root:"adam";
 const children=(id,seen)=>{
  const edges=(out.get(id)||[]).filter(e=>!seen.has(e.childId));
  if(!edges.length)return "";
  return '<ul role="group">'+edges.map(e=>{
   const nextSeen=new Set([...seen,e.childId]);
   return '<li role="treeitem" aria-label="'+esc(e.child)+'" data-bible-family-edge="'+esc(e.id)+'" data-bible-family-person="'+esc(e.childId)+'">'+
    '<div class="aoBibleFamilyNode"><small>'+esc(L(lang,"Generation","Génération"))+' '+e.generation+'</small>'+
    '<strong>'+esc(e.child)+'</strong>'+
    (e.mother?'<small>'+esc(L(lang,"Mother named","Mère nommée"))+': '+esc(e.mother)+'</small>':"")+
    '<a href="'+esc(e.url)+'" target="_blank" rel="noopener noreferrer">'+esc(e.reference)+' ↗</a></div>'+
    children(e.childId,nextSeen)+'</li>';
  }).join("")+'</ul>';
 };
 return '<div class="aoBibleFamilyTree" role="tree" aria-label="'+esc(L(lang,"Source-linked family of","Famille référencée de"))+' '+esc(L(lang,...names[start]))+'">'+
  '<div class="aoBibleFamilyRoot" data-bible-family-person="'+start+'"><small>'+esc(L(lang,"Selected ancestor","Ancêtre choisi"))+'</small>'+
  '<strong>'+esc(L(lang,...names[start]))+'</strong></div>'+
  children(start,new Set([start]))+'</div>';
}
// Source-anchored graphical projection of the already-reviewed Genesis edges.
// Every solid or dotted connector corresponds to an actual cited parentage row;
// no spouse, step-parent, or extra biological link is inferred from surnames.
export function renderGenesisAncestryDiagram(rows,{root="adam",language="en"}={}){
 const lang=language==="fr"?"fr":"en";
 const names={adam:["Adam","Adam"],noah:["Noah","Noé"],abraham:["Abraham","Abraham"],jacob:["Jacob","Jacob"],joseph:["Joseph","Joseph"]};
 const start=Object.hasOwn(names,root)?root:"adam",edges=arr(rows);
 if(!edges.length)return "";
 const people=new Map([[start,{name:L(lang,...names[start]),source:null}]]);
 const mainParent=new Map(),children=new Map();
 for(const edge of edges){
  if(!edge.parentId||!edge.childId||!url(edge.url)||!edge.reference)continue;
  if(!people.has(edge.parentId))people.set(edge.parentId,{name:edge.parent,source:null});
  if(!people.has(edge.childId))people.set(edge.childId,{name:edge.child,source:edge});
  if(!mainParent.has(edge.childId)){
   mainParent.set(edge.childId,edge.parentId);
   if(!children.has(edge.parentId))children.set(edge.parentId,[]);
   children.get(edge.parentId).push(edge.childId);
  }
 }
 const coordinates=new Map(),step=76,cardWidth=172,cardHeight=58,column=220;
 let leaf=0,depth=0;
 const assign=(id,level)=>{
  if(coordinates.has(id))return coordinates.get(id).y;
  depth=Math.max(depth,level);
  const descendants=children.get(id)||[];
  const ys=descendants.map(k=>assign(k,level+1));
  // Align every ancestor with the first documented descendant so the root is always initially visible.
  const y=ys.length?ys[0]:(leaf++*step+40);
  coordinates.set(id,{x:22+level*column,y});
  return y;
 };
 assign(start,0);
 const width=48+depth*column+cardWidth,height=Math.max(120,leaf*step+32);
 const edgesSvg=edges.map(e=>{
  const a=coordinates.get(e.parentId),b=coordinates.get(e.childId);
  if(!a||!b)return "";
  const x1=a.x+cardWidth,x2=b.x,y1=a.y+cardHeight/2,y2=b.y+cardHeight/2;
  // Alternate known parentage is drawn separately; it is never turned into
  // another implied ancestor in the layout tree.
  const secondary=mainParent.get(e.childId)!==e.parentId;
  const d="M "+x1+" "+y1+" C "+(x1+30)+" "+y1+", "+(x2-30)+" "+y2+", "+x2+" "+y2;
  return '<path d="'+d+'" class="'+(secondary?"aoBibleKinEdgeSecondary":"aoBibleKinEdge")+'"><title>'+esc(e.parent+" → "+e.child+" · "+e.reference)+'</title></path>';
 }).join("");
 const vertices=[...coordinates.entries()].map(([id,p])=>{
  const person=people.get(id),incoming=person.source;
  const label=person.name||id,short=label.length>23?label.slice(0,21)+"…":label;
  const source=incoming&&url(incoming.url);
  const box='<rect x="'+p.x+'" y="'+p.y+'" width="'+cardWidth+'" height="'+cardHeight+'" rx="8" />'+
   '<text class="aoBibleKinPerson" x="'+(p.x+12)+'" y="'+(p.y+25)+'">'+esc(short)+'</text>'+
   '<text class="aoBibleKinSource" x="'+(p.x+12)+'" y="'+(p.y+44)+'">'+
    esc(source?incoming.reference:L(lang,"Selected ancestor","Ancêtre choisi"))+'</text>'+
   '<title>'+esc(label+(source?" · "+incoming.reference:""))+'</title>';
  return source?'<a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer" tabindex="0" class="aoBibleKinPersonLink" data-bible-kin-person="'+esc(id)+'">'+box+'</a>':
   '<g class="aoBibleKinRoot" data-bible-kin-person="'+esc(id)+'">'+box+'</g>';
 }).join("");
 const zoomTools='<div class="aoBibleKinZoomTools" role="group" aria-label="'+esc(L(lang,"Genealogy zoom","Zoom de la généalogie"))+'">'+
  '<button type="button" data-bible-kin-zoom="out" aria-label="'+esc(L(lang,"Zoom out","Réduire"))+'">−</button>'+
  '<output data-bible-kin-zoom-value aria-live="polite">100%</output>'+
  '<button type="button" data-bible-kin-zoom="in" aria-label="'+esc(L(lang,"Zoom in","Agrandir"))+'">+</button>'+
  '<button type="button" data-bible-kin-zoom="reset">'+esc(L(lang,"Reset","Réinitialiser"))+'</button></div>';
 return zoomTools+'<div class="aoBibleKinDiagram" data-bible-kin-diagram role="region" tabindex="0" aria-label="'+
  esc(L(lang,"Source-linked genealogy: pan horizontally or vertically to explore","Généalogie sourcée : faites défiler horizontalement ou verticalement"))+'">'+
  '<svg xmlns="http://www.w3.org/2000/svg" data-bible-kin-base-width="'+width+'" data-bible-kin-base-height="'+height+'" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+
   '" role="group" aria-label="'+esc(L(lang,"Reviewed family relationships","Relations familiales vérifiées"))+'">'+
  '<g class="aoBibleKinLines">'+edgesSvg+'</g><g class="aoBibleKinNodes">'+vertices+'</g></svg></div>';
}
export function apostolicProfile(data,id){
 if(!validateLineageReviewCorpus(data))return null;
 const profile=data.profiles.find(p=>p.id===id)||data.profiles[0];
 return {profile,events:data.events.filter(e=>e.person===profile.id)
  .sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0))
  .map(e=>({...e,source:url(e.source),location:data.locations.find(l=>l.id===e.place)||null}))};
}
const BUTTON=(attr,k,active,label)=>'<button type="button" '+attr+'="'+esc(k)+'" aria-pressed="'+String(active)+'">'+esc(label)+'</button>';
export function renderLineageReview(data,{language="en",surface="genealogies",lineage="genesis",root="adam",depth=3,page=0,apostle="mary",atlasStops=[]}={}){
 const lang=language==="fr"?"fr":"en",review=validateLineageReviewCorpus(data);
 const tabs=[["timeline","Chronology","Chronologie"],["genealogies","Genealogies","Généalogies"],["apostles","Apostolic lives","Vies apostoliques"],["cinematic","Scene studies","Études des scènes"]]
  .map(([k,en,fr])=>BUTTON("data-bible-review-surface",k,k===surface,L(lang,en,fr))).join("");
 const head='<div class="aoBibleReviewTop"><button type="button" data-bible-atlas-close aria-label="'+esc(L(lang,"Back to Explore","Retour à Explorer"))+'">←</button>'+
 '<div><small>'+esc(L(lang,"EXPLORE · SCRIPTURE","EXPLORER · ÉCRITURE"))+'</small><h1>'+esc(L(lang,"Biblical Atlas","Atlas biblique"))+'</h1></div></div>'+
 '<nav class="aoBibleReviewTabs" aria-label="'+esc(L(lang,"Biblical Atlas views","Vues de l’Atlas biblique"))+'">'+tabs+'</nav>';
 const wrapper=body=>'<style>'+CSS+'</style><section class="aoFindSurface aoBibleReview" data-ao-find-owner="AO_FIND_APP_V1" data-ao-bible-review>'+head+'<div class="aoBibleReviewScroll">'+body+'</div></section>';
 if(!review)return wrapper('<p class="aoBibleReviewEmpty">'+esc(L(lang,"The reviewed genealogical evidence is unavailable. The 151-event chronology is unaffected.","Les données généalogiques ne sont pas disponibles. La chronologie de 151 étapes reste intacte."))+'</p>');
 const warning='<details class="aoBibleReviewNotice"><summary>'+esc(L(lang,"Research preview — not approved for publication.","Aperçu de recherche — publication non autorisée."))+'</summary>'+ 
 '<p>'+esc(L(lang,"Scripture, patristic witnesses and later traditions are classified separately. Location names do not certify GPS or historical routes.","Les Écritures, les témoignages patristiques et les traditions tardives sont distingués. Les lieux ne certifient aucune coordonnée ni route historique."))+'</p></details>';
 let body="";
 if(surface==="genealogies"){
  const key=["genesis","matthew","luke"].includes(lineage)?lineage:"genesis";
  body='<div class="aoBibleReviewChoices" role="group" aria-label="'+esc(L(lang,"Choose genealogy","Choisir une généalogie"))+'">'+
   [["genesis","Genesis","Genèse"],["matthew","Matthew 1","Matthieu 1"],["luke","Luke 3","Luc 3"]]
    .map(([k,en,fr])=>BUTTON("data-bible-review-lineage",k,k===key,L(lang,en,fr))).join("")+'</div>';
  if(key==="genesis"){
   const rows=genesisGenerationRows(data,{root,depth});
   body+='<h2>'+esc(L(lang,"Families of Genesis","Familles de la Genèse"))+'</h2><p>'+
   esc(L(lang,"90 source-referenced family links in this reviewed subset.","90 liens familiaux référencés dans cette sélection en cours de vérification."))+'</p>'+
   '<div class="aoBibleReviewChoices aoBibleReviewFamilyChoices" role="group" aria-label="'+esc(L(lang,"Choose family","Choisir une famille"))+'">'+
   [["adam","Adam","Adam"],["noah","Noah","Noé"],["abraham","Abraham","Abraham"],["jacob","Jacob","Jacob"],["joseph","Joseph","Joseph"]]
    .map(([k,en,fr])=>BUTTON("data-bible-review-root",k,k===root,L(lang,en,fr))).join("")+'</div>';
   body+='<div class="aoBibleReviewControls"><span>'+esc(L(lang,"Generations","Générations"))+': '+Number(depth||3)+'</span>'+
   '<button type="button" data-bible-review-depth="-1" '+(Number(depth)<=1?'disabled':'')+'>−</button>'+
   '<button type="button" data-bible-review-depth="1" '+(Number(depth)>=6?'disabled':'')+'>+</button></div>';
   body+='<p class="aoBibleKinHelp">'+esc(L(lang,"Explore each generation by panning the diagram. Select a person to consult the original Scripture source.","Parcourez les générations dans le schéma. Sélectionnez une personne pour consulter la source biblique originale."))+'</p>'+
    renderGenesisAncestryDiagram(rows,{root,language:lang})+
    '<details class="aoBibleKinSourceList"><summary>'+esc(L(lang,"Accessible source relationship list","Liste accessible des filiations sourcées"))+'</summary>'+
    renderGenesisBranchTree(rows,{root,language:lang})+'</details>';
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
    (e.kind==="scripture"&&/^[1-3]?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+/.test(e.reference||"")?'<button type="button" data-ao-scripture-context="'+esc(e.reference)+'">'+esc(L(lang,"Read Scripture","Lire les Écritures"))+'</button>':"")+
    (e.kind==="scripture"&&exactAtlasReferenceIndex(atlasStops,e.reference)!==null?'<button type="button" data-bible-review-jump="'+exactAtlasReferenceIndex(atlasStops,e.reference)+'">'+esc(L(lang,"Related chronology reference","Référence dans la chronologie"))+'</button>':"")+'</li>';
  }).join("")+'</ol>';
 }
 return wrapper(body+warning);
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
".aoBibleReviewNotice summary{cursor:pointer;color:#ead3a3;font:600 12px/1.4 system-ui}.aoBibleReviewNotice p{color:#c4b8a4;font:12px/1.5 system-ui;margin:8px 0 0}",
".aoBibleReviewNotice strong{display:block;color:#ead3a3}.aoBibleReviewChoices{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.aoBibleReviewPeople{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr))}",
".aoBibleReviewPeople button{white-space:normal;text-align:left;max-width:100%;min-height:48px}.aoBibleReviewControls{display:flex;gap:9px;align-items:center;margin:15px 0;color:#baa983;font:12px system-ui}.aoBibleReviewControls span{flex:1}",
".aoBibleReviewList{display:grid;gap:8px;list-style:none;padding:0;margin:16px 0;max-width:830px}.aoBibleReviewList li{display:flex;flex-direction:column;gap:5px;padding:11px 12px;background:#111923;border:1px solid #d9c59a2a;border-radius:10px;min-width:0}",
".aoBibleReviewList strong{font:500 16px/1.25 Georgia,serif;color:#f0e3cf}.aoBibleReviewList small{font:11px/1.4 system-ui;color:#baa98d}.aoBibleReviewList a{font:12px/1.5 system-ui;color:#dec28a;width:max-content;max-width:100%;overflow-wrap:anywhere}",
".aoBibleKinZoomTools{display:flex;justify-content:flex-end;align-items:center;gap:7px;max-width:800px;margin:6px 0 4px}.aoBibleKinZoomTools button{min-width:42px;min-height:40px;padding:7px 10px;border:1px solid #bda4746b;border-radius:7px;background:#17202b;color:#e7d5ad;font:600 12px system-ui}.aoBibleKinZoomTools output{min-width:48px;text-align:center;color:#bea781;font:11px system-ui}.aoBibleKinZoomTools button:focus-visible{outline:2px solid #e0c484;outline-offset:2px}",
".aoBibleKinHelp{font:12px/1.4 system-ui!important;color:#b8aa91!important;max-width:760px;margin:8px 0}.aoBibleKinDiagram{width:100%;max-width:100%;max-height:min(58vh,530px);min-height:260px;box-sizing:border-box;overflow:auto;overscroll-behavior:contain;touch-action:pan-x pan-y;border:1px solid #c9ae7540;border-radius:12px;background:radial-gradient(ellipse at 30% 12%,#1d2430,#0d131c 75%);scrollbar-width:thin;margin:9px 0 10px}.aoBibleKinDiagram svg{display:block;max-width:none;overflow:visible}.aoBibleKinLines path{fill:none;stroke:#bda474;stroke-width:1.6;opacity:.72}.aoBibleKinLines path.aoBibleKinEdgeSecondary{stroke-dasharray:5 4;opacity:.6}.aoBibleKinNodes rect{fill:#1b2630;stroke:#bda47488;stroke-width:1.2}.aoBibleKinNodes .aoBibleKinRoot rect{fill:#3a3023;stroke:#dfc18d}.aoBibleKinNodes a:hover rect,.aoBibleKinNodes a:focus-visible rect{stroke:#f0d5a0;stroke-width:2;fill:#343228}.aoBibleKinPerson{font:16px Georgia,serif;fill:#f0e3cf}.aoBibleKinSource{font:10px system-ui;fill:#c9b08a}.aoBibleKinPersonLink{cursor:pointer}.aoBibleKinPersonLink:focus-visible{outline:none}.aoBibleKinSourceList{max-width:800px;margin:12px 0 20px;font:12px/1.5 system-ui;color:#ccbb97}.aoBibleKinSourceList summary{cursor:pointer;min-height:36px;padding:8px 0;color:#dac69f}.aoBibleKinSourceList .aoBibleFamilyTree{margin-top:8px}",
".aoBibleFamilyTree{max-width:780px;overflow-x:auto;margin:15px 0 25px;padding:5px 2px 12px}.aoBibleFamilyTree ul{list-style:none;margin:0 0 0 16px;padding:0 0 0 17px;border-left:1px solid #c9ae755a}.aoBibleFamilyTree li{position:relative;list-style:none;margin:9px 0 0;min-width:0}.aoBibleFamilyTree li:before{content:'';position:absolute;left:-17px;top:23px;width:17px;border-top:1px solid #c9ae755a}.aoBibleFamilyRoot,.aoBibleFamilyNode{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 13px;background:#111923;border:1px solid #d9c59a35;border-radius:10px;padding:11px 13px;max-width:630px;min-width:0}.aoBibleFamilyRoot{background:#2a271f;border-color:#c9ae757e}.aoBibleFamilyRoot strong,.aoBibleFamilyNode strong{font:500 17px Georgia,serif;color:#f0e3cf}.aoBibleFamilyRoot small,.aoBibleFamilyNode small{font:10px/1.3 system-ui;color:#baa98d}.aoBibleFamilyNode a{font:12px system-ui;color:#dec28a;margin-left:auto}.aoBibleFamilyNode a:focus-visible{outline:2px solid #e6c47b;outline-offset:2px}",
".aoBibleReviewFamilyChoices{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin;overscroll-behavior-inline:contain}.aoBibleReviewFamilyChoices button{flex:none;min-height:42px;padding:6px 10px}.aoBibleKinDiagram:focus-visible{outline:2px solid #d4b67c;outline-offset:2px}",
".aoBibleReviewFamily{margin-left:calc(min(var(--generation),4)*5px)}.aoBibleReviewEvidence{font:600 10px system-ui;letter-spacing:.06em;text-transform:uppercase;color:#a99472}",
".aoBibleReviewList p{font:12px/1.5 system-ui;margin:2px 0;color:#bcb1a0}.aoBibleReviewList button{align-self:flex-start;min-height:44px;border:1px solid #d0b87966;border-radius:8px;background:#22251d;color:#edd09a;padding:8px 13px;font:600 12px system-ui}.aoBibleReviewEmpty{padding:16px;border:1px dashed #a0895f77;border-radius:10px;max-width:700px}",
"@media(max-width:480px){.aoBibleReviewTop{padding:8px 12px}.aoBibleReviewTabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;overflow:visible;padding:6px 8px}.aoBibleReviewTabs button{min-width:0;min-height:49px;white-space:normal;line-height:1.13;font-size:10px;padding:5px 3px;border-radius:6px}.aoBibleReviewScroll{padding:12px 14px 32px}.aoBibleReview h2{font-size:21px}.aoBibleReviewPeople{grid-template-columns:1fr 1fr}.aoBibleReviewPeople button{font-size:11px}}",
"@media(prefers-reduced-motion:reduce){.aoBibleReview *{scroll-behavior:auto!important}}"
].join("\n");
