import { access, readFile } from 'node:fs/promises';
for (const file of ['public/index.html','public/checkout.js','public/style.css','public/return.html','public/return.js','api/pay.mjs','lib/payment.mjs']) await access(file);
const config=JSON.parse(await readFile('vercel.json','utf8'));
if(config.outputDirectory!=='public') throw new Error('Invalid output directory');
console.log('Vercel project structure verified.');
