import { loadDirectoryDataset } from "./data-service.js";

function safeArray(value){return Array.isArray(value)?value:[];}
async function fetchJson(url,{fetchImpl=fetch,optional=false}={}){
  try{
    const response=await fetchImpl(url,{headers:{accept:"application/json"}});
    if(!response.ok){
      if(optional)return null;
      throw new Error("HTTP "+response.status+" for "+url);
    }
    return await response.json();
  }catch(error){
    if(optional)return null;
    throw error;
  }
}
function moduleUrl(relative){return new URL(relative,import.meta.url).href;}

export const EXPLORE_DATA_URLS=Object.freeze({
  geography:moduleUrl("../../data/geography/seed-registry.v1.json"),
  customs:moduleUrl("../../data/customs/customs-atlas-seed.v1.json"),
  customSources:moduleUrl("../../data/customs/source-registry.v1.json"),
  shrines:moduleUrl("../../data/shrines/shrines-pilgrimages-seed.v1.json"),
  shrineSources:moduleUrl("../../data/shrines/source-registry.v1.json"),
  novenaBridge:moduleUrl("../../data/customs/novena-context-links.v1.json"),
  novenaSot:moduleUrl("../../data/pray/novena-sot.v1.json"),
});

export async function loadExploreDataset({fetchImpl=fetch}={}){
  const [directory,geography,customs,customSources,shrines,shrineSources,novenaBridge,novenaSot]=await Promise.all([
    loadDirectoryDataset({fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.geography,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.customs,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.customSources,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.shrines,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.shrineSources,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.novenaBridge,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.novenaSot,{fetchImpl}),
  ]);
  return Object.freeze({
    directory,
    geography:Object.freeze({
      geoAreas:safeArray(geography?.geoAreas),
      places:safeArray(geography?.places),
      directoryPlaceLinks:safeArray(geography?.directoryPlaceLinks),
    }),
    customs:Object.freeze({
      customs:safeArray(customs?.customs),
      attestations:safeArray(customs?.attestations),
      sources:safeArray(customSources?.sources),
    }),
    shrines:Object.freeze({
      shrines:safeArray(shrines?.shrines),
      pilgrimages:safeArray(shrines?.pilgrimages),
      routes:safeArray(shrines?.routes),
      temporalLinks:safeArray(shrines?.temporalLinks),
      sources:safeArray(shrineSources?.sources),
    }),
    novenas:Object.freeze({
      records:safeArray(novenaSot?.novenas),
      links:safeArray(novenaBridge?.links),
      sources:safeArray(novenaBridge?.sources),
      researchStatus:novenaBridge?.research_status??null,
    }),
  });
}
