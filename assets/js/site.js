/* Agence AE · effets propres à la direction « Course du soleil ».
   Le socle gère l'ouverture, le voile en iris, l'en-tête, le menu, le mode calme, les boucles, les mesures
   et la bibliothèque d'effets (lignes, mots, cascade, rideau, parallaxe, zoom, trace, onde, magnétique).
   Ici : l'intro (le soleil se lève sur « agence ae » puis rejoint l'objet d'ouverture de la page), le soleil à saisir,
   la course du soleil (fil conducteur), les titres à ombre portée, la coupe bioclimatique, les planches,
   l'ombre qui passe sur les projets, la carte de la zone, puis les effets des pages intérieures. */
import { demarrer, boucle, etat, versObjet, quand, suivre, lacher, aller } from './socle/index.js?v=2';

const gsap = window.gsap;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lisse = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const sourisFine = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
const ST = () => window.ScrollTrigger;
const calme = () => etat.calme;
/* Retour à la section après le bouton du mode calme : la mise en page change beaucoup entre les deux modes
   (scènes épinglées, sections hautes) ; la restauration du navigateur, en pixels, ne doit pas l'emporter. */
let sectionDeRetour = null;
try { sectionDeRetour = sessionStorage.getItem('socle:calme-retour'); } catch (e) { sectionDeRetour = null; }
if (sectionDeRetour && 'scrollRestoration' in history) history.scrollRestoration = 'manual';
const reviserRetour = () => {
  const el = sectionDeRetour && document.getElementById(sectionDeRetour);
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.top > innerHeight * 0.5 || r.bottom < innerHeight * 0.3) aller(el, { instant: true });
};
if (sectionDeRetour) {
  addEventListener('load', () => { reviserRetour(); setTimeout(reviserRetour, 250); setTimeout(() => { reviserRetour(); sectionDeRetour = null; }, 900); });
}

/* Vitesse de défilement lissée, partagée (px/s), sans lecture de mise en page. */
const vitesse = { v: 0, cible: 0, y: scrollY, t: performance.now(), tt: -1 };
const amortirVitesse = (dt, t) => { if (t === vitesse.tt) return; vitesse.tt = t; vitesse.cible *= Math.exp(-dt * 7); vitesse.v += (vitesse.cible - vitesse.v) * (1 - Math.exp(-dt * 9)); };
addEventListener('scroll', () => { const t = performance.now(), dt = Math.max(8, t - vitesse.t); vitesse.cible = clamp((scrollY - vitesse.y) / dt * 1000, -4000, 4000); vitesse.y = scrollY; vitesse.t = t; }, { passive: true });

/* ---------- Heure du soleil (6 h à 21 h) ---------- */
const heureDe = (t) => { const m = Math.round((6 + t * 15) * 60 / 5) * 5; return { h: Math.floor(m / 60), m: m % 60 }; };
const texteHeure = ({ h, m }) => `${h} h ${String(m).padStart(2, '0')}`;
const moment = (t) => (t < 0.1 ? 'lever du soleil' : t < 0.3 ? 'matin' : t < 0.62 ? 'plein jour' : t < 0.9 ? 'soleil bas' : 'coucher du soleil');


/* ---------- Boost : la photo d'ouverture réellement rééclairée (WebGL) selon la position du soleil ---------- */
function photoReeclairee() {
  const rien = { pret: Promise.resolve(), maj() {}, actif: false };
  const hero = $('.hero'), img = $('.hero-media img');
  if (!hero || !img || etat.calme) return rien;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-gl'; canvas.setAttribute('aria-hidden', 'true'); canvas.dataset.effet = 'photo-reeclairee';
  let gl = null;
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false }); } catch (e) { gl = null; }
  if (!gl) return rien;
  const vs = 'attribute vec2 p; varying vec2 v; void main(){ v = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }';
  const fs = `precision mediump float; varying vec2 v; uniform sampler2D tex; uniform vec2 uS, uO, uSol; uniform float uHaut, uAsp;
    void main(){
      vec3 c = texture2D(tex, v * uS + uO).rgb;
      float l = dot(c, vec3(.299, .587, .114));
      vec2 d = v - uSol; d.x *= uAsp;
      float pres = exp(-dot(d, d) * 2.4);
      vec3 chaud = mix(vec3(1., .56, .32), vec3(1., .96, .9), uHaut);
      vec3 r = c * (.46 + .66 * uHaut) * mix(vec3(1.), chaud, .5);
      r += c * chaud * pres * (.3 + .95 * l) * (.45 + .55 * uHaut);
      float nuit = 1. - smoothstep(0., .55, uHaut);
      r = mix(r, r * vec3(.5, .58, .85), nuit * .65);
      gl_FragColor = vec4(r, 1.);
    }`;
  const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
  const a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs);
  if (!a || !b) return rien;
  const prog = gl.createProgram(); gl.attachShader(prog, a); gl.attachShader(prog, b); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return rien;
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const u = { S: U('uS'), O: U('uO'), Sol: U('uSol'), Haut: U('uHaut'), Asp: U('uAsp') };
  const tex = gl.createTexture();
  const m = { w: 1, h: 1, iw: 1, ih: 1, pret: false, sol: [0.8, 0.3], haut: 0.6 };
  const dimensionner = () => {
    const r = hero.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, innerWidth < 761 ? 1 : 1.25);
    m.w = r.width; m.h = r.height;
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const ia = m.iw / m.ih, ca = m.w / m.h, mobile = innerWidth < 761 && innerHeight > innerWidth;
    const px = mobile ? 0.5 : 0.55, py = 0.5;
    if (ca > ia) { const sy = ia / ca; gl.uniform2f(u.S, 1, sy); gl.uniform2f(u.O, 0, (1 - sy) * py); }
    else { const sx = ca / ia; gl.uniform2f(u.S, sx, 1); gl.uniform2f(u.O, (1 - sx) * px, 0); }
    gl.uniform1f(u.Asp, ca);
    dessiner();
  };
  const dessiner = () => {
    if (!m.pret) return;
    gl.uniform2f(u.Sol, m.sol[0], m.sol[1]); gl.uniform1f(u.Haut, m.haut);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const pret = (img.decode ? img.decode() : Promise.resolve()).then(() => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    m.iw = img.naturalWidth; m.ih = img.naturalHeight; m.pret = true;
    $('.hero-media').after(canvas); hero.classList.add('hero-gl-actif');
    dimensionner();
    new ResizeObserver(dimensionner).observe(hero);
  }).catch(() => {});
  return { pret, actif: true, maj(x, y, haut) { m.sol = [x, y]; m.haut = haut; dessiner(); } };
}
const eclairage = photoReeclairee();

