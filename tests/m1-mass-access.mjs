import assert from "node:assert/strict";
import {m1AccessRows,m1AccessPreviewRequested,m1SelectedIntroit} from "../src/mass/m1-access-overview.js";
const base={kind:"CALENDAR",kindLabel:"Mass of the day",actualTitle:"Feria",
 form:"MISSA_CANTATA_INCENSE",formLabel:"Missa Cantata · incense",
 readerMode:"LIVE",readerLanguage:"en",beforeMass:"none",afterMass:"none"};
assert.equal(m1AccessPreviewRequested({location:{search:"?aoMassAccessM1=1"}}),true);
assert.equal(m1AccessPreviewRequested({location:{search:"?aoMassAccessM1=0"}}),false);
assert.equal(m1AccessPreviewRequested({location:{search:""}}),true,"M1 choices are default");
const rows=m1AccessRows(base);
assert.deepEqual(rows.map(x=>x.id),["mass","ceremony","reader","language","before","after"]);
assert.equal(rows[0].value,"Mass of the day","Mass identity comes from the host selection");
assert.equal(rows[1].value,"Missa Cantata · incense");
assert.equal(rows[2].value,"LIVE");
assert.equal(rows[4].value,"Directly to Mass");
const fr=m1AccessRows({...base,readerMode:"MISSAL",readerLanguage:"fr",
 beforeMass:"full",afterMass:"thanksgiving"},{fr:true});
assert.equal(fr[0].title,"Quelle messe");
assert.equal(fr[2].value,"Missel");
assert.equal(fr[3].value,"Français");
assert.equal(fr[4].value,"Préparation complète");
assert.equal(fr[5].value,"Action de grâces");
assert.equal(m1AccessRows(base,{optionalRites:true}).at(-1).id,"rites",
 "A real optional rite must remain accessible, not disappear from the overview");
assert.equal(m1AccessRows(base).length,6);
assert.equal(m1AccessRows({...base,kind:"REQUIEM",kindLabel:"Requiem"})[0].value,"Requiem");
const withProper={proper:{status:"READY",data:{introit:{lat:"Si iniquitátes observáveris, Dómine\nPs 129:3"}}}};
assert.equal(m1SelectedIntroit(withProper,{ready:true}),"Si iniquitátes observáveris, Dómine");
assert.equal(m1SelectedIntroit(withProper,{ready:false}),null,"No Introit while source is unresolved");
assert.equal(m1SelectedIntroit({proper:{status:"PENDING"}},{ready:true}),null,
  "No fake Introit where the selected Proper has not supplied one");
console.log("PASS M1 source-projected six-row Mass choices, French and conditional rites");
