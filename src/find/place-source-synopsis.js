// The canonical Place synopsis is shared between full Place folios and
// desktop map cards. It must not depend on either presentation renderer.
const list=value=>Array.isArray(value)?value:[];

export function sacredPlaceSynopsis(place,{maxLength=340,language="en",preferredCategory=null}={}){
  if(!place)return "";
  const categories=["shrines","pilgrimages","apparitions","relics","traditions"];
  const ordered=categories.includes(preferredCategory)
    ?[preferredCategory,...categories.filter(key=>key!==preferredCategory)]:categories;
  // A relic or apparition selected on the map should not display an unrelated
  // shrine introduction merely because that Place also has a shrine record.
  // When the user explicitly filtered to one subject, an absent summary must
  // not be quietly replaced by a statement from a different subject.
  const refs=categories.includes(preferredCategory)&&list(place[preferredCategory]).length
    ?arr(place[preferredCategory]):ordered.flatMap(key=>list(place[key]));
  const summary=String(refs.map(item=>language==="fr"?(item?.summary_fr||item?.summary):item?.summary).find(value=>String(value??"").trim())??"").trim().replace(/\s+/g," ");
  if(summary.length<=maxLength)return summary;
  const prefix=summary.slice(0,maxLength),boundary=prefix.lastIndexOf(" ");
  return prefix.slice(0,boundary>maxLength*.7?boundary:maxLength).trimEnd()+"…";
}
