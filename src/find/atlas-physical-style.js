// Opt-in physical-geography basemap for the Biblical Atlas, never the
// worldwide directory or the normal Explore map. Natural Earth v5.1.0
// physical shapes (public domain); current coastlines are NOT period cartography.
const URLS=Object.freeze({
 land:new URL("../../data/explore/atlas-physical-land-50m.geojson",import.meta.url).href,
 lakes:new URL("../../data/explore/atlas-physical-lakes-50m.geojson",import.meta.url).href,
 rivers:new URL("../../data/explore/atlas-physical-rivers-50m.geojson",import.meta.url).href
});
const attribution='Physical geography: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> (public domain; modern coastlines)';
export const ATLAS_PHYSICAL_STYLE=Object.freeze({
 version:8,name:"Ad Orientem Biblical Atlas — physical geography review",
 sources:{
  "ao-physical-land":{type:"geojson",data:URLS.land,attribution},
  "ao-physical-lakes":{type:"geojson",data:URLS.lakes,attribution},
  "ao-physical-rivers":{type:"geojson",data:URLS.rivers,attribution},
  // Modern elevation, NOT a reconstruction of Biblical-period terrain.
  // Public Mapzen/Tilezen Terrarium terrain archive, hosted as AWS open data.
  "ao-physical-elevation":{type:"raster-dem",
   tiles:["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
   tileSize:256,maxzoom:12,encoding:"terrarium",
   attribution:'Terrain: <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank" rel="noopener noreferrer">Mapzen/Tilezen source credits</a> (modern elevation)'}
 },
 layers:[
  {id:"ao-physical-sea",type:"background",paint:{"background-color":"#102634"}},
  {id:"ao-physical-landfill",type:"fill",source:"ao-physical-land",
   paint:{"fill-color":"#454e42","fill-opacity":1}},
  {id:"ao-physical-shaded-relief",type:"hillshade",source:"ao-physical-elevation",
   paint:{"hillshade-exaggeration":0.28,
    "hillshade-shadow-color":"#101b20","hillshade-highlight-color":"#c6caac",
    "hillshade-accent-color":"#596755","hillshade-illumination-direction":315}},
  {id:"ao-physical-coastline",type:"line",source:"ao-physical-land",
   paint:{"line-color":"#a4ad9a","line-opacity":0.72,
    "line-width":["interpolate",["linear"],["zoom"],0,0.35,5,0.85,10,1.25]}},
  {id:"ao-physical-lakes-fill",type:"fill",source:"ao-physical-lakes",
   paint:{"fill-color":"#153745","fill-opacity":1}},
  {id:"ao-physical-rivers-line",type:"line",source:"ao-physical-rivers",
   paint:{"line-color":"#6a9caa","line-opacity":0.84,
    "line-width":["interpolate",["linear"],["zoom"],0,0.25,5,1.1,9,2.2]}}
 ]
});
export const ATLAS_PHYSICAL_SOURCES=Object.freeze({...URLS});
