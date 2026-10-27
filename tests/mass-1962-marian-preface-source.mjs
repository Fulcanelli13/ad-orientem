import assert from "node:assert/strict";
import {required1962MarianPrefaceOwner,verifyMarianLatinSourceRule,
  render1962MarianPrefaceForm,isSelected1962MarianPrefaceForm,MARIAN_FORM_WORDS}
 from "../src/mass/1962-marian-preface-source.js";

const feasts=[
 ["02-11",3,"w",null],["03-25",1,"w","ANNUNCIATION"],
 ["07-02",2,"w","VISITATION"],["08-05",3,"w","FESTIVITY"],
 ["08-15",1,"w","ASSUMPTION"],["08-22",2,"w","FESTIVITY"],
 ["09-08",2,"w","NATIVITY"],["09-12",3,"w","FESTIVITY"],
 ["09-15",2,"w","TRANSFIXION"],["11-21",3,"w","PRESENTATION"]
];
const bvm=["C10b","C10c","C10Pasc","C10t"];
const donor={la:"de Beata Maria Virgine\nVere dignum et justum est: Et te in *Festivitáte* beátæ Maríæ semper Vírginis collaudáre.",
 en:"Blessed Virgin\nIt is truly meet: in the *Feast* of the Blessed Mary.",
 fr:"de la Sainte Vierge\nIl est vraiment juste: en la fête de la bienheureuse Marie toujours vierge."};
for(const [md,rank,colour,form] of feasts){
 const path="Sancti/"+md,id="sancti:"+md+":"+rank+":"+colour;
 const source=required1962MarianPrefaceOwner(id,path);
 assert.ok(source,md+": no authenticated Marian source owner");
 assert.equal(source.form,form);
 assert.equal(required1962MarianPrefaceOwner(id,"Sancti/11-04"),null);
 assert.equal(required1962MarianPrefaceOwner("votive:"+md+":"+rank+":"+colour,path),null);
 if(!form){
   assert.equal(source.blocked,"LOURDES_PREFACE_BOOK_SOURCE_CONFLICT");
   assert.equal(isSelected1962MarianPrefaceForm({lat:"de Beata Maria Virgine"},source),false);
   continue;
 }
 const same=(v)=>String(v).normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase();
 const checked=verifyMarianLatinSourceRule({map:new Map([["Rule",[
   "Prefatio=Maria="+source.rule
 ]]])},source);
 assert.equal(checked,true,md+": 1960 Latin source witness");
 assert.equal(verifyMarianLatinSourceRule({map:new Map([["Rule",["Prefatio=Communis"]]])},source),false);
 for(const lang of ["la","en","fr"]){
   const text=render1962MarianPrefaceForm(donor[lang],lang,form);
   assert.ok(text&&(lang==="fr"&&form==="FESTIVITY"||text!==donor[lang]),
     md+" "+lang+" source must retain the exact attested form");
   if(lang==="la"){
     assert.equal(isSelected1962MarianPrefaceForm({lat:text,marianForm:form},source),true);
     assert.equal(isSelected1962MarianPrefaceForm({lat:text,marianForm:"VENERATION"},source),false);
     assert.equal(isSelected1962MarianPrefaceForm({lat:donor.la,marianForm:form},source),false);
   }
 }
}
for(const item of bvm){
 const id="commune:"+item+":4:w",path="Commune/"+item;
 const source=required1962MarianPrefaceOwner(id,path);
 assert.equal(source?.form,"VENERATION");
 assert.equal(verifyMarianLatinSourceRule(null,source),true);
 assert.equal(required1962MarianPrefaceOwner(id,"Commune/C10"),null);
 assert.equal(required1962MarianPrefaceOwner("commune:"+item+":3:w",path),null);
 for(const lang of ["la","en","fr"]){
   const rendered=render1962MarianPrefaceForm(donor[lang],lang,"VENERATION");
   assert.ok(rendered?.length);
   if(lang==="la")
     assert.ok(isSelected1962MarianPrefaceForm({
       lat:rendered,marianForm:"VENERATION"},source));
 }
}
assert.equal(feasts.length,10);
assert.equal(bvm.length,4);
assert.equal(Object.keys(MARIAN_FORM_WORDS).length,8);
console.log("PASS 1962 Marian Preface source: 9 feast variants, 4 Saturday Common owners, 1 Lourdes book conflict blocked, source/identity poisoning");
