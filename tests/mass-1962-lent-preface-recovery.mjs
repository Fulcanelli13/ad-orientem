import assert from "node:assert/strict";
import {authenticated1962PrefaceRecoveryOwner,recoverReaderProperOmissions} from
  "../src/mass/reader-proper-runtime-recovery.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";

const languages={
  la:["!de Quadragesima","v. Vere dignum est: Qui corporáli ieiúnio vítia cómprimis."],
  en:["!Lent","v. It is right and just: by bodily fasting You curb the vices."],
  fr:["!de Quadragesima","v. Il est juste : par le jeûne corporel vous réprimez les vices."],
};
const calls=[];
const resolver={async resolveSource(path,lang){
  calls.push([path,lang]);
  if(path!=="Ordo/Prefationes")throw Error("Unexpected source path "+path);
  return {map:new Map([["Quad",languages[lang]]])};
}};
const standard={
  sourcePath:"Tempora/Quad2-1",
  introit:{lat:"Introit",en:"Introit",fr:"Introït"},
  collects:[{lat:"Oratio",en:"Collect",fr:"Collecte"}],
  epistle:{lat:"Epistola",en:"Epistle",fr:"Épître"},
  gradual:{lat:"Graduale",en:"Gradual",fr:"Graduel"},
  gospel:{lat:"Evangelium",en:"Gospel",fr:"Évangile"},
  offertory:{lat:"Offertorium",en:"Offertory",fr:"Offertoire"},
  secrets:[{lat:"Secreta",en:"Secret",fr:"Secrète"}],
  preface:{lat:"Communis\nVere dignum",en:"Common",fr:"Commune"},
  communion:{lat:"Communio",en:"Communion",fr:"Communion"},
  postcommunions:[{lat:"Postcommunio",en:"Postcommunion",fr:"Postcommunion"}],
};
const input=(id,path=standard.sourcePath,preface=standard.preface)=>
  ({...standard,sourcePath:path,preface,principalCelebrationId:id});
for(const [id,path] of [
  ["tempora:Quad1-1:3:v","Tempora/Quad1-1"],
  ["tempora:Quad1-3:2:v","Tempora/Quad1-3"],
  ["tempora:Quad2-1:3:v","Tempora/Quad2-1"],
  ["tempora:Quad3-3:3:v","Tempora/Quad3-3"],
  ["tempora:Quad4-6:3:v","Tempora/Quad4-6"],
  ["tempora:Quad1-0:1:v","Tempora/Quad1-0"],
]){
  const owner=authenticated1962PrefaceRecoveryOwner(id,path);
  assert.equal(owner.section,"Quad",id+" must find the exact Lenten source owner");
  assert.equal(owner.rubric,"RGMR_486_A");
  const before=input(id,path);
  const output=await recoverReaderProperOmissions(before,{
    hostResolver:resolver,principalCelebrationId:id
  });
  assert.notEqual(output,before);
  assert.equal(output.preface.prefaceSection,"Quad");
  assert.equal(output.preface.sourcePath,"Ordo/Prefationes");
  assert.equal(output.preface.originalProperSourcePath,path);
  assert.equal(output.preface.recoveryScope,"LENT_TEMPORAL_1962");
  assert.match(output.preface.lat,/^de Quadragesima\n/);
  assert.match(output.preface.lat,/corporáli ieiúnio/);
  assert.match(output.preface.en,/bodily fasting/);
  assert.match(output.preface.fr,/jeûne corporel/);
  assert.equal(before.preface.lat,"Communis\nVere dignum",
    "Never mutate source Proper during display recovery");
  assert.equal(properToReaderSlots(output,{language:"fr"}).slots.PREFACE.status,"READY");
}
assert.ok(calls.every(([path])=>path==="Ordo/Prefationes"));
const refused=[
  ["tempora:Quad2-1:3:v","Tempora/Quad3-1"],
  ["sancti:03-19:1:w","Tempora/Quad2-4"],
  ["tempora:Quad5-1:3:v","Tempora/Quad5-1"],
  ["tempora:Quadp3-3:1:v","Tempora/Quadp3-3"],
  ["tempora:Quad2-1:3:v","Votive/Quad2-1"],
  ["tempora:Quad2-1:3:v","Tempora/Quad2-1/custom"],
  ["tempora:Quad2-1:3:w","Tempora/Quad2-1"],
];
for(const [id,path] of refused){
  assert.equal(authenticated1962PrefaceRecoveryOwner(id,path),null,id+" "+path);
  const before=input(id,path);
  const previousCalls=calls.length;
  assert.equal(await recoverReaderProperOmissions(before,{
    hostResolver:resolver,principalCelebrationId:id}),before,
    id+" / "+path+" must preserve existing Preface");
  assert.equal(calls.length,previousCalls,"Unowned form queried Preface archive");
}
for(const value of [
  {lat:"de Quadragesima\nVere dignum",en:"Lent",fr:"Carême"},
  {lat:"de Sancta Cruce\nVere dignum",en:"Holy Cross",fr:"Sainte Croix"}
]){
  const original=input("tempora:Quad2-1:3:v","Tempora/Quad2-1",value);
  const n=calls.length;
  assert.equal(await recoverReaderProperOmissions(original,{
    hostResolver:resolver,principalCelebrationId:"tempora:Quad2-1:3:v"}),original,
    "Already selected non-Common Preface must be left untouched");
  assert.equal(calls.length,n);
}
const missingFrench={...languages,fr:null};
const partialResolver={async resolveSource(path,lang){
  return {map:new Map(lang==="fr"?[]:[["Quad",missingFrench[lang]]])};
}};
const incomplete=input("tempora:Quad2-1:3:v");
const withheld=await recoverReaderProperOmissions(incomplete,{
  hostResolver:partialResolver,principalCelebrationId:"tempora:Quad2-1:3:v"
});
assert.equal(withheld,incomplete,"Partial trilingual source must never replace the existing text");
const wrongHeader={async resolveSource(path,lang){
 return {map:new Map([["Quad",lang==="la"?["!Communis","v. Wrong source"]:languages[lang]]])};
}};
assert.equal(await recoverReaderProperOmissions(incomplete,{
  hostResolver:wrongHeader,principalCelebrationId:"tempora:Quad2-1:3:v"
}),incomplete,"Mismatched Latin Preface heading must fail closed");

console.log("PASS Mass 1962 Lent: authenticated source, proper-path parity, trilingual named section, reader slot, no leak to votives/feasts or existing authentic text.");
