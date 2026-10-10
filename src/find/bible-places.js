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
  const selected=records.find(row=>row.id===vm.filters?.bibleSelectedId)??null;
  let html='<section class="aoBiblePlacesCompact" aria-label="'+esc(L(lang,"Bible Places","Lieux de la Bible"))+'">';
  html+='<button type="button" class="aoBiblePlacesToggle" data-bible-toggle aria-expanded="'+String(expanded)+'">'
    +'<span><strong>'+esc(L(lang,"Bible Places","Lieux de la Bible"))+'</strong>'
    +'<small>'+esc(L(lang,"Short context from Scripture","Un bref contexte tiré de l’Écriture"))+'</small></span>'
    +'<span>'+records.length+' <span aria-hidden="true">'+(expanded?'−':'+')+'</span></span></button>';
  if(!expanded)return html+'</section>';
  html+='<div class="aoBiblePlacesGroups" role="list">';
  for(const [group,label] of Object.entries(GROUPS)){
    const items=records.filter(r=>r.group===group);
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
        html+='<button type="button" data-bible-place="'+esc(item.id)+'" aria-pressed="'+String(active)+'" class="'+(active?'active':'')+'">'+esc(translated(item,"title",lang))+'</button>';
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
    const namedEvents=Array.isArray(selected.events)?selected.events:[];
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
    html+='<p class="aoBiblePlacesHint">'+esc(L(lang,"Choose a place to see its biblical events and read the passages.","Choisissez un lieu pour découvrir les événements et lire les passages."))+'</p>';
  }
  return html+'</section>';
}
