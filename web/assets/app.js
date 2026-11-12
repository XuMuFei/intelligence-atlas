/* ============================================================
   智能纪元 · AI 全景档案 — 渐进增强层
   内容唯一事实源是 index.html；本脚本只做交互、动效与可访问性。
   无 JS 时页面仍可完整阅读（见 styles.css 的 .no-js 规则）。
   ============================================================ */
(() => {
'use strict';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const el = (t, c) => { const n = document.createElement(t); if (c) n.className = c; return n; };

/* ------------------------------------------------------------
   0 / Canvas 神经网络背景（带运行守卫，避免重复 rAF）
   ------------------------------------------------------------ */
(() => {
  const cv = $('#net'); if (!cv || RM) return;
  const ctx = cv.getContext('2d');
  let W=0, H=0, dpr=1, pts=[], raf=0, running=false;
  function init(){
    dpr = Math.min(devicePixelRatio||1, 1.6);
    W = cv.width = innerWidth*dpr; H = cv.height = innerHeight*dpr;
    cv.style.width = innerWidth+'px'; cv.style.height = innerHeight+'px';
    const n = innerWidth < 720 ? 34 : innerWidth < 1280 ? 58 : 78;
    pts = Array.from({length:n},()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.16*dpr, vy:(Math.random()-.5)*.16*dpr,
      r:(Math.random()*1.6+.7)*dpr, p:Math.random()*6.28
    }));
  }
  function frame(){
    ctx.clearRect(0,0,W,H);
    const link = 155*dpr;
    for(let i=0;i<pts.length;i++){
      const a=pts[i]; a.x+=a.vx; a.y+=a.vy; a.p+=.012;
      if(a.x<0||a.x>W)a.vx*=-1; if(a.y<0||a.y>H)a.vy*=-1;
      for(let j=i+1;j<pts.length;j++){
        const b=pts[j], dx=a.x-b.x, dy=a.y-b.y, d=Math.hypot(dx,dy);
        if(d<link){
          const o=(1-d/link)*.30;
          ctx.strokeStyle=`rgba(${90+140*(1-d/link)},${200-100*(d/link)},255,${o})`;
          ctx.lineWidth=dpr*.6; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
      const g=.55+.45*Math.sin(a.p);
      ctx.fillStyle=`rgba(${a.r>1.6*dpr?255:110},${a.r>1.6*dpr?90:235},${a.r>1.6*dpr?165:255},${.35*g})`;
      ctx.beginPath(); ctx.arc(a.x,a.y,a.r*2.4,0,6.283); ctx.fill();
      ctx.fillStyle=`rgba(220,250,255,${.6*g})`;
      ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,6.283); ctx.fill();
    }
    if(running) raf=requestAnimationFrame(frame);
  }
  function start(){ if(running) return; running=true; raf=requestAnimationFrame(frame); }
  function stop(){ running=false; cancelAnimationFrame(raf); }
  init(); start();
  let to; addEventListener('resize',()=>{clearTimeout(to);to=setTimeout(init,180)});
  document.addEventListener('visibilitychange',()=>{ document.hidden ? stop() : start(); });
})();

/* ------------------------------------------------------------
   1 / 时钟（真实时区）· 光标辉光 · 侧栏当前章
   ------------------------------------------------------------ */
(() => {
  const clock = $('#clock');
  function tick(){
    const d = new Date();
    const off = -d.getTimezoneOffset()/60;
    const h = Math.floor(Math.abs(off)), m = Math.round((Math.abs(off)-h)*60);
    const tz = 'UTC' + (off>=0?'+':'-') + h + (m ? ':'+String(m).padStart(2,'0') : '');
    clock.textContent = d.toLocaleTimeString('zh-CN',{hour12:false}) + ' ' + tz;
  }
  tick(); setInterval(tick, 1000);

  const status = $('#statusText');
  const msgs = ['SYS ONLINE','NEURAL LINK STABLE','ARCHIVE SYNCED','SENSORS NOMINAL'];
  let mi = 0;
  setInterval(()=>{ mi=(mi+1)%msgs.length; status.textContent=msgs[mi]; }, 6000);

  const glow = $('#cursorGlow');
  if (glow && matchMedia('(hover:hover) and (pointer:fine)').matches){
    addEventListener('pointermove', e => {
      glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    }, {passive:true});
  }

  const railItems = $$('#rail li');
  const byId = new Map(railItems.map(li => [li.querySelector('a').getAttribute('href').slice(1), li]));
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      railItems.forEach(li => li.classList.remove('on'));
      const li = byId.get(e.target.id); if (li) li.classList.add('on');
    });
  }, {rootMargin:'-42% 0px -52% 0px'});
  $$('section[data-rail]').forEach(s => io.observe(s));
})();

