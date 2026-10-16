// Presentation-only Mass entry journey. Never resolves or changes a Proper,
// liturgical rank, selected Mass, ritual applicability, or reader sequence.
const tr=(fr,en,french)=>fr?french:en;
const node=(doc,tag,cls,text)=>{
 const el=doc.createElement(tag);
 if(cls)el.className=cls;
 if(text!=null)el.textContent=text;
 return el;
};
export function multipleMassNotice(legacy,{language="en",kind="CALENDAR",form=null}={}){
 const fr=String(language).startsWith("fr");
 const date=String(legacy?.date??"");
 if(kind!=="CALENDAR"&&!(kind==="REQUIEM"&&/^\d{4}-11-02$/.test(date)))return null;
 if(/^\d{4}-12-25$/.test(date))return Object.freeze({
  id:"CHRISTMAS",heading:tr(fr,"Three distinct Christmas Masses","Trois messes distinctes de Noël"),
  detail:tr(fr,"Identify the Proper actually being used. Clock time by itself does not choose the Mass texts.",
   "Identifiez le propre réellement utilisé. L'heure à elle seule ne détermine pas les textes de la messe."),
  options:Object.freeze([
   Object.freeze({id:"NIGHT",label:tr(fr,"First Mass — During the Night","Première messe — Dans la nuit"),
    detail:tr(fr,"In nocte · proper Communicantes for the Night Mass","In nocte · Communicantes propre à la messe de nuit")}),
   Object.freeze({id:"DAWN",label:tr(fr,"Second Mass — At Dawn","Deuxième messe — À l'aurore"),
    detail:tr(fr,"In aurora · commemoration of St Anastasia","In aurora · commémoraison de sainte Anastasie")}),
   Object.freeze({id:"DAY",label:tr(fr,"Third Mass — During the Day","Troisième messe — Pendant le jour"),
    detail:tr(fr,"In die · Prologue of St John; the Last Gospel is omitted","In die · Prologue de saint Jean ; le dernier Évangile est omis")})
  ]),
  caveat:tr(fr,"These are distinct formularies, not local service times. The actual Mass remains selected by the liturgical source.",
   "Il s'agit de formulaires distincts, non des horaires paroissiaux. Le choix effectif relève de la source liturgique."),
  sourceUrl:"https://1962ordo.today/season/"
 });
 if(/^\d{4}-11-02$/.test(date)){
  const sung=form!=null&&String(form).toUpperCase()!=="LOW";
  return Object.freeze({
   id:"ALL_SOULS",heading:tr(fr,"All Souls — three proper formularies","Défunts — trois formulaires propres"),
   detail:tr(fr,"All three belong to the Requiem liturgy; which one is used follows the 1962 rubrics.",
    "Les trois appartiennent à la liturgie des défunts ; leur emploi suit les rubriques de 1962."),
   options:Object.freeze([
    Object.freeze({id:"FIRST",label:tr(fr,"First Mass — Principal formulary","Première messe — Formulaire principal"),
     detail:tr(fr,"Used for a sung or conventual Mass, and when the priest says only one Mass.","Employé pour la messe chantée ou conventuelle, et lorsque le prêtre ne célèbre qu'une seule messe.")}),
    Object.freeze({id:"SECOND",label:tr(fr,"Second Mass — Anniversary Mass formulary","Deuxième messe — Formulaire de la messe anniversaire"),
     detail:tr(fr,"The anniversary Requiem texts, adapted for all the faithful departed.","Les textes du Requiem d’anniversaire, adaptés à tous les fidèles défunts.")}),
    Object.freeze({id:"THIRD",label:tr(fr,"Third Mass — Daily Requiem formulary","Troisième messe — Formulaire du Requiem quotidien"),
     detail:tr(fr,"The daily Mass for the Dead, with prayers adapted for all the faithful departed.","La messe quotidienne des défunts, avec des oraisons adaptées à tous les fidèles défunts.")})
   ]),
   caveat:sung?tr(fr,
    "For a sung or conventual Mass the first formulary is prescribed, even if it is not the priest's first Mass of the day.",
    "Pour une messe chantée ou conventuelle, le premier formulaire est prescrit, même si ce n'est pas la première messe célébrée ce jour-là."):
    tr(fr,"If the priest celebrates one Mass, he uses the first; if two, the first and second. The clock time never determines the formulary.",
    "Si le prêtre célèbre une messe, il emploie le premier formulaire ; s’il en célèbre deux, les premier et deuxième. L’heure ne détermine jamais le formulaire."),
   sourceUrl:"https://maternalheart.org/library/1962rubrics.pdf"
  });
 }
 return null;
}
export function arrangeMassEntryJourney(root,{language="en"}={}){
 if(!root||root.dataset.massJourneyArranged==="true")return false;
 const fr=String(language).startsWith("fr"),doc=root.ownerDocument;
 const q=name=>root.querySelector("["+name+"]");
 const title=q("data-full-mass-title");
 const context=q("data-mass-calendar-context");
 const calendar=q("data-mass-calendar-details");
 const selected=q("data-full-mass-celebration");
 const special=q("data-full-mass-special");
 const categories=q("data-full-mass-categories");
 const source=q("data-full-mass-source-slot");
 const categoryError=q("data-full-mass-category-error");
 const review=q("data-full-mass-review");
 const resolver=q("data-full-mass-resolver");
 const forms=q("data-full-mass-form-fieldset");
 const reader=q("data-full-mass-reader-fieldset");
 const rites=q("data-full-mass-rites");
 const note=q("data-full-mass-note");
 if([title,context,calendar,selected,special,categories,source,categoryError,review,resolver,forms,reader,rites,note].some(x=>!x))return false;
 const commemorations=context.querySelector("[data-mass-calendar-commemoration]");
 const prayerText=commemorations?.querySelector("[data-mass-calendar-commemoration-prayers]");
 if(commemorations&&prayerText){
  const details=node(doc,"details","aoMassJourneyCommemorationDetails");
  details.dataset.massJourneyCommemorationDetails="";
  const summary=node(doc,"summary","",
    tr(fr,"How this affects the Mass","Conséquences pour la messe"));
  summary.dataset.massJourneyCommemorationSummary="";
  details.append(summary,prayerText);
  commemorations.append(details);
 }
 const lead=node(doc,"section","aoMassJourneyIdentity");
 lead.dataset.massJourneyIdentity="";
 const choice=node(doc,"details","aoMassJourneyChange");
 choice.dataset.massJourneyChange="";
 choice.append(node(doc,"summary","",tr(fr,"Choose another celebration","Choisir une autre célébration")),categories,source,categoryError);
 const multiple=node(doc,"aside","aoMassJourneyMultiple");
 multiple.dataset.massJourneyMultiple="";
 multiple.hidden=true;
 const observed=node(doc,"p","aoMassJourneyObserved");
 observed.dataset.massJourneyObserved="";observed.hidden=true;
 const readiness=node(doc,"p","aoMassJourneyReadiness");
 readiness.dataset.massJourneyReadiness="";
 readiness.setAttribute("role","status");
 readiness.hidden=true;
 const kindKicker=node(doc,"small","aoMassJourneyKind");
 kindKicker.dataset.massJourneyKind="";
 const formIdentity=node(doc,"p","aoMassJourneyFormIdentity");
 formIdentity.dataset.massJourneyFormIdentity="";
 // The liturgical commemoration belongs to the selected Mass identity and
 // must never be hidden by the legacy host calendar layout on mobile.
 context.hidden=false;
 context.style.setProperty("display","grid","important");
 // A liturgical-identity warning (notably Good Friday) must be visible without\n // opening the separate Proper/source details disclosure.\n lead.append(kindKicker,selected,context,formIdentity,note,multiple,observed,readiness,choice);
 const focus=node(doc,"aside","aoMassJourneyEssential");
 focus.dataset.massJourneyEssential="";focus.hidden=true;
 focus.setAttribute("aria-label",tr(fr,"Particular ceremonies","Cérémonies particulières"));
 const focusHeading=node(doc,"small","aoMassJourneyEssentialKicker",
  tr(fr,"PARTICULAR CEREMONIES","CÉRÉMONIES PARTICULIÈRES"));
 const focusList=node(doc,"div","aoMassJourneyEssentialList");focusList.dataset.massJourneyEssentialList="";
 focus.append(focusHeading,focusList);
 const order=node(doc,"details","aoMassJourneyOrder");
 order.dataset.massJourneyOrder="";
 order.append(node(doc,"summary","aoMassJourneyHeading",
  tr(fr,"Celebration details","Détails de la célébration")));
 const before=node(doc,"div","aoMassJourneyPrayer");
 before.dataset.massJourneyBefore="";
 before.append(node(doc,"small","",tr(fr,"BEFORE MASS","AVANT LA MESSE")),
  node(doc,"strong","",tr(fr,"Prepare in prayer","Se préparer par la prière")),
  node(doc,"p","",tr(fr,"A short, standard or extended prayer before following the liturgy.","Une prière brève, normale ou approfondie avant de suivre la liturgie.")));
 const openPrep=node(doc,"button","aoMassJourneyTextAction",tr(fr,"Open prayers","Ouvrir les prières"));
 openPrep.type="button";openPrep.dataset.massJourneyOpenPreparation="";
 const beforeModes=node(doc,"fieldset","aoMassJourneyModes");
 beforeModes.dataset.massJourneyPrayerModes="prepare";
 const beforeLegend=node(doc,"legend","",tr(fr,"Choose prayer depth","Choisissez la longueur de la prière"));
 beforeLegend.dataset.massJourneyPrayerHeading="prepare";beforeModes.append(beforeLegend);
 for(const [mode,en,french] of [["quick","Short","Brève"],["standard","Standard","Normale"],["full","Extended","Approfondie"]]){
  const label=node(doc,"label","aoMassJourneyModeChoice");
  const input=node(doc,"input");input.type="radio";input.name="ao-mass-preparation-depth";
  input.value=mode;input.dataset.massJourneyPrayerMode="";
  input.dataset.massJourneyPrayerPhase="prepare";
  label.append(input,node(doc,"span","",tr(fr,en,french)));beforeModes.append(label);
 }
 const beforeDetail=node(doc,"details","aoMassJourneyDepth");
 beforeDetail.dataset.massJourneyPrayerOpen="prepare";
 beforeDetail.append(node(doc,"summary","",tr(fr,"Prayer length · Standard","Durée de prière · Normale")));
 beforeDetail.append(beforeModes);
 before.append(openPrep,beforeDetail);
 const beforePref=node(doc,"button","aoMassJourneySecondaryAction",tr(fr,"Prayer preferences","Préférences des prières"));
 beforePref.type="button";beforePref.dataset.rc2FlowPrefs="prepare";
 beforeDetail.append(beforePref);
 const adjacentBefore=node(doc,"div","aoMassJourneyAdjacent");adjacentBefore.dataset.massJourneyAdjacentBefore="";adjacentBefore.hidden=true;
 const riteBefore=node(doc,"div","aoMassJourneySpecialStage");riteBefore.dataset.massJourneySpecialBefore="";riteBefore.hidden=true;
 const mass=node(doc,"div","aoMassJourneyMass");
 mass.dataset.massJourneyMass="";
 const formDetail=node(doc,"details","aoMassJourneyFormDetail");
 formDetail.dataset.massJourneyFormDetail="";
 const formSummary=node(doc,"summary","",tr(fr,"Change Mass form","Modifier la forme de la messe"));
 formSummary.dataset.massJourneyFormSummary="";
 formDetail.append(formSummary,forms);
 mass.append(node(doc,"small","",tr(fr,"THE MASS","LA MESSE")),formDetail);
 const riteDuring=node(doc,"div","aoMassJourneySpecialStage");riteDuring.dataset.massJourneySpecialDuring="";
 riteDuring.hidden=true;mass.append(riteDuring);
 const riteAfter=node(doc,"div","aoMassJourneySpecialStage");riteAfter.dataset.massJourneySpecialAfter="";
 riteAfter.hidden=true;
 const adjacentAfter=node(doc,"div","aoMassJourneyAdjacent");adjacentAfter.dataset.massJourneyAdjacentAfter="";
 adjacentAfter.hidden=true;
 const after=node(doc,"div","aoMassJourneyPrayer aoMassJourneyThanksgiving");
 after.dataset.massJourneyAfter="";
 after.append(node(doc,"small","",tr(fr,"AFTER MASS","APRÈS LA MESSE")),
  node(doc,"strong","",tr(fr,"Thanksgiving","Action de grâces")),
  node(doc,"p","",tr(fr,"Prayers after Mass; configure their length now and pray them after the liturgy.","Prières après la messe : réglez leur durée maintenant et récitez-les après la liturgie.")));
 const afterModes=node(doc,"fieldset","aoMassJourneyModes");
 afterModes.dataset.massJourneyPrayerModes="thanksgiving";
 const afterLegend=node(doc,"legend","",tr(fr,"Choose prayer depth","Choisissez la longueur de la prière"));
 afterLegend.dataset.massJourneyPrayerHeading="thanksgiving";afterModes.append(afterLegend);
 for(const [mode,en,french] of [["quick","Short","Brève"],["standard","Standard","Normale"],["full","Extended","Approfondie"]]){
  const label=node(doc,"label","aoMassJourneyModeChoice");
  const input=node(doc,"input");input.type="radio";input.name="ao-mass-thanksgiving-depth";
  input.value=mode;input.dataset.massJourneyPrayerMode="";
  input.dataset.massJourneyPrayerPhase="thanksgiving";
  label.append(input,node(doc,"span","",tr(fr,en,french)));afterModes.append(label);
 }
 const afterDetail=node(doc,"details","aoMassJourneyDepth");
 afterDetail.dataset.massJourneyPrayerOpen="thanksgiving";
 afterDetail.append(node(doc,"summary","",tr(fr,"Plan thanksgiving · Standard","Préparer l’action de grâces · Normale")),afterModes);
 after.append(afterDetail);
 const afterPref=node(doc,"button","aoMassJourneyTextAction",tr(fr,"Thanksgiving preferences","Préférences de l’action de grâces"));
 afterPref.type="button";afterPref.dataset.rc2FlowPrefs="thanks";afterDetail.append(afterPref);
 const adjacent=node(doc,"details","aoMassJourneyAdjacentChoices");
 adjacent.dataset.massJourneyAdjacentChoices="";
 adjacent.append(node(doc,"summary","",tr(fr,"Other services at this church","Autres offices célébrés dans cette église")));
 const adjIntro=node(doc,"p","",tr(fr,
  "Only select services actually taking place. Adoration and Benediction remain separate from the Mass.",
  "Indiquez seulement les offices réellement célébrés. L’adoration et la bénédiction du Saint-Sacrement restent distinctes de la messe."));
 adjIntro.dataset.massJourneyAdjacentIntro="";
 adjacent.append(adjIntro);
 const adjacentOptions=node(doc,"div","aoMassJourneyAdjacentOptions");
 for(const [id,en,french] of [
  ["ADORATION_BEFORE","Adoration before Mass","Adoration avant la messe"],
  ["BENEDICTION_BEFORE","Benediction before Mass","Bénédiction avant la messe"],
  ["ADORATION_AFTER","Adoration after Mass","Adoration après la messe"],
  ["BENEDICTION_AFTER","Benediction after Mass","Bénédiction après la messe"]
 ]){
  const label=node(doc,"label","aoMassJourneyAdjacentChoice");
  const checkbox=node(doc,"input");checkbox.type="checkbox";checkbox.dataset.massJourneyAdjacentChoice=id;
  label.append(checkbox,node(doc,"span","",tr(fr,en,french)));adjacentOptions.append(label);
 }
 adjacent.append(adjacentOptions);
 order.append(adjacent,adjacentBefore,special,riteBefore,rites,mass,riteAfter,adjacentAfter,after);
 const participation=node(doc,"section","aoMassJourneyParticipation");
 participation.dataset.massJourneyParticipation="";
 participation.append(reader);
 const launch=node(doc,"div","aoMassJourneyBegin");
 launch.dataset.massJourneyBegin="";
 // Native reader mode belongs immediately before Begin. This prevents the
 // user from starting on a hidden default while the three modes sit below
 // the fold in the long ceremony timeline.
 const readerDetails=node(doc,"details","aoMassJourneyReaderChoice");
 readerDetails.dataset.massJourneyReaderChoice="";
 const readerSummary=node(doc,"summary","aoMassJourneyReaderSummary",
  tr(fr,"Following mode · LIVE","Mode de suivi · LIVE"));
 readerSummary.dataset.massJourneyReaderSummary="";
 readerDetails.append(readerSummary,participation);
 launch.append(readerDetails);
 const beginButton=node(doc,"button","aoMassJourneyBeginButton",
  tr(fr,"Begin the celebration","Commencer la célébration"));
 beginButton.type="button";beginButton.dataset.massJourneyStart="";
 launch.append(beginButton);
 const beginHelp=node(doc,"p","aoMassJourneyBeginHelp");
 beginHelp.dataset.massJourneyStartHelp="";beginHelp.hidden=true;
 launch.append(beginHelp);
 const sources=node(doc,"details","aoMassJourneySources");
 sources.dataset.massJourneySources="";
 sources.append(node(doc,"summary","",tr(fr,"Proper and sources","Propre et sources")),review,resolver);
 // Keep Calendar directly reachable without first expanding another disclosure.
 // Move the existing DOM islands through a detached fragment before clearing
 // their former host; this preserves the 1962 Calendar/celebration identity and
 // the six real category controls as one stable subtree.
 const assembled=doc.createDocumentFragment();
 assembled.append(title,lead,calendar,focus,before,order,sources,launch);
 root.replaceChildren(assembled);
 if(!root.querySelector("[data-full-mass-celebration]")||
    !root.querySelector("[data-mass-calendar-context]")||
    root.querySelectorAll("[data-full-mass-category]").length<5){
   throw new Error("MASS_ENTRY_IDENTITY_ASSEMBLY_INCOMPLETE");
 }
 root.dataset.massJourneyArranged="true";
 return true;
}
export function updateMassJourneyNotice(root,legacy,{language="en",kind="CALENDAR",form=null}={}){
 const target=root?.querySelector("[data-mass-journey-multiple]");
 if(!target)return null;
 const model=multipleMassNotice(legacy,{language,kind,form});
 const identity=[String(legacy?.date??""),kind,String(form??""),String(language)].join("|");
 if(target.dataset.massJourneyNoticeKey===identity)return model;
 target.dataset.massJourneyNoticeKey=identity;
 target.hidden=!model;
 target.replaceChildren();
 if(!model){delete target.dataset.multipleMassKind;return null;}
 const doc=target.ownerDocument;
 target.dataset.multipleMassKind=model.id;
 target.append(node(doc,"strong","",model.heading),node(doc,"p","",model.detail));
 const formularyDetail=node(doc,"details","aoMassJourneyFormularyDetail");
 formularyDetail.dataset.massJourneyFormularyDetail="";
 formularyDetail.append(node(doc,"summary","",
  String(language).startsWith("fr")?"Comparer les trois formulaires":"Compare the three formularies"));
 const formularyList=node(doc,"ol","aoMassJourneyFormularies");
 for(const option of model.options){
  const item=node(doc,"li","aoMassJourneyFormulary");
  item.dataset.massJourneyFormulary=option.id;
  item.append(node(doc,"strong","",option.label),node(doc,"small","",option.detail));
  formularyList.append(item);
 }
 formularyDetail.append(formularyList);
 const warning=node(doc,"p","aoMassJourneyFormularyCaveat",model.caveat);
 warning.dataset.massJourneyFormularyCaveat="";
 target.append(warning);
 const citation=node(doc,"a","aoMassJourneyCitation",
  String(language).startsWith("fr")?"Source rubricale de 1962":"1962 rubrical source");
 citation.href=model.sourceUrl;citation.target="_blank";citation.rel="noopener noreferrer";
 formularyDetail.append(citation);
 const limitation=node(doc,"p","aoMassJourneyVariantLimit",
  String(language).startsWith("fr")?
   "Ces cartes décrivent les formulaires, mais ne les sélectionnent pas. Vérifiez que le propre affiché correspond à la messe réellement célébrée.":
   "These cards explain the formularies but do not select them. Verify that the displayed Proper matches the Mass actually celebrated.");
 limitation.dataset.massJourneyVariantLimit="";
 formularyDetail.append(limitation);
 target.append(formularyDetail);
 return model;
}
export function translateMassEntryJourney(root,{language="en"}={}){
 if(!root)return false;
 const fr=String(language).startsWith("fr");
 const set=(selector,en,french)=>{
  const target=root.querySelector(selector);
  if(target)target.textContent=tr(fr,en,french);
 };
 set("[data-mass-journey-change]>summary","Choose another celebration","Choisir une autre célébration");
 set("[data-mass-journey-order]>.aoMassJourneyHeading","Celebration details","Détails de la célébration");
 set("[data-mass-journey-before]>small","BEFORE MASS","AVANT LA MESSE");
 set("[data-mass-journey-before]>strong","Prepare in prayer","Se préparer par la prière");
 set("[data-mass-journey-before]>p","A short, standard or extended prayer before following the liturgy.","Une prière brève, normale ou approfondie avant de suivre la liturgie.");
 set("[data-mass-journey-open-preparation]","Open prayers","Ouvrir les prières");
 set("[data-mass-journey-before]>[data-rc2-flow-prefs]","Prayer preferences","Préférences des prières");
 set("[data-mass-journey-mass]>small","THE MASS","LA MESSE");
 set("[data-mass-journey-after]>small","AFTER MASS","APRÈS LA MESSE");
 set("[data-mass-journey-after]>strong","Thanksgiving","Action de grâces");
 set("[data-mass-journey-after]>p","Prayers after Mass; configure their length now and pray them after the liturgy.","Prières après la messe : réglez leur durée maintenant et récitez-les après la liturgie.");
 set("[data-mass-journey-after]>[data-rc2-flow-prefs]","Thanksgiving preferences","Préférences de l’action de grâces");
 set("[data-mass-journey-sources]>summary","Calendar, Proper and sources","Calendrier, propre et sources");
 set("[data-mass-journey-start]","Begin the celebration","Commencer la célébration");
 set("[data-mass-journey-commemoration-summary]","How this affects the Mass","Conséquences pour la messe");
 set("[data-mass-journey-essential]>.aoMassJourneyEssentialKicker","PARTICULAR CEREMONIES","CÉRÉMONIES PARTICULIÈRES");
 return true;
}

