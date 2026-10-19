/*
 * Lightweight, disposable Month-view cache. It never owns an observed Mass,
 * liturgical precedence, ICS exports or Day navigation.
 * Data enter here only after 42 successful canonical daily resolutions.
 */
export const MONTH_PREVIEW_CACHE_SCHEMA="ao-calendar-month-preview-v1";
const RETAIN_MS=14*24*60*60*1000;
const key=(month,lang,revision)=>"ao:calendar:month-preview:v1:"+month+":"+lang+":"+revision;
const safeRow=x=>x&&/^\d{4}-\d{2}-\d{2}$/.test(String(x.date||""))
  &&typeof x.title==="string"&&x.title.length>0&&x.title.length<300
  &&["temporale","sanctorale","unknown"].includes(x.cycle)
  &&typeof x.rank==="string"&&typeof x.colour==="string"
  &&Number.isInteger(x.tier)&&x.tier>=0&&x.tier<=4
  &&Number.isInteger(x.commemorationCount)&&x.commemorationCount>=0
  &&typeof x.accent==="string";
export function readMonthPreview(storage,month,lang,revision,{now=Date.now()}={}){
  if(!storage||!/^\d{4}-\d{2}$/.test(month)||!["en","fr"].includes(lang)||!revision)return null;
  try{
    const raw=storage.getItem(key(month,lang,revision));
    if(!raw)return null;
    const json=JSON.parse(raw);
    if(json?.schema!==MONTH_PREVIEW_CACHE_SCHEMA||json.month!==month||json.language!==lang||json.revision!==revision
      ||!Number.isFinite(json.savedAt)||json.savedAt>now||now-json.savedAt>RETAIN_MS
      ||!Array.isArray(json.rows)||json.rows.length!==42||!json.rows.every(safeRow)
      ||new Set(json.rows.map(x=>x.date)).size!==42)return null;
    return new Map(json.rows.map(x=>[x.date,Object.freeze({...x})]));
  }catch{return null}
}
export function writeMonthPreview(storage,month,lang,revision,rows,{now=Date.now()}={}){
  if(!storage||!/^\d{4}-\d{2}$/.test(month)||!["en","fr"].includes(lang)||!revision
    ||!Array.isArray(rows)||rows.length!==42||!rows.every(safeRow)
    ||new Set(rows.map(x=>x.date)).size!==42)return false;
  try{
    const output={schema:MONTH_PREVIEW_CACHE_SCHEMA,month,language:lang,revision,savedAt:now,rows};
    storage.setItem(key(month,lang,revision),JSON.stringify(output));
    return true;
  }catch{return false}
}
