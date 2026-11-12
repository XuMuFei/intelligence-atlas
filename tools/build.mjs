/* 一次性内容生成器：把 app.js 中的数据转成静态 HTML（含事实订正）。
   运行后 index.html 成为内容唯一事实源，app.js 只做渐进增强。 */
import fs from 'node:fs';
import vm from 'node:vm';

const ROOT = 'E:/AI/xzfnn';
const src = fs.readFileSync(ROOT + '/web/assets/app.js', 'utf8');
const start = src.indexOf('const TIMELINE');
const end = src.indexOf('/* ------------------------------------------------------------\n   0 / Canvas');
if (start < 0 || end < 0) throw new Error('data block not found');
const D = vm.runInNewContext(src.slice(start, end) +
  '\n;({TIMELINE,SCOPES,ROBOTS,IMAGINE,BARS,FORM_LABEL})');

const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));

/* ---------- 事实订正 ---------- */
const STAGE_LABEL = { live: '已量产', pilot: '规模试点', lab: '实验室', early: '早期', concept: '概念' };
const STAGE_CLASS = { live: 'live', pilot: 'pilot', lab: 'lab', early: 'early', concept: 'concept' };
const ERA_NAME = { found: '奠基期', winter: '寒冬与复苏', deep: '深度学习期', gen: '生成与智能体期' };

const light = D.TIMELINE.find(t => t.name.includes('Lighthill'));
light.y = 1973;
light.short = '一份权威评估指出 AI 并未兑现"十年内匹敌人类智能"的承诺，英国随后大幅撤出公共资助，成为第一次寒冬的标志性事件。';

const blue = D.TIMELINE.find(t => t.name.includes('深蓝'));
blue.tech = '本质是每秒约 2 亿个局面的暴力搜索 + 人工调校的局面评估函数，而非"理解"国际象棋。';

const ago = D.TIMELINE.find(t => t.name.includes('AlphaGo'));
ago.short = '在分支因子远超国际象棋的搜索空间里，用价值网络替代人工直觉，并下出了人类棋谱中不存在的一手。';

D.ROBOTS[0].n = '全尺寸双足通用人形';
D.ROBOTS[0].v = '工业路线 · 全尺寸双足';

/* 采纳时滞：语义自洽，后两项明确标为推演 */
const ADOPT = [
  { n: '对话式 AI', v: 3, s: '已规模使用', c: 'var(--cyan)' },
  { n: '文生图', v: 2, s: '已规模使用', c: 'var(--lime)' },
  { n: '编程副驾', v: 2, s: '已规模使用', c: 'var(--blue)' },
  { n: '语音克隆', v: 5, s: '已规模使用', c: 'var(--amber)' },
  { n: '人形机器人', v: 12, s: '推演', c: 'var(--violet)' },
  { n: '自动驾驶出租车', v: 14, s: '推演', c: 'var(--mag)' },
];
const ADOPT_MAX = 16;

/* ---------- 派生统计 ---------- */
const stageCount = {};
const formCount = {};
D.ROBOTS.forEach(r => {
  stageCount[r.stage] = (stageCount[r.stage] || 0) + 1;
  formCount[r.form] = (formCount[r.form] || 0) + 1;
});
const MIX_ORDER = ['live', 'pilot', 'lab', 'early', 'concept'];
const MIX_COLOR = { live: 'var(--lime)', pilot: 'var(--cyan)', lab: 'var(--amber)', early: 'var(--violet)', concept: 'var(--mag)' };
const MIX = MIX_ORDER.filter(k => stageCount[k]).map(k => ({ k, label: STAGE_LABEL[k], n: stageCount[k], c: MIX_COLOR[k] }));
const totalUnits = D.ROBOTS.length;
const totalScenes = Object.values(D.SCOPES).reduce((s, x) => s + x.scenes.length, 0);
const horizon = Math.max(...D.IMAGINE.map(x => +x.y));
const years = 2026 - D.TIMELINE[0].y;

