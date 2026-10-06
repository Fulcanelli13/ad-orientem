// Definitive production gate for the Mass reader.
// There is exactly one executable Mass presentation owner: R17 native.
// Historical LEGACY/SHADOW renderers are evidence only and cannot be selected
// by query string, persisted storage, or runtime fallback.

export const READER_UI_MODES = Object.freeze(["NATIVE"]);
export const READER_UI_STORAGE_KEY = "ao-r17-reader-ui";

export function resolveReaderUiMode(_options = {}){
  return "NATIVE";
}

export function readBrowserReaderUiMode(_win = globalThis){
  return "NATIVE";
}

export function readerModeAllowsLegacyDom(_mode){
  return false;
}

export function readerModeRunsShadowAudit(_mode){
  return false;
}

export function readerModeMountsPreview(_mode){
  return true;
}
