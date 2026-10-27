# CastCrew v0.1 (beta): How to use it

CastCrew is a back office for small podcasters. It runs entirely in your browser: your audio never leaves your computer, and there are no accounts, servers or API keys.

## Step by step
1. **Upload.** Open the site and choose your raw recording (MP3, WAV, M4A, OGG). CastCrew shows its length, sample rate and channels.
2. **Clean audio.** Leave the defaults (80 Hz rumble cut, gate 0.01, peak 0.9) or adjust them, then press **Clean audio**. It cuts low rumble, evens out loud and quiet parts (compressor), lowers background noise between words (gate) and normalizes the volume. Listen, then press **Download cleaned WAV**.
3. **Transcript.** Paste your transcript, or type it while listening. Press **Insert timestamp** to stamp the current playback time, e.g. `[00:02:15] Now let's talk about...`. Download it as `.txt` or as captions (`.srt`).
4. **Show notes.** Enter the show name, episode title and an optional summary, then press **Generate show notes**. You get three highlights, chapters (a new chapter at each timestamped line at least 2 minutes after the last) and topic tags. Edit the text, then download `show-notes.md`.
5. **Social clips.** Set a start and end in seconds (or press **Set start to current position** while playing), then **Make clip**. Clips are cut from the cleaned audio if you cleaned it, with short fade in/out. Download each clip as WAV.
6. **Episode page and RSS.** Enter the public URL where your audio file is hosted and your site URL, then press **Build episode page + RSS**. Preview the page, then download `episode.html` and `feed.xml` and upload them to your website.

## Limits in v0.1
- Transcription is manual (paste or type). Automatic speech-to-text is planned for a later phase.
- Clips are audio only (WAV). Video audiograms are planned.
- Very long recordings (2+ hours) can use a lot of browser memory.
- The RSS feed covers one episode. Merge items yourself for a multi-episode feed.

## Files
- `index.html`: the page
- `app.js`: all the logic (Web Audio API, no dependencies)