/* ------------------------------------------------------------
   2 / 移动端章节菜单
   ------------------------------------------------------------ */
(() => {
  const btn = $('#menuBtn'), nav = $('#mnav');
  function setMenu(open){
    nav.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? '关闭章节菜单' : '打开章节菜单');
    btn.classList.toggle('is-open', open);
  }
  btn.addEventListener('click', () => setMenu(nav.hidden));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', e => {
    if (!nav.hidden && !e.target.closest('#mnav,#menuBtn')) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !nav.hidden){ setMenu(false); btn.focus(); }
  });
})();

/* ------------------------------------------------------------
   3 / 入场动效 · 数字滚动 · 启动打字（仅 JS 环境）
   ------------------------------------------------------------ */
(() => {
  if (!RM){
    const targets = $$('.chapter-head, .panel, .scene, .card, .im, .g-card, .scope-hero, .closing, .tl-detail');
    const groups = new Map();
    targets.forEach(t => {
      const p = t.parentElement;
      if (!groups.has(p)) groups.set(p, 0);
      const i = groups.get(p); groups.set(p, i+1);
      t.style.transitionDelay = Math.min(i*55, 220) + 'ms';
      t.classList.add('rv');
    });
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.1, rootMargin:'0px 0px -6% 0px'});
    targets.forEach(t => io.observe(t));
  }

  const counters = $$('[data-count]');
  if (!RM && counters.length){
    counters.forEach(b => b.textContent = '0');
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        $$('[data-count]', e.target).forEach(b => {
          const target = parseFloat(b.dataset.count), dec = +(b.dataset.dec||0), t0 = performance.now();
          (function step(t){
            const k = Math.min((t-t0)/1400, 1), ease = 1-Math.pow(1-k,3);
            b.textContent = (target*ease).toFixed(dec);
            if (k<1) requestAnimationFrame(step);
          })(t0);
        });
      });
    }, {threshold:.3});
    io.observe($('#heroStats'));
  }

  const boot = $('#boot');
  if (boot && !RM){
    const full = boot.textContent; boot.textContent = '';
    let i = 0;
    const timer = setInterval(()=>{
      boot.textContent = full.slice(0, ++i);
      if (i >= full.length) clearInterval(timer);
    }, 26);
  }
})();

/* ------------------------------------------------------------
   4 / 时间轴：listbox 选择 + 时代筛选（不触发页面滚动）
   ------------------------------------------------------------ */
