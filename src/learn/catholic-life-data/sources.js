import S1 from "./sources-1.js";
import S2 from "./sources-2.js";
import S3 from "./sources-3.js";

export const CATHOLIC_LIFE_SOURCES=Object.freeze([...S1,...S2,...S3]);
export const CATHOLIC_LIFE_SOURCE_MAP=Object.freeze(Object.fromEntries(CATHOLIC_LIFE_SOURCES.map(source=>[source.source_id,source])));
export default CATHOLIC_LIFE_SOURCES;
