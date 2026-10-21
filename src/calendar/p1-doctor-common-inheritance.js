// P1 research-only: in-place source ownership, not a new Common/Proper corpus.
// Reconstruct EN/FR shared Doctor prayer sections solely through the
// existing Ad Orientem ProperResolver; preserve C5a's non-Pontiff orations.
export const P1_DOCTOR_SOURCE_OWNER=Object.freeze({
  target:"Commune/C5a",
  shared:"Commune/C4a",
  sharedSections:Object.freeze([
    "Introitus","Oratio","Lectio","Graduale","GradualeP","Tractus",
    "Evangelium","Offertorium","Communio",
  ]),
  distinctiveSections:Object.freeze(["Secreta","Postcommunio"]),
  languages:Object.freeze(["la","en","fr"]),
});
const rows=(source,section)=>source?.map instanceof Map ? source.map.get(section) : undefined;
const present=value=>Array.isArray(value)&&value.some(v=>
  typeof v==="string"&&v.trim().length>0&&!/^@/.test(v.trim()));
const canonical=value=>String(value??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae")
  .replace(/œ/gi,"oe").replace(/[^A-Za-z0-9]+/g," ")
  .trim().toLowerCase();
const exactLatinParity=(target,shared)=>Array.isArray(target)&&Array.isArray(shared)&&
  canonical(target.join("\n"))===canonical(shared.join("\n")) &&
  canonical(target.join("\n")).length>12;
// The pinned C5a Latin inherited Collect repeats the SAME prayer beneath
// the literal office rubric "(sed communi Summorum Pontificum)" and spells
// the duplicate's cœlis as cælis. C4a contains the prayer once, with blank
// lines. This is an edition layout alias, not a second or different Collect.
// Recognize ONLY this strict shape. Any new extra Latin prayer remains HELD.
const collectSignature=s=>canonical(String(s??"")
  .replace(/c[œæ]lis/giu,"celis"));
function exactSharedCollectParity(target,shared){
  if(exactLatinParity(target,shared))return true;
  if(!Array.isArray(target)||!Array.isArray(shared))return false;
  const t=target.map(x=>String(x??"").trim()).filter(Boolean);
  const d=shared.map(x=>String(x??"").trim()).filter(Boolean);
  if(d.length!==2||t.length!==4)return false;
  if(!/^\(sed communi Summorum Pontificum\)$/i.test(t[1]))return false;
  if(!/^\$Per Dominum\.?$/i.test(d[1])||
     !/^\$Per Dominum\.?$/i.test(t[3]))return false;
  const signature=collectSignature(d[0]);
  return signature.length>100 && signature===collectSignature(t[0]) &&
    signature===collectSignature(t[2]);
}
const hold=(reason,section=null)=>Object.freeze({
  schema:"ao-p1-doctor-inheritance-v1",status:"HELD",reason,
  section,sourcePath:P1_DOCTOR_SOURCE_OWNER.target,
  sourceOwner:P1_DOCTOR_SOURCE_OWNER.shared,
  mappedSources:null,borrowedSections:Object.freeze([]),
  approvedForMass:false,
});
export function reconcileP1NonPontiffDoctorSources(
  {target={},shared={},expected=P1_DOCTOR_SOURCE_OWNER}={}
){
  // No inferred owner paths, no generic language fallback, no possible
  // replacement of the non-Pontiff variant's actual prayers.
  if(expected?.target!=="Commune/C5a" || expected?.shared!=="Commune/C4a")
    return hold("UNAPPROVED_COMMON_INHERITANCE_OWNER");
  for(const lang of ["la","en","fr"]){
    if(!(target?.[lang]?.map instanceof Map)||
       !(shared?.[lang]?.map instanceof Map))
      return hold("MISSING_AUTHENTICATED_SOURCE_MAP",lang);
  }
  const targetLatin=target.la,sharedLatin=shared.la;
  for(const section of expected.sharedSections){
    if(!present(rows(targetLatin,section))||!present(rows(sharedLatin,section)))
      return hold("MISSING_SHARED_LATIN",section);
    if(!(section==="Oratio"?
      exactSharedCollectParity(rows(targetLatin,section),rows(sharedLatin,section)):
      exactLatinParity(rows(targetLatin,section),rows(sharedLatin,section))))
      return hold("SHARED_LATIN_PARITY_MISMATCH",section);
    for(const lang of ["en","fr"]){
      if(!present(rows(shared[lang],section)))
        return hold("MISSING_SHARED_VERNACULAR",section+":"+lang);
      // A C5a localized line in the shared sections may still be valid,
      // but a shared-source cross-language substitution is authorised
      // only when the target actually lacks that section.
    }
  }
  for(const section of expected.distinctiveSections){
    for(const lang of ["la","en","fr"]){
      if(!present(rows(target[lang],section)))
        return hold("MISSING_DISTINCTIVE_NON_PONTIFF_ORATION",section+":"+lang);
    }
  }
  const output={};
  const borrowed=[];
  for(const lang of ["la","en","fr"]){
    const map=new Map(target[lang].map);
    if(lang!=="la"){
      for(const section of expected.sharedSections){
        if(present(map.get(section)))continue;
        map.set(section,shared[lang].map.get(section));
        borrowed.push(Object.freeze({
          language:lang,section,originalSourcePath:expected.shared,
          resolvedOwnerPath:expected.target,latinParityVerified:true,
        }));
      }
    }
    // Preserve all source-native rows, especially non-Pontiff Secret
    // and Postcommunion; only add immutable references to shared rows.
    output[lang]=Object.freeze({map,sourcePath:expected.target});
  }
  return Object.freeze({
    schema:"ao-p1-doctor-inheritance-v1",status:"SOURCE_COMPOSITION_VERIFIED",
    sourcePath:expected.target,sourceOwner:expected.shared,
    mappedSources:Object.freeze(output),
    borrowedSections:Object.freeze(borrowed),
    alreadyPresentLanguageRowsNotOverwritten:true,
    nonPontiffOrationsPreserved:true,
    approvedForMass:false,
    route:null,
    note:"Read-only source composition; no saint Mass selection, no print-text certification, no production reader change",
  });
}
