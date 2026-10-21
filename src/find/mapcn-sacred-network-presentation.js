// MapCN Logistics Network visual grammar adapted for an evidence graph.
// Every line means "source states a relationship" — never a physical route.
import {RELATION_KINDS,sacredNetworkNeighborhood} from "./mapcn-sacred-network.js";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const labels={PLACE:["Place relation","Lieux liés"],SHRINE:["Shrine association","Sanctuaire associé"],
  PILGRIMAGE:["Pilgrimage association","Lien de pèlerinage"],
  RELIC:["Relic custody claim","Lieu de vénération de relique"],
  APPARITION:["Apparition tradition","Tradition d’apparition"],
  CUSTOM:["Documented custom","Coutume attestée"],
  CALENDAR:["Calendar context","Contexte du calendrier"],
  PERSON:["Named person in source","Personne citée dans la source"]};
const short=x=>String(x||"").length>26?String(x).slice(0,23)+"…":String(x);
function graphSvg(neighborhood,lang){
 const relations=neighborhood.connections.slice(0,9),k=relations.length;
 const coords=relations.map((c,i)=>{
   const angle=(2*Math.PI*i/Math.max(1,k))-Math.PI/2;
   return {x:345+238*Math.cos(angle),y:182+130*Math.sin(angle),c};
 });
 let s='<div class="aoSacredNetworkGraphScroll"><svg class="aoSacredNetworkGraph" viewBox="0 0 690 365" role="img" aria-label="'+esc(L(lang,
   "Conceptual graph of sourced relationships; lines are not travel routes",
   "Graphe des liens documentés ; les lignes ne sont pas des itinéraires"))+'">';
 s+='<defs><radialGradient id="aoNetworkGlow"><stop offset="0" stop-color="#344954"/><stop offset="1" stop-color="#0d1b26"/></radialGradient></defs>';
 for(const n of coords)s+='<path class="aoSacredNetworkEdge" d="M345 182 L'+n.x.toFixed(1)+' '+n.y.toFixed(1)+'"/>';
 for(const n of coords){
   const x=n.x.toFixed(1),y=n.y.toFixed(1);
   s+='<g class="aoSacredNetworkSatellite aoNetwork-'+esc(n.c.node.type)+'"><circle cx="'+x+'" cy="'+y+'" r="24"/>'+
   '<text class="aoNetworkGlyph" x="'+x+'" y="'+(n.y+5).toFixed(1)+'">'+esc(
     n.c.node.type==="PLACE"?"✝":n.c.node.type==="RELIC"?"✦":n.c.node.type==="CALENDAR"?"◷":"◆")+'</text>'+
   '<text class="aoNetworkCaption" x="'+x+'" y="'+(n.y+39).toFixed(1)+'">'+esc(short(n.c.node.label))+'</text></g>';
 }
 s+='<circle class="aoSacredNetworkCore" cx="345" cy="182" r="62"/>';
 s+='<text x="345" y="170" class="aoNetworkCoreType">'+esc(neighborhood.root.type)+'</text>';
 s+='<text x="345" y="188" class="aoNetworkCoreLabel">'+esc(short(neighborhood.root.label))+'</text>';
 s+='<text x="345" y="204" class="aoNetworkCoreCount">'+neighborhood.total+' '+esc(L(lang,"links","liens"))+'</text>';
 return s+'</svg></div>';
}
export function renderSacredNetworkPanel({network,rootId,kind="ALL",query="",limit=9,language="en"}={}){
 if(!network)return "";
 const root=network.byId.get(rootId)||network.nodes[0];
 const n=sacredNetworkNeighborhood(network,root?.id,{kind,limit});
 const candidates=network.nodes.filter(x=>x.type!=="PERSON"&&
   (!query||x.label.toLocaleLowerCase().includes(String(query).toLocaleLowerCase()))).slice(0,12);
 let html='<aside class="aoSacredNetworkPanel" data-sacred-network-panel aria-label="'+
   L(language,"Network of documented Catholic relationships","Réseau des relations catholiques documentées")+'">';
 html+='<header class="aoSacredNetworkHeader"><div><small>MAPCN · SOURCE NETWORK</small>'+
   '<h2>'+L(language,"Sacred Connections","Liens sacrés")+'</h2></div>'+
   '<button type="button" data-network-close aria-label="'+L(language,"Close Network","Fermer le réseau")+'">×</button></header>';
 html+='<div class="aoSacredNetworkBody"><div class="aoSacredNetworkIntro">'+
   '<p>'+L(language,"Each connection below is taken from an existing, attributed record. Lines are conceptual relationships—not roads, journeys, shared coordinates or proof of a saint’s identity.",
   "Chaque lien provient d’une fiche sourcée. Les traits représentent des relations conceptuelles, et non des routes, trajets, coordonnées communes ou identifications de saints.")+'</p>'+
   '<div class="aoNetworkMetrics"><div><strong>'+network.totalNodes+'</strong><span>'+
   L(language,"linked records","fiches liées")+'</span></div><div><strong>'+network.totalEdges+'</strong><span>'+
   L(language,"source-supported assertions","relations sourcées")+'</span></div><div><strong>'+n.total+'</strong><span>'+
   L(language,"connections here","liens sélectionnés")+'</span></div></div></div>';
 html+='<div class="aoNetworkSearch"><label>'+L(language,"Choose a place or record","Choisir un lieu ou une fiche")+
  '<input type="search" data-network-search value="'+esc(query)+'" placeholder="'+L(language,"Search documented nodes","Rechercher une fiche")+'" autocomplete="off"></label>';
 html+='<div class="aoNetworkCandidates">';
 for(const c of candidates)html+='<button type="button" data-network-root="'+esc(c.id)+'" aria-pressed="'+String(c.id===n.root?.id)+'"><small>'+
    esc(c.type)+'</small><span>'+esc(c.label)+'</span></button>';
 html+='</div></div>';
 html+='<div class="aoNetworkFilter" aria-label="'+L(language,"Relationship types","Types de relations")+'">';
 for(const type of RELATION_KINDS)html+='<button type="button" data-network-kind="'+type+'" aria-pressed="'+String(type===kind)+'">'+
   (type==="ALL"?L(language,"All links","Tous les liens"):L(language,...labels[type]))+'</button>';
 html+='</div>';
 if(n.root){
   html+='<div class="aoNetworkSelected"><span>'+esc(n.root.type)+'</span><h3>'+esc(n.root.label)+'</h3>';
   if(n.root.attributionOnly)html+='<p>'+L(language,
     "A name quoted in a source; not linked to an independently verified Saints-profile identity.",
     "Nom cité par une source ; aucune identification indépendante dans le catalogue des saints.")+'</p>';
   if(n.root.placeId)html+='<button type="button" data-explore-open-place="'+esc(n.root.placeId)+'">'+
     L(language,"Open documented place","Voir le lieu documenté")+' ↗</button>';
   html+='</div>'+graphSvg(n,language);
 }
 html+='<div class="aoNetworkEvidence"><h3>'+L(language,"Documented connections","Relations attestées")+'</h3>';
 if(!n.connections.length)html+='<p>'+L(language,"No documented links of this type for this record.","Aucun lien attesté de cette catégorie.")+'</p>';
 for(const item of n.connections){
   const {node,edge}=item;
   html+='<article class="aoNetworkEdgeCard"><div><small>'+L(language,...labels[edge.type])+'</small>'+
     '<button type="button" data-network-root="'+esc(node.id)+'">'+esc(node.label)+' <span aria-hidden="true">↗</span></button>'+
     (edge.description?'<p>'+esc(edge.description)+'</p>':"")+
     (node.attributionOnly?'<p class="aoNetworkAttribution">'+L(language,
     "Text mention only—not a merged Saints identity","Citation textuelle ; identité du saint non fusionnée")+'</p>':"")+
     '<a target="_blank" rel="noopener noreferrer" href="'+esc(edge.url)+'">'+
     L(language,"Read original source","Lire la source originale")+' ↗</a></div></article>';
 }
 if(n.total>n.connections.length)html+='<button class="aoNetworkMore" type="button" data-network-more>'+
   L(language,"Show more documented connections","Voir davantage de liens")+' · '+(n.total-n.connections.length)+'</button>';
 html+='</div><footer>'+L(language,"The current graph does not infer relationships from matching names, geographic proximity or unverified biographies. Calendar keys express associations, not feast occurrences.",
   "Ce graphe n’infère aucun lien d’un nom identique, d’une proximité géographique ou d’une biographie non vérifiée. Les clés calendaires sont des associations, non des occurrences de fête.")+
   '</footer></div></aside>';
 return html;
}
