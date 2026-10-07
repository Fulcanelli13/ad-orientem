import { absoluteUrl, attrValue, decodeHtml } from "./html-source-utils.mjs";

const COORD_EPSILON=0.00035;

function finitePoint(lat,lng){
  const a=Number(lat),b=Number(lng);
  if(!Number.isFinite(a)||!Number.isFinite(b))return null;
  if(a<-90||a>90||b<-180||b>180)return null;
  if(Math.abs(a)<1e-10&&Math.abs(b)<1e-10)return null;
  return {lat:a,lng:b};
}
function candidate(lat,lng,{carrier,sourceRef,sourceUrl,precision="address"}={}){
  const p=finitePoint(lat,lng);if(!p)return null;
  return Object.freeze({...p,carrier,sourceRef,sourceUrl,precision});
}
function walk(value,visitor,path="$"){
  if(Array.isArray(value)){value.forEach((v,i)=>walk(v,visitor,path+"["+i+"]"));return}
  if(!value||typeof value!=="object")return;
  visitor(value,path);
  for(const [k,v] of Object.entries(value))walk(v,visitor,path+"."+k);
}
function jsonLdCandidates(html,pageUrl){
  const out=[];
  const re=/<script\b([^>]*)>([\s\S]*?)<\/script>/gi;let m,index=0;
  while((m=re.exec(String(html??"")))){
    const type=attrValue(m[1],"type");
    if(!/application\/ld\+json/i.test(type??""))continue;
    let parsed;try{parsed=JSON.parse(decodeHtml(m[2]));}catch{continue}
    walk(parsed,(obj,path)=>{
      const geo=obj?.geo&&typeof obj.geo==="object"?obj.geo:obj;
      const lat=geo?.latitude??geo?.lat;
      const lng=geo?.longitude??geo?.lng??geo?.lon;
      const p=candidate(lat,lng,{
        carrier:"JSON_LD",
        sourceRef:pageUrl+"#jsonld-"+index+"-"+path,
        sourceUrl:pageUrl,
        precision:"address",
      });
      if(p)out.push(p);
    });
    index+=1;
  }
  return out;
}
function metaCandidates(html,pageUrl){
  const tags=[...String(html??"").matchAll(/<meta\b([^>]*)>/gi)].map(m=>m[1]);
  let lat=null,lng=null,latRef=null,lngRef=null;
  for(const attrs of tags){
    const key=(attrValue(attrs,"itemprop")??attrValue(attrs,"property")??attrValue(attrs,"name")??"").toLowerCase();
    const value=attrValue(attrs,"content");
    if(/^(geo:)?latitude$/.test(key)){lat=value;latRef=key}
    if(/^(geo:)?longitude$/.test(key)){lng=value;lngRef=key}
  }
  const p=candidate(lat,lng,{carrier:"META_GEO",sourceRef:pageUrl+"#meta-"+latRef+"-"+lngRef,sourceUrl:pageUrl,precision:"address"});
  return p?[p]:[];
}
function dataAttributeCandidates(html,pageUrl){
  const out=[];
  const tags=[...String(html??"").matchAll(/<[^>]+\b(?:data-lat(?:itude)?|lat(?:itude)?)\s*=\s*["'][^"']+["'][^>]*>/gi)].map(m=>m[0]);
  let index=0;
  for(const tag of tags){
    const lat=attrValue(tag,"data-lat")??attrValue(tag,"data-latitude")??attrValue(tag,"latitude")??attrValue(tag,"lat");
    const lng=attrValue(tag,"data-lng")??attrValue(tag,"data-longitude")??attrValue(tag,"longitude")??attrValue(tag,"lng")??attrValue(tag,"lon");
    const p=candidate(lat,lng,{carrier:"DATA_ATTRIBUTES",sourceRef:pageUrl+"#data-geo-"+index,sourceUrl:pageUrl,precision:"address"});
    if(p)out.push(p);
    index+=1;
  }
  return out;
}
function pointFromUrl(url){
  let u;try{u=new URL(url);}catch{return null}
  const decoded=decodeURIComponent(u.href);
  const patterns=[
    /@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)(?:,|z|$)/i,
    /[?&#](?:q|query|destination|ll|center)=(-?\d{1,2}(?:\.\d+)?)(?:%2C|,)(-?\d{1,3}(?:\.\d+)?)/i,
    /[?&#]mlat=(-?\d{1,2}(?:\.\d+)?).*?[?&#]mlon=(-?\d{1,3}(?:\.\d+)?)/i,
    /#map=\d+(?:\.\d+)?\/(-?\d{1,2}(?:\.\d+)?)\/(-?\d{1,3}(?:\.\d+)?)/i,
    /!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/i,
  ];
  for(const re of patterns){
    const m=decoded.match(re);if(m){const p=finitePoint(m[1],m[2]);if(p)return p}
  }
  return null;
}
function significantWords(value){
  return decodeURIComponent(String(value??""))
    .normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase().replace(/[^a-z0-9]+/g," ").split(/\s+/).filter(Boolean)
    .filter(token=>token.length>=3)
    .filter(token=>!new Set(["www","google","maps","map","place","dir","data","entry","view","viewer","italy","france","germany","deutschland","suisse","switzerland","usa","united","states"]).has(token));
}
function explicitMapPlaceText(url){
  let u;try{u=new URL(url);}catch{return null}
  const decoded=decodeURIComponent(u.pathname);
  const place=decoded.match(/\/(?:place|dir\/\/)\/([^/@]+)/i)?.[1]??null;
  return place?place.replace(/\+/g," "):null;
}
function mapCandidateConflicts(url,expectedText){
  if(!expectedText)return false;
  const placeText=explicitMapPlaceText(url);
  if(!placeText)return false;
  const evidence=[...new Set(significantWords(placeText))];
  if(evidence.length<2)return false;
  const expected=new Set(significantWords(expectedText));
  const overlaps=evidence.filter(token=>expected.has(token));
  return overlaps.length===0;
}
function urlCandidates(html,pageUrl,{expectedText=null}={}){
  const out=[];let index=0;
  const attrRe=/\b(?:href|src|data-src|data-url)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;let m;
  while((m=attrRe.exec(String(html??"")))){
    const raw=decodeHtml(m[1]??m[2]??"");
    const url=absoluteUrl(raw,pageUrl);if(!url)continue;
    if(!/(?:google\.[^/]+\/maps|maps\.google\.|openstreetmap\.org|bing\.com\/maps|apple\.com\/maps|mapy\.cz|here\.com)/i.test(url))continue;
    const p=pointFromUrl(url);
    if(!p)continue;
    if(mapCandidateConflicts(url,expectedText)){
      out.push(Object.freeze({rejected:true,lat:p.lat,lng:p.lng,carrier:"MAP_URL",sourceRef:url,sourceUrl:pageUrl,precision:"address",rejection:"MAP_PLACE_TEXT_CONFLICT"}));
      continue;
    }
    out.push(candidate(p.lat,p.lng,{carrier:"MAP_URL",sourceRef:url,sourceUrl:pageUrl,precision:"address"}));
    index+=1;
  }
  return out;
}
function dedupe(candidates){
  const out=[];
  for(const c of candidates.filter(Boolean)){
    if(out.some(x=>Math.abs(x.lat-c.lat)<=1e-7&&Math.abs(x.lng-c.lng)<=1e-7))continue;
    out.push(c);
  }
  return out;
}
function coherent(candidates){
  if(candidates.length<=1)return true;
  const base=candidates[0];
  return candidates.every(c=>Math.abs(c.lat-base.lat)<=COORD_EPSILON&&Math.abs(c.lng-base.lng)<=COORD_EPSILON);
}

export function extractOfficialGeoCandidates(html,{pageUrl,expectedText=null}={}){
  const sourceUrl=pageUrl??"about:blank";
  return [
    ...jsonLdCandidates(html,sourceUrl),
    ...metaCandidates(html,sourceUrl),
    ...dataAttributeCandidates(html,sourceUrl),
    ...urlCandidates(html,sourceUrl,{expectedText}),
  ];
}

export function selectOfficialGeoFromHtml(html,{pageUrl,expectedText=null}={}){
  const all=extractOfficialGeoCandidates(html,{pageUrl,expectedText});
  const rejectedCandidates=all.filter(c=>c?.rejected);
  const candidates=dedupe(all.filter(c=>!c?.rejected));
  if(!candidates.length)return Object.freeze({geo:null,candidates:[],rejectedCandidates,ambiguous:false});
  if(!coherent(candidates))return Object.freeze({geo:null,candidates,rejectedCandidates,ambiguous:true});
  const chosen=candidates[0];
  return Object.freeze({
    geo:Object.freeze({
      lat:chosen.lat,
      lng:chosen.lng,
      precision:chosen.precision,
      geocoding_source:"OFFICIAL_SOURCE",
      source_url:pageUrl,
      source_ref:chosen.sourceRef,
      upstream_carrier:chosen.carrier,
    }),
    candidates,
    rejectedCandidates,
    ambiguous:false,
  });
}
