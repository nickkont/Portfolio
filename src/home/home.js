// nickkont.com — real estate home interactions. Vanilla, no dependencies.

const root = document.documentElement;
root.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ── Hero entrance: plays once, after fonts so lines don't reflow mid-animation
const start = () => requestAnimationFrame(() => document.body.classList.add('is-ready'));
(document.fonts?.ready ?? Promise.resolve()).then(start);
setTimeout(start, 1200); // never hold the page hostage to a slow font

// ── Scroll reveals
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  },
  { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
);
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

// ── Statement: split into words, light them up as the paragraph scrolls through
const statement = document.querySelector('[data-words]');
let words = [];
if (statement) {
  const text = statement.textContent.trim().replace(/\s+/g, ' ');
  statement.setAttribute('aria-label', text);
  statement.innerHTML = text
    .split(' ')
    .map((w) => `<span class="w" aria-hidden="true">${w}</span>`)
    .join(' ');
  words = [...statement.querySelectorAll('.w')];
}

// ── Nav: solid after the hero, hides on scroll down, returns on scroll up
const nav = document.querySelector('[data-nav]');
const bar = document.querySelector('.progress span');
let lastY = scrollY;

// Dark surfaces the nav can sit over
const darkZones = [...document.querySelectorAll('.services, .contact, .footer')];

// ── Stacking neighborhood cards
const hoods = [...document.querySelectorAll('.hood')];

// ── Pinned horizontal listings
const hs = document.querySelector('[data-hscroll]');
const track = hs?.querySelector('[data-track]');
const wide = matchMedia('(min-width: 901px)');
let hsDistance = 0;

function sizeHScroll() {
  if (!hs || !track) return;
  if (!wide.matches || reduce) {
    hs.style.height = '';
    track.style.transform = '';
    hsDistance = 0;
    return;
  }
  hsDistance = Math.max(0, track.scrollWidth - innerWidth + 80);
  const padTop = parseFloat(getComputedStyle(hs).paddingTop) || 0;
  hs.style.height = `${innerHeight + hsDistance + padTop}px`;
}

// ── Current section highlight in nav
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = new Map([...document.querySelectorAll('.nav__links a')].map((a) => [a.hash.slice(1), a]));

function frame() {
  const y = scrollY;
  const vh = innerHeight;
  const max = document.documentElement.scrollHeight - vh;

  bar?.style.setProperty('--p', (max > 0 ? y / max : 0).toFixed(4));

  if (nav && !document.body.classList.contains('menu-open')) {
    nav.classList.toggle('is-solid', y > 40);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > vh * 0.6) nav.classList.add('is-hidden');
    else if (goingUp || y < vh * 0.6) nav.classList.remove('is-hidden');
  }
  lastY = y;

  if (nav) {
    const mid = 36;
    const overDark = darkZones.some((z) => { const r = z.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    nav.classList.toggle('is-dark', overDark);
  }

  // statement words
  if (words.length && !reduce) {
    const r = statement.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
    const lit = Math.round(p * words.length);
    for (let i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);
  }

  // stacking cards: each card shrinks and dims as the next one slides over it
  if (!reduce) {
    for (let i = 0; i < hoods.length - 1; i++) {
      const cur = hoods[i].getBoundingClientRect();
      const next = hoods[i + 1].getBoundingClientRect();
      const p = clamp(1 - (next.top - cur.top) / cur.height);
      hoods[i].style.setProperty('--s', (1 - p * 0.06).toFixed(4));
      hoods[i].style.setProperty('--b', (1 - p * 0.35).toFixed(4));
    }
  }

  // horizontal track
  if (hsDistance && track) {
    const r = hs.getBoundingClientRect();
    const padTop = parseFloat(getComputedStyle(hs).paddingTop) || 0;
    const p = clamp((-r.top - padTop) / hsDistance);
    track.style.transform = `translate3d(${(-p * hsDistance).toFixed(1)}px,0,0)`;
  }

  // nav current
  let current = '';
  for (const s of sections) if (s.getBoundingClientRect().top < vh * 0.4) current = s.id;
  navLinks.forEach((a, id) => a.classList.toggle('is-current', id === current));

  ticking = false;
}

let ticking = false;
const onScroll = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(frame);
  }
};
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => {
  sizeHScroll();
  onScroll();
});
wide.addEventListener?.('change', () => {
  sizeHScroll();
  onScroll();
});
addEventListener('load', () => {
  sizeHScroll();
  onScroll();
});
sizeHScroll();
frame();

// ── Services: expanding panels (hover/focus on desktop, tap on touch)
const panels = [...document.querySelectorAll('[data-panels] .panel')];
const activate = (p) => panels.forEach((x) => x.classList.toggle('is-active', x === p));
panels.forEach((p) => {
  p.addEventListener('mouseenter', () => matchMedia('(hover: hover)').matches && activate(p));
  p.addEventListener('focus', () => activate(p));
  p.addEventListener('click', () => activate(p));
});

// ── FAQ accordion (one open at a time)
document.querySelectorAll('[data-accordion] .qa').forEach((qa, _, all) => {
  const btn = qa.querySelector('button');
  btn.addEventListener('click', () => {
    const open = !qa.classList.contains('is-open');
    all.forEach((o) => {
      o.classList.remove('is-open');
      o.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    if (open) {
      qa.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ── Mobile menu
const menuBtn = document.querySelector('[data-menu-btn]');
const menu = document.querySelector('[data-menu]');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  if (open) {
    menu.hidden = false;
    nav.classList.remove('is-hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
  } else {
    menu.classList.remove('is-open');
    setTimeout(() => !menu.classList.contains('is-open') && (menu.hidden = true), reduce ? 0 : 600);
  }
}
menuBtn?.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && menuBtn?.getAttribute('aria-expanded') === 'true' && setMenu(false));

// ── Magnetic primary button (decorative, pointer devices only)
if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const kick = () => !raf && (raf = requestAnimationFrame(loop));
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * 0.25;
      ty = (e.clientY - r.top - r.height / 2) * 0.35;
      kick();
    });
    el.addEventListener('pointerleave', () => {
      tx = ty = 0;
      kick();
    });
  });
}

// ── Contact form (TODO: wire to Formspree / CRM; nothing is sent yet)
const form = document.querySelector('[data-form]');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const note = form.querySelector('.form__note');
  let ok = true;
  form.querySelectorAll('[required]').forEach((input) => {
    const bad = !input.value.trim() || (input.type === 'email' && !input.validity.valid);
    input.closest('.field').classList.toggle('is-error', bad);
    if (bad) ok = false;
  });
  if (!ok) {
    note.textContent = 'Add your name and a valid email so Nick can reply.';
    return;
  }
  note.textContent = 'The form isn’t connected yet. [TODO: hook up form service]';
});

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
