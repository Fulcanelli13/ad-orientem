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
/* The soft cropped ambient is atmospheric only. The actual artwork is an
   uncropped image with object-fit:contain, never a cover background. */
'#aoPray435930 .aoClaudePaintingA3 .ambient{position:absolute;inset:-6%;background-position:center;background-size:cover;filter:blur(34px) brightness(.34) saturate(.85);transform:scale(1.06);z-index:0;pointer-events:none}',
'#aoPray435930 .aoClaudePaintingA3 .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center;z-index:1;pointer-events:none;animation:aoClaudeA3Kb 32s ease-in-out infinite alternate;transition:inset .5s ease,opacity 1s}',

'@keyframes aoClaudeA3Kb{from{opacity:1}to{opacity:.96}}',
'#aoPray435930 .aoClaudePaintingA3 .sh{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(4,6,9,.25) 0%,rgba(4,6,9,0) 24%,rgba(4,6,9,.02) 48%,rgba(4,6,9,.18) 59%,rgba(4,6,9,.70) 81%,#04060a 100%);transition:opacity .8s;pointer-events:none}',
'#aoPray435930 .aoClaudePaintingA3 .ct{position:absolute;left:26px;right:54px;bottom:46px;z-index:3;max-width:760px;transition:opacity .7s,transform .7s var(--ease)}',
'#aoPray435930 .aoClaudePaintingA3.view .ct,#aoPray435930 .aoClaudePaintingA3.view .sh{opacity:0;pointer-events:none}',
'#aoPray435930 .aoClaudePaintingA3.view .ct{transform:translateY(20px)}',
/* Painting-only shows the ENTIRE source artwork, including portraits and
   landscape compositions. Content overlays vanish but back/return remains. */
'#aoPray435930 .aoClaudePaintingA3.view .bg{top:max(64px,env(safe-area-inset-top));bottom:max(20px,env(safe-area-inset-bottom));height:calc(100% - max(64px,env(safe-area-inset-top)) - max(20px,env(safe-area-inset-bottom)));object-position:center}',

'#aoPray435930 .aoClaudePaintingA3 h2{font:600 clamp(28px,5vw,34px)/1.02 var(--cap);margin:8px 0 16px;letter-spacing:.5px;text-shadow:0 2px 20px rgba(0,0,0,.6);color:#eee9df}',
'#aoPray435930 .aoClaudePaintingA3 .eyb{font:600 10px var(--cap);letter-spacing:2.2px;color:var(--gold)}',
'#aoPray435930 .aoClaudePaintingA3 .tx{font:500 23px/1.45 var(--corm);max-height:min(46dvh,480px);overflow-y:auto;scrollbar-width:none;color:#eee9df;background:none!important;box-shadow:none!important;padding:0!important;margin:0!important;white-space:pre-line}',
'#aoPray435930 .aoClaudePaintingA3 .tx::-webkit-scrollbar{display:none}',
'#aoPray435930 .aoClaudePaintingA3 .cr{font:italic 13.5px var(--serif);color:var(--mu2);margin-top:14px}',
'#aoPray435930 .aoClaudePaintingA3 .hint .ha,#aoPray435930 .aoClaudePaintingA3 .hint .hb{color:var(--gold)}',
'#aoPray435930 .aoClaudePaintingA3 .rail{position:absolute;right:18px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:4}',
'#aoPray435930 .aoClaudePaintingA3 .rail button{display:grid;place-items:center;width:40px;height:40px;min-width:40px;min-height:40px;background:transparent;border:0;padding:0;cursor:pointer}',
'#aoPray435930 .aoClaudePaintingA3 .rail button::after{content:"";display:block;width:4px;height:4px;border-radius:2px;background:rgba(255,255,255,.55);transition:height .25s ease,background .25s ease}',
'#aoPray435930 .aoClaudePaintingA3 .rail button.on::after{height:22px;background:var(--gold2)}',
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
/* On phones the COMPLETE artwork has a protected upper frame. The text
   remains directly over the same cinematic canvas in a lower gradient. */
