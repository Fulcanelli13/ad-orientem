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
    CONFESSION_HERO_PROOF_ASSETS.large+' 1600w" sizes="(max-width:650px) 95vw, 900px">'+
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
'#aoPray435930 .aoP435930ConfHeroProof{box-sizing:border-box;max-width:900px;width:min(100%,900px);margin:14px auto 16px;padding:0;overflow:hidden;border-radius:13px;background:rgba(0,0,0,.14);border:1px solid rgba(230,203,164,.17)}',
'#aoPray435930 .aoP435930ConfHeroProof picture{display:block;width:100%;line-height:0}',
'#aoPray435930 .aoP435930ConfHeroProof img{display:block;width:100%;max-width:100%;height:auto;object-fit:contain;object-position:center center;aspect-ratio:4096 / 3712;background:#161612}',
'#aoPray435930 .aoP435930ConfHeroProof figcaption{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:10px;row-gap:4px;padding:11px 14px;color:var(--text,#eee9df);font:400 .78rem/1.5 var(--ao-font-ui,system-ui,sans-serif)}',
'#aoPray435930 .aoP435930ConfHeroProof figcaption a{color:var(--liturgical,#dec791)}',
'#aoPray435930 .aoP435930ConfHeroProof figcaption small{font-size:.70rem;color:var(--muted,#aeb2b8)}',
'@media(max-width:420px){#aoPray435930 .aoP435930ConfHeroProof{margin:8px auto 10px;border-radius:10px}#aoPray435930 .aoP435930ConfHeroProof figcaption{padding:8px 10px;font-size:.72rem}}',
'@media(prefers-reduced-motion:reduce){#aoPray435930 .aoP435930ConfHeroProof *{animation:none!important;transition:none!important}}'
].join('\n');
export function installConfessionHeroProofStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-confession-wave1-hero-proof-styles"))return true;
 const el=doc.createElement("style");el.id="ao-confession-wave1-hero-proof-styles";
 el.textContent=CSS;doc.head.appendChild(el);return true;
}
if(typeof document!=="undefined")installConfessionHeroProofStyles(document);
