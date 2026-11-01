import { dialogueLanguagePolicy, makeGuideState, resolveMomentState } from "./reader-state.js";

const READY_TEXT = new Set(["READY","CACHED"]);

/**
 * In a printed bilingual dialogue the Latin primary already identifies the
 * versicle/response. A repeated equivalent sign on the translated undertext
 * is typographic duplication, not a second liturgical actor or response.
 * Preserve the unchanged source text, cue IDs, and any mismatched roles
 * (which require separate source adjudication).
 */
export function dialogueUndertextWithoutRepeatedRole(primary,vernacular){
  if(vernacular==null)return vernacular;
  const role=value=>String(value??"").match(/^(\s*)(℣\.|℟\.|V\.|R\.)(\s*)/u);
  const la=role(primary),translation=role(vernacular);
  if(!la||!translation)return vernacular;
  const group=mark=>(mark==="℣."||mark==="V.")?"V":"R";
  if(group(la[2])!==group(translation[2]))return vernacular;
  return String(vernacular).slice(translation[0].length);
}

function normalizeStatus(value){
  return String(value ?? "").toUpperCase();
}

function normalizeParagraphSource(paragraph, fallbackKind="TEXT"){
  if (typeof paragraph === "string") {
    return Object.freeze({kind:fallbackKind,latin:null,vernacular:paragraph,active:false});
  }
  if (!paragraph || typeof paragraph !== "object") throw new TypeError("Resolved reader paragraph must be an object or string");
  return Object.freeze({
    id:paragraph.id ?? null,
    kind:String(paragraph.kind ?? fallbackKind).toUpperCase(),
    latin:paragraph.latin ?? paragraph.lat ?? null,
    vernacular:paragraph.vernacular ?? paragraph.translation ?? paragraph.en ?? null,
    active:paragraph.active === true,
    displayLanguage:paragraph.displayLanguage ?? null,
    speakerRole:paragraph.speakerRole ?? null,
    speakerEvidence:paragraph.speakerEvidence ?? null,
    liturgicalGroup:paragraph.liturgicalGroup ?? null,
    prayerRole:paragraph.prayerRole ?? null,
    sourcePath:paragraph.sourcePath ?? null,
    sourceAnchorCueId:paragraph.sourceAnchorCueId ?? null,
    sourceCueIds:Object.freeze([...(paragraph.sourceCueIds ?? (paragraph.id ? [paragraph.id] : []))].map(String)),
  });
}

export function projectResolvedReaderText(resolvedText){
  if (!resolvedText || !READY_TEXT.has(normalizeStatus(resolvedText.status))) {
    throw new Error("Resolved reader text is not READY/CACHED");
  }
  const source = Array.isArray(resolvedText.paragraphs)
    ? resolvedText.paragraphs
    : (resolvedText.latin != null || resolvedText.lat != null || resolvedText.vernacular != null || resolvedText.translation != null)
      ? [resolvedText]
      : [];

  if(source.length===0) throw new Error("Resolved reader text contains no paragraphs");

  const fallbackKind=String(resolvedText.kind ?? "TEXT").toUpperCase();
  return Object.freeze(source.map((raw,index)=>{
    const p=normalizeParagraphSource(raw,fallbackKind);
    const policy=dialogueLanguagePolicy(p.kind);
    // Exact source-clock/display ownership wins over the generic dialogue
    // fallback: sung prayers Latin, private/Proper text vernacular.
    if(p.displayLanguage==="LATIN_CUE"){
      if(!p.latin||!p.vernacular)throw new Error(
        "Latin and vernacular required for source-owned public invitation "+p.id
      );
      // These are live instructions to the congregation. Unlike a
      // replace-on-tap prayer, both source languages must remain visible
      // at the same time. Cues, clock and event ownership are untouched.
      return Object.freeze({
        id:String(p.id??index),kind:p.kind,
        primary:String(p.latin),secondary:dialogueUndertextWithoutRepeatedRole(p.latin,p.vernacular),
        alternate:null,replaceOnToggle:false,
        active:p.active,speakerRole:p.speakerRole,speakerEvidence:p.speakerEvidence,
        liturgicalGroup:p.liturgicalGroup,prayerRole:p.prayerRole,
        sourcePath:p.sourcePath,sourceAnchorCueId:p.sourceAnchorCueId,
        sourceCueIds:p.sourceCueIds,
        displayLanguage:"LATIN",languageOwner:"SOURCE_PUBLIC_LIVE_INVITATION",
      });
    }
    if(p.displayLanguage==="LATIN"){
      if(!p.latin)throw new Error("Sung Latin text required for "+p.id);
      return Object.freeze({
        id:String(p.id ?? index),kind:p.kind,
        primary:String(p.latin),secondary:null,
        alternate:p.vernacular == null ? null : String(p.vernacular),
        replaceOnToggle:Boolean(p.vernacular),
        active:p.active,speakerRole:p.speakerRole,speakerEvidence:p.speakerEvidence,liturgicalGroup:p.liturgicalGroup,prayerRole:p.prayerRole,sourcePath:p.sourcePath,sourceAnchorCueId:p.sourceAnchorCueId,sourceCueIds:p.sourceCueIds,
        displayLanguage:"LATIN",languageOwner:"SOURCE_SUNG_PRAYER",
      });
    }
    if(p.displayLanguage==="VERNACULAR" && p.kind!=="RESPONSE" && p.kind!=="VERSICLE"){
      if(!p.vernacular)throw new Error("Vernacular source text required for "+p.id);
      return Object.freeze({
        id:String(p.id??index),kind:p.kind,
        primary:String(p.vernacular),secondary:null,
        alternate:p.latin == null ? null : String(p.latin),
        replaceOnToggle:Boolean(p.latin),
        active:p.active,speakerRole:p.speakerRole,speakerEvidence:p.speakerEvidence,liturgicalGroup:p.liturgicalGroup,prayerRole:p.prayerRole,sourcePath:p.sourcePath,sourceAnchorCueId:p.sourceAnchorCueId,sourceCueIds:p.sourceCueIds,
        displayLanguage:"VERNACULAR",languageOwner:"SOURCE_PRIVATE_OR_PROPER",
      });
    }
    if(policy.primary==="LATIN"){
      if(!p.latin) throw new Error("Latin dialogue text required for "+p.kind);
      return Object.freeze({
        id:String(p.id ?? index),
        kind:p.kind==="VERSICLE" ? "TEXT" : "RESPONSE",
        primary:String(p.latin),
        secondary:p.vernacular == null ? null : dialogueUndertextWithoutRepeatedRole(p.latin,p.vernacular),
        alternate:null,
        replaceOnToggle:false,
        active:p.active,speakerRole:p.speakerRole,speakerEvidence:p.speakerEvidence,liturgicalGroup:p.liturgicalGroup,prayerRole:p.prayerRole,sourcePath:p.sourcePath,sourceAnchorCueId:p.sourceAnchorCueId,
        sourceCueIds:p.sourceCueIds,
      });
    }
    if(!p.vernacular) throw new Error("Vernacular primary text required for "+p.kind);
    return Object.freeze({
      id:String(p.id ?? index),
      kind:p.kind,
      primary:String(p.vernacular),
      secondary:null,
      alternate:p.latin == null ? null : String(p.latin),
      replaceOnToggle:Boolean(p.latin),
      active:p.active,speakerRole:p.speakerRole,speakerEvidence:p.speakerEvidence,liturgicalGroup:p.liturgicalGroup,prayerRole:p.prayerRole,sourcePath:p.sourcePath,sourceAnchorCueId:p.sourceAnchorCueId,
      sourceCueIds:p.sourceCueIds,
    });
  }));
}

