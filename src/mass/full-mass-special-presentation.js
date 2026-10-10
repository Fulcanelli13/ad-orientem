// Source-led liturgical UI context. Describes the *resolved* celebration,
// not an alternate Mass sequence; the session engine alone owns rites/cues.
// A calendar label NEVER activates a physical ceremony.
const tr=(fr,en,frText)=>fr?frText:en;
const norm=x=>String(x??"").trim().toUpperCase().replace(/[\s-]+/g,"_");
const contains=(items,id)=>Array.isArray(items)&&items.some(x=>norm(x).includes(id));
const derivedFromLegacy=(legacy)=>{
 const inserted=legacy?.insertedRites??[];
 const preceding=[];
 const following=[];
 for(const item of inserted){
  const x=norm(item);
  if(x.includes("ASPERGES"))preceding.push("ASPERGES");
  if(x.includes("PALM"))preceding.push("PALM");
  if(x.includes("ASH"))preceding.push("ASH");
  if(x.includes("CANDLEMAS")||x.includes("CANDLE"))preceding.push("CANDLEMAS");
  if(x.includes("ROGATION")||x.includes("LITAN"))preceding.push("ROGATIONS");
  if(x.includes("HOLY_THURSDAY")||x.includes("ALTAR_REPOSE"))following.push("HOLY_THURSDAY_POST");
  if(x.includes("REQUIEM")&&x.includes("ABSOLUTION"))following.push("REQUIEM_ABSOLUTION");
  if(x.includes("CORPUS")&&x.includes("PROCESSION"))following.push("CORPUS_CHRISTI_PROCESSION");
 }
 return {preceding,following};
};
function detectKind(src,mode){
 if(mode==="reader"){
  const resolved=src?.session?.resolvedMass??{};
  if(resolved.distinctRite==="GOOD_FRIDAY")return "GOOD_FRIDAY";
  if(resolved.distinctRite==="EASTER_VIGIL")return "EASTER_VIGIL";
  if(resolved.overlays?.includes("REQUIEM"))return "REQUIEM";
  if(resolved.overlays?.includes("NUPTIAL"))return "NUPTIAL";
  if(resolved.overlays?.includes("VOTIVE_PROPER"))return "VOTIVE";
  return "CALENDAR";
 }
 const profile=norm(src?.exceptionalProfile);
 if(profile.includes("GOOD_FRIDAY"))return "GOOD_FRIDAY";
 if(profile.includes("EASTER_VIGIL"))return "EASTER_VIGIL";
 const type=norm(src?.celebrationType);
 const id=norm(src?.celebrationId);
 if(type==="REQUIEM")return "REQUIEM";
 if(type==="NUPTIAL"||id==="NUPTIAL")return "NUPTIAL";
 if(type==="VOTIVE")return "VOTIVE";
 return "CALENDAR";
}
export function specialMassPresentation(source,{
 language="en",mode="preflight",kind=null,selectedRites=null,
}={}){
 const fr=String(language).toLowerCase().startsWith("fr");
 const reader=mode==="reader";
 const data=reader?source?.session?.resolvedMass??{}:source??{};
 const plan=reader?source?.session?.plan??{}:{};
 const inherited=derivedFromLegacy(data);
 const before=reader?(data.precedingRites??plan.precedingGraphs??[]):inherited.preceding;
 const after=reader?(data.followingActions??plan.followingGraphs??[]):inherited.following;
 // The native preflight passes *effective* optional choices, never merely date-derived suggestions.
 const chosen=selectedRites??{};
 const preceding=new Set([...before,...(chosen.precedingRites??[])].map(norm));
 const following=new Set([...after,...(chosen.followingActions??[])].map(norm));
 if(!reader){
  for(const id of ["ASPERGES"]){
   if(Array.isArray(chosen.precedingRites)&&!chosen.precedingRites.includes(id))preceding.delete(id);
  }
  for(const id of ["REQUIEM_ABSOLUTION","CORPUS_CHRISTI_PROCESSION","GENERIC_PROCESSION"]){
   if(Array.isArray(chosen.followingActions)&&!chosen.followingActions.includes(id))following.delete(id);
  }
 }
 const currentKind=kind??detectKind(source,mode);
 const sourceTitle=reader
  ?data.requestedCelebration?.title??data.calendarCelebration?.title??null
  :data.actualCelebration?.title??data.celebrationTitle??data.calendarDay?.title??null;
 const actualId=reader?data.requestedCelebration?.id:data.celebrationId;
 const title=typeof sourceTitle==="string"&&sourceTitle.trim()
  ?sourceTitle.trim():null;
 const phases=[];
 const add=(id,en,frText)=>{if(!phases.some(x=>x.id===id))phases.push(Object.freeze({id,label:tr(fr,en,frText)}));};
 const extra=[];
 let heading="",intro="",variant=currentKind;
 if(currentKind==="GOOD_FRIDAY"){
  heading=tr(fr,"Good Friday — Solemn Liturgy","Vendredi saint — Action liturgique solennelle");
  intro=tr(fr,"This is not Mass. Its own 1962 rites and order replace the Ordinary of Mass.",
    "Ce n’est pas la messe. Son ordre liturgique de 1962 remplace l’Ordinaire de la messe.");
  add("gf-lessons","Lessons and Passion","Lectures et Passion");
  add("gf-orations","Solemn prayers","Oraisons solennelles");
  add("gf-cross","Veneration of the Cross","Adoration de la Croix");
  add("gf-communion","Communion rite","Rite de la communion");
 }else if(currentKind==="EASTER_VIGIL"){
  heading=tr(fr,"Easter Vigil","Vigile pascale");
  intro=tr(fr,"The Vigil is a composite celebration: its ceremonies lead into the Mass and Lauds; it does not begin as an ordinary Mass.",
    "La Vigile forme une célébration composée : ses cérémonies conduisent à la messe puis aux Laudes ; elle ne commence pas comme une messe ordinaire.");
  add("ev-light","Blessing of new fire and Paschal candle","Bénédiction du feu nouveau et du cierge pascal");
  add("ev-lessons","Prophecies and litanies","Prophéties et litanies");
  add("ev-mass","Vigil Mass","Messe de la Vigile");
  add("ev-lauds","Lauds","Laudes");
 }else{
  if(preceding.has("PALM"))add("palm","Blessing of palms and procession","Bénédiction des rameaux et procession");
  if(preceding.has("ASH"))add("ash","Blessing and distribution of ashes","Bénédiction et imposition des cendres");
  if(preceding.has("CANDLEMAS"))add("candlemas","Blessing of candles and procession","Bénédiction des cierges et procession");
  if(preceding.has("ROGATIONS"))add("rogations","Litanies or Rogation procession","Litanies ou procession des Rogations");
  if(preceding.has("ASPERGES"))add("asperges","Sunday aspersion","Aspersion dominicale");
  switch(currentKind){
   case "REQUIEM":{
    heading=tr(fr,"Mass for the Dead","Messe des défunts");
    intro=tr(fr,"The Requiem Proper and its own responses replace the corresponding ordinary branches. The rubrical resolver determines the class and whether Dies iræ is required.",
      "Le propre du Requiem et ses réponses remplacent les parties correspondantes. Le résolveur rubrical fixe la classe et l’obligation éventuelle du Dies iræ.");
    const cl=reader?data.provenance?.requiemClass:data.requiemClass;
    if([1,2,3,4,"I","II","III","IV"].includes(cl)){
      const roman={1:"I",2:"II",3:"III",4:"IV"};
      extra.push(tr(fr,"Requiem class: ","Classe du Requiem : ")+(roman[cl]??cl));
    }
    add("req","Requiem Proper and responses","Propre et réponses du Requiem");
    if(following.has("REQUIEM_ABSOLUTION"))add("absolution","Absolution after Mass","Absoute après la messe");
    else extra.push(tr(fr,"Absolution is not added unless this rite actually follows Mass.",
      "L’absoute n’est pas ajoutée si elle ne suit pas effectivement la messe."));
    break;
   }
   case "NUPTIAL":
    heading=tr(fr,"Nuptial celebration","Célébration nuptiale");
    intro=tr(fr,"The selected Mass and its rubrical permission govern the nuptial prayers. In the certified nuptial branch, the blessings occur at their appointed places, not in a separate generic appendix.",
      "La messe choisie et son autorisation rubricale gouvernent les prières nuptiales. Dans la branche nuptiale certifiée, les bénédictions s’insèrent à leur place prévue et non dans un appendice générique.");
    add("nuptial-mass","Resolved Mass Proper","Propre de la messe résolue");
    add("nuptial-pater","Nuptial blessings after Pater noster","Bénédictions nuptiales après le Pater noster");
    add("nuptial-final","Blessing of the spouses","Bénédiction des époux");
    break;
   case "VOTIVE":
    heading=tr(fr,"Votive Mass","Messe votive");
    intro=tr(fr,"The chosen intention determines a source-resolved Proper. Its seasonal variant and permission are decided before the Mass, not changed inside the reader.",
      "L’intention choisie détermine un propre résolu par les sources. Sa variante saisonnière et sa permission sont fixées avant la messe et non modifiées dans le lecteur.");
    add("votive-proper","Selected votive Proper","Propre votif choisi");
    break;
   default:
    heading=tr(fr,"Mass of the day","Messe du jour");
    intro=tr(fr,"The 1962 calendar appoints the Proper; only source-identified associated rites appear in this sequence.",
      "Le calendrier de 1962 détermine le propre ; seuls les rites associés attestés par la source figurent ici.");
    break;
  }
  add("mass","Celebration of Mass","Célébration de la messe");
  if(following.has("HOLY_THURSDAY_POST")){
   variant="HOLY_THURSDAY";
   add("holy-thursday","Transfer to the Altar of Repose","Transfert au reposoir");
  }
  if(following.has("CORPUS_CHRISTI_PROCESSION")){
   variant="CORPUS_CHRISTI_PROCESSION";
   add("corpus","Eucharistic procession and Benediction","Procession eucharistique et bénédiction");
  }
  if(following.has("GENERIC_PROCESSION"))add("procession","Following procession","Procession après la messe");
 }
 if(currentKind==="CALENDAR"&&preceding.has("PALM"))variant="PALM";
 else if(currentKind==="CALENDAR"&&preceding.has("ASH"))variant="ASH";
 else if(currentKind==="CALENDAR"&&preceding.has("CANDLEMAS"))variant="CANDLEMAS";
 else if(currentKind==="CALENDAR"&&preceding.has("ROGATIONS"))variant="ROGATIONS";
 const distinct=currentKind!=="CALENDAR"||variant!=="CALENDAR"||preceding.size>0||following.size>0;
 return Object.freeze({
  schema:"ao-mass-special-presentation-v1",kind:currentKind,variant,distinct,
  heading,intro,title: title??(actualId&&actualId!=="mass_of_day"?String(actualId):null),
  phases:Object.freeze(phases),notes:Object.freeze(extra),
  available:reader?true:data.canStart===true,
  sourceOwned:true,
 });
}


// Rendering is presentation-only: never changes a liturgical selection.
export function renderSpecialMassContext(target,model,{compact=false}={}){
 if(!target?.ownerDocument || !model)throw new TypeError("Special Mass context requires DOM and projection");
 const doc=target.ownerDocument;
 target.hidden=!model.distinct;
 target.dataset.specialMassVariant=model.variant;
 target.setAttribute("aria-label",model.heading);
 if(!model.distinct){target.replaceChildren();return false;}
 const head=doc.createElement(compact?"strong":"h3");
 head.className="aoSpecialMassHeading";head.textContent=model.heading;
 const line=doc.createElement("p");line.className="aoSpecialMassExplanation";line.textContent=model.intro;
 const sequence=doc.createElement("ol");sequence.className="aoSpecialMassSequence";
 for(const phase of model.phases){
  const li=doc.createElement("li");li.dataset.aoSpecialPhase=phase.id;
  li.textContent=phase.label;sequence.append(li);
 }
 const notes=doc.createElement("div");notes.className="aoSpecialMassNotes";
 for(const note of model.notes){
  const p=doc.createElement("p");p.textContent=note;notes.append(p);
 }
 target.replaceChildren(head,line,sequence,notes);
 return true;
}
