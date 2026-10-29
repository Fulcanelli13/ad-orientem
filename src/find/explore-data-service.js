import { loadDirectoryDataset } from "./data-service.js";
import { ACTIVE_SAINTS_CHANNEL, isResearchSaintsChannel, applySaintsReleaseBoundary } from "./saints-release-policy.js";

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
  saintsPilot:moduleUrl("../../data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
  saintsDoctors:moduleUrl("../../data/saints/holiness-first-eight-doctors-research-20261015.v1.json"),
  saintsVocations:moduleUrl("../../data/saints/holiness-first-sixteen-cross-vocation-research.v1.json"),
  saintsOwnerIndex:moduleUrl("../../data/saints/read-only-calendar-art-index-20261015.v1.json"),
  saintsCalendarBridge:moduleUrl("../../data/saints/parallel-owner-identity-bridge-20261015.v1.json"),
  customs:moduleUrl("../../data/customs/customs-atlas-seed.v1.json"),
  customSources:moduleUrl("../../data/customs/source-registry.v1.json"),
  customGuidance:moduleUrl("../../data/customs/customs-p0-guidance-en-fr.v1.json"),
  customGuidanceP1:moduleUrl("../../data/customs/customs-p1-guidance-en-fr.v1.json"),
  shrines:moduleUrl("../../data/shrines/shrines-pilgrimages-seed.v1.json"),
  sacredPhenomena:moduleUrl("../../data/explore/sacred-phenomena-seed.v1.json"),
  relicIndoorPlacement:moduleUrl("../../data/explore/relic-indoor-placement.v1.json"),
  shrineSources:moduleUrl("../../data/shrines/source-registry.v1.json"),
  routeStageEvidence:moduleUrl("../../data/shrines/route-stage-evidence-20261020.v1.json"),
  routeGeometryReview:moduleUrl("../../data/shrines/route-geometry-review-20261020.v1.json"),
  routeStageSiteLinks:moduleUrl("../../data/shrines/route-stage-canonical-site-links-20261020.v1.json"),
  novenaBridge:moduleUrl("../../data/customs/novena-context-links.v1.json"),
  novenaSot:moduleUrl("../../data/pray/novena-sot.v1.json"),
  approvedPlaceMedia:moduleUrl("../../data/geography/approved-place-media.v1.json"),
  approvedPlaceGallery:moduleUrl("../../data/geography/approved-place-gallery.v1.json"),
  majorPlaceEditorial:moduleUrl("../../data/geography/major-places-editorial.v1.json"),
  illustratedPlaceGuides:moduleUrl("../../data/shrines/illustrated-place-guides-ireland.v1.json"),
  illustratedFrenchGuides:moduleUrl("../../data/shrines/illustrated-place-guides-france.v1.json"),
  illustratedFrenchR67:moduleUrl("../../data/shrines/illustrated-place-guides-france-r67.v1.json"),
  illustratedWorldMarianR1:moduleUrl("../../data/shrines/illustrated-place-guides-world-marian-r1.v1.json"),
  illustratedGlobalSaintsR1:moduleUrl("../../data/shrines/illustrated-place-guides-global-saints-r1.v1.json"),
  illustratedGlobalMarianB2:moduleUrl("../../data/shrines/illustrated-place-guides-global-marian-b2.v1.json"),
});

