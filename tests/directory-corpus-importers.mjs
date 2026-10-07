import assert from "node:assert/strict";
import { countryCodeFromText } from "../tools/directory/lib/country-codes.mjs";
import { parseFsspDirectoryHtml, buildFsspDataset } from "../tools/directory/import-fssp.mjs";
import { ICKSP_LIVE_MASS_REVIEW_DAYS, parseIckspInternationalHtml, parseIckspUsDetail, buildIckspDataset } from "../tools/directory/import-icksp.mjs";
import { discoverIbpIndex, buildIbpDataset, mergeIbpIndexWitness } from "../tools/directory/import-ibp.mjs";
import { phoneCandidates } from "../tools/directory/lib/html-source-utils.mjs";

assert.equal(countryCodeFromText("75002 Paris - France"),"FR");
assert.equal(countryCodeFromText("2049 - Australia"),"AU");
assert.equal(countryCodeFromText("Mauritius"),"MU");

const fsspHtml=`
<table>
<tr><th>Image</th><th>Title</th><th>Address</th><th>Description</th><th>Link</th></tr>
<tr>
<td><img src="x.jpg"></td>
<td>Maternal Heart of Mary Parish</td>
<td>Charles O'Neill Way - Lewisham NSW 2049 - Australia</td>
<td>Diocese: Sydney<br>Masses: Sun. 7.00 a.m., 10.30 a.m. (Sung)</td>
<td><a href="/en/example-detail/">More details</a></td>
</tr>
</table>`;
const fssp=parseFsspDirectoryHtml(fsspHtml);
assert.equal(fssp.length,1);
assert.equal(fssp[0].title,"Maternal Heart of Mary Parish");
assert.equal(fssp[0].countryCode,"AU");
assert.equal(fssp[0].diocese,"Sydney");
assert.match(fssp[0].massRaw,/10\.30/);
const fsspDataset=buildFsspDataset([{...fssp[0],emails:["office@example.org"],phones:["+61 2 0000 0000"],externalLinks:[]}],{retrievedAt:"2026-10-07T09:00:00Z"});
assert.equal(fsspDataset.venues[0].address.country_code,"AU");
assert.equal(fsspDataset.ministries[0].community_id,"FSSP");
assert.equal(fsspDataset.ministries[0].liturgical_usage.books,"1962");
const duplicateFsspDataset=buildFsspDataset([
  {...fssp[0],index:10,emails:[],phones:[],externalLinks:[]},
  {...fssp[0],index:11,emails:[],phones:[],externalLinks:[]},
],{retrievedAt:"2026-10-07T09:00:00Z"});
assert.equal(duplicateFsspDataset.venues.length,1,"exact repeated FSSP rows created duplicate canonical venues");
assert.equal(duplicateFsspDataset.exactDuplicateRows.length,1);
assert.equal(duplicateFsspDataset.exactDuplicateRows[0].first_row_index,10);
assert.equal(duplicateFsspDataset.exactDuplicateRows[0].duplicate_row_index,11);
const fsspControlHtml=`
<table><tr><td>←</td><td>Move left</td><td></td></tr>
<tr><td>Home</td><td>Jump left by 75%</td><td></td></tr></table>`;
assert.equal(parseFsspDirectoryHtml(fsspControlHtml).length,0,"FSSP UI controls survived venue parsing");


const ickspUsHtml=`
<h6>St. Josaphat Oratory</h6>
<div>Sunday</div><div>9:30 am Holy Mass</div>
<div>Address:</div><div>| 34-32 210th Street</div><div>Bayside, New York 11361</div>
<div>Phone:</div><div>| 718-229-1663</div>
<div>Email:</div><div>| stjosaphat.queens@institute-christ-king.org</div>`;
const ickspUs=parseIckspUsDetail(ickspUsHtml,{label:"New York - St. Josaphat Oratory",url:"https://www.institute-christ-king.org/queens-home",countryCode:"US"});
assert.match(ickspUs.address,/34-32 210th Street/);
assert.match(ickspUs.address,/New York 11361/);
assert.deepEqual(ickspUs.phones,["718-229-1663"]);
assert.deepEqual(phoneCandidates("09/02/2026 718-229-1663"),["718-229-1663"],"date string was classified as a phone");

const ickspMerrillvilleHtml=`
<h6>St. Joseph Oratory</h6>
<div>Holy Mass</div><div>Sunday 8:00 AM High Mass</div>
<div>Address:</div>
<div>| St. Joseph Oratory</div>
<div>(at Our Lady of Częstochowa Shrine)</div>
<div>5755 Pennsylvania Street</div>
<div>Merrillville, Indiana 46410</div>
<div>Mailing Address:</div>
<div>Institute of Christ the King</div>
<div>6415 South Woodlawn Avenue</div>
<div>Chicago, IL 60637</div>
<div>Phone:</div><div>| 219-555-0000</div>`;
const ickspMerrillville=parseIckspUsDetail(ickspMerrillvilleHtml,{label:"Merrillville - St. Joseph Oratory",url:"https://www.institute-christ-king.org/merrillville-home",countryCode:"US"});
assert.match(ickspMerrillville.address,/5755 Pennsylvania Street/);
assert.match(ickspMerrillville.address,/Merrillville, Indiana 46410/);
assert.doesNotMatch(ickspMerrillville.address,/6415 South Woodlawn/);

