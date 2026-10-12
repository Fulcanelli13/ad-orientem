// 1960 General Rubrics §§108-114 and 1960 Missal §§433-438.
// One authoritative source projection: actual parsed principal + TWO
// complete, source-ordered commemorations. Never invent feast names/text.
// The source Calendar inventory is independent of prayers at this Mass.
// https://www.divinumofficium.com/www/horas/Help/Rubrics/General%20Rubrics.html
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
const GROUPS=Object.freeze(["collects","secrets","postcommunions"]);
const LANGS=Object.freeze(["lat","en","fr"]);
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const canon=v=>String(v??"").trim().replace(/^\/+|\/+$/g,"").toLowerCase();
const hold=(proper,reason)=>Object.freeze({status:"UNVERIFIED",reason,proper});
const rows=x=>Array.isArray(x)?x:[];
const validText=x=>Boolean(x&&LANGS.every(k=>typeof x[k]==="string"&&x[k].trim()));
const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v??""));
function isPrivilegedAdventFeria(entry,source){
  const id=String(entry?.id??""),path=String(entry?.path??"");
  if(!/^tempora:Adv[1-4]-[1-6]:3:/i.test(id)||
     !/^Tempora\/Adv[1-4]-[1-6]$/i.test(path)||Number(entry?.rank)!==3)return false;
  const a=canon(path),actual=canon(source?.path),prayer=canon(source?.prayerSourcePath??source?.path);
  return a===actual&&(prayer===a||prayer===a.replace(/-[1-6]$/,"-0"));
}
function sourceMatched(entry,source){
  const named=canon(entry?.path),sourcePath=canon(source?.path),prayerPath=canon(source?.prayerSourcePath??source?.path);
  if(!named||named!==sourcePath||
    !(/^sancti\/[0-9]{2}-[0-9]{2}[a-z]*$/.test(named)||
      /^tempora\/adv[1-4]-[1-6]$/.test(named)))return false;
  if(isPrivilegedAdventFeria(entry,source))return true;
  return prayerPath===named;
}
function exactPrincipal(principal,proper){
  if(![3,4].includes(Number(principal?.rank)))return false;
  const own=canon(principal.path),source=canon(proper.sourcePath);
  if(own){
    // A fabricated or unrelated Proper that happens to share an arbitrary
    // main.path cannot establish Roman liturgical source ownership.
    const temporal=/^tempora\/(?:adv|epi|quad|pasc|pent)[0-9]+-[0-6]$/.test(own)&&
      /^tempora:/i.test(String(principal.id??""));
    const sanctoral=/^sancti\/[0-9]{2}-[0-9]{2}[a-z]*$/.test(own)&&
      /^sancti:/i.test(String(principal.id??""));
    return (temporal||sanctoral)&&own===source;
  }
  // A generic IV-class weekday inherits its Sunday's proper; the running
  // 1962 resolver is responsible for exact temporal-cycle/week selection.
  return Number(principal.rank)===4&&
    /^:feria:4:[a-z]$/i.test(String(principal.id??""))&&
    /^tempora\/(?:epi|pent)[0-9]+-0$/.test(source);
}
function split(row,language){
  const t=String(row?.[language]??"").trim(),index=t.lastIndexOf("\n");
  if(index<8)return null;
  const body=t.slice(0,index).trim(),ending=t.slice(index+1).trim();
  if(body.length<16||ending.length<28)return null;
  if(language==="fr"?!/(?:Ainsi soit-il|Amen)\.$/i.test(ending):!/Amen\.$/i.test(ending))return null;
  return Object.freeze({body,ending});
}
function joinUnderSingleConclusion(first,second,sourceA,sourceB){
  const composed={},segments={};
  if(first?.oneConclusion||second?.oneConclusion)return null;
  for(const language of LANGS){
    const a=split(first,language),b=split(second,language);
    if(!a||!b)return null;
    // §437: the first of TWO added commemorations is not concluded
    // independently; the final commemoration supplies one conclusion.
    // This group remains separate from the principal Mass Collect.
    composed[language]=a.body+"\n\n"+b.body+"\n"+b.ending;
    segments[language]=Object.freeze({
      principal:a.body,additional:b.body,conclusion:b.ending,
    });
  }
  return Object.freeze({...first,...composed,
    oneConclusion:Object.freeze({
      status:"CERTIFIED",kind:"MULTIPLE_COMMEMORATIONS",
      rule:"1960_GENERAL_RUBRICS_111_114_AND_MISSAL_437",
      sourcePaths:Object.freeze([String(sourceA.path),String(sourceB.path)]),
      conclusionOwner:String(sourceB.path),
      parts:Object.freeze(["FIRST_COMMEMORATION","SECOND_COMMEMORATION"]),
      segments:Object.freeze(segments),
    }),
  });
}
/**
 * The caller has already excluded observed/votive forms and conventual rules.
 * This function certifies exact source identity and class/priority *before*
 * allowing an oration array to be projected to LIVE, preflight, or print.
 */
