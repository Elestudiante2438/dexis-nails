// ═══════════════════════════════════════════════════
// DEXI'S NAILS — Juego Arcadia (game.js) v2
// ═══════════════════════════════════════════════════

const SHIP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60">
  <defs>
    <radialGradient id="sg1" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#afffef"/><stop offset="100%" stop-color="#00c4a8"/>
    </radialGradient>
    <radialGradient id="sg2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff1493" stop-opacity="0.9"/><stop offset="100%" stop-color="#9b5de5" stop-opacity="0.6"/>
    </radialGradient>
  </defs>
  <polygon points="30,4 42,52 30,44 18,52" fill="url(#sg1)" stroke="#00f5d4" stroke-width="1.2"/>
  <ellipse cx="30" cy="28" rx="7" ry="9" fill="url(#sg2)" opacity="0.9"/>
  <polygon points="18,52 6,56 14,38" fill="#00c4a8" opacity="0.8"/>
  <polygon points="42,52 54,56 46,38" fill="#00c4a8" opacity="0.8"/>
  <ellipse cx="30" cy="50" rx="5" ry="3" fill="#ff1493" opacity="0.7"/>
  <ellipse cx="30" cy="50" rx="3" ry="2" fill="white" opacity="0.6"/>
  <ellipse cx="30" cy="26" rx="3" ry="4" fill="white" opacity="0.35"/>
</svg>`;

let gShipX,gShipY,gShipRot,gMouseX,gMouseY;
let gProys=[],gAsts=[],gScore,gVidas,gOla,gInvincible,gGameRunning;
let gLastShot;
const GCOOLDOWN=160,GSPEED=5.5;
const GACOLS=['#FFF','#E0E0E0','#C0C0C0','#A9A9A9','#808080','#696969','#4A4A4A','#8B4513','#A0522D'];
const gKeys={ArrowUp:0,ArrowDown:0,ArrowLeft:0,ArrowRight:0,KeyW:0,KeyS:0,KeyA:0,KeyD:0,Space:0};
let gAnimId=null,gMoveId=null,gSpawnId=null;
let gTrailC,gShipEl,gMiraEl,gWaveAnn,gCoolBar,gHudScore,gHudWave,gHudLives,gGameOver,gGoScore,gGoWave;
let gTouchDir={x:0,y:0};

function startGame(){
  gameActive=true;
  gTrailC=$('trailC');gShipEl=$('shipEl');gMiraEl=$('miraEl');gWaveAnn=$('waveAnn');
  gCoolBar=$('coolBar');gHudScore=$('hudScore');gHudWave=$('hudWave');gHudLives=$('hudLives');
  gGameOver=$('gameOver');gGoScore=$('goScore');gGoWave=$('goWave');

  // FIX 1: nave visible — SVG inline en lugar de <img> sin src
  gShipEl.innerHTML=SHIP_SVG;

  const pw=window.innerWidth,ph=window.innerHeight;
  gShipX=pw/2;gShipY=ph/2;gMouseX=pw/2;gMouseY=ph/2;gShipRot=-90;
  gProys=[];gAsts=[];gScore=0;gVidas=3;gOla=1;gInvincible=false;gGameRunning=true;gLastShot=0;

  gGameOver.style.display='none';gGameOver.classList.remove('show');
  gHudScore.textContent='⭐ 0';gHudWave.textContent='OLEADA 1';gHudLives.textContent='❤️❤️❤️';
  gCoolBar.style.width='0%';gWaveAnn.style.opacity='0';

  gShipEl.style.cssText=`position:absolute;width:60px;height:60px;left:${gShipX-30}px;top:${gShipY-30}px;pointer-events:none;z-index:50;filter:drop-shadow(0 0 15px #00f5d4) drop-shadow(0 0 30px rgba(255,20,147,.4));transition:filter .15s`;
  if(gMiraEl){gMiraEl.style.left=gMouseX+'px';gMiraEl.style.top=gMouseY+'px';}

  document.querySelectorAll('.gAst').forEach(e=>e.remove());
  document.querySelectorAll('.proyectil').forEach(e=>e.remove());

  // FIX 2: touch buttons visibles en móvil
  const isMobile=('ontouchstart' in window)||window.innerWidth<768;
  const tl=$('touchLeft'),tr=$('touchRight');
  if(tl) tl.style.display=isMobile?'flex':'none';
  if(tr) tr.style.display=isMobile?'flex':'none';

  for(let i=0;i<5;i++) gSpawnAst();
  if(gSpawnId) clearInterval(gSpawnId);
  gSpawnId=setInterval(()=>{if(gGameRunning&&gameActive&&gAsts.length<10+gOla*2)gSpawnAst();},2200);

  // FIX 3: cancelar loops anteriores para no duplicar
  if(gAnimId) cancelAnimationFrame(gAnimId);
  gAnimId=null; gLoop();
  if(gMoveId) cancelAnimationFrame(gMoveId);
  gMoveId=null; gMoveLoop();
}

