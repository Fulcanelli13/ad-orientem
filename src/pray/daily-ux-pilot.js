/** Book-first daily reader by default, with explicit legacy query rollback. Existing source, card and personal-rule engines own all texts. */
export const DAILY_UX_PILOT_SCHEMA="ao-daily-ux-pilot-v1";
export function dailyUxPilotEnabled(search){
 // Default rollout; explicit ?aoDailyUxPilot=0 restores the previous reader.
 // This flag controls presentation only. It does not change prayer sources or saved editions.
 try{return new URLSearchParams(String(search||"").replace(/^\?/,"")).get("aoDailyUxPilot")!=="0"}
 catch{return true}
}
export function renderDailyUxModes({mode,L,esc}){
 const options=[["guided",L("Cards","Cartes")],["continuous",L("Continuous","Continu")],["list",L("Browse","Choisir")]];
 return '<nav class="aoDailyUxModes" role="group" aria-label="'+esc(L("Daily reading presentation","Présentation de la règle quotidienne"))+'">'+
  options.map(([id,title])=>'<button type="button" data-tp381-daily-presentation="'+id+'" aria-pressed="'+String(mode===id)+'">'+esc(title)+'</button>').join("")+
  '</nav>';
}
/**
 * Historical book families, not a list of interchangeable prayer fragments.
 * Only the two complete, existing St Pius X editions are selectable.
 * Lasance / Moran / Blessed Be God have individual verified witnesses but no
 * released complete Morning+Evening sequence; do not turn them into buttons.
 */
