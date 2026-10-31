/**
 * Claude Hours v4.6 original .hor and .strokes layout, adapted ONLY to
 * the established Ad Orientem Angelus reader; review harness is excluded.
 */
export const CLAUDE_HORARIUM_STYLES=String.raw\`
#aoPray435930 [data-ao-hours-owner]{
 --hor-ink:var(--text,#ede4d3);
 --hor-ink2:var(--muted,#bfb4a1);
 --hor-rule:var(--liturgical-border,#3a3228);
 --hor-lc:var(--liturgical,#6fae7e);
}
#aoPray435930 .aoClaudeHorariumClock{
 position:relative;flex:0 0 auto;height:150px;
 border-bottom:1px solid var(--hor-rule);
 color:var(--hor-ink2);overflow:hidden;margin:0;
}
#aoPray435930 .aoClaudeHorariumClock svg{
 display:block;width:100%;height:100%;
 pointer-events:none;
}
#aoPray435930 .aoClaudeHorariumHourTargets{
 position:absolute;left:0;right:0;bottom:0;
 display:flex;justify-content:space-between;align-items:end;
 pointer-events:none;padding-inline:3px;
}
#aoPray435930 .aoClaudeHorariumHourTargets button{
 cursor:pointer;pointer-events:auto;
 flex:0 0 44px;min-height:44px;
 border:0;background:transparent;color:transparent;
 font-size:0;padding:0;
}
#aoPray435930 .aoClaudeHorariumHourTargets button:focus-visible{
 outline:2px solid var(--hor-lc);outline-offset:-3px;
}
#aoPray435930 .aoClaudeHorariumStrokes{
 flex:0 0 auto;display:flex;justify-content:center;
 gap:14px;padding:9px 0 7px;
 border-bottom:1px solid var(--hor-rule);
}
#aoPray435930 .aoClaudeHorariumStrokes>span{
 display:flex;gap:3px;align-items:center;justify-content:center;
}
#aoPray435930 .aoClaudeHorariumStrokeGroup{display:flex;gap:3px}
#aoPray435930 .aoClaudeHorariumStrokes i{
 width:1.5px;height:13px;background:var(--hor-rule);
 display:inline-block;
}
#aoPray435930 .aoClaudeHorariumStrokes .dn i{
 background:var(--hor-ink2);
}
#aoPray435930 .aoClaudeHorariumStrokes .cu i{
 background:var(--hor-lc);height:15px;
}
#aoPray435930 .aoP435930AngelusReader .aoClaudeHorariumShell{
 max-width:650px;margin-inline:auto;
 border-bottom:3px double var(--rubric-red,#d4705f);
}
#aoPray435930 .aoP435930AngelusReader .aoHoursBellLine{display:none!important}
@media(max-width:359px){
 #aoPray435930 .aoClaudeHorariumClock{height:90px}
 #aoPray435930 .aoClaudeHorariumStrokes{gap:10px}
 #aoPray435930 .aoClaudeHorariumStrokes i{height:12px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoClaudeHorariumStrokes *{transition:none}
}
\`;
export function installClaudeHorariumStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-claude-horarium-css"))return true;
 const style=doc.createElement("style");
 style.id="ao-claude-horarium-css";
 style.textContent=CLAUDE_HORARIUM_STYLES;doc.head.appendChild(style);
 return true;
}
if(typeof document!=="undefined")installClaudeHorariumStyles(document);
