/**
 * Presentation-only devotional progression. The prayer donor owns the words
 * and navigation; the First Friday/Saturday programme owns private records.
 * None of these visual states certifies sacramental or devotional conditions.
 */
export const QUIET_DEVOTIONAL_PROGRESSION_VERSION="2026-10-18-v1";
const HORIZONS=Object.freeze({
 morning:Object.freeze([
  ["Predawn","Avant l’aube","#111b29","#283440","#50494a","#916b60"],
  ["First light","Premières lueurs","#202d3b","#4b535d","#716960","#ac8773"],
  ["Dawn","Aube","#374652","#717a79","#978979","#c1a181"],
  ["Morning","Matin","#53616a","#848d8b","#aba297","#b7a990"],
  ["Daylight","Jour","#69757a","#9ca3a0","#b4b1a8","#aea99b"]
 ]),
 evening:Object.freeze([
  ["Dusk","Crépuscule","#414b5b","#777178","#977b71","#a88978"],
  ["Last light","Dernières lueurs","#303b51","#5d6175","#836e75","#977781"],
  ["Blue hour","Heure bleue","#1c2b42","#39455d","#5b596c","#6f6c81"],
  ["Nightfall","Tombée de la nuit","#131f33","#29384b","#3d4858","#48566f"],
  ["Night","Nuit","#0d1729","#1c293b","#2b384b","#303e55"]
 ])
});
// Continuously interpolate the five editorial sky palettes. The label remains
// a five-part meditation, but *every* real prayer step alters the atmosphere.
// No clock, animation frame or source-sequence ID is involved.
function interpolateSkyColour(start,end,amount){
 const a=[1,3,5].map(i=>parseInt(start.slice(i,i+2),16));
 const b=[1,3,5].map(i=>parseInt(end.slice(i,i+2),16));
 return "#"+a.map((value,i)=>Math.round(value+(b[i]-value)*amount).toString(16).padStart(2,"0")).join("");
}
export function dailyHorizonState(daypart,step,total){
 if(!Object.hasOwn(HORIZONS,daypart))throw new RangeError("Invalid daily prayer");
 if(!Number.isInteger(total)||total<1)throw new RangeError("Invalid prayer length");
 const position=Math.max(0,Math.min(total,Number.isFinite(step)?Math.trunc(step):0));
 const fraction=position/total;
 const phase=Math.min(4,Math.floor(position*5/total));
 const palette=HORIZONS[daypart];
 const [en,fr]=palette[phase];
 const track=fraction*4,lower=Math.min(4,Math.floor(track)),upper=Math.min(4,lower+1);
 const blend=track-lower;
 const colours=[2,3,4,5].map(i=>interpolateSkyColour(palette[lower][i],palette[upper][i],blend));
 const [top,mid,low,light]=colours;
 return Object.freeze({daypart,phase,step:position,total,en,fr,top,mid,low,light,fraction});
}
function monthNumber(key){
 const m=String(key??"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
 if(!m)return null;
 const year=Number(m[1]),month=Number(m[2]),day=Number(m[3]);
 if(year<1800||year>2200||month<1||month>12||day<1||day>31)return null;
 const date=new Date(Date.UTC(year,month-1,day));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
 return year*12+month-1;
}
const monthDate=n=>new Date(Date.UTC(Math.floor(n/12),n%12,1));
export function monthlyDevotionalRegister(records,{needed=9,selectedDate=""}={}){
 if(![5,9].includes(needed))throw new RangeError("Unsupported month series");
 const entries=new Map();
 for(const rec of Array.isArray(records)?records:[]){
  const number=monthNumber(rec?.date);
  if(number===null||typeof rec.complete!=="boolean")continue;
  entries.set(number,{date:rec.date,complete:rec.complete,confessionDate:rec.confessionDate||null});
 }
 const recorded=[...entries.keys()].sort((a,b)=>a-b),latest=recorded.at(-1);
 const selected=monthNumber(selectedDate);
 const anchor=latest??selected??new Date().getUTCFullYear()*12+new Date().getUTCMonth();
 let streak=0;
 if(latest!==undefined&&entries.get(latest)?.complete){
  while(streak<needed&&entries.get(latest-streak)?.complete===true)streak++;
 }
 // An explicitly interrupted sequence must still show the preceding
 // recorded months beside the interruption. Do not erase the visual history.
 let preceding=0;
 if(latest!==undefined&&entries.get(latest)?.complete===false){
  while(preceding<needed-1&&entries.get(latest-preceding-1)?.complete===true)preceding++;
 }
 const start=streak?latest-streak+1:anchor-preceding;
 const cells=Array.from({length:needed},(_,index)=>{
  const month=start+index,rec=entries.get(month),status=rec?(rec.complete?"recorded":"incomplete"):"unrecorded";
  const date=monthDate(month),key=date.toISOString().slice(0,7);
  return Object.freeze({month,key,year:date.getUTCFullYear(),status,index,
   date:rec?.date??null});
 });
 return Object.freeze({needed,streak,lastRecorded:latest===undefined?null:monthDate(latest).toISOString().slice(0,7),
  interrupted:latest!==undefined&&entries.get(latest)?.complete===false,
  cells:Object.freeze(cells),hasReports:recorded.length>0});
}
