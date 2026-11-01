const urls=[
 "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&titles=File%3ALa-lingua-di-sant-antonio.jpg&prop=imageinfo&iiprop=size%7Cmime%7Cextmetadata",
 "https://commons.wikimedia.org/wiki/File:La-lingua-di-sant-antonio.jpg",
 "https://commons.wikimedia.org/w/rest.php/v1/file/La-lingua-di-sant-antonio.jpg",
 "https://en.wikipedia.org/w/api.php?action=query&format=json&meta=siteinfo"
];
for(const url of urls){
 try{
  const r=await fetch(url,{headers:{"User-Agent":"AdOrientemSacredAtlasResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)","Accept":"application/json,text/html;q=0.5"},signal:AbortSignal.timeout(10000)});
  const body=(await r.text()).slice(0,260).replace(/\s+/g," ");
  console.log(JSON.stringify({origin:new URL(url).host,path:new URL(url).pathname,status:r.status,type:r.headers.get("content-type"),body}));
 }catch(e){console.log(JSON.stringify({url,error:String(e).slice(0,400)}));}
}
