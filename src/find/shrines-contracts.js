export const SHRINES_PILGRIMAGES_SCHEMA = "SHRINES_PILGRIMAGES_SOT_V1";

export const SHRINE_KINDS = Object.freeze(["MARIAN","CHRISTOLOGICAL","SAINT","OTHER"]);
export const RECOGNITION_CLASSES = Object.freeze(["OFFICIAL_SANCTUARY","OTHER_OFFICIAL","UNKNOWN"]);
export const PILGRIMAGE_KINDS = Object.freeze([
  "DESTINATION_PILGRIMAGE",
  "ANNUAL_PILGRIMAGE",
  "PILGRIM_PATH",
  "PROCESSIONAL_PILGRIMAGE",
  "OTHER",
]);
export const ROUTE_TYPES = Object.freeze(["WALKING","ON_SITE_PATH","PROCESSION","MIXED","UNKNOWN"]);
export const ROUTE_STATES = Object.freeze(["NO_ROUTE","DOCUMENTED_UNMAPPED","MAPPED"]);
export const TEMPORAL_RELATIONS = Object.freeze([
  "SHRINE_FEAST",
  "PATRONAL_FEAST",
  "LITURGICAL_DAY",
  "SEASONAL",
  "SOURCE_EVENT",
  "NONE",
]);
export const TEMPORAL_BINDING_STATES = Object.freeze([
  "NO_FIXED_CALENDAR_BINDING",
  "PENDING_CALENDAR_BINDING",
  "BOUND_TO_CALENDAR",
]);
export const CONFIDENCE = Object.freeze(["HIGH","MEDIUM_HIGH","MEDIUM","LOW"]);
export const SOURCE_DIRECTNESS = Object.freeze([
  "OFFICIAL_SHRINE",
  "OFFICIAL_DIOCESAN",
  "OFFICIAL_CHURCH",
  "OFFICIAL_PILGRIMAGE_SITE",
  "PRIMARY_HISTORICAL",
  "DIRECT_PILGRIMAGE_ORGANIZER",
  "SECONDARY",
]);

const shrineKindSet=new Set(SHRINE_KINDS);
const recognitionSet=new Set(RECOGNITION_CLASSES);
const pilgrimageKindSet=new Set(PILGRIMAGE_KINDS);
const routeTypeSet=new Set(ROUTE_TYPES);
const routeStateSet=new Set(ROUTE_STATES);
const temporalRelationSet=new Set(TEMPORAL_RELATIONS);
const bindingSet=new Set(TEMPORAL_BINDING_STATES);
const confidenceSet=new Set(CONFIDENCE);
const directnessSet=new Set(SOURCE_DIRECTNESS);

function issue(code,path,message){return Object.freeze({code,path,message});}
function nonEmpty(value){return typeof value==="string"&&value.trim().length>0;}
function nonEmptyArray(value){return Array.isArray(value)&&value.filter(nonEmpty).length>0;}

export function auditShrine(shrine,path="shrine"){
  const issues=[];
  if(!shrine||typeof shrine!=="object"){
    return [issue("SHRINE_REQUIRED",path,"Shrine must be an object.")];
  }
  for(const [field,code] of [
    ["shrine_id","MISSING_SHRINE_ID"],
    ["place_id","MISSING_SHRINE_PLACE_ID"],
    ["name","MISSING_SHRINE_NAME"],
    ["dedication","MISSING_SHRINE_DEDICATION"],
  ]){
    if(!nonEmpty(shrine[field]))issues.push(issue(code,`${path}.${field}`,`${field} is required.`));
  }
  if(!shrineKindSet.has(shrine.shrine_kind)){
    issues.push(issue("INVALID_SHRINE_KIND",`${path}.shrine_kind`,`Unsupported shrine kind: ${shrine.shrine_kind}`));
  }
  if(!recognitionSet.has(shrine.recognition_class)){
    issues.push(issue("INVALID_RECOGNITION_CLASS",`${path}.recognition_class`,`Unsupported recognition class: ${shrine.recognition_class}`));
  }
  if(!confidenceSet.has(shrine.confidence)){
    issues.push(issue("INVALID_SHRINE_CONFIDENCE",`${path}.confidence`,`Unsupported confidence: ${shrine.confidence}`));
  }
  if(!nonEmptyArray(shrine.source_ids)){
    issues.push(issue("MISSING_SHRINE_PROVENANCE",`${path}.source_ids`,"Shrine requires at least one source id."));
  }
  return issues;
}

