// 1960 General Rubrics §110: St Peter and St Paul are inseparable.
// https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html
// The 1962 source's 30 June Oratio, Secreta and Postcommunio each
// contain the text of both Apostles but must be joined under one ending.
// Exact owners: Sancti/06-30 and Sancti/02-22; never infer by title alone.

const FIELDS=Object.freeze(["collects","secrets","postcommunions"]);
const LANGS=Object.freeze(["lat","en","fr"]);
const srcText=s=>String(s??"").trim();
function unverified(proper,reason){return Object.freeze({status:"UNVERIFIED",reason,proper})}
function splitEnding(text){
  const raw=srcText(text),i=raw.lastIndexOf("\n");
  if(i<1)return null;
  const body=srcText(raw.slice(0,i)),end=srcText(raw.slice(i+1));
  return body&&end?Object.freeze({body,end}):null;
}
const SECOND_END=Object.freeze({
  lat:/^Qui vivis et regnas cum Deo Patre in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum\. Amen\.$/,
  en:/^Who livest and reignest with God the Father in the unity of the Holy Ghost, God, world without end\. Amen\.$/,
  fr:/^Vous qui vivez et régnez avec Dieu le Père dans l’unité du Saint-Esprit, Dieu, dans tous les siècles des siècles\. Ainsi soit-il\.$/
});
const PRINCIPAL_END=Object.freeze({
  lat:/^Per Dóminum nostrum Iesum Christum/,
  en:/^Through our Lord Jesus Christ/,
  fr:/^Par Notre-Seigneur Jésus-Christ/
});
function composeGroup(principal,companion,field){
  const segments={};const combined={...principal};
  for(const lang of LANGS){
    const original=srcText(principal?.[lang]);
    const sourced=srcText(companion?.[lang]);
    if(!original||!sourced)return null;
    let first,second;
    if(field==="collects"){
      const prefix=sourced.split("\n")[0].slice(0,50);
      if(prefix.length<25)return null;
      const index=original.indexOf(prefix);
      if(index<20||original.indexOf(prefix,index+1)!==-1)return null;
      const firstText=original.slice(0,index).replace(/\n_\n\*Pro S\. Petro\*\s*$/,"").trim();
      first=splitEnding(firstText);
      second=splitEnding(original.slice(index));
      // Both bodies must be source-owned; the independent Peter witness
      // must match the same opening, not a different saint's prayer.
      if(!second?.body.startsWith(prefix))return null;
    }else{
      first=splitEnding(original);
      second=splitEnding(sourced);
    }
    if(!first||!second||!PRINCIPAL_END[lang].test(first.end))return null;
    if(field==="collects"&&!SECOND_END[lang].test(second.end))return null;
    if(field!=="collects"&&!PRINCIPAL_END[lang].test(second.end))return null;
    combined[lang]=first.body+"\n\n"+second.body+"\n"+second.end;
    segments[lang]=Object.freeze({principal:first.body,additional:second.body,conclusion:second.end});
  }
  return Object.freeze({...combined,oneConclusion:Object.freeze({
    status:"CERTIFIED",kind:"INSEPARABLE_APOSTLES",
    sourcePath:"Sancti/02-22",rule:"1960_GENERAL_RUBRICS_110",
    conclusionOwner:"SAINT_PETER",parts:Object.freeze(["SAINT_PAUL","SAINT_PETER"]),
    segments:Object.freeze(segments),
  })});
}
export function projectJune30InseparableApostles({proper,calendarResolution,form}={}){
  const envelope=proper?.data&&typeof proper.data==="object"?proper:null;
  const data=envelope?envelope.data:proper;
  const day=calendarResolution?.day,main=day?.main;
  const occurrence=day?.commemorations??[];
  const owner=String(main?.id??"");
  if(!/^sancti:06-30:3:/i.test(owner)||main?.path!=="Sancti/06-30"||
    calendarResolution?.date?.slice(5)!=="06-30"||
    data?.sourcePath!=="Sancti/06-30"||calendarResolution?.status!=="ready")
    return unverified(proper,"IDENTITY_MISMATCH");
  if(occurrence.length!==1||occurrence[0]?.id!=="inseparable:sancti:06-29-petrus"||
    occurrence[0]?.inseparable!==true||Array.isArray(data.calendarCommemorations)&&
    data.calendarCommemorations.some(x=>!x.inseparable))
    return unverified(proper,"INSEPARABLE_CALENDAR_OWNER_MISMATCH");
  if(!["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(form))
    return unverified(proper,"UNSUPPORTED_FORM");
  const sourced=data.inseparableApostolicSources;
  if(!sourced||sourced.status!=="SOURCE_VERIFIED"||
    sourced.principal!=="Sancti/06-30"||
    sourced.companion!=="Sancti/02-22")
    return unverified(proper,"PETER_ORATION_SOURCE_MISSING");
  if(FIELDS.some(f=>!Array.isArray(data[f])||data[f].length!==1||!sourced[f]))
    return unverified(proper,"PRAYER_GROUP_SOURCE_COUNT_MISMATCH");
  const combined={};
  for(const f of FIELDS){
    combined[f]=composeGroup(data[f][0],sourced[f],f);
    if(!combined[f])return unverified(proper,"INSEPARABLE_"+f.toUpperCase()+"_BOUNDARY_UNVERIFIED");
  }
  const decision=Object.freeze({
    status:"CERTIFIED",source:"1962_PROPER_RESOLVER",form,
    scope:"INSEPARABLE_PETER_PAUL_JUNE_30",
    calendarCount:1,appliedCount:1,prayerGroupCount:1,
    mainId:owner,commemorationId:occurrence[0].id,
    authorities:Object.freeze(["1960_GENERAL_RUBRICS_110","1960_MISSAL_RUBRICS_434_480"]),
  });
  const selected=Object.freeze({...data,
    collects:Object.freeze([combined.collects]),secrets:Object.freeze([combined.secrets]),
    postcommunions:Object.freeze([combined.postcommunions]),
    collect:combined.collects,secret:combined.secrets,postcommunion:combined.postcommunions,
    appliedCommemorations:Object.freeze(occurrence.map(x=>Object.freeze({...x}))),
    omittedCommemorations:Object.freeze([]),
    commemorationFormDecision:decision,
  });
  return Object.freeze({status:"CERTIFIED",reason:null,
    proper:envelope?Object.freeze({...envelope,data:selected}):selected,decision});
}
