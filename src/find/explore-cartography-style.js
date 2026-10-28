// Ad Orientem cartographic legibility layer for the verified OpenFreeMap DARK
// style only. Never replace the map owner, tile provider, attribution, fonts,
// labels, place coordinates, MapLibre source IDs, or institution emblems.
//
// The upstream Dark style currently draws countries and cities in roughly
// rgb(101,101,101) over almost-black land, and water labels nearly black.
// Only known, type-checked upstream layer IDs are adjusted. A changed provider
// style or the Biblical Atlas' separate style owner is left untouched.
export const EXPLORE_DARK_CARTOGRAPHY=Object.freeze({
  background:{type:"background",paint:{"background-color":"#1a2730"}},
  water:{type:"fill",paint:{"fill-color":"#0e1a28"}},
  waterway:{type:"line",paint:{"line-color":"#294454"}},
  landcover_ice_shelf:{type:"fill",paint:{"fill-color":"#35434c"}},
  landcover_glacier:{type:"fill",paint:{"fill-color":"#344550"}},
  landuse_residential:{type:"fill",paint:{"fill-color":"#23313a"}},
  landuse_park:{type:"fill",paint:{"fill-color":"#263a34"}},
  landcover_wood:{type:"fill",paint:{"fill-color":"#263a34"}},
  boundary_state:{type:"line",paint:{"line-color":"#50616b"}},
  "boundary_country_z0-4":{type:"line",paint:{"line-color":"#768893","line-opacity":0.95}},
  "boundary_country_z5-":{type:"line",paint:{"line-color":"#768893","line-opacity":0.95}},
  water_name:{type:"symbol",paint:{
    "text-color":"#86abb7","text-halo-color":"#0e1a28","text-halo-width":1.1,
  }},
  place_country_major:{type:"symbol",paint:{
    "text-color":"#e0cc9f","text-halo-color":"#1a2730","text-halo-width":1.6,
  },layout:{"text-size":["interpolate",["linear"],["zoom"],0,11,3,14,5,16]}},
  place_country_minor:{type:"symbol",paint:{
    "text-color":"#d5c6a7","text-halo-color":"#1a2730","text-halo-width":1.5,
  },layout:{"text-size":["interpolate",["linear"],["zoom"],0,10,4,13,6,14]}},
  place_country_other:{type:"symbol",paint:{
    "text-color":"#c5c0af","text-halo-color":"#1a2730","text-halo-width":1.4,
  }},
  place_state:{type:"symbol",paint:{
    "text-color":"#b6bdbb","text-halo-color":"#17252f","text-halo-width":1.25,
  }},
  place_city_large:{type:"symbol",paint:{
    "text-color":"#f1e6d0","text-halo-color":"#14232c","text-halo-width":1.5,
  },layout:{"text-size":15}},
  place_city:{type:"symbol",paint:{
    "text-color":"#d9ded8","text-halo-color":"#14232c","text-halo-width":1.4,
  },layout:{"text-size":12}},
  place_town:{type:"symbol",paint:{
    "text-color":"#c8d0cc","text-halo-color":"#14232c","text-halo-width":1.3,
  },layout:{"text-size":11}},
  place_village:{type:"symbol",paint:{
    "text-color":"#b1c3c2","text-halo-color":"#14232c","text-halo-width":1.2,
  }},
  place_suburb:{type:"symbol",paint:{
    "text-color":"#adbab9","text-halo-color":"#14232c","text-halo-width":1.2,
  }},
  place_other:{type:"symbol",paint:{
    "text-color":"#adbab9","text-halo-color":"#14232c","text-halo-width":1.2,
  }},
});

// A no-op with older embedded map stubs, custom providers or partially loaded
// styles. No speculative layers, external tile requests or user preferences.
export function applyExploreDarkCartography(map){
  if(typeof map?.getStyle!=="function"||
     typeof map?.setPaintProperty!=="function"||
     typeof map?.setLayoutProperty!=="function")return {applied:0,skipped:0};
  const layers=map.getStyle()?.layers;
  if(!Array.isArray(layers))return {applied:0,skipped:0};
  const byId=new Map(layers.filter(layer=>layer?.id).map(layer=>[layer.id,layer]));
  let applied=0,skipped=0;
  for(const [id,entry] of Object.entries(EXPLORE_DARK_CARTOGRAPHY)){
    const layer=byId.get(id);
    if(!layer||layer.type!==entry.type){skipped++;continue;}
    try{
      for(const [property,value] of Object.entries(entry.paint))
        map.setPaintProperty(id,property,value);
      for(const [property,value] of Object.entries(entry.layout||{}))
        map.setLayoutProperty(id,property,value);
      applied++;
    }catch{
      // Provider revisions must never prevent the user's map from rendering.
      skipped++;
    }
  }
  return {applied,skipped};
}
