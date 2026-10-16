/*
 * Latin lessons have frozen source attributions, but most do not carry
 * verified online passages. Keep the distinction visible to readers.
 * Do not infer URLs from work titles or promote a digitized witness to
 * certification of a printed edition or a precise page.
 */
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const fr=lang=>lang==="fr";
export function latinCourseSourceLink(source){
  const direct=source?.sourceUrl||source?.canonical_url||source?.url||"";
  if(direct){
    try{
      const u=new URL(String(direct));
      if(u.protocol==="https:"&&!u.username&&!u.password)return Object.freeze({url:u.href,kind:"source-page"});
    }catch{}
    return null; // A bad recorded link must never silently become a different link.
  }
  const repo=String(source?.sourceRepository||"");
  const sha=String(source?.sourceCommit||"");
  const path=String(source?.sourcePath||"");
  if(repo!=="DivinumOfficium/divinum-officium"||!/^[a-f0-9]{40}$/.test(sha)||
    !path||path.startsWith("/")||path.includes("\\")||path.split("/").some(segment=>!segment||segment==="."||segment===".."||/[^A-Za-z0-9_.-]/.test(segment)))return null;
  return Object.freeze({url:"https://github.com/"+repo+"/blob/"+sha+"/"+path,kind:"pinned-witness"});
}
export function latinCourseSourceCss(){
  return [
    ".aoLatinWitnessDisclosure>summary{display:flex;align-items:center;min-height:44px;cursor:pointer}",
    ".aoLatinWitnessDisclosure summary:focus-visible,.aoLatinWitnessDisclosure a:focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}",
    ".aoLatinWitnessList{padding:0;margin:7px 0 10px;list-style:none}",
    ".aoLatinWitnessList li{margin:9px 0;overflow-wrap:anywhere;font:400 max(13px,.8125rem)/1.5 var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoLatinWitnessList strong{display:block;color:var(--ao-text-primary,#e9e4d9);font-weight:550}",
    ".aoLatinWitnessSection{display:block;color:var(--ao-text-muted,#a9b0b8)}",
    ".aoLatinWitnessLink{display:inline-block;margin-top:3px;color:var(--liturgical,#c9ad78);text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}",
    ".aoLatinWitnessHold,.aoLatinWitnessNote{color:var(--ao-text-muted,#a9b0b8);font:400 max(12px,.75rem)/1.45 var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoLatinWitnessNote{margin:8px 0 12px}"
  ].join("");
}
export function latinCourseSourceHtml(lesson,referenceIds,lang="en",{className="aoL2Sources"}={}){
  if(!Array.isArray(referenceIds)||!referenceIds.length)return "";
  const ids=[...new Set(referenceIds.filter(Boolean))];
  const sources=new Map((lesson?.sources||[]).map(s=>[s.id,s]));
  const list=ids.map(id=>{
    const source=sources.get(id);
    const name=esc(source?.work||id),section=source?.section?'<span class="aoLatinWitnessSection">'+esc(source.section)+'</span>':"";
    const target=latinCourseSourceLink(source);
    const link=target?'<a class="aoLatinWitnessLink" data-ao-latin-link-kind="'+target.kind+
      '" href="'+esc(target.url)+'" target="_blank" rel="noopener noreferrer">'+
      esc(fr(lang)?(target.kind==="pinned-witness"?"Témoin textuel archivé":"Page source"):(target.kind==="pinned-witness"?"Pinned text witness":"Source page"))+' ↗</a>'
      :'<span class="aoLatinWitnessHold">'+esc(fr(lang)?"Référence bibliographique seulement · aucun lien direct vérifié":"Bibliographic reference only · no verified direct link")+'</span>';
    return '<li data-ao-latin-source-id="'+esc(id)+'"><strong>'+name+'</strong>'+section+link+'</li>';
  }).join("");
  return '<details class="'+esc(className)+' aoLatinWitnessDisclosure"><summary>'+
    esc(fr(lang)?"Sources":"Sources")+' · '+ids.length+'</summary>'+
    '<ul class="aoLatinWitnessList">'+list+'</ul>'+
    '<p class="aoLatinWitnessNote">'+esc(fr(lang)
      ?"Les liens sont des témoins documentaires ; ils ne certifient pas, à eux seuls, le passage exact ou l’édition imprimée."
      :"Links identify documentary witnesses; they do not independently certify the exact passage or printed edition.")+
    '</p></details>';
}
