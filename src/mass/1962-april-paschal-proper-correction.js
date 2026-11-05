// Exact Eastertide 1962 saint-day source corrections, not a general Common
// alias, not a digital Gregorian score, and not a change to the annual Ordo.
// Guards tie EACH field to the original observed defective Latin Proper and
// the selected Mass of day. Preserve every independent saint-owned prayer.
import {APRIL_1962_PASCHAL_ARCHIVAL_WITNESSES as W}
  from "./1962-april-paschal-archival-witnesses.js";
export const MR62_APRIL_PASCHAL_FIX_SCHEMA="ao-mr62-april-three-paschal-saint-propers-v1";
const witnesses=["lat","en","fr"];
const owners=Object.freeze({
 "2026-04-13":Object.freeze({
  principal:"sancti:04-13:3:r",source:"Sancti/04-13",fields:Object.freeze({
   introit:"C2p:Introitus",epistle:"C2p:Lectio",gradual:"C2p:Graduale",
   offertory:"C2p:Offertorium",communion:"C2p:Communio",
   postcommunion:"C2a:Postcommunio"
  }),
  originalStarts:Object.freeze({
   introit:"Ps 20:2-3",epistle:"Léctio libri Sapiéntiæ\nSap 10:10-14",
   gradual:"Ps 88:21-23",offertory:"Ps 8:6-7",
   communion:"Matt 16:24",postcommunion:"Da, quǽsumus, Dómine"
  }),
  preserve:Object.freeze(["collect","secret","gospel"])
 }),
 "2026-04-14":Object.freeze({
  principal:"sancti:04-14:3:r",source:"Sancti/04-14",
  fields:Object.freeze({gradual:"Sancti/04-14:Graduale#PASCHAL"}),
  preserve:Object.freeze(["collect","epistle","gospel","secret","postcommunion"])
 }),
 "2026-04-29":Object.freeze({
  principal:"sancti:04-29:3:r",source:"Sancti/04-29",fields:Object.freeze({
   introit:"C2p:Introitus",gradual:"C2p:Graduale",
   gospel:"C2p:Evangelium",offertory:"C2p:Offertorium",
   communion:"C2p:Communio"
  }),
  originalStarts:Object.freeze({
   introit:"Ps 20:2-3",gradual:"Ps 88:21-23",
   gospel:"Sequéntia ✠ sancti Evangélii secúndum Matthǽum",
   offertory:"Ps 8:6-7",communion:"Matt 16:24"
  }),
  preserve:Object.freeze(["collect","epistle","secret","postcommunion"])
 })
});
const healthy=v=>v&&typeof v==="object"&&witnesses.every(k=>
 typeof v[k]==="string"&&v[k].length>25&&!/(^|\n)\s*[@$]/m.test(v[k]));
