// Download-only RFC 5545 serializer for verified general Roman 1962
// Calendar days. No network fetch, second ordo, Mass times or recurrence.
import { calendarMassColour } from "./colour-projection.js";

const validDay=/^\d{4}-\d{2}-\d{2}$/;
const encoder=new TextEncoder();
const utf8Length=s=>encoder.encode(s).length;
const asciiDate=id=>id.replaceAll("-","");
function isoNextDay(iso){
  if(!validDay.test(iso))throw new TypeError("Valid ISO civil date required");
  const [year,month,day]=iso.split("-").map(Number);
  const parsed=new Date(Date.UTC(year,month-1,day));
  if(parsed.toISOString().slice(0,10)!==iso)throw new RangeError("Invalid civil date: "+iso);
  return new Date(Date.UTC(year,month-1,day+1)).toISOString().slice(0,10);
}
function escapeText(input){
  return String(input??"").replace(/\\/g,"\\\\").replace(/\r\n?|\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,");
}
// Fold on whole Unicode code points, never in the middle of a UTF-8 byte
// sequence, leaving space for the single-space continuation prefix.
function foldLine(line){
  let out="",part="",size=0;
  for(const cp of String(line)){
    const bytes=utf8Length(cp);
    if(size+bytes>75){
      out+=part+"\r\n";
      part=" ";size=1;
    }
    part+=cp;size+=bytes;
  }
  return out+part;
}
const translateColour=(raw,language)=>{
  const c=String(raw||"").trim().toLowerCase();
  const dict={
    white:["White","Blanc"],green:["Green","Vert"],red:["Red","Rouge"],
    violet:["Violet","Violet"],purple:["Violet","Violet"],rose:["Rose","Rose"],
    black:["Black","Noir"],gold:["Gold","Or"],
  };
  return (dict[c]||[raw,raw])[language==="fr"?1:0];
};
function commemorationNames(resolved,language){
  const source=resolved.day?.commemorations||[];
  return source.map(item=>{
    if(typeof item==="string")return item;
    return language==="fr"
      ?(item.titleFr||item.nameFr||item.title||item.name||"")
      :(item.title||item.name||"");
  }).filter(Boolean).map(String);
}
function strictlyResolvedDay(row){
  const id=row?.date;
  if(!validDay.test(String(id??""))||isoNextDay(id).length!==10 ||
    row.status!=="ready"||!row.day?.main||row.proper?.status!=="ready"||!row.proper.data)
    throw new Error("Unverified or unavailable 1962 observance: "+String(id||"unknown"));
  const proper=row.proper.data;
  if(!String(proper.name||row.day.main.title||"").trim()||!String(proper.rank||row.day.main.rank||"").trim()||!calendarMassColour(row).trim())
    throw new Error("Missing canonical title, class or colour: "+id);
  return row;
}
function escapeLine(name,value){return name+":"+escapeText(value);}
export function serialize1962CalendarMonth(monthId,rows,{language="en",now=new Date()}={}){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(monthId||"")))throw new TypeError("Valid YYYY-MM required");
  if(!["en","fr"].includes(language))throw new TypeError("Unsupported export language");
  const [year,month]=monthId.split("-").map(Number);
  const last=new Date(Date.UTC(year,month,0)).getUTCDate();
  if(!Array.isArray(rows)||rows.length!==last)throw new Error("1962 month export requires every civil day, no omissions");
  const byDate=new Map(rows.map(r=>[r?.date,r]));
  if(byDate.size!==last)throw new Error("Duplicate calendar dates");
  const timestamp=now instanceof Date?now:new Date(now);
  if(!Number.isFinite(timestamp.valueOf()))throw new TypeError("Invalid UTC generation instant");
  const stamp=timestamp.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  const lines=[
    "BEGIN:VCALENDAR","VERSION:2.0",
    "PRODID:-//Ad Orientem//General Roman Calendar 1962//EN",
    "CALSCALE:GREGORIAN","METHOD:PUBLISH",
    escapeLine("X-WR-CALNAME",language==="fr"?"Calendrier romain 1962 — "+monthId:"1962 Roman Calendar — "+monthId),
    "X-AO-CALENDAR-SCOPE:GENERAL-ROMAN-1962"
  ];
  for(let d=1;d<=last;d++){
    const id=monthId+"-"+String(d).padStart(2,"0");
    const r=strictlyResolvedDay(byDate.get(id));
    const proper=r.proper.data;
    const title=String(language==="fr"
      ?(proper.nameFr||r.day.main.titleFr||proper.name||r.day.main.title)
      :(proper.name||r.day.main.title)).trim();
    const rank=String(proper.rank||r.day.main.rank).trim();
    const colour=translateColour(calendarMassColour(r),language);
    const comms=commemorationNames(r,language);
    const parts=[
      language==="fr"?"Calendrier romain général de 1962":"General Roman Calendar of 1962",
      (language==="fr"?"Classe : ":"Class: ")+rank,
      (language==="fr"?"Couleur de la liturgie : ":"Liturgical colour: ")+colour,
    ];
    if(comms.length)parts.push((language==="fr"?"Commémorations : ":"Commemorations: ")+comms.join("; "));
    if(proper.sourcePath)parts.push((language==="fr"?"Propre-source : ":"Proper source: ")+proper.sourcePath);
    parts.push(language==="fr"
      ?"Célébration liturgique, pas un horaire de messe. Les propres locaux doivent être vérifiés."
      :"Liturgical observance, not a Mass schedule. Local propers must be checked.");
    lines.push(
      "BEGIN:VEVENT",
      "UID:ao-1962-general-"+asciiDate(id)+"@calendar.invalid",
      "DTSTAMP:"+stamp,
      "DTSTART;VALUE=DATE:"+asciiDate(id),
      "DTEND;VALUE=DATE:"+asciiDate(isoNextDay(id)),
      escapeLine("SUMMARY",title),
      escapeLine("DESCRIPTION",parts.join("\n")),
      "TRANSP:TRANSPARENT",
      "END:VEVENT"
    );
  }
  return lines.map(foldLine).join("\r\n")+"\r\n";
}
export const calendarMonthIcsFilename=monthId=>"ad-orientem-1962-"+monthId+".ics";
