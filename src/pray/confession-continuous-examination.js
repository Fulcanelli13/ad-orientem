/** A continuous, non-interactive view of existing private examination prompts.
 * Accepts only the source-owned cards and never creates answer fields, storage,
 * a sin tally, a new examination edition, or any sacramental simulation.
 */
export const CONFESSION_CONTINUOUS_SCHEMA="ao-confession-continuous-v1";
export function renderConfessionContinuousExamination(cards,{french=false,esc}={}){
 if(typeof esc!=="function")throw new TypeError("HTML escape function required");
 if(!Array.isArray(cards)||!cards.length)throw new RangeError("Source-owned examination cards required");
 return '<div class="aoConfessionContinuous" data-ao-confession-continuous="true" data-ao-confession-card-count="'+cards.length+'">'+
  cards.map((card,i)=>{
   const title=card.kind==="questions"?card.title:french?card.fr:card.en;
   const body=card.kind==="questions"?
    '<ul class="aoConfessionContinuousQuestions">'+(card.questions||[]).map(q=>'<li>'+esc(q)+'</li>').join("")+'</ul>':
    '<p>'+esc(french?card.bodyFr:card.bodyEn)+'</p>';
   return '<section class="aoConfessionContinuousSection" data-ao-confession-source-card="'+esc(card.id)+'">'+
     '<h2>'+esc(title)+'</h2>'+body+'</section>';
  }).join("")+'</div>';
}
