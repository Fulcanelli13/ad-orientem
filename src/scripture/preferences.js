import {isCatholicBookId} from "./canon.js";
const KEY="ao-scripture-v1";
const EDITIONS=new Set(["dr-challoner","cpdv-2009","crampon-1923","vulgate-clementine"]);
function read(storage){
 try{const value=JSON.parse(storage?.getItem?.(KEY)||"{}");return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
 catch{return {};}
}
function asBookmark(item){
 if(!item||typeof item!=="object"||!isCatholicBookId(item.book)||
  !Number.isSafeInteger(item.chapter)||item.chapter<1||
  !Number.isSafeInteger(item.verseStart)||item.verseStart<1)return null;
 // Older bookmarks are retained without falsely assigning a translation.
 const editionId=EDITIONS.has(item.editionId)?item.editionId:null;
 return Object.freeze({book:item.book,chapter:item.chapter,verseStart:item.verseStart,editionId});
}
const key=b=>[b.editionId??"unassigned",b.book,b.chapter,b.verseStart].join(":");
export function createScripturePreferences(storage=globalThis.localStorage){
 const languages=new Set(["en","fr","la"]);
 function save(value){try{storage?.setItem?.(KEY,JSON.stringify(value));return true;}catch{return false;}}
 return Object.freeze({
  load(){
   const raw=read(storage);
   const bookmarks=Array.isArray(raw.bookmarks)?raw.bookmarks.map(asBookmark).filter(Boolean).slice(-500):[];
   const language=languages.has(raw.language)?raw.language:"en";
   return {language,bookmarks};
  },
  englishEdition(){
   const v=read(storage).englishEdition;
   return ["dr-challoner","cpdv-2009"].includes(v)?v:"dr-challoner";
  },
  setEnglishEdition(id){
   if(!["dr-challoner","cpdv-2009"].includes(id))throw Error("Unavailable English reader preference");
   return save({...read(storage),englishEdition:id});
  },
  setLanguage(language){
   if(!languages.has(language))throw Error("Unsupported Scripture language");
   return save({...read(storage),language});
  },
  toggleBookmark(passage,editionId){
   if(!EDITIONS.has(editionId))throw Error("A specific Catholic edition is required for a bookmark");
   const checked=asBookmark({...passage,editionId});
   if(!checked)throw Error("Invalid bookmark");
   const old=this.load().bookmarks,needle=key(checked);
   const present=old.some(x=>key(x)===needle);
   const result=present?old.filter(x=>key(x)!==needle):[...old,checked].slice(-500);
   save({...read(storage),bookmarks:result});
   return !present;
  },
  // Explicit, user-directed migration; unlabelled legacy bookmarks are never
  // assumed to refer to CPDV, Douay–Rheims, Crampon or Vulgate.
  assignLegacyBookmark(passage,editionId){
   if(!EDITIONS.has(editionId))throw Error("Invalid Catholic edition");
   const checked=asBookmark({...passage,editionId:null});
   if(!checked)throw Error("Invalid legacy bookmark");
   const bookmarks=this.load().bookmarks;
   const needle=key(checked);
   if(!bookmarks.some(x=>key(x)===needle))return false;
   const assigned=asBookmark({...checked,editionId});
   const result=bookmarks.filter(x=>key(x)!==needle);
   if(!result.some(x=>key(x)===key(assigned)))result.push(assigned);
   save({...read(storage),bookmarks:result.slice(-500)});
   return true;
  }
 });
}
