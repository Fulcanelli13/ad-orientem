import assert from "node:assert/strict";
import {parseCountryPage,parseVenuePage,countryIndexFromHtml,discoverApprovedDirectory} from "../tools/directory/discover-approved-mass-worldwide.mjs";
const index='<table><tr><th>Country</th><th>Total venues</th></tr><tr><td><a href="/country/us/">United States</a></td><td>450</td><td>326</td></tr><tr><td><a href="/country/fr/">France</a></td><td>230</td></tr></table>';
assert.deepEqual(countryIndexFromHtml(index).map(x=>[x.country_code,x.expected]),[["US",450],["FR",230]]);
const list=(from,to,total,names)=>'<h1>Traditional Latin Mass venues</h1>'+names.map(name=>'<h3><a href="/venue/'+name+'/">'+name+'</a></h3>').join("")+
 '<div>Showing '+from+'-'+to+' of '+total+'</div>';
const first=parseCountryPage(list(1,2,3,["alpha","beta"]),{countryCode:"US",pageUrl:"https://www.latinmassdir.org/country/us/?view=list"});
assert.equal(first.venues.length,2);assert.equal(first.pagination.total,3);
assert.equal(first.venues[0].publication_state,"RESEARCH_ONLY");
const detail='<h1>Annunciation Church, Houston, United States</h1><h2>Services</h2><table>'+
 '<tr><th>Day</th><th>Time</th><th>Service</th></tr>'+
 '<tr><td>Every Sunday</td><td>11:00</td><td>Solemn Mass</td></tr>'+
 '<tr><td>Every Sunday</td><td>17:00</td><td>Vespers</td></tr>'+
 '</table><h2>Details</h2><div>Community</div><div>Diocesan parish</div>'+
 '<a href="https://www.annunciationcc.org/mass-times">Official parish</a>'+
 '<a href="https://www.google.com/maps/place/xx">Map</a>'+
 '<div>Last modified 2 months ago</div>';
const parsed=parseVenuePage(detail,{directoryUrl:"https://www.latinmassdir.org/venue/annunciation-church-houston-united-states/"});
assert.equal(parsed.has_mass_evidence,true);
assert.equal(parsed.mass_service_evidence.length,1);
assert.equal(parsed.original_sources.length,1);
assert.equal(parsed.original_sources[0],"https://www.annunciationcc.org/mass-times");
assert.equal(parsed.verification_state,"THIRD_PARTY_UNCONFIRMED");
const notMass=parseVenuePage('<h1>Test</h1><table><tr><td>Sunday</td><td>18:00</td><td>Vespers</td></tr></table>',{directoryUrl:"https://www.latinmassdir.org/venue/abbey/"});
assert.equal(notMass.has_mass_evidence,false,"Vespers not a confirmed Mass");

const log=[];
const fake=async url=>{
 log.push(url);
 const m=url.match(/\/country\/(\w{2})\/(?:page\/(\d+)\/)?/);
 const page=Number(m?.[2]||1);
 const html=page===1?list(1,2,3,["alpha","beta"]):list(3,3,3,["gamma"]);
 return {ok:true,text:async()=>html};
};
const gathered=await discoverApprovedDirectory({countries:["US"],maxPages:2,maxDetails:0,delayMs:1000,fetchImpl:fake});
assert.equal(log.length,2);
assert.equal(gathered.summary.unique_discovered,3);
assert.equal(gathered.country_coverage[0].complete,true);
assert.ok(gathered.records.every(r=>r.publication_state==="RESEARCH_ONLY"));
console.log("Approved Mass worldwide discovery: PASS — paginated sources, original links, Vespers exclusion and stage-only publication");
