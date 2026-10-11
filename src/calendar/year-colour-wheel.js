// Canonical palette-driven illustration of an Advent-to-Advent year.
// The inner track represents seasons; the outer track ONLY verified daily
// observances from the Calendar's existing 1962 resolver (never guessed feast
// colours from the seasonal model). Unavailable days remain visibly neutral.
import { addDaysIso } from "./liturgical-year.js";
import { calendarMassColour } from "./colour-projection.js";
import { MASS_LITURGICAL_PALETTES, normalizeMassLiturgicalColour } from "../mass/reader-liturgical-theme.js";

const PALETTES=MASS_LITURGICAL_PALETTES;
const VALID=new Set(["WHITE","RED","GREEN","VIOLET","ROSE","BLACK","GOLD"]);
const NORMAL_COLOUR=PALETTES.NEUTRAL.accent;
export const unresolvedYearColour=PALETTES.NEUTRAL.panel;
export function calendarPaletteColour(value){
  const key=normalizeMassLiturgicalColour(value);
  return key&&VALID.has(key)?PALETTES[key].accent:NORMAL_COLOUR;
}
export function resolvedYearColour(row,date){
  if(!row||row.date!==date||row.status==="failed"||!row.day?.main)return null;
  const key=normalizeMassLiturgicalColour(calendarMassColour(row));
  return key&&VALID.has(key)?key:null;
}
export function yearDayColours(year,getDay){
  if(!year?.totalDays||typeof getDay!=="function")return [];
  return Array.from({length:year.totalDays},(_,index)=>{
    const date=addDaysIso(year.start,index);
    return {date,colour:resolvedYearColour(getDay(date),date)};
  });
}
function bandRuns(values){
  const runs=[];
  values.forEach((value,index)=>{
    if(runs.length&&runs.at(-1).value===value)runs.at(-1).end=index+1;
    else runs.push({value,start:index,end:index+1});
  });
  return runs;
}
function cssGradient(values,{shape="conic",unresolved=unresolvedYearColour}={}){
  if(!values.length)return "none";
  const total=values.length;
  const stops=bandRuns(values).map(run=>{
    const color=run.value?calendarPaletteColour(run.value):unresolved;
    const span=shape==="linear"?100:360;
    return color+" "+(span*run.start/total).toFixed(4)+(shape==="linear"?"%":"deg")+" "+(span*run.end/total).toFixed(4)+(shape==="linear"?"%":"deg");
  }).join(",");
  return shape==="linear"?"linear-gradient(to right,"+stops+")":"conic-gradient(from -90deg,"+stops+")";
}
export function yearDailyProjection(year,getDay){
  const days=yearDayColours(year,getDay);
  const values=days.map(d=>d.colour);
  const verified=values.filter(Boolean).length;
  return Object.freeze({verified,total:days.length,complete:verified===days.length,
    gradient:cssGradient(values),timeline:cssGradient(values,{shape:"linear"}),
    selected:days[year.dayIndex-1]?.colour||null});
}
export function yearSeasonGradient(year){
  if(!year?.periods?.length)return "none";
  const values=year.periods.flatMap(p=>Array(p.days).fill(p.color));
  if(values.length!==year.totalDays)throw Error("Year season boundaries are not contiguous");
  return cssGradient(values);
}
export function yearSeasonBands(year){
  return (year?.periods||[]).map(p=>({
    ...p,colour:calendarPaletteColour(p.color),
    duration:p.days
  }));
}
