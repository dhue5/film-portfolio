/* ============================================================
   FILM PORTFOLIO · app.js
   数据驱动渲染 · tvOS 视差倾斜 · 滚动叙事图表 · 丝滑弹窗
   纯原生 JS，无任何依赖，GitHub Pages 可直接部署
   ============================================================ */
'use strict';

/* ---------- 环境探测 ---------- */
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = window.matchMedia('(pointer: coarse)').matches;
const DIALOG_NATIVE = typeof HTMLDialogElement !== 'undefined';

/* GitHub Pages 项目页运行于子路径（/portfolio/）：资源一律相对解析 */
const BASE = new URL('./', document.baseURI);
const resolve = (p) => BASE.href.replace(/\/$/, '') + '/' + p.replace(/^\.?\//, '');

/* ---------- 站点信息（可编辑） ---------- */
const SITE = {
  name: '王歌词',
  nameEn: 'WANG GECI',
  bio: [
    `你好，我是<strong>王歌词</strong>，一名专注短片的独立电影人。2016 年起投身独立影像创作，作品先后入围国内外十余个短片电影节，以<strong>「时间 × 情绪」</strong>为母题，在有限片长里完成一次完整的情绪转弯。`,
    `我偏爱把「消失」拍成可见的东西——消失的方言、消失的街区、消逝前最后一通无线电。每部短片都是一次瞄准：对准一个念头、一个人、一段从未被说出的日常。海报即入口，欢迎进入我的片库。`,
  ],
  tags: ['剧情短片', '纪录片', '科幻实验', '胶片刻录', '跨媒介影像'],
  // 个人视觉（自我介绍图 = film-01.png）
  introAlt: '王歌词——个人视觉肖像',
  email: 'wanggeci@example.com',
  emailLabel: 'wanggeci@example.com',
  socials: [
    { label: 'Vimeo',  icon: '◉', url: '#' },
    { label: 'Instagram', icon: '◎', url: '#' },
    { label: '哔哩哔哩', icon: '▣', url: '#' },
  ],
};

/* ---------- 电影库（可编辑；poster 留空则自动生成渐变海报） ---------- */
const FILMS = [
  {
    id: 'aurora',
    title: '极光之下',
    titleEn: 'Under the Aurora',
    year: '2024',
    duration: '12′',
    role: '导演 / 编剧',
    genres: ['剧情', '科幻'],
    logline: '南纬七十度的极夜里，一段跨语言的电波之恋。',
    synopsis: '在南极科考站的最后一夜，气象员收到一段来自四十年前的无线电波，内容竟是与当下同步的对话。当极光在天空展开，两个时代的人在频道里相遇——关于距离、时间，与从未寄出的告白。',
    cast: ['周屿', '艾拉', '陈默'],
    festivals: ['克莱蒙费朗国际短片节', '上海国际电影节短片单元'],
    poster: './assets/img/film-02.png',
    still: '',
    videoUrl: '#',
  },
  {
    id: 'nightfall',
    title: '入夜之前',
    titleEn: 'Before Nightfall',
    year: '2023',
    duration: '15′',
    role: '导演 / 摄影',
    genres: ['剧情', '纪录'],
    logline: '末班渡轮上的守夜人，最后一次巡视城市的水岸。',
    synopsis: '一条航运停摆前夕的渡轮，一位即将退休的守夜人，以及渡轮上最后七天的城市倒影。胶片质感记录下霓虹消退、人声渐远的物理之熵。',
    cast: ['老周', '小雨'],
    festivals: ['FIRST 青年电影展', '北京国际短片联展'],
    poster: './assets/img/film-03.png',
    still: '',
    videoUrl: '#',
  },
];

/* ============================================================
   工具
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* 自动生成渐变海报（poster 留空时）——深黑底 + 极光渐变 + 片名 */
function genPoster(f, w = 600, h = 900) {
  const hue = [210, 168, 258, 330][FILMS.indexOf(f) % 4];
  const glow = `hsl(${hue} 95% 60%)`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <radialGradient id="g" cx="35%" cy="20%" r="90%">
        <stop offset="0%" stop-color="${glow}" stop-opacity=".55"/>
        <stop offset="55%" stop-color="hsl(${hue} 60% 22%)"/>
        <stop offset="100%" stop-color="#04060a"/>
      </radialGradient>
      <filter id="b"><feGaussianBlur stdDeviation="2"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" y="${h - 3}" fill="hsl(${hue} 95% 65% / .7)"/>
    <text x="34" y="${h - 60}" font-family="system-ui,sans-serif" font-size="46" font-weight="700"
          letter-spacing="6" fill="#eef4ff">${esc(f.title)}</text>
    <text x="36" y="${h - 26}" font-family="ui-monospace,monospace" font-size="16" letter-spacing="3"
          fill="rgba(238,244,255,.55)">${esc(f.titleEn.toUpperCase())}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ============================================================
   渲染：电影卡（海报 + 元数据）
   ============================================================ */
function filmCardHTML(f, i) {
  // 布局：横版海报卡均等宽并排（各 span 6）
  const span = 'film-card--wide';
  const img = f.poster ? resolve(f.poster) : genPoster(f);
  const still = f.still
    ? `<img class="film-card__still" src="${resolve(f.still)}" alt="" loading="lazy" decoding="async" aria-hidden="true">`
    : '';
  return `
    <button class="card glass film-card ${span}" data-tilt data-reveal data-film="${f.id}"
            aria-label="打开《${esc(f.title)}》详情" style="transition-delay:${Math.min(i * 70, 280)}ms">
      <span class="film-card__media">
        <img class="film-card__poster" src="${img}" alt="《${esc(f.title)}》海报" loading="lazy" decoding="async">
        ${still}
      </span>
      <span class="sheen" aria-hidden="true"></span>
      <span class="glare" aria-hidden="true"></span>
    </button>`;
}

function renderFilms() {
  const grid = $('#work-grid');
  // 所有短片海报全部展示
  grid.innerHTML = FILMS.map((f, i) => filmCardHTML(f, i)).join('');
}

/* ============================================================
   （导演介绍改为静态标题 + 图片，见 index.html 关于区）
   ============================================================ */

function renderContact() {
  const slot = $('#contact-slot');
  const socials = SITE.socials.map(s =>
    `<a class="social-btn" href="${esc(s.url)}" rel="noopener" aria-label="${esc(s.label)}">
       <span aria-hidden="true">${s.icon}</span> ${esc(s.label)}
     </a>`).join('');
  slot.innerHTML = `
    <a class="social-btn social-btn--primary" href="mailto:${esc(SITE.email)}" aria-label="给我发邮件">
      ✉ ${esc(SITE.emailLabel)}
    </a>
    ${socials}`;
}

/* ============================================================
   tvOS 视差倾斜（rAF + lerp，coarse 指针 / 减动效时禁用）
   ============================================================ */
const Tilt = (() => {
  let raf = null;
  const cards = [];

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    raf = requestAnimationFrame(tick);
    for (const c of cards) {
      if (!c.behind || c.hidden) continue;
      // 阻尼接近目标 → 平滑停留
      c.cur.rx = lerp(c.cur.rx, c.target.rx, 0.14);
      c.cur.ry = lerp(c.cur.ry, c.target.ry, 0.14);
      c.cur.s  = lerp(c.cur.s,  c.target.s,  0.14);
      const done = Math.abs(c.cur.rx - c.target.rx) < 0.02
        && Math.abs(c.cur.ry - c.target.ry) < 0.02
        && Math.abs(c.cur.s - c.target.s) < 0.005;
      c.el.style.transform =
        `perspective(1000px) rotateX(${c.cur.rx.toFixed(2)}deg) rotateY(${c.cur.ry.toFixed(2)}deg) scale(${c.cur.s.toFixed(4)})`;
      if (done && c.idle) {
        c.behind = false;
        c.el.style.transform = '';
      }
    }
  }

  function bind(card) {
    if (COARSE || REDUCED || !card) return;
    const rec = { el: card, cur: { rx: 0, ry: 0, s: 1 }, target: { rx: 0, ry: 0, s: 1 }, behind: true, idle: true };
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - 0.5;
      const py = (e.clientY - r.top)  / r.height - 0.5;
      rec.target.ry = px * 10;   // 水平甩头 ±5°
      rec.target.rx = -py * 10;  // 垂直俯仰 ±5°
      rec.target.s = 1.02;
      rec.behind = true; rec.idle = false;
      card.style.setProperty('--mx', (px + 0.5) * 100 + '%');
      card.style.setProperty('--my', (py + 0.5) * 100 + '%');
    });
    card.addEventListener('mouseleave', () => {
      rec.target.rx = 0; rec.target.ry = 0; rec.target.s = 1;
      rec.idle = true;
    });
    cards.push(rec);
    if (!raf && !REDUCED) raf = requestAnimationFrame(tick);
  }

  function init() { $$('[data-tilt]').forEach(bind); }
  return { init, bind };
})();

