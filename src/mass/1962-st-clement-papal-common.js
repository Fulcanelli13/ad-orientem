import witness from "../../data/mass/1962-st-clement-papal-common-nov23.v1.json" with {type:"json"};

// Exact 1962 Roman source correction: the old pinned host retains the
// pre-1942 St Clement Secret and Postcommunion. The 1962 Missal instead
// uses the Sovereign Pontiffs Common. This is not a translation fallback
// and cannot be inferred from a calendar date alone.
export const CLEMENT_1962_SOURCE_SCHEMA=witness.schema;
const norm=value=>String(value??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/[æǽ]/g,"ae").replace(/[œ]/g,"oe")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const complete=row=>Boolean(row&&["lat","en","fr"].every(
 key=>String(row[key]??"").trim()));
const legacyMatch=(row,phrase)=>norm(row?.lat??row?.la)
 .startsWith(norm(phrase));

export function recover1962StClementPapalCommon({
 data,calendarDate,principalCelebrationId
}={}){
 if(calendarDate!==witness.date||
   principalCelebrationId!==witness.principalId||
   data?.principalCelebrationId&&data.principalCelebrationId!==witness.principalId||
   data?.sourcePath!==witness.principalPath||
   data?.calendarCommemorations?.length!==1||
   data.calendarCommemorations[0]?.path!==witness.commemorationPath||
   data.calendarCommemorations[0]?.prayerSourcePath!==witness.commemorationPath||
   data?.appliedCommemorations?.length||data?.omittedCommemorations?.length)return null;
 if(!Array.isArray(data.collects)||data.collects.length!==2||
   !data.collects.every(complete))return null;
 const replacements={};
 for(const key of ["secrets","postcommunions"]){
   const source=data[key],corrected=witness.recoveredPrayers[key];
   if(!Array.isArray(source)||source.length!==2||
     !complete(source[1])||!String(source[0]?.en??"").trim()||
     String(source[0]?.fr??"").trim()||
     !legacyMatch(source[0],corrected.legacyLatinIncipit)||
     !complete(corrected))return null;
   replacements[key]=Object.freeze([
     Object.freeze({...source[0],lat:corrected.lat,en:corrected.en,fr:corrected.fr,
       sourcePath:"1962/Commune/SummorumPontificum",
       sourceSection:key==="secrets"?"Secreta":"Postcommunio",
       sourceCorrectionId:CLEMENT_1962_SOURCE_SCHEMA}),
     source[1]
   ]);
 }
 return Object.freeze({...data,
   secrets:replacements.secrets,secret:replacements.secrets[0],
   postcommunions:replacements.postcommunions,
   postcommunion:replacements.postcommunions[0],
   sourceEditorialCorrections:Object.freeze([
     ...(data.sourceEditorialCorrections??[]),
     Object.freeze({id:"1962_CLEMENT_PAPAL_COMMON_1942_EDIT",
       schema:CLEMENT_1962_SOURCE_SCHEMA,
       scope:"EXACT_2026_NOV23_SOURCE_OWNER",
       originalPrincipalSourcePreserved:true,
       felicityCommemorationUnchanged:true,
       prayerSource1962:"COMMON_OF_SOVEREIGN_PONTIFFS",
       correctedFields:Object.freeze(["secrets[0]","postcommunions[0]"]),
       originalPre1942WordingExcluded:true,
       authorities:witness.authority})
   ])
 });
}
