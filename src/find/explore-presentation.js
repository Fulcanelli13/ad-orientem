import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { MASS_EMBLEM_GROUPS, massInstitutionEmblem } from "./institution-emblems.js";
import { renderDirectoryVenueCard,eligibleDirectoryImage,renderDirectoryGallery,renderDirectoryIdentityFallback } from "./directory-card.js";
import { renderHeritageToString, compactHeritagePlaceSheet, sacredPlaceSynopsis, placeTypeLabel } from "./heritage-presentation.js";
import { renderPilgrimageJourneyPanel, journeysForCanonicalPlace } from "./pilgrimage-journey.js";
import { renderSaintPlaceSheet,renderSaintSourceIndexSheet } from "./saints-presentation.js";
import { renderPlaceEditorialOpening,renderPlaceSacredTreasures,renderPlaceCustoms } from "./place-editorial-presentation.js";
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
  saints:["Saints","Saints"],
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
  html+='<button type="button" class="aoCustomsLibraryLaunch" data-explore-customs-library>'+esc(L(language,
    "Open Customs & Traditions — all seasons, daily life and historical sources",
    "Ouvrir Coutumes & Traditions — saisons, vie quotidienne et sources historiques"))+' →</button>';
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
    +'<span><small>'+esc((language==="fr"&&item.eyebrow_fr)||item.eyebrow||lensLabel(language,item.lens))+'</small><strong>'+esc(translatedTitle(item,language)||"")+'</strong></span>'
    +(item.status?'<i>'+esc(item.status)+'</i>':"")
    +'</button>'
  ).join("")+'</div>';
}
function placeSources(profile,language){
  const links=arr(profile?.sources).filter(source=>source?.url);
  if(!links.length)return "";
  return '<section class="aoFindSources" data-explore-place-chapter="sources"><details class="aoPlaceAccordion"><summary>'+esc(L(language,"Sources and geographic evidence","Sources et références géographiques"))+' · '+links.length+'</summary><div>'
    +links.map(source=>'<a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.issuer||source.title||L(language,"Source","Source"))+'</a>').join("")
    +'</div></details></section>';
}

/** A Place's rights-approved photo gallery belongs to the physical Place,
 * not to its optional illustrated pilgrimage guide. */
function placeGalleryHtml(profile,language){
 const gallery=arr(profile?.gallery);
 if(!gallery.length)return "";
 const loc=(item,key)=>item?.[key+"_"+language]??item?.[key+"_en"]??"";
 const cite=(url,label)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label||L(language,"Original source","Source originale"))+' ↗</a>';
 let html='<section class="aoExploreGuideGallery" data-explore-place-chapter="gallery" aria-label="'+esc(L(language,"Photographs of this pilgrimage place","Photographies de ce lieu de pèlerinage"))+'">'
    +'<h4>'+esc(L(language,"The place in photographs","Le lieu en images"))+'</h4><div class="aoExploreGalleryGrid">';
 for(const image of gallery){
  html+='<figure class="aoExploreGalleryImage" data-gallery-image="'+esc(image.media_id)+'">'
    +'<img loading="lazy" decoding="async" src="'+esc(image.asset_path)+'" alt="'+esc(loc(image,"alt"))+'">'
    +'<figcaption><strong>'+esc(loc(image,"label"))+'</strong><span>'+esc(image.credit)+' · '+esc(image.license)+'</span>'
    +'<span class="aoExploreGalleryCredits">'+cite(image.source_url,L(language,"Photo source","Source de la photographie"))
    +cite(image.license_url,L(language,"Licence","Licence"))+'</span>'
    +'<small>'+esc(loc(image,"changes"))+'</small></figcaption></figure>';
 }
 return html+'</div></section>';
}

function illustratedGuideHtml(profile,language){
 const guide=profile?.illustrated_guide;if(!guide)return "";
 const loc=(item,key)=>item?.[key+"_"+language]??item?.[key+"_en"]??"";
 const cite=(url,label)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label||L(language,"Original source","Source originale"))+' ↗</a>';
 let html='<section class="aoExploreIllustratedGuide" data-explore-place-chapter="guide" aria-label="'+esc(L(language,"Pilgrimage guide","Guide du pèlerin"))+'">';
 html+='<header class="aoExploreGuideIntro"><small>'+esc(L(language,"PILGRIMAGE GUIDE","GUIDE DU PÈLERIN"))+'</small><h3>'+esc(loc(guide,"subtitle"))+'</h3><p>'+esc(loc(guide,"region"))+'</p><div class="aoExploreStoryEvidence">'+cite(guide.official_url,L(language,"Official website","Site officiel"))+'</div></header>';

 for(const section of arr(guide.sections)){
  html+='<section class="aoExploreGuideSection"><h4>'+esc(loc(section,"title"))+'</h4>';
  for(const row of arr(section.paragraphs))html+='<article class="aoExploreGuideParagraph"><p>'+esc(row?.[language]||row?.en||"")+'</p><div class="aoExploreStoryEvidence">'+cite(row?.source_url,L(language,"Historical source","Source historique"))+'</div></article>';
  html+='</section>';
 }
 if(arr(guide.stops).length){
  html+='<section class="aoExploreGuideSection"><h4>'+esc(L(language,"Sacred places to see","Lieux sacrés à découvrir"))+'</h4><div class="aoExploreGuideStops">';
  for(const row of guide.stops)html+='<article><h5>'+esc(loc(row,"name"))+'</h5><p>'+esc(loc(row,"description"))+'</p><div class="aoExploreStoryEvidence">'+cite(row.source_url)+'</div></article>';
  html+='</div></section>';
 }
 if(arr(guide.chronology).length){
  html+='<section class="aoExploreGuideSection"><h4>'+esc(L(language,"Historical timeline","Repères chronologiques"))+'</h4><ol class="aoExploreGuideTimeline">';
  for(const row of guide.chronology)html+='<li><time>'+esc(row.when)+'</time><div><strong>'+esc(loc(row,"title"))+'</strong><div class="aoExploreStoryEvidence">'+cite(row.source_url)+'</div></div></li>';
  html+='</ol></section>';
 }
 if(arr(guide.programmes).length){
  html+='<section class="aoExploreGuideSection"><h4>'+esc(L(language,"Dates and pilgrimage programmes","Dates et programmes de pèlerinage"))+'</h4>';
  for(const row of guide.programmes){
   const period=row.month_day?L(language,"Anniversary: ","Anniversaire : ")+row.month_day:row.start_date?(row.start_date+(row.end_date?" — "+row.end_date:"")):"";
   const yearSpecific=String(row.date_kind||"").includes("YEAR_SPECIFIC");
   html+='<article class="aoExploreGuideDate"><strong>'+esc(loc(row,"label"))+'</strong>'+(period?'<time>'+esc(period)+'</time>':"")+(yearSpecific?'<small>'+esc(L(language,"Published year only, not a recurring schedule","Année publiée uniquement ; dates non reconduites"))+'</small>':"")+'<p>'+esc(loc(row,"details"))+'</p><div class="aoExploreStoryEvidence">'+cite(row.source_url,L(language,"Official source","Source officielle"))+'</div></article>';
  }
  html+='</section>';
 }
 if(guide.visit)html+='<section class="aoExploreGuideSection aoExploreGuideVisit"><h4>'+esc(L(language,"Plan a visit","Préparer une visite"))+'</h4><p>'+esc(guide.visit?.[language]||guide.visit.en||"")+'</p><div class="aoExploreStoryEvidence">'+cite(guide.visit.source_url,L(language,"Check current information","Informations actuelles"))+'</div></section>';
 return html+'</section>';
}

