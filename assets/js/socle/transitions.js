/* Transitions entre pages, toujours dans cet ordre :
   1. le voile couvre tout l'écran ; 2. la navigation a lieu (un indicateur dit à la page d'arrivée
   de démarrer couverte) ; 3. la nouvelle page se prépare sous le voile ; 4. le voile se retire.
   Les liens vers la page en cours font défiler sans recharger (chemins normalisés, cleanUrls).
   Les grands sauts dans une même page passent aussi sous le voile.
   La forme du voile (glisse, iris, vague, rideau) est dans voile.js. */
import { html, etat, chemin, stockage, emettre } from './etat.js?v=1';
import { aller, bloquerDefilement, debloquerDefilement } from './defilement.js?v=1';
import { fermerMenu } from './entete.js?v=1';
import { suivre, lacher } from './gouttiere.js?v=1';
import { voile, couvrir, decouvrir } from './voile.js?v=1';

const prechargees = new Set();
let enDepart = false;

function lienInterne(a, e) {
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-sans-transition')) return null;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return null;
  if (/\.(pdf|zip|jpe?g|png|webp|mp4|ics|vcf)$/i.test(url.pathname)) return null;
  return url;
}

export async function allerAncre(hash, { pousser = true } = {}) {
  let cible = null;
  try { cible = hash && hash !== '#' ? document.querySelector(decodeURIComponent(hash)) : null; } catch {}
  if (pousser) history.pushState(null, '', hash || location.pathname + location.search);
  const y = cible ? cible.getBoundingClientRect().top : -window.scrollY;
  if (!etat.calme && Math.abs(y) > window.innerHeight * 3) {
    bloquerDefilement('saut');
    suivre(voile());
    await couvrir({ rapide: true });
    aller(cible || 0, { instant: true });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await decouvrir({ rapide: true, centre: cible || '[data-iris-centre]' });
    debloquerDefilement('saut');
    lacher(voile());
  } else {
    aller(cible || 0);
  }
  if (cible) {
    if (!cible.hasAttribute('tabindex') && !/^(a|button|input|select|textarea)$/i.test(cible.tagName)) cible.setAttribute('tabindex', '-1');
    cible.focus({ preventScroll: true });
  }
}

/**
 * Départ vers une autre page sous le voile.
 * @param {URL} url
 * @param {string} [libelle]  nom de la page d'arrivée affiché sur le voile
 * @param {{x:number,y:number}} [point]  point de départ de l'iris (clic) ; sinon le centre de l'écran
 */
export async function partir(url, libelle, point) {
  if (enDepart) return;
  enDepart = true;
  fermerMenu({ rendreFocus: false });
  const ss = stockage();
  const couleur = getComputedStyle(html).getPropertyValue('--voile-fond').trim();
  try { ss && ss.setItem('socle:depart', JSON.stringify({ t: Date.now(), couleur })); } catch {}
  const lib = document.querySelector('[data-voile-libelle]');
  if (lib && libelle) lib.textContent = libelle;
  emettre('depart', { url: url.href });
  if (etat.calme) { location.href = url.href; return; }
  /* Défilement bloqué pendant le départ : la barre de défilement disparaît et sa bande suit le voile. */
  bloquerDefilement('depart');
  suivre(voile());
  /* Garde-fou : la navigation part même si l'animation ne se termine pas. */
  const secours = setTimeout(() => (location.href = url.href), 1100);
  await couvrir({ point });
  clearTimeout(secours);
  location.href = url.href;
}

export function initTransitions() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    const url = lienInterne(a, e);
    if (!url) return;
    /* Langue choisie : mémorisée pour les prochaines arrivées sur le site. */
    if (a.dataset.langue) { try { stockage('local').setItem('socle:langue', a.dataset.langue); } catch {} }
    if (chemin(url) === chemin(location) && url.search === location.search) {
      e.preventDefault();
      fermerMenu({ rendreFocus: false });
      allerAncre(url.hash);
      return;
    }
    e.preventDefault();
    /* Point de départ de l'iris : le clic ; au clavier (detail 0), le centre du lien. */
    let point = null;
    if (e.detail !== 0) point = { x: e.clientX, y: e.clientY };
    else { const r = a.getBoundingClientRect(); point = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    partir(url, a.dataset.libelle || a.textContent.trim().slice(0, 40), point);
  });

  window.addEventListener('popstate', () => { if (location.hash) allerAncre(location.hash, { pousser: false }); });

  /* Préchargement de la page suivante à l'approche du lien. */
  const precharger = (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const url = lienInterne(a, { button: 0 });
    if (!url || chemin(url) === chemin(location)) return;
    const cle = url.origin + url.pathname;
    if (prechargees.has(cle)) return;
    prechargees.add(cle);
    const l = document.createElement('link');
    l.rel = 'prefetch'; l.href = cle;
    document.head.appendChild(l);
  };
  document.addEventListener('pointerover', precharger, { passive: true });
  document.addEventListener('focusin', precharger);
  document.addEventListener('touchstart', precharger, { passive: true });

  window.addEventListener('pageshow', (e) => { if (e.persisted) enDepart = false; });
}
