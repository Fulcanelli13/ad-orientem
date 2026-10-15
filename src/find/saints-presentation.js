// Compact, image-approval-aware Saints cards inside the existing Explore sheet.
// Sources remain folded; figures can share one physical Place/map marker.
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const arr=value=>Array.isArray(value)?value:[];
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const translated=(obj,lang,key)=>String(obj?.[key+"_"+lang]??obj?.[key+"_en"]??"").trim();
const sourceUrl=s=>{
  try{const u=new URL(s?.url);return u.protocol==="https:"&&u.hostname==="www.vatican.va"?u.href:null;}catch{return null;}
};

/** Compact bilingual Saints profile in the existing Explore Place sheet.
 * Life events and celebrations are source-scoped, never inferred from a shrine marker.
 * Only external authoritative biographies belong under "Read further".
 */
const saintPreviewOnly=people=>people.some(p=>p.editorial_status==="RESEARCH_READER_PREVIEW_ONLY");
export function renderSaintPlaceSheet(vm){
  const item=vm?.selected;if(item?.lens!=="saints")return "";
  const language=vm.language,people=arr(item.saints),floating=vm.view==="map";
  if(!people.length)return "";
  const dateLabel=value=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value||""))return "";
    const date=new Date(value+"T12:00:00Z");
    return Number.isNaN(date.getTime())?"":new Intl.DateTimeFormat(language==="fr"?"fr-FR":"en-GB",
      {day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(date);
  };
  const dayLabel=value=>dateLabel("2024-"+value).replace(/\s*2024$/, "");
  const say=(en,fr)=>L(language,en,fr);
  let html='<div class="aoFindSheetBackdrop aoSaintPlaceLayer'+(floating?' aoExploreQuickPreviewLayer':'')+'" data-find-close-detail>'
    +'<section class="aoFindSheet aoSaintPlaceSheet" role="dialog" aria-modal="'+String(!floating)+'" aria-label="'+esc(say("Lives of saints","Vies des saints"))+'">';
  html+='<div class="aoHeritageSheetHandle" aria-hidden="true"></div>';
  html+='<header><div><small>'+esc(say("SAINTS","SAINTS"))+'</small>'
    +'<h2>'+esc(item.kind==="SAINT_CATALOGUE_PROFILE"?(language==="fr"?item.title_fr:item.title):(item.subtitle||item.title))+'</h2></div>'
    +'<button type="button" data-find-close-detail aria-label="'+esc(say("Close","Fermer"))+'">×</button></header>';
  for(const [index,saint] of people.entries()){
    const life=saint.life;
    html+='<article class="aoSaintBiography" data-saint-id="'+esc(saint.saint_id)+'">';
    html+='<div class="aoSaintIdentity"><div class="aoSaintPortraitHold" role="note"><span>'
      +esc(say("Portrait awaiting approval","Portrait en attente de validation"))+'</span></div>';
    html+='<div class="aoSaintIdentityInfo">';
    html+='<small class="aoSaintStatus">'+esc(saint.recognition_status==="BEATIFIED_NOT_CANONIZED"
      ?say("Blessed · not canonized","Bienheureux · non canonisé")
      :say("Saint","Saint"))+'</small>';
    html+='<h3>'+esc(translated(saint,language,"name"))+'</h3>';
    const roles=arr(saint.classification?.roles).slice(0,2);
    if(roles.length)html+='<p class="aoSaintVocation">'+esc(roles.map(r=>r?.[language]||r?.en).join(" · "))+'</p>';
    if(life){
      html+='<dl class="aoSaintLifeEvents">';
      for(const [label,event] of [[say("Born","Naissance"),life.birth],[say("Died","Décès"),life.death]]){
        html+='<div><dt>'+esc(label)+'</dt><dd><strong>'+esc(event.date_label?.[language]||event.date_label?.en||dateLabel(event.date))+'</strong>'
          +'<span>'+esc(event.place?.[language]||event.place?.en)+'</span></dd></div>';
      }
      html+='</dl>';
    }
    html+='</div></div>';
    const observed=saint.calendar_context?.observed1962;
    html+='<div class="aoSaintFeasts">';
    if(observed?.scope==="ACTUALLY_OBSERVED_ON_THIS_DATE_IN_2026_RESOLVER" &&
       observed?.year===2026 && /^\d{4}-\d{2}-\d{2}$/.test(observed.civilDate) &&
       /^sancti:\d{2}-\d{2}[a-z]?:[1-4]:[wr]$/.test(observed.principalSourceId)){
      html+='<p class="aoSaintCalendarContext"><strong>'+esc(dateLabel(observed.civilDate))+'</strong>'
        +' · '+esc(say("Observed in the 1962-calendar cycle (2026)","Observé dans le calendrier de 1962 (2026)"))+'</p>';
      html+='<p class="aoSaintCalendarCaution">'+esc(say(
        "2026 observance; not a timeless feast date or authorization to select a Mass.",
        "Observance de 2026 ; ni date universelle permanente ni autorisation de choisir une messe."))+'</p>';
    }
    if(life?.celebration){
      const c=life.celebration;
      html+='<p class="aoSaintOtherFeast"><strong>'+esc(dayLabel(c.month_day))+'</strong>'
        +' · '+esc(c.label?.[language]||c.label?.en)+'</p>';
    }
    if(!observed&&!life?.celebration){
      const candidate=saint.calendar_candidate;
      const date=/^\\d{2}-\\d{2}$/.test(candidate||"")?candidate.slice(3)+"/"+candidate.slice(0,2):null;
      html+='<p class="aoSaintOtherFeast">'+esc(date
        ?say("Historical calendar candidate · ","Date historique à vérifier · ")+date
        :say("Feast date awaiting Calendar verification","Date de fête en attente de vérification"))+'</p>';
      if(date)html+='<p class="aoSaintCalendarCaution">'+esc(say(
        "Research cross-reference only; not a certified 1962 observance or Mass selection.",
        "Référence de recherche uniquement ; ni célébration de 1962 certifiée ni choix de messe."))+'</p>';
    }
    html+='</div>';
    const narrative=[translated(saint,language,"why"),...arr(saint.biography_facts).map(f=>String(f?.[language]??f?.en??""))].filter(Boolean).join(" ");
    html+='<p class="aoSaintLife">'+esc(narrative)+'</p>';
    for(const e of arr(saint.classification?.extraordinary)){
      html+='<p class="aoSaintWitness" data-saint-event="'+esc(e.id)+'">'+esc(e?.[language]??e?.en??"")+'</p>';
    }
    const classifications=saint.classification??{};
    const tags=[...arr(classifications.honours),...arr(classifications.roles)];
    if(tags.length)html+='<div class="aoSaintRoles" aria-label="'+esc(say("Vocations and titles","Vocations et titres"))+'">'
      +tags.map(c=>'<span data-saint-category="'+esc(c.code)+'">'+esc(String(c?.[language]??c?.en??""))+'</span>').join("")+'</div>';
    const sources=arr(saint.sources).map(s=>{const url=sourceUrl(s);return url
      ?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title||s.id)+'</a>':""}).filter(Boolean);
    if(sources.length)html+='<details class="aoSaintReading"><summary>'
      +esc(say("Read further","Pour approfondir"))+'</summary><div>'+sources.join("")+'</div></details>';
    if(index<people.length-1)html+='<div class="aoSaintPersonDivider"></div>';
    html+='</article>';
  }
  if(item.place_id)html+='<div class="aoFindActions"><button type="button" data-explore-open-place="'+esc(item.place_id)+'">'
    +esc(say("View associated place","Voir le lieu associé"))+'</button></div>';
  if(item.kind!=="SAINT_CATALOGUE_PROFILE"){
    html+='<p class="aoSaintGeoNote">'+esc(say(
      "Shrine associations do not by themselves establish where someone was born, lived or died.",
      "Une association à un sanctuaire n’établit pas à elle seule le lieu de naissance, de vie ou de décès."))+'</p>';
    if(!item.map_publishable)html+='<p class="aoSaintGeoNote">'+esc(say(
      "This site remains list-only until its coordinates are verified.",
      "Ce lieu reste dans la liste jusqu’à vérification de ses coordonnées."))+'</p>';
  }else if(saintPreviewOnly(people)){
    html+='<p class="aoSaintGeoNote">'+esc(say(
      "Research catalogue preview; biographies await final editorial release.",
      "Aperçu de recherche ; notices en attente de validation éditoriale."))+'</p>';
  }
  html+='</section></div>';
  return html;
}


