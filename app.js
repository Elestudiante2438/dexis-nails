// ═══════════════════════════════════════════════════
// DEXI'S NAILS — Sistema completo v3
// Arquitectura limpia, un solo archivo, sin iframes
// ═══════════════════════════════════════════════════

// ── UTILS ──
const $ = id => document.getElementById(id);
const toast = (msg,type='success',ms=2800) => {
  const t=$('toast'); t.textContent=msg; t.className=`show ${type}`;
  setTimeout(()=>t.className='',ms);
};
let _audioCtx = null;
function _getACtx(){
  try{
    if(!_audioCtx || _audioCtx.state==='closed')
      _audioCtx = new(window.AudioContext||window.webkitAudioContext)();
    if(_audioCtx.state==='suspended') _audioCtx.resume();
    return _audioCtx;
  }catch(e){ return null; }
}
const beep = (freq=880, dur=.1, vol=.08) => {
  try{
    const a = _getACtx(); if(!a) return;
    const o=a.createOscillator(), g=a.createGain();
    o.type='sine'; o.frequency.value=freq;
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, a.currentTime+dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime+dur);
  }catch(e){}
};
const LS = {
  get:(k,d=[])=>{try{return JSON.parse(localStorage.getItem('dexys_'+k))||d;}catch{return d;}},
  set:(k,v)=>localStorage.setItem('dexys_'+k,JSON.stringify(v)),
};

// ── DATOS BASE ──
const PROFESIONALES_DEFAULT = [
  {id:1,nombre:'Dexi',emoji:'👩',especialidad:'Podología & Manicura',activa:true},
  {id:2,nombre:'Valentina',emoji:'💁',especialidad:'Manicura & Diseños',activa:true},
  {id:3,nombre:'Carolina',emoji:'🙆',especialidad:'Parafina & Facial',activa:true},
];
const HORARIOS = ['9:00','9:45','10:30','11:15','12:00','14:00','14:45','15:30','16:15','17:00','17:45'];
const ADMIN_DEFAULT = [{usuario:'Dario',clave:'dario2026',rol:'admin',tipo:'default'},{usuario:'Antonio',clave:'antonio2026',rol:'admin',tipo:'default'},{usuario:'Decsi',clave:'decsi2026',rol:'admin',tipo:'default'}];

function getProfesionales(){const s=LS.get('profesionales',null);return s||PROFESIONALES_DEFAULT;}
function getReservas(){return LS.get('reservas',[]);}
function getClientes(){return LS.get('clientes',[]);}
function getCompras(){return LS.get('compras',[]);}
function getBloqueos(){return LS.get('bloqueos',[]);}
function getAdminUsers(){
  const extra=LS.get('adminUsers',[]);
  return [...ADMIN_DEFAULT,...extra];
}

// ── INVENTARIO ──
function getInventario(){
  const def = [
    {id:1, nombre:'Agua de Oriente',    tipo:'colonia',  precio:45900, stock:10, svg:'colonia1', desc:'Colonia fresca con notas cítricas y un toque de azahar.', notas:['Limón','Naranja','Azahar'],   foto:''},
    {id:2, nombre:'Brisas de Dubai',    tipo:'colonia',  precio:49900, stock:8,  svg:'colonia2', desc:'Colonia fresca con notas marinas y fondo de almizcle.', notas:['Marina','Almizcle','Madera'], foto:''},
    {id:3, nombre:'Flor de Azahar',     tipo:'colonia',  precio:42500, stock:12, svg:'colonia3', desc:'Colonia floral suave con notas de azahar y neroli.',   notas:['Azahar','Neroli','Miel'],     foto:''},
    {id:4, nombre:'La Bestia Negra',    tipo:'perfume',  precio:89900, stock:5,  svg:'perfume1', desc:'Perfume intenso y profundo con notas amaderadas.',     notas:['Cuero','Almizcle','Ámbar'],  foto:''},
    {id:5, nombre:'Oud Silver',         tipo:'perfume',  precio:95000, stock:6,  svg:'perfume2', desc:'Frescura plateada con notas cítricas y oud intenso.',  notas:['Bergamota','Oud','Azafrán'], foto:''},
    {id:6, nombre:'Rose Noir',          tipo:'perfume',  precio:92500, stock:7,  svg:'perfume3', desc:'Rosa oscura fusionada con pachulí y especias.',         notas:['Rosa','Pachulí','Canela'],   foto:''},
    {id:7, nombre:'Amber Gold',         tipo:'perfume',  precio:87900, stock:9,  svg:'perfume4', desc:'Ámbar dorado con vainilla y resinas. Cálido y dulce.', notas:['Ámbar','Vainilla','Benjuí'],foto:''},
  ];
  const saved = LS.get('inventario', null);
  return saved || def;
}
function setInventario(inv){ LS.set('inventario', inv); }
function ajustarStock(nombre, delta){
  const inv = getInventario();
  const p = inv.find(x=>x.nombre===nombre);
  if(p){ p.stock = Math.max(0, (p.stock||0) + delta); setInventario(inv); }
}

function getPuntos(cedula){
  const r=getReservas().filter(x=>x.cedula===cedula).length*10;
  const c=getCompras().filter(x=>x.cedula===cedula).reduce((s,x)=>s+Math.floor((x.precio||0)/10000)*5,0);
  return r+c;
}
function getNivel(pts){
  if(pts>=300)return{nombre:'DIAMANTE',icon:'💎',color:'#b9f2ff',descuento:15};
  if(pts>=150)return{nombre:'ORO',icon:'🥇',color:'#ffd700',descuento:10};
  if(pts>=50) return{nombre:'PLATA',icon:'🥈',color:'#c0c0c0',descuento:5};
  return{nombre:'BRONCE',icon:'🥉',color:'#cd7f32',descuento:3};
}

// ── SESIÓN ──
let clienteActual = null;
let adminActual = null;

function loadSession(){
  try{const s=sessionStorage.getItem('dexysCliente');if(s)clienteActual=JSON.parse(s);}catch{}
  try{const s=sessionStorage.getItem('dexysAdmin');if(s)adminActual=JSON.parse(s);}catch{}
}
// ── INTRO ──
setTimeout(()=>{$('intro').classList.add('out');},1400);

