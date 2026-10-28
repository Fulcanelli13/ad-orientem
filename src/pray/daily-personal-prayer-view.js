/**
 * Read-only rendering of personal source-bound daily prayer cards.
 * No global DOM hooks; the existing PRAY runtime retains navigation/gesture ownership.
 */
import {personalDailyOptions} from "./daily-personal-rule.js";
/** Provenance reflects the exact visible language and distinguishes the
 * printed witness from Latin readings supplied editorially by Ad Orientem. */
export function dailyPersonalProvenance(row,L=(en)=>en){
 if(row.replacementId)return L("Alternative · complete historical source-language prayer","Variante · prière historique complète dans sa langue d’origine");
 if(row.sourceStatus==="complete-optional-liturgical-selection")return L("Optional historical Office text · not the complete Office","Texte facultatif de l’Office historique · non l’office complet");
 if(row.optional)return L("Optional · complete historical source-language prayer","Facultative · prière historique complète dans sa langue d’origine");
 if(row.sourceStatus==="AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X"){
  return row.language==="la"
   ?L("Editorial Latin translation · not printed Latin of St Pius X","Traduction latine éditoriale · non tirée d’un original latin de saint Pie X")
   :L("St Pius X source · Latin version on tap is an editorial translation","Source saint Pie X · version latine accessible par toucher : traduction éditoriale");
 }
 if(row.sourceStatus?.startsWith("STANDARD_TRADITIONAL"))
  return L("Traditional Latin parallel · not attributed to the printed St Pius X edition","Parallèle latin traditionnel · non attribué à l’édition imprimée de saint Pie X");
 return L("Historical source reading · consult the edition reference","Texte issu d’une source historique · consulter la référence de l’édition");
}

/** Short, source-identifying labels; full provenance remains underneath the text.
 * Never infer an author from a missing witness label. */
