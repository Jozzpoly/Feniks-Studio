// Builds a self-contained, disposable copy of the pinned Jaskinia plus our native window.
// Neither the checked-out Jaskinia nor the Owner's running origins are modified.
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
const here=fileURLToPath(new URL('.',import.meta.url));
const require=createRequire(process.env.ESBUILD_PACKAGE||import.meta.url);
const {build}=require('esbuild');
const ref='dd47f3253dbcf522b4cd671c794599d32cbe79b9';
const repo=process.env.JASKINIA_REPO;
if(!repo)throw new Error('Set JASKINIA_REPO to a local Jozz-Cave-Workbench clone containing '+ref+'.');
const host=execFileSync('git',['-C',repo,'show',ref+':dist/jaskinia-web.html'],{encoding:'utf8',maxBuffer:32<<20});
const result=await build({entryPoints:[here+'workbench.mjs'],bundle:true,format:'esm',target:'es2022',write:false,charset:'utf8',legalComments:'none'});
const code=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
// The host also embeds HTML strings containing </body>; insert at the real document end.
const end=host.lastIndexOf('</body>');if(end<0)throw new Error('Host has no document body end.');
const html=(host.slice(0,end)+`<script type="module">${code}</script>`+host.slice(end)).replace('<title>Jaskinia</title>','<title>Tworzywo — próba w Jaskini</title>');
await writeFile(here+'tworzywo-probe.html',html);
if(process.argv.includes('--build-only')){console.log('Built tworzywo-probe.html ('+Buffer.byteLength(html)+' bytes)');process.exit(0);}
const server=createServer(async(req,res)=>{
 if(req.url==='/blank'){res.setHeader('Content-Type','text/html');res.end('<p>Probe</p>');return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(await readFile(here+'tworzywo-probe.html'));
});
await new Promise(r=>server.listen(Number(process.env.PORT||0),'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}`;await writeFile(here+'server.json',JSON.stringify({url,ref,pid:process.pid},null,2));console.log(url);