function voiceLabel(event){
  if(event?.actor!=="PRIEST") return undefined;
  const value=event?.voice?.speechAudibility ?? event?.voice?.audibility ?? null;
  if(!value) return undefined;
  return {label:String(value).replaceAll("_"," ")};
}

function verifiedGuide(input){
  if(!input) return null;
  const state=makeGuideState({
    registryAvailable:input.registryAvailable === true,
    rubric:input.rubric ?? null,
  });
  if(!state.registryAvailable || !state.rubric) return null;
  const rubric=state.rubric;
  return Object.freeze({
    registryAvailable:true,
    text:String(rubric.text ?? rubric.short ?? ""),
    detail:rubric.detail ?? rubric.long ?? null,
  });
}

export function projectCanonicalEventToReaderMoment({
  event,
  resolvedText = null,
  participation = {},
  route = {},
  audio = {},
  guide = null,
  icons = {},
  presentation = {},
} = {}) {
  if(!event || typeof event!=="object" || !event.id) throw new TypeError("Canonical event with id required");

  const hasContent=Boolean(event.contentRef);
  if(hasContent && (!resolvedText || !READY_TEXT.has(normalizeStatus(resolvedText.status)))){
    throw new Error(event.id+": contentRef "+event.contentRef+" is unresolved; refusing blank reader card");
  }

  const paragraphs=hasContent || resolvedText ? projectResolvedReaderText(resolvedText) : undefined;
  const guarded=resolveMomentState({
    id:presentation.semanticId ?? event.id,
    semantic:presentation.semantic ?? null,
    posture:participation.posture ?? null,
    gesture:participation.gesture ?? null,
  });

  return Object.freeze({
    id:event.id,
    sectionTitle:String(presentation.sectionTitle ?? resolvedText?.sectionTitle ?? event.phase ?? ""),
    cardTitle:paragraphs ? String(presentation.cardTitle ?? resolvedText?.title ?? event.title ?? "") : undefined,
    cardUpdate:Boolean(paragraphs),
    paragraphs,
    progress:presentation.progress ?? null,
    posture:guarded.posture,
    gesture:guarded.gesture,
    response:participation.response ?? null,
    priestPosition:route.priestPosition,
    priestVoice:audio.priestVoice ?? voiceLabel(event),
    schola:audio.schola,
    sharedTextWithSchola:audio.sharedTextWithSchola === true,
    guide:verifiedGuide(guide),
    priestActionIconKey:icons.priestAction ?? null,
    postureIconKey:icons.posture ?? null,
    gestureIconKey:icons.gesture ?? null,
    responseIconKey:icons.response ?? null,
    priestVoiceIconKey:icons.priestVoice ?? null,
    scholaIconKey:icons.schola ?? null,
    provenance:Object.freeze({
      canonicalEventId:event.id,
      contentRef:event.contentRef ?? null,
      actor:event.actor ?? null,
      sourceMomentRefs:Object.freeze([...(event.sourceMomentRefs ?? [])]),
    }),
  });
}