'@media(max-width:600px){#aoPray435930 .aoClaudePaintingA3 .bg{top:max(66px,env(safe-area-inset-top));bottom:clamp(210px,36dvh,340px);height:calc(100% - max(66px,env(safe-area-inset-top)) - clamp(210px,36dvh,340px));object-position:center 34%}#aoPray435930 .aoClaudePaintingA3 .ct{left:20px;right:56px;bottom:max(22px,env(safe-area-inset-bottom));max-width:none}#aoPray435930 .aoClaudePaintingA3 h2{font-size:clamp(23px,6.2vw,29px);line-height:1.06;margin:4px 0 10px}#aoPray435930 .aoClaudePaintingA3 .tx{font-size:clamp(19px,5.2vw,22px);line-height:1.36;max-height:min(28dvh,230px)}#aoPray435930 .aoClaudePaintingA3 .cr{margin-top:6px;font-size:12px}#aoPray435930 .aoClaudePaintingA3 .rail{right:2px}#aoPray435930 .aoClaudePaintingA3Card:has(.aoClaudeChoirPrayer) .ct{bottom:max(90px,calc(70px + env(safe-area-inset-bottom))) }#aoPray435930 .aoClaudePaintingA3Card:has(.aoClaudeChoirPrayer) .tx{max-height:min(24dvh,200px)}}',

'@media(max-width:359px){#aoPray435930 .aoClaudePaintingA3 .ct{left:16px;right:54px}#aoPray435930 .aoClaudePaintingA3 .bg{bottom:clamp(250px,48dvh,340px);height:calc(100% - max(66px,env(safe-area-inset-top)) - clamp(250px,48dvh,340px))}#aoPray435930 .aoClaudePaintingA3 .tx{font-size:19px;max-height:27dvh}#aoPray435930 .aoClaudePaintingA3 .aoChoirBeat{font-size:19px!important}}',
/* Contextual reading is a behaviour layer over Claude A3, not a new UI.
   Short text: original cinematic; >40% of the viewport: source-style veil. */