export function updateMassJourneyReadiness(root,{ready=true,sourceReady=true,language="en"}={}){
 const node=root?.querySelector("[data-mass-journey-readiness]");
 if(!node)return "UNAVAILABLE";
 const fr=String(language).startsWith("fr");
 const status=!sourceReady?"SOURCE_SELECTION_PENDING":!ready?"PROPER_PENDING":"READY";
 node.hidden=status==="READY";
 node.textContent=status==="SOURCE_SELECTION_PENDING"?
  tr(fr,"Choose a complete Mass Proper before starting.","Choisissez un propre de messe complet avant de commencer."):
  status==="PROPER_PENDING"?
  tr(fr,"The selected Mass is not ready to begin; its liturgical texts are still being resolved.","Cette messe ne peut pas encore commencer ; ses textes liturgiques restent à vérifier."):"";
 root.dataset.massJourneyReadiness=status;
 return status;
}


const BEFORE_PHASES=new Set(["palm","ash","candlemas","rogations","asperges","ev-light","ev-lessons"]);
const DURING_PHASES=new Set(["req","nuptial-mass","nuptial-pater","nuptial-final",
 "votive-proper","gf-lessons","gf-orations","gf-cross","gf-communion"]);
const AFTER_PHASES=new Set(["absolution","holy-thursday","corpus","procession","ev-lauds"]);
const ALREADY_MASS_PHASES=new Set(["mass","ev-mass"]);
const OPTION_PHASES=Object.freeze({asperges:"ASPERGES",absolution:"REQUIEM_ABSOLUTION",
 corpus:"CORPUS_CHRISTI_PROCESSION",procession:"GENERIC_PROCESSION"});
