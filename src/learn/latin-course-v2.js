import {
  LATIN_COURSE_ROOT_ID,
  LATIN_COURSE_ROUTE_ID,
  LATIN_COURSE_DEFINITION,
  localizeLatinExercise,
  localizeLatinLesson,
  canonicalChoiceValue,
  gradeLatinExercise,
} from "./latin-course.js";
import {
  latinVocabularyRows,
  latinPassageGlosses,
  latinCheckpointStatus,
  latinFrameworkEntries,
  latinCaseRows,
  latinPronounParadigms,
  latinChoiceOrder,
} from "./latin-course-v2-data.js";
import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

export {
  LATIN_COURSE_ROOT_ID,
  LATIN_COURSE_ROUTE_ID,
  LATIN_COURSE_DEFINITION,
  localizeLatinExercise,
  localizeLatinLesson,
  canonicalChoiceValue,
  gradeLatinExercise,
  latinVocabularyRows,
  latinPassageGlosses,
  latinCheckpointStatus,
  latinFrameworkEntries,
  latinCaseRows,
  latinPronounParadigms,
  latinChoiceOrder,
};
export const LATIN_COURSE_VERSION="latin-course-runtime-v2";

const COURSE_URL=new URL("../../data/learn/latin-course-40-core350.v1.json",import.meta.url);
const lessonUrl=n=>new URL(`../../data/learn/latin-course-lessons/lesson-${String(n).padStart(2,"0")}.v1.json`,import.meta.url);
const STAGE_TITLES_FR=Object.freeze({
  1:"Entendre le latin de l’Église",2:"L’Ordinaire",3:"Actions et temps",4:"Structure",
  5:"Langage de la prière",6:"Canon",7:"Latin de l’Église",8:"Lire le Missel",
});
const CASE_LABELS=Object.freeze({
  nominative:["Nominative","Nominatif"],vocative:["Vocative","Vocatif"],
  accusative:["Accusative","Accusatif"],genitive:["Genitive","Génitif"],
  dative:["Dative","Datif"],ablative:["Ablative","Ablatif"],
});
const FIELD_FR=Object.freeze({
  principle:"Principe",note:"Note",scope:"Portée",recognitionSignals:"Signaux de reconnaissance",
  anchorEndings:"Terminaisons repères",commonSignals:"Signaux courants",readingValue:"Valeur de lecture",
  caution:"Attention",construction:"Construction",agreement:"Accord",anchors:"Repères",progression:"Progression",
  procedure:"Procédure",checkpointFamilies:"Familles du jalon",corePattern:"Schéma principal",
  imperfectSubjunctiveRecognition:"Imparfait du subjonctif",connectors:"Connecteurs",temporal:"Temporels",
  conditional:"Conditionnels",causalExplanatory:"Causaux / explicatifs",additiveContrastive:"Additifs / contrastifs",
  positive:"Positif",negative:"Négatif",prayerPattern:"Schéma de prière",purposeQuestion:"Question de but",
  resultQuestion:"Question de conséquence",prayerOutcome:"Résultat demandé",correlatives:"Corrélatifs",
  patterns:"Schémas",timeRelations:"Rapports temporels",gerund:"Gérondif",gerundive:"Adjectif verbal",
  readingRule:"Règle de lecture",form:"Forme",function:"Fonction",diagnostic:"Diagnostic",dative:"Datif",
  ablative:"Ablatif",canonicalMoves:"Mouvements canoniques",move:"Mouvement",example:"Exemple",
  questionSignals:"Signaux interrogatifs",indefinites:"Indéfinis",irregularVerbs:"Verbes irréguliers",
  principles:"Principes",alternatives:"Alternatives",contrast:"Contraste",features:"Caractéristiques",
  moves:"Mouvements",compressionSignals:"Signaux de condensation",register:"Registre",
  periodStrategy:"Stratégie de période",units:"Unités",assistanceTaper:"Réduction de l’aide",
  route:"Parcours",parts:"Parties",signals:"Signaux",warning:"Attention",stages:"Étapes",
  successDefinition:"Définition de la réussite",forbiddenShortcuts:"Raccourcis interdits",
});
const FRAMEWORK_FR=new Map([
  ["sentence → passage","phrase → passage"],
  ["Read person/number from the ending before translating.","Lisez la personne et le nombre dans la terminaison avant de traduire."],
  ["voice recognition first; mood and advanced participles later","reconnaître d’abord la voix ; le mode et les participes avancés viendront plus tard"],
  ["ongoing, repeated or background past action/state","action ou état passé en cours, répété ou d’arrière-plan"],
  ["Identify the verb family as well as the ending.","Identifiez la famille verbale autant que la terminaison."],
  ["completed event or action viewed as a whole","événement achevé ou action envisagée comme un tout"],
  ["perfect passive participle + present of sum","participe parfait passif + présent de sum"],
  ["The participle agrees with the grammatical subject in gender, number and case.","Le participe s’accorde avec le sujet grammatical en genre, nombre et cas."],
  ["Gender and number come from the antecedent; case comes from the relative pronoun's function inside the relative clause.","Le genre et le nombre viennent de l’antécédent ; le cas vient de la fonction du pronom relatif dans sa proposition."],
  ["Deponent verbs use passive morphology but normally carry active meaning.","Les verbes déponents emploient une morphologie passive mais ont normalement un sens actif."],
  ["Mark finite verbs and verb constructions.","Repérez les verbes finis et les constructions verbales."],
  ["Identify clause boundaries and connectors.","Identifiez les limites des propositions et les connecteurs."],
  ["Resolve each pronoun family and case.","Résolvez chaque famille pronominale et son cas."],
  ["Attach genitives/datives/prepositional phrases.","Rattachez les génitifs, datifs et groupes prépositionnels."],
  ["Check adjective/participle agreement.","Vérifiez l’accord des adjectifs et participes."],
  ["Only then produce the full sense.","Ce n’est qu’ensuite que vous reconstruisez le sens complet."],
  ["Parse rhetorical moves first, then resolve morphology inside each move, then reread the Collect continuously.","Analysez d’abord les mouvements rhétoriques, puis la morphologie à l’intérieur de chacun, puis relisez l’oraison d’un seul tenant."],
  ["The Canon is not a sequence of independent short sentences. Preserve the long syntactic period and its sacrificial rhetoric.","Le Canon n’est pas une suite de petites phrases indépendantes. Préservez la longue période syntaxique et sa rhétorique sacrificielle."],
  ["Diagnose only the point that actually blocks comprehension.","Diagnostiquez uniquement le point qui bloque réellement la compréhension."],
  ["Liturgical function supplies expectations before lexical detail.","La fonction liturgique fournit des attentes avant le détail lexical."],
  ["cold read without glosses","lecture à froid sans gloses"],
  ["identify liturgical genre and main clause skeleton","identifier le genre liturgique et l’ossature de la proposition principale"],
  ["mark only genuine blockers","repérer uniquement les véritables blocages"],
  ["consult minimal support","consulter une aide minimale"],
  ["reread continuously","relire d’un seul tenant"],
  ["explain how you recovered meaning","expliquer comment vous avez reconstruit le sens"],
  ["Sustained structural comprehension of unseen authentic Missal Latin with minimal assistance; not a perfect literary translation.","Compréhension structurelle soutenue d’un latin authentique et inconnu du Missel avec une aide minimale ; il ne s’agit pas d’une traduction littéraire parfaite."],
  ["no new tracked vocabulary","aucun nouveau vocabulaire suivi"],
  ["no grammar label announced before the text","aucune étiquette grammaticale annoncée avant le texte"],
  ["no line-by-line translation supplied before attempt","aucune traduction ligne par ligne fournie avant la tentative"],
]);

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const uiIcon=id=>{const url=resolveCanonicalAssetUrl(id);return url?`<span data-ao-asset-id="${esc(id)}" aria-hidden="true" style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`:"";};
const langOf=win=>win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"?"fr":"en";
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const tokenCanon=v=>String(v??"").replace(/^[^A-Za-zÀ-ÖØ-öø-ÿĀ-žÆŒæœ]+|[^A-Za-zÀ-ÖØ-öø-ÿĀ-žÆŒæœ]+$/g,"");
const fieldLabel=(key,lang)=>lang==="fr"?(FIELD_FR[key]||String(key).replace(/([a-z])([A-Z])/g,"$1 $2")):String(key).replace(/([a-z])([A-Z])/g,"$1 $2");
const structuredString=(value,lang)=>lang==="fr"?(FRAMEWORK_FR.get(value)||value):value;
const sourceLabel=(lesson,id)=>{
  const source=(lesson?.sources||[]).find(x=>x.id===id);
  return source?[source.work,source.section].filter(Boolean).join(" · ")||id:id;
};
const stageTitle=(stage,lang)=>lang==="fr"?(STAGE_TITLES_FR[stage.stage]||stage.title):stage.title;
const stimulusText=v=>Array.isArray(v)?v.join(" · "):String(v??"");

