/*
 * Stations photo media sits in the existing one-card prayer scroll, below the
 * heading and before the first active ritual paragraph. No picture frames,
 * no replacement of rubrics, no interruption of V/R or recitation focus.
 */
const CSS=String.raw`
#aoPray435930 .aoP435930StationArtwork{width:100%;margin:0 auto 16px;padding:0;text-align:center;min-width:0}
#aoPray435930 .aoP435930StationArtwork img{display:block;max-width:100%;width:auto;height:auto;max-height:min(38vh,410px);object-fit:contain;margin:0 auto}
#aoPray435930 .aoP435930StationArtwork figcaption{margin:8px auto 0;max-width:62ch;color:var(--muted,#aeb2b8);font:400 .66rem/1.55 var(--ao-font-ui,system-ui,sans-serif);overflow-wrap:anywhere}
#aoPray435930 .aoP435930StationArtwork figcaption a{color:inherit;text-decoration:underline;text-underline-offset:2px}
#aoPray435930 .aoP435930StationArtwork figcaption a:focus-visible{outline:2px solid var(--liturgical,#c7ae6d);outline-offset:3px}
@media(max-width:600px){#aoPray435930 .aoP435930StationArtwork img{max-height:min(32svh,300px)}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoP435930StationArtwork img{animation:none;transition:none}}
`;
export function installStationsArtworkStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-pray-stations-artwork-styles"))return true;
 const el=doc.createElement("style");
 el.id="ao-pray-stations-artwork-styles";
 el.textContent=CSS;
 doc.head.appendChild(el);
 return true;
}
if(typeof document!=="undefined")installStationsArtworkStyles(document);
