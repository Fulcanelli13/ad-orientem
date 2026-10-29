import {calendarCustomHistoricalVariants} from "./customs-22-regional-variants.js";
// Search for the 35 published Calendar customs using their actual EN/FR article
// content. This never changes publication state or creates date-bound events.
const TEXT_FIELDS=Object.freeze(["title","description","history","meaning","practice","caution","scope","occasion"]);
const SOURCE_FIELDS=Object.freeze(["sources","history_sources","supporting_sources"]);

export function normaliseCustomSearch(value){
  return String(value??"")
    .toLocaleLowerCase()
    .replace(/œ/g,"oe").replace(/æ/g,"ae").replace(/ß/g,"ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
}

export function calendarCustomSearchIndex(article){
  if(!article||!article.id)return "";
  const words=[article.id];
  for(const field of TEXT_FIELDS){
    words.push(article[field]?.en??"",article[field]?.fr??"");
  }
  for(const field of SOURCE_FIELDS){
    for(const source of article[field]||[]){
      words.push(source.title??"");
    }
  }
  // Search regional historical witnesses through the *existing parent article*.
  // These terms never create independent canonical Customs search hits.
  for(const fr of [false,true]){
    for(const v of calendarCustomHistoricalVariants(article.id,{fr})){
      words.push(v.title,v.history,v.context_or_practice,...v.geography);
    }
  }
  return normaliseCustomSearch(words.join(" "));
}

export function calendarCustomSearchMatches(index,query){
  const tokens=normaliseCustomSearch(query).split(" ").filter(Boolean);
  const corpus=String(index||"");
  return tokens.every(token=>corpus.includes(token));
}
