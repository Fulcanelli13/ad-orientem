export const READER_PRESENTATION_FILES=Object.freeze({
  sectionMap:"reader-section-map.v0.13.1.json",
  lowCorpus:"reader-text-low.v1.json",
  sungCorpus:"reader-text-sung.v1.json",
  canonSourceMap:"reader-canon-source-map.v1.json",
  nuptialData:"reader-nuptial.v1.json",
});

function urlFor(file,baseUrl){
  return new URL("../../data/presentation/"+file,baseUrl);
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok) throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data || typeof data!=="object") throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadReaderPresentationData({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function") throw new TypeError("fetch implementation required");
  const urls=Object.fromEntries(Object.entries(READER_PRESENTATION_FILES).map(([key,file])=>[
    key,urlFor(file,baseUrl)
  ]));
  const [sectionMap,lowCorpus,sungCorpus,canonSourceMap,nuptialData]=await Promise.all([
    readJson(fetchImpl,urls.sectionMap,"reader section map"),
    readJson(fetchImpl,urls.lowCorpus,"Low reader corpus"),
    readJson(fetchImpl,urls.sungCorpus,"Sung reader corpus"),
    readJson(fetchImpl,urls.canonSourceMap,"reader Canon source map"),
    readJson(fetchImpl,urls.nuptialData,"Nuptial reader payload"),
  ]);
  return Object.freeze({
    sectionMap,
    lowCorpus,
    sungCorpus,
    canonSourceMap,
    nuptialData,
    urls:Object.freeze(Object.fromEntries(Object.entries(urls).map(([k,v])=>[k,String(v)]))),
  });
}
