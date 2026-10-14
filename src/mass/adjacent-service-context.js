// A public service alongside Mass is not a rite of the Mass. Its presence and
// placement are reported by the user; the 1962 resolver and Mass session plan
// never derive or consume these flags.
export const ADJACENT_SERVICE_CHOICES=Object.freeze([
 Object.freeze({id:"ADORATION_BEFORE",service:"ADORATION",position:"BEFORE",en:"Adoration before Mass",fr:"Adoration avant la messe"}),
 Object.freeze({id:"BENEDICTION_BEFORE",service:"BENEDICTION",position:"BEFORE",en:"Benediction before Mass",fr:"Bénédiction avant la messe"}),
 Object.freeze({id:"ADORATION_AFTER",service:"ADORATION",position:"AFTER",en:"Adoration after Mass",fr:"Adoration après la messe"}),
 Object.freeze({id:"BENEDICTION_AFTER",service:"BENEDICTION",position:"AFTER",en:"Benediction after Mass",fr:"Bénédiction après la messe"})
]);
const flag=items=>Object.freeze(items.map(x=>Object.freeze({...x})));
export function projectAdjacentServices(choices={},language="en"){
 const fr=String(language).startsWith("fr");
 const active=ADJACENT_SERVICE_CHOICES.filter(x=>choices?.[x.id]===true)
 .map(x=>({id:x.id,service:x.service,position:x.position,label:fr?x.fr:x.en}));
 return Object.freeze({
  before:flag(active.filter(x=>x.position==="BEFORE")),
  after:flag(active.filter(x=>x.position==="AFTER")),
 });
}
export function toggleAdjacentService(choices={},id,checked){
 if(!ADJACENT_SERVICE_CHOICES.some(x=>x.id===id))
  throw new Error("UNKNOWN_ADJACENT_SERVICE_"+id);
 if(typeof checked!=="boolean")throw new TypeError("ADJACENT_SERVICE_CHOICE_NOT_BOOLEAN");
 return Object.freeze({...choices,[id]:checked});
}
export function renderAdjacentServices(root,choices={},language="en"){
 if(!root)return null;
 const fr=String(language).startsWith("fr");
 const t=(en,frText)=>fr?frText:en,doc=root.ownerDocument;
 const model=projectAdjacentServices(choices,language);
 for(const [position,entries] of [["before",model.before],["after",model.after]]){
  const target=root.querySelector("[data-mass-journey-adjacent-"+position+"]");
  if(!target)continue;
  const oldCards=[...target.children];
  const oldIds=oldCards.map(el=>el.dataset?.massJourneyAdjacentActive);
  const nextIds=entries.map(el=>el.id);
  // Retain the very same action buttons across store-driven refreshes:
  // the Prayer reader's returnFocus references the original triggering DOM
  // node, which cannot be restored if this component rebuilds its children.
  const unchanged=oldIds.length===nextIds.length&&oldIds.every((id,i)=>id===nextIds[i]);
  target.hidden=entries.length===0;
  if(!unchanged){
   const existing=new Map(oldCards.map(card=>[card.dataset?.massJourneyAdjacentActive,card]));
   const nodes=entries.map(entry=>{
    const prior=existing.get(entry.id);
    if(prior)return prior;
    const card=doc.createElement("div");card.className="aoMassJourneyAdjacentCard";
    card.dataset.massJourneyAdjacentActive=entry.id;
    const title=doc.createElement("strong");
    const note=doc.createElement("small");
    const action=doc.createElement("button");
    action.type="button";action.className="aoMassJourneyAdjacentLaunch";
    action.dataset.massJourneyOpenAdjacent=entry.id;
    card.append(title,note,action);return card;
   });
   target.replaceChildren(...nodes);
  }
  for(const entry of entries){
   const card=[...target.children].find(el=>el.dataset.massJourneyAdjacentActive===entry.id);
   if(!card)continue;
   const title=card.querySelector("strong");
   const note=card.querySelector("small");
   const action=card.querySelector("[data-mass-journey-open-adjacent]");
   if(title)title.textContent=entry.label;
   if(note)note.textContent=t("Separate service · reported by you, not part of the Mass",
    "Office distinct · indiqué par vous, ne faisant pas partie de la messe");
   if(action)action.textContent=t(entry.service==="BENEDICTION"?"Follow Benediction":"Open Adoration",
    entry.service==="BENEDICTION"?"Suivre la bénédiction":"Ouvrir l’adoration");
  }
 }
 const details=root.querySelector("[data-mass-journey-adjacent-choices]");
 if(details){
  const summary=details.querySelector("summary");
  if(summary)summary.textContent=t("Other services at this church","Autres offices célébrés dans cette église");
  const intro=details.querySelector("[data-mass-journey-adjacent-intro]");
  if(intro)intro.textContent=t(
   "Only select services actually taking place. Adoration and Benediction remain separate from the Mass and do not change its texts.",
   "Indiquez seulement les offices réellement célébrés. L’adoration et la bénédiction du Saint-Sacrement restent distinctes de la messe et n'en modifient pas les textes.");
  for(const item of ADJACENT_SERVICE_CHOICES){
   const input=details.querySelector('[data-mass-journey-adjacent-choice="'+item.id+'"]');
   if(!input)continue;
   input.checked=choices?.[item.id]===true;
   const label=input.closest("label")?.querySelector("span");
   if(label)label.textContent=fr?item.fr:item.en;
  }
 }
 return model;
}