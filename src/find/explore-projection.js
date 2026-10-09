import { communionValue } from "./data-service.js";
import { directoryGeoLabel, isMapPublishableGeo } from "./geo-provenance.js";
import { isMapPublishablePlaceGeo } from "./geography-contracts.js";

export const EXPLORE_LENSES=Object.freeze(["tlm","shrines","apparitions","relics","traditions","pilgrimages"]);

const arr=value=>Array.isArray(value)?value:[];
const text=value=>String(value??"").trim();
const freezeList=value=>Object.freeze(arr(value).map(item=>Object.freeze(item)));

function sourceLinks(sourceIds,sourceMap){
  const seen=new Set(),out=[];
  for(const id of arr(sourceIds)){
    const source=sourceMap.get(id);
    const url=source?.url;
    if(!url||seen.has(url))continue;
    seen.add(url);
    out.push(Object.freeze({
      id,
      title:source?.title??source?.label??id,
      issuer:source?.issuer??source?.authority_role??source?.source_type??"",
      url,
    }));
  }
  return Object.freeze(out);
}
function addressLabel(address){
  return text(address?.formatted)||[
    address?.line1,address?.postal_code,address?.city,address?.region,address?.country??address?.country_code
  ].map(text).filter(Boolean).join(", ");
}
function placeMapsUrl(place){
  const address=addressLabel(place?.address);
  return address?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(address):null;
}
function directoryMapsUrl(venue){
  const g=venue?.geo??{};
  const query=g.lat!==null&&g.lat!==undefined&&g.lng!==null&&g.lng!==undefined
    ?String(g.lat)+","+String(g.lng)
    :addressLabel(venue?.address);
  return query?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(query):null;
}
function communityLabel(id,communities){
  const match=arr(communities).find(item=>item?.id===id);
  return match?.abbreviation||match?.name||id||"Unknown";
}
function usageLabel(ministry){
  const usage=ministry?.liturgical_usage??{};
  if(usage.family==="ROMAN"&&usage.books==="1962")return "Roman · 1962";
  if(usage.family==="ROMAN"&&usage.books==="PRE_1955")return "Roman · pre-1955";
  const parts=[usage.family,usage.books].filter(value=>value&&value!=="UNKNOWN");
  return parts.join(" · ")||"Traditional Latin liturgy";
}
function directorySources(record){
  const result=[...arr(record?.sources)];
  const venue=record?.venue??{};
  for(const url of [...arr(venue?.contact?.website),...arr(venue?.contact?.schedule_url)]){
    if(url&&!result.some(item=>item?.url===url))result.push({source_id:url,title:"Official venue source",url});
  }
  return result;
}
function directorySourceLinks(record){
  const seen=new Set(),out=[];
  for(const source of directorySources(record)){
    const url=source?.url;if(!url||seen.has(url))continue;
    seen.add(url);
    out.push(Object.freeze({
      id:source?.source_id??url,
      title:source?.title??source?.label??source?.source_type??"Official source",
      issuer:source?.issuer??source?.source_type??"",
      url,
    }));
  }
  return Object.freeze(out);
}
function rawSchedules(record){
  return arr(record?.ministries).flatMap(ministry=>
    arr(ministry?.schedules).map(schedule=>Object.freeze({
      title:schedule?.mass_type&&schedule.mass_type!=="UNKNOWN"?schedule.mass_type:"Mass / liturgy",
      body:text(schedule?.payload?.raw)||JSON.stringify(schedule?.payload??{}),
      community:communityLabel(ministry?.community_id,[]),
    }))
  );
}
function normalizeGeo(geo){
  const lat=Number(geo?.lat),lng=Number(geo?.lng);
  return Number.isFinite(lat)&&lat>=-90&&lat<=90&&Number.isFinite(lng)&&lng>=-180&&lng<=180
    ?Object.freeze({lat,lng,precision:text(geo?.precision)||"unknown",approximate:Boolean(geo?.indicative_only)||["complex_anchor","address","street","locality"].includes(text(geo?.precision)),indicative_only:Boolean(geo?.indicative_only),reference_point_name:text(geo?.reference_point_name),attribution:text(geo?.attribution)})
    :null;
}
function itemSearch(parts){return parts.flatMap(value=>Array.isArray(value)?value:[value]).map(text).filter(Boolean).join(" ").toLowerCase();}