export function project1962TwoCommemorations({proper,calendarResolution,form}={}){
  const envelope=proper?.data&&typeof proper.data==="object"?proper:null;
  const data=envelope?envelope.data:proper;
  const day=calendarResolution?.day,main=day?.main;
  const comms=rows(day?.commemorations),sources=rows(data?.calendarCommemorations);
  if(!FORMS.has(form))return hold(proper,"UNSUPPORTED_FORM");
  if(calendarResolution?.status!=="ready"||!iso(calendarResolution?.date)||
     !exactPrincipal(main,data)||comms.length!==2||sources.length!==2)
    return hold(proper,"SOURCE_IDENTITY_OR_COUNT_UNVERIFIED");
  if(comms.some((x,i)=>x?.inseparable||sources[i]?.inseparable||
      ![3,4].includes(Number(x?.rank))||!sourceMatched(x,sources[i])))
    return hold(proper,"COMMEMORATION_SOURCE_ORDER_UNVERIFIED");
  if(comms.some((x,i)=>i>0&&Number(comms[i-1]?.rank)>Number(x?.rank)&&
      !isPrivilegedAdventFeria(comms[0],sources[0])))
    return hold(proper,"COMMEMORATION_PRECEDENCE_UNVERIFIED");
  const tempore=comms.map((x,i)=>String(x?.id??"").startsWith("tempora:")?i:-1)
    .filter(x=>x>=0);
  if(tempore.length>1||tempore.length===1&&tempore[0]!==0)
    return hold(proper,"SEASONAL_COMMEMORATION_MUST_BE_FIRST");
  const privileged=comms.map((x,i)=>isPrivilegedAdventFeria(x,sources[i]));
  // Other privileged seasonal classes (September Ember, Lent, etc.) must
  // be researched and admitted by their OWN class-specific source rules.
  if(comms.some((x,i)=>x?.privileged&&!privileged[i]))
    return hold(proper,"OTHER_PRIVILEGED_CLASS_UNVERIFIED");
  if(privileged.filter(Boolean).length>1)
    return hold(proper,"MULTIPLE_PRIVILEGED_COMMEMORATIONS_UNVERIFIED");
  if(GROUPS.some(k=>rows(data[k]).length!==3||
      rows(data[k]).some(x=>!validText(x))))
    return hold(proper,"THREE_ORATION_GROUP_SOURCE_INCOMPLETE");
  const low=form==="LOW";
  const selectedRows={},committed=low?comms:privileged[0]?[comms[0]]:[],
    omitted=low?[]:comms.filter(x=>!committed.includes(x));
  for(const key of GROUPS){
    const original=data[key];
    if(low){
      const combined=joinUnderSingleConclusion(original[1],original[2],sources[0],sources[1]);
      if(!combined)return hold(proper,"ONE_CONCLUSION_"+key.toUpperCase()+"_UNVERIFIED");
      selectedRows[key]=Object.freeze([original[0],combined]);
    }else selectedRows[key]=Object.freeze(privileged[0]?
      [original[0],original[1]]:[original[0]]);
  }
  const decision=Object.freeze({
    status:"CERTIFIED",source:"1962_PROPER_RESOLVER",form,
    scope:"TWO_SOURCED_III_IV_CLASS_COMMEMORATIONS",
    calendarCount:2,appliedCount:committed.length,
    prayerGroupCount:low?2:1+committed.length,
    authorities:Object.freeze(["1960_GENERAL_RUBRICS_108_114",
      "1960_MISSAL_RUBRICS_433_438"]),
    principalId:String(main.id),commemorationIds:Object.freeze(comms.map(x=>String(x.id))),
  });
  const selected=Object.freeze({...data,...selectedRows,
    collect:selectedRows.collects[0],
    secret:selectedRows.secrets[0],
    postcommunion:selectedRows.postcommunions[0],
    appliedCommemorations:Object.freeze(committed.map(x=>Object.freeze({...x}))),
    omittedCommemorations:Object.freeze(omitted.map(x=>Object.freeze({...x}))),
    commemorationFormDecision:decision,
  });
  return Object.freeze({status:"CERTIFIED",reason:null,
    proper:envelope?Object.freeze({...envelope,data:selected}):selected,decision});
}