/* ---------- 1. Soleil à saisir (accueil) : grille wouahou, point 1 ---------- */
function soleilASaisir() {
  const ciel = $('.hero-ciel');
  if (!ciel) return null;
  const astre = $('.hero-soleil', ciel), halo = $('.hero-halo'), hero = $('.hero');
  const couches = { aube: $('.l-aube'), jour: $('.l-jour'), couchant: $('.l-couchant'), nuit: $('.l-nuit') };
  const lHeure = $('[data-heure]', ciel), lMoment = $('[data-moment]', ciel);
  const s = { t: 0.72, v: 0, tenu: false, cible: 0.72, W: 0, H: 0, ox: 0, oy: 0, table: [] };
  /* Courbe de l'arc (Bézier du SVG, repère 1000 × 400 étiré sur la boîte). */
  const B = (u) => { const a = 1 - u; return { x: a * a * a * 60 + 3 * a * a * u * 200 + 3 * a * u * u * 800 + u * u * u * 940, y: a * a * a * 368 + 3 * a * a * u * -60 + 3 * a * u * u * -60 + u * u * u * 368 }; };
  const mesurer = () => {
    s.W = ciel.clientWidth; s.H = ciel.clientHeight;
    s.ox = ciel.offsetLeft; s.oy = ciel.offsetTop; s.HW = hero.clientWidth; s.HH = hero.clientHeight;
    s.table = Array.from({ length: 121 }, (_, i) => B(i / 120).x / 1000 * s.W);
  };
  let derniere = '';
  const poser = () => {
    const p = B(s.t), x = p.x / 1000 * s.W, y = p.y / 400 * s.H;
    astre.style.left = '0px'; astre.style.top = '0px';
    astre.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    if (halo) halo.style.transform = `translate3d(${(x + s.ox).toFixed(1)}px, ${(y + s.oy).toFixed(1)}px, 0)`;
    const haut = Math.sin(Math.PI * s.t);
    couches.aube.style.opacity = (lisse(0.32, 0, s.t) * 0.95).toFixed(3);
    couches.jour.style.opacity = (lisse(0.25, 0.5, s.t) * lisse(0.78, 0.5, s.t)).toFixed(3);
    couches.couchant.style.opacity = (lisse(0.58, 0.92, s.t)).toFixed(3);
    couches.nuit.style.opacity = (clamp(1 - haut * 1.6) * 0.85).toFixed(3);
    if (halo) halo.style.opacity = (0.55 + 0.45 * haut).toFixed(3);
    eclairage.maj((x + s.ox) / Math.max(1, s.HW), (y + s.oy) / Math.max(1, s.HH), haut);
    const h = heureDe(s.t), txt = texteHeure(h);
    if (txt !== derniere) {
      derniere = txt;
      lHeure.textContent = txt; lMoment.textContent = moment(s.t);
      astre.setAttribute('aria-valuenow', String(h.h));
      astre.setAttribute('aria-valuetext', `${txt}, ${moment(s.t)}`);
    }
  };
  mesurer(); poser();
  new ResizeObserver(() => { mesurer(); poser(); }).observe(hero);
  /* Clavier : flèches, début, fin. */
  astre.addEventListener('keydown', (e) => {
    const pas = { ArrowLeft: -0.04, ArrowDown: -0.04, ArrowRight: 0.04, ArrowUp: 0.04 }[e.key];
    if (pas !== undefined) { s.t = clamp(s.t + pas); s.v = 0; s.cible = s.t; e.preventDefault(); }
    else if (e.key === 'Home') { s.t = 0; s.cible = 0; e.preventDefault(); }
    else if (e.key === 'End') { s.t = 1; s.cible = 1; e.preventDefault(); }
    else return;
    ciel.classList.add('est-touche'); poser();
  });
  if (calme()) return s;
  /* Geste : on attrape le soleil, il suit la main le long de l'arc et garde son élan au lâcher. */
  let id = null, dernierX = 0, dernierT = 0, depart = 0;
  const tDeX = (x) => { const tb = s.table; let i = 0; while (i < tb.length - 1 && tb[i + 1] < x) i++; const a = tb[i], b = tb[i + 1] ?? a; return clamp((i + (b > a ? (x - a) / (b - a) : 0)) / 120); };
  const local = (e) => e.clientX - ciel.getBoundingClientRect().left;
  astre.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    id = e.pointerId; s.tenu = true; s.v = 0; astre.setPointerCapture(id);
    dernierX = local(e); dernierT = performance.now(); depart = s.t - tDeX(dernierX);
    ciel.classList.add('est-touche');
  });
  astre.addEventListener('pointermove', (e) => {
    if (!s.tenu || e.pointerId !== id) return;
    const x = local(e), t = performance.now();
    const nt = clamp(tDeX(x) + depart);
    const dt = Math.max(8, t - dernierT) / 1000;
    s.v += ((nt - s.t) / dt - s.v) * 0.4;
    s.t = nt; dernierX = x; dernierT = t; poser();
  });
  const lacher = (e) => { if (!s.tenu || (e && e.pointerId !== id)) return; s.tenu = false; id = null; if (performance.now() - dernierT > 120) s.v = 0; s.v = clamp(s.v, -1.6, 1.6); s.cible = clamp(s.t + s.v * 0.6, 0.12, 0.92); };
  astre.addEventListener('pointerup', lacher);
  astre.addEventListener('pointercancel', lacher);
  /* Boucle (socle : hors écran, onglet caché et mode calme coupés) : élan, puis le soleil reprend doucement sa course. */
  quand('pret', () => {
    boucle(ciel, (dt, temps) => {
      if (s.tenu) return;
      if (Math.abs(s.v) > 0.004) {
        s.t += s.v * dt; s.v *= Math.exp(-dt * 2.4);
        if (s.t < 0 || s.t > 1) { s.t = clamp(s.t); s.v *= -0.35; }
      } else {
        s.v = 0;
        const derive = s.cible + 0.035 * Math.sin(temps * 0.32);
        s.t += (derive - s.t) * (1 - Math.exp(-dt * 0.5));
      }
      poser();
    });
  });
  return s;
}

/* ---------- 2. Course du soleil : fil conducteur de toutes les pages (point 4) ---------- */
function courseDuSoleil() {
  const fil = $('.fil-soleil');
  if (!fil) return;
  const trace = $('.fil-trace', fil), astre = $('.fil-astre', fil), liste = $('.fil-heures', fil);
  const sections = $$('main > section, main > [data-section], .pied');
  const m = { docH: 1, railH: 1, reperes: [] };
  const construire = () => {
    m.docH = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    m.railH = fil.clientHeight;
    liste.textContent = '';
    m.reperes = sections.map((sec) => {
      const y = sec.getBoundingClientRect().top + scrollY;
      const f = clamp((y - innerHeight * 0.35) / m.docH);
      const li = document.createElement('li');
      li.style.top = `${(f * 100).toFixed(2)}%`;
      const sp = document.createElement('span'); sp.textContent = `${heureDe(f).h} h`; li.appendChild(sp);
      liste.appendChild(li);
      return { f, li };
    });
    maj();
  };
  let p = -1;
  const maj = () => {
    const np = clamp(scrollY / m.docH);
    if (Math.abs(np - p) < 0.0005 && p >= 0) return;
    p = np;
    trace.style.transform = `scaleY(${p.toFixed(4)})`;
    astre.style.transform = `translate3d(0, ${(p * m.railH).toFixed(1)}px, 0)`;
    let courant = null;
    m.reperes.forEach((r) => { const ok = p + 0.002 >= r.f; r.li.classList.toggle('est-atteinte', ok); if (ok) courant = r; r.li.classList.remove('est-courante'); });
    if (courant) courant.li.classList.add('est-courante');
  };
  let raf = 0;
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; maj(); }); }, { passive: true });
  if (ST()) ST().addEventListener('refresh', construire);
  quand('pret', construire);
  addEventListener('load', construire);
}