function placeSheet(vm){
  const profile=vm.selectedPlace;if(!profile)return "";
  let html='<div class="aoFindSheetBackdrop" data-find-close-place><section class="aoFindSheet aoExplorePlaceSheet'+(profile.editorial_feature?' aoExplorePlaceEditorial':'')+'" role="dialog" aria-modal="true" data-explore-place-owner="'+esc(profile.place_id)+'">';
  html+='<header><div><small>'+(vm.journeyOpen?esc(L(vm.language,"PILGRIMAGE PLACE","LIEU DE PÈLERINAGE"))+' · ':(profile.editorial_feature?esc(L(vm.language,"IN FOCUS","À DÉCOUVRIR"))+' · ':""))+esc(placeTypeLabel(vm.language,profile.place_type))+'</small><h2>'+esc(profile.name||"")+'</h2>';
  if(profile.address_label)html+='<p>'+esc(profile.address_label)+'</p>';
  html+='</div><button type="button" data-find-close-place aria-label="'+esc(vm.journeyOpen?L(vm.language,"Return to pilgrimage journey","Retour au parcours de pèlerinage"):L(vm.language,"Close","Fermer"))+'">'+uiIcon("ao-ui-close")+'</button></header>';

  html+='<div class="aoExploreFullBack"><button type="button" data-explore-collapse-place>'+esc(L(vm.language,"← Back to place preview","← Retour à l’aperçu"))+'</button></div>';
  if(arr(profile.aliases).length)html+='<p class="aoExploreLead">'+esc(profile.aliases.join(" · "))+'</p>';
  if(profile.media){
    html+='<figure class="aoExplorePlaceMedia" data-photo-orientation="'+esc(profile.media.orientation)+'"><img loading="lazy" decoding="async" src="'+esc(profile.media.asset_path)+'" alt="'+esc(vm.language==="fr"?profile.media.alt_fr:profile.media.alt_en)+'">';
    html+='<figcaption>'+esc(profile.media.credit)+' · <a href="'+esc(profile.media.source_url)+'" target="_blank" rel="noopener noreferrer">'+L(vm.language,"Original source","Source originale")+'</a> · <a href="'+esc(profile.media.license_url)+'" target="_blank" rel="noopener noreferrer">'+esc(profile.media.license)+'</a> · '+esc(vm.language==="fr"?profile.media.changes_fr:profile.media.changes_en)+'</figcaption></figure>';
  }
  if(profile.geo?.indicative_only)html+='<p class="aoExploreLead">'+esc(L(vm.language,"Indicative map pin only — nearby reference point, not the shrine entrance.","Repère cartographique indicatif — point de référence à proximité, et non entrée du sanctuaire.")+(profile.geo.reference_point_name?" · "+profile.geo.reference_point_name:""))+"</p>";

  // Reciprocal navigation is restricted to independently documented canonical
  // journey identities. It is not generated from nearby pins or name matching.
  if(arr(vm.placeJourneys).length){
    html+='<section class="aoExplorePlaceGroup aoExplorePlaceJourneys" data-explore-place-journeys>'+
      '<h3>'+esc(L(vm.language,"Documented journeys associated with this place",
        "Parcours attestés associés à ce lieu"))+'</h3>';
    for(const journey of vm.placeJourneys){
      const detail=journey.relation==="RELATED_SHRINE_NOT_TERMINUS"
        ?L(vm.language,"Related Catholic shrine — NOT the pilgrimage terminus for this edition",
          "Sanctuaire catholique associé — PAS le terminus de cette édition")
        :journey.relation==="NAMED_STAGE"
        ?L(vm.language,"Published stage "+journey.ordinal,"Étape attestée "+journey.ordinal)
        :L(vm.language,"Linked pilgrimage destination place","Lieu de destination associé");
      html+='<button type="button" class="aoExplorePlaceJourneyRow" data-explore-place-journey="'+esc(journey.routeId)+'">'+
        '<strong>'+esc(journey.name)+'</strong>'+
        '<small>'+esc(detail)+'</small><span aria-hidden="true">→</span></button>';
    }
    html+='<p>'+esc(L(vm.language,
      "Published pilgrimage records; not live route navigation or current access information.",
      "Parcours documentés ; ni navigation GPS ni informations d’accès en temps réel."))+'</p></section>';
  }

  // Reader-first: only source-owned text and already linked devotions appear.
  // Chapter shortcuts scroll this Place sheet, never leave the application.
  const preferredCategory=arr(vm.filters?.heritageCategories).length===1?vm.filters.heritageCategories[0]:null;
  const synopsis=sacredPlaceSynopsis(profile,{maxLength:750,language:vm.language,preferredCategory});
  // A relic-only or apparition-only map selection must not silently inherit
  // a different Shrine account simply because the physical Place is shared.
  const storyKindForFilter={shrines:"ORIGIN",pilgrimages:"PILGRIMAGE",
    apparitions:"APPARITION",relics:"RELIC",traditions:"TRADITION"};
  const restricted=vm.lens==="heritage"&&arr(vm.filters?.heritageCategories).length===1
    ?arr(vm.filters.heritageCategories)[0]:null;
  const chapters=restricted&&storyKindForFilter[restricted]
    ?arr(profile.story_chapters).filter(row=>row.kind===storyKindForFilter[restricted])
    :arr(profile.story_chapters);
  const hasGuide=Boolean(profile.illustrated_guide);
  const hasEditorialIntro=Boolean(profile.editorial_intro);
  const hasTreasures=arr(profile.sacred_treasures).length>0;
  const hasSiteCustoms=arr(profile.site_customs).length>0;
  const publicTreasureIds=new Set(arr(profile.sacred_treasures).map(x=>x.id));
  const residualRelicRecords=arr(profile.relics).filter(item=>!publicTreasureIds.has(item.source_id));
  const hasGallery=arr(profile.gallery).length>0;
  const hasNovenas=arr(profile.novenas).length>0;
  const hasCalendar=arr(profile.calendar).length>0||arr(profile.seasonal_pilgrimages).length>0;
  const hasSources=arr(profile.sources).some(source=>source?.url);
  if(profile.editorial_feature||chapters.length||hasGuide||hasGallery||hasTreasures||hasSiteCustoms){
    html+='<nav class="aoExplorePlaceChapters" aria-label="'+esc(L(vm.language,"Explore this place","Explorer ce lieu"))+'">';
    if(chapters.length||synopsis||hasEditorialIntro)html+='<button type="button" data-explore-place-jump="story">'+esc(L(vm.language,"The place","Le lieu"))+'</button>';
    if(hasTreasures)html+='<button type="button" data-explore-place-jump="treasures">'+esc(L(vm.language,"Sacred treasures","Trésors sacrés"))+'</button>';
    if(hasSiteCustoms)html+='<button type="button" data-explore-place-jump="customs">'+esc(L(vm.language,"Local customs","Coutumes locales"))+'</button>';
    if(hasGallery)html+='<button type="button" data-explore-place-jump="gallery">'+esc(L(vm.language,"Photographs","Photographies"))+'</button>';
    if(hasGuide)html+='<button type="button" data-explore-place-jump="guide">'+esc(L(vm.language,"Pilgrimage guide","Guide du pèlerin"))+'</button>';
    if(hasNovenas)html+='<button type="button" data-explore-place-jump="pray">'+esc(L(vm.language,"Pray","Prier"))+'</button>';
    if(hasCalendar)html+='<button type="button" data-explore-place-jump="calendar">'+esc(L(vm.language,"Calendar","Calendrier"))+'</button>';
    if(profile.directions_url)html+='<button type="button" data-explore-place-jump="visit">'+esc(L(vm.language,"Visit","Visiter"))+'</button>';
    if(hasSources)html+='<button type="button" data-explore-place-jump="sources">'+esc(L(vm.language,"Sources","Sources"))+'</button>';
    html+='</nav>';
  }
  if(hasEditorialIntro)html+=renderPlaceEditorialOpening(profile.editorial_intro,vm.language);
  // Avoid repeating the same historical introduction already supplied by the
  // published guide; preserve the other separately sourced chapters.
  const visibleChapters=hasEditorialIntro&&!restricted?chapters.filter(x=>x.kind!=="ORIGIN"):chapters;
  if(visibleChapters.length){
    const KIND_LABELS={
      ORIGIN:["The sanctuary","Le sanctuaire"],
      PILGRIMAGE:["Pilgrimage","Pèlerinage"],
      APPARITION:["Apparition account","Récit d’apparition"],
      RELIC:["Relics and custody","Reliques et conservation"],
      TRADITION:["Devotional practice","Pratique dévotionnelle"],
    };
    html+='<section class="aoExplorePlaceOpening aoExploreSourcedStory" data-explore-place-chapter="story"><small>'+esc(L(vm.language,"THE PLACE","LE LIEU"))+'</small>';
    for(const [index,chapter] of visibleChapters.entries()){
      const caption=KIND_LABELS[chapter.kind]??["Record","Fiche"];
      const narrative=vm.language==="fr"?chapter.body_fr:chapter.body_en;
      html+='<article class="aoExploreStoryChapter" data-story-kind="'+esc(chapter.kind)+'">'
        +'<h3>'+esc(L(vm.language,...caption))+(chapter.kind==="PILGRIMAGE"&&visibleChapters.filter(row=>row.kind==="PILGRIMAGE").length>1?' · '+String(visibleChapters.slice(0,index+1).filter(row=>row.kind==="PILGRIMAGE").length):"")+'</h3>'
        +'<p>'+esc(narrative)+'</p><div class="aoExploreStoryEvidence" aria-label="'+esc(L(vm.language,"Sources for this paragraph","Sources de ce paragraphe"))+'">';
      for(const source of arr(chapter.sources))html+='<a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer" title="'+esc(source.title)+'">'+esc(source.issuer||source.title||L(vm.language,"Original source","Source originale"))+' <span aria-hidden="true">↗</span></a>';
      html+='</div></article>';
    }
    html+='</section>';
  }else if(!hasEditorialIntro&&synopsis)html+='<section class="aoExplorePlaceOpening" data-explore-place-chapter="story"><small>'+esc(L(vm.language,"THE PLACE","LE LIEU"))+'</small><p class="aoHeritageOverview">'+esc(synopsis)+'</p></section>';
  if(hasTreasures)html+=renderPlaceSacredTreasures(profile,vm.language);
  if(hasSiteCustoms)html+=renderPlaceCustoms(profile,vm.language);
  if(hasGallery)html+=placeGalleryHtml(profile,vm.language);
  if(hasGuide)html+=illustratedGuideHtml(profile,vm.language);
  if(profile.directions_url)html+='<div class="aoFindActions aoExplorePlaceVisit" data-explore-place-chapter="visit"><a href="'+esc(profile.directions_url)+'" target="_blank" rel="noopener noreferrer">'+esc(L(vm.language,"Directions","Itinéraire"))+'</a></div>';
  if(!chapters.length&&!synopsis&&!hasEditorialIntro&&!hasTreasures)html+='<p class="aoHeritageMeta">'+esc(L(vm.language,"Explore original records and their sources below.","Consultez les fiches originales et leurs sources ci-dessous."))+'</p>';

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
    html+='<section class="aoExplorePlaceGroup" data-explore-place-chapter="pray"><small>'+esc(L(vm.language,"RELATED NOVENAS & DEVOTIONS","NEUVAINES ET DÉVOTIONS ASSOCIÉES"))+'</small>';
    for(const novena of profile.novenas){
      const name=vm.language==="fr"?novena.title_fr:novena.title_en;
      html+='<article><div><strong>'+esc(name)+'</strong>';
      const association=arr(novena.sources).find(source=>/^https:\/\/[^\s]+$/i.test(source?.url||""));
      if(association)html+='<p class="aoExploreNovenaEvidence"><a href="'+esc(association.url)+'" target="_blank" rel="noopener noreferrer">'+esc(L(vm.language,"Devotional association — source","Lien dévotionnel — source"))+' ↗</a></p>';
      html+='</div><button type="button" data-explore-open-novena="'+esc(novena.id)+'">'+esc(L(vm.language,"Pray novena","Prier la neuvaine"))+'</button></article>';
    }
    html+='</section>';
  }

  if(arr(profile.calendar).length){
    html+='<section class="aoExplorePlaceGroup" data-explore-place-chapter="calendar"><small>'+esc(L(vm.language,"DATED OBSERVANCES","CÉLÉBRATIONS DATÉES"))+'</small>';
    for(const event of profile.calendar){
      html+='<article><strong>'+esc(event.title)+'</strong>'+(event.date_label?'<button type="button" data-explore-calendar-date="'+esc(event.date)+'">'+esc(event.date_label)+' →</button>':'<span>'+esc(L(vm.language,"Seasonal / local schedule","Saison / calendrier local"))+'</span>')+'</article>';
    }
    html+='</section>';
  }

  if(arr(profile.seasonal_pilgrimages).length){
    html+='<section class="aoExplorePlaceGroup"'+(arr(profile.calendar).length?'':' data-explore-place-chapter="calendar"')+'><small>'+esc(L(vm.language,"SEASONAL / VARIABLE PILGRIMAGE DATES","PÈLERINAGES SAISONNIERS / DATES VARIABLES"))+'</small>';
    for(const row of profile.seasonal_pilgrimages){
      html+='<article><strong>'+esc(row.title)+'</strong><span>'+esc(L(vm.language,"Check local programme","Voir le programme local"))+'</span></article>';
    }
    html+='</section>';
  }
  if(arr(profile.apparitions).length){
    html+='<section class="aoExplorePlaceGroup"><details class="aoPlaceAccordion"><summary>'+esc(L(vm.language,"APPARITION HISTORIES","HISTOIRE DES APPARITIONS"))+' · '+arr(profile.apparitions).length+'</summary>'+placeRecordRows(profile.apparitions,vm.language)+'</details></section>';
  }
  if(residualRelicRecords.length){
    html+='<section class="aoExplorePlaceGroup"><details class="aoPlaceAccordion"><summary>'+esc(L(vm.language,"ADDITIONAL RELIC RECORDS","AUTRES FICHES DE RELIQUES"))+' · '+residualRelicRecords.length+'</summary>'+placeRecordRows(residualRelicRecords,vm.language)+'</details></section>';
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
  if(item.kind==="TLM_VENUE")return renderDirectoryVenueCard(item,vm.language);
  const full=(item.kind==="TLM_VENUE"?"":String(translatedSummary(item,vm.language)??"")).replace(/\s+/g," ").trim();
  const cut=full.length>170?full.slice(0,170).replace(/\s+\S*$/u,"").trimEnd()+"…":full;
  return '<button type="button" class="aoFindCard aoExploreCard" data-explore-item="'+esc(item.item_id)+'" data-explore-lens="'+esc(item.lens)+'">'
    +'<span class="aoFindCardTop"><small>'+esc((vm.language==="fr"&&item.eyebrow_fr)||item.eyebrow||lensLabel(vm.language,item.lens))+'</small>'
    +(item.status?'<i class="aoExploreCardRecognition">'+esc(item.status==="OFFICIAL SANCTUARY"?L(vm.language,"Official Sanctuary","Sanctuaire officiel"):item.status)+'</i>':"")+'</span>'
    +'<strong>'+esc(translatedTitle(item,vm.language)||"")+'</strong>'
    +(item.subtitle?'<span class="aoExploreCardLocation">'+esc(item.subtitle)+'</span>':"")
    +(cut?'<p>'+esc(cut)+'</p>':"")
    +'<span class="aoExploreCardOpen">'+esc(L(vm.language,"Explore record","Voir la fiche"))+' <span aria-hidden="true">→</span></span>'
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
  const floatingOnMap=vm.view==="map";
  let html='<div class="aoFindSheetBackdrop'+(floatingOnMap?' aoExploreQuickPreviewLayer':'')+'" data-find-close-detail><section class="aoFindSheet aoExploreQuickPreview" role="dialog" aria-modal="'+String(!floatingOnMap)+'" aria-label="'+esc(title)+'" data-explore-preview="'+esc(item.item_id)+'">';
  html+='<div class="aoHeritageSheetHandle" aria-hidden="true"></div>';
  html+='<header><div><small>'+esc((lang==="fr"&&item.eyebrow_fr)||item.eyebrow||lensLabel(lang,item.lens))+'</small><h2>'+esc(title)+'</h2>';
  if(area)html+='<p>'+esc(area)+'</p>';
  html+='</div><button type="button" data-find-close-detail aria-label="'+esc(L(lang,"Close","Fermer"))+'">'+uiIcon("ao-ui-close")+'</button></header>';
  if(isMass&&eligibleDirectoryImage(item.cover_media,item.place_id)){
    const m=item.cover_media;
    html+='<img class="aoTlmPreviewPhoto" loading="lazy" decoding="async" src="'+esc(m.asset_path)+'" alt="'+esc(lang==="fr"?m.alt_fr:m.alt_en)+'">'
      +'<small class="aoTlmPreviewPhotoCredit">'+esc(m.credit)+' · <a href="'+esc(m.license_url)+'" target="_blank" rel="noopener noreferrer">'+esc(m.license)+'</a> · <a href="'+esc(m.source_url)+'" target="_blank" rel="noopener noreferrer">'+esc(L(lang,"Original photo","Photo originale"))+'</a></small>';
  }
  if(isMass&&!eligibleDirectoryImage(item.cover_media,item.place_id))
    html+=renderDirectoryIdentityFallback(item,lang,"preview");
  if(summary)html+='<p class="aoExplorePreviewSynopsis">'+esc(summary)+'</p>';
  if(isMass)html+='<p class="aoExplorePreviewCaution">'+esc(L(lang,
    "Check the source for current Mass times, exact entrance and the status of individual celebrations.",
    "Vérifiez à la source les horaires actuels, l’entrée exacte et le statut de chaque célébration."))+'</p>';
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
  let html='<div class="aoFindSheetBackdrop" data-find-close-detail><section class="aoFindSheet'+(item.kind==="CANONICAL_CUSTOM"?' aoExploreTraditionSheet':'')+'" role="dialog" aria-modal="true"'+(item.kind==="CANONICAL_CUSTOM"?' data-explore-custom-id="'+esc(item.source_id)+'"':'')+'>';
  html+='<header><div><small>'+esc((vm.language==="fr"&&item.eyebrow_fr)||item.eyebrow||lensLabel(vm.language,item.lens))+'</small><h2>'+esc(translatedTitle(item,vm.language)||"")+'</h2>';
  const subtitle=vm.language==="fr"?(item.kind==="CANONICAL_CUSTOM"?item.subtitle_fr:item.subtitle_fr||item.subtitle):item.subtitle;
  if(subtitle)html+='<p>'+esc(subtitle)+'</p>';
  html+='</div><button type="button" data-find-close-detail aria-label="'+esc(L(vm.language,"Close","Fermer"))+'">'+uiIcon("ao-ui-close")+'</button></header>';

  if(item.kind==="TLM_VENUE"&&eligibleDirectoryImage(item.cover_media,item.place_id)){
    const m=item.cover_media;
    const changes=vm.language==="fr"?m.changes_fr:m.changes_en;
    html+='<figure class="aoTlmDetailPhoto"><img loading="lazy" decoding="async" src="'+esc(m.asset_path)+'" alt="'+esc(vm.language==="fr"?m.alt_fr:m.alt_en)+'"><figcaption>'
      +esc(m.credit)+' · <a href="'+esc(m.license_url)+'" target="_blank" rel="noopener noreferrer">'+esc(m.license)+'</a>'
      +' · <a href="'+esc(m.source_url)+'" target="_blank" rel="noopener noreferrer">'+esc(L(vm.language,"Original Wikimedia photograph","Photographie Wikimedia originale"))+'</a>'
      +(changes?'<span class="aoTlmPhotoChanges"> · '+esc(changes)+'</span>':'')
      +'</figcaption></figure>';
  }
  if(item.kind==="TLM_VENUE"&&!eligibleDirectoryImage(item.cover_media,item.place_id))
    html+=renderDirectoryIdentityFallback(item,vm.language,"detail");
  if(item.kind==="TLM_VENUE")html+=renderDirectoryGallery(item,vm.language);
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

  const examples=arr(item.attestation_examples);
  if(item.kind==="CANONICAL_CUSTOM"&&(examples.length>1||examples.some(example=>example.place_id))){
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
  html+='<footer><small>'+esc((vm.language==="fr"&&item.note_fr)||item.note||L(vm.language,"Source-backed Explore record.","Fiche Explore sourcée."))+'</small>';
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
function massLegendItem(group,label){
  const emblem=massInstitutionEmblem(group);
  return '<span data-group="'+esc(group)+'">'
    +(emblem?'<img src="'+esc(emblem.image)+'" alt="" loading="lazy" decoding="async" />':'')
    +esc(label)+'</span>';
}
function massEmblemCredits(language){
  return '<details class="aoMapEmblemCredits"><summary>'
    +esc(L(language,"Emblem sources & rights","Sources et droits des emblèmes"))+'</summary><div>'
    +MASS_EMBLEM_GROUPS.map(group=>{
      const record=massInstitutionEmblem(group);
      return '<p><a href="'+esc(record.source)+'" target="_blank" rel="noopener noreferrer">'
        +esc(record.label)+'</a> · '+esc(record.rights)+' · <a href="'+esc(record.licenseUrl)+'" target="_blank" rel="noopener noreferrer">'
        +esc(L(language,"Original image licence","Licence de l’image"))+'</a></p>';
    }).join("")
    +'<p>'+esc(L(language,
      "Diocesan and unidentified listings use neutral map symbols, not Holy See or assumed institute arms. Institutional emblems identify source-reported ministry only, not the church owner or a verified Mass. Copyright licences do not waive separate insignia or trademark rights; commercial clearance remains outstanding.",
      "Les fiches diocésaines ou sans affiliation déterminée utilisent des repères neutres, non les armes du Saint-Siège ni celles d’un institut supposé. Les emblèmes signalent seulement le ministère indiqué par la source, pas le propriétaire de l’église ni une messe vérifiée. La licence d’auteur ne lève pas les droits propres aux insignes et marques ; la validation commerciale reste nécessaire."))+'</p></div></details>';
}
function tlmFilters(vm){
  const f=vm.filters??{},aff=arr(f.affiliations);
  if(Object.hasOwn(f,"directoryGroup")){
    let html='<section class="aoFindFilters aoExploreTlmFilters" aria-label="'+esc(L(vm.language,"Mass venue filters","Filtres des lieux de messe"))+'">';
    if(vm.view==="map")html+='<details class="aoAtlasTlmExtra"><summary>'+esc(L(vm.language,"Filters","Filtres"))+'</summary>';
    html+='<div class="aoExploreQuickFilters"><span class="aoExploreFilterLabel">'+esc(L(vm.language,"Show","Afficher"))+'</span>';
    html+=pill("directoryGroup","ALL",L(vm.language,"All locations","Tous les lieux"),f.directoryGroup);
    html+=pill("directoryGroup","ROME",L(vm.language,"Rome-grouped listings","Fiches classées Rome"),f.directoryGroup);
    html+=pill("directoryGroup","SSPX","SSPX",f.directoryGroup);
    html+=pill("directoryGroup","UNKNOWN",L(vm.language,"Unclassified","Non classés"),f.directoryGroup);
    html+='</div>';
    if(vm.view==="map")html+='</details>';
    html+='<div class="aoTlmProviderStrip" role="group" aria-label="'+esc(L(vm.language,"Filter by source-reported institute","Filtrer par institut déclaré"))+'">';
    html+='<span class="aoExploreFilterLabel">'+esc(L(vm.language,"Institute","Institut"))+'</span><div class="aoFindAffiliations">';
    for(const id of ["DIOCESAN","FSSP","ICKSP","IBP","SSPX","OTHER"]){
      const emblem=massInstitutionEmblem(id);
      html+='<button type="button" data-find-affiliation="'+id+'" class="'+(aff.includes(id)?"active":"")+'" aria-pressed="'+String(aff.includes(id))+'">'
        +(emblem?'<img src="'+esc(emblem.image)+'" loading="lazy" decoding="async" alt="" />':'')
        +esc(id==="DIOCESAN"?L(vm.language,"Diocesan","Diocésain"):id==="OTHER"?L(vm.language,"Other","Autres"):id)+'</button>';
    }
    html+='</div></div>';
    html+='<details class="aoPreliminaryDirectoryNotice"><summary>'+esc(L(vm.language,
      "Provisional pins · Check the original source before travelling",
      "Repères provisoires · Vérifiez la source avant de partir"))+'</summary><p>'+esc(L(vm.language,
      "Affiliation comes from source listings. A particular Mass’s una-cum status, current celebration, precise entrance and timetable have not been verified. Links are supplied to the original source; an institute’s emblem is not a verification badge.",
      "L’appartenance est issue des répertoires sources. Le caractère una cum d’une messe, sa célébration actuelle, son entrée exacte et ses horaires n’ont pas été vérifiés. L’emblème d’un institut ne constitue pas un contrôle de ces informations."))+'</p></details>';
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
  saintsRelease=null,
  selectedId=null,
  selectedOverride=null,
  placeProfiles=[],
  selectedPlaceId=null,
  expandPlace=false,
  expandDetail=false,
  customCards=[],
  featuredPlaces=[],
  nearby=[],
  timeMass=null,
  atlasCoverage=null,
  network=null,
  displayLimit=120,
  journeyOpen=false,
  journeys=[],
  journeySelectedId=null,
}={}){
  const list=arr(items);
  const selected=list.find(item=>item?.item_id===selectedId)??selectedOverride??null;
  const selectedPlace=arr(placeProfiles).find(profile=>profile?.place_id===selectedPlaceId)??null;
  const placeJourneys=selectedPlace?journeysForCanonicalPlace(journeys,selectedPlace.place_id):Object.freeze([]);
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
    journeyOpen:Boolean(journeyOpen),
    journeys:Object.freeze(arr(journeys)),
    journeySelectedId,
    saintsRelease,
    selected,
    selectedPlace,
    placeJourneys,
    expandPlace:Boolean(expandPlace),
    expandDetail:Boolean(expandDetail),
    customCards:arr(customCards),
    featuredPlaces:arr(featuredPlaces),
    nearby:arr(nearby),
    timeMass,
    atlasCoverage,
    network,
    mapped,
    addressOnly,
    displayLimit:Number.isFinite(Number(displayLimit))?Math.max(24,Math.floor(Number(displayLimit))):24,
  });
}

