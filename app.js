const baseRows=window.RADAR_ROWS;
let rows=baseRows;
const baseWinners=window.RADAR_WINNERS;
let winners=baseWinners.map(w=>({...w}));
const knownPhotos={
'MG5730_15':'https://media.falabella.com/falabellaCO/3478163_1/w=800,h=800,fit=pad','CSTY1B01G2WF':'https://down-my.img.susercontent.com/file/sg-11134202-7reok-m1r6nq6l7u4o69','STIA-B09NB':'https://static.fnac-static.com/multimedia/Images/PT/NR/b1/0b/76/7736241/1520-1.jpg','MXT92ZM-A':'https://www.24hshop.no/pub_images/original/113298-3.jpg','JBLVBUDSBLKAM':'https://img-cdn.heureka.group/v1/02fa4b52-4ce2-4dad-bbd3-b259c1802644.jpg?height=400&width=400','B07FKR6KXF':'https://cf.shopee.vn/file/863888c28b8b48202d609c26127c0215','OTTOMICONSMINI':'https://www.cdiscount.com/pdt2/9/0/8/1/700x700/aih1703960163908/rw/black-64g-console-de-jeu-video-retro-sans-fil-po.jpg','HM350PLH20':'https://res.cloudinary.com/evoleska/images/e_trim:0:white/q_auto,c_lpad,ar_1,f_auto,b_white/w_735/v1666074596/product/x1542710/philips-hue-white-e27-edisonla.jpg','14273':'https://resources.claroshop.com/medios-plazavip/mkt/63c0302b9ed0b_3jpg.jpg?qlty=75&scale=500'};
const money=n=>'S/'+Number(n).toFixed(2);
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const marketplace=q=>'https://www.facebook.com/marketplace/search/?query='+encodeURIComponent(q);
const mercadolibre=q=>'https://listado.mercadolibre.com.pe/'+encodeURIComponent(q).replace(/%20/g,'-');
const bingPhoto=p=>'https://tse2.mm.bing.net/th?q='+encodeURIComponent((p.brand+' '+p.name+' '+p.code).slice(0,150))+'&w=500&h=500&c=7&rs=1&p=0';
const fallbackFor=p=>/TABLET|IPAD|CEL /.test(p.name)?'📱':/AUDIFONO/.test(p.name)?'🎧':/CASE|ESTUCHE|PROTECTOR/.test(p.name)?'🛡️':/CAMARA/.test(p.name)?'📷':/FOCO|LAMPARA/.test(p.name)?'💡':/WATCH|RELOJ/.test(p.name)?'⌚':/CONSOLA|GAME/.test(p.name)?'🎮':'📦';
const photoVerified=p=>Boolean(p.image||knownPhotos[p.code]);
const imageBlock=p=>`<div class="photo"><img src="${safe(p.image||knownPhotos[p.code]||bingPhoto(p))}" alt="${safe(p.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="fallback">${fallbackFor(p)}</span><small class="${photoVerified(p)?'verified':'unverified'}">${photoVerified(p)?'✓ Foto verificada':'⚠ Foto por verificar'}</small></div>`;

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

let grouped=[];let catalog=[];
function rebuildData(){
  grouped=[...rows.reduce((map,r)=>{if(!map.has(r.code))map.set(r.code,{...r,stores:[],stock:0,min:r.price});const p=map.get(r.code);p.stores.push(r);p.stock+=Number(r.qty)||0;p.min=Math.min(p.min,r.price);if(!p.image&&r.image)p.image=r.image;return map},new Map()).values()];
  const byCode=new Map(grouped.map(p=>[p.code,p]));
  winners=baseWinners.filter(w=>byCode.has(w.code)).map(w=>{const p=byCode.get(w.code);const best=[...p.stores].sort((a,b)=>a.price-b.price)[0];return {...w,price:best.price,regular:best.regular||w.regular,store:best.store,shopcode:best.shopcode,qty:best.qty,image:best.image||w.image};});
  const winnerCodes=new Set(winners.map(w=>w.code));
  catalog=grouped.filter(p=>!winnerCodes.has(p.code));
}

