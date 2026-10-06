import assert from "node:assert/strict";
import { DIVINUM_OFFICIUM_PIN, rewriteResolvedSourceUrl } from "../src/app/source-transport-compat.js";

const missalemeumBase="https://raw.githubusercontent.com/mmolenda/missalemeum/f43359b7a79a5a299158651eedf75cdaf0e43c94/backend/resources/divinum-officium-local/web/www/missa/Francais/";
assert.equal(
  rewriteResolvedSourceUrl(missalemeumBase+"Tempora/Pent19-0.txt"),
  `https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/${DIVINUM_OFFICIUM_PIN}/web/www/missa/Francais/Tempora/Pent19-0.txt`,
  "broken Missalemeum French temporal source did not redirect to pinned Divinum Officium"
);
assert.equal(
  rewriteResolvedSourceUrl(missalemeumBase+"Commune/C3a.txt"),
  `https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/${DIVINUM_OFFICIUM_PIN}/web/www/horas/Francais/Commune/C3a.txt`,
  "French Common did not redirect to the canonical horas tree"
);
assert.equal(
  rewriteResolvedSourceUrl(missalemeumBase+"Commune/Coronatio.txt"),
  `https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/${DIVINUM_OFFICIUM_PIN}/web/www/missa/Francais/Commune/Coronatio.txt`,
  "Mass-only French Coronatio Common was incorrectly redirected to horas"
);

const doBase=`https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/${DIVINUM_OFFICIUM_PIN}/`;
assert.equal(
  rewriteResolvedSourceUrl(doBase+"web/www/missa/Latin/Commune/C5.txt"),
  doBase+"web/www/horas/Latin/Commune/C5.txt"
);
assert.equal(
  rewriteResolvedSourceUrl(doBase+"web/www/missa/English/Commune/C7a.txt"),
  doBase+"web/www/horas/English/Commune/C7a.txt"
);
assert.equal(
  rewriteResolvedSourceUrl(doBase+"web/www/missa/English/Commune/Coronatio.txt"),
  doBase+"web/www/missa/English/Commune/Coronatio.txt",
  "Mass-only English Coronatio Common was incorrectly redirected to horas"
);
assert.equal(
  rewriteResolvedSourceUrl(doBase+"web/www/missa/Francais/Commune/Coronatio.txt"),
  doBase+"web/www/missa/Francais/Commune/Coronatio.txt",
  "Mass-only French Coronatio Common was incorrectly redirected to horas"
);
assert.equal(
  rewriteResolvedSourceUrl(doBase+"web/www/missa/English/Commune/Propaganda.txt"),
  doBase+"web/www/missa/English/Commune/Propaganda.txt",
  "Mass-only English Propaganda Common was incorrectly redirected to horas"
);
assert.equal(
  rewriteResolvedSourceUrl(doBase+"obsolete/missa/French/Commune/C4b.txt"),
  doBase+"web/www/horas/Francais/Commune/C4b.txt"
);

const ordinary=doBase+"web/www/missa/Latin/Sancti/10-07.txt";
assert.equal(rewriteResolvedSourceUrl(ordinary),ordinary,"ordinary Proper URL was rewritten unexpectedly");

console.log("PASS source transport compatibility: French roots and Mass Commons follow pinned missa/horas topology without known 404 rewrites.");
