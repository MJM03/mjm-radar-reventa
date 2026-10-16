const rows=window.RADAR_ROWS;
const winners=window.RADAR_WINNERS;
const knownPhotos={
'MG5730_15':'https://media.falabella.com/falabellaCO/3478163_1/w=800,h=800,fit=pad','CSTY1B01G2WF':'https://down-my.img.susercontent.com/file/sg-11134202-7reok-m1r6nq6l7u4o69','STIA-B09NB':'https://static.fnac-static.com/multimedia/Images/PT/NR/b1/0b/76/7736241/1520-1.jpg','MXT92ZM-A':'https://www.24hshop.no/pub_images/original/113298-3.jpg','JBLVBUDSBLKAM':'https://img-cdn.heureka.group/v1/02fa4b52-4ce2-4dad-bbd3-b259c1802644.jpg?height=400&width=400','B07FKR6KXF':'https://cf.shopee.vn/file/863888c28b8b48202d609c26127c0215','OTTOMICONSMINI':'https://www.cdiscount.com/pdt2/9/0/8/1/700x700/aih1703960163908/rw/black-64g-console-de-jeu-video-retro-sans-fil-po.jpg','HM350PLH20':'https://res.cloudinary.com/evoleska/images/e_trim:0:white/q_auto,c_lpad,ar_1,f_auto,b_white/w_735/v1666074596/product/x1542710/philips-hue-white-e27-edisonla.jpg','14273':'https://resources.claroshop.com/medios-plazavip/mkt/63c0302b9ed0b_3jpg.jpg?qlty=75&scale=500'};
const money=n=>'S/'+Number(n).toFixed(2);
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const marketplace=q=>'https://www.facebook.com/marketplace/search/?query='+encodeURIComponent(q);
const mercadolibre=q=>'https://listado.mercadolibre.com.pe/'+encodeURIComponent(q).replace(/%20/g,'-');
const bingPhoto=p=>'https://tse2.mm.bing.net/th?q='+encodeURIComponent((p.brand+' '+p.name+' '+p.code).slice(0,150))+'&w=500&h=500&c=7&rs=1&p=0';
const fallbackFor=p=>/TABLET|IPAD|CEL /.test(p.name)?'📱':/AUDIFONO/.test(p.name)?'🎧':/CASE|ESTUCHE|PROTECTOR/.test(p.name)?'🛡️':/CAMARA/.test(p.name)?'📷':/FOCO|LAMPARA/.test(p.name)?'💡':/WATCH|RELOJ/.test(p.name)?'⌚':/CONSOLA|GAME/.test(p.name)?'🎮':'📦';
const photoVerified=p=>Boolean(knownPhotos[p.code]);
const imageBlock=p=>`<div class="photo"><img src="${safe(knownPhotos[p.code]||bingPhoto(p))}" alt="${safe(p.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="fallback">${fallbackFor(p)}</span><small class="${photoVerified(p)?'verified':'unverified'}">${photoVerified(p)?'✓ Foto verificada':'⚠ Foto por verificar'}</small></div>`;