export async function loadExploreDataset({fetchImpl=fetch,saintsChannel=ACTIVE_SAINTS_CHANNEL}={}){
  const research=isResearchSaintsChannel(saintsChannel);
  const [directory,geography,customs,customSources,customGuidance,customGuidanceP1,shrines,shrineSources,novenaBridge,novenaSot,sacredPhenomena,relicIndoorPlacement,relatedPlaces,approvedPlaceMedia,approvedPlaceGallery,majorPlaceEditorial,illustratedPlaceGuides,illustratedFrenchGuides,illustratedFrenchR67,illustratedWorldMarianR1,illustratedGlobalSaintsR1,illustratedGlobalMarianB2,biblePlaces,saintsPilot,saintsCalendarBridge,saintsDoctors,saintsVocations,saintsOwnerIndex,routeStageEvidence,routeGeometryReview,routeStageSiteLinks]=await Promise.all([
    loadDirectoryDataset({fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.geography,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.customs,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.customSources,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.customGuidance,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.customGuidanceP1,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.shrines,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.shrineSources,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.novenaBridge,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.novenaSot,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.sacredPhenomena,{fetchImpl}),
    fetchJson(EXPLORE_DATA_URLS.relicIndoorPlacement,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.relatedPlaces,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.approvedPlaceMedia,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.approvedPlaceGallery,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.majorPlaceEditorial,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.illustratedPlaceGuides,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.illustratedFrenchGuides,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.illustratedFrenchR67,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.illustratedWorldMarianR1,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.illustratedGlobalSaintsR1,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.illustratedGlobalMarianB2,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.biblePlaces,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.saintsPilot,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.saintsCalendarBridge,{fetchImpl,optional:true}),
    research?fetchJson(EXPLORE_DATA_URLS.saintsDoctors,{fetchImpl,optional:true}):Promise.resolve(null),
    research?fetchJson(EXPLORE_DATA_URLS.saintsVocations,{fetchImpl,optional:true}):Promise.resolve(null),
    research?fetchJson(EXPLORE_DATA_URLS.saintsOwnerIndex,{fetchImpl,optional:true}):Promise.resolve(null),
    fetchJson(EXPLORE_DATA_URLS.routeStageEvidence,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.routeGeometryReview,{fetchImpl,optional:true}),
    fetchJson(EXPLORE_DATA_URLS.routeStageSiteLinks,{fetchImpl,optional:true}),
  ]);
  return applySaintsReleaseBoundary({
    directory,
    biblePlaces:Object.freeze({entries:safeArray(biblePlaces?.entries)}),
    saints:saintsPilot?.schema==="ao.saints.holiness-first-editorial-pilot.v1"&&saintsPilot?.publication==="RESEARCH_ONLY_NOT_APP_VISIBLE"?saintsPilot:null,
    saintsDoctors:saintsDoctors?.publication==="RESEARCH_ONLY_NO_APP_VISIBILITY"?saintsDoctors:null,
    saintsVocations:saintsVocations?.publication==="RESEARCH_ONLY_NOT_APP_VISIBLE"?saintsVocations:null,
    saintsOwnerIndex:saintsOwnerIndex?.schema==="ao.saints.read-only-owner-index-20261015.v1"?saintsOwnerIndex:null,
    saintsCalendarBridge:saintsCalendarBridge?.schema==="ao.saints.parallel-owner-identity-bridge.v1" && saintsCalendarBridge?.status==="EDITORIAL_SOURCE_LINKS_ONLY_NOT_GLOBAL_ID_RENAMES"?saintsCalendarBridge:null,
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
      guidance:[
        ...(customGuidance?.schema==="AO_CUSTOMS_P0_GUIDANCE_EN_FR_V1"&&customGuidance?.publication==="SUPPORTING_COPY_FOR_PUBLISHED_CANONICAL_IDS"?safeArray(customGuidance.entries):[]),
        ...(customGuidanceP1?.schema==="AO_CUSTOMS_P1_GUIDANCE_EN_FR_V1"&&customGuidanceP1?.publication==="SUPPORTING_COPY_FOR_PUBLISHED_CANONICAL_IDS"?safeArray(customGuidanceP1.entries):[]),
      ],
    }),
    sacredPhenomena:Object.freeze({apparitions:safeArray(sacredPhenomena?.apparitions),relics:safeArray(sacredPhenomena?.relics),norms:sacredPhenomena?.norms??null,
      indoorPlacement:relicIndoorPlacement?.schema==="AO_RELIC_INDOOR_PLACEMENT_V1"?relicIndoorPlacement:null}),
    shrines:Object.freeze({
      shrines:safeArray(shrines?.shrines),
      pilgrimages:safeArray(shrines?.pilgrimages),
      routes:safeArray(shrines?.routes),
      routeStageEvidence:routeStageEvidence?.schema==="AO_PILGRIMAGE_STAGE_EVIDENCE_V1"
        ?safeArray(routeStageEvidence?.routes):[],
      routeGeometryReview:routeGeometryReview?.schema==="AO_PILGRIMAGE_GEOMETRY_REVIEW_V1"
        ?safeArray(routeGeometryReview?.reviewed_routes):[],
      routeStageSiteLinks:routeStageSiteLinks?.schema==="AO_PILGRIMAGE_STAGE_CANONICAL_SITE_LINKS_V1"
        ?safeArray(routeStageSiteLinks?.links):[],
      temporalLinks:safeArray(shrines?.temporalLinks),
      sources:safeArray(shrineSources?.sources),
    }),
    media:Object.freeze({
      approved:approvedPlaceMedia?.schema==="AO_APPROVED_PLACE_MEDIA_V1"?safeArray(approvedPlaceMedia?.items):[],
      gallery:approvedPlaceGallery?.schema==="AO_APPROVED_PLACE_GALLERY_V1"?safeArray(approvedPlaceGallery?.items):[],
    }),
    editorial:Object.freeze({
      featured:majorPlaceEditorial?.schema==="AO_EXPLORE_MAJOR_PLACES_EDITORIAL_V1"?safeArray(majorPlaceEditorial?.items):[],
      placeGuides:[...((illustratedPlaceGuides?.schema==="AO_ILLUSTRATED_PLACE_GUIDES_V1")?safeArray(illustratedPlaceGuides?.guides):[]),...((illustratedFrenchGuides?.schema==="AO_ILLUSTRATED_PLACE_GUIDES_V1")?safeArray(illustratedFrenchGuides?.guides):[]),...((illustratedFrenchR67?.schema==="AO_ILLUSTRATED_PLACE_GUIDES_V1")?safeArray(illustratedFrenchR67?.guides):[]),...((illustratedWorldMarianR1?.schema==="AO_ILLUSTRATED_PLACE_GUIDES_V1")?safeArray(illustratedWorldMarianR1?.guides):[]),...((illustratedGlobalSaintsR1?.schema==="AO_ILLUSTRATED_PLACE_GUIDES_V1")?safeArray(illustratedGlobalSaintsR1?.guides):[]),...((illustratedGlobalMarianB2?.schema==="AO_ILLUSTRATED_PLACE_GUIDES_V1")?safeArray(illustratedGlobalMarianB2?.guides):[])].filter(row=>row?.publication==="PUBLISHED"),
    }),
    novenas:Object.freeze({
      records:safeArray(novenaSot?.novenas),
      links:safeArray(novenaBridge?.links),
      sources:safeArray(novenaBridge?.sources),
      researchStatus:novenaBridge?.research_status??null,
    }),
  },saintsChannel);
}
