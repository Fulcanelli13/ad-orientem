/**
 * Claude Loreto v4.6: CSS measurements and response-bar grammar ported from
 * AO_Prayer_Choir_Litany_of_Loreto.html <style id="app-ui">.
 * User correction pack supersedes the prototype's secondary review chrome:
 * existing Ad Orientem header stays; Aa owns source/language/bar settings.
 */
export const CLAUDE_CHOIR_FIXED_FOOT_CSS=String.raw`
#aoPray435930 .aoClaudeChoirPrayer{
 --claude-ink:var(--text,#ede4d3);
 --claude-ink2:var(--muted,#bfb4a1);
 --claude-pg:var(--background,#0f0d0b);
 --claude-pg2:var(--surface-1,#18150f);
 --claude-rub:var(--rubric-red,#d4705f);
 --claude-lc:var(--liturgical,#6fae7e);
 --claude-rule:var(--liturgical-border,#3a3228);
 --claude-past:color-mix(in srgb,var(--claude-ink) 55%,var(--claude-pg));
 --claude-next:color-mix(in srgb,var(--claude-ink) 82%,var(--claude-pg));
 --claude-serif:var(--ao-font-liturgical,"Sorts Mill Goudy",Georgia,serif);
 --claude-sc:var(--ao-font-display,"IM Fell English SC",Georgia,serif);
 margin:0 auto;padding:12px clamp(16px,5.6vw,22px) 0;
 width:100%;max-width:640px;border:0;background:transparent;box-shadow:none;
}
#aoPray435930 .aoClaudeChoirPrayer .aoP435930PrayerHead{
 margin:0 0 16px;padding-bottom:14px;border-bottom:3px double var(--claude-rub);
}
#aoPray435930 .aoClaudeChoirPrayer .aoP435930PrayerHead h3{
 font:400 clamp(22px,5.1vw,28px)/1.25 var(--claude-serif);
}
#aoPray435930 .aoClaudeChoirPrayer .aoChoirFace{
 display:block;max-width:none;margin:0;padding:0 0 10px;
}
#aoPray435930 .aoClaudeChoirPrayer .aoChoirBeat{
 position:relative;display:block;cursor:pointer;
 margin:0 0 .2em;padding:2px 0;
 font:400 clamp(18.5px,4.95vw,20px)/1.55 var(--claude-serif);
 color:var(--claude-next);transition:opacity .25s ease,color .25s ease;
}
#aoPray435930 .aoClaudeChoirPrayer .aoChoirBeat[data-ao-devo-active="true"]{
 opacity:1!important;color:var(--claude-ink);
}
#aoPray435930 .aoClaudeChoirPrayer .aoChoirBeat[data-ao-devo-active="true"]::before{
 content:"¶";position:absolute;left:-18px;top:.05em;
 font:400 .8em/1 var(--claude-serif);color:var(--claude-lc);
 width:auto;height:auto;border:0;margin:0;
}
#aoPray435930 .aoClaudeChoirSection{
 display:flex;align-items:center;gap:10px;margin:18px 0 8px;
 font:400 15px/1.2 var(--claude-sc);color:var(--claude-ink2);
}
#aoPray435930 .aoClaudeChoirSection::after{
 content:"";flex:1;border-top:1px solid var(--claude-rule);
}
#aoPray435930 .aoClaudeChoirGap{height:13px}
#aoPray435930 .aoClaudeChoirInlineResponse{
 display:inline;color:var(--claude-ink2);margin-left:6px;
 font-style:italic;white-space:normal;
}
#aoPray435930 .aoClaudeChoirInlineResponse>span{color:var(--claude-rub)}
#aoPray435930 .aoClaudeChoirResponse{
 flex:0 0 auto;position:relative;display:flex;align-items:baseline;
 gap:10px;padding:13px clamp(16px,5.6vw,22px) 15px;
 border-top:3px double var(--claude-rub);
 background:var(--claude-pg2);min-height:64px;
}
#aoPray435930 .aoClaudeChoirResponse[hidden]{display:none!important}
#aoPray435930 .aoClaudeChoirResponseMark{
 font:400 22px/1 var(--claude-serif);color:var(--claude-rub)
}
#aoPray435930 .aoClaudeChoirResponseText{
 font:400 23px/1.2 var(--claude-serif);
 color:var(--claude-ink);flex:1;
}
#aoPray435930 .aoClaudeChoirResponse small{
 margin-left:auto;font:400 13px/1 var(--claude-sc);color:var(--claude-ink2)
}
#aoPray435930 .aoClaudeChoirResponse::after{
 content:"";position:absolute;left:clamp(16px,5.6vw,22px);bottom:9px;
 height:1.5px;width:0;background:var(--claude-lc);
}
#aoPray435930 .aoClaudeChoirResponse.ring::after{
 animation:aoClaudeChoirRing .5s ease both;
}
@keyframes aoClaudeChoirRing{
 0%{width:0;opacity:1}
 75%{width:calc(100% - 44px);opacity:1}
 100%{width:calc(100% - 44px);opacity:0}
}
#aoPray435930 .aoClaudeChoirAa{
 flex:0 0 auto;min-width:44px;min-height:44px;
 border:0;background:transparent;
 font:italic 17px/1 var(--ao-font-liturgical,Georgia,serif);
 color:var(--text,#ede4d3);
}
#aoPray435930 .aoClaudeChoirAa[aria-expanded="true"]{color:var(--liturgical,#6fae7e)}
#aoPray435930 .aoClaudeChoirAaMenu{
 position:relative;z-index:20;
 margin:0 auto 6px;padding:11px 14px;
 max-width:640px;border-bottom:3px double var(--rubric-red,#d4705f);
 background:var(--surface-1,#18150f);
 color:var(--text,#ede4d3);
}
#aoPray435930 .aoClaudeChoirAaMenu[hidden]{display:none!important}
#aoPray435930 .aoClaudeChoirMenuTitle{
 font:400 14px/1.3 var(--ao-font-display,Georgia,serif);
 color:var(--muted,#bfb4a1);padding:5px 0 3px;
}
#aoPray435930 .aoClaudeChoirMenuChoices{display:flex;flex-wrap:wrap;gap:4px 8px;margin:0 0 9px}
#aoPray435930 .aoClaudeChoirMenuChoices button{
 border:0;border-bottom:1px solid var(--liturgical-border,#3a3228);
 padding:8px 10px;min-height:40px;background:transparent;
 color:var(--text,#ede4d3);
 font:400 15px/1.3 var(--ao-font-liturgical,Georgia,serif);
}
#aoPray435930 .aoClaudeChoirMenuChoices button[aria-pressed="true"]{
 border-bottom-color:var(--liturgical,#6fae7e);
 color:var(--liturgical,#6fae7e);
}
#aoPray435930 .aoClaudeChoirMenuSource{
 font:400 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);
 text-align:right;color:var(--muted,#bfb4a1);
}
#aoPray435930 .aoClaudeChoirMenuSource a{color:inherit}
#aoPray435930 .aoClaudeChoirPrayer .aoP435930Source{display:none!important}
#aoPray435930 .aoP435930LibraryReader:has(.aoClaudeChoirPrayer) .aoP435930Meta,
#aoPray435930 .aoP435930LibraryReader:has(.aoClaudeChoirPrayer) .aoP435930GuideInfo{
 display:none!important;
}
@media(max-width:359px){
 #aoPray435930 .aoClaudeChoirPrayer{padding-inline:16px}
 #aoPray435930 .aoClaudeChoirPrayer .aoChoirBeat{font-size:18.5px}
 #aoPray435930 .aoClaudeChoirResponse{padding-inline:16px}
 #aoPray435930 .aoClaudeChoirResponseText{font-size:21px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoClaudeChoirPrayer .aoChoirBeat{transition:none}
 #aoPray435930 .aoClaudeChoirResponse.ring::after{animation:none}
}
`;
export function installClaudeChoirFixedFootStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-claude-choir-fixed-foot"))return true;
 const style=doc.createElement("style");
 style.id="ao-claude-choir-fixed-foot";
 style.textContent=CLAUDE_CHOIR_FIXED_FOOT_CSS;
 doc.head.appendChild(style);return true;
}
if(typeof document!=="undefined")installClaudeChoirFixedFootStyles(document);
