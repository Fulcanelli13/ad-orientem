# Historical source-integrity audit — exact originals versus indexed excerpts

As of **12 October 2026**, the recovery corpus contains **452** numbered question-title strings. However, their origin is previous-conversation *search excerpts/summaries*, not raw copies of the original chats.

| Evidence test | Confirmed result |
|---|---:|
| Indexed numbered question-title strings | 452 |
| Raw historical ChatGPT transcripts independently fetched | 0 |
| Stable original assistant-message permalinks in archive records | 0 |
| Question strings byte-certified against raw original messages | 0 |

## Why this matters

Earlier recovery work described some strings as verbatim. The data **does not support that level of certification**: it records timestamps and prior-chat summaries, but no independently acquired full message text or stable message links. The recovered strings are useful *historical question-text candidates* and should remain available, but none should be silently promoted to transcript-verified originals.

## Source classes in current archive

- `EXACT_NUMBERED_QUESTION_QUOTED_FROM_ORIGINAL_ASSISTANT_OUTPUT_IN_PRIOR_CHAT_SEARCH_20261012`: 66 entries
- `PRIOR_ASSISTANT_OUTPUT_EXCERPT_FROM_PERSONAL_CONTEXT`: 264 entries
- `PRIOR_ASSISTANT_OUTPUT_EXPLICIT_QUOTED_TITLE_FROM_PERSONAL_CONTEXT_RETRIEVAL_20261012`: 116 entries
- `NUMBERED_ORIGINAL_QUESTION_QUOTED_FROM_PRIOR_ASSISTANT_RESPONSE`: 6 entries

## Conditions for a verified original

1. Recover the complete prior assistant message from the original conversation or a ChatGPT data export.
2. Match original bank, item ID, complete question sentence, punctuation and bilingual wording.
3. Preserve dated message identifier or actual exported message path as evidence.
4. Set `verified_original_chat_text=true` only after comparison, not from a topic synopsis.
5. Store collided IDs with response date and original thread/bank, never global number alone.

Current direct GitHub source-file entries in the separate 282-record catalogue are version-controlled and source-text exact **at their current file revision**, but that does not prove they match the wording in older conversations.
