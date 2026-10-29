/**
 * Research-only evidence checks for a 1960 Roman Vespers commemoration.
 * RG 106–114: only PRIVILEGED commemorations belong in Vespers, apart
 * from the inseparable Ss Peter/Paul exception in 110(a).
 * BR 249–259: order, Magnificat antiphon, preceding versicle and collect;
 * special treatment of shared prayer conclusions and proper omissions.
 *
 * This checks source-cell anchors, NOT their historical appointment.
 * A passed structural check can never select a commemoration for the user.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";

export const OFFICE_VESPERS_COMMEMORATION_GATE="ao.office.vespers-commemoration-evidence.v1";
const lineNorm=s=>String(s??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/[æǽ]/g,"ae")
  .replace(/\s+/g," ").trim().toLowerCase();
const failure=(reason,extra={})=>Object.freeze({
  schema:OFFICE_VESPERS_COMMEMORATION_GATE,status:"WITHHELD",reason,
  sourceComponentsLocated:false,independentlyPrintedTextCertified:false,
  commemorationAuthorized:false,officePublicationAuthorized:false,published:0,...extra
});
const validOffice=office=>office?.schema==="ao.office.source-cells.v1"&&
  office?.hour==="VESPERS"&&office?.language==="la"&&
  office?.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  office?.status==="STRUCTURED_UNVERIFIED"&&office.publishable===false&&
  Array.isArray(office.sections)&&office.sections.length>0&&
  office.sections.every(s=>typeof s.sourceCellId==="string"&&typeof s.text==="string");
const position=(office,part)=>{
  if(!part||typeof part.sourceCellId!=="string"||
    typeof part.literal!=="string"||!part.literal.trim())return null;
  const hits=[];
  office.sections.forEach((s,i)=>{
    if(s.sourceCellId!==part.sourceCellId)return;
    const start=s.text.indexOf(part.literal);
    if(start!==-1&&start===s.text.lastIndexOf(part.literal))
      hits.push({section:i,character:start,sourceCellId:s.sourceCellId});
  });
  return hits.length===1?hits[0]:null;
};
const before=(a,b)=>a.section<b.section||(a.section===b.section&&a.character<b.character);
const contentOverlap=(a,b)=>lineNorm(a.literal)===lineNorm(b.literal);
const ordinaryKinds=new Set(["PRIVILEGED","ORDINARY","INSEPARABLE_PETER_PAUL",
  "PRIVILEGED_BR259_BOTH_OMITTED"]);

/**
 * Source spans MUST be exact substrings in source-owned cells.
 * "mainCollect" locates the principal Office oration for relative order.
 * An ordinary privileged commemoration requires three distinct parts,
 * plus the Oremus preceding its collect. The printed proper still
 * needs independent appointment, provenance and rights review.
 */
