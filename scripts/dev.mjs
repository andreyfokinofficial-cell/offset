import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const argIndex=process.argv.indexOf('--port');
const port=Number(argIndex>=0 ? process.argv[argIndex+1] : process.env.PORT || 3000);
let building=false;
function build(){ if(building) return; building=true; const r=spawnSync(process.execPath,[path.join(root,'scripts','build.mjs')],{stdio:'inherit'}); building=false; if(r.status!==0) console.error('Build failed'); }
build();
fs.watch(path.join(root,'content'),{recursive:true},()=>build());
fs.watch(path.join(root,'public'),{recursive:true},()=>build());
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  const clean=decodeURIComponent((req.url||'/').split('?')[0]);
  let target=path.join(dist,clean);
  if(clean.endsWith('/')) target=path.join(target,'index.html');
  else if(!path.extname(target) && fs.existsSync(target) && fs.statSync(target).isDirectory()) target=path.join(target,'index.html');
  if(!fs.existsSync(target) || fs.statSync(target).isDirectory()) target=path.join(dist,'404.html');
  const ext=path.extname(target); res.setHeader('Content-Type',mime[ext]||'application/octet-stream'); res.statusCode=target.endsWith('404.html')?404:200; fs.createReadStream(target).pipe(res);
}).listen(port,'0.0.0.0',()=>console.log(`OFFSET dev server: http://localhost:${port}`));
