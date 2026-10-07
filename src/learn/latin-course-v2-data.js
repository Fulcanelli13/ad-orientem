export function latinVocabularyRows(lesson,language="en"){
  const introduced=Array.isArray(lesson?.coreVocabulary?.introduced)?lesson.coreVocabulary.introduced:[];
  return introduced.map(row=>Object.freeze({
    lemma:row.lemma||"",
    partOfSpeech:row.partOfSpeech||"",
    gloss:row?.gloss?.[language]||row?.gloss?.en||"",
  }));
}

export function latinPassageGlosses(lesson,passage,language="en"){
  const wanted=new Set(passage?.supportLemmas||[]);
  const lexicon=Array.isArray(lesson?.passiveReadingLexicon)?lesson.passiveReadingLexicon:[];
  return lexicon.filter(row=>wanted.has(row.lemma)).map(row=>Object.freeze({
    lemma:row.lemma,
    forms:Array.isArray(row.forms)?row.forms:[],
    gloss:row?.gloss?.[language]||row?.gloss?.en||"",
    status:row.status||"",
  }));
}

export function latinCheckpointStatus(lesson,feedback){
  const rule=lesson?.checkpoint?.passingRule;
  const ids=Array.isArray(rule?.autoGradedExerciseIds)?rule.autoGradedExerciseIds:[];
  const get=id=>feedback instanceof Map?feedback.get(id):feedback?.[id];
  const attempted=ids.filter(id=>Boolean(get(id)?.shown)).length;
  const correct=ids.filter(id=>get(id)?.shown&&get(id)?.graded!==false&&get(id)?.correct===true).length;
  const required=Number(rule?.autoGradedMinimumCorrect||0);
  return Object.freeze({
    applicable:Boolean(ids.length&&required),
    checkpointId:lesson?.checkpoint?.id||null,
    total:ids.length,
    attempted,
    correct,
    required,
    remaining:Math.max(0,required-correct),
    passed:Boolean(ids.length&&required&&correct>=required),
  });
}

export function latinFrameworkEntries(lesson){
  return Object.entries(lesson||{}).filter(([key,value])=>
    /Framework$/.test(key)&&value&&typeof value==="object"&&!Array.isArray(value)
  );
}

export function latinCaseRows(lesson){
  return lesson?.casePanel?.visible&&Array.isArray(lesson.casePanel.cases)?lesson.casePanel.cases:[];
}

export function latinPronounParadigms(lesson){
  return lesson?.pronounParadigms&&typeof lesson.pronounParadigms==="object"?lesson.pronounParadigms:null;
}

export function latinChoiceOrder(exercise){
  const options=Array.isArray(exercise?.options)?exercise.options:[];
  const order=options.map((_,i)=>i);
  if(order.length<2)return order;
  const match=/^l(\d+)-e(\d+)$/.exec(String(exercise?.id||""));
  let seed=0;
  if(match)seed=Number(match[1])*7+Number(match[2])*11;
  else for(const ch of String(exercise?.id||""))seed=(seed*31+ch.charCodeAt(0))>>>0;
  const offset=seed%order.length;
  return order.map((_,i)=>(i+offset)%order.length);
}