export function projectDirectoryItems(records,{communities=[]}={}){
  return Object.freeze(arr(records).map(record=>{
    const venue=record?.venue??{},ministry=arr(record?.ministries)[0]??{},una=communionValue(record);
    const mapped=isMapPublishableGeo(venue?.geo,venue?.address?.country_code);
    const geo=mapped?normalizeGeo(venue.geo):null;
    const label=communityLabel(ministry?.community_id,communities);
    const status=una==="YES"?"UNA CUM":una==="NO"?"NON-UNA CUM":una==="VARIES"?"VARIES":"STATUS UNKNOWN";
    const facts=[
      venue?.diocese?.name?{label:"Diocese",value:venue.diocese.name}:null,
      {label:"Liturgy",value:usageLabel(ministry)},
      {label:"Una cum",value:una==="YES"?"Yes":una==="NO"?"No":una==="VARIES"?"Varies":"Unknown"},
      mapped?{label:"Location",value:directoryGeoLabel(venue.geo,{language:"en"})}:null,
    ].filter(Boolean);
    const schedules=rawSchedules(record);
    return Object.freeze({
      item_id:"tlm:"+venue.venue_id,
      source_id:venue.venue_id,
      lens:"tlm",
      kind:"TLM_VENUE",
      community_id:ministry?.community_id??"OTHER",
      eyebrow:label,
      status,
      title:venue?.name?.official||"Unnamed venue",
      subtitle:[venue?.address?.city,venue?.address?.country_code].filter(Boolean).join(" · "),
      summary:schedules[0]?.body??usageLabel(ministry),
      address:venue?.address??null,
      geo,
      map_publishable:Boolean(mapped&&geo),
      map_state:mapped?"MAPPED":"ADDRESS_ONLY",
      facts:freezeList(facts),
      sections:freezeList(schedules.map(schedule=>({label:"Schedule",title:schedule.title,body:schedule.body}))),
      source_links:directorySourceLinks(record),
      actions:freezeList([
        directoryMapsUrl(venue)?{label:"Directions",url:directoryMapsUrl(venue)}:null,
        arr(venue?.contact?.website)[0]?{label:"Website",url:arr(venue.contact.website)[0]}:null,
      ].filter(Boolean)),
      note:"Source-backed current directory record. Check the official schedule before travelling.",
      search_text:itemSearch([
        venue?.name?.official,venue?.name?.alternate,addressLabel(venue?.address),venue?.diocese?.name,label,
        usageLabel(ministry),schedules.map(item=>item.body),
      ]),
      raw:record,
    });
  }));
}

function novenaRecordMap(records=[]){return new Map(arr(records).map(row=>[row?.id,row]).filter(([id])=>id));}
function novenaTitle(row){return text(row?.title_en)||text(row?.title_fr)||text(row?.id)||"Novena";}
function novenaLinksForShrine(shrine,links=[]){
  return arr(links).filter(link=>link?.shrine_id===shrine?.shrine_id||(!link?.shrine_id&&link?.place_id&&link.place_id===shrine?.place_id));
}
function novenaLinksForAttestation(attestation,links=[]){
  return arr(links).filter(link=>{
    if(!link?.custom_id||link.custom_id!==attestation?.custom_id)return false;
    if(link.place_id)return link.place_id===attestation?.place_id;
    if(link.geo_area_id)return link.geo_area_id===attestation?.geo_area_id;
    return true;
  });
}
function novenaSections(links,recordMap){
  const grouped=new Map();
  for(const link of arr(links)){
    const id=link?.novena_id;if(!id)continue;
    const current=grouped.get(id)??[];
    if(link?.note&&!current.includes(link.note))current.push(link.note);
    grouped.set(id,current);
  }
  return [...grouped.entries()].map(([id,notes])=>Object.freeze({
    label:"Related novena",title:novenaTitle(recordMap.get(id)),body:notes.join(" ")
  }));
}
function novenaActions(links,recordMap){
  const seen=new Set(),out=[];
  for(const link of arr(links)){
    const id=link?.novena_id;if(!id||seen.has(id))continue;
    seen.add(id);
    out.push(Object.freeze({label:"Open novena",novena_id:id,title:novenaTitle(recordMap.get(id))}));
  }
  return Object.freeze(out);
}

