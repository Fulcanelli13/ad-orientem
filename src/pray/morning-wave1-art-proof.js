/**
 * Source-faithful Breton Morning Prayer artwork proof.
 * Optional, intro-step-only, never a replacement for the full-screen changing
 * sunrise, canonical prayers, one-click alternatives or session timer.
 * No live artwork activation: ?aoPrayerArt=morning-review explicitly required.
 */
export const MORNING_WAVE1_ARTWORK_FLAG="aoPrayerArt=morning-review";
export const MORNING_WAVE1_MASTER_SHA256=
 "381db59fa47aee7603c4b9eb12f8dff8de4841eb0a4fd50c6d229e0fbd3cb63c";
export const MORNING_WAVE1_MUSEUM_URL=
 "https://www.artic.edu/artworks/94841/the-song-of-the-lark";
const ROOT="assets/pray/hero-proof/";
export const MORNING_WAVE1_PROOF={
 thumbnail:ROOT+"morning-whole-720-proof.webp",
 enlarged:ROOT+"morning-whole-1440-proof.webp"
};
export function morningWave1ArtEnabled({search="",daypart="morning",mode="guided",step=0}={}){
 try{
   return new URLSearchParams(String(search).replace(/^\?/,"")).get("aoPrayerArt")==="morning-review" &&
    daypart==="morning" && mode==="guided" && step===0;
 }catch{return false}
}
export function morningWave1ArtMarkup({search="",daypart="morning",mode="guided",step=0,french=false}={}){
 if(!morningWave1ArtEnabled({search,daypart,mode,step}))return "";
 const title=french?"Le Chant de l'alouette":"The Song of the Lark";
 const action=french?"Voir le tableau du matin":"View morning artwork";
 const notice=french?"Aperçu de recherche · non publié":"Research preview · not published";
 return '<details class="aoTP381MorningArtProof" data-ao-morning-art-proof>'+
  '<summary><img src="'+MORNING_WAVE1_PROOF.thumbnail+
  '" width="55" height="71" alt="" aria-hidden="true" loading="lazy">'+
  '<span>'+action+'<small>Jules Breton · '+title+'</small></span></summary>'+
  '<figure><picture><source type="image/webp" srcset="'+MORNING_WAVE1_PROOF.thumbnail+
    ' 720w, '+MORNING_WAVE1_PROOF.enlarged+' 1440w" sizes="(max-width:700px) 90vw, 500px">'+
  '<img src="'+MORNING_WAVE1_PROOF.thumbnail+
    '" alt="'+(french?"Une paysanne, la faucille à la main, se tient sous le lever du soleil et l'alouette":
    "A fieldworker with a sickle stands beneath the rising sun and a small lark")+
    '" width="2548" height="3300" loading="lazy" decoding="async"></picture>'+
  '<figcaption>Jules Breton · <em>'+title+'</em> · <a target="_blank" rel="noopener noreferrer" href="'+
    MORNING_WAVE1_MUSEUM_URL+'">'+(french?"Art Institute of Chicago · source":"Art Institute of Chicago · source")+
  '</a><small>'+notice+'</small></figcaption></figure></details>';
}
const CSS=[
 '#aoPray435930 .aoTP381MorningArtProof{box-sizing:border-box;width:min(100%,590px);margin:0 auto 5px;padding:0;background:rgba(9,18,28,.32);border:1px solid rgba(230,211,188,.13);border-radius:10px;color:var(--text,#eee9df)}',
 '#aoPray435930 .aoTP381MorningArtProof summary{display:flex;align-items:center;gap:10px;min-height:52px;padding:5px 11px;cursor:pointer;list-style:none;font:500 .78rem/1.35 var(--ao-font-ui,system-ui,sans-serif)}',
 '#aoPray435930 .aoTP381MorningArtProof summary::-webkit-details-marker{display:none}',
 '#aoPray435930 .aoTP381MorningArtProof summary img{display:block;flex:none;width:37px;height:49px;object-fit:contain;object-position:center;background:#111a23;border-radius:3px}',
 '#aoPray435930 .aoTP381MorningArtProof summary span{min-width:0}',
 '#aoPray435930 .aoTP381MorningArtProof summary small{display:block;color:var(--muted,#b7b4b1);font-size:.66rem;font-weight:400;line-height:1.45}',
 '#aoPray435930 .aoTP381MorningArtProof summary:focus-visible,#aoPray435930 .aoTP381MorningArtProof a:focus-visible{outline:2px solid #d7b988;outline-offset:2px}',
 '#aoPray435930 .aoTP381MorningArtProof>figure{display:flex;flex-direction:column;align-items:center;margin:0;padding:8px 10px 11px;gap:7px}',
 '#aoPray435930 .aoTP381MorningArtProof picture{display:block;max-width:100%;line-height:0}',
 '#aoPray435930 .aoTP381MorningArtProof figure img{display:block;width:auto;max-width:100%;height:auto;max-height:min(48dvh,460px);object-fit:contain;background:#111a23}',
 '#aoPray435930 .aoTP381MorningArtProof figcaption{display:flex;flex-wrap:wrap;column-gap:8px;row-gap:3px;color:var(--muted,#b7b4b1);font:400 .71rem/1.45 var(--ao-font-ui,system-ui,sans-serif)}',
 '#aoPray435930 .aoTP381MorningArtProof figcaption a{color:var(--liturgical,#dec791)}',
 '@media(max-width:420px){#aoPray435930 .aoTP381MorningArtProof{margin-bottom:3px}#aoPray435930 .aoTP381MorningArtProof summary{min-height:46px;padding:4px 8px;gap:8px}#aoPray435930 .aoTP381MorningArtProof summary img{width:32px;height:42px}}'
].join("\n");
export function installMorningWave1ProofStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-morning-wave1-art-proof-css"))return true;
 const style=doc.createElement("style");style.id="ao-morning-wave1-art-proof-css";
 style.textContent=CSS;doc.head.appendChild(style);return true;
}
if(typeof document!=="undefined")installMorningWave1ProofStyles(document);