export function dailyFormulationLabel(sourceLabel){
 const label=String(sourceLabel||"");
 const name=/Lasance/i.test(label)?"Lasance":/Moran/i.test(label)?"Moran":
  /Pocket Prayer Book/i.test(label)?"Pocket Prayer Book":
  /Exercices de la vie chrétienne/i.test(label)?"Exercices":
  label.split(",")[0].trim()||"Historical source";
 const year=label.match(/\b(1[0-9]{3}|20[0-9]{2})\b/)?.[0];
 return name+(year?" · "+year:"");
}
export function personalDailyPrayerCard(row,plan,{esc,L,prayerParagraphs,source}){
 const note=dailyPersonalProvenance(row,L);
 const scopeNote=row.replacementScope==="narrower"?
  '<small class="aoDailyFormulationCoverageNote">'+esc(L(
   "This is a complete historical prayer with a narrower focus than the St Pius X opening. It replaces that whole stage, not just one sentence. Return to St Pius X for the combined original.",
   "Cette prière historique intégrale a un objet plus restreint que la prière d’ouverture de saint Pie X. Elle remplace toute cette étape, et non une seule phrase. Revenez à saint Pie X pour retrouver la prière originale complète."
  ))+'</small>':"";
 const context=row.sourceContextEn||row.sourceContextFr?'<small class="aoDailyPersonalContext">'+esc(L(row.sourceContextEn||"",row.sourceContextFr||""))+'</small>':"";
 const body=row.text?prayerParagraphs(row.text):
 '<p class="aoTP381TextParagraph">'+esc(L("Exact text unavailable in the selected language; nothing substituted.","Texte exact indisponible dans cette langue ; aucune substitution."))+'</p>';
 const twoFaces=Boolean(row.text&&row.latinText&&row.language!=="la"&&row.text!==row.latinText);
 const prayerBody=twoFaces?'<button type="button" data-tp381-flip aria-label="'+esc(L("Switch prayer language","Changer la langue de la prière"))+'"><span data-face-v>'+body+'</span><span data-face-la hidden>'+prayerParagraphs(row.latinText)+'</span></button>':'<div class="aoTP381Reader">'+body+'</div>';
 const matches=plan.direct?[]:plan.availableVariants.filter(x=>x.slot===row.sourceId);
 const controls=matches.length?'<div class="aoDailyFormulationPicker" role="group" aria-label="'+esc(L("Prayer formulation","Formulation de la prière"))+'">'+
  '<span class="aoDailyFormulationLabel">'+esc(L("Prayer text","Texte de prière"))+'</span>'+
  '<div class="aoDailyFormulationChoices">'+
   '<button type="button" data-tp381-personal-variant="default:'+esc(row.sourceId)+'" aria-pressed="'+String(!row.replacementId)+'">'+esc(L("St Pius X","Saint Pie X"))+'</button>'+
   matches.map(x=>'<button type="button" data-tp381-personal-variant="'+esc(x.id)+'" aria-pressed="'+String(row.replacementId===x.id)+'" title="'+esc(x.sourceLabel+(x.replacementScope==="narrower"?" · narrower focus than original":""))+'">'+esc(x.choiceLabel||dailyFormulationLabel(x.sourceLabel))+'</button>').join("")+
  '</div></div>':"";
 return '<article class="aoTP381PrayerCard" data-ao-personal-prayer="'+esc(row.sourceId)+'" data-ao-personal-source="'+esc(row.replacementId||row.sourceId)+'">'+
 '<h3>'+esc(row.title)+'</h3>'+controls+scopeNote+'<small class="aoDailyPersonalProvenance">'+esc(note)+'</small>'+
 prayerBody+context+source(row.sourceLabel,row.sourceUrl)+'</article>';
}
export function dailyPersonalList(rows,{esc,L,isFr}){
 return '<div class="aoTP381PrayerList" data-ao-personal-list>'+rows.map((r,i)=>
 '<button type="button" data-tp381-daily-card-index="'+i+'"><span><b>'+
 esc(isFr?(r.titleFr||r.title||r.titleEn||r.sourceId):(r.title||r.titleEn||r.sourceId))+
 '</b><small>'+esc(r.sourceLabel||L("Reflection","Méditation"))+'</small></span><i aria-hidden="true">→</i></button>'
 ).join("")+'</div>';
}
/** Accessible direct prayer index, separate from routine customization. */
export function dailyPersonalPrayerCatalog(plan,optional,{esc,L}){
 const entry=(id,title,meta)=>'<button type="button" data-tp381-direct-prayer="'+esc(id)+'"><span><b>'+esc(title)+'</b>'+
  (meta?'<small>'+esc(meta)+'</small>':'')+'</span><i aria-hidden="true">›</i></button>';
 const primary=plan.rows.map(row=>entry(row.sourceId,row.title||row.titleEn||row.sourceId,
   row.kind==="personal-examen"?L("Guided reflection","Examen guidé"):"")).join("");
 const additional=optional.map(row=>entry(row.id,row.title,row.sourceLabel)).join("");
 return '<section class="aoDailyPrayerCatalog" data-ao-daily-prayer-catalog aria-label="'+esc(L("Choose a prayer","Choisir une prière"))+'">'+
  '<p class="aoDailyCatalogIntro">'+esc(L("Open any complete prayer directly. This does not change your Morning or Evening routine.",
   "Ouvrez directement une prière intégrale, sans modifier votre règle du matin ou du soir."))+'</p>'+
  '<h2>'+esc(L("St Pius X · "+plan.edition,"Saint Pie X · "+plan.edition))+'</h2>'+
  '<div class="aoTP381PrayerList aoDailyCatalogRows">'+primary+'</div>'+
  (additional?'<details class="aoDailyCatalogAdditional"><summary>'+esc(L("Other traditional prayers","Autres prières traditionnelles"))+
   ' <small>'+optional.length+'</small></summary><div class="aoTP381PrayerList aoDailyCatalogRows">'+additional+'</div></details>':"")+
 '</section>';
}
export function dailyPersonalSettings(plan,prefs,{esc,L,expanded=false}){
 const part=plan.daypart;
 const choice=(action,id,en,fr,on)=>
 '<button type="button" data-tp381-personal-action="'+action+'" data-tp381-personal-value="'+esc(id)+'" aria-pressed="'+String(on)+'">'+esc(L(en,fr))+'</button>';
 const group=(title,content)=>'<section class="aoDailyPersonalGroup"><strong>'+esc(title)+'</strong><div class="aoDailyPersonalButtons">'+content+'</div></section>';
 const ed=group(L("St Pius X source edition","Édition de saint Pie X"),
  choice("edition","1913","Revised 1913","Révision de 1913",prefs.edition==="1913")+
  choice("edition","1905","Original 1905","Original de 1905",prefs.edition==="1905"));
 const lang=group(L("Prayer language","Langue de prière"),
  choice("language","la","Latin","Latin",prefs.language==="la")+
  choice("language","en","English","Anglais",prefs.language==="en")+
  choice("language","fr","French","Français",prefs.language==="fr"));
 const length=group(L("Length of my daily prayer","Durée de ma prière quotidienne"),
  choice("length","full","Complete edition","Édition intégrale",prefs.length!=="brief")+
  choice("length","brief","Personal Brief","Règle personnelle brève",prefs.length==="brief"));
 const briefSelected=new Set(plan.briefIds);
 const briefChoices='<div class="aoDailyPersonalBriefList" role="group" aria-label="'+esc(L("Choose complete prayers for my Brief rule","Choisir les prières intégrales de ma règle brève"))+'">'+
 plan.briefCandidates.map(row=>{
  const chosen=briefSelected.has(row.id);
  // Brief must always be a nonempty subset, shorter than the full edition.
  const locked=chosen&&briefSelected.size===1||!chosen&&briefSelected.size===plan.briefCandidates.length-1;
  const description=row.kind==="guided"?L("Guided examination · not a spoken printed prayer","Examen guidé · non une prière imprimée à réciter"):
   L("Complete prayer · original edition order","Prière intégrale · ordre de l’édition respecté");
  return '<div class="aoDailyPersonalBriefOption"><button type="button" data-tp381-personal-action="brief-toggle" data-tp381-personal-value="'+esc(row.id)+
   '" aria-pressed="'+String(chosen)+'" '+(locked?'disabled ':'')+'><span class="aoDailyPersonalBriefMark" aria-hidden="true">'+(chosen?'✓':'+')+'</span>'+
   '<span class="aoDailyPersonalBriefText"><strong>'+esc(row.title)+'</strong><small>'+esc(description)+'</small></span></button></div>';
 }).join("")+'</div>';
 const briefEditor=group(L("Choose my Brief prayers","Choisir mes prières brèves"),
  '<p class="aoDailyPersonalNote">'+esc(L(
   "Editing "+(part==="morning"?"Morning":"Evening")+" · "+plan.edition+" · "+plan.briefIds.length+" of "+plan.briefCandidates.length+" stages. Tap complete prayers to include or exclude them. Keep at least one, and use Complete edition for the full order. The 1913 examination is a guided reflection, not a spoken prayer.",
   "Modification du "+(part==="morning"?"matin":"soir")+" · "+plan.edition+" · "+plan.briefIds.length+" étapes sur "+plan.briefCandidates.length+". Touchez une prière intégrale pour l’inclure ou l’exclure. Conservez au moins une étape ; l’édition intégrale reste disponible. L’examen de 1913 est un temps de réflexion guidée, non une prière orale."
  ))+'</p>'+briefChoices+
  (plan.briefCustom?'<button type="button" class="aoDailyPersonalBriefRestore" data-tp381-personal-action="brief-reset" data-tp381-personal-value="">'+
   esc(L("Restore suggested Brief selection","Rétablir la sélection brève suggérée"))+'</button>':""));
 const mode=group(L("Your prayer routine","Votre règle de prière"),
  choice("mode","standard","Standard · St Pius X","Standard · Saint Pie X",prefs.mode==="standard")+
  choice("mode","expanded","Expanded · My choices","Enrichie · Mes choix",prefs.mode==="expanded"));
 const options=personalDailyOptions(part,prefs.language,prefs.edition).filter(x=>x.kind==="additional");
 const selected=new Set(prefs.extras[part]);
 const items=options.map(x=>{
  const on=selected.has(x.id),pos=prefs.extras[part].indexOf(x.id);
  const move=on?'<div class="aoDailyPersonalReorder">'+
   '<button type="button" data-tp381-personal-action="move" data-tp381-personal-value="'+esc(x.id)+'|up" '+(pos===0?'disabled':'')+'>↑ '+esc(L("Up","Monter"))+'</button>'+
   '<button type="button" data-tp381-personal-action="move" data-tp381-personal-value="'+esc(x.id)+'|down" '+(pos===prefs.extras[part].length-1?'disabled':'')+'>↓ '+esc(L("Down","Descendre"))+'</button></div>':"";
  return '<div class="aoDailyPersonalOption">'+
  choice("extra",x.id,(on?"✓ ":"+ ")+x.title,(on?"✓ ":"+ ")+x.title,on)+
  '<small>'+esc(x.sourceLabel)+'</small>'+move+'</div>';
 }).join("");
 const explanation=L("The printed St Pius X order remains intact. Add or remove complete historical prayers or separately labelled Office selections; no Office excerpt constitutes the full Compline service. Your choices remain on this device. Only the attested source language is offered.","L’ordre imprimé de saint Pie X demeure intact. Ajoutez ou retirez des prières historiques complètes ou des textes de l’Office expressément signalés ; un extrait ne constitue pas l’office entier de Complies. Vos choix restent sur cet appareil. Seule la langue attestée est proposée.");
 const adjacent=plan.edition==="1913"&&part==="evening"?'<p>'+esc(L("De profundis and Jesus–Joseph–Mary follow the 1913 printed order as separate, optional devotions; they are not part of the obligatory core.","Le De profundis et les invocations à Jésus, Joseph et Marie suivent la règle de 1913 comme dévotions facultatives, hors du noyau."))+'</p>':"";
 const editionSummary=prefs.edition;
 const languageSummary={la:"LA",en:"EN",fr:"FR"}[prefs.language]||"EN";
 const modeSummary=plan.brief?L("Personal Brief","Brève personnelle"):prefs.mode==="expanded"?L("Expanded","Enrichie"):L("Standard","Standard");
 const selectedSummary=plan.selectedExtras.length&&plan.expanded?" · +"+plan.selectedExtras.length:"";
 return '<details class="aoDailyPersonalSettings" data-ao-personal-settings '+(expanded?"open":"")+'> <summary><span class="aoDailyPersonalSettingsLabel">'+esc(L("Customize","Personnaliser"))+'</span><small class="aoDailyPersonalSettingsCurrent">'+esc(editionSummary+" · "+languageSummary+" · "+modeSummary+selectedSummary)+'</small></summary>'+
 '<div class="aoDailyPersonalSettingsBody">'+ed+lang+length+
 (plan.brief?'<p class="aoDailyPersonalNote">'+esc(L(
  "Personal Brief is your selection of complete prayers from St Pius X, in the printed order, not a separately published Short edition. Saved additions to your Complete rule remain available when you switch back.",
  "La règle brève est votre sélection de prières intégrales de saint Pie X, dans l’ordre imprimé, et non une édition courte historique. Les ajouts à votre règle intégrale demeurent enregistrés."
 ))+'</p>'+briefEditor:mode+'<p class="aoDailyPersonalNote">'+esc(explanation)+'</p>'+
 group(L("Additional prayers & Office texts","Prières et textes de l’Office facultatifs"),adjacent+(items||'<p>'+esc(L("No original-language manual prayers in this reading language. Pius X remains available in all three languages.","Aucune prière de manuel dans cette langue. Saint Pie X demeure disponible en trois langues."))+'</p>')))+
 '<button type="button" class="aoDailyPersonalReset" data-tp381-personal-action="reset" data-tp381-personal-value="">'+esc(L("Restore St Pius X defaults","Rétablir les choix de saint Pie X"))+'</button></div></details>';
}
