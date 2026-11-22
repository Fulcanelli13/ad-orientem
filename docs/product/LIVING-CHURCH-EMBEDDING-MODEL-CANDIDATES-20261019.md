# Living Church embedding retrieval — candidate model decision note
**19 October 2026 · Research recommendation only · Model not installed or validated**

## Candidate A (preferred benchmark): multilingual E5 small

- Canonical source/model card: https://huggingface.co/intfloat/multilingual-e5-small
- License on current source model card: **MIT**.
- Architecture: 12 transformer layers; **384-dimensional embeddings**; multilingual model with English and French among supported languages.
- Intended retrieval convention: prefix visitor questions with `query: ` and topic/source-description records with `passage: `. Both prefixed strings go through the **same exact revision** of the model, followed by mean pooling and L2 normalisation, before cosine ranking. Model authors explicitly warn that missing these prefixes degrades retrieval: https://huggingface.co/intfloat/multilingual-e5-small/blob/ada7b62be30f82b0bc5da131b0477721c8fc14e9/README.md
- Potential portable ONNX edition: https://huggingface.co/Xenova/multilingual-e5-small/tree/main/onnx . At time of source inspection, an **int8 model file was listed at approximately 118 MB**, before tokenizer, app assets and browser/runtime overhead. This is not a tested Android download, device-speed estimate, or endorsement of the conversion's license provenance.
- The published source cautions that similarity values can be concentrated around 0.7–1.0. The current 0.72 absolute-similarity gate is **temporary** and needs **fresh model-specific calibration**. Do not claim that it is a trustworthy rejection threshold.
- Do not commit neural weight files in this repository. Obtain approved weights/artifact checksums separately; pin exact upstream commit and export precision, tokenizer, pooling, normalisation, quantisation and prefix rule into an explicit index manifest.

## Candidate B (comparison baseline): paraphrase-multilingual-MiniLM-L12-v2

- Model card: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- License in published card: **Apache-2.0**. Outputs **384-dimensional** vectors; supports 50 languages.
- Uses mean pooling per published documentation and is suited to sentence similarity. Do **not** apply E5's query/passage prefix rule to this model without verification.
- Advantage: useful second multilingual benchmark. Disadvantage: its exact release/revision, quantised artifacts and on-device performance still need verification.

## Ranking architecture

1. Load original topic registry; validate 172 topic identities/source references, source-gap policy and current index signature.
2. Create two source-topic embedding records for each topic (EN and FR) from existing titles and *question search metadata*, not from newly authored Papal statements. Index text must be displayed and reviewed before generating vectors.
3. Precompute all topic embeddings with a **pinned model**, locally or under an explicitly authorised build environment. Pair them with normalized vectors and EN/FR metadata.
4. Query model receives visitor question only with the visitor's consent if using remote execution; prefer offline/on-device where practical. The remote mode must never silently receive questions.
5. Return top semantic candidates and conservative uncertainty margins. Re-rank with lexical/disambiguation and preserve the **88 held source-gap topics**, allowing abstention or clarification.
6. Require explicit confirmation for inferred topic and separate consent for a character referral. No proposed model controls generated character words.
7. Compare model A, B, lexical-only and symbolic hybrid on **unseen, human-reviewed EN/FR visitor questions**, measuring wrong-specific routes, abstentions and ambiguous questions separately.

## Not yet accomplished

No model has been downloaded, run, timed on Android, quantised by this project, embedded into the app or benchmarked on real visitor questions. No real pretrained vectors have been computed for the 172 topic records. A model choice remains provisional until accuracy, privacy, footprint, and license/provenance are verified. No AI-pastoral or theological conclusions are permitted by embedding similarity.