export function auditPilgrimage(pilgrimage,path="pilgrimage"){
  const issues=[];
  if(!pilgrimage||typeof pilgrimage!=="object"){
    return [issue("PILGRIMAGE_REQUIRED",path,"Pilgrimage must be an object.")];
  }
  for(const [field,code] of [
    ["pilgrimage_id","MISSING_PILGRIMAGE_ID"],
    ["name","MISSING_PILGRIMAGE_NAME"],
    ["destination_shrine_id","MISSING_PILGRIMAGE_DESTINATION"],
  ]){
    if(!nonEmpty(pilgrimage[field]))issues.push(issue(code,`${path}.${field}`,`${field} is required.`));
  }
  if(!pilgrimageKindSet.has(pilgrimage.kind)){
    issues.push(issue("INVALID_PILGRIMAGE_KIND",`${path}.kind`,`Unsupported pilgrimage kind: ${pilgrimage.kind}`));
  }
  if(!confidenceSet.has(pilgrimage.confidence)){
    issues.push(issue("INVALID_PILGRIMAGE_CONFIDENCE",`${path}.confidence`,`Unsupported confidence: ${pilgrimage.confidence}`));
  }
  if(!Array.isArray(pilgrimage.route_ids)){
    issues.push(issue("INVALID_PILGRIMAGE_ROUTES",`${path}.route_ids`,"route_ids must be an array."));
  }
  if(!Array.isArray(pilgrimage.temporal_link_ids)){
    issues.push(issue("INVALID_PILGRIMAGE_TEMPORAL_LINKS",`${path}.temporal_link_ids`,"temporal_link_ids must be an array."));
  }
  if(!nonEmptyArray(pilgrimage.source_ids)){
    issues.push(issue("MISSING_PILGRIMAGE_PROVENANCE",`${path}.source_ids`,"Pilgrimage requires at least one source id."));
  }
  return issues;
}

export function auditRoute(route,path="route"){
  const issues=[];
  if(!route||typeof route!=="object"){
    return [issue("ROUTE_REQUIRED",path,"Pilgrimage route must be an object.")];
  }
  for(const [field,code] of [
    ["route_id","MISSING_ROUTE_ID"],
    ["name","MISSING_ROUTE_NAME"],
    ["destination_place_id","MISSING_ROUTE_DESTINATION"],
  ]){
    if(!nonEmpty(route[field]))issues.push(issue(code,`${path}.${field}`,`${field} is required.`));
  }
  if(!routeTypeSet.has(route.route_type)){
    issues.push(issue("INVALID_ROUTE_TYPE",`${path}.route_type`,`Unsupported route type: ${route.route_type}`));
  }
  if(!routeStateSet.has(route.route_state)){
    issues.push(issue("INVALID_ROUTE_STATE",`${path}.route_state`,`Unsupported route state: ${route.route_state}`));
  }
  if(!confidenceSet.has(route.confidence)){
    issues.push(issue("INVALID_ROUTE_CONFIDENCE",`${path}.confidence`,`Unsupported confidence: ${route.confidence}`));
  }
  if(!nonEmptyArray(route.source_ids)){
    issues.push(issue("MISSING_ROUTE_PROVENANCE",`${path}.source_ids`,"Route requires at least one source id."));
  }
  if(route.route_state==="MAPPED"){
    const waypointIds=route.waypoint_place_ids??[];
    if(!nonEmpty(route.geometry_ref)&&!nonEmptyArray(waypointIds)){
      issues.push(issue("MAPPED_ROUTE_LACKS_GEOMETRY",path,"MAPPED routes require geometry_ref or canonical waypoint_place_ids."));
    }
  }
  if(route.route_state==="DOCUMENTED_UNMAPPED"&&nonEmpty(route.geometry_ref)){
    issues.push(issue("UNMAPPED_ROUTE_HAS_GEOMETRY",`${path}.geometry_ref`,"DOCUMENTED_UNMAPPED routes must not publish geometry."));
  }
  return issues;
}

