export const COUNTRY_ALIASES = Object.freeze({
  "united states":"US","united states of america":"US","usa":"US","u.s.a.":"US","etats-unis":"US","états-unis":"US",
  "canada":"CA","mexico":"MX","méxico":"MX","mexique":"MX","colombia":"CO","colombie":"CO","brazil":"BR","brasil":"BR","brésil":"BR",
  "france":"FR","italy":"IT","italia":"IT","italie":"IT","germany":"DE","deutschland":"DE","allemagne":"DE","austria":"AT","österreich":"AT","autriche":"AT",
  "switzerland":"CH","suisse":"CH","schweiz":"CH","svizzera":"CH","belgium":"BE","belgique":"BE","belgië":"BE",
  "netherlands":"NL","nederland":"NL","pays-bas":"NL","poland":"PL","polska":"PL","pologne":"PL","portugal":"PT","spain":"ES","españa":"ES","espagne":"ES",
  "united kingdom":"GB","great britain":"GB","uk":"GB","england":"GB","scotland":"GB","wales":"GB","royaume-uni":"GB","grande-bretagne":"GB",
  "ireland":"IE","irlande":"IE","czech republic":"CZ","czechia":"CZ","česká republika":"CZ","singapore":"SG",
  "australia":"AU","australie":"AU","new zealand":"NZ","nouvelle-zélande":"NZ","nigeria":"NG","uganda":"UG",
  "mauritius":"MU","maurice":"MU","gabon":"GA","japan":"JP","japon":"JP","south africa":"ZA","afrique du sud":"ZA",
  "chile":"CL","argentina":"AR","argentine":"AR","peru":"PE","pérou":"PE","ecuador":"EC","équateur":"EC",
  "croatia":"HR","croatie":"HR","hungary":"HU","hongrie":"HU","slovakia":"SK","slovaquie":"SK","slovenia":"SI","slovénie":"SI",
  "romania":"RO","roumanie":"RO","lithuania":"LT","lituanie":"LT","latvia":"LV","lettonie":"LV","estonia":"EE","estonie":"EE"
});

function fold(value){
  return String(value??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

export function countryCodeFromText(value){
  const folded=fold(value);
  for(const [alias,code] of Object.entries(COUNTRY_ALIASES)){
    const a=fold(alias);
    if(folded===a || folded.endsWith(" "+a) || folded.includes(" - "+a) || folded.includes(", "+a)) return code;
  }
  return null;
}
