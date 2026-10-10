// Optional, compact Explore reference. Scripture owns verse text; no map pin, chronology
// calculation, or extra reader is introduced by this presentation.
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const GROUPS=Object.freeze({
  CHRIST:["Life of Christ","Vie du Christ"],
  OT:["Old Testament","Ancien Testament"],
  DEUTERO:["Deuterocanonical","Deutérocanoniques"],
  APOSTLES:["Apostles","Apôtres"],
});
const PHASES=Object.freeze({
  INFANCY:["Infancy","Enfance"],
  PUBLIC:["Public ministry","Vie publique"],
  PASSION:["Passion","Passion"],
  RESURRECTION:["Resurrection and Ascension","Résurrection et Ascension"],
});
const translated=(record,key,language)=>record?.[key+"_"+(language==="fr"?"fr":"en")]??"";
export function renderBiblePlacesSection(vm){
  const records=Array.isArray(vm.biblePlaces)?vm.biblePlaces:[];
  if(!records.length)return "";
  const lang=vm.language==="fr"?"fr":"en",expanded=Boolean(vm.filters?.bibleOpen);
  const scope=vm.filters?.bibleScope==="MIRACLES"?"MIRACLES":"ALL";
  const query=String(vm.filters?.bibleQuery||"").trim().toLocaleLowerCase(lang);
  const scoped=scope==="MIRACLES"?records.filter(r=>r.events?.some(e=>e.category==="MIRACLE")):records;
  const searchText=r=>[r.title_en,r.title_fr,r.summary_en,r.summary_fr,r.persons_en,r.persons_fr,
    ...(r.events||[]).flatMap(e=>[e.title_en,e.title_fr,e.reference])].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const deaccent=q=>q.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const visible=scoped.filter(r=>searchText(r).includes(deaccent(query)));
  const selected=visible.find(row=>row.id===vm.filters?.bibleSelectedId)??null;
  const totalEvents=records.filter(r=>r.group==="CHRIST").reduce((n,r)=>n+(r.events?.length||0),0);
  let html='<section class="aoBiblePlacesCompact" aria-label="'+esc(L(lang,"Bible Places","Lieux de la Bible"))+'">';
  html+='<button type="button" class="aoBiblePlacesToggle" data-bible-toggle aria-expanded="'+String(expanded)+'">'
    +'<span><strong>'+esc(L(lang,"Bible Places","Lieux de la Bible"))+'</strong>'
    +'<small>'+esc(L(lang,`${totalEvents} episodes · 37 miracles`,`${totalEvents} épisodes · 37 miracles`))+'</small></span>'
    +'<span>'+records.length+' <span aria-hidden="true">'+(expanded?'−':'+')+'</span></span></button>';
  if(!expanded)return html+'</section>';
  html+='<div class="aoBiblePlacesControls">'
    +'<input type="search" data-bible-search value="'+esc(vm.filters?.bibleQuery||"")+'"'
    +' placeholder="'+esc(L(lang,"Search a place, miracle or event","Chercher un lieu, miracle ou événement"))+'"'
    +' aria-label="'+esc(L(lang,"Search Bible Places","Chercher dans les lieux bibliques"))+'">'
    +'<div class="aoBibleScopeActions"><button type="button" data-bible-scope="ALL" aria-pressed="'+String(scope==="ALL")+'">'+esc(L(lang,"All events","Tous les événements"))+'</button>'
    +'<button type="button" data-bible-scope="MIRACLES" aria-pressed="'+String(scope==="MIRACLES")+'">'+esc(L(lang,"Miracles","Miracles"))+'</button></div></div>';
  html+='<div class="aoBiblePlacesGroups" role="list">';
  for(const [group,label] of Object.entries(GROUPS)){
    const items=visible.filter(r=>r.group===group);
    if(!items.length)continue;
    html+='<div class="aoBiblePlacesGroup" role="listitem"><small>'+esc(L(lang,...label))+'</small>';
    const subsets=group==="CHRIST"
      ? Object.entries(PHASES).map(([phase,phaseLabel])=>({phaseLabel,rows:items.filter(item=>item.phase===phase)}))
      : [{phaseLabel:null,rows:items}];
    for(const subset of subsets){
      if(!subset.rows.length)continue;
      if(subset.phaseLabel)html+='<span class="aoBiblePhaseLabel">'+esc(L(lang,...subset.phaseLabel))+'</span>';
      html+='<div class="aoBiblePlacesChips">';
      for(const item of subset.rows){
        const active=selected?.id===item.id;
        html+='<button type="button" data-bible-place="'+esc(item.id)+'" data-bible-search-text="'+esc(searchText(item))+'" aria-pressed="'+String(active)+'" class="'+(active?'active':'')+'">'+esc(translated(item,"title",lang))+'</button>';
      }
      html+='</div>';
    }
    html+='</div>';
  }
  html+='</div>';
  if(selected){
    html+='<article class="aoBiblePlacesDetail" aria-live="polite"><h3>'+esc(translated(selected,"title",lang))+'</h3>'
      +'<p>'+esc(translated(selected,"summary",lang))+'</p>'
      +'<dl><div><dt>'+esc(L(lang,"Period","Période"))+'</dt><dd>'+esc(translated(selected,"period",lang))+'</dd></div>'
      +'<div><dt>'+esc(L(lang,"People","Personnages"))+'</dt><dd>'+esc(translated(selected,"persons",lang))+'</dd></div></dl>'
      +'<div class="aoBiblePlacesRead">';
    const namedEvents=(Array.isArray(selected.events)?selected.events:[]).filter(e=>scope!=="MIRACLES"||e.category==="MIRACLE");
    if(namedEvents.length){
      for(const episode of namedEvents){
        const reference=episode.reference??"";
        if(!reference)continue;
        html+='<div class="aoBiblePlacesEpisode"><span>'+esc(translated(episode,"title",lang))+'</span>'
          +'<button type="button" data-ao-scripture-context="'+esc(reference)+'" aria-label="'+esc(L(lang,"Read ","Lire ")+reference)+'">'
          +esc(reference)+' <span aria-hidden="true">↗</span></button></div>';
      }
    }else{
      for(const reference of selected.passages??[]){
        html+='<button type="button" data-ao-scripture-context="'+esc(reference)+'" aria-label="'+esc(L(lang,"Read ","Lire ")+reference)+'">'
          +esc(reference)+' <span aria-hidden="true">↗</span></button>';
      }
    }
    html+='</div></article>';
  }else{
    html+='<p class="aoBiblePlacesHint">'+esc(visible.length?L(lang,"Choose a place to see its biblical events and read the passages.","Choisissez un lieu pour découvrir les événements et lire les passages."):L(lang,"No matching entries. Change the search or category.","Aucune entrée correspondante. Modifiez la recherche ou la catégorie."))+'</p>';
  }
  return html+'</section>';
}
