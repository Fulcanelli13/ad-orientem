// Read-only relationships over canonical owners. Never writes Calendar dates,
// Place coordinates, relic authenticity, saint identities or new map pins.
// Consumers must distinguish public source context from editorial-only links.
export const CONNECTED_SACRED_ENTITIES_VERSION="ao.connected-sacred-entities.v1";
const rows=x=>Array.isArray(x)?x:[];
const set=x=>new Set(rows(x));
const valid=(x,prefix)=>typeof x==="string"&&x.startsWith(prefix)&&x.length>prefix.length;
const https=url=>typeof url==="string"&&/^https:\/\/[^\s]+$/.test(url);
const frozen=x=>Object.freeze(x);

export function deriveConnectedSacredEntities(dataset={}, {calendarSemanticKeys=[]}={}){
  const places=new Set(rows(dataset.geography?.places).map(x=>x.place_id).filter(x=>valid(x,"place:")));
  const customRecords=new Map(rows(dataset.customs?.customs)
    .filter(x=>x?.publication_state==="PUBLISHED").map(x=>[x.custom_id,x]));
  const shrines=new Map(rows(dataset.shrines?.shrines)
    .filter(x=>valid(x?.shrine_id,"shrine:")&&places.has(x.place_id))
    .map(x=>[x.shrine_id,x]));
  const pilgrimageById=new Map(rows(dataset.shrines?.pilgrimages)
    .filter(x=>valid(x?.pilgrimage_id,"pilgrimage:")&&shrines.has(x.destination_shrine_id))
    .map(x=>[x.pilgrimage_id,x]));
  const semanticKeys=set(calendarSemanticKeys);
  const identityBlock=new Set(rows(dataset.saintsCalendarBridge?.nonlinks)
    .filter(x=>x?.relation==="DISTINCT_PERSON_DO_NOT_MERGE").map(x=>x.saints_id));
  const persons=new Map(rows(dataset.saints?.people)
    .filter(x=>(valid(x?.saint_id,"saint:")||valid(x?.saint_id,"blessed:"))&&
      x.publication==="EDITORIAL_REVIEW_ONLY").map(x=>[x.saint_id,x]));
  const edges=new Map();

  function add(fromType,fromId,toType,toId,relation,owner,recordId,sourceIds,scope,state,additional={}){
    if(!rows(sourceIds).length)return;
    const id=[fromType,fromId,relation,toType,toId,owner,recordId].join("|");
    if(edges.has(id))return;
    edges.set(id,frozen({
      id,from:frozen({type:fromType,id:fromId}),to:frozen({type:toType,id:toId}),
      relation,scope,publication:state,
      provenance:frozen({owner,record_id:recordId,source_ids:frozen([...new Set(sourceIds)])}),
      ...additional,
      // This projection carries no coordinates, Mass schedules, ritual obligations,
      // source-text reproductions, photo approvals or object authentication.
    }));
  }

  // The existing phenomena seed owns assertions of reported relic custody.
  // Authentication and routine public display are separate, unproven questions.
  for(const relic of rows(dataset.phenomena?.relics)){
    if(!valid(relic?.id,"relic:")||!places.has(relic?.place_id)||
      relic.source_claim!=="LOCATION_AND_VENERATION_ATTESTED"||
      relic.authentication!=="NOT_INDEPENDENTLY_CERTIFIED_BY_APP"||
      !https(relic.source_url))continue;
    add("place",relic.place_id,"sacred_object",relic.id,"ATTESTED_RELIC_CUSTODY",
      "sacred-phenomena",relic.id,[relic.source_url],
      "Reported physical custody; neither authenticity nor permanent display inferred",
      "PUBLIC_SOURCE_CONTEXT",{relic_authenticity:"NOT_INDEPENDENTLY_CERTIFIED",visitor_access:"NOT_ASSERTED"});
  }

  // Customs must have their own published canonical entry and an actual
  // Place-level attestation. Cultural-area and name-hint rows are not site edges.
  for(const att of rows(dataset.customs?.attestations)){
    if(!valid(att?.attestation_id,"att:")||!places.has(att.place_id)||
       !customRecords.has(att.custom_id)||att.geographic_precision!=="PLACE"||
       att.map_policy!=="PLACE"||att.strength!=="STRONG")continue;
    add("place",att.place_id,"custom",att.custom_id,"PLACE_ATTESTED_CUSTOM",
      "customs",att.attestation_id,att.source_ids,
      "Documented association; not a scheduled event or universal obligation",
      "PUBLIC_SOURCE_CONTEXT",{historical_period:att.period_label||null});
  }

  // Only Calendar's published semantic registry may resolve feast dates.
  // The Place is linked via the shrine -> pilgrimage -> existing temporal row.
  for(const temporal of rows(dataset.shrines?.temporalLinks)){
    if(temporal?.binding_state!=="BOUND_TO_CALENDAR"||
       temporal.calendar_registry_version!=="calendar-semantic-registry-v1"||
       !semanticKeys.has(temporal.calendar_semantic_key)||
       !valid(temporal.temporal_link_id,"temporal:")||
       temporal.subject_type!=="PILGRIMAGE"||
       !rows(temporal.source_ids).length)continue;
    const pilgrimage=pilgrimageById.get(temporal.subject_id);
    const shrine=pilgrimage&&shrines.get(pilgrimage.destination_shrine_id);
    if(!shrine)continue;
    // A pilgrimage's Calendar connection is not a feast of every saint
    // associated with that shrine, and not an independent recurrence.
    add("place",shrine.place_id,"calendar_semantic",temporal.calendar_semantic_key,
      "PILGRIMAGE_CALENDAR_CONTEXT","shrines",temporal.temporal_link_id,
      temporal.source_ids,
      "A sourced pilgrimage/observance context, not a separate feast or event schedule",
      "PUBLIC_SOURCE_CONTEXT",{
        pilgrimage_id:pilgrimage.pilgrimage_id,temporal_relation:temporal.relation
      });
  }

  // Saints and Blesseds identities are exact keys, never guessed from shrine
  // names. The current biographies are editorial only, so so are these links.
  for(const person of persons.values()){
    for(const link of rows(person.place_links)){
      if(!places.has(link.place_id)||!shrines.has(link.shrine_id)||
         shrines.get(link.shrine_id).place_id!==link.place_id||
         link.relation_kind!=="SHRINE_ASSOCIATION_ONLY")continue;
      add("place",link.place_id,"person",person.saint_id,
        "DOCUMENTED_PERSON_SHRINE_ASSOCIATION","saints",
        person.saint_id,link.source_ids,
        "Person-shrine association only; no claim of burial, relic or feast",
        "EDITORIAL_REVIEW_ONLY");
    }
  }

  // This is identity, not the creation of a Calendar observance. In
  // particular post-1960 canonisation does not imply a universal 1962 feast.
  if(dataset.saintsCalendarBridge?.schema==="ao.saints.parallel-owner-identity-bridge.v1"){
    for(const link of rows(dataset.saintsCalendarBridge.identity_links)){
      if(identityBlock.has(link?.saints_id)||!persons.has(link?.saints_id)||
         !valid(link?.calendar_person_id,"saint.")||
         !String(link.status||"").startsWith("EXACT_SUPPORTED_"))continue;
      add("person",link.saints_id,"calendar_person",link.calendar_person_id,
        "EXACT_REVIEWED_PERSON_IDENTITY","saints-calendar-bridge",
        link.saints_id,[link.calendar_person_source],
        "Identity crosswalk only; the existing Calendar decides observed dates",
        "EDITORIAL_REVIEW_ONLY");
    }
  }
  const ordered=frozen([...edges.values()].sort((a,b)=>a.id.localeCompare(b.id)));
  return frozen({
    schema:CONNECTED_SACRED_ENTITIES_VERSION,
    public_context:frozen(ordered.filter(x=>x.publication==="PUBLIC_SOURCE_CONTEXT")),
    editorial_review:frozen(ordered.filter(x=>x.publication==="EDITORIAL_REVIEW_ONLY")),
  });
}

export function connectedPlaceReferences(projection,placeId,{includeEditorial=false}={}){
  if(!valid(placeId,"place:")||projection?.schema!==CONNECTED_SACRED_ENTITIES_VERSION)
    return frozen([]);
  const source=includeEditorial?
    [...rows(projection.public_context),...rows(projection.editorial_review)]:
    rows(projection.public_context);
  return frozen(source.filter(x=>x.from.type==="place"&&x.from.id===placeId));
}
