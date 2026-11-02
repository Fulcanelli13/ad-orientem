/**
 * Prayer language coverage, scoped to the canonical 48 and source-owned
 * nine-day novenas. A language field means text is present, not that its
 * translation or original edition has been independently certified.
 *
 * No missing historical Latin text is generated or silently substituted.
 */
export const PRAYER_LANGUAGE_KEYS_V1=Object.freeze(["en","fr","la"]);
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj||{},key);
const filled=value=>typeof value==="string"&&value.trim().length>0;

export function prayerLanguageFacesV1(record){
  return Object.freeze(Object.fromEntries(
    PRAYER_LANGUAGE_KEYS_V1.map(key=>[key,filled(record?.[key])])
  ));
}

function sourceLanguageFaces(value){
  if(typeof value==="string")return prayerLanguageFacesV1({en:value});
  return prayerLanguageFacesV1(value);
}

export function novenaTextSlotsV1(novena){
  const result=[];
  const add=(path,value)=>{
    if(!value)return;
    const languages=sourceLanguageFaces(value);
    if(!Object.values(languages).some(Boolean))return;
    result.push(Object.freeze({path,languages}));
  };
  for(const key of ["repeatText","opening","churchPrayer","ejaculation","sharedClosingText"]){
    if(own(novena,key))add(key,novena[key]);
  }
  for(const [index,day] of (novena?.days||[]).entries()){
    if(own(day,"text"))add(`days[${index+1}].text`,day.text);
  }
  return Object.freeze(result);
}

function canonicalReferences(novena){
  const ids=[
    ...(novena?.commonPrayers||[]).map(item=>Array.isArray(item)?item[0]:item?.id),
    novena?.closingCanonical,novena?.loretoCanonical
  ].filter(Boolean);
  return [...new Set(ids)];
}

/** Covers the explicit three additional novena programmes; not every Prayer door. */
export function auditPrayerLanguageCoverageV1({prayers={},novenas={},supplementalNovenas={}}={}){
  const core=Object.values(prayers).map(p=>Object.freeze({
    id:p.id,title:p.title,languages:prayerLanguageFacesV1(p),
    sourceCertification:"NOT_ESTABLISHED_BY_LANGUAGE_PRESENCE"
  }));
  const programmes=Object.entries({...novenas,...supplementalNovenas}).map(([id,n])=>{
    const sourceTextSlots=novenaTextSlotsV1(n);
    const canonical=canonicalReferences(n).map(prayerId=>({
      id:prayerId,languages:prayerLanguageFacesV1(prayers[prayerId])
    }));
    return Object.freeze({
      id,dayCount:n.days?.length||0,
      sourceTextSlots,
      canonical,
      allSourceOwnedTextInLatin:sourceTextSlots.length>0&&sourceTextSlots.every(x=>x.languages.la),
      missingLatinSourceSlots:sourceTextSlots.filter(x=>!x.languages.la).map(x=>x.path),
      availableLatinCommonPrayers:canonical.filter(x=>x.languages.la).map(x=>x.id),
      sourceCertification:"NOT_ESTABLISHED_BY_LANGUAGE_PRESENCE"
    });
  });
  const summary=Object.freeze({
    corePrayerCount:core.length,
    coreLatinTextPresent:core.filter(x=>x.languages.la).length,
    coreFrenchTextPresent:core.filter(x=>x.languages.fr).length,
    novenaProgrammeCount:programmes.length,
    novenaSourceTextSlotCount:programmes.reduce((n,p)=>n+p.sourceTextSlots.length,0),
    novenaLatinSourceSlotCount:programmes.reduce((n,p)=>n+p.sourceTextSlots.filter(x=>x.languages.la).length,0),
    novenaProgrammesWithAllSourceTextLatin:programmes.filter(x=>x.allSourceOwnedTextInLatin).length,
    missingLatinCoreIds:core.filter(x=>!x.languages.la).map(x=>x.id),
    missingLatinNovenaIds:programmes.filter(x=>!x.allSourceOwnedTextInLatin).map(x=>x.id),
    sourceEditionCertification:"NOT_ASSESSED",
    remainingModuleFamilies:"NOT_YET_AUDITED_BY_THIS_INVENTORY"
  });
  return Object.freeze({schema:"AO_PRAYER_LANGUAGE_COVERAGE_V1",scope:"48 canonical records + original and supplemental source-owned novenas only",summary,core,programmes});
}