const STORAGE_KEY='mjmRadarImportedCatalogV1';
const headerAliases={
  code:['codigo','código','sku','cod producto','codigo producto','codigo articulo','cod articulo','item','material'],
  name:['producto','descripcion','descripción','nombre','nombre producto','descripcion producto','articulo','artículo'],
  brand:['marca','brand','fabricante'],
  category:['categoria','categoría','linea','línea','departamento'],
  family:['familia','subfamilia','sub familia','tipo'],
  store:['tienda','local','sucursal','nombre tienda','nombre local','almacen','almacén'],
  shopcode:['codigo tienda','código tienda','cod tienda','codigo local','código local','cod local','tienda id','local id','centro'],
  qty:['stock','cantidad','cant','qty','unidades','stock actual','saldo','disponible'],
  price:['precio','precio oferta','precio liquidacion','precio liquidación','precio venta','oferta','p oferta','valor'],
  regular:['precio regular','pvp','precio original','precio lista','regular'],
  image:['imagen','foto','url imagen','url foto','image','image url']
};
const normalizeHeader=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const normalizedAliases=Object.fromEntries(Object.entries(headerAliases).map(([key,list])=>[key,list.map(normalizeHeader)]));
function mapHeaders(headers){
  const normalized=headers.map(normalizeHeader);const used=new Set();const mapping={};
  for(const key of ['shopcode','regular','image','code','name','brand','category','family','store','qty','price']){
    let index=normalized.findIndex((h,i)=>!used.has(i)&&normalizedAliases[key].includes(h));
    if(index<0)index=normalized.findIndex((h,i)=>!used.has(i)&&normalizedAliases[key].some(a=>a.length>3&&(h.includes(a)||a.includes(h))));
    if(index>=0){mapping[key]=index;used.add(index)}
  }
  return mapping;
}
function detectTable(matrix){
  let best={score:-1,row:0,mapping:{}};
  matrix.slice(0,20).forEach((line,row)=>{const mapping=mapHeaders(line);const score=(mapping.code!==undefined?5:0)+(mapping.name!==undefined?5:0)+(mapping.price!==undefined?2:0)+(mapping.store!==undefined?2:0)+(mapping.qty!==undefined?1:0)+Object.keys(mapping).length*.1;if(score>best.score)best={score,row,mapping}});
  if(best.mapping.code===undefined||best.mapping.name===undefined)throw new Error('No pude detectar las columnas de código/SKU y producto/descripción. Usa la plantilla CSV.');
  return best;
}
function numberValue(value){
  if(typeof value==='number')return Number.isFinite(value)?value:0;
  let text=String(value??'').trim().replace(/S\/?/gi,'').replace(/\s/g,'').replace(/[^0-9,.-]/g,'');if(!text)return 0;
  const comma=text.lastIndexOf(','),dot=text.lastIndexOf('.');
  if(comma>=0&&dot>=0)text=comma>dot?text.replace(/\./g,'').replace(',','.'):text.replace(/,/g,'');
  else if(comma>=0)text=/,\d{1,2}$/.test(text)?text.replace(',','.'):text.replace(/,/g,'');
  const number=Number(text);return Number.isFinite(number)?number:0;
}
function rowsFromMatrix(matrix){
  const {row,mapping}=detectTable(matrix);const value=(line,key)=>mapping[key]===undefined?'':line[mapping[key]];
  const normalized=matrix.slice(row+1).map((line,index)=>{
    const code=String(value(line,'code')??'').trim();const name=String(value(line,'name')??'').trim();if(!code||!name)return null;
    const store=String(value(line,'store')||'Sin tienda').trim();const price=numberValue(value(line,'price'));const regular=numberValue(value(line,'regular'))||price;
    return {code,name,brand:String(value(line,'brand')||'SIN MARCA').trim(),category:String(value(line,'category')||'SIN CATEGORÍA').trim(),family:String(value(line,'family')||value(line,'category')||'SIN FAMILIA').trim(),store,shopcode:String(value(line,'shopcode')||store).trim(),qty:numberValue(value(line,'qty')),price,regular,image:String(value(line,'image')||'').trim(),sourceRow:row+index+2};
  }).filter(Boolean);
  if(!normalized.length)throw new Error('El archivo no contiene productos válidos debajo de los encabezados.');
  return {rows:normalized,mapping};
}
function parseCSV(text){
  text=String(text).replace(/^\uFEFF/,'');const sample=text.split(/\r?\n/).slice(0,8).join('\n');const delimiters=[',',';','\t'];const delimiter=delimiters.map(d=>[d,(sample.match(new RegExp(d==='\t'?'\\t':'\\'+d,'g'))||[]).length]).sort((a,b)=>b[1]-a[1])[0][0];
  const matrix=[];let row=[];let cell='';let quoted=false;
  for(let i=0;i<text.length;i++){const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}else if(ch===delimiter&&!quoted){row.push(cell);cell=''}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>String(v).trim()))matrix.push(row);row=[];cell=''}else cell+=ch}
  row.push(cell);if(row.some(v=>String(v).trim()))matrix.push(row);return matrix;
}
async function matrixFromFile(file){
  if(/\.csv$/i.test(file.name)||file.type==='text/csv')return parseCSV(await file.text());
  if(typeof XLSX==='undefined')throw new Error('No se pudo cargar el lector de Excel. Intenta nuevamente o exporta el archivo como CSV.');
  const workbook=XLSX.read(await file.arrayBuffer(),{type:'array'});let best=null;
  for(const sheetName of workbook.SheetNames){const matrix=XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{header:1,defval:'',raw:true});try{const detected=detectTable(matrix);if(!best||detected.score>best.score)best={matrix,score:detected.score,sheetName}}catch{}}
  if(!best)throw new Error('No encontré una hoja con columnas de código/SKU y producto/descripción.');return best.matrix;
}
function setImportStatus(message,type=''){const node=document.getElementById('importStatus');node.textContent=message;node.className='import-status '+type}
function populateFilters(){
  const categorySelect=document.getElementById('category');const storeSelect=document.getElementById('store');const selectedCategory=categorySelect.value;const selectedStore=storeSelect.value;
  const categories=[...new Set(catalog.map(p=>p.category))].sort((a,b)=>a.localeCompare(b,'es'));categorySelect.innerHTML='<option value="">Todas las categorías</option>'+categories.map(c=>`<option value="${safe(c)}">${safe(c)}</option>`).join('');
  const stores=[...new Map(rows.map(r=>[r.shopcode,{code:r.shopcode,name:r.store}])).values()].sort((a,b)=>a.name.localeCompare(b.name,'es')||a.code.localeCompare(b.code,'es'));storeSelect.innerHTML='<option value="">Todas las tiendas</option>'+stores.map(s=>`<option value="${safe(s.code)}">${safe(s.name)} (${safe(s.code)})</option>`).join('');
  if([...categorySelect.options].some(o=>o.value===selectedCategory))categorySelect.value=selectedCategory;if([...storeSelect.options].some(o=>o.value===selectedStore))storeSelect.value=selectedStore;
}
function applyRows(nextRows,fileName='',persist=false){
  rows=nextRows;rebuildData();populateFilters();renderWinners();renderCatalog(true);document.getElementById('restoreData').hidden=rows===baseRows;
  document.querySelector('.updated').textContent=fileName?`Datos locales · ${fileName}`:'Precios contrastados · 15/10/2026';
  if(persist){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({name:fileName,rows:nextRows}))}catch{setImportStatus('Catálogo cargado, pero el navegador no pudo guardarlo para la próxima visita.','error');return}}
  setImportStatus(fileName?`${nextRows.length.toLocaleString('es-PE')} filas cargadas desde ${fileName}.`:'Usando el catálogo publicado.','ok');
}

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
  const store=document.getElementById('store').value;const cat=document.getElementById('category').value;const max=+document.getElementById('max').value;const sort=document.getElementById('catalogSort').value;const risk=document.getElementById('risk').value;
  const list=catalog.filter(p=>p.min<=max&&(!store||p.stores.some(r=>r.shopcode===store))&&(!cat||p.category===cat)&&(!risk||riskInfo(p,false,p.stores.length).level===risk)&&(!q||(p.name+' '+p.brand+' '+p.code+' '+p.family).toLowerCase().includes(q)));
  return list.sort((a,b)=>sort==='risk'?levelRank[riskInfo(b,false,b.stores.length).level]-levelRank[riskInfo(a,false,a.stores.length).level]:sort==='cheap'?a.min-b.min:sort==='stock'?b.stock-a.stock:sort==='az'?a.name.localeCompare(b.name,'es'):((b.regular?1-b.min/b.regular:0)-(a.regular?1-a.min/a.regular:0)));
}
function renderCatalog(reset=false){
  if(reset)page=1;filtered=getFiltered();const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));page=Math.min(page,pages);const start=(page-1)*PAGE_SIZE;const list=filtered.slice(start,start+PAGE_SIZE);
  document.getElementById('productCount').textContent=catalog.length.toLocaleString('es-PE');
  document.getElementById('catalogGrid').innerHTML=list.map(p=>{const discount=p.regular?Math.round((1-p.min/p.regular)*100):0;const stores=[...p.stores].sort((a,b)=>a.price-b.price);const risk=riskInfo(p,false,stores.length);return `<article class="card">${imageBlock(p)}<div class="inside"><div class="chips"><span class="chip">${safe(p.brand)}</span><span class="chip">${safe(p.category)}</span><span class="chip">-${discount}%</span></div><h3>${safe(p.name)}</h3><div class="price-row"><span class="buy">${money(p.min)}</span><span class="market"><del>${money(p.regular)}</del></span></div>${riskHtml(risk)}<p class="photo-note">⚠ Imagen obtenida por coincidencia visual. Confirma el SKU antes de comprar o publicar.</p><p class="meta"><b>SKU:</b> ${safe(p.code)} · <b>Stock total:</b> ${p.stock} · ${stores.length} tienda(s)</p><details class="stores"><summary>Ver disponibilidad</summary>${stores.map(r=>`${safe(r.store)} (${safe(r.shopcode)}) · ${money(r.price)} · stock ${r.qty}`).join('<br>')}</details><div class="actions"><a href="${marketplace(p.brand+' '+p.code)}" target="_blank" rel="noopener">Comparar ↗</a><a href="${mercadolibre(p.brand+' '+p.code)}" target="_blank" rel="noopener">Mercado Libre ↗</a></div></div></article>`}).join('')||'<div class="empty">No hay productos con esos filtros.</div>';
  document.getElementById('pageInfo').textContent=`Página ${page} de ${pages} · ${filtered.length} productos`;
  document.getElementById('prev').disabled=page<=1;document.getElementById('next').disabled=page>=pages;
  document.getElementById('next').style.display=pages<=1?'none':'';document.getElementById('prev').style.display=pages<=1?'none':'';
}
document.getElementById('winnerSearch').addEventListener('input',renderWinners);document.getElementById('winnerSort').addEventListener('change',renderWinners);
['search','store','category','max','risk','catalogSort'].forEach(id=>document.getElementById(id).addEventListener(id==='search'?'input':'change',()=>renderCatalog(true)));
document.getElementById('prev').addEventListener('click',()=>{if(page>1){page--;renderCatalog();document.getElementById('catalogo').scrollIntoView()}});document.getElementById('next').addEventListener('click',()=>{if(page*PAGE_SIZE<filtered.length){page++;renderCatalog();document.getElementById('catalogo').scrollIntoView()}});
document.getElementById('dataFile').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;setImportStatus('Leyendo y organizando el archivo…');try{const matrix=await matrixFromFile(file);const parsed=rowsFromMatrix(matrix);applyRows(parsed.rows,file.name,true)}catch(error){setImportStatus(error.message||'No pude procesar el archivo.','error')}finally{event.target.value=''}});
document.getElementById('restoreData').addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);applyRows(baseRows)});
document.getElementById('downloadTemplate').addEventListener('click',()=>{const csv='codigo,nombre,marca,categoria,familia,tienda,codigo_tienda,stock,precio,precio_regular,imagen\nSKU-001,Producto de ejemplo,MARCA,CATEGORIA,FAMILIA,Plaza San Miguel,K11,2,49.90,99.90,https://ejemplo.com/foto.jpg\n';const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='plantilla_radar_reventa.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
rebuildData();populateFilters();
try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(saved?.rows?.length)applyRows(saved.rows,saved.name||'archivo guardado');else{renderWinners();renderCatalog(true)}}catch{localStorage.removeItem(STORAGE_KEY);renderWinners();renderCatalog(true)}