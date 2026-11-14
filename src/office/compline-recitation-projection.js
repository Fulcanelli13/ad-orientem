/**
 * Print-conforming Compline reading projection for the 1961 Roman Breviary.
 * Witness: Breviarium Romanum (Mame 1961) Ordinarium §54–67, printed
 * pp. 132–141. The upstream 42-block source extraction is retained
 * unchanged for provenance, but its post-Nunc Kyrie and second Pater
 * belong to other Office structures and must not be recited at Compline.
 * Rubricae §147; Ordinary §56 choose whether to recite an opening
 * Pater noster or make an examen at the day's final prayer.
 *
 * PRIVATE REVIEW ONLY: this is not edition/rights certification and
 * never sets any public release flag.
 */
import {projectSaturdayComplinePsalmFrame,projectSundayComplinePsalmFrame,projectFerialComplinePsalmFrame,projectMondayComplinePsalmFrame}
 from "./compline-psalm-display-projection.js";
export const COMPLINE_CONTEXT=Object.freeze({
 FINAL_PRAYER:"FINAL_PRAYER",OTHER_TIME:"OTHER_TIME"
});
// 1961 Mame Ordinarium §65–66, printed pp. 139–140: where a priest
// presides use Dominus vobiscum; otherwise Domine exaudi.
export const COMPLINE_MINISTER=Object.freeze({
 PRIEST:"PRIEST",NON_PRIEST:"NON_PRIEST"
});
export const COMPLINE_EXAMEN_RUBRIC_SOURCE=
 "Breviarium Romanum (1961) Rubricae §147; Ordinarium §56";
export const COMPLINE_PRINTED_ORDINARY_SOURCE=
 "Breviarium Romanum (1961) Ordinarium §§54–67, pp. 132–141";
