// P5 / MapCN Network View adaptation.
// Each edge must be an EXPLICIT, source-backed foreign-key relationship.
// Edges describe references, never paths, distances, miracles verified by the
// Church, identical persons inferred from strings, or liturgical observances.
const list=x=>Array.isArray(x)?x:[];
const str=x=>String(x??"").trim();
const url=x=>/^https:\/\/[^\s<>"']+$/i.test(str(x))?str(x):"";
const TYPES=Object.freeze(["place","shrine","pilgrimage","route","relic","apparition","calendar","custom","person"]);
const REL={
 SAME_PILGRIMAGE_PRECINCT:["Same pilgrimage precinct","Même enclos de pèlerinage"],
 PARISH_AND_ASSOCIATED_SHRINE:["Parish and associated shrine","Paroisse et sanctuaire associé"],
 SHRINE_SITE:["Sanctuary at this place","Sanctuaire de ce lieu"],
 PILGRIMAGE_DESTINATION:["Pilgrimage destination","Destination de pèlerinage"],
 PILGRIMAGE_ROUTE:["Documented pilgrimage route","Itinéraire de pèlerinage attesté"],
 ROUTE_DESTINATION:["Route destination","Destination de l'itinéraire"],
 ROUTE_STAGE_SITE:["Source-matched stage site","Site d'étape attesté"],
 RELIC_AT_SITE:["Source-recorded relic association","Association relique-lieu selon la source"],
 APPARITION_AT_SITE:["Source-recorded apparition tradition","Tradition d'apparition liée au lieu"],
 CALENDAR_CONTEXT:["Documented calendar context","Contexte calendaire documenté"],
 CUSTOM_ATTESTED_PLACE:["Published place-specific custom","Coutume publiée attestée en ce lieu"],
 PERSON_SOURCE_MENTION:["Attributed person mention, not a Saints identity","Mention nominative attribuée, sans identité canonique de saint"]
};
const title=(value,key="en")=>str(typeof value==="string"?value:value?.[key]||value?.official||value?.en);
const sourceLink=(u,label)=>{const link=url(u);return link?Object.freeze({url:link,label:str(label)||"Documented source"}):null;};
export function buildSacredNetwork(dataset={}){
 const places=new Map(list(dataset.geography?.places).filter(x=>str(x.place_id)).map(x=>[x.place_id,x]));
 const sources=new Map(list(dataset.shrines?.sources).map(s=>[str(s.id),s]));
 // Customs have an independent canonical publication and publisher registry.
 const customSources=new Map(list(dataset.customs?.sources).map(s=>[str(s.id),s]));
 const publishedCustoms=new Map(list(dataset.customs?.customs)
   .filter(c=>str(c?.custom_id)&&c.publication_state==="PUBLISHED")
   .map(c=>[str(c.custom_id),c]));
 const customCitation=ids=>list(ids).map(id=>customSources.get(str(id)))
   .filter(s=>str(s?.issuer)&&url(s?.url))
   .map(s=>sourceLink(s.url,s.title||s.issuer)).find(Boolean)||null;
 const nodes=new Map(),edges=new Map(),rejections={missingPlace:0,missingSubject:0,missingSource:0};
 const src=(sourceIds,explicit,label)=>{
   const direct=sourceLink(explicit,label);if(direct)return direct;
   return list(sourceIds).map(id=>sources.get(str(id))).map(s=>sourceLink(s?.url,s?.title||s?.issuer)).find(Boolean)||null;
 };
 function placeNode(id){
   const p=places.get(str(id));if(!p)return null;
   const name=title(p.name)||str(p.place_id);
   return {id:str(id),type:"place",name,detail:str(p.address?.city||p.address?.country||p.geo?.precision||"Canonical geographic place")};
 }
 function node(type,id,name,detail=""){
   if(!TYPES.includes(type)||!str(id)||!str(name))return null;
   const key=type==="place"?str(id):type+":"+str(id);
   if(!nodes.has(key))nodes.set(key,Object.freeze({key,id:str(id),type,name:str(name),detail:str(detail)}));
   return key;
 }
 function place(id){
   const p=placeNode(id);
   if(!p){rejections.missingPlace++;return null;}
   return node("place",p.id,p.name,p.detail);
 }
 function edge(a,b,kind,source,claim,recordId){
   if(!a||!b||a===b){rejections.missingSubject++;return;}
   if(!source?.url){rejections.missingSource++;return;}
   const key=kind+"|"+a+"|"+b+"|"+str(recordId);
   if(edges.has(key))return;
   edges.set(key,Object.freeze({key,from:a,to:b,kind,
     claimEn:str(claim?.en||REL[kind]?.[0]||kind),
     claimFr:str(claim?.fr||REL[kind]?.[1]||kind),
     recordId:str(recordId),source}));
 }
 // Source-attributed independent physical sites remain separate Places.
 for(const r of list(dataset.geography?.placeRelationships)){
   const a=place(r.source_place_id),b=place(r.target_place_id);
   edge(a,b,str(r.relationship_kind),src([],r.source_url,r.source_label),
     {en:r.description_en,fr:r.description_fr},r.id);
 }
 const shrines=new Map(list(dataset.shrines?.shrines).filter(s=>s.shrine_id).map(s=>[s.shrine_id,s]));
 const pilgrimages=new Map(list(dataset.shrines?.pilgrimages).filter(s=>s.pilgrimage_id).map(s=>[s.pilgrimage_id,s]));
 const routes=new Map(list(dataset.shrines?.routes).filter(s=>s.route_id).map(s=>[s.route_id,s]));
 for(const sh of shrines.values()){
   const p=place(sh.place_id),s=node("shrine",sh.shrine_id,sh.name,sh.shrine_kind);
   const citation=src(sh.source_ids);
   edge(s,p,"SHRINE_SITE",citation,null,sh.shrine_id);
   // Associated name strings remain source-scoped mentions, not Saint IDs.
   if(p&&s&&citation)for(const person of new Set(list(sh.associated_saints).map(str).filter(Boolean))){
     const mention=node("person",sh.shrine_id+"|"+person,person,
       "Attributed source mention; no canonical Saints identity");
     edge(s,mention,"PERSON_SOURCE_MENTION",citation,null,sh.shrine_id+"|"+person);
   }
 }
 for(const p of pilgrimages.values()){
   const n=node("pilgrimage",p.pilgrimage_id,p.name,p.kind),s=shrines.get(p.destination_shrine_id);
   if(s)edge(n,node("shrine",s.shrine_id,s.name,s.shrine_kind),"PILGRIMAGE_DESTINATION",
     src(p.source_ids),null,p.pilgrimage_id);
   for(const id of list(p.route_ids)){
     const route=routes.get(id);if(route)
       edge(n,node("route",route.route_id,route.name,route.route_type),"PILGRIMAGE_ROUTE",
         src(p.source_ids),null,p.pilgrimage_id+"|"+id);
   }
 }
 for(const route of routes.values()){
   const n=node("route",route.route_id,route.name,route.route_type);
   if(route.destination_place_id)edge(n,place(route.destination_place_id),"ROUTE_DESTINATION",
     src(route.source_ids),null,route.route_id);
   for(const id of list(route.waypoint_place_ids))
     edge(n,place(id),"ROUTE_STAGE_SITE",src(route.source_ids),null,route.route_id+"|"+id);
 }
 // A route-level citation alone cannot authenticate an individual stage.
 const stageEvidence=new Map(list(dataset.shrines?.routeStageEvidence)
   .filter(r=>str(r?.route_id)).map(r=>[str(r.route_id),r]));
 for(const link of list(dataset.shrines?.routeStageSiteLinks)){
   if(!["MATCHED_SITE","RELATED_COMPLEX_ANCHOR"].includes(link.site_relation)||
      link.coordinate_source!=="CANONICAL_GEOGRAPHY_ONLY")continue;
   const routeId=str(link.stage_id).split("#stage-")[0],r=routes.get(routeId);
   const precise=list(stageEvidence.get(routeId)?.waypoints).find(w=>
     str(w.waypoint_id)===str(link.stage_id)&&
     str(w.name_en)===str(link.original_stage_name));
   const citation=src([],precise?.source_url,precise?.name_en);
   if(!r||!citation)continue;
   const a=node("route",r.route_id,r.name,r.route_type),b=place(link.canonical_place_id);
   edge(a,b,"ROUTE_STAGE_SITE",citation,{
     en:link.site_relation==="RELATED_COMPLEX_ANCHOR"?
       "Related pilgrimage-site complex (not the precise stage entrance)":"Matched documented stage site",
     fr:link.site_relation==="RELATED_COMPLEX_ANCHOR"?
       "Ensemble religieux associé (non l'entrée exacte de l'étape)":"Site d'étape attesté"
   },link.stage_id);
 }
 for(const relic of list(dataset.sacredPhenomena?.relics)){
   const p=place(relic.place_id),n=node("relic",relic.id,relic.title_en,
     relic.authentication||"No independent app authentication");
   const citation=src([],relic.source_url,relic.title_en);
   edge(n,p,"RELIC_AT_SITE",citation,{
     en:"Reported association; relic authenticity not independently certified",
     fr:"Association déclarée ; authenticité non certifiée indépendamment"
   },relic.id);
   if(p&&n&&citation&&str(relic.associated_person)){
     const mention=node("person",relic.id,str(relic.associated_person),
       "Attributed source mention; no canonical Saints identity");
     edge(n,mention,"PERSON_SOURCE_MENTION",citation,null,relic.id);
   }
 }
 // Publish only exact Place attestations for already-published customs.
 // Never geocode area-only records, name hints, unpublished research, or claims.
 const linkedCustomPlaces=new Set();
 for(const att of list(dataset.customs?.attestations)){
   if(att.map_policy!=="PLACE"||att.geographic_precision!=="PLACE"||
      !str(att.place_id))continue;
   const custom=publishedCustoms.get(str(att.custom_id));
   const citation=customCitation(att.source_ids);
   const pair=str(att.custom_id)+"|"+str(att.place_id);
   if(!custom||!citation||linkedCustomPlaces.has(pair))continue;
   const p=place(att.place_id);if(!p)continue;
   const c=node("custom",custom.custom_id,custom.name,custom.family);
   edge(c,p,"CUSTOM_ATTESTED_PLACE",citation,{
     en:"Published practice documented at this exact place; not a universal obligation",
     fr:"Pratique publiée documentée en ce lieu précis ; sans obligation universelle"
   },str(att.attestation_id)||pair);
   linkedCustomPlaces.add(pair);
 }
 for(const app of list(dataset.sacredPhenomena?.apparitions)){
   const p=place(app.place_id),n=node("apparition",app.id,app.title_en,app.recognition_record);
   edge(n,p,"APPARITION_AT_SITE",src([],app.source_url,app.title_en),{
     en:"Historical source association, not an app declaration of supernatural origin",
     fr:"Association historique, sans déclaration d'origine surnaturelle par l'application"
   },app.id);
 }
 const subjects=new Map([
   ...[...pilgrimages].map(([id,p])=>[id,{key:"pilgrimage:"+id,name:p.name}]),
   ...[...routes].map(([id,r])=>[id,{key:"route:"+id,name:r.name}])
 ]);
 for(const t of list(dataset.shrines?.temporalLinks)){
   if(t.binding_state!=="BOUND_TO_CALENDAR"||!str(t.calendar_semantic_key))continue;
   const subject=subjects.get(t.subject_id);if(!subject)continue;
   const item=node("calendar",t.calendar_semantic_key,str(t.source_event_label||t.calendar_semantic_key),
     "Semantic calendar key · not a calculated 1962 date");
   edge(subject.key,item,"CALENDAR_CONTEXT",src(t.source_ids),{
     en:"Source-linked calendar semantic context (not an automatically scheduled observance)",
     fr:"Contexte calendaire sourcé (non une célébration programmée automatiquement)"
   },t.temporal_link_id);
 }
 // Remove accidental isolated nodes created when their relationship was rejected.
 const connected=new Set([...edges.values()].flatMap(e=>[e.from,e.to]));
 const kept=[...nodes.values()].filter(n=>connected.has(n.key));
 const neighbors=new Map(kept.map(n=>[n.key,[]]));
 for(const e of edges.values()){
   if(!neighbors.has(e.from)||!neighbors.has(e.to))continue;
   neighbors.get(e.from).push({edge:e,other:e.to});
   neighbors.get(e.to).push({edge:e,other:e.from});
 }
 return Object.freeze({nodes:Object.freeze(kept),edges:Object.freeze([...edges.values()]),
   neighbors,byKey:new Map(kept.map(n=>[n.key,n])),rejections:Object.freeze({...rejections})});
}
export function networkFocus(graph,{focus="",search="",kind="all",limit=14}={}){
 const eligible=graph.nodes.filter(n=>kind==="all"||n.type===kind);
 const phrase=str(search).toLocaleLowerCase();
 const ranked=eligible.filter(n=>!phrase||(n.name+" "+n.detail).toLocaleLowerCase().includes(phrase))
   .sort((a,b)=>(graph.neighbors.get(b.key)?.length||0)-(graph.neighbors.get(a.key)?.length||0)
     ||a.name.localeCompare(b.name));
 const current=graph.byKey.get(focus)||ranked[0]||graph.nodes[0]||null;
 const links=current?list(graph.neighbors.get(current.key)):[];
 const dedup=new Set();
 const relations=links.filter(x=>{
   if(dedup.has(x.other))return false;
   dedup.add(x.other);return graph.byKey.has(x.other);
 }).sort((a,b)=>{
   const x=graph.byKey.get(a.other),y=graph.byKey.get(b.other);
   return (graph.neighbors.get(y.key)?.length||0)-(graph.neighbors.get(x.key)?.length||0)
     ||x.name.localeCompare(y.name);
 }).slice(0,Math.min(20,Math.max(4,limit)));
 return {current,relations,results:ranked.slice(0,42),matching:ranked.length,
   connections:links.length};
}
