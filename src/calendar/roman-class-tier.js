// Display-only 1962 ordinal/rank recognition for Calendar indexes and Clock.
// This never assigns a class to an unresolved observance or alters the Mass
// resolver's actual rank, priority, commemoration or Proper.
const TIERS=Object.freeze({
  i:1,ii:2,iii:3,iv:4,"1":1,"2":2,"3":3,"4":4,
  "1st":1,first:1,"2nd":2,second:2,"3rd":3,third:3,"4th":4,fourth:4,
  "1re":1,"1ère":1,"première":1,
  "2e":2,"2ème":2,"iie":2,"deuxième":2,
  "3e":3,"3ème":3,"iiie":3,"troisième":3,
  "4e":4,"4ème":4,"ive":4,"quatrième":4
});
const ORDINAL=String.raw`(?:première|deuxième|troisième|quatrième|1ère|2ème|3ème|4ème|1re|2e|3e|4e|1st|2nd|3rd|4th|first|second|third|fourth|iiie|iie|ive|iii|ii|iv|i|[1-4])`;
const FIRST=new RegExp(String.raw`(?<![\p{L}\p{N}])(?<ordinal>${ORDINAL})\s*(?:classis|classe|class)(?![\p{L}\p{N}])`,"gu");
const LAST=new RegExp(String.raw`(?<![\p{L}\p{N}])(?:classis|classe|class)\s+(?<ordinal>${ORDINAL})(?![\p{L}\p{N}])`,"gu");

export function romanClassTier(label){
  const rank=String(label??"").trim().normalize("NFC").toLowerCase();
  if(!rank)return 0;
  // A compound source label is not a licence to invent one unambiguous class.
  if(/(?:[1-4]|iii|ii|iv|i)\s*[-–/]\s*(?:[1-4]|iii|ii|iv|i)(?![a-z])/u.test(rank))return 0;
  const bare=rank.replace(/^(?:classis|class|classe)\s+|\s+(?:classis|class|classe)$/gu,"").trim();
  if(Object.hasOwn(TIERS,bare))return TIERS[bare];
  const found=new Set();
  for(const expression of [FIRST,LAST]){
    for(const match of rank.matchAll(expression)){
      const tier=TIERS[match.groups?.ordinal];
      if(tier)found.add(tier);
    }
  }
  return found.size===1?[...found][0]:0;
}
