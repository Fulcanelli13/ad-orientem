/**
 * User-approved source photographs with provenance: Met #2277, NGA #2293, Commons PD-Art #2296.
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
  }),
  confession:Object.freeze({
    title:"The Return of the Prodigal Son",
    artist:"Bartolomé Esteban Murillo",
    source:"https://www.nga.gov/artworks/34956-return-prodigal-son",
    original:"assets/prayer/released/confession-murillo-nga-original.jpg",
    image:"assets/prayer/released/confession-murillo-nga-original.jpg",
    photographRights:"National Gallery of Art Open Access · public domain (CC0)",
    releasePr:2293
  }),
  joseph:Object.freeze({
    title:"The Dream of Saint Joseph",
    artist:"Philippe de Champaigne",
    source:"https://commons.wikimedia.org/wiki/File:Philippe_de_Champaigne_(1602-1674)_-_The_Dream_of_Saint_Joseph_-_NG6276_-_National_Gallery.jpg",
    original:"assets/prayer/released/joseph-whole-original.jpg",
    image:"assets/prayer/released/joseph-whole-original.jpg",
    photographRights:"Wikimedia Commons PD-Art · faithful public-domain reproduction; local jurisdiction may vary",
    releasePr:2296
  }),
  regina:Object.freeze({
    title:"Resurrection of Christ (central panel)",
    artist:"Peter Paul Rubens",
    source:"https://commons.wikimedia.org/wiki/File:Peter_Paul_Rubens_-_Resurrection_of_Christ_triptych_(central_panel).jpg",
    original:"assets/prayer/released/regina-whole-original.jpg",
    image:"assets/prayer/released/regina-whole-original.jpg",
    photographRights:"Wikimedia Commons PD-Art · faithful public-domain reproduction; local jurisdiction may vary",
    releasePr:2296
  }),
  souls:Object.freeze({
    title:"Madonna and Child with Souls in Purgatory",
    artist:"Luca Giordano",
    source:"https://commons.wikimedia.org/wiki/File:Luca_Giordano_-_Madonna_and_Child_with_Souls_in_Purgatory_-_BF.2004.1_-_Museum_of_Fine_Arts.jpg",
    original:"assets/prayer/released/souls-whole-original.jpg",
    image:"assets/prayer/released/souls-whole-original.jpg",
    photographRights:"Wikimedia Commons PD-Art · faithful public-domain reproduction; local jurisdiction may vary",
    releasePr:2296
  }),
  visit:Object.freeze({
    title:"The Adoration of the Shepherds",
    artist:"Gerrit van Honthorst",
    source:"https://commons.wikimedia.org/wiki/File:Adoration_of_the_shepherds,_by_Gerard_van_Honthorst.jpg",
    original:"assets/prayer/released/visit-whole-original.jpg",
    image:"assets/prayer/released/visit-whole-original.jpg",
    photographRights:"Wikimedia Commons PD-Art · faithful public-domain reproduction; local jurisdiction may vary",
    releasePr:2296
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
