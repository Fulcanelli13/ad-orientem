import {createSourceTextReader} from "./reader.js";
// Standalone demonstration only. No route, global registration or app bootstrap.
export async function mountSourceTextPilot(root,{manifestUrl,fetchImpl=globalThis.fetch}={}){
 if(!root?.ownerDocument||!manifestUrl||typeof fetchImpl!=="function")
  throw new TypeError("SOURCE_TEXT_DEMO_HOST_REQUIRED");
 const baseUrl=new URL(manifestUrl,globalThis.location.href);
 async function fetchJson(url){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("SOURCE_TEXT_DEMO_FETCH_FAILED");
  return response.json();
 }
 const manifest=await fetchJson(baseUrl.href);
 const reader=createSourceTextReader({manifest,loadChunk:path=>fetchJson(new URL(path,baseUrl).href)});
 const doc=root.ownerDocument;
 const make=(type,cls,label)=>{
  const el=doc.createElement(type);if(cls)el.className=cls;
  if(label!==undefined)el.textContent=label;return el;
 };
 const heading=make("h2",null,reader.work.title);
 const meta=make("p","aoStMeta",reader.work.editionId+" · "+reader.work.language+" · Demonstration");
 const section=make("section","aoStPassage");
 const locator=make("p","aoStLocator","");
 const text=make("p","aoStBody","");
 const controls=make("nav","aoStNav");
 const previous=make("button",null,"Previous passage");
 const next=make("button",null,"Next passage");
 previous.type=next.type="button";controls.append(previous,next);
 const search=make("form","aoStSearch");
 const input=make("input");
 input.type="search";input.placeholder="Search this demonstration";
 input.setAttribute("aria-label","Search passage text");input.required=true;
 const submit=make("button",null,"Search full text");submit.type="submit";
 search.append(input,submit);
 const found=make("div","aoStResults");const notice=make("p","aoStNotice","");
 notice.setAttribute("aria-live","polite");
 section.append(locator,text,controls);root.replaceChildren(heading,meta,section,search,found,notice);
 let currentId=null;
 async function show(id){
  const result=await reader.open(id);currentId=id;
  locator.textContent=result.passage.heading+" · "+result.passage.locator;
  text.textContent=result.passage.text;
  previous.disabled=!result.previous;next.disabled=!result.next;
  previous.dataset.target=result.previous??"";next.dataset.target=result.next??"";
  notice.textContent="Loaded chapters: "+reader.loadedChunks()+" / "+manifest.chunks.length;
 }
 previous.addEventListener("click",()=>{if(previous.dataset.target)void show(previous.dataset.target)});
 next.addEventListener("click",()=>{if(next.dataset.target)void show(next.dataset.target)});
 search.addEventListener("submit",event=>{
  event.preventDefault();found.replaceChildren();
  void reader.searchFullText(input.value,{limit:25}).then(rows=>{
   for(const passage of rows){
    const b=make("button","aoStResult",passage.heading+" · "+passage.text.slice(0,85));
    b.type="button";b.addEventListener("click",()=>void show(passage.id));found.append(b);
   }
   if(!rows.length)found.append(make("p",null,"No matching passage."));
   notice.textContent=rows.length+" matching passages · "+reader.loadedChunks()+" chunks loaded";
  }).catch(error=>{notice.textContent=String(error?.message??error)});
 });
 await show(reader.firstId);
 return Object.freeze({reader,show});
}
