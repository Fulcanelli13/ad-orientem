import assert from "node:assert/strict";
import {parseCountryPage} from "../tools/directory/discover-approved-mass-worldwide.mjs";
import {recoverWorldSourceGaps} from "../tools/directory/recover-approved-world-source-gaps.mjs";
const url="https://www.latinmassdir.org/country/ie/?view=list";
const html='<h1>Ireland</h1><h2>Results: 2 venues within a radius of</h2>'+
 '<a href="https://www.latinmassdir.org/venue/eaglais-na-giniuna-%E1%B9%81uire-gan-smal-church-of-the-immaculate-conception-tralee-ireland/">Tralee</a>'+
 '<a href="https://www.latinmassdir.org/venue/eaglais-na-cro%C3%AD-ro-naofa-sacred-heart-church-limerick-ireland/">Limerick</a>';
const data=parseCountryPage(html,{countryCode:"IE",pageUrl:url});
assert.equal(data.venues.length,2,"Encoded Gaelic venue URLs were dropped");
assert.equal(data.reportedTotal,2);
const existing={summary:{requests:1,errors:0,full_countries:0,unique_discovered:1},country_coverage:[
 {country_code:"IE",listed_total:2,discovered_unique:1,pages_fetched:1,complete:false}],
 records:[data.venues[1]]};
const index={independent_official_source:{latinmassdir_country_counts:{IE:2}}};
const fetched=async()=>({ok:true,text:async()=>html});
const result=await recoverWorldSourceGaps({existing,index,fetchImpl:fetched,delayMs:1000});
assert.equal(result.newRecords.length,1);
assert.equal(result.records.length,2);
assert.equal(result.summary.unresolved_after_recovery,0);
assert.equal(result.summary.full_countries,1);
assert.equal(new Set(result.records.map(r=>r.source_id)).size,2);
assert.ok(result.records.every(r=>r.publication_state==="RESEARCH_ONLY"));
console.log("Encoded worldwide country-venue recovery: PASS — percent-slugs retained, no duplicates, no publication");