'#aoPray435930 .aoClaudePaintingA3 .veil{position:absolute;inset:0;z-index:2;opacity:0;pointer-events:none;background:linear-gradient(180deg,transparent 22%,rgba(4,6,9,.24) 40%,rgba(4,6,9,.78) 67%,rgba(4,6,9,.94) 100%);transition:opacity .9s ease}',
'#aoPray435930 .aoClaudePaintingA3.aoA3FitVeil.aoA3ModePray .veil{opacity:1}',
'#aoPray435930 .aoClaudePaintingA3.aoA3FitVeil.aoA3ModePray .ct{display:flex;flex-direction:column;max-height:calc(100dvh - 160px)}',
'#aoPray435930 .aoClaudePaintingA3.aoA3FitVeil.aoA3ModePray .tx{flex:0 1 auto;min-height:0;max-height:min(54dvh,500px);overflow-y:auto;overscroll-behavior:contain}',
'#aoPray435930 .aoClaudePaintingA3.aoA3FitCinematic.aoA3ModePray .tx{max-height:min(40dvh,390px)}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3VeilToggle{display:none}',
'#aoPray435930 .aoClaudePaintingA3.aoA3FitVeil.aoA3ModePray .aoA3VeilToggle{display:block;align-self:flex-start;min-height:30px;min-width:30px;text-align:left;background:none;border:0;color:var(--gold2);font:17px var(--serif);margin:-5px 0 1px;cursor:pointer}',
'#aoPray435930 .aoClaudePaintingA3.aoA3VeilClosed.aoA3FitVeil .tx,#aoPray435930 .aoClaudePaintingA3.aoA3VeilClosed.aoA3FitVeil .cr,#aoPray435930 .aoClaudePaintingA3.aoA3VeilClosed.aoA3FitVeil .aoA3Source{display:none!important}',
'#aoPray435930 .aoClaudePaintingA3.aoA3VeilClosed.aoA3FitVeil .veil{opacity:0}',
'#aoPray435930 .aoClaudePaintingA3.aoA3FitVeil.aoA3VeilClosed .ct{bottom:46px}',
/* Mode is a small text control anchored at top: no new cards and no glass. */
'#aoPray435930 .aoClaudePaintingA3 .aoA3ExperienceModes{position:absolute;top:max(62px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:39;display:flex;align-items:center;gap:12px;white-space:nowrap}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3ExperienceModes button{font:600 9px var(--cap);letter-spacing:1.1px;padding:8px 0 5px;border:0;border-bottom:1px solid transparent;background:none;color:rgba(238,233,223,.65);text-shadow:0 2px 9px #000;cursor:pointer}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3ExperienceModes button[aria-pressed=true]{color:var(--gold2);border-bottom-color:var(--gold2)}',
'#aoPray435930 .aoClaudePaintingA3.view .aoA3ExperienceModes{opacity:0;pointer-events:none}',
/* Contemplative text, using the source's large centered Verse treatment. */
'#aoPray435930 .aoClaudePaintingA3 .aoA3FocusBody{display:none}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3FocusVerse[hidden]{display:none!important}',
'#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .aoA3FocusBody{display:block;text-align:center}',
'#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .ct{bottom:clamp(45px,11dvh,125px);left:28px;right:28px;max-width:720px;text-align:center}',
'#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .eyb{display:none}',
'#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus h2{font-size:clamp(18px,5.3vw,23px);margin:0 0 20px;letter-spacing:1px}',
'#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .tx,#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .aoA3VeilToggle,#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .aoA3Source{display:none!important}',
'#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .veil{opacity:0!important}',
'#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .sh{background:linear-gradient(180deg,rgba(4,6,9,.22) 0%,transparent 24%,transparent 36%,rgba(4,6,9,.18) 50%,rgba(4,6,9,.43) 64%,rgba(4,6,9,.68) 80%,rgba(4,6,9,.84) 100%)}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3FocusTranslate{font:600 9px var(--cap);letter-spacing:1.5px;color:var(--gold2);background:none;border:0;min-height:35px;padding:5px 10px;cursor:pointer}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3FocusStage{display:flex;align-items:center;justify-content:center;width:100%;min-height:clamp(140px,22dvh,210px);padding:12px 2px;color:#eee9df;background:none;border:0;text-align:center;cursor:pointer}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3FocusVerse{display:block;font:500 clamp(26px,7vw,32px)/1.32 var(--corm);text-shadow:0 2px 17px rgba(0,0,0,.96),0 0 4px rgba(0,0,0,.8);animation:aoA3VerseFade .8s var(--ease)}',
'@keyframes aoA3VerseFade{from{opacity:0;filter:blur(5px);transform:translateY(8px)}to{opacity:1;filter:none;transform:none}}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3FocusProgress{font:11px var(--cap);letter-spacing:2px;color:var(--gold2);margin:4px 0}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3FocusHint{font:600 9px var(--cap);letter-spacing:1.5px;color:var(--gold2);margin-top:8px}',
'#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .cr{margin-top:14px}',
'#aoPray435930 .aoClaudePaintingA3 .aoA3ViewToggle{backdrop-filter:none;background:#0b1017}',
/* Keep the original 320–390px text widths, but give the veil room to scroll. */
'@media(max-width:600px){#aoPray435930 .aoClaudePaintingA3.aoA3FitVeil.aoA3ModePray .ct{max-height:calc(100dvh - 132px)}#aoPray435930 .aoClaudePaintingA3.aoA3FitVeil.aoA3ModePray .tx{max-height:51dvh}#aoPray435930 .aoClaudePaintingA3.aoA3ModeFocus .ct{left:22px;right:22px;bottom:clamp(54px,11dvh,110px)}#aoPray435930 .aoClaudePaintingA3 .aoA3ExperienceModes{gap:9px;top:max(61px,env(safe-area-inset-top))}}',
'@media(prefers-reduced-motion:reduce){#aoPray435930 .aoClaudePaintingA3 .aoA3FocusVerse{animation:none!important}#aoPray435930 .aoClaudePaintingA3 .veil{transition:none!important}}',
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