function gameRestart(){if(gGameOver)gGameOver.style.display='none';startGame();}

function gSpawnAst(sx,sy,szForce){
  const r=Math.random();const sz=szForce||(r<.35?'g':r<.7?'m':'s');
  let w,pts,vel;
  if(sz==='g'){w=65+Math.random()*18;pts=100;vel=(0.6+Math.random()*.4)*(1+(gOla-1)*.12);}
  else if(sz==='m'){w=40+Math.random()*12;pts=50;vel=(1.0+Math.random()*.5)*(1+(gOla-1)*.12);}
  else{w=20+Math.random()*10;pts=20;vel=(1.6+Math.random()*.6)*(1+(gOla-1)*.12);}
  const h=w*(.78+Math.random()*.44);
  const spw=window.innerWidth,sph=window.innerHeight;
  let px=sx,py=sy;
  if(px===undefined){const side=Math.floor(Math.random()*4);
    if(side===0){px=Math.random()*spw;py=-h-40;}
    else if(side===1){px=spw+w+40;py=Math.random()*sph;}
    else if(side===2){px=Math.random()*spw;py=sph+h+40;}
    else{px=-w-40;py=Math.random()*sph;}}
  const color=GACOLS[Math.floor(Math.random()*GACOLS.length)];
  const el=document.createElement('div');el.className='gAst';
  el.style.cssText=`position:absolute;width:${w}px;height:${h}px;left:${px}px;top:${py}px;z-index:15;pointer-events:none;filter:drop-shadow(0 0 8px rgba(255,255,255,.2))`;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('viewBox','0 0 100 100');
  svg.style.cssText='position:absolute;top:0;left:0';
  const pts2=[];for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2,r2=38+(Math.random()*12-6);pts2.push(`${50+Math.cos(a)*r2},${50+Math.sin(a)*r2}`);}
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',`M${pts2.join(' L')} Z`);path.setAttribute('fill',color);path.setAttribute('stroke','#111');path.setAttribute('stroke-width','2');
  svg.appendChild(path);
  for(let i=0;i<4;i++){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',28+Math.random()*44);c.setAttribute('cy',28+Math.random()*44);c.setAttribute('r',3+Math.random()*8);c.setAttribute('fill','#000');c.setAttribute('opacity','.28');svg.appendChild(c);}
  el.appendChild(svg);$('secJuego').appendChild(el);
  gAsts.push({el,x:px,y:py,w,h,vel,sz,pts,color,rot:0,rotSpd:(Math.random()-.5)*2});
}

function gExplode(i){
  const a=gAsts[i];const cx=a.x+a.w/2,cy=a.y+a.h/2;
  for(let k=0;k<10;k++){const p=document.createElement('div');p.className='expl-p';const ang=Math.random()*Math.PI*2,dist=25+Math.random()*65;p.style.cssText=`left:${cx}px;top:${cy}px;width:${5+Math.random()*7}px;height:${5+Math.random()*7}px;background:${a.color};--tx:${Math.cos(ang)*dist}px;--ty:${Math.sin(ang)*dist}px`;$('secJuego').appendChild(p);setTimeout(()=>{if(p.parentNode)p.remove();},750);}
  if(a.sz==='g'){gSpawnAst(cx-15,cy,'m');gSpawnAst(cx+15,cy,'m');}
  else if(a.sz==='m'){gSpawnAst(cx,cy,'s');gSpawnAst(cx,cy,'s');}
  gScore+=a.pts;gHudScore.textContent=`⭐ ${gScore}`;
  const pop=document.createElement('div');pop.className='score-pop';pop.textContent='+'+a.pts;pop.style.cssText=`left:${cx}px;top:${cy}px`;$('secJuego').appendChild(pop);setTimeout(()=>{if(pop.parentNode)pop.remove();},1200);
  a.el.remove();gAsts.splice(i,1);
  if(gAsts.length===0&&gGameRunning&&gameActive){gOla++;gHudWave.textContent=`OLEADA ${gOla}`;gWaveAnn.textContent=`OLEADA ${gOla}`;gWaveAnn.style.opacity='1';setTimeout(()=>{gWaveAnn.style.opacity='0';if(gGameRunning&&gameActive)for(let i2=0;i2<Math.min(4+gOla*2,16);i2++)setTimeout(()=>gSpawnAst(),i2*200);},1800);}
  beep(440,.08);
}

