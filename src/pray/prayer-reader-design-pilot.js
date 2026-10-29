/**
 * Opt-in Prayer F01/F03 presentation. The existing Prayer Corpus remains the
 * sole text owner. Historical forms and private/public litanies do not merge.
 */
export const PRAYER_READER_PILOT_SCHEMA="ao-prayer-reader-pilot-v1";
export const LORETO_SOURCE_IDS=Object.freeze(["litany_loreto_1962","litany_loreto_current"]);
export function readerPilotEnabled(win){try{return new URLSearchParams(win.location.search).get("aoPrayerReadersPilot")==="1"}catch{return false}}
export function splitLoretoSource(text){
 return String(text??"").split("\n").map(raw=>{
  if(raw.trim()==="")return Object.freeze({kind:"gap",raw});
  const i=raw.indexOf(" — ");
  return i>0&&i+3<raw.length
   ?Object.freeze({kind:"pair",raw,leader:raw.slice(0,i),response:raw.slice(i+3)})
   :Object.freeze({kind:"full",raw});
 });
}
export function pilotLoretoRows(text,{esc,group=false,L=(en)=>en}={}){
 return splitLoretoSource(text).map(item=>{
  if(item.kind==="gap")return '<div class="aoReaderPilotLitanyGap" aria-hidden="true"></div>';
  if(item.kind==="full")return '<p class="aoReaderPilotLitanyFull">'+esc(item.raw)+'</p>';
  return '<div class="aoReaderPilotLitanyPair"><div class="aoReaderPilotInvocation">'+
   (group?'<small>'+esc(L("Leader","Guide"))+'</small>':"")+
   '<span>'+esc(item.leader)+'</span> <span class="aoReaderPilotDash">—</span></div>'+
   '<div class="aoReaderPilotResponse">'+(group?'<small>'+esc(L("All","Tous"))+'</small>':"")+
   '<strong>'+esc(item.response)+'</strong></div></div>';
 }).join("");
}
export function renderPilotLoreto({record,id,language,group,head,L,esc,sourceLine,libraryContextMarkup,backIcon=""}){
 const title=L(record.title,record.titleFr||record.title);
 const modes=LORETO_SOURCE_IDS.map(key=>{
  const active=id===key;
  const label=key==="litany_loreto_1962"?L("1962-era form","Forme de 1962"):L("Current form","Forme actuelle");
  return '<button type="button" data-p435930-pilot-loreto-form="'+key+'" aria-pressed="'+active+'">'+esc(label)+'</button>';
 }).join("");
 const langs=["en","fr","la"].filter(k=>!!record[k]).map(key=>
  '<button type="button" data-p435930-pilot-loreto-language="'+key+'" aria-pressed="'+(language===key)+'" lang="'+key+'">'+key.toUpperCase()+'</button>'
 ).join("");
 return head(title,L("Litany · private recitation","Litanies · récitation privée"))+
  '<main class="aoP435930Body aoP435930LibraryReader aoReaderPilotLitany" data-ao-reader-design-pilot="litany">'+
  '<button type="button" class="aoP435930InlineBack" data-p435930-lib-back>'+backIcon+esc(L("Prayer Library","Livre de prières"))+'</button>'+
  '<div class="aoReaderPilotModes" role="group" aria-label="'+esc(L("Historical form","Forme historique"))+'">'+modes+'</div>'+
  '<div class="aoReaderPilotOptions"><div class="aoReaderPilotLanguages" role="group" aria-label="'+esc(L("Prayer text language","Langue du texte"))+'">'+langs+'</div>'+
  '<div class="aoReaderPilotGroupModes" role="group" aria-label="'+esc(L("Recitation","Récitation"))+'">'+
   '<button type="button" data-p435930-pilot-loreto-group="individual" aria-pressed="'+!group+'">'+esc(L("Individual","Individuel"))+'</button>'+
   '<button type="button" data-p435930-pilot-loreto-group="group" aria-pressed="'+!!group+'">'+esc(L("Group","Groupe"))+'</button></div></div>'+
  '<section class="aoDevoCard" data-ao-devo-card="'+esc(id)+'"><div class="aoDevoCardScroll" role="region" aria-label="'+esc(title)+'" lang="'+esc(language)+'">'+
  '<div class="aoReaderPilotLitanyContent'+(group?' aoReaderPilotCommunal':'')+'">'+
  '<div class="aoReaderPilotRailHead" aria-hidden="true"><span>'+esc(group?L("Leader","Guide"):L("Invocation","Invocation"))+'</span><span>'+esc(group?L("All","Tous"):L("Response","Réponse"))+'</span></div>'+
  pilotLoretoRows(record[language],{esc,group,L})+'</div>'+sourceLine(record)+'</div></section>'+
  libraryContextMarkup(record)+
  '<p class="aoReaderPilotSourceNote">'+esc(L("Invocations and responses come from the selected canonical record; editions remain separate.","Les invocations et répons viennent de la source canonique choisie ; les éditions restent séparées."))+'</p></main>';
}
export function pilotFocusButton({L,esc}){return '<div class="aoReaderPilotFocusTools"><button type="button" data-p435930-pilot-focus aria-pressed="false">'+esc(L("Reading focus","Lecture concentrée"))+'</button></div>'}
export function installReaderPilotStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-reader-design-pilot-css"))return;
 const style=doc.createElement("style");style.id="ao-reader-design-pilot-css";style.textContent=READER_PILOT_CSS;doc.head.appendChild(style);
}
const READER_PILOT_CSS="#aoPray435930 .aoReaderPilotSingle{gap:13px!important}\n#aoPray435930 .aoReaderPilotSingle .aoP435930InlineBack{min-height:44px}\n#aoPray435930 .aoReaderPilotFocusTools{display:flex;justify-content:flex-end}\n#aoPray435930 .aoReaderPilotFocusTools button{min-height:44px;padding:9px 14px;background:var(--surface-1,#1c242d);color:var(--text,#f4e9dc);border:1px solid var(--border,rgba(255,255,255,.2));border-radius:999px;font:600 12px/1.3 system-ui,sans-serif;cursor:pointer}\n#aoPray435930 .aoReaderPilotSingle .aoP435930Prayer{max-width:670px;margin:0 auto}\n#aoPray435930 .aoReaderPilotSingle .aoP435930Flip,#aoPray435930 .aoReaderPilotSingle .aoP435930Text{font-size:clamp(19px,5vw,23px)!important;line-height:1.64!important;letter-spacing:.005em}\n#aoPray435930 .aoReaderPilotSingle .aoDevoCardScroll{padding:18px clamp(13px,4vw,24px)!important}\n#aoPray435930 .aoReaderPilotSingle.aoReaderPilotFocus .aoP435930PrayerHead,#aoPray435930 .aoReaderPilotSingle.aoReaderPilotFocus .aoP435930Meta,#aoPray435930 .aoReaderPilotSingle.aoReaderPilotFocus .aoP435930GuideInfo,#aoPray435930 .aoReaderPilotSingle.aoReaderPilotFocus .aoP435930ScriptureOrigin{display:none!important}\n#aoPray435930 .aoReaderPilotSingle.aoReaderPilotFocus .aoDevoCardScroll{padding-top:25px!important}\n#aoPray435930 .aoReaderPilotFocusTools button[aria-pressed=\"true\"]{border-color:var(--liturgical,#ba9b6d)}\n#aoPray435930 .aoReaderPilotLitany{gap:12px!important}\n#aoPray435930 .aoReaderPilotModes{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:4px;background:var(--surface-1,#19222b);border-radius:13px}\n#aoPray435930 .aoReaderPilotModes button{min-height:48px;padding:8px;border:0;border-radius:10px;background:transparent;color:var(--muted,#aaa);font:600 13px/1.28 system-ui,sans-serif;cursor:pointer}\n#aoPray435930 .aoReaderPilotModes button[aria-pressed=\"true\"]{background:var(--surface-2,#313b46);color:var(--text,#fff)}\n#aoPray435930 .aoReaderPilotOptions{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:center}\n#aoPray435930 .aoReaderPilotLanguages{display:flex;gap:5px}\n#aoPray435930 .aoReaderPilotGroupModes{display:flex;flex-wrap:wrap;gap:5px}\n#aoPray435930 .aoReaderPilotLanguages button,#aoPray435930 .aoReaderPilotGroupModes button{min-height:44px;min-width:44px;padding:8px 12px;border-radius:20px;border:1px solid var(--border,rgba(255,255,255,.18));background:var(--surface-1,#1b252e);color:var(--text,#eee);font:600 12px/1.2 system-ui,sans-serif;cursor:pointer}\n#aoPray435930 .aoReaderPilotLanguages button[aria-pressed=\"true\"],#aoPray435930 .aoReaderPilotGroupModes button[aria-pressed=\"true\"]{border-color:var(--liturgical,#ba9b6d);color:var(--text,#fff)}\n#aoPray435930 .aoReaderPilotLitany .aoDevoCardScroll{padding:15px 13px 23px!important}\n#aoPray435930 .aoReaderPilotLitanyContent{max-width:670px;margin:0 auto}\n#aoPray435930 .aoReaderPilotLitanyPair{display:grid;grid-template-columns:minmax(0,1.63fr) minmax(0,1fr);gap:8px;align-items:baseline;padding:11px 2px;border-bottom:1px solid var(--border,rgba(255,255,255,.12))}\n#aoPray435930 .aoReaderPilotInvocation,#aoPray435930 .aoReaderPilotResponse{min-width:0;font:400 clamp(16px,4.5vw,20px)/1.42 var(--ao-font-liturgical,Georgia,serif);overflow-wrap:anywhere}\n#aoPray435930 .aoReaderPilotInvocation{color:var(--text,#f4e9dc)}\n#aoPray435930 .aoReaderPilotResponse{border-left:1px solid var(--border,rgba(255,255,255,.18));padding-left:9px}\n#aoPray435930 .aoReaderPilotRailHead{display:grid;grid-template-columns:minmax(0,1.63fr) minmax(0,1fr);gap:8px;position:sticky;top:0;z-index:3;padding:11px 2px 9px;background:var(--surface-1,#1b252e);border-bottom:1px solid var(--liturgical,#cbb28b);color:var(--liturgical,#cbb28b);font:700 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;text-transform:uppercase}\n#aoPray435930 .aoReaderPilotRailHead>span:last-child{border-left:1px solid var(--border,rgba(255,255,255,.18));padding-left:9px}\n#aoPray435930 .aoReaderPilotDash{color:var(--muted,#aaa)}\n#aoPray435930 .aoReaderPilotResponse strong{font:inherit;color:var(--liturgical,#cbb28b);font-style:italic;font-weight:400}\n#aoPray435930 .aoReaderPilotCommunal .aoReaderPilotResponse strong{font-style:normal;font-weight:600}\n#aoPray435930 .aoReaderPilotLitanyPair small{display:block;font:600 10px/1.4 system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--muted,#aaa);margin-bottom:3px}\n#aoPray435930 .aoReaderPilotLitanyFull{font:400 clamp(17px,4.6vw,21px)/1.58 var(--ao-font-liturgical,Georgia,serif);margin:10px 2px;color:var(--text,#eee)}\n#aoPray435930 .aoReaderPilotLitanyGap{height:12px}\n#aoPray435930 .aoReaderPilotSourceNote{font-size:11px;line-height:1.45;color:var(--muted,#aaa);margin:0}\n@media(max-width:359px){#aoPray435930 .aoReaderPilotLitanyPair,#aoPray435930 .aoReaderPilotRailHead{grid-template-columns:minmax(0,1.38fr) minmax(0,1fr);gap:7px}#aoPray435930 .aoReaderPilotInvocation,#aoPray435930 .aoReaderPilotResponse{font-size:16px}#aoPray435930 .aoReaderPilotLanguages button,#aoPray435930 .aoReaderPilotGroupModes button{padding:7px 10px}}";
installReaderPilotStyles();
