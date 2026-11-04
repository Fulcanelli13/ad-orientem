import assert from "node:assert/strict";
import {recover1962NativityOctaveCommemoration,
 NATIVITY_OCTAVE_1962_SOURCE_SCHEMA}
 from "../src/mass/1962-nativity-octave-source.js";
import {select1962CommemorationsForMassForm}
 from "../src/mass/1962-commemoration-form-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
const principal=Object.freeze({lat:"The authenticated Latin principal prayer.",
 en:"The authenticated English principal prayer.",fr:"La prière principale en français."});
const source=Object.freeze({
 Oratio:Object.freeze({
  la:"Concéde, quǽsumus, omnípotens Deus: ut nos Unigéniti tui nova per carnem Natívitas líberet; quos sub peccáti jugo vetústa sérvitus tenet.",
  en:"Grant, we beseech You, almighty God, that the new birth, in the flesh, of Your only-begotten Son may deliver us whom the bondage of old keeps under the yoke of sin.",
  fr:"Nous vous en prions, Dieu tout puissant, que votre Fils éternel, par sa nouvelle naissance en notre chair, vienne nous délivrer de l’ancien esclavage qui nous maintient sous le joug du péché."
 }),
 Secreta:Object.freeze({
  la:"Obláta, Dómine, múnera, nova Unigéniti tui Nativitáte sanctífica: nosque a peccatórum nostrórum máculis emúnda.",
  en:"Make holy the sacrificial gifts we offer, O Lord, and by the new birth of Your only-begotten Son cleanse us from the stains of our sins.",
  fr:"Sanctifiez ces offrandes, Seigneur, par la nouvelle naissance de votre Fils unique, et purifiez-nous des souillures de nos péchés."
 }),
 Postcommunio:Object.freeze({
  la:"Præsta, quǽsumus, omnípotens Deus: ut natus hódie Salvátor mundi, sicut divínæ nobis generatiónis est auctor; ita et immortalitátis sit ipse largítor:",
  en:"Grant, we beseech You, almighty God, that the Saviour of the world, born this day, Who is the author of our birth in godliness, may bestow on us immortal life.",
  fr:"Dieu tout puissant, le Sauveur du monde, qui est né aujourd’hui, nous a fait naître à la vie divine. Faites, nous vous en prions, qu’il nous accorde aussi le don de l’immortalité."
 })
});
const alt=Object.freeze({
 la:"Omnípotens sempitérne Deus, qui primítias Mártyrum in beati Levítæ Stephani sánguine dedicásti: tríbue, quǽsumus.",
 fr:"Dieu tout-puissant et éternel, qui avez consacré les prémices des martyrs dans le sang du bienheureux lévite Étienne, accordez-nous."
});
const sec=[["collects","Oratio"],["secrets","Secreta"],["postcommunions","Postcommunio"]];
const closing=id=>id==="Postcommunio"?"$Qui tecum":"$Per eundem";
const fields={la:"lat",en:"en",fr:"fr"};
function mock({missingFrench=false,unmatchedChristmas=false,wrongSiglum=false,unknownSource=false}={}){
 return {resolveSource:async(path,lang)=>{
  if(unknownSource&&path==="Sancti/12-25m3")throw Error("Source could not be loaded");
  const map=new Map();
  for(const [,section] of sec){
   const text=source[section][lang];
   const textChristmas=unmatchedChristmas&&section==="Secreta"?
    "Different authenticated prayer not from this Christmas Mass":text;
   const end=wrongSiglum&&section==="Oratio"?"$Unknown Ending":closing(section);
   if(path==="Sancti/12-25m3")map.set(section,[textChristmas,end]);
   if(path==="Sancti/12-26"||path==="Sancti/12-28"){
    const label=lang==="la"?"*Pro Octava Nativitatis.*":
      lang==="en"?"!For the Octave of the Nativity.":"!Pro Octava Nativitatis.";
    map.set("Commemoratio "+section,[label,text,closing(section)]);
   }
  }
  if(path==="Sancti/12-26")map.set("Oratio1",[alt[lang==="la"?"la":"fr"]??"Unverified English alt","$Qui tecum"]);
  return {map};
 }};
}
function fixture(date){
 const dec26=date==="2026-12-26",path=dec26?"Sancti/12-26":"Sancti/12-28";
 const pp=Object.fromEntries(sec.map(([plural,section])=>
  [plural,plural==="collects"&&dec26?
    [principal,Object.freeze({lat:alt.la,en:"",fr:alt.fr})]:[principal]]));
 return {data:{sourcePath:path,calendarCommemorations:[{
   path:path+"c",prayerSourcePath:path+"c",rank:"IV class"}],...pp},
  date,path,main:{id:dec26?"sancti:12-26:2:r":"sancti:12-28:2:r",
   rank:2,path,title:dec26?"St Stephen":"Holy Innocents"},
  comm:{id:dec26?"sancti:12-26c:4:w":"sancti:12-28c:4:w",
   rank:4,path:path+"c",privileged:false}};
}
for(const date of ["2026-12-26","2026-12-28"]){
 const f=fixture(date);
 const restored=await recover1962NativityOctaveCommemoration({
  data:f.data,principalId:f.main.id,calendarDate:date,
  hostResolver:mock(),diagnostic:{warnings:[]}
 });
 assert.ok(restored,date+": failed source verification");
 assert.equal(restored.verifiedNativityOctaveCommemoration.schema,NATIVITY_OCTAVE_1962_SOURCE_SCHEMA);
 assert.equal(restored.verifiedNativityOctaveCommemoration.privilege,"RG_108_AND_109_C");
 assert.equal(restored.verifiedNativityOctaveCommemoration.originalAlternativeStephenOratio1Excluded,date==="2026-12-26");
 assert.strictEqual(f.data.collects[0],restored.collects[0]);
 for(const [plural,section] of sec){
  assert.equal(restored[plural].length,2);
  for(const lang of ["lat","en","fr"])assert.ok(restored[plural][1][lang].length>65);
  assert.equal(restored[plural][1].sourcePath,"Sancti/12-25m3");
  assert.equal(restored[plural][1].sourceSection,section);
 }
 for(const language of ["en","fr"]){
  const slots=properToReaderSlots(restored,{language});
  for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"])
   assert.equal(slots.slots[slot].status,"READY",date+":"+language+":"+slot);
 }
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const observed=select1962CommemorationsForMassForm({
   proper:restored,calendarResolution:{date,status:"ready",
    day:{main:f.main,commemorations:[f.comm]}},
   form,celebrationId:"mass_of_day",isConventual:false
  });
  assert.equal(observed.status,"CERTIFIED",date+":"+form+":"+observed.reason);
  assert.equal(observed.decision.appliedCount,1);
  assert.equal(observed.decision.scope,"PRIVILEGED_CHRISTMAS_OCTAVE_II_CLASS_MASS");
  for(const [plural] of sec)assert.equal(observed.proper[plural].length,2);
 }
 for(const [reason,changed] of [
  ["no calendar owner",{calendarCommemorations:[]}],
  ["wrong parent",{sourcePath:"Sancti/12-27"}],
  ["competing count",{calendarCommemorations:[
    {path:f.path+"c",prayerSourcePath:f.path+"c"},{path:"Sancti/12-27c",prayerSourcePath:"Sancti/12-27c"}]}]
 ]){
  assert.equal(await recover1962NativityOctaveCommemoration({
   data:{...f.data,...changed},principalId:f.main.id,calendarDate:date,
   hostResolver:mock()
  }),null,date+":"+reason);
 }
 const noProof=select1962CommemorationsForMassForm({
  proper:{...restored,verifiedNativityOctaveCommemoration:null},
  calendarResolution:{date,status:"ready",day:{main:f.main,commemorations:[f.comm]}},
  form:"LOW"
 });
 assert.equal(noProof.status,"UNVERIFIED",date+": forged source not rejected");
 for(const mode of [{unmatchedChristmas:true},{wrongSiglum:true}]){
  assert.equal(await recover1962NativityOctaveCommemoration({
   data:f.data,principalId:f.main.id,calendarDate:date,hostResolver:mock(mode)
  }),null,date+": mismatched printed section passed");
 }
}
console.log("PASS Christmas octave: two original dates, 6 trilingual source-owned orations, 4 forms, Stephen alternative excluded, forged sources fail closed");