const sourceText=field=>W.donors[field.split(":")[0]]?.[field.split(":")[1]];
function trilingual(rows,normalizeRows){
 const x={};
 for(const lang of witnesses){
  const list=rows?.[lang];
  if(!Array.isArray(list)||!list.length)return null;
  const normalized=normalizeRows(list,lang==="lat"?"la":lang);
  if(typeof normalized!=="string"||normalized.length<28||
     /(^|\n)\s*[@$]/m.test(normalized))return null;
  x[lang]=normalized;
 }
 return healthy(x)?Object.freeze(x):null;
}
function replaceName(rows){
 const adjusted={};
 for(const lang of witnesses){
  const donor=rows?.[lang];if(!Array.isArray(donor))return null;
  const name=lang==="lat"?"Hermenegildo":lang==="en"?"Hermenegild":"Herménégilde";
  let hits=0;
  adjusted[lang]=donor.map(line=>String(line).replace(/\bN\./g,()=>{
   hits++;return name;
  }));
  if(hits!==1)return null;
 }
 return adjusted;
}
const scripture=/^!(?:Ps\.?\s*20:4|Ps\.?\s*20:4\.?)$/iu;
function paschalTwoAlleluias(rows,normalizeRows,src){
 const parts=[{},{}];
 for(const lang of witnesses){
  const list=rows?.[lang];if(!Array.isArray(list))return null;
  const cut=list.findIndex(v=>scripture.test(String(v).trim()));
  if(cut<3||cut===list.length-1)return null;
  const first=normalizeRows(list.slice(0,cut),lang==="lat"?"la":lang);
  const second=normalizeRows(list.slice(cut),lang==="lat"?"la":lang);
  if(!first||!second||!/allel[uú][ij]a|alléluia/iu.test(first)||
     !/allel[uú][ij]a|alléluia/iu.test(second))return null;
  parts[0][lang]=first;parts[1][lang]=second;
 }
 if(parts.some(p=>!healthy(p)))return null;
 return Object.freeze(parts.map((part,i)=>Object.freeze({
  kind:"ALLELUIA",sourceSectionId:"GradualeP#ALLELUIA_"+(i+1),
  sourceRef:src+":Graduale:ALLELUIA_"+(i+1),
  text:Object.freeze(part)
 })));
}
function latinSourceStillDefective(data,configuration){
 return Object.entries(configuration.originalStarts).every(([key,start])=>
   String(data[key==="offertory"?"offertory":key]?.lat??"").startsWith(start));
}
function optionalPaschalSuffix(text,amount){
 if(!healthy(text))return null;
 const out={},exp=/\s*\((Allel[uú][ij]a|Alléluia)(,\s*(?:Allel[uú][ij]a|Alléluia))?\.?\)/giu;
 for(const lang of witnesses){
  let count=0;
  out[lang]=text[lang].replace(exp,(_matched,first,second)=>{
   count++;return " "+first+(second??"")+".";
  });
  if(count!==amount)return null;
 }
 return Object.freeze(out);
}
function justinTwoAlleluias(current){
 if(!healthy(current))return null;
 const rows={};
 const anchors={
  lat:/^Alleluja, alleluja\.$/mu,
  en:/^℣\. For the wisdom of this world is foolishness with God\./mu,
  fr:/^℣\. La sagesse de ce monde est une folie devant Dieu/mu
 };
 for(const lang of witnesses){
  const source=current[lang];
  const lines=source.split("\n");
  const marker=anchors[lang];
  let cut=-1;
  if(lang==="lat")cut=lines.findIndex(line=>marker.test(line));
  else{
   const matches=lines.map((line,i)=>marker.test(line)?i:-1).filter(i=>i>=0);
   if(matches.length!==2)return null;cut=matches[1];
  }
  if(cut<3)return null;
  const end=lines.findIndex((line,i)=>i>cut&&/^Phil\s*3:8\b/u.test(line));
  if(end<=cut)return null;
  const first=(lang==="lat"?"":"Alleluia, alleluia.\n")+
   lines.slice(cut,end).join("\n");
  const second=lines.slice(end).join("\n");
  if(!/sapientia|sapiéntia|sagesse|wisdom/iu.test(first)||
     !/verumtamen|verúmtamen|furthermore|même/iu.test(second))return null;
  rows[lang]=[first,second];
 }
 const parts=[{},{}];
 for(const lang of witnesses){parts[0][lang]=rows[lang][0];parts[1][lang]=rows[lang][1];}
 if(parts.some(p=>!healthy(p)))return null;
 return Object.freeze(parts.map((p,i)=>Object.freeze({
  kind:"ALLELUIA",sourceSectionId:"Graduale#PASCHAL_ALLELUIA_"+(i+1),
  sourceRef:"Sancti/04-14:Graduale:PASCHAL_ALLELUIA_"+(i+1),
  text:Object.freeze(p)
 })));
}
function copyWithDualAlleluia(data,parts,sourcePath,fields,method){
 const first=parts[0],second=parts[1];
 const gradual=Object.freeze(Object.fromEntries(witnesses.map(lang=>
  [lang,first.text[lang]+"\n"+second.text[lang]])));
 const preGospelChants=Object.freeze(parts.map((part,i)=>Object.freeze({
  kind:"alleluia",text:part.text,
  sourceSectionId:part.sourceSectionId,
  sourceRef:part.sourceRef,liturgicalPosition:i+1
 })));
 return Object.freeze({...data,...fields,
  gradual,preGospelChants,
  // Separate research/source-level proof from all musical score approvals.
  aprilPaschalDualAlleluiaProof:Object.freeze({
   schema:MR62_APRIL_PASCHAL_FIX_SCHEMA,
   status:"1962_DATED_LITURGICAL_TEXT_CORRECTED_NO_MUSIC_CERTIFICATION",
   sourcePath,sourceSelectionMethod:method,
   parts,sourceAliasesApproved:0,scoreApprovals:0
  }),
  aprilPaschalSourceCorrection:Object.freeze({
   schema:MR62_APRIL_PASCHAL_FIX_SCHEMA,
   sourcePath,fields:Object.freeze(["gradual",...Object.keys(fields)]),
   originalSourcePreservedInAudit:true,
   sourceAliasesApproved:0,printed1961ScoreCertified:false,
   note:"Corrects 2026 selected Mass of the day only; not a generic Common alias."
  }),
  readerChantSourceProof:null,
 });
}
export function repair1962AprilPaschalProper(data,{
 calendarDate=null,principalCelebrationId=null,normalizeRows=null
}={}){
 if(!data||typeof data!=="object"||typeof normalizeRows!=="function")
  return null;
 const rule=owners[String(calendarDate)];
 if(!rule||data.sourcePath!==rule.source||
    String(principalCelebrationId??data.principalCelebrationId??data.mainId)!==rule.principal ||
    !healthy(data.gradual) || data.aprilPaschalSourceCorrection)
  return null;
 if(calendarDate==="2026-04-14"){
  if(!String(data.gradual.lat).includes("Perdam sapiéntiam sapiéntium")||
     !String(data.gradual.lat).includes("Verúmtamen exístimo")||
     !String(data.gradual.en).includes("I will destroy the wisdom")||
     !String(data.gradual.fr).includes("Je détruirai la sagesse"))
    return null;
  const parts=justinTwoAlleluias(data.gradual);
  const introit=optionalPaschalSuffix(data.introit,2);
  const offertory=optionalPaschalSuffix(data.offertory,1);
  const communion=optionalPaschalSuffix(data.communion,1);
  if(!parts||!introit||!offertory||!communion)return null;
  return copyWithDualAlleluia(data,parts,data.sourcePath,
   {introit,offertory,communion},
   "EXACT_SANCTI_04_14_SAINT_PROPER_PASCHAL_SECTION_SELECTION");
 }
 if(!latinSourceStillDefective(data,rule)){
  console.log("MR62_APRIL_SOURCE_GUARD",calendarDate,
    Object.fromEntries(Object.entries(rule.originalStarts).map(([k,v])=>
      [k,{expected:v,actual:String(data[k]?.lat??"").slice(0,80),
      match:String(data[k]?.lat??"").startsWith(v)}])));
  return null;
 }
 const newSections={};
 for(const [key,donor] of Object.entries(rule.fields)){
  if(key==="gradual")continue;
  const raw=sourceText(donor);
  const trilingualRaw=key==="postcommunion"?replaceName(raw):raw;
  const val=trilingual(trilingualRaw,normalizeRows);
  if(!val){console.log("MR62_APRIL_SOURCE_DONOR_HOLD",calendarDate,key,{
   rawPresent:Boolean(raw),nameSubstitution:Boolean(trilingualRaw),
   laRows:trilingualRaw?.la?.length,enRows:trilingualRaw?.en?.length,
   frRows:trilingualRaw?.fr?.length});
   return null;
  }
  newSections[key]=val;
 }
 const donorGraduale=sourceText(rule.fields.gradual);
 const parts=paschalTwoAlleluias(donorGraduale,normalizeRows,
  "Commune/C2p");
 if(!parts){console.log("MR62_APRIL_SOURCE_CHANT_HOLD",calendarDate,
  Object.fromEntries(["lat","en","fr"].map(k=>[k,donorGraduale?.[k]?.slice(0,7)])));
  return null;
 }
 // Hard stop: independent saint-specific Latin must still be present.
 if(calendarDate==="2026-04-13"){
  if(!String(data.gospel?.lat).includes("Luc 14:26-33")||
     !String(data.collect?.lat).includes("Hermenegíldum")||
     !String(data.secret?.lat).includes("Munéribus nostris")){
      console.log("MR62_APRIL_SAINT_PROPER_HOLD",calendarDate,{
        gospel:String(data.gospel?.lat).includes("Luc 14:26-33"),
        collect:String(data.collect?.lat).includes("Hermenegíldum"),
        secret:String(data.secret?.lat).includes("Munéribus nostris")});
     return null;
    }
 }
 if(calendarDate==="2026-04-29"){
  if(!String(data.epistle?.lat).includes("2 Tim 2:8-10")||
     !String(data.collect?.lat).includes("Petri Mártyris")||
     !String(data.secret?.lat).includes("propugnatóres fídei")){
    console.log("MR62_APRIL_SAINT_PROPER_HOLD",calendarDate,{
      epistle:String(data.epistle?.lat).includes("2 Tim 2:8-10"),
      collect:String(data.collect?.lat).includes("Petri Mártyris"),
      secret:String(data.secret?.lat).includes("propugnatóres fídei")});
    return null;
   }
 }
 if(newSections.postcommunion)
  newSections.postcommunions=Object.freeze([newSections.postcommunion]);
 return copyWithDualAlleluia(data,parts,data.sourcePath,newSections,
  "DATED_1962_PASCHAL_MARTYR_COMMON_PROPER_SECTION_RECOVERY");
}
export function validated1962AprilPaschalDualAlleluias(proper){
 const proof=proper?.aprilPaschalDualAlleluiaProof;
 if(!proof)return null;
 if(proof.schema!==MR62_APRIL_PASCHAL_FIX_SCHEMA||
    proof.status!=="1962_DATED_LITURGICAL_TEXT_CORRECTED_NO_MUSIC_CERTIFICATION"||
    proof.sourcePath!==proper.sourcePath||
    proof.sourceAliasesApproved!==0||proof.scoreApprovals!==0||
    !Array.isArray(proof.parts)||proof.parts.length!==2||
    proof.parts.some(x=>x.kind!=="ALLELUIA"||!healthy(x.text))||
    !witnesses.every(lang=>proof.parts.map(x=>x.text[lang]).join("\n")===
       proper.gradual?.[lang]))
  throw new Error("MR62_APRIL_PASCHAL_SOURCE_PARITY_OR_OWNERSHIP_FAILED");
 return proof.parts;
}