function css(){return `
#${LATIN_COURSE_ROOT_ID}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:var(--ao-z-surface,2147481800);background:var(--ao-bg-canvas,var(--bg,#080c12));color:var(--ao-text-primary,var(--text,#e9e4d9));overflow:auto;font-family:var(--ao-font-body,var(--font-body,Georgia,serif))}
#${LATIN_COURSE_ROOT_ID} *{box-sizing:border-box}.aoL2Top{position:sticky;top:0;z-index:8;display:grid;grid-template-columns:44px 1fr 44px;gap:8px;align-items:center;padding:10px 12px;background:color-mix(in srgb,var(--ao-bg-canvas,var(--bg,#080c12)) 95%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)))}.aoL2Top button,.aoL2Btn{min-height:var(--ao-control-h,44px);border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.15)));border-radius:var(--ao-control-radius,11px);background:var(--ao-surface-1,var(--surface-1,#101821));color:inherit}.aoL2Title{text-align:center;min-width:0}.aoL2Title small{display:block;color:var(--liturgical,#c9ad78);font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em}.aoL2Title strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.aoL2Wrap{width:min(var(--ao-content-max,760px),100%);margin:auto;padding:20px var(--ao-page-gutter,14px) 50px}.aoL2Hero h1{margin:6px 0 8px;font:600 clamp(1.7rem,6vw,2.5rem)/1.08 var(--ao-font-display,Georgia,serif)}.aoL2Kicker,.aoL2Label{color:var(--liturgical,#c9ad78);font:650 var(--ao-type-ui-xs,11px)/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;text-transform:uppercase}.aoL2Muted{color:var(--muted,#a9b0b8)}.aoL2StageList,.aoL2LessonList,.aoL2Tools{display:grid;gap:10px}.aoL2Stage,.aoL2Lesson{width:100%;padding:13px 14px;text-align:left;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)));border-radius:14px;background:var(--ao-surface-1,var(--surface-1,#101821));color:inherit}.aoL2Stage strong,.aoL2Lesson strong{display:block}.aoL2Stage span,.aoL2Lesson span{display:block;margin-top:4px;color:var(--muted,#a9b0b8);font:.78rem system-ui,sans-serif}.aoL2Meta{display:grid;gap:10px;padding:14px 0 18px;border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)))}.aoL2Meta p{margin:4px 0 0;line-height:1.5}.aoL2Objectives{margin:4px 0 0;padding-left:20px;color:var(--muted,#a9b0b8);line-height:1.45}.aoL2Tools{margin:16px 0}.aoL2Panel{border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)));border-radius:14px;background:var(--ao-surface-1,var(--surface-1,#101821));overflow:hidden}.aoL2Panel>summary{cursor:pointer;padding:12px 14px;color:var(--liturgical,#c9ad78);font:600 .82rem system-ui,sans-serif}.aoL2PanelBody{padding:0 14px 14px}.aoL2Cases{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.aoL2Case{padding:9px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.1)));border-radius:9px}.aoL2Case.preview{opacity:.58}.aoL2Case span{display:block;margin-top:3px;color:var(--muted,#a9b0b8);font:var(--ao-type-ui-xs,11px) var(--ao-font-ui,system-ui,sans-serif)}.aoL2Grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.aoL2Vocab{padding:8px;border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.08)))}.aoL2Vocab b{font-family:var(--font-liturgical,Georgia,serif)}.aoL2Vocab span{display:block;color:var(--muted,#a9b0b8);font:var(--ao-type-ui-sm,12px)/1.35 var(--ao-font-ui,system-ui,sans-serif)}.aoL2Structured{display:grid;gap:7px}.aoL2Struct{padding:7px 0;border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.08)))}.aoL2Struct:last-child{border-bottom:0}.aoL2StructKey{color:var(--muted,#a9b0b8);font:650 var(--ao-type-ui-xs,11px) var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase}.aoL2StructValue{margin-top:4px;line-height:1.45}.aoL2StructValue ul{margin:5px 0;padding-left:18px}.aoL2Block{padding:18px 0;border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)))}.aoL2Block h2{margin:0 0 8px;color:var(--liturgical,#c9ad78);font:600 1.05rem var(--ao-font-display,Georgia,serif)}.aoL2Block p{margin:0;line-height:1.62}.aoL2Sources{margin-top:8px;color:var(--muted,#a9b0b8);font:var(--ao-type-ui-sm,12px) var(--ao-font-ui,system-ui,sans-serif)}.aoL2Reading{margin-top:24px}.aoL2Reading h2,.aoL2Practice h2,.aoL2Checkpoint h2{font:600 1.2rem var(--ao-font-display,Georgia,serif)}.aoL2Passage{margin-top:11px;padding:15px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)));border-radius:15px;background:var(--ao-surface-1,var(--surface-1,#101821))}.aoL2PassageHead{display:flex;justify-content:space-between;gap:12px;color:var(--muted,#a9b0b8);font:var(--ao-type-ui-xs,11px) var(--ao-font-ui,system-ui,sans-serif)}.aoL2Latin{margin-top:12px;font:500 1.1rem/1.68 var(--font-liturgical,Georgia,serif)}.aoL2GlossWord{display:inline;padding:0;border:0;border-bottom:1px dotted var(--liturgical,#c9ad78);background:transparent;color:inherit;font:inherit;cursor:pointer}.aoL2Gloss{margin-top:10px;padding:9px 11px;border-left:2px solid var(--liturgical,#c9ad78);background:var(--liturgical-soft,rgba(201,173,120,.07));font:var(--ao-type-ui-sm,12px) var(--ao-font-ui,system-ui,sans-serif)}.aoL2Chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.aoL2Chip{padding:5px 8px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)));border-radius:999px;color:var(--muted,#a9b0b8);font:var(--ao-type-ui-xs,11px) var(--ao-font-ui,system-ui,sans-serif)}.aoL2Translation{margin-top:10px;color:var(--muted,#a9b0b8);font:.82rem/1.5 system-ui,sans-serif}.aoL2Practice{margin-top:24px;padding-top:18px;border-top:2px solid var(--liturgical-border,rgba(201,173,120,.34))}.aoL2PracticeHead{display:flex;justify-content:space-between;align-items:baseline}.aoL2Exercise{padding:15px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.13)));border-radius:15px;background:var(--ao-surface-1,var(--surface-1,#101821))}.aoL2Prompt{font:600 1.02rem/1.45 var(--ao-font-display,Georgia,serif)}.aoL2Stimulus{margin:12px 0;padding:11px;border-left:2px solid var(--liturgical,#c9ad78);font:500 1rem/1.5 var(--font-liturgical,Georgia,serif)}.aoL2Choices{display:grid;gap:8px;margin-top:12px}.aoL2Choice,.aoL2Token{min-height:44px;padding:9px 11px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.15)));border-radius:10px;background:transparent;color:inherit;text-align:left}.aoL2Choice.selected,.aoL2Token.selected{border-color:var(--liturgical,#c9ad78);background:var(--liturgical-soft,rgba(201,173,120,.09))}.aoL2Tokens{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.aoL2Input,.aoL2Select,.aoL2Textarea{width:100%;min-height:44px;margin-top:10px;padding:9px 10px;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.15)));border-radius:9px;background:var(--ao-bg-canvas,var(--bg,#080c12));color:inherit}.aoL2Textarea{min-height:92px}.aoL2Match{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:center;margin-top:8px}.aoL2Actions,.aoL2Nav{display:flex;gap:8px;margin-top:12px}.aoL2Actions .aoL2Btn,.aoL2Nav .aoL2Btn{padding:0 13px;flex:1}.aoL2Feedback{margin-top:12px;padding:10px;background:rgba(255,255,255,.035);border-radius:9px}.aoL2Checkpoint{margin-top:20px;padding:15px;border:1px solid var(--liturgical-border,rgba(201,173,120,.34));border-radius:15px;background:var(--liturgical-soft,rgba(201,173,120,.06))}.aoL2Checkpoint.pass{border-color:var(--liturgical,#c9ad78)}.aoL2Score{font:700 1.25rem system-ui,sans-serif}.aoL2Checkpoint p{margin:6px 0;color:var(--muted,#a9b0b8);line-height:1.45}
@media(max-width:560px){.aoL2Cases,.aoL2Grid{grid-template-columns:1fr 1fr}.aoL2Match{grid-template-columns:1fr}}@media(max-width:420px){.aoL2Cases,.aoL2Grid{grid-template-columns:1fr}}
`}