const OPENING_PATER="Psalterium/Common/Prayers#Pater noster";
const SECOND_PATER="Psalterium/Common/Prayers#Pater noster Et";
const POST_CANTICLE_KYRIE="Psalterium/Common/Prayers#Kyrie";
const FINAL_ASSISTANCE="Psalterium/Common/Prayers#Divinum auxilium + Fidelium animae:Amen";
const INITIAL_BLESSING="Psalterium/Common/Prayers#Benedictio Completorium_";
const CONCLUDING_BLESSING="Psalterium/Common/Prayers#Benedictio Completorium2";
const AMEN_SOURCE="Psalterium/Common/Prayers#Fidelium animae:R.Amen";
const CONFITEOR_SOURCE="Psalterium/Common/Prayers#Confiteor_";
const DIALOGUE_SOURCE="Psalterium/Common/Prayers#Dominus";
const VISITA_CONCLUSION_SOURCE="Psalterium/Common/Prayers#Per Dominum";
// The Mame 1961 Ordinary §65, p.139 prints the short "Per Dóminum"
// and an Amen after Visita, not a full long doxology.
const VISITA_SHORT=Object.freeze({
 la:"Per Dóminum.",en:"Through our Lord.",fr:"Par notre Seigneur."
});
const CONFITEOR_GESTURES=Object.freeze({
 la:Object.freeze({markup:"/:(percutit sibi pectus):/",label:"Percutit sibi pectus"}),
 en:Object.freeze({markup:"/:strikes his breast:/",label:"Strikes his breast"}),
 fr:Object.freeze({markup:"/:(on se frappe la poitrine):/",label:"On se frappe la poitrine"})
});
function projectComplineSourceMarkup(frame,languages){
 // The original source contains editor-control syntax, not prayer words.
 // Preserve it in sourceTexts, but never display /:...:/ or the hymn
 // stanza-selection asterisk as if they were recited Latin.
 if(frame.sourceId===CONFITEOR_SOURCE){
  if(frame.subTotal!==1||frame.kind!=="CONFITEOR")return null;
  const texts={},gestures={};
  for(const language of languages){
   const original=frame.texts?.[language];
   const spec=CONFITEOR_GESTURES[language];
   if(!spec||!Array.isArray(original)||original.length!==1||
     !original[0].startsWith("v. ")||
     original[0].split(spec.markup).length!==2)
    return null;
   const clean=original[0].replace(" "+spec.markup+" "," ")
    .replace(/^v\. /u,"");
   if(clean===original[0]||clean.includes("/:")||
     (language==="la"&&!clean.includes("mea culpa")))
    return null;
   texts[language]=Object.freeze([clean]);
   gestures[language]=spec.label;
  }
  return Object.freeze({
   ...frame,sourceTexts:frame.texts,
   texts:Object.freeze(texts),gestureRubrics:Object.freeze(gestures),
   originalSourceOnly:false,printConformed:true
  });
 }
 if(frame.kind==="HYMN"&&frame.sourceId.endsWith("#Hymnus Completorium")){
  const texts={};let changes=0;
  for(const language of languages){
   if(!Array.isArray(frame.texts?.[language]))return null;
   const lines=frame.texts[language].map((line,i)=>{
    if(i===0&&frame.subIndex===0&&line.startsWith("v. ")){
     changes++;return line.slice(3);
    }
    if(i===0&&frame.subIndex===2&&line.startsWith("* ")){
     changes++;return line.slice(2);
    }
    return line;
   });
   if(lines.some(line=>!line||line.startsWith("* ")||line.startsWith("v. ")))
    return null;
   texts[language]=Object.freeze(lines);
  }
  if((frame.subIndex===0||frame.subIndex===2)&&changes!==languages.length)
   return null;
  return Object.freeze({
   ...frame,sourceTexts:frame.texts,texts:Object.freeze(texts),
   originalSourceOnly:false,printConformed:true
  });
 }
 return frame;
}
const NOTE=Object.freeze({
 la:Object.freeze(["Rubrica (non textus precationis): Pater noster hic omittitur. Examen conscientiae per rationabile tempus fit; deinde Confiteor."]),
 en:Object.freeze(["Rubric (not a prayer text): Omit the opening Our Father. Examine your conscience for a suitable time, then continue with the Confiteor."]),
 fr:Object.freeze(["Rubrique (non texte de prière) : omettre ici le Notre Père. Faire un examen de conscience pendant un temps convenable, puis poursuivre avec le Confiteor."])
});
function withheld(reason){return Object.freeze({
 status:"WITHHELD",reason,events:Object.freeze([]),frames:Object.freeze([]),
 readingEvents:Object.freeze([]),publishable:false,published:false,readingPublished:false
});}
export function projectComplineRecitation(review,{
 context=COMPLINE_CONTEXT.FINAL_PRAYER,
 minister=COMPLINE_MINISTER.NON_PRIEST
}={}){
 if(!Object.values(COMPLINE_MINISTER).includes(minister))
  return withheld("COMPLINE_PRESIDING_MINISTER_NOT_REVIEWED");
 if(!Object.values(COMPLINE_CONTEXT).includes(context))
  return withheld("COMPLINE_RECITATION_CONTEXT_UNREVIEWED");
 if(!review||review.status!=="PRIVATE_SOURCE_TEXT_REVIEW"||
   review.hour!=="COMPLINE"||review.published!==false||
   review.eventCount!==42||review.events?.length!==42||
   !Array.isArray(review.frames)||review.frames.length<42||
   !Array.isArray(review.availableLanguages)||!review.availableLanguages.includes("la"))
  return withheld("COMPLINE_SOURCE_SEQUENCE_UNAVAILABLE");
 const events=review.events,languageKeys=review.availableLanguages;
 // 1961 Ordinary §64–65: after the Nunc dimittis antiphon, continue
 // immediately with Domine exaudi / Dominus vobiscum and Oremus.
 const k=events.findIndex(x=>x.kind==="KYRIE"&&x.sourceId===POST_CANTICLE_KYRIE);
 const p=events.findIndex(x=>x.kind==="PATER_NOSTER"&&x.sourceId===SECOND_PATER);
 if(k<1||p!==k+1||events[k-1]?.kind!=="ANTIPHON"||
   !events[k-1].sourceId?.endsWith("#Ant 4")||
   events[p+1]?.kind!=="DIALOGUE"||
   events.filter(x=>x.sourceId===POST_CANTICLE_KYRIE).length!==1||
   events.filter(x=>x.sourceId===SECOND_PATER).length!==1)
  return withheld("COMPLINE_1961_ORDINARY_POST_CANTICLE_POSITION_MISMATCH");
 const idx=events.findIndex(x=>x.kind==="PATER_NOSTER"&&x.sourceId===OPENING_PATER);
 if(idx<1||events.filter(x=>x.kind==="PATER_NOSTER"&&x.sourceId===OPENING_PATER).length!==1||
   events[idx-1]?.sourceId!=="Psalterium/Common/Prayers#Adjutorium nostrum"||
   events[idx+1]?.sourceId!=="Psalterium/Common/Prayers#Confiteor_")
  return withheld("COMPLINE_1961_EXAMINATION_POSITION_NOT_VERIFIED");
 const final=events.at(-1);
 if(final?.kind!=="FINAL_ASSISTANCE"||final?.sourceId!==FINAL_ASSISTANCE||
   events.filter(x=>x.kind==="BLESSING"&&x.sourceId===INITIAL_BLESSING).length!==1||
   events.filter(x=>x.kind==="BLESSING"&&x.sourceId===CONCLUDING_BLESSING).length!==1||
   languageKeys.some(l=>!Array.isArray(final.texts?.[l])||
     final.texts[l].length!==2||!/^R\.\s/u.test(final.texts[l][1])))
  return withheld("COMPLINE_1961_BLESSINGS_OR_FINAL_AMEN_UNRESOLVED");
 const toOmit=new Set([k,p]);
 const readingEvents=Object.freeze(events.filter((_,i)=>!toOmit.has(i)));
 if(readingEvents.length!==40)return withheld("COMPLINE_1961_READING_COUNT_INVALID");
 const resultFrames=[];
 let replacementCount=0,amenCount=0,psalmLabelCount=0,dialogueCount=0;
 for(const f of review.frames){
  if(toOmit.has(f.eventIndex))continue;
  if(f.eventIndex===idx&&f.sourceId===OPENING_PATER&&context==="FINAL_PRAYER"){
   const texts=Object.freeze(Object.fromEntries(
    languageKeys.map(l=>[l,NOTE[l]])
   ));
   resultFrames.push(Object.freeze({
    kind:"EXAMINATION",sourceId:COMPLINE_EXAMEN_RUBRIC_SOURCE,
    eventIndex:idx,subIndex:0,subTotal:1,focusType:"EDITORIAL_RUBRIC",
    label:null,texts,originalSourceOnly:false,editorialRubric:true
   }));
   replacementCount++;continue;
  }
  if(f.sourceId===VISITA_CONCLUSION_SOURCE){
   if(f.kind!=="CONCLUSION"||f.subTotal!==1||
    languageKeys.some(l=>{
     const rows=f.texts?.[l];
     return !Array.isArray(rows)||rows.length!==2||
      !/^r\.\s/u.test(rows[0])||!/^R\.\s/u.test(rows[1])||
      (l==="la"&&!rows[0].startsWith("r. Per Dóminum nostrum "));
    }))return withheld("COMPLINE_1961_VISITA_SHORT_CONCLUSION_SOURCE_CHANGED");
   const texts=Object.freeze(Object.fromEntries(languageKeys.map(l=>[
    l,Object.freeze([VISITA_SHORT[l],f.texts[l][1]])
   ])));
   resultFrames.push(Object.freeze({...f,sourceTexts:f.texts,texts,
    shortConclusionPrinted1961:true,printConformed:true,
    unapprovedVernacularShortConclusion:true}));
   continue;
  }
  if(f.sourceId===DIALOGUE_SOURCE){
   // Two identical source blocks in the Hour: dialogue before the Visita
   // collect and after it. Original four lines remain available.
   if(f.kind!=="DIALOGUE"||f.subTotal!==1||
     languageKeys.some(l=>{
      const rows=f.texts?.[l];
      return !Array.isArray(rows)||rows.length!==4||
       !/^V\.\s/u.test(rows[0])||!/^R\.\s/u.test(rows[1])||
       !/^V\.\s/u.test(rows[2])||!/^R\.\s/u.test(rows[3]);
     }))return withheld("COMPLINE_1961_MINISTER_DIALOGUE_SOURCE_CHANGED");
   const offset=minister===COMPLINE_MINISTER.PRIEST?0:2;
   const texts=Object.freeze(Object.fromEntries(languageKeys.map(l=>[
    l,Object.freeze(f.texts[l].slice(offset,offset+2))
   ])));
   resultFrames.push(Object.freeze({...f,sourceTexts:f.texts,
    texts,presidingMinister:minister,printConformed:true}));
   dialogueCount++;continue;
  }
  if(f.sourceId===INITIAL_BLESSING||f.sourceId===CONCLUDING_BLESSING){
   if(f.subTotal!==1||languageKeys.some(l=>f.texts?.[l]?.length!==1))
    return withheld("COMPLINE_1961_BLESSING_FRAME_INVALID");
   const texts=Object.freeze(Object.fromEntries(languageKeys.map(l=>[
    l,Object.freeze([...f.texts[l],final.texts[l][1]])
   ])));
   resultFrames.push(Object.freeze({...f,texts,sourceAmen:AMEN_SOURCE,
    printConformed:true}));
   amenCount++;continue;
  }
  const clean=projectComplineSourceMarkup(f,languageKeys);
  if(clean===null)return withheld("COMPLINE_SOURCE_MARKUP_CHANGED");
  const saturdayNumbered=projectSaturdayComplinePsalmFrame(clean);
  if(saturdayNumbered===null)return withheld("COMPLINE_SATURDAY_PSALM_NUMBERING_DRIFT");
  const sundayNumbered=projectSundayComplinePsalmFrame(saturdayNumbered);
  if(sundayNumbered===null)return withheld("COMPLINE_SUNDAY_PSALM_NUMBERING_DRIFT");
  const ferialNumbered=projectFerialComplinePsalmFrame(sundayNumbered);
  if(ferialNumbered===null)return withheld("COMPLINE_FERIAL_PSALM_NUMBERING_DRIFT");
  const numbered=projectMondayComplinePsalmFrame(ferialNumbered);
  if(numbered===null)return withheld("COMPLINE_MONDAY_PSALM_NUMBERING_DRIFT");
  // The printed Scripture labels are separate from spoken Latin words.
  // Confiteor and hymn markup are not Psalm display-label projections.
  if(numbered!==clean)psalmLabelCount++;
  resultFrames.push(numbered);
 }
 const saturday=["2026-11-28","2026-12-05","2026-12-12",
  "2026-12-19",
  // Jan16 First Vespers of ordinary II Sunday: BR 166(b), not festive 168(d).
  "2027-01-16"].includes(review.civilDate);
 const sunday=["2026-11-29","2026-11-30","2026-12-06",
  "2026-12-07","2026-12-08","2026-12-13","2026-12-20",
  // Christmas private research only. Not a public release authorization.
  "2026-12-21","2026-12-24","2026-12-25",
  "2026-12-26","2026-12-27",
  // PRIVATE Christmas octave BR 175(e), Holy Innocents BR 168(d),
  // Circumcision BR 167(b/h), Holy Name BR 168(d).
  "2026-12-28","2026-12-29","2026-12-30","2026-12-31",
  "2027-01-01","2027-01-02","2027-01-03",
  // Private Epiphany I-class 5/6 Jan and Holy Family II-class 9/10 Jan.
  "2027-01-05","2027-01-06","2027-01-09","2027-01-10",
  // Baptism of Our Lord II class (1960 Variationes 24); II Sunday after
  // Epiphany on Jan17. Jan16 is SATURDAY Psalter after I Vespers.
  "2027-01-13","2027-01-17"
 ].includes(review.civilDate);
 const weekdayCounts=Object.freeze({"2026-12-01":26,"2026-12-02":30,
  "2026-12-03":33,"2026-12-04":36,"2026-12-09":30,
  "2026-12-10":33,"2026-12-11":36,
  "2026-12-14":28,"2026-12-15":26,"2026-12-16":30,
  "2026-12-17":33,"2026-12-18":36,
  "2026-12-22":26,"2026-12-23":30,
  "2027-01-04":28,"2027-01-07":33,"2027-01-08":36,
  "2027-01-11":28,"2027-01-12":26,"2027-01-14":33,"2027-01-15":36});
 const expected=saturday?41:sunday?30:weekdayCounts[review.civilDate];
 if(!Number.isInteger(expected)||psalmLabelCount!==expected)
  return withheld("COMPLINE_APPOINTED_PSALM_COVERAGE_MISMATCH");
 if(dialogueCount!==2||amenCount!==2||
   replacementCount!==(context===COMPLINE_CONTEXT.FINAL_PRAYER?1:0)||
   resultFrames.some(f=>f.sourceId===SECOND_PATER||f.sourceId===POST_CANTICLE_KYRIE))
  return withheld("COMPLINE_1961_FRAME_PROJECTION_MISMATCH");
 const shortConclusions=resultFrames.filter(f=>f.shortConclusionPrinted1961);
 if(shortConclusions.length!==1||
   shortConclusions[0].texts.la[0]!=="Per Dóminum.")
  return withheld("COMPLINE_1961_VISITA_SHORT_CONCLUSION_MISSING");
 const frames=Object.freeze(resultFrames);
 return Object.freeze({
  ...review,events,readingEvents,readingEventCount:readingEvents.length,
  sourceEventCount:42,sourceFrameCount:review.frames.length,
  frames,frameCount:frames.length,recitationContext:context,
  printedOrdinaryWitness:COMPLINE_PRINTED_ORDINARY_SOURCE,
  postCanticleKyrieOmitted:true,postCanticlePaterOmitted:true,
  blessingAmensRestoredFromPinnedSource:2,
  visitaShortConclusionPrinted1961:true,
  editorialRubricFrames:replacementCount,
  printedPsalmDisplayFrames:psalmLabelCount,
  originalPsalmSourceRowsPreserved:true,
  openingPaterOmitted:context===COMPLINE_CONTEXT.FINAL_PRAYER,
  presidingMinister:minister,ministerDialoguesResolved:dialogueCount,
  liturgicallyCertified:false,rightsApproved:false,
  publishable:false,published:false,readingPublished:false
 });
}
