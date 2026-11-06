/* Convictions · ouverture centrée sur fond de bois brûlé : « 40 % » géant allumé par un rayon rasant,
   petit soleil rond (objet d'ouverture). Puis : chiffres en barres, trois principes (dont le mur en coupe épinglé
   qui se décompose couche par couche : scène du métier), pistes vers plus sobre et sources. */
import { html } from '../../outils/gabarit.mjs';

export const page = { cle: 'convictions', fichier: 'convictions', imagePartage: 'grok/convictions-bois-1280.webp' };

const COUCHES = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6'];

export default (c) => {
  const I = c.donnees.images.images;
  return html`
<section class="conv-tete" id="debut">
  ${c.media({ nom: 'grok/convictions-bois', alt: '', priorite: true, classe: 'conv-fond', sizes: '100vw', attrs: 'data-fx="parallaxe" data-fx-force="5"' })}
  <span class="conv-rayon" data-effet="chiffre-lumiere" aria-hidden="true"></span>
  <div class="conteneur conv-tete-texte">
    <p class="surtitre" data-anime="gsap" data-ouv>${c.t('convictions.surtitre')}</p>
    <p class="conv-grand" aria-hidden="true"><span class="conv-grand-chiffre" data-anime="gsap" data-ouv>${c.t('convictions.grand')}</span><span class="conv-soleil" data-iris-centre="disque"></span></p>
    <h1 class="conv-titre" data-info-cle><span class="visuellement-cache">${c.t('convictions.grand')} </span><span class="ligne-masque"><span class="ouv-ligne" data-anime="gsap">${c.t('convictions.titre')}</span></span></h1>
    <p class="conv-intro" data-anime="gsap" data-ouv>${c.t('convictions.texte')}</p>
    <p data-anime="gsap" data-ouv><a class="bouton bouton--soleil" href="#principes" data-action-principale data-sans-transition>${c.t('convictions.voirPrincipes')}</a></p>
  </div>
</section>

<section class="pourquoi" id="pourquoi">
  <div class="conteneur">
    <p class="surtitre" data-anime>${c.t('convictions.pourquoi.surtitre')}</p>
    <h2 class="titre-ombre pourquoi-titre" data-texte="${c.s('convictions.pourquoi.titre')}" data-grille="typo" data-effet="ombre-portee" data-anime>${c.t('convictions.pourquoi.titre')}</h2>
    <ul class="barres" data-visuel>${[1, 2, 3, 4].map((n) => html`<li class="barre">
      <span class="chiffre-boite"><strong class="chiffre-grand" data-compteur="${c.s(`convictions.pourquoi.c${n}.v`)}">${c.t(`convictions.pourquoi.c${n}.v`)}</strong><span class="chiffre-unite">${c.t(`convictions.pourquoi.c${n}.u`)}</span></span>
      <span class="barre-piste" aria-hidden="true"><span class="barre-plein" data-effet="barres" style="--v:${c.s(`convictions.pourquoi.c${n}.v`)}"></span></span>
      <span class="barre-texte">${c.t(`convictions.pourquoi.c${n}.t`)}</span>
    </li>`)}</ul>
    <p class="chiffres-source">${c.t('convictions.pourquoi.source')}</p>
  </div>
</section>

<div class="mots-geants mots-geants--sombre" aria-hidden="true" data-ruban data-audit-ignorer>
  <p class="mots-rangee" data-effet="mots-geants" data-sens="1">${[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((n, i) => html`<span class="${i % 2 ? 'mot-creux' : 'mot-plein'}">${c.t(`convictions.mots.m${n}`)}</span><span class="mot-soleil"></span>`)}</p>
</div>

<section class="principe" id="principes">
  <div class="conteneur principe-grille">
    <div>
      <p class="principe-num" data-anime>${c.t('convictions.p1.numero')}</p>
      <h2 data-anime="gsap" data-lettres>${c.t('convictions.p1.titre')}</h2>
      <p data-anime>${c.t('convictions.p1.texte')}</p>
      <p>${c.lien('accueil', { ancre: 'lumiere', classe: 'lien-fleche', texte: c.t('convictions.p1.lien') })}</p>
    </div>
    ${c.media({ nom: 'grok/lumiere-hiver', alt: I['grok/lumiere-hiver'].alt, classe: 'principe-media', ratio: '3 / 2', sizes: '(max-width: 760px) 100vw, 50vw', attrs: 'data-fx="onde"' })}
  </div>
</section>

<section class="mur ecran epingle" id="habitat-sain" data-entete-cache data-plein-ecran data-grille="scene" data-effet="mur-en-coupe">
  <div class="conteneur mur-grille">
    <div class="mur-texte">
      <p class="principe-num">${c.t('convictions.p2.numero')}</p>
      <h2>${c.t('convictions.p2.titre')}</h2>
      <p>${c.t('convictions.p2.texte')}</p>
      <ol class="mur-legende">${COUCHES.map((k, i) => html`<li data-couche="${i}"><strong>${c.t(`convictions.p2.couches.${k}.nom`)}</strong><span>${c.t(`convictions.p2.couches.${k}.info`)}</span></li>`)}</ol>
      <p class="mur-note">${c.t('convictions.p2.note')}</p>
    </div>
    <figure class="mur-coupe" data-visuel role="img" aria-label="${c.s('convictions.p2.region')}" data-tient>
      <div class="mur-scene">${COUCHES.map((k, i) => html`<span class="mur-couche mur-couche--${i}" style="--i:${i}"><span class="mur-etiquette">${c.t(`convictions.p2.couches.${k}.nom`)}</span></span>`)}</div>
      <figcaption>${c.t('commun.illustratif')}</figcaption>
    </figure>
  </div>
</section>

<section class="principe principe--inverse" id="chantier-propre">
  <div class="conteneur principe-grille">
    ${c.media({ nom: 'grok/matiere-ossature', alt: I['grok/matiere-ossature'].alt, classe: 'principe-media', ratio: '3 / 2', sizes: '(max-width: 760px) 100vw, 50vw', attrs: 'data-fx="zoom"' })}
    <div>
      <p class="principe-num" data-anime>${c.t('convictions.p3.numero')}</p>
      <h2 data-anime="gsap" data-lettres>${c.t('convictions.p3.titre')}</h2>
      <p data-anime>${c.t('convictions.p3.texte')}</p>
    </div>
  </div>
</section>

<section class="sobre" id="sobre">
  <div class="conteneur sobre-grille">
    <div>
      <p class="surtitre" data-anime>${c.t('convictions.sobre.surtitre')}</p>
      <h2 data-anime="gsap" data-lettres>${c.t('convictions.sobre.titre')}</h2>
      <ol class="sobre-liste" data-anime="cascade">${[1, 2, 3, 4].map((n) => html`<li><span class="sobre-num">0${n}</span>${c.t(`convictions.sobre.l${n}`)}</li>`)}</ol>
    </div>
    <div class="sobre-images">
      ${c.media({ nom: 'grok/matiere-paille', alt: I['grok/matiere-paille'].alt, classe: 'sobre-media', ratio: '3 / 2', sizes: '(max-width: 760px) 100vw, 40vw', attrs: 'data-fx="parallaxe"' })}
      ${c.media({ nom: 'reemploi', alt: I['reemploi'].alt, classe: 'sobre-media sobre-media--2', ratio: '3 / 2', sizes: '(max-width: 760px) 100vw, 30vw', attrs: 'data-anime="rideau"' })}
    </div>
  </div>
</section>

<section class="fin" id="fin">
  <div class="conteneur fin-grille">
    <div class="fin-texte">
      <h2 class="titre-ombre" data-texte="${c.s('convictions.fin.titre')}" data-effet="ombre-portee" data-anime>${c.t('convictions.fin.titre')}</h2>
      <p data-anime>${c.t('convictions.fin.texte')}</p>
      <p class="fin-actions" data-anime>${c.lien('contact', { ancre: 'rendez-vous', classe: 'bouton bouton--soleil', texte: c.t('convictions.fin.action'), attrs: 'data-survol="magnetique"' })}</p>
    </div>
    ${c.media({ nom: 'chaux-chanvre', alt: I['chaux-chanvre'].alt, classe: 'fin-media', ratio: '4 / 5', sizes: '(max-width: 760px) 100vw, 38vw', attrs: 'data-anime="rideau"' })}
  </div>
</section>
`;
};