function top(lang,title,back=true){
  return `<style>${css()}</style><header class="aoL2Top"><button type="button" data-l2-back aria-label="${esc(L(lang,"Back","Retour"))}">${uiIcon(back?"ao-ui-back":"ao-ui-close")}</button><div class="aoL2Title"><small>FORMATION · LATIN</small><strong>${esc(title)}</strong></div><button type="button" data-l2-close aria-label="${esc(L(lang,"Close","Fermer"))}">${uiIcon("ao-ui-close")}</button></header>`;
}
function sources(lesson,ids,lang){
  if(!Array.isArray(ids)||!ids.length)return "";
  return `<details class="aoL2Sources"><summary>${esc(L(lang,"Sources","Sources"))}</summary>${ids.map(id=>esc(sourceLabel(lesson,id))).join("<br>")}</details>`;
}
function structured(value,lang){
  if(value===null||value===undefined)return "";
  if(Array.isArray(value))return `<ul>${value.map(x=>`<li>${typeof x==="object"?structured(x,lang):esc(structuredString(String(x),lang))}</li>`).join("")}</ul>`;
  if(typeof value!=="object")return esc(structuredString(String(value),lang));
  return `<div class="aoL2Structured">${Object.entries(value).filter(([k])=>k!=="referenceIds").map(([k,v])=>`<div class="aoL2Struct"><div class="aoL2StructKey">${esc(fieldLabel(k,lang))}</div><div class="aoL2StructValue">${structured(v,lang)}</div></div>`).join("")}</div>`;
}
function casePanel(lesson,lang){
  const rows=latinCaseRows(lesson);if(!rows.length)return "";
  return `<details class="aoL2Panel" open><summary>${esc(L(lang,"Six-case map","Carte des six cas"))}</summary><div class="aoL2PanelBody"><div class="aoL2Cases">${rows.map(r=>{
    const label=CASE_LABELS[r.case]?.[lang==="fr"?1:0]||r.case;
    const endings=Object.entries(r).filter(([k])=>/Declension$/.test(k)).flatMap(([,v])=>Object.values(v||{})).join(" · ");
    return `<div class="aoL2Case ${r.status==="preview"?"preview":""}"><b>${esc(label)}</b><span>${esc(r.status==="preview"?L(lang,"preview","aperçu"):L(lang,"active","actif"))}${r.unlockLesson?` · ${esc(L(lang,"Lesson","Leçon"))} ${r.unlockLesson}`:""}</span>${endings?`<span>${esc(endings)}</span>`:""}</div>`;
  }).join("")}</div>${sources(lesson,lesson.casePanel?.referenceIds,lang)}</div></details>`;
}
function vocabulary(lesson,lang){
  const active=latinVocabularyRows(lesson,lang);
  const recycled=Array.isArray(lesson?.coreVocabulary?.recycled)?lesson.coreVocabulary.recycled:[];
  const support=Array.isArray(lesson?.passiveReadingLexicon)?lesson.passiveReadingLexicon:[];
  let out="";
  if(active.length)out+=`<details class="aoL2Panel" open><summary>${esc(L(lang,`New mastery vocabulary (${active.length})`,`Nouveau vocabulaire à maîtriser (${active.length})`))}</summary><div class="aoL2PanelBody aoL2Grid">${active.map(x=>`<div class="aoL2Vocab"><b>${esc(x.lemma)}</b><span>${esc(x.gloss)}${x.partOfSpeech?` · ${esc(x.partOfSpeech)}`:""}</span></div>`).join("")}</div></details>`;
  if(recycled.length)out+=`<details class="aoL2Panel"><summary>${esc(L(lang,`Recycled vocabulary (${recycled.length})`,`Vocabulaire repris (${recycled.length})`))}</summary><div class="aoL2PanelBody aoL2Chips">${recycled.map(x=>`<span class="aoL2Chip">${esc(x)}</span>`).join("")}</div></details>`;
  if(support.length)out+=`<details class="aoL2Panel"><summary>${esc(L(lang,`Reading support (${support.length})`,`Aide à la lecture (${support.length})`))}</summary><div class="aoL2PanelBody aoL2Grid">${support.map(x=>`<div class="aoL2Vocab"><b>${esc(x.lemma)}</b><span>${esc(x?.gloss?.[lang]||x?.gloss?.en||"")}</span></div>`).join("")}</div></details>`;
  return out;
}
function referencePanels(lesson,lang){
  const panels=[];
  const pronouns=latinPronounParadigms(lesson);
  if(pronouns)panels.push([L(lang,"Pronoun paradigms","Paradigmes pronominaux"),pronouns,[]]);
  if(lesson?.prepositionGovernment)panels.push([L(lang,"Preposition government","Gouvernement des prépositions"),lesson.prepositionGovernment,lesson.prepositionGovernment.referenceIds||[]]);
  if(lesson?.cumPronounRule)panels.push([L(lang,"cum + pronouns","cum + pronoms"),lesson.cumPronounRule,[]]);
  for(const [key,value] of latinFrameworkEntries(lesson)){
    const name=key.replace(/Framework$/,"").replace(/([a-z])([A-Z])/g,"$1 $2");
    panels.push([L(lang,`Framework · ${name}`,`Repère · ${name}`),value,value.referenceIds||[]]);
  }
  return panels.map(([title,value,refs])=>`<details class="aoL2Panel"><summary>${esc(title)}</summary><div class="aoL2PanelBody">${structured(value,lang)}${sources(lesson,refs,lang)}</div></details>`).join("");
}
function passageRender(lesson,passage,lang,selected){
  const glosses=latinPassageGlosses(lesson,passage,lang),forms=new Map();
  for(const g of glosses)for(const f of [g.lemma,...g.forms])forms.set(tokenCanon(f).toLocaleLowerCase(),g);
  const raw=passage?.instructionalDisplay||passage?.sourceLatin||"";
  const html=String(raw).split(/(\s+)/).map(piece=>{
    if(/^\s+$/.test(piece))return piece;
    const hit=forms.get(tokenCanon(piece).toLocaleLowerCase());
    return hit?`<button type="button" class="aoL2GlossWord" data-l2-gloss="${esc(hit.lemma)}" data-l2-passage="${esc(passage.id)}">${esc(piece)}</button>`:esc(piece);
  }).join("");
  const active=selected?.passageId===passage.id?glosses.find(x=>x.lemma===selected.lemma):null;
  return {html,glosses,active};
}
function readings(lesson,lang,selected){
  const list=Array.isArray(lesson?.authenticPassages)?lesson.authenticPassages:[];
  if(!list.length)return "";
  return `<section class="aoL2Reading"><h2>${esc(L(lang,"Authentic reading","Lecture authentique"))}</h2>${list.map((p,i)=>{
    const r=passageRender(lesson,p,lang,selected),translation=p?.translation?.[lang]||p?.translation?.en||"";
    return `<article class="aoL2Passage"><div class="aoL2PassageHead"><b>${esc(L(lang,`Reading ${i+1}`,`Lecture ${i+1}`))}</b><span>${esc(sourceLabel(lesson,p.sourceId))}</span></div><div class="aoL2Latin">${r.html}</div>${r.active?`<div class="aoL2Gloss"><b>${esc(r.active.lemma)}</b> — ${esc(r.active.gloss)}</div>`:""}${r.glosses.length?`<div class="aoL2Chips">${r.glosses.map(x=>`<span class="aoL2Chip">${esc(x.lemma)} · ${esc(x.gloss)}</span>`).join("")}</div>`:""}${translation?`<details class="aoL2Translation"><summary>${esc(L(lang,"Translation","Traduction"))}</summary>${esc(translation)}</details>`:""}</article>`;
  }).join("")}</section>`;
}
function canonicalTokens(stimulus){return String(stimulus||"").split(/\s+/).filter(Boolean).map((display,index)=>({display,canonical:tokenCanon(display),index}))}
function matchingValueLabels(exercise,loc){
  const m=new Map();for(const [key,value] of Object.entries(exercise?.expectedAnswer||{}))m.set(String(value),loc.matches?.[key]??String(value));return m;
}
function exerciseMarkup(exercise,lang,response,feedback){
  const loc=localizeLatinExercise(exercise,lang),stim=exercise.stimulus?`<div class="aoL2Stimulus">${esc(stimulusText(exercise.stimulus))}</div>`:"";
  let input="";
  if(exercise.exerciseType==="multiple_choice"||exercise.exerciseType==="syllable_select"){
    input=`<div class="aoL2Choices">${latinChoiceOrder(exercise).map(i=>{const v=exercise.options[i];return `<button type="button" class="aoL2Choice ${response===v?"selected":""}" data-l2-choice="${i}">${esc(loc.options?.[i]??v)}</button>`}).join("")}</div>`;
  }else if(exercise.exerciseType==="token_select"){
    const sel=new Set(response?.indices||[]);input=`<div class="aoL2Tokens">${canonicalTokens(exercise.stimulus).map(t=>`<button type="button" class="aoL2Token ${sel.has(t.index)?"selected":""}" data-l2-token="${t.index}">${esc(t.display)}</button>`).join("")}</div>`;
  }else if(exercise.exerciseType==="matching"){
    const values=[...new Set(Object.values(exercise.expectedAnswer||{}).map(String))],labels=matchingValueLabels(exercise,loc);
    input=Object.keys(exercise.expectedAnswer||{}).map(key=>`<div class="aoL2Match"><label>${esc(loc.matchKeys[key]||key)}</label><select class="aoL2Select" data-l2-match="${esc(key)}"><option value="">—</option>${values.map(v=>`<option value="${esc(v)}" ${response?.[key]===v?"selected":""}>${esc(labels.get(v)||v)}</option>`).join("")}</select></div>`).join("");
  }else if(exercise.exerciseType==="passage_analysis"){
    input=`<textarea class="aoL2Textarea" data-l2-text placeholder="${esc(L(lang,"Write your analysis…","Écrivez votre analyse…"))}">${esc(typeof response==="string"?response:"")}</textarea>`;
  }else if(exercise.exerciseType!=="read_aloud_model"){
    input=`<input class="aoL2Input" data-l2-text value="${esc(typeof response==="string"?response:"")}">`;
  }
  const self=exercise.exerciseType==="passage_analysis"||exercise.exerciseType==="read_aloud_model";
  let fb="";
  if(feedback?.shown){
    if(self){
      const guide=exercise.exerciseType==="read_aloud_model"?(loc.modelGuide||""):(Array.isArray(loc.answerGuide)?loc.answerGuide.join(" · "):loc.answerGuide||"");
      fb=`<div class="aoL2Feedback"><b>${esc(L(lang,"Model","Modèle"))}</b><div>${esc(guide)}</div><div>${esc(loc.explanation)}</div></div>`;
    }else fb=`<div class="aoL2Feedback"><b>${esc(feedback.correct?L(lang,"Correct","Correct"):L(lang,"Try again","Réessayez"))}</b><div>${esc(loc.explanation)}</div></div>`;
  }
  return `<article class="aoL2Exercise"><div class="aoL2Prompt">${esc(loc.prompt)}</div>${stim}<details class="aoL2Sources"><summary>${esc(L(lang,"Hint","Indice"))}</summary>${esc(loc.hint)}</details>${input}<div class="aoL2Actions"><button class="aoL2Btn" type="button" data-l2-check>${esc(self?L(lang,"Show model","Afficher le modèle"):L(lang,"Check","Vérifier"))}</button></div>${fb}</article>`;
}
function checkpoint(lesson,feedback,lang){
  const s=latinCheckpointStatus(lesson,feedback);if(!s.applicable)return "";
  const state=s.passed?L(lang,"Checkpoint passed","Jalon réussi"):s.attempted?L(lang,"Checkpoint not yet passed","Jalon pas encore réussi"):L(lang,"Checkpoint not attempted","Jalon non commencé");
  return `<section class="aoL2Checkpoint ${s.passed?"pass":""}"><h2>${esc(L(lang,"Lesson checkpoint","Jalon de la leçon"))}</h2><div class="aoL2Score">${s.correct} / ${s.required}</div><p>${esc(state)} · ${esc(L(lang,`${s.attempted} of ${s.total} checkpoint items checked`,`${s.attempted} sur ${s.total} éléments du jalon vérifiés`))}</p>${sources(lesson,lesson.checkpoint?.referenceIds,lang)}</section>`;
}

