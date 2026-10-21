// P5 MapCN Network-inspired reading surface; an SVG graph, not a second map.
// All labels, edges and original-source links come from the explicit registry.
import {networkFocus} from "./mapcn-network-model.js";
const E=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const L=(language,en,fr)=>language==="fr"?fr:en;
const TYPE={
 place:["Place","Lieu"],shrine:["Shrine","Sanctuaire"],
 pilgrimage:["Pilgrimage","Pèlerinage"],route:["Journey","Parcours"],
 relic:["Relic","Relique"],apparition:["Apparition","Apparition"],
 calendar:["Calendar context","Contexte calendaire"]};
const LABEL=(language,type)=>L(language,...(TYPE[type]||[type,type]));
const crop=(value,n=31)=>String(value||"").length>n?String(value).slice(0,n-1)+"…":String(value||"");
export function renderNetworkPanel({graph,language="en",filters={}}={}){
 if(!graph)return "";
 const {current,relations,results,connections,matching}=networkFocus(graph,{
   focus:filters.networkFocus,search:filters.networkSearch,
   kind:filters.networkKind||"all",limit:filters.networkLimit||12
 });
 let html='<section class="aoNetworkPanel" data-network-panel aria-label="'+
   E(L(language,"Documented relationship network","Réseau de relations documentées"))+'">';
 html+='<header class="aoNetworkHeader"><div><small>MAPCN · VERIFIED CONNECTIONS</small>'+
   '<h2>'+L(language,"Sacred connections","Liens sacrés")+'</h2></div>'+
   '<button type="button" data-network-close aria-label="'+L(language,"Return to map","Retour à la carte")+'">×</button></header>';
 html+='<div class="aoNetworkColumns"><aside class="aoNetworkRail">'+
   '<p class="aoNetworkExplanation">'+
   L(language,"Explore explicit historical and documentary associations. Lines are relationships—not routes, distances, proofs of miracles or shared identities inferred from names.",
     "Explorer des associations historiques et documentaires explicites. Les lignes ne sont ni des itinéraires, ni des distances, ni des preuves de miracles ou d'identité déduites des noms.")+'</p>';
 html+='<div class="aoNetworkStats"><div><strong>'+graph.nodes.length+'</strong><small>'+
   L(language,"documented entities","entités documentées")+'</small></div><div><strong>'+graph.edges.length+
   '</strong><small>'+L(language,"cited relationships","relations sourcées")+'</small></div></div>';
 html+='<label class="aoNetworkLabel">'+L(language,"Find an entity","Rechercher une entité")+
   '<input type="search" data-network-search autocomplete="off" spellcheck="false" value="'+
   E(filters.networkSearch||"")+'" placeholder="'+L(language,"Place, shrine, pilgrimage…","Lieu, sanctuaire, pèlerinage…")+'"></label>';
 html+='<label class="aoNetworkLabel">'+L(language,"Entity type","Type d'entité")+'<select data-network-kind>'+
   '<option value="all">'+L(language,"All documented types","Tous les types documentés")+'</option>';
 for(const t of Object.keys(TYPE))html+='<option value="'+t+'"'+(filters.networkKind===t?' selected':'')+'>'+
   LABEL(language,t)+'</option>';
 html+='</select></label>';
 html+='<div class="aoNetworkMatchCount">'+matching+' '+L(language,"matching records","résultats")+'</div>';
 html+='<div class="aoNetworkResults" role="list">';
 for(const node of results){
   html+='<div role="listitem"><button type="button" data-network-focus="'+E(node.key)+'" aria-pressed="'+
     String(current?.key===node.key)+'"><small>'+E(LABEL(language,node.type))+'</small><strong>'+
     E(node.name)+'</strong><span>'+(graph.neighbors.get(node.key)?.length||0)+' '+
     L(language,"relations","relations")+'</span></button></div>';
 }
 html+='</div></aside><section class="aoNetworkMain">';
 if(!current){
   html+='<p class="aoNetworkEmpty">'+L(language,"No documented connections available.","Aucun lien documenté disponible.")+'</p>';
 }else{
   html+='<div class="aoNetworkCurrent"><div><small>'+E(LABEL(language,current.type))+
     ' · '+connections+' '+L(language,"cited links","liens sourcés")+'</small><h3>'+
     E(current.name)+'</h3></div>';
   if(current.type==="place")html+='<button type="button" data-explore-open-place="'+E(current.id)+'">'+
     L(language,"Open place profile","Ouvrir la fiche du lieu")+' ↗</button>';
   html+='</div>';
   const num=relations.length,angles=relations.map((x,i)=>{
     const r=num>8&&i>=8?1:0;
     const section=num>8?(r?num-8:8):num;
     const ix=r?i-8:i;
     const angle=-Math.PI/2+ix*2*Math.PI/Math.max(1,section)+(r?0.24:0);
     return {x:430+Math.cos(angle)*(r?190:310),
       y:275+Math.sin(angle)*(r?142:200),node:graph.byKey.get(x.other),edge:x.edge};
   });
   html+='<div class="aoNetworkGraphWrap"><svg class="aoNetworkGraph" viewBox="0 0 860 550" role="img" aria-label="'+
     E(L(language,"Source-linked relationship diagram for ","Schéma des relations sourcées pour ")+current.name)+
     '" xmlns="http://www.w3.org/2000/svg">';
   html+='<defs><radialGradient id="aoNetworkGlow"><stop stop-color="#bca06e" stop-opacity=".13"/>'+
     '<stop offset="1" stop-color="#101b25" stop-opacity="0"/></radialGradient></defs>';
   html+='<circle cx="430" cy="275" r="244" fill="url(#aoNetworkGlow)"/>';
   html+='<circle cx="430" cy="275" r="168" fill="none" stroke="#c0a879" stroke-opacity=".12"/>';
   html+='<circle cx="430" cy="275" r="245" fill="none" stroke="#c0a879" stroke-opacity=".08"/>';
   for(const a of angles)html+='<path d="M430 275 L'+a.x.toFixed(1)+' '+a.y.toFixed(1)+
     '" fill="none" stroke="#b79b68" stroke-opacity=".55" stroke-width="1.4"/>';
   html+='<circle cx="430" cy="275" r="69" fill="#443d2e" stroke="#ead4a6" stroke-width="2"/>'+
     '<text x="430" y="258" text-anchor="middle" class="aoNetworkSvgType">'+E(LABEL(language,current.type))+'</text>'+
     '<text x="430" y="282" text-anchor="middle" class="aoNetworkSvgTitle">'+E(crop(current.name,24))+'</text>'+
     '<text x="430" y="300" text-anchor="middle" class="aoNetworkSvgSmall">'+connections+' '+L(language,"links","liens")+'</text>';
   for(const a of angles){
     if(!a.node)continue;
     html+='<g class="aoNetworkSvgItem" data-network-focus="'+E(a.node.key)+'" role="button" tabindex="0" aria-label="'+
       E(L(language,"Focus ","Voir ")+a.node.name)+'">'+
       '<circle cx="'+a.x+'" cy="'+a.y+'" r="52" class="aoNetworkSvgCircle aoNetworkType-'+a.node.type+'"/>'+
       '<text x="'+a.x+'" y="'+(a.y-10)+'" text-anchor="middle" class="aoNetworkSvgType">'+
       E(LABEL(language,a.node.type))+'</text>'+
       '<text x="'+a.x+'" y="'+(a.y+13)+'" text-anchor="middle" class="aoNetworkSvgTitle">'+
       E(crop(a.node.name,17))+'</text></g>';
   }
   html+='</svg><p>'+L(language,
     "Select a node to explore its cited connections. The diagram is relational, not geographical.",
     "Choisissez un nœud pour explorer ses liens sourcés. Le schéma est relationnel, non géographique.")+'</p></div>';
   html+='<div class="aoNetworkEvidence"><div class="aoNetworkEvidenceTop"><h4>'+
     L(language,"Documented connections","Relations documentées")+'</h4><span>'+
     relations.length+' / '+connections+'</span></div>';
   for(const item of relations){
     const target=graph.byKey.get(item.other),edge=item.edge;
     if(!target)continue;
     html+='<article class="aoNetworkEvidenceRow"><div><small>'+E(LABEL(language,target.type))+
       ' · '+E(language==="fr"?edge.claimFr:edge.claimEn)+'</small>'+
       '<button type="button" data-network-focus="'+E(target.key)+'">'+E(target.name)+'</button>';
     if(target.type==="place")html+='<button type="button" class="aoNetworkPlaceButton" data-explore-open-place="'+E(target.id)+'">'+
       L(language,"Place profile","Fiche du lieu")+' ↗</button>';
     html+='</div><a href="'+E(edge.source.url)+'" target="_blank" rel="noopener noreferrer">'+
       L(language,"Source","Source")+' ↗</a></article>';
   }
   if(connections>relations.length)html+='<button type="button" class="aoNetworkMore" data-network-more>'+
     L(language,"Show more adjacent entities","Afficher davantage de relations")+'</button>';
   html+='</div>';
 }
 html+='</section></div><footer class="aoNetworkFoot">'+L(language,
   "Source-bound graph. A historical association does not establish relic authenticity, apparition approval or a dated 1962 observance. Saint identities await explicit cross-owner canonical references.",
   "Graphe relié aux sources. Un lien historique ne garantit ni l'authenticité des reliques, ni l'approbation d'une apparition, ni une date au calendrier de 1962. Les identités des saints attendent des références canoniques explicites.")+
   '</footer></section>';
 return html;
}
