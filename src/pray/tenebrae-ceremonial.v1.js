/*
 * Optional observational companion to an actually celebrated local Tenebrae
 * ceremony. NOT part of the canonical 1960 Matins/Lauds text or a claim
 * about universal ceremonial rubrics. No timer, no automatic advancement.
 * Witness: https://www.institute-christ-king.org/pittsburgh-gallery/1633-tenebrae2024
 */
const SOURCE="https://www.institute-christ-king.org/pittsburgh-gallery/1633-tenebrae2024";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const freshTenebraeCeremony=()=>({enabled:false,extinguished:0,hidden:false,strepitus:false,returned:false});
export function tenebraeCeremonialAction(old,action,step){
 const state={...freshTenebraeCeremony(),...old};
 if(action==="reset")return freshTenebraeCeremony();
 if(action==="enable")return {...state,enabled:true};
 if(action==="disable")return {...state,enabled:false};
 if(!state.enabled)return state;
 if(action==="extinguish"&&step?.kind==="PSALM"&&state.extinguished<14&&!state.hidden)return {...state,extinguished:state.extinguished+1};
 if(action==="undo"&&state.extinguished>0&&!state.hidden)return {...state,extinguished:state.extinguished-1};
 if(action==="hide"&&state.extinguished===14&&!state.hidden&&step?.id==="L.BENEDICTUS")return {...state,hidden:true};
 if(action==="strepitus"&&state.hidden&&!state.strepitus)return {...state,strepitus:true};
 if(action==="return"&&state.strepitus&&!state.returned)return {...state,returned:true};
 return state;
}
export function renderTenebraeCeremony({ceremony,step,french=false}={}){
 const s={...freshTenebraeCeremony(),...ceremony},L=(en,fr)=>french?fr:en;
 if(!s.enabled)return '<section class="aoTenebCeremonyIntro"><button type="button" data-p435930-tenebrae-ceremony="enable">'+esc(L("Follow solemn Tenebrae (optional local ceremony)","Suivre les Ténèbres solennelles (cérémonial local facultatif)"))+'</button><p>'+esc(L("The fifteen-candle ceremony is not required by the 1960 Office. Use this companion only when actually following a celebration with these ceremonies.","Le cérémonial des quinze cierges n’est pas exigé par l’Office de 1960. Utilisez ce compagnon seulement si vous suivez une célébration qui le pratique."))+'</p></section>';
 const number=Math.max(0,Math.min(14,s.extinguished));
 const lamps=Array.from({length:15},(_,i)=>{
  const lit=i===14?!s.hidden||s.returned:i>=number;
  return '<span role="img" aria-label="'+esc(L("Candle ","Cierge ")+(i+1)+(lit?L(" lit"," allumé"):L(" extinguished or concealed"," éteint ou caché")))+'" style="height:40px;width:8px;margin:3px;background:'+(lit?'#ddab58':'#5e6065')+';border-radius:6px;display:inline-block;opacity:'+(lit?'1':'.37')+'"></span>';
 }).join("");
 const psalm=step?.kind==="PSALM";
 const cue=psalm?L("Psalm reading: mark the extinguishing only when it occurs at the actual service.","Psaume : marquez l’extinction seulement lorsqu’elle a effectivement lieu."):L("Follow the current Office passage. Ceremonial events are recorded manually, not triggered by navigation.","Suivez la lecture de l’Office. Les événements sont constatés manuellement, non déclenchés par la navigation.");
 const button=(action,en,fr,disabled=false)=>'<button type="button" data-p435930-tenebrae-ceremony="'+action+'" '+(disabled?'disabled ':'')+'>'+esc(L(en,fr))+'</button>';
 return '<aside class="aoTenebCeremony" aria-label="'+esc(L("Observed local Tenebrae ceremony","Cérémonial local des Ténèbres observé"))+'" style="padding:1rem;border:1px solid currentColor;border-radius:12px;margin:1rem 0">'+
 '<h3>'+esc(L("Solemn Tenebrae · local ceremony","Ténèbres solennelles · cérémonial local"))+'</h3>'+
 '<p>'+esc(L("Optional witnessed ceremonial; separate from the canonical 1960 Office. Never extinguish a physical candle on the app’s instruction.","Cérémonial observé facultatif, distinct de l’Office canonique de 1960. L’application ne commande jamais d’éteindre un cierge réel."))+'</p>'+
 '<div role="group" aria-label="'+esc(L("Fifteen ceremonial candles","Quinze cierges cérémoniels"))+'" style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:2px">'+lamps+'</div>'+
 '<p aria-live="polite">'+esc(L("Recorded extinguishings: ","Extinctions constatées : ")+number+"/14"+(s.hidden?L(" · final candle concealed"," · dernier cierge caché"):"")+(s.strepitus?" · strepitus":"")+(s.returned?L(" · final candle returned"," · dernier cierge réapparu"):""))+'</p>'+
 '<p>'+esc(cue)+'</p><div class="aoTenebCeremonyControls" style="display:flex;gap:8px;flex-wrap:wrap">'+
 (number<14?button("extinguish","Observed: extinguish one","Observé : éteindre un cierge",!psalm):"")+
 (number>0&&!s.hidden?button("undo","Undo last mark","Annuler la dernière marque"):"")+
 (number===14&&!s.hidden?button("hide","Observed: conceal final candle","Observé : cacher le dernier cierge",step?.id!=="L.BENEDICTUS"):"")+
 (s.hidden&&!s.strepitus?button("strepitus","Observed: strepitus","Observé : strepitus"):"")+
 (s.strepitus&&!s.returned?button("return","Observed: final candle returns","Observé : retour du dernier cierge"):"")+
 button("reset","Reset ceremony","Recommencer le cérémonial")+
 button("disable","Close companion","Fermer le compagnon")+'</div>'+
 '<small>'+esc(L("Record actual local events only. The cue sequence reflects an historical fifteen-candle form, not a universal 1960 rubric.","Notez seulement les événements réellement observés. La séquence reflète un usage historique des quinze cierges, non une rubrique universelle de 1960."))+' <a href="'+SOURCE+'" target="_blank" rel="noopener noreferrer">'+esc(L("ICKSP source","Source ICRSP"))+'</a></small></aside>';
}
