import assert from "node:assert/strict";
import {inspectPentecostSunday1960Source,resolvePentecostSunday1960Preface,
 installPentecostSunday1960PrefaceSource} from "../src/mass/1962-pentecost-sunday-prefatio1960-source.js";

const cases=[
 {date:"2026-06-07",id:"tempora:Pent02-0r:2:g",path:"Tempora/Pent02-0r",
  old:"Nat",header:"de Nativitate Domini"},
 {date:"2026-06-14",id:"tempora:Pent03-0r:2:g",path:"Tempora/Pent03-0r",
  old:"Cord",header:"de sacratissimo Cordis Jesu"},
];
const original=({date,id,path,header})=>({
 status:"ready",date,
 day:{main:{id,rank:2},selectedMassOption:{path}},
 proper:{status:"ready",data:{
  sourcePath:path,riteProfile:"ordinary_mass",
  preface:{lat:header+"\n"+("Authentic source text ".repeat(10)),en:"old",fr:"ancien"},
  introit:{lat:"Source-owned Introit"},
 }},
});
const trinity={
 la:"de sanctissima Trinitate\n"+("Trinitas unius substantiæ. ".repeat(10)),
 en:"Holy Trinity\n"+("One God and one Lord. ".repeat(12)),
 fr:"de la Sainte Trinité\n"+("Un seul Dieu et Seigneur. ".repeat(12)),
};
function host({mismatch=null,missFrench=false,throwSource=false}={}){
 const calls=[];
 return {
  calls,
  async resolveSource(path,lang){
   calls.push(["source",path,lang]);
   if(throwSource)throw new Error("upstream source offline");
   const c=cases.find(row=>row.path===path);
   const modern=mismatch==="1960"?"Prefatio1960=Cord":"Prefatio1960=Trinitate";
   const old=mismatch==="old"?"Prefatio=Maria":"Prefatio="+c.old+
     (c.old==="Cord"?" (rubrica divino)":"");
   return {map:new Map([["Rule",[old,modern]]])};
  },
  async resolvePreface(id){
   calls.push(["preface",id]);
   assert.equal(id,"Trinitate");
   return {...trinity,fr:missFrench?"":trinity.fr};
  }
 };
}
for(const c of cases){
 const before=original(c),res=host();
 assert.equal(inspectPentecostSunday1960Source(before).status,"WRONG_LEGACY_PREFACE");
 const after=await resolvePentecostSunday1960Preface(before,res);
 assert.equal(after.preface1960SourceDecision.status,"SOURCE_VERIFIED",c.date);
 assert.equal(after.proper.status,"ready");
 assert.equal(after.proper.data.preface.prefaceSection,"Trinitate");
 assert.match(after.proper.data.preface.lat,/^de sanctissima Trinitate/);
 assert.ok(after.proper.data.preface.en.length>100&&after.proper.data.preface.fr.length>100);
 assert.equal(after.proper.data.preface.sourceRule,"Prefatio1960=Trinitate");
 assert.equal(after.proper.data.introit,before.proper.data.introit,
  "Selected source must preserve all other Mass texts");
 assert.equal(before.proper.data.preface.lat.startsWith(c.header),true,"No source mutation");
 assert.equal(res.calls.length,4,"Three language rule witnesses and one actual trilingual Preface");
 // Do not treat a missing rule, wrong inherited Preface, or missing French
 // as an authorized text substitution.
 for(const conf of [{mismatch:"1960"},{mismatch:"old"},{missFrench:true},{throwSource:true}]){
  const blocked=await resolvePentecostSunday1960Preface(before,host(conf));
  assert.equal(blocked.proper.status,"failed",JSON.stringify(conf));
  assert.match(blocked.proper.error,/PENT_SUNDAY_1960_PREFACE_SOURCE_UNAVAILABLE/);
  assert.equal(blocked.proper.data.preface,before.proper.data.preface);
 }
 const already=original({...c,header:"de sanctissima Trinitate"});
 assert.equal(inspectPentecostSunday1960Source(already).status,"ALREADY_CORRECT");
 assert.equal(await resolvePentecostSunday1960Preface(already,host()),already);
 const wrongHeader=original({...c,header:"de Beata Maria Virgine"});
 assert.equal(inspectPentecostSunday1960Source(wrongHeader).status,"UNRECOGNIZED_SOURCE");
 assert.equal(await resolvePentecostSunday1960Preface(wrongHeader,host()),wrongHeader);
 const notSunday=original({...c,date:"2026-06-08"});
 assert.equal(await resolvePentecostSunday1960Preface(notSunday,host()),notSunday);
 const wrongPath=original({...c,path:"Tempora/Pent20-0"});
 assert.equal(await resolvePentecostSunday1960Preface(wrongPath,host()),wrongPath);
 const votive=original(c);votive.proper.data.riteProfile="votive_mass";
 assert.equal(await resolvePentecostSunday1960Preface(votive,host()),votive);
 const alternate=original(c);
 alternate.day.selectedMassOption.path="Sancti/06-07";
 assert.equal(await resolvePentecostSunday1960Preface(alternate,host()),alternate);
}
// Seasonal/commemorated and feast identities may never enter this narrow owner.
for(const id of ["tempora:Pent03-0r:1:g","tempora:Pent20-0:2:g",
 "sancti:06-12:1:w",":feria:4:w","tempora:Pasc7-0:1:r"]){
 const resolution=original({date:"2026-06-14",id,path:"Tempora/Pent03-0r",
   header:"de sacratissimo Cordis Jesu"});
 resolution.day.commemorations=[{title:"Sacred Heart"}];
 assert.equal(inspectPentecostSunday1960Source(resolution).status,"NOT_THIS_PRINCIPAL_MASS");
}
const resolver=host();
resolver.resolveDay=async date=>original(cases.find(c=>c.date===date));
const windowMock={AO_RUNTIME_V8:{resolver}};
assert.equal(installPentecostSunday1960PrefaceSource(windowMock).installed,true);
const wrapper=windowMock.AO_RUNTIME_V8.resolver.resolveDay;
assert.equal(installPentecostSunday1960PrefaceSource(windowMock).installed,true);
assert.equal(windowMock.AO_RUNTIME_V8.resolver.resolveDay,wrapper,"Install once");
const actual=await wrapper("2026-06-07");
assert.equal(actual.preface1960SourceDecision.status,"SOURCE_VERIFIED");
assert.match(actual.proper.data.preface.lat,/^de sanctissima Trinitate/);
assert.equal(installPentecostSunday1960PrefaceSource({}).installed,false);
console.log("PASS two Pentecost Sundays: original Prefatio1960 wins, trilingual source, exact identity, fails closed, preserves other Propers");
