/* Source-bound, vector Liturgical Clock. 1962 day resolver remains authoritative. */
import { buildMajorCelebrations, addDaysIso } from "./liturgical-year.js";
import { calendarPaletteColour } from "./year-colour-wheel.js";
import { SEASON_GUIDE } from "./year-journey.js";

const E=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const L=(fr,en,french)=>fr?french:en;
const GROUPS=Object.freeze([
 ["advent",["advent"],"Advent","Avent"],
 ["christmas",["christmas","epiphany"],"Christmas","Noël"],
 ["after-epiphany",["after-epiphany"],"After Epiphany","Après l’Épiphanie"],
 ["septuagesima",["septuagesima"],"Septuagesima","Septuagésime"],
 ["lent",["lent","passion"],"Lent & Passiontide","Carême et Passion"],
 ["easter",["easter","ascension"],"Eastertide","Temps pascal"],
 ["pentecost",["pentecost"],"Pentecost","Pentecôte"],
 ["after-pentecost",["after-pentecost"],"After Pentecost","Après la Pentecôte"]
]);
// The source year already curates celebration candidates. Do not maintain
// a second, incomplete feast-name whitelist here: it omitted the Annunciation,
// Advent and Lenten Sundays, Trinity Sunday and the Holy Week ferias. A candidate
// is a resolver work item ONLY, never permission to display a feast marker.
const diffDays=(a,b)=>Math.round((Date.parse(b+"T12:00:00Z")-Date.parse(a+"T12:00:00Z"))/86400000);
const angle=(year,date)=>-90+(diffDays(year.start,date)+.5)*360/year.totalDays;
const rad=a=>a*Math.PI/180;
const point=(r,a,c=300)=>[c+r*Math.cos(rad(a)),c+r*Math.sin(rad(a))];
const n=x=>Number(x).toFixed(3);
function arc(outer,inner,start,end){
 const [x1,y1]=point(outer,start),[x2,y2]=point(outer,end),[x3,y3]=point(inner,end),[x4,y4]=point(inner,start);
 const large=end-start>180?1:0;
 return "M"+n(x1)+" "+n(y1)+" A"+outer+" "+outer+" 0 "+large+" 1 "+n(x2)+" "+n(y2)
  +" L"+n(x3)+" "+n(y3)+" A"+inner+" "+inner+" 0 "+large+" 0 "+n(x4)+" "+n(y4)+" Z";
}
function lineAt(a,r1,r2){
 const p=point(r1,a),q=point(r2,a);
 return "M"+n(p[0])+" "+n(p[1])+" L"+n(q[0])+" "+n(q[1]);
}
function groupPeriods(year){
 return GROUPS.map(([id,parts,en,fr])=>{
  const periods=year.periods.filter(p=>parts.includes(p.id));
  return {id,en,fr,start:periods[0].start,end:periods.at(-1).end,color:periods[0].color,periods};
 });
}
function months(year,fr){
 let id=year.start.slice(0,7),out=[];
 const end=year.end.slice(0,7);
 while(id<=end){
  const [yy,mm]=id.split("-").map(Number);
  const first=yy+"-"+String(mm).padStart(2,"0")+"-01";
  const next=mm===12?(yy+1)+"-01-01":yy+"-"+String(mm+1).padStart(2,"0")+"-01";
  const start=first<year.start?year.start:first,finish=addDaysIso(next,-1)>year.end?year.end:addDaysIso(next,-1);
  if(start<=finish)out.push({id,start,end:finish,days:diffDays(start,finish)+1,
    name:new Date(first+"T12:00:00Z").toLocaleDateString(fr?"fr-FR":"en-GB",{month:"short",timeZone:"UTC"}).replace(".","").toUpperCase()});
  id=next.slice(0,7);
 }
 return out;
}
export function clockGeometry(year,fr=false){
 const groups=groupPeriods(year),bounds=groups.map(g=>({...g,startAngle:angle(year,g.start)-180/year.totalDays,
   endAngle:angle(year,g.end)+180/year.totalDays}));
 return {groups:bounds,months:months(year,fr)};
}
export function clockCandidates(year){
 const seen=new Set();
 return buildMajorCelebrations(year.start).filter(c=>{
  if(seen.has(c.date))return false;
  seen.add(c.date);return true;
 });
}
export function orderedClockCandidateDates(year,activeDate){
 const pivot=activeDate>=year.start&&activeDate<=year.end?activeDate:year.start;
 // Prioritise upcoming dates and recent feasts before last year's Advent.
 // This only changes preload order, never the resolver's source adjudication.
 const priority=id=>{
  const delta=diffDays(pivot,id);
  return delta>=0?delta:120-delta;
 };
 return clockCandidates(year).map(c=>c.date).sort((a,b)=>priority(a)-priority(b)||a.localeCompare(b));
}
function verified(row,date){return !!(row&&row.date===date&&row.status!=="failed"&&row.day?.main)}
// The candidate list is only a work queue. A marker is admitted solely by
// the *resolved principal Mass* and its actual 1962 first/second-class rank.
function resolvedClassTier(value){
 const rank=String(value??"").trim().toLowerCase();
 // The 1962 class may be written I Class, Classis I, Classe I, or as a
 // French ordinal. Rank parsing never substitutes for day resolution.
 const bare=rank.replace(/^(?:classis|class|classe)\s+|\s+(?:classis|class|classe)$/g,"").trim();
 if(bare==="i"||bare==="1")return 1;
 if(bare==="ii"||bare==="2")return 2;
 if(/\b(?:i|1st|first|1re|1ère|première|1)\s*(?:class|classe|classis)\b/.test(rank))return 1;
 if(/\b(?:ii|2nd|second|2e|2ème|deuxième|2)\s*(?:class|classe|classis)\b/.test(rank))return 2;
 return 0;
}
export function resolvedClockFeasts(year,getDay,titleFor,rankFor=()=>"",colourFor=()=> ""){
 const seen=new Set(),output=[];
 for(const candidate of clockCandidates(year)){
  const row=getDay(candidate.date);
  if(!verified(row,candidate.date)||seen.has(candidate.date))continue;
  const rank=String(rankFor(row)??""),grade=resolvedClassTier(rank),title=String(titleFor(row)??"").trim();
  if(!grade||!title)continue;
  seen.add(candidate.date);
  // A projected transferredFrom field is not evidence of the observed
  // principal feast's actual transfer. Only the resolver may provide it.
  const {transferredFrom:_projected,...hint}=candidate;
  const sourceTransfer=row.day?.main?.transferredFrom??row.proper?.data?.transferredFrom;
  const transferredFrom=/^\d{4}-\d{2}-\d{2}$/.test(String(sourceTransfer??""))&&sourceTransfer!==candidate.date?sourceTransfer:null;
  output.push({...hint,title,rank,colour:colourFor(row),
   tier:grade===1?"principal":"significant",...(transferredFrom?{transferredFrom}:{})});
 }
 return output;
}
// A week of adjacent celebrations occupies only a few pixels of the circular bezel.
// Collect nearby verified feasts rather than stacking unreadable, overlapping dots.
export function clockMarkerClusters(feasts,withinDays=4){
 const result=[];
 for(const feast of [...feasts].sort((a,b)=>a.date.localeCompare(b.date))){
  const cluster=result.at(-1);
  // Compare with the FIRST date, not the last. Chaining successive Holy
  // Week dates used to merge 12 separate feasts across three weeks into one
  // inaccessible ornament. Bound each visual cluster to a compact date span.
  if(cluster&&cluster.length<5&&diffDays(cluster[0].date,feast.date)<=withinDays)cluster.push(feast);
  else result.push([feast]);
 }
 return result;
}
// A later verified jewel is not necessarily the *next* observance: earlier
// source-candidate dates may still be unresolved. Stop at the first unknown
// date; resolved lower-class dates may safely be skipped.
export function nextVerifiedClockFeast(year,activeDate,getDay,feasts){
 const byDate=new Map(feasts.map(f=>[f.date,f]));
 for(const candidate of clockCandidates(year)){
  if(candidate.date<=activeDate)continue;
  const row=getDay(candidate.date);
  if(!verified(row,candidate.date))return null;
  const observed=byDate.get(candidate.date);
  if(observed)return observed;
 }
 return null;
}
function shortDate(date,fr){return new Date(date+"T12:00:00Z").toLocaleDateString(fr?"fr-FR":"en-GB",{day:"numeric",month:"short",timeZone:"UTC"});}
function longDate(date,fr){return new Date(date+"T12:00:00Z").toLocaleDateString(fr?"fr-FR":"en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"});}
function weekday(date,fr){return new Date(date+"T12:00:00Z").toLocaleDateString(fr?"fr-FR":"en-GB",{weekday:"long",timeZone:"UTC"});}
function detailHtml({selection,year,feasts,fr}){
 if(!selection)return "";
 if(selection.type==="cluster"){
  const cluster=clockMarkerClusters(feasts).find(items=>items.length>1&&items.some(f=>f.date===selection.date));
  if(cluster){
  const label=L(fr,"Adjacent major celebrations","Fêtes majeures rapprochées");
  return '<section class="aoClockDetail" aria-label="'+E(label)+'">'
    +'<div class="aoClockDetailTop"><span>'+E(label.toUpperCase())+'</span><button type="button" data-cal-clock-close aria-label="'+E(L(fr,"Close details","Fermer le détail"))+'">×</button></div>'
    +'<h3>'+E(shortDate(cluster[0].date,fr)+" – "+shortDate(cluster.at(-1).date,fr))+'</h3>'
    +'<div class="aoClockDetailFeasts">'+cluster.map(f=>'<button type="button" data-cal-clock-feast="'+E(f.date)+'"><small>'+E(shortDate(f.date,fr))+'</small><strong>'+E(f.title)+'</strong></button>').join("")+'</div></section>';
  }
 }
 if(selection.type==="season"){
  const g=groupPeriods(year).find(p=>p.id===selection.id);
  if(!g)return "";
  const labels=g.periods.map(p=>{const d=SEASON_GUIDE[p.id];return d?.meaning?.[fr?1:0]||p[fr?"fr":"en"]});

  return '<section class="aoClockDetail" aria-label="'+E(L(fr,"Season detail","Détail du temps"))+'">'
   +'<div class="aoClockDetailTop"><span>'+E(L(fr,"LITURGICAL SEASON","TEMPS LITURGIQUE"))+'</span><button type="button" data-cal-clock-close aria-label="'+E(L(fr,"Close details","Fermer le détail"))+'">×</button></div>'
   +'<h3>'+E(g[fr?"fr":"en"])+'</h3><small>'+E(longDate(g.start,fr))+' – '+E(longDate(g.end,fr))+'</small>'
   +'<p>'+E(labels.join(" · "))+'</p>'

   +'</section>';
 }
 // A cluster may become a single jewel when earlier source dates load.
 // Retain the requested observed feast instead of silently closing its detail.
 if(selection.type==="feast"||selection.type==="cluster"){
  const feast=feasts.find(f=>f.date===selection.date);
  if(!feast)return "";
  return '<section class="aoClockDetail" aria-label="'+E(L(fr,"Feast detail","Détail de la fête"))+'">'
   +'<div class="aoClockDetailTop"><span>'+E(L(fr,"OBSERVED CELEBRATION","CÉLÉBRATION OBSERVÉE"))+'</span><button type="button" data-cal-clock-close aria-label="'+E(L(fr,"Close details","Fermer le détail"))+'">×</button></div>'
   +'<h3>'+E(feast.title)+'</h3><small>'+E(longDate(feast.date,fr))+'</small>'
   +'<p class="aoClockDetailMeta">'+E([feast.rank,feast.colour].filter(Boolean).join(" · ")||L(fr,"1962 principal observance","Observance principale du calendrier de 1962"))+'</p>'
   +(feast.transferredFrom?'<p>'+E(L(fr,"Transferred from","Transférée du"))+' '+E(longDate(feast.transferredFrom,fr))+'</p>':"")
   +'<button class="aoClockPrimary" type="button" data-cal-clock-open-day="'+E(feast.date)+'">'+E(L(fr,"Open this day","Ouvrir ce jour"))+' →</button></section>';
 }
 return "";
}
export function renderLiturgicalClock({
 year,selectedDate,todayDate,fr=false,getDay=()=>null,titleFor=()=>"",rankFor=()=>"",massColourFor=()=>"",
 selection=null,nextMajor=null
}={}){
 if(!year)return "";
 const geom=clockGeometry(year,fr),feasts=resolvedClockFeasts(year,getDay,titleFor,rankFor,massColourFor);
 const activeDate=selectedDate>=year.start&&selectedDate<=year.end?selectedDate:year.start;
 const row=getDay(activeDate),ready=verified(row,activeDate),activePeriod=year.periods.find(p=>p.start<=activeDate&&p.end>=activeDate);
 const activeGroup=geom.groups.find(g=>g.periods.some(p=>p.id===activePeriod?.id));
 const centerTitle=ready?titleFor(row):L(fr,"Observance loading","Observance en attente");
 const rank=ready?rankFor(row):"";
 const seasonPaths=geom.groups.map(g=>{
  const start=angle(year,g.start)-180/year.totalDays,end=angle(year,g.end)+180/year.totalDays;
  const mid=(start+end)/2,xy=point(205,mid),width=end-start;
  const selected=selection?.type==="season"&&selection.id===g.id;
  const font=g.id==="advent"?19:width<48?20:22;
  const label=(g.id==="advent"||width>=32)?'<text class="aoClockSeasonText" x="'+n(xy[0])+'" y="'+n(xy[1])+'" style="font-size:'+font+'px" text-anchor="middle" dominant-baseline="central" transform="rotate('+(mid>0&&mid<180?mid-90:mid+90)+' '+n(xy[0])+' '+n(xy[1])+')">'+E(({advent:["ADVENT","AVENT"],christmas:["CHRISTMAS","NOËL"],"after-epiphany":["EPIPHANY","ÉPIPHANIE"],septuagesima:["PRE-LENT","SEPTUAGÉSIME"],lent:["LENT","CARÊME"],easter:["EASTER","PÂQUES"],pentecost:["PENTECOST","PENTECÔTE"],"after-pentecost":["AFTER PENTECOST","APRÈS PENTECÔTE"]})[g.id][fr?1:0])+'</text>':"";
  return '<g class="aoClockSector'+(selected?' aoClockSectorSelected':'')+'" data-cal-clock-season="'+E(g.id)+'" role="button" tabindex="0" aria-label="'+E(g[fr?"fr":"en"])+'" aria-pressed="'+selected+'">'
   +'<path d="'+arc(250,160,start,end)+'" fill="'+E(calendarPaletteColour(g.color))+'"/><path d="'+arc(250,160,start,end)+'" fill="url(#aoClockTracery)" opacity=".42" pointer-events="none"/>'+label+'</g>';
 }).join("");
 const subdivisions=year.periods.slice(1).map(p=>'<path class="aoClockSubdivision" d="'+lineAt(angle(year,p.start)-180/year.totalDays,160,249)+'"/>').join("");
 const monthParts=geom.months.map(m=>{
  const a=angle(year,m.start)-180/year.totalDays,b=angle(year,m.end)+180/year.totalDays;
  const mid=(a+b)/2,xy=point(274,mid),wide=b-a;
  return '<path d="'+arc(290,261,a,b)+'" class="aoClockMonthSegment"/>'
   +(wide>10?'<text x="'+n(xy[0])+'" y="'+n(xy[1])+'" text-anchor="middle" dominant-baseline="central" transform="rotate('+(mid>0&&mid<180?mid-90:mid+90)+' '+n(xy[0])+' '+n(xy[1])+')" class="aoClockMonthLabel">'+E(m.name)+'</text>':"");
 }).join("");
 const markers=clockMarkerClusters(feasts).map(cluster=>{
  const multiple=cluster.length>1;
  const first=cluster[0],central=cluster[Math.floor(cluster.length/2)];
  const xy=point(255,angle(year,central.date));
  const selected=(selection?.type==="cluster"||selection?.type==="feast")
    &&cluster.some(f=>f.date===selection.date);
  const attr=multiple?'data-cal-clock-cluster="'+E(first.date)+'" data-cal-clock-cluster-members="'+E(cluster.map(f=>f.date).join(","))+'"':'data-cal-clock-feast="'+E(first.date)+'"';
  const label=multiple?L(fr,cluster.length+" nearby major celebrations",cluster.length+" grandes fêtes rapprochées")+" · "+cluster.map(f=>shortDate(f.date,fr)+" "+f.title).join("; ")
    :longDate(first.date,fr)+": "+first.title;
  const radius=multiple?10:first.tier==="principal"?7.1:4.4;
  return '<g '+attr+' role="button" tabindex="0" class="aoClockFeast'+(selected?' active':'')+'" aria-label="'+E(label)+'" aria-pressed="'+Boolean(selected)+'"><circle cx="'+n(xy[0])+'" cy="'+n(xy[1])+'" r="18" fill="transparent"/>'
   +'<circle cx="'+n(xy[0])+'" cy="'+n(xy[1])+'" r="'+radius+'" class="'+(multiple?'aoClockMarkerCluster':first.tier==="principal"?'aoClockMarkerPrincipal':'aoClockMarkerOther')+'"/>'
   +(multiple?'<text x="'+n(xy[0])+'" y="'+n(xy[1]+3.3)+'" font-size="10.5" text-anchor="middle" class="aoClockClusterCount">'+cluster.length+'</text>':"")+'</g>';
 }).join("");
 const pointerAngle=angle(year,activeDate),p1=point(145,pointerAngle),p2=point(291,pointerAngle);
 const todayInYear=todayDate>=year.start&&todayDate<=year.end;
 const t=point(294,angle(year,todayDate));
 const first=geom.groups.find(g=>g.start>activeDate);
 const observedNext=nextVerifiedClockFeast(year,activeDate,getDay,feasts);
 // The Calendar's independent next-major scan is allowed only when it has
 // returned source-confirmed evidence for the proposed date.
 const explicit=nextMajor?.verified===true&&nextMajor.date>activeDate
  ?{date:nextMajor.date,title:nextMajor.title||nextMajor.en||nextMajor.fr}:null;
 const feast=explicit&&(!observedNext||explicit.date<=observedNext.date)?explicit
  :observedNext?{date:observedNext.date,title:observedNext.title}:null;
 const upcoming=feast?[feast]:[];
 const season=first?{date:first.start,title:first[fr?"fr":"en"]}:{date:addDaysIso(year.end,1),title:L(fr,"Advent","Avent")};
 if(season)upcoming.push(season);
 const cards=upcoming.slice(0,3).map(c=>'<button type="button" data-cal-clock-open-day="'+E(c.date)+'"><small>'+E(shortDate(c.date,fr))+'</small><strong>'+E(c.title)+'</strong></button>').join("");
 return '<section class="aoClock" data-ao-liturgical-clock="v1" aria-label="'+E(L(fr,"Liturgical Clock","Horloge liturgique"))+'">'
  +'<div class="aoClockHeader"><div class="aoClockYearIdentity"><small>1962</small></div>'
  +'<div class="aoClockYearNav"><button type="button" data-cal-clock-year="-1" aria-label="'+E(L(fr,"Previous liturgical year","Année liturgique précédente"))+'">‹</button><strong>'+E(year.label)+'</strong><button type="button" data-cal-clock-year="1" aria-label="'+E(L(fr,"Next liturgical year","Année liturgique suivante"))+'">›</button></div>'
  +(todayDate>=year.start&&todayDate<=year.end?"":'<button type="button" class="aoClockReturnToday" data-cal-clock-today>'+E(L(fr,"Today","Aujourd’hui"))+'</button>')+'</div>'
  +'<div class="aoClockMain"><div class="aoClockDial"><svg viewBox="0 0 600 600" role="group" aria-label="'+E(L(fr,"Liturgical seasons and verified major celebrations","Temps liturgiques et grandes célébrations vérifiées"))+'">'
  +'<defs><radialGradient id="aoClockGold" cx=".5" cy=".5"><stop offset="0" stop-color="var(--liturgical)"/><stop offset=".65" stop-color="var(--liturgical)"/><stop offset="1" stop-color="var(--liturgical)"/></radialGradient><pattern id="aoClockTracery" width="42" height="56" patternUnits="userSpaceOnUse"><path d="M21 -4 Q23 12 21 28 Q19 45 21 60 M21 16 Q2 11 7 2 Q18 0 21 16 M21 32 Q42 26 38 17 Q25 16 21 32 M21 49 Q2 42 6 35 Q17 34 21 49" fill="none" stroke="var(--liturgical)" stroke-width="1.25"/><circle cx="21" cy="28" r="2" fill="var(--liturgical)"/></pattern></defs>'
  +'<circle cx="300" cy="300" r="297" fill="none" stroke="var(--liturgical)" stroke-width="1.5"/><circle cx="300" cy="300" r="258" fill="none" stroke="var(--liturgical)" stroke-width="2"/>'
  +monthParts+seasonPaths+subdivisions
  +'<circle cx="300" cy="300" r="157" fill="var(--bg)" stroke="var(--liturgical)" stroke-width="3"/><circle cx="300" cy="300" r="147" fill="none" stroke="var(--liturgical)" stroke-width="1"/>'
  +'<path d="'+lineAt(pointerAngle,147,289)+'" class="aoClockPointer"/><circle cx="'+n(p2[0])+'" cy="'+n(p2[1])+'" r="9" fill="var(--liturgical)" stroke="var(--bg)" stroke-width="3" class="aoClockPointerTip"/>'
  +(todayInYear&&todayDate!==activeDate?'<circle cx="'+n(t[0])+'" cy="'+n(t[1])+'" r="4" fill="var(--text)" stroke="var(--bg)" stroke-width="1.5"/>':"")
  +markers+'</svg>'
  +'<button type="button" class="aoClockCore" data-cal-clock-open-day="'+E(activeDate)+'" aria-label="'+E(L(fr,"Open selected day","Ouvrir le jour choisi")+": "+longDate(activeDate,fr))+'">'
  +'<small>'+E(weekday(activeDate,fr))+'</small><strong>'+E(shortDate(activeDate,fr))+'</strong><span class="aoClockCoreRule"></span>'
  +'<span class="aoClockCoreFeast">'+E(centerTitle)+'</span>'+(rank?'<span class="aoClockCoreRank">'+E(rank)+'</span>':"")+'</button></div>'
  +(feasts.length?'<details class="aoClockFeastMenu"><summary>'+E(L(fr,"Feast dates","Dates des fêtes"))+'</summary><nav aria-label="'+E(L(fr,"Verified feast selection","Choisir une fête confirmée"))+'">'
   +feasts.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(f=>'<button type="button" data-cal-clock-feast="'+E(f.date)+'"><small>'+E(shortDate(f.date,fr))+'</small><span>'+E(f.title)+'</span></button>').join("")+'</nav></details>':"")+'</div>'
  +(selection?detailHtml({selection,year,feasts,fr}):"")
  +(cards?'<section class="aoClockUpcoming"><h3>'+E(L(fr,"Coming next","À venir"))+'</h3><div>'+cards+'</div></section>':"")

  +'</section>';
}
export const liturgicalClockCss=[
'#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalModBody{width:min(960px,100%);padding-bottom:max(100px,calc(65px + var(--safe-bottom,0px)))}',
'.aoClock{color:var(--text);width:100%;max-width:880px;margin:0 auto;padding:12px 2px 28px}',
'.aoClockHeader{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}',
'.aoClockReturnToday{min-height:44px!important;background:transparent!important;border:0!important;color:var(--liturgical)!important;font:600 12px/1 var(--ao-font-ui,system-ui)}',
'.aoClockHeader small{display:block;color:var(--liturgical);font:600 10px/1.3 var(--ao-font-ui,system-ui);letter-spacing:.12em}',
'.aoClockYearNav{display:flex;align-items:center;gap:4px;border:1px solid var(--liturgical);border-radius:32px;padding:2px}',
'.aoClockYearNav strong{font:400 15px/1.3 Georgia,serif;white-space:nowrap;padding:0 4px}',
'.aoClockYearNav button{min-width:40px!important;min-height:40px!important;border:0!important;background:transparent!important;color:var(--liturgical)!important;padding:0!important;font-size:24px!important}',
'.aoClockMain{display:flex;width:100%;flex-direction:column;align-items:center;justify-content:center;margin:12px 0 6px}',
'.aoClockDial{position:relative;display:block;width:100%;max-width:min(490px,calc(100vw - 38px));min-width:0;aspect-ratio:1;flex:0 0 auto;filter:drop-shadow(0 13px 28px rgba(0,0,0,.38))}',
'.aoClockDial svg{display:block;width:100%;height:100%;overflow:visible}',
'.aoClockMonthSegment{stroke:var(--liturgical);stroke-width:1;fill:var(--bg)}',
'.aoClockMonthLabel{fill:var(--liturgical);font:500 14px Georgia,serif;pointer-events:none;letter-spacing:.07em}',
'.aoClockSector{cursor:pointer;outline:none}',
'.aoClockSector path{stroke:var(--liturgical);stroke-width:1.5;filter:saturate(.95) brightness(.81);transition:filter .2s}',
'.aoClockSector:focus-visible path,.aoClockSector:hover path,.aoClockSectorSelected path{filter:saturate(1.2) brightness(1.12);stroke:var(--liturgical);stroke-width:3}',
'.aoClockSeasonText{fill:var(--text);font:500 16px Georgia,serif;pointer-events:none;paint-order:stroke;stroke:var(--bg);stroke-width:2px;letter-spacing:.025em}',
'.aoClockSubdivision{stroke:var(--liturgical);stroke-width:1.5;stroke-opacity:.5;fill:none;pointer-events:none}',
'.aoClockPointer{fill:none;stroke:var(--liturgical);stroke-width:2.1;pointer-events:none}',
'.aoClockPointerTip{filter:drop-shadow(0 0 7px var(--liturgical));pointer-events:none}',
'.aoClockFeast{cursor:pointer;outline:none}',
'.aoClockMarkerPrincipal{fill:var(--liturgical);stroke:var(--liturgical);stroke-width:3;filter:drop-shadow(0 0 4px var(--liturgical))}',
'.aoClockMarkerOther{fill:var(--liturgical);stroke:var(--bg);stroke-width:1.5}',
'.aoClockFeast:hover .aoClockMarkerPrincipal,.aoClockFeast:focus-visible .aoClockMarkerPrincipal,.aoClockFeast.active .aoClockMarkerPrincipal,.aoClockFeast:hover .aoClockMarkerOther,.aoClockFeast:focus-visible .aoClockMarkerOther,.aoClockFeast.active .aoClockMarkerOther,.aoClockFeast:hover .aoClockMarkerCluster,.aoClockFeast:focus-visible .aoClockMarkerCluster,.aoClockFeast.active .aoClockMarkerCluster{stroke:var(--text);stroke-width:3.5;filter:drop-shadow(0 0 7px var(--liturgical))}',
'.aoClockCore{position:absolute;left:26%;top:26%;width:48%;height:48%;border-radius:50%!important;background:var(--bg)!important;border:0!important;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:20px!important;min-height:0!important;overflow:hidden;text-align:center;color:var(--text)!important}',
'.aoClockCore:hover,.aoClockCore:focus-visible{outline:2px solid var(--liturgical);outline-offset:-3px}',
'.aoClockCore small{font:400 clamp(9px,1.8vw,14px)/1.3 Georgia,serif;text-transform:uppercase;letter-spacing:.06em}',
'.aoClockCore strong{font:400 clamp(16px,3.9vw,31px)/1.2 Georgia,serif}',
'.aoClockCoreRule{height:1px;width:65%;background:linear-gradient(90deg,transparent,var(--liturgical),transparent);margin:7px 0}',
'.aoClockCoreFeast{font:400 clamp(10px,2.1vw,17px)/1.23 Georgia,serif;max-height:3.75em;overflow:hidden}',
'.aoClockDetail{max-width:650px;margin:0 auto 17px;padding:19px;border:1px solid var(--liturgical);border-radius:12px;background:linear-gradient(140deg,var(--bg),var(--bg) 60%);box-shadow:0 14px 28px rgba(0,0,0,.2)}',
'.aoClockDetailTop{display:flex;justify-content:space-between;align-items:center;gap:10px;font:600 10px/1.3 var(--ao-font-ui,system-ui);letter-spacing:.12em;color:var(--liturgical)}',
'.aoClockDetailTop button{font-size:21px!important;min-width:42px!important;min-height:42px!important;padding:0!important;background:transparent!important;border:0!important}',
'.aoClockDetail h3{font:400 27px/1.24 Georgia,serif;margin:6px 0;color:var(--text)}',
'.aoClockDetail>small{color:var(--muted);font-size:13px}',
'.aoClockDetail p{color:var(--muted);font:400 15px/1.55 Georgia,serif;margin:12px 0}',
'.aoClockDetailFeasts{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}.aoClockDetailFeasts strong{width:100%;color:var(--liturgical);font:600 11px/1.4 var(--ao-font-ui,system-ui)}.aoClockDetailMeta{color:var(--liturgical)!important;font-size:13px!important}',
'.aoClockDetailFeasts button{min-height:35px!important;border-radius:7px!important;font-size:12px!important}',
'.aoClockPrimary{display:block;margin-top:15px;min-height:44px;border-color:var(--liturgical)!important;color:var(--liturgical)!important}',
'.aoClockUpcoming{border-top:1px solid var(--liturgical);margin-top:16px;padding-top:14px}',
'.aoClockUpcoming h3{font:400 20px/1.3 Georgia,serif;margin:0 0 10px}',
'.aoClockUpcoming>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}',
'.aoClockUpcoming button{text-align:left!important;display:grid;gap:3px;min-height:68px!important;border-radius:9px!important}',
'.aoClockUpcoming small{color:var(--liturgical);font:600 11px/1.3 var(--ao-font-ui,system-ui)}',
'.aoClockUpcoming strong{font:400 15px/1.4 Georgia,serif}',
'@media(max-width:560px){.aoClockHeader{align-items:flex-start}.aoClockYearNav strong{font-size:12px}.aoClockDial{width:100%;max-width:calc(100vw - 35px)}.aoClockMonthLabel{font-size:16px}.aoClockSeasonText{font-size:16px}.aoClockCore{padding:9px!important;gap:1px}.aoClockCoreRule{margin:3px 0}.aoClockUpcoming>div{grid-template-columns:1fr 1fr}}',
'@media(prefers-reduced-motion:reduce){.aoClock *{animation:none!important;transition:none!important}}'
,
".aoClockHeader{gap:8px!important;align-items:center!important;min-width:0}",
".aoClockHeader>div:first-child{min-width:0}",
".aoClockHeader small{letter-spacing:.07em!important;white-space:nowrap;font-size:9px!important}",
".aoClockYearNav strong{font-size:13px!important;padding:0 2px!important}",
".aoClockYearNav button{min-width:36px!important}",
".aoClockSeasonText{font-family:Georgia,serif!important;font-weight:600!important;font-size:inherit;stroke-width:2.8px!important;fill:var(--liturgical)!important}",
".aoClockSector path{filter:saturate(1.3) brightness(.97)!important}",
".aoClockCore small{font-size:clamp(10px,2.1vw,15px)!important}",
".aoClockCore strong{font-size:clamp(18px,4.2vw,32px)!important}",
".aoClockCoreFeast{font-size:clamp(12px,2.5vw,19px)!important}",
".aoClockUpcoming{margin-top:10px!important}",
".aoClockUpcoming button{border-color:var(--liturgical-border)!important;background:var(--ao-surface-1,var(--bg))!important}",
"@media(max-width:560px){.aoClockYearNav{gap:0!important}.aoClockMonthLabel{font-size:17px!important}.aoClockCore{padding:9px!important}}"
,
".aoClockUpcoming{margin:8px auto 14px!important;max-width:660px}",
".aoClockUpcoming h3{font-size:18px!important;margin-bottom:7px!important}",
".aoClockUpcoming>div{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))!important;gap:8px}",
".aoClockUpcoming button{min-height:64px!important}",
"@media(max-width:430px){.aoClockHeader{display:flex!important;flex-wrap:wrap;align-items:center!important;row-gap:5px!important}.aoClockHeader>div:first-child{min-width:0}.aoClockHeader small{white-space:normal!important}.aoClockYearNav{margin-left:auto}.aoClockMain{margin-top:7px!important}.aoClockUpcoming>div{grid-template-columns:repeat(2,minmax(0,1fr))!important}}",
"@media(max-width:700px){.aoClockDetail{position:fixed;z-index:100;left:12px;right:12px;bottom:calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px) + 5px);width:auto;max-width:540px;max-height:min(67vh,520px);overflow-y:auto;margin:0 auto!important;background:linear-gradient(145deg,var(--bg),var(--bg) 66%);border:1px solid var(--liturgical);box-shadow:0 -8px 55px rgba(0,0,0,.72)}.aoClockDetailTop button{font-size:26px!important}}",
".aoClockMarkerCluster{fill:var(--liturgical);stroke:var(--liturgical);stroke-width:2.4;filter:drop-shadow(0 0 4px var(--liturgical))}",
".aoClockClusterCount{fill:var(--liturgical-ink,var(--bg));font-family:var(--ao-font-ui,system-ui);font-weight:800;pointer-events:none}",
".aoClockDetailFeasts:has(button[data-cal-clock-feast]) button{display:flex;align-items:center;gap:10px}",
".aoClockDetailFeasts button small{min-width:44px;flex:none;color:var(--liturgical)}",
".aoClockFeastMenu{width:min(550px,100%);margin:-8px auto 12px;text-align:center}",
".aoClockFeastMenu summary{display:inline-flex;min-height:44px;align-items:center;color:var(--liturgical);font:500 12px/1.4 var(--ao-font-ui,system-ui);cursor:pointer;list-style:none}",
".aoClockFeastMenu summary:after{content:'⌄';margin-left:8px}",
".aoClockFeastMenu[open] summary:after{content:'⌃'}",
".aoClockFeastMenu nav{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:7px;margin:6px 0 12px;max-height:330px;overflow-y:auto;padding:2px}",
".aoClockFeastMenu button{display:flex;gap:9px;align-items:center;min-height:44px!important;text-align:left!important;border:1px solid var(--liturgical-border)!important;border-radius:7px!important;padding:8px!important}",
".aoClockFeastMenu button small{flex:none;min-width:40px;color:var(--liturgical);font:600 11px/1.2 var(--ao-font-ui,system-ui)}",
".aoClockFeastMenu button span{font:400 13px/1.3 Georgia,serif;color:var(--text)}",
].join("\n");
