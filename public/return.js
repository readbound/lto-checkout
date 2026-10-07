// Display only: never grant access or deliver paid downloads from URL parameters.
const query=new URLSearchParams(location.search),status=query.get('status');history.replaceState({},'',location.pathname);
const title=document.querySelector('#title'),message=document.querySelector('#message');
if(status==='succeeded'){title.textContent='Thank you for your order.';message.textContent='Your payment flow completed. Sign in to Whop with your purchase email to check your access and receipt.';sessionStorage.removeItem('readbound-order');}
else if(status==='failed'||status==='canceled'){title.textContent='Your payment wasn’t completed.';message.textContent='Check your payment status in Whop before starting another attempt. You can return to checkout when you’re ready.';}
else{title.textContent='Your payment is still being confirmed.';message.textContent='Check Whop for your final payment status and receipt. Please avoid starting another payment while this one is pending.';}
