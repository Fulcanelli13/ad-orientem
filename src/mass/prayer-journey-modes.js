// Source-owned preparation and thanksgiving settings (quick/standard/full).
// This layer only projects existing store modes; it never owns prayer text,
// pretends a fixed duration, or changes an actual Mass selection.
export const PRAYER_JOURNEY_MODES=Object.freeze(["quick","standard","full"]);
export function prayerJourneyMode(value){
 return PRAYER_JOURNEY_MODES.includes(value)?value:"standard";
}
export function renderPrayerJourneyModes(root,{prepare="standard",thanksgiving="standard",language="en"}={}){
 if(!root?.querySelectorAll)return Object.freeze({prepare:"standard",thanksgiving:"standard"});
 const fr=String(language).startsWith("fr");
 const labels={quick:fr?"Brève":"Short",standard:fr?"Normale":"Standard",
  full:fr?"Approfondie":"Extended"};
 const modes={prepare:prayerJourneyMode(prepare),thanksgiving:prayerJourneyMode(thanksgiving)};
 for(const el of root.querySelectorAll("[data-mass-journey-prayer-mode]")){
  const phase=el.dataset.massJourneyPrayerPhase,mode=el.value;
  if(!Object.hasOwn(modes,phase)||!PRAYER_JOURNEY_MODES.includes(mode))continue;
  el.checked=mode===modes[phase];
  const label=el.closest("label")?.querySelector("span");
  if(label)label.textContent=labels[mode];
 }
 for(const phase of ["prepare","thanksgiving"]){
  const legend=root.querySelector('[data-mass-journey-prayer-heading="'+phase+'"]');
  if(legend)legend.textContent=fr?"Choisissez la longueur de la prière":"Choose prayer depth";
  const disclosure=root.querySelector('[data-mass-journey-prayer-open="'+phase+'"]');
  const summary=disclosure?.querySelector?.("summary");
  if(summary)summary.textContent=phase==="prepare"?
    (fr?"Durée de prière · ":"Prayer length · ")+labels[modes[phase]]:
    (fr?"Préparer l’action de grâces · ":"Plan thanksgiving · ")+labels[modes[phase]];
 }
 return Object.freeze(modes);
}

export function commitPrayerJourneyMode(store,phase,mode){
 if(!["prepare","thanksgiving"].includes(phase)||!PRAYER_JOURNEY_MODES.includes(mode))
  return false;
 if(typeof store?.dispatch!=="function"||typeof store?.getState!=="function")return false;
 const previous=store.getState()?.[phase]?.mode;
 if(previous===mode)return true;
 store.dispatch({type:phase==="prepare"?"prepare-mode":"thanksgiving-mode",mode});
 return store.getState()?.[phase]?.mode===mode;
}
