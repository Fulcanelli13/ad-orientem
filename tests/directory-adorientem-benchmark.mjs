import assert from "node:assert/strict";
import fs from "node:fs";
const benchmark=JSON.parse(fs.readFileSync("data/directory/research/adorientem-church-public-benchmark-20261009.v1.json","utf8"));
const tally=Object.values(benchmark.country_index.counts);
assert.equal(tally.length,77,"A country disappeared from the benchmark");
assert.equal(tally.reduce((n,c)=>n+c,0),2288);
assert.equal(benchmark.reported_homepage.active_locations,2284);
assert.equal(benchmark.country_index.sum_of_listed_country_counts-benchmark.reported_homepage.active_locations,4);
assert.equal(benchmark.observed_duplicate_pairs.length,2);
const independentCountryCounts=benchmark.independent_official_source.latinmassdir_country_counts;
assert.equal(Object.keys(independentCountryCounts).length,65);
assert.equal(Object.values(independentCountryCounts).reduce((a,b)=>a+b,0),1573);
const competitorCountries=new Set(Object.keys(benchmark.country_index.counts));
const absent=Object.keys(independentCountryCounts).filter(cc=>!competitorCountries.has(cc)).sort();
assert.deepEqual(absent,["BJ","BO","EC","FK","GI","IL","MQ","MU"]);
assert.equal(new Set([...Object.keys(independentCountryCounts),...competitorCountries]).size,85);

const rows=["sspx-district-seed","sspx-france-first-party","sspx-france-second-pass","sspx-four-district-bulk","sspx-oct26-europe","sspx-oct26-americas","sspx-oct26-poland","sspx-asia-central-americas","sspx-north-america-20261008","sspx-priority-europe-pacific-20261009","sspx-mexico-completion-20261009","sspx-oct26-followup-65","sspx-global-completion-20261009","sspx-official-route-oct26-20261009"];
const byCountry={};let count=0;
for(const name of rows){
 const snapshot=JSON.parse(fs.readFileSync("data/directory/generated/v19/"+name+".v1.json","utf8"));
 for(const p of snapshot.records??[]){
  for(const v of p.pv?.length?p.pv:[p]){
   const cc=v.cc||p.cc;
   if(!cc)continue;count++;byCountry[cc]=(byCountry[cc]||0)+1;
  }
 }
}
assert.equal(count,613,"Internal SSPX census changed; reconcile benchmark before judging gaps");
assert.equal(byCountry.US,107);
const sample=Object.entries(benchmark.competitor_sspx_country_samples).map(([cc,listings])=>({
 country:cc,competitor_listings:listings,internal_source_mass_records:byCountry[cc]||0,
 raw_gap_not_venue_gap:listings-(byCountry[cc]||0)
})).sort((a,b)=>b.raw_gap_not_venue_gap-a.raw_gap_not_venue_gap);
console.log("Public comparison snapshot:",JSON.stringify({
 competitor_reported_locations:2284,
 country_index_total:2288,
 unexplained_count_discrepancy:4,
 verified_filter_results:benchmark.verified_filter.matches,
 competitor_US_sspx_listings:benchmark.competitor_sspx_country_samples.US,
 official_US_sspx_chapels:benchmark.independent_official_source.sspx_US_chapels_2026_08,
 internal_US_sspx_records:byCountry.US,
 internal_US_official_count_difference:benchmark.independent_official_source.sspx_US_chapels_2026_08-byCountry.US,
 competitor_duplicate_examples:benchmark.observed_duplicate_pairs.length,
 sspx_country_comparison:sample
}));