export function auditTemporalLink(link,path="temporal_link"){
  const issues=[];
  if(!link||typeof link!=="object"){
    return [issue("TEMPORAL_LINK_REQUIRED",path,"Temporal link must be an object.")];
  }
  for(const [field,code] of [
    ["temporal_link_id","MISSING_TEMPORAL_LINK_ID"],
    ["subject_type","MISSING_TEMPORAL_SUBJECT_TYPE"],
    ["subject_id","MISSING_TEMPORAL_SUBJECT_ID"],
  ]){
    if(!nonEmpty(link[field]))issues.push(issue(code,`${path}.${field}`,`${field} is required.`));
  }
  if(!["SHRINE","PILGRIMAGE"].includes(link.subject_type)){
    issues.push(issue("INVALID_TEMPORAL_SUBJECT_TYPE",`${path}.subject_type`,`Unsupported subject type: ${link.subject_type}`));
  }
  if(!temporalRelationSet.has(link.relation)){
    issues.push(issue("INVALID_TEMPORAL_RELATION",`${path}.relation`,`Unsupported temporal relation: ${link.relation}`));
  }
  if(!bindingSet.has(link.binding_state)){
    issues.push(issue("INVALID_TEMPORAL_BINDING_STATE",`${path}.binding_state`,`Unsupported binding state: ${link.binding_state}`));
  }
  if(!confidenceSet.has(link.confidence)){
    issues.push(issue("INVALID_TEMPORAL_CONFIDENCE",`${path}.confidence`,`Unsupported confidence: ${link.confidence}`));
  }
  if(!nonEmptyArray(link.source_ids)){
    issues.push(issue("MISSING_TEMPORAL_PROVENANCE",`${path}.source_ids`,"Temporal link requires at least one source id."));
  }

  if(["PENDING_CALENDAR_BINDING","BOUND_TO_CALENDAR"].includes(link.binding_state)&&!nonEmpty(link.calendar_semantic_key)){
    issues.push(issue("MISSING_CALENDAR_SEMANTIC_KEY",`${path}.calendar_semantic_key`,"Calendar-bound links require calendar_semantic_key."));
  }
  if(link.binding_state==="BOUND_TO_CALENDAR"&&!nonEmpty(link.calendar_registry_version)){
    issues.push(issue("MISSING_CALENDAR_REGISTRY_VERSION",`${path}.calendar_registry_version`,"Resolved Calendar bindings require the owning Calendar registry version."));
  }
  if(link.binding_state==="NO_FIXED_CALENDAR_BINDING"&&nonEmpty(link.calendar_semantic_key)){
    issues.push(issue("UNEXPECTED_CALENDAR_SEMANTIC_KEY",`${path}.calendar_semantic_key`,"No-fixed-binding links must not carry a Calendar semantic key."));
  }

  const forbiddenFields=[
    "date","month","day","year","offset","easter_offset","start_date","end_date",
    "startDate","endDate","rrule","cron","recurrence","weekday","week_of_month"
  ];
  for(const field of forbiddenFields){
    if(Object.prototype.hasOwnProperty.call(link,field)){
      issues.push(issue(
        "TEMPORAL_DATE_LOGIC_OUTSIDE_CALENDAR",
        `${path}.${field}`,
        "Shrine/Pilgrimage temporal links may not duplicate date or recurrence logic owned by Calendar.",
      ));
    }
  }
  return issues;
}

