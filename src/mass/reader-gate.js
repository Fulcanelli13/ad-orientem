// Final production feature gate for the native Mass reader.
// Native is the default. Legacy is an explicit rollback/debug path only.

export const READER_UI_MODES = Object.freeze(["NATIVE","LEGACY","SHADOW"]);
export const READER_UI_STORAGE_KEY = "ao-r17-reader-ui";

function normalize(value){
  const raw=String(value??"").trim().toLowerCase();
  if(raw==="legacy"||raw==="rollback") return "LEGACY";
  if(raw==="shadow") return "SHADOW";
  if(raw==="preview"||raw==="r17"||raw==="native"||raw==="") return "NATIVE";
  return "NATIVE";
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
  return ["LEGACY","SHADOW"].includes(normalize(mode));
}

export function readerModeRunsShadowAudit(mode){
  return normalize(mode)==="SHADOW";
}

export function readerModeMountsPreview(mode){
  return normalize(mode)==="NATIVE";
}
