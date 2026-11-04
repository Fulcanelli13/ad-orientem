/**
 * Literal F01 Holy Card geometry from the uploaded Claude app-ui CSS:
 * 3-column fan, lace 10px dot repeat, 300px card, 500ms Y-flip, 58px initial.
 * The review harness is excluded. Ad Orientem source/artwork decisions win.
 */
export const CLAUDE_HOLY_CARD_CSS=String.raw`
#aoPray435930 .aoClaudeHolyCard{
 --hc-pg:var(--background,#0f0d0b);
 --hc-pg2:var(--surface-1,#18150f);
 --hc-ink:var(--text,#ede4d3);
 --hc-ink2:var(--muted,#bfb4a1);
 --hc-lc:var(--liturgical,#6fae7e);
 --hc-rub:var(--rubric-red,#d4705f);
 --hc-serif:var(--ao-font-liturgical,"Sorts Mill Goudy",Georgia,serif);
 --hc-sc:var(--ao-font-display,"IM Fell English SC",Georgia,serif);
 --hc-init:var(--ao-font-initial,"IM Fell French Canon",Georgia,serif);
 border:0;box-shadow:none;background:transparent;
 width:100%;max-width:none;min-width:0;margin:0;padding:0;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyDeck{
 display:flex;flex-direction:column;align-items:center;justify-content:center;
 min-width:0;padding:12px 0 8px;perspective:1200px;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyLace{
 width:calc(100% - 70px);max-width:300px;
 height:min(520px,calc(100dvh - 168px));
 min-height:min(350px,calc(100dvh - 150px));
 padding:9px;cursor:pointer;outline-offset:4px;
 background:radial-gradient(circle at 5px 5px,var(--hc-ink2) 1.6px,transparent 2.1px) 0 0/10px 10px;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyLace:focus-visible{
 outline:2px solid var(--hc-lc);
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyInner{
 position:relative;width:100%;height:100%;
 transition:transform .5s ease;transform-style:preserve-3d;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyLace.flip .aoClaudeHolyInner{transform:rotateY(180deg)}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyFace{
 position:absolute;inset:0;
 backface-visibility:hidden;-webkit-backface-visibility:hidden;
 background:var(--hc-pg2);border:1px solid var(--hc-ink2);
 display:flex;flex-direction:column;padding:12px;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyBack{
 transform:rotateY(180deg);padding:18px 16px;overflow:hidden;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyPlate{
 position:relative;flex:1;min-height:30px;
 border:1px solid var(--liturgical-border,#3a3228);
 padding:4px;background:var(--hc-pg);
 display:flex;overflow:hidden;align-items:center;justify-content:center;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyPlate img{
 width:100%;height:100%;object-fit:contain;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyArtCredit{
 position:absolute;bottom:0;left:0;right:0;z-index:2;
 font:10px/1.2 Georgia,serif;text-align:center;
 padding:4px 5px;background:rgba(0,0,0,.82);color:#f5ede3;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyArtCredit a{
 color:inherit;text-decoration:underline;text-underline-offset:2px;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyTitle{
 text-align:center;padding:10px 0 2px;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyTitle h3{
 margin:0;font:400 24px/1.1 var(--hc-serif);
 color:var(--hc-ink);
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyTitle small{
 font:400 13px/1.2 var(--hc-sc);color:var(--hc-ink2);
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyOrn{
 text-align:center;font:400 22px/1 var(--hc-serif);color:var(--hc-lc);
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyBack h4{
 text-align:center;margin:6px 0 10px;
 font:400 15px/1.2 var(--hc-sc);color:var(--hc-ink2);
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyBackScroll{
 flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;
 padding:2px 1px;overscroll-behavior:contain;touch-action:pan-y;
 scrollbar-width:thin;
}
#aoPray435930 .aoClaudeHolyCard .aoP435930EssentialBeat{
 font:400 clamp(17px,4.6vw,19.5px)/1.55 var(--hc-serif);
 margin:0 0 .65em;padding:0;background:transparent;
 color:var(--hc-ink);transition:opacity .25s;
}
#aoPray435930 .aoClaudeHolyCard .aoP435930EssentialCollective{
 border:0;margin-left:7px;padding-left:7px;
}
#aoPray435930 .aoClaudeHolyCard .aoP435930EssentialBeat[data-ao-devo-active="true"]::before{
 display:none;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyInitial{
 float:left;font:400 58px/.8 var(--hc-init);
 color:var(--hc-lc);margin:6px 6px 0 0;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyClosing{
 flex:0 0 auto;font-size:16px;margin-top:8px;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyHint{
 margin-top:10px;font:italic 15px/1.2 var(--hc-serif);
 color:var(--hc-rub);text-align:center;
}
#aoPray435930 .aoClaudeHolyCase{
 --hc-pg2:var(--surface-1,#18150f);
 --hc-ink:var(--text,#ede4d3);
 --hc-ink2:var(--muted,#bfb4a1);
 padding:14px clamp(16px,5.6vw,22px) 22px;
 margin:0 auto;max-width:640px;
}
#aoPray435930 .aoClaudeHolyCaseHead{text-align:center;margin:4px 0 14px}
#aoPray435930 .aoClaudeHolyCaseHead h2{
 margin:0;font:400 30px/1.1 var(--ao-font-liturgical,Georgia,serif);
}
#aoPray435930 .aoClaudeHolyFan{
 display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 12px;
}
#aoPray435930 .aoClaudeHolyFan button{
 border:0;padding:6px;cursor:pointer;text-align:center;
 background:radial-gradient(circle at 3px 3px,var(--hc-ink2) 1.1px,transparent 1.5px) 0 0/7px 7px;
 min-width:0;
}
#aoPray435930 .aoClaudeHolyFanIn{
 background:var(--hc-pg2);border:1px solid var(--hc-ink2);padding:5px 5px 7px;
}
#aoPray435930 .aoClaudeHolyCasePlate{
 height:96px;border:1px solid var(--liturgical-border,#3a3228);
 background:var(--background,#0f0d0b);
}
#aoPray435930 .aoClaudeHolyCasePlate img{
 width:100%;height:100%;object-fit:contain;object-position:center;display:block;
}
#aoPray435930 .aoClaudeHolyFan small{
 display:block;font:400 13px/1.2 var(--ao-font-display,Georgia,serif);
 color:var(--hc-ink);margin-top:6px;overflow-wrap:break-word;
}
#aoPray435930 .aoClaudeHolyFan button:nth-child(3n+1){transform:rotate(-1.5deg)}
#aoPray435930 .aoClaudeHolyFan button:nth-child(3n){transform:rotate(1.2deg)}
#aoPray435930 .aoClaudeHolyFoot{
 display:flex;justify-content:space-between;align-items:baseline;
 gap:10px;border-top:1px solid var(--liturgical-border,#3a3228);
 padding:9px clamp(16px,5.6vw,22px) 12px;
 font:400 14.5px/1.2 var(--ao-font-display,Georgia,serif);
 color:var(--muted,#bfb4a1);
}
#aoPray435930 .aoClaudeHolyFoot button{
 border:0;background:transparent;
 color:var(--text,#ede4d3);padding:6px 7px;
 font:italic 16px/1.3 var(--ao-font-liturgical,Georgia,serif);
 min-height:44px;
}
#aoPray435930 .aoClaudeHolyFoot span{color:var(--liturgical,#6fae7e)}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyLatinText{
 border-bottom:1px solid var(--liturgical-border,#3a3228);
 padding:0 0 8px;margin:0 0 12px;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyLatinText .aoP435930EssentialBeat{
 font-size:.9em;font-style:italic;color:var(--hc-ink2);
}
#aoPray435930 .aoClaudeHolyAa{
 min-width:44px;min-height:44px;flex:0 0 auto;
 border:0;background:transparent;
 font:italic 17px/1 var(--ao-font-liturgical,Georgia,serif);
 color:var(--text,#ede4d3);
}
#aoPray435930 .aoClaudeHolyAa[aria-expanded="true"]{
 color:var(--liturgical,#6fae7e);
}
#aoPray435930 .aoClaudeHolyAaMenu{
 position:relative;z-index:20;
 padding:11px 14px;max-width:640px;margin:0 auto 6px;
 background:var(--surface-1,#18150f);
 border-bottom:3px double var(--rubric-red,#d4705f);
 color:var(--text,#ede4d3);
}
#aoPray435930 .aoClaudeHolyAaMenu[hidden]{display:none!important}
#aoPray435930 .aoClaudeHolyAaMenu small{
 display:block;font:400 14px/1.3 var(--ao-font-display,Georgia,serif);
 color:var(--muted,#bfb4a1);margin-bottom:6px;
}
#aoPray435930 .aoClaudeHolyLanguageChoices{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
#aoPray435930 .aoClaudeHolyLanguageChoices button{
 min-height:40px;padding:7px 11px;background:transparent;color:var(--text,#ede4d3);
 border:0;border-bottom:1px solid var(--liturgical-border,#3a3228);
 font:400 15px/1.2 var(--ao-font-liturgical,Georgia,serif);
}
#aoPray435930 .aoClaudeHolyLanguageChoices button[aria-pressed="true"]{
 border-bottom-color:var(--liturgical,#6fae7e);
 color:var(--liturgical,#6fae7e);
}
#aoPray435930 .aoClaudeHolySource{
 display:block;text-align:right;
 color:var(--muted,#bfb4a1);
 font:400 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);
}
#aoPray435930 .aoP435930LibraryReader:has(.aoClaudeHolyCard) .aoP435930Meta,
#aoPray435930 .aoP435930LibraryReader:has(.aoClaudeHolyCard) .aoP435930GuideInfo{
 display:none!important;
}
/* Claude's height formula assumes one 168px chassis. Ad Orientem keeps a
   persistent bottom nav and a canonical library-return row. On short phones,
   fit the original lace/card within the actual available reading viewport. */
@media(max-height:640px){
 #aoPray435930 .aoClaudeHolyCard .aoClaudeHolyLace{
  height:min(520px,calc(100dvh - 335px));
  min-height:min(210px,calc(100dvh - 335px));
 }
}
@media(max-width:359px){
 #aoPray435930 .aoClaudeHolyCaseHead h2{font-size:24px}
 #aoPray435930 .aoClaudeHolyCasePlate{height:60px}
 #aoPray435930 .aoClaudeHolyFan small{font-size:11.5px}
 #aoPray435930 .aoClaudeHolyCard .aoClaudeHolyBack{padding:12px}
 #aoPray435930 .aoClaudeHolyCard .aoP435930EssentialBeat{font-size:16.5px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoClaudeHolyCard .aoClaudeHolyInner{transition:none}
 #aoPray435930 .aoClaudeHolyCard .aoP435930EssentialBeat{transition:none}
}

/* 4 Nov visual repair: a source-owned typographic vellum plate when no
 * exact photograph has publication clearance; never show an empty black box. */
#aoPray435930 .aoClaudeHolyCasePlate.aoClaudeHolyCasePlateText,
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyPlate.aoClaudeHolyPlateText{
 background:linear-gradient(158deg,#eee4cf,#c8b797);
 border:1px solid #948264;
 color:#32291e;
 padding:9px;
}
#aoPray435930 .aoClaudeHolyTypePlate{
 display:flex;flex-direction:column;align-items:center;justify-content:center;
 gap:6px;width:100%;height:100%;min-width:0;overflow:hidden;
 color:#32291e;text-align:center;
}
#aoPray435930 .aoClaudeHolyTypePlate b{
 font:400 clamp(11px,3vw,19px)/1.14 var(--ao-font-liturgical,Georgia,serif);
 overflow-wrap:anywhere;max-width:100%;
}
#aoPray435930 .aoClaudeHolyTypePlate i{
 font:italic 11px/1.22 var(--ao-font-liturgical,Georgia,serif);
 max-width:100%;color:#5e4934;overflow-wrap:anywhere;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyPlate .aoClaudeHolyTypePlate b{font-size:clamp(21px,5vw,30px)}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyPlate .aoClaudeHolyTypePlate i{font-size:15px}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyLace{
 height:min(480px,calc(100dvh - 290px));min-height:220px;
 padding:5px;
 background:radial-gradient(circle at 5px 5px,rgba(185,164,132,.38) .9px,transparent 1.35px) 0 0/11px 11px;
}
#aoPray435930 .aoClaudeHolyFan button{
 background:radial-gradient(circle at 3px 3px,rgba(185,164,132,.34) .7px,transparent 1.15px) 0 0/9px 9px;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyInitial{
 display:inline;float:none;font:inherit;font-size:1.18em;
 letter-spacing:0;margin:0;padding:0;line-height:inherit;vertical-align:baseline;
}
/* The original reversible card also needs a real, obvious action. */
#aoPray435930 .aoClaudeHolyFlipButton{
 display:block;min-height:40px;min-width:124px;margin:8px auto 0;
 padding:6px 15px;border:1px solid var(--liturgical-border,#75664f);
 border-radius:2px;background:transparent;color:var(--text,#ede4d3);
 font:400 15px/1.3 var(--ao-font-display,Georgia,serif);
}
#aoPray435930 .aoClaudeHolyFlipButton:focus-visible{
 outline:2px solid var(--liturgical,#bfa576);outline-offset:2px;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyArtCredit{
 bottom:0;line-height:1.25;max-height:48px;overflow:auto;
}
#aoPray435930 .aoClaudeHolyCard .aoClaudeHolyBackScroll{
 padding-bottom:16px;scroll-padding-bottom:16px;
}
@media(max-height:640px){
 #aoPray435930 .aoClaudeHolyCard .aoClaudeHolyLace{
  height:max(220px,calc(100dvh - 290px));min-height:220px;
 }
}

`;
export function installClaudeHolyCardStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-claude-holy-card-css"))return true;
 const style=doc.createElement("style");
 style.id="ao-claude-holy-card-css";
 style.textContent=CLAUDE_HOLY_CARD_CSS;doc.head.appendChild(style);return true;
}
if(typeof document!=="undefined")installClaudeHolyCardStyles(document);
