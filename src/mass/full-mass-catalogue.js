// Native visual projection of the *existing* vetted celebration catalogue.
// The historical selector remains the authority for IDs, permissions,
// circumstances and the resulting Proper. These rows own no liturgical data.
const FAMILIES=Object.freeze({
 votive:{attr:"data-ao-celebration",en:"Choose a votive Mass",fr:"Choisir une messe votive"},
 requiem:{attr:"data-ao-requiem",en:"Choose the Requiem circumstance",fr:"Choisir la circonstance du Requiem"},
 nuptial:{attr:"data-ao-celebration",en:"Nuptial Mass",fr:"Messe nuptiale"}
});
function readable(button){
 const bold=button.querySelector("b,strong"),span=button.querySelector("span,small");
 return {title:(bold?.textContent??button.textContent??"").trim(),
   note:(span?.textContent??"").trim()};
}
export function sourceOwnedCatalogueRows(body,stage){
 const family=FAMILIES[stage];
 if(!body||!family)return Object.freeze([]);
 const options=[...body.querySelectorAll("button["+family.attr+"]")];
 return Object.freeze(options.map((source,i)=>{
  const id=source.getAttribute(family.attr);
  const {title,note}=readable(source);
  return Object.freeze({id,title,note,source,disabled:source.disabled===true,index:i});
 }).filter(row=>row.id && row.title));
}
export function mountSourceOwnedMassCatalogue({
 doc=globalThis.document,stage=()=>globalThis.AO_CELEBRATION_ARCH_V1?.stage,
 language=()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language??"en",
}={}){
 if(!doc?.body||typeof stage!=="function")throw new TypeError("Mass catalogue DOM and stage required");
 let panel=null,disposed=false,observer=null,signature="",filter="",refreshQueued=false,lastOriginals=[];
 const flow=()=>doc.getElementById("ao-mass-flow-v1");
 const original=()=>flow()?.querySelector(".aoMassFlowBody")??null;
 const showOriginals=()=>{for(const node of lastOriginals)node.classList?.remove("aoMassCatalogueShadowed");lastOriginals=[];};
 const tr=(en,fr)=>String(language()).startsWith("fr")?fr:en;
 function refresh(){
  refreshQueued=false;if(disposed)return;
  const body=original(),category=String(stage()??"").toLowerCase();
  const rows=sourceOwnedCatalogueRows(body,category);
  if(!rows.length){
    showOriginals();panel?.remove();panel=null;signature="";return;
  }
  const signatureNext=category+"|"+String(language())+"|"+rows.map(x=>x.id+":"+x.title+":"+x.note+":"+x.disabled).join("|");
  if(panel?.isConnected&&signature===signatureNext&&rows.every((x,i)=>x.source===lastOriginals[i]))return;
  signature=signatureNext;showOriginals();
  const previous=panel;
  panel=doc.createElement("section");panel.dataset.aoMassCatalogue="";
  panel.className="aoMassCatalogueNative";
  panel.setAttribute("aria-label",tr(FAMILIES[category].en,FAMILIES[category].fr));
  const heading=doc.createElement("h3");
  heading.textContent=tr(FAMILIES[category].en,FAMILIES[category].fr);
  panel.append(heading);
  if(category==="votive"&&rows.length>=5){
   const search=doc.createElement("input");search.type="search";
   search.dataset.aoMassCatalogueSearch="";
   search.setAttribute("aria-label",tr("Search votive Masses","Rechercher une messe votive"));
   search.placeholder=tr("Search within this catalogue","Rechercher dans ce catalogue");
   search.value=filter;panel.append(search);
   search.addEventListener("input",()=>{filter=search.value;applyFilter()});
  }else filter="";
  const list=doc.createElement("div");list.className="aoMassCatalogueRows";
  for(const row of rows){
   const button=doc.createElement("button");button.type="button";button.dataset.aoMassCatalogueChoice=row.id;
   button.dataset.aoMassCatalogueIndex=String(row.index);
   button.disabled=row.disabled;
   const name=doc.createElement("strong");name.textContent=row.title;
   button.append(name);
   if(row.note&&row.note!==row.title){
    const desc=doc.createElement("small");desc.textContent=row.note;button.append(desc);
   }
   button.addEventListener("click",()=>{
    if(!row.source.isConnected||String(stage()).toLowerCase()!==category){
     const status=panel?.querySelector("[data-ao-mass-catalogue-error]");
     if(status){status.hidden=false;status.textContent=tr("Source selection changed; reopen the catalogue.","La liste source a changé ; rouvrez le catalogue.");}
     return;
    }
    row.source.click(); // keep 1960 rank and actual Proper resolution entirely host-owned
    queueRefresh();
   });
   list.append(button);
  }
  panel.append(list);
  const error=doc.createElement("p");error.dataset.aoMassCatalogueError="";
  error.hidden=true;error.setAttribute("role","alert");panel.append(error);
  // Add this visual control just below the source's introduction. Original
  // buttons stay live in DOM so all delegated host actions work unchanged.
  body.insertBefore(panel,body.firstElementChild?.nextSibling??body.firstChild);
  previous?.remove();
  lastOriginals=rows.map(x=>x.source);
  for(const button of lastOriginals)button.classList.add("aoMassCatalogueShadowed");
  applyFilter();
 }
 function applyFilter(){
  if(!panel)return;
  const q=filter.trim().toLocaleLowerCase();
  for(const button of panel.querySelectorAll("[data-ao-mass-catalogue-choice]"))
   button.hidden=Boolean(q)&&!button.textContent.toLocaleLowerCase().includes(q);
 }
 function queueRefresh(){
  if(refreshQueued||disposed)return;refreshQueued=true;
  queueMicrotask(refresh);
 }
 observer=typeof doc.defaultView?.MutationObserver==="function"?
  new doc.defaultView.MutationObserver(records=>{
   if(records.some(record=>record.type==="childList"&&[...record.addedNodes,...record.removedNodes].some(node=>
      node.nodeType===1&&!node.closest?.("[data-ao-mass-catalogue]")&&
      (node.matches?.("#ao-mass-flow-v1,.aoMassFlowBody,.aoFlowOptions,[data-ao-celebration],[data-ao-requiem],.aoFlowActions")||
       node.querySelector?.("#ao-mass-flow-v1,.aoMassFlowBody,[data-ao-celebration],[data-ao-requiem],.aoFlowActions")))))
      queueRefresh();
  }):null;
 observer?.observe(doc.body,{childList:true,subtree:true});
 doc.addEventListener("click",queueRefresh);
 doc.addEventListener("change",queueRefresh);
 refresh();
 return Object.freeze({refresh,stage:()=>String(stage()??""),
  status:()=>Object.freeze({stage:stage(),visible:Boolean(panel?.isConnected),
   entries:panel?.querySelectorAll("[data-ao-mass-catalogue-choice]").length??0}),
  dispose(){disposed=true;observer?.disconnect();doc.removeEventListener("click",queueRefresh);
   doc.removeEventListener("change",queueRefresh);showOriginals();panel?.remove();panel=null;}
 });
}