export function createLatinCourseRuntime(win=globalThis){
  const state={open:false,screen:"stages",course:null,stage:null,stageLessons:[],lesson:null,loading:false,error:"",exerciseIndex:0,responses:new Map(),feedback:new Map(),cache:new Map(),unsub:null,lastLanguage:null,gloss:null};
  const root=()=>win?.document?.getElementById?.(LATIN_COURSE_ROOT_ID)||null;
  async function fetchJson(url){const f=win?.fetch?.bind(win)||globalThis.fetch?.bind(globalThis);if(!f)throw new Error("FETCH_UNAVAILABLE");const r=await f(url);if(!r?.ok)throw new Error(`HTTP_${r?.status||"ERR"}`);return r.json()}
  async function ensureCourse(){if(!state.course)state.course=await fetchJson(COURSE_URL);return state.course}
  async function loadLesson(n){if(!state.cache.has(n))state.cache.set(n,await fetchJson(lessonUrl(n)));return state.cache.get(n)}
  async function loadStage(n){state.loading=true;state.stage=n;state.screen="stage";render();try{const c=await ensureCourse(),st=c.stages.find(x=>x.stage===n),[a,b]=st.lessons;state.stageLessons=await Promise.all(Array.from({length:b-a+1},(_,i)=>loadLesson(a+i)));state.error=""}catch(e){state.error=String(e?.message||e)}state.loading=false;render()}
  async function openLesson(n){state.loading=true;render();try{state.lesson=await loadLesson(n);state.exerciseIndex=0;state.gloss=null;state.screen="lesson";state.error=""}catch(e){state.error=String(e?.message||e)}state.loading=false;render()}
  function ensureRoot(){const d=win?.document;if(!d?.body)return null;let n=root();if(n)return n;n=d.createElement("section");n.id=LATIN_COURSE_ROOT_ID;n.dataset.aoLatinCourseOwner=LATIN_COURSE_VERSION;n.addEventListener("click",onClick);n.addEventListener("input",onInput);n.addEventListener("change",onInput);d.body.append(n);return n}
  function attach(){if(state.unsub)return;const store=win?.AO_RUNTIME_V8?.store;if(typeof store?.subscribe!=="function")return;state.lastLanguage=langOf(win);state.unsub=store.subscribe(()=>{const n=langOf(win);if(n!==state.lastLanguage){state.lastLanguage=n;if(state.open)queueMicrotask(render)}})}
  function renderStages(lang){return `${top(lang,L(lang,"Latin for the Missal","Latin du Missel"),false)}<main class="aoL2Wrap"><section class="aoL2Hero"><div class="aoL2Kicker">${esc(L(lang,"40-lesson formation course","Parcours de formation en 40 leçons"))}</div><h1>${esc(L(lang,"Read the Latin of the Church","Lire le latin de l’Église"))}</h1><p class="aoL2Muted">${esc(L(lang,"Authentic Missal reading, grammar tools and real checkpoints.","Lecture authentique du Missel, outils grammaticaux et véritables jalons."))}</p></section><div class="aoL2StageList">${(state.course?.stages||[]).map(st=>`<button class="aoL2Stage" type="button" data-l2-stage="${st.stage}"><strong>${esc(stageTitle(st,lang))}</strong><span>${esc(L(lang,`Lessons ${st.lessons[0]}–${st.lessons[1]}`,`Leçons ${st.lessons[0]}–${st.lessons[1]}`))}</span></button>`).join("")}</div></main>`}
  function renderStage(lang){const st=state.course?.stages?.find(x=>x.stage===state.stage),title=st?stageTitle(st,lang):L(lang,"Stage","Étape"),body=state.loading?`<p class="aoL2Muted">${esc(L(lang,"Loading…","Chargement…"))}</p>`:state.error?`<p>${esc(state.error)}</p>`:`<div class="aoL2LessonList">${state.stageLessons.map(ls=>{const loc=localizeLatinLesson(ls,lang);return `<button class="aoL2Lesson" type="button" data-l2-lesson="${ls.lesson}"><strong>${esc(L(lang,`Lesson ${ls.lesson}`,`Leçon ${ls.lesson}`))} · ${esc(loc.title)}</strong><span>${esc(loc.grammarFocus)}</span></button>`}).join("")}</div>`;return `${top(lang,title)}<main class="aoL2Wrap"><section class="aoL2Hero"><div class="aoL2Kicker">${esc(L(lang,`Stage ${state.stage}`,`Étape ${state.stage}`))}</div><h1>${esc(title)}</h1></section>${body}</main>`}
  function renderLesson(lang){const lesson=state.lesson;if(!lesson)return `${top(lang,L(lang,"Lesson","Leçon"))}<main class="aoL2Wrap">…</main>`;const loc=localizeLatinLesson(lesson,lang),blocks=(lesson.learningBlocks||[]).map(b=>{const title=lang==="fr"?(b.localization?.fr?.title||b.title):b.title,copy=lang==="fr"?(b.learnerCopy?.fr||b.learnerCopy?.en||""):(b.learnerCopy?.en||"");return `<section class="aoL2Block"><h2>${esc(title)}</h2><p>${esc(copy)}</p>${sources(lesson,b.referenceIds,lang)}</section>`}).join(""),ex=lesson.exercises||[],idx=Math.min(state.exerciseIndex,Math.max(0,ex.length-1)),item=ex[idx];const practice=item?`<section class="aoL2Practice"><div class="aoL2PracticeHead"><h2>${esc(L(lang,"Practice","Exercices"))}</h2><span>${idx+1} / ${ex.length}</span></div>${exerciseMarkup(item,lang,state.responses.get(item.id),state.feedback.get(item.id))}<div class="aoL2Nav"><button class="aoL2Btn" type="button" data-l2-prev ${idx===0?"disabled":""}>${esc(L(lang,"Previous","Précédent"))}</button><button class="aoL2Btn" type="button" data-l2-next ${idx>=ex.length-1?"disabled":""}>${esc(L(lang,"Next","Suivant"))}</button></div>${sources(lesson,item.referenceIds,lang)}</section>`:"";return `${top(lang,loc.title)}<main class="aoL2Wrap"><section class="aoL2Hero"><div class="aoL2Kicker">${esc(L(lang,`Lesson ${lesson.lesson}`,`Leçon ${lesson.lesson}`))}</div><h1>${esc(loc.title)}</h1></section><section class="aoL2Meta"><div><div class="aoL2Label">${esc(L(lang,"Grammar","Grammaire"))}</div><p>${esc(loc.grammarFocus)}</p></div><div><div class="aoL2Label">${esc(L(lang,"Reading target","Objectif de lecture"))}</div><p>${esc(loc.readingOutcome)}</p></div><ul class="aoL2Objectives">${loc.objectives.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section><section class="aoL2Tools">${casePanel(lesson,lang)}${vocabulary(lesson,lang)}${referencePanels(lesson,lang)}</section>${blocks}${readings(lesson,lang,state.gloss)}${practice}${checkpoint(lesson,state.feedback,lang)}</main>`}
  function render(){const n=ensureRoot();if(!n||!state.open)return false;const lang=langOf(win);n.lang=lang;if(!state.course&&state.loading)n.innerHTML=`${top(lang,L(lang,"Latin for the Missal","Latin du Missel"),false)}<main class="aoL2Wrap"><p class="aoL2Muted">${esc(L(lang,"Loading course…","Chargement du cours…"))}</p></main>`;else if(state.screen==="lesson")n.innerHTML=renderLesson(lang);else if(state.screen==="stage")n.innerHTML=renderStage(lang);else n.innerHTML=renderStages(lang);return true}
  function currentExercise(){return state.lesson?.exercises?.[state.exerciseIndex]||null}
  function onInput(e){const ex=currentExercise(),t=e.target;if(!ex||!t)return;if(t.matches?.("[data-l2-text]")){state.responses.set(ex.id,t.value||"");state.feedback.delete(ex.id)}else if(t.matches?.("[data-l2-match]")){const prior={...(state.responses.get(ex.id)||{})};prior[t.dataset.l2Match]=t.value;state.responses.set(ex.id,prior);state.feedback.delete(ex.id)}}
  function onClick(e){const t=e.target?.closest?.("button");if(!t)return;if(t.matches("[data-l2-close]")){close();return}if(t.matches("[data-l2-back]")){if(state.screen==="lesson"){state.screen="stage";state.lesson=null}else if(state.screen==="stage"){state.screen="stages";state.stage=null;state.stageLessons=[]}else return close();render();return}if(t.dataset.l2Stage){void loadStage(Number(t.dataset.l2Stage));return}if(t.dataset.l2Lesson){void openLesson(Number(t.dataset.l2Lesson));return}if(t.dataset.l2Gloss){state.gloss={passageId:t.dataset.l2Passage||"",lemma:t.dataset.l2Gloss};render();return}const ex=currentExercise();if(!ex)return;if(t.dataset.l2Choice!==undefined){const i=Number(t.dataset.l2Choice);state.responses.set(ex.id,canonicalChoiceValue(ex,i));state.feedback.delete(ex.id);render();return}if(t.dataset.l2Token!==undefined){const i=Number(t.dataset.l2Token),tokens=canonicalTokens(ex.stimulus),prior=state.responses.get(ex.id)||{indices:[],canonical:[]},set=new Set(prior.indices||[]);set.has(i)?set.delete(i):set.add(i);const indices=[...set].sort((a,b)=>a-b);state.responses.set(ex.id,{indices,canonical:indices.map(x=>tokens[x]?.canonical).filter(Boolean)});state.feedback.delete(ex.id);render();return}if(t.matches("[data-l2-check]")){let response=state.responses.get(ex.id);if(ex.exerciseType==="token_select")response=response?.canonical||[];const r=gradeLatinExercise(ex,response);state.feedback.set(ex.id,{shown:true,graded:r.graded,correct:r.correct,selfCheck:r.selfCheck});render();return}if(t.matches("[data-l2-prev]")){state.exerciseIndex=Math.max(0,state.exerciseIndex-1);render();return}if(t.matches("[data-l2-next]")){state.exerciseIndex=Math.min((state.lesson?.exercises?.length||1)-1,state.exerciseIndex+1);render()}}
  async function open(){state.open=true;state.screen="stages";state.stage=null;state.stageLessons=[];state.lesson=null;state.error="";state.loading=true;ensureRoot();attach();render();try{await ensureCourse()}catch(e){state.error=String(e?.message||e)}state.loading=false;render();return true}
  function close(){state.open=false;const n=root();if(n)n.remove();state.screen="stages";state.stage=null;state.stageLessons=[];state.lesson=null;state.gloss=null;state.loading=false;return true}
  function status(){return Object.freeze({version:LATIN_COURSE_VERSION,installed:true,open:Boolean(state.open&&root()),screen:state.screen,stage:state.stage,lesson:state.lesson?.lesson??null,language:langOf(win),cachedLessons:state.cache.size,canonicalResponses:state.responses.size,checkpoint:state.lesson?latinCheckpointStatus(state.lesson,state.feedback):null})}
  return Object.freeze({version:LATIN_COURSE_VERSION,open,close,status,render,loadStage,openLesson});
}

