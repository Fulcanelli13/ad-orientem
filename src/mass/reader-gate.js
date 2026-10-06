// Definitive production gate for the Mass reader.
//
// There is exactly one production presentation owner: the native modular reader.
// Historical LEGACY/SHADOW renderers remain repository evidence only and are not
// selectable by query string, localStorage, or runtime fallback.

export const READER_UI_MODES = Object.freeze(["NATIVE"]);
export const READER_UI_STORAGE_KEY = "ao-r17-reader-ui";

export function resolveReaderUiMode(){
  return "NATIVE";
}

export function readBrowserReaderUiMode(){
  return "NATIVE";
}

export function readerModeAllowsLegacyDom(){
  return false;
}

export function readerModeRunsShadowAudit(){
  return false;
}

export function readerModeMountsPreview(){
  return true;
}
