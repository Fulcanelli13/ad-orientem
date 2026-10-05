import { getCanonicalAsset, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

export const HOME_ENRICHERS_VERSION="modular-home-enrichers-v1";
export const HOME_ENRICHER_ICON_ASSET_IDS=Object.freeze({
  calendar:"ao-refined-calendar-upcoming",
  rosary:"ao-rich-rosary",
  mass:"ao-rich-mass-preparation-thanksgiving",
  angelus:"ao-rich-angelus",
  exam:"ao-rich-examination-of-conscience",
  heart:"ao-rich-sacred-heart",
  marian:"ao-rich-our-lady-marian-devotions",
  church:"ao-refined-church",
  morning:"ao-rich-morning-offering",
  evening:"ao-rich-night-prayer",
  stations:"ao-rich-stations",
  prayer:"ao-refined-pray-now",
});

const DAILY_KEY="ao_daily_catechism_v1";
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const lang=state=>state?.language==="fr"?"fr":"en";
const L=(state,en,fr)=>lang(state)==="fr"?fr:en;
const pad=n=>String(n).padStart(2,"0");
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const mins=d=>d.getHours()*60+d.getMinutes();

function safeRule(win){return win?.AO_RULE_V411??win?.AO_RULE_V401??null}
function safeYear(win){return win?.AO_LITURGICAL_YEAR_V384??null}
function todayKey(now){return iso(now)}

function mystery(state,d=new Date()){
  const day=d.getDay();
  const set=(day===1||day===4)?"joyful":(day===2||day===5)?"sorrowful":"glorious";
  return ({
    joyful:L(state,"Joyful Mysteries","Mystères joyeux"),
    sorrowful:L(state,"Sorrowful Mysteries","Mystères douloureux"),
    glorious:L(state,"Glorious Mysteries","Mystères glorieux"),
  })[set];
}

function dynamicIcon(id){
  if(/^angelus\./.test(id))return"angelus";
  if(id==="daily.morning_prayers")return"morning";
  if(id==="daily.evening_prayers")return"evening";
  if(id==="daily.examination")return"exam";
  if(id==="lent.friday.stations")return"stations";
  return"prayer";
}

function nextDynamic(state,win,settings,now){
  const api=safeRule(win);
  let active=null;
  try{active=api?.activeDynamic?.(state,settings,now)??null}catch{}
  if(active){
    return Object.freeze({
      id:active.id,kind:"dynamic",role:L(state,"Now","Maintenant"),when:L(state,"Now","Maintenant"),
      title:active.title,sub:L(state,"Appropriate for this moment","Pour ce moment de la journée"),
      icon:dynamicIcon(active.id),route:active.route??null,done:false,
    });
  }

  const done=settings?.completion?.dynamic??{};
  const cm=mins(now);
  let ctx={};
  try{ctx=api?.liturgicalContext?.(state)??{}}catch{}
  const choices=[];
  const add=(id,due,title,sub,route,icon)=>{
    if(!done[id]&&due>cm)choices.push({id,due,title,sub,route,icon});
  };
  const marian=ctx.isEastertide?L(state,"Regina Cæli","Regina Cæli"):L(state,"Angelus","Angélus");
  if(cm<705&&!done["daily.morning_prayers"])add("daily.morning_prayers",390,L(state,"Morning Prayers","Prières du matin"),L(state,"Begin the day with God","Commencer la journée avec Dieu"),"pray.morning_evening","morning");
  add("angelus.morning",360,marian,L(state,"Morning Marian prayer","Prière mariale du matin"),"pray.angelus_regina","angelus");
  add("angelus.noon",720,marian,L(state,"Pause around midday","Pause autour de midi"),"pray.angelus_regina","angelus");
  add("angelus.evening",1080,marian,L(state,"Sanctify the evening hour","Sanctifier l’heure du soir"),"pray.angelus_regina","angelus");
  if(now.getDay()===5&&ctx.isLent)add("lent.friday.stations",1110,L(state,"Stations of the Cross","Chemin de Croix"),L(state,"Friday in Lent","Vendredi de Carême"),"pray.stations","stations");
  add("daily.evening_prayers",1230,L(state,"Evening Prayers","Prières du soir"),L(state,"Close the day in prayer","Clore la journée dans la prière"),"pray.morning_evening","evening");
  add("daily.examination",1340,L(state,"Examination of Conscience","Examen de conscience"),L(state,"Before retiring","Avant le coucher"),"pray.confession","exam");
  choices.sort((a,b)=>a.due-b.due);
  const next=choices[0];
  if(next){
    const when=next.id.includes("noon")?L(state,"Noon","Midi")
      :next.id.includes("evening")||next.id==="daily.evening_prayers"?L(state,"Evening","Soir")
      :next.id==="daily.examination"?L(state,"Before bed","Avant le coucher")
      :L(state,"Later","Plus tard");
    return Object.freeze({...next,kind:"route",role:L(state,"Next","Ensuite"),when,done:false});
  }
  return Object.freeze({
    id:"dynamic.free",kind:"route",role:L(state,"Now","Maintenant"),when:L(state,"Today","Aujourd’hui"),
    title:L(state,"Remain with God","Rester avec Dieu"),
    sub:L(state,"No scheduled practice is due now","Aucune pratique programmée n’est due maintenant"),
    icon:"prayer",route:"pray.library",done:false,
  });
}

function staticSlot(state,win,settings,now){
  const api=safeRule(win);
  let all=[];
  try{all=(api?.staticItems?.(state,now)??[]).filter(x=>x?.id!=="mass.obligation")}catch{}
  if(!all.length){
    return Object.freeze({
      id:"static.none",kind:"all",role:L(state,"Daily","Quotidien"),when:L(state,"Today","Aujourd’hui"),
      title:L(state,"Daily Rule","Règle quotidienne"),sub:L(state,"Open your rule","Ouvrir votre règle"),
      icon:"prayer",route:null,done:false,
    });
  }
  const pending=all.find(x=>!settings?.completion?.static?.[x.id])??all[0];
  const done=Boolean(settings?.completion?.static?.[pending.id]);
  const title=lang(state)==="fr"?(pending.fr??pending.en):(pending.en??pending.fr);
  return Object.freeze({
    id:pending.id,kind:"static",role:L(state,"Daily","Quotidien"),
    when:done?L(state,"Done","Fait"):L(state,"Today","Aujourd’hui"),
    title:title||L(state,"Daily Rule","Règle quotidienne"),
    sub:pending.id==="rosary"?(done?L(state,"Prayed today","Prié aujourd’hui"):mystery(state,now))
      :done?L(state,"Completed today","Accompli aujourd’hui"):L(state,"Permanent rule","Règle permanente"),
    icon:pending.id==="rosary"?"rosary":"prayer",route:null,done,
  });
}

function eventSub(state,event){
  const key=String(event?.key??"");
  if(key.startsWith("ember"))return L(state,"Proper Mass · prayer & penance","Messe propre · prière & pénitence");
  if(key==="rogation")return L(state,"Litany · procession where celebrated","Litanies · procession là où elle est célébrée");
  if(key==="holy-thursday")return L(state,"Mass · visit the Altar of Repose","Messe · visite au reposoir");
  if(key==="good-friday")return L(state,"Fast & abstinence · Passion","Jeûne & abstinence · Passion");
  if(key==="ash")return L(state,"Fast & abstinence · begin Lent","Jeûne & abstinence · commencer le Carême");
  if(key==="candlemas")return L(state,"Blessed candles · procession · Mass","Cierges bénits · procession · Messe");
  if(key==="palm")return L(state,"Procession · Passion · Mass","Procession · Passion · Messe");
  if(key==="corpus")return L(state,"Mass · procession · Eucharistic prayer","Messe · procession · prière eucharistique");
  if(key==="holy-souls")return L(state,"Pray for the faithful departed","Prier pour les fidèles défunts");
  if(key==="christ-king")return L(state,"Mass · devotion to Christ the King","Messe · dévotion au Christ-Roi");
  if(key==="septuagesima")return L(state,"Prepare for Lent","Se préparer au Carême");
  return event?.kicker??L(state,"Liturgical observance","Observance liturgique");
}

function sourceEvents(state,win,d){
  const out=[];
  try{
    for(const event of safeYear(win)?.eventsFor?.(iso(d))??[]){
      const action=Array.isArray(event?.actions)?event.actions.find(x=>Array.isArray(x)&&x[0]):null;
      out.push({
        key:event.key,priority:Number(event.priority)||40,title:event.title,
        sub:eventSub(state,event),route:action?.[0]??"learn.liturgical_year",
        icon:/ember|rogation|candlemas|palm|holy-thursday|corpus/.test(String(event.key))?"church":"calendar",
        source:true,
      });
    }
  }catch{}
  return out;
}

function weeklyEvent(state,d){
  const dow=d.getDay(),first=d.getDate()<=7;
  if(dow===0)return{key:"sunday-mass",priority:100,title:L(state,"Sunday Mass","Messe dominicale"),sub:L(state,"Sunday obligation","Obligation dominicale"),route:"mass.current",icon:"mass"};
  if(dow===5&&first)return{key:"first-friday",priority:76,title:L(state,"First Friday","Premier vendredi"),sub:L(state,"Sacred Heart devotion","Dévotion au Sacré-Cœur"),route:"pray.visit_blessed_sacrament",icon:"heart"};
  if(dow===6&&first)return{key:"first-saturday",priority:76,title:L(state,"First Saturday","Premier samedi"),sub:L(state,"Immaculate Heart devotion","Dévotion au Cœur Immaculé"),route:"pray.rosary",icon:"marian"};
  if(dow===5)return{key:"friday",priority:50,title:L(state,"Friday devotion","Dévotion du vendredi"),sub:L(state,"Sacred Heart · prayer & penance","Sacré-Cœur · prière & pénitence"),route:"pray.visit_blessed_sacrament",icon:"heart"};
  if(dow===6)return{key:"saturday",priority:50,title:L(state,"Saturday of Our Lady","Samedi de Notre-Dame"),sub:L(state,"Traditional Marian devotion","Dévotion mariale traditionnelle"),route:"pray.library",icon:"marian"};
  return null;
}

function candidateForDate(state,win,d){
  const items=sourceEvents(state,win,d);
  const weekly=weeklyEvent(state,d);
  if(weekly)items.push(weekly);
  items.sort((a,b)=>b.priority-a.priority);
  if(d.getDay()===0){
    const named=items.find(x=>x.source&&x.priority>=70&&x.key!=="october");
    if(named)return {...named,priority:Math.max(102,named.priority),sub:`${L(state,"Sunday obligation","Obligation dominicale")} · ${named.sub}`};
  }
  return items[0]??null;
}

function eventSlot(state,win,now){
  const today=candidateForDate(state,win,now);
  if(today)return Object.freeze({...today,id:today.key,kind:"event",role:L(state,"Observance","Observance"),when:L(state,"Today","Aujourd’hui"),date:iso(now),done:false});
  let best=null;
  for(let i=1;i<=14;i++){
    const d=addDays(now,i),candidate=candidateForDate(state,win,d);
    if(!candidate)continue;
    const score=candidate.priority-i*4;
    if(!best||score>best.score)best={...candidate,d,days:i,score};
  }
  if(best){
    const when=best.days===1?L(state,"Tomorrow","Demain")
      :best.days<7?new Intl.DateTimeFormat(lang(state)==="fr"?"fr-FR":"en-GB",{weekday:"short"}).format(best.d)
      :`${pad(best.d.getDate())}/${pad(best.d.getMonth()+1)}`;
    return Object.freeze({...best,id:best.key,kind:"event",role:L(state,"Upcoming","À venir"),when,date:iso(best.d),done:false});
  }
  return Object.freeze({
    id:"event.calendar",kind:"event",role:L(state,"Upcoming","À venir"),when:L(state,"Calendar","Calendrier"),
    title:L(state,"Liturgical calendar","Calendrier liturgique"),
    sub:L(state,"See the next observance","Voir la prochaine observance"),
    icon:"calendar",route:"learn.liturgical_year",date:iso(now),done:false,
  });
}

function readDaily(win){
  try{
    const parsed=JSON.parse(win?.localStorage?.getItem?.(DAILY_KEY)??"{}");
    if(parsed?.version===1)return parsed;
  }catch{}
  return {version:1,sessions:{},history:{},completionDates:[]};
}

function dailyCatechism(state,win,now){
  const store=readDaily(win),key=todayKey(now),session=store.sessions?.[key]??null;
  const history=Object.values(store.history??{}),month=key.slice(0,7);
  const encountered=history.filter(x=>x&&x.seen).length;
  const due=history.filter(x=>x&&x.due&&x.due<=key).length;
  const monthCount=(store.completionDates??[]).filter(x=>String(x).startsWith(month)).length;
  const done=session?Object.keys(session.outcomes??{}).length:0;
  const complete=Boolean(session?.completedAt)||done>=10;
  if(complete)return Object.freeze({
    title:L(state,"Daily Catechism","Catéchisme quotidien"),
    description:L(state,"Today’s ten questions are complete.","Les dix questions du jour sont terminées."),
    badge:L(state,"10/10 completed today","10/10 terminées aujourd’hui"),
    meta:`${encountered}/433 ${L(state,"encountered","rencontrées")} · ${monthCount} ${L(state,"this month","ce mois-ci")}`,
    complete:true,done,
  });
  if(session)return Object.freeze({
    title:L(state,"Daily Catechism","Catéchisme quotidien"),
    description:L(state,"Continue today’s St Pius X lesson.","Continuez la leçon de Saint Pie X du jour."),
    badge:`${done}/10 ${L(state,"completed","terminées")}`,
    meta:`${due} ${L(state,"due for review","à revoir")}`,
    complete:false,done,
  });
  return Object.freeze({
    title:L(state,"Daily Catechism","Catéchisme quotidien"),
    description:L(state,"Ten St Pius X questions: new material, review and weak points.","Dix questions de Saint Pie X : nouveautés, révision et points faibles."),
    badge:L(state,"10 questions · today","10 questions · aujourd’hui"),
    meta:encountered?`${encountered}/433 ${L(state,"encountered","rencontrées")}`:L(state,"Start your first daily lesson","Commencez votre première leçon"),
    complete:false,done:0,
  });
}

export function buildHomeEnrichers(state,win=globalThis,{now=new Date()}={}){
  const selected=String(state?.selectedDate??"");
  const today=todayKey(now);
  if(state?.route!=="home"||selected!==today){
    return Object.freeze({version:HOME_ENRICHERS_VERSION,visible:false,comingUp:null,dailyCatechism:null});
  }
  let settings={completion:{static:{},dynamic:{}}};
  try{settings=safeRule(win)?.load?.()??settings}catch{}
  return Object.freeze({
    version:HOME_ENRICHERS_VERSION,
    visible:true,
    comingUp:Object.freeze({
      title:L(state,"Coming Up","À venir"),
      viewAll:L(state,"View all","Voir tout"),
      rows:Object.freeze([
        nextDynamic(state,win,settings,now),
        staticSlot(state,win,settings,now),
        eventSlot(state,win,now),
      ]),
    }),
    dailyCatechism:dailyCatechism(state,win,now),
  });
}

function iconMarkup(icon){
  const assetId=HOME_ENRICHER_ICON_ASSET_IDS[icon]??HOME_ENRICHER_ICON_ASSET_IDS.prayer;
  const canonical=getCanonicalAsset(assetId);
  const id=canonical?.assetId??assetId;
  return `<svg class="aoHomeCuIcon" data-ao-asset-id="${esc(id)}" viewBox="0 0 128 128" aria-hidden="true" focusable="false"><use href="#${esc(id)}"></use></svg>`;
}

function uiIcon(assetId){
  const url=resolveCanonicalAssetUrl(assetId);
  if(!url)return "";
  return `<span data-ao-asset-id="${esc(assetId)}" aria-hidden="true" style="display:inline-block;width:1em;height:1em;background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`;
}

function rowMarkup(row){
  const attrs=row.kind==="dynamic"?`data-home-cu-dynamic="${esc(row.id)}" data-home-cu-route="${esc(row.route??"")}"`
    :row.kind==="static"?`data-home-cu-static="${esc(row.id)}"`
    :row.kind==="all"?"data-home-cu-all"
    :`data-home-cu-route="${esc(row.route??"")}" data-home-cu-date="${esc(row.date??"")}"`;
  return `<button type="button" class="aoHomeCuRow${row.done?" done":""}" ${attrs}><span class="aoHomeCuRole">${esc(row.role)}<small>${esc(row.when)}</small></span>${iconMarkup(row.icon)}<span class="aoHomeCuCopy"><strong>${esc(row.title)}</strong><span>${esc(row.sub)}</span></span><span class="aoHomeCuArrow">${uiIcon("ao-ui-next")}</span></button>`;
}

export function renderHomeEnrichersToString(model,state){
  if(!model?.visible)return"";
  const fr=lang(state)==="fr",daily=model.dailyCatechism;
  return `<style data-ao-home-enricher-suppression>
.homeScreen .aoComingUpV4323,.homeScreen .aoDailyCateHome,.aoComingUpV4323,.aoDailyCateHome{display:none!important}
.aoHomeEnricherCard{margin-top:14px}.aoHomeEnricherHead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.aoHomeEnricherHead button{border:0;background:transparent;color:inherit;min-height:44px}
.aoHomeCuRows{display:grid;gap:7px}.aoHomeCuRow{display:grid;grid-template-columns:64px 34px 1fr auto;align-items:center;gap:8px;width:100%;min-height:58px;text-align:left;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:rgba(255,255,255,.025);color:inherit;padding:8px}.aoHomeCuRole{font-size:10px;text-transform:uppercase;letter-spacing:.045em;white-space:nowrap}.aoHomeCuRole small,.aoHomeCuCopy span{display:block;color:var(--muted-2,#9d9a94);text-transform:none;letter-spacing:0;margin-top:3px}.aoHomeCuIcon{width:28px;height:28px;display:block;color:var(--liturgical,#63b47a);justify-self:center}.aoHomeCuCopy strong{font-weight:600}.aoHomeCuArrow{font-size:22px}.aoHomeCuRow.done{opacity:.68}
.aoHomeDailyBody{display:flex;align-items:center;justify-content:space-between;gap:14px}.aoHomeDailyCopy b{display:block;margin:4px 0}.aoHomeDailyCopy p{margin:4px 0 8px}.aoHomeDailyMeta{display:flex;flex-wrap:wrap;gap:6px;font-size:12px;color:var(--muted-2,#9d9a94)}.aoHomeDailyBadge{border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:4px 7px}.aoHomeDailyOpen{flex:0 0 44px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:transparent;color:inherit}
@media(max-width:430px){.aoHomeCuRow{grid-template-columns:72px 30px 1fr auto;gap:6px}.aoHomeCuRole{font-size:9px;letter-spacing:.035em}}
</style>
<section class="contentCard aoHomeEnricherCard aoHomeComingUp" data-ao-home-enricher-owner="${HOME_ENRICHERS_VERSION}" aria-label="${esc(model.comingUp.title)}"><div class="aoHomeEnricherHead"><div class="cardKicker">${esc(model.comingUp.title)}</div><button type="button" data-home-cu-all>${esc(model.comingUp.viewAll)} ${uiIcon("ao-ui-next")}</button></div><div class="aoHomeCuRows">${model.comingUp.rows.map(rowMarkup).join("")}</div></section>
<section class="contentCard aoHomeEnricherCard aoHomeDailyCatechism" data-ao-home-enricher-owner="${HOME_ENRICHERS_VERSION}"><div class="aoHomeDailyBody"><div class="aoHomeDailyCopy"><div class="cardKicker">${fr?"Formation":"Formation"}</div><b>${esc(daily.title)}</b><p>${esc(daily.description)}</p><div class="aoHomeDailyMeta"><span class="aoHomeDailyBadge">${esc(daily.badge)}</span><span>${esc(daily.meta)}</span></div></div><button type="button" class="aoHomeDailyOpen" data-home-daily-catechism aria-label="${esc(fr?"Ouvrir le Catéchisme quotidien":"Open Daily Catechism")}">${uiIcon("ao-ui-next")}</button></div></section>`;
}
