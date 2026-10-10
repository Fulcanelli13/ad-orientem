import assert from "node:assert/strict";
import {parseSspxCountryIndex,parseSspxCountryPage} from "../tools/directory/acquire-sspx-html.mjs";

const countries=parseSspxCountryIndex([
  {href:"https://map.fsspx.org/en/countries/za",text:"South Africa 7"},
  {href:"https://map.fsspx.org/en/countries/ie/",text:"Ireland 5"},
  {href:"https://map.fsspx.org/en/countries/ie/ireland",text:"Ireland region"},
  {href:"https://map.fsspx.org/en/countries/za",text:"Duplicate South Africa"},
  {href:"https://other.example/en/countries/fr",text:"Not official"},
  {href:"https://map.fsspx.org/en/places/test",text:"Not a country"},
]);
assert.deepEqual(countries.map(x=>x.country_code),["IE","ZA"]);
const page=parseSspxCountryPage({
  countryCode:"ZA",headline:"South Africa 2 places",
  pageUrl:"https://map.fsspx.org/en/countries/za",
  anchors:[
    {href:"https://map.fsspx.org/en/places/our-lady-of-the-holy-rosary-priory",text:"Our Lady of the Holy Rosary Priory"},
    {href:"/en/places/st-paul-s-mission",text:"St Paul's Mission"},
    {href:"/en/places/st-paul-s-mission",text:"repeat navigation"},
    {href:"https://other.example/en/places/fake",text:"Not from official source"},
    {href:"/en/countries/za",text:"Not a place"},
  ],
});
assert.equal(page.expected_source_entities,2);
assert.equal(page.recovered_source_entities,2);
assert.equal(page.coverage_complete,true);
assert.equal(page.records[0].source_slug,"our-lady-of-the-holy-rosary-priory");
assert.equal(page.records[0].acquisition_class,"OFFICIAL_HTML_DISCOVERY_ONLY");
const incomplete=parseSspxCountryPage({...page,headline:"South Africa 3 places",
  anchors:[{href:"/en/places/st-paul-s-mission",text:"Mission"}]});
assert.equal(incomplete.coverage_complete,false);
assert.equal(incomplete.recovered_source_entities,1);
assert.throws(()=>parseSspxCountryPage({...page,headline:"South Africa",anchors:[]}),
  /missing official country count/);
console.log("SSPX official HTML country discovery: PASS");
