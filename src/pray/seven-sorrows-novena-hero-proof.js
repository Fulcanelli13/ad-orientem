/**
 * Seven Sorrows Wave 1 art—research-only disclosure in EXISTING nine-day Novena.
 * Displayed only at the canonically owned introduction with the explicit
 * ?aoPrayerArt=sorrows-review opt-in. No new devotions or reader invented.
 */
export const SEVEN_SORROWS_LOCKED_MASTER_SHA256=
 "c9c338596bc2a1f069535facfab1fe11cee1aaad7d67e5440c2114cfe9f09f2a";
export const SEVEN_SORROWS_PHOTO_PROOFS=Object.freeze({
 small:"assets/pray/hero-proof/seven-sorrows-whole-720-proof.webp",
 large:"assets/pray/hero-proof/seven-sorrows-whole-1440-proof.webp",
 smallSha256:"4530434dd0cb16d9df395a5261f36c27362f1766891d3d4b33de5135f155ddac",
 largeSha256:"82b5085c66d98dffe988ce69af17bc6a7515d5e529800e1e27e9997ac79a9e85",
 source:"https://commons.wikimedia.org/wiki/File:Master_of_the_Half_Lengths_-_Virgin_of_the_Seven_Sorrows_-_Google_Art_Project.jpg"
});
export function sevenSorrowsArtEnabled({search="",novenaId="",screen=""}={}){
 try{
  return novenaId==="seven_sorrows"&&screen==="detail"&&
    new URLSearchParams(String(search).replace(/^\?/,"")).get("aoPrayerArt")==="sorrows-review";
 }catch{return false}
}
export function sevenSorrowsArtMarkup({search="",novenaId="",screen="",french=false}={}){
 if(!sevenSorrowsArtEnabled({search,novenaId,screen}))return "";
 const a=SEVEN_SORROWS_PHOTO_PROOFS;
 const name=french?"La Vierge des Sept Douleurs":"Virgin of the Seven Sorrows";
 const artist=french?"Maître des demi-figures féminines (attribué)":"Master of the Female Half-Lengths (attributed)";
 return '<details class="aoSevenSorrowsArtProof" data-ao-seven-sorrows-art-proof>'+
   '<summary><img src="'+a.small+'" alt="" aria-hidden="true" loading="lazy" width="38" height="51">'+
   '<span>'+(french?"Voir le tableau":"View artwork")+'<small>'+artist+' · '+name+'</small></span></summary>'+
   '<figure><picture><source type="image/webp" srcset="'+a.small+' 720w, '+a.large+' 1440w" sizes="(max-width:600px) 92vw, 520px">'+
   '<img src="'+a.small+'" width="2220" height="3000" loading="lazy" decoding="async" alt="'+
    (french?"La Vierge en deuil entourée de sept scènes circulaires et d’une épée":
      "The grieving Virgin surrounded by seven narrative roundels and one prominent sword")+
    '"></picture><figcaption><span>'+artist+' · <em>'+name+'</em></span>'+
    '<a target="_blank" rel="noopener noreferrer" href="'+a.source+'">'+
      (french?"Wikimedia Commons · reproduction PD-Art":"Wikimedia Commons · PD-Art reproduction")+
    '</a><small>'+(french?"Aperçu de recherche · non publié":"Research preview · not published")+
    '</small></figcaption></figure></details>';
}
const CSS=[
 '#aoPray435930 .aoSevenSorrowsArtProof{box-sizing:border-box;width:min(100%,560px);margin:9px auto 11px;background:rgba(11,18,28,.5);border:1px solid rgba(217,197,154,.18);border-radius:10px;color:#ede9e1;overflow:hidden}',
 '#aoPray435930 .aoSevenSorrowsArtProof summary{display:flex;align-items:center;min-height:52px;gap:9px;padding:5px 11px;cursor:pointer;list-style:none;font:500 .77rem/1.35 system-ui,sans-serif}',
 '#aoPray435930 .aoSevenSorrowsArtProof summary::-webkit-details-marker{display:none}',
 '#aoPray435930 .aoSevenSorrowsArtProof summary img{flex:none;width:36px;height:48px;object-fit:contain;background:#13141a;border-radius:3px}',
 '#aoPray435930 .aoSevenSorrowsArtProof summary span{min-width:0}',
 '#aoPray435930 .aoSevenSorrowsArtProof summary small{display:block;color:#b7b4b0;font-size:.67rem;font-weight:400;line-height:1.38}',
 '#aoPray435930 .aoSevenSorrowsArtProof summary:focus-visible{outline:2px solid #dec791;outline-offset:-3px}',
 '#aoPray435930 .aoSevenSorrowsArtProof figure{margin:0;padding:8px 10px 11px;display:flex;flex-direction:column;align-items:center;gap:8px}',
 '#aoPray435930 .aoSevenSorrowsArtProof figure picture{display:block;max-width:100%;line-height:0}',
 '#aoPray435930 .aoSevenSorrowsArtProof figure img{width:auto;height:auto;max-width:100%;max-height:min(49dvh,470px);object-fit:contain;object-position:center;display:block;background:#16141d}',
 '#aoPray435930 .aoSevenSorrowsArtProof figcaption{display:flex;flex-wrap:wrap;column-gap:8px;row-gap:3px;color:#beb6ac;font:400 .7rem/1.4 system-ui,sans-serif}',
 '#aoPray435930 .aoSevenSorrowsArtProof figcaption a{color:#dfc68a;overflow-wrap:anywhere}',
 '@media(max-width:420px){#aoPray435930 .aoSevenSorrowsArtProof{margin:5px auto 9px}#aoPray435930 .aoSevenSorrowsArtProof summary{padding:4px 8px;min-height:47px}}'
].join("\n");
export function installSevenSorrowsProofStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-wave1-seven-sorrows-art-styles"))return true;
 const style=doc.createElement("style");style.id="ao-wave1-seven-sorrows-art-styles";
 style.textContent=CSS;doc.head.append(style);return true;
}
if(typeof document!=="undefined")installSevenSorrowsProofStyles(document);
