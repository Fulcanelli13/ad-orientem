import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readerPosition, syncAngelusNavigation, scrollToAngelusUnit, syncRosaryProgress } from "../src/pray/reader-navigation.js";

assert.deepEqual(readerPosition(3,5),{index:3,total:5,percent:75});
assert.deepEqual(readerPosition(-7,5),{index:0,total:5,percent:0});
assert.deepEqual(readerPosition(500,5),{index:4,total:5,percent:100});
assert.deepEqual(readerPosition(NaN,0),{index:0,total:0,percent:0});

function button(){
 const attrs=new Map();const classes=new Set();
 return {attrs,classes,dataset:{},classList:{toggle:(key,on)=>on?classes.add(key):classes.delete(key)},
  setAttribute:(key,value)=>attrs.set(key,value),removeAttribute:key=>attrs.delete(key)};
}
const buttons=Array.from({length:4},(_,i)=>({...button(),dataset:{aoAngelusJump:String(i)}}));
const caption={textContent:""};
const nav={dataset:{aoProgressPrefix:"Prayer"},querySelectorAll:()=>buttons,querySelector:s=>s==="[data-ao-reader-position]"?caption:null};
const main={querySelector:s=>s==="[data-ao-angelus-progress]"?nav:null};
assert.equal(syncAngelusNavigation(main,{dataset:{aoAngelusIndex:"2"}}),true);
assert.equal(buttons[2].attrs.get("aria-current"),"step");
assert.equal(buttons[0].attrs.has("aria-current"),false);
assert.equal(caption.textContent,"Prayer 3 / 4");
assert.equal(syncAngelusNavigation(main,{dataset:{aoAngelusIndex:"0"}}),true);
assert.equal(buttons[0].attrs.get("aria-current"),"step");

const units=Array.from({length:4},(_,i)=>({
 getBoundingClientRect:()=>({top:120+i*200,height:160}),
}));
let scrolled=null;
const mount={
 scrollTop:0,clientHeight:450,
 getBoundingClientRect:()=>({top:0,bottom:450}),
 querySelector:s=>null,querySelectorAll:()=>units,
 scrollTo:x=>{scrolled=x},
};
assert.equal(scrollToAngelusUnit(mount,2),true);
assert.ok(scrolled.top>100,"tap-to-jump should scroll inside the prayer mount");
assert.equal(scrolled.behavior,"auto");
assert.equal(scrollToAngelusUnit(mount,99),true,"index is clamped to final card");
assert.equal(scrollToAngelusUnit(mount,NaN),false,"invalid indices cannot navigate");

const runtime=await readFile(new URL("../src/pray/focus-runtime.js",import.meta.url),"utf8");
const angelus=await readFile(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const styles=await readFile(new URL("../src/app/design-system.js",import.meta.url),"utf8");
const mass=await readFile(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
for(const text of ["ANGELUS DOMINI","ECCE ANCILLA DOMINI","ET VERBUM CARO FACTUM EST","AVE MARIA","REGINA CÆLI"])
 assert.ok(angelus.includes(text),"Angelus title missing: "+text);
assert.match(angelus,/angelusSequenceNav\(unitsV,form\)/);
assert.match(angelus,/data-ao-angelus-jump/);
assert.match(runtime,/syncAngelusNavigation\(main,current\)/);
assert.match(runtime,/syncRosaryProgress\(globalThis\)/);
assert.match(runtime,/Math\.abs\(dx\)<85\|\|Math\.abs\(dx\)<Math\.abs\(dy\)\*1\.65/);
assert.match(styles,/--ao-reader-focus-far/);
assert.match(styles,/aoReaderPrayerName/);
assert.match(styles,/text-transform:uppercase!important/);
assert.match(styles,/opacity:var\(--ao-reader-focus-far,\.56\)!important/);
assert.match(styles,/opacity:var\(--ao-reader-focus-near,\.80\)!important/);
assert.doesNotMatch(mass,/opacity:var\\(--ao-reader-focus-far/,'byte-locked Mass donor must remain unchanged');
assert.equal(syncRosaryProgress({document:{querySelector:()=>null}}),false,"no Rosary donor: no side effects");
console.log("PASS shared prayer reader navigation, focus grammar, named Angelus sections and gesture intent");