export const DAILY_BOOK_FAMILY_RELEASE=Object.freeze([
 Object.freeze({id:"piusx",name:"St Pius X",status:"released"}),
 Object.freeze({id:"lasance",name:"Lasance",status:"partial"}),
 Object.freeze({id:"moran",name:"Moran",status:"partial"}),
 Object.freeze({id:"blessed-be-god",name:"Blessed Be God",status:"partial"})
]);
export function renderDailyBookPills({edition,L,esc}){
 if(!["1905","1913"].includes(edition))throw new RangeError("Unknown released St Pius X source edition");
 const bookChoices=DAILY_BOOK_FAMILY_RELEASE.map(book=>{
  if(book.status==="released")return '<span class="aoDailyBookPill aoDailyBookPillActive" aria-current="true">'+esc(book.name)+'</span>';
  return '<span class="aoDailyBookPill aoDailyBookPillPending" aria-label="'+esc(book.name+" · "+L("complete routine not released","règle complète non publiée"))+'" title="'+esc(L("Individual verified prayers exist, but a complete source-defined routine is not released.","Des prières individuelles sont attestées, mais aucune règle complète n’est encore publiée."))+'">'+esc(book.name)+' <small>'+esc(L("Partial","Partiel"))+'</small></span>';
 }).join("");
 const editionChoice=(id,en,fr)=>'<button type="button" data-tp381-personal-action="edition" data-tp381-personal-value="'+id+'" aria-pressed="'+String(edition===id)+'">'+esc(L(en,fr))+'</button>';
 return '<section class="aoDailyBookSelector" aria-label="'+esc(L("Prayer-book source","Livre de prières d’origine"))+'" data-ao-daily-book-family="piusx">'+
  '<span class="aoDailyBookLabel">'+esc(L("Prayer-book version","Version du livre de prières"))+'</span>'+
  '<div class="aoDailyBookPills" role="group" aria-label="'+esc(L("Historical prayer books","Livres de prières historiques"))+'">'+bookChoices+'</div>'+
  '<div class="aoDailyBookEditions" role="group" aria-label="'+esc(L("St Pius X edition","Édition de saint Pie X"))+'">'+
   editionChoice("1913","1913 · revised","1913 · révisée")+editionChoice("1905","1905 · original","1905 · originale")+
  '</div>'+
  '<p class="aoDailyBookSourceNote">'+esc(L("Other books: individual source prayers available in Customize; complete Morning/Evening sequences are not yet released.","Autres livres : prières individuelles disponibles dans « Personnaliser » ; les règles complètes du matin et du soir ne sont pas encore publiées."))+'</p>'+
 '</section>';
}
export function renderDailyReaderOptions({mode,L,esc}){
 const label=mode==="continuous"?L("Continuous","Continu"):mode==="list"?L("Browse","Choisir"):L("Cards","Cartes");
 return '<details class="aoDailyReadingOptions"><summary>'+esc(L("Reading layout","Mode de lecture"))+' <strong>'+esc(label)+'</strong></summary>'+
  renderDailyUxModes({mode,L,esc})+'</details>';
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
const DAILY_UX_PILOT_CSS="#aoPray435930 .aoDailyUxModes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;max-width:610px;margin:7px auto 8px;width:100%;padding:4px;background:var(--surface-1,#17202b);border-radius:14px}\n#aoPray435930 .aoDailyUxModes button{border:0;border-radius:10px;min-width:0;min-height:44px;padding:8px 4px;background:transparent;color:var(--muted,#b7b2ad);font:600 clamp(11px,3.1vw,13px)/1.25 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}\n#aoPray435930 .aoDailyUxModes button[aria-pressed=\"true\"]{background:var(--surface-2,#303845);color:var(--text,#f3ead7);box-shadow:0 1px 5px rgba(0,0,0,.22)}\n#aoPray435930 .aoDailyUxContinuous{display:flex;flex-direction:column;gap:12px;max-width:690px;width:100%;margin-inline:auto}\n#aoPray435930 .aoDailyUxJump{border:1px solid var(--border,rgba(240,228,212,.18));border-radius:15px;padding:11px 12px}\n#aoPray435930 .aoDailyUxJump summary{cursor:pointer;min-height:38px;font:600 13px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:var(--text,#f3ead7)}\n#aoPray435930 .aoDailyUxJumpOptions{display:grid;gap:3px;grid-template-columns:1fr;padding-top:8px}\n#aoPray435930 .aoDailyUxJumpOptions button{min-height:44px;border:0;background:transparent;color:var(--text,#f3ead7);border-bottom:1px solid var(--border,rgba(240,228,212,.1));padding:8px 4px;text-align:left;font:400 14px/1.4 var(--ao-font-ui,system-ui,sans-serif)}\n#aoPray435930 .aoDailyUxJumpOptions button span{color:var(--muted,#aea7a0);margin-right:11px;font-variant-numeric:tabular-nums}\n#aoPray435930 .aoDailyUxNoProgress{font:400 12px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#aaa);margin:0;padding:0 3px}\n#aoPray435930 .aoDailyUxStage{scroll-margin-top:91px;padding:22px clamp(12px,3.4vw,22px) 26px;border-bottom:1px solid var(--border,rgba(240,228,212,.12));outline-offset:-3px}\n#aoPray435930 .aoDailyUxStage>small{display:block;color:var(--liturgical,#cbb28b);letter-spacing:.12em;text-transform:uppercase;font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);margin-bottom:10px}\n#aoPray435930 .aoDailyUxStage>h2{font:500 clamp(24px,6.7vw,35px)/1.18 var(--ao-font-display,Georgia,serif);color:var(--text,#f3ead7);margin:0 0 18px}\n#aoPray435930 .aoDailyUxStage .aoTP381PrayerCard{background:transparent!important;box-shadow:none!important;border:0!important;padding:0!important;margin:0!important}\n#aoPray435930 .aoDailyUxStage .aoTP381PrayerCard>h3{display:none!important}\n#aoPray435930 .aoDailyUxStage .aoTP381Reader,#aoPray435930 .aoDailyUxStage .aoTP381TextParagraph,#aoPray435930 .aoDailyUxStage [data-tp381-flip]{font-size:clamp(19px,4.9vw,23px)!important;line-height:1.73!important}\n#aoPray435930 .aoDailyUxStage .aoTP381Source{font-size:12px}\n#aoPray435930 .aoDailyUxStage .aoDailyUxExam{font:400 clamp(18px,4.8vw,22px)/1.65 var(--ao-font-liturgical,Georgia,serif)}\n@media(max-width:359px){#aoPray435930 .aoDailyUxStage{padding-inline:10px}#aoPray435930 .aoDailyUxModes{margin:5px auto}#aoPray435930 .aoDailyUxJump{padding:9px 10px}}\n@media(prefers-reduced-motion:reduce){#aoPray435930 .aoDailyUxStage{scroll-behavior:auto!important}}\n#aoPray435930 .aoDailyOpeningRail>.aoDailyBookSelector,#aoPray435930 .aoDailyOpeningRail>.aoDailyReadingOptions{grid-column:1/-1;min-width:0;width:100%}\n#aoPray435930 .aoDailyBookSelector{margin:5px auto 1px;max-width:660px;display:flex;flex-direction:column;gap:7px}\n#aoPray435930 .aoDailyBookLabel{display:block;font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;text-transform:uppercase;color:var(--muted,#aaa);padding-left:3px}\n#aoPray435930 .aoDailyBookPills{display:flex;gap:6px;overflow-x:auto;overflow-y:hidden;padding:2px 3px 7px;scrollbar-width:thin;white-space:nowrap;max-width:100%;-webkit-overflow-scrolling:touch}\n#aoPray435930 .aoDailyBookPill{display:inline-flex;flex:0 0 auto;align-items:center;gap:5px;min-height:42px;padding:9px 13px;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:999px;color:var(--text,#f3ead7);background:var(--surface-1,#1c2731);font:600 13px/1.2 var(--ao-font-ui,system-ui,sans-serif)}\n#aoPray435930 .aoDailyBookPillActive{border-color:var(--liturgical,#c7a67a);background:color-mix(in srgb,var(--liturgical,#c7a67a) 23%,var(--surface-1,#1c2731))}\n#aoPray435930 .aoDailyBookPillPending{color:var(--muted,#b0a99d);opacity:.72}\n#aoPray435930 .aoDailyBookPillPending small{font-size:10px;font-weight:500}\n#aoPray435930 .aoDailyBookEditions{display:flex;gap:5px;max-width:660px;padding-left:3px}\n#aoPray435930 .aoDailyBookEditions button{min-height:44px;min-width:0;padding:8px 15px;border-radius:999px;background:transparent;border:1px solid var(--border,rgba(255,255,255,.16));color:var(--muted,#c2b8aa);font:600 12px/1.22 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}\n#aoPray435930 .aoDailyBookEditions button[aria-pressed=\"true\"]{border-color:var(--liturgical,#c7a67a);background:var(--surface-2,#303945);color:var(--text,#fff)}\n#aoPray435930 .aoDailyBookSourceNote{font:400 11px/1.42 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b0a99d);padding:0 3px;margin:0}\n#aoPray435930 .aoDailyReadingOptions{max-width:660px;margin:2px auto 4px;border-top:1px solid var(--border,rgba(255,255,255,.12));padding:6px 0 0}\n#aoPray435930 .aoDailyReadingOptions summary{cursor:pointer;min-height:44px;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 4px;color:var(--muted,#b0a99d);font:600 12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}\n#aoPray435930 .aoDailyReadingOptions summary strong{color:var(--text,#f3ead7);font-weight:600}\n#aoPray435930 .aoDailyReadingOptions .aoDailyUxModes{margin:2px auto 8px}\n@media(max-width:359px){#aoPray435930 .aoDailyBookPill{padding:8px 11px;font-size:12px}#aoPray435930 .aoDailyBookEditions button{padding-inline:11px}#aoPray435930 .aoDailyBookSourceNote{font-size:10.5px}}";
export function installDailyUxPilotStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-daily-ux-pilot-style"))return;
 const style=doc.createElement("style");style.id="ao-daily-ux-pilot-style";style.textContent=DAILY_UX_PILOT_CSS;doc.head.append(style);
}
installDailyUxPilotStyles();
