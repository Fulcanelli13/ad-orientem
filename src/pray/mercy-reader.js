import {mercyStepInfo,MERCY_GUIDE,DEVOTIONAL_METHOD_SOURCES} from "./devotional-methods.js";
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const txt=(en,fr,language)=>language==="fr"?fr:en;
export function renderMercyReader({steps,state,corpus,language="en"}={}){
 if(!Array.isArray(steps)||!steps.length)return "";
 const info=mercyStepInfo(steps,state?.step),step=info.step,isFrench=language==="fr";
 const p=step.canonicalId?corpus?.[step.canonicalId]:null;
 const title=p?(isFrench?p.titleFr||p.title:p.title):step.title?.[language];
 const prayer=p?(p[language]||p.en):step.text?.[language];
 if(!title||!prayer)throw Error("Divine Mercy missing canonical prayer "+info.index);
 const src=step.source||p?.provenance?.url||(isFrench?DEVOTIONAL_METHOD_SOURCES.mercyFr:DEVOTIONAL_METHOD_SOURCES.mercyEn);
 const guided=state?.mode!=="simple";
 const kind=step.kind;
 const label=kind==="large"?txt("Large bead","Gros grain",language):kind==="small"?txt("Small bead","Petit grain",language):
  kind==="conclusion"?txt("Final invocation","Invocation finale",language):txt("Opening prayer","Prière initiale",language);
 const count=step.decade?txt("Decade","Dizaine",language)+" "+step.decade+" / 5 · "+step.bead+" / 10":
  kind==="conclusion"?txt("Closing","Conclusion",language)+" "+step.repetition+" / 3":txt("Opening","Ouverture",language);
 const direction=guided?(kind==="large"?txt("Offer the sacrifice of Christ to the Eternal Father.","Offrez le sacrifice du Christ au Père éternel.",language):
  kind==="small"?txt("Invoke mercy through Christ’s sorrowful Passion.","Invoquez la miséricorde par la douloureuse Passion du Christ.",language):
  kind==="conclusion"?txt("Repeat the concluding invocation three times.","Répétez trois fois l’invocation finale.",language):""):"";
 let guide="";
 if(guided){
  guide='<details class="aoMercyGuide"><summary>'+esc(txt("Guide · pray the chaplet","Guide · prier le chapelet",language))+'</summary>';
  for(const item of MERCY_GUIDE)guide+='<p>'+esc(item[language])+' <a href="'+esc(item.source)+'" target="_blank" rel="noopener noreferrer">Source ↗</a></p>';
  guide+='</details>';
 }
 let beads="";
 if(step.decade){
  beads='<div class="aoMercyBeads" aria-label="'+esc(txt("Ten beads","Dix grains",language))+'">';
  for(let i=1;i<=10;i++)beads+='<i class="'+(i===step.bead?'active':i<step.bead?'past':'')+'"></i>';
  beads+='</div>';
 }
 let result='<main class="aoP435930Body aoMercyReader" data-ao-devotional-sequence="divine-mercy" data-ao-mercy-step="'+info.index+'">';
 result+='<div class="aoMercyModes" role="group" aria-label="'+esc(txt("Guidance","Accompagnement",language))+'">';
 result+='<button type="button" data-p435930-mercy-mode="simple" aria-pressed="'+(!guided)+'">'+esc(txt("Simple","Simple",language))+'</button>';
 result+='<button type="button" data-p435930-mercy-mode="guided" aria-pressed="'+guided+'">'+esc(txt("Guided","Guidé",language))+'</button></div>';
 result+=guide+'<div class="aoMercyCounter"><small>'+esc(count)+'</small><small>'+(info.index+1)+' / '+info.count+'</small></div>'+beads;
 result+='<article class="aoMercyPrayer" data-ao-mercy-kind="'+esc(kind)+'"><small>'+esc(label)+'</small><h2 tabindex="-1">'+esc(title)+'</h2>';
 result+='<div class="aoMercyVernacular" lang="'+esc(language)+'">'+esc(prayer)+'</div>';
 if(direction)result+='<p class="aoMercyDirection">'+esc(direction)+'</p>';
 result+='<details class="aoMercySource"><summary>'+esc(txt("Source and sequence","Source et ordre des prières",language))+'</summary>';
 result+='<a href="'+esc(src)+'" target="_blank" rel="noopener noreferrer">'+esc(txt("Read source","Consulter la source",language))+' ↗</a></details></article>';
 result+='<nav class="aoMercyControls" aria-label="'+esc(txt("Move through prayers","Parcours des prières",language))+'">';
 result+='<button type="button" data-p435930-mercy-move="prev" '+(info.index===0?'disabled':'')+'>← '+esc(txt("Previous","Précédent",language))+'</button>';
 result+=info.completed?'<button type="button" data-p435930-mercy-restart>'+esc(txt("Pray again","Recommencer",language))+'</button>':
  '<button type="button" data-p435930-mercy-move="next">'+esc(txt("Next prayer","Prière suivante",language))+' →</button>';
 result+='</nav>';
 if(info.completed)result+='<p class="aoMercyClosing">'+esc(txt("The customary triple conclusion is complete. Additional prayers are optional.","La triple invocation finale est achevée. Les prières supplémentaires sont facultatives.",language))+'</p>';
 return result+'</main>';
}
