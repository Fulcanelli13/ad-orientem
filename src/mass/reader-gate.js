// Feature gate for the R17 Mass reader landing.
// Production default remains LEGACY until parity is explicitly certified.

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
  return readBrowserReaderUiOverride(win)??"LEGACY";
}

export function readBrowserReaderUiOverride(win=globalThis){
  let stored=null;
  try{stored=win?.localStorage?.getItem?.(READER_UI_STORAGE_KEY)??null}catch{}
  let query=null;
  try{
    const p=new URLSearchParams(String(win?.location?.search||""));
    query=p.get("aoR17Reader");
  }catch{}
  const raw=query??stored;
  if(raw==null || String(raw).trim()==="")return null;
  return normalize(raw);
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
