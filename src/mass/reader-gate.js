// Feature gate for the R17 Mass reader landing.
// 4 Oct 2026 rescue: native R17 is now the production default.
// LEGACY remains an explicit rollback mode only.

export const READER_UI_MODES = Object.freeze(["LEGACY","SHADOW","PREVIEW"]);
export const READER_UI_STORAGE_KEY = "ao-r17-reader-ui";

function normalize(value){
  const raw=String(value??"").trim().toLowerCase();
  if(raw==="legacy"||raw==="rollback") return "LEGACY";
  if(raw==="shadow") return "SHADOW";
  if(raw==="preview"||raw==="r17"||raw==="native") return "PREVIEW";
  if(raw==="") return "PREVIEW";
  return "PREVIEW";
}

export function resolveReaderUiMode({search="",stored=null}={}){
  let query=null;
  try{
    const p=new URLSearchParams(String(search||""));
    query=p.get("aoR17Reader");
  }catch{}
  // Query is authoritative. Otherwise an explicit stored rollback is honoured;
  // absence of both now lands on the native R17 reader.
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
