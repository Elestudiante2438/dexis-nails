// ═══════════════════════════════════════════════════
// DEXI'S NAILS — Juego Arcadia v3 (game.js)
// Space Shooter + Torre Defensa híbrido
// ═══════════════════════════════════════════════════

// ── Utilidad ────────────────────────────────────────
function gById(id){ return document.getElementById(id); }
function rand(a,b){ return a + Math.random()*(b-a); }
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function lerp(a,b,t){ return a+(b-a)*t; }

// ── Estado global del juego ──────────────────────────
let G = {};
let gAnimId = null;
let gCanvas, gCtx;
// gameActive se define/usa desde app.js — no redefinir aquí

// ── Constantes ───────────────────────────────────────
const GCOL = {
  fucsia:   '#ff1493',
  turquesa: '#00f5d4',
  morado:   '#9b5de5',
  dorado:   '#ffd700',
  azul:     '#00b4d8',
  fondo:    '#03040e',
};
const SHIP_COOLDOWN = 150;
const SHIP_SPEED    = 5.5;
const BULLET_SPEED  = 14;
const MAX_LB        = 5;

const POWER_DEFS = [
  { type:'triple', icon:'🔱', color:'#ffd700',   label:'Triple Disparo', duration:8000 },
  { type:'shield', icon:'🛡️', color:'#00b4d8',   label:'Escudo',         duration:6000 },
  { type:'speed',  icon:'⚡',  color:'#00f5d4',   label:'Turbo',          duration:6000 },
  { type:'rapid',  icon:'🔥',  color:'#ff1493',   label:'Disparo Rápido', duration:7000 },
];

