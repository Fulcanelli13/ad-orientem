import assert from "node:assert/strict";
import {test} from "node:test";
import {NOVENA_ROSE_WINDOW_VERSION,rosePetalPath,renderNovenaRoseWindow,selectNovenaRoseDay} from "../src/pray/novena-rose-window.v1.js";
const demo={id:"holy_ghost",days:Array.from({length:9},(_,i)=>({theme:{en:"Day "+(i+1),fr:"Jour "+(i+1)}}))};
test("rose exposes nine accessible days while keeping canonical novena data separate",()=>{
 assert.equal(NOVENA_ROSE_WINDOW_VERSION,"novena-rose-holy-ghost-v1");
 const h=renderNovenaRoseWindow(demo,1);
 assert.equal((h.match(/data-n1-rose-day=/g)||[]).length,9);
 assert.equal((h.match(/aria-pressed="true"/g)||[]).length,1);
 assert.match(h,/data-n1-rose-day="9"/);
 assert.match(h,/role="group"/);
 assert.match(h,/--ao-n1-rose-rotation:-0deg/);
 assert.doesNotMatch(h,/data-n1-day=/,"Must not duplicate canonical source's existing nine day buttons");
 assert.match(renderNovenaRoseWindow(demo,9,{french:true}),/Jour 9 sur neuf/);
 assert.equal(renderNovenaRoseWindow({...demo,days:demo.days.slice(0,8)}),"");
 for(let i=0;i<9;i++)assert.match(rosePetalPath(i),/^M/);
 assert.equal(selectNovenaRoseDay(null,5),false);
});
