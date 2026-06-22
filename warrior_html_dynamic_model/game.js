const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const ui = {
  hp: document.getElementById('hp'),
  mp: document.getElementById('mp'),
  enemyHp: document.getElementById('enemyHp'),
  log: document.getElementById('battleLog'),
  mode: document.getElementById('modeText'),
  state: document.getElementById('stateText'),
};

const animations = {
  idle:   { src: 'assets/warrior_idle.png',   frames: 4, fw: 240, fh: 240, fps: 6,  loop: true  },
  run:    { src: 'assets/warrior_run.png',    frames: 8, fw: 240, fh: 240, fps: 10, loop: true  },
  attack: { src: 'assets/warrior_attack.png', frames: 8, fw: 240, fh: 240, fps: 14, loop: false, hitFrame: 4, lock: true },
  heavy:  { src: 'assets/warrior_heavy.png',  frames: 6, fw: 240, fh: 240, fps: 11, loop: false, hitFrame: 4, lock: true },
  skill:  { src: 'assets/warrior_skill.png',  frames: 6, fw: 240, fh: 240, fps: 10, loop: false, hitFrame: 3, lock: true },
  hit:    { src: 'assets/warrior_hit.png',    frames: 4, fw: 240, fh: 240, fps: 12, loop: false, lock: true },
  death:  { src: 'assets/warrior_death.png',  frames: 8, fw: 240, fh: 240, fps: 8,  loop: false, lock: true, holdLast: true },
};

const nameMap = {idle:'待机', run:'移动', attack:'普通攻击', heavy:'重击', skill:'技能攻击', hit:'受击', death:'倒地死亡'};
const images = {};
let loaded = 0;
Object.entries(animations).forEach(([name, anim]) => {
  const img = new Image();
  img.onload = () => { if (++loaded === Object.keys(animations).length) requestAnimationFrame(loop); };
  img.src = anim.src;
  images[name] = img;
});

const hero = {
  x: 300, y: 210, facing: 1, state: 'idle', frame: 0, lastFrameTime: 0,
  hp: 100, maxHp: 100, mp: 100, maxMp: 100, alive: true,
  attackCd: 0, heavyCd: 0, skillCd: 0, hitApplied: false,
};
const enemy = { x: 610, y: 332, hp: 260, maxHp: 260, alive: true, hurtFlash: 0 };

let autoBattle = true;
let movingLeft = false, movingRight = false;
let enemyTimer = 0;
let battleOverTimer = 0;

function log(text) {
  const p = document.createElement('p');
  p.textContent = text;
  ui.log.prepend(p);
  while (ui.log.children.length > 8) ui.log.lastChild.remove();
}

function setState(next, force = false) {
  const current = animations[hero.state];
  if (!force && current?.lock && hero.frame < current.frames - 1) return false;
  if (!animations[next] || hero.state === next) return true;
  hero.state = next;
  hero.frame = 0;
  hero.lastFrameTime = 0;
  hero.hitApplied = false;
  document.querySelectorAll('[data-action]').forEach(b => b.classList.toggle('active', b.dataset.action === next));
  return true;
}

function useAction(action) {
  if (!hero.alive) return;
  if (action === 'skill' && (hero.skillCd > 0 || hero.mp < 35)) return;
  if (action === 'heavy' && hero.heavyCd > 0) return;
  if (action === 'attack' && hero.attackCd > 0) return;
  if (!setState(action)) return;
  if (action === 'skill') { hero.mp -= 35; hero.skillCd = 3.8; log('释放技能：蓝光剑气'); }
  if (action === 'heavy') { hero.heavyCd = 2.2; log('使用重击：破甲斩'); }
  if (action === 'attack') { hero.attackCd = .9; log('普通攻击'); }
}

function applyDamage(action) {
  const damage = action === 'skill' ? rand(42, 62) : action === 'heavy' ? rand(30, 45) : rand(14, 24);
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.hurtFlash = .18;
  log(`${nameMap[action]}命中，造成 ${damage} 点伤害`);
  if (enemy.hp <= 0) {
    enemy.alive = false;
    log('敌人被击败，3秒后自动刷新');
    battleOverTimer = 3;
  }
}

function enemyAttack(dt) {
  if (!enemy.alive || !hero.alive || animations[hero.state].lock) return;
  enemyTimer -= dt;
  if (enemyTimer <= 0) {
    enemyTimer = randFloat(1.4, 2.4);
    const dmg = rand(7, 14);
    hero.hp = Math.max(0, hero.hp - dmg);
    log(`敌人反击，受到 ${dmg} 点伤害`);
    if (hero.hp <= 0) {
      hero.alive = false;
      setState('death', true);
      log('角色倒地死亡');
    } else {
      setState('hit', true);
    }
  }
}

function autoChooseAction(dt) {
  if (!autoBattle || !hero.alive || !enemy.alive) return;
  if (animations[hero.state].lock) return;
  const dist = enemy.x - hero.x;
  if (dist > 255) { movingRight = true; hero.facing = 1; setState('run'); return; }
  movingRight = movingLeft = false;
  if (hero.skillCd <= 0 && hero.mp >= 35) return useAction('skill');
  if (hero.heavyCd <= 0 && Math.random() < 0.38) return useAction('heavy');
  if (hero.attackCd <= 0) return useAction('attack');
  setState('idle');
}

