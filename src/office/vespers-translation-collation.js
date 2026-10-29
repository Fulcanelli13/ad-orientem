/**
 * Research-only bilingual spot collation for the two 2026 All Saints
 * commemorations of the XXIII Sunday after Pentecost.
 *
 * Antiphon/collect incipits come from the EXACT pinned upstream EN/FR
 * Tempora/111-0 and Tempora/Pent23-0 files (DO pin owned by the app).
 * NOT a printed EN/FR source certification or translation licence grant.
 * The separate older French printed fascicle has some supporting
 * independent correspondence for Saturday I Vespers ONLY.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
export const OFFICE_VESPERS_TRANSLATION_COLLATION_VERSION="ao.office.vespers-translation-collation.v1";
export const VESPERS_TRANSLATION_PILOTS=Object.freeze({
  "2026-10-31":Object.freeze({
    en:Object.freeze({
      antiphon:"I saw the Lord sitting upon a throne high and lifted up",
      collect:"O Lord, we beseech thee, absolve thy people from their offences",
    }),
    fr:Object.freeze({
      antiphon:"Je vis le Seigneur assis sur un trône élevé",
      collect:"Pardonnez, nous vous en supplions, Seigneur, les offenses de vos peuples",
    })
  }),
  "2026-11-01":Object.freeze({
    en:Object.freeze({
      antiphon:"But Jesus turned Him about, and when He saw her, He said",
      collect:"O Lord, we beseech thee, absolve thy people from their offences",
    }),
    fr:Object.freeze({
      antiphon:"Jésus, se retournant et la voyant, dit",
      collect:"Pardonnez, nous vous en supplions, Seigneur, les offenses de vos peuples",
    })
  })
});
const fold=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replaceAll("œ","oe").replaceAll("æ","ae")
  .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const status=(date,lang,extra={})=>Object.freeze({
  schema:OFFICE_VESPERS_TRANSLATION_COLLATION_VERSION,
  date,language:lang,
  status:"TRANSLATION_RESEARCH_ONLY",
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  independentPrintedTranslationCertified:false,
  exactVernacularVersionHistoricallyCertified:false,
  wholeParagraphAlignmentCertified:false,
  localOfficeAppointmentVerified:false,
  translationPublicationAuthorized:false,
  published:0,...extra
});
const valid=(doc,date,lang)=>doc?.schema==="ao.office.source-cells.v1"&&
  doc.date===date&&doc.hour==="VESPERS"&&doc.language===lang&&
  doc.sourceRevision===DIVINUM_OFFICIUM_PIN&&
  doc.status==="STRUCTURED_UNVERIFIED"&&doc.publishable===false&&
  Array.isArray(doc.sections)&&doc.sections.length>0;
const candidateCells=doc=>doc.sections.filter(s=>s.semantic?.role==="PRAYER"||
  /^Vespera(?:8|9|10)$/u.test(s.sourceCellId??""));
/**
 * Check the matched, bounded translation AFTER its commemoration heading,
 * not generic strings elsewhere in All Saints' full Vespers. Missing headings
 * are a reportable unresolved risk, never evidence of no commemoration.
 */
export function collateAllSaintsVespersTranslation(doc){
  const date=doc?.date,lang=doc?.language,expect=VESPERS_TRANSLATION_PILOTS[date]?.[lang];
  if(!expect||!valid(doc,date,lang))
    throw Error("OFFICE_VESPERS_TRANSLATION_PIN_OR_CONTEXT_INVALID");
  const cells=candidateCells(doc);
  const headers=[];
  cells.forEach((cell,i)=>String(cell.text??"").split("\n").forEach((raw,row)=>{
    const line=fold(raw);
    if(/^(?:commemoratio(?:nes)?|commemoration(?:s)?|commemoraison(?:s)?|memoire)\b/.test(line))
      headers.push({cell:i,row,sourceCellId:cell.sourceCellId});
  }));
  if(headers.length!==1)
    return status(date,lang,{sourceHeadingCount:headers.length,
      boundedSectionLocated:false,antiphonSourceIncipitMatched:false,
      sundayCollectSourceIncipitMatched:false,componentOrderMatched:false,
      reason:"SOURCE_TRANSLATION_COMM_HEADING_AMBIGUOUS"});
  const header=headers[0];
  const following=cells.slice(header.cell).flatMap((cell,i)=>{
    const lines=String(cell.text??"").split("\n");
    return i===0?lines.slice(header.row+1):lines;
  }).join("\n");
  const body=fold(following);
  const ant=body.indexOf(fold(expect.antiphon));
  const collect=body.indexOf(fold(expect.collect));
  const matched=ant>=0&&collect>ant;
  return status(date,lang,{
    sourceHeadingCount:1,sourceCellId:header.sourceCellId,
    boundedSectionLocated:true,
    antiphonSourceIncipitMatched:ant>=0,
    sundayCollectSourceIncipitMatched:collect>=0,
    componentOrderMatched:matched,
    // Do NOT call the previous Latin verse/response test a translation test.
    verseAndResponseVernacularCollated:false,
    donorSourceSpanComparisonOnly:true,
    reason:matched?"TWO_PINNED_DONOR_INCIPITS_FOUND_ORDERED":"SOURCE_TRANSLATION_INCIPIT_OR_ORDER_DISCREPANCY"
  });
}
