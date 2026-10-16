import assert from "node:assert/strict";
import { canonicalSettingsReleaseStatus, buildSettingsViewModel, renderSettingsToString } from "../src/settings/presentation.js";

const win={
  location:{hostname:"fulcanelli13.github.io",pathname:"/ad-orientem/index.html"},
  document:{documentElement:{dataset:{aoRelease:"43.59.6"}}},
  navigator:{serviceWorker:{controller:{scriptURL:"https://fulcanelli13.github.io/ad-orientem/sw.js"}}},
  matchMedia:()=>({matches:true}),
  AO_OFFLINE_APP_V1:{status:{ready:true,version:"cached-a1",pendingVersion:"staged-b2",error:null}}
};
const status=canonicalSettingsReleaseStatus(win);
assert.equal(status.channel,"canonical");
assert.equal(status.standalone,true);
assert.equal(status.activeSnapshot,"cached-a1");
assert.equal(status.stagedSnapshot,"staged-b2");
assert.equal(status.workerControlled,true);
assert.equal(buildSettingsViewModel(win).version,"43.59.6");
const markup=renderSettingsToString(win,{route:"/settings/about-sources"});
assert.match(markup,/data-settings-active-snapshot/);
assert.match(markup,/cached-a1/);
assert.match(markup,/staged-b2/);
assert.match(markup,/No update is applied here/);
assert.match(markup,/data-settings-app-version/);

const browser={
 location:{hostname:"fulcanelli13.github.io",pathname:"/ad-orientem/"},
 AO_OFFLINE_APP_V1:{status:{ready:false,error:"failure"}}
};
const unknown=canonicalSettingsReleaseStatus(browser);
assert.equal(unknown.channel,"canonical");
assert.equal(unknown.activeSnapshot,null);
assert.equal(unknown.stagedSnapshot,null);
assert.equal(unknown.workerControlled,false);
assert.equal(unknown.offlineError,true);
const absent=renderSettingsToString(browser,{route:"/settings/about-sources"});
assert.match(absent,/Not available/);
assert.match(absent,/No pending update reported/);
assert.match(absent,/does not prove/);
const preview=canonicalSettingsReleaseStatus({...win,location:{hostname:"ad-orientem.vercel.app",pathname:"/"}});
assert.equal(preview.channel,"other","Preview must not masquerade as canonical Pages");
const leaked=canonicalSettingsReleaseStatus({...win,AO_OFFLINE_APP_V1:{status:{version:"token\nmalicious",pendingVersion:"../../external"}}});
assert.equal(leaked.activeSnapshot,null);
assert.equal(leaked.stagedSnapshot,null);
assert.ok(!JSON.stringify(status).includes("scriptURL"),"Diagnostics must not expose full worker URLs");
console.log("Settings canonical PWA release display contract: OK");
