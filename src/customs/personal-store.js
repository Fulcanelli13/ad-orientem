/* User-owned household customs and prayers. Never part of the authoritative customs
 * corpus, Mass rubrics, Calendar date resolver, or parish event listings.
 * Local-only V1 storage; no account/cloud sync or reminders.
 */
import { buildLiturgicalYear } from "../calendar/liturgical-year.js";

export const MY_CUSTOMS_STORAGE_KEY="ao.my-customs-prayers.v1";
export const MY_CUSTOMS_SCHEMA="AO_PERSONAL_CUSTOMS_PRAYERS_V1";
export const MY_CUSTOMS_SEASONS=Object.freeze([
  "advent","christmas","epiphany","after-epiphany","septuagesima",
  "lent","passion","easter","ascension","pentecost","after-pentecost"
]);
const PERIODS=new Set(MY_CUSTOMS_SEASONS);
const MAX_ITEMS=200;
const plain=(v,max=3000)=>String(v??"").trim().slice(0,max);
const safeId=id=>/^[a-z0-9-]{8,90}$/i.test(String(id||""));
const validDay=mmdd=>{
 if(!/^\d{2}-\d{2}$/.test(String(mmdd||"")))return false;
 const d=new Date("2000-"+mmdd+"T12:00:00Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(5,10)===mmdd;
};
export function normalizeMyCustomSchedule(input){
 const kind=String(input?.kind||"none");
 if(kind==="none")return Object.freeze({kind:"none"});
 if(kind==="annual"){
   const mmdd=String(input?.mmdd||"");
   if(!validDay(mmdd))throw new RangeError("Invalid annual month/day");
   return Object.freeze({kind,mmdd});
 }
 if(kind==="season"){
   const season=String(input?.season||"");
   if(!PERIODS.has(season))throw new RangeError("Unknown 1962 liturgical season");
   return Object.freeze({kind,season});
 }
 throw new RangeError("Unknown recurrence");
}
export function myCustomMatchesDate(item,date){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||"")))return false;
 const d=new Date(date+"T12:00:00Z");
 if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==date)return false;
 let schedule;
 try{schedule=normalizeMyCustomSchedule(item?.schedule);}catch{return false}
 if(schedule.kind==="none")return false;
 if(schedule.kind==="annual")return date.slice(5)===schedule.mmdd;
 return buildLiturgicalYear(date).currentPeriod.id===schedule.season;
}
const clone=x=>JSON.parse(JSON.stringify(x));
function prepare(raw,canonicalIds,{id=null,now=()=>new Date().toISOString(),existing=null}={}){
 const origin=String(raw?.origin||"");
 if(existing && existing.origin!==origin)throw new TypeError("Source type cannot be changed by editing");
 if(origin!=="canonical"&&origin!=="personal")throw new TypeError("Invalid source type");
 const kind=origin==="canonical"?"custom":String(raw?.kind||"");
 if(!["custom","prayer"].includes(kind))throw new TypeError("Invalid personal entry type");
 const customId=origin==="canonical"?plain(raw.customId,32):null;
 if(origin==="canonical"&&!canonicalIds.has(customId))throw new RangeError("Custom not in published corpus");
 const title=origin==="personal"?plain(raw.title,150):"";
 if(origin==="personal"&&!title)throw new TypeError("A title is required");
 const body=origin==="personal"?plain(raw.body,8000):"";
 const note=plain(raw.note,2500);
 const schedule=normalizeMyCustomSchedule(raw.schedule);
 const createdAt=existing?.createdAt||now();
 return Object.freeze({
   id:id||existing?.id,origin,kind,customId,title,body,note,schedule,createdAt,updatedAt:now()
 });
}
function errorMessage(error){return String(error?.message||error||"STORAGE_UNAVAILABLE")}
export function createMyCustomsStore({storage,canonicalIds=[],now=()=>new Date().toISOString(),makeId}={}){
 const allowed=new Set(canonicalIds);
 let items=[],readError=null;
 if(!storage?.getItem||!storage?.setItem)readError="LOCAL_STORAGE_UNAVAILABLE";
 else try{
   const raw=storage.getItem(MY_CUSTOMS_STORAGE_KEY);
   if(raw){
     const data=JSON.parse(raw);
     if(data?.schema!==MY_CUSTOMS_SCHEMA||!Array.isArray(data.items)||data.items.length>MAX_ITEMS)throw Error("INVALID_STORED_CUSTOMS");
     const ids=new Set();
     items=data.items.map(x=>{
       if(!safeId(x?.id)||ids.has(x.id))throw Error("INVALID_STORED_CUSTOMS");
       ids.add(x.id);
       const checked=prepare(x,allowed,{id:x.id,now:()=>plain(x.updatedAt,50)});
       return Object.freeze({...checked,createdAt:plain(x.createdAt,50)});
     });
   }
 }catch(error){items=[];readError=errorMessage(error)}
 const stamp=()=>now();
 const uuid=()=>makeId?makeId():globalThis.crypto?.randomUUID?.()||
   "custom-"+String(stamp()).replace(/[^a-z0-9]/gi,"").slice(0,30)+"-"+Math.random().toString(36).slice(2,12);
 function save(next){
   if(readError)throw Error(readError);
   if(next.length>MAX_ITEMS)throw RangeError("Too many personal entries");
   storage.setItem(MY_CUSTOMS_STORAGE_KEY,JSON.stringify({schema:MY_CUSTOMS_SCHEMA,items:next}));
   items=next;
   return list();
 }
 const list=()=>clone(items);
 const add=raw=>{
   if(readError)throw Error(readError);
   const id=uuid();
   if(!safeId(id)||items.some(x=>x.id===id))throw Error("Duplicate/invalid personal entry id");
   const row=prepare(raw,allowed,{id,now:stamp});
   if(row.origin==="canonical"&&items.some(x=>x.customId===row.customId&&x.origin==="canonical"))throw Error("Already saved this custom");
   save([...items,row]);
   return clone(row);
 };
 const update=(id,raw)=>{
   const old=items.find(x=>x.id===id);
   if(!old)throw Error("Personal entry not found");
   const row=prepare(raw,allowed,{existing:old,id:old.id,now:stamp});
   if(row.origin==="canonical"&&items.some(x=>x.id!==id&&x.origin==="canonical"&&x.customId===row.customId))throw Error("Already saved this custom");
   save(items.map(x=>x.id===id?row:x));
   return clone(row);
 };
 const remove=id=>{
   if(!items.some(x=>x.id===id))return false;
   save(items.filter(x=>x.id!==id));return true;
 };
 return Object.freeze({
   schema:MY_CUSTOMS_SCHEMA,available:!readError,error:readError,
   list,add,update,remove,
   onDate:date=>clone(items.filter(x=>myCustomMatchesDate(x,date)))
 });
}
export function personalCustomsForDate(date,{storage,canonicalIds=[]}={}){
 const store=createMyCustomsStore({storage,canonicalIds});
 return store.available?store.onDate(date):[];
}
