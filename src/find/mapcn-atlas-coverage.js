// P4 MapCN heatmap / choropleth data contract. Only already-published map
// locations and canonical source relationships; never inferred country via GPS.
import {projectHeritagePlaces} from "./heritage-map.js";
const arr=v=>Array.isArray(v)?v:[];
const txt=v=>String(v??"").trim();
const goodGeo=g=>g&&g.lat!=null&&g.lng!=null
  &&Number.isFinite(Number(g.lat))&&Math.abs(Number(g.lat))<=90
  &&Number.isFinite(Number(g.lng))&&Math.abs(Number(g.lng))<=180;
export const NATURAL_EARTH_COUNTRIES_URL=
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_110m_admin_0_countries.geojson";
export const ATLAS_SCOPES=Object.freeze(["all","heritage","tlm"]);
export const ATLAS_MODES=Object.freeze(["places","heatmap","countries"]);
export function buildAtlasCoverage(dataset,projection,{scope="all"}={}){
  if(!ATLAS_SCOPES.includes(scope))throw new Error("Unknown Atlas scope");
  const areas=new Map(arr(dataset?.geography?.geoAreas).map(a=>[a.geo_area_id,a]).filter(([id])=>id));
  const sites=new Map(arr(dataset?.geography?.places).map(p=>[p.place_id,p]).filter(([id])=>id));
  const countryNames=new Map(arr(dataset?.geography?.geoAreas)
    .filter(a=>a.area_type==="country"&&/^[A-Z]{2}$/.test(txt(a.codes?.iso_alpha2).toUpperCase()))
    .map(a=>[txt(a.codes.iso_alpha2).toUpperCase(),txt(a.name?.official)]));
  const rows=[
    ...(scope!=="tlm"?projectHeritagePlaces(projection):[]),
    ...(scope!=="heritage"?arr(projection?.byLens?.tlm):[]),
  ];
  const seen=new Set(),points=[],counts=new Map(),types={heritage:0,tlm:0};
  for(const item of rows){
    if(!item?.map_publishable||!goodGeo(item.geo))continue;
    const kind=item.lens==="tlm"?"tlm":"heritage";
    const id=txt(item.place_id)||txt(item.source_id||item.item_id);
    if(!id)continue;
    const key=item.place_id?"place:"+id:"venue:"+id;
    if(seen.has(key))continue;
    seen.add(key);
    const canonical=sites.get(item.place_id);
    const area=arr(canonical?.geo_area_ids).map(id=>areas.get(id))
      .find(a=>a?.area_type==="country");
    const reported=kind==="tlm"?txt(item.raw?.venue?.address?.country_code).toUpperCase():"";
    const countryCode=countryNames.has(reported)?reported:
      countryNames.has(txt(area?.codes?.iso_alpha2).toUpperCase())?txt(area.codes.iso_alpha2).toUpperCase():"";
    const point=Object.freeze({id:key,lat:Number(item.geo.lat),lng:Number(item.geo.lng),
      kind,countryCode,approximate:Boolean(item.geo.approximate||item.geo.indicative_only),
      title:txt(item.title)});
    points.push(point);types[kind]++;
    if(countryCode)counts.set(countryCode,(counts.get(countryCode)||0)+1);
  }
  const countries=[...counts.entries()].map(([code,count])=>Object.freeze({
    code,name:countryNames.get(code)||code,count})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
  const mappedCountries=points.filter(p=>p.countryCode).length;
  return Object.freeze({scope,points:Object.freeze(points),
    total:points.length,mappedCountries,unknownCountry:points.length-mappedCountries,
    types:Object.freeze(types),countries:Object.freeze(countries),
    countryNames,counts});
}
export function atlasCoverageFeatures(model){
  return {type:"FeatureCollection",features:arr(model?.points).map(point=>({
    type:"Feature",geometry:{type:"Point",coordinates:[point.lng,point.lat]},
    properties:{id:point.id,kind:point.kind,country:point.countryCode,approximate:point.approximate}
  }))};
}
export function enrichAtlasCountryFeatures(world,coverage){
  if(world?.type!=="FeatureCollection"||!Array.isArray(world.features))
    throw new Error("Natural Earth polygon collection invalid");
  const names=new Map([...coverage.countryNames.entries()].map(([code,name])=>
    [txt(name).toLocaleLowerCase(),code]));
  return {type:"FeatureCollection",features:world.features.filter(f=>
    f?.type==="Feature"&&["Polygon","MultiPolygon"].includes(f.geometry?.type)).map(f=>{
    const props=f.properties||{};
    const code=[props.ISO_A2_EH,props.ISO_A2,props.WB_A2].map(x=>txt(x).toUpperCase())
      .find(x=>coverage.countryNames.has(x))
      ||names.get(txt(props.NAME_LONG||props.ADMIN).toLocaleLowerCase())||"";
    return {...f,properties:{...props,aoCountryCode:code,aoCount:coverage.counts.get(code)||0}};
  })};
}
export function renderAtlasCoveragePanel({coverage,mode="heatmap",language="en",limit=12}={}){
  if(!coverage)return "";
  const fr=language==="fr",L=(en,french)=>fr?french:en;
  const E=x=>txt(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const scopeLabel={all:L("All mapped locations","Tous les lieux cartographiés"),
    heritage:L("Sacred places","Lieux sacrés"),tlm:L("Mass locations","Lieux de messe")};
  let s='<section class="aoAtlasCoveragePanel" data-atlas-coverage-panel data-atlas-mode="'+E(mode)+'" aria-label="'+
    L("Atlas coverage","Couverture de l’atlas")+'">';
  s+='<header class="aoAtlasCoverageHead"><div><small>MAPCN · ATLAS LAYERS</small><h2>'+
    (mode==="heatmap"?L("Documented density","Densité documentée"):L("Country coverage","Couverture par pays"))+
    '</h2></div><button type="button" data-atlas-mode="places" aria-label="'+L("Back to place map","Retour à la carte des lieux")+'">×</button></header>';
  s+='<div class="aoAtlasCoverageScroll"><nav class="aoAtlasCoverageModes" aria-label="'+L("Atlas layers","Couches de l’atlas")+'">';
  for(const [id,en,fre] of [["heatmap","Heatmap","Carte de densité"],["countries","Countries","Pays"]])
    s+='<button data-atlas-mode="'+id+'" aria-pressed="'+String(mode===id)+'">'+L(en,fre)+'</button>';
  s+='</nav><div class="aoAtlasCoverageScope"><span>'+L("Include","Afficher")+'</span>';
  for(const id of ATLAS_SCOPES)s+='<button type="button" data-atlas-scope="'+id+'" aria-pressed="'+String(coverage.scope===id)+'">'+E(scopeLabel[id])+'</button>';
  s+='</div><div class="aoAtlasCoverageMetrics"><div><small>'+L("Mapped locations","Lieux sur la carte")+
    '</small><strong>'+coverage.total+'</strong></div><div><small>'+L("Countries with exact source codes","Pays identifiés par les sources")+
    '</small><strong>'+coverage.countries.length+'</strong></div><div><small>'+
    L("No verified country code","Pays sans code vérifié")+'</small><strong>'+
    coverage.unknownCountry+'</strong></div></div>';
  s+='<p class="aoAtlasCoverageCaution">'+(mode==="heatmap"
    ?L("Density of published mapped locations, not Catholic population, attendance or devotion. One marker per known Place or separately listed venue.",
       "Densité des lieux cartographiés, non de la population catholique, de l’assistance à la messe ou de la dévotion. Un repère par lieu connu.")
    :L("Counts of source-associated mapped locations by country; zero means not represented in this catalogue, not no Catholic life. Boundaries are Natural Earth generalisations.",
       "Nombre de lieux cartographiés associés aux pays par les sources ; zéro signifie absent de ce catalogue, non absence de vie catholique. Frontières simplifiées Natural Earth."))+'</p>';
  if(mode==="heatmap")s+='<div class="aoAtlasCoverageLegend"><i></i><span>'+
    L("Fewer mapped points","Moins de repères")+' → '+L("More mapped points","Plus de repères")+'</span></div>';
  if(mode==="countries"){
    s+='<div class="aoAtlasCountryLegend"><span>0</span><span>1–5</span><span>6–20</span><span>21–60</span><span>61+</span></div>';
    s+='<p class="aoAtlasBoundaryStatus" data-atlas-boundary-status role="status">'+
      L("Loading sourced country boundaries…","Chargement des frontières sourcées…")+'</p>';
    s+='<div class="aoAtlasCountryRows" role="list">';
    for(const c of coverage.countries.slice(0,Math.max(12,Math.min(120,Number(limit)||12)))){
      s+='<div role="listitem"><button type="button" data-atlas-country="'+E(c.code)+'"><strong>'+
        E(c.name)+'</strong><span>'+c.count+'</span></button></div>';
    }
    s+='</div>';
    if(coverage.countries.length>limit)s+='<button type="button" data-atlas-country-more>'+
      L("Show more countries","Afficher davantage de pays")+' · '+(coverage.countries.length-limit)+'</button>';
  }
  s+='<footer>'+L("Map locations and country identities come from the existing Ad Orientem source registry. Not all places are mapped or attributed to a country.",
    "Lieux et pays issus du registre sourcé d’Ad Orientem. Certains lieux ne sont ni cartographiés ni rattachés à un pays.")+
    '<p><a target="_blank" rel="noopener noreferrer" href="https://www.naturalearthdata.com/about/terms-of-use/">'+
    L("Natural Earth boundary data · public domain","Frontières Natural Earth · domaine public")+'</a></p>'+
    '<button type="button" data-atlas-mode="places">'+L("Return to interactive places","Retour aux lieux interactifs")+'</button></footer>';
  return s+'</div></section>';
}
