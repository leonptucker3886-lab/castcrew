# CastCrew LOGBOOK

## v0.1 rough draft (2026-10-27 04:11 UTC)
Deployed to https://castcrew-leonptucker3886-labs-projects.vercel.app. Upload, audio cleanup, transcript with .txt/.srt export, show notes, social clips, episode page and RSS. Code-checked only; not hand-tested.

## Self-review of v0.1 (2026-10-28)
Read every line of v0.1 and ran its transcript, caption and RSS logic against sample transcripts. Weak spots found:
1. `[01:30]` (mm:ss) timestamps were silently ignored. Only `[hh:mm:ss]` worked.
2. Transcript lines without a timestamp were dropped from captions and chapters.
3. The last caption ran to the end of the whole recording instead of a few seconds.
4. A file the browser couldn't decode left "Decoding..." on screen forever, with no error.
5. Cleanup settings weren't checked. A peak of 5 clipped the audio and a blank rumble cut broke the filter.
6. The Clean button could be pressed twice during a long render, and a failure left no message.
7. RSS feed: enclosure `length="0"`, type always `audio/mpeg` even for M4A/WAV, and a blank audio URL still produced a feed podcast apps reject.
8. The episode page showed raw markdown (`##`, `-`) from the show notes.
9. Downloads were all generic names (`episode-clean.wav`, `clip-000000.wav`), so files from different episodes overwrote each other.
10. Gate smoothing depended on sample rate (faster at 48 kHz than 44.1 kHz).
11. Inserting a timestamp mid-line glued it into the existing text.
12. No tests.

## Fixes (v0.2, 2026-10-28)
1-3. New parser accepts `[hh:mm:ss]` and `[mm:ss]`, joins untimed lines to the line above; last caption capped at 5 s or recording end; SRT now carries milliseconds.
4. Decode errors show a red message and keep the buttons locked.
5. Inputs clamped to safe ranges and corrected in the boxes.
6. Clean button disabled while running; errors shown in red.
7. RSS uses the real file size (new box, prefilled), picks the MIME type from the file extension, `guid isPermaLink="false"`, `itunes:explicit`; build refuses without a valid https audio URL.
8. Show notes rendered to proper HTML (headings, bullet lists) on the episode page, all text escaped.
9. Downloads named after the uploaded file, clips include start and end times.
10. Gate smoothing uses a 10 ms time constant at any sample rate.
11. Timestamps go on a new line and the cursor lands after them.
12. Logic moved to `core.js` with 10 automated tests (`node tests/core.test.js`), all passing; generated RSS validated as XML.
Polish: banner and footer say v0.2; HOWTO.md rewritten for v0.2.

## Current version: v0.2
