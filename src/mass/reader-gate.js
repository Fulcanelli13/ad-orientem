// Feature gate for the R17 Mass reader landing.
// Full-year production default remains LEGACY until all special-structure parity
// blockers are closed. Certified field sessions may explicitly override this
// in browser-entry without weakening the global rollback policy.

export const READER_UI_MODES = Object.freeze(["LEGACY","SHADOW","PREVIEW"]);
export const READER_UI_STORAGE_KEY = "ao-r17-reader-ui";

function normalize(value){
  const raw=String(value??"").trim().toLowerCase();
  if(raw==="shadow") return "SHADOW";
  if(raw==="preview"||raw==="r17"||raw==="native") return "PREVIEW";
  return "LEGACY";
}

export function resolveReaderUiMode({search="",stored=null}={}){
  let query=null;
  try{
    const p=new URLSearchParams(String(search||""));
    query=p.get("aoR17Reader");
  }catch{}
  return normalize(query??stored);
}

export function readBrowserReaderUiMode(win=globalThis){
  let stored=null;
  try{stored=win?.localStorage?.getItem?.(READER_UI_STORAGE_KEY)??null}catch{}
  return resolveReaderUiMode({search:win?.location?.search??"",stored});
}

export function readerModeAllowsLegacyDom(mode){
  return ["LEGACY","SHADOW","PREVIEW"].includes(normalize(mode));
}

export function readerModeRunsShadowAudit(mode){
  return normalize(mode)==="SHADOW"||normalize(mode)==="PREVIEW";
}

export function readerModeMountsPreview(mode){
  return normalize(mode)==="PREVIEW";
}
