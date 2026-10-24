/* An editorial navigation index for already published Calendar customs.
 * Never a parallel master or a second feast/date resolver. No geographic atlas.
 */
export const CUSTOMS_YEAR_LIBRARY_SECTIONS=Object.freeze([
  {
    "key": "advent",
    "en": "Advent",
    "fr": "Avent",
    "ids": [
      "ADVT-001",
      "ADVT-002",
      "ADVT-003"
    ]
  },
  {
    "key": "christmas_epiphany",
    "en": "Christmas & Epiphany",
    "fr": "Noël et Épiphanie",
    "ids": [
      "SNIC-001",
      "XMAS-001",
      "BLSS-003",
      "EPIP-001",
      "EPIP-002"
    ]
  },
  {
    "key": "candlemas_lent",
    "en": "Candlemas, Lent & Holy Week",
    "fr": "Chandeleur, Carême et Semaine sainte",
    "ids": [
      "DOM-011",
      "BLSS-001",
      "DOM-013",
      "HTHU-001",
      "BLSS-004"
    ]
  },
  {
    "key": "easter_rogations",
    "en": "Easter & Rogations",
    "fr": "Pâques et Rogations",
    "ids": [
      "EAST-001",
      "ROGA-001"
    ]
  },
  {
    "key": "corpus_sacred_heart",
    "en": "Corpus Christi & the Sacred Heart",
    "fr": "Fête-Dieu et Sacré-Cœur",
    "ids": [
      "CORP-001",
      "DOM-006",
      "DOM-007"
    ]
  },
  {
    "key": "marian",
    "en": "Marian feasts and devotions",
    "fr": "Fêtes et dévotions mariales",
    "ids": [
      "DEV-001",
      "MARI-002",
      "MARI-001",
      "BLSS-002"
    ]
  },
  {
    "key": "saints",
    "en": "Saints' feasts and patrons",
    "fr": "Fêtes des saints et patrons",
    "ids": [
      "SJOS-001",
      "SANT-001",
      "SCHR-001",
      "NDAY-001",
      "PATR-001"
    ]
  },
  {
    "key": "holy_souls",
    "en": "Holy Souls & remembrance",
    "fr": "Âmes du purgatoire et souvenir",
    "ids": [
      "DEAD-001",
      "DEAD-003"
    ]
  }
].map(row=>Object.freeze({...row,ids:Object.freeze(row.ids)})));
export function groupCalendarCustomsByYear(articles){
 const records=Array.isArray(articles)?articles:[],byId=new Map(records.map(x=>[x.id,x]));
 const seen=new Set(),groups=[];
 for(const section of CUSTOMS_YEAR_LIBRARY_SECTIONS){
   const selected=section.ids.filter(id=>byId.has(id)&&!seen.has(id)).map(id=>{
     seen.add(id);return byId.get(id);
   });
   if(selected.length)groups.push(Object.freeze({key:section.key,en:section.en,fr:section.fr,articles:Object.freeze(selected)}));
 }
 const remainder=records.filter(x=>!seen.has(x.id));
 if(remainder.length)groups.push(Object.freeze({key:"life_and_other",en:"Daily life & other occasions",fr:"Vie quotidienne et autres occasions",articles:Object.freeze(remainder)}));
 return Object.freeze(groups);
}
