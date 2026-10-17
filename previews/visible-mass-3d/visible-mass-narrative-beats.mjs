/**
 * The Visible Mass — M2 editorial observation beats.
 * These are PHOTO-OBSERVATION PROMPTS, not doctrinal answers, fictional
 * historical speech, liturgical claims, or an independent Q&A catalogue.
 * Every beat resolves to an existing VMQ ID and one of six evidenced spots.
 * Never display these prompts as an answer to the visitor's question.
 */
export const VISIBLE_MASS_BEAT_STATUS="EDITORIAL_OBSERVATION_ONLY_NOT_PUBLICATION";
export const VISIBLE_MASS_PATH_OPENINGS=Object.freeze({
 FIRST_VISIT:"Start with the space around the altar. You may follow the suggested observations, or investigate any object that catches your eye.",
 SANCTUARY_SECRETS:"A sanctuary contains more than its most obvious furnishings. Try noticing the details that surround the high altar.",
 ALTAR_MYSTERY:"Begin with the crucifix, then decide whether to investigate the altar itself or the meaning of what it represents.",
 FOLLOW_PRIEST:"The photograph cannot show a ceremony in motion. It can help locate the places involved before you consult the original Mass sources."
});
const beats=[
 ["VMQ-0062","Look toward the steps leading up to the sanctuary."],
 ["VMQ-0056","A rail separates the sanctuary from the space in front of it."],
 ["VMQ-0001","The high altar occupies the centre of this photograph."],
 ["VMQ-0013","Look above the altar, where the crucifix is visible."],
 ["VMQ-0005","The still photograph cannot show a priest moving. The original question takes us to the meaning of reverence."],
 ["VMQ-0057","The Communion rail is clearly visible in the foreground."],
 ["VMQ-0052","Notice the elaborate structure rising behind the altar."],
 ["VMQ-0053","The decorated structure and the altar can appear to be a single composition. Are they the same object?"],
 ["VMQ-0017","Consider the group of candlesticks arranged around the altar."],
 ["VMQ-0019","The candlesticks offer a separate line of inquiry about light in worship."],
 ["VMQ-0021","A visible arrangement alone cannot tell us the rules for every form of Mass."],
 ["VMQ-0016","The crucifix also invites a question about the history of its placement."],
 ["VMQ-0006","Looking at the high altar may lead you to ask about other types of altar."],
 ["VMQ-0014","From the visible crucifix, you can follow a theological connection."],
 ["VMQ-0002","Now the investigation turns from the altar's appearance to its meaning."],
 ["VMQ-0003","For this question, we move beyond the photograph to an earlier historical context."],
 ["VMQ-0058","A physical boundary raises another question about the significance of the sanctuary."],
 ["VMQ-0065","Compare the steps leading into the sanctuary with the raised place directly before the altar."],
 ["VMQ-0063","You can investigate the steps as both a physical arrangement and a subject of meaning."],
 ["VMQ-0059","If you prefer a short detour, the rail has a history of its own."]
];
export const VISIBLE_MASS_BEATS=Object.freeze(Object.fromEntries(
 beats.map(([questionId,observation])=>[questionId,Object.freeze({
   questionId,observation,status:VISIBLE_MASS_BEAT_STATUS
 })])
));
export const VISIBLE_MASS_PRIORITY_CROSSOVERS=Object.freeze([
 ["VMQ-0001","VMQ-0002"],
 ["VMQ-0013","VMQ-0014"],
 ["VMQ-0053","VMQ-0001"],
 ["VMQ-0017","VMQ-0021"],
 ["VMQ-0063","VMQ-0056"],
 ["VMQ-0056","VMQ-0058"]
].map(([from,to])=>Object.freeze({from,to})));
const safe=(s)=>typeof s==="string"&&s.length>=28&&s.length<=220;
export function validateVisibleMassBeats(graph,pilot,researchedIds){
 const source=new Map(pilot.questions.map(q=>[q.id,q]));
 const answered=new Set(researchedIds);
 const available=new Set(graph.questionIds.filter(id=>
   source.has(id)&&answered.has(id)&&!graph.heldQuestionsOnly.includes(id)&&
   graph.visibleHotspotIds.includes(source.get(id).primary_object_id)));
 if(graph.trails.length!==4||available.size!==20)throw Error("M2 original VMQ content boundary changed");
 const seen=new Set();
 for(const t of graph.trails){
   if(!safe(VISIBLE_MASS_PATH_OPENINGS[t.id]))throw Error("Missing safe trail opening "+t.id);
   for(const id of t.suggested){
     if(!available.has(id))throw Error("No source-backed guided stop "+id);
     const beat=VISIBLE_MASS_BEATS[id];
     if(!beat||!safe(beat.observation)||beat.status!==VISIBLE_MASS_BEAT_STATUS)
       throw Error("Missing editorial observation "+id);
     seen.add(id);
   }
 }
 if(seen.size!==19)throw Error("Unexpected changed route coverage");
 for(const {from,to} of VISIBLE_MASS_PRIORITY_CROSSOVERS){
   if(!available.has(from)||!available.has(to)||!graph.crossovers.some(x=>
     x.from===from&&x.to===to&&x.status==="EDITORIAL_CONTEXTUAL_CANDIDATE_NO_PUBLICATION"))
       throw Error("Unverified editorial crossover "+from+" -> "+to);
 }
 return Object.freeze({routeCount:4,originalVMQStops:seen.size,availableVMQs:available.size,
   crossovers:VISIBLE_MASS_PRIORITY_CROSSOVERS.length,
   status:VISIBLE_MASS_BEAT_STATUS});
}
