import {ROSARY_METHODS,DOMINICAN_OPENING,MONTFORT_GRACES,DEVOTIONAL_METHOD_SOURCES,FIFTEEN_CYCLE,lastDecadeBoundary,nextFullRosarySet} from "./devotional-methods.js";
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const txt=(en,fr,language)=>language==="fr"?fr:en;
/**
 * This adds controls and method-specific introductions to the canonical donor.
 * It neither writes to the donor's step DOM nor supplies a second bead engine.
 */
export function paintRosaryMethods({root,info,choice,language="en",corpus}={}){
 const owner=root?.querySelector?.('.pbShell');
 if(!owner)return false;
 const active=!!info?.state?.set;
 root.querySelectorAll(".aoRosaryMethods,.aoRosaryMethodStage").forEach(node=>{
  if(active===node.classList.contains("aoRosaryMethods"))node.remove();
 });
 if(!active){
  const location=owner.querySelector(".lab-mystery-grid,.pbModuleGrid")||owner.querySelector(".pbFlow");
  if(!location)return false;
  let panel=owner.querySelector(".aoRosaryMethods");
  if(!panel){panel=root.ownerDocument.createElement("section");panel.className="aoRosaryMethods";location.insertAdjacentElement("beforebegin",panel)}
  const selected=ROSARY_METHODS.find(x=>x.id===choice.method)||ROSARY_METHODS[0];
  let html='<h2>'+esc(txt("Choose a method of prayer","Choisissez une méthode de prière",language))+'</h2>';
  html+='<div class="aoRosaryMethodChoices" role="group" aria-label="'+esc(txt("Rosary form","Forme du Rosaire",language))+'">';
  for(const method of ROSARY_METHODS){
   html+='<button type="button" data-ao-rosary-method-option="'+esc(method.id)+'" aria-pressed="'+(method.id===selected.id)+'">'+esc(method[language==="fr"?"fr":"en"])+'</button>';
  }
  html+='</div><p class="aoRosaryMethodDescription">'+esc(selected[language==="fr"?"noteFr":"noteEn"])+'</p>';
  html+='<div class="aoRosaryMethodChoices" role="group" aria-label="'+esc(txt("Length of Rosary","Longueur du Rosaire",language))+'">';
  for(const amount of [5,15])html+='<button type="button" data-ao-rosary-length-option="'+amount+'" aria-pressed="'+(choice.length===amount)+'">'+amount+' '+esc(txt("decades","dizaines",language))+'</button>';
  html+='</div>';
  if(choice.length===15)html+='<p>'+esc(txt("The full cycle begins with Joyful, continues with Sorrowful and finishes with Glorious. Opening prayers occur only once.","Le cycle complet commence par les mystères joyeux, puis douloureux, et se termine par les glorieux. Les prières initiales ne sont dites qu’une fois.",language))+'</p>';
  if(choice.method==="dominican"){
   const sign=corpus?.foundations_sign_of_cross?.[language]||"";
   const glory=corpus?.foundations_glory_be?.[language]||"";
   html+='<section class="aoRosaryDominicanOpening"><h3>'+esc(txt("Dominican opening — pray before selecting your mysteries","Ouverture dominicaine — à réciter avant de choisir les mystères",language))+'</h3>';
   html+='<p>'+esc(sign)+'</p>';
   for(const line of DOMINICAN_OPENING)html+='<p><b>'+esc(line.role)+'.</b> '+esc(line.text[language])+'</p>';
   html+='<p>'+esc(glory)+'</p>';
   html+='<a href="'+DEVOTIONAL_METHOD_SOURCES.dominican+'" target="_blank" rel="noopener noreferrer">'+esc(txt("Dominican Confraternity · source","Confrérie dominicaine · source",language))+' ↗</a>';
   html+='</section>';
   html+='<p>'+esc(txt("After this opening, select a mystery group. The ordinary Creed and preliminary beads will be skipped, not repeated.","Après cette ouverture, choisissez les mystères. Le Credo et les grains introductifs habituels ne seront pas répétés.",language))+'</p>';
  }
  if(choice.method==="montfort")html+='<p><a href="'+DEVOTIONAL_METHOD_SOURCES.montfortOriginal+'" target="_blank" rel="noopener noreferrer">'+esc(txt("St Louis-Marie · original French methods","Saint Louis-Marie · méthodes originales françaises",language))+' ↗</a></p>';
  panel.innerHTML=html;
  return true;
 }
 let stage=owner.querySelector(".aoRosaryMethodStage");
 if(!stage){stage=root.ownerDocument.createElement("section");stage.className="aoRosaryMethodStage";const anchor=owner.querySelector(".aoP435930RosaryBar,.lab-view-head,.pbTop,.pbHead,header");if(anchor)anchor.insertAdjacentElement("afterend",stage);else owner.prepend(stage)}
 const step=info.step,mi=info.mi,idx=FIFTEEN_CYCLE.indexOf(info.set);
 const progress=choice.length===15&&idx>=0&&mi!==null?idx*5+mi+1:null;
 stage.hidden=choice.method!=="montfort"&&choice.length!==15;
 let html="";
 if(progress)html+='<div class="aoRosaryMethodProgress">'+esc(txt("Full Rosary","Rosaire complet",language))+' · '+progress+' / 15</div>';
 if(choice.method==="montfort"&&step?.kind==="mystery"&&MONTFORT_GRACES[step.id]){
  html+='<strong>'+esc(txt("St Louis-Marie de Montfort · grace of the mystery","Saint Louis-Marie de Montfort · grâce du mystère",language))+'</strong><p>'+esc(MONTFORT_GRACES[step.id][language])+'</p>';
  html+='<a href="'+DEVOTIONAL_METHOD_SOURCES.montfortOriginal+'" target="_blank" rel="noopener noreferrer">'+esc(txt("Original French method","Méthode originale française",language))+' ↗</a>';
 }
 if(choice.length===15&&nextFullRosarySet(info.set)&&info.index===lastDecadeBoundary(info.steps)){
  const target=nextFullRosarySet(info.set);
  html+='<p>'+esc(txt("The next prayer continues with the","La prière suivante continue avec les mystères",language))+' '+esc(target==="sorrowful"?txt("Sorrowful mysteries","douloureux",language):txt("Glorious mysteries","glorieux",language))+'.</p>';
  html+='<button type="button" data-ao-rosary-continue="'+esc(target)+'">'+esc(txt("Continue the full Rosary","Continuer le Rosaire complet",language))+' →</button>';
 }
 stage.innerHTML=html;
 return true;
}
