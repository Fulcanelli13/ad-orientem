/**
 * Prayer acquisition — Scripture reading companions.
 *
 * These are not Bible verses, source-text replacements or new Prayer routes.
 * They are short optional devotions shown in the existing Scripture reader.
 * English and Latin are independent verified print witnesses; French is never
 * generated or silently substituted. French readers can explicitly pray the
 * printed Latin *Concede mihi* before reading.
 */
import {prayerAcquisitionCandidates} from "./prayer-acquisition-historical-witnesses.v1.js";
export function scriptureMeditationPrayers(phase,{language="en"}={}){
 if(!["before","after"].includes(phase)||!["en","fr"].includes(language))return Object.freeze([]);
 let rows=[];
 if(phase==="before"){
   rows=language==="fr"
     ?prayerAcquisitionCandidates("prepare_spiritual_reading",{language:"la"})
     :[
       ...prayerAcquisitionCandidates("prepare_spiritual_reading",{language:"en"}),
       ...prayerAcquisitionCandidates("prepare_spiritual_reading",{language:"la"})
     ];
 }else if(language==="en")
   rows=prayerAcquisitionCandidates("conclude_spiritual_reading",{language:"en"});
 return Object.freeze(rows.map(x=>Object.freeze({
   id:x.id,title:x.title,text:x.text,language:x.language,
   source:Object.freeze({
     name:"F. X. Lasance · My Prayer-Book (1908)",
     page:x.source.page,scanPageUrl:x.source.scanPageUrl
   })
 })));
}
