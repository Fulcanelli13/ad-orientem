/**
 * Ad Orientem Prayer Wave 1 — ONLY explicit opt-in photo-acceptance previews.
 * This does not alter approved Prayer texts, Rosary beads, Angelus cinematic,
 * seasonal Regina Cæli, user preferences or production artwork assignments.
 * No crop is applied by CSS. Artwork stays wholly visible with object-fit:contain.
 */
const ROOT="assets/pray/hero-proof/";
const ARTS={
 angelus:Object.freeze({
   small:ROOT+"angelus-v3-paint-only-720.webp",
   large:ROOT+"angelus-v3-paint-only-1440.webp",
   masterSha256:"ae59a42e39896646d3d18d4761e04b8ce6fa1d84bfaa9f79bd23f8d72aa95be6",
   smallSha256:"b6564bf79fa27d8c0bca634ac40dd94dbcd372d081465385939ee52f2eb2c1bd",
   largeSha256:"01f24b6654a7e7ebe737391da2eabba964a9a0a007ac2df14ca7da0bf8cf9e63",
   url:"https://www.metmuseum.org/art/collection/search/438724",
   altEn:"Philippe de Champaigne: the Annunciation, with Mary, Gabriel, the dove, and white lilies",
   altFr:"L'Annonciation de Philippe de Champaigne, avec Marie, Gabriel, la colombe et les lys blancs",
   nameEn:"The Annunciation",nameFr:"L'Annonciation",artist:"Philippe de Champaigne",
   noteEn:"Metropolitan Museum of Art · cropped to the painted surface · preliminary",
   noteFr:"Metropolitan Museum of Art · cadrage sur la surface peinte · préliminaire",
   pixels:[3524,3459]
 }),
 rosary:Object.freeze({
   small:ROOT+"rosary-yorck-complete-720.webp",
   large:ROOT+"rosary-yorck-complete-1440.webp",
   masterSha256:"595c186cf5e71cfba242f2db6af53c75169e2498bf15c7f4f08966bfba0605ca",
   smallSha256:"6356b633f286357467f2e660afd5db2c1fcde72582037c0e751cb6c3648817c2",
   largeSha256:"2a57f7adca6db6f92ab6de841c735bfaa76fff385490b61282c02ba953dd12f2",
   url:"https://commons.wikimedia.org/wiki/File:Lorenzo_Lotto_057.jpg",
   altEn:"Lorenzo Lotto: Madonna of the Rosary with all fifteen circular mysteries, saints and angels",
   altFr:"La Vierge du Rosaire de Lorenzo Lotto, avec les quinze médaillons des mystères, saints et anges",
   nameEn:"Madonna del Rosario",nameFr:"La Vierge du Rosaire",artist:"Lorenzo Lotto",
   noteEn:"Wikimedia Commons / The Yorck Project · entire painting, no crop",
   noteFr:"Wikimedia Commons / The Yorck Project · peinture entière, sans recadrage",
   pixels:[1880,2886]
 })
};
export const WAVE1_REVIEW_PHOTOS=Object.freeze(ARTS);
export function wave1ArtworkFlag(search,which){
  try{return new URLSearchParams(String(search||"").replace(/^\?/,"")).get("aoPrayerArt")===which+"-review"}
  catch{return false}
}
function escapeHTML(x){
 return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function artMarkup(which,{french=false}={}){
 const a=ARTS[which],name=french?a.nameFr:a.nameEn;
 const label=french?"Voir le tableau":"View artwork";
 const warning=french?"Aperçu de recherche · non publié":"Research preview · not published";
 return '<details class="aoWave1PhotoProof" data-ao-wave1-photo="'+which+'" data-ao-research-only="true">'+
   '<summary><img src="'+a.small+'" alt="" aria-hidden="true" width="44" height="55" loading="lazy">'+
   '<span>'+label+'<small>'+escapeHTML(a.artist)+' · '+escapeHTML(name)+'</small></span></summary>'+
   '<figure><picture><source type="image/webp" srcset="'+a.small+' 720w, '+a.large+' 1440w" sizes="(max-width:600px) 90vw, 500px">'+
   '<img src="'+a.small+'" alt="'+escapeHTML(french?a.altFr:a.altEn)+'" width="'+a.pixels[0]+'" height="'+a.pixels[1]+'" loading="lazy" decoding="async"></picture>'+
   '<figcaption><span>'+escapeHTML(a.artist)+' · <em>'+escapeHTML(name)+'</em></span>'+
   '<a href="'+a.url+'" rel="noopener noreferrer" target="_blank">'+escapeHTML(french?a.noteFr:a.noteEn)+'</a>'+
   '<small>'+warning+'</small></figcaption></figure></details>';
}
export function angelusWave1PhotoMarkup({search="",form="angelus",step=0,french=false}={}){
 // Regina Cæli has its own Eastertide subject and must not show Annunciation art.
 if(form!=="angelus"||step!==0||!wave1ArtworkFlag(search,"angelus"))return "";
 return artMarkup("angelus",{french});
}
/** Opt-in artwork follows the EXISTING canonical Rosary preparation, never precedes the start CTA. */
export function syncRosaryWave1Photo(root,{search="",french=false}={}){
 const shell=root?.querySelector?.(".pbShell");
 if(!shell)return false;
 const hero=shell.querySelector(":scope > .lab-rosary-hero");
 let proof=shell.querySelector(":scope > [data-ao-wave1-photo=rosary]");
 if(!hero||!wave1ArtworkFlag(search,"rosary")){
  proof?.remove();return false;
 }
 const after=shell.querySelector(":scope > .aoRosaryOtherMysteries")||
    shell.querySelector(":scope > .aoRosaryPreparation")||hero;
 if(!proof){
  const holder=shell.ownerDocument.createElement("div");
  holder.innerHTML=artMarkup("rosary",{french});
  proof=holder.firstElementChild;
  shell.insertBefore(proof,after.nextSibling);
 }else{
  const targetLanguage=french?"fr":"en";
  if(proof.dataset.aoLang!==targetLanguage){
    const wasOpen=proof.open;
    proof.outerHTML=artMarkup("rosary",{french});
    proof=shell.querySelector(":scope > [data-ao-wave1-photo=rosary]");
    proof.open=wasOpen;
  }
  if(proof.previousElementSibling!==after)after.insertAdjacentElement("afterend",proof);
 }
 proof.dataset.aoLang=french?"fr":"en";
 return true;
}
const CSS=[
 '#aoPray435930 .aoWave1PhotoProof,#aoPrayerBookRoot .aoWave1PhotoProof{box-sizing:border-box;display:block;width:min(100%,560px);max-width:100%;margin:6px auto 11px;overflow:hidden;background:rgba(11,18,28,.62);border:1px solid rgba(217,197,154,.19);border-radius:10px;color:#e9e4da}',
 '#aoPray435930 .aoWave1PhotoProof summary,#aoPrayerBookRoot .aoWave1PhotoProof summary{display:flex;align-items:center;gap:9px;box-sizing:border-box;min-height:52px;cursor:pointer;padding:5px 11px;list-style:none;font:500 .78rem/1.4 system-ui,sans-serif}',
 '#aoPray435930 .aoWave1PhotoProof summary::-webkit-details-marker,#aoPrayerBookRoot .aoWave1PhotoProof summary::-webkit-details-marker{display:none}',
 '#aoPray435930 .aoWave1PhotoProof summary img,#aoPrayerBookRoot .aoWave1PhotoProof summary img{display:block;flex:none;width:36px;height:46px;object-fit:contain;background:#12121c;border-radius:3px}',
 '#aoPray435930 .aoWave1PhotoProof summary small,#aoPrayerBookRoot .aoWave1PhotoProof summary small{display:block;font-size:.68rem;font-weight:400;line-height:1.4;color:#b8b3aa}',
 '#aoPray435930 .aoWave1PhotoProof summary:focus-visible,#aoPrayerBookRoot .aoWave1PhotoProof summary:focus-visible{outline:2px solid #dec791;outline-offset:-3px}',
 '#aoPray435930 .aoWave1PhotoProof figure,#aoPrayerBookRoot .aoWave1PhotoProof figure{display:flex;flex-direction:column;align-items:center;gap:8px;box-sizing:border-box;margin:0;padding:7px 10px 11px}',
 '#aoPray435930 .aoWave1PhotoProof figure picture,#aoPrayerBookRoot .aoWave1PhotoProof figure picture{display:block;max-width:100%;line-height:0}',
 '#aoPray435930 .aoWave1PhotoProof figure img,#aoPrayerBookRoot .aoWave1PhotoProof figure img{display:block;max-width:100%;width:auto;height:auto;max-height:min(48dvh,470px);object-fit:contain;object-position:center;background:#12121c}',
 '#aoPray435930 .aoWave1PhotoProof figcaption,#aoPrayerBookRoot .aoWave1PhotoProof figcaption{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:9px;row-gap:3px;font:400 .7rem/1.45 system-ui,sans-serif;color:#b8b3aa}',
 '#aoPray435930 .aoWave1PhotoProof figcaption a,#aoPrayerBookRoot .aoWave1PhotoProof figcaption a{color:#dec791;overflow-wrap:anywhere}',
 '@media(max-width:420px){#aoPray435930 .aoWave1PhotoProof,#aoPrayerBookRoot .aoWave1PhotoProof{margin:3px auto 8px}#aoPray435930 .aoWave1PhotoProof summary,#aoPrayerBookRoot .aoWave1PhotoProof summary{min-height:47px;padding:4px 8px;gap:8px}}',
 '@media(prefers-reduced-motion:reduce){#aoPray435930 .aoWave1PhotoProof *,#aoPrayerBookRoot .aoWave1PhotoProof *{animation:none!important;transition:none!important}}'
].join("\n");
export function installWave1PhotoProofStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-wave1-angelus-rosary-photo-styles"))return true;
 const style=doc.createElement("style");
 style.id="ao-wave1-angelus-rosary-photo-styles";
 style.textContent=CSS;doc.head.append(style);return true;
}
if(typeof document!=="undefined")installWave1PhotoProofStyles(document);
