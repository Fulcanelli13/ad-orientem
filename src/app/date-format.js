export const DISPLAY_DATE_FORMAT="DD/MM/YYYY";
const ISO_RE=/^(\d{4})-(\d{2})-(\d{2})$/;
const DMY_RE=/^(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{4})$/;
const pad=n=>String(n).padStart(2,"0");

function validParts(y,m,d){
  const x=new Date(Number(y),Number(m)-1,Number(d),12);
  return x.getFullYear()===Number(y)&&x.getMonth()===Number(m)-1&&x.getDate()===Number(d);
}

export function formatDisplayDate(value){
  if(value instanceof Date&&!Number.isNaN(value.getTime())){
    return `${pad(value.getDate())}/${pad(value.getMonth()+1)}/${value.getFullYear()}`;
  }
  const raw=String(value??"").trim();
  const iso=raw.match(ISO_RE);
  if(iso&&validParts(iso[1],iso[2],iso[3]))return `${iso[3]}/${iso[2]}/${iso[1]}`;
  const dmy=raw.match(DMY_RE);
  if(dmy&&validParts(dmy[3],dmy[2],dmy[1]))return `${pad(dmy[1])}/${pad(dmy[2])}/${dmy[3]}`;
  return raw;
}

export function parseDisplayDate(value){
  const raw=String(value??"").trim();
  const dmy=raw.match(DMY_RE);
  if(!dmy||!validParts(dmy[3],dmy[2],dmy[1]))return null;
  return `${dmy[3]}-${pad(dmy[2])}-${pad(dmy[1])}`;
}

export function installDateFormat(win=globalThis){
  if(!win)return null;
  win.AO_DISPLAY_DATE=formatDisplayDate;
  win.AO_PARSE_DISPLAY_DATE=parseDisplayDate;
  win.AO_DATE_FORMAT=Object.freeze({version:"ao-date-format-v1",display:DISPLAY_DATE_FORMAT,format:formatDisplayDate,parse:parseDisplayDate});
  return win.AO_DATE_FORMAT;
}
