export const DIVINUM_OFFICIUM_PIN="126a07f91ede04664108abb6fb20ace3f4de14b9";

const RAW_DO="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/";
const MISSALEMEUM_FR=/^https:\/\/raw\.githubusercontent\.com\/mmolenda\/missalemeum\/[^/]+\/backend\/resources\/divinum-officium-local\/web\/www\/missa\/Francais\/(.+)$/i;
const DO_MISSA_COMMON=/^https:\/\/raw\.githubusercontent\.com\/DivinumOfficium\/divinum-officium\/([^/]+)\/web\/www\/missa\/(Latin|English|Francais|French)\/Commune\/(.+)$/i;
const DO_OBSOLETE_COMMON=/^https:\/\/raw\.githubusercontent\.com\/DivinumOfficium\/divinum-officium\/([^/]+)\/obsolete\/missa\/(Latin|English|Francais|French)\/Commune\/(.+)$/i;

function canonicalLanguage(value){
  return /^French$/i.test(String(value??""))?"Francais":String(value??"");
}

function canonicalCommonRoot(language,file){
  const lang=canonicalLanguage(language);
  const name=String(file??"").replace(/^Commune\//i,"");
  if(/^Coronatio\.txt$/i.test(name))return "missa";
  if(/^Propaganda\.txt$/i.test(name)&&/^English$/i.test(lang))return "missa";
  return "horas";
}

export function rewriteResolvedSourceUrl(input){
  const raw=String(input??"");
  let match=raw.match(MISSALEMEUM_FR);
  if(match){
    const relative=match[1];
    const common=relative.match(/^Commune\/(.+)$/i);
    const root=common?canonicalCommonRoot("Francais",common[1]):"missa";
    return `${RAW_DO}${DIVINUM_OFFICIUM_PIN}/web/www/${root}/Francais/${relative}`;
  }

  match=raw.match(DO_MISSA_COMMON);
  if(match){
    const [,ref,language,file]=match;
    const root=canonicalCommonRoot(language,file);
    return `${RAW_DO}${ref}/web/www/${root}/${canonicalLanguage(language)}/Commune/${file}`;
  }

  match=raw.match(DO_OBSOLETE_COMMON);
  if(match){
    const [,ref,language,file]=match;
    const root=canonicalCommonRoot(language,file);
    return `${RAW_DO}${ref}/web/www/${root}/${canonicalLanguage(language)}/Commune/${file}`;
  }

  return raw;
}

function requestUrl(input){
  if(typeof input==="string")return input;
  if(typeof URL!=="undefined"&&input instanceof URL)return input.href;
  return input?.url??"";
}

export function installSourceTransportCompat(win=globalThis){
  if(!win?.fetch)return Object.freeze({installed:false,reason:"FETCH_UNAVAILABLE"});
  if(win.__aoSourceTransportCompatInstalled)return win.AO_SOURCE_TRANSPORT_COMPAT_V1??Object.freeze({installed:true});

  const nativeFetch=win.fetch.bind(win);
  const wrapped=(input,init)=>{
    const raw=requestUrl(input);
    const rewritten=rewriteResolvedSourceUrl(raw);
    if(!rewritten||rewritten===raw)return nativeFetch(input,init);
    try{
      if(typeof win.Request==="function"&&input instanceof win.Request){
        return nativeFetch(new win.Request(rewritten,input),init);
      }
    }catch{}
    return nativeFetch(rewritten,init);
  };

  const api=Object.freeze({
    version:"source-transport-compat-v1",
    installed:true,
    rewrite:rewriteResolvedSourceUrl,
  });
  try{
    Object.defineProperty(win,"fetch",{value:wrapped,configurable:true,writable:true});
    Object.defineProperty(win,"__aoSourceTransportCompatInstalled",{value:true,configurable:true});
    Object.defineProperty(win,"AO_SOURCE_TRANSPORT_COMPAT_V1",{value:api,configurable:true});
    return api;
  }catch{
    try{
      win.fetch=wrapped;
      win.__aoSourceTransportCompatInstalled=true;
      win.AO_SOURCE_TRANSPORT_COMPAT_V1=api;
      return api;
    }catch{
      return Object.freeze({installed:false,reason:"FETCH_WRAP_FAILED"});
    }
  }
}

if(typeof window!=="undefined")installSourceTransportCompat(window);
