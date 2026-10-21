import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const report=JSON.parse(readFileSync(new URL('../data/learn/ask-church-app-route-survey.v1.json',import.meta.url),'utf8'));
assert.equal(report.schema,'AO_ASK_CHURCH_APP_ROUTE_SURVEY_V1');
assert.equal(report.state,'RESEARCH_PREVIEW_ONLY_NOT_PUBLISHED');
assert.equal(report.coverage.navigationRegistryRoutes,63);
assert.equal(report.coverage.routeSurveyTotal,67);
assert.equal(report.apostolateScenarios.length,36);
assert.equal(report.apostolateSkills.length,9);
assert.equal(report.objectives.length,7);
assert.equal(report.objectives.reduce((n,o)=>n+o.paths.length,0),26);
const routes=report.routes.map(x=>x.id);
assert.equal(new Set(routes).size,routes.length,'duplicate route');
const all=new Set([...routes,...report.apostolateScenarios.map(s=>s.id)]);
const gated=new Set(report.routes.filter(x=>x.releaseGate==='RESEARCH_ONLY').map(x=>x.id));
for(const objective of report.objectives){
 assert.ok(objective.ask && objective.paths.length);
 for(const path of objective.paths){
  assert.ok(path.targets.length>=2,'each objective branch must offer choice');
  for(const target of path.targets){
    assert.ok(all.has(target),'unresolved handoff '+target);
    assert.ok(!gated.has(target),'unpublished route exposed '+target);
  }
 }
}
for(const route of report.routes){
 assert.ok(route.routeStatus && route.informationStatus && route.walkthroughStatus);
 assert.equal(route.browserVerified,false,'do not invent browser acceptance');
}
assert.deepEqual(report.coverage.publicationGatedRoutes.sort(),['learn.apologetics','learn.church_crisis']);
console.log('Ask the Church route survey: 67 sources, 36 scenarios, 9 skills, 7 objectives, 26 branches PASS');
