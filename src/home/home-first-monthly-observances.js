// Calendar-driven First Friday and First Saturday invitations for Home.
// Presentation only: the canonical Prayer programmes own their texts, acts and
// optional tracking; no automatic completion or invented liturgical obligation.
const validIso=value=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value??"")))return false;
 const d=new Date(value+"T12:00:00Z");
 return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10)===value;
};
const dayNumber=value=>Date.parse(value+"T12:00:00Z")/86400000;
const iso=(year,month,day)=>year+"-"+String(month).padStart(2,"0")+"-"+String(day).padStart(2,"0");
const firstWeekday=(year,month,weekday)=>{
 const first=new Date(Date.UTC(year,month-1,1,12)).getUTCDay();
 return iso(year,month,1+(weekday-first+7)%7);
};
export const HOME_FIRST_MONTHLY_OBSERVANCES=Object.freeze([
 Object.freeze({
  id:"FIRST_FRIDAY",weekday:5,route:"programme.first_friday",
  title:Object.freeze({en:"First Friday · Sacred Heart",fr:"Premier vendredi · Sacré-Cœur"}),
  description:Object.freeze({en:"Reparatory Communion and prayer",fr:"Communion réparatrice et prière"})
 }),
 Object.freeze({
  id:"FIRST_SATURDAY",weekday:6,route:"programme.first_saturday",
  title:Object.freeze({en:"First Saturday · Immaculate Heart",fr:"Premier samedi · Cœur Immaculé"}),
  description:Object.freeze({en:"Rosary, meditation and reparation",fr:"Rosaire, méditation et réparation"})
 })
]);
export function homeFirstMonthlyObservancesForDate(date,{leadDays=7}={}){
 if(!validIso(date))return Object.freeze([]);
 const year=Number(date.slice(0,4)),month=Number(date.slice(5,7));
 const matches=[];
 for(let offset=0;offset<=1;offset++){
  const total=year*12+(month-1)+offset;
  const y=Math.floor(total/12),m=total%12+1;
  for(const entry of HOME_FIRST_MONTHLY_OBSERVANCES){
   const target=firstWeekday(y,m,entry.weekday);
   const daysUntil=Math.round(dayNumber(target)-dayNumber(date));
   if(daysUntil<0||daysUntil>leadDays)continue;
   matches.push(Object.freeze({...entry,date:target,daysUntil}));
  }
 }
 matches.sort((a,b)=>a.daysUntil-b.daysUntil||a.weekday-b.weekday);
 return Object.freeze(matches);
}
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
export function renderHomeFirstMonthlyObservances(entries,language="en"){
 const fr=language==="fr",loc=fr?"fr":"en";
 return (entries??[]).map(entry=>{
  if(!HOME_FIRST_MONTHLY_OBSERVANCES.some(x=>x.id===entry?.id&&x.route===entry?.route)||
      !validIso(entry.date))return "";
  const due=entry.daysUntil===0?(fr?"Aujourd’hui":"Today"):(fr?"À venir":"Coming up");
  const dateLabel=new Intl.DateTimeFormat(fr?"fr-FR":"en-GB",{day:"numeric",month:"short"}).format(new Date(entry.date+"T12:00:00Z"));
  return '<button type="button" class="aoH4Custom aoH4Monthly" data-home-monthly-route="'+esc(entry.route)+'" data-home-observance-date="'+esc(entry.date)+'">'+
   '<span class="aoH4Eyebrow">'+esc(due)+'</span><strong>'+esc(entry.title[loc])+'</strong>'+
   '<small>'+esc(dateLabel+' · '+entry.description[loc])+'</small></button>';
 }).join("");
}