export function projectShrineItems({shrines=[],places=[],sources=[],novenaLinks=[],novenas=[]}={}){
  const placeMap=new Map(arr(places).map(place=>[place?.place_id,place]).filter(([id])=>id));
  const sourceMap=new Map(arr(sources).map(source=>[source?.id,source]).filter(([id])=>id));
  const novenaMap=novenaRecordMap(novenas);
  return Object.freeze(arr(shrines).map(shrine=>{
    const place=placeMap.get(shrine?.place_id)??null;
    const address=place?.address??null;
    const mapped=isMapPublishablePlaceGeo(place?.geo,place?.address?.country_code);
    const geo=mapped?normalizeGeo(place.geo):null;
    const relatedNovenas=novenaLinksForShrine(shrine,novenaLinks);
    const facts=[
      {label:"Dedication",value:shrine?.dedication},
      {label:"Type",value:String(shrine?.shrine_kind??"").replaceAll("_"," ")},
      {label:"Evidence",value:shrine?.confidence},
    ].filter(item=>text(item.value));
    const saints=arr(shrine?.associated_saints);
    return Object.freeze({
      item_id:"shrine:"+shrine.shrine_id,
      source_id:shrine.shrine_id,
      place_id:place?.place_id??null,
      lens:"shrines",
      kind:"SHRINE",
      eyebrow:"SHRINE",
      status:shrine?.recognition_class==="OFFICIAL_SANCTUARY"?"OFFICIAL SANCTUARY":"SOURCE-BACKED",
      title:shrine?.name||place?.name?.official||"Shrine",
      subtitle:addressLabel(address),
      summary:shrine?.origin_summary??"",
      address,
      geo,
      map_publishable:Boolean(mapped&&geo),
      map_state:mapped?"MAPPED":"ADDRESS_ONLY",
      facts:freezeList(facts),
      sections:freezeList([
        ...(saints.length?[{label:"Associated saints",title:saints.join(" · "),body:""}]:[]),
        ...novenaSections(relatedNovenas,novenaMap),
      ]),
      source_links:sourceLinks(shrine?.source_ids,sourceMap),
      actions:freezeList([
        ...(placeMapsUrl(place)?[{label:"Directions",url:placeMapsUrl(place)}]:[]),
        ...novenaActions(relatedNovenas,novenaMap),
      ]),
      note:mapped?"Canonical shrine identity with provenance-locked shared Place coordinates.":"Canonical shrine identity. Map pin withheld until shared Place coordinates have their own provenance lock.",
      search_text:itemSearch([shrine?.name,shrine?.dedication,shrine?.origin_summary,saints,addressLabel(address),relatedNovenas.map(link=>novenaTitle(novenaMap.get(link.novena_id)))]),
      raw:Object.freeze({shrine,place}),
    });
  }));
}

