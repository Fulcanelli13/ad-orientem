const NAMED_ENTITIES=Object.freeze({
  amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ",eacute:"é",egrave:"è",ecirc:"ê",agrave:"à",ccedil:"ç",
  rsquo:"’",lsquo:"‘",ldquo:"“",rdquo:"”",ndash:"–",mdash:"—",hellip:"…"
});

export function decodeHtml(value){
  return String(value??"")
    .replace(/&#x([0-9a-f]+);/gi,(_,hex)=>String.fromCodePoint(parseInt(hex,16)))
    .replace(/&#(\d+);/g,(_,num)=>String.fromCodePoint(Number(num)))
    .replace(/&([a-z][a-z0-9]+);/gi,(full,name)=>NAMED_ENTITIES[name.toLowerCase()]??full);
}

export function collapseWhitespace(value){
  return String(value??"").replace(/\r/g,"").replace(/[ \t]+/g," ").replace(/\n[ \t]+/g,"\n").replace(/\n{3,}/g,"\n\n").trim();
}

export function stripTags(html,{newlines=true}={}){
  let value=String(html??"")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ");
  if(newlines){
    value=value
      .replace(/<br\s*\/?\s*>/gi,"\n")
      .replace(/<\/(?:p|div|li|tr|td|th|h[1-6]|section|article)>/gi,"\n");
  }
  value=value.replace(/<[^>]+>/g," ");
  return collapseWhitespace(decodeHtml(value));
}

export function attrValue(attrs,name){
  const source=String(attrs??"");
  const re=new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,"i");
  const match=source.match(re);
  return decodeHtml(match?.[1]??match?.[2]??match?.[3]??"")||null;
}

export function absoluteUrl(href,baseUrl){
  if(!href)return null;
  try{return new URL(href,baseUrl).href;}catch{return null;}
}

export function extractAnchors(html,baseUrl){
  const out=[];
  const re=/<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  while((match=re.exec(String(html??"")))){
    const href=attrValue(match[1],"href");
    const text=stripTags(match[2]);
    const url=absoluteUrl(href,baseUrl);
    if(url)out.push(Object.freeze({href,url,text,html:match[0]}));
  }
  return out;
}

export function extractTagBlocks(html,tag){
  const out=[];
  const re=new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`,"gi");
  let match;
  while((match=re.exec(String(html??""))))out.push(Object.freeze({attrs:match[1],html:match[2],text:stripTags(match[2])}));
  return out;
}

export function extractTableRows(html){
  return extractTagBlocks(html,"tr").map(row=>({
    ...row,
    cells:[...row.html.matchAll(/<t[dh]\b([^>]*)>([\s\S]*?)<\/t[dh]>/gi)].map(match=>({
      attrs:match[1],html:match[2],text:stripTags(match[2])
    }))
  }));
}

export async function fetchText(url,{fetchImpl=fetch}={}){
  const response=await fetchImpl(url,{headers:{accept:"text/html,application/xhtml+xml","user-agent":"Ad-Orientem-Directory-Importer/1.0"}});
  if(!response.ok)throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

export function emailAddresses(text){
  return [...new Set(String(text??"").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)??[])];
}

export function phoneCandidates(text){
  return [...new Set((String(text??"").match(/(?:\+?\d[\d .()\/-]{6,}\d)/g)??[]).map(x=>x.trim()))];
}

export function textLines(html){
  return stripTags(html).split("\n").map(x=>x.trim()).filter(Boolean);
}
