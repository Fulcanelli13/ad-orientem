/*
 * Source-bounded historical Litany of the Saints reader.
 * These are named historical witnesses, NOT certified 1962 liturgical editions.
 * End at the witness's Our Father rubric: its following Psalm 69/collects
 * belong to a wider penitential sequence and must not be silently merged.
 */
export const LITANY_SOURCE_WITNESSES=Object.freeze({
 en:Object.freeze({
  title:"The Catholic Prayer Book and Manual of Meditations/The Litany of the Saints",
  cacheKey:"litany-saints-1883-en-v2",
  url:"https://en.wikisource.org/wiki/The_Catholic_Prayer_Book_and_Manual_of_Meditations/The_Litany_of_the_Saints",
  label:"The Catholic Prayer Book and Manual of Meditations · 1883",
  status:"HISTORICAL_TRANSCRIPTION_UNCOLLATED"
 }),
 fr:Object.freeze({
  title:"Œuvres de P. Corneille (Marty-Laveaux)/Tome 9/Les sept psaumes pénitentiaux",
  cacheKey:"litany-saints-corneille-fr-v2",
  url:"https://fr.wikisource.org/wiki/%C5%92uvres_de_P._Corneille_(Marty-Laveaux)/Tome_9/Les_sept_psaumes_p%C3%A9nitentiaux",
  label:"Pierre Corneille · Les Litanies des saints · éd. Marty-Laveaux, 1862",
  status:"HISTORICAL_TRANSCRIPTION_UNCOLLATED"
 })
});
export function extractLitanyProper(raw,language="en"){
 const text=String(raw||"").replace(/\r/g,"").replace(/[\u200b\u00ad]/g,"");
 const french=language==="fr";
 const start=french?text.toLocaleLowerCase("fr").lastIndexOf("les litanies des saints."):text.search(/Lord,\s*have mercy on us/i);
 if(start<0)throw new Error("Litany opening not found in historical witness");
 const portion=text.slice(start);
 const end=portion.search(french?/Notre Père,\s*qui\b/i:/Our Father,\s*in secret\b/i);
 if(end<0)throw new Error("Litany ending not found: refuse to import accompanying psalms and collects");
 const proper=portion.slice(french?start===0?0:"les litanies des saints.".length:0,end).trim();
 const necessary=french?[/Seigneur,\s*ayez pitié/i,/Sainte Marie/i,/Saint Pierre/i,/Agneau de Dieu/i]:[/Lord,\s*have mercy/i,/Holy Mary/i,/St\.? Peter/i,/Lamb of God/i];
 if(proper.length<500||necessary.some(pattern=>!pattern.test(proper)))
  throw new Error("Litany witness is incomplete or does not match the selected edition");
 return proper;
}
export function paginateLitanyProper(raw,language="en",pageLength=18){
 const lines=String(raw||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
 if(lines.length<20)throw new Error("Litany has too few distinct lines: layout extraction failed");
 const size=Math.max(12,Math.min(26,Math.trunc(Number(pageLength)||18)));
 const parts=[];
 for(let i=0;i<lines.length;i+=size){
  const end=Math.min(i+size,lines.length);
  parts.push({title:language==="fr"?"Partie "+(parts.length+1):"Part "+(parts.length+1),lines:lines.slice(i,end),firstLine:i+1,lastLine:end});
 }
 return parts;
}
