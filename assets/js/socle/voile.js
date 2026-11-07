/* Voile de transition : sa forme reprend le motif de la direction artistique (grille wouahou, point 3).
   Elle se choisit dans donnees/site.json (« formeVoile ») ; le gabarit la pose sur [data-voile] (data-forme).
   - glisse (défaut) : le voile monte du bas, puis repart vers le haut ;
   - iris   : un disque grandit depuis le clic (au clavier : depuis le lien), puis à l'arrivée un trou s'ouvre
              sur l'objet d'ouverture de la page ([data-iris-centre]) ; avec data-iris-centre="disque" sur un objet
              rond entier à l'écran, le trou démarre à sa taille ;
   - vague  : le voile monte avec un bord en vague, puis repart vers le haut avec une vague en bas ;
   - rideau : deux pans se ferment depuis les côtés, puis s'ouvrent depuis le centre.
   L'ordre et les garanties ne changent pas (transitions.js, ouverture.js) : le voile couvre, la navigation a lieu,
   la page se prépare dessous, le voile se retire ; mode calme : rien ; retour arrière : reinitialiser().
   Repli sans clip-path ni masque (iris, rideau) : fondu. Une autre forme (tampon, empreinte, étoile) se branche ici,
   dans couvrir() et decouvrir(), sur le modèle des quatre formes. */
import { html, etat } from './etat.js?v=4';

export const FORMES = ['glisse', 'iris', 'vague', 'rideau'];
const COURBE = 'cubic-bezier(.65,0,.35,1)';
/* Durées par défaut en ms : [couvrir, découvrir]. */
const DUREES = { glisse: [450, 520], iris: [550, 800], vague: [700, 850], rideau: [600, 700] };

export function voile() { return document.querySelector('[data-voile]'); }
export function forme() {
  const f = (voile() || { dataset: {} }).dataset.forme;
  return FORMES.includes(f) ? f : 'glisse';
}

const supporte = (p, v) => !!(window.CSS && CSS.supports && CSS.supports(p, v));
const gere = {
  iris: () => supporte('clip-path', 'circle(10px at 10px 10px)') && (supporte('mask-image', 'radial-gradient(black, black)') || supporte('-webkit-mask-image', 'radial-gradient(black, black)')),
  rideau: () => supporte('clip-path', 'polygon(0 0, 1px 0, 1px 1px)'),
  vague: () => true,
  glisse: () => true,
};
/* Largeur et hauteur de la zone couverte (la bande de la barre de défilement n'en fait pas partie). */
const W = () => document.documentElement.clientWidth || innerWidth;
const H = () => innerHeight;
export const rayon = (x, y) => Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(W() - x, y), Math.hypot(x, H() - y), Math.hypot(W() - x, H() - y))) + 2;
const enDouceur = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/* Rideau : deux pans de largeur a % chacun (0 : ouvert, 50 : fermé). Le segment du bas parcouru deux fois
   en sens inverse ne couvre rien : un seul polygone dessine les deux pans. */
const pans = (a) => `polygon(0% 0%, ${a}% 0%, ${a}% 100%, ${100 - a}% 100%, ${100 - a}% 0%, 100% 0%, 100% 100%, 0% 100%)`;

/** Centre de la partie visible de l'objet d'ouverture (il peut dépasser en bas de l'écran), sinon centre de l'écran. */
export function centreOuverture(selecteur = '[data-iris-centre]') {
  const el = typeof selecteur === 'string' ? document.querySelector(selecteur) : selecteur;
  if (el) {
    const r = el.getBoundingClientRect();
    const g = Math.max(r.left, 0), d = Math.min(r.right, W()), h = Math.max(r.top, 0), b = Math.min(r.bottom, H());
    if (d - g > 60 && b - h > 60) return { x: (g + d) / 2, y: (h + b) / 2, r: Math.min(d - g, b - h) / 2, entier: b - h >= r.height - 1 && d - g >= r.width - 1, el };
  }
  return { x: W() / 2, y: H() / 2, r: 0, entier: false, el: null };
}

/** Trou qui grandit image par image dans un panneau (voile ou intro) : variable --trou du masque, classe avec-trou. */
export function ouvrirTrou(el, c, duree) {
  const R = rayon(c.x, c.y);
  const r0 = c.el && c.el.dataset.irisCentre === 'disque' && c.entier ? c.r + 1 : -2;
  el.style.setProperty('--cx', `${c.x}px`);
  el.style.setProperty('--cy', `${c.y}px`);
  el.style.setProperty('--trou', `${r0}px`);
  el.classList.add('avec-trou');
  const t0 = performance.now();
  return new Promise((ok) => {
    let fini = false;
    const finir = () => { if (fini) return; fini = true; el.style.setProperty('--trou', `${R}px`); ok(); };
    const pas = (t) => {
      if (fini) return;
      const p = Math.min(1, Math.max(0, (t - t0) / duree));
      el.style.setProperty('--trou', `${(r0 + enDouceur(p) * (R - r0)).toFixed(1)}px`);
      if (p < 1) requestAnimationFrame(pas); else finir();
    };
    requestAnimationFrame(pas);
    setTimeout(finir, duree + 400); /* onglet en arrière-plan */
  });
}