export function projectTraditionItems({customs=[],attestations=[],places=[],geoAreas=[],sources=[],novenaLinks=[],novenas=[]}={}){
  const customMap=new Map(arr(customs).map(custom=>[custom?.custom_id,custom]).filter(([id])=>id));
  const placeMap=new Map(arr(places).map(place=>[place?.place_id,place]).filter(([id])=>id));
  const areaMap=new Map(arr(geoAreas).map(area=>[area?.geo_area_id,area]).filter(([id])=>id));
  const sourceMap=new Map(arr(sources).map(source=>[source?.id,source]).filter(([id])=>id));
  const novenaMap=novenaRecordMap(novenas);
  return Object.freeze(arr(attestations).map(attestation=>{
    const custom=customMap.get(attestation?.custom_id)??{},place=placeMap.get(attestation?.place_id)??null,area=areaMap.get(attestation?.geo_area_id)??null;
    const placeLabel=place?.name?.official??attestation?.place_name_hint??area?.name?.official??"";
    const mapped=attestation?.map_policy==="PLACE"&&isMapPublishablePlaceGeo(place?.geo,place?.address?.country_code);
    const geo=mapped?normalizeGeo(place.geo):null;
    const relatedNovenas=novenaLinksForAttestation(attestation,novenaLinks);
    const facts=[
      {label:"Class",value:String(custom?.custom_class??"").replaceAll("_"," ")},
      {label:"Period",value:attestation?.period_label??custom?.period_label},
      {label:"Evidence",value:attestation?.strength},
      {label:"Confidence",value:attestation?.confidence},
    ].filter(item=>text(item.value));
    return Object.freeze({
      item_id:"tradition:"+attestation.attestation_id,
      source_id:attestation.attestation_id,
      place_id:place?.place_id??null,
      lens:"traditions",
      kind:"CUSTOM_ATTESTATION",
      eyebrow:"TRADITION · "+String(attestation?.geographic_precision??"").replaceAll("_"," "),
      status:custom?.publication_state==="PUBLISHED"?"SOURCE-BACKED":"CONTEXT",
      title:custom?.name||attestation?.custom_id||"Tradition",
      subtitle:placeLabel,
      summary:custom?.canonical_statement??"",
      address:place?.address??null,
      geo,
      map_publishable:Boolean(mapped&&geo),
      map_state:mapped?"MAPPED":place?"ADDRESS_ONLY":attestation?.map_policy==="AREA_CONTEXT"?"AREA_CONTEXT":"NOT_MAPPED",
      facts:freezeList(facts),
      sections:freezeList([
        attestation?.evidence_note?{label:"Attestation",title:placeLabel,body:attestation.evidence_note}:null,
        custom?.guardrail?{label:"How Ad Orientem presents it",title:"",body:custom.guardrail}:null,
        ...novenaSections(relatedNovenas,novenaMap),
      ].filter(Boolean)),
      source_links:sourceLinks(attestation?.source_ids,sourceMap),
      actions:freezeList([
        ...(placeMapsUrl(place)?[{label:"Directions",url:placeMapsUrl(place)}]:[]),
        ...novenaActions(relatedNovenas,novenaMap),
      ]),
      note:"Geographic attestation only. It does not imply that every parish, shrine or TLM community in this area observes the custom.",
      search_text:itemSearch([custom?.name,custom?.canonical_statement,custom?.family,placeLabel,addressLabel(place?.address),attestation?.evidence_note,relatedNovenas.map(link=>novenaTitle(novenaMap.get(link.novena_id)))]),
      raw:Object.freeze({custom,attestation,place,area}),
    });
  }));
}

