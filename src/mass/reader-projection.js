import { dialogueLanguagePolicy, makeGuideState, resolveMomentState } from "./reader-state.js";

const READY_TEXT = new Set(["READY","CACHED"]);

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
    if(policy.primary==="LATIN"){
      if(!p.latin) throw new Error("Latin dialogue text required for "+p.kind);
      return Object.freeze({
        id:String(p.id ?? index),
        kind:p.kind==="VERSICLE" ? "TEXT" : "RESPONSE",
        primary:String(p.latin),
        secondary:p.vernacular == null ? null : String(p.vernacular),
        alternate:null,
        replaceOnToggle:false,
        active:p.active,
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
      active:p.active,
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
