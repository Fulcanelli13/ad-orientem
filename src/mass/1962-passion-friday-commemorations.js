// Universal 1962 Roman Mass: Friday in Passion Week, 27 March 2026.
// Original pinned Friday Proper has Seven Sorrows prayers in its conditional
// [Commemoratio] sections; pinned Sancti/03-27 separately has St John
// Damascene's complete Proper. This does not change the SSPX I-class
// Our Lady of Compassion or an explicitly selected festal/votive Mass.
// RG §§108-114; Missal §§434(d), 437: two ordinary commemorations in a
// nonconventual LOW Mass under ONE conclusion, none in nonconventual
// sung Masses. Original calendar inventory is preserved, and a source-
// verified Mass-only supplemental observance is explicitly identified.
export const PASSION_FRIDAY_1962_SCHEMA="ao-1962-passion-friday-two-commemorations-v1";
const DATE="2026-03-27",PRINCIPAL="Tempora/Quad5-5Feria",
 ID="tempora:Quad5-5Feria:3:v",SORROWS="Tempora/Quad5-5Feriac",
 JOHN="Sancti/03-27";
const GROUPS=Object.freeze([
 Object.freeze({field:"collects",single:"collect",section:"Oratio"}),
 Object.freeze({field:"secrets",single:"secret",section:"Secreta"}),
 Object.freeze({field:"postcommunions",single:"postcommunion",section:"Postcommunio"}),
]);
const LANG=Object.freeze([["la","lat"],["en","en"],["fr","fr"]]);
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/[æǽ]/g,"ae").replace(/[œ]/g,"oe").toLowerCase()
 .replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const complete=s=>typeof s==="string"&&s.trim().length>24&&!/(?:^|\n)\s*[$@]/m.test(s);
const valid=row=>Boolean(row&&["lat","en","fr"].every(k=>complete(row[k])));
const rows=(data,field,single)=>Array.isArray(data?.[field])&&data[field].length?
 data[field]:data?.[single]?[data[single]]:[];
const safeArray=x=>Array.isArray(x)?x:[];
const labelMatches=(text,lang)=>String(text??"").startsWith("!")&&(
 lang==="la"||lang==="fr"
  ?/Septem Dolorum/i.test(norm(text).replace(/septem dolorum/i,"Septem Dolorum"))
  :/seven sorrows/i.test(String(text)));
const stripSorrow=(lines,lang)=>{
 if(!Array.isArray(lines)||lines.length!==3||
    !labelMatches(lines[0],lang)||
    String(lines[2]).trim()!=="$Qui vivis")return null;
 const body=String(lines[1]??"").trim().replace(/~\s*/g," ");
 return complete(body)?body:null;
};
function splitSaintPrayer(text){
 const raw=String(text??"").trim();
 const i=raw.lastIndexOf("\n");
 if(i<25)return null;
 const body=raw.slice(0,i).trim(),conclusion=raw.slice(i+1).trim();
 if(!complete(body)||conclusion.length<45||
    !/(?:Amen|Ainsi soit-il)\.$/i.test(conclusion))return null;
 return {body,conclusion};
}
const firstSource=Object.freeze({path:SORROWS,prayerSourcePath:PRINCIPAL,
 id:"tempora:Quad5-5Feriac:4:w",rank:4,privileged:false,
 title:"Seven Sorrows of the Blessed Virgin Mary"});
const secondSource=Object.freeze({path:JOHN,prayerSourcePath:JOHN,
 id:"sancti:03-27:3:w",rank:3,privileged:false,
 title:"St John Damascene, Confessor and Doctor of the Church"});
const provenance=Object.freeze({
 principalPath:PRINCIPAL,calendarSourcePlaceholder:SORROWS,
 firstSourceSection:"Commemoratio",secondSource:JOHN,
 secondId:secondSource.id,sourceVerifiedIn:["la","en","fr"],
 calendarDate:DATE,ordinaryOnly:true,
 ordinal:"SEVEN_SORROWS_THEN_ST_JOHN_DAMASCENE",
 council:"1960_GENERAL_RUBRICS_111D_AND_1960_MISSAL_437",
 authority:"PINNED_DIVINUM_OFFICIUM_1962_ROMAN_ORIGINALS"
});

