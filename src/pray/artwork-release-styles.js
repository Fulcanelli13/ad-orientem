/** Release-only Prayer artwork presentation. Does not change locked donor UI without a certified image. */
const ART_CSS=`
#aoPray435930 .aoPrayReleasedArt{margin:0;padding:0 14px 13px;display:block;contain:layout}
#aoPray435930 .aoPrayReleasedArtFrame{position:relative;overflow:hidden;isolation:isolate;height:clamp(136px,24svh,250px);border-radius:15px;background:#1c1b18}
#aoPray435930 .aoPrayReleasedArtImage{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 48%;transform:scale(1.065);transform-origin:center;display:block}
#aoPray435930 .aoPrayReleasedArtFrame:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,0) 65%,rgba(0,0,0,.24))}
#aoPray435930 .aoPrayReleasedArtDetails{position:absolute;right:10px;bottom:10px;z-index:2;max-width:min(84%,420px);color:#fff}
#aoPray435930 .aoPrayReleasedArtDetails summary{cursor:pointer;display:grid;place-items:center;min-width:44px;min-height:44px;float:right;border-radius:50%;background:rgba(9,10,12,.67);border:1px solid rgba(255,255,255,.55);font:600 20px/1 Georgia,serif;list-style:none;box-shadow:0 2px 12px rgba(0,0,0,.24)}
#aoPray435930 .aoPrayReleasedArtDetails summary::-webkit-details-marker{display:none}
#aoPray435930 .aoPrayReleasedArtDetails summary:focus-visible{outline:2px solid white;outline-offset:3px}
#aoPray435930 .aoPrayReleasedArtDetails[open]{left:10px;max-width:none}
#aoPray435930 .aoPrayReleasedArtDetails figcaption{clear:both;margin-top:48px;padding:13px 15px;background:rgba(9,10,12,.91);border-radius:10px;display:grid;gap:5px;text-align:left;font:400 12px/1.45 system-ui,sans-serif}
#aoPray435930 .aoPrayReleasedArtDetails figcaption strong{font:600 14px/1.35 Georgia,serif}
#aoPray435930 .aoPrayReleasedArtDetails figcaption span{color:#e2d6c6}
#aoPray435930 .aoPrayReleasedArtDetails figcaption a{color:#f4dbad;text-decoration:underline}
@media(max-width:480px){#aoPray435930 .aoPrayReleasedArt{padding:0 10px 10px}#aoPray435930 .aoPrayReleasedArtFrame{height:clamp(132px,22svh,185px);border-radius:12px}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoPrayReleasedArtImage{transition:none;animation:none}}
`;
export function installPrayerArtworkReleaseStyles(doc=globalThis.document){
  if(!doc?.head || doc.getElementById("ao-pray-released-art-css"))return false;
  const sheet=doc.createElement("style");sheet.id="ao-pray-released-art-css";sheet.textContent=ART_CSS;doc.head.appendChild(sheet);return true;
}
if(typeof document!=="undefined")installPrayerArtworkReleaseStyles(document);
