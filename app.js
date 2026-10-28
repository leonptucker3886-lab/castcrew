// CastCrew v0.2 UI. Pure logic lives in core.js (window.CC).
const $=id=>document.getElementById(id);const {fmt,srt,esc,showNotes,mdToHtml,isUrl,rss}=CC;
let ctx,rawBuf,cleanBuf,lastPlayer,fileName='episode';
const actx=()=>ctx||(ctx=new (window.AudioContext||window.webkitAudioContext)());
const num=(id,min,max,def)=>{let v=parseFloat($(id).value);if(!isFinite(v))v=def;v=Math.min(max,Math.max(min,v));$(id).value=v;return v};
const say=(id,msg,bad)=>{const e=$(id);e.textContent=msg;e.style.color=bad?'#B42318':''};
async function load(f){if(!f)return;fileName=f.name.replace(/\.[^.]+$/,'')||'episode';
 $('cleanBtn').disabled=true;$('clipBtn').disabled=true;cleanBuf=null;$('dlClean').style.display='none';$('cleanPlayer').removeAttribute('src');$('cleanInfo').textContent='';
 $('rawPlayer').src=URL.createObjectURL(f);lastPlayer=$('rawPlayer');if(!$('bytes').value)$('bytes').value=f.size;
 say('info','Decoding '+f.name+'...');
 try{rawBuf=await actx().decodeAudioData(await f.arrayBuffer());}
 catch(err){rawBuf=null;say('info','Could not read "'+f.name+'". Try an MP3, WAV or M4A file.',true);return;}
 say('info',f.name+' | '+fmt(rawBuf.duration)+' ('+rawBuf.duration.toFixed(1)+' s) | '+rawBuf.sampleRate+' Hz | '+rawBuf.numberOfChannels+' ch');
 $('cleanBtn').disabled=false;$('clipBtn').disabled=false;$('cs').value=0;$('ce').value=Math.min(30,Math.floor(rawBuf.duration));}
$('file').onchange=e=>load(e.target.files[0]);
$('sampleBtn').onclick=async()=>{say('info','Loading sample...');try{const r=await fetch('samples/sample-episode.mp3');if(!r.ok)throw 0;load(new File([await r.blob()],'sample-episode.mp3',{type:'audio/mpeg'}));}catch(e){say('info','Could not load the sample recording.',true)}};
function wav(buf){const ch=buf.numberOfChannels,sr=buf.sampleRate,n=buf.length,b=new ArrayBuffer(44+n*ch*2),v=new DataView(b);let o=0;
 const s=t=>{for(const c of t)v.setUint8(o++,c.charCodeAt(0))},u32=x=>{v.setUint32(o,x,true);o+=4},u16=x=>{v.setUint16(o,x,true);o+=2};
 s('RIFF');u32(36+n*ch*2);s('WAVE');s('fmt ');u32(16);u16(1);u16(ch);u32(sr);u32(sr*ch*2);u16(ch*2);u16(16);s('data');u32(n*ch*2);
 const d=[];for(let c=0;c<ch;c++)d.push(buf.getChannelData(c));
 for(let i=0;i<n;i++)for(let c=0;c<ch;c++){const x=Math.max(-1,Math.min(1,d[c][i]));v.setInt16(o,x<0?x*0x8000:x*0x7fff,true);o+=2}
 return new Blob([b],{type:'audio/wav'});}
$('cleanBtn').onclick=async()=>{if(!rawBuf)return;const btn=$('cleanBtn');btn.disabled=true;say('cleanInfo','Cleaning... long episodes can take a minute.');
 try{const sr=rawBuf.sampleRate,hpHz=num('hp',20,300,80),g=num('gate',0,0.1,0.01),target=num('peak',0.1,1,0.9);
 const off=new OfflineAudioContext(rawBuf.numberOfChannels,rawBuf.length,sr);const src=off.createBufferSource();src.buffer=rawBuf;
 const hp=off.createBiquadFilter();hp.type='highpass';hp.frequency.value=hpHz;
 const comp=off.createDynamicsCompressor();comp.threshold.value=-24;comp.ratio.value=4;comp.attack.value=0.005;comp.release.value=0.2;
 src.connect(hp);hp.connect(comp);comp.connect(off.destination);src.start();const out=await off.startRendering();
 const win=Math.max(1,Math.floor(sr*0.02)),coef=1-Math.exp(-1/(sr*0.01));let peak=0;
 for(let c=0;c<out.numberOfChannels;c++){const d=out.getChannelData(c);let gain=1;
  for(let i=0;i<d.length;i+=win){const e=Math.min(d.length,i+win);let r=0;for(let j=i;j<e;j++)r+=d[j]*d[j];r=Math.sqrt(r/(e-i));const t=r<g?0.1:1;
   for(let j=i;j<e;j++){gain+=(t-gain)*coef;d[j]*=gain}}
  for(let i=0;i<d.length;i++)peak=Math.max(peak,Math.abs(d[i]));}
 const k=peak?target/peak:1;for(let c=0;c<out.numberOfChannels;c++){const d=out.getChannelData(c);for(let i=0;i<d.length;i++)d[i]*=k}
 cleanBuf=out;const url=URL.createObjectURL(wav(out));$('cleanPlayer').src=url;$('dlClean').href=url;$('dlClean').download=fileName+'-clean.wav';$('dlClean').style.display='inline';lastPlayer=$('cleanPlayer');
 say('cleanInfo','Done: rumble cut at '+hpHz+' Hz, compressed, gated, normalized to peak '+target+' (gain x'+k.toFixed(2)+'). Clips now use the cleaned audio.');}
 catch(err){say('cleanInfo','Cleaning failed: '+err.message,true);}finally{btn.disabled=false;}};