const winnerManualRisks={
  'MG5730_15':[['medium','Revisar los 11 accesorios']],
  'CSTY1B01G2WF':[['medium','Probar conexión y fuente']],
  'JBLVBUDSBLKAM':[['medium','Revisar batería y sellos']],
  'HM350PLH20':[['medium','Requiere ecosistema Hue']],
  '14273':[['medium','Verificar originalidad']],
  'OTTOMICONSMINI':[['medium','Producto genérico'],['medium','Probar mandos y HDMI']],
  'STIA-B09NB':[['medium','Modelo anterior'],['medium','Revisar batería']],
  'B07FKR6KXF':[['high','Posible reacondicionado'],['high','Modelo antiguo']],
  'MXT92ZM-A':[['high','Compatibilidad muy específica'],['medium','Demanda limitada']]
};
const levelRank={low:1,medium:2,high:3};
const levelName={low:'bajo',medium:'medio',high:'alto'};
function riskInfo(p,isWinner=false,storeCount=0){
  const seed=isWinner?(winnerManualRisks[p.code]||[]):[];
  const alerts=seed.map(([level,label])=>({level,label}));
  const text=(p.name+' '+p.family+' '+p.code).toUpperCase();
  const stock=Number(p.stock??p.qty??0);
  if(!photoVerified(p))alerts.push({level:'medium',label:'Foto no confirmada'});
  if(stock<=1)alerts.push({level:'medium',label:'Solo 1 unidad'});
  if(storeCount===1)alerts.push({level:'medium',label:'Disponible en una tienda'});
  if(/CASE|ESTUCHE|FOLIO|PROTECTOR/.test(text))alerts.push({level:'high',label:'Compatibilidad específica'});
  if(/2016|2017|2018|2019|2020|2021|FIRE 7/.test(text))alerts.push({level:'medium',label:'Modelo antiguo'});
  if(/REACOND|REFURB|RFBA/.test(text))alerts.push({level:'high',label:'Posible reacondicionado'});
  if(/TWS|SMARTWATCH|SMARTBAND|DRONE|SCOOTER|BATERIA|POWER BANK/.test(text))alerts.push({level:'medium',label:'Revisar batería'});
  if(/DRONE|SCOOTER|HOVERBOARD|BICICLETA ELECTR/.test(text))alerts.push({level:'high',label:'Probar antes de comprar'});
  if(!isWinner)alerts.push({level:'medium',label:'Reventa sin contrastar'});
  const unique=[...new Map(alerts.map(a=>[a.label,a])).values()];
  if(!unique.length)unique.push({level:'low',label:'Sin alerta crítica'});
  const level=unique.reduce((max,a)=>levelRank[a.level]>levelRank[max]?a.level:max,'low');
  return {level,alerts:unique};
}
const riskHtml=info=>`<div class="riskbox"><span class="alert ${info.level} risk-level">Riesgo ${levelName[info.level]}</span>${info.alerts.slice(0,4).map(a=>`<span class="alert ${a.level}">${safe(a.label)}</span>`).join('')}</div>`;

const grouped=[...rows.reduce((map,r)=>{if(!map.has(r.code))map.set(r.code,{...r,stores:[],stock:0,min:r.price});const p=map.get(r.code);p.stores.push(r);p.stock+=Number(r.qty)||0;p.min=Math.min(p.min,r.price);return map},new Map()).values()];
const winnerCodes=new Set(winners.map(w=>w.code));
const catalog=grouped.filter(p=>!winnerCodes.has(p.code));

function renderWinners(){
  const q=document.getElementById('winnerSearch').value.trim().toLowerCase();
  const sort=document.getElementById('winnerSort').value;
  const priority=new Map(winners.map((w,i)=>[w.code,i]));
  const list=winners.filter(w=>(w.name+' '+w.brand+' '+w.code).toLowerCase().includes(q));
  list.sort((a,b)=>sort==='gain'?(b.target-b.price)-(a.target-a.price):sort==='roi'?((b.target-b.price)/b.price)-((a.target-a.price)/a.price):sort==='cheap'?a.price-b.price:priority.get(a.code)-priority.get(b.code));
  document.getElementById('winners').innerHTML=list.map(w=>{
    const options=rows.filter(r=>r.code===w.code).sort((a,b)=>a.price-b.price);
    const gain=w.target-w.price;const risk=riskInfo(w,true,options.length);
    return `<article class="card winner">${imageBlock(w)}<div class="inside"><div class="chips"><span class="chip">${safe(w.brand)}</span><span class="chip">Rotación ${safe(w.velocity)}</span><span class="chip">${options.length} tienda(s)</span></div><h3>${safe(w.name)}</h3><div class="price-row"><span class="buy">Compra ${money(w.price)}</span><span class="market">Regular ${money(w.regular)}</span></div><div class="resale"><span class="meta">Precio competitivo recomendado</span><br><strong>${money(w.target)}</strong> <span class="gain">+${money(gain)} bruto · ${Math.round(gain/w.price*100)}%</span></div>${riskHtml(risk)}<p class="photo-note">✓ Imagen contrastada por marca, modelo y SKU.</p><p class="meta"><b>Referencia online:</b> ${money(w.market)} · ${safe(w.marketLabel)}</p><p class="meta"><b>Mejor tienda:</b> ${safe(w.store)} (${safe(w.shopcode)}) · stock ${w.qty}</p><details class="stores"><summary>Ver ${options.length} tienda(s)</summary>${options.map(r=>`${safe(r.store)} · ${money(r.price)} · stock ${r.qty}`).join('<br>')}</details><p class="meta">${safe(w.note)}</p><div class="actions"><a href="${safe(w.marketUrl)}" target="_blank" rel="noopener">Ver referencia ↗</a><a href="${marketplace(w.brand+' '+w.code)}" target="_blank" rel="noopener">Marketplace ↗</a><a href="${mercadolibre(w.brand+' '+w.code)}" target="_blank" rel="noopener">Mercado Libre ↗</a></div></div></article>`;
  }).join('')||'<div class="empty">No encontré ganadores con esa búsqueda.</div>';
}

