/**
 * Missal-only projection of the nineteen *already certified* R18 Solemn
 * minister events. Does not import the 67-event exploratory register.
 * The existing R18 controller alone decides Requiem form exceptions.
 */
export const SOLEMN_MISSAL_MINISTER_OWNER="R18_CERTIFIED_SOLEMN_MISSAL";
const VALID_IDS=new Set([
 "SMIN-001","SMIN-002","SMIN-003","SMIN-004","SMIN-005",
 "SMIN-006","SMIN-007","SMIN-008","SMIN-009","SMIN-010",
 "SMIN-011","SMIN-012","SMIN-013","SMIN-014","SMIN-015",
 "SMIN-016","SMIN-017","SMIN-018","SMIN-019"
]);
const FR=Object.freeze({
 "SMIN-001":"Le thuriféraire présente l’encens ; le diacre assiste le célébrant pour l’imposition et la bénédiction.",
 "SMIN-002":"Le diacre et le thuriféraire assistent le célébrant pendant le premier encensement de l’autel.",
 "SMIN-003":"Le sous-diacre chante l’Épître à l’endroit prescrit.",
 "SMIN-004":"Après l’Épître, le sous-diacre revient recevoir la bénédiction du célébrant.",
 "SMIN-005":"Le diacre se prépare à l’Évangile et récite Munda cor meum.",
 "SMIN-006":"Avant la procession de l’Évangile, le diacre reçoit la bénédiction du célébrant.",
 "SMIN-007":"Les ministres sacrés se disposent pour la procession de l’Évangile.",
 "SMIN-008":"Le diacre proclame l’Évangile ; le célébrant ne le répète pas.",
 "SMIN-009":"Les ministres sacrés assistent le célébrant pendant l’encensement de l’offertoire.",
 "SMIN-010":"Le diacre soulève la chasuble ; le sous-diacre et les porte-flambeaux s’agenouillent pendant l’élévation de l’Hostie.",
 "SMIN-011":"Le diacre soulève la chasuble ; le sous-diacre et les porte-flambeaux demeurent à genoux pendant l’élévation du calice.",
 "SMIN-012":"Le sous-diacre remet la patène au diacre, qui la présente au célébrant.",
 "SMIN-013":"Après la prière pour la paix, le célébrant donne la paix au diacre, qui la transmet au sous-diacre puis au clergé.",
 "SMIN-014":"Le diacre assiste le célébrant et tient la patène de communion ; les ministres sacrés communient dans l’ordre prescrit.",
 "SMIN-015":"Le sous-diacre verse le vin et l’eau pour les ablutions, puis réunit les objets du calice ; le diacre transporte le missel.",
 "SMIN-016":"Le diacre chante la formule de renvoi.",
 "SMIN-017":"Le sous-diacre donne la réponse prescrite pendant que le célébrant lit le Dernier Évangile à voix basse.",
 "SMIN-018":"Le sous-diacre donne la réponse prescrite au Dernier Évangile.",
 "SMIN-019":"Le sous-diacre répond Deo gratias à la fin du Dernier Évangile.",
});
const REQUIEM_FR=Object.freeze({
 "SMIN-004":"Après l’Épître, le sous-diacre revient sans recevoir la bénédiction du célébrant.",
 "SMIN-007":"À la procession de l’Évangile, on ne porte ni encens ni cierges allumés ; les acolytes entourent le livre des Évangiles.",
 "SMIN-009":"Les ministres sacrés assistent l’encensement de l’offertoire. Seul le célébrant est encensé, non le chœur ni les fidèles.",
 "SMIN-010":"À l’élévation de l’Hostie, le sous-diacre, agenouillé du côté de l’épître, encense le Saint-Sacrement de trois coups doubles avec inclination avant et après ; le diacre assiste le célébrant.",
 "SMIN-011":"À l’élévation du Calice, le sous-diacre, toujours agenouillé du côté de l’épître, encense le Saint-Sacrement de trois coups doubles avec inclination avant et après ; le diacre assiste le célébrant.",
});
const APPROVED_SOURCE="https://archive.ccwatershed.org/pdfs/5276-ritus-servandus-translated-english/download/";
const isCue=x=>/^AO\.SM\.C\d{4}$/.test(String(x??""));
const dataOf=x=>x?.data??x;

/** One static Missal annotation at the original certified anchor, never a
 * scroll-derived observation. Return no extra entries if source ownership fails. */
export function withCertifiedSolemnMissalMinisters(paragraphs,{
 formStateData=null,cueState=null,form=null,language="en",
}={}){
 if(!Array.isArray(paragraphs))return Object.freeze([]);
 if(String(form??"").toUpperCase()!=="SOLEMN")return Object.freeze(paragraphs);
 const data=dataOf(formStateData),source=data?.solemn;
 if(data?.schema!=="ao-r18-reader-form-state-v1" ||
    source?.sacredMinisterDeltaCount!==19 ||
    !Array.isArray(source.ministerEvents) ||
    source.ministerEvents.length!==19 ||
    new Set(source.ministerEvents.map(e=>e.id)).size!==19 ||
    !source.ministerEvents.every(e=>VALID_IDS.has(e.id) &&
       (e.authorityStatus==="RECOVERED_R04_CERTIFIED" ||
        e.authorityStatus==="CERTIFIED_PRIMARY_1962_RUBRIC")) ||
    typeof cueState?.project!=="function" ||
    cueState.form!=="SOLEMN")return Object.freeze(paragraphs);
 const french=String(language).toLowerCase().startsWith("fr");
 const anchors=new Map();
 for(const event of source.ministerEvents){
  // Range events belong to the FIRST source cue, never five repetitions.
  const cue=event.cue??event.cueRange?.[0];
  if(!isCue(cue)||anchors.has(cue))return Object.freeze(paragraphs);
  anchors.set(cue,event);
 }
 return Object.freeze(paragraphs.map(p=>{
   const ids=Array.isArray(p.sourceCueIds)?p.sourceCueIds:[];
   const published=[];
   for(const id of [...new Set(ids)]){
    const event=anchors.get(id);
    if(!event)continue;
    const state=cueState.project(id);
    const owned=state?.sacredMinister;
    if(!state?.supported||state.reason ||
       !owned || !["R18_SOLEMN_R04_MINISTER","R18_SOLEMN_PAX_PRIMARY_SOURCE"].includes(owned.owner) ||
       owned.cueId!==id || owned.sourceMoment!==event.sourceMoment ||
       owned.authorityStatus!==event.authorityStatus ||
       typeof owned.action!=="string" || !owned.action.trim() ||
       typeof owned.actor!=="string" || !owned.actor.trim())continue;
    const requiem=/REQUIEM/.test(String(owned.labelShort??""));
    const frenchText=requiem ? REQUIEM_FR[event.id] : FR[event.id];
    if(french && !frenchText)continue;
    published.push(Object.freeze({
      id:event.id,sourceCueId:id,actor:owned.actor,
      displayText:french?frenchText:owned.action,
      sourceId:"R18_SOLEMN_FORM_STATE",sourceUrl:APPROVED_SOURCE,
      owner:SOLEMN_MISSAL_MINISTER_OWNER,
      review:"EXISTING_CERTIFIED_R18_SOLEMN_MINISTER",
      observedNow:false,
    }));
   }
   return published.length?Object.freeze({...p,publishedMissalRubrics:Object.freeze([
    ...(p.publishedMissalRubrics??[]),...published
   ])}):p;
 }));
}
