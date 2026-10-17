/* ===== Settings: change these for your hotel ===== */
const CONFIG={hotel:'Hotel Annapurna',upi:'annapurna@upi',payee:'Hotel Annapurna',gst:0.05,table:7};

const MENU=[
{id:1,cat:'Starters',name:'Paneer Tikka',desc:'Charred cottage cheese, mint chutney',price:240,veg:1,e:'🧀'},
{id:2,cat:'Starters',name:'Chicken 65',desc:'Crisp, spicy South Indian fry',price:260,veg:0,e:'🍗'},
{id:3,cat:'Starters',name:'Gobi Manchurian',desc:'Crunchy cauliflower in tangy sauce',price:190,veg:1,e:'🥦'},
{id:4,cat:'Mains',name:'Butter Chicken',desc:'Creamy tomato gravy, tender chicken',price:320,veg:0,e:'🍛'},
{id:5,cat:'Mains',name:'Paneer Butter Masala',desc:'Rich, mildly sweet and creamy',price:280,veg:1,e:'🥘'},
{id:6,cat:'Mains',name:'Veg Biryani',desc:'Basmati, vegetables, raita on the side',price:230,veg:1,e:'🍚'},
{id:7,cat:'Mains',name:'Chicken Biryani',desc:'Dum-cooked, served with raita',price:290,veg:0,e:'🍲'},
{id:8,cat:'Breads',name:'Butter Naan',desc:'Soft tandoor bread',price:55,veg:1,e:'🫓'},
{id:9,cat:'Breads',name:'Masala Dosa',desc:'Crisp crepe, potato filling, sambar',price:120,veg:1,e:'🌯'},
{id:10,cat:'Drinks',name:'Masala Chai',desc:'Ginger and cardamom',price:40,veg:1,e:'☕'},
{id:11,cat:'Drinks',name:'Fresh Lime Soda',desc:'Sweet or salted',price:70,veg:1,e:'🍋'},
{id:12,cat:'Drinks',name:'Gulab Jamun',desc:'Two warm pieces in syrup',price:90,veg:1,e:'🍮'}
];
const CATS=['All',...new Set(MENU.map(m=>m.cat))];
const STAGES=[['Order received','The kitchen has your order'],['Preparing','Your food is being cooked'],['Served','Enjoy your meal']];
const state={cart:{},cat:'All',q:'',stage:0,order:null,timer:null};
const $=id=>document.getElementById(id),inr=n=>'₹'+n.toLocaleString('en-IN',{maximumFractionDigits:2});

function go(n){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('on',s.id==='s-'+n));window.scrollTo(0,0)}
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1800)}
function totals(){const sub=Object.entries(state.cart).reduce((s,[id,q])=>s+MENU.find(m=>m.id==id).price*q,0);const tax=Math.round(sub*CONFIG.gst*100)/100;return{sub,tax,total:sub+tax,count:Object.values(state.cart).reduce((a,b)=>a+b,0)}}
function bill(t){return `<div class="line"><span>Subtotal</span><span>${inr(t.sub)}</span></div><div class="line"><span>GST (${CONFIG.gst*100}%)</span><span>${inr(t.tax)}</span></div><div class="line total"><span>Total</span><span>${inr(t.total)}</span></div>`}

/* scan */
$('hotelName').textContent=CONFIG.hotel;$('tableChip').textContent='Table '+CONFIG.table;
$('scanBtn').onclick=()=>{const b=$('scanBtn');b.disabled=true;$('scanMsg').textContent='Reading QR code…';
  setTimeout(()=>{$('finder').classList.add('done');$('scanMsg').textContent='Table '+CONFIG.table+' found. Opening menu…';setTimeout(()=>{go('menu');renderMenu()},900)},1500)};

/* menu */
function renderMenu(){
  $('chips').innerHTML=CATS.map(c=>`<button class="chip ${c===state.cat?'on':''}" data-cat="${c}">${c}</button>`).join('');
  const q=state.q.toLowerCase();
  const items=MENU.filter(m=>(state.cat==='All'||m.cat===state.cat)&&m.name.toLowerCase().includes(q));
  $('list').innerHTML=items.length?items.map(m=>{const n=state.cart[m.id]||0;
    return `<div class="item"><div class="thumb">${m.e}</div><div class="info"><h3><span class="dot ${m.veg?'':'nv'}"></span>${m.name}</h3><p>${m.desc}</p>
    <div class="row"><span class="price">${inr(m.price)}</span>${n?`<div class="step"><button data-m="${m.id}" data-d="-1" aria-label="Remove one ${m.name}">−</button><span>${n}</span><button data-m="${m.id}" data-d="1" aria-label="Add one ${m.name}">+</button></div>`:`<button class="add" data-m="${m.id}" data-d="1">Add</button>`}</div></div></div>`}).join(''):'<p class="muted" style="padding:24px 0">No dishes match your search. Try another name.</p>';
  const t=totals();$('cartWrap').hidden=!t.count;$('cartCount').textContent=t.count+(t.count>1?' items':' item');$('cartTotal').textContent='View order · '+inr(t.total);
}
function change(id,d){const n=(state.cart[id]||0)+d;if(n<=0)delete state.cart[id];else state.cart[id]=n;renderMenu();if($('s-cart').classList.contains('on'))renderCart()}
$('chips').onclick=e=>{const c=e.target.dataset.cat;if(c){state.cat=c;renderMenu()}};
$('search').oninput=e=>{state.q=e.target.value;renderMenu()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b)change(b.dataset.m,+b.dataset.d);const g=e.target.closest('[data-go]');if(g){go(g.dataset.go);if(g.dataset.go==='menu')renderMenu()}});