/* ---------- 3. Titres à ombre portée (point 5 : titre fabriqué par le soleil) ---------- */
function ombresPortees() {
  $$('.titre-ombre').forEach((el) => {
    if (calme() || !gsap || !ST()) { el.style.setProperty('--ombre-skew', '-30deg'); return; }
    gsap.fromTo(el, { '--ombre-skew': '42deg', '--ombre-sy': 0.86 }, { '--ombre-skew': '-42deg', '--ombre-sy': 1.04, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });
}

/* ---------- 4. Manifeste qui s'éclaire mot à mot ---------- */
function manifeste() {
  $$('.manifeste').forEach((el) => {
    const mots = $$('.mm', el);
    if (calme() || !gsap || !ST()) { mots.forEach((m) => { m.style.opacity = 1; }); return; }
    gsap.fromTo(mots, { opacity: 0.18 }, { opacity: 1, ease: 'none', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 52%', scrub: 0.5 } });
  });
}

/* ---------- 5. Planches qui s'empilent ---------- */
function planches() {
  const ps = $$('.planche');
  if (!ps.length || calme() || !gsap || !ST()) return;
  ps.forEach((pl, i) => {
    const suivante = ps[i + 1];
    if (!suivante) {
      gsap.fromTo(pl, { y: 40 }, { y: 0, ease: 'none', scrollTrigger: { trigger: pl, start: 'top bottom', end: 'top 60%', scrub: 0.5 } });
      return;
    }
    gsap.fromTo(pl, { scale: 1 }, { scale: 0.93, ease: 'none', scrollTrigger: { trigger: suivante, start: 'top bottom', end: 'top 30%', scrub: 0.5 } });
    gsap.fromTo($('.planche-ombre', pl), { opacity: 0 }, { opacity: 0.38, ease: 'none', scrollTrigger: { trigger: suivante, start: 'top bottom', end: 'top 30%', scrub: 0.5 } });
  });
}

/* ---------- 6. Le soleil dessine la maison : coupe bioclimatique épinglée (point 6) ---------- */
function maisonOmbres() {
  const sec = $('.lumiere');
  if (!sec) return;
  const svg = $('svg', sec), q = (s) => $(s, svg);
  const etapes = $$('.lumiere-etape', sec), points = $$('[data-point]', sec);
  const astre = q('.coupe-astre'), angle = q('.coupe-angle');
  const faisceau = q('.coupe-faisceau'), ext = q('.coupe-faisceau-ext'), tache = q('.coupe-tache'), tacheMur = q('.coupe-tache-mur');
  const ombreSol = q('.coupe-ombre-sol'), vent = q('.coupe-vent'), chaleur = q('.coupe-chaleur');
  const stops = $$('stop', svg);
  /* Repère de la coupe : sol à y = 430, façade sud à x = 330, 1 m = 65 px, mur nord intérieur à x = 700. */
  const X0 = 330, Y0 = 430, M = 65, XN = 700, D = (XN - X0) / M, HF = 2.3, HT = 2.9, DEB = 1.1, R = 290;
  const dessiner = (e, vents) => {
    const r = e * Math.PI / 180, tg = Math.tan(r);
    const sx = X0 - R * Math.cos(r), sy = Y0 - R * Math.sin(r);
    astre.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    angle.setAttribute('x', (sx + 30).toFixed(0)); angle.setAttribute('y', (sy - 26).toFixed(0)); angle.textContent = `${Math.round(e)}°`;
    const hEff = clamp(Math.min(HF, HT - DEB * tg), 0, HF);
    const yHaut = Y0 - hEff * M;
    const portee = hEff / tg;
    if (portee <= D) {
      faisceau.setAttribute('points', `${X0},${yHaut.toFixed(1)} ${X0},${Y0} ${(X0 + portee * M).toFixed(1)},${Y0}`);
      tache.setAttribute('x2', (X0 + portee * M).toFixed(1)); tacheMur.setAttribute('y2', String(Y0));
    } else {
      const hm = hEff - D * tg;
      faisceau.setAttribute('points', `${X0},${yHaut.toFixed(1)} ${X0},${Y0} ${XN},${Y0} ${XN},${(Y0 - hm * M).toFixed(1)}`);
      tache.setAttribute('x2', String(XN)); tacheMur.setAttribute('y2', (Y0 - hm * M).toFixed(1));
    }
    /* Faisceau extérieur : du soleil vers la partie éclairée de la baie. */
    ext.setAttribute('points', `${sx.toFixed(1)},${sy.toFixed(1)} ${X0},${yHaut.toFixed(1)} ${X0},${Y0}`);
    /* Ombre portée de la maison au sol, côté nord. */
    const L = Math.min(800 - 730, (HT / tg) * M);
    ombreSol.setAttribute('points', `730,${Y0} ${(730 + L).toFixed(1)},${Y0} ${(730 + L).toFixed(1)},${Y0 + 6} 730,${Y0 + 6}`);
    const jour = clamp((e - 15) / 50);
    const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(' ')})`;
    stops[0].setAttribute('stop-color', mix([52, 62, 74], [96, 140, 178], jour));
    stops[1].setAttribute('stop-color', mix([214, 150, 102], [196, 218, 232], jour));
    vent.setAttribute('opacity', vents.toFixed(2)); chaleur.setAttribute('opacity', (vents * 0.9 + lisse(30, 19, e) * 0.5).toFixed(2));
  };
  const etat_ = { p: 0, n: 0 };
  const activer = (n) => {
    if (n === etat_.n) return; etat_.n = n;
    etapes.forEach((li, i) => li.classList.toggle('est-active', i + 1 === n));
    points.forEach((pt, i) => pt.classList.toggle('est-actif', i < n));
  };
  const derniers = { vents: 0 };
  sec.__dessiner = (e) => { dessiner(e, derniers.vents); angle.textContent = `${Math.round(e)}°`; };
  const appliquer = (p) => {
    sec.__manuel = false;
    const e = p < 0.2 ? 42 : p < 0.3 ? 42 + 23 * lisse(0.2, 0.3, p) : p < 0.45 ? 65 : p < 0.55 ? 65 - 46 * lisse(0.45, 0.55, p) : 19;
    derniers.vents = lisse(0.72, 0.82, p);
    dessiner(e, derniers.vents);
    activer(p < 0.25 ? 1 : p < 0.5 ? 2 : p < 0.75 ? 3 : 4);
  };
  if (calme() || !gsap || !ST()) { derniers.vents = 1; dessiner(19, 1); etapes.forEach((li) => li.classList.add('est-active')); return; }
  appliquer(0);
  const proxy = { p: 0 };
  gsap.to(proxy, {
    p: 1, ease: 'none', onUpdate: () => appliquer(proxy.p),
    scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${Math.round(innerHeight * 2.6)}`, pin: true, scrub: 0.7, invalidateOnRefresh: true },
  });
}

/* ---------- 7. L'ombre d'un débord de toit passe sur chaque photo ---------- */
function ombresQuiPassent() {
  if (calme() || !gsap || !ST()) return;
  $$('.ombre-passe').forEach((el) => {
    const cadre = el.closest('.real-grille, .projet-sel-cadre') || el.parentElement;
    gsap.fromTo(el, { xPercent: -110 }, { xPercent: 110, ease: 'none', scrollTrigger: { trigger: cadre, start: 'top 92%', end: 'bottom 8%', scrub: 0.6 } });
  });
}

/* ---------- 8. Chiffres dont la graisse s'affermit en comptant (police variable, boîte de largeur fixe) ---------- */
function chiffresGras() {
  if (calme() || !gsap || !ST()) return;
  $$('.chiffre-grand').forEach((el) => {
    gsap.fromTo(el, { fontVariationSettings: "'wght' 240" }, { fontVariationSettings: "'wght' 640", ease: 'none', scrollTrigger: { trigger: el.closest('ul') || el, start: 'top 92%', end: 'bottom 45%', scrub: 0.5 } });
  });
}