// readExpanded(path, section, diagnostic) is the SAME pinned original
// reader normalizer used elsewhere in recovery, not a translation generator.
// The source declares its own $Per Dominum; unknown or conflicting sigla
// cannot be passed by title or generic saint lookup.
export async function recover1962PassionFridaySources({
 data,principalId,calendarDate,hostResolver,readExpanded,diagnostic
}={}){
 if(calendarDate!==DATE||principalId!==ID||
    data?.sourcePath!==PRINCIPAL||!hostResolver||
    typeof readExpanded!=="function"||
    (data.principalCelebrationId&&data.principalCelebrationId!==ID)||
    data?.calendarCommemorations?.length!==1||
    data.calendarCommemorations[0]?.path!==SORROWS||
    data.calendarCommemorations[0]?.prayerSourcePath!==SORROWS||
    data.calendarCommemorations[0]?.inseparable||
    safeArray(data.appliedCommemorations).length||
    safeArray(data.omittedCommemorations).length||
    data.verifiedPassionFridayCommemorations)return null;
 const groups={};
 for(const {field,single,section} of GROUPS){
  const principalRows=rows(data,field,single);
  if(principalRows.length!==1||!valid(principalRows[0]))return null;
  const first={},second={};
  const johnExpanded=await readExpanded(JOHN,section,diagnostic);
  if(!valid(johnExpanded))return null;
  for(const [lang,key] of LANG){
   const [friday,john]=await Promise.all([
    hostResolver.resolveSource(PRINCIPAL,lang,diagnostic),
    hostResolver.resolveSource(JOHN,lang,diagnostic)
   ]);
   const sorrows=stripSorrow(friday?.map?.get("Commemoratio "+section),lang);
   const johnOriginal=john?.map?.get(section);
   const mainOriginal=friday?.map?.get(section);
   if(!sorrows||!Array.isArray(johnOriginal)||johnOriginal.length!==2||
      String(johnOriginal[1]).trim()!=="$Per Dominum"||
      !Array.isArray(mainOriginal)||mainOriginal.length!==2||
      String(mainOriginal[1]).trim()!=="$Per Dominum")return null;
   const mainBody=String(mainOriginal[0]??"").trim();
   if(!complete(mainBody)||!norm(principalRows[0][key]).startsWith(norm(mainBody).slice(0,90)))
    return null;
   const saint=splitSaintPrayer(johnExpanded[key]);
   if(!saint||!norm(saint.body).startsWith(norm(johnOriginal[0]).slice(0,90)))
    return null;
   first[key]=sorrows;
   second[key]=Object.freeze(saint);
  }
  groups[field]=Object.freeze({principal:principalRows[0],
   sorrows:Object.freeze({...first,sourcePath:PRINCIPAL+":Commemoratio "+section}),
   john:Object.freeze({...second,sourcePath:JOHN+":"+section})});
 }
 return Object.freeze({...data,
  verifiedPassionFridayCommemorations:Object.freeze({
    status:"SOURCE_VERIFIED",schema:PASSION_FRIDAY_1962_SCHEMA,
    ...provenance,observances:Object.freeze([firstSource,secondSource]),
    groups:Object.freeze(groups),principalId:ID
  }),
  sourceEditorialCorrections:Object.freeze([
   ...(data.sourceEditorialCorrections??[]),
   Object.freeze({id:"1962_PASSION_FRIDAY_DUAL_SOURCE_WITNESSES",
    sourcePath:PRINCIPAL,additionalSource:JOHN,
    originalSourcePreserved:true,addedTranslation:false,
    noGenericCalendarChange:true})
  ])
 });
}
function composeUnderOneConclusion(first,second,field){
 const composed={},segments={};
 for(const key of ["lat","en","fr"]){
  const a=first[key],b=second[key]?.body,end=second[key]?.conclusion;
  if(!complete(a)||!complete(b)||!complete(end))return null;
  composed[key]=a+"\n\n"+b+"\n"+end;
  segments[key]=Object.freeze({principal:a,additional:b,conclusion:end});
 }
 return Object.freeze({...composed,sourcePath:PRINCIPAL+":Commemoratio+"+JOHN,
  oneConclusion:Object.freeze({status:"CERTIFIED",kind:"MULTIPLE_COMMEMORATIONS",
   rule:"1960_GENERAL_RUBRICS_111D_AND_MISSAL_437",
   sourcePaths:Object.freeze([PRINCIPAL+":Commemoratio "+field,JOHN+":"+field]),
   conclusionOwner:JOHN,parts:Object.freeze(["FIRST_COMMEMORATION","SECOND_COMMEMORATION"]),
   segments:Object.freeze(segments)})});
}
// Pure form-specific projection; never silently changes the 1962 Calendar,
// the raw Mass Proper, or an explicitly chosen alternative observance.
export function select1962PassionFridayCommemorationsForMassForm({
 proper,date,principalId,form,celebrationId="mass_of_day",
 requestedCelebrationId="mass_of_day",celebrationType="CALENDAR",
 isConventual=false,observedSource=false
}={}){
 const data=proper?.data&&typeof proper.data==="object"?proper.data:proper;
 const proof=data?.verifiedPassionFridayCommemorations;
 const formName=String(form??"").toUpperCase();
 if(!FORMS.has(formName)||date!==DATE||principalId!==ID||
    isConventual!==false||observedSource!==false||
    celebrationId!=="mass_of_day"||requestedCelebrationId!=="mass_of_day"||
    String(celebrationType).toUpperCase()!=="CALENDAR"||
    data?.sourcePath!==PRINCIPAL||
    data?.calendarCommemorations?.length!==1||
    data.calendarCommemorations[0]?.path!==SORROWS||
    data.calendarCommemorations[0]?.prayerSourcePath!==SORROWS||
    proof?.status!=="SOURCE_VERIFIED"||
    proof.schema!==PASSION_FRIDAY_1962_SCHEMA||
    proof.calendarDate!==DATE||proof.principalId!==ID||
    proof.principalPath!==PRINCIPAL||
    proof.secondSource!==JOHN||proof.observances?.length!==2)
  return Object.freeze({status:"UNVERIFIED",reason:"PASSION_FRIDAY_SOURCE_OR_FORM_INCOMPLETE",proper});
 const low=formName==="LOW";
 const selected={...data},chosen=low?proof.observances:[],
   omitted=low?[]:proof.observances;
 for(const {field,single,section} of GROUPS){
  const g=proof.groups?.[field],first=rows(data,field,single);
  if(first.length!==1||!valid(first[0])||g?.principal!==first[0]||
      !g?.sorrows||!g?.john)return Object.freeze({
        status:"UNVERIFIED",reason:"PASSION_FRIDAY_ORATION_SOURCE_CONFLICT",proper});
  const combined=low?composeUnderOneConclusion(g.sorrows,g.john,section):null;
  if(low&&!combined)return Object.freeze({
   status:"UNVERIFIED",reason:"PASSION_FRIDAY_ONE_CONCLUSION_INCOMPLETE",proper});
  selected[field]=Object.freeze(low?[first[0],combined]:[first[0]]);
  selected[single]=first[0];
 }
 const decision=Object.freeze({
  status:"CERTIFIED",source:"1962_PROPER_RESOLVER",form:formName,
  scope:"PASSION_FRIDAY_TWO_SOURCE_ORDINARY_COMMEMORATIONS_2026",
  calendarCount:2,sourceCalendarCount:1,appliedCount:chosen.length,
  prayerGroupCount:low?2:1,principalId:ID,
  commemorationIds:Object.freeze(proof.observances.map(x=>x.id)),
  authorities:Object.freeze(["1960_GENERAL_RUBRICS_111_D",
   "1960_MISSAL_RUBRICS_434_D_437"]),
  calendarInventoryPreserved:true,
  supplementalRomanOrdoSource:JOHN
 });
 Object.assign(selected,{
  appliedCommemorations:Object.freeze([...chosen]),
  omittedCommemorations:Object.freeze([...omitted]),
  commemorationFormDecision:decision
 });
 return Object.freeze({status:"CERTIFIED",reason:null,decision,
  proper:proper?.data&&typeof proper.data==="object"?
    Object.freeze({...proper,data:Object.freeze(selected)}):Object.freeze(selected)});
}
