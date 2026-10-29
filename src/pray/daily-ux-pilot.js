/** Opt-in F05 reader comparison. Existing source, card and personal-rule engines own all texts. */
export const DAILY_UX_PILOT_SCHEMA="ao-daily-ux-pilot-v1";
export function dailyUxPilotEnabled(search){
 try{return new URLSearchParams(String(search||"").replace(/^\?/,"")).get("aoDailyUxPilot")==="1"}
 catch{return false}
}
export function renderDailyUxModes({mode,L,esc}){
 const options=[["guided",L("Cards","Cartes")],["continuous",L("Continuous","Continu")],["list",L("Browse","Choisir")]];
 return '<nav class="aoDailyUxModes" role="group" aria-label="'+esc(L("Daily reading presentation","Présentation de la règle quotidienne"))+'">'+
  options.map(([id,title])=>'<button type="button" data-tp381-daily-presentation="'+id+'" aria-pressed="'+String(mode===id)+'">'+esc(title)+'</button>').join("")+
  '</nav>';
}
export function renderDailyUxContinuous({rows,renderRow,titleFor,esc,L}){
 if(!Array.isArray(rows)||!rows.length)throw new RangeError("Source-owned daily rows required");
 const titles=rows.map(titleFor);
 const choices=titles.map((title,i)=>
  '<button type="button" data-tp381-flow-jump="'+i+'" aria-controls="aoDailyPilotStep-'+i+'"><span>'+String(i+1).padStart(2,"0")+'</span>'+esc(title)+'</button>').join("");
 const cards=rows.map((row,i)=>
  '<section class="aoDailyUxStage" id="aoDailyPilotStep-'+i+'" tabindex="-1" data-ao-daily-source-id="'+esc(row.id)+'" data-ao-daily-position="'+i+'">'+
   '<small>'+esc(L("Prayer","Prière")+' '+(i+1)+' / '+rows.length)+'</small>'+
   '<h2>'+esc(titles[i])+'</h2>'+
   renderRow(row)+
  '</section>').join("");
 return '<div class="aoDailyUxContinuous" data-ao-daily-ux-mode="continuous" data-ao-daily-ux-count="'+rows.length+'">'+
  '<details class="aoDailyUxJump"><summary>'+esc(L("Jump to a prayer","Aller à une prière"))+'</summary><nav class="aoDailyUxJumpOptions" aria-label="'+esc(L("Prayer positions","Positions dans les prières"))+'">'+choices+'</nav></details>'+
  '<p class="aoDailyUxNoProgress">'+esc(L("Navigation shows your position, not which prayers you have completed.","La navigation indique votre position, non les prières accomplies."))+'</p>'+
  cards+'</div>';
}
const DAILY_UX_PILOT_CSS="#aoPray435930 .aoDailyUxModes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;max-width:610px;margin:7px auto 8px;width:100%;padding:4px;background:var(--surface-1,#17202b);border-radius:14px}\n#aoPray435930 .aoDailyUxModes button{border:0;border-radius:10px;min-width:0;min-height:44px;padding:8px 4px;background:transparent;color:var(--muted,#b7b2ad);font:600 clamp(11px,3.1vw,13px)/1.25 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}\n#aoPray435930 .aoDailyUxModes button[aria-pressed=\"true\"]{background:var(--surface-2,#303845);color:var(--text,#f3ead7);box-shadow:0 1px 5px rgba(0,0,0,.22)}\n#aoPray435930 .aoDailyUxContinuous{display:flex;flex-direction:column;gap:12px;max-width:690px;width:100%;margin-inline:auto}\n#aoPray435930 .aoDailyUxJump{border:1px solid var(--border,rgba(240,228,212,.18));border-radius:15px;padding:11px 12px}\n#aoPray435930 .aoDailyUxJump summary{cursor:pointer;min-height:38px;font:600 13px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:var(--text,#f3ead7)}\n#aoPray435930 .aoDailyUxJumpOptions{display:grid;gap:3px;grid-template-columns:1fr;padding-top:8px}\n#aoPray435930 .aoDailyUxJumpOptions button{min-height:44px;border:0;background:transparent;color:var(--text,#f3ead7);border-bottom:1px solid var(--border,rgba(240,228,212,.1));padding:8px 4px;text-align:left;font:400 14px/1.4 var(--ao-font-ui,system-ui,sans-serif)}\n#aoPray435930 .aoDailyUxJumpOptions button span{color:var(--muted,#aea7a0);margin-right:11px;font-variant-numeric:tabular-nums}\n#aoPray435930 .aoDailyUxNoProgress{font:400 12px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#aaa);margin:0;padding:0 3px}\n#aoPray435930 .aoDailyUxStage{scroll-margin-top:91px;padding:22px clamp(12px,3.4vw,22px) 26px;border-bottom:1px solid var(--border,rgba(240,228,212,.12));outline-offset:-3px}\n#aoPray435930 .aoDailyUxStage>small{display:block;color:var(--liturgical,#cbb28b);letter-spacing:.12em;text-transform:uppercase;font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);margin-bottom:10px}\n#aoPray435930 .aoDailyUxStage>h2{font:500 clamp(24px,6.7vw,35px)/1.18 var(--ao-font-display,Georgia,serif);color:var(--text,#f3ead7);margin:0 0 18px}\n#aoPray435930 .aoDailyUxStage .aoTP381PrayerCard{background:transparent!important;box-shadow:none!important;border:0!important;padding:0!important;margin:0!important}\n#aoPray435930 .aoDailyUxStage .aoTP381PrayerCard>h3{display:none!important}\n#aoPray435930 .aoDailyUxStage .aoTP381Reader,#aoPray435930 .aoDailyUxStage .aoTP381TextParagraph,#aoPray435930 .aoDailyUxStage [data-tp381-flip]{font-size:clamp(19px,4.9vw,23px)!important;line-height:1.73!important}\n#aoPray435930 .aoDailyUxStage .aoTP381Source{font-size:12px}\n#aoPray435930 .aoDailyUxStage .aoDailyUxExam{font:400 clamp(18px,4.8vw,22px)/1.65 var(--ao-font-liturgical,Georgia,serif)}\n@media(max-width:359px){#aoPray435930 .aoDailyUxStage{padding-inline:10px}#aoPray435930 .aoDailyUxModes{margin:5px auto}#aoPray435930 .aoDailyUxJump{padding:9px 10px}}\n@media(prefers-reduced-motion:reduce){#aoPray435930 .aoDailyUxStage{scroll-behavior:auto!important}}";
export function installDailyUxPilotStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-daily-ux-pilot-style"))return;
 const style=doc.createElement("style");style.id="ao-daily-ux-pilot-style";style.textContent=DAILY_UX_PILOT_CSS;doc.head.append(style);
}
installDailyUxPilotStyles();
