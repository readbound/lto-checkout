import { WhopClient } from '@whop/sdk';
import { createHash } from 'node:crypto';

const ACCOUNT='biz_le2xpTfOF4nBmA';
const PLAN='plan_9OdViY3cuqEzT';
const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});

export async function handle(request,env=process.env,makeClient=(token)=>new WhopClient({token})){
 if(request.method!=='POST')return reply(405,{error:'Method not allowed.'});
 const origin=env.CHECKOUT_ORIGIN;
 if(!origin||request.headers.get('origin')!==origin)return reply(403,{error:'Checkout origin not allowed.'});
 if(!env.WHOP_API_KEY||env.PAYMENTS_ENABLED!=='true')return reply(503,{error:'This checkout is not taking payments yet. Please use the Whop checkout link below.'});
 if(!request.headers.get('content-type')?.includes('application/json'))return reply(415,{error:'Expected JSON.'});
 let body;
 try{const raw=await request.text();if(raw.length>4096)return reply(413,{error:'Request too large.'});body=JSON.parse(raw);}catch{return reply(400,{error:'Invalid request.'});}
 if(!/^ctok_[A-Za-z0-9_-]{5,200}$/.test(body.confirmationToken||'')||! /^[a-f0-9-]{36}$/i.test(body.orderId||''))return reply(400,{error:'Invalid payment reference.'});
 // Browser-supplied price, account, product and bump fields are never accepted.
 if(Object.keys(body).some(key=>!['confirmationToken','orderId'].includes(key)))return reply(400,{error:'Unexpected checkout fields.'});
 try{
  const whop=makeClient(env.WHOP_API_KEY);
  const payment=await whop.payments.create({account_id:ACCOUNT,plan_id:PLAN,confirmation_token:body.confirmationToken,return_url:origin+'/return.html?order='+encodeURIComponent(body.orderId),metadata:{order_id:body.orderId,source:'readbound-checkout'}},{headers:{'Idempotency-Key':createHash('sha256').update(body.confirmationToken).digest('hex')}});
  return reply(200,{id:payment.id,status:payment.status,client_secret:payment.client_secret});
 }catch{return reply(502,{error:'We could not confirm this payment. Check Whop for its status before trying again.'});}
}
export default (request)=>handle(request);
