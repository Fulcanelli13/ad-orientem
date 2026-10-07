import { CSE_DEBATES_001_031 } from "./debates-001-031.js";
import { CSE_DEBATES_035_064 } from "./debates-035-064.js";
import { CSE_DEBATES_070_104 } from "./debates-070-104.js";
import { CSE_DEBATES_PRACTICAL } from "./debates-practical.js";
import { CSE_DEBATES_POPULAR } from "./debates-popular.js";

const merged={
  ...CSE_DEBATES_001_031,
  ...CSE_DEBATES_035_064,
  ...CSE_DEBATES_070_104,
  ...CSE_DEBATES_PRACTICAL,
  ...CSE_DEBATES_POPULAR,
};

export const CSE_DEBATE_FIELDS=Object.freeze([
  "opposition",
  "appeal",
  "concession",
  "breakpoint",
  "catholicCase",
  "counter",
  "response",
  "bottom",
]);

export const CSE_DEBATE_MAP=Object.freeze(Object.fromEntries(
  Object.entries(merged).map(([id,record])=>[
    id,
    Object.freeze(Object.fromEntries(CSE_DEBATE_FIELDS.map(field=>[
      field,
      Object.freeze([...(record[field]||[])])
    ])))
  ])
));

export const CSE_DEBATE_IDS=Object.freeze(Object.keys(CSE_DEBATE_MAP).sort());

export const CSE_DEBATE_VALIDATION=Object.freeze({
  count:CSE_DEBATE_IDS.length,
  expected:55,
  complete:CSE_DEBATE_IDS.every(id=>{
    const record=CSE_DEBATE_MAP[id];
    return CSE_DEBATE_FIELDS.every(field=>record?.[field]?.[0]&&record?.[field]?.[1]);
  }),
});
