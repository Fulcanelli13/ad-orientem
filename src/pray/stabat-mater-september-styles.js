/** Non-owning folio treatment for the Latin-only September Stabat Mater. */
export const STABAT_MATER_SEPTEMBER_CSS=String.raw`
#aoPray435930 :is([data-ao-stabat-full-september],[data-ao-stabat-library-full]){
 min-width:0;margin:18px 0 26px;padding:15px clamp(12px,3vw,22px) 19px;
 border:1px solid var(--liturgical-border,rgba(199,174,109,.24));border-radius:13px;
 background:var(--liturgical-soft,rgba(199,174,109,.055));color:var(--text,#eee9df);
}
#aoPray435930 :is([data-ao-stabat-full-september],[data-ao-stabat-library-full])>summary{
 cursor:pointer;list-style:none;padding:5px 20px 7px 0;position:relative;
 color:var(--text,#eee9df);font:600 clamp(.94rem,3.3vw,1.12rem)/1.4 var(--ao-font-display,var(--font-display,Georgia,serif));
 overflow-wrap:anywhere;
}
#aoPray435930 :is([data-ao-stabat-full-september],[data-ao-stabat-library-full])>summary::-webkit-details-marker{display:none}
#aoPray435930 :is([data-ao-stabat-full-september],[data-ao-stabat-library-full])>summary::after{
 content:\"+\";position:absolute;right:0;top:4px;color:var(--liturgical,#c7ae6d);font:500 1.15rem/1.1 system-ui,sans-serif;
}
#aoPray435930 :is([data-ao-stabat-full-september],[data-ao-stabat-library-full])[open]>summary::after{content:\"−\"}
#aoPray435930 :is([data-ao-stabat-full-september],[data-ao-stabat-library-full])>summary:focus-visible{
 outline:2px solid var(--liturgical,#c7ae6d);outline-offset:3px;border-radius:3px;
}
#aoPray435930 :is([data-ao-stabat-full-september],[data-ao-stabat-library-full]) .aoP435930SourceNote{
 margin:13px 0 11px;max-width:65ch;line-height:1.55;
}
#aoPray435930 :is([data-ao-stabat-full-september],[data-ao-stabat-library-full]) a{
 display:inline-block;overflow-wrap:anywhere;margin:4px 0 13px;
 color:var(--liturgical,#c7ae6d);font:500 .75rem/1.5 var(--ao-font-ui,system-ui,sans-serif);
 text-decoration:underline;text-underline-offset:3px;
}
#aoPray435930 .aoP435930StationFullStabat{min-width:0;max-width:100%;}
#aoPray435930 .aoP435930StationStabatCompleteVerse{
 position:relative;max-width:61ch;margin:0;padding:14px 0 14px clamp(24px,5.5vw,37px);
 border-top:1px solid var(--border,rgba(255,255,255,.1));
 color:var(--text,#eee9df);font:400 clamp(.98rem,3.65vw,1.17rem)/1.66 var(--ao-font-liturgical,var(--font-liturgical,Georgia,serif));
 overflow-wrap:break-word;hyphens:none;
}
#aoPray435930 .aoP435930StationStabatCompleteVerse>small{
 position:absolute;left:0;top:17px;width:25px;text-align:left;
 color:var(--liturgical,#c7ae6d);font:600 .64rem/1.4 var(--ao-font-ui,system-ui,sans-serif);
}
@media(max-width:360px){
 #aoPray435930 :is([data-ao-stabat-full-september],[data-ao-stabat-library-full]){padding:12px 10px 16px}
 #aoPray435930 .aoP435930StationStabatCompleteVerse{padding-left:29px;line-height:1.61}
}
`;
export function installStabatMaterSeptemberStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-pray-stabat-september-style"))return true;
 const node=doc.createElement("style");node.id="ao-pray-stabat-september-style";
 node.textContent=STABAT_MATER_SEPTEMBER_CSS;doc.head.appendChild(node);return true;
}
if(typeof document!=="undefined")installStabatMaterSeptemberStyles(document);
