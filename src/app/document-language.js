// Keeps <html lang> in step with the app language, so screen readers voice
// French with a French voice and modules that read documentElement.lang agree
// with the store. The store remains the single language owner.
export const DOCUMENT_LANGUAGE_VERSION="document-language-v1";

export function documentLanguageFor(state){
  return state?.language==="fr"?"fr":"en";
}

export function installDocumentLanguage({win=globalThis}={}){
  if(win?.AO_DOCUMENT_LANGUAGE_V1)return win.AO_DOCUMENT_LANGUAGE_V1;
  const html=win?.document?.documentElement,store=win?.AO_RUNTIME_V8?.store;
  if(typeof html?.setAttribute!=="function"||typeof store?.getState!=="function")return null;
  const sync=(state=store.getState())=>{
    const lang=documentLanguageFor(state);
    try{if(html.getAttribute?.("lang")!==lang)html.setAttribute("lang",lang);}catch{}
    return lang;
  };
  sync();
  const unsub=typeof store.subscribe==="function"?store.subscribe(next=>sync(next)):null;
  const api=Object.freeze({
    version:DOCUMENT_LANGUAGE_VERSION,
    sync,
    dispose(){
      if(typeof unsub==="function")unsub();
      if(win.AO_DOCUMENT_LANGUAGE_V1===api)delete win.AO_DOCUMENT_LANGUAGE_V1;
    },
  });
  win.AO_DOCUMENT_LANGUAGE_V1=api;
  return api;
}
