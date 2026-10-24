import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {attachExploreMapStatus} from "../src/find/map-status.js";

function createHarness({fr=false,alreadyLoaded=false}={}){
 const events=new Map(),timers=new Map(),cancelled=[];
 let nextId=0;
 const doc={
  createElement(){
   return {className:"",attributes:{},textContent:"",removed:false,
    setAttribute(key,value){this.attributes[key]=value;},
    remove(){this.removed=true;}};
  },
 };
 const container={ownerDocument:doc,dataset:{},nodes:[],
  append(node){this.nodes.push(node);}};
 const map={
  on(event,callback){events.set(event,callback)},
  loaded(){return alreadyLoaded},
 };
 const win={
  AO_RUNTIME_V8:{store:{getState:()=>({language:fr?"fr":"en"})}},
  setTimeout(callback){const id=++nextId;timers.set(id,callback);return id;},
  clearTimeout(id){cancelled.push(id);timers.delete(id);}
 };
 return {container,map,win,timers,cancelled,events,
  trigger(event){events.get(event)?.()},
  expire(){for(const [id,fn] of [...timers]){timers.delete(id);fn();}}
 };
}
{
 const h=createHarness();
 const status=attachExploreMapStatus(h.container,h.map,{win:h.win,waitMs:50});
 assert.equal(status.status(),"loading");
 assert.equal(h.container.dataset.aoMapState,"loading");
 assert.equal(h.container.nodes.length,1);
 assert.equal(h.container.nodes[0].attributes.role,"status");
 assert.match(h.container.nodes[0].textContent,/Loading map background/);
 assert.equal(h.timers.size,1);
 h.expire();
 assert.equal(status.status(),"stalled");
 assert.equal(h.container.dataset.aoMapState,"stalled");
 assert.match(h.container.nodes[0].textContent,/Search and place details remain available/);
 assert.equal(h.container.nodes[0].removed,false);
 h.trigger("load");
 assert.equal(status.status(),"ready","a recovered map must clear an earlier stalled status");
 assert.equal(h.container.dataset.aoMapState,"ready");
 assert.equal(h.container.nodes[0].removed,true);
 status.dispose();
}
{
 const h=createHarness({fr:true});
 const status=attachExploreMapStatus(h.container,h.map,{win:h.win,waitMs:50});
 assert.match(h.container.nodes[0].textContent,/Chargement du fond de carte/);
 status.dispose();
 assert.equal(h.timers.size,0,"Map leave must cancel the status watchdog");
 h.expire();
 assert.equal(status.status(),"loading","stale timeout after dispose must never reappear");
}
{
 const h=createHarness({alreadyLoaded:true});
 const status=attachExploreMapStatus(h.container,h.map,{win:h.win,waitMs:50});
 assert.equal(status.status(),"ready","synchronous/mock map load should not leave loading stuck");
 assert.equal(h.container.nodes[0].removed,true);
 assert.equal(h.timers.size,0);
 status.dispose();
}
// Style load is not the same thing as finished basemap tiles.
{
 const h=createHarness();
 let tilesLoaded=false;
 h.map.areTilesLoaded=()=>tilesLoaded;
 const status=attachExploreMapStatus(h.container,h.map,{win:h.win,waitMs:50});
 h.trigger("load");
 assert.equal(status.status(),"loading",
  "Remote tiles still pending: keep accessible loading state visible");
 h.expire();
 assert.equal(status.status(),"stalled","Unresolved tile fetch should disclose map delay");
 assert.equal(h.container.nodes[0].removed,false);
 tilesLoaded=true;h.trigger("idle");
 assert.equal(status.status(),"ready","Late tile recovery must clear warning");
 assert.equal(h.container.nodes[0].removed,true);
 status.dispose();
}
// Keep import latency distinct from irrecoverable map failure: a slow CDN
// cannot cause a late successful map to be destroyed.
const ownerSource=readFileSync(new URL("../src/find/browser-entry.js",import.meta.url),"utf8");
assert.match(ownerSource,/pending\.className="aoExploreMapLoading aoExploreMapStalled"/);
assert.doesNotMatch(ownerSource,/if\s*\(\s*importStalled\s*\)/,
  "A delayed but successful map import must remain recoverable");
console.log("PASS Explore map status: loading, stalled, recovery and cleanup");
