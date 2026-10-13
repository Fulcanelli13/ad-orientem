// Editorial-stage 1962 Canon rubric crosswalk. Deliberately NOT a live
// priest-position or faithful-posture engine. Canonical AO.SM.C#### source
// identities are never changed, and read focus is not priest observation.
export const CANON_RUBRIC_REVIEW_FILE="reader-canon-rubric-review.v1.json";
export const CANON_RUBRIC_REVIEW_SCHEMA="ao-mass-canon-cue-rubric-review-v1";
const CUE=/^AO\.SM\.C(\d{4})$/;
const SUPPORTED_FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const ACTORS=new Set(["PRIEST","SERVER","DEACON","SUBDEACON"]);
const NOT_LIVE="EDITORIAL_PREVIEW_ONLY_NOT_APPROVED_FOR_LIVE_PRIEST_RAIL";
function freezeRows(items){return Object.freeze(items.map(x=>Object.freeze({...x})));}
export function validateCanonRubricReview(data){
  if(!data || data.schema!==CANON_RUBRIC_REVIEW_SCHEMA ||
     data.status!==NOT_LIVE || data.defaultPublication!==false ||
     data.owner!=="SOURCE_CUE_NOT_READER_CARD" ||
     data.clockPolicy!=="PRIEST_OBSERVATION_SEPARATE_FROM_PUBLIC_SCHOLA_AND_SCROLL" ||
     data.faithfulPolicy!=="FOLLOW_CONGREGATION_OBSERVATIONAL")
    throw new Error("Canon rubric draft cannot claim released liturgical or live-state authority");
  if(!Array.isArray(data.rows)||data.rows.length!==58)throw new Error("Canon needs all 58 source cues");
  const observed=new Set(),actions=new Set();
  let priestCount=0,ministerCount=0,gapCount=0,existingCount=0;
  for(const row of data.rows){
    const cue=String(row?.cueId??"");
    const serial=CUE.exec(cue);
    if(!serial||Number(serial[1])!==150+observed.size||observed.has(cue))
      throw new Error("Noncanonical, repeated or out-of-order Canon cue: "+cue);
    observed.add(cue);
    if(!/^AO\.SM\.B\d{3}$/.test(row.blockId)||!row.latinBegin||
       row.priestClock!=="NOT_INFERRED_FROM_READ_POSITION")
      throw new Error(cue+": source identity or independent priest clock missing");
    if(row.faithful?.defaultProfile!=="FOLLOW_CONGREGATION_OBSERVATIONAL" ||
       row.faithful?.normalisedPosture!=="NOT_INFERRED_FROM_PRIEST_OR_READER")
      throw new Error(cue+": ungrounded universal pew posture");
    if(!Array.isArray(row.candidateActions)||!Array.isArray(row.existingDetailedRubricIds))
      throw new Error(cue+": missing source/rubric evidence");
    if(row.gapPending===true)gapCount++;
    if(row.existingDetailedRubricIds.length)existingCount++;
    for(const event of row.candidateActions){
      if(!/^AO\.CANON\.R62\.\d{3}$/.test(event.id)||actions.has(event.id) ||
        !ACTORS.has(event.actor) || !event.key || !event.ritusLocator ||
        !event.latinTrigger || event.publication!=="SOURCE_RESEARCH_EDITORIAL_REVIEW_PENDING" ||
        !Array.isArray(event.sources)||!event.sources.length ||
        event.sources.some(url=>!/^https:\/\//.test(url)))
        throw new Error(cue+": invalid or unsupported Canon micro-action");
      actions.add(event.id);
      if(event.actor==="PRIEST"){
        priestCount++;
        if(event.timing!=="PRIEST_ACTUAL_CLOCK_REQUIRED" ||
           !String(event.frenchParaphraseDraft??"").trim())
          throw new Error(event.id+": priest cue must retain actual-clock gate and draft provenance");
      }else{
        ministerCount++;
        if(event.timing!=="INDEPENDENT_MINISTER_TIMING_REQUIRED")
          throw new Error(event.id+": minister action cannot follow reader scroll");
      }
    }
  }
  if(actions.size!==62||priestCount!==58||ministerCount!==4||
     gapCount!==42||existingCount!==13||
     data.counts?.sourceCues!==58||data.counts?.candidateActions!==62||
     data.counts?.sourceGapCues!==gapCount||
     data.counts?.withExistingDetailedRubric!==existingCount)
    throw new Error("Canon source/research 58/62 and published-gap denominators diverged");
  return Object.freeze({
    cueCount:observed.size,candidateActionCount:actions.size,
    priestActionCount:priestCount,ministerActionCount:ministerCount,
    pendingDetailedRubricCues:gapCount,existingDetailedRubricCues:existingCount,
    publicationStatus:"UNREVIEWED_DO_NOT_SHOW_LIVE",
  });
}
export async function loadCanonRubricReview({
  fetchImpl=globalThis.fetch,baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const url=new URL("../../data/presentation/"+CANON_RUBRIC_REVIEW_FILE,baseUrl);
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load Canon editorial crosswalk");
  const data=await response.json();
  return Object.freeze({data,audit:validateCanonRubricReview(data),url:String(url)});
}

export function createCanonRubricReviewController({data=null}={}){
  if(!data)return Object.freeze({
    supported:false,status:"SOURCE_NOT_LOADED",
    project:()=>Object.freeze({supported:false,priestActions:Object.freeze([]),
      ministerActions:Object.freeze([]),faithfulPosture:null,canPublish:false}),
  });
  const audit=validateCanonRubricReview(data);
  const byCue=new Map(data.rows.map(row=>[row.cueId,row]));
  function project(cueId,{
    form="LOW",editorialPreview=false,priestObservedCueId=null,
    observedMinisterActionIds=[],communityProfile="FOLLOW_CONGREGATION_OBSERVATIONAL",
  }={}){
    const id=String(cueId??"");
    const row=byCue.get(id);
    const recognisedForm=SUPPORTED_FORMS.has(String(form).toUpperCase());
    const enabled=Boolean(row&&editorialPreview===true&&recognisedForm);
    const actions=enabled?row.candidateActions:[];
    // An independent observation is indispensable for "happening now".
    // Read-focus, source order and simultaneous Schola singing are not it.
    const priestObserved=priestObservedCueId===id;
    const ministerObserved=new Set(observedMinisterActionIds);
    const priestActions=freezeRows(actions.filter(a=>a.actor==="PRIEST").map(a=>({
      id:a.id,actor:a.actor,actionKey:a.key,
      frenchDraft:a.frenchParaphraseDraft,latinTrigger:a.latinTrigger,
      ritusLocator:a.ritusLocator,sources:Object.freeze([...a.sources]),
      formQualification:a.formQualification,
      cueId:id,isObservedNow:priestObserved,
      publishable:false,
    })));
    const ministerActions=freezeRows(actions.filter(a=>a.actor!=="PRIEST").map(a=>({
      id:a.id,actor:a.actor,actionKey:a.key,
      frenchDraft:a.secondaryFrenchDraft,latinTrigger:a.latinTrigger,
      ritusLocator:a.ritusLocator,sources:Object.freeze([...a.sources]),
      cueId:id,isObservedNow:ministerObserved.has(a.id),
      timing:"REQUIRES_INDEPENDENT_ROLE_EVENT",publishable:false,
    })));
    const profile=row?.faithful?.sourcedCandidates?.find(x=>x.profile===communityProfile)??null;
    return Object.freeze({
      supported:Boolean(row),cueId:row?.cueId??null,
      previewEnabled:enabled,canPublish:false,
      status:enabled?"EDITORIAL_REVIEW_NOT_LIVE":"PREVIEW_DISABLED_OR_UNSUPPORTED_FORM",
      publishedRubricIds:Object.freeze([...(row?.existingDetailedRubricIds??[])]),
      gapPending:row?.gapPending===true,
      priestStation:enabled?row.priestStation:null,
      priestOrientation:enabled?row.priestOrientation:null,
      priestStationObservedNow:false,
      priestActions,ministerActions,
      faithfulPosture:null,
      postureCandidate:enabled&&profile
        ?Object.freeze({...profile,source:"CANDIDATE_ONLY_NOT_AUTOMATIC"}) :null,
    });
  }
  return Object.freeze({supported:true,audit,project});
}

// Resolve each displayed paragraph's source cue identities independently.
// Never infer a rubric from title, scroll position, Latin word matching or a
// display-only sourceAnchorCueId (e.g. a derived Oremus/Amen).
export function projectCanonParagraphReviews(paragraphs,controller,options={}){
  if(!Array.isArray(paragraphs))throw new TypeError("Reader paragraphs required");
  if(typeof controller?.project!=="function")throw new TypeError("Canon rubric review controller required");
  return Object.freeze(paragraphs.map((paragraph,index)=>{
    const ids=Array.isArray(paragraph?.sourceCueIds)
      ?[...new Set(paragraph.sourceCueIds.filter(id=>CUE.test(String(id))))]
      :[];
    return Object.freeze({
      paragraphId:String(paragraph?.id??index),
      owner:"CANON_SOURCE_CUES_ONLY",
      // Zero cues is a deliberate null state, not a license to borrow a
      // preceding/following source cue or claim the priest is doing it now.
      cueReviews:Object.freeze(ids.map(id=>controller.project(id,options))
        .filter(result=>result.supported)),
      canPublish:false,
    });
  }));
}