const PAGE_SIZE=24;let page=1;let filtered=[];
function getFiltered(){
  const q=document.getElementById('search').value.trim().toLowerCase();
  const cat=document.getElementById('category').value;const max=+document.getElementById('max').value;const sort=document.getElementById('catalogSort').value;const risk=document.getElementById('risk').value;
  const list=catalog.filter(p=>p.min<=max&&(!cat||p.category===cat)&&(!risk||riskInfo(p,false,p.stores.length).level===risk)&&(!q||(p.name+' '+p.brand+' '+p.code+' '+p.family).toLowerCase().includes(q)));
  return list.sort((a,b)=>sort==='risk'?levelRank[riskInfo(b,false,b.stores.length).level]-levelRank[riskInfo(a,false,a.stores.length).level]:sort==='cheap'?a.min-b.min:sort==='stock'?b.stock-a.stock:sort==='az'?a.name.localeCompare(b.name,'es'):((1-b.min/b.regular)-(1-a.min/a.regular)));
}
function renderCatalog(reset=false){
  if(reset)page=1;filtered=getFiltered();const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));page=Math.min(page,pages);const start=(page-1)*PAGE_SIZE;const list=filtered.slice(start,start+PAGE_SIZE);
  document.getElementById('productCount').textContent=catalog.length.toLocaleString('es-PE');
  document.getElementById('catalogGrid').innerHTML=list.map(p=>{const discount=p.regular?Math.round((1-p.min/p.regular)*100):0;const stores=[...p.stores].sort((a,b)=>a.price-b.price);const risk=riskInfo(p,false,stores.length);return `<article class="card">${imageBlock(p)}<div class="inside"><div class="chips"><span class="chip">${safe(p.brand)}</span><span class="chip">${safe(p.category)}</span><span class="chip">-${discount}%</span></div><h3>${safe(p.name)}</h3><div class="price-row"><span class="buy">${money(p.min)}</span><span class="market"><del>${money(p.regular)}</del></span></div>${riskHtml(risk)}<p class="photo-note">⚠ Imagen obtenida por coincidencia visual. Confirma el SKU antes de comprar o publicar.</p><p class="meta"><b>SKU:</b> ${safe(p.code)} · <b>Stock total:</b> ${p.stock} · ${stores.length} tienda(s)</p><details class="stores"><summary>Ver disponibilidad</summary>${stores.map(r=>`${safe(r.store)} (${safe(r.shopcode)}) · ${money(r.price)} · stock ${r.qty}`).join('<br>')}</details><div class="actions"><a href="${marketplace(p.brand+' '+p.code)}" target="_blank" rel="noopener">Comparar ↗</a><a href="${mercadolibre(p.brand+' '+p.code)}" target="_blank" rel="noopener">Mercado Libre ↗</a></div></div></article>`}).join('')||'<div class="empty">No hay productos con esos filtros.</div>';
  document.getElementById('pageInfo').textContent=`Página ${page} de ${pages} · ${filtered.length} productos`;
  document.getElementById('prev').disabled=page<=1;document.getElementById('next').disabled=page>=pages;
  document.getElementById('next').style.display=pages<=1?'none':'';document.getElementById('prev').style.display=pages<=1?'none':'';
}
const categories=[...new Set(catalog.map(p=>p.category))].sort((a,b)=>a.localeCompare(b,'es'));
document.getElementById('category').innerHTML+=categories.map(c=>`<option value="${safe(c)}">${safe(c)}</option>`).join('');
document.getElementById('winnerSearch').addEventListener('input',renderWinners);document.getElementById('winnerSort').addEventListener('change',renderWinners);
['search','category','max','risk','catalogSort'].forEach(id=>document.getElementById(id).addEventListener(id==='search'?'input':'change',()=>renderCatalog(true)));
document.getElementById('prev').addEventListener('click',()=>{if(page>1){page--;renderCatalog();document.getElementById('catalogo').scrollIntoView()}});document.getElementById('next').addEventListener('click',()=>{if(page*PAGE_SIZE<filtered.length){page++;renderCatalog();document.getElementById('catalogo').scrollIntoView()}});
renderWinners();renderCatalog(true);