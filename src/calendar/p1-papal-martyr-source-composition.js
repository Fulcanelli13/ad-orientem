// P1 research-only, original papal martyr Common alias. Both original
// Commune/C2b and Commune/C3b explicitly delegate their eight non-Collect
// Mass sections to Commune/C4b. Their Collects remain separate.
// No second prayer corpus, no live reader import, no Mass selection.
const TARGETS=Object.freeze(["Commune/C2b","Commune/C3b"]);
export const P1_PAPAL_MARTYR_MASS_OWNER=Object.freeze({
 donor:"Commune/C4b",targets:TARGETS,
 inherited:Object.freeze(["Introitus","Lectio","Graduale","Evangelium",
   "Offertorium","Secreta","Communio","Postcommunio"]),
 unique:Object.freeze(["Oratio"]),
});
const LANGS=Object.freeze(["la","en","fr"]);
const exists=v=>Array.isArray(v)&&v.some(x=>typeof x==="string"&&x.trim()&&!x.trim().startsWith("@"));
const norm=v=>String((v??[]).join("\n")).normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae")
 .replace(/œ/gi,"oe").replace(/[^a-zA-Z0-9]+/g," ").toLowerCase().trim();
const held=(reason,section=null)=>Object.freeze({status:"HELD",reason,section,
 route:null,approvedForMass:false,borrowedSections:Object.freeze([]),maps:null});
export function composeP1PapalMartyrSource({targetPath,target,donor}={}){
 if(!TARGETS.includes(targetPath))return held("UNSUPPORTED_PAPAL_VARIANT");
 for(const owner of [target,donor]){
  if(!LANGS.every(lang=>owner?.[lang]?.map instanceof Map))
   return held("SOURCE_OWNER_MISSING");
 }
 for(const section of P1_PAPAL_MARTYR_MASS_OWNER.inherited){
  const ownLatin=target.la.map.get(section),sharedLatin=donor.la.map.get(section);
  if(!exists(ownLatin)||!exists(sharedLatin)||norm(ownLatin)!==norm(sharedLatin))
   return held("ORIGINAL_LATIN_IDENTITY_MISMATCH",section);
  for(const lang of LANGS){
   const source=donor[lang].map.get(section);
   if(!exists(source))return held("ORIGINAL_DONOR_LANGUAGE_MISSING",lang+":"+section);
   const child=target[lang].map.get(section);
   if(exists(child)&&norm(child)!==norm(source))
    return held("CONTRADICTORY_INHERITED_TEXT",lang+":"+section);
  }
 }
 for(const lang of LANGS){
  const own=target[lang].map.get("Oratio");
  if(!exists(own))return held("VARIANT_COLLECT_MISSING",lang);
 }
 if(norm(target.la.map.get("Oratio"))===norm(donor.la.map.get("Oratio")))
  return held("UNEXPECTED_GENERIC_PONTIFF_COLLECT");
 const out={},borrowed=[];
 for(const lang of LANGS){
  const map=new Map(target[lang].map);
  for(const section of P1_PAPAL_MARTYR_MASS_OWNER.inherited){
   if(exists(map.get(section)))continue;
   map.set(section,donor[lang].map.get(section));
   borrowed.push(Object.freeze({language:lang,section,sourcePath:"Commune/C4b",
    reason:"DECLARED_ORIGINAL_LATIN_IDENTICAL_SOURCE"}));
  }
  out[lang]=Object.freeze({map,sourcePath:targetPath});
 }
 return Object.freeze({
  status:"SOURCE_COMPOSITION_VERIFIED",sourcePath:targetPath,
  donorSourcePath:"Commune/C4b",maps:Object.freeze(out),
  borrowedSections:Object.freeze(borrowed),variantCollectRetained:true,
  latinSectionParityCount:8,uniqueCollectSourcePath:targetPath,
  route:null,approvedForMass:false,optionalSaintMassApproved:false,
 });
}
