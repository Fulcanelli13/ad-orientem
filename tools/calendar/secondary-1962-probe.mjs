import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({serviceWorkers:"block"});
 for(const year of [2024,2027]){
   const url="https://gcatholic.org/calendar/"+year+"/Extraordinary-en";
   try{
     const response=await page.goto(url,{waitUntil:"domcontentloaded",timeout:45000});
     const details=await page.evaluate(()=>{
       const trim=s=>String(s||"").replace(/\s+/g," ").trim();
       return {
         title:document.title,
         pageChars:document.body.innerText.length,
         tables:[...document.querySelectorAll("table")].map(t=>({
           class:t.className,id:t.id,
           rowCount:t.querySelectorAll("tr").length,
           firstRows:[...t.querySelectorAll("tr")].slice(0,5).map(r=>({html:r.outerHTML.slice(0,1300),text:trim(r.innerText).slice(0,400)}))
         })).slice(0,3),
         months:[...document.querySelectorAll("h1,h2,h3,caption")].filter(x=>/January|February/i.test(trim(x.textContent))).slice(0,8).map(x=>({tag:x.tagName,html:x.outerHTML.slice(0,850)})),
         scriptTotal:document.scripts.length,
         dates:[...document.querySelectorAll("[data-date],time,[itemprop='startDate']")].slice(0,6).map(x=>x.outerHTML.slice(0,300)),
         firstText:trim(document.body.innerText).slice(0,900)
       };
     });
     console.log("GCATHOLIC_PROBE "+JSON.stringify({year,status:response.status(),details}).slice(0,11700));
     const responseICS=await page.request.get("https://gcatholic.org/calendar/ics/"+year+"-en-Extraordinary.ics?v=3",{timeout:30000});
     const icsBody=await responseICS.text();
     console.log("GCATHOLIC_ICS "+JSON.stringify({year,status:responseICS.status(),contentType:responseICS.headers()["content-type"],bytes:icsBody.length,first:icsBody.slice(0,1000),eventCount:(icsBody.match(/BEGIN:VEVENT/g)||[]).length}));
   }catch(e){console.log("GCATHOLIC_ERROR "+JSON.stringify({year,error:String(e?.message||e)}));process.exitCode=1;}
 }
}finally{await browser.close();}
