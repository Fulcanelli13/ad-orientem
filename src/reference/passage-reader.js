// A stand-alone, optional TEXT passage view. No app registration, global
// handlers or changes to Mass/Prayer/Formation reader ownership.
// All untrusted source copy is rendered with textContent, never innerHTML.
const TERMS={
 en:{back:"Return",chapter:"Section",search:"Find in work",find:"Search",
  previous:"Previous",next:"Next",source:"Source",loading:"Reading source…",
  empty:"No matches",error:"Passage unavailable",go:"Open"},
 fr:{back:"Retour",chapter:"Section",search:"Rechercher dans l’œuvre",
  find:"Rechercher",previous:"Précédent",next:"Suivant",source:"Source",
  loading:"Chargement…",empty:"Aucun résultat",error:"Passage indisponible",go:"Ouvrir"}
};
function element(doc,tag,text){
 const e=doc.createElement(tag);
 if(text!==undefined)e.textContent=text;
 return e;
}
function button(doc,title,action){
 const b=element(doc,"button",title);b.type="button";b.addEventListener("click",action);return b;
}
export function mountSourcePassageReader(root,{
 reader,title,language="en",initialPassageId=null,onReturn=()=>{}
}={}){
 if(!root?.ownerDocument||typeof root.replaceChildren!=="function"||
    !reader?.open||!reader?.sections||!reader?.search)
  throw new TypeError("SOURCE_READER_ROOT_AND_SERVICE_REQUIRED");
 const doc=root.ownerDocument,fr=String(language).startsWith("fr");
 const L=TERMS[fr?"fr":"en"];
 const sections=reader.sections();
 if(!sections.length)throw new Error("SOURCE_READER_EMPTY_INDEX");
 let current=null,destroyed=false,request=0;
 const wrap=element(doc,"section");wrap.className="aoSourcePassageReader";
 wrap.setAttribute("aria-label",title||"Primary source");
 const head=element(doc,"header");head.className="aoSourceReaderHeader";
 const back=button(doc,L.back,()=>onReturn({passageId:current?.passageId??null,
   sectionId:current?.sectionId??null}));
 const heading=element(doc,"h2",title||reader.manifest.workId);
 head.append(back,heading);
 const line=element(doc,"div");line.className="aoSourceReaderActions";
 const label=element(doc,"label",L.chapter+" ");
 const chapter=element(doc,"select");
 sections.forEach(section=>{
  const option=element(doc,"option",section.title);option.value=section.passageId;
  chapter.append(option);
 });
 label.append(chapter);
 const previous=button(doc,L.previous,()=>{if(current?.previousId)void open(current.previousId)});
 const next=button(doc,L.next,()=>{if(current?.nextId)void open(current.nextId)});
 line.append(label,previous,next);
 const form=element(doc,"form");form.className="aoSourceReaderSearch";
 const search=element(doc,"input");search.type="search";search.minLength=2;
 search.placeholder=L.search;search.setAttribute("aria-label",L.search);
 const find=element(doc,"button",L.find);find.type="submit";
 form.append(search,find);
 const results=element(doc,"div");results.className="aoSourceReaderResults";
 const status=element(doc,"p");status.setAttribute("role","status");
 const locator=element(doc,"p");locator.className="aoSourceReaderLocator";
 const passage=element(doc,"article");passage.className="aoSourceReaderPassage";
 wrap.append(head,line,form,status,locator,passage,results);
 root.replaceChildren(wrap);
 async function open(id){
  if(destroyed)return null;
  const seq=++request;
  status.textContent=L.loading;
  try{
   const p=await reader.open(id);
   if(destroyed||seq!==request)return null;
   current=p;chapter.value=sections.find(s=>s.id===p.sectionId)?.passageId??sections[0].passageId;
   locator.textContent=p.sectionTitle+" · "+p.passageId+
    (p.sourceAnchor?" #"+p.sourceAnchor:"");
   passage.replaceChildren(element(doc,"p",p.text));
   previous.disabled=!p.previousId;next.disabled=!p.nextId;
   results.replaceChildren();
   status.textContent="";
   return p;
  }catch(error){
   if(destroyed||seq!==request)return null;
   previous.disabled=true;next.disabled=true;
   status.textContent=L.error+": "+String(error?.message??error);
   passage.replaceChildren();
   return null;
  }
 }
 chapter.addEventListener("change",()=>{void open(chapter.value)});
 form.addEventListener("submit",event=>{
  event.preventDefault();
  if(destroyed)return;
  const q=search.value.trim();
  if(q.length<2)return;
  const seq=++request;
  status.textContent=L.loading;
  void reader.search(q,{limit:25}).then(found=>{
   if(destroyed||seq!==request)return;
   results.replaceChildren();
   for(const item of found){
    results.append(button(doc,item.title+" · "+item.preview,()=>{void open(item.id)}));
   }
   status.textContent=found.length?"":L.empty;
  }).catch(error=>{
   if(destroyed||seq!==request)return;
   status.textContent=L.error+": "+String(error?.message??error);
  });
 });
 void open(initialPassageId??sections[0].passageId);
 return Object.freeze({
  open,close:()=>onReturn({passageId:current?.passageId??null,
   sectionId:current?.sectionId??null}),
  status:()=>Object.freeze({open:!destroyed,passageId:current?.passageId??null,
   sectionId:current?.sectionId??null}),
  destroy(){destroyed=true;request++;root.replaceChildren()}
 });
}