const ickspSanJoseHtml=`
<h6>Immaculate Heart of Mary Oratory</h6>
<div>Sunday Masses</div><div>8:00 AM Low Mass</div>
<div>Address:</div>
<div>| Temporary Chapel Address</div>
<div>Immaculate Heart of Mary Oratory</div>
<div>1101 S. Winchester Boulevard</div>
<div>San José, CA 95128</div>
<div>Mailing Address:</div>
<div>Clergy Residence</div>
<div>4467 Illsley Court</div>
<div>San José, CA 95136</div>
<div>Phone:</div><div>| 408-781-9497</div>`;
const ickspSanJose=parseIckspUsDetail(ickspSanJoseHtml,{label:"San Jose - Immaculate Heart of Mary Oratory",url:"https://institute-christ-king.org/sanjose-home",countryCode:"US"});
assert.match(ickspSanJose.address,/1101 S\. Winchester Boulevard/);
assert.match(ickspSanJose.address,/San José, CA 95128/);
assert.doesNotMatch(ickspSanJose.address,/4467 Illsley/);

const ickspIntl=`
<h2>Rome, Italy</h2>
<h4>Basilica dei Santi Celso e Giuliano</h4>
<p>Via del Banco di Santo Spirito, 5</p>
<p>Sundays &amp; Feast Days</p>
<p>Holy Mass: 8:30 am, 10 am, 12:30 pm, 6 pm</p>
<h2>Sieci, Italy</h2>
<h4>International Seminary of Saint Philip Neri</h4>
<p>Via di Gricigliano, 52<br>I-50065 Sieci (FI)</p>
<p>Sundays</p><p>10:45 am Solemn High Mass</p>
<h2>Links to Web Sites</h2>
<a href="https://example.mu/">Mauritius</a>`;
const icksp=parseIckspInternationalHtml(ickspIntl);
assert.equal(icksp.length,2);
assert.equal(icksp[0].countryCode,"IT");
assert.match(icksp[0].title,/Celso/);
assert.match(icksp[0].massRaw,/Holy Mass/);
assert.match(icksp[0].address,/Rome/,"international ICKSP address lost section locality");
const ickspDataset=buildIckspDataset(icksp,{retrievedAt:"2026-10-07T09:00:00Z"});
assert.equal(ickspDataset.ministries.every(x=>x.community_id==="ICKSP"),true);
assert.equal(ICKSP_LIVE_MASS_REVIEW_DAYS,120,"ICKSP live review horizon drifted");
assert.ok(ickspDataset.schedules.every(x=>x.verification.freshness_policy==="CURRENT_MASS_120D"));
assert.ok(ickspDataset.schedules.every(x=>x.verification.review_due_at==="2027-02-04T09:00:00.000Z"));

const ibpIndex=`
<h4>France</h4>
<h5>Archidiocèse de Paris :</h5>
<ul><li><a href="/nos-apostolats/lieux-dapostolat-dans-le-monde/paris/">Paris – Centre culturel chrétien Saint-Paul</a></li></ul>
<h4>Australie</h4>
<h5>Archidiocèse de Sydney :</h5>
<ul><li><a href="/nos-apostolats/lieux-dapostolat-dans-le-monde/sydney/">Sydney</a></li></ul>`;
const ibp=discoverIbpIndex(ibpIndex);
assert.equal(ibp.length,2);
assert.equal(ibp[0].countryCode,"FR");
assert.equal(ibp[1].countryCode,"AU");
assert.match(ibp[0].diocese,/Paris/);
const witnessMerge=mergeIbpIndexWitness(ibp,{
  entries:[
    {country_code:"FR",diocese:"Archidiocèse de Paris",city:"Paris",label:"Paris – Centre culturel chrétien Saint-Paul"},
    {country_code:"FR",diocese:"Diocèse de Chartres",city:"Manou",label:"Manou"}
  ]
});
assert.equal(witnessMerge.length,3);
assert.equal(witnessMerge[0].city,"Paris");
assert.equal(witnessMerge[1].city,"Manou");
assert.equal(witnessMerge[1].witnessOnly,true);
assert.equal(witnessMerge[2].sourceDiscoveryExtra,true);
const ibpDataset=buildIbpDataset([{
  title:"Paris – Centre Saint-Paul",address:"12 rue Saint Joseph, 75002 Paris",countryCode:"FR",
  diocese:"Archidiocèse de Paris",detailUrl:"https://www.institutdubonpasteur.org/example",
  emails:[],phones:[],massRaw:"Messes : 9h, 10h, 11h15"
}],{retrievedAt:"2026-10-07T09:00:00Z"});
assert.equal(ibpDataset.ministries[0].community_id,"IBP");
assert.equal(ibpDataset.ministries[0].liturgical_usage.books,"1962");

console.log("directory worldwide source importers: PASS");
