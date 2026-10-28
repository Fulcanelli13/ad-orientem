/**
 * Read-only rendering of personal source-bound daily prayer cards.
 * No global DOM hooks; the existing PRAY runtime retains navigation/gesture ownership.
 */
import {personalDailyOptions} from "./daily-personal-rule.js";
export function personalDailyPrayerCard(row,plan,{esc,L,prayerParagraphs,source}){
 const note=row.optional?L("Optional complete preconciliar prayer","Prière traditionnelle complète et facultative"):
 row.sourceStatus?.startsWith("STANDARD_TRADITIONAL")?L("Traditional Latin form; no edition-original claim","Forme latine traditionnelle ; non attribuée à l'édition"):
 L("Source edition; translations individually labelled in research","Édition de référence ; traductions attribuées dans la recherche");
 const body=row.text?prayerParagraphs(row.text):
 '<p class="aoTP381TextParagraph">'+esc(L("Exact text unavailable in the selected language; nothing substituted.","Texte exact indisponible dans cette langue ; aucune substitution."))+'</p>';
 const twoFaces=Boolean(row.text&&row.latinText&&row.language!=="la"&&row.text!==row.latinText);
 const prayerBody=twoFaces?'<button type="button" data-tp381-flip aria-label="'+esc(L("Switch prayer language","Changer la langue de la prière"))+'"><span data-face-v>'+body+'</span><span data-face-la hidden>'+prayerParagraphs(row.latinText)+'</span></button>':'<div class="aoTP381Reader">'+body+'</div>';
 const matches=plan.availableVariants.filter(x=>x.slot===row.sourceId);
 let variants="";
 if(matches.length){
  variants='<details class="aoDailyPersonalAlternatives"><summary>'+esc(L("Other formulations","Autres formulations"))+'</summary>'+
   '<p>'+esc(L("Select one complete printed prayer. Return to St Pius X at any time.","Choisissez une prière complète tirée d’un livre imprimé. Revenez à saint Pie X à tout moment."))+'</p>'+
   '<button type="button" data-tp381-personal-variant="default:'+esc(row.sourceId)+'" aria-pressed="'+String(!row.replacementId)+'">'+esc(L("St Pius X · Standard","Saint Pie X · Référence"))+'</button>'+
   matches.map(x=>'<button type="button" data-tp381-personal-variant="'+esc(x.id)+'" aria-pressed="'+String(row.replacementId===x.id)+'">'+esc(x.sourceLabel)+'</button>').join("")+
   '</details>';
 }
 return '<article class="aoTP381PrayerCard" data-ao-personal-prayer="'+esc(row.sourceId)+'" data-ao-personal-source="'+esc(row.replacementId||row.sourceId)+'">'+
 '<h3>'+esc(row.title)+'</h3><small class="aoDailyPersonalProvenance">'+esc(note)+'</small>'+
 prayerBody+variants+source(row.sourceLabel,row.sourceUrl)+'</article>';
}
export function dailyPersonalList(rows,{esc,L,isFr}){
 return '<div class="aoTP381PrayerList" data-ao-personal-list>'+rows.map((r,i)=>
 '<button type="button" data-tp381-daily-card-index="'+i+'"><span><b>'+
 esc(isFr?(r.titleFr||r.title||r.titleEn||r.sourceId):(r.title||r.titleEn||r.sourceId))+
 '</b><small>'+esc(r.sourceLabel||L("Reflection","Méditation"))+'</small></span><i aria-hidden="true">→</i></button>'
 ).join("")+'</div>';
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
 const explanation=L("The St Pius X recitation order is the baseline. Complete additional prayers may be added or removed, and saved on this device. Only source-language texts are offered; no English/French manual prayer is presented as a Latin translation.","L’ordre de saint Pie X demeure la base. Ajoutez ou retirez des prières complètes, avec sauvegarde locale. Les prières des autres manuels ne sont présentées que dans leur langue d’origine.");
 const adjacent=plan.edition==="1913"&&part==="evening"?'<p>'+esc(L("De profundis and Jesus–Joseph–Mary follow the 1913 printed order as separate, optional devotions; they are not part of the obligatory core.","Le De profundis et les invocations à Jésus, Joseph et Marie suivent la règle de 1913 comme dévotions facultatives, hors du noyau."))+'</p>':"";
 return '<details class="aoDailyPersonalSettings" data-ao-personal-settings '+(expanded?"open":"")+'> <summary>'+esc(L("Customize & save my prayers","Personnaliser et enregistrer mes prières"))+'</summary>'+
 '<div class="aoDailyPersonalSettingsBody">'+ed+lang+mode+'<p class="aoDailyPersonalNote">'+esc(explanation)+'</p>'+
 group(L("Additional complete prayers","Prières complètes facultatives"),adjacent+(items||'<p>'+esc(L("No original-language manual prayers in this reading language. Pius X remains available in all three languages.","Aucune prière de manuel dans cette langue. Saint Pie X demeure disponible en trois langues."))+'</p>'))+
 '<button type="button" class="aoDailyPersonalReset" data-tp381-personal-action="reset" data-tp381-personal-value="">'+esc(L("Restore St Pius X defaults","Rétablir les choix de saint Pie X"))+'</button></div></details>';
}