/* cart */
$('openCart').onclick=()=>{renderCart();go('cart')};
function renderCart(){const t=totals();
  if(!t.count){go('menu');renderMenu();return}
  $('cartItems').innerHTML=Object.entries(state.cart).map(([id,q])=>{const m=MENU.find(x=>x.id==id);
    return `<div class="line"><span>${m.name}</span><span class="row" style="gap:12px"><div class="step"><button data-m="${id}" data-d="-1" aria-label="Remove one ${m.name}">−</button><span>${q}</span><button data-m="${id}" data-d="1" aria-label="Add one ${m.name}">+</button></div><b style="min-width:64px;text-align:right">${inr(m.price*q)}</b></span></div>`}).join('');
  $('bill').innerHTML=bill(t)}

/* order */
$('placeBtn').onclick=()=>{const t=totals();
  state.order={id:'ORD'+Math.floor(1000+Math.random()*9000),items:Object.entries(state.cart).map(([id,q])=>({...MENU.find(m=>m.id==id),q})),t,note:$('note').value.trim()};
  state.stage=0;renderStatus();go('status');clearInterval(state.timer);
  state.timer=setInterval(()=>{if(state.stage<2){state.stage++;renderStatus()}else clearInterval(state.timer)},4500)};
function renderStatus(){const o=state.order,s=state.stage;
  $('statusTitle').textContent=s===2?'Your food is served':'Order placed';
  $('orderMeta').textContent=o.id+' · Table '+CONFIG.table;
  $('track').innerHTML=STAGES.map((x,i)=>`<li class="${i<s||s===2&&i===2?'done':i===s?'now':''}"><span class="pip">${i<s||s===2&&i===2?'✓':''}</span><span>${x[0]}<small>${x[1]}</small></span></li>`).join('');
  $('summary').innerHTML=o.items.map(i=>`<div class="line"><span>${i.q} × ${i.name}</span><span>${inr(i.price*i.q)}</span></div>`).join('')+bill(o.t)+(o.note?`<p class="muted">Note: ${o.note.replace(/</g,'&lt;')}</p>`:'');
  const p=$('payBtn');p.disabled=s<2;p.textContent=s<2?'Pay after your food is served':'Pay '+inr(o.t.total)+' with UPI'}
$('payBtn').onclick=()=>{$('payAmt').textContent=inr(state.order.t.total);$('payTo').textContent='to '+CONFIG.payee;$('upiId').textContent=CONFIG.upi;go('pay')};

/* UPI */
function upiLink(app){const a=state.order.t.total.toFixed(2);
  const q=`pa=${encodeURIComponent(CONFIG.upi)}&pn=${encodeURIComponent(CONFIG.payee)}&am=${a}&cu=INR&tn=${encodeURIComponent('Table '+CONFIG.table+' '+state.order.id)}&tr=${state.order.id}`;
  const base={gpay:'tez://upi/pay',phonepe:'phonepe://pay',paytm:'paytmmp://pay',any:'upi://pay'}[app];return base+'?'+q}
document.querySelectorAll('[data-app]').forEach(b=>b.onclick=()=>{toast('Opening UPI app…');window.location.href=upiLink(b.dataset.app)});
$('copyUpi').onclick=()=>{try{navigator.clipboard.writeText(CONFIG.upi);toast('UPI ID copied')}catch(e){toast('Copy not available. Select the ID manually.')}};
$('paidBtn').onclick=()=>{const o=state.order;$('doneMsg').textContent=inr(o.t.total)+' paid to '+CONFIG.payee+'. Thank you!';
  $('receipt').innerHTML=`<div class="line"><span>Order</span><b>${o.id}</b></div><div class="line"><span>Table</span><b>${CONFIG.table}</b></div><div class="line"><span>Paid via</span><b>UPI</b></div><div class="line"><span>Time</span><b>${new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</b></div>`+bill(o.t);go('done')};
$('newBtn').onclick=()=>{state.cart={};state.order=null;$('note').value='';go('menu');renderMenu()};