export function projectNovenaContextItems({links=[],novenas=[],places=[],geoAreas=[],sources=[]}={}){
  const novenaMap=novenaRecordMap(novenas);
  const placeMap=new Map(arr(places).map(place=>[place?.place_id,place]).filter(([id])=>id));
  const areaMap=new Map(arr(geoAreas).map(area=>[area?.geo_area_id,area]).filter(([id])=>id));
  const sourceMap=new Map(arr(sources).map(source=>[source?.id,source]).filter(([id])=>id));
  return Object.freeze(arr(links).map(link=>{
    const novena=novenaMap.get(link?.novena_id)??{},place=placeMap.get(link?.place_id)??null,area=areaMap.get(link?.geo_area_id)??null;
    const placeLabel=place?.name?.official??link?.place_name_hint??area?.name?.official??"";
    const mapped=link?.map_policy==="PLACE"&&isMapPublishablePlaceGeo(place?.geo,place?.address?.country_code);
    const geo=mapped?normalizeGeo(place.geo):null;
    const facts=[
      {label:"Class",value:String(link?.relationship??"").replaceAll("_"," ")},
      {label:"Evidence",value:link?.confidence},
    ].filter(item=>text(item.value));
    const mapState=mapped?"MAPPED":place?"ADDRESS_ONLY":link?.map_policy==="AREA_CONTEXT"?"AREA_CONTEXT":link?.map_policy==="PLACE_PENDING"?"PLACE_PENDING":"NOT_MAPPED";
    return Object.freeze({
      item_id:"tradition:novena:"+link.link_id,
      source_id:link.link_id,
      place_id:place?.place_id??null,
      lens:"traditions",
      kind:"NOVENA_CONTEXT",
      eyebrow:"NOVENA CONTEXT · "+String(link?.geographic_precision??link?.map_policy??"").replaceAll("_"," "),
      status:"SOURCE-BACKED",
      title:novenaTitle(novena),
      subtitle:placeLabel,
      summary:link?.note??"",
      address:place?.address??null,
      geo,
      map_publishable:Boolean(mapped&&geo),
      map_state:mapState,
      facts:freezeList(facts),
      sections:freezeList([{label:"Relationship",title:placeLabel,body:link?.note??""}]),
      source_links:sourceLinks(link?.source_ids,sourceMap),
      actions:freezeList([
        ...(placeMapsUrl(place)?[{label:"Directions",url:placeMapsUrl(place)}]:[]),
        {label:"Open novena",novena_id:link?.novena_id,title:novenaTitle(novena)},
      ]),
      note:"Evidence-backed novena context. The linked place, custom or shrine is not automatically part of the novena's required form.",
      search_text:itemSearch([novenaTitle(novena),novena?.title_fr,placeLabel,link?.relationship,link?.note]),
      raw:Object.freeze({link,novena,place,area}),
    });
  }));
}