const cur=()=>(lastPlayer&&lastPlayer.currentTime)||0;
$('cleanPlayer').onplay=()=>lastPlayer=$('cleanPlayer');$('rawPlayer').onplay=()=>lastPlayer=$('rawPlayer');
$('stampBtn').onclick=()=>{const t=$('transcript'),p=t.selectionStart||0,before=t.value.slice(0,p),nl=before&&!before.endsWith('\n')?'\n':'',ins=nl+'['+fmt(cur())+'] ';
 t.value=before+ins+t.value.slice(p);t.focus();t.selectionStart=t.selectionEnd=p+ins.length;};
const dl=(name,text,type)=>{const a=document.createElement('a');const u=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)};
const need=(ok,msg)=>{if(!ok)alert(msg);return ok};
$('txtDl').onclick=()=>{if(need($('transcript').value.trim(),'The transcript is empty.'))dl(fileName+'-transcript.txt',$('transcript').value)};
$('srtDl').onclick=()=>{const s=srt($('transcript').value,rawBuf?rawBuf.duration:0);if(need(s,'No timestamped lines found. Start lines with [00:01:30] or [01:30].'))dl(fileName+'.srt',s)};
$('notesBtn').onclick=()=>{$('notes').value=showNotes({transcript:$('transcript').value,title:$('title').value,show:$('show').value,summary:$('summary').value})};
$('notesDl').onclick=()=>{if(!$('notes').value)$('notesBtn').onclick();dl(fileName+'-show-notes.md',$('notes').value,'text/markdown')};
$('useCur').onclick=()=>{const s=Math.floor(cur());$('cs').value=s;$('ce').value=rawBuf?Math.min(Math.floor(rawBuf.duration),s+30):s+30};
$('clipBtn').onclick=()=>{const b=cleanBuf||rawBuf;if(!b)return;const sr=b.sampleRate,s=Math.max(0,+$('cs').value||0),e=Math.min(b.duration,+$('ce').value||0);
 if(e<=s){alert('End must be after start, and start must be inside the recording ('+fmt(b.duration)+' long).');return}
 const n=Math.floor((e-s)*sr),c=actx().createBuffer(b.numberOfChannels,n,sr);
 for(let ch=0;ch<b.numberOfChannels;ch++){const o=c.getChannelData(ch);o.set(b.getChannelData(ch).subarray(Math.floor(s*sr),Math.floor(s*sr)+n));
  const f=Math.min(Math.floor(n/2),Math.floor(sr*0.3));for(let i=0;i<f;i++){o[i]*=i/f;o[n-1-i]*=i/f}}
 const url=URL.createObjectURL(wav(c)),name=fileName+'-clip-'+fmt(s).replace(/:/g,'')+'-'+fmt(e).replace(/:/g,'')+'.wav';const div=document.createElement('div');
 div.innerHTML='<audio controls src="'+url+'" style="width:60%"></audio> <a download="'+esc(name)+'" href="'+url+'"><button>Download clip</button></a> <span class="muted">'+fmt(s)+' to '+fmt(e)+(cleanBuf?' (cleaned)':' (raw)')+'</span>';$('clips').appendChild(div);};
let pageHtml='',rssXml='';
function build(){const au=$('audioUrl').value.trim(),site=$('siteUrl').value.trim();
 if(!isUrl(au)){say('pageInfo','Enter the public audio URL (starting with https://) where your episode file is hosted. Podcast apps need it.',true);return false}
 if(site&&!isUrl(site)){say('pageInfo','The site URL must start with https://',true);return false}
 if(!$('notes').value)$('notesBtn').onclick();
 const t=esc($('title').value),sh=esc($('show').value);
 pageHtml='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>'+t+' | '+sh+'</title><meta name="description" content="'+esc($('summary').value||$('title').value)+'"></head>'+
 '<body style="font-family:system-ui;max-width:720px;margin:auto;padding:16px;color:#18181B"><audio controls src="'+esc(au)+'" style="width:100%"></audio>'+
 mdToHtml($('notes').value)+'<details><summary>Transcript</summary><pre style="white-space:pre-wrap">'+esc($('transcript').value)+'</pre></details></body></html>';
 rssXml=rss({show:$('show').value,title:$('title').value,summary:$('summary').value,audioUrl:au,siteUrl:site,bytes:+$('bytes').value||0,duration:rawBuf?rawBuf.duration:0});
 $('preview').srcdoc=pageHtml;$('rss').textContent=rssXml;say('pageInfo','Built. Preview below. The page and feed use the show notes above.');return true;}
$('pageBtn').onclick=build;
$('pageDl').onclick=()=>{if(build())dl('episode.html',pageHtml,'text/html')};
$('rssDl').onclick=()=>{if(build())dl('feed.xml',rssXml,'application/rss+xml')};
