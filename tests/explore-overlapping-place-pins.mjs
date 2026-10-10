import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {exploreDistinctPointChoices,mountExploreMap} from "../src/find/map-runtime.js";
const G=JSON.parse(readFileSync("data/geography/seed-registry.v1.json","utf8"));
const ids=["place:FR:rue-du-bac","place:FR:chapelle-saint-vincent-paris",
 "place:FR:notre-dame-paris","place:FR:basilique-notre-dame-victoires-paris",
 "place:FR:basilique-notre-dame-perpetuel-secours-paris"];
const items=ids.map(id=>{
 const p=G.places.find(x=>x.place_id===id);assert.ok(p,"lost Paris place: "+id);
 return {item_id:"heritage:place:"+id,lens:"heritage",title:p.name.official,
   place_id:id,geo:p.geo,map_publishable:true,heritage_primary:"shrines"};
});
const features=items.map(x=>({
 type:"Feature",geometry:{type:"Point",coordinates:[x.geo.lng,x.geo.lat]},
 properties:{item_id:x.item_id,name:x.title}
}));
assert.equal(exploreDistinctPointChoices([...features,features[0]]).length,5);
assert.deepEqual(exploreDistinctPointChoices([...features,features[0]]).map(x=>x.item_id),items.map(x=>x.item_id));
assert.deepEqual(exploreDistinctPointChoices([{}]),[]);
class El {
 constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.style={};this.attributes={};this.textContent="";}
 append(...children){this.children.push(...children)}
 setAttribute(key,value){this.attributes[key]=value}
 addEventListener(name,handler){this.listeners[name]=handler}
 click(){this.listeners.click?.()}
}
let lastMap=null,lastPopup=null;
class FakeMap {
 constructor(){this.handlers={};this.sources={};lastMap=this;this.container=null}
 addControl(){}
 on(event,layerOrHandler,handler){this.handlers[handler?event+"::"+layerOrHandler:event]=handler??layerOrHandler}
 addSource(id,config){this.sources[id]={...config,getClusterExpansionZoom:async()=>13,
   getClusterLeaves:async()=>features}}
 addLayer(){}
 fitBounds(){}
 getZoom(){return 13}
 queryRenderedFeatures(){return [...features,features[0]]}
 getSource(id){return this.sources[id]}
 getCanvas(){return {style:{}}}
 remove(){}
}
class FakePopup {
 constructor(){lastPopup=this;this.closed=false}
 setLngLat(coords){this.coords=coords;return this}
 setDOMContent(node){this.node=node;return this}
 addTo(){return this}
 remove(){this.closed=true;return this}
}
const doc={getElementById:()=>null,createElement:tag=>new El(tag),head:{append(){}}};
const win={document:doc,AO_FIND_MAPLIBRE_MODULE:{Map:FakeMap,Popup:FakePopup,
 NavigationControl:class{},FullscreenControl:class{}},matchMedia:()=>({matches:false})};
const selected=[];
const mounted=await mountExploreMap({innerHTML:""},items,{win,onSelect:id=>selected.push(id)});
assert.ok(mounted);
lastMap.handlers.load();
lastMap.handlers["click::ao-explore-points"]({
 point:{x:500,y:300},lngLat:{lng:2.33,lat:48.85},
 features:[features[0]]
});
assert.ok(lastPopup,"collocated distinct Places must produce a chooser instead of a random single selection");
const choices=lastPopup.node.children.filter(x=>x.tag==="button");
assert.equal(choices.length,5,"five separately sourced Paris Place markers must remain selectable");
assert.ok(choices.every(x=>x.attributes["aria-label"]),"Place selection lacks accessibility label");
choices[2].click();
assert.deepEqual(selected,[items[2].item_id],"Notre-Dame must remain individually reachable");
assert.equal(lastPopup.closed,true);
lastMap.handlers["click::ao-explore-clusters"]({
 features:[{properties:{cluster_id:12,point_count:5},
 geometry:{type:"Point",coordinates:[2.33,48.85]}}]
});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(lastPopup.node.children.filter(x=>x.tag==="button").length,5,
 "a max-zoom cluster must expose all five Places rather than expand into one obscuring marker");
lastPopup.node.children.find(x=>x.tag==="button").click();
assert.deepEqual(selected,[items[2].item_id,items[0].item_id]);
mounted.destroy();
console.log("PASS Explore overlapping Paris points: five unique Places remain independently reachable on points and maximum-zoom clusters");
