import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { renderHeritageToString, sacredPlaceSynopsis } from "./heritage-presentation.js";
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const uiIcon=id=>{const url=resolveCanonicalAssetUrl(id);return url?`<span data-ao-asset-id="${esc(id)}" aria-hidden="true" style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`:"";};
const arr=value=>Array.isArray(value)?value:[];
const L=(language,en,fr)=>language==="fr"?fr:en;

const LENS_LABELS=Object.freeze({
  heritage:["Heritage","Patrimoine"],
  tlm:["TLM","TLM"],
  shrines:["Shrines","Sanctuaires"],
  apparitions:["Apparitions","Apparitions"],
  relics:["Relics","Reliques"],
  traditions:["Traditions","Traditions"],
  pilgrimages:["Pilgrimages","Pèlerinages"],
});
const FACT_LABELS=Object.freeze({
  Diocese:["Diocese","Diocèse"],
  Liturgy:["Liturgy","Liturgie"],
  "Una cum":["Una cum","Una cum"],
  Location:["Location","Position"],
  Dedication:["Dedication","Dédicace"],
  Type:["Type","Type"],
  Evidence:["Evidence","Preuve"],
  Class:["Class","Classe"],
  Period:["Period","Période"],
  "Documented examples":["Documented examples","Exemples attestés"],
  Confidence:["Confidence","Confiance"],
  Category:["Category","Catégorie"],
  "Witness / tradition":["Witness / tradition","Témoin / tradition"],
  "Associated person":["Associated person","Personne associée"],
  Kind:["Kind","Type"],
  Route:["Route","Itinéraire"],
  Calendar:["Calendar","Calendrier"],
});
function lensLabel(language,lens){const pair=LENS_LABELS[lens]??[lens,lens];return language==="fr"?pair[1]:pair[0];}
function factLabel(language,label){const pair=FACT_LABELS[label];return pair?(language==="fr"?pair[1]:pair[0]):label;}
function addressText(address){
  return String(address?.formatted??"").trim()||[
    address?.line1,address?.postal_code,address?.city,address?.region,address?.country??address?.country_code
  ].filter(Boolean).join(", ");
}
function pill(name,value,label,current){
  return '<button type="button" data-find-filter="'+esc(name)+'" data-find-filter-value="'+esc(value)+'" class="'+(current===value?"active":"")+'" aria-pressed="'+String(current===value)+'">'+esc(label)+'</button>';
}