let gBlinkInterval=null;
function gHitShip(i){
  if(gInvincible||!gGameRunning||!gameActive)return;
  gAsts[i].el.remove();gAsts.splice(i,1);gVidas--;gUpdateLives();gInvincible=true;
  gShipEl.style.filter='drop-shadow(0 0 50px red) brightness(2.5)';
  setTimeout(()=>{gShipEl.style.filter='drop-shadow(0 0 15px #00f5d4) drop-shadow(0 0 30px rgba(255,20,147,.4))';},300);
  if(gBlinkInterval)clearInterval(gBlinkInterval);let blinks=0;
  gBlinkInterval=setInterval(()=>{gShipEl.style.opacity=gShipEl.style.opacity==='0.2'?'1':'0.2';if(++blinks>=10){clearInterval(gBlinkInterval);gShipEl.style.opacity='1';gInvincible=false;}},180);
  if(gVidas<=0){if(gBlinkInterval)clearInterval(gBlinkInterval);gShipEl.style.opacity='1';gGameRunning=false;gGameOver.style.display='flex';gGoScore.textContent=`Puntuación: ${gScore}`;gGoWave.textContent=`Llegaste a la Oleada ${gOla}`;beep(220,.3);}
}

function gUpdateLives(){gHudLives.textContent='❤️'.repeat(Math.max(0,gVidas));}

function gShoot(){
  if(!gGameRunning||!gameActive)return;
  const now=Date.now();if(now-gLastShot<GCOOLDOWN)return;gLastShot=now;
  const dx=gMouseX-gShipX,dy=gMouseY-gShipY,len=Math.hypot(dx,dy)||1;
  const dirx=len>0.5?dx/len:0,diry=len>0.5?dy/len:-1;
  const ang=Math.atan2(diry,dirx)*180/Math.PI;
  const el=document.createElement('div');el.className='proyectil';
  const px=gShipX+dirx*36,py=gShipY+diry*36;
  el.style.cssText=`left:${px-2.5}px;top:${py-9}px;transform:rotate(${ang+90}deg)`;
  $('secJuego').appendChild(el);gProys.push({el,x:px,y:py,vx:dirx*17,vy:diry*17});beep(1200,.04,.05);
}

function gTrail(px,py){
  const ang=gShipRot*Math.PI/180;const bx=-Math.cos(ang)*20,by=-Math.sin(ang)*20;const perpx=Math.sin(ang)*11,perpy=-Math.cos(ang)*11;
  [{x:px+bx-perpx,y:py+by-perpy,c:'radial-gradient(circle,#7fff00,#00f5d4)',w:8},{x:px+bx*1.2,y:py+by*1.2,c:'radial-gradient(circle,#00f5d4,#00b8a9)',w:11},{x:px+bx+perpx,y:py+by+perpy,c:'radial-gradient(circle,#00f5d4,#008b8b)',w:8}].forEach(t=>{const d=document.createElement('div');d.className='trail-p';d.style.cssText=`background:${t.c};width:${t.w}px;height:${t.w}px;left:${t.x}px;top:${t.y}px;filter:blur(2px)`;gTrailC.appendChild(d);setTimeout(()=>{if(d.parentNode)d.remove();},800);});
}

