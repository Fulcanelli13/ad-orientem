import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep} from 'node:path';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../',import.meta.url));
const server=createServer(async(req,res)=>{
 if(req.url==='/test-results'){res.end('ok');return}
 const file=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(root)){res.writeHead(403);res.end();return}
 try{const content=await readFile(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream');res.end(content)}catch{res.writeHead(404);res.end()}
});
await new Promise(r=>server.listen(8765,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1000,height:1000},hasTouch:true});
 page.on('pageerror',e=>console.error('Page error:',e.message));
 page.on('console',m=>{if(m.text().startsWith('LAYOUT'))console.log(m.text())});
 await page.goto('http://127.0.0.1:8765/tests/stabilization-browser.html');
 await page.locator('#run').click();
 await page.waitForFunction(()=>/COMPLETE|ERROR/.test(document.querySelector('#results').textContent),{},{timeout:120000});
 const result=await page.locator('#results').innerText();console.log(result);
 if(result.includes('COMPLETE')){
  const app=page.frames().find(f=>f.url().endsWith('/index.html'));
  const before=await app.evaluate(()=>AO_RUNTIME_V8.store.getState().live.stepIndex);
  await app.locator('[data-live-next]').tap();await app.locator('[data-live-next]').tap();
  const after=await app.evaluate(()=>AO_RUNTIME_V8.store.getState().live.stepIndex);
  console.log((after===before+1?'PASS':'FAIL')+' real touch double-tap advances only once');
  if(after!==before+1)process.exitCode=1;
 }
 await page.screenshot({path:'mobile-stabilization.png',fullPage:true});
 if(!result.includes('COMPLETE')||result.includes('FAIL'))process.exitCode=1;
}finally{await browser.close();server.close()}
