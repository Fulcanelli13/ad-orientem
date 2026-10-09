import assert from "node:assert/strict";
import {createFindOwner} from "../src/find/browser-entry.js";

function fixture({fail=false,delay=null,lang="en"}={}){
 const entries=new Map(),handlers={},visited=[];
 function element(tag="div"){
  const el={tagName:tag.toUpperCase(),id:"",dataset:{},hidden:false,innerHTML:"",style:{},
   getAttribute(){return null;},setAttribute(){},removeAttribute(){},focus(){},
   querySelector(){return null;},querySelectorAll(){return []},
   append(child){if(child.id)entries.set(child.id,child)},
   remove(){if(el.id)entries.delete(el.id)}
  };
  return el;
 }
 const body=element("body"),head=element("head");
 const doc={body,head,documentElement:{dataset:{}},
  getElementById:id=>entries.get(id)??null,
  createElement:tag=>element(tag),
  addEventListener(name,fn){handlers[name]=fn},
  removeEventListener(){},
 };
 const win={
  document:doc,console:{error(...args){visited.push("error:"+String(args[0]));}},
  AO_RUNTIME_V8:{store:{getState:()=>({language:lang})}},
  AO_APP_SHELL_V1:{syncSurface(x){visited.push("surface:"+x)},navigate:async x=>{visited.push("route:"+x);return {ok:true}}},
  async fetch(url){
   visited.push("fetch");
   if(delay)await delay;
   if(fail)throw Error("offline fixture");
   return {ok:true,json:async()=>({})};
  }
 };
 return {win,doc,handlers,entries,visited,root:()=>entries.get("ao-find-modular-root"),setFail(value){fail=value}};
}
const flush=async()=>{for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));};
const f=fixture({fail:true});
const owner=createFindOwner(f.win);
assert.equal(await owner.open({lens:"traditions",view:"map"}),true,"A recoverable Explore error panel must visibly open");
assert.equal(owner.status().open,true);
assert.equal(owner.status().loadState,"error");
assert.equal(owner.status().lens,"traditions");
assert.match(f.root().innerHTML,/role="alert"/);
assert.match(f.root().innerHTML,/data-find-retry/);
assert.match(f.root().innerHTML,/data-find-close/);
assert.match(f.root().innerHTML,/Content unavailable/);
const tries=f.visited.filter(s=>s==="fetch").length;
f.setFail(false);
const target={getAttribute:()=>null,setAttribute(){},removeAttribute(){},closest:s=>s==="[data-find-retry]"?target:null};
f.handlers.click({target,preventDefault(){}});
await flush();
assert.ok(f.visited.filter(s=>s==="fetch").length>tries,"Retry did not re-attempt the failed dataset load");
assert.equal(owner.status().loadState,"ready","Success did not replace the recoverable error panel");
assert.equal(f.root().dataset.aoFindLoadState,"ready");
owner.close();
assert.equal(owner.status().loadState,"closed");
const fr=fixture({fail:true,lang:"fr"});
const frenchOwner=createFindOwner(fr.win);
assert.equal(await frenchOwner.open(),true);
assert.match(fr.root().innerHTML,/Contenu indisponible/);
assert.match(fr.root().innerHTML,/Réessayer/);
frenchOwner.dispose();
let complete;
const hold=new Promise(resolve=>{complete=resolve;});
const stale=fixture({delay:hold});
const staleOwner=createFindOwner(stale.win);
const pending=staleOwner.open();
staleOwner.close();
complete();
assert.equal(await pending,false,"An async fetch may not re-open an already closed Explore screen");
assert.equal(staleOwner.status().open,false);
assert.equal(staleOwner.root?.(),undefined);
console.log("PASS Explore first-load offline recovery: EN/FR error, exact retry, successful reload and stale-close guard");