export function reviewVespersCommemorationEvidence({office,candidate}={}){
  if(!validOffice(office))return failure("PINNED_LATIN_VESPERS_SOURCE_REQUIRED");
  if(!candidate||!ordinaryKinds.has(candidate.kind)||
    typeof candidate.commemoratedId!=="string"||!candidate.commemoratedId.trim()||
    candidate.date!==office.date)
    return failure("EXPLICIT_COMMEMORATION_CANDIDATE_REQUIRED");
  if(candidate.kind==="ORDINARY")
    return failure("RG_108_ORDINARY_COMMEMORATIONS_NOT_AT_VESPERS");
  if(candidate.calendarAuthority!== "INDEPENDENT_OFFICE_REVIEW_PENDING")
    return failure("OFFICE_CALENDAR_APPOINTMENT_UNVERIFIED");
  const main=position(office,candidate.mainCollect);
  const prayer=position(office,candidate.collect);
  if(!main||!prayer||!before(main,prayer))
    return failure("BR_251_MAIN_AND_COMMEMORATION_COLLECT_SOURCE_ORDER");
  if(candidate.kind==="INSEPARABLE_PETER_PAUL"){
    if(candidate.pair!=="PETER_PAUL"||candidate.antiphon||candidate.versicle||
      candidate.oremus||!candidate.apostlesSourceIdentityChecked)
      return failure("RG_110_PETER_PAUL_EXCEPTION_IDENTITY_UNVERIFIED");
    return Object.freeze({
      schema:OFFICE_VESPERS_COMMEMORATION_GATE,
      status:"SOURCE_EVIDENCE_PRESENT_REVIEW_REQUIRED",
      reason:"RG_110_INSEPARABLE_PRAYER_ONLY",
      sourceComponentsLocated:true,mainCollectLocation:main,collectLocation:prayer,
      sourceProvenanceOnly:true,independentlyPrintedTextCertified:false,
      commemorationAuthorized:false,officePublicationAuthorized:false,published:0
    });
  }
  if(candidate.kind==="PRIVILEGED_BR259_BOTH_OMITTED"){
    // BR 259 does NOT permit inventing a replacement antiphon or versicle
    // from another Hour. This is only a research record of their absence;
    // proof that both are inapplicable remains an independent editorial gate.
    if(candidate.antiphon||candidate.versicle||
      candidate.rubric259Review!=="BOTH_PROPER_PARTS_INAPPLICABLE_REVIEW_PENDING")
      return failure("BR_259_EXCEPTION_NOT_INDEPENDENTLY_ESTABLISHED");
    const oremusOmission=position(office,candidate.oremus);
    if(!oremusOmission||!before(main,oremusOmission)||
      !before(oremusOmission,prayer))
      return failure("BR_249_259_OMITTED_PARTS_COLLECT_ORDER");
    return Object.freeze({
      schema:OFFICE_VESPERS_COMMEMORATION_GATE,
      status:"SOURCE_EVIDENCE_PRESENT_REVIEW_REQUIRED",
      reason:"BR_259_NO_TRANSFER_OF_UNUSABLE_PROPER_PARTS",
      sourceComponentsLocated:true,mainCollectLocation:main,
      oremusLocation:oremusOmission,collectLocation:prayer,
      properOmissionIndependentlyEstablished:false,
      independentlyPrintedTextCertified:false,
      commemorationAuthorized:false,officePublicationAuthorized:false,published:0
    });
  }
  const ant=position(office,candidate.antiphon);
  const verse=position(office,candidate.versicle);
  const oremus=position(office,candidate.oremus);
  if(!ant||!verse||!oremus)
    return failure("BR_251_249_ANTIPHON_VERSE_OREMUS_UNRESOLVED");
  if(!before(main,ant)||!before(ant,verse)||!before(verse,oremus)||
    !before(oremus,prayer))
    return failure("BR_251_ANTIPHON_VERSE_COLLECT_OUT_OF_ORDER");
  if(contentOverlap(candidate.antiphon,candidate.versicle))
    return failure("BR_253_REPEATED_ANTIPHON_VERSE_TEXT");
  // A normal case is only SOURCE PRESENT; it does not certify the
  // Magnificat provenance, collect proper, no duplicated antiphon across
  // multiple commems, class limit, local ordo or independent printed text.
  return Object.freeze({
    schema:OFFICE_VESPERS_COMMEMORATION_GATE,
    status:"SOURCE_EVIDENCE_PRESENT_REVIEW_REQUIRED",
    reason:"BR_249_253_COMPONENTS_LOCATED_ONLY",
    sourceComponentsLocated:true,mainCollectLocation:main,
    antiphonLocation:ant,versicleLocation:verse,
    oremusLocation:oremus,collectLocation:prayer,
    wholeOfficeAntiphonCollisionReviewed:false,
    commonSourceAndProperAppointmentVerified:false,
    localPrecedenceVerified:false,independentlyPrintedTextCertified:false,
    commemorationAuthorized:false,officePublicationAuthorized:false,published:0
  });
}
/**
 * Search real generated Vespers cells for *possible* additional text.
 * A 'Commemoratio' heading proves neither the commemoration is required
 * nor that the Magnificat antiphon or proper collect is complete.
 * Avoid interpreting names in the source headline as commemorations.
 */
export function screenGeneratedVespersCommemorations(office){
  if(!validOffice(office))throw Error("OFFICE_VESPERS_COMMEMORATION_SOURCE_INVALID");
  const cells=office.sections.filter(s=>s.semantic?.role==="PRAYER"||
    /^Vespera(?:8|9|10)$/u.test(s.sourceCellId));
  const headingRows=[];
  for(const cell of cells){
    cell.text.split("\n").forEach((line,lineIndex)=>{
      const t=lineNorm(line);
      if(/^(?:commemoratio(?:nes)?|commemoration(?:es)?)(?:\b|[\s.:])/u.test(t))
        headingRows.push({sourceCellId:cell.sourceCellId,lineIndex,
          // Only a bounded heading; do not copy a whole Office into a report.
          heading:line.trim().slice(0,120)});
    });
  }
  return Object.freeze({
    date:office.date,hour:"VESPERS",sourceRevision:office.sourceRevision,
    scannedPrayerSourceCellIds:Object.freeze(cells.map(s=>s.sourceCellId)),
    explicitCommemorationHeadingCount:headingRows.length,
    possibleHeadings:Object.freeze(headingRows),
    absenceOfHeadingProvesNoCommemoration:false,
    magnficatAntiphonsIndependentlyVerified:false,
    // Even a positive heading does not establish an appointed commemoration.
    printAndLocalOrdoReviewRequired:true,published:0
  });
}

