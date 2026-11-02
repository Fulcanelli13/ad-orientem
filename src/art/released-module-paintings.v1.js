/**
 * Only exact Met photographs released through PR #2277.
 * This asset list is distinct from approved editorial paintings and research archives.
 */
export const RELEASED_MODULE_PAINTINGS=Object.freeze({
  angelus:Object.freeze({
    title:"The Annunciation",
    artist:"Philippe de Champaigne",
    source:"https://www.metmuseum.org/art/collection/search/438724",
    original:"assets/home/c3-approved-met/angelus-met-438724.jpg",
    image:"assets/home/c3-approved-met/angelus-frameless.webp",
    photographRights:"Met Open Access · public domain (CC0)",
    releasePr:2277
  }),
  adoration:Object.freeze({
    title:"The Virgin Adoring the Host",
    artist:"Jean Auguste Dominique Ingres",
    source:"https://www.metmuseum.org/art/collection/search/438434",
    original:"assets/home/c3-approved-met/adoration-met-438434.jpg",
    image:"assets/home/c3-approved-met/adoration-frameless.webp",
    photographRights:"Met Open Access · public domain (CC0)",
    releasePr:2277
  })
});
export function releasedModulePhoto(id){
  return Object.hasOwn(RELEASED_MODULE_PAINTINGS,String(id??""))?RELEASED_MODULE_PAINTINGS[id]:null;
}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function releasedModulePhotoMarkup(id,{className=""}={}){
  const a=releasedModulePhoto(id);
  if(!a)return "";
  const cls=String(className).replace(/[^a-zA-Z0-9 _-]/g,"");
  return '<figure class="aoReleasedModulePhoto '+esc(cls)+'" data-ao-released-module-photo="'+esc(id)+'" data-ao-photo-release-pr="'+a.releasePr+'">'+
    '<img src="/'+esc(a.image)+'" alt="'+esc(a.title+" — "+a.artist)+'" loading="lazy" decoding="async">'+
    '<figcaption>'+esc(a.artist)+
    ' · <a href="'+esc(a.source)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc("Artwork source: "+a.title)+'">'+esc(a.title)+'</a></figcaption>'+
    '</figure>';
}