(() => {
  const list = $('#tlList'); if (!list) return;
  const opts = $$('.tl-item', list), entries = $$('.tl-entry'), fill = $('#tlFill');
  let current = 0;
  const visible = () => opts.filter(o => !o.classList.contains('hide'));

  function select(i, focusList){
    current = i;
    opts.forEach(o => {
      const on = +o.dataset.i === i;
      o.classList.toggle('on', on);
      o.setAttribute('aria-selected', String(on));
    });
    entries.forEach(en => en.classList.toggle('is-active', +en.dataset.i === i));
    list.setAttribute('aria-activedescendant', 'tl-opt-'+i);
    const vis = visible(), pos = Math.max(vis.indexOf(opts[i]), 0);
    fill.style.height = ((pos+1)/vis.length*100).toFixed(1) + '%';
    const o = opts[i], lr = list.getBoundingClientRect(), or = o.getBoundingClientRect();
    if (or.top < lr.top || or.bottom > lr.bottom){
      list.scrollTop += or.top - lr.top - (list.clientHeight - or.height)/2;
    }
    if (focusList) list.focus({preventScroll:true});
  }

  list.addEventListener('click', e => {
    const o = e.target.closest('.tl-item');
    if (o) select(+o.dataset.i, true);
  });
  list.addEventListener('keydown', e => {
    const vis = visible(); if (!vis.length) return;
    let pos = vis.indexOf(opts[current]); if (pos < 0) pos = 0;
    let np = null;
    if (e.key === 'ArrowDown') np = Math.min(pos+1, vis.length-1);
    else if (e.key === 'ArrowUp') np = Math.max(pos-1, 0);
    else if (e.key === 'Home') np = 0;
    else if (e.key === 'End') np = vis.length-1;
    else return;
    e.preventDefault();
    select(+vis[np].dataset.i);
  });

  const chips = $$('.era-switch .chip');
  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => {
      const on = c === ch;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    const era = ch.dataset.era;
    opts.forEach(o => o.classList.toggle('hide', era !== 'all' && o.dataset.era !== era));
    const vis = visible();
    select(vis.some(o => +o.dataset.i === current) ? current : +vis[0].dataset.i);
  }));

  select(0);
})();

/* ------------------------------------------------------------
   5 / 五重尺度：roving tabindex 选项卡（切换不跳动页面）
   ------------------------------------------------------------ */
(() => {
  const tabs = $$('.scope-tabs [role="tab"]'); if (!tabs.length) return;
  const panels = $$('.scope-panel');
  function activate(tab, focus){
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach(p => p.classList.toggle('is-active', p.id === tab.getAttribute('aria-controls')));
    if (focus) tab.focus({preventScroll:true});
  }
  tabs.forEach(t => t.addEventListener('click', () => activate(t)));
  $('.scope-tabs').addEventListener('keydown', e => {
    const i = tabs.indexOf(document.activeElement); if (i < 0) return;
    let n = null;
    if (e.key === 'ArrowRight') n = (i+1)%tabs.length;
    else if (e.key === 'ArrowLeft') n = (i-1+tabs.length)%tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length-1;
    else return;
    e.preventDefault();
    activate(tabs[n], true);
  });
})();

/* ------------------------------------------------------------
   6 / 图鉴：形态 × 成熟度 × 关键词筛选
   ------------------------------------------------------------ */
(() => {
  const cards = $$('.card'); if (!cards.length) return;
  const countB = $('#catCount b'), none = $('#catNone'), search = $('#catSearch');
  let form = 'all', stage = 'all', q = '';
  function apply(){
    let n = 0;
    cards.forEach(c => {
      const ok = (form === 'all' || c.dataset.form === form)
              && (stage === 'all' || c.dataset.stage === stage)
              && (!q || c.dataset.search.includes(q));
      c.classList.toggle('hide', !ok);
      if (ok) n++;
    });
    countB.textContent = n;
    none.hidden = n > 0;
  }
  $$('.cat-bar .chip').forEach(ch => ch.addEventListener('click', () => {
    const isForm = 'form' in ch.dataset;
    const group = isForm ? '[data-form]' : '[data-stage]';
    $$(`.cat-bar ${group}`).forEach(c => {
      const on = c === ch;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', String(on));
    });
    if (isForm) form = ch.dataset.form; else stage = ch.dataset.stage;
    apply();
  }));
  search.addEventListener('input', () => { q = search.value.trim().toLowerCase(); apply(); });
})();

/* ------------------------------------------------------------
   7 / 参数抽屉：从卡片 DOM 构建，焦点圈闭 + 归还
   ------------------------------------------------------------ */
