/*
 * Segment the Baltimore Manual (1889) Seven Words at real textual headings.
 * Its extra Marian/devotional conclusion must not be presented as Seventh Word.
 * This parser deliberately requires the documented appendix boundary.
 */
export function parseSevenWordsHistoricalWitness(input){
 const source=String(input||"").replace(/\r/g,"");
 const re=/The (First|Second|Third|Fourth|Fifth|Sixth|Seventh) Word\.?/gi;
 const hits=[...source.matchAll(re)];
 const ranks=["first","second","third","fourth","fifth","sixth","seventh"];
 if(hits.length!==7||hits.some((hit,i)=>hit[1].toLowerCase()!==ranks[i]))
   throw new Error("The historical source does not contain the seven ordered Word headings");
 const closing=source.slice(hits[6].index+hits[6][0].length);
 const boundary=closing.search(/A Prayer to our Blessed Lady of Sorrows\.?/i);
 if(boundary<0)throw new Error("Cannot separate the Seventh Word from the historical concluding devotion");
 const sections=hits.map((hit,i)=>{
  const end=i===6?hits[6].index+hits[6][0].length+boundary:hits[i+1].index;
  const text=source.slice(hit.index+hit[0].length,end).trim();
  if(text.length<90)throw new Error("An historical Word meditation is incomplete");
  return Object.freeze({title:hit[0].trim(),text});
 });
 const appendix=closing.slice(boundary).trim();
 if(appendix.length<100)throw new Error("The historical concluding prayers are incomplete");
 return Object.freeze({sections:Object.freeze(sections),appendix});
}
