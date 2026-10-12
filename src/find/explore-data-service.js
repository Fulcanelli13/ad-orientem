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
  relatedPlaces:moduleUrl("../../data/geography/related-places.v1.json"),
  biblePlaces:moduleUrl("../../data/explore/bible-places-compact.v1.json"),
  biblicalLineageReview:moduleUrl("../../data/explore/biblical-lineage-curated-review.v1.json"),
  bibleCinematicStudies:moduleUrl("../../data/explore/biblical-cinematic-studies-review.v1.json"),
  customs:moduleUrl("../../data/customs/customs-atlas-seed.v1.json"),
  customSources:moduleUrl("../../data/customs/source-registry.v1.json"),
  shrines:moduleUrl("../../data/shrines/shrines-pilgrimages-seed.v1.json"),
  sacredPhenomena:moduleUrl("../../data/explore/sacred-phenomena-seed.v1.json"),
  shrineSources:moduleUrl("../../data/shrines/source-registry.v1.json"),
  novenaBridge:moduleUrl("../../data/customs/novena-context-links.v1.json"),
  novenaSot:moduleUrl("../../data/pray/novena-sot.v1.json"),
  approvedPlaceMedia:moduleUrl("../../data/geography/approved-place-media.v1.json"),
  approvedPlaceGallery:moduleUrl("../../data/geography/approved-place-gallery.v1.json"),
  majorPlaceEditorial:moduleUrl("../../data/geography/major-places-editorial.v1.json"),
  illustratedPlaceGuides:moduleUrl("../../data/shrines/illustrated-place-guides-ireland.v1.json"),
  illustratedFrenchGuides:moduleUrl("../../data/shrines/illustrated-place-guides-france.v1.json"),
  illustratedFrenchR67:moduleUrl("../../data/shrines/illustrated-place-guides-france-r67.v1.json"),
});

export async function loadExploreDataset({fetchImpl=fetch}={}){
  const [directory,geography,customs,customSources,shrines,shrineSources,novenaBridge,novenaSot,sacredPhenomena,relatedPlaces,approvedPlaceMedia,approvedPlaceGallery,majorPlaceEditorial,illustratedPlaceGuides,illustratedFrenchGuides,illustratedFrenchR67,biblePlaces]=await Promise.all([
    loadDirectoryDataset({fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.geography,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.customs,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.customSources,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.shrines,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.shrineSources,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.novenaBridge,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.novenaSot,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.sacredPhenomena,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.relatedPlaces,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.approvedPlaceMedia,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.approvedPlaceGallery,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.majorPlaceEditorial,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.illustratedPlaceGuides,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.illustratedFrenchGuides,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.illustratedFrenchR67,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.biblePlaces,{fetchImpl,optional:true}),
  ]);
  return Object.freeze({
    directory,
    biblePlaces:Object.freeze({entries:safeArray(biblePlaces?.entries)}),
    geography:Object.freeze({
      geoAreas:safeArray(geography?.geoAreas),
      places:safeArray(geography?.places),
      directoryPlaceLinks:safeArray(geography?.directoryPlaceLinks),
      placeRelationships:safeArray(relatedPlaces?.relationships),
    }),
    customs:Object.freeze({
      customs:safeArray(customs?.customs),
      attestations:safeArray(customs?.attestations),
      sources:safeArray(customSources?.sources),
    }),
    sacredPhenomena:Object.freeze({apparitions:safeArray(sacredPhenomena?.apparitions),relics:safeArray(sacredPhenomena?.relics),norms:sacredPhenomena?.norms??null}),
    shrines:Object.freeze({
      shrines:safeArray(shrines?.shrines),
      pilgrimages:safeArray(shrines?.pilgrimages),
      routes:safeArray(shrines?.routes),
      temporalLinks:safeArray(shrines?.temporalLinks),
      sources:safeArray(shrineSources?.sources),
    }),
    media:Object.freeze({
      approved:approvedPlaceMedia?.schema==="AO_APPROVED_PLACE_MEDIA_V1"?safeArray(approvedPlaceMedia?.items):[],
      gallery:approvedPlaceGallery?.schema==="AO_APPROVED_PLACE_GALLERY_V1"?safeArray(approvedPlaceGallery?.items):[],
    }),
    editorial:Object.freeze({
      featured:majorPlaceEditorial?.schema==="AO_EXPLORE_MAJOR_PLACES_EDITORIAL_V1"?safeArray(majorPlaceEditorial?.items):[],
      placeGuides:[...((illustratedPlaceGuides?.schema==="AO_ILLUSTRATED_PLACE_GUIDES_V1")?safeArray(illustratedPlaceGuides?.guides):[]),...((illustratedFrenchGuides?.schema==="AO_ILLUSTRATED_PLACE_GUIDES_V1")?safeArray(illustratedFrenchGuides?.guides):[]),...((illustratedFrenchR67?.schema==="AO_ILLUSTRATED_PLACE_GUIDES_V1")?safeArray(illustratedFrenchR67?.guides):[])].filter(row=>row?.publication==="PUBLISHED"),
    }),
    novenas:Object.freeze({
      records:safeArray(novenaSot?.novenas),
      links:safeArray(novenaBridge?.links),
      sources:safeArray(novenaBridge?.sources),
      researchStatus:novenaBridge?.research_status??null,
    }),
  });
}

// Lazy-load review-only genealogy; ordinary Explore does not fetch this research payload.
export async function loadBiblicalLineageReview({fetchImpl=fetch}={}){
  return await fetchJson(EXPLORE_DATA_URLS.biblicalLineageReview,{fetchImpl,optional:true});
}

// Four-journey / 181-scene crosswalk stays review-only, fetched when specifically opened.
export async function loadBibleCinematicStudies({fetchImpl=fetch}={}){
  return await fetchJson(EXPLORE_DATA_URLS.bibleCinematicStudies,{fetchImpl,optional:true});
}