(() => {
  const drawer = $('#drawer'), panel = $('#drawerPanel'), body = $('#drawerBody');
  if (!drawer) return;
  let lastFocus = null;

  function build(card){
    body.innerHTML = '';
    const hero = el('div','dz-hero');
    hero.appendChild($('.c-vis', card).cloneNode(true));
    const info = el('div');
    const code = el('p','c-code mono'); code.textContent = $('.c-code', card).textContent;
    const h = el('h3'); h.id = 'drawerTitle'; h.textContent = $('h4', card).textContent;
    const vendor = el('p','vendor'); vendor.textContent = $('.vendor', card).textContent;
    info.append(code, h, vendor);
    hero.appendChild(info);
    body.appendChild(hero);

    body.appendChild($('.dz-sum', card).cloneNode(true));
    body.appendChild($('.c-foot', card).cloneNode(true));

    const table = el('table','dz-table');
    $$('.c-specs div', card).forEach(d => {
      const tr = el('tr');
      const th = el('th'); th.textContent = $('dt', d).textContent;
      const td = el('td'); td.textContent = $('dd', d).textContent;
      tr.append(th, td); table.appendChild(tr);
    });
    body.appendChild(table);

    const extra = $('.card-extra', card).cloneNode(true);
    $('.dz-sum', extra).remove();
    body.appendChild(extra);
  }

  function focusables(){
    return $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', panel)
      .filter(x => !x.disabled && x.offsetParent !== null);
  }
  function onKey(e){
    if (e.key === 'Escape'){ e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables(); if (!f.length){ e.preventDefault(); return; }
    const first = f[0], last = f[f.length-1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)){
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last){
      e.preventDefault(); first.focus();
    }
  }
  function open(card){
    lastFocus = document.activeElement;
    build(card);
    drawer.hidden = false;
    document.body.classList.add('lock');
    panel.focus();
    document.addEventListener('keydown', onKey);
  }
  function close(){
    drawer.hidden = true;
    document.body.classList.remove('lock');
    document.removeEventListener('keydown', onKey);
    if (lastFocus) lastFocus.focus({preventScroll:true});
  }
  drawer.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  $$('.card-open').forEach(b => b.addEventListener('click', () => open(b.closest('.card'))));
})();

/* ------------------------------------------------------------
   8 / 想象实验室：逐条展开 + 全部展开
   ------------------------------------------------------------ */
(() => {
  const ims = $$('.im'); if (!ims.length) return;
  const ra = $('#revealAll');
  const LABEL_OPEN = '展开代价 · 连锁影响 <span aria-hidden="true">↓</span>';
  const LABEL_SHUT = '收起代价 · 连锁影响 <span aria-hidden="true">↑</span>';
  function setOpen(im, open){
    im.classList.toggle('open', open);
    const t = $('.toggle', im);
    t.setAttribute('aria-expanded', String(open));
    t.innerHTML = open ? LABEL_SHUT : LABEL_OPEN;
  }
  function syncReveal(){
    const all = ims.every(i => i.classList.contains('open'));
    ra.setAttribute('aria-pressed', String(all));
    ra.textContent = all ? '收起全部代价' : '展开全部代价';
  }
  ims.forEach(im => $('.toggle', im).addEventListener('click', () => {
    setOpen(im, !im.classList.contains('open'));
    syncReveal();
  }));
  ra.addEventListener('click', () => {
    const all = ims.every(i => i.classList.contains('open'));
    ims.forEach(i => setOpen(i, !all));
    syncReveal();
  });
})();

/* ------------------------------------------------------------
   9 / 读数板入场动画（无 JS 时 CSS 直接呈现终值）
   ------------------------------------------------------------ */
(() => {
  const targets = [$('#bars'), $('#chart'), $('#mix'), $('.g-grid')].filter(Boolean);
  if (RM){ targets.forEach(t => t.classList.add('in')); return; }
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.25});
  targets.forEach(t => io.observe(t));
})();

})();