export function projectPilgrimageItems({pilgrimages=[],shrines=[],routes=[],temporalLinks=[],places=[],sources=[],novenaLinks=[],novenas=[],customs=[],attestations=[],customSources=[],novenaSources=[]}={}){
  const shrineMap=new Map(arr(shrines).map(shrine=>[shrine?.shrine_id,shrine]).filter(([id])=>id));
  const routeMap=new Map(arr(routes).map(route=>[route?.route_id,route]).filter(([id])=>id));
  const temporalMap=new Map(arr(temporalLinks).map(link=>[link?.temporal_link_id,link]).filter(([id])=>id));
  const placeMap=new Map(arr(places).map(place=>[place?.place_id,place]).filter(([id])=>id));
  const sourceMap=new Map([...arr(sources),...arr(customSources),...arr(novenaSources)].map(source=>[source?.id,source]).filter(([id])=>id));
  const novenaMap=novenaRecordMap(novenas);
  const customMap=new Map(arr(customs).map(custom=>[custom?.custom_id,custom]).filter(([id])=>id));
  return Object.freeze(arr(pilgrimages).map(pilgrimage=>{
    const shrine=shrineMap.get(pilgrimage?.destination_shrine_id)??{},place=placeMap.get(shrine?.place_id)??null;
    const mapped=isMapPublishablePlaceGeo(place?.geo,place?.address?.country_code);
    const geo=mapped?normalizeGeo(place.geo):null;
    const linkedRoutes=arr(pilgrimage?.route_ids).map(id=>routeMap.get(id)).filter(Boolean);
    const relatedNovenas=novenaLinksForShrine(shrine,novenaLinks);
    const saints=arr(shrine?.associated_saints);
    const localCustoms=arr(attestations).filter(att=>att?.place_id&&att.place_id===place?.place_id&&att?.map_policy==="PLACE");
    const linkedTemporal=arr(pilgrimage?.temporal_link_ids).map(id=>temporalMap.get(id)).filter(Boolean);
    const facts=[
      {label:"Kind",value:String(pilgrimage?.kind??"").replaceAll("_"," ")},
      {label:"Shrine",value:shrine?.name},
      saints.length?{label:"Associated saints",value:saints.join(" · ")}:null,
      linkedRoutes.length?{label:"Route",value:linkedRoutes.map(route=>String(route.route_state??"").replaceAll("_"," ")).join(" · ")}:null,
      linkedTemporal.length?{label:"Calendar",value:
        linkedTemporal.some(link=>link.binding_state==="BOUND_TO_CALENDAR")?"Linked":
        linkedTemporal.every(link=>link.binding_state==="NO_FIXED_CALENDAR_BINDING")?"Seasonal · no single date":
        "Binding pending"}:null,
      {label:"Confidence",value:pilgrimage?.confidence},
    ].filter(item=>item&&text(item.value));
    const sections=[
      ...(saints.length?[{label:"Saints & patronage",title:saints.join(" · "),body:"Associated with the destination shrine; not an independently claimed feast or indulgence."}]:[]),
      ...localCustoms.map(att=>({label:"Attested local devotion",title:customMap.get(att.custom_id)?.name??att.custom_id,body:att.evidence_note??""})),
      ...novenaSections(relatedNovenas,novenaMap),
      ...linkedRoutes.map(route=>({
        label:"Route",
        title:route.name,
        body:route.route_state==="DOCUMENTED_UNMAPPED"?"Documented by the source; map geometry is not yet published.":"",
      })),
      ...linkedTemporal.map(link=>({
        label:"Calendar relationship",
        title:link.source_event_label||link.calendar_semantic_key,
        body:link.binding_state==="PENDING_CALENDAR_BINDING"
          ?"Source-backed relationship; Calendar has not yet exposed this semantic key as a resolved event."
          :link.binding_state==="NO_FIXED_CALENDAR_BINDING"
            ?"Source-backed seasonal relationship; no single recurring Calendar date is asserted."
            :"Resolved by Calendar.",
      })),
    ];
    return Object.freeze({
      item_id:"pilgrimage:"+pilgrimage.pilgrimage_id,
      source_id:pilgrimage.pilgrimage_id,
      place_id:place?.place_id??null,
      lens:"pilgrimages",
      kind:"PILGRIMAGE",
      eyebrow:"PILGRIMAGE",
      status:linkedRoutes.some(route=>route.route_state==="DOCUMENTED_UNMAPPED")?"ROUTE UNMAPPED":"SOURCE-BACKED",
      title:pilgrimage?.name||"Pilgrimage",
      subtitle:shrine?.name||addressLabel(place?.address),
      summary:pilgrimage?.scope_note??"",
      address:place?.address??null,
      geo,
      map_publishable:Boolean(mapped&&geo),
      map_state:mapped?"DESTINATION_MAPPED":"DESTINATION_ADDRESS_ONLY",
      facts:freezeList(facts),
      sections:freezeList(sections),
      calendar_keys:freezeList(linkedTemporal.filter(link=>link?.binding_state==="BOUND_TO_CALENDAR"&&link?.calendar_semantic_key).map(link=>link.calendar_semantic_key)),
      source_links:sourceLinks([...arr(pilgrimage?.source_ids),...localCustoms.flatMap(att=>arr(att?.source_ids)),...relatedNovenas.flatMap(link=>arr(link.source_ids))],sourceMap),
      actions:freezeList([...(placeMapsUrl(place)?[{label:"Destination",url:placeMapsUrl(place)}]:[]),...novenaActions(relatedNovenas,novenaMap)]),
      note:"Pilgrimage destination, saints, local customs and novenas are linked only where sources establish the association. Calendar alone resolves recurring dates, and nearby Mass venues are not inferred.",
      search_text:itemSearch([pilgrimage?.name,pilgrimage?.scope_note,shrine?.name,addressLabel(place?.address),linkedRoutes.map(route=>route.name),linkedTemporal.map(link=>link.source_event_label),saints,relatedNovenas.map(link=>novenaTitle(novenaMap.get(link.novena_id)))]),
      raw:Object.freeze({pilgrimage,shrine,place,routes:linkedRoutes,temporalLinks:linkedTemporal}),
    });
  }));
}


