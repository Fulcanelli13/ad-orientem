import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {createGlossaryRuntime} from "../src/glossary/browser-entry.js";

function gate(){
 let release;
 const promise=new Promise(resolve=>release=resolve);
 return {promise,release};
}
function fixture({wait=null,fail=false,language="en"}={}){
 const nodes=new Map();
 let fetches=0,focuses=0;
 const doc={
  activeElement:null,
  body:{append(node){nodes.set(node.id,node);node.isConnected=true}},
  getElementById:id=>nodes.get(id)??null,
  createElement(){
   const node={
    id:"",dataset:{},hidden:false,isConnected:false,innerHTML:"",
    attrs:{},listeners:{},scrollTop:0,
    setAttribute(name,value){this.attrs[name]=String(value)},
    removeAttribute(name){delete this.attrs[name]},
    addEventListener(name,fn){this.listeners[name]=fn},
    querySelector(){return null},
    remove(){nodes.delete(this.id);this.isConnected=false},
    scrollTo(){},
    focus(){focuses++}
   };
   return node;
  }
 };
 const win={
  document:doc,console:{error(){}},
  AO_RUNTIME_V8:{store:{getState:()=>({language}),subscribe(){return ()=>{}}}},
  async fetch(url){
   fetches++;
   if(wait)await wait.promise;
   if(fail)return {ok:false,status:503};
   return {ok:true,json:async()=>JSON.parse(readFileSync(fileURLToPath(url),"utf8"))};
  }
 };
 const owner=createGlossaryRuntime(win);
 return {owner,nodes,win,get fetches(){return fetches},get focuses(){return focuses},setFail(v){fail=v}};
}
const delayed=gate(),first=fixture({wait:delayed});
const pending=first.owner.open({entryId:"G001",origin:"context"});
assert.equal(first.owner.status().open,true,"Cold Glossary must show a loading surface");
assert.equal(first.owner.close(false),true);
assert.equal(first.owner.status().open,false);
delayed.release();
assert.equal(await pending,false,"A closed cold Glossary launch must not succeed afterwards");
assert.equal(first.nodes.has("ao-glossary-root"),false,"Late Glossary load remounted a closed sheet");

const secondGate=gate(),overlap=fixture({wait:secondGate,language:"fr"});
const firstTerm=overlap.owner.openTerms(["G001"],{origin:"context"});
const latest=overlap.owner.open({entryId:"G044",origin:"context"});
secondGate.release();
assert.equal(await firstTerm,false,"An earlier contextual Glossary request superseded the newer term");
assert.equal(await latest,true);
assert.equal(overlap.owner.status().detailId,"G044","A superseded Glossary load overwrote its latest target");
assert.equal(overlap.fetches,7,"Overlapping cold Glossary opens should use one seven-file load");
assert.equal(overlap.owner.close(false),true);
assert.equal(overlap.nodes.has("ao-glossary-root"),false);

const offline=fixture({fail:true,language:"fr"});
assert.equal(await offline.owner.openTerms(["G001"]),false,"Failed Glossary data load was misreported as success");
assert.equal(offline.owner.status().loaded,false);
assert.match(offline.owner.status().error??"",/HTTP_503/);
assert.equal(offline.owner.status().detailId,null);
offline.owner.close(false);
offline.setFail(false);
assert.equal(await offline.owner.open({entryId:"G001"}),true,"Glossary retry after offline load was blocked");
assert.equal(offline.owner.status().detailId,"G001");
assert.equal(offline.owner.status().loaded,true);
offline.owner.close(false);

const parent={isConnected:true,scrollHeight:250,clientHeight:100,scrollTop:72,parentElement:null};
const trigger={isConnected:true,parentElement:parent,focus(){parent.focused=true}};
const contextual=fixture({language:"fr"});
assert.equal(await contextual.owner.open({entryId:"G301",origin:"context",trigger}),true);
assert.equal(contextual.owner.status().detailId,"G301");
parent.scrollTop=4;
contextual.owner.close(false);
assert.equal(parent.scrollTop,72,"Returning from contextual Glossary lost source scroll");
assert.equal(parent.focused,true,"Returning from contextual Glossary failed to restore focus to the exact trigger");
assert.equal(contextual.nodes.has("ao-glossary-root"),false);
console.log("PASS Glossary contextual lifecycle: stale cold Close, latest-term ownership, singleflight, offline retry, French exact-source scroll/focus return");
