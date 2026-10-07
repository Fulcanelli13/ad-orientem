import { scheduleFreshnessState } from "./data-service.js";
import { directoryGeoLabel, isMapPublishableGeo } from "./geo-provenance.js";
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const arr=value=>Array.isArray(value)?value:[];
const L=(language,en,fr)=>language==="fr"?fr:en;

function communityLabel(id,communities){
  const match=communities.find(x=>x.id===id);
  return match?.abbreviation||match?.name||id||"Unknown";
}
function communion(record){
  const values=arr(record?.ministries).map(m=>m?.communityProfile?.communionProfile?.pope_named_in_canon??"UNKNOWN");
  if(values.includes("YES"))return "YES";
  if(values.includes("NO"))return "NO";
  if(values.some(v=>String(v).startsWith("VARIES")||v==="DISPUTED"))return "VARIES";
  return "UNKNOWN";
}
function usageLabel(m){
  const u=m?.liturgical_usage??{};
  if(u.family==="ROMAN"&&u.books==="1962")return "Roman · 1962";
  if(u.family==="ROMAN"&&u.books==="PRE_1955")return "Roman · pre-1955";
  const parts=[u.family,u.books].filter(x=>x&&x!=="UNKNOWN");
  return parts.join(" · ")||"Traditional Latin liturgy";
}
function sourceUrl(record){
  return arr(record?.sources).map(s=>s?.url).find(Boolean)||arr(record?.venue?.contact?.schedule_url)[0]||arr(record?.venue?.contact?.website)[0]||null;
}
function directionsUrl(venue){
  const g=venue?.geo??{};
  const query=g.lat!==null&&g.lat!==undefined&&g.lng!==null&&g.lng!==undefined
    ?String(g.lat)+","+String(g.lng)
    :(venue?.address?.formatted||[venue?.name?.official,venue?.address?.city,venue?.address?.country_code].filter(Boolean).join(", "));
  return query?"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(query):null;
}
function rawSchedules(record){
  return arr(record?.ministries).flatMap(m=>arr(m.schedules).map(s=>({community:m.community_id,schedule:s})));
}
function scheduleFreshnessLabel(schedule,language){
  const state=scheduleFreshnessState(schedule);
  if(state==="REVIEW_DUE")return L(language,"Schedule needs verification","Horaire à revérifier");
  return null;
}
function checkedDateLabel(schedule,language){
  const value=schedule?.verification?.checked_at;
  if(!value)return null;
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return null;
  return L(language,"Checked ","Vérifié le ")+date.toLocaleDateString(language==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
}

export function buildFindViewModel({language="en",records=[],communities=[],loadedProviders=[],unavailableProviders=[],view="list",filters={},selectedId=null}={}){
  const selected=records.find(r=>r?.venue?.venue_id===selectedId)??null;
  const geocoded=records.filter(r=>isMapPublishableGeo(r?.venue?.geo,r?.venue?.address?.country_code)).length;
  return Object.freeze({language,records,communities,loadedProviders,unavailableProviders,view,filters,selected,geocoded});
}

function pill(name,value,label,current){
  return '<button type="button" data-find-filter="'+esc(name)+'" data-find-filter-value="'+esc(value)+'" class="'+(current===value?"active":"")+'" aria-pressed="'+String(current===value)+'">'+esc(label)+'</button>';
}
function venueCard(record,vm){
  const v=record.venue??{},m=arr(record.ministries)[0]??{},label=communityLabel(m.community_id,vm.communities),una=communion(record);
  const schedule=rawSchedules(record)[0]?.schedule;
  const freshness=schedule? scheduleFreshnessLabel(schedule,vm.language):null;
  const status=una==="YES"?"UNA CUM":una==="NO"?"NON-UNA CUM":"STATUS UNKNOWN";
  return '<button type="button" class="aoFindCard" data-find-venue="'+esc(v.venue_id)+'">'
    +'<span class="aoFindCardTop"><small>'+esc(label)+'</small><i class="aoFindStatus" data-state="'+esc(una)+'">'+esc(status)+'</i></span>'
    +'<strong>'+esc(v?.name?.official||"Unnamed venue")+'</strong>'
    +'<span>'+esc([v?.address?.city,v?.address?.country_code].filter(Boolean).join(" · "))+'</span>'
    +'<em>'+esc(usageLabel(m))+'</em>'
    +(schedule?.payload?.raw?'<p>'+esc(String(schedule.payload.raw).slice(0,180))+'</p>':"")
    +(freshness?'<span class="aoFindFreshness" data-state="REVIEW_DUE">'+esc(freshness)+'</span>':"")
    +'</button>';
}
function emptyState(vm){
  if(vm.unavailableProviders.length){
    return '<section class="aoFindEmpty"><strong>'+esc(L(vm.language,"Directory snapshot not published yet","L’instantané de l’annuaire n’est pas encore publié"))+'</strong>'
      +'<p>'+esc(L(vm.language,"The Find surface is ready, but this build does not yet contain the generated institute corpus. No locations are being invented or embedded in the UI.","La surface « Trouver » est prête, mais cette version ne contient pas encore le corpus généré des instituts. Aucun lieu n’est inventé ni codé en dur dans l’interface."))+'</p>'
      +'<small>'+esc(L(vm.language,"Unavailable sources: ","Sources indisponibles : ")+vm.unavailableProviders.join(", ").toUpperCase())+'</small></section>';
  }
  return '<section class="aoFindEmpty"><strong>'+esc(L(vm.language,"No matching locations","Aucun lieu correspondant"))+'</strong><p>'+esc(L(vm.language,"Try removing one or more filters.","Essayez de retirer un ou plusieurs filtres."))+'</p></section>';
}
function detailSheet(vm){
  const record=vm.selected;if(!record)return "";
  const v=record.venue??{},m=arr(record.ministries)[0]??{},contact=v.contact??{},src=sourceUrl(record),dir=directionsUrl(v),una=communion(record);
  const schedules=rawSchedules(record),phone=arr(contact.phone)[0],email=arr(contact.email)[0],site=arr(contact.website)[0];
  let html='<div class="aoFindSheetBackdrop" data-find-close-detail><section class="aoFindSheet" role="dialog" aria-modal="true">';
  html+='<header><div><small>'+esc(communityLabel(m.community_id,vm.communities))+'</small><h2>'+esc(v?.name?.official||"Venue")+'</h2><p>'+esc(v?.address?.formatted||[v?.address?.city,v?.address?.country_code].filter(Boolean).join(", "))+'</p></div><button type="button" data-find-close-detail aria-label="'+esc(L(vm.language,"Close","Fermer"))+'">×</button></header>';
  html+='<div class="aoFindFacts">';
  if(v?.diocese?.name)html+='<div><small>'+esc(L(vm.language,"DIOCESE","DIOCÈSE"))+'</small><strong>'+esc(v.diocese.name)+'</strong></div>';
  html+='<div><small>'+esc(L(vm.language,"LITURGY","LITURGIE"))+'</small><strong>'+esc(usageLabel(m))+'</strong></div>';
  html+='<div><small>UNA CUM</small><strong>'+esc(una==="YES"?L(vm.language,"Yes","Oui"):una==="NO"?L(vm.language,"No","Non"):L(vm.language,"Unknown / varies","Inconnu / variable"))+'</strong></div>';
  if(isMapPublishableGeo(v?.geo,v?.address?.country_code)){
    html+='<div><small>'+esc(L(vm.language,"LOCATION","POSITION"))+'</small><strong>'+esc(directoryGeoLabel(v.geo,{language:vm.language}))+'</strong></div>';
  }
  html+='</div>';
  if(schedules.length){
    html+='<section class="aoFindSchedules"><small>'+esc(L(vm.language,"SCHEDULE","HORAIRES"))+'</small>';
    for(const item of schedules){
      const s=item.schedule,freshness=scheduleFreshnessLabel(s,vm.language),checked=checkedDateLabel(s,vm.language);
      html+='<article><strong>'+esc(s.mass_type&&s.mass_type!=="UNKNOWN"?s.mass_type:"Mass / liturgy")+'</strong><p>'+esc(s?.payload?.raw||JSON.stringify(s?.payload??{}))+'</p>'
        +(freshness?'<small class="aoFindFreshness" data-state="REVIEW_DUE">'+esc(freshness)+'</small>':"")
        +(checked?'<small class="aoFindChecked">'+esc(checked)+'</small>':"")
        +'</article>';
    }
    html+='</section>';
  }
  html+='<section class="aoFindActions">';
  if(dir)html+='<a href="'+esc(dir)+'" target="_blank" rel="noopener">'+esc(L(vm.language,"Directions","Itinéraire"))+'</a>';
  if(site)html+='<a href="'+esc(site)+'" target="_blank" rel="noopener">'+esc(L(vm.language,"Website","Site"))+'</a>';
  if(src&&src!==site)html+='<a href="'+esc(src)+'" target="_blank" rel="noopener">'+esc(L(vm.language,"Official source","Source officielle"))+'</a>';
  if(phone)html+='<a href="tel:'+esc(phone)+'">'+esc(phone)+'</a>';
  if(email)html+='<a href="mailto:'+esc(email)+'">'+esc(email)+'</a>';
  html+='</section><footer><small>'+esc(L(vm.language,"Source-backed directory record. Check the official schedule before travelling.","Fiche d’annuaire sourcée. Vérifiez l’horaire officiel avant de vous déplacer."))+'</small>';
  if(v?.geo?.geocoding_source==="OSM_NOMINATIM"&&v?.geo?.attribution){
    html+='<small class="aoFindGeoAttribution">'+esc(v.geo.attribution)+'</small>';
  }
  html+='</footer></section></div>';
  return html;
}
export function renderFindToString(vm){
  const f=vm.filters??{},aff=arr(f.affiliations),loaded=vm.loadedProviders.length?vm.loadedProviders.join(" · ").toUpperCase():"";
  let html='<section class="aoFindSurface" data-ao-find-owner="AO_FIND_APP_V1">';
  html+='<header class="aoFindHeader"><button type="button" data-find-close aria-label="'+esc(L(vm.language,"Back","Retour"))+'">←</button><div><small>AD ORIENTEM · DIRECTORY</small><h1>'+esc(L(vm.language,"Find a Mass","Trouver une messe"))+'</h1></div><span>'+esc(loaded)+'</span></header>';
  html+='<div class="aoFindSearch"><input type="search" data-find-query value="'+esc(f.query||"")+'" placeholder="'+esc(L(vm.language,"City, church, diocese or country","Ville, église, diocèse ou pays"))+'"></div>';
  html+='<nav class="aoFindViewTabs">'+pill("view","list",L(vm.language,"List","Liste"),vm.view)+pill("view","map",L(vm.language,"Map","Carte"),vm.view)+'</nav>';
  html+='<div class="aoFindFilters"><div>'+pill("day","ANY",L(vm.language,"Any day","Tous les jours"),f.day||"ANY")+pill("day","TODAY",L(vm.language,"Today","Aujourd’hui"),f.day||"ANY")+pill("day","SUNDAY",L(vm.language,"Sunday","Dimanche"),f.day||"ANY")+'</div>';
  html+='<div class="aoFindAffiliations">';
  for(const id of ["DIOCESAN","FSSP","ICKSP","SSPX","IBP","OTHER"])html+='<button type="button" data-find-affiliation="'+id+'" class="'+(aff.includes(id)?"active":"")+'" aria-pressed="'+String(aff.includes(id))+'">'+id+'</button>';
  html+='</div><details><summary>'+esc(L(vm.language,"Advanced filters","Filtres avancés"))+'</summary><div>';
  html+=pill("unaCum","ANY",L(vm.language,"Any communion status","Tout statut"),f.unaCum||"ANY")+pill("unaCum","YES","Una cum",f.unaCum||"ANY")+pill("unaCum","NO","Non-una cum",f.unaCum||"ANY")+pill("unaCum","UNKNOWN",L(vm.language,"Unknown","Inconnu"),f.unaCum||"ANY");
  html+='</div><div>'+pill("liturgy","ANY",L(vm.language,"Any liturgy","Toute liturgie"),f.liturgy||"ANY")+pill("liturgy","1962","1962",f.liturgy||"ANY")+pill("liturgy","PRE_1955","Pre-1955",f.liturgy||"ANY")+pill("liturgy","DOMINICAN","Dominican",f.liturgy||"ANY")+'</div><div>';
  for(const id of ["ANY","LOW","SUNG","SOLEMN"])html+=pill("massType",id,id==="ANY"?L(vm.language,"Any Mass type","Tout type de messe"):id,f.massType||"ANY");
  html+='</div></details></div>';
  html+='<div class="aoFindResultMeta"><strong>'+String(vm.records.length)+'</strong><span>'+esc(L(vm.language,"matching venues","lieux correspondants"))+'</span>'+(vm.geocoded?'<span> · '+String(vm.geocoded)+' '+esc(L(vm.language,"mapped","cartographiés"))+'</span>':"")+'</div>';
  html+='<div class="aoFindBody" data-find-view="'+esc(vm.view)+'">';
  if(vm.view==="map"){
    html+='<div class="aoFindMap" data-find-map><div class="aoFindMapFallback"><strong>'+esc(L(vm.language,"Map","Carte"))+'</strong><span>'+esc(vm.geocoded?L(vm.language,"Loading mapped venues…","Chargement des lieux cartographiés…"):L(vm.language,"No geocoded venues in this snapshot yet.","Aucun lieu géocodé dans cet instantané pour le moment."))+'</span></div></div>';
  }else if(vm.records.length){
    html+='<div class="aoFindList">'+vm.records.map(r=>venueCard(r,vm)).join("")+'</div>';
  }else html+=emptyState(vm);
  html+='</div>'+detailSheet(vm)+'</section>';
  return html;
}