const sacredFamilyNames=Object.freeze({
  MARY:"Blessed Virgin Mary",OUR_LORD:"Our Lord Jesus Christ",SAINT_JOSEPH:"Saint Joseph",
  SAINT_MICHAEL:"Saint Michael",OTHER_SAINT:"Saint / blessed",
});
const sacredStatusNames=Object.freeze({
  HISTORICALLY_APPROVED:"Historic ecclesiastical recognition",
  SHRINE_ATTESTED:"Shrine-documented account",
  HISTORICAL_TRADITION:"Historical devotional tradition",
  DIOCESAN_TRADITION:"Diocesan devotional tradition",
  MEDIEVAL_LEGEND:"Medieval hagiographical tradition",
  COPTIC_ORTHODOX_RECOGNITION:"Recognised by Coptic Orthodox Patriarchate; not Catholic diocesan approval",
});
export function projectSacredSiteItems({records=[],places=[],kind="apparitions"}={}){
  const placeMap=new Map(arr(places).map(row=>[row?.place_id,row]));
  if(!["apparitions","relics"].includes(kind))throw new TypeError("Invalid sacred-site lens");
  return Object.freeze(arr(records).map(record=>{
    const place=placeMap.get(record?.place_id)??null;
    const mapped=isMapPublishablePlaceGeo(place?.geo,place?.address?.country_code);
    const geo=mapped?normalizeGeo(place.geo):null;
    const apparition=kind==="apparitions";
    const family=sacredFamilyNames[record?.phenomenon_family]??record?.phenomenon_family??"";
    const evidence=apparition?(sacredStatusNames[record?.recognition_record]??"Historic tradition"):(
      record?.relic_kind==="REPUTED_PASSION_RELIC"?"Traditional identification; authenticity not independently assessed":"Custody attested; authenticity not independently assessed");
    const date=record?.period_label??null;
    const title=record?.title_en??record?.title_fr??record?.id??"";
    const notes=apparition
      ?"Apparition reports are private revelation or historical tradition. The existence of a shrine or permitted devotion does not independently certify supernatural origin."
      :"The cited institution or publication describes custody/veneration, not proof of canonical or scientific authentication. Relics may move; verify current custodianship before travelling.";
    return Object.freeze({
      item_id:kind+":"+record.id,
      source_id:record.id,
      place_id:place?.place_id??null,
      lens:kind,
      kind:apparition?"APPARITION_TRADITION":"RELIC_HOLDING",
      eyebrow:apparition?"APPARITION · "+String(record?.phenomenon_family??"").replaceAll("_"," "):"RELIC · "+String(record?.relic_kind??"").replaceAll("_"," "),
      status:apparition?(sacredStatusNames[record?.recognition_record]??"Source-attributed tradition"):"LOCATION ATTESTED",
      title,title_fr:record?.title_fr??title,subtitle:place?.name?.official??"",
      summary:record?.summary_en??"",summary_fr:record?.summary_fr??record?.summary_en??"",
      address:place?.address??null,geo,
      map_publishable:Boolean(mapped&&geo),
      map_state:mapped?"MAPPED":place?"ADDRESS_ONLY":"PLACE_PENDING",
      facts:freezeList([
        apparition?{label:"Category",value:family}:{label:"Associated person",value:record?.associated_person},
        !apparition&&record?.material_category?{label:"Object tradition",value:record.material_category.replaceAll("_"," ").toLowerCase()}:null,
        date?{label:"Period",value:date}:null,
        {label:"Evidence",value:evidence},
        apparition?{label:"Witness / tradition",value:record?.witness_or_tradition}:null,
      ].filter(x=>x?.value)),
      sections:freezeList([{label:"Source scope",label_fr:"Portée de la source",title:"",body:notes,body_fr:apparition?"Les récits d’apparitions relèvent des révélations privées ou de traditions historiques ; l’existence d’un sanctuaire ne constitue pas une déclaration universelle sur leur origine surnaturelle.":"Le lieu de conservation ou de vénération est attribué à sa source, sans authentification canonique ou scientifique indépendante."},...(record?.access_notice_en?[{label:"Visitor access",label_fr:"Accès des visiteurs",title:"Temporary closure",title_fr:"Fermeture temporaire",body:record.access_notice_en,body_fr:record.access_notice_fr??record.access_notice_en}]:[]),...(record?.display_notice_en?[{label:"Exposition & visitor access",label_fr:"Ostension et accès",title:"",title_fr:"",body:record.display_notice_en,body_fr:record.display_notice_fr??record.display_notice_en}]:[])]),
      source_links:freezeList([record?.source_url?{id:record.id,title:title,issuer:"Documented source",url:record.source_url}:null].filter(Boolean)),
      actions:freezeList(placeMapsUrl(place)?[{label:"Destination",url:placeMapsUrl(place)}]:[]),
      note:notes+(record?.access_notice_en?" "+record.access_notice_en:"")+(record?.display_notice_en?" "+record.display_notice_en:""),
      search_text:itemSearch([record?.title_en,record?.title_fr,record?.associated_person,record?.witness_or_tradition,record?.period_label,record?.phenomenon_family,record?.relic_kind,place?.name?.official,addressLabel(place?.address)]),
      raw:Object.freeze({record,place}),
    });
  }));
}

