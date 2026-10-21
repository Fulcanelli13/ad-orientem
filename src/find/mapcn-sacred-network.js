// P5 relationship network over canonical Explore registries.
// Edges are explicit source assertions, never coordinate proximity, name match,
// walking route geometry, saint identity reconciliation, or live availability.
const list=value=>Array.isArray(value)?value:[];
const str=value=>String(value??"").trim();
const link=value=>/^https:\/\/[^\s<>"']+$/i.test(str(value))?str(value):"";
export const RELATION_KINDS=Object.freeze(["ALL","PLACE","SHRINE","PILGRIMAGE","RELIC","APPARITION","CUSTOM","CALENDAR","PERSON"]);
const displayId=id=>str(id).replace(/^(place|shrine|pilgrimage|route|calendar|relic|apparition|custom|person):/,"").replace(/[-_.]/g," ");
function sourceFor(ids,lookup){
  return list(ids).map(id=>lookup.get(str(id))).find(s=>link(s?.url))??null;
}
export function buildSacredRelationshipNetwork(data={}){
  const nodes=new Map(),edges=new Map();
  const places=new Map(list(data.geography?.places).filter(x=>str(x?.place_id))
    .map(x=>[x.place_id,x]));
  const shrineSources=new Map(list(data.shrines?.sources).filter(x=>str(x?.id)).map(x=>[x.id,x]));
  const customsSources=new Map(list(data.customs?.sources).filter(x=>str(x?.id)).map(x=>[x.id,x]));
  const publishedCustoms=new Map(list(data.customs?.customs)
    .filter(x=>x?.publication_state==="PUBLISHED"&&str(x.custom_id))
    .map(x=>[x.custom_id,x]));
  const add=(id,type,label,extra={})=>{
    if(!str(id))return null;
    const existing=nodes.get(id);
    if(existing)return existing;
    const node=Object.freeze({id,type,label:str(label)||displayId(id),...extra});
    nodes.set(id,node);return node;
  };
  const place=id=>{
    const item=places.get(id);
    return item?add(id,"PLACE",item.name?.official||item.name?.en||item.name?.fr||id,{placeId:id}):null;
  };
  const edge=(a,b,type,url,description="",scope="")=>{
    if(!nodes.has(a)||!nodes.has(b)||a===b||!link(url)||!RELATION_KINDS.includes(type))return;
    const key=[a,b,type,url].join("\u001f");
    if(edges.has(key))return;
    edges.set(key,Object.freeze({id:key,from:a,to:b,type,url:link(url),description:str(description),scope:str(scope)}));
  };
  for(const r of list(data.geography?.placeRelationships)){
    const a=place(r.source_place_id),b=place(r.target_place_id);
    if(a&&b)edge(a.id,b.id,"PLACE",r.source_url,r.description_en||r.relationship_kind,r.relationship_kind);
  }
  const shrineMap=new Map();
  for(const r of list(data.shrines?.shrines)){
    const p=place(r.place_id),source=sourceFor(r.source_ids,shrineSources);
    if(!p||!source)continue;
    const s=add(r.shrine_id,"SHRINE",r.name,{placeId:p.id});
    if(s){shrineMap.set(r.shrine_id,s);edge(p.id,s.id,"SHRINE",source.url,r.origin_summary||r.shrine_kind);}
    // These are explicitly attributed *strings*. No canonical Saints ID is inferred.
    for(const name of list(r.associated_saints).filter(Boolean)){
      const id="person-mention:"+r.shrine_id+":"+name;
      if(!s)continue;
      add(id,"PERSON",name,{attributionOnly:true});
      edge(s.id,id,"PERSON",source.url,"Sourced person mention · not an independently joined Saints profile");
    }
  }
  const pilgrimageMap=new Map();
  for(const r of list(data.shrines?.pilgrimages)){
    const s=shrineMap.get(r.destination_shrine_id);
    const source=sourceFor(r.source_ids,shrineSources);
    if(!s||!source)continue;
    const p=add(r.pilgrimage_id,"PILGRIMAGE",r.name);
    if(p){pilgrimageMap.set(r.pilgrimage_id,p);edge(p.id,s.id,"PILGRIMAGE",source.url,r.scope_note||r.kind);}
  }
  const routeMap=new Map();
  for(const r of list(data.shrines?.routes)){
    const p=place(r.destination_place_id),source=sourceFor(r.source_ids,shrineSources);
    if(!p||!source)continue;
    const id=str(r.route_id),route=add(id,"PILGRIMAGE",r.name);
    if(route){
      routeMap.set(id,route);
      edge(route.id,p.id,"PILGRIMAGE",source.url,
        "Source-named destination. Conceptual association; not a surveyed route or connecting path.");
    }
  }
  const stageEvidence=new Map(list(data.shrines?.routeStageEvidence)
    .filter(x=>str(x?.route_id)).map(x=>[x.route_id,x]));
  for(const stage of list(data.shrines?.routeStageSiteLinks)){
    if(!["MATCHED_SITE","RELATED_COMPLEX_ANCHOR"].includes(stage.site_relation)||
       stage.coordinate_source!=="CANONICAL_GEOGRAPHY_ONLY")continue;
    const routeId=str(stage.stage_id).split("#")[0],r=routeMap.get(routeId);
    const p=place(stage.canonical_place_id),ev=stageEvidence.get(routeId);
    const exact=list(ev?.waypoints).find(w=>w?.waypoint_id===stage.stage_id&&
      str(w?.name_en)===str(stage.original_stage_name));
    if(!r||!p||!exact)continue;
    edge(r.id,p.id,"PILGRIMAGE",exact.source_url,
      str(stage.original_stage_name)+" · "+(stage.site_relation==="RELATED_COMPLEX_ANCHOR"?
      "related complex, not precise stage position":"documented canonical site"),
      stage.site_relation);
  }
  for(const r of list(data.sacredPhenomena?.relics)){
    const p=place(r.place_id);
    if(!p||!link(r.source_url))continue;
    const relic=add(r.id,"RELIC",r.title_en||r.title_fr);
    if(relic)edge(relic.id,p.id,"RELIC",r.source_url,r.summary_en||r.source_claim);
    if(str(r.associated_person)){
      const n=add("person-mention:"+r.id,"PERSON",r.associated_person,{attributionOnly:true});
      if(n&&relic)edge(relic.id,n.id,"PERSON",r.source_url,
        "Sourced associated-person wording; no global Saints identity join");
    }
  }
  for(const r of list(data.sacredPhenomena?.apparitions)){
    const p=place(r.place_id);
    if(!p||!link(r.source_url))continue;
    const apparition=add(r.id,"APPARITION",r.title_en||r.title_fr);
    if(apparition)edge(apparition.id,p.id,"APPARITION",r.source_url,
      r.summary_en||r.recognition_record, r.recognition_record);
  }
  for(const r of list(data.customs?.attestations)){
    const p=place(r.place_id),c=publishedCustoms.get(r.custom_id),
      source=sourceFor(r.source_ids,customsSources);
    if(!p||!c||!source||r.map_policy==="AREA_CONTEXT")continue;
    const custom=add("custom:"+r.custom_id,"CUSTOM",c.name);
    if(custom)edge(custom.id,p.id,"CUSTOM",source.url,r.evidence_note||r.strength);
  }
  for(const r of list(data.shrines?.temporalLinks)){
    if(r.binding_state!=="BOUND_TO_CALENDAR"||!str(r.calendar_semantic_key))continue;
    const subject=r.subject_type==="PILGRIMAGE"?pilgrimageMap.get(r.subject_id):
      r.subject_type==="ROUTE"?routeMap.get(r.subject_id):null;
    const source=sourceFor(r.source_ids,shrineSources);
    if(!subject||!source)continue;
    const key="calendar:"+r.calendar_semantic_key;
    const calendar=add(key,"CALENDAR",r.source_event_label||displayId(key));
    if(calendar)edge(subject.id,calendar.id,"CALENDAR",source.url,
      "Calendar semantic association, not an automatically computed occurrence",
      r.relation);
  }
  // Orphaned nodes are omitted: a network item requires a documented edge.
  const linked=new Set([...edges.values()].flatMap(x=>[x.from,x.to]));
  for(const id of nodes.keys())if(!linked.has(id))nodes.delete(id);
  const degree=new Map([...nodes.keys()].map(id=>[id,0]));
  for(const e of edges.values()){degree.set(e.from,(degree.get(e.from)||0)+1);degree.set(e.to,(degree.get(e.to)||0)+1);}
  // An actual sacred PLACE is the most helpful initial root. Generic custom
  // records may have many attestations but should not own the first screen.
  const ordered=[...nodes.values()].sort((a,b)=>
    Number(b.type==="PLACE")-Number(a.type==="PLACE")||
    (degree.get(b.id)||0)-(degree.get(a.id)||0)||
    a.label.localeCompare(b.label));
  return Object.freeze({nodes:Object.freeze(ordered),edges:Object.freeze([...edges.values()]),
    totalNodes:nodes.size,totalEdges:edges.size,
    byId:nodes,degree});
}
export function sacredNetworkNeighborhood(network,rootId,{kind="ALL",limit=9}={}){
  const root=network.byId.get(rootId)||network.nodes[0]||null;
  if(!root)return {root:null,connections:[],total:0};
  const connected=network.edges.filter(e=>(e.from===root.id||e.to===root.id)&&
     (kind==="ALL"||e.type===kind)).map(e=>({
      edge:e,node:network.byId.get(e.from===root.id?e.to:e.from)
  })).filter(x=>x.node).sort((a,b)=>a.node.type.localeCompare(b.node.type)||a.node.label.localeCompare(b.node.label));
  return {root,connections:connected.slice(0,Math.min(20,Math.max(3,limit))),total:connected.length};
}
