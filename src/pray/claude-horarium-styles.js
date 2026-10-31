/**
 * Claude Hours v4.6 original .hor and .strokes layout, adapted ONLY to
 * the established Ad Orientem Angelus reader; review harness is excluded.
 */
export const CLAUDE_HORARIUM_STYLES=String.raw`
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
/* Source Claude Hours: opening arc/plate/3·3·3·9/Begin composition.
   The placeholder is CSS only until sacred art receives approval. */
#aoPray435930 .aoClaudeHorariumOpening .aoClaudeHorariumClock{height:220px}
#aoPray435930 .aoClaudeHorariumReading .aoClaudeHorariumClock{height:120px}
#aoPray435930 .aoClaudeHorariumIntro{
 padding:13px 22px 4px;display:flex;flex-direction:column;align-items:center;text-align:center;
}
#aoPray435930 .aoClaudeHorariumIntro[hidden],
#aoPray435930 .aoClaudeHorariumBegin[hidden]{display:none!important}
#aoPray435930 .aoClaudeHorariumKicker{
 margin:0;color:var(--rubric-red,#d4705f);font:italic 15px/1.35 Georgia,serif;
}
#aoPray435930 .aoClaudeHorariumIntro h2{
 margin:2px 0 12px;color:var(--hor-ink);
 font:400 clamp(29px,7.7vw,35px)/1.1 var(--ao-font-liturgical,Georgia,serif);
}
#aoPray435930 .aoClaudeHorariumPlate{
 width:100%;height:170px;border:1px solid var(--hor-rule);padding:4px;
 background:var(--surface-1,#18150f);display:flex;flex-direction:column;
}
#aoPray435930 .aoClaudeHorariumPlateArt{
 flex:1 1 auto;min-height:35px;position:relative;
 background:radial-gradient(70% 60% at 45% 35%,rgba(216,195,154,.55),transparent 70%),
 repeating-linear-gradient(118deg,rgba(0,0,0,.2) 0 1px,transparent 1px 4px),
 linear-gradient(170deg,#5a4630,#1a130c);
}
#aoPray435930 .aoClaudeHorariumPlateArt span{
 position:absolute;left:6px;right:6px;top:50%;transform:translateY(-50%);
 font:13px/1.25 var(--ao-font-display,Georgia,serif);color:rgba(240,228,205,.8);
}
#aoPray435930 .aoClaudeHorariumPlate small{
 padding:5px 2px 0;text-align:left;font:12px/1.2 var(--ao-font-display,Georgia,serif);
 color:var(--hor-ink2);
}
#aoPray435930 .aoClaudeHorariumOpening .aoClaudeHorariumStrokes{border-bottom:0}
#aoPray435930 .aoClaudeHorariumBegin{
 width:calc(100% - 44px);min-height:48px;margin:0 22px 10px;padding:10px 2px;
 display:flex;justify-content:space-between;align-items:center;
 background:transparent;border:0;border-top:1px solid var(--hor-rule);
 border-bottom:1px solid var(--hor-rule);border-radius:0;
 text-align:left;color:var(--hor-ink);
 font:400 20px/1.25 var(--ao-font-liturgical,Georgia,serif);cursor:pointer;
}
#aoPray435930 .aoClaudeHorariumBegin span:last-child{color:var(--hor-lc)}
#aoPray435930 .aoClaudeHorariumBegin:focus-visible{outline:2px solid var(--hor-lc);outline-offset:3px}
@media(max-width:359px){
 #aoPray435930 .aoClaudeHorariumOpening .aoClaudeHorariumClock{height:120px}
 #aoPray435930 .aoClaudeHorariumReading .aoClaudeHorariumClock{height:90px}
 #aoPray435930 .aoClaudeHorariumPlate{height:100px}
 #aoPray435930 .aoClaudeHorariumIntro{padding-inline:12px}
 #aoPray435930 .aoClaudeHorariumBegin{width:calc(100% - 24px);margin-inline:12px}
}
#aoPray435930 .aoP435930AngelusReader .aoClaudeHorariumShell{
 max-width:650px;margin-inline:auto;
 border-bottom:3px double var(--rubric-red,#d4705f);
}
#aoPray435930 .aoP435930AngelusReader .aoHoursBellLine{display:none!important}
/* The hour cover and the source-owned five-stage reader are distinct states.
   Preserve the mounted cards and their state, but do not expose the first
   prayer panel underneath Claude's explicit Begin-at-the-bell opening. */
#aoPray435930 .aoP435930AngelusReader:has(.aoClaudeHorariumOpening) .aoAngelusRitualGrid{
 display:none!important;
}
@media(max-width:359px){
 #aoPray435930 .aoClaudeHorariumClock{height:90px}
 #aoPray435930 .aoClaudeHorariumStrokes{gap:10px}
 #aoPray435930 .aoClaudeHorariumStrokes i{height:12px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoClaudeHorariumStrokes *{transition:none}
}
`;
export function installClaudeHorariumStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-claude-horarium-css"))return true;
 const style=doc.createElement("style");
 style.id="ao-claude-horarium-css";
 style.textContent=CLAUDE_HORARIUM_STYLES;doc.head.appendChild(style);
 return true;
}
if(typeof document!=="undefined")installClaudeHorariumStyles(document);