/**
 * A source reference is not a finished saint biography. A source index row
 * must never acquire a portrait, feast, physical pin or invented holiness text.
 */
export function renderSaintSourceIndexSheet(vm){
  const item=vm?.selected;
  if(item?.kind!=="SAINT_SOURCE_INDEX_ENTRY")return "";
  const lang=vm.language==="fr"?"fr":"en",say=(en,fr)=>lang==="fr"?fr:en;
  const meta=item.index_metadata??{};
  const historical=meta.scope==="ARCHIVED_SOURCE_SUBJECT";
  const collective=meta.scope==="COLLECTIVE_CANONIZATION";
  const title=lang==="fr"?item.title_fr:item.title;
  const summary=lang==="fr"?item.summary_fr:item.summary;
  const subtitle=lang==="fr"?item.subtitle_fr:item.subtitle;
  let html='<div class="aoFindSheetBackdrop" data-find-close-detail><section class="aoFindSheet aoSaintSourceIndexSheet" role="dialog" aria-modal="true" aria-label="'+esc(title)+'">';
  html+='<header><div><small>'+esc(say("SAINTS · SOURCE INDEX","SAINTS · INDEX DES SOURCES"))+'</small><h2>'+esc(title)+'</h2></div>'
   +'<button type="button" data-find-close-detail aria-label="'+esc(say("Close","Fermer"))+'">×</button></header>';
  html+='<p class="aoSaintIndexScope">'+esc(historical
    ?say("Historical sanctoral archive · research reference","Archives historiques du sanctoral · référence de recherche")
    :collective?say("Collective canonization · group record","Canonisation collective · fiche de groupe")
    :say("Later canonization · official index","Canonisation ultérieure · index officiel"))+'</p>';
  if(subtitle)html+='<p class="aoSaintIndexDate">'+esc(subtitle)+'</p>';
  if(summary)html+='<p class="aoSaintIndexSynopsis">'+esc(summary)+'</p>';
  if(collective){
    const count=Number.isInteger(meta.members)?String(meta.members):
      Number.isInteger(meta.estimated_members)?say("approximately ","environ ")+String(meta.estimated_members):"";
    if(count)html+='<p class="aoSaintIndexCount">'+esc(say("Group members: ","Membres du groupe : ")+count)+'</p>';
  }
  html+='<p class="aoSaintGeoNote">'+esc(historical
    ?say("Archived subject identification is not a certified individual saint biography, current feast, or Mass assignment.",
      "L’identification archivistique ne vaut ni biographie individuelle certifiée, ni fête actuelle, ni choix de messe.")
    :collective?say("This group is one index entry, not one person or a list of unnamed individual biographies.",
       "Ce groupe constitue une seule entrée de l’index, et non une personne ou une série de biographies individuelles.")
    :say("Canonization date is not a liturgical feast date. A complete sourced life is not available in this index.",
       "La date de canonisation n’est pas une fête liturgique. Cet index ne contient pas encore de biographie complète et sourcée."))+'</p>';
  const links=arr(item.source_links).filter(x=>sourceUrl(x));
  if(links.length)html+='<div class="aoSaintIndexReferences"><strong>'+esc(say("Original source","Source d’origine"))+'</strong>'
    +links.map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(sourceUrl(x))+'">'+esc(x.issuer||x.title||say("Source","Source"))+' ↗</a>').join("")+'</div>';
  html+='</section></div>';
  return html;
}

