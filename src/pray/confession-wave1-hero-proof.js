/**
 * Opt-in visual acceptance proof of the already approved Murillo Confession hero.
 * Explicitly not a production art release. No changes to the sacramental reader,
 * prayer source, stage transitions, privacy, locale or stage/card ownership.
 * Open only with ?aoPrayerArt=confession-review and only on stage 0.
 */
export const CONFESSION_WAVE1_HERO_QUERY="aoPrayerArt=confession-review";
export const CONFESSION_WAVE1_HERO_SOURCE_SHA256=
  "b1e3d47e65f4367fd11fc23d9a63fb25ff3d8c934c3147606f1a3eba703beaa7";
export const CONFESSION_WAVE1_HERO_MUSEUM=
  "https://www.nga.gov/artworks/34956-return-prodigal-son";
const BASE="assets/pray/hero-proof/";
export const CONFESSION_HERO_PROOF_ASSETS=Object.freeze({
  small:BASE+"confession-whole-800-preview.webp",
  large:BASE+"confession-whole-1600-preview.webp"
});
export function confessionHeroProofEnabled(search,stage){
  if(stage!==0)return false;
  try{
    return new URLSearchParams(String(search||"").replace(/^\?/,""))
      .get("aoPrayerArt")==="confession-review";
  }catch{return false;}
}
export function confessionHeroProofMarkup({search="",stage=0,french=false}={}){
 if(!confessionHeroProofEnabled(search,stage))return "";
 const title=french?"Le retour du fils prodigue":"The Return of the Prodigal Son";
 const notice=french?"Aperçu photographique de recherche · non publié":
   "Photographic research preview · not published";
 return '<figure class="aoP435930ConfHeroProof" data-ao-confession-hero-preview="true" '+
  'data-ao-preview-licence="NGA-PUBLIC-DOMAIN">'+
  '<picture>'+
  '<source type="image/webp" srcset="'+CONFESSION_HERO_PROOF_ASSETS.small+' 800w, '+
    CONFESSION_HERO_PROOF_ASSETS.large+' 1600w" sizes="(max-width:420px) 36vw, (max-width:900px) 32vw, 255px">'+
  '<img src="'+CONFESSION_HERO_PROOF_ASSETS.small+'" alt="'+
    (french?'Murillo : le père accueille son fils repentant, avec un petit chien blanc':
    'Murillo: a father embraces his repentant son, with a small white dog')+
    '" width="4096" height="3712" loading="eager" decoding="async"></picture>'+
  '<figcaption><span>Bartolomé Esteban Murillo · <em>'+title+'</em></span>'+
  '<a href="'+CONFESSION_WAVE1_HERO_MUSEUM+'" target="_blank" rel="noopener noreferrer">'+
    (french?"National Gallery of Art · source":"National Gallery of Art · source")+'</a>'+
  '<small>'+notice+'</small></figcaption></figure>';
}
const CSS=[
'#aoPray435930 .aoP435930ConfHeroProof{box-sizing:border-box;display:grid;grid-template-columns:clamp(160px,32%,255px) minmax(0,1fr);align-items:center;max-width:740px;width:min(100%,740px);margin:10px auto 12px;padding:0;overflow:hidden;border-radius:13px;background:rgba(12,12,15,.68);border:1px solid rgba(230,203,164,.17)}',
'#aoPray435930 .aoP435930ConfHeroProof picture{display:block;min-width:0;align-self:stretch;line-height:0}',
'#aoPray435930 .aoP435930ConfHeroProof img{display:block;width:100%;max-width:100%;height:100%;aspect-ratio:4096/3712;object-fit:contain;object-position:center center;background:#161612}',
'#aoPray435930 .aoP435930ConfHeroProof figcaption{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;min-width:0;gap:7px;padding:14px 18px;color:var(--text,#eee9df);font:400 .85rem/1.45 var(--ao-font-ui,system-ui,sans-serif)}',
'#aoPray435930 .aoP435930ConfHeroProof figcaption span{font:400 .87rem/1.45 var(--ao-font-liturgical,Georgia,serif)}',
'#aoPray435930 .aoP435930ConfHeroProof figcaption em{font-style:italic}',
'#aoPray435930 .aoP435930ConfHeroProof figcaption a{color:var(--liturgical,#dec791);overflow-wrap:anywhere}',
'#aoPray435930 .aoP435930ConfHeroProof figcaption small{font-size:.70rem;line-height:1.4;color:var(--muted,#aeb2b8)}',
'@media(max-width:420px){#aoPray435930 .aoP435930ConfHeroProof{grid-template-columns:minmax(126px,36%) minmax(0,1fr);margin:7px auto 10px;border-radius:10px}#aoPray435930 .aoP435930ConfHeroProof figcaption{padding:9px 10px;gap:4px;font-size:.71rem;line-height:1.35}#aoPray435930 .aoP435930ConfHeroProof figcaption span{font-size:.75rem;line-height:1.35}#aoPray435930 .aoP435930ConfHeroProof figcaption small{font-size:.67rem;line-height:1.3}}',
'@media(prefers-reduced-motion:reduce){#aoPray435930 .aoP435930ConfHeroProof *{animation:none!important;transition:none!important}}'
].join('\n');
export function installConfessionHeroProofStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-confession-wave1-hero-proof-styles"))return true;
 const el=doc.createElement("style");el.id="ao-confession-wave1-hero-proof-styles";
 el.textContent=CSS;doc.head.appendChild(el);return true;
}
if(typeof document!=="undefined")installConfessionHeroProofStyles(document);