/* ---------- 形态线稿 ---------- */
const SVG = {
  humanoid: '<circle cx="32" cy="10" r="6.5"/><path d="M32 17v15M32 22l-11 7M32 22l11 7M32 32l-8 16M32 32l8 16"/><circle cx="32" cy="10" r="2" fill="currentColor" stroke="none"/>',
  mobile: '<rect x="14" y="20" width="36" height="14" rx="3"/><path d="M20 34l-5 12M28 34l-2 12M40 34l2 12M48 34l5 12"/><circle cx="14" cy="24" r="4"/><path d="M10 24h-6"/>',
  arm: '<path d="M8 54h16"/><path d="M16 54V38l16-14 14 8"/><circle cx="16" cy="38" r="3.5"/><circle cx="32" cy="24" r="3.5"/><circle cx="46" cy="32" r="3.5"/><path d="M46 32l9-6m0 0l6 3m-6-3l2 7"/>',
  air: '<path d="M32 26v14M25 33h14"/><circle cx="32" cy="33" r="5"/><path d="M20 20l-8-8M44 20l8-8M20 46l-8 8M44 46l8 8"/><circle cx="12" cy="12" r="5"/><circle cx="52" cy="12" r="5"/><circle cx="12" cy="52" r="5"/><circle cx="52" cy="52" r="5"/>',
  water: '<path d="M8 36c8-10 18-10 26 0 8 10 18 10 26 0"/><path d="M22 36c-6-6-6-14 0-18"/><ellipse cx="30" cy="30" rx="12" ry="7" transform="rotate(-20 30 30)"/><circle cx="25" cy="27" r="1.6" fill="currentColor" stroke="none"/>',
  wear: '<path d="M18 22a14 14 0 0 1 28 0v16a14 14 0 0 1-28 0z"/><path d="M12 30h6M46 30h6"/><circle cx="26" cy="30" r="4"/><circle cx="38" cy="30" r="4"/><path d="M30 30h4M20 46l4 8M44 46l-4 8"/>',
  desk: '<rect x="12" y="14" width="40" height="28" rx="4"/><path d="M22 50h20M32 42v8"/><circle cx="32" cy="28" r="7"/><path d="M32 21v-6M39 28h6M25 28h-6M32 35v6"/>',
};
const svgOf = f => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${SVG[f] || SVG.desk}</svg>`;
const STAGE_HUE = { live: '#7dffb0', pilot: '#4ff0ff', lab: '#ffb347', early: '#a86bff', concept: '#ff3ea5' };

/* ---------- 片段 ---------- */
const railSections = [
  ['hero', '00 · 启动'], ['timeline', '01 · 演化'], ['scopes', '02 · 实景'], ['robots', '03 · 图鉴'],
  ['imagine', '04 · 推演'], ['metrics', '05 · 读数'], ['guard', '06 · 护栏'], ['close', '07 · 尾声'],
];
const railHTML = railSections.map(([id, label], i) =>
  `<li${i === 0 ? ' class="on"' : ''}><a href="#${id}"><i aria-hidden="true"></i>${esc(label)}</a></li>`).join('\n      ');

const navLinks = [['timeline', '演化'], ['scopes', '实景'], ['robots', '图鉴'], ['imagine', '推演'], ['metrics', '读数'], ['guard', '护栏']];
const topnavHTML = navLinks.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('\n      ');
const mnavHTML = railSections.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join('\n    ');

const eraChips = [['all', '全部'], ['found', '奠基'], ['winter', '寒冬与复苏'], ['deep', '深度学习'], ['gen', '生成与智能体']]
  .map(([k, t], i) => `<button class="chip${i === 0 ? ' is-on' : ''}" type="button" data-era="${k}" aria-pressed="${i === 0}">${t}</button>`).join('\n        ');

const tlListHTML = D.TIMELINE.map((m, i) => `
      <button class="tl-item${i === 0 ? ' on' : ''}" type="button" role="option" id="tl-opt-${i}"
        aria-selected="${i === 0}" tabindex="-1" data-i="${i}" data-era="${m.era}">
        <span class="yr">${m.y}</span>
        <span class="nm">${esc(m.name)}<small>${esc(m.tag)}</small></span>
      </button>`).join('');

const tlDetailHTML = D.TIMELINE.map((m, i) => `
      <article class="tl-entry${i === 0 ? ' is-active' : ''}" id="tl-det-${i}" data-i="${i}">
        <span class="tag">${esc(m.tag)} · ${ERA_NAME[m.era]}</span>
        <div class="yr-big mono">${m.y}</div>
        <h3>${esc(m.name)}</h3>
        <p class="what">${esc(m.short)}</p>
        <div class="kv">
          <div><h4>技术内核</h4><p>${esc(m.tech)}</p></div>
          <div><h4>连锁后果</h4><p>${esc(m.out)}</p></div>
        </div>
        <div class="ripple"><h4>向下影响 →</h4><ul>${m.ripple.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>
      </article>`).join('');

const SCOPE_KEYS = ['self', 'home', 'city', 'nation', 'world'];
const scopeTabsHTML = SCOPE_KEYS.map((k, i) => {
  const d = D.SCOPES[k];
  const [idx, en] = d.idx.split(' / ');
  const cn = { self: '个人', home: '家庭', city: '社会', nation: '国家', world: '世界' }[k];
  return `<button role="tab" type="button" id="tab-${k}" aria-controls="panel-${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-scope="${k}">
        <span class="mono idx">${idx}</span>${cn}<i>${en}</i>
      </button>`;
}).join('\n      ');

const B_CLASS = { live: 'b-live', pilot: 'b-pilot', rising: 'b-rising', early: 'b-early' };
const scopePanelsHTML = SCOPE_KEYS.map((k, i) => {
  const d = D.SCOPES[k];
  return `
      <section class="scope-panel${i === 0 ? ' is-active' : ''}" id="panel-${k}" role="tabpanel" aria-labelledby="tab-${k}" tabindex="0">
        <div class="scope-hero">
          <p class="eyebrow mono"><span class="tick" aria-hidden="true"></span>${esc(d.idx)}</p>
          <h3>${esc(d.title)}</h3>
          <p class="day">${esc(d.day)}</p>
          <dl class="scope-metrics">${d.metrics.map(m => `<div><dt>${esc(m[0])}</dt><dd>${esc(m[1])}<small>${esc(m[2])}</small></dd></div>`).join('')}</dl>
          <p class="mono fine disclaimer">※ 本尺度数值为叙事示意，非实时统计。</p>
        </div>
        <div class="scene-grid">${d.scenes.map(s => `
          <article class="scene">
            <div class="hd"><h4>${esc(s.n)}</h4><span class="badge ${B_CLASS[s.b[0]] || ''}">${esc(s.b[1])}</span></div>
            <p>${esc(s.d)}</p>
            <p class="who">关键张力 · ${esc(s.w)}</p>
          </article>`).join('')}
        </div>
      </section>`;
}).join('');

const formChips = ['all', ...Object.keys(D.FORM_LABEL).filter(f => formCount[f])]
  .map((f, i) => `<button class="chip${i === 0 ? ' is-on' : ''}" type="button" data-form="${f}" aria-pressed="${i === 0}">${f === 'all' ? '全部形态' : esc(D.FORM_LABEL[f])}<span class="chip-n">${f === 'all' ? totalUnits : formCount[f]}</span></button>`).join('\n        ');
const stageChips = ['all', ...MIX_ORDER.filter(k => stageCount[k])]
  .map((s, i) => `<button class="chip${i === 0 ? ' is-on' : ''}" type="button" data-stage="${s}" aria-pressed="${i === 0}">${s === 'all' ? '全部阶段' : esc(STAGE_LABEL[s])}<span class="chip-n">${s === 'all' ? totalUnits : stageCount[s]}</span></button>`).join('\n        ');

const cardsHTML = D.ROBOTS.map((r, i) => {
  const search = (r.n + ' ' + r.v + ' ' + r.s + ' ' + r.c.join(' ') + ' ' + r.code + ' ' + D.FORM_LABEL[r.form] + ' ' + STAGE_LABEL[r.stage]).toLowerCase();
  return `
      <article class="card" id="unit-${r.code}" data-i="${i}" data-form="${r.form}" data-stage="${r.stage}" data-ms="${r.ms}" data-search="${esc(search)}">
        <div class="c-vis" style="color:${STAGE_HUE[r.stage]}">${svgOf(r.form)}</div>
        <div class="c-body">
          <p class="c-code mono">${esc(r.code)} · ${esc(D.FORM_LABEL[r.form])}</p>
          <h4>${esc(r.n)}</h4>
          <p class="vendor">${esc(r.v)}</p>
          <dl class="c-specs">${r.sp.map(s => `<div><dt>${esc(s[0])}</dt><dd>${esc(s[1])}</dd></div>`).join('')}</dl>
          <div class="c-foot">
            <span class="badge ${STAGE_CLASS[r.stage]}">${esc(STAGE_LABEL[r.stage])}</span>
            <span class="c-bar" role="img" aria-label="成熟度指数 ${r.ms} / 100"><i style="--v:${r.ms}%"></i></span>
          </div>
          <button class="card-open mono" type="button" aria-haspopup="dialog" aria-controls="drawer">查看完整参数 <span aria-hidden="true">→</span></button>
          <div class="card-extra">
            <p class="dz-sum">${esc(r.s)}</p>
            <div class="dz-sec"><h4>典型部署场景</h4><ul>${r.c.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
            <div class="dz-sec"><h4>当前的真实边界</h4><p>${esc(r.l)}</p></div>
            <p class="mono fine disclaimer">※ 参数为叙事示意，不构成产品规格。</p>
          </div>
        </div>
      </article>`;
}).join('');

const riskW = { 'r-low': '24%', 'r-mid': '60%', 'r-high': '94%' };
const imagineHTML = D.IMAGINE.map((x, i) => `
      <article class="im" data-i="${i}">
        <p class="yr mono">HORIZON ${esc(x.y)}</p>
        <h4>${esc(x.t)}</h4>
        <p class="pre">${x.p}</p>
        <div class="im-tags">${x.tg.map(t => `<span>${esc(t)}</span>`).join('')}</div>
        <div class="risk">
          <span>技术前置 <i class="${x.f}" style="--v:${riskW[x.f]}" aria-hidden="true"></i>${esc(x.fk)}</span>
          <span>风险 <i class="${x.rk}" style="--v:${riskW[x.rk]}" aria-hidden="true"></i>${esc(x.rv)}</span>
        </div>
        <button class="toggle mono" type="button" aria-expanded="false" aria-controls="im-cost-${i}">展开代价 · 连锁影响 <span aria-hidden="true">↓</span></button>
        <div class="cost" id="im-cost-${i}">
          <div><div class="inner">
            <h5>代价与连锁 →</h5>
            <ul>${x.c.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
            <p class="mono fine">推演编号 IM-${String(i + 1).padStart(2, '0')} · 非预测，仅为可争论的假设</p>
          </div></div>
        </div>
      </article>`).join('');

const barsHTML = D.BARS.map(b => `
        <li><span class="lb">${esc(b.n)}</span><span class="vl mono">${b.v}</span>
          <span class="tr${b.h ? ' human' : ''}"><i style="--v:${(b.v / 140 * 100).toFixed(1)}%"></i></span></li>`).join('');

const chartHTML = ADOPT.map(a => `
        <div class="col">
          <div class="bar${a.s === '推演' ? ' is-proj' : ''}" style="--h:${Math.round(a.v / ADOPT_MAX * 190)}px;--c:${a.c}"><span class="mono">${a.v} 年</span></div>
          <div class="nm">${esc(a.n)}<i>${a.s}</i></div>
        </div>`).join('');

const mixTotal = MIX.reduce((s, m) => s + m.n, 0);
const mixHTML = MIX.map(m => `<i style="--v:${(m.n / mixTotal * 100).toFixed(1)}%;--c:${m.c}" title="${esc(m.label)} ${m.n} 型">${m.n}</i>`).join('');
const mixLegendHTML = MIX.map(m => `<span style="--c:${m.c}"><b aria-hidden="true"></b>${esc(m.label)} · ${m.n} 型</span>`).join('');

const guard = [
  ['G1', '对齐与可控', '系统是否稳定地按人类真实意图行动，并在被要求停止时停下来。评测要覆盖分布外场景，而不只是常见问答。', 42, '中低'],
  ['G2', '数据与偏见', '训练数据里沉默的部分，会在医疗分诊、信贷、招聘中被放大成结构性拒绝。需要可审计的样本构成与分群体指标。', 55, '中'],
  ['G3', '能源与水土', '算力是新的重工业。选址、冷却水、电网余量与余热回收应当成为公开披露项，而非营销脚注。', 38, '低'],
  ['G4', '真实与信任', '合成内容需要可验证的来源凭证。识别器不是答案，密码学签名与发布链路溯源才是。', 61, '中'],
  ['G5', '劳动与转型', '被替代的是任务而非职业。真正的政策难点在过渡期：技能再认证、收入保险与地方产业重建。', 33, '低'],
  ['G6', '权力集中度', '模型、算力与分发渠道若同时集中，标准就失去了谈判者。开放权重、公共评测与第三方审计是分散化的三个支点。', 29, '低'],
];
const guardHTML = guard.map(([id, t, p, v, lv]) => `
    <article class="g-card"><h3><span class="mono">${id}</span>${t}</h3><p>${p}</p>
      <div class="g-meter"><i style="--v:${v}%"></i><span class="mono">当前投入 · ${lv}（示意）</span></div></article>`).join('');

/* ---------- 页面 ---------- */
const html = `<!DOCTYPE html>
<html lang="zh-CN" class="no-js">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>智能纪元 · AI 全景档案 | 从图灵测试到星际文明</title>
<meta name="description" content="一份关于人工智能的可视化全景档案：${years} 年技术演化时间轴、个人到世界五重尺度的 ${totalScenes} 个实景应用、${totalUnits} 型机器人与智能硬件图鉴，以及面向 2029—${horizon} 的想象推演。">
<meta name="theme-color" content="#04060d">
<meta name="format-detection" content="telephone=no">
<meta property="og:title" content="智能纪元 · AI 全景档案">
<meta property="og:description" content="从图灵测试到星际文明：AI 演化史、五重尺度实景应用、机器人图鉴与未来推演。">
<meta property="og:type" content="website">
<link rel="stylesheet" href="assets/styles.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%2304060d'/%3E%3Ccircle cx='16' cy='16' r='7' fill='none' stroke='%234ff0ff' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='2.5' fill='%23ff3ea5'/%3E%3C/svg%3E">
<script>document.documentElement.className='js';</script>
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<canvas id="net" class="net" aria-hidden="true"></canvas>
<div class="cursor-glow" id="cursorGlow" aria-hidden="true"></div>

<a class="skip" href="#timeline">跳到正文</a>

<header class="topbar" id="topbar">
  <div class="brand">
    <span class="brand-mark" aria-hidden="true"></span>
    <span class="brand-txt">
      <b>智能纪元</b>
      <i>INTELLIGENCE · ATLAS / v2026.09</i>
    </span>
  </div>
  <nav class="topnav" aria-label="章节导航">
      ${topnavHTML}
  </nav>
  <div class="statusline" aria-hidden="true">
    <span class="dot"></span>
    <span id="statusText">SYS ONLINE</span>
  </div>
  <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="mnav" aria-label="打开章节菜单">
    <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
  </button>
</header>

<nav class="mnav" id="mnav" aria-label="章节菜单" hidden>
  <div class="mnav-inner">
    ${mnavHTML}
  </div>
</nav>

<nav class="rail" aria-label="快速导航">
  <ol id="rail">
      ${railHTML}
  </ol>
</nav>

<noscript>
  <div class="noscript-note">
    当前浏览器未启用 JavaScript。档案的全部正文、参数与推演均已完整呈现；
    时间轴筛选、尺度切换、图鉴检索与参数抽屉等交互不可用。
  </div>
</noscript>

<main>
<!-- ============ 00 / 开场 ============ -->
<section class="hero" id="hero" data-rail="00 · 启动">
  <div class="hud-frame" aria-hidden="true"></div>
  <div class="hero-inner">
    <p class="eyebrow mono"><span class="tick" aria-hidden="true"></span>ARCHIVE_00 / 视觉档案 · 概念演示站</p>
    <h1 class="hero-title">
      <span class="line">智能<span class="grad">纪元</span></span>
      <span class="sub line mono" id="boot">&gt; 载入 ${years} 年 · 5 重尺度 · ${totalUnits} 型图鉴 · ${D.IMAGINE.length} 条推演</span>
    </h1>
    <p class="hero-lede">
      从 1950 年一场关于「机器能否思考」的追问，到今天口袋里、医院里、电网里、轨道上的
      沉默基础设施。这份档案把 <em>人工智能</em> 摊开成四条线索：
      <b>它从哪里来</b>、<b>此刻正在做什么</b>、<b>它长成了什么形态</b>、<b>它可能带我们去哪里</b>。
    </p>
    <div class="hero-cta">
      <a class="btn btn-primary" href="#timeline">进入演化时间轴 <span aria-hidden="true">→</span></a>
      <a class="btn" href="#imagine">直接跳到未来推演</a>
    </div>

    <dl class="hero-stats" id="heroStats">
      <div><dt class="mono">YEARS_OF_HISTORY</dt><dd><b data-count="${years}">${years}</b><i>年</i></dd></div>
      <div><dt class="mono">SCENES_TRACKED</dt><dd><b data-count="${totalScenes}">${totalScenes}</b><i>个实景场景</i></dd></div>
      <div><dt class="mono">UNITS_CATALOGUED</dt><dd><b data-count="${totalUnits}">${totalUnits}</b><i>型图鉴在册</i></dd></div>
      <div><dt class="mono">HORIZON</dt><dd><b data-count="${horizon}">${horizon}</b><i>年 · 推演上限</i></dd></div>
    </dl>
    <p class="mono fine">※ 本页数值为叙事示意数据，非实时接口结果。</p>
  </div>
  <div class="scroll-hint mono" aria-hidden="true">SCROLL ↓ 01</div>
</section>

<!-- ============ 01 / 演化时间轴 ============ -->
<section class="chapter" id="timeline" data-rail="01 · 演化">
  <div class="chapter-head">
    <span class="num mono" aria-hidden="true">01</span>
    <div>
      <h2>演化时间轴</h2>
      <p class="lede">
        人工智能不是某一年突然出现的发明，而是一串被反复点燃又被判死刑的赌注。
        选择任意节点查看它的技术内核与连锁后果。
      </p>
    </div>
    <div class="era-switch" role="group" aria-label="按时代筛选">
        ${eraChips}
    </div>
  </div>

  <div class="tl">
    <div class="tl-railwrap" aria-hidden="true">
      <div class="tl-track"><div class="tl-fill" id="tlFill"></div></div>
    </div>
    <div class="tl-list" id="tlList" role="listbox" aria-label="里程碑" aria-activedescendant="tl-opt-0" tabindex="0">${tlListHTML}
    </div>
    <div class="tl-detail" id="tlDetail" aria-live="polite">${tlDetailHTML}
    </div>
  </div>
</section>

<!-- ============ 02 / 五重尺度 ============ -->
<section class="chapter" id="scopes" data-rail="02 · 实景">
  <div class="chapter-head">
    <span class="num mono" aria-hidden="true">02</span>
    <div>
      <h2>实景应用 · 五重尺度</h2>
      <p class="lede">
        同一项技术，放在不同尺度上会长成完全不同的东西。从一个人的清晨，到一颗行星的资源调度——
        按 <kbd>←</kbd> <kbd>→</kbd> 或点击切换尺度。
      </p>
    </div>
  </div>

  <div class="scopes">
    <div class="scope-tabs" role="tablist" aria-label="尺度">
      ${scopeTabsHTML}
    </div>
    <div class="scope-panels" id="scopePanels">${scopePanelsHTML}
    </div>
  </div>
</section>

<!-- ============ 03 / 机器人图鉴 ============ -->
<section class="chapter" id="robots" data-rail="03 · 图鉴">
  <div class="chapter-head">
    <span class="num mono" aria-hidden="true">03</span>
    <div>
      <h2>机器人与智能硬件图鉴</h2>
      <p class="lede">
        当模型装进身体，抽象的智能就变成了可触摸的劳动。按形态与成熟度筛选，点击任意条目展开完整参数卡。
      </p>
    </div>
  </div>

  <div class="cat">
    <div class="cat-bar">
      <div class="cat-group" role="group" aria-label="按形态筛选">
        <span class="cat-label mono">FORM</span>
        ${formChips}
      </div>
      <div class="cat-group" role="group" aria-label="按成熟度筛选">
        <span class="cat-label mono">MATURITY</span>
        ${stageChips}
      </div>
      <div class="cat-group cat-query">
        <label class="cat-label mono" for="catSearch">QUERY</label>
        <input id="catSearch" type="search" placeholder="搜索名称、厂商或场景…" autocomplete="off">
      </div>
    </div>
    <p class="cat-count mono" id="catCount" role="status">SHOWING <b>${totalUnits}</b> / ${totalUnits} UNITS</p>
    <div class="cat-grid" id="catGrid">${cardsHTML}
    </div>
    <p class="c-none mono" id="catNone" hidden>NO MATCH · 放宽筛选条件或换一个关键词</p>
  </div>

  <div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" hidden>
    <div class="drawer-bg" data-close></div>
    <div class="drawer-panel" id="drawerPanel" tabindex="-1">
      <button class="drawer-x mono" type="button" data-close aria-label="关闭参数卡">✕ ESC</button>
      <div id="drawerBody"></div>
    </div>
  </div>
</section>

<!-- ============ 04 / 想象实验室 ============ -->
<section class="chapter imagine" id="imagine" data-rail="04 · 推演">
  <div class="chapter-head">
    <span class="num mono" aria-hidden="true">04</span>
    <div>
      <h2>想象实验室</h2>
      <p class="lede">
        这里不做预测，只做推演。每条设想给出<b>技术前置</b>、<b>连锁影响</b>与<b>风险评级</b>——
        点开才能看到代价。越远的设想，越应该被认真讨论，而不是被欢呼或被忽略。
      </p>
    </div>
    <button class="btn btn-ghost" id="revealAll" type="button" aria-pressed="false">展开全部代价</button>
  </div>
  <div class="im-grid" id="imGrid">${imagineHTML}
  </div>
</section>

<!-- ============ 05 / 读数 ============ -->
<section class="chapter" id="metrics" data-rail="05 · 读数">
  <div class="chapter-head">
    <span class="num mono" aria-hidden="true">05</span>
    <div>
      <h2>能力读数板</h2>
      <p class="lede">模型能力的成长不是均匀的：有些维度早已超越人类基线，有些维度仍然不稳。</p>
    </div>
  </div>
  <div class="m-grid">
    <div class="panel">
      <h3 class="panel-title mono">CAPABILITY_SPECTRUM</h3>
      <p class="panel-note">以人类专家基线 = 100 归一化的相对读数（示意）。</p>
      <ul class="bars" id="bars">${barsHTML}
      </ul>
    </div>
    <div class="panel">
      <h3 class="panel-title mono">ADOPTION_LAG</h3>
      <p class="panel-note">从首次可用到规模日常使用的年数；紫色与品红为推演值（示意）。</p>
      <div class="chart" id="chart">${chartHTML}
      </div>
    </div>
    <div class="panel">
      <h3 class="panel-title mono">DEPLOYMENT_MAP</h3>
      <p class="panel-note">图鉴中 ${totalUnits} 型条目的成熟度构成（由图鉴实时派生）。</p>
      <div class="mix" id="mix" role="img" aria-label="成熟度构成：${MIX.map(m => `${m.label} ${m.n} 型`).join('，')}">${mixHTML}</div>
      <div class="legend mono" id="mixLegend">${mixLegendHTML}</div>
    </div>
  </div>
</section>

<!-- ============ 06 / 护栏 ============ -->
<section class="chapter" id="guard" data-rail="06 · 护栏">
  <div class="chapter-head">
    <span class="num mono" aria-hidden="true">06</span>
    <div>
      <h2>六道护栏</h2>
      <p class="lede">
        任何一份只写可能性的档案都不诚实。让 AI 走得更远的，从来不只是模型能力，
        还有围绕它的六件事是否被同时做好。
      </p>
    </div>
  </div>
  <div class="g-grid">${guardHTML}
  </div>
</section>

<section class="chapter" id="close" data-rail="07 · 尾声">
  <div class="chapter-head">
    <span class="num mono" aria-hidden="true">07</span>
    <div><h2>尾声 · 未完成的句子</h2></div>
  </div>
  <div class="closing">
    <p class="big">
      技术史里少见这样的局面：<em>工具本身正在参与设计下一代工具。</em>
      这意味着接下来的时间表不再由某一次发布会决定，而由我们今天设定的
      默认值决定——数据默认归谁、决策默认能否申诉、自动化默认是否可退出。
    </p>
    <p class="mono fine">
      这份档案本身就是一份未完成的输出。它的每一条"可能"，都以今天的"尚未"为代价。
    </p>
  </div>
</section>
</main>

<footer class="foot">
  <div class="foot-top">
    <div>
      <b class="mono">智能纪元 · AI 全景档案</b>
      <p>一个纯前端的概念演示站。所有数值、机型与厂商均为叙事示意，用于呈现结构与可能性，不构成产品参数、投资依据或事实来源。</p>
    </div>
    <div class="foot-cols">
      <div><h4 class="mono">SECTIONS</h4><a href="#timeline">演化时间轴</a><a href="#scopes">五重尺度</a><a href="#robots">机器人图鉴</a><a href="#imagine">想象实验室</a></div>
      <div><h4 class="mono">BUILD</h4><span>HTML · CSS · Canvas</span><span>零运行时依赖</span><span>无 JS 亦可完整阅读</span><span>响应式 / 键盘可达</span></div>
    </div>
  </div>
  <div class="foot-bot mono">
    <span>© 2026 INTELLIGENCE ATLAS · CONCEPT SITE</span>
    <span id="clock">--:--:--</span>
  </div>
</footer>

<script src="assets/app.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(ROOT + '/web/index.html', html, 'utf8');
console.log('index.html written:', html.length, 'bytes');
console.log('derived:', { years, totalScenes, totalUnits, horizon, stageCount, formCount, mix: MIX.map(m => `${m.label}:${m.n}`) });