/* ---------- 9. Carte de la zone : communes qui s'allument, survol et toucher ---------- */
function carteZone() {
  const fig = $('.zone-carte');
  if (!fig) return;
  const nom = $('[data-zone-nom]'), detail = $('[data-zone-detail]');
  const groupes = $$('[data-commune]', fig), boutons = $$('[data-commune-bouton]');
  const choisir = (n) => {
    groupes.forEach((g) => g.classList.toggle('est-active', g.dataset.commune === n));
    boutons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.communeBouton === n)));
    const b = boutons.find((x) => x.dataset.communeBouton === n);
    nom.textContent = n; detail.textContent = b ? b.dataset.detail : '';
  };
  boutons.forEach((b) => {
    b.addEventListener('click', () => choisir(b.dataset.communeBouton));
    if (sourisFine()) b.addEventListener('mouseenter', () => choisir(b.dataset.communeBouton));
    b.addEventListener('focus', () => choisir(b.dataset.communeBouton));
  });
  choisir('Quimper');
  if (calme() || !gsap || !ST()) return;
  const boite = fig.closest('.zone-carte-boite') || fig;
  gsap.fromTo($$('circle:first-child', fig), { scale: 0 }, { scale: 1, ease: 'back.out(2)', duration: 0.5, stagger: 0.05, scrollTrigger: { trigger: boite, start: 'top 75%', once: true } });
  const halo = $('.carte-agence-halo', fig);
  if (halo) gsap.fromTo(halo, { scale: 0.5 }, { scale: 1.7, ease: 'none', transformOrigin: '50% 50%', scrollTrigger: { trigger: boite, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
}

/* ---------- Intro : le soleil se lève sur « agence ae », les ombres tournent, puis il rejoint la page ---------- */
function intro() {
  if (!gsap) return null;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  /* versObjet mesure l'objet à son état de repos (le zénith) : il est appelé avant toute autre animation. */
  versObjet(tl, { a: 1.15, duree: 0.5, ouverture: 0.75 });
  const scene = $('.ouverture-scene');
  const orbite = $('.ouverture-soleil');
  if (scene && orbite) {
    const r = scene.getBoundingClientRect(), sx = r.width / 600, sy = r.height / 300;
    const leve = { a: Math.PI };
    const poserOrbite = () => {
      const dx = 280 * Math.cos(leve.a) * sx, dy = (290 - 270 * Math.sin(leve.a) - 20) * sy;
      orbite.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    };
    poserOrbite();
    tl.to(leve, { a: Math.PI / 2, duration: 1.0, ease: 'power2.out', onUpdate: poserOrbite }, 0.1);
  }
  tl.to('.ouverture-trait', { scaleX: 1, duration: 0.55 }, 0)
    .to('.ouverture-arc path', { strokeDashoffset: 0, duration: 0.95, ease: 'power2.inOut' }, 0.15)
    .to('.ouverture-aube', { opacity: 1, duration: 1.0, ease: 'power1.inOut' }, 0.2)
    .fromTo('.ouv-lettre', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.045 }, 0.3)
    .fromTo('.ouv-ombre', { opacity: 0, skewX: -72, scaleY: -0.9 }, { opacity: 0.85, skewX: -8, scaleY: -0.3, duration: 0.85, stagger: 0.03, ease: 'power2.out' }, 0.35)
    .to('.ouverture-ligne', { opacity: 1, duration: 0.4 }, 0.6)
    .to('.ouverture-nom, .ouverture-ligne, .ouverture-trait, .ouverture-arc', { opacity: 0, duration: 0.3 }, 1.15);
  if ($('.hero-ligne')) {
    tl.fromTo('.hero-ligne', { yPercent: 105, y: 0, opacity: 1 }, { yPercent: 0, y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 1.7)
      .fromTo('.hero-surtitre, .hero-intro, .hero-actions, .hero-info', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 }, 1.8);
  }
  pageIntro(tl);
  return tl;
}

/* Les pages intérieures complètent l'intro et l'arrivée par leur propre mouvement d'ouverture. */
const ouvertures = [];
function pageIntro(tl) { ouvertures.forEach((o) => o.intro && o.intro(tl)); }

demarrer({
  pret: [eclairage.pret],
  preparer() {
    enteteApresSaut();
    soleilASaisir();
    courseDuSoleil();
    ombresPortees();
    manifeste();
    planches();
    maisonOmbres();
    ombresQuiPassent();
    chiffresGras();
    carteZone();
    preparerPages();
  },
  jouer: intro,
  etatFinal() {
    if (!gsap) return;
    gsap.set('.hero-ligne, .hero-surtitre, .hero-intro, .hero-actions, .hero-info', { clearProps: 'transform,opacity' });
    ouvertures.forEach((o) => o.final && o.final());
  },
  arrivee() {
    if (!gsap) return;
    if ($('.hero-ligne')) {
      gsap.fromTo('.hero-ligne', { yPercent: 105, y: 0, opacity: 1 }, { yPercent: 0, y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
      gsap.fromTo('.hero-surtitre, .hero-intro, .hero-actions, .hero-info', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, delay: 0.3 });
    }
    ouvertures.forEach((o) => o.arrivee && o.arrivee());
  },
});

/* Un saut de plus d'un écran (ancre, lien profond, retour à une section) n'est pas un geste du visiteur :
   l'en-tête reste visible, ses boutons restent à portée. */
function enteteApresSaut() {
  let y = scrollY;
  addEventListener('scroll', () => requestAnimationFrame(() => {
    const d = scrollY - y; y = scrollY;
    if (Math.abs(d) > innerHeight * 0.8 && !document.documentElement.classList.contains('scene-sans-entete')) document.documentElement.classList.remove('entete-cache');
  }), { passive: true });
}

/* ---------- Pages intérieures ---------- */
function preparerPages() {
  ouverturesInterieures();
  cadranFiltres();
  visionneuse();
  meubleAPlans();
  cartouche();
  murEnCoupe();
  barres();
  chiffreLumiere();
  numeroTrace();
  rendezVous();
  planAcces();
  filSaisissable();
  coupeManipulable();
  preparerV2();
}

/* Ouverture propre à chaque page : ses lignes de titre montent, ses éléments [data-ouv] arrivent,
   pendant l'ouverture du panneau de l'intro ou le retrait du voile. */
function ouverturesInterieures() {
  if (!$('.ouv-ligne')) return;
  const lignes = '.ouv-ligne', autres = '[data-ouv]';
  ouvertures.push({
    intro(tl) {
      tl.fromTo(lignes, { yPercent: 105, y: 0, opacity: 1 }, { yPercent: 0, y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, 1.7)
        .fromTo(autres, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' }, 1.8);
    },
    arrivee() {
      gsap.fromTo(lignes, { yPercent: 105, y: 0, opacity: 1 }, { yPercent: 0, y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
      gsap.fromTo(autres, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out', delay: 0.3 });
    },
    final() { gsap.set(`${lignes}, ${autres}`, { clearProps: 'transform,opacity' }); },
  });
}

/* ---------- Réalisations : cadran solaire qu'on tourne pour filtrer (point 1) ---------- */
function cadranFiltres() {
  const boite = $('.cadran');
  if (!boite) return;
  const disque = $('.cadran-disque', boite), svg = $('svg', disque);
  const familles = ['tous', 'neuf', 'renovation', 'pro'];
  const libelles = $$('.cadran-famille', boite), boutons = $$('[data-famille-bouton]');
  const cartes = $$('.real-carte'), compte = $('[data-real-compte]');
  const T = JSON.parse($('#textes-projets').textContent);
  const s = { angle: 0, v: 0, tenu: false, index: 0, ombre: 180 };
  const poser = () => { svg.style.setProperty('--angle', `${s.angle.toFixed(2)}deg`); svg.style.setProperty('--ombre', `${(s.angle + s.ombre).toFixed(2)}deg`); };
  let delai = 0;
  const filtrer = (i, { adresse = true } = {}) => {
    if (i === s.index && adresse) return;
    s.index = i;
    const f = familles[i];
    libelles.forEach((l, k) => l.classList.toggle('est-choisie', k === i));
    boutons.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    disque.setAttribute('aria-valuenow', String(i)); disque.setAttribute('aria-valuetext', T[f]);
    const garder = (c) => f === 'tous' || c.dataset.famille === f;
    const n = cartes.filter(garder).length;
    compte.textContent = T.compte.replace('{n}', n);
    clearTimeout(delai);
    cartes.forEach((c) => { if (!garder(c)) c.classList.add('est-sortante'); });
    delai = setTimeout(() => {
      cartes.forEach((c) => { const g = garder(c); c.classList.toggle('est-cachee', !g); c.classList.remove('est-sortante'); });
      if (adresse && !calme() && gsap) gsap.fromTo(cartes.filter(garder), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out', clearProps: 'transform,opacity' });
      if (ST()) ST().refresh();
    }, calme() || !adresse ? 0 : 260);
    if (adresse) { const u = new URL(location.href); if (f === 'tous') u.searchParams.delete('famille'); else u.searchParams.set('famille', f); history.replaceState(history.state, '', u); }
  };
  const viser = (i) => { const cible = i * 90, tour = Math.round((s.angle - cible) / 360) * 360; s.cibleAngle = cible + tour; };
  const depart = familles.indexOf(new URLSearchParams(location.search).get('famille'));
  if (depart > 0) { s.angle = depart * 90; filtrer(depart, { adresse: false }); } else filtrer(0, { adresse: false });
  s.index = Math.max(0, depart); poser();
  boutons.forEach((b, k) => b.addEventListener('click', () => { viser(k); filtrer(k); if (calme()) { s.angle = s.cibleAngle; poser(); } }));
  disque.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (d === undefined) return;
    e.preventDefault(); const i = (s.index + d + 4) % 4; viser(i); filtrer(i); if (calme()) { s.angle = s.cibleAngle; poser(); }
  });
  /* Geste : on attrape le cadran, il tourne avec la main, garde son élan puis se cale sur la famille la plus proche. */
  let c = null, a0 = 0, t0 = 0, id = null;
  const ang = (e) => Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180 / Math.PI;
  disque.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || calme()) return;
    const r = disque.getBoundingClientRect(); c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    id = e.pointerId; s.tenu = true; s.v = 0; a0 = ang(e); t0 = performance.now(); disque.setPointerCapture(id); boite.classList.add('est-touche');
  });
  disque.addEventListener('pointermove', (e) => {
    if (!s.tenu || e.pointerId !== id) return;
    let d = ang(e) - a0; d = ((d + 540) % 360) - 180;
    const t = performance.now(); s.v += (d / Math.max(0.008, (t - t0) / 1000) - s.v) * 0.35;
    s.angle += d; a0 = ang(e); t0 = t; s.cibleAngle = null; poser();
  });
  const lacherCadran = (e) => { if (!s.tenu || (e && e.pointerId !== id)) return; s.tenu = false; if (performance.now() - t0 > 120) s.v = 0; s.v = clamp(s.v, -900, 900); };
  disque.addEventListener('pointerup', lacherCadran); disque.addEventListener('pointercancel', lacherCadran);
  if (calme()) return;
  boucle(disque, (dt) => {
    if (s.tenu) return;
    if (Math.abs(s.v) > 12) { s.angle += s.v * dt; s.v *= Math.exp(-dt * 2.6); }
    else {
      if (s.cibleAngle == null) { const i = ((Math.round(s.angle / 90) % 4) + 4) % 4; viser(i); filtrer(i); }
      s.v = 0; s.angle += (s.cibleAngle - s.angle) * (1 - Math.exp(-dt * 7));
    }
    poser();
  });
  /* Au défilement, l'ombre du gnomon tourne comme le soleil de la journée. */
  if (gsap && ST()) gsap.fromTo(s, { ombre: 140 }, { ombre: 220, ease: 'none', onUpdate: poser, scrollTrigger: { trigger: '.real-tete', start: 'top top', end: 'bottom top', scrub: 0.5 } });
}

/* ---------- Réalisations : visionneuse de chaque projet (lien propre #projet-…) ---------- */
function visionneuse() {
  const dlg = $('.visionneuse');
  if (!dlg) return;
  const D = JSON.parse($('#donnees-projets').textContent), T = JSON.parse($('#textes-projets').textContent);
  const img = $('.vis-img', dlg), pos = $('.vis-pos', dlg);
  const v = { id: null, k: 0, retour: null };
  const montrer = () => {
    const p = D[v.id], g = p.g[v.k];
    if (!g) return;
    img.src = `/assets/images/projets/${v.id}-${g[0]}-1280.webp`; img.width = g[1]; img.height = g[2];
    img.alt = `${p.t}, photo ${v.k + 1} sur ${p.g.length}`;
    pos.textContent = `${v.k + 1} / ${p.g.length}`;
    const suiv = p.g[(v.k + 1) % p.g.length]; if (suiv) { const pre = new Image(); pre.src = `/assets/images/projets/${v.id}-${suiv[0]}-1280.webp`; }
  };
  const ouvrir = (id, declencheur) => {
    const p = D[id]; if (!p) return;
    v.id = id; v.k = 0; v.retour = declencheur || document.activeElement;
    $('.vis-type', dlg).textContent = T[p.f]; $('.vis-titre', dlg).textContent = p.t; $('.vis-sous', dlg).textContent = p.s;
    $('.vis-desc', dlg).textContent = p.d || T.vide;
    const det = $('.vis-detail', dlg); det.textContent = '';
    [[T.surfaces, p.su], [T.materiaux, p.ma]].forEach(([titre, liste]) => {
      if (!liste || !liste.length) return;
      const h = document.createElement('h3'); h.textContent = titre; const ul = document.createElement('ul');
      liste.forEach((x) => { const li = document.createElement('li'); li.textContent = x; ul.appendChild(li); });
      det.append(h, ul);
    });
    $('.vis-prec', dlg).hidden = $('.vis-suiv', dlg).hidden = p.g.length < 2;
    montrer();
    if (!dlg.open) { dlg.showModal(); suivre(dlg); }
    history.replaceState(history.state, '', `${location.pathname}${location.search}#projet-${id}`);
    if (!calme() && gsap) gsap.fromTo($('.vis-cadre', dlg), { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out', clearProps: 'all' });
  };
  const fermer = () => { if (dlg.open) dlg.close(); };
  dlg.addEventListener('close', () => {
    lacher(dlg);
    history.replaceState(history.state, '', `${location.pathname}${location.search}`);
    if (v.retour && v.retour.focus) v.retour.focus();
  });
  const aller_ = (d) => { const n = D[v.id].g.length; v.k = (v.k + d + n) % n; montrer(); };
  $('.vis-prec', dlg).addEventListener('click', () => aller_(-1));
  $('.vis-suiv', dlg).addEventListener('click', () => aller_(1));
  $('.vis-fermer', dlg).addEventListener('click', fermer);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) fermer(); });
  dlg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') aller_(1); if (e.key === 'ArrowLeft') aller_(-1); });
  let x0 = null;
  img.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  img.addEventListener('pointerup', (e) => { if (x0 == null) return; const d = e.clientX - x0; x0 = null; if (Math.abs(d) > 40) aller_(d < 0 ? 1 : -1); });
  $$('.real-lien, .tour-carte').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); ouvrir(a.dataset.projet, a); }));
  const depuisAdresse = () => { const m = location.hash.match(/^#projet-(.+)$/); if (m && D[m[1]]) ouvrir(m[1], $(`[data-projet="${m[1]}"]`)); };
  quand('pret', depuisAdresse);
  addEventListener('hashchange', depuisAdresse);
}

/* ---------- L'Atelier : le meuble à plans (scène du métier, point 6) ---------- */
function meubleAPlans() {
  const meuble = $('.meuble');
  if (!meuble) return;
  const tiroirs = $$('.tiroir', meuble), images = $$('[data-image-tiroir]');
  const ouvrir = (t) => {
    tiroirs.forEach((x) => {
      const ouvre = x === t, corps = $('.tiroir-corps', x), b = $('.tiroir-facade', x);
      if (ouvre === x.classList.contains('est-ouvert')) return;
      x.classList.toggle('est-ouvert', ouvre); b.setAttribute('aria-expanded', String(ouvre));
      if (calme() || !gsap) { corps.hidden = !ouvre; return; }
      if (ouvre) { corps.hidden = false; gsap.fromTo(corps, { height: 0 }, { height: 'auto', duration: 0.45, ease: 'power2.out', onComplete: () => ST() && ST().refresh() }); }
      else gsap.to(corps, { height: 0, duration: 0.35, ease: 'power2.in', onComplete: () => { corps.hidden = true; gsap.set(corps, { clearProps: 'height' }); } });
    });
    images.forEach((im) => im.classList.toggle('est-visible', im.dataset.imageTiroir === t.dataset.tiroir));
  };
  tiroirs.forEach((t) => $('.tiroir-facade', t).addEventListener('click', () => ouvrir(t)));
  if (calme() || !gsap || !ST()) return;
  /* Au défilement, les tiroirs sortent un à un du meuble. */
  gsap.fromTo(tiroirs, { x: -28, opacity: 0.6 }, { x: 0, opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: meuble, start: 'top 90%', end: 'top 40%', scrub: 0.5 } });
}