// This is placement of source-provided PRESENTATION phases, never creation of
// liturgical actions. Unknown phases are left in the source-owned summary.
export function groupCeremonialPhases(presentation,availableRiteIds=[]){
 const before=[],during=[],after=[],unplaced=[],omitted=[];
 const available=new Set(availableRiteIds);
 for(const phase of presentation?.phases??[]){
  const id=String(phase?.id??"");
  if(!id||typeof phase.label!=="string")continue;
  if(ALREADY_MASS_PHASES.has(id)||available.has(OPTION_PHASES[id])){
   omitted.push(phase);continue;
  }
  if(BEFORE_PHASES.has(id))before.push(phase);
  else if(DURING_PHASES.has(id))during.push(phase);
  else if(AFTER_PHASES.has(id))after.push(phase);
  else unplaced.push(phase);
 }
 return Object.freeze({
  before:Object.freeze(before),during:Object.freeze(during),
  after:Object.freeze(after),unplaced:Object.freeze(unplaced),
  omitted:Object.freeze(omitted)
 });
}
export function updateMassJourneyPhases(root,presentation,{language="en",availableRiteIds=[]}={}){
 if(!root)return null;
 const fr=String(language).startsWith("fr");
 const grouped=groupCeremonialPhases(presentation,availableRiteIds);
 const distinct= presentation?.kind==="GOOD_FRIDAY";
 const special=root.querySelector("[data-full-mass-special]");
 const original=special?.querySelector(".aoSpecialMassSequence");
 // Retain the source-owned original element for tests and provenance.
 // Hide its screen-reader and visual copy only if every phase is placed.
 if(original){
  original.hidden=grouped.unplaced.length===0;
  if(original.hidden)original.setAttribute("aria-hidden","true");
  else original.removeAttribute("aria-hidden");
 }
 const write=(attr,items,heading)=>{
  const target=root.querySelector("["+attr+"]");
  if(!target)return;
  target.replaceChildren();target.hidden=items.length===0;
  if(!items.length)return;
  if(heading)target.append(node(target.ownerDocument,"small","aoMassJourneyPhaseHeading",heading));
  const list=node(target.ownerDocument,"ol","aoMassJourneyPhaseList");
  for(const item of items){const entry=node(target.ownerDocument,"li","",item.label);entry.dataset.massJourneyPhase=item.id;list.append(entry)}
  target.append(list);
 };
 write("data-mass-journey-special-before",distinct?grouped.during:grouped.before,
  distinct?tr(fr,"THE GOOD FRIDAY LITURGY","OFFICE DU VENDREDI SAINT"):
  tr(fr,"BEFORE MASS","AVANT LA MESSE"));
 write("data-mass-journey-special-during",distinct?[]:grouped.during,
  tr(fr,"WITHIN THE MASS","PENDANT LA MESSE"));
 write("data-mass-journey-special-after",grouped.after,
  tr(fr,"FOLLOWING THE MASS","APRÈS LA MESSE"));
 const before=root.querySelector("[data-mass-journey-before]");
 if(before){
  const label=before.querySelector("small");
  if(label)label.textContent=distinct?tr(fr,"BEFORE THE LITURGY","AVANT L’OFFICE"):tr(fr,"BEFORE MASS","AVANT LA MESSE");
  const text=before.querySelector("p");
  if(text)text.textContent=distinct?
   tr(fr,"Prayers before the solemn Good Friday liturgy, which is not a Mass.",
    "Prières avant l’office solennel du Vendredi saint, qui n’est pas une messe."):
   tr(fr,"A short, standard or extended prayer before following the liturgy.",
    "Une prière brève, normale ou approfondie avant de suivre la liturgie.");
 }
 const mass=root.querySelector("[data-mass-journey-mass]");
 if(mass)mass.hidden=distinct;
 const after=root.querySelector("[data-mass-journey-after]");
 if(after){
  after.dataset.massJourneyDistinct=String(distinct);
  const pref=after.querySelector("[data-rc2-flow-prefs]");
  if(pref)pref.hidden=distinct;
  const thanksgivingDepth=after.querySelector('[data-mass-journey-prayer-open="thanksgiving"]');
  if(thanksgivingDepth)thanksgivingDepth.hidden=distinct;
  const set=(sel,text)=>{const el=after.querySelector(sel);if(el)el.textContent=text};
  set("small",distinct?tr(fr,"AFTER THE LITURGY","APRÈS L’OFFICE"):tr(fr,"AFTER MASS","APRÈS LA MESSE"));
  set("strong",distinct?tr(fr,"Personal prayer","Prière personnelle"):tr(fr,"Thanksgiving","Action de grâces"));
  set("p",distinct?
   tr(fr,"Remain in prayer after the solemn liturgy; this is not a Mass thanksgiving.",
    "Restez en prière après l’office solennel ; il ne s’agit pas de l’action de grâces après une messe."):
   tr(fr,"Prayers after Mass; configure their length now and pray them after the liturgy.",
    "Prières après la messe : réglez leur durée maintenant et récitez-les après la liturgie."));
  set("[data-rc2-flow-prefs]",tr(fr,"Thanksgiving preferences","Préférences de l’action de grâces"));
 }
 const order=root.querySelector("[data-mass-journey-order]>.aoMassJourneyHeading");
 if(order)order.textContent=distinct?tr(fr,"Details of the Good Friday liturgy","Détails de l’office du Vendredi saint"):
  tr(fr,"Celebration details","Détails de la célébration");
 root.dataset.massJourneyDistinctLiturgy=String(distinct);
 return grouped;
}


