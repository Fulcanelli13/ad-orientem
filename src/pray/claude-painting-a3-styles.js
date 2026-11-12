/**
 * Visual CSS port of Claude's A3 "The painting" prototype. The painting fills
 * the entire Prayer viewport. Text is overlaid on it, NOT put into another
 * panel. Additional selectors attach source-owned choir behaviour.
 */
const LINES=[
'#aoPray435930.aoPaintingA3Active{background:#030507!important;backdrop-filter:none!important;padding:0!important}',
'#aoPray435930.aoPaintingA3Active .aoP435930Sheet{position:fixed!important;inset:0!important;width:100%!important;max-width:none!important;height:100dvh!important;max-height:none!important;border:0!important;border-radius:0!important;background:#030507!important;box-shadow:none!important;overflow:hidden!important}',
'#aoPray435930.aoPaintingA3Active .aoP435930Mount{position:relative!important;width:100%!important;height:100%!important;overflow:hidden!important;background:#030507!important}',
'#aoPray435930.aoPaintingA3Active .aoP435930Head{position:absolute!important;z-index:30!important;top:0!important;left:0!important;right:0!important;background:transparent!important;box-shadow:none!important;border:0!important;color:#eee9df!important}',
'#aoPray435930.aoPaintingA3Active .aoP435930Head h1,#aoPray435930.aoPaintingA3Active .aoP435930Head p{display:none!important}',
'#aoPray435930 .aoClaudePaintingA3Host{position:absolute!important;inset:0!important;margin:0!important;padding:0!important;display:block!important;max-width:none!important;overflow:hidden!important;background:transparent!important}',
'#aoPray435930 .aoClaudePaintingA3Card{position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;max-width:none!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;border:0!important;border-radius:0!important;background:#030507!important;box-shadow:none!important}',
'#aoPray435930 .aoClaudePaintingA3{position:absolute;inset:0;isolation:isolate;overflow:hidden;background:#030507;color:#eee9df;--gold:#c9ad78;--gold2:#f1d9a3;--mu2:rgba(238,233,223,.45);--cap:Cinzel,Georgia,serif;--corm:"Cormorant Garamond","EB Garamond",Georgia,serif;--serif:"EB Garamond",Georgia,serif;--ease:cubic-bezier(.22,.8,.22,1)}',
/* The following stage grammar is Claude A3: background, dark ramp, content,
   painting-only view, type, credit and rail. */
'#aoPray435930 .aoClaudePaintingA3 .bg{position:absolute;inset:-5%;background-size:cover;background-position:center;animation:aoClaudeA3Kb 32s ease-in-out infinite alternate;transition:opacity 1s}',
'@keyframes aoClaudeA3Kb{from{transform:scale(1)}to{transform:scale(1.09) translate(-1.5%,-1%)}}',
'#aoPray435930 .aoClaudePaintingA3 .sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,6,9,.55) 0%,rgba(4,6,9,0) 22%,rgba(4,6,9,.15) 40%,rgba(4,6,9,.88) 64%,#04060a 86%);transition:opacity .8s}',
'#aoPray435930 .aoClaudePaintingA3 .ct{position:absolute;left:26px;right:54px;bottom:46px;z-index:3;max-width:760px;transition:opacity .7s,transform .7s var(--ease)}',
'#aoPray435930 .aoClaudePaintingA3.view .ct,#aoPray435930 .aoClaudePaintingA3.view .sh{opacity:0;pointer-events:none}',
'#aoPray435930 .aoClaudePaintingA3.view .ct{transform:translateY(20px)}',
'#aoPray435930 .aoClaudePaintingA3 h2{font:600 clamp(28px,5vw,34px)/1.02 var(--cap);margin:8px 0 16px;letter-spacing:.5px;text-shadow:0 2px 20px rgba(0,0,0,.6);color:#eee9df}',
'#aoPray435930 .aoClaudePaintingA3 .eyb{font:600 10px var(--cap);letter-spacing:2.2px;color:var(--gold)}',
'#aoPray435930 .aoClaudePaintingA3 .tx{font:500 23px/1.45 var(--corm);max-height:min(46dvh,480px);overflow-y:auto;scrollbar-width:none;color:#eee9df;background:none!important;box-shadow:none!important;padding:0!important;margin:0!important;white-space:pre-line}',
'#aoPray435930 .aoClaudePaintingA3 .tx::-webkit-scrollbar{display:none}',
'#aoPray435930 .aoClaudePaintingA3 .cr{font:italic 13.5px var(--serif);color:var(--mu2);margin-top:14px}',
'#aoPray435930 .aoClaudePaintingA3 .hint .ha,#aoPray435930 .aoClaudePaintingA3 .hint .hb{color:var(--gold)}',
'#aoPray435930 .aoClaudePaintingA3 .rail{position:absolute;right:18px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:4}',
'#aoPray435930 .aoClaudePaintingA3 .rail button{display:block;width:4px;height:4px;border-radius:2px;background:rgba(255,255,255,.3);transition:all .3s;border:0;padding:0;min-height:4px;min-width:4px}',
'#aoPray435930 .aoClaudePaintingA3 .rail button.on{height:22px;background:var(--gold2)}',
/* Claude A3 swaps translation IN THE SAME SPACE. */
'#aoPray435930 .aoClaudePaintingA3 .sw{cursor:pointer;-webkit-tap-highlight-color:transparent;outline-offset:5px}',
'#aoPray435930 .aoClaudePaintingA3 .sw .st{display:grid}',
'#aoPray435930 .aoClaudePaintingA3 .sw .st>*{grid-area:1/1;transition:opacity .6s var(--ease),filter .6s var(--ease),transform .6s var(--ease);white-space:pre-line}',
'#aoPray435930 .aoClaudePaintingA3 .sw .b{opacity:0;filter:blur(7px);transform:translateY(5px);pointer-events:none}',
'#aoPray435930 .aoClaudePaintingA3 .sw.v .a{opacity:0;filter:blur(7px);transform:translateY(-5px);pointer-events:none}',
'#aoPray435930 .aoClaudePaintingA3 .sw.v .b{opacity:1;filter:none;transform:none;pointer-events:auto}',
'#aoPray435930 .aoClaudePaintingA3 .sw .hint{display:grid;margin-top:12px}',
'#aoPray435930 .aoClaudePaintingA3 .sw .hint>*{grid-area:1/1;transition:opacity .5s;font:600 9.5px var(--cap);letter-spacing:1.8px}',
'#aoPray435930 .aoClaudePaintingA3 .sw .hint .hb{opacity:0}',
'#aoPray435930 .aoClaudePaintingA3 .sw.v .hint .ha{opacity:0}',
'#aoPray435930 .aoClaudePaintingA3 .sw.v .hint .hb{opacity:1}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3ViewToggle{position:absolute;top:55px;right:16px;z-index:40;width:38px;height:38px;display:grid;place-items:center;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(10,14,20,.45);backdrop-filter:blur(10px);color:#eee9df;font:18px var(--serif);cursor:pointer}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3ViewToggle[aria-pressed=true]{border-color:#c9ad78}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3Source summary{cursor:pointer;color:rgba(238,233,223,.7);font:13px/1.5 var(--serif);margin-top:8px}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3Source{max-height:18dvh;overflow:auto;color:#eee9df;font-size:12px}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3Source a{color:#c9ad78}',
/* The SOURCE choir engine is reused rather than replaced by inline pairs.
   Its bar must stay at the foot, against the painting rather than a page. */
'#aoPray435930 .aoClaudePaintingA3 .aoClaudeChoirPrayer{margin:0!important;padding:0!important;width:100%!important;max-width:none!important;border:0!important;background:transparent!important;color:#eee9df!important;box-shadow:none!important}',
'#aoPray435930 .aoClaudePaintingA3 .aoChoirFaces,#aoPray435930 .aoClaudePaintingA3 .aoChoirFace{background:transparent!important;border:0!important;box-shadow:none!important;color:#eee9df!important}',
'#aoPray435930 .aoClaudePaintingA3 .aoChoirBeat{color:rgba(238,233,223,.8)!important;text-shadow:0 2px 15px #000;font:500 22px/1.48 var(--corm)!important;white-space:normal}',
'#aoPray435930 .aoClaudePaintingA3 .aoChoirBeat[data-ao-devo-active=true]{color:#fff!important}',
'#aoPray435930 .aoClaudePaintingA3Card:has(.aoClaudeChoirPrayer) .ct{bottom:100px}',
'#aoPray435930 .aoClaudePaintingA3Card .aoClaudeChoirResponse{position:absolute!important;z-index:6;bottom:0;left:0;right:0;min-height:68px;padding:15px 25px!important;margin:0!important;border-top:1px solid rgba(201,173,120,.75)!important;background:linear-gradient(0deg,rgba(4,6,9,.96),rgba(4,6,9,.74))!important;--claude-ink:#eee9df;--claude-pg2:transparent;--claude-rub:#c9ad78;--claude-lc:#c9ad78;color:#eee9df}',
'#aoPray435930 .aoClaudePaintingA3Card.aoPaintingOnly .aoClaudeChoirResponse{opacity:0;pointer-events:none}',
'@media(max-width:600px){#aoPray435930 .aoClaudePaintingA3 .ct{left:22px;right:42px;bottom:34px}#aoPray435930 .aoClaudePaintingA3 h2{font-size:29px}#aoPray435930 .aoClaudePaintingA3 .tx{font-size:22px;max-height:44dvh}#aoPray435930 .aoClaudePaintingA3 .rail{right:14px}#aoPray435930 .aoClaudePaintingA3Card:has(.aoClaudeChoirPrayer) .ct{bottom:94px}}',
'@media(max-width:359px){#aoPray435930 .aoClaudePaintingA3 .ct{left:17px;right:34px}#aoPray435930 .aoClaudePaintingA3 .tx{font-size:20px}#aoPray435930 .aoClaudePaintingA3 .aoChoirBeat{font-size:20px!important}}',
'@media(prefers-reduced-motion:reduce){#aoPray435930 .aoClaudePaintingA3 .bg{animation:none!important;transform:none!important}#aoPray435930 .aoClaudePaintingA3 .sw .st>*,#aoPray435930 .aoClaudePaintingA3 .ct,#aoPray435930 .aoClaudePaintingA3 .sh{transition:none!important}}'
];
export const CLAUDE_PAINTING_A3_CSS=LINES.join("\n");
export function installClaudePaintingA3Styles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-claude-painting-a3-styles"))return true;
 const style=doc.createElement("style");
 style.id="ao-claude-painting-a3-styles";
 style.textContent=CLAUDE_PAINTING_A3_CSS;doc.head.appendChild(style);
 return true;
}
if(typeof document!=="undefined")installClaudePaintingA3Styles(document);