function gLoop(){
  if(!gameActive){gAnimId=null;return;}
  gAnimId=requestAnimationFrame(gLoop);if(!gGameRunning)return;
  for(let i=gAsts.length-1;i>=0;i--){const a=gAsts[i];const cx=a.x+a.w/2,cy=a.y+a.h/2;const dx=gShipX-cx,dy=gShipY-cy,dist=Math.hypot(dx,dy);if(dist>0){a.x+=dx/dist*a.vel;a.y+=dy/dist*a.vel;}a.rot+=a.rotSpd;a.el.style.left=a.x+'px';a.el.style.top=a.y+'px';a.el.style.transform=`rotate(${a.rot}deg)`;if(dist<(a.w/2+22))gHitShip(i);}
  for(let i=gProys.length-1;i>=0;i--){const p=gProys[i];p.x+=p.vx;p.y+=p.vy;p.el.style.left=(p.x-2.5)+'px';p.el.style.top=(p.y-9)+'px';if(p.x<-80||p.x>window.innerWidth+80||p.y<-80||p.y>window.innerHeight+80){p.el.remove();gProys.splice(i,1);continue;}for(let j=gAsts.length-1;j>=0;j--){const a=gAsts[j];if(Math.hypot(p.x-(a.x+a.w/2),p.y-(a.y+a.h/2))<a.w/2+5){p.el.remove();gProys.splice(i,1);gExplode(j);break;}}}
  gCoolBar.style.width=Math.min(100,(Date.now()-gLastShot)/GCOOLDOWN*100)+'%';
  const aimDx=gMouseX-gShipX,aimDy=gMouseY-gShipY;const noKeys=!gKeys.ArrowUp&&!gKeys.ArrowDown&&!gKeys.ArrowLeft&&!gKeys.ArrowRight&&!gKeys.KeyW&&!gKeys.KeyS&&!gKeys.KeyA&&!gKeys.KeyD;
  if(Math.hypot(aimDx,aimDy)>25&&noKeys){gShipRot=Math.atan2(aimDy,aimDx)*180/Math.PI+90;gShipEl.style.left=(gShipX-30)+'px';gShipEl.style.top=(gShipY-30)+'px';gShipEl.style.transform='rotate('+gShipRot+'deg)';}
}

function gMoveLoop(){
  if(!gameActive){gMoveId=null;return;}
  gMoveId=requestAnimationFrame(gMoveLoop);if(!gGameRunning)return;
  let dx=0,dy=0;
  if(gKeys.ArrowUp||gKeys.KeyW)dy-=GSPEED;if(gKeys.ArrowDown||gKeys.KeyS)dy+=GSPEED;
  if(gKeys.ArrowLeft||gKeys.KeyA)dx-=GSPEED;if(gKeys.ArrowRight||gKeys.KeyD)dx+=GSPEED;
  dx+=gTouchDir.x*GSPEED;dy+=gTouchDir.y*GSPEED;
  if(dx||dy){gShipX=Math.max(36,Math.min(window.innerWidth-36,gShipX+dx));gShipY=Math.max(36,Math.min(window.innerHeight-36,gShipY+dy));gShipRot=Math.atan2(dy,dx)*180/Math.PI+90;gTrail(gShipX,gShipY);gShipEl.style.left=(gShipX-30)+'px';gShipEl.style.top=(gShipY-30)+'px';gShipEl.style.transform='rotate('+gShipRot+'deg)';gShipEl.style.transformOrigin='30px 30px';}
}

document.addEventListener('mousemove',e=>{if(currentSec!=='juego'||!gameActive)return;const rect=$('secJuego').getBoundingClientRect();gMouseX=e.clientX-rect.left;gMouseY=e.clientY-rect.top;if(gMiraEl){gMiraEl.style.left=gMouseX+'px';gMiraEl.style.top=gMouseY+'px';}},{passive:true});
document.addEventListener('mousedown',e=>{if(e.button===0&&gameActive&&currentSec==='juego')gShoot();});
document.addEventListener('contextmenu',e=>{if(currentSec==='juego')e.preventDefault();});
document.addEventListener('touchstart',e=>{if(gameActive&&currentSec==='juego')gShoot();},{passive:true});
document.addEventListener('keydown',e=>{if(gKeys.hasOwnProperty(e.code)){if(gameActive)e.preventDefault();gKeys[e.code]=1;}if(e.code==='Space'&&gameActive){e.preventDefault();gShoot();}});
document.addEventListener('keyup',e=>{if(gKeys.hasOwnProperty(e.code))gKeys[e.code]=0;});

document.addEventListener('DOMContentLoaded',()=>{
  const tl=$('touchLeft'),tr=$('touchRight');
  if(tl){tl.addEventListener('touchstart',e=>{e.preventDefault();gTouchDir.x=-1;},{passive:false});tl.addEventListener('touchend',()=>{gTouchDir.x=0;});}
  if(tr){tr.addEventListener('touchstart',e=>{e.preventDefault();gTouchDir.x=1;},{passive:false});tr.addEventListener('touchend',()=>{gTouchDir.x=0;});}
  const ap=$('adminLoginPass');if(ap)ap.addEventListener('keydown',e=>{if(e.key==='Enter')adminDoLogin();});
});
