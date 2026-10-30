// H4's Change sheet presents the authoritative R17 preflight selections.
// No local preference state, fabricated alternate Proper, or duplicate reader.
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const sheets=new WeakMap();
const CHOICES=Object.freeze({
  form:[["LOW","Low Mass","Messe basse"],["MISSA_CANTATA_SIMPLE","Sung · no incense","Chantée · sans encens"],
    ["MISSA_CANTATA_INCENSE","Sung · incense","Chantée · avec encens"],["SOLEMN","Solemn Mass","Messe solennelle"]],
  readerMode:[["LIVE","LIVE","LIVE"],["MISSAL","Missal","Missel"]],
  readerLanguage:[["en","English","Anglais"],["fr","French","Français"]],
  beforeMass:[["none","None","Aucune"],["prepare","Brief","Brève"],["full","Full","Complète"]],
  afterMass:[["none","None","Aucune"],["thanksgiving","Brief","Brève"],["full","Full","Complète"]],
});
export function h4ChoicesMarkup(status,{language="en"}={}){
  const fr=language==="fr",say=(en,frText)=>fr?frText:en;
  const experience=status?.experience??{};
  const values={form:status?.chosenForm,readerMode:status?.readerMode,
    readerLanguage:experience.language,beforeMass:experience.before,afterMass:experience.after};
  const row=(key,title)=>{
    const disabled=key==="form"&&status?.formChangeAllowed===false;
    return '<label class="aoH4ChoiceRow"><span>'+esc(title)+'</span><select data-h4-option="'+key+'"'+(disabled?' disabled':'')+'>'+
      CHOICES[key].map(([v,en,frText])=>'<option value="'+esc(v)+'"'+(values[key]===v?' selected':'')+'>'+
        esc(fr?frText:en)+'</option>').join("")+'</select></label>';
  };
  return '<div class="aoH4SheetTop"><h2 id="ao-h4-choices-title">'+esc(say("Your Mass","Votre messe"))+'</h2>'+
    '<button type="button" data-h4-sheet-close aria-label="'+esc(say("Close","Fermer"))+'">×</button></div>'+
    '<div class="aoH4SheetBody"><p class="aoH4SheetContext">'+esc(say(
      "The liturgical celebration and Proper remain controlled by the 1962 Calendar.",
      "La célébration et son propre restent régis par le calendrier de 1962."))+'</p>'+
    '<button type="button" class="aoH4DifferentMass" data-h4-different-mass>'+esc(say(
      "A different Mass is celebrated…","Une autre messe est célébrée…"))+' ›</button>'+
    row("form",say("Ceremony","Forme de célébration"))+
    row("readerMode",say("Follow the Mass","Suivre la messe"))+
    row("readerLanguage",say("Translation language","Langue de traduction"))+
    row("beforeMass",say("Before Mass prayers","Prières avant la messe"))+
    row("afterMass",say("After Mass thanksgiving","Action de grâces après la messe"))+
    '<p class="aoH4SheetError" role="alert" data-h4-choice-error hidden></p>'+
    '<p class="aoH4SheetContext">'+esc(say(
      "These choices apply to this Mass. Set your usual defaults in Settings.",
      "Ces choix s’appliquent à cette messe. Réglez vos préférences habituelles dans Réglages."))+'</p>'+
    '<button type="button" class="aoH4Usual" data-h4-usual-settings>'+esc(say(
      "Usual Mass preferences","Préférences habituelles pour la messe"))+'</button></div>'+
    '<div class="aoH4SheetBottom"><button type="button" data-h4-sheet-close>'+esc(say("Done","Terminer"))+'</button></div>';
}
const STYLE=` 
.aoH4ChoiceDialog{position:fixed;inset:auto 0 0;margin:0 auto;width:min(100%,560px);max-width:560px;
 max-height:calc(100dvh - 32px);border:1px solid rgba(190,177,157,.28);border-radius:22px 22px 0 0;
 box-sizing:border-box;padding:0;overflow:auto;background:var(--ao-bg-canvas,#111a1e);
 color:var(--ao-text-primary,#f1e9dc);font:14px/1.4 system-ui,sans-serif;z-index:2147483000}
.aoH4ChoiceDialog::backdrop{background:rgba(0,0,0,.7)}
.aoH4ChoiceDialog .aoH4SheetTop{position:sticky;top:0;background:inherit;display:flex;justify-content:space-between;align-items:center;
 padding:17px 20px;border-bottom:1px solid rgba(190,177,157,.16)}
.aoH4ChoiceDialog .aoH4SheetTop h2{font:500 24px/1.2 Georgia,serif;margin:0}
.aoH4ChoiceDialog .aoH4SheetTop button{min-width:44px;min-height:44px;border:0;background:transparent;color:inherit;font-size:26px}
.aoH4ChoiceDialog .aoH4SheetBody{padding:8px 20px 18px}
.aoH4ChoiceDialog .aoH4SheetContext{color:var(--ao-text-muted,#ada69b);font-size:12px;line-height:1.55;margin:10px 0 18px}
.aoH4ChoiceDialog .aoH4ChoiceRow{display:flex;align-items:center;justify-content:space-between;gap:10px;
 padding:12px 0;border-bottom:1px solid rgba(190,177,157,.13)}
.aoH4ChoiceDialog .aoH4ChoiceRow>span{flex:1;font-size:13px}
.aoH4ChoiceDialog select{min-width:142px;max-width:63%;min-height:44px;background:var(--ao-surface-1,#19242b);
 color:inherit;border:1px solid rgba(190,177,157,.3);border-radius:9px;padding:9px 8px;font:inherit}
.aoH4ChoiceDialog select:disabled{opacity:.5}
.aoH4ChoiceDialog .aoH4DifferentMass,.aoH4ChoiceDialog .aoH4Usual{display:block;width:100%;min-height:44px;
 text-align:left;padding:9px 0;color:var(--ao-liturgical,#c9ad78);background:transparent;border:0;font:inherit}
.aoH4ChoiceDialog .aoH4SheetError{color:#ecad93}
.aoH4ChoiceDialog .aoH4SheetBottom{position:sticky;bottom:0;padding:12px 20px;
 border-top:1px solid rgba(190,177,157,.16);background:inherit}
.aoH4ChoiceDialog .aoH4SheetBottom button{width:100%;min-height:48px;background:#89b49b;color:#102019;
 border:0;border-radius:12px;font:600 15px system-ui,sans-serif}
@media(max-width:359px){.aoH4ChoiceDialog .aoH4SheetBody{padding-left:12px;padding-right:12px}
 .aoH4ChoiceDialog select{min-width:122px;font-size:12px}}
`;
export function closeH4ChoicesSheet(win=globalThis){
  const doc=win?.document,dialog=doc&&sheets.get(doc);
  if(!dialog)return false;
  if(dialog.open&&typeof dialog.close==="function")dialog.close();
  dialog.remove();sheets.delete(doc);return true;
}
export function openH4ChoicesSheet(win=globalThis,{onOtherMass=()=>{},onDone=()=>{}}={}){
  const doc=win?.document,api=win?.AO_R17_BROWSER_ENTRY;
  if(!doc?.createElement||!doc?.body||!api?.installed||typeof api.selectTodayOption!=="function")return false;
  const current=api.status?.()?.fullMassPreflight;
  if(!current)return false;
  closeH4ChoicesSheet(win);
  const language=doc.querySelector(".homeScreen.aoTodayH4")?.dataset?.homeLanguage==="fr"?"fr":"en";
  const dialog=doc.createElement("dialog");
  dialog.className="aoH4ChoiceDialog";dialog.setAttribute("aria-labelledby","ao-h4-choices-title");
  dialog.innerHTML='<style>'+STYLE+'</style>'+h4ChoicesMarkup(current,{language});
  doc.body.append(dialog);sheets.set(doc,dialog);
  const done=()=>{closeH4ChoicesSheet(win);onDone?.();};
  dialog.addEventListener("close",()=>{if(sheets.get(doc)===dialog){sheets.delete(doc);dialog.remove();onDone?.();}});
  dialog.addEventListener("click",event=>{
    if(event.target===dialog){done();return;}
    if(event.target?.closest?.("[data-h4-sheet-close]")){done();return;}
    if(event.target?.closest?.("[data-h4-different-mass]")){closeH4ChoicesSheet(win);onOtherMass?.();return;}
    if(event.target?.closest?.("[data-h4-usual-settings]")){
      closeH4ChoicesSheet(win);onDone?.();
      win?.AO_SETTINGS_APP_V1?.open?.("/settings/mass");return;
    }
  });
  dialog.addEventListener("change",event=>{
    const key=event.target?.dataset?.h4Option;
    if(!Object.hasOwn(CHOICES,key))return;
    const value=event.target.value;
    const ok=CHOICES[key].some(option=>option[0]===value)&&api.selectTodayOption(key,value)===true;
    const error=dialog.querySelector("[data-h4-choice-error]");
    if(!ok){if(error){error.hidden=false;error.textContent=language==="fr"?"Ce choix n’a pas été accepté par la préparation de la messe.":"The Mass preflight did not accept this choice.";}return;}
    if(error)error.hidden=true;
  });
  if(typeof dialog.showModal==="function")dialog.showModal();
  else dialog.setAttribute("open","");
  dialog.querySelector("[data-h4-option]")?.focus?.();
  return true;
}
