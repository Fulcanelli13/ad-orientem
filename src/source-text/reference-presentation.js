// Presentation boundary for historical source-to-section associations.
// This file adapts the Phase 17 handoff to the EXISTING source-reference
// panel; it is not a second reader, claim registry or publication authority.
import {sourceReferenceSafeUrl} from "../learn/source-reference-panel.js";

const STATES=new Set([
  "DRAFT_OWNER_REVIEW_ONLY",
  "SUPPRESSED_SUPERSEDED_OWNER_CITATION"
]);

export function prepareScopedReferenceDisplay({scopedLink,french=false}={}){
  const x=scopedLink;
  if(!x||!STATES.has(x.status)||
     typeof x.sourceBindingKey!=="string"||
     !/^FORM-SYN-[0-9]+::[^:]+$/.test(x.sourceBindingKey)||
     typeof x.sectionKey!=="string"||
     !x.sectionKey.startsWith(x.sourceBindingKey.split("::")[0]+"::")||
     typeof x.oldEvidenceEdgeKey!=="string"||
     typeof x.sourceWorkTitle!=="string"||
     typeof x.originalSourceRole!=="string"||
     x.publicDisplayApproved!==false||x.inlineCitation!==null||
     x.exactPassageQuote!==null||
     x.historicalEdgeIsCurrentClaim!==false||
     x.scopeValidatedByOwner!==false)
    throw new Error("REF_DISPLAY_REQUIRES_HELD_SCOPED_EDGE");
  const blocked=x.status==="SUPPRESSED_SUPERSEDED_OWNER_CITATION";
  if(blocked ? x.externalLink!==null :
     !x.externalLink||x.externalLink.label!=="Read further")
    throw new Error("REF_DISPLAY_LINK_STATE_CONFLICT");
  const url=blocked?null:sourceReferenceSafeUrl(x.externalLink.url);
  if(!blocked&&!url)throw new Error("REF_DISPLAY_INVALID_EDITORIAL_LINK");
  const opponent=/original philosophical opponent/i.test(x.originalSourceRole);
  return Object.freeze({
    sectionKey:x.sectionKey,
    scopedBindingKey:x.sourceBindingKey,
    historicalEvidenceEdgeKey:x.oldEvidenceEdgeKey,
    title:x.sourceWorkTitle,
    originalDocumentLocator:x.sourceDocumentLocator??null,
    historicalClaimLocator:x.originalClaimLocator??null,
    originalSourceRole:x.originalSourceRole,
    originalSectionRole:x.sectionRole??null,
    sourcePerspective:opponent?"OPPOSING_PHILOSOPHICAL_SOURCE":"HISTORICAL_REFERENCE",
    perspectiveLabel:opponent
      ?(french?"Position philosophique opposée":"Opposing philosophical position")
      :(french?"Association historique à vérifier":"Historical source association to review"),
    reviewState:blocked?"SUPERSEDED_BLOCKED":"OWNER_REVIEW_REQUIRED",
    reviewLabel:blocked
      ?(french?"Référence remplacée — ne pas rétablir":"Superseded reference — do not restore")
      :(french?"Référence non approuvée":"Reference not approved"),
    editorialSourceUrl:url||null,
    // The already-shipped reader takes evidence rows/registry entries.
    // Neither may be constructed from this unapproved historical edge.
    publicEvidenceRow:null,
    publicSourceRegistryEntry:null,
    publicInlineCitation:null,
    publicFurtherReadingId:null,
    publicDisplayApproved:false,
    editorialPreviewOnly:true,
    documentDeepLinkVerified:false,
    owner:"FORMATION"
  });
}
