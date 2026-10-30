// M1 pre-reader access presentation. The host still owns Mass identity/Proper,
 // native full-mass-preflight owns the selections, and R17 owns resumption.
 // This is a presentation-only projection; no duplicate form or persistence.
const L=(fr,en,french)=>fr?french:en;
const labelled=(value,choices)=>choices[value]??value??"—";

// M1 is now the standard Mass entry. ?aoMassAccessM1=0 restores the
// original preflight presentation without touching any saved R17 Mass.
export function m1AccessPreviewRequested(win=globalThis){
  try{return new URLSearchParams(win?.location?.search||"").get("aoMassAccessM1")!=="0";}
  catch{return true;}
}

export function m1AccessRows(selection,{fr=false,optionalRites=false}={}){
  const before=labelled(selection?.beforeMass,{
    none:L(fr,"Directly to Mass","Directement à la messe"),
    prepare:L(fr,"Brief preparation","Courte préparation"),
    full:L(fr,"Full preparation","Préparation complète")});
  const after=labelled(selection?.afterMass,{
    none:L(fr,"Finish after Mass","Terminer après la messe"),
    thanksgiving:L(fr,"Thanksgiving","Action de grâces"),
    full:L(fr,"Full prayers","Prières complètes")});
  const language=selection?.readerLanguage==="fr"?"Français":"English";
  const follow=selection?.readerMode==="MISSAL"?L(fr,"Missal","Missel"):"LIVE";
  const mass=selection?.kind==="CALENDAR"
    ?L(fr,"Mass of the day","Messe du jour")
    :selection?.kindLabel??L(fr,"Selected Mass","Messe choisie");
  const entries=[
    ["mass",L(fr,"Which Mass","Quelle messe"),mass],
    ["ceremony",L(fr,"Celebrated as","Célébrée comme"),selection?.formLabel??"—"],
    ["reader",L(fr,"How to follow","Comment suivre"),follow],
    ["language",L(fr,"Language","Langue"),language],
    ["before",L(fr,"Before Mass","Avant la messe"),before],
    ["after",L(fr,"After Mass","Après la messe"),after],
  ];
  if(optionalRites)entries.push(["rites",L(fr,"Other rites","Autres rites"),
    L(fr,"Ceremonies actually taking place","Cérémonies réellement célébrées")]);
  return Object.freeze(entries.map(([id,title,value])=>Object.freeze({id,title,value})));
}

// Fail closed: no Introit from a pending/stale or substituted Calendar Proper.
export function m1SelectedIntroit(legacy,{ready=false}={}){
  if(!ready)return null;
  const proper=legacy?.proper?.data;
  const raw=proper?.introit?.lat;
  if(typeof raw!=="string")return null;
  const first=raw.split(/\r?\n/).map(x=>x.trim()).find(Boolean)||"";
  if(!first)return null;
  return first.length<=110?first:first.slice(0,110).replace(/\s+\S*$/,"").trim()+"…";
}

export function paintM1AccessRows(root,selection,{fr=false,optionalRites=false}={}){
  const holder=root?.querySelector?.("[data-m1-rows]");
  if(!holder)return null;
  const doc=holder.ownerDocument,rows=m1AccessRows(selection,{fr,optionalRites});
  // Construct with DOM text nodes, never template-inject source Proper data.
  holder.replaceChildren(...rows.map(row=>{
    const button=doc.createElement("button");button.type="button";
    button.dataset.m1Choice=row.id;button.className="aoM1Choice";
    button.setAttribute("aria-label",row.title+": "+row.value);
    const body=doc.createElement("span");body.className="aoM1ChoiceContent";
    const title=doc.createElement("small");title.textContent=row.title;
    const value=doc.createElement("strong");value.textContent=row.value;
    const arrow=doc.createElement("span");arrow.className="aoM1ChoiceArrow";
    arrow.textContent="›";arrow.setAttribute("aria-hidden","true");
    body.append(title,value);button.append(body,arrow);return button;
  }));
  return rows;
}
