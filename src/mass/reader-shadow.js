// Shadow reader audit. Runs only behind the R17 reader gate.
// No DOM mutation, no navigation interception, no canonical state ownership.

import { auditReaderDocument } from "./reader-parity.js";

export function runReaderShadowAudit({doc=globalThis.document,prepared=null}={}){
  const report=auditReaderDocument(doc);
  const result=Object.freeze({
    ...report,
    mode:prepared?.readerPreferences?.mode??null,
    form:prepared?.session?.resolvedMass?.form??null,
    celebrationId:prepared?.session?.resolvedMass?.actualCelebration?.id??null,
    uiOwner:"LEGACY_DOM_SHADOW_AUDITED",
    canonicalOwner:"R17_SESSION_ENGINE",
  });
  globalThis.AO_R17_READER_SHADOW=result;
  try{
    doc.documentElement.dataset.aoR17ReaderShadow=result.complete?"parity-surface-present":"parity-surface-incomplete";
  }catch{}
  return result;
}
