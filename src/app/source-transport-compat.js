export const DIVINUM_OFFICIUM_PIN="126a07f91ede04664108abb6fb20ace3f4de14b9";

const RAW_DO="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/";
const PINNED_DO=RAW_DO+DIVINUM_OFFICIUM_PIN+"/";
const MISSALEMEUM_FR=/^https:\/\/raw\.githubusercontent\.com\/mmolenda\/missalemeum\/[^/]+\/backend\/resources\/divinum-officium-local\/web\/www\/missa\/Francais\/(.+)$/i;
const DO_MISSA_COMMON=/^https:\/\/raw\.githubusercontent\.com\/DivinumOfficium\/divinum-officium\/([^/]+)\/web\/www\/missa\/(Latin|English|Francais|French)\/Commune\/(.+)$/i;
const DO_OBSOLETE_COMMON=/^https:\/\/raw\.githubusercontent\.com\/DivinumOfficium\/divinum-officium\/([^/]+)\/obsolete\/missa\/(Latin|English|Francais|French)\/Commune\/(.+)$/i;

const PINNED_ABSENT_SOURCES=new Set([
  PINNED_DO+"web/www/horas/English/Commune/Coronatio.txt",
  PINNED_DO+"web/www/horas/Francais/Commune/Coronatio.txt",
  PINNED_DO+"web/www/horas/French/Commune/Coronatio.txt",
  // The pinned 1962 Commons inventory does not contain C10t.txt.
  // Keep the resolver's 404 semantics but avoid repeated external 404 probes.
  ...["Latin","English","Francais","French"].map(language=>
    PINNED_DO+"web/www/horas/"+language+"/Commune/C10t.txt"),
  ...["Latin","English","Francais","French"].flatMap(language=>[
    PINNED_DO+"web/www/missa/"+language+"/Sancti/10-08c.txt",
    PINNED_DO+"web/www/horas/"+language+"/Sancti/10-08c.txt",
  ]),
]);

export function isKnownAbsentResolvedSourceUrl(input){
  return PINNED_ABSENT_SOURCES.has(String(input??""));
}

function canonicalLanguage(value){
  return /^French$/i.test(String(value??""))?"Francais":String(value??"");
}

export function rewriteResolvedSourceUrl(input){
  const raw=String(input??"");
  let match=raw.match(MISSALEMEUM_FR);
  if(match){
    const relative=match[1];
    const root=/^Commune\//i.test(relative)?"horas":"missa";
    return `${RAW_DO}${DIVINUM_OFFICIUM_PIN}/web/www/${root}/Francais/${relative}`;
  }

  match=raw.match(DO_MISSA_COMMON);
  if(match){
    const [,ref,language,file]=match;
    // Coronatio's appointed 1962 Mass lessons, Gospel and chants exist in
    // this pinned missa corpus, but NOT its horas counterpart for EN/FR.
    // Redirecting it to horas silently discarded the Chair of St Peter and
    // Gregory VII Proper translations. Preserve the source's own Mass owner.
    // Pinned source: DivinumOfficium/divinum-officium@${DIVINUM_OFFICIUM_PIN}
    // web/www/missa/{English,Francais}/Commune/Coronatio.txt
    if(ref===DIVINUM_OFFICIUM_PIN && /^Coronatio\.txt$/i.test(file))return raw;
    return `${RAW_DO}${ref}/web/www/horas/${canonicalLanguage(language)}/Commune/${file}`;
  }

  match=raw.match(DO_OBSOLETE_COMMON);
  if(match){
    const [,ref,language,file]=match;
    return `${RAW_DO}${ref}/web/www/horas/${canonicalLanguage(language)}/Commune/${file}`;
  }

  return raw;
}

// The legacy ScriptureService still requests three historical French
// witnesses through the MediaWiki parse API from a browser origin. That
// endpoint currently rejects CORS, so attempting it generates browser errors
// before ScriptureService can fall back to its linked original witness.
// Never supply edition text from a different Bible, Catena or language.
// Report an explicit upstream-source error in the original parser's expected
// envelope, preserving its own SOURCE_UNAVAILABLE/link-only presentation.
// Ordinary Wikisource hyperlinks and unrelated MediaWiki requests are untouched.
export function isLegacyFrenchWikisourceParserUrl(input){
  try{
    const url=new URL(String(input??""));
    if(url.protocol!=="https:"||url.hostname!=="fr.wikisource.org"||
       url.pathname!=="/w/api.php"||
       url.searchParams.get("action")!=="parse"||
       !String(url.searchParams.get("prop")??"").split("|").includes("text"))
      return false;
    const page=url.searchParams.get("page")??"";
    return /^Chaîne d.or sur l.évangile de saint (Matthieu|Marc|Luc|Jean)\/Chapitre \d+$/iu.test(page) ||
      /^La sainte Bible selon la Vulgate \(J\.-B\. Glaire\)\/.+$/u.test(page) ||
      /^Discours sur les psaumes \(Augustin\)\/Psaumes [IVXLCDM]+ à [IVXLCDM]+$/u.test(page);
  }catch{return false;}
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
    const target=rewritten||raw;
    if(isLegacyFrenchWikisourceParserUrl(target)&&typeof win.Response==="function"){
      return Promise.resolve(new win.Response(JSON.stringify({
        error:{
          code:"HISTORICAL_SOURCE_UNAVAILABLE_IN_BROWSER",
          info:"French Wikisource parse API unavailable cross-origin; use the linked original edition.",
        },
      }),{
        status:200,
        headers:{
          "content-type":"application/json; charset=utf-8",
          "x-ao-source-compat":"historical-wikisource-source-unavailable",
        },
      }));
    }
    if(isKnownAbsentResolvedSourceUrl(target)&&typeof win.Response==="function"){
      return Promise.resolve(new win.Response("",{
        status:404,
        statusText:"Not Found",
        headers:{"content-type":"text/plain; charset=utf-8","x-ao-source-compat":"known-absent"},
      }));
    }
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
    isKnownAbsent:isKnownAbsentResolvedSourceUrl,
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
