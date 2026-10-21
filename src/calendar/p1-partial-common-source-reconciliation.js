// Research-only partial Common source reconciliation. No text duplication and
// no reader registration. Both rules are grounded in inherited Latin Common
// declarations and independently verified by the existing AO ProperResolver.
export const P1_PARTIAL_SOURCE_RULES=Object.freeze({
  "Commune/C3ap":Object.freeze({
    target:"Commune/C3ap",base:"Commune/C3p",orations:"Commune/C3a",
    inheritedMass:Object.freeze(["Introitus","Lectio","Graduale","Evangelium","Offertorium","Communio"]),
    alternateOrations:Object.freeze(["Oratio","Secreta","Postcommunio"]),
    declaration:"https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/horas/Latin/Commune/C3ap.txt",
    kind:"PASCAL_SEVERAL_MARTYRS_ALTERNATE_ORATIONS",
  }),
  "Commune/C7":Object.freeze({
    target:"Commune/C7",base:"Commune/C6-1",parentLesson:"Commune/C6",
    inheritedMass:Object.freeze(["Introitus","Evangelium","Offertorium","Communio"]),
    alternateOrations:Object.freeze([]),
    declaration:"https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/horas/Latin/Commune/C7.txt",
    kind:"ONE_NONVIRGIN_FEMALE_MARTYR",
  }),
});
const CORE=Object.freeze(["Introitus","Oratio","Lectio","Graduale","Evangelium",
  "Offertorium","Secreta","Communio","Postcommunio"]);
const langs=Object.freeze(["la","en","fr"]);
const has=v=>Array.isArray(v)&&v.some(x=>typeof x==="string"&&x.trim()&&!x.trim().startsWith("@"));
const norm=v=>String((v??[]).join("\n")).normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/[^A-Za-z0-9]+/g," ").toLowerCase().trim();
function held(reason,section=null){
  return Object.freeze({status:"HELD",reason,section,route:null,
    authorizedForSaintMass:false,borrowedSections:Object.freeze([]),maps:null});
}
export function reconcileP1PartialCommon({targetPath,target,base,orations,lessonSource}={}){
  const rule=P1_PARTIAL_SOURCE_RULES[targetPath];
  if(!rule)return held("UNKNOWN_COMMON_VARIANT");
  const sources={target,base,orations};
  for(const source of ["target","base",...(rule.alternateOrations.length?["orations"]:[])]){
    if(!langs.every(lang=>sources[source]?.[lang]?.map instanceof Map))
      return held("MISSING_SOURCE_OWNER",source);
  }
  if(rule.parentLesson){
    if(!langs.every(lang=>lessonSource?.[lang]?.map instanceof Map))
      return held("MISSING_EXPLICIT_PARENT_LESSON_SOURCE",rule.parentLesson);
    const lesson=lessonSource.la.map.get("Lectio");
    const existing=target.la.map.get("Lectio");
    if(!has(lesson))return held("MISSING_ORIGINAL_PARENT_LATIN_LECTIO");
    if(has(existing)&&norm(existing)!==norm(lesson))
      return held("CONFLICTING_ORIGINAL_LATIN_LECTIO");
  }
  const out={},borrowed=[];
  // For the C3ap Paschal base inheritance, the declared *file parent*
  // authorizes the base rows where the child leaves them blank. But an
  // explicit conflicting child row can never be silently replaced.
  for(const lang of langs){
    const map=new Map(target[lang].map);
    for(const section of rule.inheritedMass){
      const current=map.get(section),parent=base[lang].map.get(section);
      if(has(current)){
        // C7 can own a legitimate independent translation of an inherited
        // Latin chant; never override a source-owned vernacular section.
        // C3ap expressly names a parent Mass, so conflict is a hard hold.
        if(targetPath==="Commune/C3ap"&&has(parent)&&norm(current)!==norm(parent))
          return held("INHERITED_MASS_CONFLICT",lang+":"+section);
      }else if(has(parent)){
        // For nonvirgin C7, source identity is certified ONLY where target
        // Latin exists and equals the donor Latin. Unlike direct declared
        // C3ap parent inheritance, a non-identical Latin section is NOT lent.
        if(targetPath==="Commune/C7"){
          const t=target.la.map.get(section),b=base.la.map.get(section);
          if(!has(t)||!has(b)||norm(t)!==norm(b))continue;
        }
        map.set(section,parent);
        borrowed.push(Object.freeze({language:lang,section,from:rule.base,
          basis:targetPath==="Commune/C7"?"EXACT_LATIN_PARITY":"EXPLICIT_PARENT_SOURCE"}));
      }
    }
    if(rule.parentLesson&&!has(map.get("Lectio"))){
      const original=lessonSource[lang].map.get("Lectio");
      if(has(original)){
        map.set("Lectio",original);
        borrowed.push(Object.freeze({language:lang,section:"Lectio",
          from:rule.parentLesson,basis:"EXPLICIT_HORAS_SOURCE_PARENT"}));
      }
    }
    for(const section of rule.alternateOrations){
      const originalLatin=target.la.map.get(section),altLatin=orations.la.map.get(section);
      if(!has(originalLatin)||!has(altLatin)||norm(originalLatin)!==norm(altLatin))
        return held("ALTERNATE_ORATION_LATIN_MISMATCH",section);
      const original=map.get(section),donor=orations[lang].map.get(section);
      if(!has(original)){
        if(has(donor)){
          map.set(section,donor);
          borrowed.push(Object.freeze({language:lang,section,from:rule.orations,
            basis:"EXACT_VARIANT_ORATION_LATIN"}));
        }
      }else if(has(donor)&&norm(original)!==norm(donor))
        return held("ALTERNATE_ORATION_TRANSLATION_CONFLICT",lang+":"+section);
    }
    out[lang]=Object.freeze({map,sourcePath:targetPath});
  }
  const missingByLanguage=Object.freeze(Object.fromEntries(langs.map(lang=>[
    lang,Object.freeze(CORE.filter(section=>!has(out[lang].map.get(section))))
  ])));
  return Object.freeze({
    status:Object.values(missingByLanguage).every(x=>x.length===0)
      ?"SOURCE_COMPOSITION_COMPLETE":"PARTIAL_SOURCE_RECOVERY_VERIFIED",
    targetPath,declaredParentPath:rule.base,alternateOrationsOwner:rule.orations??null,
    borrowedSections:Object.freeze(borrowed),maps:Object.freeze(out),
    missingByLanguage,
    publishedLatinTextCopied:false,route:null,authorizedForSaintMass:false,
    appReaderChanged:false,
  });
}