/* ---------- L'Atelier : le cartouche se trace et s'écrit à l'ouverture ---------- */
function cartouche() {
  const k = $('.cartouche');
  if (!k) return;
  const traits = $('.cartouche-traits path', k), ecrits = $$('[data-ecrit]', k), tampon = $('.cartouche-tampon', k);
  const jouer = (tl, a) => {
    tl.fromTo(traits, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, a)
      .fromTo(ecrits, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, stagger: 0.18, ease: 'power2.out' }, a + 0.3);
  };
  ouvertures.push({
    intro(tl) { tl.call(() => { const t = gsap.timeline(); jouer(t, 0); }, null, 1.75); },
    arrivee() { const t = gsap.timeline({ delay: 0.25 }); jouer(t, 0); },
    final() { gsap.set(traits, { strokeDashoffset: 0 }); gsap.set(ecrits, { clipPath: 'inset(0 0% 0 0)' }); },
  });
  if (calme() || !gsap || !ST()) return;
  /* Au défilement, le tampon tourne légèrement, comme posé à la main. */
  gsap.fromTo(tampon, { rotate: -8 }, { rotate: 6, ease: 'none', scrollTrigger: { trigger: k, start: 'top 70%', end: 'bottom top', scrub: 0.6 } });
}

/* ---------- Convictions : mur en coupe épinglé qui se décompose (point 6) ---------- */
function murEnCoupe() {
  const sec = $('section.mur');
  if (!sec) return;
  const couches = $$('.mur-couche', sec), legende = $$('[data-couche]', sec);
  const appliquer = (p) => {
    const ecart = lisse(0.05, 0.6, p) * 1, actif = Math.min(couches.length - 1, Math.floor(lisse(0.1, 0.95, p) * couches.length));
    couches.forEach((c, i) => { c.style.setProperty('--ecart', `${((i - 2.5) * 26 * ecart).toFixed(1)}px`); c.classList.toggle('est-active', i === actif); });
    legende.forEach((l, i) => l.classList.toggle('est-active', i === actif));
  };
  if (calme() || !gsap || !ST()) { couches.forEach((c, i) => c.style.setProperty('--ecart', `${(i - 2.5) * 22}px`)); legende.forEach((l) => l.classList.add('est-active')); return; }
  appliquer(0);
  const proxy = { p: 0 };
  gsap.to(proxy, { p: 1, ease: 'none', onUpdate: () => appliquer(proxy.p), scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${Math.round(innerHeight * 1.8)}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
}

/* ---------- Convictions : barres qui se remplissent ---------- */
function barres() {
  if (calme() || !gsap || !ST()) return;
  $$('.barre-plein').forEach((b) => gsap.fromTo(b, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: b, start: 'top 92%', end: 'top 55%', scrub: 0.5 } }));
}

