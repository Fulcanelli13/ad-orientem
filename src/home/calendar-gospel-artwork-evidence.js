/* Read-only, evidence-first bridge from the actual resolved 1962 day and Gospel
 * to artwork already selected for Home. No art is approved or published here.
 * Do NOT join Gospel citations by feast-name resemblance or calendar date alone.
 */
import { calendarScriptureContexts } from "../calendar/scripture-handoff.js";
import { approvedClassIHeroForDate } from "../calendar/approved-class-i-heroes-2026.js";
import { legacyHomeArtworkExcluded } from "./legacy-art-exclusions.js";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const str = value => typeof value === "string" && value.trim() ? value.trim() : null;
const PREVIEW_STATUS = "REMOTE_COMMONS_PREVIEW_NOT_OFFLINE_CERTIFIED";
const RIGHTS_HOLD = "HELD_SOURCE_REUSE_RIGHTS";

export const DAILY_ART_EVIDENCE_VERSION = "ao-calendar-gospel-artwork-evidence-2026-v1";

export function homeCalendarGospelArtworkEvidence({date,resolution,artProvider=null}={}) {
  if(!ISO.test(String(date??"")) || !resolution || resolution.date!==date ||
     resolution.status==="failed" || !resolution.day?.main?.id) {
    return Object.freeze({
      date:ISO.test(String(date??""))?date:null,status:"DAY_UNRESOLVED",
      principalId:null,properPath:null,gospel:{status:"NOT_VERIFIED",reference:null},
      approvedArtwork:null,legacyCandidate:null,homepageArtworkState:"NOT_CERTIFIED"
    });
  }
  const principalId=String(resolution.day.main.id);
  const proper=resolution.proper;
  const actualPath=str(proper?.sourcePath??proper?.data?.sourcePath);
  const name=str(proper?.data?.name??resolution.day.main.title??resolution.day.main.name);
  const isProperReady=proper?.status==="ready"||proper?.status==="READY";
  let gospel=null;
  if(isProperReady&&actualPath){
    try {
      gospel=calendarScriptureContexts(resolution).find(item=>
        item.slot==="GOSPEL"&&item.reference&&item.provenance)??null;
    } catch {
      // A missing or conflicting witness is NEVER filled by a date-based guess.
    }
  }
  const selected=approvedClassIHeroForDate(date,principalId);
  const preview=Boolean(selected?.image &&
    selected.imagePublicationStatus===PREVIEW_STATUS &&
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(selected.image));
  const hold=selected?.imagePublicationStatus===RIGHTS_HOLD;
  const approvedArtwork=selected?Object.freeze({
    artworkId:selected.artworkId,title:selected.title,artist:selected.artist,
    source:selected.source,imagePreview:preview?selected.image:null,
    editorialStatus:selected.editorialApproval,
    imagePublicationStatus:selected.imagePublicationStatus,
    relationToCalendar:"EXACT_DATE_AND_OBSERVED_PRINCIPAL",
    relationToGospel:"NOT_ASSERTED",
    approvedForOfflineProduction:false
  }):null;

  // Historical GREEN is NOT a user-curated published master. Return only
  // diagnostic provenance, never a URL from this secondary lookup.
  let legacyCandidate=null;
  if(isProperReady&&actualPath&&artProvider?.effectiveRow){
    try {
      const row=artProvider.effectiveRow(actualPath);
      const art=row?.status==="GREEN"&&row.primaryArtId
        ?artProvider.effectiveArtwork?.(row.primaryArtId):null;
      if(art){
        const excluded=legacyHomeArtworkExcluded({
          artworkId:row.primaryArtId,artist:art.artist,alt:art.title
        });
        legacyCandidate=Object.freeze({
          sourcePath:actualPath,artworkId:String(row.primaryArtId),
          artist:str(art.artist),title:str(art.title),
          status:excluded?"EXCLUDED_BY_USER_ART_POLICY":"REVIEW_REQUIRED",
          homepageCertified:false,
          relationToGospel:"NOT_ASSERTED"
        });
      }
    }catch {}
  }

  const gospelResult=gospel?Object.freeze({
    status:"VERIFIED_FROM_SELECTED_PROPER",
    reference:gospel.reference,
    sourceReference:gospel.sourceReference??null,
    provenance:gospel.provenance,
    witnessUrl:gospel.witnessUrl??null,
    segments:gospel.segments??null
  }):Object.freeze({status:"NOT_VERIFIED",reference:null,sourceReference:null,
    provenance:null,witnessUrl:null,segments:null});

  return Object.freeze({
    date,status:"OBSERVED_PRINCIPAL_RESOLVED",principalId,name,
    properPath:actualPath,properReady:isProperReady,gospel:gospelResult,
    approvedArtwork,legacyCandidate,
    homepageArtworkState:preview?"APPROVED_DATE_PREVIEW_NOT_OFFLINE_CERTIFIED"
      :hold?"APPROVED_ART_SOURCE_HELD":"NO_CERTIFIED_DATE_ARTWORK",
    // The Gospel association and actual rendered bytes need independent QA.
    gospelArtworkMatch:"NOT_VERIFIED",
    homepageRenderedImageVerified:false
  });
}
