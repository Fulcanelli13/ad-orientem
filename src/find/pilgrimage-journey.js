// D / Pilgrimage Journey: source-owned named itineraries on the same map.
// Deliberately DOES NOT manufacture roads, paths, ordered intermediate stops,
// travel estimates, or coordinates for text-only origins.
const arr=value=>Array.isArray(value)?value:[];
const tidy=value=>String(value??"").trim();
const esc=value=>tidy(value).replace(/[&<>"']/g,c=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;",
})[c]);
const label=(lang,en,fr)=>lang==="fr"?fr:en;
const isHttp=value=>/^https:\/\/[^\s<>"']+$/i.test(tidy(value));
const validGeo=(geo,mapped)=>Boolean(mapped&&geo&&
  geo.lat!==null&&geo.lng!==null&&Number.isFinite(Number(geo.lat))&&
  Number.isFinite(Number(geo.lng))&&Math.abs(Number(geo.lat))<=90&&
  Math.abs(Number(geo.lng))<=180);

/** One record per documented route identity, linked only by exact route ID.
 * Do not treat all 240 pilgrimage destinations as verified routes. */
export function buildPilgrimageJourneyCatalogue(items=[],sources=[],stageEvidence=[]){
  // Exact route ID, published ordered names, primary organizer URL only.
  // No point ever inherits a destination coordinate by proximity or role.
  const evidenceMap=new Map(arr(stageEvidence).filter(row=>
    tidy(row?.route_id)&&arr(row?.waypoints).length>0&&isHttp(row?.source_url)
    &&row?.stage_geometry_policy==="NAMED_STAGES_ONLY_NO_WALKING_LINE"
  ).map(row=>[tidy(row.route_id),row]));
  const sourceMap=new Map(arr(sources).filter(x=>tidy(x?.id)&&isHttp(x?.url))
    .map(x=>[tidy(x.id),x]));
  const seen=new Set(),result=[];
  for(const item of arr(items)){
    if(item?.lens!=="pilgrimages")continue;
    for(const route of arr(item?.raw?.routes)){
      const id=tidy(route?.route_id);
      if(!id||seen.has(id)||!tidy(route?.name)||!tidy(route?.destination_place_id)
        ||route.destination_place_id!==item?.place_id)continue;
      seen.add(id);
      const links=arr(route.source_ids).map(sourceId=>sourceMap.get(tidy(sourceId)))
        .filter(Boolean).map(src=>Object.freeze({id:tidy(src.id),title:tidy(src.title)||tidy(src.issuer)||tidy(src.id),
          url:tidy(src.url),issuer:tidy(src.issuer)}));
      const geo=validGeo(item.geo,item.map_publishable)
        ?Object.freeze({lat:Number(item.geo.lat),lng:Number(item.geo.lng),
          approximate:Boolean(item.geo.approximate||item.geo.indicative_only)})
        :null;
      const evidence=evidenceMap.get(id);
      const ordered=arr(evidence?.waypoints).filter((stage,index,all)=>
        stage?.geometry_status==="NAMED_UNMAPPED"&&
        stage?.lat===null&&stage?.lng===null&&
        tidy(stage?.waypoint_id)&&isHttp(stage?.source_url)&&
        Number.isInteger(stage?.ordinal)&&stage.ordinal>0&&
        tidy(stage?.name_en)&&tidy(stage?.name_fr)&&
        all.findIndex(duplicate=>duplicate?.ordinal===stage.ordinal)===index
      ).sort((a,b)=>a.ordinal-b.ordinal);
      const namedStages=ordered.length===arr(evidence?.waypoints).length
        ?Object.freeze(ordered.map(stage=>Object.freeze({
          id:tidy(stage.waypoint_id),ordinal:stage.ordinal,
          name:tidy(stage.name_en),nameFr:tidy(stage.name_fr),
          role:tidy(stage.role),sourceUrl:tidy(stage.source_url),
          // Nominatim lookup, canonical Place and guessed path are NOT accepted.
          coordinates:null,status:"NAMED_UNMAPPED",
        }))):Object.freeze([]);
      const mappedStages=Object.freeze([]); // Not yet certified.
      const officialMapUrl=isHttp(evidence?.official_map_url)?tidy(evidence.official_map_url):null;
      const evidenceUrl=isHttp(evidence?.source_url)?tidy(evidence.source_url):null;
      const stages=Number(route.stage_count);
      const stageCount=route.stage_count!=null&&Number.isInteger(stages)&&stages>0?stages:null;
      result.push(Object.freeze({
        id,name:tidy(route.name),
        origin:tidy(route.origin_label),
        destination:tidy(item?.raw?.shrine?.name)||tidy(item.subtitle)||tidy(item.title),
        destinationPlaceId:tidy(route.destination_place_id),
        destinationGeo:geo,
        pilgrimageId:tidy(item.source_id),
        overview:tidy(item.summary),
        overviewFr:tidy(item.summary_fr),
        routeType:tidy(route.route_type)||"UNKNOWN",
        state:tidy(route.route_state),
        stageCount,
        edition:tidy(evidence?.edition),
        namedStages,mappedStages,officialMapUrl,
        sources:Object.freeze(evidenceUrl&&!links.some(link=>link.url===evidenceUrl)
          ?[...links,Object.freeze({id:id+"-stages",title:"Official named stages",
            url:evidenceUrl,issuer:"Pilgrimage organizer"})]:links),
        // A source-reported number is never a navigable waypoint collection.
        routeGeometry:null,
        stops:Object.freeze([]),
      }));
    }
  }
  return Object.freeze(result.sort((a,b)=>a.name.localeCompare(b.name)));
}
export function selectedPilgrimageJourney(routes=[],id=null){
  return arr(routes).find(row=>row.id===id)??arr(routes)[0]??null;
}
export function renderPilgrimageJourneyPanel({
  language="en",routes=[],selectedId=null,
}={}){
  const r=arr(routes),selected=selectedPilgrimageJourney(r,selectedId);
  let html='<aside class="aoJourneyPanel" data-explore-journey-panel aria-label="'+
    esc(label(language,"Pilgrimage journeys","Parcours de pèlerinage"))+'">';
  html+='<header class="aoJourneyHeader"><div><small>AD ORIENTEM · '+esc(label(language,"PILGRIMAGE","PÈLERINAGE"))+
    '</small><h2>'+esc(label(language,"Journeys","Parcours"))+'</h2></div>';
  html+='<button type="button" data-explore-journey-close aria-label="'+
    esc(label(language,"Return to atlas","Retour à l’atlas"))+'">×</button></header>';
  html+='<p class="aoJourneyScope">'+esc(label(language,
    r.length+" documented routes · route lines and intermediate waypoints not yet mapped",
    r.length+" parcours attestés · tracés et étapes intermédiaires non cartographiés"))+'</p>';
  if(!selected){
    html+='<p class="aoJourneyEmpty">'+esc(label(language,
      "No sourced itineraries are available in this build.",
      "Aucun itinéraire sourcé n’est disponible dans cette version."))+'</p></aside>';
    return html;
  }
  html+='<nav class="aoJourneyRoutes" aria-label="'+esc(label(language,"Choose a documented journey","Choisir un parcours attesté"))+'">';
  r.forEach((item,i)=>{
    const active=item.id===selected.id;
    html+='<button type="button" data-explore-journey-select="'+esc(item.id)+
      '" aria-pressed="'+active+'" class="'+(active?"active":"")+'"><small>'+
      esc(String(i+1).padStart(2,"0"))+' / '+r.length+'</small><strong>'+
      esc(item.name)+'</strong></button>';
  });
  html+='</nav><article class="aoJourneyDetail" aria-live="polite">';
  html+='<div class="aoJourneyType">'+esc(selected.routeType==="ON_SITE_PATH"
    ?label(language,"On-site pilgrim path","Parcours sur le site")
    :selected.routeType==="WALKING"?label(language,"Walking pilgrimage","Pèlerinage à pied")
    :label(language,"Documented journey","Parcours attesté"))+'</div>';
  html+='<h3>'+esc(selected.name)+'</h3>';
  html+='<ol class="aoJourneyAnchors">';
  if(selected.namedStages.length){
    selected.namedStages.forEach((stage,index)=>{
      const heading=stage.role==="START"
        ?label(language,"DOCUMENTED ORIGIN","DÉPART ATTESTÉ")
        :stage.role==="JOIN_IN"?label(language,"JOIN-IN POINT","POINT DE REJOINT")
        :stage.role==="PASS_THROUGH"?label(language,"ROUTE PASSES THROUGH","LE PARCOURS PASSE PAR")
        :stage.role.startsWith("DESTINATION")?label(language,"DOCUMENTED DESTINATION / FINAL STAGE","DESTINATION / DERNIÈRE ÉTAPE")
        :label(language,"DOCUMENTED STAGE","ÉTAPE ATTESTÉE");
      html+='<li data-journey-named-stage="'+esc(stage.id)+'"><span class="aoJourneyNode" aria-hidden="true">'+
        esc(String(index+1))+'</span><div><small>'+esc(heading)+' · '+esc(String(index+1))+
        '/'+esc(String(selected.namedStages.length))+'</small><strong>'+
        esc(language==="fr"?stage.nameFr:stage.name)+'</strong></div></li>';
    });
  }else{
    html+='<li><span class="aoJourneyNode" aria-hidden="true">○</span><div><small>'+
      esc(label(language,"DOCUMENTED ORIGIN · TEXT ONLY","DÉPART ATTESTÉ · TEXTE SEUL"))+'</small><strong>'+
      esc(selected.origin||label(language,"Origin not recorded","Départ non renseigné"))+'</strong></div></li>';
    html+='<li><span class="aoJourneyNode" aria-hidden="true">✦</span><div><small>'+
      esc(label(language,"DOCUMENTED DESTINATION","DESTINATION ATTESTÉE"))+'</small><strong>'+
      esc(selected.destination)+'</strong>'+
      (selected.destinationGeo?.approximate?'<em>'+esc(label(language,
        "Indicative pin · not a verified entrance","Repère indicatif · entrée non vérifiée"))+'</em>':"")+
      '</div></li>';
  }
  html+='</ol>';
  if(selected.edition)html+='<p class="aoJourneyStages">'+esc(label(language,
    "Documented edition: "+selected.edition+" · route may vary between years",
    "Édition attestée : "+selected.edition+" · parcours susceptible de changer selon l’année"))+'</p>';
  if(selected.stageCount&&!selected.namedStages.length)html+='<p class="aoJourneyStages">'+esc(label(language,
    selected.stageCount+" source-reported stages; individual locations not yet mapped",
    selected.stageCount+" étapes signalées par les sources ; emplacements non cartographiés"))+'</p>';
  if(selected.namedStages.length)html+='<p class="aoJourneyStages">'+esc(label(language,
    selected.namedStages.length+" named stages from official evidence · no geolocated waypoint yet",
    selected.namedStages.length+" étapes nommées selon les sources officielles · aucun repère géolocalisé"))+'</p>';
  html+='<p class="aoJourneyNoLine">'+esc(label(language,
    "This is a documented pilgrimage, not turn-by-turn directions. No route line, distance or travel time is asserted.",
    "Ce pèlerinage est attesté, mais sans guidage GPS. Aucun tracé, distance ni durée ne sont affirmés."))+'</p>';
  html+='<div class="aoJourneyActions">';
  if(selected.officialMapUrl)html+='<a class="aoJourneyOfficialMap" href="'+esc(selected.officialMapUrl)+
    '" target="_blank" rel="noopener noreferrer">'+
    esc(label(language,"Official interactive route map ↗","Carte officielle du parcours ↗"))+'</a>';
  if(selected.destinationGeo)html+='<button type="button" data-explore-journey-focus>'+
    esc(selected.routeType==="ON_SITE_PATH"
      ?label(language,"Show sanctuary anchor","Voir le sanctuaire")
      :label(language,"Show destination","Voir la destination"))+'</button>';
  html+='<button type="button" data-explore-journey-destination="'+esc(selected.destinationPlaceId)+'">'+
    esc(label(language,"Discover sacred place","Découvrir le lieu sacré"))+'</button></div>';
  if(selected.sources.length){
    html+='<div class="aoJourneyEvidence"><strong>'+esc(label(language,"Original sources","Sources originales"))+'</strong>';
    selected.sources.forEach(source=>{
      html+='<a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.title)+' ↗</a>';
    });
    html+='</div>';
  }else html+='<p class="aoJourneyNoLine">'+esc(label(language,
      "Route evidence is linked to the original pilgrimage record; public source links are not yet available here.",
      "Les références appartiennent à la fiche de pèlerinage ; aucun lien public direct n’est encore disponible ici."))+'</p>';
  html+='</article></aside>';return html;
}