/* ---------- Convictions : le « 40 % » allumé par un rayon rasant ---------- */
function chiffreLumiere() {
  const ch = $('.conv-grand-chiffre'), rayon = $('.conv-rayon');
  if (!ch || !rayon) return;
  const jouer = (t, a) => {
    t.fromTo(rayon, { xPercent: -60 }, { xPercent: 420, duration: 1.6, ease: 'power2.inOut' }, a)
      .fromTo(ch, { '--lumiere': '100%' }, { '--lumiere': '0%', duration: 1.6, ease: 'power2.inOut' }, a);
  };
  ouvertures.push({
    intro(tl) { tl.call(() => jouer(gsap.timeline(), 0), null, 1.5); },
    arrivee() { jouer(gsap.timeline({ delay: 0.2 }), 0); },
    final() { gsap.set(ch, { '--lumiere': '0%' }); gsap.set(rayon, { xPercent: 420 }); },
  });
  if (calme() || !gsap || !ST()) { ch.style.setProperty('--lumiere', '40%'); return; }
  gsap.fromTo(ch, { '--lumiere': '0%' }, { '--lumiere': '80%', ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.conv-tete', start: 'top top', end: 'bottom top', scrub: 0.5 } });
}

/* ---------- Contact : le numéro s'écrit chiffre après chiffre ---------- */
function numeroTrace() {
  const n = $('.contact-numero');
  if (!n) return;
  const cs = $$('.num-c', n);
  const jouer = (t, a) => t.fromTo(cs, { opacity: 0, y: '0.3em' }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power3.out' }, a);
  ouvertures.push({
    intro(tl) { tl.call(() => jouer(gsap.timeline(), 0), null, 1.75); },
    arrivee() { jouer(gsap.timeline({ delay: 0.2 }), 0); },
    final() { gsap.set(cs, { clearProps: 'transform,opacity' }); },
  });
}

/* ---------- Contact : premier rendez-vous en cinq étapes, tampon « Reçu » (point 7) ---------- */
function rendezVous() {
  const form = $('.rdv-form');
  if (!form) return;
  const T = JSON.parse($('#textes-rdv').textContent);
  const etapes = $$('.rdv-etape', form), pastilles = $$('[data-pastille]');
  const prec = $('[data-precedent]', form), suiv = $('[data-suivant]', form), envoi = $('[data-envoyer]', form);
  const prog = $('[data-progression]', form), recap = $('[data-recap]', form);
  let n = 1;
  const afficher = (k) => {
    const avant = etapes[n - 1], apres = etapes[k - 1];
    n = k;
    etapes.forEach((e, i) => { e.hidden = i !== k - 1; e.classList.toggle('est-active', i === k - 1); });
    pastilles.forEach((p, i) => { p.classList.toggle('est-active', i === k - 1); p.classList.toggle('est-faite', i < k - 1); });
    prec.hidden = k === 1; suiv.hidden = k === 5; envoi.hidden = k !== 5;
    prog.textContent = T.etapes.replace('{n}', k);
    if (k === 5) remplirRecap();
    if (!calme() && gsap && avant !== apres) gsap.fromTo(apres, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', clearProps: 'transform,opacity' });
    const champ = $('input:not([type=hidden]), textarea', apres); if (champ && k > 1) champ.focus({ preventScroll: true });
    if (ST()) ST().refresh();
  };
  const valide = () => {
    const champs = $$('[required]', etapes[n - 1]);
    for (const c of champs) {
      if (c.type === 'radio') { if (!$(`[name="${c.name}"]:checked`, form)) return c; continue; }
      if (!c.value.trim() || (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.value.trim()))) return c;
    }
    return null;
  };
  suiv.addEventListener('click', () => {
    const faute = valide();
    if (faute) { form.requestSubmit ? form.dispatchEvent(new Event('submit', { cancelable: true })) : null; faute.focus(); return; }
    afficher(n + 1);
  });
  prec.addEventListener('click', () => afficher(n - 1));
  const remplirRecap = () => {
    const dl = $('dl', recap); dl.textContent = '';
    const val = (nom) => { const c = $$(`[name="${nom}"]`, form); if (!c.length) return ''; if (c[0].type === 'radio') { const x = c.find((r) => r.checked); return x ? x.value : ''; } if (c[0].type === 'checkbox') return c[0].checked ? T.oui : ''; return c[0].value.trim(); };
    Object.entries(T.labels).forEach(([nom, lib]) => {
      let v = val(nom); if (nom === 'projet') v = T.types[v] || v; if (nom === 'terrain') v = v === 'oui' ? T.oui : v === 'non' ? T.non : v;
      const d = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = lib; dd.textContent = v || T.vide; d.append(dt, dd); dl.appendChild(d);
    });
  };
  /* Après l'envoi simulé du socle (bouton désactivé), le petit soleil file du bouton jusqu'au tampon « Reçu ». */
  form.addEventListener('submit', () => {
    setTimeout(() => {
      if (!envoi.disabled || recap.classList.contains('est-recu')) return;
      const soleil = $('.rdv-soleil-volant', recap), tampon = $('.tampon', recap);
      if (calme() || !gsap) { recap.classList.add('est-recu'); return; }
      const rr = recap.getBoundingClientRect(), rb = envoi.getBoundingClientRect(), rt = tampon.getBoundingClientRect();
      const x0 = rb.left + rb.width / 2 - rr.left - 11, y0 = rb.top + rb.height / 2 - rr.top - 11;
      const x1 = rt.left + rt.width / 2 - rr.left - 11, y1 = rt.top + rt.height / 2 - rr.top - 11;
      const tl = gsap.timeline();
      tl.set(soleil, { x: x0, y: y0, opacity: 1, scale: 1 })
        .to(soleil, { x: x1, duration: 0.7, ease: 'power1.inOut' }, 0)
        .to(soleil, { y: Math.min(y0, y1) - 80, duration: 0.35, ease: 'power2.out' }, 0)
        .to(soleil, { y: y1, duration: 0.35, ease: 'power2.in' }, 0.35)
        .to(soleil, { scale: 3, opacity: 0, duration: 0.25 }, 0.7)
        .call(() => recap.classList.add('est-recu'), null, 0.72)
        .fromTo(recap, { x: 0 }, { x: 3, duration: 0.06, yoyo: true, repeat: 3, clearProps: 'transform' }, 0.74);
    }, 0);
  });
  /* Arrivée par ?projet= : le choix est déjà fait (socle) ; on reste à l'étape 1 pour le voir. */
}

/* ---------- Contact : plan d'accès ---------- */
function planAcces() {
  const fig = $('.acces-plan');
  if (!fig || calme() || !gsap || !ST()) return;
  gsap.fromTo(fig, { y: 36, rotate: 1.2 }, { y: 0, rotate: 0, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'top 50%', scrub: 0.5 } });
}

/* ---------- Boost : le soleil du fil se tire pour voyager dans la page ---------- */
function filSaisissable() {
  const fil = $('.fil-soleil'), astre = $('.fil-astre');
  if (!fil || !astre) return;
  astre.classList.add('est-saisissable');
  let id = null, r = null;
  const viser = (e) => { const p = clamp((e.clientY - r.top) / r.height); aller(p * Math.max(1, document.documentElement.scrollHeight - innerHeight), { instant: true }); };
  astre.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; id = e.pointerId; r = fil.getBoundingClientRect(); astre.setPointerCapture(id); fil.classList.add('est-tenu'); e.preventDefault(); });
  astre.addEventListener('pointermove', (e) => { if (e.pointerId === id) viser(e); });
  const fin = (e) => { if (e.pointerId !== id) return; id = null; fil.classList.remove('est-tenu'); };
  astre.addEventListener('pointerup', fin); astre.addEventListener('pointercancel', fin);
}

