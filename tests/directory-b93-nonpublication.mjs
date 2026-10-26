import assert from 'node:assert/strict';
import {auditVenue} from '../src/find/contracts.js';
import {publishableDirectoryRecords} from '../src/find/data-service.js';

// B93 deliberately emits a preview object, not a Directory venue with a
// venue_id or geocoding assertion. Publication must reject it even though
// its research address is usable.
const preview = {
  name: {official: 'Capela do Oratório São José', alternate: []},
  address: {
    line1: 'Rua Aiuruoca 148, Belo Horizonte, MG, Brasil',
    city: 'Belo Horizonte', country_code: 'BR',
    formatted: 'Rua Aiuruoca 148, Belo Horizonte, MG, Brasil',
  },
  upstream: {
    provider: 'AO_B91_RESEARCH_ONLY',
    upstream_id: 'AASJMV-EXT-001',
    historical_group_id: 'RG-B88-B1EB74BB63BD',
  },
  publication_state: 'RESEARCH_ONLY_NOT_PUBLIC',
};
assert(auditVenue(preview).some(issue=>issue.code==='MISSING_VENUE_ID'));
assert.deepEqual(publishableDirectoryRecords([{venue:preview,ministries:[],sources:[]}]),[]);
console.log('B93 preview cannot pass Find public venue contract');