// ═══════════════════════════════════════════════════
//  startGame — punto de entrada
// ═══════════════════════════════════════════════════
function startGame(){
  // ── Detener loop anterior si existe ──
  if(gAnimId){ cancelAnimationFrame(gAnimId); gAnimId = null; }
  gUnbindInput();
  gameActive = true;

  const sec = gById('secJuego');
  // Preservar el video de fondo, solo eliminar canvas y HUD anteriores
  ['gCanvas','gHud','gOver'].forEach(id=>{ const el=document.getElementById(id); if(el) el.remove(); });
  const oldCanvas = sec.querySelector('canvas'); if(oldCanvas) oldCanvas.remove();
  const oldHud = sec.querySelector('#gHud'); if(oldHud) oldHud.remove();
  sec.style.cssText = 'display:block;cursor:none;position:relative;inset:;z-index:1;background:transparent;overflow:hidden;width:100%;height:100%;min-height:400px';

  // Asegurar que el video esté presente y sonando
  let vidBg = document.getElementById('juegoVideoBg');
  if(!vidBg){
    vidBg = document.createElement('video');
    vidBg.id = 'juegoVideoBg';
    vidBg.loop = true; vidBg.playsInline = true; vidBg.muted = true;
    vidBg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none';
    const src = document.createElement('source');
    src.src = 'Universo.mp4'; src.type = 'video/mp4';
    vidBg.appendChild(src);
    sec.insertBefore(vidBg, sec.firstChild);
  } else {
    // Moverlo al inicio para que quede detrás
    sec.insertBefore(vidBg, sec.firstChild);
  }
  vidBg.muted = false; vidBg.volume = 0.75;
  vidBg.play().catch(()=>{ vidBg.muted=true; vidBg.play(); });

  // ── Canvas encima del video ──
  gCanvas = document.createElement('canvas');
  gCanvas.id = 'gCanvas';
  gCanvas.style.cssText = 'position:absolute;inset:0;display:block;z-index:1;background:transparent';
  gCanvas.width  = sec.offsetWidth  || window.innerWidth;
  gCanvas.height = sec.offsetHeight || window.innerHeight;
  sec.appendChild(gCanvas);
  gCtx = gCanvas.getContext('2d');

  // ── HUD — todo dentro del rectángulo ──
  const hud = document.createElement('div');
  hud.id = 'gHud';
  hud.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:10;overflow:hidden';
  hud.innerHTML = `
    <div id="gHudScore" style="position:absolute;top:10px;left:14px;font-family:'Orbitron',sans-serif;font-size:.78rem;color:${GCOL.dorado};text-shadow:0 0 12px ${GCOL.dorado};letter-spacing:2px">⭐ 0</div>
    <div id="gHudWave"  style="position:absolute;top:10px;left:50%;transform:translateX(-50%);font-family:'Orbitron',sans-serif;font-size:.7rem;color:${GCOL.turquesa};letter-spacing:3px;white-space:nowrap">OLEADA 1</div>
    <div id="gHudLives" style="position:absolute;top:10px;right:14px;font-size:.95rem">❤️❤️❤️</div>
    <button id="gBtnSalir" style="position:absolute;top:10px;left:50%;transform:translateX(-50%) translateY(26px);background:rgba(0,0,0,.6);border:1px solid rgba(0,245,212,.5);color:${GCOL.turquesa};padding:3px 12px;border-radius:20px;font-family:'Orbitron',sans-serif;font-size:.48rem;letter-spacing:1px;cursor:pointer;pointer-events:all;backdrop-filter:blur(8px);z-index:20;white-space:nowrap">✕ SALIR</button>
    <div id="gPowerIcons" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:6px"></div>
    <div id="gCoolWrap" style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.06)">
      <div id="gCoolFill" style="height:100%;width:0%;background:linear-gradient(90deg,${GCOL.fucsia},${GCOL.turquesa})"></div>
    </div>
    <button id="gBtnTele" title="Teletransportación [T]" style="position:absolute;bottom:12px;right:14px;width:40px;height:40px;border-radius:50%;background:rgba(155,93,229,.25);border:2px solid ${GCOL.morado};color:${GCOL.morado};font-size:1.1rem;cursor:pointer;pointer-events:all;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);z-index:20" onclick="gTeleport()">🌀</button>
    <div id="gWaveAnn" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Orbitron',sans-serif;font-size:clamp(1.5rem,5vw,3rem);font-weight:900;color:${GCOL.dorado};text-shadow:0 0 60px ${GCOL.dorado};pointer-events:none;opacity:0;letter-spacing:6px;transition:opacity .4s;white-space:nowrap;z-index:20">OLEADA 1</div>
  `;
  sec.appendChild(hud);
  gById('gBtnSalir').addEventListener('click', ()=>{ gMusicStop(); goTo('inicio'); });

  // ── Game Over ──
  const over = document.createElement('div');
  over.id = 'gOver';
  over.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(14px);z-index:500;display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;box-sizing:border-box;overflow-y:auto;pointer-events:all`;
  over.innerHTML = `
    <div style="font-family:'Orbitron',sans-serif;font-size:clamp(1.2rem,6vw,2.5rem);color:${GCOL.fucsia};text-shadow:0 0 40px ${GCOL.fucsia};letter-spacing:4px;text-align:center">💀 GAME OVER</div>
    <div id="gOverScore" style="font-family:'Orbitron',sans-serif;font-size:clamp(.85rem,4vw,1.3rem);color:${GCOL.dorado};text-align:center">Puntuación: 0</div>
    <div id="gOverWave"  style="font-family:'Orbitron',sans-serif;font-size:clamp(.55rem,2.5vw,.7rem);color:rgba(255,215,0,.6);text-align:center"></div>
    <div id="gLeaderboard" style="margin-top:8px;width:min(280px,90%)"></div>
    <button id="gBtnRestart" style="margin-top:8px;background:linear-gradient(135deg,${GCOL.fucsia},${GCOL.morado});border:none;color:white;padding:10px 32px;border-radius:30px;font-family:'Orbitron',sans-serif;font-size:clamp(.6rem,3vw,.75rem);letter-spacing:2px;cursor:pointer;pointer-events:all">▶ REINICIAR</button>
  `;
  sec.appendChild(over);
  const btnR = over.querySelector('#gBtnRestart');
  btnR.style.zIndex = '9999';
  btnR.style.position = 'relative';
  btnR.onclick = ()=>{ gameRestart(); };
  btnR.addEventListener('touchstart', e=>{ e.stopPropagation(); gameRestart(); },{passive:false});

  // ── CSS animaciones ──
  gInjectCSS();

  // ── Listeners ──
  window.addEventListener('resize', gResize);
  gBindInput();

  // ── Init state ──
  gInitState();

  // ── Loop ──
  if(gAnimId) cancelAnimationFrame(gAnimId);
  gAnimId = null;
  gEnemyBullets = [];
  gTick();
  // Audio viene del video — no iniciar sintetizador
  // gMusicStart();
}

function gResize(){
  if(!gCanvas) return;
  const sec = gById('secJuego');
  gCanvas.width  = sec.offsetWidth  || window.innerWidth;
  gCanvas.height = sec.offsetHeight || window.innerHeight;
  if(G.ship){
    G.ship.x = clamp(G.ship.x, 0, gCanvas.width);
    G.ship.y = clamp(G.ship.y, 0, gCanvas.height);
  }
  if(G.stars) G.stars = gGenStars(120);
}

// ═══════════════════════════════════════════════════
//  Estado
// ═══════════════════════════════════════════════════
function gInitState(){
  const W = gCanvas.width, H = gCanvas.height;
  G = {
    W, H,
    ship: {
      x: W/2, y: H/2,
      rot: -Math.PI/2,
      radius: 22,
      invincible: false,
      invTimer: 0,
      blinkTimer: 0,
    },
    mouse: { x: W/2, y: H/2 },
    bullets: [],
    enemies: [],
    particles: [],
    stars: gGenStars(120),
    score: 0,
    lives: 3,
    wave: 1,
    waveTimer: 0,
    waveState: 'announcing',
    spawnQueue: [],
    spawnTimer: 0,
    lastShot: 0,
    running: true,
    powers: [],
    powerDrops: [],
    keys: {},
    touchDir: { x:0, y:0 },
    frameCount: 0,
    shake: 0,
    teleportCd: 0,   // cooldown teletransportación en frames (5 seg = ~300 frames)
  };
  gBuildWave(1);
  gUpdateHUD();
}

// ═══════════════════════════════════════════════════
//  Estrellas
// ═══════════════════════════════════════════════════
function gGenStars(n){
  const W = gCanvas.width, H = gCanvas.height;
  return Array.from({length:n}, ()=>({
    x: rand(0,W), y: rand(0,H),
    r: rand(0.3,1.8),
    a: rand(0.2,1),
    twinkle: rand(0,Math.PI*2),
    speed: rand(0.01,0.03),
  }));
}

// ═══════════════════════════════════════════════════
//  Oleadas
// ═══════════════════════════════════════════════════
function gBuildWave(wave){
  const queue = [];
  const base = 4 + wave * 2;

  for(let i=0; i<base; i++){
    const size = wave < 3 ? 'big' : (Math.random()<.4 ? 'big':'medium');
    queue.push({ type:'asteroid', size, delay: i * 380 });
  }

  if(wave >= 2){
    const fc = Math.min(2 + wave, 8);
    for(let i=0;i<fc;i++)
      queue.push({ type:'formation', index:i, total:fc, delay: 1300 + i*160 });
  }

  if(wave >= 3){
    const kc = Math.min(wave - 1, 6);
    for(let i=0;i<kc;i++)
      queue.push({ type:'kamikaze', delay: 2300 + i*550 });
  }

  if(wave >= 4 && wave % 3 === 0)
    queue.push({ type:'tank', delay: 3200 });

  G.spawnQueue = queue;
  G.spawnTimer = 0;
  G.waveState  = 'announcing';
  G.waveTimer  = 130;

  const ann = gById('gWaveAnn');
  if(ann){
    ann.textContent = wave === 1 ? '¡COMIENZA!' : `OLEADA ${wave}`;
    ann.style.opacity = '1';
    setTimeout(()=>{ if(ann) ann.style.opacity='0'; }, 1800);
  }
}

function gSpawnEnemy(spec){
  const W = G.W, H = G.H;
  let x, y;
  const side = Math.floor(rand(0,4));
  if(side===0){x=rand(0,W);y=-70;}
  else if(side===1){x=W+70;y=rand(0,H);}
  else if(side===2){x=rand(0,W);y=H+70;}
  else{x=-70;y=rand(0,H);}

  const wave = G.wave;

  if(spec.type==='asteroid'){
    const sz = { big:{r:30,hp:3,pts:100,spd:.9}, medium:{r:20,hp:2,pts:60,spd:1.3}, small:{r:12,hp:1,pts:30,spd:1.8} };
    const s = sz[spec.size||'big'];
    G.enemies.push({
      type:'asteroid', x, y, radius:s.r+rand(-3,3),
      hp:s.hp, maxHp:s.hp, pts:s.pts,
      speed:s.spd*(1+(wave-1)*0.1),
      rot:rand(0,Math.PI*2), rotSpd:rand(-.025,.025),
      color:gRandRock(), craters:gGenCraters(s.r), size:spec.size||'big', ai:'chase',
    });
  }
  else if(spec.type==='formation'){
    const total=spec.total||5, idx=spec.index||0;
    x = W/2 + (idx-(total-1)/2)*55; y=-60;
    G.enemies.push({
      type:'formation', x, y, radius:16,
      hp:2, maxHp:2, pts:80,
      speed:1.4+wave*.08,
      rot:0, rotSpd:.04,
      color:GCOL.morado, ai:'formation',
      formIndex:idx, formTotal:total, phase:0, phaseTimer:0,
    });
  }
  else if(spec.type==='kamikaze'){
    const spd = 3.5+wave*.15;
    const dx=G.ship.x-x, dy=G.ship.y-y, len=Math.hypot(dx,dy)||1;
    G.enemies.push({
      type:'kamikaze', x, y,
      vx:dx/len*spd, vy:dy/len*spd,
      radius:10, hp:1, maxHp:1, pts:50,
      speed:spd, rot:Math.atan2(dy,dx),
      rotSpd:0, color:GCOL.fucsia, ai:'kamikaze',
    });
  }
  else if(spec.type==='tank'){
    G.enemies.push({
      type:'tank', x, y, vx:0, vy:0,
      radius:44, hp:8+wave, maxHp:8+wave, pts:500,
      speed:.6+wave*.05, rot:0, rotSpd:.008,
      color:'#8B4513', ai:'chase',
    });
  }
}

// Planetas del sistema solar como enemigos
const PLANETS = [
  { name:'Mercurio', color:'#b5b5b5', glow:'#c8c8c8', size:'small'  },
  { name:'Venus',    color:'#e8cda0', glow:'#f5e0a0', size:'medium' },
  { name:'Tierra',   color:'#4fa3e0', glow:'#00bfff', size:'medium' },
  { name:'Marte',    color:'#c1440e', glow:'#ff4500', size:'medium' },
  { name:'Júpiter',  color:'#c88b3a', glow:'#ffa500', size:'big'    },
  { name:'Saturno',  color:'#e4d191', glow:'#ffd700', size:'big'    },
  { name:'Urano',    color:'#7de8e8', glow:'#00f5d4', size:'big'    },
  { name:'Neptuno',  color:'#5b5ddf', glow:'#7b8cde', size:'big'    },
];
function gRandPlanet(preferSize){
  const pool = preferSize ? PLANETS.filter(p=>p.size===preferSize) : PLANETS;
  return pool.length ? pool[Math.floor(rand(0,pool.length))] : PLANETS[Math.floor(rand(0,PLANETS.length))];
}
function gRandRock(){
  const c=['#c0c0c0','#a9a9a9','#808080','#696969','#4a4a4a','#8B4513','#A0522D','#b5b5b5'];
  return c[Math.floor(rand(0,c.length))];
}
function gGenCraters(r){
  return Array.from({length:Math.floor(rand(2,5))},()=>({
    x:rand(-r*.5,r*.5), y:rand(-r*.5,r*.5), r:rand(r*.1,r*.3),
  }));
}

// ═══════════════════════════════════════════════════
//  Power-ups
// ═══════════════════════════════════════════════════
function gDropPower(x,y){
  if(Math.random()>0.28) return;
  const def = POWER_DEFS[Math.floor(rand(0,POWER_DEFS.length))];
  G.powerDrops.push({...def, x, y, vy:-1.5, life:360, maxLife:360, bob:rand(0,Math.PI*2)});
}
function gCollectPower(drop){
  G.powers = G.powers.filter(p=>p.type!==drop.type);
  G.powers.push({ type:drop.type, timer:drop.duration, maxTimer:drop.duration });
  gShowToast(`${drop.icon} ${drop.label}`, drop.color);
  gParticleBurst(drop.x, drop.y, drop.color, 18, 60);
  gUpdatePowerIcons();
}
function gHasPower(t){ return G.powers.some(p=>p.type===t); }

// ═══════════════════════════════════════════════════
//  Input
// ═══════════════════════════════════════════════════
function gBindInput(){
  const sec = gById('secJuego');
  sec.addEventListener('mousemove', e=>{
    const r=gCanvas.getBoundingClientRect();
    G.mouse.x=e.clientX-r.left; G.mouse.y=e.clientY-r.top;
  },{passive:true});
  sec.addEventListener('mousedown', e=>{ if(e.button===0) gShoot(); });
  sec.addEventListener('contextmenu', e=>e.preventDefault());
  // ── TOUCH: nave sigue el dedo ──
  G.touchTarget = null;
  sec.addEventListener('touchstart', e=>{
    e.preventDefault();
    if(e.touches.length){
      const r=gCanvas.getBoundingClientRect();
      const tx=e.touches[0].clientX-r.left;
      const ty=e.touches[0].clientY-r.top;
      G.touchTarget = {x:tx, y:ty};
      G.mouse.x=tx; G.mouse.y=ty;
      gShoot();
    }
  },{passive:false});
  sec.addEventListener('touchmove', e=>{
    e.preventDefault();
    if(e.touches.length){
      const r=gCanvas.getBoundingClientRect();
      const tx=e.touches[0].clientX-r.left;
      const ty=e.touches[0].clientY-r.top;
      G.touchTarget = {x:tx, y:ty};
      G.mouse.x=tx; G.mouse.y=ty;
    }
  },{passive:false});
  sec.addEventListener('touchend', e=>{
    e.preventDefault();
    G.touchTarget = null;
    G.touchDir.x=0; G.touchDir.y=0;
  },{passive:false});
  document.addEventListener('keydown', gKeyDown);
  document.addEventListener('keyup',   gKeyUp);
}
function gKeyDown(e){
  if(!gameActive) return;
  G.keys[e.code]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  if(e.code==='Space') gShoot();
  if(e.code==='KeyT')  gTeleport();
}
function gKeyUp(e){ if(G.keys) G.keys[e.code]=false; }
function gUnbindInput(){
  document.removeEventListener('keydown',gKeyDown);
  document.removeEventListener('keyup',  gKeyUp);
  window.removeEventListener('resize',  gResize);
}

// ═══════════════════════════════════════════════════
//  Teletransportación
// ═══════════════════════════════════════════════════
function gTeleport(){
  if(!G.running||!gameActive) return;
  if(G.teleportCd > 0) return;

  // Efecto en posición vieja
  gParticleBurst(G.ship.x, G.ship.y, GCOL.morado, 24, 90);

  // Nueva posición aleatoria lejos de enemigos
  let nx, ny, attempts = 0;
  do {
    nx = rand(40, G.W - 40);
    ny = rand(40, G.H - 40);
    attempts++;
  } while(attempts < 20 && G.enemies.some(e => Math.hypot(e.x-nx, e.y-ny) < 100));

  G.ship.x = nx;
  G.ship.y = ny;
  G.mouse.x = nx;
  G.mouse.y = ny - 100; // apuntar arriba por defecto

  // Efecto en posición nueva
  gParticleBurst(G.ship.x, G.ship.y, GCOL.turquesa, 24, 90);

  // Invincibilidad breve
  G.ship.invincible = true;
  G.ship.invTimer   = 60;
  G.ship.blinkTimer = 0;

  G.teleportCd = 300; // 5 segundos a 60fps
  beep(660, 0.1, 0.2);
  gShowToast('🌀 Teletransportado', GCOL.morado);
}

// ═══════════════════════════════════════════════════
//  Disparo
// ═══════════════════════════════════════════════════
function gShoot(){
  if(!G.running||!gameActive) return;
  const cd = gHasPower('rapid') ? SHIP_COOLDOWN*.4 : SHIP_COOLDOWN;
  if(Date.now()-G.lastShot < cd) return;
  G.lastShot = Date.now();

  const sx=G.ship.x, sy=G.ship.y;
  const dx=G.mouse.x-sx, dy=G.mouse.y-sy;
  const len=Math.hypot(dx,dy)||1;
  const nx=dx/len, ny=dy/len;

  const mkB=(ox,oy,vx,vy)=>({
    x:sx+nx*36+ox, y:sy+ny*36+oy,
    vx, vy,
    life:80, r:gHasPower('triple')?5:4,
    color:gHasPower('rapid')?GCOL.fucsia:GCOL.turquesa,
  });
  G.bullets.push(mkB(0,0,nx*BULLET_SPEED,ny*BULLET_SPEED));
  if(gHasPower('triple')){
    const base=Math.atan2(ny,nx);
    G.bullets.push(mkB(0,0,Math.cos(base+.25)*BULLET_SPEED,Math.sin(base+.25)*BULLET_SPEED));
    G.bullets.push(mkB(0,0,Math.cos(base-.25)*BULLET_SPEED,Math.sin(base-.25)*BULLET_SPEED));
  }
  beep(1200,.04,.05);
}

// ═══════════════════════════════════════════════════
//  Partículas
// ═══════════════════════════════════════════════════
function gParticleBurst(x,y,color,count=12,spread=50){
  for(let i=0;i<count;i++){
    const a=rand(0,Math.PI*2), spd=rand(1,spread/15);
    G.particles.push({x,y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:rand(20,50),maxLife:50,r:rand(2,6),color});
  }
}
function gTrailFx(x,y,rot){
  const bx=-Math.cos(rot)*22,by=-Math.sin(rot)*22;
  const px=-Math.sin(rot),py=Math.cos(rot);
  [[-8,'#00f5d4'],[0,'#7fff00'],[8,'#00f5d4']].forEach(([o,c])=>{
    G.particles.push({
      x:x+bx+px*o,y:y+by+py*o,
      vx:(-Math.cos(rot)+rand(-.2,.2))*1.5,
      vy:(-Math.sin(rot)+rand(-.2,.2))*1.5,
      life:rand(14,28),maxLife:28,r:rand(2,5),color:c,
    });
  });
}

// ═══════════════════════════════════════════════════
//  Update
// ═══════════════════════════════════════════════════
let gEnemyBullets = [];

function gUpdate(){
  if(!G.running) return;
  G.frameCount++;
  G.W = gCanvas.width; G.H = gCanvas.height;
  G.shake = Math.max(0, G.shake-.6);

  // Wave announcing
  if(G.waveState==='announcing'){
    if(--G.waveTimer<=0) G.waveState='spawning';
    return;
  }

  // Spawn queue
  if(G.waveState==='spawning' && G.spawnQueue.length>0){
    G.spawnTimer++;
    while(G.spawnQueue.length && G.spawnTimer >= G.spawnQueue[0].delay/16.6){
      gSpawnEnemy(G.spawnQueue.shift());
    }
    if(G.spawnQueue.length===0) G.waveState='playing';
  }

  // Siguiente oleada
  if(G.waveState==='playing' && G.enemies.length===0 && G.spawnQueue.length===0){
    G.wave++;
    gUpdateHUD();
    gBuildWave(G.wave);
    return;
  }

  // Nave — movimiento
  let dx=0,dy=0;
  if(G.keys['ArrowUp']   ||G.keys['KeyW']) dy-=SHIP_SPEED;
  if(G.keys['ArrowDown'] ||G.keys['KeyS']) dy+=SHIP_SPEED;
  if(G.keys['ArrowLeft'] ||G.keys['KeyA']) dx-=SHIP_SPEED;
  if(G.keys['ArrowRight']||G.keys['KeyD']) dx+=SHIP_SPEED;
  // Móvil: mover nave hacia donde está el dedo
  if(G.touchTarget){
    const tdx=G.touchTarget.x - G.ship.x;
    const tdy=G.touchTarget.y - G.ship.y;
    const tdist=Math.hypot(tdx,tdy);
    if(tdist>8){
      dx += (tdx/tdist)*SHIP_SPEED;
      dy += (tdy/tdist)*SHIP_SPEED;
    }
  } else {
    dx+=G.touchDir.x*SHIP_SPEED; dy+=G.touchDir.y*SHIP_SPEED;
  }
  const spd = gHasPower('speed')?1.65:1;
  // WRAP-AROUND: sale por un borde, entra por el opuesto
  const margin = 28;
  G.ship.x += dx*spd;
  G.ship.y += dy*spd;
  if(G.ship.x < -margin)  G.ship.x = G.W + margin;
  if(G.ship.x > G.W + margin) G.ship.x = -margin;
  if(G.ship.y < -margin)  G.ship.y = G.H + margin;
  if(G.ship.y > G.H + margin) G.ship.y = -margin;
  if(dx||dy){
    G.ship.rot=Math.atan2(dy,dx)+Math.PI/2;
    gTrailFx(G.ship.x,G.ship.y,G.ship.rot-Math.PI/2);
    // FIX: actualizar mouse a la dirección de movimiento para que el disparo siga las teclas
    const len=Math.hypot(dx,dy)||1;
    G.mouse.x = G.ship.x + (dx/len)*200;
    G.mouse.y = G.ship.y + (dy/len)*200;
  } else {
    const mx=G.mouse.x-G.ship.x,my=G.mouse.y-G.ship.y;
    if(Math.hypot(mx,my)>20) G.ship.rot=Math.atan2(my,mx)+Math.PI/2;
  }

  // Invincibilidad
  if(G.ship.invincible){
    G.ship.blinkTimer++;
    if(--G.ship.invTimer<=0){ G.ship.invincible=false; G.ship.invTimer=0; }
  }

  // Teleport cooldown
  if(G.teleportCd > 0){
    G.teleportCd--;
    const btn = gById('gBtnTele');
    if(btn){
      const pct = Math.round((1 - G.teleportCd/300)*100);
      btn.style.opacity = G.teleportCd > 0 ? '0.4' : '1';
      btn.title = G.teleportCd > 0 ? `Recargando... ${Math.ceil(G.teleportCd/60)}s` : 'Teletransportación [T]';
    }
  } else {
    const btn = gById('gBtnTele');
    if(btn) btn.style.opacity = '1';
  }

  // Power timers
  G.powers=G.powers.filter(p=>{ p.timer-=16.6; return p.timer>0; });
  if(G.frameCount%6===0) gUpdatePowerIcons();

  // Power drops
  for(let i=G.powerDrops.length-1;i>=0;i--){
    const d=G.powerDrops[i];
    d.y+=d.vy; d.vy=lerp(d.vy,0,.05); d.life--; d.bob+=.06;
    if(d.life<=0){G.powerDrops.splice(i,1);continue;}
    if(Math.hypot(d.x-G.ship.x,d.y-G.ship.y)<G.ship.radius+16){
      gCollectPower(d); G.powerDrops.splice(i,1); beep(880,.06,.12);
    }
  }

  // Balas propias
  for(let i=G.bullets.length-1;i>=0;i--){
    const b=G.bullets[i];
    b.x+=b.vx; b.y+=b.vy; b.life--;
    if(b.life<=0||b.x<-40||b.x>G.W+40||b.y<-40||b.y>G.H+40){G.bullets.splice(i,1);continue;}
    let hit=false;
    for(let j=G.enemies.length-1;j>=0;j--){
      const en=G.enemies[j];
      if(Math.hypot(b.x-en.x,b.y-en.y)<b.r+en.radius){
        G.bullets.splice(i,1); gHitEnemy(j); hit=true; break;
      }
    }
  }

  // Enemigos
  for(let i=G.enemies.length-1;i>=0;i--) gUpdateEnemy(G.enemies[i],i);

  // Balas enemigas
  for(let i=gEnemyBullets.length-1;i>=0;i--){
    const b=gEnemyBullets[i];
    b.x+=b.vx; b.y+=b.vy; b.life--;
    if(b.life<=0||b.x<-20||b.x>G.W+20||b.y<-20||b.y>G.H+20){gEnemyBullets.splice(i,1);continue;}
    if(!G.ship.invincible && Math.hypot(b.x-G.ship.x,b.y-G.ship.y)<G.ship.radius+b.r){
      if(gHasPower('shield')){
        G.powers=G.powers.filter(p=>p.type!=='shield');
        gParticleBurst(G.ship.x,G.ship.y,GCOL.azul,20,70);
        gUpdatePowerIcons();
      } else { gShipHit(-1); }
      gEnemyBullets.splice(i,1);
    }
  }

  // Partículas
  for(let i=G.particles.length-1;i>=0;i--){
    const p=G.particles[i];
    p.x+=p.vx; p.y+=p.vy; p.vx*=.93; p.vy*=.93; p.life--;
    if(p.life<=0) G.particles.splice(i,1);
  }

  // Cooldown bar
  const cd=gHasPower('rapid')?SHIP_COOLDOWN*.4:SHIP_COOLDOWN;
  const cf=gById('gCoolFill');
  if(cf) cf.style.width=Math.min(100,(Date.now()-G.lastShot)/cd*100)+'%';
}

function gUpdateEnemy(en,i){
  const sx=G.ship.x,sy=G.ship.y;
  if(en.ai==='chase'){
    const dx=sx-en.x,dy=sy-en.y,len=Math.hypot(dx,dy)||1;
    en.x+=dx/len*en.speed; en.y+=dy/len*en.speed; en.rot+=en.rotSpd;
  }
  else if(en.ai==='formation'){
    en.phaseTimer++;
    if(en.phase===0){
      en.y+=en.speed;
      if(en.y>G.H*.22+en.formIndex*8) en.phase=1;
    } else {
      en.phase+=.012;
      const bx=G.W/2+(en.formIndex-(en.formTotal-1)/2)*55;
      en.x=lerp(en.x,bx+Math.sin(en.phase*2.5+en.formIndex)*80,.04);
      en.y=lerp(en.y,G.H*.22+en.formIndex*8+Math.cos(en.phase*1.5)*30,.04);
      if(G.frameCount%(Math.max(20,70-G.wave*2))===en.formIndex%7) gEnemyShoot(en);
    }
    en.rot+=en.rotSpd;
  }
  else if(en.ai==='kamikaze'){
    en.x+=en.vx; en.y+=en.vy; en.rot=Math.atan2(en.vy,en.vx);
    if(G.frameCount%2===0) G.particles.push({x:en.x,y:en.y,vx:rand(-.4,.4),vy:rand(-.4,.4),life:10,maxLife:10,r:rand(2,4),color:GCOL.fucsia});
    if(en.x<-90||en.x>G.W+90||en.y<-90||en.y>G.H+90){
      const idx=G.enemies.indexOf(en); if(idx>=0) G.enemies.splice(idx,1); return;
    }
  }

  // Colisión con nave
  if(!G.ship.invincible && Math.hypot(en.x-sx,en.y-sy)<en.radius+G.ship.radius-8){
    if(gHasPower('shield')){
      G.powers=G.powers.filter(p=>p.type!=='shield');
      gParticleBurst(G.ship.x,G.ship.y,GCOL.azul,20,70);
      gUpdatePowerIcons(); beep(300,.15,.2);
    } else { gShipHit(i); }
  }
}

function gEnemyShoot(en){
  const dx=G.ship.x-en.x,dy=G.ship.y-en.y,len=Math.hypot(dx,dy)||1;
  gEnemyBullets.push({x:en.x,y:en.y,vx:dx/len*5,vy:dy/len*5,life:90,r:4,color:GCOL.morado});
  beep(300,.03,.08);
}

function gHitEnemy(j){
  const en=G.enemies[j];
  if(!en) return;
  en.hp--;
  G.shake=Math.min(G.shake+2,10);
  gParticleBurst(en.x,en.y,en.color,6,30);
  if(en.hp>0) return;

  // Muerto
  gParticleBurst(en.x,en.y,en.color,18,80);
  if(en.type==='tank') gParticleBurst(en.x,en.y,GCOL.dorado,30,120);
  G.score+=en.pts; gUpdateHUD(); gScorePop(en.x,en.y,en.pts); gDropPower(en.x,en.y);

  // Split
  if(en.type==='asteroid'&&en.size==='big'){
    for(let k=0;k<2;k++) G.enemies.push({type:'asteroid',x:en.x+rand(-20,20),y:en.y+rand(-20,20),radius:20+rand(-3,3),hp:2,maxHp:2,pts:60,speed:en.speed*1.4,rot:rand(0,Math.PI*2),rotSpd:rand(-.03,.03),color:gRandRock(),craters:gGenCraters(20),size:'medium',ai:'chase'});
  } else if(en.type==='asteroid'&&en.size==='medium'){
    for(let k=0;k<2;k++) G.enemies.push({type:'asteroid',x:en.x+rand(-15,15),y:en.y+rand(-15,15),radius:12+rand(-2,2),hp:1,maxHp:1,pts:30,speed:en.speed*1.5,rot:rand(0,Math.PI*2),rotSpd:rand(-.04,.04),color:gRandRock(),craters:gGenCraters(12),size:'small',ai:'chase'});
  }
  G.enemies.splice(j,1);
  beep(440,.08,.1);
}

function gShipHit(enemyIdx){
  if(G.ship.invincible) return;
  G.lives--; G.shake=15;
  gParticleBurst(G.ship.x,G.ship.y,GCOL.fucsia,25,90);
  gUpdateHUD();
  if(enemyIdx>=0 && G.enemies[enemyIdx]) G.enemies.splice(enemyIdx,1);
  if(G.lives<=0){
    G.running=false; beep(220,.3,.5);
    setTimeout(gShowGameOver,600); return;
  }
  G.ship.invincible=true; G.ship.invTimer=180; G.ship.blinkTimer=0;
  beep(300,.15,.2);
}

// ═══════════════════════════════════════════════════
//  Render
// ═══════════════════════════════════════════════════
function gRender(){
  const ctx=gCtx, W=gCanvas.width, H=gCanvas.height;
  ctx.save();
  if(G.shake>0) ctx.translate(rand(-G.shake,G.shake),rand(-G.shake,G.shake));

  // Fondo
  ctx.clearRect(0,0,W,H);
  // Tinte muy leve para legibilidad sobre el video
  ctx.fillStyle='rgba(3,4,14,0.08)'; ctx.fillRect(0,0,W,H);

  // Estrellas
  G.stars.forEach(s=>{
    ctx.globalAlpha=s.a*(0.5+0.5*Math.sin(G.frameCount*s.speed+s.twinkle));
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha=1;

  // ☀️ SOL + 🪐 PLANETAS decorativos de fondo
  {
    const sunX=W*.90, sunY=H*.08, sunR=42;
    const sunT=G.frameCount*.012;
    // Corona solar animada
    for(let i=0;i<4;i++){
      const sg=ctx.createRadialGradient(sunX,sunY,sunR*(0.8+i*.2),sunX,sunY,sunR*(2+i*.9+Math.sin(sunT+i)*0.4));
      sg.addColorStop(0,`rgba(255,${180-i*25},0,${0.12-i*.02})`);
      sg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sunX,sunY,sunR*(2.8+i),0,Math.PI*2); ctx.fill();
    }
    const sunG=ctx.createRadialGradient(sunX-sunR*.35,sunY-sunR*.35,0,sunX,sunY,sunR);
    sunG.addColorStop(0,"#fffbe0"); sunG.addColorStop(0.35,"#ffe566");
    sunG.addColorStop(0.75,"#ff9900"); sunG.addColorStop(1,"#cc5500");
    ctx.shadowBlur=70; ctx.shadowColor="#ff9900";
    ctx.fillStyle=sunG; ctx.beginPath(); ctx.arc(sunX,sunY,sunR,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.font="bold 10px 'Orbitron',sans-serif"; ctx.textAlign="center"; ctx.textBaseline="top";
    ctx.fillStyle="rgba(255,220,80,0.85)"; ctx.fillText("SOL",sunX,sunY+sunR+4);

    // Planetas decorativos fijos (posiciones relativas al canvas)
    const bgPlanets = [
      { nx:0.08, ny:0.15, r:14, color:'#b5b5b5', glow:'#d0d0d0', name:'Mercurio', ring:false, bands:false },
      { nx:0.18, ny:0.25, r:20, color:'#e8cda0', glow:'#f5e0a0', name:'Venus',    ring:false, bands:false },
      { nx:0.12, ny:0.70, r:22, color:'#4fa3e0', glow:'#00bfff', name:'Tierra',   ring:false, bands:false },
      { nx:0.05, ny:0.50, r:16, color:'#c1440e', glow:'#ff4500', name:'Marte',    ring:false, bands:false },
      { nx:0.82, ny:0.55, r:34, color:'#c88b3a', glow:'#ffa500', name:'Júpiter',  ring:false, bands:true  },
      { nx:0.70, ny:0.82, r:28, color:'#e4d191', glow:'#ffd700', name:'Saturno',  ring:true,  bands:false },
      { nx:0.25, ny:0.88, r:20, color:'#7de8e8', glow:'#00f5d4', name:'Urano',    ring:false, bands:false },
      { nx:0.45, ny:0.92, r:22, color:'#5b5ddf', glow:'#7b8cde', name:'Neptuno',  ring:false, bands:false },
    ];

    bgPlanets.forEach(p => {
      const px = p.nx * W, py = p.ny * H, r = p.r;
      // Halo de atmósfera
      const halo = ctx.createRadialGradient(px,py,r*.8,px,py,r*2.2);
      halo.addColorStop(0, p.glow.replace(')',',0.12)').replace('rgb','rgba').replace('#','rgba(').replace('rgba(','rgba(').replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, (m,r2,g2,b2) => `${parseInt(r2,16)},${parseInt(g2,16)},${parseInt(b2,16)},0.10)`));
      halo.addColorStop(1,'rgba(0,0,0,0)');
      // Usamos shadow para el halo
      ctx.save();
      ctx.shadowBlur=r*1.4; ctx.shadowColor=p.glow;
      // Cuerpo del planeta
      const pg=ctx.createRadialGradient(px-r*.3,py-r*.3,r*.04,px,py,r);
      pg.addColorStop(0,'rgba(255,255,255,0.30)');
      pg.addColorStop(0.25,p.color);
      pg.addColorStop(1,'rgba(0,0,0,0.55)');
      ctx.globalAlpha=0.72;
      ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;

      // Anillo Saturno
      if(p.ring){
        ctx.globalAlpha=0.45;
        ctx.strokeStyle='rgba(228,209,145,0.7)'; ctx.lineWidth=r*.22;
        ctx.beginPath(); ctx.ellipse(px,py,r*1.75,r*.42,0.3,0,Math.PI*2); ctx.stroke();
      }
      // Bandas Júpiter
      if(p.bands){
        ctx.save(); ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.clip();
        ctx.globalAlpha=0.15;
        ['#d4956a','#c88b3a','#e8c070','#c06030'].forEach((c,i)=>{
          ctx.fillStyle=c;
          ctx.fillRect(px-r, py-r*.6+i*r*.32, r*2, r*.18);
        });
        ctx.restore();
      }

      // Brillo especular
      ctx.globalAlpha=0.55;
      const gl=ctx.createRadialGradient(px-r*.32,py-r*.32,0,px-r*.32,py-r*.32,r*.55);
      gl.addColorStop(0,'rgba(255,255,255,0.40)'); gl.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fill();

      // Nombre
      ctx.globalAlpha=0.75;
      ctx.font=`bold ${Math.max(8,r*.48)}px 'Orbitron',sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillStyle=p.glow; ctx.shadowBlur=8; ctx.shadowColor=p.glow;
      ctx.fillText(p.name, px, py+r+3);
      ctx.restore();
    });
  }

  // Power drops
  G.powerDrops.forEach(d=>{
    const a=d.life/d.maxLife, bob=Math.sin(d.bob)*4;
    ctx.save(); ctx.globalAlpha=Math.min(a*3,.95); ctx.translate(d.x,d.y+bob);
    ctx.shadowBlur=20; ctx.shadowColor=d.color;
    ctx.fillStyle='rgba(0,0,0,.6)'; ctx.beginPath(); ctx.arc(0,0,16,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=d.color; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,0,16,0,Math.PI*2); ctx.stroke();
    ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='white'; ctx.fillText(d.icon,0,1);
    ctx.restore();
  });

  // Partículas
  G.particles.forEach(p=>{
    const a=p.life/p.maxLife;
    ctx.globalAlpha=a*.9; ctx.fillStyle=p.color;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r*a,0,Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha=1;

  // Balas enemigas
  gEnemyBullets.forEach(b=>{
    ctx.save(); ctx.shadowBlur=12; ctx.shadowColor=b.color;
    ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
    ctx.restore();
  });

  // Balas propias
  G.bullets.forEach(b=>{
    ctx.save(); ctx.shadowBlur=16; ctx.shadowColor=b.color;
    ctx.fillStyle=b.color;
    ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=.3;
    ctx.beginPath(); ctx.arc(b.x-b.vx*2,b.y-b.vy*2,b.r*.6,0,Math.PI*2); ctx.fill();
    ctx.restore();
  });

  // Enemigos
  G.enemies.forEach(en=>gDrawEnemy(ctx,en));

  // Nave (con blink si invincible)
  if(!(G.ship.invincible && Math.floor(G.ship.blinkTimer/8)%2===0))
    gDrawShip(ctx,G.ship);

  // Crosshair
  gDrawCrosshair(ctx,G.mouse.x,G.mouse.y);

  ctx.restore();
}

function gDrawShip(ctx,ship){
  ctx.save();
  ctx.translate(ship.x,ship.y); ctx.rotate(ship.rot);
  ctx.shadowBlur=25; ctx.shadowColor=gHasPower('shield')?GCOL.azul:GCOL.turquesa;

  // Escudo
  if(gHasPower('shield')){
    ctx.globalAlpha=.3+.15*Math.sin(G.frameCount*.15);
    ctx.strokeStyle=GCOL.azul; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.arc(0,0,ship.radius+12,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=1;
  }

  // Alas
  ctx.fillStyle='rgba(0,180,216,0.7)';
  ctx.beginPath(); ctx.moveTo(-13,14); ctx.lineTo(-22,18); ctx.lineTo(-10,4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(13,14);  ctx.lineTo(22,18);  ctx.lineTo(10,4);  ctx.closePath(); ctx.fill();

  // Cuerpo
  ctx.fillStyle=GCOL.turquesa;
  ctx.beginPath(); ctx.moveTo(0,-22); ctx.lineTo(-13,14); ctx.lineTo(0,8); ctx.lineTo(13,14); ctx.closePath(); ctx.fill();

  // Cabina
  const cg=ctx.createRadialGradient(0,-4,0,0,-4,10);
  cg.addColorStop(0,GCOL.fucsia); cg.addColorStop(1,GCOL.morado);
  ctx.fillStyle=cg; ctx.beginPath(); ctx.ellipse(0,-4,6,8,0,0,Math.PI*2); ctx.fill();

  // Motor
  const mg=ctx.createRadialGradient(0,14,0,0,14,10);
  mg.addColorStop(0,'rgba(255,120,0,0.9)'); mg.addColorStop(.5,'rgba(255,200,0,0.4)'); mg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalAlpha=.8+.2*Math.sin(G.frameCount*.4);
  ctx.fillStyle=mg; ctx.beginPath(); ctx.ellipse(0,14,6,10,0,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;

  ctx.restore();
}

function gDrawEnemy(ctx,en){
  ctx.save();
  ctx.translate(en.x,en.y); ctx.rotate(en.rot);
  ctx.shadowBlur=18; ctx.shadowColor=en.glow||en.color;

  if(en.ai==='chase'||en.type==='asteroid'){
    // Roca irregular
    ctx.fillStyle=en.color;
    ctx.beginPath();
    const n=10;
    for(let i=0;i<n;i++){
      const a=(i/n)*Math.PI*2, noise=.72+.28*Math.sin(a*3.7+en.rot*.5+en.radius*.3);
      const r=en.radius*noise;
      i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fill();
    // Detalle de superficie
    ctx.fillStyle='rgba(0,0,0,0.3)';
    (en.craters||[]).forEach(c=>{ctx.beginPath();ctx.arc(c.x,c.y,c.r,0,Math.PI*2);ctx.fill();});
    // Borde luminoso suave
    ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1.2; ctx.stroke();
    if(en.maxHp>1) gHPBar(ctx,en);
  }
  else if(en.type==='formation'){
    ctx.fillStyle=GCOL.morado;
    ctx.beginPath();
    for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2,r=en.radius*(i%2===0?1:.7);i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(200,100,255,.6)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(0,0,en.radius*.35,0,Math.PI*2); ctx.fill();
    if(en.maxHp>1) gHPBar(ctx,en);
  }
  else if(en.type==='kamikaze'){
    ctx.fillStyle=GCOL.fucsia;
    ctx.beginPath();
    ctx.moveTo(0,-en.radius); ctx.lineTo(-en.radius*.7,en.radius*.7); ctx.lineTo(0,en.radius*.3); ctx.lineTo(en.radius*.7,en.radius*.7);
    ctx.closePath(); ctx.fill();
  }
  else if(en.type==='tank'){
    [1,.7].forEach((scale,l)=>{
      ctx.fillStyle=l===0?'#8B4513':'#A0522D';
      ctx.beginPath();
      for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2,r=en.radius*scale;i===0?ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r):ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
      ctx.closePath(); ctx.fill();
    });
    const ng=ctx.createRadialGradient(0,0,0,0,0,en.radius*.4);
    ng.addColorStop(0,'rgba(255,100,0,.8)'); ng.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(0,0,en.radius*.4,0,Math.PI*2); ctx.fill();
    gHPBar(ctx,en);
  }
  ctx.restore();
}

function gHPBar(ctx,en){
  const bw=en.radius*2.2, bh=5, by=en.radius+8;
  ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(-bw/2,by,bw,bh);
  const ratio=en.hp/en.maxHp;
  ctx.fillStyle=ratio>.5?GCOL.turquesa:ratio>.25?GCOL.dorado:GCOL.fucsia;
  ctx.fillRect(-bw/2,by,bw*ratio,bh);
}

function gDrawCrosshair(ctx,mx,my){
  ctx.save();
  ctx.strokeStyle='rgba(0,245,212,.7)'; ctx.lineWidth=1.2;
  ctx.shadowBlur=8; ctx.shadowColor=GCOL.turquesa;
  const s=10,g=5;
  ctx.beginPath();
  ctx.moveTo(mx-s-g,my); ctx.lineTo(mx-g,my);
  ctx.moveTo(mx+g,my);   ctx.lineTo(mx+s+g,my);
  ctx.moveTo(mx,my-s-g); ctx.lineTo(mx,my-g);
  ctx.moveTo(mx,my+g);   ctx.lineTo(mx,my+s+g);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(mx,my,3,0,Math.PI*2); ctx.stroke();
  ctx.restore();
}

// ═══════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════
function gUpdateHUD(){
  const s=gById('gHudScore'),w=gById('gHudWave'),l=gById('gHudLives');
  if(s) s.textContent=`⭐ ${G.score}`;
  if(w) w.textContent=`OLEADA ${G.wave}`;
  if(l) l.textContent='❤️'.repeat(Math.max(0,G.lives));
}
function gUpdatePowerIcons(){
  const el=gById('gPowerIcons'); if(!el) return;
  el.innerHTML=G.powers.map(p=>{
    const d=POWER_DEFS.find(t=>t.type===p.type);
    const pct=Math.round(p.timer/p.maxTimer*100);
    return `<div style="display:flex;align-items:center;gap:4px;background:rgba(0,0,0,.5);border:1px solid ${d?.color||'#fff'};border-radius:20px;padding:3px 8px;font-family:'Orbitron',sans-serif;font-size:.5rem;color:${d?.color||'#fff'}">${d?.icon||'?'} <div style="width:36px;height:3px;background:rgba(255,255,255,.15);border-radius:2px"><div style="width:${pct}%;height:100%;background:${d?.color||'#fff'};border-radius:2px"></div></div></div>`;
  }).join('');
}
function gScorePop(x,y,pts){
  const el=document.createElement('div');
  el.style.cssText=`position:absolute;left:${x}px;top:${y}px;font-family:'Orbitron',sans-serif;font-size:.75rem;color:${GCOL.dorado};text-shadow:0 0 10px ${GCOL.dorado};pointer-events:none;z-index:20;transform:translate(-50%,-50%);animation:gScorePop .9s forwards`;
  el.textContent='+'+pts;
  gById('secJuego').appendChild(el);
  setTimeout(()=>el.remove(),900);
}
function gShowToast(msg,color='#fff'){
  const t=document.createElement('div');
  t.style.cssText=`position:absolute;top:60px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.85);border:1px solid ${color};color:${color};padding:6px 18px;border-radius:20px;font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:2px;z-index:30;pointer-events:none;animation:gScorePop .4s forwards`;
  t.textContent=msg;
  gById('secJuego').appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

// ═══════════════════════════════════════════════════
//  Game Over & Leaderboard
// ═══════════════════════════════════════════════════
function gShowGameOver(){
  const over=gById('gOver'); if(!over) return;
  gById('gOverScore').textContent=`Puntuación: ${G.score}`;
  gById('gOverWave').textContent=`Oleada ${G.wave}`;
  over.style.display='flex';
  // FIX: restaurar cursor para que se pueda clickear Reiniciar
  gById('secJuego').style.cursor='default';
  const lb=gSaveLB(G.score,G.wave);
  gRenderLB(lb);
}
function gSaveLB(score,wave){
  let lb=JSON.parse(localStorage.getItem('dexis_lb')||'[]');
  lb.push({score,wave,date:new Date().toLocaleDateString('es-CO')});
  lb.sort((a,b)=>b.score-a.score); lb=lb.slice(0,MAX_LB);
  localStorage.setItem('dexis_lb',JSON.stringify(lb));
  return lb;
}
function gRenderLB(lb){
  const el=gById('gLeaderboard'); if(!el) return;
  const medals=['🥇','🥈','🥉','4º','5º'];
  el.innerHTML=`
    <div style="font-family:'Orbitron',sans-serif;font-size:.6rem;color:${GCOL.turquesa};letter-spacing:3px;margin-bottom:10px;text-align:center">🏆 TOP PUNTUACIONES</div>
    ${lb.map((e,i)=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 12px;margin:3px 0;background:rgba(255,255,255,.04);border-radius:8px;border-left:2px solid ${i===0?GCOL.dorado:i===1?'#C0C0C0':i===2?'#CD7F32':GCOL.morado}">
        <span style="font-family:'Orbitron',sans-serif;font-size:.55rem;color:${i===0?GCOL.dorado:'rgba(255,255,255,.6)'}">${medals[i]} ${e.score}</span>
        <span style="font-family:'Orbitron',sans-serif;font-size:.45rem;color:rgba(255,255,255,.4)">Ola ${e.wave} · ${e.date}</span>
      </div>
    `).join('')}`;
}

// ═══════════════════════════════════════════════════
//  Loop
// ═══════════════════════════════════════════════════
function gTick(){
  if(!gameActive){ gAnimId=null; return; }
  gAnimId=requestAnimationFrame(gTick);
  gUpdate();
  gRender();
}

function gameRestart(){
  gMusicStop();
  gUnbindInput();
  gEnemyBullets=[];
  if(typeof G!=='undefined') G.touchTarget=null;
  setTimeout(()=>startGame(), 50);
}

// ── CSS ─────────────────────────────────────────────
function gInjectCSS(){
  if(document.getElementById('gGameCSS')) return;
  const s=document.createElement('style'); s.id='gGameCSS';
  s.textContent=`
    @keyframes gScorePop {
      0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
      60%  { opacity:1; transform:translate(-50%,-130%) scale(1.2); }
      100% { opacity:0; transform:translate(-50%,-190%) scale(.8); }
    }
  `;
  document.head.appendChild(s);
}

// ═══════════════════════════════════════════════════
//  🎵 MÚSICA ÉPICA ESPACIAL — Sintetizador Web Audio
// ═══════════════════════════════════════════════════
let gMusicCtx   = null;
let gMusicNodes = [];
let gMusicOn    = false;
let gMusicBeat  = null;

function gMusicStart(){
  if(gMusicOn) return;
  try{
    gMusicCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(gMusicCtx.state === 'suspended') gMusicCtx.resume();
    gMusicOn  = true;
    gMusicNodes = [];
    const ctx = gMusicCtx;

    // ── MASTER con compresor para sonido más lleno ──
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressor.connect(ctx.destination);

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(compressor);
    master.gain.linearRampToValueAtTime(0.72, ctx.currentTime + 3.5);
    gMusicNodes.push(master, compressor);

    // ── REVERB artificial (ConvolverNode con impulso sintético) ──
    function makeReverb(duration, decay){
      const rate = ctx.sampleRate;
      const len  = rate * duration;
      const buf  = ctx.createBuffer(2, len, rate);
      for(let c=0;c<2;c++){
        const d = buf.getChannelData(c);
        for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, decay);
      }
      const conv = ctx.createConvolver();
      conv.buffer = buf;
      return conv;
    }
    const reverb = makeReverb(2.5, 3.5);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.28;
    reverb.connect(reverbGain);
    reverbGain.connect(master);
    gMusicNodes.push(reverb, reverbGain);

    // ── FUNCIÓN: crear pad con wave + filtro ──
    function makePad(freq, type, vol, detune=0){
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      osc.type = type; osc.frequency.value = freq; osc.detune.value = detune;
      filt.type = 'lowpass'; filt.frequency.value = 900; filt.Q.value = 0.5;
      gain.gain.value = vol;
      // LFO de volumen (tremolo suave)
      const lfo = ctx.createOscillator();
      const lfoG = ctx.createGain();
      lfo.frequency.value = 0.25; lfoG.gain.value = vol * 0.18;
      lfo.connect(lfoG); lfoG.connect(gain.gain);
      osc.connect(filt); filt.connect(gain);
      gain.connect(master); gain.connect(reverb);
      lfo.start(); osc.start();
      gMusicNodes.push(osc, gain, filt, lfo, lfoG);
    }

    // ── 1. CUERDA DE BAJO PROFUNDO (raíz A1=55Hz) ──
    makePad(55,   'sawtooth', 0.14, 0);
    makePad(55.5, 'sine',     0.10, 0);
    makePad(110,  'sawtooth', 0.07, 7);

    // ── 2. PAD ÉPICO — acorde Am (A-C-E) ──
    const chord = [220, 261.63, 329.63, 440, 523.25, 659.26];
    chord.forEach((f, i) => {
      makePad(f, i%2===0?'sawtooth':'triangle', 0.055, (i%3-1)*9);
    });

    // ── 3. ARPEGGIO RÍTMICO — da el impulso épico ──
    const arpNotes = [220, 261.63, 329.63, 392, 440, 329.63, 261.63, 220];
    let arpIdx = 0;
    let arpTempo = 0.22; // segundos entre notas
    function arpStep(){
      if(!gMusicOn) return;
      const freq = arpNotes[arpIdx % arpNotes.length];
      arpIdx++;

      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      osc.type = 'square';
      osc.frequency.value = freq * 2; // octava alta
      filt.type = 'bandpass'; filt.frequency.value = freq*2; filt.Q.value = 2.5;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + arpTempo * 0.85);
      osc.connect(filt); filt.connect(gain);
      gain.connect(master); gain.connect(reverb);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + arpTempo);
      gMusicNodes.push(osc, gain, filt);

      setTimeout(arpStep, arpTempo * 1000);
    }
    setTimeout(arpStep, 1800);

    // ── 4. MELODÍA LEAD — sintetizador tipo épico espacial ──
    // Escala pentatónica menor de Am
    const melody = [220,261.63,293.66,329.63,392,440,523.25,587.33,659.26,784];
    let melIdx = 0;
    function melStep(){
      if(!gMusicOn) return;
      // Frase de 4 notas con ritmo variable
      const phrase = [
        melody[Math.floor(Math.random()*5)+3],
        melody[Math.floor(Math.random()*4)+4],
        melody[Math.floor(Math.random()*3)+5],
        melody[Math.floor(Math.random()*4)+3],
      ];
      let t = ctx.currentTime + 0.1;
      phrase.forEach((freq, i) => {
        const dur = [0.4,0.4,0.8,0.6][i];
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        const filt = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = (Math.random()-0.5)*14;
        filt.type = 'lowpass'; filt.frequency.value = 2200; filt.Q.value = 1.2;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.11, t + 0.04);
        gain.gain.linearRampToValueAtTime(0.07, t + dur*0.7);
        gain.gain.linearRampToValueAtTime(0,    t + dur);
        osc.connect(filt); filt.connect(gain);
        gain.connect(master); gain.connect(reverb);
        osc.start(t); osc.stop(t + dur + 0.05);
        gMusicNodes.push(osc, gain, filt);
        t += dur;
      });
      // Siguiente frase después de ~2–3 segundos
      setTimeout(melStep, (2.2 + Math.random()*1.6)*1000);
    }
    setTimeout(melStep, 3200);

    // ── 5. KICK SINTETIZADO (bajo percutivo) ──
    function kick(){
      if(!gMusicOn) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.55, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
      osc.connect(gain); gain.connect(master);
      osc.start(); osc.stop(ctx.currentTime + 0.35);
      gMusicNodes.push(osc, gain);
    }

    // ── 6. HI-HAT SINTETIZADO ──
    function hihat(vol=0.08){
      if(!gMusicOn) return;
      const buf = ctx.createBuffer(1, ctx.sampleRate*0.05, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for(let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
      const src  = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      src.buffer = buf;
      filt.type = 'highpass'; filt.frequency.value = 7000;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.05);
      src.connect(filt); filt.connect(gain); gain.connect(master);
      src.start(); gMusicNodes.push(src, gain, filt);
    }

    // ── PATRÓN RÍTMICO: kick en 1 y 3, hihat en cada beat ──
    const BPM = 118;
    const beat = 60/BPM;
    let bar = 0;
    function drumLoop(){
      if(!gMusicOn) return;
      const b = bar % 8;
      // Kick en tiempos 0, 4
      if(b===0||b===4) kick();
      // Hi-hat en todos, acento en pares
      hihat(b%2===0 ? 0.10 : 0.055);
      bar++;
      setTimeout(drumLoop, beat*500);
    }
    setTimeout(drumLoop, 2600);

    // ── Botón mute ──
    gAddMuteBtn(master);

  } catch(e){ console.warn('Web Audio no disponible:', e); }
}

function gMusicStop(){
  gMusicOn = false;
  const vidBg = document.getElementById('juegoVideoBg');
  if(vidBg){ vidBg.muted=true; vidBg.pause(); }
  if(!gMusicCtx) return;
  try{
    const t = gMusicCtx.currentTime;
    gMusicNodes.forEach(n => {
      try{ if(n && n.gain) n.gain.linearRampToValueAtTime(0, t+0.4); }catch(e){}
      try{ if(n && n.stop) n.stop(t+0.5); }catch(e){}
    });
    setTimeout(() => { try{ gMusicCtx.close(); }catch(e){} gMusicCtx=null; gMusicNodes=[]; }, 600);
  } catch(e){}
}

function gAddMuteBtn(master){
  const existing = document.getElementById('gBtnMute');
  if(existing) existing.remove();
  const btn = document.createElement('button');
  btn.id = 'gBtnMute';
  btn.textContent = '🔊 MÚSICA';
  btn.style.cssText = "position:absolute;top:10px;left:50%;transform:translateX(-50%) translateY(54px);background:rgba(0,0,0,.6);border:1px solid rgba(155,93,229,.5);color:#9b5de5;padding:3px 12px;border-radius:20px;font-family:'Orbitron',sans-serif;font-size:.48rem;letter-spacing:1px;cursor:pointer;pointer-events:all;backdrop-filter:blur(8px);z-index:20;white-space:nowrap";
  let muted = false;
  btn.addEventListener('click', () => {
    muted = !muted;
    const vidBg = document.getElementById('juegoVideoBg');
    if(vidBg){ vidBg.muted = muted; if(!muted) vidBg.play(); }
    if(master && gMusicCtx) master.gain.linearRampToValueAtTime(muted ? 0 : 0.72, gMusicCtx.currentTime + 0.4);
    btn.textContent = muted ? '🔇 MÚSICA' : '🔊 MÚSICA';
    btn.style.color = muted ? '#ff1493' : '#9b5de5';
    btn.style.borderColor = muted ? 'rgba(255,20,147,.5)' : 'rgba(155,93,229,.5)';
  });
  const hud = document.getElementById('gHud');
  if(hud) hud.appendChild(btn);
}