export const SAINTS_SHEET_CSS=`
.aoSaintPlaceSheet{background:linear-gradient(155deg,#15202b,#080d14 62%);padding-bottom:max(25px,env(safe-area-inset-bottom));max-height:82dvh}
.aoSaintPlaceSheet header{align-items:start}.aoSaintPlaceSheet header small{color:#cbb587;font:650 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em}
.aoSaintPlaceSheet header h2{font:550 clamp(20px,4vw,26px)/1.2 var(--ao-font-display,Georgia,serif)}
.aoSaintPlaceSheet header p{font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#b4afa2}
.aoSaintBiography{padding:16px 0}.aoSaintPortraitHold{min-height:90px;display:flex;justify-content:center;align-items:center;border:1px solid rgba(217,197,154,.12);background:#0f1720;border-radius:10px;color:#a89b84;font:11px/1.5 var(--ao-font-ui,system-ui,sans-serif);text-align:center;padding:12px}
.aoSaintStatus{display:block;margin:14px 0 4px;color:#c1aa7e;font:600 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.03em}
.aoSaintBiography h3{font:550 clamp(22px,4vw,28px)/1.22 var(--ao-font-display,Georgia,serif);margin:5px 0;color:#efe4d1}
.aoSaintCalendarContext{color:#d6c5a6;font:550 12px/1.5 var(--ao-font-ui,system-ui,sans-serif);margin:8px 0 2px}
.aoSaintCalendarCaution{color:#a99f90;font:400 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);margin:0 0 12px}
.aoSaintRoles{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 6px}
.aoSaintRoles span{font:600 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#d7c19d;padding:5px 9px;border:1px solid rgba(215,193,157,.27);border-radius:999px;background:rgba(215,193,157,.065)}
.aoSaintExtraordinary{border-top:1px solid rgba(217,197,154,.2);padding:10px 0;margin:14px 0}
.aoSaintExtraordinary summary{font:600 12px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#ddc699;cursor:pointer;min-height:40px;padding-top:10px}
.aoSaintCaution{color:#b7ad9d;font:12px/1.55 var(--ao-font-ui,system-ui,sans-serif);margin:10px 0}
.aoSaintAccount strong{color:#e7d6b6;font:600 13px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
.aoSaintAccount p{color:#e0d4c2;font:14px/1.5 var(--ao-font-ui,system-ui,sans-serif);margin:7px 0}
.aoSaintEventRefs{display:grid;gap:8px;margin:8px 0}.aoSaintEventRefs a{font:12px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#ddc699;overflow-wrap:anywhere;text-decoration:underline}
.aoSaintWhy{font:17px/1.52 var(--ao-font-body,Georgia,serif);color:#ece2d3;margin:12px 0 16px}
.aoSaintFacts{padding-left:22px;margin:12px 0 16px}.aoSaintFacts li{font:14px/1.56 var(--ao-font-ui,system-ui,sans-serif);color:#d4cbbd;padding-left:3px;margin:9px 0}
.aoSaintReading{border-top:1px solid rgba(217,197,154,.17);padding:11px 0;margin:12px 0}
.aoSaintReading summary{cursor:pointer;min-height:40px;color:#e1c895;font:600 12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoSaintReading>div{display:grid;gap:6px}.aoSaintReading a{display:block;padding:8px 0;color:#dec89f;overflow-wrap:anywhere;text-decoration:underline;text-underline-offset:3px;font:12px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
.aoSaintPersonDivider{border-bottom:1px solid rgba(217,197,154,.22);margin:8px 0}
.aoSaintGeoNote{font:11px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#a99e8b;padding-bottom:6px}
.aoSaintPlaceSheet button:focus-visible,.aoSaintPlaceSheet a:focus-visible,.aoSaintPlaceSheet summary:focus-visible{outline:2px solid #d9c59a;outline-offset:3px}
.aoSaintScopeNote{margin:0 16px 8px;padding:8px 12px;border:1px solid rgba(217,197,154,.16);border-radius:9px;color:#afa48f;background:#111925;font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
@media(min-width:800px){.aoSaintPlaceSheet{max-width:690px;margin:0 auto}}
@media(max-width:520px){.aoSaintPlaceSheet{padding:14px 15px calc(18px + env(safe-area-inset-bottom))}.aoSaintWhy{font-size:17px}.aoSaintFacts li{font-size:14px}.aoSaintPortraitHold{min-height:80px}}

.aoSaintIdentity{display:grid;grid-template-columns:clamp(92px,29%,146px) minmax(0,1fr);gap:15px;align-items:start;margin:8px 0 12px}
.aoSaintIdentityInfo{min-width:0}
.aoSaintPortraitHold{aspect-ratio:3/4;min-height:0!important;max-height:205px;padding:12px!important}
.aoSaintStatus{margin:0 0 5px}
.aoSaintBiography h3{margin:0 0 4px}
.aoSaintVocation{font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#bcb1a0;margin:0 0 12px}
.aoSaintLifeEvents{display:grid;gap:9px;margin:0}
.aoSaintLifeEvents>div{display:block}
.aoSaintLifeEvents dt{font:600 10px/1.5 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.07em;color:#aea18a}
.aoSaintLifeEvents dd{margin:0;display:grid;gap:1px;font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#d9cec0}
.aoSaintLifeEvents strong{font-weight:600;color:#e9dbca}
.aoSaintLifeEvents span{overflow-wrap:anywhere}
.aoSaintFeasts{border:1px solid rgba(217,197,154,.18);background:#121b25;padding:9px 11px;border-radius:9px;margin:10px 0 13px}
.aoSaintCalendarContext,.aoSaintOtherFeast{font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#d5c4a5;margin:2px 0}
.aoSaintCalendarCaution{font:10px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#aaa092;margin:1px 0 7px}
.aoSaintFeasts strong{color:#efe0c7;font-weight:650}
.aoSaintLife,.aoSaintWitness{font:15px/1.6 var(--ao-font-body,Georgia,serif);color:#e9decd;margin:12px 0}
.aoSaintWitness{margin-top:0}
.aoSaintRoles{margin:12px 0 10px}
.aoSaintSourceIndexSheet{max-width:640px;background:linear-gradient(155deg,#15202b,#080d14 62%)}
.aoSaintSourceIndexSheet header h2{font:550 clamp(22px,5vw,28px)/1.2 var(--ao-font-display,Georgia,serif)}
.aoSaintIndexScope,.aoSaintIndexDate,.aoSaintIndexCount{color:#d6c3a0;font:12px/1.5 var(--ao-font-ui,system-ui,sans-serif);margin:12px 0}
.aoSaintIndexSynopsis{font:16px/1.6 var(--ao-font-body,Georgia,serif);color:#ecdfcb;margin:15px 0}
.aoSaintIndexReferences{display:grid;gap:12px;border-top:1px solid #78684b55;padding:15px 0;color:#e4d3b6}
.aoSaintIndexReferences a{color:#e5c98b;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}
.aoSaintCatalogueFacets{display:flex;gap:6px;overflow-x:auto;padding:7px 13px 12px;scrollbar-width:thin}
.aoSaintCatalogueFacets button{flex:none;min-height:38px;white-space:nowrap;border-radius:999px;padding:7px 12px;
 background:#101a24;color:#d1c2a9;border:1px solid rgba(217,197,154,.21);
 font:600 11px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoSaintCatalogueFacets button.active{color:#f4e3c7;background:#29301e;border-color:#a78f60}
.aoSaintCatalogueFacets button:focus-visible{outline:2px solid #d9c59a;outline-offset:2px}
@media(max-width:390px){.aoSaintIdentity{grid-template-columns:94px minmax(0,1fr);gap:10px}.aoSaintBiography h3{font-size:21px}.aoSaintLifeEvents dd{font-size:11px}}
`;
