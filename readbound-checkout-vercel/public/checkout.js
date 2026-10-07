const button=document.querySelector('#pay'),error=document.querySelector('#error'),email=document.querySelector('#email'),name=document.querySelector('#name');
const params=new URLSearchParams(location.search);
email.value=(params.get('email')||'').slice(0,254);name.value=(params.get('name')||'').slice(0,100);
if(params.has('email')||params.has('name'))history.replaceState({},'',location.pathname);
const orderId=sessionStorage.getItem('readbound-order')||crypto.randomUUID();sessionStorage.setItem('readbound-order',orderId);
let ready=false,busy=false;
const sync=()=>{button.disabled=!ready||busy||!email.validity.valid||!email.value;};email.addEventListener('input',sync);
function go(status,id){location.assign('/return.html?'+new URLSearchParams({status,payment:id,order:orderId}));}
try{
 if(!window.WhopElements)throw new Error('Secure payment options could not load. Please refresh or use Whop’s checkout below.');
 const whop=window.WhopElements();
 const payments=whop.payments.create({accountId:'biz_le2xpTfOF4nBmA',plan:'plan_9OdViY3cuqEzT',returnUrl:location.origin+'/return.html?order='+encodeURIComponent(orderId)});
 document.querySelector('#payment').replaceChildren();
 payments.create('payment',{fields:{billingDetails:'full'},onChange:event=>{ready=event.complete;sync();},onError:()=>{error.textContent='Payment options could not load. Please refresh or use Whop’s checkout below.';}}).mount('#payment');
 payments.create('branding').mount('#branding');
 button.addEventListener('click',async()=>{
  if(busy||!ready||!email.reportValidity())return;
  busy=true;sync();error.textContent='';button.textContent='Processing securely…';
  try{
   const {confirmationToken}=await payments.createConfirmationToken({billingDetails:{email:email.value.trim()}});
   const response=await fetch('/api/pay',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmationToken,orderId})});
   const payment=await response.json();if(!response.ok)throw new Error(payment.error||'We could not confirm the payment. Please try again.');
   if(payment.status==='paid')return go('succeeded',payment.id);
   const result=await whop.payments.handleNextAction({clientSecret:payment.client_secret});
   if(result.redirected)return;
   if(result.status==='succeeded'||result.status==='processing')return go(result.status,payment.id);
   throw new Error(result.lastPaymentError?.message||'The payment step wasn’t completed. Please try again.');
  }catch(e){error.textContent=e.message||'Something went wrong. Please try again.';}
  finally{busy=false;button.textContent='Complete my order →';sync();}
 });
}catch(e){error.textContent=e.message;}
