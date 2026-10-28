// P66 sourced Place folios. Rendering only; underlying owners retain identities.
// HTML is escaped. Every sacred-object source belongs to the exact Place ID.
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const rows=x=>Array.isArray(x)?x:[];
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const titles={
  BODILY_REMAINS:["Saint's remains","Restes d'un saint"],
  BODILY_FRAGMENT:["Bodily relic fragment","Fragment de relique corporelle"],
  REPUTED_BODILY_REMAINS:["Traditionally attributed remains","Restes attribués par tradition"],
  REPUTED_PASSION_RELIC:["Passion relic · traditional attribution","Relique de la Passion · attribution traditionnelle"],
  REPUTED_HOLY_SITE_RELIC:["Traditional Holy Land relic","Relique traditionnelle de Terre sainte"],
  REPUTED_CONTACT_RELIC:["Traditional contact relic","Relique de contact traditionnelle"],
  RELIC_COLLECTION:["Collection of relics","Ensemble de reliques"],
};
const source=u=>typeof u==="string"&&/^https:\/\/[^\s]+$/.test(u);
export function renderPlaceEditorialOpening(intro,language="en"){
  if(!intro||intro.ownership!=="EXISTING_PUBLISHED_ILLUSTRATED_GUIDE"||!source(intro.source_url))return "";
  const title=language==="fr"?intro.title?.fr:intro.title?.en;
  const narrative=language==="fr"?intro.introduction?.fr:intro.introduction?.en;
  if(!title||!narrative)return "";
  return '<section class="aoExploreEditorialOpening" data-explore-place-chapter="story">'
    +'<small>'+esc(L(language,"THE STORY","L’HISTOIRE"))+'</small>'
    +'<h3>'+esc(title)+'</h3><p>'+esc(narrative)+'</p>'
    +'<a href="'+esc(intro.source_url)+'" target="_blank" rel="noopener noreferrer">'
    +esc(L(language,"Historical source","Source historique"))+' ↗</a></section>';
}

export function renderPlaceSacredTreasures(profile,language="en"){
  const treasures=rows(profile?.sacred_treasures).filter(x=>source(x.source_url)&&x.id);
  if(!treasures.length)return "";
  let html='<section class="aoExploreTreasures" data-explore-place-chapter="treasures" aria-label="'+esc(L(language,"Relics and sacred treasures","Reliques et trésors sacrés"))+'">'
    +'<header><small>'+esc(L(language,"SACRED TREASURES","TRÉSORS SACRÉS"))+'</small>'
    +'<h3>'+esc(L(language,"Relics associated with this sanctuary","Reliques associées à ce sanctuaire"))+'</h3>'
    +'<p>'+esc(L(language,
      "Their reported custody is documented by the cited sources; authenticity, precise indoor position and public display have not been independently established.",
      "Les sources citées attestent leur conservation signalée, mais ni leur authenticité, ni leur emplacement précis, ni leur exposition au public ne sont établis indépendamment."))+'</p></header>'
    +'<div class="aoExploreTreasureGrid">';
  for(const row of treasures){
    const title=language==="fr"?row.title?.fr:row.title?.en;
    const description=language==="fr"?row.description?.fr:row.description?.en;
    const genericFrench=language==="fr"&&/^Lieu de conservation ou de vénération décrit par la source citée/i.test(description||"");
    const display=language==="fr"?(row.display_notice_fr||""):(row.display_notice_en||"");
    const access=language==="fr"?(row.access_notice_fr||""):(row.access_notice_en||"");
    const kind=titles[row.kind]??["Relic","Relique"];
    html+='<article class="aoExploreTreasureCard" data-sacred-object-id="'+esc(row.id)+'">'
      +'<small class="aoExploreTreasureKind">'+esc(kind[language==="fr"?1:0])+'</small>'
      +'<h4>'+esc(title)+'</h4>'
      +(!genericFrench&&description?'<p>'+esc(description)+'</p>':"")
      +(display?'<p class="aoExploreTreasureNotice">'+esc(display)+'</p>':"")
      +(access?'<p class="aoExploreTreasureNotice">'+esc(access)+'</p>':"")
      +'<div class="aoExploreTreasureActions">'
      +'<a href="'+esc(row.source_url)+'" target="_blank" rel="noopener noreferrer">'
      +esc(L(language,"Custody source","Source de conservation"))+' ↗</a>'
      +(row.item_id&&row.lens?'<button type="button" data-explore-place-item="'+esc(row.item_id)+'" data-explore-place-lens="'+esc(row.lens)+'">'
        +esc(L(language,"Read record","Voir la fiche"))+' →</button>':"")
      +'</div></article>';
  }
  return html+'</div></section>';
}

export function renderPlaceCustoms(profile,language="en"){
  const customs=rows(profile?.site_customs);
  if(!customs.length)return "";
  let html='<section class="aoExplorePlaceCustoms" data-explore-place-chapter="customs">'
    +'<small>'+esc(L(language,"LOCAL TRADITIONS","TRADITIONS LOCALES"))+'</small>'
    +'<h3>'+esc(L(language,"Customs associated with this place","Coutumes associées à ce lieu"))+'</h3>';
  for(const item of customs){
    html+='<p><strong>'+esc(item.name)+'</strong><span>'+esc(L(language,
      "Documented place-specific association · not a universal liturgical requirement",
      "Association propre à ce lieu et attestée · non obligatoire dans la liturgie universelle"))+'</span></p>';
  }
  return html+'<button type="button" data-explore-customs-calendar>'
    +esc(L(language,"Explore customs in the Calendar","Découvrir les coutumes dans le Calendrier"))+' →</button></section>';
}