// ── ESTRELLAS — se inicializan en DOMContentLoaded ──
function initStars(){
  const c=$('bgStars');
  if(!c) return;
  for(let i=0;i<220;i++){
    const s=document.createElement('div');s.className='st';
    const sz=(Math.random()*2.5+.5).toFixed(1);
    s.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;--d:${(Math.random()*4+2).toFixed(1)}s;--dl:${(Math.random()*5).toFixed(1)}s`;
    c.appendChild(s);
  }
}

// ── NAVEGACIÓN ──
const panelMeta = {
  inicio:{icon:'✨',title:"DEXI'S NAILS",color:'var(--c-fucsia)'},
  precios:{icon:'💅',title:'LISTA DE PRECIOS',color:'var(--c-fucsia)'},
  reservas:{icon:'📅',title:'RESERVAS',color:'var(--c-turquesa)'},
  ia:{icon:'🤖',title:'DIAGNÓSTICO IA',color:'var(--c-morado)'},
  tienda:{icon:'🛍️',title:'TIENDA',color:'var(--c-dorado)'},
  dashboard:{icon:'📊',title:'MI PERFIL',color:'var(--c-dorado)'},
  juego:{icon:'🚀',title:'ARCADIA',color:'var(--c-turquesa)'},
  admin:{icon:'👑',title:'PANEL ADMIN',color:'var(--c-azul)'},
};
let currentSec = 'inicio';
let gameActive = false;

function goTo(sec){
  // Ocultar sección actual
  const secMapPrev={inicio:'secInicio',precios:'secPrecios',reservas:'secReservas',ia:'secIA',tienda:'secTienda',dashboard:'secDashboard',juego:'secJuego',admin:'secAdmin'};
  const prev = $(secMapPrev[currentSec]||'sec'+currentSec.charAt(0).toUpperCase()+currentSec.slice(1));
  if(prev && currentSec!=='juego'){prev.classList.remove('active');prev.style.display='none';}

  // Activar nueva
  const secMap={inicio:'secInicio',precios:'secPrecios',reservas:'secReservas',ia:'secIA',tienda:'secTienda',dashboard:'secDashboard',juego:'secJuego',admin:'secAdmin'};
  const el = $(secMap[sec]||'sec'+sec.charAt(0).toUpperCase()+sec.slice(1));
  if(!el) return;
  if(sec!=='juego'){
    el.style.display='flex';
    el.classList.add('active');
  }
  currentSec = sec;

  // Nav highlight
  document.querySelectorAll('.nav-btn').forEach(b=>{b.classList.remove('active');if(b.dataset.sec===sec)b.classList.add('active');});

  // Panel header
  const m=panelMeta[sec]||{icon:'✨',title:'',color:'var(--c-turquesa)'};
  $('panelIcon').textContent=m.icon;
  $('panelTitle').textContent=m.title;
  $('mainPanel').style.borderColor=`color-mix(in srgb,${m.color} 40%,transparent)`;
  $('mainPanel').style.boxShadow=`0 20px 60px rgba(0,0,0,.6),0 0 40px color-mix(in srgb,${m.color} 10%,transparent)`;

  // Panel body padding: juego sin padding
  $('panelBody').style.padding = '20px';
  $('panelBody').style.overflow = '';
  $('mainPanel').style.maxHeight='';
  $('mainPanel').style.height='';

  beep(660,.08);

  // Callbacks por sección
  if(sec==='inicio') renderInicio();
  if(sec==='reservas') renderReservas();
  if(sec==='tienda') renderTienda();
  if(sec==='dashboard') renderDashboard();
  if(sec==='admin') renderAdmin();
  if(sec==='juego'){
    $('panelBody').style.padding  = '0';
    $('panelBody').style.overflow = 'hidden';
    $('panelBody').style.height   = '100%';
    $('mainPanel').style.height   = 'calc(100vh - 120px)';
    $('panelHeader').style.display = 'none';
    const sj = $('secJuego');
    sj.style.display = 'flex';
    sj.classList.add('active');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(startGame)));
  } else {
    $('panelBody').style.padding  = '20px';
    $('panelBody').style.overflow = '';
    $('panelBody').style.height   = '';
    $('mainPanel').style.height   = '';
    $('panelHeader').style.display = '';
    const sj = $('secJuego');
    sj.style.display = 'none';
    sj.classList.remove('active');
    document.body.style.overflow = '';
    gameActive = false;
  }
}

// ── INIT — esperar DOM completo ──
document.addEventListener('DOMContentLoaded', function(){
  initStars();
  loadSession();
  $('secInicio').style.display='flex';
  renderInicio();
});

// ── INICIO DINÁMICO ──
function renderInicio(){
  const inner = $('inicioInner');
  const profs = getProfesionales();
  const pts = clienteActual ? getPuntos(clienteActual.cedula) : 0;
  const niv = getNivel(pts);
  const reservas = clienteActual ? getReservas().filter(r=>r.cedula===clienteActual.cedula) : [];
  const compras = clienteActual ? getCompras().filter(c=>c.cedula===clienteActual.cedula) : [];

  // Próxima reserva
  const hoy = new Date().toISOString().split('T')[0];
  const proxima = reservas.filter(r=>r.fecha>=hoy).sort((a,b)=>a.fecha.localeCompare(b.fecha))[0];

  // Bienvenida
  let bienvenidaHTML = '';
  if(clienteActual){
    bienvenidaHTML = `
      <div class="inicio-bienvenida">
        <div class="ib-avatar">💅</div>
        <div class="ib-text">
          <h2>Hola, ${clienteActual.nombre.split(' ')[0]} ✨</h2>
          <p>Qué bueno tenerte de vuelta</p>
          <div class="ib-nivel" style="color:${niv.color};border-color:${niv.color};background:${niv.color}18">
            ${niv.icon} ${niv.nombre} · ${niv.descuento}% descuento
          </div>
          <div class="ib-stats">
            <div class="ib-stat"><span class="val">${pts}</span><span class="lbl">PUNTOS</span></div>
            <div class="ib-stat"><span class="val">${reservas.length}</span><span class="lbl">VISITAS</span></div>
            <div class="ib-stat"><span class="val">${compras.length}</span><span class="lbl">COMPRAS</span></div>
          </div>
        </div>
      </div>
      ${proxima ? `
      <div class="inicio-proxima">
        <div>
          <div class="ip-label">PRÓXIMA RESERVA</div>
          <div class="ip-fecha">${proxima.fecha} · ${proxima.hora}</div>
          <div class="ip-prof">con ${proxima.profesionalNombre} · ${proxima.servicio||'Servicio'}</div>
        </div>
        <button class="btn-primary" style="width:auto;padding:8px 20px;font-size:.6rem" onclick="goTo('reservas')">VER MIS RESERVAS</button>
      </div>` : `
      <div class="inicio-proxima" style="justify-content:center;text-align:center">
        <div>
          <div class="ip-label" style="margin-bottom:8px">SIN RESERVAS PRÓXIMAS</div>
          <button class="btn-primary" style="width:auto;padding:8px 24px;font-size:.6rem" onclick="goTo('reservas')">📅 RESERVAR AHORA</button>
        </div>
      </div>`}`;
  } else {
    bienvenidaHTML = `
      <div class="inicio-bienvenida" style="flex-direction:column;text-align:center;align-items:center;gap:12px">
        <div style="font-family:var(--font-script);font-size:clamp(2rem,6vw,3.5rem);
          background:linear-gradient(180deg,#fff,var(--c-fucsia) 55%,var(--c-dorado));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          filter:drop-shadow(0 0 25px rgba(255,20,147,.4))">Dexi's Nails</div>
        <div style="font-family:var(--font-display);font-size:.65rem;letter-spacing:5px;color:var(--c-turquesa)">BELLEZA CÓSMICA</div>
        <p style="font-size:.8rem;color:rgba(255,255,255,.45);max-width:320px;line-height:1.6">
          Manicura · Podología · Facial · Perfumes árabes · Diagnóstico con IA
        </p>
        <button class="btn-primary" style="width:auto;padding:10px 28px" onclick="goTo('reservas')">RESERVAR TURNO →</button>
      </div>`;
  }

  // Galería de trabajos (emojis representativos)
  const trabajos = [
    {e:'💅',bg:'rgba(255,20,147,.15)'},{e:'🌸',bg:'rgba(255,105,180,.15)'},{e:'✨',bg:'rgba(255,215,0,.15)'},
    {e:'💎',bg:'rgba(185,242,255,.15)'},{e:'🌹',bg:'rgba(255,0,70,.15)'},{e:'🦋',bg:'rgba(100,149,237,.15)'},
    {e:'🌙',bg:'rgba(138,43,226,.15)'},{e:'⭐',bg:'rgba(255,200,0,.15)'}
  ];

  // Día de la semana actual
  const diasSemana=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const hoyDia = new Date().getDay();

  inner.innerHTML = `
    <div class="inicio-hero">
      ${bienvenidaHTML}
      <div class="inicio-row2">
        <div class="inicio-disponibles">
          <div class="id-title">👩 EQUIPO HOY</div>
          ${profs.map(p=>`
            <div class="prof-mini">
              <span class="pm-avatar">${p.emoji}</span>
              <div><div class="pm-nombre">${p.nombre}</div><div class="pm-espec">${p.especialidad}</div></div>
              <div class="pm-dot" style="background:${p.activa?'var(--c-turquesa)':'rgba(255,0,110,.5)'}"></div>
            </div>`).join('')}
        </div>
        <div class="inicio-horario">
          <div class="ih-title">🕐 HORARIOS</div>
          ${[
            {dia:'Lunes',idx:1},{dia:'Martes',idx:2},{dia:'Miércoles',idx:3},
            {dia:'Jueves',idx:4},{dia:'Viernes',idx:5},{dia:'Sábado',idx:6},{dia:'Domingo',idx:0}
          ].map(d=>`
            <div class="ih-row" style="${d.idx===hoyDia?'background:rgba(0,245,212,.05);border-radius:8px;padding:6px 8px':''}">
              <span class="dia" style="${d.idx===hoyDia?'color:var(--c-turquesa)':''}">${d.dia}${d.idx===hoyDia?' ←':''}</span>
              ${d.idx===0?'<span class="cerrado">CERRADO</span>':'<span class="hora">9:00 – 18:00</span>'}
            </div>`).join('')}
        </div>
      </div>
      <div class="inicio-trabajos">
        <div class="it-title">✨ NUESTROS TRABAJOS</div>
        <div class="trabajos-grid">
          ${trabajos.map(t=>`<div class="trabajo-item" style="background:${t.bg}" onclick="goTo('precios')">${t.e}</div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ── RESERVAS ──
let selProf=null, selFecha=null, selHora=null;
let calAnno=new Date().getFullYear(), calMes=new Date().getMonth();

function loginCliente(){
  const nombre=$('rnombre').value.trim();
  const cedula=$('rcedula').value.trim();
  if(!nombre||!cedula){toast('Completá nombre y cédula','error');return;}
  // Registrar o encontrar cliente
  let clientes=getClientes();
  let cl=clientes.find(c=>c.cedula===cedula);
  if(!cl){
    cl={cedula,nombre,telefono:$('rtelefono').value.trim(),email:$('remail').value.trim(),fechaReg:new Date().toISOString()};
    clientes.push(cl);LS.set('clientes',clientes);
  } else {
    // actualizar datos opcionales
    if($('rtelefono').value.trim()) cl.telefono=$('rtelefono').value.trim();
    if($('remail').value.trim()) cl.email=$('remail').value.trim();
    LS.set('clientes',clientes);
  }
  clienteActual=cl;
  sessionStorage.setItem('dexysCliente',JSON.stringify(cl));
  renderReservas();
  renderInicio();
  toast('¡Bienvenida, '+cl.nombre+'! 🌙');
  beep(880,.15);
  if(typeof chatOnLogin==='function') chatOnLogin(cl);
}

function logoutCliente(){
  clienteActual=null;
  sessionStorage.removeItem('dexysCliente');
  selProf=null;selFecha=null;selHora=null;
  renderReservas();
  renderInicio();
}

function renderReservas(){
  if(!clienteActual){
    $('reservasLoginBox').style.display='block';
    $('reservasPanel').style.display='none';
    return;
  }
  $('reservasLoginBox').style.display='none';
  $('reservasPanel').style.display='block';
  const pts=getPuntos(clienteActual.cedula);
  const niv=getNivel(pts);
  $('badgeNombre').textContent=clienteActual.nombre;
  $('badgePuntos').textContent=`⭐ ${pts} pts`;
  $('badgeNivel').textContent=`${niv.icon} ${niv.nombre}`;
  $('badgeNivel').style.cssText=`color:${niv.color};border-color:${niv.color};background:${niv.color}22;font-size:.6rem;padding:4px 12px;border-radius:50px;border:1.5px solid;font-family:var(--font-display)`;
  renderProfesionales();
  renderCalendario();
}

function reservaTab(el,tab){
  document.querySelectorAll('#reservasPanel .admin-tab').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  $('rtabNueva').style.display=tab==='nueva'?'block':'none';
  $('rtabMis').style.display=tab==='mis'?'block':'none';
  if(tab==='mis') renderMisReservas();
}

function renderProfesionales(){
  const g=$('profGrid'); g.innerHTML='';
  const profs=getProfesionales();
  profs.forEach(p=>{
    const d=document.createElement('div');
    d.className='prof-card'+(p.activa?'':' inactiva')+(selProf===p.id?' selected':'');
    d.innerHTML=`<div class="prof-avatar">${p.emoji}</div><div class="prof-nombre">${p.nombre}</div><div class="prof-espec">${p.especialidad}</div>${!p.activa?'<span class="prof-badge-inactiva">NO DISPONIBLE</span>':''}`;
    if(p.activa) d.onclick=()=>{selProf=p.id;renderProfesionales();renderCalendario();};
    g.appendChild(d);
  });
}

function renderCalendario(){
  const g=$('calGrid'); g.innerHTML='';
  const bloqueos=getBloqueos();
  const reservas=getReservas();
  const hoy=new Date(); hoy.setHours(0,0,0,0);
  const primerDia=new Date(calAnno,calMes,1).getDay();
  const diasMes=new Date(calAnno,calMes+1,0).getDate();
  const meses=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  $('calTitle').textContent=`${meses[calMes]} ${calAnno}`;
  const dias=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  dias.forEach(d=>{const el=document.createElement('div');el.className='cal-day-name';el.textContent=d;g.appendChild(el);});
  for(let i=0;i<primerDia;i++){const e=document.createElement('div');e.className='cal-day empty';g.appendChild(e);}
  for(let d=1;d<=diasMes;d++){
    const fecha=`${calAnno}-${String(calMes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const fechaD=new Date(calAnno,calMes,d);
    const esHoy=fechaD.toDateString()===hoy.toDateString();
    const pasado=fechaD<hoy;
    const bloqueado=bloqueos.some(b=>(b.profesional==='todos'||b.profesional===selProf)&&b.fecha===fecha);
    const conReserva=selProf&&reservas.some(r=>r.fecha===fecha&&r.profesional===selProf);
    const el=document.createElement('div');
    let cls='cal-day';
    if(pasado)cls+=' pasado';
    else if(bloqueado)cls+=' bloqueado';
    else if(esHoy)cls+=' hoy';
    if(selFecha===fecha)cls+=' selected';
    if(conReserva)cls+=' con-reserva';
    el.className=cls; el.textContent=d;
    if(!pasado&&!bloqueado){el.onclick=()=>{selFecha=fecha;renderCalendario();renderHorarios();};}
    g.appendChild(el);
  }
}

function cambiarMes(dir){
  calMes+=dir;
  if(calMes>11){calMes=0;calAnno++;}
  if(calMes<0){calMes=11;calAnno--;}
  renderCalendario();
}

function renderHorarios(){
  const g=$('horariosGrid'); g.innerHTML='';
  if(!selFecha){g.innerHTML='<span style="color:rgba(255,255,255,.3);font-size:.78rem">Seleccioná primero un día</span>';return;}
  const reservas=getReservas();
  HORARIOS.forEach(h=>{
    const ocupado=selProf&&reservas.some(r=>r.fecha===selFecha&&r.hora===h&&r.profesional===selProf);
    const el=document.createElement('div');
    el.className='hora-btn'+(ocupado?' ocupado':'')+(selHora===h?' selected':'');
    el.textContent=h;
    if(!ocupado){el.onclick=()=>{selHora=h;renderHorarios();};}
    g.appendChild(el);
  });
}

function confirmarReserva(){
  if(!selProf)return toast('Elegí una profesional','error');
  if(!selFecha)return toast('Elegí un día','error');
  if(!selHora)return toast('Elegí un horario','error');
  const servicio=$('rservicio').value.trim()||'Servicio general';
  const profs=getProfesionales();
  const prof=profs.find(p=>p.id===selProf);
  const reservas=getReservas();
  const nueva={
    id:Date.now(),cedula:clienteActual.cedula,cliente:clienteActual.nombre,
    profesional:selProf,profesionalNombre:prof?.nombre||'',
    fecha:selFecha,hora:selHora,servicio,estado:'Confirmada',
    creada:new Date().toISOString()
  };
  reservas.push(nueva);LS.set('reservas',reservas);
  selFecha=null;selHora=null;
  renderCalendario();renderHorarios();
  toast(`✅ Reserva confirmada · ${nueva.fecha} ${nueva.hora}`);
  beep(880,.2);
  const pts=getPuntos(clienteActual.cedula);
  $('badgePuntos').textContent=`⭐ ${pts} pts`;
}

function renderMisReservas(){
  const lista=$('misReservasLista'); lista.innerHTML='';
  const reservas=getReservas().filter(r=>r.cedula===clienteActual.cedula).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  if(!reservas.length){lista.innerHTML='<div class="empty-state"><div class="big">📅</div><div>No tenés reservas aún</div></div>';return;}
  reservas.forEach(r=>{
    const d=document.createElement('div');d.className='reserva-item';
    d.innerHTML=`<div><div class="fecha">${r.fecha} ${r.hora}</div><div class="prof">${r.profesionalNombre} · ${r.servicio||'Servicio'}</div></div><button class="btn-cancelar" onclick="cancelarReservaCliente(${r.id})">✕</button>`;
    lista.appendChild(d);
  });
}

function cancelarReservaCliente(id){
  let r=getReservas(); r=r.filter(x=>x.id!==id); LS.set('reservas',r);
  renderMisReservas();
  const pts=getPuntos(clienteActual.cedula);
  $('badgePuntos').textContent=`⭐ ${pts} pts`;
  toast('Reserva cancelada');
}

function reservarServicio(servicio){
  goTo('reservas');
  setTimeout(()=>{
    if(clienteActual) $('rservicio').value=servicio;
    else toast('Iniciá sesión primero para reservar','error');
  },300);
}

// ── TIENDA ──
const COLONIAS=[
  {nombre:'Agua de Oriente',svg:'colonia1',desc:'Colonia fresca con notas cítricas y un toque de azahar. Ideal para el día a día.',notas:['Limón','Naranja','Azahar'],precio:45900},
  {nombre:'Brisas de Dubai',svg:'colonia2',desc:'Colonia fresca con notas marinas y un fondo de almizcle blanco suave.',notas:['Marina','Almizcle','Madera'],precio:49900},
  {nombre:'Flor de Azahar',svg:'colonia3',desc:'Colonia floral suave con notas de azahar, neroli y un toque de miel.',notas:['Azahar','Neroli','Miel'],precio:42500},
];
const PERFUMES=[
  {nombre:'La Bestia Negra',svg:'perfume1',desc:'Perfume intenso y profundo con notas amaderadas y almizcle negro. Perfecto para la noche.',notas:['Cuero','Almizcle','Ámbar'],precio:89900},
  {nombre:'Oud Silver',svg:'perfume2',desc:'Frescura plateada con notas cítricas y un fondo de oud intenso.',notas:['Bergamota','Oud','Azafrán'],precio:95000},
  {nombre:'Rose Noir',svg:'perfume3',desc:'Rosa oscura fusionada con pachulí y especias. Magnético y seductor.',notas:['Rosa','Pachulí','Canela'],precio:92500},
  {nombre:'Amber Gold',svg:'perfume4',desc:'Ámbar dorado con vainilla y resinas. Cálido, dulce y envolvente.',notas:['Ámbar','Vainilla','Benjuí'],precio:87900},
];

function renderTienda(){
  $('tiendaSesionAlert').style.display = clienteActual?'none':'block';
  $('tiendaClienteBadge').style.display = clienteActual?'block':'none';
  if(clienteActual){
    $('tiendaNombre').textContent=clienteActual.nombre;
    $('tiendaPuntos').textContent=`⭐ ${getPuntos(clienteActual.cedula)} pts`;
  }
  const inv = getInventario();
  const colonias = inv.filter(x=>x.tipo==='colonia');
  const perfumes = inv.filter(x=>x.tipo==='perfume');
  renderProductosInv('gridColonias', colonias, 'var(--c-turquesa)', 'colonia');
  renderProductosInv('gridPerfumes', perfumes, 'var(--c-fucsia)',   'perfume');
}

const BOTTLE_SVGS = {
  colonia1: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cg1a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e0f7fa"/><stop offset="100%" stop-color="#00b8d4"/></linearGradient>
      <linearGradient id="cg1b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.6)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
      <filter id="cf1"><feGaussianBlur stdDeviation="2"/></filter>
    </defs>
    <!-- Tapa -->
    <rect x="44" y="8" width="32" height="14" rx="5" fill="#b2ebf2" stroke="#00acc1" stroke-width="1.5"/>
    <rect x="50" y="4" width="20" height="8" rx="3" fill="#00acc1"/>
    <!-- Cuello -->
    <rect x="48" y="22" width="24" height="12" rx="3" fill="#b2ebf2" stroke="#00acc1" stroke-width="1"/>
    <!-- Cuerpo redondo -->
    <ellipse cx="60" cy="110" rx="38" ry="56" fill="url(#cg1a)" stroke="#00acc1" stroke-width="1.5"/>
    <!-- Brillo -->
    <ellipse cx="44" cy="80" rx="10" ry="22" fill="url(#cg1b)" opacity=".7" filter="url(#cf1)"/>
    <!-- Líquido interior -->
    <ellipse cx="60" cy="118" rx="30" ry="44" fill="#80deea" opacity=".4"/>
    <!-- Etiqueta -->
    <rect x="28" y="95" width="64" height="32" rx="8" fill="white" opacity=".15" stroke="white" stroke-width=".5"/>
    <text x="60" y="113" text-anchor="middle" font-size="7" fill="white" font-family="serif" font-style="italic">Agua de</text>
    <text x="60" y="123" text-anchor="middle" font-size="7" fill="white" font-family="serif" font-style="italic">Oriente</text>
    <!-- Burbujas -->
    <circle cx="48" cy="140" r="3" fill="white" opacity=".2"/>
    <circle cx="72" cy="155" r="2" fill="white" opacity=".15"/>
    <circle cx="56" cy="160" r="1.5" fill="white" opacity=".2"/>
  </svg>`,

  colonia2: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cg2a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8f5e9"/><stop offset="100%" stop-color="#26a69a"/></linearGradient>
      <linearGradient id="cg2b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.7)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
    </defs>
    <!-- Tapa cuadrada elegante -->
    <rect x="38" y="6" width="44" height="16" rx="3" fill="#80cbc4" stroke="#00897b" stroke-width="1.5"/>
    <rect x="46" y="2" width="28" height="8" rx="2" fill="#00897b"/>
    <!-- Cuello -->
    <rect x="44" y="22" width="32" height="10" rx="2" fill="#b2dfdb" stroke="#00897b" stroke-width="1"/>
    <!-- Cuerpo cuadrado con esquinas redondeadas — estilo Dubai -->
    <rect x="22" y="32" width="76" height="120" rx="12" fill="url(#cg2a)" stroke="#00897b" stroke-width="1.5"/>
    <!-- Brillo lateral -->
    <rect x="26" y="38" width="18" height="70" rx="9" fill="url(#cg2b)" opacity=".6"/>
    <!-- Líquido -->
    <rect x="26" y="80" width="68" height="68" rx="10" fill="#4db6ac" opacity=".35"/>
    <!-- Olas decorativas -->
    <path d="M26 100 Q44 92 60 100 Q76 108 94 100" stroke="white" stroke-width="1" fill="none" opacity=".3"/>
    <path d="M26 115 Q44 107 60 115 Q76 123 94 115" stroke="white" stroke-width="1" fill="none" opacity=".2"/>
    <!-- Etiqueta -->
    <rect x="32" y="52" width="56" height="28" rx="6" fill="white" opacity=".12" stroke="white" stroke-width=".5"/>
    <text x="60" y="66" text-anchor="middle" font-size="6.5" fill="white" font-family="serif" font-style="italic">Brisas de</text>
    <text x="60" y="76" text-anchor="middle" font-size="6.5" fill="white" font-family="serif" font-style="italic">Dubai</text>
  </svg>`,

  colonia3: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cg3a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fce4ec"/><stop offset="100%" stop-color="#f48fb1"/></linearGradient>
      <linearGradient id="cg3b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.8)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
    </defs>
    <!-- Tapa floral ovalada -->
    <ellipse cx="60" cy="14" rx="18" ry="10" fill="#f8bbd0" stroke="#e91e8c" stroke-width="1.5"/>
    <ellipse cx="60" cy="8" rx="10" ry="6" fill="#e91e8c"/>
    <!-- Pétalo decorativo en tapa -->
    <path d="M55 14 Q60 8 65 14 Q60 18 55 14" fill="#fff" opacity=".4"/>
    <!-- Cuello fino -->
    <rect x="52" y="24" width="16" height="14" rx="4" fill="#f8bbd0" stroke="#e91e8c" stroke-width="1"/>
    <!-- Cuerpo ovalado -->
    <ellipse cx="60" cy="112" rx="36" ry="54" fill="url(#cg3a)" stroke="#e91e8c" stroke-width="1.5"/>
    <!-- Brillo -->
    <ellipse cx="44" cy="82" rx="9" ry="20" fill="url(#cg3b)" opacity=".7"/>
    <!-- Líquido rosado -->
    <ellipse cx="60" cy="120" rx="28" ry="42" fill="#f48fb1" opacity=".3"/>
    <!-- Flores decorativas -->
    <circle cx="60" cy="90" r="12" fill="none" stroke="white" stroke-width=".5" opacity=".3"/>
    <circle cx="60" cy="90" r="4" fill="white" opacity=".2"/>
    <path d="M60 82 Q64 86 60 90 Q56 86 60 82" fill="white" opacity=".25"/>
    <path d="M68 90 Q64 94 60 90 Q64 86 68 90" fill="white" opacity=".25"/>
    <path d="M60 98 Q56 94 60 90 Q64 94 60 98" fill="white" opacity=".25"/>
    <path d="M52 90 Q56 86 60 90 Q56 94 52 90" fill="white" opacity=".25"/>
    <!-- Etiqueta -->
    <rect x="30" y="108" width="60" height="26" rx="7" fill="white" opacity=".13" stroke="white" stroke-width=".5"/>
    <text x="60" y="122" text-anchor="middle" font-size="6.5" fill="white" font-family="serif" font-style="italic">Flor de</text>
    <text x="60" y="130" text-anchor="middle" font-size="6.5" fill="white" font-family="serif" font-style="italic">Azahar</text>
  </svg>`,

  perfume1: `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pg1a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a1a2e"/><stop offset="60%" stop-color="#16213e"/><stop offset="100%" stop-color="#0f3460"/></linearGradient>
      <linearGradient id="pg1b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.35)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
      <linearGradient id="pg1c" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffd700"/><stop offset="100%" stop-color="#ff8c00"/></linearGradient>
    </defs>
    <!-- Tapa negra imponente -->
    <rect x="36" y="4" width="48" height="18" rx="4" fill="#0a0a0a" stroke="#333" stroke-width="1.5"/>
    <rect x="44" y="1" width="32" height="8" rx="3" fill="#111"/>
    <!-- Detalle dorado tapa -->
    <rect x="36" y="19" width="48" height="3" fill="url(#pg1c)"/>
    <!-- Cuello -->
    <rect x="44" y="22" width="32" height="12" rx="3" fill="#1a1a2e" stroke="#333" stroke-width="1"/>
    <!-- Cuerpo rectangular elegante -->
    <rect x="18" y="34" width="84" height="130" rx="8" fill="url(#pg1a)" stroke="#333" stroke-width="1.5"/>
    <!-- Brillo sutil -->
    <rect x="22" y="38" width="16" height="80" rx="8" fill="url(#pg1b)" opacity=".5"/>
    <!-- Franja dorada lateral izquierda -->
    <rect x="18" y="34" width="4" height="130" rx="2" fill="url(#pg1c)" opacity=".8"/>
    <!-- Franja dorada lateral derecha -->
    <rect x="98" y="34" width="4" height="130" rx="2" fill="url(#pg1c)" opacity=".8"/>
    <!-- Líquido negro profundo -->
    <rect x="22" y="100" width="76" height="60" rx="6" fill="#050510" opacity=".6"/>
    <!-- Etiqueta central -->
    <rect x="28" y="60" width="64" height="50" rx="6" fill="rgba(255,215,0,.08)" stroke="rgba(255,215,0,.4)" stroke-width="1"/>
    <text x="60" y="80" text-anchor="middle" font-size="7" fill="#ffd700" font-family="serif" font-style="italic">La Bestia</text>
    <text x="60" y="92" text-anchor="middle" font-size="7" fill="#ffd700" font-family="serif" font-style="italic">Negra</text>
    <text x="60" y="103" text-anchor="middle" font-size="5" fill="rgba(255,215,0,.5)" font-family="sans-serif" letter-spacing="2">EAU DE PARFUM</text>
    <!-- Partículas doradas -->
    <circle cx="35" cy="130" r="1.5" fill="#ffd700" opacity=".4"/>
    <circle cx="85" cy="145" r="1" fill="#ffd700" opacity=".3"/>
    <circle cx="60" cy="155" r="1.5" fill="#ffd700" opacity=".35"/>
  </svg>`,

  perfume2: `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pg2a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8eaf6"/><stop offset="50%" stop-color="#9fa8da"/><stop offset="100%" stop-color="#5c6bc0"/></linearGradient>
      <linearGradient id="pg2b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.9)"/><stop offset="100%" stop-color="rgba(255,255,255,.1)"/></linearGradient>
      <linearGradient id="pg2c" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#c0c0c0"/><stop offset="50%" stop-color="#ffffff"/><stop offset="100%" stop-color="#c0c0c0"/></linearGradient>
    </defs>
    <!-- Tapa plateada hexagonal -->
    <polygon points="60,2 80,12 80,28 60,38 40,28 40,12" fill="url(#pg2c)" stroke="#9e9e9e" stroke-width="1"/>
    <polygon points="60,8 74,16 74,26 60,34 46,26 46,16" fill="white" opacity=".4"/>
    <!-- Cuello cristalino -->
    <rect x="48" y="38" width="24" height="12" rx="3" fill="#c5cae9" stroke="#9fa8da" stroke-width="1"/>
    <!-- Cuerpo hexagonal / cristal -->
    <polygon points="60,50 96,70 96,140 60,160 24,140 24,70" fill="url(#pg2a)" stroke="#9fa8da" stroke-width="1.5"/>
    <!-- Brillo intenso cristal -->
    <polygon points="28,72 44,62 44,138 28,128" fill="url(#pg2b)" opacity=".6"/>
    <!-- Reflejo derecha -->
    <polygon points="92,72 80,66 80,134 92,128" fill="rgba(255,255,255,.15)"/>
    <!-- Líquido plateado -->
    <polygon points="60,110 88,126 88,138 60,154 32,138 32,126" fill="#7986cb" opacity=".3"/>
    <!-- Etiqueta -->
    <rect x="36" y="78" width="48" height="42" rx="5" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.4)" stroke-width=".8"/>
    <text x="60" y="96" text-anchor="middle" font-size="7.5" fill="white" font-family="serif" font-style="italic">Oud</text>
    <text x="60" y="108" text-anchor="middle" font-size="7.5" fill="white" font-family="serif" font-style="italic">Silver</text>
    <text x="60" y="116" text-anchor="middle" font-size="4.5" fill="rgba(255,255,255,.5)" font-family="sans-serif" letter-spacing="2">EAU DE PARFUM</text>
    <!-- Destellos -->
    <circle cx="34" cy="78" r="3" fill="white" opacity=".6"/>
    <circle cx="86" cy="70" r="2" fill="white" opacity=".5"/>
  </svg>`,

  perfume3: `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pg3a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#880e4f"/><stop offset="50%" stop-color="#ad1457"/><stop offset="100%" stop-color="#4a148c"/></linearGradient>
      <linearGradient id="pg3b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,200,200,.6)"/><stop offset="100%" stop-color="rgba(255,100,150,0)"/></linearGradient>
      <radialGradient id="pg3c" cx="50%" cy="30%"><stop offset="0%" stop-color="rgba(255,255,255,.3)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
    </defs>
    <!-- Tapa con rosa -->
    <ellipse cx="60" cy="14" rx="20" ry="12" fill="#880e4f" stroke="#6a0f3c" stroke-width="1.5"/>
    <!-- Rosa en la tapa -->
    <circle cx="60" cy="12" r="7" fill="#c2185b" opacity=".8"/>
    <path d="M56 12 Q60 6 64 12 Q60 16 56 12" fill="#f06292" opacity=".7"/>
    <path d="M60 8 Q64 12 60 16 Q56 12 60 8" fill="#f06292" opacity=".7"/>
    <path d="M54 10 Q58 14 54 18 Q50 14 54 10" fill="#e91e8c" opacity=".5"/>
    <path d="M66 10 Q70 14 66 18 Q62 14 66 10" fill="#e91e8c" opacity=".5"/>
    <circle cx="60" cy="12" r="3" fill="#880e4f"/>
    <!-- Cuello -->
    <rect x="50" y="26" width="20" height="12" rx="4" fill="#880e4f" stroke="#6a0f3c" stroke-width="1"/>
    <!-- Cuerpo con curva de mujer -->
    <path d="M30 38 Q18 70 18 105 Q18 155 60 168 Q102 155 102 105 Q102 70 90 38 Z" fill="url(#pg3a)" stroke="#6a0f3c" stroke-width="1.5"/>
    <!-- Brillo -->
    <path d="M32 42 Q24 72 24 105 Q24 130 36 148" stroke="url(#pg3b)" stroke-width="14" fill="none" stroke-linecap="round" opacity=".5"/>
    <!-- Reflejo superior -->
    <ellipse cx="60" cy="55" rx="28" ry="12" fill="url(#pg3c)"/>
    <!-- Líquido oscuro -->
    <path d="M28 120 Q18 145 60 158 Q102 145 92 120 Z" fill="#4a148c" opacity=".4"/>
    <!-- Etiqueta -->
    <ellipse cx="60" cy="100" rx="28" ry="22" fill="rgba(255,255,255,.07)" stroke="rgba(255,192,203,.4)" stroke-width="1"/>
    <text x="60" y="97" text-anchor="middle" font-size="7.5" fill="#ffb3c6" font-family="serif" font-style="italic">Rose</text>
    <text x="60" y="108" text-anchor="middle" font-size="7.5" fill="#ffb3c6" font-family="serif" font-style="italic">Noir</text>
  </svg>`,

  perfume4: `<svg viewBox="0 0 120 190" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pg4a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fff8e1"/><stop offset="40%" stop-color="#ffb300"/><stop offset="100%" stop-color="#e65100"/></linearGradient>
      <linearGradient id="pg4b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,255,255,.7)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></linearGradient>
      <linearGradient id="pg4c" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#ffd700"/><stop offset="50%" stop-color="#fff9c4"/><stop offset="100%" stop-color="#ffd700"/></linearGradient>
    </defs>
    <!-- Tapa dorada ornamental -->
    <rect x="38" y="4" width="44" height="20" rx="6" fill="#b8860b" stroke="#ffd700" stroke-width="1.5"/>
    <!-- Ornamento en tapa -->
    <path d="M48 14 L52 10 L56 14 L60 8 L64 14 L68 10 L72 14" stroke="#ffd700" stroke-width="1.5" fill="none"/>
    <rect x="44" y="1" width="32" height="7" rx="3" fill="#ffd700"/>
    <!-- Franja dorada superior -->
    <rect x="38" y="24" width="44" height="4" fill="url(#pg4c)"/>
    <!-- Cuello dorado -->
    <rect x="46" y="28" width="28" height="12" rx="3" fill="#b8860b" stroke="#ffd700" stroke-width="1"/>
    <!-- Cuerpo octagonal dorado -->
    <path d="M32 40 L22 55 L22 140 L32 158 L88 158 L98 140 L98 55 L88 40 Z" fill="url(#pg4a)" stroke="#b8860b" stroke-width="1.5"/>
    <!-- Brillo -->
    <path d="M26 56 L26 138 L32 154 L36 154 L36 56 Z" fill="url(#pg4b)" opacity=".5"/>
    <!-- Líquido ámbar -->
    <path d="M24 120 L22 140 L32 158 L88 158 L98 140 L96 120 Z" fill="#ff6f00" opacity=".4"/>
    <!-- Franjas horizontales decorativas -->
    <line x1="22" y1="75" x2="98" y2="75" stroke="rgba(255,215,0,.25)" stroke-width="1"/>
    <line x1="22" y1="130" x2="98" y2="130" stroke="rgba(255,215,0,.25)" stroke-width="1"/>
    <!-- Etiqueta central -->
    <rect x="30" y="80" width="60" height="46" rx="5" fill="rgba(255,255,255,.08)" stroke="rgba(255,215,0,.5)" stroke-width="1"/>
    <text x="60" y="99" text-anchor="middle" font-size="7.5" fill="#fff9c4" font-family="serif" font-style="italic">Amber</text>
    <text x="60" y="111" text-anchor="middle" font-size="7.5" fill="#fff9c4" font-family="serif" font-style="italic">Gold</text>
    <text x="60" y="121" text-anchor="middle" font-size="4.5" fill="rgba(255,215,0,.5)" font-family="sans-serif" letter-spacing="2">EAU DE PARFUM</text>
    <!-- Destellos dorados -->
    <circle cx="30" cy="50" r="2" fill="#ffd700" opacity=".5"/>
    <circle cx="90" cy="48" r="1.5" fill="#ffd700" opacity=".4"/>
    <circle cx="94" cy="150" r="2" fill="#ffd700" opacity=".45"/>
  </svg>`,
};

function renderProductosInv(gridId,lista,color,tipo){
  const g=$(gridId); g.innerHTML='';
  lista.forEach(p=>{
    const d=document.createElement('div');
    d.className='prod-card'; d.style.setProperty('--prod-color',color);
    const sinStock = (p.stock||0)<=0;
    let imgHTML = '';
    if(p.foto){
      imgHTML = `<div class="prod-bottle"><img src="${p.foto}" alt="${p.nombre}" style="width:80px;height:120px;object-fit:contain;border-radius:8px;"></div>`;
    } else if(p.svg && BOTTLE_SVGS[p.svg]){
      imgHTML = `<div class="prod-bottle">${BOTTLE_SVGS[p.svg]}</div>`;
    } else {
      imgHTML = `<span class="prod-emoji">🧴</span>`;
    }
    const notasArr = Array.isArray(p.notas) ? p.notas : (p.notas||'').split(',').map(x=>x.trim()).filter(Boolean);
    d.innerHTML=`
      <span class="prod-tipo-badge" style="color:${color};border-color:${color}">${tipo.toUpperCase()}</span>
      ${sinStock?'<span class="prod-agotado-badge">AGOTADO</span>':''}
      ${imgHTML}
      <div class="prod-nombre">${p.nombre}</div>
      <div class="prod-desc">${p.desc||''}</div>
      <div class="prod-notas">${notasArr.map(n=>`<span class="prod-nota">${n}</span>`).join('')}</div>
      <div class="prod-stock-label" style="font-size:.65rem;color:${sinStock?'#ff4466':'rgba(0,245,212,.7)'};font-family:var(--font-display);margin-bottom:4px">
        ${sinStock?'Sin stock':'📦 Stock: '+p.stock}
      </div>
      <div class="prod-footer">
        <span class="prod-precio">$${(p.precio||0).toLocaleString()}</span>
        <button class="btn-comprar" ${sinStock?'disabled style="opacity:.4;cursor:not-allowed"':''} onclick="${sinStock?'':'comprar(\''+p.nombre+'\','+p.precio+',\''+tipo+'\')'}">
          ${sinStock?'AGOTADO':'COMPRAR'}
        </button>
      </div>`;
    g.appendChild(d);
  });
}

function renderProductos(gridId,lista,color,tipo){
  const g=$(gridId); g.innerHTML='';
  lista.forEach(p=>{
    const d=document.createElement('div');
    d.className='prod-card';d.style.setProperty('--prod-color',color);
    const bottleSVG = p.svg && BOTTLE_SVGS[p.svg]
      ? `<div class="prod-bottle">${BOTTLE_SVGS[p.svg]}</div>`
      : `<span class="prod-emoji">${p.emoji||'🧴'}</span>`;
    d.innerHTML=`
      <span class="prod-tipo-badge" style="color:${color};border-color:${color}">${tipo.toUpperCase()}</span>
      ${bottleSVG}
      <div class="prod-nombre">${p.nombre}</div>
      <div class="prod-desc">${p.desc}</div>
      <div class="prod-notas">${p.notas.map(n=>`<span class="prod-nota">${n}</span>`).join('')}</div>
      <div class="prod-footer">
        <span class="prod-precio">$${p.precio.toLocaleString()}</span>
        <button class="btn-comprar" onclick="comprar('${p.nombre}',${p.precio},'${tipo}')">COMPRAR</button>
      </div>`;
    g.appendChild(d);
  });
}

function comprar(nombre,precio,tipo){
  if(!clienteActual){goTo('reservas');toast('Iniciá sesión para comprar','error');return;}
  // Verificar stock
  const inv = getInventario();
  const prod = inv.find(x=>x.nombre===nombre);
  if(prod && prod.stock<=0){toast('❌ Sin stock disponible','error');beep(220,.15);return;}
  // Registrar compra
  const compras=getCompras();
  compras.push({id:Date.now(),cedula:clienteActual.cedula,clienteNombre:clienteActual.nombre,
    producto:nombre,tipo,precio,fecha:new Date().toISOString()});
  LS.set('compras',compras);
  // Descontar stock
  ajustarStock(nombre, -1);
  // Actualizar puntos en pantalla
  const pts=getPuntos(clienteActual.cedula);
  if($('tiendaPuntos')) $('tiendaPuntos').textContent=`⭐ ${pts} pts`;
  // Re-renderizar tienda para mostrar stock actualizado
  renderTienda();
  toast(`✅ ¡Compra exitosa! +${Math.floor(precio/10000)*5} pts`);
  beep(880,.15);
}

// ── DASHBOARD ──
function renderDashboard(){
  if(!clienteActual){$('dashLoginPrompt').style.display='block';$('dashContent').style.display='none';return;}
  $('dashLoginPrompt').style.display='none';$('dashContent').style.display='block';
  $('dashNombre').textContent=clienteActual.nombre;
  const pts=getPuntos(clienteActual.cedula);
  const niv=getNivel(pts);
  $('dashNivelBadge').textContent=`${niv.icon} ${niv.nombre} · ${niv.descuento}% dto`;
  $('dashNivelBadge').style.cssText=`color:${niv.color};border-color:${niv.color};background:${niv.color}18;font-family:var(--font-display);font-size:.6rem;padding:6px 16px;border-radius:50px;border:1.5px solid`;
  const reservas=getReservas().filter(r=>r.cedula===clienteActual.cedula);
  const compras=getCompras().filter(c=>c.cedula===clienteActual.cedula);
  const ptosSig = niv.nombre==='DIAMANTE'?300:niv.nombre==='ORO'?150:niv.nombre==='PLATA'?50:0;
  const ptosNecesita = niv.nombre==='DIAMANTE'?0:niv.nombre==='ORO'?300-pts:niv.nombre==='PLATA'?150-pts:50-pts;
  const pct = niv.nombre==='DIAMANTE'?100:Math.min(100,Math.floor((pts/(niv.nombre==='PLATA'?50:niv.nombre==='ORO'?150:300))*100));
  const nextColors={'BRONCE':'#c0c0c0','PLATA':'#ffd700','ORO':'#b9f2ff','DIAMANTE':'#b9f2ff'};
  const g=$('dashGrid'); g.innerHTML=`
    <div class="dash-card">
      <div class="dash-card-title">⭐ MIS PUNTOS</div>
      <div class="dash-big-num">${pts}</div>
      <div class="dash-big-label">puntos acumulados</div>
      <div class="nivel-progress"><div class="nivel-progress-fill" style="width:${pct}%;background:linear-gradient(90deg,${niv.color},${nextColors[niv.nombre]||niv.color})"></div></div>
      ${niv.nombre!=='DIAMANTE'?`<div style="font-size:.7rem;color:rgba(255,255,255,.4)">Faltan ${ptosNecesita} pts para el siguiente nivel</div>`:'<div style="font-size:.7rem;color:#b9f2ff">💎 Nivel máximo alcanzado</div>'}
    </div>
    <div class="dash-card">
      <div class="dash-card-title">📅 MIS RESERVAS</div>
      <div class="dash-big-num">${reservas.length}</div>
      <div class="dash-big-label">total de visitas</div>
      <div class="divider" style="margin:10px 0"></div>
      <div class="reservas-mini">${reservas.slice(0,3).map(r=>`<div class="reserva-mini"><span class="rfecha">${r.fecha}</span><span style="color:rgba(255,255,255,.6)">${r.profesionalNombre}</span></div>`).join('')||'<div style="color:rgba(255,255,255,.3);font-size:.78rem">Sin reservas aún</div>'}</div>
    </div>
    <div class="dash-card">
      <div class="dash-card-title">🛍️ MIS COMPRAS</div>
      <div class="dash-big-num">${compras.length}</div>
      <div class="dash-big-label">productos comprados</div>
      <div class="divider" style="margin:10px 0"></div>
      <div class="compras-mini">${compras.slice(0,3).map(c=>`<div class="compra-mini"><span style="color:rgba(255,255,255,.65)">${c.producto}</span><span class="cprecio">$${(c.precio||0).toLocaleString()}</span></div>`).join('')||'<div style="color:rgba(255,255,255,.3);font-size:.78rem">Sin compras aún</div>'}</div>
    </div>
    <div class="dash-card">
      <div class="dash-card-title">🎁 TU DESCUENTO</div>
      <div class="dash-big-num" style="color:${niv.color}">${niv.descuento}%</div>
      <div class="dash-big-label">en todos los servicios</div>
      <div style="margin-top:12px;font-size:.75rem;color:rgba(255,255,255,.4)">Nivel ${niv.icon} ${niv.nombre}</div>
    </div>`;
}

// ── IA DIAGNÓSTICO ──
const DIAGNOSTICOS=[
  {palabras:['talón','talon','plantarfasciitis','fascitis','dolor talon','punzada'],nombre:'Fascitis plantar',especialista:'Dexi (Podología)',confianza:90,recs:['Ejercicios de estiramiento de gemelos','Plantillas con soporte de arco','Hielo 15 min tras actividad física','Evitar estar mucho tiempo de pie']},
  {palabras:['seca','aspera','agrietada','talones rajados','xerosis','grietas','reseca','piel seca'],nombre:'Piel seca / Xerosis',especialista:'Dexi (Podología)',confianza:92,recs:['Crema humectante con urea al 10%','Evitar agua muy caliente','Usar calcetines de algodón','Hidratación diaria después del baño']},
  {palabras:['callo','dureza','callosidad','callos','duro'],nombre:'Callosidades plantares',especialista:'Dexi (Podología)',confianza:88,recs:['Lima suave después del baño','Crema queratolítica','Evaluar calzado','Evitar caminar descalzo']},
  {palabras:['hongo','hongos','amarillo','uña gruesa','mal olor','onicomicosis','uñas amarillas','engrosada'],nombre:'Onicomicosis (hongos en uñas)',especialista:'Dexi (Podología)',confianza:85,recs:['Aplicar antifúngico tópico','Mantener pies secos','Evitar andar descalzo en piscinas','Consulta con podólogo para tratamiento']},
  {palabras:['encarnada','enterro','uña encarnada','dolor costado','uña enterrada','inflamada'],nombre:'Uña encarnada',especialista:'Dexi (Podología)',confianza:90,recs:['Pediluvio con agua tibia y sal','Calzado ancho y cómodo','NO cortar la uña en casa','Acudir a podólogo urgente']},
  {palabras:['juanete','hallux','valgus','protuberancia','dedo desviado'],nombre:'Hallux valgus (juanete)',especialista:'Dexi (Podología)',confianza:80,recs:['Usar separadores de dedos','Calzado ortopédico ancho','Ejercicios de movilidad','Evaluar uso de férulas nocturnas']},
  {palabras:['comezon','picazon','escamas','ardor','entre dedos','tinea','pie de atleta','pica'],nombre:'Tinea pedis (pie de atleta)',especialista:'Dexi (Podología)',confianza:88,recs:['Antifúngico en crema','Secar bien entre los dedos','Usar calcetines de algodón','Evitar calzado cerrado por largas horas']},
  {palabras:['diseño','esmalte','decorar','pintar','semipermanente','press on','manicura'],nombre:'Consulta manicura / diseños',especialista:'Valentina (Manicura)',confianza:95,recs:['Valentina es especialista en diseños','Elegí entre semipermanente o press on','Traé tu inspiración o elegí en el catálogo']},
  {palabras:['parafina','hidratacion','masaje','relajacion','spa'],nombre:'Tratamiento de hidratación / parafina',especialista:'Carolina (Parafina & Facial)',confianza:90,recs:['Terapia con parafina para hidratación profunda','Ideal para piel muy seca','Duración aproximada 30 minutos']},
  {palabras:['facial','limpieza facial','acne','poros','espinillas','blackheads'],nombre:'Limpieza facial',especialista:'Carolina (Facial)',confianza:88,recs:['Limpieza profunda con extracción','Mascarilla hidratante','Protector solar recomendado','1 vez al mes para mantenimiento']},
];

let iaImageBase64=null;

function iaHandleFile(e){
  const file=e.target.files[0]; if(!file) return;
  if(file.size>5*1024*1024){toast('La imagen es muy grande (máx 5MB)','error');return;}
  const reader=new FileReader();
  reader.onload=ev=>{
    iaImageBase64=ev.target.result.split(',')[1];
    const preview=$('imgPreview');
    preview.src=ev.target.result;preview.style.display='block';
    toast('Imagen cargada ✓');
  };
  reader.readAsDataURL(file);
}

function iaAnalizar(){ _iaAnalizar().catch(e=>console.log(e)); }
async function _iaAnalizar(){
  const sintomas=$('iaSintomas').value.trim().toLowerCase();
  if(!sintomas&&!iaImageBase64){toast('Describí tus síntomas o subí una foto','error');return;}
  const btn=$('iaBtnAnalizar');
  btn.disabled=true;btn.innerHTML='ANALIZANDO <span class="spinner"></span>';

  // Simulación de delay realista
  await new Promise(r=>setTimeout(r,900+Math.random()*600));

  let diag;
  let maxCoin=0;
  DIAGNOSTICOS.forEach(d=>{
    if(!sintomas){return;}
    let coin=d.palabras.filter(p=>sintomas.includes(p)).length;
    if(coin>maxCoin){maxCoin=coin;diag=d;}
  });
  if(!diag)diag={nombre:'Consulta general',especialista:'Dexi (Podología)',confianza:65,recs:['Revisión completa con especialista','Hidratación diaria','Usar calzado cómodo','Traé historial de síntomas']};
  if(maxCoin<2) diag.confianza=Math.max(60,diag.confianza-12);

  // Si hay imagen, subir ligeramente la confianza
  if(iaImageBase64) diag.confianza=Math.min(98,diag.confianza+5);

  $('iaDiagNombre').textContent=diag.nombre;
  setTimeout(()=>$('iaProgressFill').style.width=diag.confianza+'%',100);
  const ul=$('iaRecs'); ul.innerHTML='';
  diag.recs.forEach(r=>{const li=document.createElement('li');li.textContent=r;ul.appendChild(li);});
  $('iaEspecialista').textContent=diag.especialista;
  $('iaResultado').style.display='block';
  $('iaResultado').scrollIntoView({behavior:'smooth'});

  // Guardar para pre-rellenar reservas
  sessionStorage.setItem('ia_diag',JSON.stringify({diagnostico:diag.nombre,especialista:diag.especialista}));

  btn.disabled=false;btn.textContent='🔍 ANALIZAR DE NUEVO';
  beep(660,.12);
}

function iaReservar(){
  goTo('reservas');
  setTimeout(()=>{
    if(clienteActual){
      const iaDiag=sessionStorage.getItem('ia_diag');
      if(iaDiag){const d=JSON.parse(iaDiag);$('rservicio').value=d.diagnostico;}
    } else toast('Iniciá sesión primero','error');
  },300);
}

// ── ADMIN ──
function openAdminLogin(){$('modalAdmin').classList.add('show');}
function closeAdminLogin(){$('modalAdmin').classList.remove('show');}

function adminDoLogin(){
  const u=$('adminLoginUser').value.trim();
  const p=$('adminLoginPass').value;
  const users=getAdminUsers();
  const found=users.find(x=>x.usuario===u&&x.clave===p);
  if(!found){toast('Credenciales incorrectas','error');beep(220,.15);return;}
  adminActual={usuario:found.usuario,rol:found.rol};
  sessionStorage.setItem('dexysAdmin',JSON.stringify(adminActual));
  closeAdminLogin();
  goTo('admin');
  toast(`👑 Bienvenido ${found.usuario}`);
}

function adminLogout(){
  adminActual=null;sessionStorage.removeItem('dexysAdmin');
  goTo('inicio');
}

function adminTab(el,panel){
  document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.admin-panel').forEach(p=>p.classList.remove('active'));
  $('admin'+panel.charAt(0).toUpperCase()+panel.slice(1)).classList.add('active');
  const loaders={stats:adminLoadStats,reservas:adminLoadReservas,clientes:adminLoadClientes,profesionales:adminLoadProf,bloqueos:adminLoadBloqueos,usuarios:adminLoadUsers,inventario:adminLoadInventario,ventas:adminLoadVentas};
  loaders[panel]?.();
}

function renderAdmin(){
  if(!adminActual){goTo('inicio');return;}
  $('adminUser').textContent=adminActual.usuario;
  adminLoadStats();
  adminLoadProf();
  const sel=$('bloquearProf'); sel.innerHTML='<option value="todos">TODAS</option>';
  getProfesionales().forEach(p=>sel.innerHTML+=`<option value="${p.id}">${p.nombre}</option>`);
}


// ── ADMIN INVENTARIO ──
function adminLoadInventario(){
  const cont = $('adminInventario'); if(!cont) return;
  const inv = getInventario();
  const totalStock = inv.reduce((s,p)=>s+(p.stock||0),0);
  const bajoStock = inv.filter(p=>(p.stock||0)<=3);
  cont.innerHTML = `
    <div class="stat-grid" style="margin-bottom:16px">
      <div class="stat-card"><h4>PRODUCTOS</h4><div class="stat-num">${inv.length}</div><div class="stat-sub">en tienda</div></div>
      <div class="stat-card"><h4>STOCK TOTAL</h4><div class="stat-num">${totalStock}</div><div class="stat-sub">unidades</div></div>
      <div class="stat-card"><h4>BAJO STOCK</h4><div class="stat-num" style="color:${bajoStock.length?'#ff4466':'#00f5d4'}">${bajoStock.length}</div><div class="stat-sub">≤ 3 unidades</div></div>
    </div>
    <div class="admin-section-title">PRODUCTOS EN TIENDA</div>
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>FOTO/SVG</th><th>NOMBRE</th><th>TIPO</th><th>PRECIO</th><th>STOCK</th><th>ACCIONES</th></tr></thead>
      <tbody id="invTableBody"></tbody>
    </table>
    </div>
    <div class="admin-section-title" style="margin-top:20px">➕ AGREGAR PRODUCTO</div>
    <div class="admin-form-row" style="flex-wrap:wrap;gap:8px">
      <div class="form-field"><label>NOMBRE</label><input class="form-input" id="invNombre" type="text" placeholder="Nombre del producto"></div>
      <div class="form-field"><label>TIPO</label>
        <select class="form-input" id="invTipo" style="background:rgba(255,255,255,.06);color:white">
          <option value="colonia">Colonia</option>
          <option value="perfume">Perfume</option>
          <option value="servicio">Servicio</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div class="form-field"><label>PRECIO</label><input class="form-input" id="invPrecio" type="number" placeholder="0"></div>
      <div class="form-field"><label>STOCK INICIAL</label><input class="form-input" id="invStock" type="number" placeholder="0" value="0"></div>
      <div class="form-field"><label>DESCRIPCIÓN</label><input class="form-input" id="invDesc" type="text" placeholder="Descripción breve"></div>
      <div class="form-field"><label>NOTAS (separadas por coma)</label><input class="form-input" id="invNotas" type="text" placeholder="Nota1, Nota2, Nota3"></div>
      <div class="form-field" style="min-width:200px"><label>FOTO (URL o subir)</label>
        <input class="form-input" id="invFotoUrl" type="text" placeholder="https://... o dejar vacío">
        <input type="file" id="invFotoFile" accept="image/*" style="margin-top:6px;color:rgba(255,255,255,.6);font-size:.7rem" onchange="invLoadFoto(this)">
        <img id="invFotoPreview" style="display:none;width:60px;height:80px;object-fit:contain;margin-top:6px;border-radius:6px;border:1px solid rgba(255,255,255,.15)">
      </div>
      <button class="btn-primary" style="width:auto;padding:10px 20px;align-self:flex-end" onclick="adminAddProducto()">AGREGAR</button>
    </div>`;
  adminRenderInvTable(inv);
}

function invLoadFoto(input){
  const file = input.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    $('invFotoPreview').src = ev.target.result;
    $('invFotoPreview').style.display = 'block';
    $('invFotoUrl').value = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function adminRenderInvTable(inv){
  const tbody = $('invTableBody'); if(!tbody) return;
  tbody.innerHTML = '';
  inv.forEach(p=>{
    const sinStock = (p.stock||0)<=0;
    const bajoStock = (p.stock||0)<=3 && (p.stock||0)>0;
    const stockColor = sinStock?'#ff4466':bajoStock?'#ffd700':'#00f5d4';
    const imgHTML = p.foto
      ? `<img src="${p.foto}" style="width:36px;height:48px;object-fit:contain;border-radius:4px">`
      : (p.svg&&BOTTLE_SVGS[p.svg] ? `<div style="width:36px;height:48px;overflow:hidden">${BOTTLE_SVGS[p.svg]}</div>` : '🧴');
    tbody.innerHTML += `<tr>
      <td style="text-align:center">${imgHTML}</td>
      <td style="font-weight:600">${p.nombre}</td>
      <td><span class="badge-ok" style="background:rgba(0,245,212,.1)">${p.tipo}</span></td>
      <td>$${(p.precio||0).toLocaleString()}</td>
      <td>
        <span style="color:${stockColor};font-family:var(--font-display);font-size:.7rem">${p.stock||0}</span>
        <div style="display:flex;gap:4px;margin-top:4px">
          <button class="admin-btn" onclick="adminAjustarStock(${p.id},1)" title="Sumar 1">+1</button>
          <button class="admin-btn admin-btn-red" onclick="adminAjustarStock(${p.id},-1)" title="Restar 1">-1</button>
          <input type="number" id="stockSet_${p.id}" placeholder="N" style="width:44px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);color:white;border-radius:6px;padding:3px 5px;font-size:.65rem">
          <button class="admin-btn" onclick="adminSetStock(${p.id})" title="Poner exacto">SET</button>
        </div>
      </td>
      <td>
        <button class="admin-btn admin-btn-red" onclick="adminDelProducto(${p.id})">🗑</button>
      </td>
    </tr>`;
  });
}

function adminAjustarStock(id, delta){
  const inv = getInventario();
  const p = inv.find(x=>x.id===id);
  if(p){ p.stock = Math.max(0,(p.stock||0)+delta); setInventario(inv); adminRenderInvTable(inv); adminLoadStats(); toast(`Stock ${p.nombre}: ${p.stock}`); }
}

function adminSetStock(id){
  const val = parseInt($('stockSet_'+id)?.value);
  if(isNaN(val)||val<0){toast('Ingresá un número válido','error');return;}
  const inv = getInventario();
  const p = inv.find(x=>x.id===id);
  if(p){ p.stock=val; setInventario(inv); adminRenderInvTable(inv); adminLoadStats(); toast(`Stock ${p.nombre}: ${p.stock}`); }
}

function adminDelProducto(id){
  if(!confirm('¿Eliminar este producto?')) return;
  let inv = getInventario().filter(x=>x.id!==id);
  setInventario(inv); adminLoadInventario(); toast('Producto eliminado');
}

function adminAddProducto(){
  const nombre = $('invNombre').value.trim();
  const tipo   = $('invTipo').value;
  const precio = parseInt($('invPrecio').value)||0;
  const stock  = parseInt($('invStock').value)||0;
  const desc   = $('invDesc').value.trim();
  const notas  = $('invNotas').value.split(',').map(x=>x.trim()).filter(Boolean);
  const foto   = $('invFotoUrl').value.trim();
  if(!nombre) return toast('Ingresá el nombre del producto','error');
  const inv = getInventario();
  const newId = Math.max(0,...inv.map(x=>x.id))+1;
  inv.push({id:newId,nombre,tipo,precio,stock,desc,notas,foto,svg:''});
  setInventario(inv);
  $('invNombre').value='';$('invPrecio').value='';$('invStock').value='0';$('invDesc').value='';$('invNotas').value='';$('invFotoUrl').value='';
  $('invFotoPreview').style.display='none';
  adminLoadInventario(); toast('✅ Producto agregado'); renderTienda();
}

// ── ADMIN VENTAS ──
function adminLoadVentas(){
  const cont = $('adminVentas'); if(!cont) return;
  const compras = getCompras().sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const totalVentas = compras.reduce((s,c)=>s+(c.precio||0),0);
  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = compras.filter(c=>c.fecha.startsWith(hoy)).reduce((s,c)=>s+(c.precio||0),0);
  // Productos más vendidos
  const vendMap = new Map();
  compras.forEach(c=>{ vendMap.set(c.producto,(vendMap.get(c.producto)||0)+1); });
  const topVendidos = [...vendMap.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);

  cont.innerHTML = `
    <div class="stat-grid" style="margin-bottom:16px">
      <div class="stat-card"><h4>TOTAL VENTAS</h4><div class="stat-num">$${totalVentas.toLocaleString()}</div><div class="stat-sub">histórico</div></div>
      <div class="stat-card"><h4>VENTAS HOY</h4><div class="stat-num">$${ventasHoy.toLocaleString()}</div><div class="stat-sub">${compras.filter(c=>c.fecha.startsWith(hoy)).length} compras</div></div>
      <div class="stat-card"><h4>COMPRAS TOTALES</h4><div class="stat-num">${compras.length}</div><div class="stat-sub">transacciones</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div>
        <div class="admin-section-title">🏆 MÁS VENDIDOS</div>
        <table class="admin-table"><thead><tr><th>PRODUCTO</th><th>UNIDADES</th></tr></thead><tbody>
          ${topVendidos.map(([nombre,qty])=>`<tr><td>${nombre}</td><td style="color:var(--c-dorado);font-family:var(--font-display)">${qty}</td></tr>`).join('')||'<tr><td colspan="2" style="text-align:center;color:rgba(255,255,255,.3)">Sin ventas</td></tr>'}
        </tbody></table>
      </div>
      <div>
        <div class="admin-section-title">📦 STOCK ACTUAL</div>
        <table class="admin-table"><thead><tr><th>PRODUCTO</th><th>STOCK</th></tr></thead><tbody>
          ${getInventario().map(p=>{
            const sc=(p.stock||0)<=0?'#ff4466':(p.stock||0)<=3?'#ffd700':'#00f5d4';
            return `<tr><td>${p.nombre}</td><td style="color:${sc};font-family:var(--font-display)">${p.stock||0}</td></tr>`;
          }).join('')}
        </tbody></table>
      </div>
    </div>
    <div class="admin-section-title">HISTORIAL DE VENTAS</div>
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>FECHA</th><th>CLIENTE</th><th>PRODUCTO</th><th>TIPO</th><th>PRECIO</th></tr></thead>
      <tbody>
        ${compras.slice(0,50).map(c=>`<tr>
          <td>${new Date(c.fecha).toLocaleDateString('es-CO')}</td>
          <td>${c.clienteNombre||'—'}</td>
          <td>${c.producto}</td>
          <td><span class="badge-ok" style="background:rgba(0,245,212,.08)">${c.tipo||'—'}</span></td>
          <td style="color:var(--c-dorado)">$${(c.precio||0).toLocaleString()}</td>
        </tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:rgba(255,255,255,.3);padding:20px">Sin ventas registradas</td></tr>'}
      </tbody>
    </table>
    </div>`;
}

function adminLoadStats(){
  const reservas=getReservas();const clientes=getClientes();const compras=getCompras();
  const profs=getProfesionales();
  const ventas=compras.reduce((s,c)=>s+(c.precio||0),0);
  const hoy=new Date().toISOString().split('T')[0];
  const resHoy=reservas.filter(r=>r.fecha===hoy).length;
  $('adminStatGrid').innerHTML=`
    <div class="stat-card"><h4>RESERVAS TOTALES</h4><div class="stat-num">${reservas.length}</div><div class="stat-sub">📅 ${resHoy} hoy</div></div>
    <div class="stat-card"><h4>CLIENTES REGISTRADOS</h4><div class="stat-num">${clientes.length}</div><div class="stat-sub">👤 activos</div></div>
    <div class="stat-card"><h4>VENTAS TIENDA</h4><div class="stat-num">$${ventas.toLocaleString()}</div><div class="stat-sub">🛍️ ${compras.length} compras</div></div>
    <div class="stat-card" onclick="adminTab(document.querySelector('[data-atab=ventas]'),'ventas')" style="cursor:pointer"><h4>STOCK TOTAL</h4><div class="stat-num">${getInventario().reduce((s,p)=>s+(p.stock||0),0)}</div><div class="stat-sub">📦 ${getInventario().filter(p=>(p.stock||0)<=3).length} bajo stock</div></div>
    <div class="stat-card"><h4>PROFESIONALES ACTIVAS</h4><div class="stat-num">${profs.filter(p=>p.activa).length}/${profs.length}</div><div class="stat-sub">👩 disponibles</div></div>
    <div class="stat-card"><h4>TOP PROFESIONAL</h4><div class="stat-num" style="font-size:1.4rem">${adminTopProf(reservas)}</div><div class="stat-sub">más reservas</div></div>
    <div class="stat-card"><h4>PUNTOS EN CIRCULACIÓN</h4><div class="stat-num">${clientes.reduce((s,c)=>s+getPuntos(c.cedula),0)}</div><div class="stat-sub">⭐ total sistema</div></div>`;
}

function adminTopProf(reservas){
  const m=new Map(); reservas.forEach(r=>{m.set(r.profesionalNombre,(m.get(r.profesionalNombre)||0)+1);});
  if(!m.size) return '—';
  return [...m.entries()].sort((a,b)=>b[1]-a[1])[0][0];
}

function adminLoadReservas(){
  const tbody=$('adminResTable'); tbody.innerHTML='';
  const reservas=getReservas();
  const hoy=new Date().toISOString().split('T')[0];
  const lista=reservas.filter(r=>r.fecha>=hoy).sort((a,b)=>a.fecha.localeCompare(b.fecha)).slice(0,30);
  if(!lista.length){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:rgba(255,255,255,.3);padding:20px">No hay reservas próximas</td></tr>';return;}
  lista.forEach(r=>{
    tbody.innerHTML+=`<tr><td>${r.fecha} ${r.hora}</td><td>${r.cliente}</td><td>${r.profesionalNombre}</td><td>${r.servicio||'—'}</td><td><span class="badge-ok">${r.estado}</span></td><td><button class="admin-btn admin-btn-red" onclick="adminCancelRes(${r.id})">✕ Cancelar</button></td></tr>`;
  });
}

function adminCancelRes(id){
  if(!confirm('¿Cancelar esta reserva?'))return;
  let r=getReservas();r=r.filter(x=>x.id!==id);LS.set('reservas',r);
  adminLoadReservas();adminLoadStats();toast('Reserva cancelada');
}

function adminLoadClientes(){
  const tbody=$('adminCliTable'); tbody.innerHTML='';
  const clientes=getClientes();
  if(!clientes.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:rgba(255,255,255,.3);padding:20px">No hay clientes registrados</td></tr>';return;}
  clientes.forEach(c=>{
    const res=getReservas().filter(r=>r.cedula===c.cedula).length;
    const comp=getCompras().filter(x=>x.cedula===c.cedula).length;
    const pts=getPuntos(c.cedula);
    const niv=getNivel(pts);
    tbody.innerHTML+=`<tr><td>${c.cedula}</td><td>${c.nombre}</td><td>${c.telefono||'—'}</td><td>${c.email||'—'}</td><td>${res}</td><td>${comp}</td><td>${pts}</td><td><span style="color:${niv.color};font-family:var(--font-display);font-size:.6rem">${niv.icon} ${niv.nombre}</span></td></tr>`;
  });
}

function adminLoadProf(){
  const tbody=$('adminProfTable'); tbody.innerHTML='';
  getProfesionales().forEach(p=>{
    tbody.innerHTML+=`<tr><td>${p.emoji} ${p.nombre}</td><td>${p.especialidad}</td><td><span class="${p.activa?'badge-ok':'badge-err'}">${p.activa?'✓ ACTIVA':'✕ INACTIVA'}</span></td><td><button class="admin-btn ${p.activa?'admin-btn-red':'admin-btn-green'}" onclick="adminToggleProf(${p.id})">${p.activa?'Desactivar':'Activar'}</button></td></tr>`;
  });
}

function adminToggleProf(id){
  let profs=getProfesionales(); const p=profs.find(x=>x.id===id);
  if(p){p.activa=!p.activa;LS.set('profesionales',profs);adminLoadProf();renderProfesionales();toast(`${p.nombre}: ${p.activa?'activada':'desactivada'}`);}
}

function adminLoadBloqueos(){
  const tbody=$('adminBloquTable'); tbody.innerHTML='';
  const bloqueos=getBloqueos();
  if(!bloqueos.length){tbody.innerHTML='<tr><td colspan="4" style="text-align:center;color:rgba(255,255,255,.3);padding:16px">Sin bloqueos activos</td></tr>';return;}
  bloqueos.forEach(b=>{
    const profNombre=b.profesional==='todos'?'TODAS':getProfesionales().find(p=>p.id===b.profesional)?.nombre||'—';
    tbody.innerHTML+=`<tr><td>${profNombre}</td><td>${b.fecha}</td><td>${b.motivo||'—'}</td><td><button class="admin-btn admin-btn-red" onclick="adminDelBloqueo(${b.id})">🗑 Eliminar</button></td></tr>`;
  });
}

function adminBloquear(){
  const prof=$('bloquearProf').value;
  const fecha=$('bloquearFecha').value;
  const motivo=$('bloquearMotivo').value.trim();
  if(!fecha)return toast('Seleccioná una fecha','error');
  const bloqueos=getBloqueos();
  const profNombre=prof==='todos'?'TODAS':getProfesionales().find(p=>p.id===parseInt(prof))?.nombre||prof;
  bloqueos.push({id:Date.now(),profesional:prof==='todos'?'todos':parseInt(prof),profesionalNombre:profNombre,fecha,motivo:motivo||'Sin motivo',creado:new Date().toISOString()});
  LS.set('bloqueos',bloqueos);adminLoadBloqueos();
  $('bloquearFecha').value='';$('bloquearMotivo').value='';
  toast('✅ Día bloqueado');renderCalendario();
}

function adminDelBloqueo(id){
  let b=getBloqueos();b=b.filter(x=>x.id!==id);LS.set('bloqueos',b);
  adminLoadBloqueos();renderCalendario();toast('Bloqueo eliminado');
}

function adminLoadUsers(){
  const tbody=$('adminUsrTable'); tbody.innerHTML='';
  const users=getAdminUsers();
  users.forEach(u=>{
    tbody.innerHTML+=`<tr><td style="font-family:var(--font-display);font-size:.7rem">${u.usuario}</td><td><span class="${u.rol==='admin'?'badge-ok':'badge-warn'}">${u.rol}</span></td><td><span style="color:rgba(255,255,255,.4);font-size:.7rem">${u.tipo||'custom'}</span></td><td>${u.tipo==='default'?'<span style="color:rgba(255,255,255,.25);font-size:.65rem">protegido</span>':`<button class="admin-btn admin-btn-red" onclick="adminDelUser('${u.usuario}')">✕</button>`}</td></tr>`;
  });
}

function adminAddUser(){
  const u=$('nuAdminUser').value.trim();
  const p=$('nuAdminPass').value;
  const r=$('nuAdminRol').value;
  if(!u||!p)return toast('Completá usuario y contraseña','error');
  const all=getAdminUsers();
  if(all.find(x=>x.usuario===u))return toast('Ese usuario ya existe','error');
  const extra=LS.get('adminUsers',[]);
  extra.push({usuario:u,clave:p,rol:r,tipo:'custom'});
  LS.set('adminUsers',extra);adminLoadUsers();
  $('nuAdminUser').value='';$('nuAdminPass').value='';
  toast('✅ Usuario creado');
}

function adminDelUser(usuario){
  if(!confirm(`¿Eliminar usuario ${usuario}?`))return;
  let extra=LS.get('adminUsers',[]);extra=extra.filter(u=>u.usuario!==usuario);
  LS.set('adminUsers',extra);adminLoadUsers();toast('Usuario eliminado');
}

