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

## Hand test of v0.2 on the live site (2026-10-28 04:06 UTC)
Clicked through the live page in a real browser: badge reads BETA v0.2; Clean/Make clip stay disabled with no file; transcript paste, Insert timestamp (new line), SRT download, show notes, episode page + RSS all worked. Empty audio URL is refused with a clear message; .m4a gets type audio/x-m4a; the preview shows real headings and bullets.
Found 2 more problems:
13. A highlight merged two separate transcript lines when the first had no period ("...here Microphones matter...").
14. With no site URL the feed had an empty `<link></link>`.
Fixes (v0.2.1): added a **Try the sample recording** button so anyone can test the full audio path without their own file; highlights split on line breaks too; feed link falls back to the audio file's host. 2 new tests (12 total, all passing).

## Hand test of v0.2.1 on the live site (2026-10-28 04:07 UTC)
Full audio path clicked through in a real browser using the sample recording: loaded (00:00:40, 44100 Hz, 1 ch); Clean audio finished (gain x6.50) with a playable 40 s cleaned file and download button; a 5-15 s clip came out 10 s long and labeled (cleaned); a backwards clip (20 to 10) is refused with a clear alert; RSS showed length="320592", duration 00:00:40 and link https://example.com. No problems found.
Still untested: a long real-voice episode (1+ hour). Browser memory is the known risk there (see HOWTO limits).

## Current version: v0.2.1