/* ============================================================
   滚动渐显：IO 一次性触发 → 元素淡入上移（once）
   ============================================================ */
const Reveal = (() => {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      io.unobserve(el);
      el.classList.add('is-revealed');
    }
  }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });

  function scan() {
    $$('[data-reveal]').forEach(el => io.observe(el));
  }
  return { scan, io };
})();

/* ============================================================
   丝滑展开：海报卡 → <dialog>（FLIP 缩放过渡）
   ============================================================ */
const Dialog = (() => {
  const dlg = $('#film-dialog');
  let openCard = null;
  let closing = false;

  function open(id) {
    const f = FILMS.find(x => x.id === id);
    if (!f || DIALOG_NATIVE === false) return;
    openCard = $(`[data-film="${id}"]`);
    dlg.innerHTML = buildInner(f);
    if (!dlg.open) dlg.showModal();

    // FLIP：以触发卡为源点缩放展开
    const r = openCard ? openCard.getBoundingClientRect() : null;
    const vw = innerWidth, vh = innerHeight;
    const or = openCard.getBoundingClientRect();
    const scaleX = r.width / Math.min(dlg.offsetWidth, vw - 48);
    const scaleY = r.height / Math.min(dlg.offsetHeight, vh - 48);
    const scale = Math.max(scaleX, scaleY);
    setTimeout(() => {
      if (!REDUCED && !closing) {
        dlg.style.transform = `scale(${Math.min(scale, 1.6)}) translateY(${(or.top - (vh - dlg.offsetHeight) / 2) * .4}px)`;
        dlg.animate([{ transform: dlg.style.transform, opacity: 0 }, { transform: 'none', opacity: 1 }], {
          duration: 300, easing: 'cubic-bezier(.32,.72,0,1)'
        });
        dlg.style.transform = 'none';
      }
      const cb = $('.dialog-close');
      if (cb) cb.focus({ preventScroll: true });
    }, 20);
  }

  function close() {
    if (!dlg.open || closing) return;
    closing = true;
    const done = () => {
      dlg.close();
      closing = false;
      const c = openCard;
      openCard = null;
      if (c && c.focus) c.focus({ preventScroll: true });
    };
    if (REDUCED) return done();
    dlg.animate([{ transform: 'none', opacity: 1 }, { transform: 'scale(.92) translateY(20px)', opacity: 0 }], {
      duration: 220, easing: 'ease'
    }).onfinish = done;
  }

  function buildInner(f) {
    const poster = f.poster ? resolve(f.poster) : genPoster(f);
    return `
      <button class="dialog-close" aria-label="关闭详情">✕</button>
      <div class="dialog-poster">
        <img src="${poster}" alt="《${esc(f.title)}》海报" loading="eager" decoding="async">
        <div class="dialog-poster__scrim"></div>
      </div>`;
  }

  function init() {
    if (DIALOG_NATIVE === false) return;
    // 事件委托：所有电影卡点击打开
    $('#work-grid').addEventListener('click', (e) => {
      const card = e.target.closest('[data-film]');
      if (card) open(card.dataset.film);
    });
    dlg.addEventListener('click', (e) => {
      if (e.target.closest('.dialog-close')) close();
    });
    // 点击 backdrop 关闭
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) close();
    });
  }

  return { init, open, close };
})();

/* ============================================================
   初始化
   ============================================================ */
function init() {
  $('#year').textContent = new Date().getFullYear();

  renderFilms();
  renderContact();

  // 初始化所有卡片为可倾斜，并启动滚动渐显
  Tilt.init();
  Reveal.scan();
  Dialog.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}