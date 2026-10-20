// MapCN laboratory read-only bridge: canonical owners stay in src/find and src/calendar.
// Ported presentation patterns, NOT a duplicate canonical geography or schedule engine.
import {loadExploreDataset} from "../../src/find/explore-data-service.js";
import {projectExploreDataset} from "../../src/find/explore-projection.js";
import {projectHeritagePlaces} from "../../src/find/heritage-map.js";
import {buildLiturgicalYear,buildMajorCelebrations} from "../../src/calendar/liturgical-year.js";

const list=v=>Array.isArray(v)?v:[];
const str=v=>String(v??"").trim();
const validGeo=g=>g&&g.lat!==null&&g.lat!==undefined&&g.lng!==null&&g.lng!==undefined
  &&Number.isFinite(Number(g.lat))&&Number.isFinite(Number(g.lng))
  &&Math.abs(Number(g.lat))<=90&&Math.abs(Number(g.lng))<=180;
const sourceUrl=v=>/^https:\/\/[^\s<>"']+$/i.test(str(v))?str(v):null;
export const WORLD_GEOJSON_URL="https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson";
export const MAPCN_BLOCKS=Object.freeze({
  discover:"https://www.mapcn.dev/blocks/store-locator",
  time:"https://www.mapcn.dev/blocks/uptime-monitor",
  density:"https://www.mapcn.dev/blocks/heatmap",
  regions:"https://www.mapcn.dev/blocks/choropleth",
});
export function makeLabModel(dataset={},projection=projectExploreDataset(dataset)){
  const places=new Map(list(dataset.geography?.places).map(p=>[p.place_id,p]));
  const areas=new Map(list(dataset.geography?.geoAreas).map(a=>[a.geo_area_id,a]));
  const knownCodes=new Map(list(dataset.geography?.geoAreas).filter(a=>a.area_type==="country"&&a.codes?.iso_alpha2)
    .map(a=>[str(a.codes.iso_alpha2),str(a.name?.official)]));
  const raw=[...projectHeritagePlaces(projection),...list(projection.byLens?.tlm)];
  const seen=new Set(),items=[];
  for(const item of raw){
    if(!item?.map_publishable||!validGeo(item.geo))continue;
    const canonical=places.get(item.place_id)||null;
    const record=item.lens==="tlm"?item.raw:null;
    const countryArea=list(canonical?.geo_area_ids).map(id=>areas.get(id)).find(a=>a?.area_type==="country");
    const code=str(record?.venue?.address?.country_code||countryArea?.codes?.iso_alpha2).toUpperCase();
    const id=str(item.item_id||item.place_id);
    if(!id||seen.has(id))continue;seen.add(id);
    const schedules=list(record?.ministries).flatMap(m=>list(m.schedules)).filter(s=>s?.service_type==="MASS");
    const described=schedules.filter(s=>str(s.payload?.raw));
    const attestations=described.filter(s=>list(s.source_ids).length&&
      ["OFFICIAL_LIVE","OFFICIAL_VERIFIED","RECENTLY_VERIFIED"].includes(str(s.verification?.state)));
    const source=list(item.sources).map(s=>({name:str(s.title||s.issuer||"Source"),url:sourceUrl(s.url)})).find(x=>x.url)
      ||list(record?.sources).map(s=>({name:str(s.title||s.issuer||"Source"),url:sourceUrl(s.url)})).find(x=>x.url)
      ||(sourceUrl(item.geo.source_url)?{name:"Location source",url:item.geo.source_url}:null);
    items.push(Object.freeze({
      id,lens:item.lens==="tlm"?"tlm":"heritage",name:str(item.title),subtitle:str(item.subtitle),
      placeId:str(item.place_id),lat:Number(item.geo.lat),lng:Number(item.geo.lng),
      indicative:Boolean(item.geo.approximate||item.geo.indicative_only||["complex_anchor","locality"].includes(item.geo.precision)),
      countryCode:knownCodes.has(code)?code:"",country:knownCodes.get(code)||"",
      scheduleState:item.lens!=="tlm"?"NOT_APPLICABLE":attestations.length?"SOURCE_ATTESTED":described.length?"PUBLISHED_UNNORMALIZED":"NO_PUBLISHED_TIME",
      scheduleCount:described.length,verifiedScheduleCount:attestations.length,
      // Always retain human-readable published wording: dates, exceptions and
      // local time zones are not sufficiently normalized to calculate a next Mass.
      scheduleText:str(described[0]?.payload?.raw),
      checkedAt:str(described[0]?.verification?.checked_at||described[0]?.verification?.verified_at),
      source,
      recordIdentity:str(item.place_id||record?.venue?.venue_id||item.item_id),
    }));
  }
  return Object.freeze({items:Object.freeze(items),countryNames:knownCodes,
    counts:Object.freeze({all:items.length,heritage:items.filter(x=>x.lens==="heritage").length,
      tlm:items.filter(x=>x.lens==="tlm").length}),
  });
}
export function selectedItems(model,{scope="all",query=""}={}){
  const q=str(query).toLowerCase();
  return list(model.items).filter(x=>(scope==="all"||x.lens===scope)&&
    (!q||(x.name+" "+x.subtitle+" "+x.country).toLowerCase().includes(q)));
}
export function countryCounts(items){
  const result=new Map();
  for(const p of list(items))if(p.countryCode)result.set(p.countryCode,(result.get(p.countryCode)||0)+1);
  return result;
}
export function calendarContext(dateIso){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(str(dateIso)))throw new Error("Expected ISO date");
  const year=buildLiturgicalYear(dateIso);
  const candidates=buildMajorCelebrations(dateIso).filter(x=>x.date===dateIso);
  return {date:dateIso,season:year.currentPeriod?.en||"Liturgical year",
    colour:year.currentPeriod?.color||"green",
    // Candidates are explanatory only. The observed principal feast must be
    // confirmed by the existing authoritative Calendar resolver, not this lab.
    candidates:candidates.map(x=>x.en),candidateOnly:true};
}
export async function loadLabModel(){
  const dataset=await loadExploreDataset();
  return makeLabModel(dataset,projectExploreDataset(dataset));
}
