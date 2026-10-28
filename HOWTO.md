# CastCrew v0.2.1 (beta): How to use it

CastCrew is a back office for small podcasters. It runs entirely in your browser: your audio never leaves your computer, and there are no accounts, servers or API keys.

Live: https://castcrew-leonptucker3886-labs-projects.vercel.app (castcrew.leonlink.net once its DNS record is added)

## Step by step
1. **Upload.** Choose your raw recording (MP3, WAV, M4A, OGG). CastCrew shows its length, sample rate and channels. If the file can't be read, you get a red message telling you so. No recording handy? Press **Try the sample recording** (a 40-second test tone with hum and hiss).
2. **Clean audio.** Leave the defaults (80 Hz rumble cut, gate 0.01, peak 0.9) or adjust them, then press **Clean audio**. Out-of-range numbers are corrected automatically (rumble cut 20-300 Hz, gate 0-0.1, peak 0.1-1). It cuts low rumble, evens out loud and quiet parts (compressor), lowers background noise between words (gate) and normalizes the volume. Listen, then press **Download cleaned WAV** (named after your file, e.g. `myshow-clean.wav`).
3. **Transcript.** Paste your transcript or type it while listening. Timestamps can be `[00:02:15]` or `[02:15]`. Lines without a timestamp are joined to the line above. **Insert timestamp** stamps the current playback time on a new line. Download as `.txt` or captions (`.srt`). The last caption lasts 5 seconds (or until the recording ends).
4. **Show notes.** Enter the show name, episode title and an optional summary, then press **Generate show notes**. You get three highlights, chapters (a new chapter at each timestamped line at least 2 minutes after the last one) and topic tags. Edit the text, then download the `.md` file.
5. **Social clips.** Set a start and end in seconds (or press **Set start to current position** while playing), then **Make clip**. Clips come from the cleaned audio if you cleaned it (the label says *cleaned* or *raw*), with short fades. Download each clip as WAV.
6. **Episode page and RSS.** Enter the public **https://** URL where the audio file is hosted (required) and optionally your site URL. The file size box is filled with your upload's size; change it if you host a different file. Press **Build episode page + RSS**, check the preview, then download `episode.html` and `feed.xml` and upload them to your website.

## Limits in v0.2.1
- Transcription is manual (paste or type). Automatic speech-to-text is planned.
- Clips are audio only (WAV). Video audiograms are planned.
- Recordings of 2+ hours can use a lot of browser memory.
- The RSS feed covers one episode. Merge items yourself for a multi-episode feed.

## Files
- `index.html`: the page
- `core.js`: transcript, captions, show notes, page and RSS logic (no dependencies)
- `app.js`: the page controls and audio processing (Web Audio API)
- `samples/sample-episode.mp3`: the sample recording
- `tests/core.test.js`: run `node tests/core.test.js`
- `LOGBOOK.md`: version history and self-review
- `reports/INSPECTIONS.md`: inspection results