export function renderExploreToString(vm){
  // A stale direct Traditions link can inspect its source folio, never reopen a map or Customs Atlas.
  if(vm.lens==="traditions"&&vm.view!=="list")vm={...vm,view:"list"};
  if(vm.lens==="heritage")return renderHeritageToString(vm,{
    placeSheet,detailSheet,itemPreview:compactExploreItemSheet,
    journeyPanel:renderPilgrimageJourneyPanel,
  });
  const f=vm.filters??{},loaded=vm.lens==="tlm"&&vm.loadedProviders.length?vm.loadedProviders.join(" · ").toUpperCase():String(vm.lens==="saints"?vm.items.length:(vm.counts?.[vm.lens]??vm.items.length));
  let html='<section class="aoFindSurface aoExploreSurface" data-ao-find-owner="AO_FIND_APP_V1" data-ao-explore-owner="EXPLORE_V1">';
  html+='<header class="aoFindHeader"><button type="button" data-find-close aria-label="'+esc(L(vm.language,"Back","Retour"))+'">'+uiIcon("ao-ui-back")+'</button><div><small>AD ORIENTEM · EXPLORE</small><h1>'+esc(vm.lens==="tlm"?L(vm.language,"Traditional Mass","Messe traditionnelle"):lensLabel(vm.language,vm.lens))+'</h1></div><button type="button" data-find-glossary aria-label="'+esc(L(vm.language,"Terms and definitions","Termes et définitions"))+'">?</button><span>'+esc(loaded)+'</span></header>';

  html+='<p class="aoFindActionError" data-find-action-error role="alert" hidden></p>';
  html+='<nav class="aoExploreSectionNav" aria-label="'+esc(L(vm.language,"Explore navigation","Navigation Explorer"))+'">';
  html+='<span>'+(vm.lens==="tlm"?esc(L(vm.language,"MASS DIRECTORY","ANNUAIRE DES MESSES"))
    :esc(L(vm.language,"SACRED GEOGRAPHY","GÉOGRAPHIE SACRÉE"))+' · '+esc(lensLabel(vm.language,vm.lens)))+'</span>';
  html+='<details class="aoExploreSectionSwitcher"><summary>'+esc(L(vm.language,"Other sections","Autres sections"))+'</summary><div>';
  html+='<button type="button" data-find-filter="lens" data-find-filter-value="heritage">'+esc(L(vm.language,"Sacred places map","Carte des lieux sacrés"))+'</button>';
  for(const lens of ["tlm","saints","shrines","apparitions","relics","pilgrimages"]){
    if(lens===vm.lens)continue;
    html+='<button type="button" data-find-filter="lens" data-find-filter-value="'+esc(lens)+'">'+esc(lensLabel(vm.language,lens))+'</button>';
  }
  html+='</div></details></nav>';
  // Legacy exact custom deep links remain readable, but the country-first Atlas is retired.
  if(vm.lens==="traditions")html+='<section class="aoCustomsAtlasPanel" data-ao-customs-legacy-reader><h2>'+esc(L(vm.language,"Customs belong in the Calendar","Les coutumes se découvrent dans le calendrier"))+'</h2><p>'+esc(L(vm.language,"Explore traditions by feast and season in the existing liturgical Calendar.","Découvrez les coutumes selon les fêtes et les saisons dans le calendrier liturgique."))+'</p><button type="button" class="aoCustomsLibraryLaunch" data-explore-customs-calendar>'+esc(L(vm.language,"Read traditions through the year","Lire les coutumes au fil de l’année"))+' →</button></section>';
  if(vm.lens==="saints")html+='<p class="aoSaintScopeNote">'+esc(vm.view==="map"
  ?L(vm.language,"Map shows verified physical places only. Switch to List for Saints and source indexes.","La carte ne montre que les lieux vérifiés. Passez en Liste pour les saints et les index de sources.")
  :f.saintScope==="historical"
  ?L(vm.language,"Historic sanctoral source subjects, not 307 distinct biographies or certified present-day feast observances.","Sujets des archives du sanctoral, non 307 biographies ni fêtes actuelles certifiées.")
  :f.saintScope==="later"
  ?L(vm.language,"Post-1960 canonization index: named persons and collective groups, not yet complete biographies or assigned 1962 feasts.","Index des canonisations postérieures à 1960 : personnes et groupes, sans biographies complètes ni fêtes de 1962.")
  :f.saintScope==="doctors"
  ?L(vm.language,"38 Doctors of the Church from the Calendar owner roster. Later declarations are not retrospective 1962 titles.","38 Docteurs de l’Église recensés par le calendrier. Les proclamations ultérieures ne modifient pas rétroactivement les titres de 1962.")
  :(vm.saintsRelease?.researchEnabled
    ?L(vm.language,"One profile per saint. 24 additional lives are research previews; portraits and feast assignments await their source owners.","Une notice par saint. Les 24 vies supplémentaires sont des aperçus de recherche ; portraits et fêtes attendent validation.")
    :L(vm.language,"Six source-linked Saints pilot profiles. Artwork and final editorial approval remain pending.","Six notices pilotes sourcées de saints. Illustrations et validation éditoriale définitive en attente.")))+"</p>";
  if(vm.lens==="pilgrimages"&&f.calendarKey)html+='<section class="aoExploreCalendarBridge"><span>'+esc(L(vm.language,"Pilgrimages associated with this Calendar observance","Pèlerinages associés à cette célébration du calendrier"))+' · '+esc(f.calendarKey)+'</span><button type="button" data-find-clear-calendar>'+esc(L(vm.language,"Show all pilgrimages","Tous les pèlerinages"))+'</button></section>';

  if(vm.lens==="tlm")html+='<div class="aoTlmToolbar">';
  html+='<div class="aoFindSearch"><input type="search" data-find-query value="'+esc(f.query||"")+'" placeholder="'+esc(
    vm.lens==="tlm"?L(vm.language,"City, church, diocese or country","Ville, église, diocèse ou pays"):
    vm.lens==="shrines"?L(vm.language,"Shrine, saint or place","Sanctuaire, saint ou lieu"):
    vm.lens==="apparitions"?L(vm.language,"Apparition, witness, place","Apparition, témoin, lieu"):
    vm.lens==="relics"?L(vm.language,"Relic, saint, place","Relique, saint, lieu"):
    vm.lens==="saints"?L(vm.language,"Saint, holiness, shrine, country","Saint, sainteté, sanctuaire, pays"):
    vm.lens==="traditions"?L(vm.language,"Custom, region, period or place","Coutume, région, période ou lieu"):
    L(vm.language,"Pilgrimage, shrine, route or place","Pèlerinage, sanctuaire, itinéraire ou lieu")
  )+'"></div>';

  if(vm.lens!=="traditions")html+='<nav class="aoFindViewTabs">'+pill("view","list",L(vm.language,"List","Liste"),vm.view)+pill("view","map",L(vm.language,"Map","Carte"),vm.view)+'</nav>';
  if(vm.lens==="tlm")html+='</div>';
  if(vm.lens==="tlm")html+=tlmFilters(vm);
  if(vm.lens==="saints"&&vm.view==="list"&&vm.saintsRelease?.researchEnabled){
    html+='<nav class="aoSaintCatalogueScopes" aria-label="'+esc(L(vm.language,"Saints catalogue sections","Sections du catalogue des saints"))+'">';
    for(const [code,en,fr] of [
      ["profiles","30 biographies","30 biographies"],["historical","Historical sanctoral","Sanctoral historique"],
      ["later","Later canonizations","Canonisations récentes"],
      ["doctors","Doctors (38)","Docteurs (38)"]
    ])html+=pill("saintScope",code,L(vm.language,en,fr),f.saintScope||"profiles");
    html+='</nav>';
  }
  if(vm.lens==="saints"&&vm.view==="list"&&vm.saintsRelease?.researchEnabled&&(!f.saintScope||f.saintScope==="profiles")){
    html+='<nav class="aoSaintCatalogueFacets" aria-label="'+esc(L(vm.language,"Saint categories","Catégories de saints"))+'">';
    for(const [code,en,fr] of [
      ["ALL","All","Tous"],["DOCTOR_OF_CHURCH","Doctors","Docteurs"],
      ["MARTYR","Martyrs","Martyrs"],["MISSIONARY","Missionaries","Missionnaires"],
      ["PASTOR","Pastors","Pasteurs"],["FOUNDER","Founders","Fondateurs"],
      ["MYSTIC","Mystics","Mystiques"],["THEOLOGIAN","Theologians","Théologiens"]
    ])html+=pill("saintCategory",code,L(vm.language,en,fr),f.saintCategory||"ALL");
    html+='</nav>';
  }

  const noun=vm.lens==="tlm"?L(vm.language,"venues","lieux"):vm.lens==="saints"?(vm.view==="list"
  ?(f.saintScope==="historical"?L(vm.language,"archived source subjects","sujets des archives")
    :f.saintScope==="later"?L(vm.language,"later canonization records","références des canonisations")
    :f.saintScope==="doctors"?L(vm.language,"Doctor source records","références des Docteurs")
    :L(vm.language,"saint profiles","notices de saints"))
  :L(vm.language,"places connected to saints","lieux associés aux saints")):vm.lens==="shrines"?L(vm.language,"shrines","sanctuaires"):vm.lens==="apparitions"?L(vm.language,"apparition accounts","récits d’apparition"):vm.lens==="relics"?L(vm.language,"relic sites","lieux de reliques"):vm.lens==="traditions"?L(vm.language,vm.view==="list"?"practices":"attestations",vm.view==="list"?"pratiques":"attestations"):L(vm.language,"pilgrimages","pèlerinages");
  html+='<div class="aoFindResultMeta"><strong>'+String(vm.items.length)+'</strong><span>'+esc(noun)+'</span>';
  if(vm.mapped&&vm.mapped<vm.items.length)html+='<span> · '+String(vm.mapped)+' '+esc(L(vm.language,"mapped","cartographiés"))+'</span>';
  if(vm.addressOnly)html+='<span> · '+String(vm.addressOnly)+' '+esc(L(vm.language,"address only","adresse seule"))+'</span>';
  if(vm.lens==="tlm"&&vm.view==="map")html+='<span class="aoTlmViewportContext" data-tlm-viewport-count aria-live="polite">'+esc(L(vm.language,"In this view: …","Dans cette vue : …"))+'</span>';
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
      html+='<details class="aoMapLegend" aria-label="'+esc(L(vm.language,"Map legend","Légende de la carte"))+'"><summary>'+esc(L(vm.language,"Map symbols","Symboles de la carte"))+'</summary>'
        +'<span class="aoMapLegendLabel">'+esc(Object.hasOwn(f,"directoryGroup")?L(vm.language,"Source affiliation","Affiliation selon les sources"):L(vm.language,"Celebrated by","Célébrée par"))+'</span>'
        +massLegendItem("FSSP","FSSP")+massLegendItem("ICKSP","ICKSP")
        +massLegendItem("SSPX","SSPX")+massLegendItem("IBP","IBP")
        +massLegendItem("DIOCESAN",L(vm.language,"Diocesan","Diocésain"))
        +massLegendItem("OTHER",L(vm.language,"Other / unknown","Autre / inconnu"))
        +'<small>'+esc(Object.hasOwn(f,"directoryGroup")?L(vm.language,"All pins provisional; exact entrances and Mass times are not verified.","Tous les repères sont provisoires ; entrées exactes et horaires des messes non vérifiés."):L(vm.language,"Approximate points use a softer outline. Address-only venues remain available in List.","Les lieux à position approximative sont atténués. Les adresses sans coordonnées fiables restent en liste."))+'</small>'
        +massEmblemCredits(vm.language)+'</details>';
    }
  }else if(vm.items.length){
    const visible=vm.items.slice(0,vm.displayLimit);
    html+='<div class="aoFindList">'+visible.map(item=>itemCard(item,vm)).join("")+'</div>';
    if(visible.length<vm.items.length)html+='<div class="aoFindMore"><span>'+esc(L(vm.language,"Showing ","Affichage de "))+visible.length+' / '+vm.items.length+'</span>'
      +'<button type="button" data-find-show-more>'+esc(L(vm.language,"Show more results","Afficher plus de résultats"))+'</button></div>';
  }else html+=emptyState(vm);
  html+='</div>';
  if(vm.lens==="tlm")html+='<details class="aoFindExternalSource" role="note"><summary>'+esc(L(vm.language,"Other Mass directories and source checking","Autres annuaires et vérification des sources"))+'</summary>'
    +'<div><strong>'+esc(L(vm.language,"More Mass locations","Autres lieux de messe"))+'</strong>'
    +'<span>'+esc(L(vm.language,"Other directories may have additional locations. Always confirm current Mass times with the priest or parish.","D’autres annuaires peuvent signaler des lieux supplémentaires. Vérifiez toujours les horaires actuels auprès du prêtre ou de la paroisse."))+'</span></div>'
    +'<a href="https://www.latinmass.com/find-latin-mass" target="_blank" rel="noopener noreferrer">'+esc(L(vm.language,"Mass of the Ages map ↗","Carte Mass of the Ages ↗"))+'</a>'
    +'<a href="https://www.latinmassdir.org/countries/" target="_blank" rel="noopener noreferrer">'+esc(L(vm.language,"Latin Mass Directory ↗","Latin Mass Directory ↗"))+'</a>'
    +'</details>';
  html+=(vm.selectedPlace?(vm.expandPlace?placeSheet(vm):compactHeritagePlaceSheet(vm)):(vm.selected?.kind==="SAINT_SOURCE_INDEX_ENTRY"?renderSaintSourceIndexSheet(vm):vm.selected?.lens==="saints"?renderSaintPlaceSheet(vm):(vm.selected?(vm.expandDetail?detailSheet(vm):compactExploreItemSheet(vm)):"")))+'</section>';
  return html;
}