/**
 * Exact, bounded 2026 All Saints Sunday-commemoration Latin comparison.
 *
 * Text witness (independently illustrated, but not a certified 1961 edition):
 * CMAA Latin/English Breviary compilation,
 * https://media.churchmusicassociation.org/books/breviarium5x8.pdf
 * pp. 188 (I November Sunday I Vespers), 195–196 (XXIII post Pentecost
 * collect and II Vespers), 274 (Sunday versicle), 438 (Saturday versicle).
 * These are printed page numbers; the PDF page indices are 187, 194–195,
 * 273 and 437. Sunday appointment is separately attested by SSPX Ordo
 * https://ordo.fsspx.org/day/2026-11-01?lang=en .
 *
 * Guard the source SPAN after its Commemoratio heading, not a whole Office:
 * an antiphon somewhere in the principal feast must not count as
 * evidence that it appears in the Sunday commemoration.
 */
const ALL_SAINTS_SUNDAY_WITNESSES=Object.freeze({
  "2026-10-31":Object.freeze({
    part:"FIRST",antiphon:"vidi dominum sedentem",
    verse:"vespertina oratio ascendat ad te domine",
    response:"et descendat super nos misericordia tua",
    collect:"absolve quaesumus domine tuorum delicta populorum",
    printedPage:"188 / 438",
  }),
  "2026-11-01":Object.freeze({
    part:"SECOND",antiphon:"at iesus conversus et videns eam dixit",
    verse:"dirigatur domine oratio mea",
    response:"sicut incensum in conspectu tuo",
    collect:"absolve quaesumus domine tuorum delicta populorum",
    printedPage:"196 / 274",
  }),
});
const compareLatin=s=>String(s??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replaceAll("æ","ae").replaceAll("œ","oe")
  .replaceAll("j","i").replace(/[^a-z]+/g," ").trim();
export function collateAllSaintsSundayVespersCommemoration(office){
  if(!validOffice(office)||!ALL_SAINTS_SUNDAY_WITNESSES[office?.date])
    throw Error("OFFICE_SUNDAY_COMM_COHORT_OR_PIN_INVALID");
  const expected=ALL_SAINTS_SUNDAY_WITNESSES[office.date];
  const source=office.sections.filter(s=>s.semantic?.role==="PRAYER"||
    /^Vespera(?:8|9|10)$/u.test(s.sourceCellId));
  const headings=[];
  source.forEach((cell,i)=>cell.text.split("\n").forEach((line,lineNo)=>{
    if(/^commemoratio(?:nes)?(?:\b|[\s.:])/u.test(compareLatin(line)))
      headings.push({cell:i,line:lineNo,sourceCellId:cell.sourceCellId,
        heading:line.trim().slice(0,100)});
  }));
  const one=headings.length===1?headings[0]:null;
  // Nothing before the source's explicit commemoration heading can satisfy
  // the evidence check. Do not select a generic feast antiphon.
  const after=one?source.slice(one.cell).flatMap((s,i)=>{
    const lines=s.text.split("\n");
    return i===0?lines.slice(one.line+1):lines;
  }).join("\n"):"";
  const text=compareLatin(after);
  const loc=Object.fromEntries(["antiphon","verse","response","collect"].map(k=>
    [k,text.indexOf(compareLatin(expected[k]))]));
  const parts=Object.fromEntries(Object.entries(loc).map(([k,i])=>[k,i>=0]));
  const inOrder=loc.antiphon>=0&&loc.verse>loc.antiphon&&
    loc.response>loc.verse&&loc.collect>loc.response;
  return Object.freeze({
    date:office.date,part:expected.part,
    sourceRevision:office.sourceRevision,
    claimedPrintedWitness:"CMAA_BILINGUAL_BREVIARY_COMPILATION",
    independent1961PrintedEditionCertified:false,
    printedPage:expected.printedPage,
    commemorationHeadingCount:headings.length,
    sourceHeading:one?.heading??null,sourceCellId:one?.sourceCellId??null,
    componentIncipitsLocated:Object.freeze(parts),componentOrderMatches:inOrder,
    sourceStructureMatches:headings.length===1&&inOrder,
    specificPrintedWitnessComparisonDone:true,
    original1961BreviaryPrintedProperCertified:false,
    localCalendarCommemorationVerified:false,
    canPublish:false,published:0
  });
}