export function ensureLatinCourseRegistry(win=globalThis){
  if(win?.AO_MODULES?.__aoLatinCourseV2)return win.AO_MODULES;
  const base=win?.AO_MODULES;if(!base)return null;
  const runtime=win.AO_LATIN_COURSE_V2||createLatinCourseRuntime(win);
  win.AO_LATIN_COURSE_V2=runtime;win.AO_LATIN_COURSE_V1=runtime;
  const wrapper={...base,__aoLatinCourseV2:true,
    get(id){if(id===LATIN_COURSE_ROUTE_ID)return LATIN_COURSE_DEFINITION;return base.get?.(id)||null},
    resolve(id){if(id===LATIN_COURSE_ROUTE_ID)return {ok:true,input:id,id,defaults:{},chain:[id],definition:LATIN_COURSE_DEFINITION};return base.resolve?.(id)},
    async open(id,opts={}){if(id===LATIN_COURSE_ROUTE_ID)return {ok:await runtime.open(opts)!==false,input:String(id),canonicalId:id,type:"module",domain:"learn",options:opts,aliasChain:[id],error:null};return base.open?.(id,opts)},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(x=>x?.id!==LATIN_COURSE_ROUTE_ID);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(LATIN_COURSE_DEFINITION);return prior}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;return wrapper;
}
export function installLatinCourseModule(win=globalThis){
  if(!win)return false;
  if(!win.AO_LATIN_COURSE_V2)win.AO_LATIN_COURSE_V2=createLatinCourseRuntime(win);
  win.AO_LATIN_COURSE_V1=win.AO_LATIN_COURSE_V2;
  ensureLatinCourseRegistry(win);return win.AO_LATIN_COURSE_V2;
}
