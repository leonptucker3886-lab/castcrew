// CastCrew v0.2 core: pure functions (no DOM), shared by app.js and tests/core.test.js
(function(root){
const fmt=t=>{t=Math.max(0,Math.floor(t||0));return[Math.floor(t/3600),Math.floor(t%3600/60),t%60].map(x=>String(x).padStart(2,'0')).join(':')};
const srtTime=t=>{t=Math.max(0,t||0);const ms=Math.round((t-Math.floor(t))*1000);return fmt(t)+','+String(ms).padStart(3,'0')};
// Accepts [hh:mm:ss] or [mm:ss]. Untimed lines are joined onto the line above.
function parse(text){const out=[];for(const raw of String(text||'').split('\n')){const l=raw.trim();if(!l)continue;
 const m=l.match(/^\[(?:(\d+):)?(\d{1,2}):(\d{2})\]\s*(.*)$/);
 if(m){out.push({t:(+(m[1]||0))*3600+(+m[2])*60+(+m[3]),text:m[4]});}
 else if(out.length){out[out.length-1].text=(out[out.length-1].text+' '+l).trim();}}
 return out.filter(x=>x.text);}
function srt(text,duration){const L=parse(text).sort((a,b)=>a.t-b.t);return L.map((l,i)=>{let end=L[i+1]?L[i+1].t:l.t+5;
 if(!L[i+1]&&duration>l.t)end=Math.min(end,duration);if(end<=l.t)end=l.t+1;
 return (i+1)+'\n'+srtTime(l.t)+' --> '+srtTime(end)+'\n'+l.text+'\n';}).join('\n');}
const STOP=new Set("the a an and or but to of in on for with is are was were be it this that i you we they he she at as so just like really yeah um uh do not have has my your our its about from what can will if there their them me been how all one get got know think going that's it's don't i'm we're you're they're then than when where which would could should because also some more very into out over want said says thing things right okay well".split(' '));
function keywords(text,n){const c={};(String(text).toLowerCase().match(/[a-z']{4,}/g)||[]).forEach(w=>{w=w.replace(/^'+|'+$/g,'');if(w.length>=4&&!STOP.has(w))c[w]=(c[w]||0)+1});
 return Object.entries(c).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,n).map(x=>x[0]);}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function chapters(text,gap){gap=gap||120;const L=parse(text);if(!L.length)return[];const out=[L[0]];
 for(const l of L)if(l.t-out[out.length-1].t>=gap)out.push(l);return out.map(c=>({t:c.t,title:(c.text.split(/[.!?]/)[0]||'').trim().slice(0,60)||'Chapter'}));}
function showNotes(o){const raw=String(o.transcript||'').replace(/\[(?:\d+:)?\d{1,2}:\d{2}\]/g,' ');
 const sents=raw.split(/(?<=[.!?])\s+/).map(s=>s.replace(/\s+/g,' ').trim()).filter(s=>s.length>30);
 const kw=keywords(raw,8),score=s=>kw.reduce((a,k)=>a+(s.toLowerCase().includes(k)?1:0),0);
 const top=sents.map((s,i)=>({s,i,sc:score(s)})).sort((a,b)=>b.sc-a.sc||a.i-b.i).slice(0,3).sort((a,b)=>a.i-b.i).map(x=>x.s);
 const ch=chapters(o.transcript);
 return '# '+(o.title||'Untitled episode')+'\n_'+(o.show||'')+'_\n\n'+(o.summary?o.summary+'\n\n':'')+
 '## In this episode\n'+(top.map(s=>'- '+s).join('\n')||'- (add a transcript to generate highlights)')+'\n\n## Chapters\n'+
 (ch.map(c=>fmt(c.t)+' '+c.title).join('\n')||'(add [hh:mm:ss] timestamps to the transcript)')+'\n\n## Topics\n'+(kw.map(k=>'#'+k).join(' ')||'(none yet)')+'\n';}
// Minimal markdown -> HTML for the episode page (headings, bullets, italics, paragraphs). Input is escaped first.
function mdToHtml(md){const lines=esc(md).split('\n');let h='',inList=false;const close=()=>{if(inList){h+='</ul>';inList=false}};
 for(const l of lines){if(/^## /.test(l)){close();h+='<h3>'+l.slice(3)+'</h3>'}else if(/^# /.test(l)){close();h+='<h2>'+l.slice(2)+'</h2>'}
  else if(/^- /.test(l)){if(!inList){h+='<ul>';inList=true}h+='<li>'+l.slice(2)+'</li>'}
  else if(!l.trim()){close()}else{close();h+='<p>'+l.replace(/^_(.*)_$/,'<em>$1</em>')+'</p>'}}close();return h;}
function audioType(url){const e=(String(url).split(/[?#]/)[0].match(/\.([a-z0-9]+)$/i)||[])[1];
 return({mp3:'audio/mpeg',m4a:'audio/x-m4a',mp4:'audio/mp4',aac:'audio/aac',wav:'audio/wav',ogg:'audio/ogg',opus:'audio/ogg'})[(e||'').toLowerCase()]||'audio/mpeg';}
const isUrl=u=>/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(String(u||'').trim());
function rss(o){const sh=esc(o.show||'My Podcast'),t=esc(o.title||'Episode'),au=String(o.audioUrl||'').trim(),site=esc(o.siteUrl||'');
 const desc=esc(o.summary||o.title||'');const bytes=Math.max(0,Math.floor(o.bytes||0));
 return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">\n<channel>\n<title>'+sh+'</title>\n<link>'+site+'</link>\n<description>'+sh+'</description>\n<language>en</language>\n<itunes:explicit>false</itunes:explicit>\n'+
 '<item>\n<title>'+t+'</title>\n<description>'+desc+'</description>\n<enclosure url="'+esc(au)+'" type="'+audioType(au)+'" length="'+bytes+'"/>\n<guid isPermaLink="false">'+esc(au)+'</guid>\n<pubDate>'+(o.date||new Date()).toUTCString()+'</pubDate>\n<itunes:duration>'+fmt(o.duration||0)+'</itunes:duration>\n</item>\n</channel>\n</rss>\n';}
const api={fmt,srtTime,parse,srt,keywords,esc,chapters,showNotes,mdToHtml,audioType,isUrl,rss};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CC=api;
})(this);
