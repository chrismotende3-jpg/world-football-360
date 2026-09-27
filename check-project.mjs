import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const files=[];
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.name==='node_modules'||e.name==='.git')continue;if(e.isDirectory())walk(p);else files.push(p)}}
walk(root);
const js=files.filter(f=>f.endsWith('.js'));
let bad=0;
for(const f of js){try{execFileSync(process.execPath,['--check',f],{stdio:'ignore'})}catch{console.error('JS syntax error:',path.relative(root,f));bad++}}
const source=files.filter(f=>/\.(jsx|js)$/.test(f));
const missing=[];
for(const f of source){const text=fs.readFileSync(f,'utf8');const re=/from\s+['"](\.\.?\/[^'"]+)['"]/g;let m;while((m=re.exec(text))){const base=path.resolve(path.dirname(f),m[1]);const candidates=[base,base+'.js',base+'.jsx',base+'.json',path.join(base,'index.js'),path.join(base,'index.jsx')];if(!candidates.some(x=>fs.existsSync(x)))missing.push(`${path.relative(root,f)} -> ${m[1]}`)}}
if(missing.length){console.error('Missing local imports:');for(const x of missing)console.error(x);bad+=missing.length}
console.log(`Project check: ${files.length} files; ${js.length} JS files checked; ${missing.length} missing local imports; ${bad} errors.`);
process.exitCode=bad?1:0;
