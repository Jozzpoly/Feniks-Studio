import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
const ref='dd47f3253dbcf522b4cd671c794599d32cbe79b9';
if(!process.env.JASKINIA_REPO)throw new Error('Set JASKINIA_REPO to the local public Jaskinia clone.');
const host=execFileSync('git',['-C',process.env.JASKINIA_REPO,'show',ref+':dist/jaskinia-web.html'],{encoding:'utf8',maxBuffer:32<<20}),end=host.lastIndexOf('</body>');
if(end<0)throw new Error('Host document has no body end.');
const html=host.slice(0,end)+'<script type="module" src="/view.mjs"></script>'+host.slice(end);
const paths=new Map(['/view.mjs','/carriage.mjs','/fixture.mjs'].map(x=>[x,new URL('.'+x,import.meta.url)]));paths.set('/core.mjs',new URL('../../core.mjs',import.meta.url));
const server=createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;res.setHeader('Cache-Control','no-store');
 if(path==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);}
 else if(paths.has(path)){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(await readFile(paths.get(path)));}
 else if(path==='/favicon.ico'){res.statusCode=204;res.end();}
 else{res.statusCode=404;res.end('Not found');}
 }catch(e){res.statusCode=500;res.end(e.message);}});
await new Promise(r=>server.listen(Number(process.env.PORT||0),'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;await writeFile(new URL('server.json',import.meta.url),JSON.stringify({url,ref,pid:process.pid},null,2));console.log(url);