function atlasSelect(name,title,allLabel,options,current){
  const opt=(value,label)=>'<option value="'+esc(value)+'"'+(current===value?' selected':'')+'>'+esc(label)+'</option>';
  return '<label class="aoAtlasSelect"><span>'+esc(title)+'</span><select data-atlas-filter="'+esc(name)+'" aria-label="'+esc(title)+'">'
    +opt("ANY",allLabel)+arr(options).map(item=>opt(item.value,item.label)).join("")+'</select></label>';
}
function customsAtlasPanel(vm){
  const language=vm.language,facets=vm.atlasFacets??{},filters=vm.filters??{};
  let html='<section class="aoCustomsAtlasPanel" aria-label="'+esc(L(language,"Customs Atlas","Atlas des coutumes"))+'">';
  html+='<div class="aoCustomsAtlasHeading"><div><small>'+esc(L(language,"TRADITIONS & PRACTICES","TRADITIONS ET PRATIQUES"))+'</small>'
    +'<h2>'+esc(L(language,"Customs Atlas","Atlas des coutumes"))+'</h2></div>'
    +'<p>'+esc(L(language,"Browse Catholic practices by subject. Places and countries provide documented examples, not exclusive national classifications.","Découvrir les pratiques catholiques par sujet. Les lieux et les pays fournissent des témoignages, sans attribuer chaque coutume à une seule nation."))+'</p></div>';
  html+='<div class="aoCustomsAtlasTopics">'+atlasSelect("atlasFamily",L(language,"Theme","Thème"),L(language,"All themes","Tous les thèmes"),facets.families,filters.atlasFamily??"ANY")+'</div>';
  const active=(filters.atlasArea&&filters.atlasArea!=="ANY")||(filters.atlasPeriod&&filters.atlasPeriod!=="ANY")||(filters.atlasCalendar&&filters.atlasCalendar!=="ANY");
  html+='<details class="aoCustomsAtlasDiscovery"'+(active?' open':'')+'><summary>'+esc(L(language,"Filter by place, period or calendar context","Filtrer par lieu, période ou calendrier"))+'</summary><div class="aoCustomsAtlasFacets">'
    +atlasSelect("atlasArea",L(language,"Geography","Géographie"),L(language,"All areas","Toutes les régions"),facets.areas,filters.atlasArea??"ANY")
    +atlasSelect("atlasPeriod",L(language,"Historical period","Période historique"),L(language,"All periods","Toutes les périodes"),facets.periods,filters.atlasPeriod??"ANY")
    +atlasSelect("atlasCalendar",L(language,"Calendar context","Contexte calendaire"),L(language,"All contexts","Tous les contextes"),
      arr(facets.calendar).map(item=>item.value==="NOVENA"?{...item,label:L(language,"Related novena","Neuvaine associée")}:item),filters.atlasCalendar??"ANY")
    +'</div>';
  html+='<div class="aoCustomsAtlasFoot"><span>'+esc(L(language,
    "Periods and calendar hints are source descriptions, not calculated feast dates. Unverified places remain in List.",
    "Les périodes et indications calendaires décrivent les sources, sans calcul de dates liturgiques. Les lieux non vérifiés restent dans la liste."))+'</span>'
    +'<button type="button" data-atlas-clear>'+esc(L(language,"Clear filters","Effacer les filtres"))+'</button></div>';
  return html+'</details></section>';
}
function sourceLinks(item,language){
  const links=arr(item?.source_links);
  if(!links.length)return "";
  let html='<section class="aoFindSources"><small>'+esc(L(language,"SOURCES","SOURCES"))+'</small><div>';
  links.forEach((source,index)=>{
    const label=source?.issuer||source?.title||L(language,"Source","Source")+" "+String(index+1);
    html+='<a href="'+esc(source.url)+'" target="_blank" rel="noopener">'+esc(label)+'</a>';
  });
  return html+'</div></section>';
}
function placeRecordRows(records,language){
  const list=arr(records);
  if(!list.length)return "";
  return '<div class="aoExplorePlaceRows">'+list.map(item=>
    '<button type="button" class="aoExplorePlaceRow" data-explore-place-item="'+esc(item.item_id)+'" data-explore-place-lens="'+esc(item.lens)+'">'
    +'<span><small>'+esc(item.eyebrow||lensLabel(language,item.lens))+'</small><strong>'+esc(translatedTitle(item,language)||"")+'</strong></span>'
    +(item.status?'<i>'+esc(item.status)+'</i>':"")
    +'</button>'
  ).join("")+'</div>';
}
function placeSources(profile,language){
  const links=arr(profile?.sources).filter(source=>source?.url);
  if(!links.length)return "";
  return '<section class="aoFindSources"><details class="aoPlaceAccordion"><summary>'+esc(L(language,"Sources and geographic evidence","Sources et références géographiques"))+' · '+links.length+'</summary><div>'
    +links.map(source=>'<a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.issuer||source.title||L(language,"Source","Source"))+'</a>').join("")
    +'</div></details></section>';
}
function placeSheet(vm){
  const profile=vm.selectedPlace;if(!profile)return "";
  let html='<div class="aoFindSheetBackdrop" data-find-close-place><section class="aoFindSheet aoExplorePlaceSheet" role="dialog" aria-modal="true" data-explore-place-owner="'+esc(profile.place_id)+'">';
  html+='<header><div><small>'+esc(L(vm.language,"PLACE","LIEU"))+'</small><h2>'+esc(profile.name||"")+'</h2>';
  if(profile.address_label)html+='<p>'+esc(profile.address_label)+'</p>';
  html+='</div><button type="button" data-find-close-place aria-label="'+esc(L(vm.language,"Close","Fermer"))+'">'+uiIcon("ao-ui-close")+'</button></header>';

  html+='<div class="aoExploreFullBack"><button type="button" data-explore-collapse-place>'+esc(L(vm.language,"← Back to place preview","← Retour à l’aperçu"))+'</button></div>';
  if(arr(profile.aliases).length)html+='<p class="aoExploreLead">'+esc(profile.aliases.join(" · "))+'</p>';
  if(profile.geo?.indicative_only)html+='<p class="aoExploreLead">'+esc(L(vm.language,"Indicative map pin only — nearby reference point, not the shrine entrance.","Repère cartographique indicatif — point de référence à proximité, et non entrée du sanctuaire.")+(profile.geo.reference_point_name?" · "+profile.geo.reference_point_name:""))+"</p>";

  // The place opens as a reader, not a dashboard of zero-valued record counters.
  const synopsis=sacredPlaceSynopsis(profile,{maxLength:550,language:vm.language});
  if(synopsis)html+='<p class="aoHeritageOverview">'+esc(synopsis)+'</p>';
  if(profile.directions_url)html+='<div class="aoFindActions"><a href="'+esc(profile.directions_url)+'" target="_blank" rel="noopener noreferrer">'+esc(L(vm.language,"Directions","Itinéraire"))+'</a></div>';
  html+='<p class="aoHeritageMeta">'+esc(L(vm.language,"Explore documented history, devotions and original sources below.","Découvrez l’histoire, les dévotions et les sources originales ci-dessous."))+'</p>';

  if(arr(profile.related_places).length){
    html+='<section class="aoExplorePlaceGroup" data-explore-related-places><small>'+esc(L(vm.language,"RELATED PLACES","LIEUX ASSOCIÉS"))+'</small><div class="aoExplorePlaceRows">';
    for(const related of profile.related_places){
      const description=vm.language==="fr"?related.description_fr:related.description_en;
      html+='<button type="button" class="aoExplorePlaceRow" data-explore-open-place="'+esc(related.place_id)+'">'
        +'<span><strong>'+esc(related.title)+'</strong>'
        +(description?'<small>'+esc(description)+'</small>':"")
        +(related.address_label?'<small>'+esc(related.address_label)+'</small>':"")
        +'</span></button>';
    }
    html+='</div></section>';
  }

  if(arr(profile.saints).length){
    html+='<section class="aoExplorePlaceGroup"><small>'+esc(L(vm.language,"ASSOCIATED SAINTS","SAINTS ASSOCIÉS"))+'</small><p>'+esc(profile.saints.join(" · "))+'</p></section>';
  }

  if(arr(profile.novenas).length){
    html+='<section class="aoExplorePlaceGroup"><small>'+esc(L(vm.language,"RELATED NOVENAS & DEVOTIONS","NEUVAINES ET DÉVOTIONS ASSOCIÉES"))+'</small>';
    for(const novena of profile.novenas){
      const name=vm.language==="fr"?novena.title_fr:novena.title_en;
      html+='<article><div><strong>'+esc(name)+'</strong>'+(arr(novena.notes).length?'<p>'+esc(novena.notes.join(" "))+'</p>':"")+'</div><button type="button" data-explore-open-novena="'+esc(novena.id)+'">'+esc(L(vm.language,"Pray novena","Prier la neuvaine"))+'</button></article>';
    }
    html+='</section>';
  }

  if(arr(profile.calendar).length){
    html+='<section class="aoExplorePlaceGroup"><small>'+esc(L(vm.language,"CALENDAR","CALENDRIER"))+'</small>';
    for(const event of profile.calendar){
      html+='<article><strong>'+esc(event.title)+'</strong>'+(event.date_label?'<button type="button" data-explore-calendar-date="'+esc(event.date)+'">'+esc(event.date_label)+' →</button>':'<span>'+esc(L(vm.language,"Seasonal / local schedule","Saison / calendrier local"))+'</span>')+'</article>';
    }
    html+='</section>';
  }

  if(arr(profile.seasonal_pilgrimages).length){
    html+='<section class="aoExplorePlaceGroup"><small>'+esc(L(vm.language,"SEASONAL / VARIABLE PILGRIMAGE DATES","PÈLERINAGES SAISONNIERS / DATES VARIABLES"))+'</small>';
    for(const row of profile.seasonal_pilgrimages){
      html+='<article><strong>'+esc(row.title)+'</strong><span>'+esc(L(vm.language,"Check local programme","Voir le programme local"))+'</span></article>';
    }
    html+='</section>';
  }
  if(arr(profile.apparitions).length){
    html+='<section class="aoExplorePlaceGroup"><details class="aoPlaceAccordion"><summary>'+esc(L(vm.language,"APPARITION HISTORIES","HISTOIRE DES APPARITIONS"))+' · '+arr(profile.apparitions).length+'</summary>'+placeRecordRows(profile.apparitions,vm.language)+'</details></section>';
  }
  if(arr(profile.relics).length){
    html+='<section class="aoExplorePlaceGroup"><details class="aoPlaceAccordion"><summary>'+esc(L(vm.language,"RELICS & CUSTODY","RELIQUES ET LIEUX DE CONSERVATION"))+' · '+arr(profile.relics).length+'</summary>'+placeRecordRows(profile.relics,vm.language)+'</details></section>';
  }
  if(arr(profile.shrines).length){
    html+='<section class="aoExplorePlaceGroup"><details class="aoPlaceAccordion"><summary>'+esc(L(vm.language,"SACRED SITE","LIEU SACRÉ"))+' · '+arr(profile.shrines).length+'</summary>'+placeRecordRows(profile.shrines,vm.language)+'</details></section>';
  }
  if(arr(profile.traditions).length){
    html+='<section class="aoExplorePlaceGroup"><details class="aoPlaceAccordion"><summary>'+esc(L(vm.language,"TRADITIONS & DEVOTIONAL CONTEXT","TRADITIONS & CONTEXTE DÉVOTIONNEL"))+' · '+arr(profile.traditions).length+'</summary>'+placeRecordRows(profile.traditions,vm.language)+'</details></section>';
  }
  if(arr(profile.pilgrimages).length){
    html+='<section class="aoExplorePlaceGroup"><details class="aoPlaceAccordion"><summary>'+esc(L(vm.language,"PILGRIMAGES","PÈLERINAGES"))+' · '+arr(profile.pilgrimages).length+'</summary>'+placeRecordRows(profile.pilgrimages,vm.language)+'</details></section>';
  }

  // Never show a giant empty TLM section on every shrine page. Exact
  // Directory relationships remain accessible when source-verified.
  html+='<section class="aoExplorePlaceGroup"><details class="aoPlaceAccordion"><summary>'+esc(L(vm.language,"TLM AT THIS EXACT PLACE","MESSE TRADITIONNELLE EN CE LIEU EXACT"))+'</summary>';
  if(arr(profile.tlm).length)html+=placeRecordRows(profile.tlm,vm.language);
  else html+='<p>'+esc(L(vm.language,"No TLM venue is currently linked to this exact Place. This does not make any claim about nearby Masses.","Aucun lieu de messe traditionnelle n’est actuellement relié à ce lieu exact. Cela ne dit rien des messes célébrées à proximité."))+'</p>';
  html+='</details></section>';
  html+=placeSources(profile,vm.language);
  html+='<footer><small>'+esc(L(vm.language,"This page aggregates records by canonical Place ID. It does not infer relationships from geographic proximity.","Cette page agrège les fiches par identifiant canonique de lieu. Elle ne déduit aucune relation de la seule proximité géographique."))+'</small>';
  if(profile?.geo?.attribution)html+='<small class="aoFindGeoAttribution">'+esc(profile.geo.attribution)+'</small>';
  html+='</footer></section></div>';
  return html;
}

const translatedTitle=(item,language)=>language==="fr"&&item?.title_fr?item.title_fr:item?.title;
const translatedSummary=(item,language)=>language==="fr"&&item?.summary_fr?item.summary_fr:item?.summary;
function itemCard(item,vm){
  return '<button type="button" class="aoFindCard aoExploreCard" data-explore-item="'+esc(item.item_id)+'" data-explore-lens="'+esc(item.lens)+'">'
    +'<span class="aoFindCardTop"><small>'+esc(item.eyebrow||lensLabel(vm.language,item.lens))+'</small><i class="aoFindStatus" data-state="'+esc(item.map_publishable?"YES":"UNKNOWN")+'">'+esc(item.status||"")+'</i></span>'
    +'<strong>'+esc(translatedTitle(item,vm.language)||"")+'</strong>'
    +(item.subtitle?'<span>'+esc(item.subtitle)+'</span>':"")
    +(item.summary&&item.kind!=="TLM_VENUE"?'<p>'+esc(String(translatedSummary(item,vm.language)).slice(0,130))+'</p>':"")
    +'</button>';
}
// Map and list use the same two-stage pattern: compact preview first,
// then detailed records and their source links on deliberate request.
function compactExploreItemSheet(vm){
  const item=vm.selected;
  if(!item)return "";
  const lang=vm.language;
  const title=translatedTitle(item,lang)||"";
  const area=[item.subtitle||"",item.subtitle?"":addressText(item.address)].filter(Boolean).join("");
  const fullSummary=String(translatedSummary(item,lang)||"").replace(/\s+/g," ").trim();
  const max=210;
  const summary=fullSummary.length>max
    ?fullSummary.slice(0,max).replace(/\s+\S*$/,"")+"…":fullSummary;
  const isMass=item.kind==="TLM_VENUE";
  const isRelic=item.lens==="relics";
  const isApparition=item.lens==="apparitions";
  let html='<div class="aoFindSheetBackdrop" data-find-close-detail><section class="aoFindSheet aoExploreQuickPreview" role="dialog" aria-modal="true" aria-label="'+esc(title)+'" data-explore-preview="'+esc(item.item_id)+'">';
  html+='<div class="aoHeritageSheetHandle" aria-hidden="true"></div>';
  html+='<header><div><small>'+esc(item.eyebrow||lensLabel(lang,item.lens))+'</small><h2>'+esc(title)+'</h2>';
  if(area)html+='<p>'+esc(area)+'</p>';
  html+='</div><button type="button" data-find-close-detail aria-label="'+esc(L(lang,"Close","Fermer"))+'">'+uiIcon("ao-ui-close")+'</button></header>';
  if(summary)html+='<p class="aoExplorePreviewSynopsis">'+esc(summary)+'</p>';
  if(isMass)html+='<p class="aoExplorePreviewCaution">'+esc(L(lang,
    "Provisional venue. Current Mass times, entrance and the una-cum status of individual celebrations are not verified.",
    "Lieu provisoire. Horaires actuels, entrée et caractère una cum de chaque célébration non vérifiés."))+'</p>';
  else if(item.geo?.approximate||item.geo?.indicative_only)html+='<p class="aoExplorePreviewCaution">'+esc(L(lang,
    "Map position is indicative, not a verified entrance.",
    "Position indicative, non une entrée vérifiée."))+'</p>';
  if(isRelic||isApparition)html+='<p class="aoExplorePreviewCaution">'+esc(isRelic
    ?L(lang,"Reported custody does not authenticate a relic.","Le lieu de conservation rapporté n’authentifie pas la relique.")
    :L(lang,"A reported apparition is not thereby authenticated.","Un récit d’apparition ne constitue pas une authentification."))+'</p>';
  html+='<div class="aoExplorePreviewActions">';
  html+='<button type="button" data-explore-expand-detail>'+esc(L(lang,
    "Details & sources","Détails et sources"))+' <span aria-hidden="true">→</span></button>';
  const primary=arr(item.actions).find(action=>action?.url&&action?.label==="Website");
  if(primary)html+='<a href="'+esc(primary.url)+'" target="_blank" rel="noopener noreferrer">'+esc(L(lang,"Official site","Site officiel"))+'</a>';
  html+='</div>';
  const sources=arr(item.source_links).length;
  if(sources)html+='<small class="aoExplorePreviewSourceCount">'+esc(String(sources))+' '+esc(L(lang,
    sources===1?"source in details":"sources in details",
    sources===1?"source dans la fiche":"sources dans la fiche"))+'</small>';
  return html+'</section></div>';
}
function detailSheet(vm){
  const item=vm.selected;if(!item)return "";
  let html='<div class="aoFindSheetBackdrop" data-find-close-detail><section class="aoFindSheet" role="dialog" aria-modal="true">';
  html+='<header><div><small>'+esc(item.eyebrow||lensLabel(vm.language,item.lens))+'</small><h2>'+esc(translatedTitle(item,vm.language)||"")+'</h2>';
  if(item.subtitle)html+='<p>'+esc(item.subtitle)+'</p>';
  html+='</div><button type="button" data-find-close-detail aria-label="'+esc(L(vm.language,"Close","Fermer"))+'">'+uiIcon("ao-ui-close")+'</button></header>';

  html+='<div class="aoExploreFullBack"><button type="button" data-explore-collapse-detail>'+esc(L(vm.language,"← Back to preview","← Retour à l’aperçu"))+'</button></div>';
  if(item.summary)html+='<p class="aoExploreLead">'+esc(translatedSummary(item,vm.language))+'</p>';
  if(item.geo?.indicative_only)html+='<p class="aoExploreLead">'+esc(L(vm.language,"Indicative map pin only — nearby reference point, not the shrine entrance.","Repère cartographique indicatif — point de référence à proximité, et non entrée du sanctuaire.")+(item.geo.reference_point_name?" · "+item.geo.reference_point_name:""))+"</p>";

  if(arr(item.facts).length){
    html+='<div class="aoFindFacts">';
    for(const fact of item.facts){
      html+='<div><small>'+esc(factLabel(vm.language,fact.label))+'</small><strong>'+esc(fact.value)+'</strong></div>';
    }
    html+='</div>';
  }

  if(item.kind==="CANONICAL_CUSTOM"&&arr(item.attestation_examples).length){
    html+='<details class="aoTraditionEvidence"><summary>'+esc(L(vm.language,"Documented examples","Exemples documentés"))+' ('+item.attestation_examples.length+')</summary>';
    for(const example of item.attestation_examples){
      html+='<article><strong>'+esc(example.title)+'</strong>';
      if(example.period)html+='<small>'+esc(example.period)+'</small>';
      if(example.body)html+='<p>'+esc(example.body)+'</p>';
      if(example.place_id)html+='<button type="button" data-explore-open-place="'+esc(example.place_id)+'">'+esc(L(vm.language,"View this place","Voir ce lieu"))+'</button>';
      html+='</article>';
    }
    html+='</details>';
  }

  if(arr(item.sections).length){
    html+='<section class="aoFindSchedules aoExploreSections">';
    for(const section of item.sections){
      html+='<article><small>'+esc(vm.language==="fr"&&section.label_fr?section.label_fr:section.label||"")+'</small>';
      if(section.title)html+='<strong>'+esc(vm.language==="fr"&&section.title_fr?section.title_fr:section.title)+'</strong>';
      if(section.body)html+='<p>'+esc(vm.language==="fr"&&section.body_fr?section.body_fr:section.body)+'</p>';
      html+='</article>';
    }
    html+='</section>';
  }

  const address=addressText(item.address);
  if(address){
    html+='<section class="aoExploreAddress"><small>'+esc(L(vm.language,"PLACE","LIEU"))+'</small><p>'+esc(address)+'</p></section>';
  }

  if(arr(item.actions).length||item.place_id){
    html+='<section class="aoFindActions">';
    if(item.place_id)html+='<button type="button" data-explore-open-place="'+esc(item.place_id)+'">'+esc(L(vm.language,"Place page","Voir le lieu"))+'</button>';
    for(const action of item.actions){
      if(action?.novena_id){
        html+='<button type="button" data-explore-open-novena="'+esc(action.novena_id)+'">'+esc(L(vm.language,"Open novena","Ouvrir la neuvaine"))+'</button>';
        continue;
      }
      html+='<a href="'+esc(action.url)+'" target="_blank" rel="noopener">'+esc(
        action.label==="Directions"?L(vm.language,"Directions","Itinéraire"):
        action.label==="Destination"?L(vm.language,"Destination","Destination"):
        action.label==="Website"?L(vm.language,"Website","Site"):action.label
      )+'</a>';
    }
    html+='</section>';
  }

  html+=sourceLinks(item,vm.language);
  html+='<footer><small>'+esc(item.note||L(vm.language,"Source-backed Explore record.","Fiche Explore sourcée."))+'</small>';
  if(item?.geo?.attribution)html+='<small class="aoFindGeoAttribution">'+esc(item.geo.attribution)+'</small>';
  html+='</footer></section></div>';
  return html;
}
function emptyState(vm){
  if(vm.lens==="tlm"&&vm.unavailableProviders.length){
    return '<section class="aoFindEmpty"><strong>'+esc(L(vm.language,"Directory snapshot incomplete","Instantané de l’annuaire incomplet"))+'</strong>'
      +'<p>'+esc(L(vm.language,"Some official-source corpora are unavailable in this build. Explore does not invent missing venues.","Certains corpus de sources officielles sont indisponibles dans cette version. Explore n’invente pas les lieux manquants."))+'</p>'
      +'<small>'+esc(L(vm.language,"Unavailable sources: ","Sources indisponibles : ")+vm.unavailableProviders.join(", ").toUpperCase())+'</small></section>';
  }
  return '<section class="aoFindEmpty"><strong>'+esc(L(vm.language,"No matching records","Aucune fiche correspondante"))+'</strong><p>'+esc(L(vm.language,"Try a broader search or another Explore lens.","Essayez une recherche plus large ou un autre volet d’Explore."))+'</p></section>';
}
function tlmFilters(vm){
  const f=vm.filters??{},aff=arr(f.affiliations);
  if(Object.hasOwn(f,"directoryGroup")){
    let html='<section class="aoFindFilters aoExploreTlmFilters" aria-label="'+esc(L(vm.language,"Mass venue filters","Filtres des lieux de messe"))+'">';
    html+='<div class="aoExploreQuickFilters"><span class="aoExploreFilterLabel">'+esc(L(vm.language,"Show","Afficher"))+'</span>';
    html+=pill("directoryGroup","ROME",L(vm.language,"Communities in communion with Rome","Communautés en communion avec Rome"),f.directoryGroup);
    html+=pill("directoryGroup","ALL",L(vm.language,"All","Tous"),f.directoryGroup);
    html+=pill("directoryGroup","SSPX","SSPX",f.directoryGroup);
    html+=pill("directoryGroup","UNKNOWN",L(vm.language,"Unclassified","Non classés"),f.directoryGroup);
    html+='</div><details class="aoExploreAdvancedFilters"><summary>'+esc(L(vm.language,"Affiliation filters","Filtres par affiliation"))+'</summary>';
    html+='<section><small>'+esc(L(vm.language,"SOURCE-REPORTED COMMUNITY","COMMUNAUTÉ SELON LES SOURCES"))+'</small><div class="aoFindAffiliations">';
    for(const id of ["DIOCESAN","FSSP","ICKSP","IBP","SSPX","OTHER"])
      html+='<button type="button" data-find-affiliation="'+id+'" class="'+(aff.includes(id)?"active":"")+'" aria-pressed="'+String(aff.includes(id))+'">'+esc(id==="DIOCESAN"?L(vm.language,"Diocesan","Diocésain"):id)+'</button>';
    html+='</div></section></details>';
    html+='<p class="aoPreliminaryDirectoryNotice">'+esc(L(vm.language,
      "Preliminary locations only. Affiliation comes from listings; an individual Mass’s una-cum status, current celebration and timetable have not been checked. Consult the linked source before visiting.",
      "Lieux provisoires. L’appartenance est indiquée selon les sources ; le caractère una cum de chaque messe, sa célébration actuelle et ses horaires restent à vérifier. Consultez la source avant toute visite."))+'</p>';
    return html+'</section>';
  }
  let html='<div class="aoFindFilters aoExploreTlmFilters">';
  html+='<div class="aoExploreQuickFilters"><span class="aoExploreFilterLabel">'+esc(L(vm.language,"When","Quand"))+'</span>'
    +pill("day","ANY",L(vm.language,"Any day","Tous les jours"),f.day||"ANY")
    +pill("day","TODAY",L(vm.language,"Today","Aujourd’hui"),f.day||"ANY")
    +pill("day","SUNDAY",L(vm.language,"Sunday","Dimanche"),f.day||"ANY")
    +'</div>';
  html+='<details class="aoExploreAdvancedFilters"><summary>'+esc(L(vm.language,"More filters","Plus de filtres"))+'</summary>';
  html+='<section><small>'+esc(L(vm.language,"COMMUNITY / PROVIDER","COMMUNAUTÉ / INSTITUT"))+'</small><div class="aoFindAffiliations">';
  for(const id of ["DIOCESAN","FSSP","ICKSP","SSPX","IBP","OTHER"])html+='<button type="button" data-find-affiliation="'+id+'" class="'+(aff.includes(id)?"active":"")+'" aria-pressed="'+String(aff.includes(id))+'">'+id+'</button>';
  html+='</div></section><section><small>'+esc(L(vm.language,"COMMUNION STATUS","STATUT DE COMMUNION"))+'</small><div>';
  html+=pill("unaCum","ANY",L(vm.language,"Any status","Tout statut"),f.unaCum||"ANY")+pill("unaCum","YES","Una cum",f.unaCum||"ANY")+pill("unaCum","NO","Non-una cum",f.unaCum||"ANY")+pill("unaCum","UNKNOWN",L(vm.language,"Unknown","Inconnu"),f.unaCum||"ANY");
  html+='</div></section><section><small>'+esc(L(vm.language,"LITURGY","LITURGIE"))+'</small><div>'+pill("liturgy","ANY",L(vm.language,"Any liturgy","Toute liturgie"),f.liturgy||"ANY")+pill("liturgy","1962","1962",f.liturgy||"ANY")+pill("liturgy","PRE_1955","Pre-1955",f.liturgy||"ANY")+pill("liturgy","DOMINICAN","Dominican",f.liturgy||"ANY")+'</div></section><section><small>'+esc(L(vm.language,"MASS TYPE","TYPE DE MESSE"))+'</small><div>';
  for(const id of ["ANY","LOW","SUNG","SOLEMN"])html+=pill("massType",id,id==="ANY"?L(vm.language,"Any Mass type","Tout type de messe"):id,f.massType||"ANY");
  return html+'</div></section></details></div>';
}

export function buildExploreViewModel({
  language="en",
  items=[],
  lens="tlm",
  counts={},
  atlasFacets=null,
  loadedProviders=[],
  unavailableProviders=[],
  view="list",
  filters={},
  selectedId=null,
  selectedOverride=null,
  placeProfiles=[],
  selectedPlaceId=null,
  expandPlace=false,
  expandDetail=false,
  customCards=[],
  displayLimit=120,
}={}){
  const list=arr(items);
  const selected=list.find(item=>item?.item_id===selectedId)??selectedOverride??null;
  const selectedPlace=arr(placeProfiles).find(profile=>profile?.place_id===selectedPlaceId)??null;
  const mapped=list.filter(item=>item?.map_publishable).length;
  const addressOnly=list.filter(item=>!item?.map_publishable&&item?.address).length;
  return Object.freeze({
    language,
    items:list,
    lens,
    counts,
    atlasFacets,
    loadedProviders:arr(loadedProviders),
    unavailableProviders:arr(unavailableProviders),
    view,
    filters,
    selected,
    selectedPlace,
    expandPlace:Boolean(expandPlace),
    expandDetail:Boolean(expandDetail),
    customCards:arr(customCards),
    mapped,
    addressOnly,
    displayLimit:Number.isFinite(Number(displayLimit))?Math.max(24,Math.floor(Number(displayLimit))):24,
  });
}

export function renderExploreToString(vm){
  if(vm.lens==="heritage")return renderHeritageToString(vm,{placeSheet,detailSheet,itemPreview:compactExploreItemSheet});
  const f=vm.filters??{},loaded=vm.lens==="tlm"&&vm.loadedProviders.length?vm.loadedProviders.join(" · ").toUpperCase():String(vm.counts?.[vm.lens]??vm.items.length);
  let html='<section class="aoFindSurface aoExploreSurface" data-ao-find-owner="AO_FIND_APP_V1" data-ao-explore-owner="EXPLORE_V1">';
  html+='<header class="aoFindHeader"><button type="button" data-find-close aria-label="'+esc(L(vm.language,"Back","Retour"))+'">'+uiIcon("ao-ui-back")+'</button><div><small>AD ORIENTEM · EXPLORE</small><h1>'+esc(vm.lens==="tlm"?L(vm.language,"Traditional Mass","Messe traditionnelle"):lensLabel(vm.language,vm.lens))+'</h1></div><button type="button" data-find-glossary aria-label="'+esc(L(vm.language,"Terms and definitions","Termes et définitions"))+'">?</button><span>'+esc(loaded)+'</span></header>';

  html+='<p class="aoFindActionError" data-find-action-error role="alert" hidden></p>';
  html+='<nav class="aoExploreSectionNav" aria-label="'+esc(L(vm.language,"Explore navigation","Navigation Explorer"))+'">';
  html+='<span>'+esc(L(vm.language,"SACRED GEOGRAPHY","GÉOGRAPHIE SACRÉE"))+' · '+esc(lensLabel(vm.language,vm.lens))+'</span>';
  html+='<details class="aoExploreSectionSwitcher"><summary>'+esc(L(vm.language,"Other sections","Autres sections"))+'</summary><div>';
  html+='<button type="button" data-find-filter="lens" data-find-filter-value="heritage">'+esc(L(vm.language,"Sacred places map","Carte des lieux sacrés"))+'</button>';
  for(const lens of ["tlm","shrines","apparitions","relics","traditions","pilgrimages"]){
    if(lens===vm.lens)continue;
    html+='<button type="button" data-find-filter="lens" data-find-filter-value="'+esc(lens)+'">'+esc(lensLabel(vm.language,lens))+'</button>';
  }
  html+='</div></details></nav>';
  if(vm.lens==="traditions")html+=customsAtlasPanel(vm);
  if(vm.lens==="pilgrimages"&&f.calendarKey)html+='<section class="aoExploreCalendarBridge"><span>'+esc(L(vm.language,"Pilgrimages associated with this Calendar observance","Pèlerinages associés à cette célébration du calendrier"))+' · '+esc(f.calendarKey)+'</span><button type="button" data-find-clear-calendar>'+esc(L(vm.language,"Show all pilgrimages","Tous les pèlerinages"))+'</button></section>';

  html+='<div class="aoFindSearch"><input type="search" data-find-query value="'+esc(f.query||"")+'" placeholder="'+esc(
    vm.lens==="tlm"?L(vm.language,"City, church, diocese or country","Ville, église, diocèse ou pays"):
    vm.lens==="shrines"?L(vm.language,"Shrine, saint or place","Sanctuaire, saint ou lieu"):
    vm.lens==="apparitions"?L(vm.language,"Apparition, witness, place","Apparition, témoin, lieu"):
    vm.lens==="relics"?L(vm.language,"Relic, saint, place","Relique, saint, lieu"):
    vm.lens==="traditions"?L(vm.language,"Custom, region, period or place","Coutume, région, période ou lieu"):
    L(vm.language,"Pilgrimage, shrine, route or place","Pèlerinage, sanctuaire, itinéraire ou lieu")
  )+'"></div>';

  if(vm.lens==="tlm")html+='<section class="aoFindExternalSource" role="note">'
    +'<div><strong>'+esc(L(vm.language,"More Mass locations","Autres lieux de messe"))+'</strong>'
    +'<span>'+esc(L(vm.language,"Other directories may have additional locations. Always confirm current Mass times with the priest or parish.","D’autres annuaires peuvent signaler des lieux supplémentaires. Vérifiez toujours les horaires actuels auprès du prêtre ou de la paroisse."))+'</span></div>'
    +'<a href="https://www.latinmass.com/find-latin-mass" target="_blank" rel="noopener noreferrer">'+esc(L(vm.language,"Mass of the Ages map ↗","Carte Mass of the Ages ↗"))+'</a>'
    +'<a href="https://www.latinmassdir.org/countries/" target="_blank" rel="noopener noreferrer">'+esc(L(vm.language,"Latin Mass Directory ↗","Latin Mass Directory ↗"))+'</a>'
    +'</section>';
  html+='<nav class="aoFindViewTabs">'+pill("view","list",vm.lens==="traditions"?L(vm.language,"Practices","Pratiques"):L(vm.language,"List","Liste"),vm.view)+pill("view","map",vm.lens==="traditions"?L(vm.language,"Attested places","Lieux attestés"):L(vm.language,"Map","Carte"),vm.view)+'</nav>';
  if(vm.lens==="tlm")html+=tlmFilters(vm);

  const noun=vm.lens==="tlm"?L(vm.language,"venues","lieux"):vm.lens==="shrines"?L(vm.language,"shrines","sanctuaires"):vm.lens==="apparitions"?L(vm.language,"apparition accounts","récits d’apparition"):vm.lens==="relics"?L(vm.language,"relic sites","lieux de reliques"):vm.lens==="traditions"?L(vm.language,vm.view==="list"?"practices":"attestations",vm.view==="list"?"pratiques":"attestations"):L(vm.language,"pilgrimages","pèlerinages");
  html+='<div class="aoFindResultMeta"><strong>'+String(vm.items.length)+'</strong><span>'+esc(noun)+'</span>';
  if(vm.mapped)html+='<span> · '+String(vm.mapped)+' '+esc(L(vm.language,"mapped","cartographiés"))+'</span>';
  if(vm.addressOnly)html+='<span> · '+String(vm.addressOnly)+' '+esc(L(vm.language,"address only","adresse seule"))+'</span>';
  if(vm.lens==="tlm"){
    const listed=vm.items.filter(x=>x.status==="SCHEDULE UNVERIFIED").length;
    if(listed)html+='<span> · '+String(listed)+' '+esc(L(vm.language,"directory-listed, unverified","répertoriés, non vérifiés"))+'</span>';
  }
  html+='</div>';

  html+='<div class="aoFindBody" data-find-view="'+esc(vm.view)+'" data-explore-lens="'+esc(vm.lens)+'">';
  if(vm.view==="map"){
    html+='<div class="aoFindMap" data-find-map><div class="aoFindMapFallback"><strong>'+esc(lensLabel(vm.language,vm.lens))+'</strong><span>'+esc(
      vm.mapped
        ?L(vm.language,"Loading source-backed map points…","Chargement des points cartographiques sourcés…")
        :vm.addressOnly
          ?L(vm.language,"These records have canonical addresses, but no publishable coordinates yet. Use List for full access.","Ces fiches ont des adresses canoniques, mais pas encore de coordonnées publiables. Utilisez Liste pour tout consulter.")
          :L(vm.language,"No publishable map points in this lens yet.","Aucun point cartographique publiable dans ce volet pour le moment.")
    )+'</span></div></div>';
    if(["apparitions","relics"].includes(vm.lens))html+='<p class="aoExploreSacredCaution">'+esc(vm.lens==="apparitions"?L(vm.language,"Historical accounts and ecclesiastical recognition are not identical to an authenticated supernatural event.","Les récits historiques et leur accueil ecclésial ne prouvent pas, à eux seuls, l’origine surnaturelle des phénomènes."):L(vm.language,"These pins identify reported custody or veneration, not independent authentication of any relic.","Ces repères indiquent un lieu de conservation ou de vénération, sans authentification indépendante des reliques."))+'</p>';
    if(vm.lens==="tlm"&&vm.mapped){
      html+='<div class="aoMapLegend" role="note" aria-label="'+esc(L(vm.language,"Map legend","Légende de la carte"))+'">'
        +'<span class="aoMapLegendLabel">'+esc(Object.hasOwn(f,"directoryGroup")?L(vm.language,"Source affiliation","Affiliation selon les sources"):L(vm.language,"Celebrated by","Célébrée par"))+'</span>'
        +'<span data-group="FSSP">FSSP</span><span data-group="ICKSP">ICKSP</span>'
        +'<span data-group="SSPX">SSPX</span><span data-group="DIOCESAN">'+esc(L(vm.language,"Diocesan","Diocésain"))+'</span>'
        +'<span data-group="OTHER">'+esc(L(vm.language,"Other","Autre"))+'</span>'
        +'<small>'+esc(Object.hasOwn(f,"directoryGroup")?L(vm.language,"All pins provisional; exact entrances and Mass times are not verified.","Tous les repères sont provisoires ; entrées exactes et horaires des messes non vérifiés."):L(vm.language,"Approximate points use a softer outline. Address-only venues remain available in List.","Les lieux à position approximative sont atténués. Les adresses sans coordonnées fiables restent en liste."))+'</small>'
        +'</div>';
    }
  }else if(vm.items.length){
    const visible=vm.items.slice(0,vm.displayLimit);
    html+='<div class="aoFindList">'+visible.map(item=>itemCard(item,vm)).join("")+'</div>';
    if(visible.length<vm.items.length)html+='<div class="aoFindMore"><span>'+esc(L(vm.language,"Showing ","Affichage de "))+visible.length+' / '+vm.items.length+'</span>'
      +'<button type="button" data-find-show-more>'+esc(L(vm.language,"Show more results","Afficher plus de résultats"))+'</button></div>';
  }else html+=emptyState(vm);
  html+='</div>'+(vm.selectedPlace?(vm.expandPlace?placeSheet(vm):""):(vm.selected?(vm.expandDetail?detailSheet(vm):compactExploreItemSheet(vm)):""))+'</section>';
  return html;
}