/* ---------- Boost : on attrape aussi le soleil de la coupe bioclimatique ---------- */
function coupeManipulable() {
  const sec = $('.lumiere');
  if (!sec || !sec.__dessiner) return;
  const svg = $('svg', sec), astre = $('.coupe-astre', svg);
  let id = null;
  const angleDe = (e) => {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return clamp(Math.atan2(430 - p.y, 330 - p.x) * 180 / Math.PI, 12, 72);
  };
  astre.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; id = e.pointerId; astre.setPointerCapture(id); sec.classList.add('est-touche'); sec.__manuel = true; });
  astre.addEventListener('pointermove', (e) => { if (e.pointerId === id) sec.__dessiner(angleDe(e)); });
  const fin = (e) => { if (e.pointerId === id) id = null; };
  astre.addEventListener('pointerup', fin); astre.addEventListener('pointercancel', fin);
}

/* ===================== v2 · animations « wouahou » ===================== */
function preparerV2() {
  maquette3d();
  pleinEcran();
  motsGeants();
  lettres();
  vitesseImages();
  lumierePointeur();
  carrousel3d();
}

/* Vitesse de défilement lissée, partagée (px/s), sans lecture de mise en page. */

/* ---------- Maquette 3D qui se construit au défilement et se fait pivoter à la main ---------- */
function maquette3d() {
  const sec = $('.maquette');
  if (!sec) return;
  const scene = $('.maquette-scene', sec), maison = $('.maison3d', sec), soleil = $('.maquette-soleil', sec), ombre = $('.sol3d-ombre', sec);
  const pieces = Object.fromEntries($$('[data-piece]', sec).map((p) => [p.dataset.piece, p]));
  const murs = $$('.mur', pieces.murs), etapes = $$('[data-etape-m]', sec);
  const s = { p: 0, ry: -32, main: 0, v: 0, tenu: false };
  const echelle = () => { const r = scene.getBoundingClientRect(); scene.style.setProperty('--k', Math.min(r.width / 620, r.height / 470, 1.15).toFixed(3)); };
  echelle(); new ResizeObserver(echelle).observe(scene);
  const poser = () => {
    const p = s.p;
    const ry = -32 + p * 250 + s.main;
    maison.style.transform = `rotateX(-24deg) rotateY(${ry.toFixed(2)}deg)`;
    const dalle = lisse(0, 0.16, p), mur = (i) => lisse(0.14 + i * 0.06, 0.34 + i * 0.06, p), toit = lisse(0.62, 0.84, p);
    pieces.dalle.style.transform = `scale3d(${(0.2 + 0.8 * dalle).toFixed(3)}, ${dalle.toFixed(3)}, ${(0.2 + 0.8 * dalle).toFixed(3)})`;
    murs.forEach((m, i) => { const k = mur(i); m.style.setProperty('--monte', k.toFixed(3)); m.parentElement === pieces.murs && (m.style.transform = m.dataset.base + ` translateY(${((1 - k) * 65).toFixed(1)}px) scaleY(${Math.max(0.001, k).toFixed(3)})`); });
    pieces.toit.style.transform = `translate3d(0, ${(-(1 - toit) * 420).toFixed(1)}px, 0) rotateZ(${((1 - toit) * -8).toFixed(2)}deg)`;
    pieces.toit.style.visibility = toit < 0.01 ? 'hidden' : 'visible';
    sec.style.setProperty('--vitres', lisse(0.44, 0.6, p).toFixed(3));
    /* Lumière : le soleil vient du sud-ouest de l'écran ; chaque face est plus ou moins éclairée selon son orientation. */
    const sol = 205, a = (n) => { const d = ((ry + n - sol) % 360 + 360) % 360 * Math.PI / 180; return (0.62 * (1 - Math.max(0, Math.cos(d)))).toFixed(3); };
    maison.style.setProperty('--o-av', a(0)); maison.style.setProperty('--o-dr', a(90)); maison.style.setProperty('--o-ar', a(180)); maison.style.setProperty('--o-ga', a(270));
    maison.style.setProperty('--o-toit', a(0) * 0.7); maison.style.setProperty('--o-toit-ar', a(180) * 0.7);
    ombre.style.transform = `translate(${(40 + Math.sin(ry * Math.PI / 180) * 30).toFixed(1)}px, ${(-30 + Math.cos(ry * Math.PI / 180) * 20).toFixed(1)}px) skewX(-18deg) scale(${(0.3 + 0.7 * lisse(0.14, 0.5, p)).toFixed(3)})`;
    soleil.style.transform = `translate3d(${(p * 60).toFixed(1)}px, ${(-Math.sin(p * Math.PI) * 30).toFixed(1)}px, 0)`;
    const n = p < 0.16 ? 1 : p < 0.44 ? 2 : p < 0.62 ? 3 : 4;
    etapes.forEach((e, i) => e.classList.toggle('est-active', i + 1 === n));
  };
  murs.forEach((m) => { m.dataset.base = m.style.transform; m.style.transformOrigin = '50% 65px'; });
  if (calme() || !gsap || !ST()) { s.p = 1; s.main = 10; poser(); etapes.forEach((e) => e.classList.add('est-active')); return; }
  poser();
  const proxy = { p: 0 };
  gsap.to(proxy, { p: 1, ease: 'none', onUpdate: () => { s.p = proxy.p; poser(); }, scrollTrigger: { trigger: sec, start: 'top top', end: () => `+=${Math.round(innerHeight * 2.2)}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
  /* Pivoter à la main, avec élan. */
  let id = null, x0 = 0, t0 = 0;
  scene.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; id = e.pointerId; s.tenu = true; s.v = 0; x0 = e.clientX; t0 = performance.now(); scene.setPointerCapture(id); scene.classList.add('est-touche'); });
  scene.addEventListener('pointermove', (e) => { if (!s.tenu || e.pointerId !== id) return; const t = performance.now(), d = (e.clientX - x0) * 0.45; s.v += (d / Math.max(0.008, (t - t0) / 1000) - s.v) * 0.35; s.main += d; x0 = e.clientX; t0 = t; poser(); });
  const fin = (e) => { if (!s.tenu || (e && e.pointerId !== id)) return; s.tenu = false; if (performance.now() - t0 > 120) s.v = 0; s.v = clamp(s.v, -900, 900); };
  scene.addEventListener('pointerup', fin); scene.addEventListener('pointercancel', fin);
  boucle(scene, (dt) => { if (s.tenu || Math.abs(s.v) < 4) return; s.main += s.v * dt; s.v *= Math.exp(-dt * 2.4); poser(); });
}

/* ---------- Photo de projet qui s'ouvre jusqu'au plein écran, titre géant qui s'écarte ---------- */
function pleinEcran() {
  const sec = $('.plein');
  if (!sec) return;
  const cadre = $('.plein-cadre', sec), img = $('.plein-media img', sec), g = $('.plein-mot--g', sec), d = $('.plein-mot--d', sec), leg = $('.plein-legende', sec);
  if (calme() || !gsap || !ST()) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true } });
  tl.fromTo(cadre, { clipPath: 'inset(22% 30% 22% 30% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 }, 0)
    .fromTo(g, { xPercent: 0 }, { xPercent: -38, ease: 'power1.in', duration: 1 }, 0)
    .fromTo(d, { xPercent: 0 }, { xPercent: 60, ease: 'power1.in', duration: 1 }, 0)
    .fromTo(leg, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, 0.85);
}

/* ---------- Mots géants qui filent au défilement, inclinés par la vitesse ---------- */
function motsGeants() {
  const rangees = $$('.mots-rangee');
  if (!rangees.length || calme() || !gsap || !ST()) return;
  rangees.forEach((r) => {
    const sens = +r.dataset.sens || 1, boite = r.closest('.mots-geants');
    const etat_ = { x: 0 };
    const quick = gsap.quickSetter(r, 'css');
    gsap.fromTo(etat_, { x: sens > 0 ? 0 : -30 }, { x: sens > 0 ? -30 : 0, ease: 'none', scrollTrigger: { trigger: boite, start: 'top bottom', end: 'bottom top', scrub: 0.4 }, onUpdate: () => quick({ xPercent: etat_.x, skewX: clamp(-vitesse.v / 220, -10, 10) }) });
  });
  /* Inclinaison qui retombe quand le défilement s'arrête. */
  const boucleEl = rangees[0];
  boucle(boucleEl, (dt, t) => {
    amortirVitesse(dt, t);
    if (Math.abs(vitesse.v) > 1) rangees.forEach((r) => gsap.set(r, { skewX: clamp(-vitesse.v / 220, -10, 10) }));
  });
}

/* ---------- Titres h2 qui arrivent lettre par lettre, en rotation ---------- */
function lettres() {
  const titres = $$('[data-lettres]');
  if (!titres.length) return;
  const montrer = (el) => { el.classList.add('vu'); el.style.opacity = 1; };
  if (calme() || !gsap || !ST() || !window.SplitText || etat.arrivee === 'retour') { titres.forEach(montrer); return; }
  titres.forEach((el) => {
    ST().create({
      trigger: el.parentElement, start: 'top 82%', once: true,
      onEnter: () => {
        montrer(el);
        let d = null;
        /* Hauteur figée pendant l'animation : la découpe ne décale jamais la page (positions des effets stables). */
        el.style.height = `${el.offsetHeight}px`;
        try { d = new window.SplitText(el, { type: 'words,chars', charsClass: 'fx-lettre' }); } catch (e) { el.style.height = ''; return; }
        gsap.fromTo(d.chars, { yPercent: 60, rotate: 12, opacity: 0, transformOrigin: '0% 100%' }, { yPercent: 0, rotate: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.018, onComplete: () => { d.revert(); el.style.height = ''; } });
      },
    });
  });
}

/* ---------- Images de projets qui se déforment selon la vitesse de défilement ---------- */
function vitesseImages() {
  const cibles = $$('.projet-sel-cadre, .real-media');
  if (!cibles.length || calme() || !gsap) return;
  const set = cibles.map((c) => gsap.quickSetter(c, 'skewY', 'deg'));
  let dernier = 0;
  boucle(cibles[0].closest('section') || document.body, (dt, t) => {
    amortirVitesse(dt, t);
    const k = clamp(vitesse.v / 900, -3.2, 3.2);
    if (Math.abs(k - dernier) > 0.01) { dernier = k; set.forEach((f) => f(k)); }
  });
}

/* ---------- Lumière-soleil au pointeur (souris seulement), plus forte sur les photos ---------- */
function lumierePointeur() {
  if (!sourisFine() || calme()) return;
  const el = document.createElement('div');
  el.className = 'lumiere-pointeur'; el.setAttribute('aria-hidden', 'true'); el.dataset.auditIgnorer = ''; el.dataset.souris = '';
  document.body.appendChild(el);
  const p = { x: -500, y: -500, cx: -500, cy: -500, bouge: false };
  let raf = 0;
  const pas = () => {
    raf = 0;
    p.cx += (p.x - p.cx) * 0.2; p.cy += (p.y - p.cy) * 0.2;
    el.style.transform = `translate3d(${p.cx.toFixed(1)}px, ${p.cy.toFixed(1)}px, 0)`;
    if (Math.abs(p.x - p.cx) + Math.abs(p.y - p.cy) > 0.3) raf = requestAnimationFrame(pas);
  };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    p.x = e.clientX; p.y = e.clientY;
    if (!p.bouge) { p.bouge = true; p.cx = p.x; p.cy = p.y; el.classList.add('est-actif'); }
    const cible = e.target;
    el.classList.toggle('sur-photo', !!(cible && cible.closest && cible.closest('.media, .tour-carte, .maquette-scene')));
    el.style.visibility = cible && cible.closest && cible.closest('input, textarea, select') ? 'hidden' : 'visible';
    if (!raf) raf = requestAnimationFrame(pas);
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.remove('est-actif'));
}

/* ---------- Réalisations : carrousel 3D courbe, au défilement et à la main ---------- */
function carrousel3d() {
  const scene = $('.tour-scene');
  if (!scene) return;
  const cyl = $('.tour-cylindre', scene), cartes = $$('.tour-carte', scene);
  const pasA = 360 / Math.max(1, cartes.length);
  const s = { def: 0, main: 0, v: 0, tenu: false, cible: null };
  const poser = () => {
    const a = s.def + s.main; cyl.style.transform = `rotateX(-6deg) rotateY(${(-a).toFixed(2)}deg)`;
    /* Les cartes de profil ou de dos ne sont ni visibles ni cliquables (zones trop étroites). */
    if (!calme()) cartes.forEach((c, i) => { const d = ((i * pasA - a) % 360 + 540) % 360 - 180, face = Math.abs(d) < 68; if (face !== c.__face) { c.__face = face; c.style.visibility = face ? 'visible' : 'hidden'; c.tabIndex = face ? 0 : -1; } });
  };
  const viser = (d) => { const a = s.def + s.main; const i = Math.round(a / pasA) + d; s.cible = i * pasA - s.def; };
  $('.tour-prec').addEventListener('click', () => { viser(-1); if (calme()) { s.main = s.cible; poser(); } });
  $('.tour-suiv').addEventListener('click', () => { viser(1); if (calme()) { s.main = s.cible; poser(); } });
  if (calme() || !gsap || !ST()) return;
  poser();
  gsap.fromTo(s, { def: -40 }, { def: 140, ease: 'none', onUpdate: poser, scrollTrigger: { trigger: '.tour', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  let id = null, x0 = 0, t0 = 0, glisse = 0;
  scene.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; id = e.pointerId; s.tenu = true; s.v = 0; s.cible = null; x0 = e.clientX; t0 = performance.now(); glisse = 0; });
  scene.addEventListener('pointermove', (e) => {
    if (!s.tenu || e.pointerId !== id) return;
    const t = performance.now(), d = -(e.clientX - x0) * 0.22; glisse += Math.abs(e.clientX - x0);
    if (glisse > 6 && !scene.hasPointerCapture(id)) scene.setPointerCapture(id);
    s.v += (d / Math.max(0.008, (t - t0) / 1000) - s.v) * 0.35; s.main += d; x0 = e.clientX; t0 = t; poser();
  });
  const fin = (e) => { if (!s.tenu || (e && e.pointerId !== id)) return; s.tenu = false; if (performance.now() - t0 > 120) s.v = 0; s.v = clamp(s.v, -500, 500); };
  scene.addEventListener('pointerup', fin); scene.addEventListener('pointercancel', fin);
  scene.addEventListener('click', (e) => { if (glisse > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
  boucle(scene, (dt) => {
    if (s.tenu) return;
    if (Math.abs(s.v) > 3) { s.main += s.v * dt; s.v *= Math.exp(-dt * 2.2); poser(); }
    else if (s.cible != null) { s.main += (s.cible - s.main) * (1 - Math.exp(-dt * 6)); if (Math.abs(s.cible - s.main) < 0.05) s.cible = null; poser(); }
  });
}