export function projectExploreDataset(dataset={}){
  const geography=dataset?.geography??{},customs=dataset?.customs??{},shrines=dataset?.shrines??{},directory=dataset?.directory??{},novenas=dataset?.novenas??{},sacredPhenomena=dataset?.sacredPhenomena??{};
  const novenaSources=[...arr(customs?.sources),...arr(shrines?.sources),...arr(novenas?.sources)];
  const customTraditions=projectTraditionItems({
    customs:customs?.customs,attestations:customs?.attestations,places:geography?.places,geoAreas:geography?.geoAreas,sources:customs?.sources,
    novenaLinks:novenas?.links,novenas:novenas?.records,
  });
  const novenaTraditions=projectNovenaContextItems({
    links:novenas?.links,novenas:novenas?.records,places:geography?.places,geoAreas:geography?.geoAreas,sources:novenaSources,
  });
  const byLens=Object.freeze({
    tlm:projectDirectoryItems(directory?.records,{communities:directory?.communities}),
    shrines:projectShrineItems({shrines:shrines?.shrines,places:geography?.places,sources:shrines?.sources,novenaLinks:novenas?.links,novenas:novenas?.records}),
    apparitions:projectSacredSiteItems({records:sacredPhenomena?.apparitions,places:geography?.places,kind:"apparitions"}),
    relics:projectSacredSiteItems({records:sacredPhenomena?.relics,places:geography?.places,kind:"relics"}),
    traditions:Object.freeze([...customTraditions,...novenaTraditions]),
    pilgrimages:projectPilgrimageItems({pilgrimages:shrines?.pilgrimages,shrines:shrines?.shrines,routes:shrines?.routes,temporalLinks:shrines?.temporalLinks,places:geography?.places,sources:shrines?.sources,novenaLinks:novenas?.links,novenas:novenas?.records,customs:customs?.customs,attestations:customs?.attestations,customSources:customs?.sources,novenaSources:novenas?.sources}),
  });
  return Object.freeze({
    byLens,
    counts:Object.freeze(Object.fromEntries(EXPLORE_LENSES.map(lens=>[lens,byLens[lens].length]))),
  });
}

export function filterExploreItems(items,{query=""}={}){
  const q=text(query).toLowerCase();
  return Object.freeze(arr(items).filter(item=>!q||String(item?.search_text??"").includes(q)));
}

export function exploreProjectionStats(items){
  const list=arr(items);
  return Object.freeze({
    total:list.length,
    mapped:list.filter(item=>item?.map_publishable).length,
    addressOnly:list.filter(item=>!item?.map_publishable&&item?.address).length,
  });
}
