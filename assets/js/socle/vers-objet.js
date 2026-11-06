/* Intro qui devient la page (grille wouahou, point 2).
   L'objet de l'intro (par défaut le logo du panneau, [data-ouverture-objet] ; sinon un disque, un cachet, une boussole…)
   glisse et change d'échelle jusqu'à l'objet d'ouverture de la page ([data-iris-centre]), puis le panneau de l'intro
   s'ouvre en cercle depuis lui. Avec data-iris-centre="disque" sur un objet rond entier à l'écran, le trou démarre
   à sa taille : l'objet de l'intro est remplacé exactement par celui de la page.
   Sans objet d'ouverture visible (au moins 60 × 60 px dans le premier écran), tout se fait depuis le centre de l'écran.

   Usage, dans jouer() de assets/js/site.js, avant de renvoyer la timeline :
     const tl = gsap.timeline();
     tl.fromTo('.ouverture-trait', { scaleX: 0 }, { scaleX: 1, duration: 0.6 });
     versObjet(tl, { a: 1.0 });
     return tl;
   - Le socle appelle jouer() quand les polices et la première image sont prêtes : les positions sont mesurées là.
     Ne pas animer l'objet d'ouverture lui-même avant cet appel (sa position serait faussée).
   - Fin à a + duree + ouverture (1,0 + 0,5 + 0,8 = 2,3 s) : sous les 3 s du socle. Tout effet long (titre qui se coud,
     compteur) se joue hors de cette timeline (tl.call), sinon le socle accélère toute l'intro.
   - Accélérer, passer, retour arrière, mode calme : gérés par le socle comme pour toute intro. */
import { centreOuverture, rayon } from './voile.js?v=1';

/**
 * @param {object} tl  timeline GSAP de l'intro
 * @param {object} [o]
 * @param {HTMLElement} [o.panneau]  panneau de l'intro (par défaut [data-ouverture])
 * @param {HTMLElement} [o.objet]    objet de l'intro (par défaut [data-ouverture-objet] dans le panneau)
 * @param {string|HTMLElement} [o.cible='[data-iris-centre]']  objet d'ouverture de la page
 * @param {number} [o.a=1.1]          instant du départ dans la timeline (s)
 * @param {number} [o.duree=.5]       durée du glissement (s)
 * @param {number} [o.ouverture=.8]   durée de l'ouverture du panneau (s)
 * @param {number} [o.echelleMin=.3] [o.echelleMax=1.3]  bornes de l'échelle de l'objet à l'arrivée
 */
export function versObjet(tl, o = {}) {
  const panneau = o.panneau || document.querySelector('[data-ouverture]');
  if (!tl || !panneau) return tl;
  const objet = o.objet || panneau.querySelector('[data-ouverture-objet]');
  const a = o.a ?? 1.1, duree = o.duree ?? 0.5, ouverture = o.ouverture ?? 0.8;
  const c = centreOuverture(o.cible || '[data-iris-centre]');
  const r0 = c.el && c.el.dataset.irisCentre === 'disque' && c.entier ? c.r + 1 : -2;
  panneau.classList.add('avec-trou');
  tl.set(panneau, { '--cx': `${c.x}px`, '--cy': `${c.y}px`, '--trou': '-2px' }, 0);
  if (objet) {
    const p = objet.getBoundingClientRect();
    const echelle = c.el ? Math.min(o.echelleMax ?? 1.3, Math.max(o.echelleMin ?? 0.3, (2 * c.r) / Math.max(1, p.width))) : 1;
    const dx = c.x - (p.left + p.width / 2), dy = c.y - (p.top + p.height / 2);
    tl.fromTo(objet, { x: 0, y: 0, scale: 1 }, { x: dx, y: dy, scale: echelle, duration: duree, ease: 'power3.inOut', immediateRender: false }, a);
  }
  tl.set(panneau, { '--trou': `${r0}px` }, a + duree + 0.01)
    .to(panneau, { '--trou': `${rayon(c.x, c.y)}px`, duration: ouverture, ease: 'power3.in' }, a + duree + 0.01);
  return tl;
}
