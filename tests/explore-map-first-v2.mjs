import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {discoverItemsWithinMapBounds,renderMapcnDiscoverRail} from "../src/find/mapcn-discover-rail.js";
import {renderHeritageToString} from "../src/find/heritage-presentation.js";

const places=[
 {item_id:"shrine:one",place_id:"place:FR:one",title:"Documented One",subtitle:"France",
  geo:{lat:43.2,lng:5.1},map_publishable:true,heritage_primary:"shrines"},
 {item_id:"shrine:two",place_id:"place:FR:two",title:"Documented Two",subtitle:"France",
  geo:{lat:48.4,lng:2.3},map_publishable:true,heritage_primary:"shrines"},
 {item_id:"shrine:unpublished",place_id:"place:FR:unpublished",title:"Unpublished",
  geo:{lat:43.2,lng:5.1},map_publishable:false},
 {item_id:"shrine:no-geo",place_id:"place:FR:missing",title:"Without coordinates",
  geo:{lat:null,lng:5.1},map_publishable:true},
 {item_id:"shrine:blank-geo",place_id:"place:FR:blank",title:"Blank coordinates",
  geo:{lat:"",lng:5.1},map_publishable:true},
];
const bounds={contains:([lng,lat])=>lng>=4&&lng<=7&&lat>=42&&lat<=45};
const subset=discoverItemsWithinMapBounds(places,bounds);
assert.deepEqual(subset.map(item=>item.place_id),["place:FR:one"],
 "Map area must include only already-published places with grounded coordinates");
assert.equal(places.length,5,"Viewport filtering must not alter source records");
assert.equal(discoverItemsWithinMapBounds(places,null),places,
 "When MapLibre bounds are unavailable, keep the pre-existing unscoped list");
const profile={
 place_id:"place:FR:one",name:"Documented One",place_type:"shrine",
 address:{city:"Example City",country:"France"},
 editorial_feature:{ordinal:1},
 media:{asset_path:"/approved-place.jpg",alt_en:"Church exterior",alt_fr:"Église",credit:"Owner",license:"CC0"}
};
const vm={
 language:"en",items:subset,filters:{mapcnDiscoverLimit:36},placeProfiles:[profile],
 featuredPlaces:[profile],nearby:[],selectedPlace:null,selected:null,
 lens:"heritage",network:null,timeMass:null,atlasCoverage:null,
 journeyOpen:false,counts:{heritage:1},
};
const rail=renderMapcnDiscoverRail({...vm,discoverViewport:true});
assert.match(rail,/data-mapcn-discover-toggle/,"Discovery must have an accessible toggle");
assert.match(rail,/aria-expanded="false"/,"Map should initially remain unobstructed");
assert.match(rail,/data-discover-expanded="false"/);
assert.match(rail,/In this area/);
assert.match(rail,/Documented One/);
assert.match(rail,/approved-place\.jpg/,"Approved documented image should remain accessible");
assert.doesNotMatch(rail,/Documented Two|Unpublished|Without coordinates/);
const french=renderMapcnDiscoverRail({...vm,language:"fr",discoverViewport:true});
assert.match(french,/Dans cette région/);
const noMatches=renderMapcnDiscoverRail({...vm,items:[],discoverViewport:true});
assert.match(noMatches,/No documented place in this map view/);
assert.doesNotMatch(noMatches,/data-mapcn-discover-more/);
const surface=renderHeritageToString(vm,{placeSheet:()=>"",detailSheet:()=>""});
const categories=surface.match(/<nav class="aoHeritageCategories"[\s\S]*?<\/nav>/)?.[0]??"";
const secondary=surface.match(/<nav class="aoHeritageSecondary"[\s\S]*?<\/nav>/)?.[0]??"";
assert.ok(categories,"Primary map categories must be present");
assert.match(categories,/data-find-filter="lens" data-find-filter-value="saints"/,
 "Published Saints must remain a direct, visible map doorway");
for(const category of ["ALL","shrines","pilgrimages","relics","apparitions"])
 assert.match(categories,new RegExp('data-heritage-category="'+category+'"'));
for(const specialized of ["data-bible-atlas-open","data-explore-time-mass-toggle",
 "data-explore-journey-open","data-atlas-mode","data-network-toggle"])
 assert.doesNotMatch(categories,new RegExp(specialized),
  "Specialist navigation must not cover the map's primary filter row");
for(const specialized of ["data-bible-atlas-open","data-explore-time-mass-toggle",
 "data-explore-journey-open","data-atlas-mode","data-network-toggle"])
 assert.match(secondary,new RegExp(specialized),
  "No previously published specialist tool can become unreachable");
const runtime=readFileSync("src/find/browser-entry.js","utf8");
const css=readFileSync("src/find/explore-map-first-v2-style.js","utf8");
assert.match(runtime,/map\.getBounds\?\.\(\)/);
assert.match(runtime,/mapHandle\.map\?\.on\?\.\("moveend",syncDiscoverViewport\)/);
assert.match(runtime,/if\(reuseMap\)\{syncJourneyMarkers\(\);syncDiscoverViewport\(\);return true;\}/);
assert.match(runtime,/data-mapcn-discover-toggle/);
assert.match(css,/data-discover-expanded="false"/);
assert.match(css,/@media\(max-width:799px\)/);
assert.match(css,/prefers-reduced-motion:reduce/);
console.log("Explore map-first v2 contracts passed.");
