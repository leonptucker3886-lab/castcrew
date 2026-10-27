const $=id=>document.getElementById(id);let ctx,rawBuf,cleanBuf,lastPlayer;
const actx=()=>ctx||(ctx=new (window.AudioContext||window.webkitAudioContext)());
$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;$('rawPlayer').src=URL.createObjectURL(f);lastPlayer=$('rawPlayer');
 $('info').textContent='Decoding...';rawBuf=await actx().decodeAudioData(await f.arrayBuffer());
 $('info').textContent=f.name+' | '+rawBuf.duration.toFixed(1)+' s | '+rawBuf.sampleRate+' Hz | '+rawBuf.numberOfChannels+' ch';
 $('cleanBtn').disabled=false;$('clipBtn').disabled=false;$('ce').value=Math.min(30,Math.floor(rawBuf.duration));};
function wav(buf){const ch=buf.numberOfChannels,sr=buf.sampleRate,n=buf.length,b=new ArrayBuffer(44+n*ch*2),v=new DataView(b);let o=0;
 const s=t=>{for(const c of t)v.setUint8(o++,c.charCodeAt(0))},u32=x=>{v.setUint32(o,x,true);o+=4},u16=x=>{v.setUint16(o,x,true);o+=2};
 s('RIFF');u32(36+n*ch*2);s('WAVE');s('fmt ');u32(16);u16(1);u16(ch);u32(sr);u32(sr*ch*2);u16(ch*2);u16(16);s('data');u32(n*ch*2);
 const d=[];for(let c=0;c<ch;c++)d.push(buf.getChannelData(c));
 for(let i=0;i<n;i++)for(let c=0;c<ch;c++){const x=Math.max(-1,Math.min(1,d[c][i]));v.setInt16(o,x<0?x*0x8000:x*0x7fff,true);o+=2}
 return new Blob([b],{type:'audio/wav'});}
$('cleanBtn').onclick=async()=>{$('cleanInfo').textContent='Cleaning...';const sr=rawBuf.sampleRate;
 const off=new OfflineAudioContext(rawBuf.numberOfChannels,rawBuf.length,sr);const src=off.createBufferSource();src.buffer=rawBuf;
 const hp=off.createBiquadFilter();hp.type='highpass';hp.frequency.value=+$('hp').value;
 const comp=off.createDynamicsCompressor();comp.threshold.value=-24;comp.ratio.value=4;comp.attack.value=0.005;comp.release.value=0.2;
 src.connect(hp);hp.connect(comp);comp.connect(off.destination);src.start();const out=await off.startRendering();
 const g=+$('gate').value,win=Math.floor(sr*0.02);let peak=0;
 for(let c=0;c<out.numberOfChannels;c++){const d=out.getChannelData(c);let gain=1;
  for(let i=0;i<d.length;i+=win){const e=Math.min(d.length,i+win);let r=0;for(let j=i;j<e;j++)r+=d[j]*d[j];r=Math.sqrt(r/(e-i));const t=r<g?0.1:1;
   for(let j=i;j<e;j++){gain+=(t-gain)*0.002;d[j]*=gain}}
  for(let i=0;i<d.length;i++)peak=Math.max(peak,Math.abs(d[i]));}
 const k=peak?(+$('peak').value)/peak:1;for(let c=0;c<out.numberOfChannels;c++){const d=out.getChannelData(c);for(let i=0;i<d.length;i++)d[i]*=k}
 cleanBuf=out;const url=URL.createObjectURL(wav(out));$('cleanPlayer').src=url;$('dlClean').href=url;$('dlClean').style.display='inline';lastPlayer=$('cleanPlayer');
 $('cleanInfo').textContent='Done: rumble cut at '+$('hp').value+' Hz, compressed, gated, normalized (gain x'+k.toFixed(2)+').';};
const fmt=t=>{t=Math.max(0,Math.floor(t));return[Math.floor(t/3600),Math.floor(t%3600/60),t%60].map(x=>String(x).padStart(2,'0')).join(':')};
const cur=()=>(lastPlayer&&lastPlayer.currentTime)||0;
$('cleanPlayer').onplay=()=>lastPlayer=$('cleanPlayer');$('rawPlayer').onplay=()=>lastPlayer=$('rawPlayer');
$('stampBtn').onclick=()=>{const t=$('transcript'),p=t.selectionStart,ins='['+fmt(cur())+'] ';t.value=t.value.slice(0,p)+ins+t.value.slice(p);t.focus()};
const dl=(name,text,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));a.download=name;a.click()};
const parse=()=>$('transcript').value.split('\n').map(l=>{const m=l.match(/^\[(\d+):(\d+):(\d+)\]\s*(.*)/);return m?{t:(+m[1])*3600+(+m[2])*60+(+m[3]),text:m[4]}:null}).filter(Boolean);
$('txtDl').onclick=()=>dl('transcript.txt',$('transcript').value);
$('srtDl').onclick=()=>{const L=parse(),end=rawBuf?rawBuf.duration:0,ts=s=>fmt(s)+',000';
 dl('captions.srt',L.map((l,i)=>(i+1)+'\n'+ts(l.t)+' --> '+ts(L[i+1]?L[i+1].t:Math.max(end,l.t+5))+'\n'+l.text+'\n').join('\n'))};
