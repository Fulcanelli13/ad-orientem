/**
 * Discoverability pointers for seven source-owned Communion
 * source prayers named in the 2013 Coalition Red Booklet.
 *
 * The 2013 booklet is ONLY an inventory witness here: its English wording
 * has not been collated. Text, French/Latin editions and rendering remain
 * owned by the existing v38.3 Communion Treasury.
 */
import {COMMUNION_TREASURY_V383} from "./traditional-pray-data.js";

const POINTERS=Object.freeze([
  ["pre_thomas","beforeThomas","before",5],
  ["pre_ambrose","beforeAmbrose","before",6],
  ["communion_thanks","thanksgivingMyGoodJesus","after",62],
  ["communion_heart","eucharisticHeartAspiration","after",62],
  ["communion_thomas","afterThomas","after",64],
  ["communion_bonaventure","afterBonaventure","after",63],
  ["crucifix","enEgo","after",65]
]);
export const RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1=Object.freeze(POINTERS.map(([id,sourceId,phase,printedPage])=>{
  const source=COMMUNION_TREASURY_V383[sourceId];
  if(!source?.en||!source?.title||!source?.titleFr)throw new Error("Unpublished Communion source: "+sourceId);
  return Object.freeze({
    id,sourceId,phase,printedPage,subject:"III",
    route:"pray.communion_treasury",
    en:source.title,fr:source.titleFr,
    languages:Object.freeze(["en","fr","la"].filter(k=>!!source[k])),
    wordingCollatedAgainst2013:false
  });
}));
const byId=new Map(RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1.map(x=>[x.id,x]));
export function redBookletCommunionLibraryLink(id){return byId.get(String(id||""))||null}
export function redBookletCommunionLibraryLinksForSubject(subject,query=""){
  const q=String(query||"").trim().toLocaleLowerCase();
  if(subject!=="III"&&!(subject==="all"&&q))return [];
  return RED_BOOKLET_COMMUNION_LIBRARY_LINKS_V1.filter(w=>
    !q||[w.id,w.en,w.fr,w.sourceId,w.phase].some(x=>String(x).toLocaleLowerCase().includes(q)));
}
