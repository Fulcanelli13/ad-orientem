// Customs Atlas discovery facets. Metadata comes only from the existing
// Customs/Novena attestations and shared Geography, never inferred from map proximity.
const list=value=>Array.isArray(value)?value:[];
const clean=value=>typeof value==="string"?value.trim():"";

export function customsAtlasAttributes(item){
  const source=item?.raw??{};
  const attestation=source.attestation??source.link??{};
  const area=source.area??{};
  const custom=source.custom??{};
  const geoAreaId=clean(attestation.geo_area_id);
  const geoAreaName=clean(area?.name?.official??area?.name)||geoAreaId;
  // The canonical custom period is a broad description, not an app-calculated date.
  const period=clean(custom.period_label);
  const calendarHint=clean(custom.calendar_trigger_hint);
  const relatedNovena=item?.kind==="NOVENA_CONTEXT"||list(item?.actions).some(action=>Boolean(action?.novena_id));
  return Object.freeze({geoAreaId,geoAreaName,period,calendarHint,relatedNovena});
}

function uniqueOptions(items,key,labelKey=key){
  const map=new Map();
  list(items).forEach(item=>{
    const fields=customsAtlasAttributes(item);
    const value=fields[key],label=fields[labelKey];
    if(value&&!map.has(value))map.set(value,{value,label:label||value});
  });
  return Object.freeze([...map.values()].sort((a,b)=>a.label.localeCompare(b.label,"en")));
}

export function buildCustomsAtlasFacets(items){
  const calendarHints=uniqueOptions(items,"calendarHint");
  return Object.freeze({
    areas:uniqueOptions(items,"geoAreaId","geoAreaName"),
    periods:uniqueOptions(items,"period"),
    calendar:Object.freeze([
      {value:"NOVENA",label:"Related novena"},
      ...calendarHints.map(option=>Object.freeze({value:"HINT:"+option.value,label:option.label})),
    ]),
  });
}

export function filterCustomsAtlasItems(items,{
  query="",atlasArea="ANY",atlasPeriod="ANY",atlasCalendar="ANY",
}={}){
  const term=clean(query).toLowerCase();
  return Object.freeze(list(items).filter(item=>{
    if(term&&!String(item?.search_text??"").includes(term))return false;
    const attributes=customsAtlasAttributes(item);
    if(atlasArea!=="ANY"&&attributes.geoAreaId!==atlasArea)return false;
    if(atlasPeriod!=="ANY"&&attributes.period!==atlasPeriod)return false;
    if(atlasCalendar==="NOVENA"&&!attributes.relatedNovena)return false;
    if(atlasCalendar!=="ANY"&&atlasCalendar!=="NOVENA"&&
       (!atlasCalendar.startsWith("HINT:")||attributes.calendarHint!==atlasCalendar.slice(5)))return false;
    return true;
  }));
}