const STOP=new Set('the a an and or but to of in on for with is are was were be it this that i you we they he she at as so just like really yeah um uh do not have has my your our its about from what can will if there their them me been how all one get got know think going'.split(' '));
function keywords(text,n){const c={};(text.toLowerCase().match(/[a-z']{4,}/g)||[]).forEach(w=>{if(!STOP.has(w))c[w]=(c[w]||0)+1});
 return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,n).map(x=>x[0]);}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function chapters(){const L=parse();if(!L.length)return[];const out=[L[0]];
 for(const l of L)if(l.t-out[out.length-1].t>=120)out.push(l);return out.map(c=>({t:c.t,title:c.text.split(/[.!?]/)[0].slice(0,60)||'Chapter'}));}
$('notesBtn').onclick=()=>{const raw=$('transcript').value.replace(/\[\d+:\d+:\d+\]/g,'');const sents=raw.split(/(?<=[.!?])\s+/).filter(s=>s.trim().length>30);
 const kw=keywords(raw,8);const score=s=>kw.reduce((a,k)=>a+(s.toLowerCase().includes(k)?1:0),0);
 const top=sents.map((s,i)=>({s:s.trim(),i,sc:score(s)})).sort((a,b)=>b.sc-a.sc).slice(0,3).sort((a,b)=>a.i-b.i).map(x=>x.s);
 const ch=chapters();
 $('notes').value='# '+$('title').value+'\n_'+$('show').value+'_\n\n'+($('summary').value?$('summary').value+'\n\n':'')+
 '## In this episode\n'+(top.map(s=>'- '+s).join('\n')||'- (add a transcript to generate highlights)')+'\n\n## Chapters\n'+
 (ch.map(c=>fmt(c.t)+' '+c.title).join('\n')||'(add [hh:mm:ss] timestamps to the transcript)')+'\n\n## Topics\n'+kw.map(k=>'#'+k).join(' ')+'\n';};
$('notesDl').onclick=()=>dl('show-notes.md',$('notes').value,'text/markdown');
$('useCur').onclick=()=>{$('cs').value=Math.floor(cur());$('ce').value=Math.floor(cur())+30};
$('clipBtn').onclick=()=>{const b=cleanBuf||rawBuf,sr=b.sampleRate,s=Math.max(0,+$('cs').value),e=Math.min(b.duration,+$('ce').value);
 if(e<=s){alert('End must be after start');return}const n=Math.floor((e-s)*sr),c=actx().createBuffer(b.numberOfChannels,n,sr);
 for(let ch=0;ch<b.numberOfChannels;ch++){const o=c.getChannelData(ch);o.set(b.getChannelData(ch).subarray(Math.floor(s*sr),Math.floor(s*sr)+n));
  const f=Math.min(Math.floor(n/2),Math.floor(sr*0.3));for(let i=0;i<f;i++){o[i]*=i/f;o[n-1-i]*=i/f}}
 const url=URL.createObjectURL(wav(c)),name='clip-'+fmt(s).replace(/:/g,'')+'.wav';const div=document.createElement('div');
 div.innerHTML='<audio controls src="'+url+'" style="width:70%"></audio> <a download="'+name+'" href="'+url+'"><button>Download '+name+'</button></a>';$('clips').appendChild(div);};
let pageHtml='',rssXml='';
$('pageBtn').onclick=()=>{if(!$('notes').value)$('notesBtn').onclick();
 const t=esc($('title').value),sh=esc($('show').value),au=esc($('audioUrl').value),site=esc($('siteUrl').value),ch=chapters();
 pageHtml='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>'+t+' | '+sh+'</title></head>'+
 '<body style="font-family:system-ui;max-width:720px;margin:auto;padding:16px"><h1>'+t+'</h1><p>'+sh+'</p>'+
 (au?'<audio controls src="'+au+'" style="width:100%"></audio>':'')+'<h2>Chapters</h2><ul>'+ch.map(c=>'<li>'+fmt(c.t)+' '+esc(c.title)+'</li>').join('')+'</ul>'+
 '<h2>Show notes</h2><p>'+esc($('notes').value).replace(/\n/g,'<br>')+'</p><details><summary>Transcript</summary><pre style="white-space:pre-wrap">'+esc($('transcript').value)+'</pre></details></body></html>';
 const dur=rawBuf?fmt(rawBuf.duration):'00:00:00';
 rssXml='<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">\n<channel>\n<title>'+sh+'</title>\n<link>'+site+'</link>\n<description>'+sh+'</description>\n<language>en</language>\n'+
 '<item>\n<title>'+t+'</title>\n<description>'+esc($('summary').value||t)+'</description>\n<enclosure url="'+au+'" type="audio/mpeg" length="0"/>\n<guid>'+(au||t)+'</guid>\n<pubDate>'+new Date().toUTCString()+'</pubDate>\n<itunes:duration>'+dur+'</itunes:duration>\n</item>\n</channel>\n</rss>\n';
 $('preview').srcdoc=pageHtml;$('rss').textContent=rssXml;};
$('pageDl').onclick=()=>{if(!pageHtml)$('pageBtn').onclick();dl('episode.html',pageHtml,'text/html')};
$('rssDl').onclick=()=>{if(!rssXml)$('pageBtn').onclick();dl('feed.xml',rssXml,'application/rss+xml')};