export function auditShrineSource(source,path="source"){
  const issues=[];
  if(!source||typeof source!=="object"){
    return [issue("SHRINE_SOURCE_REQUIRED",path,"Source must be an object.")];
  }
  for(const [field,code] of [
    ["id","MISSING_SOURCE_ID"],
    ["title","MISSING_SOURCE_TITLE"],
    ["issuer","MISSING_SOURCE_ISSUER"],
    ["contribution","MISSING_SOURCE_CONTRIBUTION"],
  ]){
    if(!nonEmpty(source[field]))issues.push(issue(code,`${path}.${field}`,`${field} is required.`));
  }
  if(!directnessSet.has(source.directness)){
    issues.push(issue("INVALID_SOURCE_DIRECTNESS",`${path}.directness`,`Unsupported directness: ${source.directness}`));
  }
  if(!nonEmpty(source.url)){
    issues.push(issue("MISSING_SOURCE_URL",`${path}.url`,"Shrine/Pilgrimage seed sources require a direct URL."));
  }
  return issues;
}

export function assertShrinesPilgrimagesRegistry({
  shrines=[],
  pilgrimages=[],
  routes=[],
  temporalLinks=[],
  sources=[],
  places=[],
}={}){
  const issues=[];
  const placeIds=new Set(places.map(item=>item?.place_id).filter(nonEmpty));
  const sourceIds=new Set();
  const shrineIds=new Set();
  const pilgrimageIds=new Set();
  const routeIds=new Set();
  const temporalIds=new Set();

  sources.forEach((source,index)=>{
    issues.push(...auditShrineSource(source,`sources[${index}]`));
    if(nonEmpty(source?.id)){
      if(sourceIds.has(source.id))issues.push(issue("DUPLICATE_SHRINE_SOURCE_ID",`sources[${index}].id`,source.id));
      sourceIds.add(source.id);
    }
  });

  shrines.forEach((shrine,index)=>{
    const path=`shrines[${index}]`;
    issues.push(...auditShrine(shrine,path));
    if(nonEmpty(shrine?.shrine_id)){
      if(shrineIds.has(shrine.shrine_id))issues.push(issue("DUPLICATE_SHRINE_ID",`${path}.shrine_id`,shrine.shrine_id));
      shrineIds.add(shrine.shrine_id);
    }
    if(nonEmpty(shrine?.place_id)&&!placeIds.has(shrine.place_id)){
      issues.push(issue("UNKNOWN_SHRINE_PLACE",`${path}.place_id`,shrine.place_id));
    }
    for(const sourceId of shrine?.source_ids??[]){
      if(nonEmpty(sourceId)&&!sourceIds.has(sourceId))issues.push(issue("UNKNOWN_SHRINE_SOURCE",`${path}.source_ids`,sourceId));
    }
  });

  routes.forEach((route,index)=>{
    const path=`routes[${index}]`;
    issues.push(...auditRoute(route,path));
    if(nonEmpty(route?.route_id)){
      if(routeIds.has(route.route_id))issues.push(issue("DUPLICATE_ROUTE_ID",`${path}.route_id`,route.route_id));
      routeIds.add(route.route_id);
    }
    if(nonEmpty(route?.destination_place_id)&&!placeIds.has(route.destination_place_id)){
      issues.push(issue("UNKNOWN_ROUTE_DESTINATION",`${path}.destination_place_id`,route.destination_place_id));
    }
    for(const waypointId of route?.waypoint_place_ids??[]){
      if(nonEmpty(waypointId)&&!placeIds.has(waypointId)){
        issues.push(issue("UNKNOWN_ROUTE_WAYPOINT",`${path}.waypoint_place_ids`,waypointId));
      }
    }
    for(const sourceId of route?.source_ids??[]){
      if(nonEmpty(sourceId)&&!sourceIds.has(sourceId))issues.push(issue("UNKNOWN_ROUTE_SOURCE",`${path}.source_ids`,sourceId));
    }
  });

  pilgrimages.forEach((pilgrimage,index)=>{
    const path=`pilgrimages[${index}]`;
    issues.push(...auditPilgrimage(pilgrimage,path));
    if(nonEmpty(pilgrimage?.pilgrimage_id)){
      if(pilgrimageIds.has(pilgrimage.pilgrimage_id))issues.push(issue("DUPLICATE_PILGRIMAGE_ID",`${path}.pilgrimage_id`,pilgrimage.pilgrimage_id));
      pilgrimageIds.add(pilgrimage.pilgrimage_id);
    }
    if(nonEmpty(pilgrimage?.destination_shrine_id)&&!shrineIds.has(pilgrimage.destination_shrine_id)){
      issues.push(issue("UNKNOWN_PILGRIMAGE_SHRINE",`${path}.destination_shrine_id`,pilgrimage.destination_shrine_id));
    }
    for(const routeId of pilgrimage?.route_ids??[]){
      if(nonEmpty(routeId)&&!routeIds.has(routeId))issues.push(issue("UNKNOWN_PILGRIMAGE_ROUTE",`${path}.route_ids`,routeId));
    }
    for(const sourceId of pilgrimage?.source_ids??[]){
      if(nonEmpty(sourceId)&&!sourceIds.has(sourceId))issues.push(issue("UNKNOWN_PILGRIMAGE_SOURCE",`${path}.source_ids`,sourceId));
    }
  });

  temporalLinks.forEach((link,index)=>{
    const path=`temporalLinks[${index}]`;
    issues.push(...auditTemporalLink(link,path));
    if(nonEmpty(link?.temporal_link_id)){
      if(temporalIds.has(link.temporal_link_id))issues.push(issue("DUPLICATE_TEMPORAL_LINK_ID",`${path}.temporal_link_id`,link.temporal_link_id));
      temporalIds.add(link.temporal_link_id);
    }
    if(link?.subject_type==="SHRINE"&&nonEmpty(link.subject_id)&&!shrineIds.has(link.subject_id)){
      issues.push(issue("UNKNOWN_TEMPORAL_SHRINE",`${path}.subject_id`,link.subject_id));
    }
    if(link?.subject_type==="PILGRIMAGE"&&nonEmpty(link.subject_id)&&!pilgrimageIds.has(link.subject_id)){
      issues.push(issue("UNKNOWN_TEMPORAL_PILGRIMAGE",`${path}.subject_id`,link.subject_id));
    }
    for(const sourceId of link?.source_ids??[]){
      if(nonEmpty(sourceId)&&!sourceIds.has(sourceId))issues.push(issue("UNKNOWN_TEMPORAL_SOURCE",`${path}.source_ids`,sourceId));
    }
  });

  for(let i=0;i<pilgrimages.length;i+=1){
    for(const linkId of pilgrimages[i]?.temporal_link_ids??[]){
      if(nonEmpty(linkId)&&!temporalIds.has(linkId)){
        issues.push(issue("UNKNOWN_PILGRIMAGE_TEMPORAL_LINK",`pilgrimages[${i}].temporal_link_ids`,linkId));
      }
    }
  }

  if(issues.length){
    const error=new Error(issues.map(entry=>`${entry.code} @ ${entry.path}: ${entry.message}`).join("\n"));
    error.issues=issues;
    throw error;
  }

  return Object.freeze({
    pass:true,
    counts:Object.freeze({
      shrines:shrines.length,
      pilgrimages:pilgrimages.length,
      routes:routes.length,
      temporalLinks:temporalLinks.length,
      sources:sources.length,
    }),
    unresolvedCalendarBindings:Object.freeze(
      temporalLinks
        .filter(item=>item.binding_state==="PENDING_CALENDAR_BINDING")
        .map(item=>item.temporal_link_id),
    ),
  });
}
