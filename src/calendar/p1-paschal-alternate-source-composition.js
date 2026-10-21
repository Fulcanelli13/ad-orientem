// P1 research-only inherited Common composer. The Latin DO source at
// web/www/horas/Latin/Commune/C2ap.txt begins @Commune/C2p,
// with Oratio, Secreta, Postcommunio explicitly overridden @Commune/C2a.
// Do not generalize to C3ap or a modern saint without independent evidence.
export const P1_ONE_MARTYR_PASCHAL_ALTERA=Object.freeze({
  target:"Commune/C2ap",
  base:"Commune/C2p",
  orations:"Commune/C2a",
  inheritedSections:Object.freeze([
    "Introitus","Lectio","Graduale","Evangelium","Offertorium","Communio",
  ]),
  overrideSections:Object.freeze(["Oratio","Secreta","Postcommunio"]),
  sourceDeclaration:"https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/horas/Latin/Commune/C2ap.txt",
  sourceReferences:Object.freeze(["@Commune/C2p","@Commune/C2a"]),
});
const valid=x=>Array.isArray(x)&&x.some(t=>typeof t==="string"&&Boolean(t.trim())&&!t.trim().startsWith("@"));
const n=x=>String((x??[]).join("\n")).normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
  .replace(/[^a-zA-Z0-9]+/g," ").toLowerCase().trim();
const hold=(reason,section=null)=>Object.freeze({
  status:"HELD",reason,section,route:null,approvedForMass:false,
  sourcePath:P1_ONE_MARTYR_PASCHAL_ALTERA.target,
  borrowedSections:Object.freeze([]),composition:null,
});
export function composeP1OneMartyrPaschalAltera({target,base,orations,rule=P1_ONE_MARTYR_PASCHAL_ALTERA}={}){
  if(rule!==P1_ONE_MARTYR_PASCHAL_ALTERA)
    return hold("UNKNOWN_SOURCE_DECLARATION");
  for(const p of [target,base,orations]){
    if(!p||["la","en","fr"].some(lang=>!(p[lang]?.map instanceof Map)))
      return hold("MISSING_CANONICAL_SOURCE_MAP");
  }
  const output={},borrowed=[];
  for(const section of rule.inheritedSections){
    for(const lang of ["la","en","fr"]){
      const src=base[lang].map.get(section);
      if(!valid(src))return hold("BASE_MASS_SECTION_ABSENT",section+":"+lang);
      const own=target[lang].map.get(section);
      if(valid(own)&&n(own)!==n(src))
        return hold("INHERITED_SECTION_CONFLICT",section+":"+lang);
    }
  }
  for(const section of rule.overrideSections){
    const sourceLatin=orations.la.map.get(section),targetLatin=target.la.map.get(section);
    if(!valid(sourceLatin)||!valid(targetLatin)||n(sourceLatin)!==n(targetLatin))
      return hold("ALTERNATIVE_ORATION_LATIN_IDENTITY_MISMATCH",section);
    for(const lang of ["la","en","fr"]){
      const variant=orations[lang].map.get(section);
      if(!valid(variant))return hold("ALTERNATIVE_ORATION_TRANSLATION_ABSENT",section+":"+lang);
    }
  }
  for(const lang of ["la","en","fr"]){
    const map=new Map(target[lang].map);
    for(const section of rule.inheritedSections){
      if(valid(map.get(section)))continue;
      const source=base[lang].map.get(section);
      map.set(section,source);
      borrowed.push(Object.freeze({language:lang,section,owner:rule.base,kind:"MASS_FAMILY"}));
    }
    for(const section of rule.overrideSections){
      if(valid(map.get(section)))continue;
      const source=orations[lang].map.get(section);
      map.set(section,source);
      borrowed.push(Object.freeze({language:lang,section,owner:rule.orations,kind:"ALTERNATE_ORATION"}));
    }
    if([...rule.inheritedSections,...rule.overrideSections].some(section=>!valid(map.get(section))))
      return hold("COMPOSITE_SECTION_UNAVAILABLE",lang);
    output[lang]=Object.freeze({map,sourcePath:rule.target});
  }
  return Object.freeze({
    status:"SOURCE_COMPOSITION_VERIFIED",
    sourcePath:rule.target,
    baseSourcePath:rule.base,
    alternativeOrationsSourcePath:rule.orations,
    composition:Object.freeze(output),
    borrowedSections:Object.freeze(borrowed),
    printedIndependentMassCertified:false,
    originalMassFamilyIdentity:"PASCAL_ONE_MARTYR_ALTERA_ORATIONS",
    authorizedForOptionalSaint:false,
    approvedForMass:false,route:null,
  });
}