function nettoyer(v) {
  v.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  v.classList.remove('avec-trou');
  ['--cx', '--cy', '--trou'].forEach((p) => v.style.removeProperty(p));
  v.style.removeProperty('transform');
  v.style.removeProperty('visibility');
}

/** Retour arrière ou avant depuis le cache, erreur : plus aucun voile, page découverte. */
export function reinitialiser() {
  const v = voile();
  html.classList.add('voile-leve');
  if (v) nettoyer(v);
}

/**
 * Le voile couvre l'écran.
 * @param {object} [o]
 * @param {number} [o.duree]   ms (par défaut selon la forme ; o.rapide : 70 %, pour un saut dans la page)
 * @param {{x:number,y:number}} [o.point]  point de départ de l'iris (clic) ; sinon le centre de l'écran
 */
export function couvrir(o = {}) {
  const v = voile();
  if (!v || etat.calme) return Promise.resolve();
  const f = forme();
  const duree = o.duree || Math.round(DUREES[f][0] * (o.rapide ? 0.7 : 1));
  nettoyer(v);
  html.classList.remove('voile-leve');
  v.style.visibility = 'visible';
  const opts = { duration: duree, easing: COURBE, fill: 'forwards' };
  let a;
  if (!gere[f]()) {
    a = v.animate([{ transform: 'none', opacity: 0 }, { transform: 'none', opacity: 1 }], { ...opts, duration: duree * 0.7 });
  } else if (f === 'iris') {
    /* C'est l'aire couverte qui suit la courbe (rayon en racine carrée) : sans à-coup au milieu de l'animation,
       là où un rayon qui accélère ferait sauter la moitié de l'écran d'une image à l'autre. */
    const x = o.point ? o.point.x : W() / 2, y = o.point ? o.point.y : H() / 2, R = rayon(x, y), n = 16;
    const cles = Array.from({ length: n + 1 }, (_, i) => {
      const aire = 0.5 - Math.cos((Math.PI * i) / n) / 2;
      return { transform: 'none', clipPath: `circle(${(R * Math.sqrt(aire)).toFixed(1)}px at ${x}px ${y}px)` };
    });
    a = v.animate(cles, { ...opts, easing: 'linear' });
  } else if (f === 'rideau') {
    a = v.animate([{ transform: 'none', clipPath: pans(0) }, { transform: 'none', clipPath: pans(50) }], opts);
  } else if (f === 'vague') {
    const vague = v.querySelector('.voile-vague--haut');
    const hv = vague ? vague.getBoundingClientRect().height : 0;
    a = v.animate([{ transform: `translateY(${H() + hv}px)` }, { transform: 'translateY(0)' }], opts);
    /* La vague se creuse pendant la montée, puis s'aplatit sur le bord quand le voile arrive en haut. */
    if (vague) vague.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(1)', offset: 0.55 }, { transform: 'scaleY(0)' }], { duration: duree, easing: 'ease-in', fill: 'forwards' });
  } else {
    a = v.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], opts);
  }
  return a.finished.catch(() => {});
}

/**
 * Le voile se retire et découvre la page (arrivée par un lien interne, ou grand saut dans une même page).
 * @param {object} [o]
 * @param {number} [o.duree]    ms (par défaut selon la forme)
 * @param {string} [o.centre]   objet d'ouverture visé par l'iris
 */
export function decouvrir(o = {}) {
  const v = voile();
  if (!v || etat.calme) { html.classList.add('voile-leve'); return Promise.resolve(); }
  const f = forme();
  const duree = o.duree || Math.round(DUREES[f][1] * (o.rapide ? 0.7 : 1));
  /* Le voile reste couvrant pendant qu'on change d'animation (style posé avant d'annuler la précédente). */
  v.style.visibility = 'visible';
  v.style.transform = 'none';
  v.getAnimations({ subtree: true }).forEach((x) => x.cancel());
  const opts = { duration: duree, easing: COURBE, fill: 'forwards' };
  let fin;
  if (!gere[f]()) {
    fin = v.animate([{ opacity: 1 }, { opacity: 0 }], { ...opts, duration: duree * 0.7, easing: 'ease-out' }).finished;
  } else if (f === 'iris') {
    fin = ouvrirTrou(v, centreOuverture(o.centre || '[data-iris-centre]'), duree);
  } else if (f === 'rideau') {
    fin = v.animate([{ clipPath: pans(50) }, { clipPath: pans(0) }], opts).finished;
  } else if (f === 'vague') {
    const vague = v.querySelector('.voile-vague--bas');
    const hv = vague ? vague.getBoundingClientRect().height : 0;
    fin = v.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-(H() + hv)}px)` }], { ...opts, easing: 'cubic-bezier(.6,0,.3,1)' }).finished;
    if (vague) vague.animate([{ transform: 'scaleY(.3)' }, { transform: 'scaleY(1)', offset: 0.45 }, { transform: 'scaleY(.6)' }], { duration: duree, easing: 'ease-out', fill: 'forwards' });
  } else {
    fin = v.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], opts).finished;
  }
  return Promise.resolve(fin).catch(() => {}).then(() => {
    /* voile-leve d'abord : le style critique ne remet pas le voile une image entre deux états. */
    html.classList.add('voile-leve');
    nettoyer(v);
  });
}
