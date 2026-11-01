const CSS=`
#aoPray435930 .aoPrayerSelectedCoverQA{max-width:min(100%,370px);width:100%;margin:0 auto 16px;text-align:center}
#aoPray435930 .aoPrayerSelectedCoverQA img{display:block;width:100%;height:auto;max-height:35svh;object-fit:contain;object-position:center;margin:0 auto}
#aoPray435930 .aoPrayerSelectedCoverQA figcaption{font-size:.69rem;line-height:1.4;margin:6px auto 0;opacity:.72}
@media(max-width:359px){#aoPray435930 .aoPrayerSelectedCoverQA img{max-height:30svh}}
`;
if(typeof document!=="undefined"&&!document.getElementById("ao-prayer-selected-cover-qa-styles")){
 const s=document.createElement("style");s.id="ao-prayer-selected-cover-qa-styles";s.textContent=CSS;document.head.appendChild(s)
}