function update(dt, t) {
  hero.attackCd = Math.max(0, hero.attackCd - dt);
  hero.heavyCd = Math.max(0, hero.heavyCd - dt);
  hero.skillCd = Math.max(0, hero.skillCd - dt);
  hero.mp = Math.min(hero.maxMp, hero.mp + dt * 8);
  enemy.hurtFlash = Math.max(0, enemy.hurtFlash - dt);
  if (battleOverTimer > 0) {
    battleOverTimer -= dt;
    if (battleOverTimer <= 0) resetEnemy();
  }

  if (!autoBattle && hero.alive && !animations[hero.state].lock) {
    if (movingLeft) { hero.x -= 150 * dt; hero.facing = -1; setState('run'); }
    else if (movingRight) { hero.x += 150 * dt; hero.facing = 1; setState('run'); }
    else setState('idle');
  }
  hero.x = Math.max(80, Math.min(430, hero.x));

  autoChooseAction(dt);
  enemyAttack(dt);

  const anim = animations[hero.state];
  if (t - hero.lastFrameTime > 1000 / anim.fps) {
    hero.frame++;
    if (!hero.hitApplied && anim.hitFrame !== undefined && hero.frame >= anim.hitFrame) {
      hero.hitApplied = true;
      if (enemy.alive) applyDamage(hero.state);
    }
    if (hero.frame >= anim.frames) {
      if (anim.loop) hero.frame = 0;
      else if (anim.holdLast) hero.frame = anim.frames - 1;
      else setState((movingLeft || movingRight) && !autoBattle ? 'run' : 'idle', true);
    }
    hero.lastFrameTime = t;
  }
}

function drawGround() {
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(canvas.width/2, 358, 325, 46, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#24314a';
  ctx.fill();
  ctx.restore();
}

function drawEnemy() {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.fillStyle = enemy.alive ? (enemy.hurtFlash > 0 ? '#ffdad1' : '#8b3245') : '#303542';
  ctx.beginPath(); ctx.ellipse(0, 18, 54, 20, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = enemy.alive ? '#ca405e' : '#454b5c';
  ctx.fillRect(-36, -58, 72, 84);
  ctx.fillStyle = '#202637';
  ctx.fillRect(-26, -82, 52, 28);
  ctx.fillStyle = '#fff'; ctx.font = '14px Microsoft YaHei'; ctx.textAlign = 'center';
  ctx.fillText(enemy.alive ? '训练怪' : '已击败', 0, -96);
  ctx.restore();
}

function drawHero() {
  const anim = animations[hero.state];
  ctx.save();
  ctx.translate(hero.x + anim.fw / 2, hero.y + anim.fh / 2);
  ctx.scale(hero.facing, 1);
  ctx.drawImage(images[hero.state], hero.frame * anim.fw, 0, anim.fw, anim.fh, -anim.fw/2, -anim.fh/2, anim.fw, anim.fh);
  ctx.restore();
}

function drawBars() {
  const bar = (x,y,w,h,rate,label) => {
    ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fillRect(x,y,w,h);
    ctx.fillStyle = rate > .35 ? '#39d98a' : '#ff5d5d'; ctx.fillRect(x,y,w*rate,h);
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.strokeRect(x,y,w,h);
    ctx.fillStyle = '#fff'; ctx.font = '13px Microsoft YaHei'; ctx.fillText(label, x+8, y+14);
  };
  bar(24,24,220,18,hero.hp/hero.maxHp,`剑士 HP ${Math.ceil(hero.hp)}/${hero.maxHp}`);
  ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.fillRect(24,48,220,14);
  ctx.fillStyle = '#4ba3ff'; ctx.fillRect(24,48,220*(hero.mp/hero.maxMp),14);
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.strokeRect(24,48,220,14);
  bar(622,24,230,18,enemy.hp/enemy.maxHp,`敌人 HP ${Math.ceil(enemy.hp)}/${enemy.maxHp}`);
}

let lastTime = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - lastTime) / 1000 || 0);
  lastTime = t;
  update(dt, t);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround(); drawEnemy(); drawHero(); drawBars();
  ui.mode.textContent = autoBattle ? '自动战斗' : '手动控制';
  ui.state.textContent = nameMap[hero.state];
  ui.hp.textContent = Math.ceil(hero.hp); ui.mp.textContent = Math.ceil(hero.mp); ui.enemyHp.textContent = Math.ceil(enemy.hp);
  requestAnimationFrame(loop);
}

function resetEnemy() { enemy.hp = enemy.maxHp; enemy.alive = true; battleOverTimer = 0; log('新的训练怪出现'); }
function resetHero() { hero.hp = hero.maxHp; hero.mp = hero.maxMp; hero.alive = true; hero.x = 300; setState('idle', true); log('角色复活并恢复满状态'); }
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
function randFloat(min,max){return Math.random()*(max-min)+min}

document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => {
  autoBattle = false;
  useAction(btn.dataset.action);
}));
document.getElementById('autoBtn').addEventListener('click', () => { autoBattle = !autoBattle; log(autoBattle ? '开启自动战斗' : '切换为手动控制'); });
document.getElementById('resetBtn').addEventListener('click', () => { resetHero(); resetEnemy(); });
document.getElementById('deathBtn').addEventListener('click', () => { hero.hp = 0; hero.alive = false; setState('death', true); log('手动触发倒地死亡动作'); });

document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'a') { autoBattle = false; movingLeft = true; }
  if (k === 'd') { autoBattle = false; movingRight = true; }
  if (k === 'j') { autoBattle = false; useAction('attack'); }
  if (k === 'k') { autoBattle = false; useAction('heavy'); }
  if (k === 'l') { autoBattle = false; useAction('skill'); }
  if (k === 'r') resetHero();
});
document.addEventListener('keyup', e => { if (e.key.toLowerCase()==='a') movingLeft=false; if (e.key.toLowerCase()==='d') movingRight=false; });

log('自动战斗已启动：靠近敌人后自动匹配普通攻击、重击和技能攻击。');