export function updateMassJourneyObserved(root,legacy,{language="en"}={}){
 const target=root?.querySelector("[data-mass-journey-observed]");
 if(!target)return false;
 const reported=legacy?.sourceDiagnostics?.actualMassSelection==="OBSERVED_SOURCE_DAY";
 // A selected alternative Proper must expose its source review on phone.
 const sources=root.querySelector("[data-mass-journey-sources]");
 if(reported&&sources){sources.open=true;if(sources.dataset)sources.dataset.massJourneyAutoOpened="true";}
 else if(sources?.dataset?.massJourneyAutoOpened==="true"){
  sources.open=false;delete sources.dataset.massJourneyAutoOpened;
 }
 target.hidden=!reported;
 target.textContent=reported?
  tr(String(language).startsWith("fr"),
   "This is the Mass you reported seeing, not a verification of its local rubrical permission.",
   "Il s’agit de la messe que vous avez indiquée, non d’une vérification de son autorisation rubricale locale."):"";
 root.dataset.massJourneyObservedSource=String(reported);
 return reported;
}


// This is a presentation proxy for the existing host Start control. It never
// bypasses source readiness, mutates the Mass plan, or dispatches Mass logic.
export function projectMassEntryLaunch(root,{
 ready=false,sourceReady=false,hostStartAvailable=false,
 formLabel="",language="en",distinctLiturgy=false
}={}){
 if(!root)return null;
 const fr=String(language).startsWith("fr");
 const begin=root.querySelector("[data-mass-journey-start]");
 const help=root.querySelector("[data-mass-journey-start-help]");
 const summary=root.querySelector("[data-mass-journey-form-summary]");
 const identity=root.querySelector("[data-mass-journey-form-identity]");
 if(identity){identity.textContent=distinctLiturgy?"":(formLabel||"");identity.hidden=Boolean(distinctLiturgy);}
 if(summary)summary.textContent=fr?("Forme · "+(formLabel||"À confirmer")+" · Modifier"):
   ("Form · "+(formLabel||"Confirm")+" · Change");
 const allowed=ready===true&&sourceReady===true&&hostStartAvailable===true;
 if(begin){
  begin.disabled=!allowed;
  begin.textContent=distinctLiturgy?tr(fr,"Begin the liturgy","Commencer l’office"):
   tr(fr,"Begin the Mass","Commencer la messe");
 }
 if(help){
  help.hidden=allowed;
  help.textContent=!sourceReady?tr(fr,
   "Confirm the actual Proper before beginning.","Confirmez le propre réellement célébré avant de commencer."):
   !ready?tr(fr,"The selected celebration is not yet ready.","Cette célébration n’est pas encore prête."):
   !hostStartAvailable?tr(fr,"The Mass start control is not available yet.","Le démarrage de la messe n’est pas encore disponible."):"";
 }
 root.dataset.massJourneyStartReady=String(allowed);
 return Object.freeze({ready:allowed,reason:allowed?null:
  !sourceReady?"SOURCE_PENDING":!ready?"MASS_PENDING":"HOST_UNAVAILABLE"});
}

  
// Exceptional ceremonial context is prominent only when source-present or
// explicitly selected. Ordinary Masses have no invented ceremony checklist.
export function projectMassEntryEssentials(root,presentation,{
 language="en",availableRiteIds=[],confirmedRites=[],kind="CALENDAR"
}={}){
 const fr=String(language).startsWith("fr");
 const target=root?.querySelector?.("[data-mass-journey-essential]");
 if(target?.setAttribute)target.setAttribute("aria-label",fr?"Cérémonies particulières":"Particular ceremonies");
 const list=target?.querySelector?.("[data-mass-journey-essential-list]");
 if(!list)return Object.freeze({count:0,shown:0,labels:[]});
 const grouped=groupCeremonialPhases(presentation,availableRiteIds);
 const phases=[...grouped.before,...grouped.during,...grouped.after];
 const labels=[...phases.map(p=>p.label),...confirmedRites.map(x=>x?.label).filter(Boolean)];
 const unique=[...new Set(labels)];
 const kicker=target.querySelector(".aoMassJourneyEssentialKicker");
 if(kicker)kicker.textContent=kind==="GOOD_FRIDAY"?
  tr(fr,"THE SOLEMN LITURGY","L’OFFICE SOLENNEL"):
  tr(fr,"PARTICULAR CEREMONIES","CÉRÉMONIES PARTICULIÈRES");
 list.replaceChildren();
 target.hidden=unique.length===0;
 for(const label of unique.slice(0,3))
  list.append(node(target.ownerDocument,"p","aoMassJourneyEssentialItem",label));
 if(unique.length>3)list.append(node(target.ownerDocument,"small","aoMassJourneyEssentialMore",
  fr?"Et "+(unique.length-3)+" autres dans les détails de la célébration":
     "And "+(unique.length-3)+" more in celebration details"));
 return Object.freeze({count:unique.length,shown:Math.min(3,unique.length),labels:unique});
}
export function projectMassEntryReader(root,{mode="LIVE",language="en",distinct=false}={}){
 const reader=root?.querySelector?.("[data-mass-journey-reader-summary]");
 if(!reader)return null;
 const valid=["MISSAL","SIMPLE","LIVE"].includes(mode)?mode:"LIVE";
 const fr=String(language).startsWith("fr");
 const label=valid==="MISSAL"?(fr?"Missel":"Missal"):valid==="SIMPLE"?"Simple":"LIVE";
 reader.textContent=fr?(distinct?"Suivre l’office · ":"Suivre la messe · ")+label:
  (distinct?"Follow the liturgy · ":"Follow the Mass · ")+label;
 return Object.freeze({mode:valid,label});
}

export function projectMassEntryDetails(root,{
 kind="CALENDAR",optionCount=0,language="en"
}={}){
 const fr=String(language).startsWith("fr");
 const el=root?.querySelector?.("[data-mass-journey-order]>.aoMassJourneyHeading");
 if(!el)return null;
 const base=kind==="GOOD_FRIDAY"?
  tr(fr,"Good Friday rites","Office du Vendredi saint"):
  tr(fr,"Celebration details","Détails de la célébration");
 const count=Math.max(0,Math.trunc(Number(optionCount)||0));
 el.textContent=count?base+(fr?" · "+count+" rite"+(count>1?"s":"")+" facultatif"+(count>1?"s":""):
  " · "+count+" optional rite"+(count>1?"s":"")):base;
 return Object.freeze({kind,count,label:el.textContent});
}
