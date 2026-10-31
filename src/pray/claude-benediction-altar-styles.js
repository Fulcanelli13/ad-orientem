/**
 * Claude Altar Card — faithful structural port of .rite / .stg / .acard /
 * .inn / .hd / .scr / .q / .two from original app-ui CSS.
 * Preserves canonical source and app's existing header / stage navigation.
 */
export const CLAUDE_ALTAR_CARD_CSS=String.raw`
#aoPray435930 [data-ao-rite-owner="benediction"]{
 --claude-pg:var(--background,#0F0D0B);
 --claude-pg2:var(--surface-1,#18150F);
 --claude-ink:var(--text,#EDE4D3);
 --claude-ink2:var(--muted,#BFB4A1);
 --claude-rule:var(--liturgical-border,#3A3228);
 --claude-rub:var(--rubric-red,#D4705F);
 --claude-lc:var(--liturgical,#6FAE7E);
 --claude-serif:var(--ao-font-liturgical,"Sorts Mill Goudy",Georgia,serif);
 --claude-init:var(--ao-font-initial,"IM Fell French Canon",Georgia,serif);
}
/* Claude has ONE stage navigation: the Roman I–VII margin. Keep the underlying
   source-owned timeline mounted for focus/progress events, but do not show a
   redundant horizontal strip or expose duplicate navigation to assistive tech. */
#aoPray435930 [data-ao-rite-owner="benediction"] .aoDevoSequenceTimeline{
 display:none!important;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeRiteLayout{
 flex:1 1 auto;display:flex;min-height:0;
 padding:12px 12px 12px 0;width:100%;max-width:680px;margin:0 auto;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeRiteRail{
 flex:0 0 40px;display:flex;flex-direction:column;align-items:center;
 gap:2px;padding-top:6px;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeRiteRail button{
 width:36px;min-height:36px;border:0;background:none;
 padding:4px;color:var(--claude-ink2);
 font:400 16px/1 var(--claude-init);cursor:pointer;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeRiteRail button.cu{
 color:var(--claude-rub);font-size:21px;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeRiteRail button.dn{
 color:var(--claude-ink2);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeRiteRail button.key{
 text-decoration:underline;text-decoration-color:var(--claude-lc);
 text-underline-offset:4px;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeRiteRail button:focus-visible{
 outline:2px solid var(--claude-lc);outline-offset:2px;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeAltarCard{
 flex:1 1 auto;min-width:0;min-height:0;
 display:flex;flex-direction:column;
 border:3px double var(--claude-ink2);padding:3px;
 background:var(--claude-pg2);border-radius:0;
 box-shadow:none;margin:0;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeAltarInner{
 flex:1 1 auto;display:flex;flex-direction:column;min-height:0;
 border:1px solid var(--claude-rule);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeAltarHead{
 display:flex;align-items:center;gap:10px;
 padding:10px 12px 8px;margin:0;
 border:0;border-bottom:1px solid var(--claude-rule);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeAltarHead .aoDevoCardTitle{
 margin:0;font:400 21px/1.15 var(--claude-serif);
 color:var(--claude-ink);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeAltarHead .aoDevoCardNumber{
 font:400 13px/1.2 var(--ao-font-display,Georgia,serif);
 color:var(--claude-ink2);white-space:nowrap;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeAltarScroll{
 flex:1 1 auto;min-height:0;
 overflow:auto;padding:10px 12px 0 18px;
 touch-action:pan-y;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantPrayer .aoP435930Flip{
 display:block;width:100%;text-align:left;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza{
 display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
 gap:0 .6em;align-items:start;min-width:0;
 margin:0 0 .85em;padding:0 0 12px;
 border-bottom:1px solid var(--claude-rule);
 font:400 clamp(17px,4.6vw,19px)/1.55 var(--claude-serif);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza .aoRiteChantLatin{
 display:block;margin:0;padding:0;
 font:italic inherit;color:var(--claude-ink);overflow-wrap:break-word;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza .aoRiteChantVernacular{
 display:block;margin:0;padding:0;border:0;background:none;
 font:normal .88em/1.55 var(--claude-serif);color:var(--claude-ink2);
 overflow-wrap:break-word;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza:has(.aoRiteChantLatin):not(:has(.aoRiteChantVernacular)){
 grid-template-columns:1fr;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteLiturgicalBeat{
 display:block;min-width:0;margin:0 0 .85em;
 font:400 clamp(17px,4.6vw,19px)/1.55 var(--claude-serif);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteLiturgicalResponse{
 padding-left:10px;border-left:2px solid var(--claude-rule);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeExternalBlessing{
 margin:18px 0 24px;padding:14px 8px;
 text-align:center;border-top:1px solid var(--claude-rule);
 border-bottom:1px solid var(--claude-rule);
 font:italic clamp(19px,5vw,23px)/1.4 var(--claude-serif);
 color:var(--claude-rub);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeBlessingRoman{
 font:400 34px/1 var(--claude-init);color:var(--claude-lc);
 text-decoration:underline;text-underline-offset:4px;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeExternalBlessing small{
 display:block;font:400 13px/1.35 var(--ao-font-display,Georgia,serif);
 color:var(--claude-ink2);
}
@media(max-width:359px){
 #aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeRiteLayout{padding-right:8px}
 #aoPray435930 [data-ao-rite-owner="benediction"] .aoClaudeAltarHead .aoDevoCardTitle{font-size:18px}
 #aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza{
  grid-template-columns:minmax(0,1fr);font-size:18px;
 }
 #aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza .aoRiteChantVernacular{
  margin-top:5px;
 }
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza{transition:none}
}
`;
export function installClaudeAltarCardStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-claude-altar-card-css"))return true;
 const tag=doc.createElement("style");
 tag.id="ao-claude-altar-card-css";tag.textContent=CLAUDE_ALTAR_CARD_CSS;
 doc.head.appendChild(tag);return true;
}
if(typeof document!=="undefined")installClaudeAltarCardStyles(document);
