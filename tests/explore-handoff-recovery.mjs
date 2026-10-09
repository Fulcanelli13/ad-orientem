import assert from "node:assert/strict";
import {createFindOwner} from "../src/find/browser-entry.js";

function fixture(lang="en"){
 const elements=new Map(),handlers={},calls=[];
 const action={textContent:"",hidden:true};
 function el(tag="div"){
  const o={tagName:tag.toUpperCase(),id:"",dataset:{},hidden:false,innerHTML:"",style:{},
    querySelector:q=>q==="[data-find-action-error]"?action:null,
    querySelectorAll:()=>[],setAttribute(){},removeAttribute(){},focus(){},getAttribute(){return null},
    append(child){if(child.id)elements.set(child.id,child)},remove(){if(o.id)elements.delete(o.id)}
  };return o;
 }
 const body=el("body"),head=el("head");
 const doc={body,head,documentElement:{dataset:{}},getElementById:id=>elements.get(id),
  createElement:tag=>el(tag),addEventListener:(name,fn)=>{handlers[name]=fn},
  removeEventListener(){}};
 let owner,routeOk=true,exactOk=true;
 const win={document:doc,console:{error(){}},AO_RUNTIME_V8:{store:{getState:()=>({language:lang})}},
  fetch:async()=>({ok:true,json:async()=>({})}),
  AO_CALENDAR_APP_V1:{async select(date){calls.push("select:"+date);return exactOk}},
  AO_PRAY_V435930:{async open(id,opts){calls.push("novena:"+opts.novenaId);return exactOk}},
  AO_APP_SHELL_V1:{
   getActive:()=>owner?.status().open?"find":"home",
   syncSurface(){},
   async navigate(surface){
    calls.push("route:"+surface);
    if(surface==="find"){await owner.open();return {ok:true}}
    owner.close();
    return {ok:routeOk};
   }
  }};
 owner=createFindOwner(win);
 const fire=async(dataKey,value)=>{
  const target={dataset:{[dataKey]:value},closest(selector){
    return (dataKey==="exploreCalendarDate"&&selector==="[data-explore-calendar-date]")||
     (dataKey==="exploreOpenNovena"&&selector==="[data-explore-open-novena]")?target:null;
  }};
  handlers.click({target,preventDefault(){},stopPropagation(){}});
  for(let i=0;i<10;i++)await new Promise(resolve=>setImmediate(resolve));
 };
 return {owner,action,calls,fire,setRoute:v=>{routeOk=v},setExact:v=>{exactOk=v}};
}
const f=fixture();
assert.equal(await f.owner.open({lens:"pilgrimages"}),true);
f.setRoute(false);
await f.fire("exploreCalendarDate","2026-10-10");
assert.deepEqual(f.calls.slice(-2),["route:calendar","route:find"]);
assert.equal(f.owner.status().open,true,"Failed Calendar navigation must restore Explore");
assert.equal(f.owner.status().lens,"pilgrimages");
assert.match(f.action.textContent,/Could not open this date/);
assert.equal(f.action.hidden,false);
f.setRoute(true);
f.setExact(false);
await f.fire("exploreCalendarDate","2026-10-10");
assert.deepEqual(f.calls.slice(-3),["route:calendar","select:2026-10-10","route:find"]);
assert.equal(f.owner.status().open,true,"A failed date selection must restore Explore");
await f.fire("exploreOpenNovena","immaculate_conception");
assert.deepEqual(f.calls.slice(-3),["route:pray","novena:immaculate_conception","route:find"]);
assert.match(f.action.textContent,/Could not open this novena/);
f.setExact(true);
await f.fire("exploreOpenNovena","immaculate_conception");
assert.deepEqual(f.calls.slice(-2),["route:pray","novena:immaculate_conception"]);
const fr=fixture("fr");
await fr.owner.open({lens:"traditions"});
fr.setRoute(false);
await fr.fire("exploreOpenNovena","saint_joseph");
assert.match(fr.action.textContent,/Impossible d’ouvrir cette neuvaine/);
assert.equal(fr.owner.status().lens,"traditions");
console.log("PASS Explore Calendar and Novena handoffs: exact target, failed route restore, failed child restore and EN/FR feedback");
