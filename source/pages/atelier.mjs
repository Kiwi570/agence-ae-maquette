/* L'Atelier · ouverture : matière chaux-chanvre plein cadre, cartouche de plan qui se trace et s'écrit
   (nom, titres, Ordre, assurance), monogramme « ae » rond en tampon (objet d'ouverture), portrait encadré.
   Puis : parcours tracé, équipe, démarche en tiroirs du meuble à plans (scène du métier), questions fréquentes. */
import { html } from '../../outils/gabarit.mjs';

export const page = { cle: 'atelier', fichier: 'atelier', imagePartage: 'marine-gourlay-bureau-960.webp' };

const TIROIRS = [
  { n: 1, image: 'tiroir-conseils', projet: 'conseil' },
  { n: 2, image: 'grok/atelier-table', projet: 'neuf' },
  { n: 3, image: 'tiroir-permis', projet: 'neuf' },
  { n: 4, image: 'tiroir-maitrise', projet: 'renovation' },
  { n: 5, image: 'tiroir-chantier', projet: 'renovation' },
];

export default (c) => {
  const I = c.donnees.images.images;
  const initiales = (nom) => nom.split(' ').filter((m) => /^[A-ZÉ]/.test(m)).map((m) => m[0]).join('').slice(0, 2);
  return html`
<section class="atelier-tete" id="debut">
  ${c.media({ nom: 'grok/atelier-chaux', alt: '', priorite: true, classe: 'atelier-fond', sizes: '100vw', attrs: 'data-fx="parallaxe" data-fx-force="5"' })}
  <div class="conteneur atelier-tete-grille">
    <div class="atelier-tete-texte">
      <p class="surtitre" data-anime="gsap" data-ouv>${c.t('atelier.surtitre')}</p>
      <h1 class="titre-ombre atelier-titre" data-texte="${c.s('atelier.titre')}" data-grille="typo" data-effet="ombre-portee"><span class="ligne-masque"><span class="ouv-ligne" data-anime="gsap">${c.t('atelier.titre')}</span></span></h1>
      <p class="atelier-intro" data-anime="gsap" data-ouv data-info-cle>${c.t('atelier.texte')}</p>
      <p class="atelier-actions" data-anime="gsap" data-ouv>${c.lien('contact', { ancre: 'rendez-vous', classe: 'bouton', texte: c.t('atelier.fin.action'), attrs: 'data-action-principale' })}</p>
      <div class="cartouche" data-effet="cartouche" aria-label="Cartouche">
        <svg class="cartouche-traits" viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden="true"><path d="M1 1 H599 V219 H1 Z M1 60 H599 M400 60 V219 M1 120 H400 M1 170 H400" pathLength="1"/></svg>
        <p class="cartouche-projet">${c.t('atelier.cartouche.projet')}</p>
        <p class="cartouche-nom"><span data-ecrit>${c.t('atelier.cartouche.nom')}</span></p>
        <p class="cartouche-titre"><span data-ecrit>${c.t('atelier.cartouche.titre')}</span></p>
        <p class="cartouche-ordre"><span data-ecrit>${c.t('atelier.cartouche.ordre')} · ${c.t('atelier.cartouche.assurance')}</span></p>
        <div class="cartouche-tampon" data-iris-centre="disque" aria-hidden="true"><span class="voile-ae"></span><span class="tampon-lieu">${c.t('atelier.cartouche.lieu')}</span></div>
      </div>
    </div>
    ${c.media({ nom: 'marine-gourlay-bureau', alt: I['marine-gourlay-bureau'].alt, priorite: true, classe: 'atelier-portrait', ratio: '4 / 5', sizes: '(max-width: 760px) 70vw, 30vw', attrs: 'data-anime="gsap" data-ouv' })}
  </div>
</section>

<section class="parcours" id="parcours">
  <div class="conteneur parcours-grille">
    <div>
      <p class="surtitre" data-anime>${c.t('atelier.parcours.surtitre')}</p>
      <h2 data-anime="gsap" data-lettres>${c.t('atelier.parcours.titre')}</h2>
      <p data-anime>${c.t('atelier.parcours.texte')}</p>
      <p class="parcours-reseaux" data-anime>${c.t('atelier.parcours.reseaux')}</p>
    </div>
    <div class="frise" data-visuel>
      <svg class="frise-trait" viewBox="0 0 20 600" preserveAspectRatio="none" aria-hidden="true" data-fx="trace"><path d="M10 4 V596"/></svg>
      <ol data-anime="cascade">${[1, 2, 3].map((n) => html`<li><span class="frise-annee">${c.t(`atelier.parcours.j${n}.annee`)}</span><span class="frise-texte">${c.t(`atelier.parcours.j${n}.texte`)}</span></li>`)}</ol>
    </div>
  </div>
</section>

<section class="equipe" id="equipe">
  <div class="conteneur">
    <p class="surtitre" data-anime>${c.t('atelier.equipe.surtitre')}</p>
    <h2 class="titre-ombre" data-texte="${c.s('atelier.equipe.titre')}" data-effet="ombre-portee" data-anime>${c.t('atelier.equipe.titre')}</h2>
    <ul class="equipe-liste" data-anime="cascade">${[1, 2, 3, 4].map((n) => { const nom = c.s(`atelier.equipe.m${n}.nom`); return html`<li class="membre" data-visuel><span class="membre-monogramme" aria-hidden="true">${initiales(nom)}</span><strong>${nom}</strong><span>${c.t(`atelier.equipe.m${n}.role`)}</span></li>`; })}</ul>
  </div>
</section>

<section class="demarche" id="demarche" data-grille="scene" data-effet="meuble-a-plans">
  <div class="conteneur demarche-grille">
    <div class="demarche-texte">
      <p class="surtitre" data-anime>${c.t('atelier.demarche.surtitre')}</p>
      <h2 data-anime="gsap" data-lettres>${c.t('atelier.demarche.titre')}</h2>
      <p data-anime>${c.t('atelier.demarche.texte')}</p>
      <div class="meuble">
        ${TIROIRS.map((t) => html`<div class="tiroir${t.n === 1 ? ' est-ouvert' : ''}" data-tiroir="${t.n}">
          <h3 class="tiroir-titre"><button type="button" class="tiroir-facade" aria-expanded="${t.n === 1 ? 'true' : 'false'}" aria-controls="tiroir-${t.n}"><span class="tiroir-num">0${t.n}</span><span>${c.t(`atelier.demarche.t${t.n}.titre`)}</span><span class="tiroir-poignee" aria-hidden="true"></span></button></h3>
          <div class="tiroir-corps" id="tiroir-${t.n}"${t.n === 1 ? '' : ' hidden'}>
            <div class="tiroir-dedans">
              <p>${c.t(`atelier.demarche.t${t.n}.texte`)}</p>
              <p class="tiroir-detail">${c.t(`atelier.demarche.t${t.n}.detail`)}</p>
              ${c.lien('contact', { ancre: 'rendez-vous', params: `projet=${t.projet}`, classe: 'lien-fleche', texte: c.t('atelier.demarche.parler') })}
            </div>
          </div>
        </div>`)}
      </div>
    </div>
    <div class="demarche-images" aria-hidden="true">
      ${TIROIRS.map((t) => c.media({ nom: t.image, alt: '', classe: `demarche-image${t.n === 1 ? ' est-visible' : ''}`, ratio: '4 / 5', sizes: '(max-width: 760px) 72vw, 36vw', attrs: `data-image-tiroir="${t.n}"` }))}
    </div>
  </div>
</section>

<section class="faq" id="faq">
  <div class="conteneur faq-grille">
    <div>
      <p class="surtitre" data-anime>${c.t('atelier.faq.surtitre')}</p>
      <h2 data-anime="gsap" data-lettres>${c.t('atelier.faq.titre')}</h2>
      <div class="faq-liste" data-anime="cascade">${[1, 2, 3, 4, 5, 6, 7].map((n) => html`<details class="faq-item"><summary>${c.t(`faq.q${n}.q`)}</summary><div class="faq-reponse"><p>${c.t(`faq.q${n}.r`)}</p></div></details>`)}</div>
    </div>
    ${c.media({ nom: 'faq-interieur', alt: I['faq-interieur'].alt, classe: 'faq-media', ratio: '4 / 5', sizes: '(max-width: 760px) 100vw, 34vw', attrs: 'data-fx="parallaxe"' })}
  </div>
</section>

<section class="fin" id="fin">
  <div class="conteneur fin-grille">
    <div class="fin-texte">
      <h2 class="titre-ombre" data-texte="${c.s('atelier.fin.titre')}" data-effet="ombre-portee" data-anime>${c.t('atelier.fin.titre')}</h2>
      <p data-anime>${c.t('atelier.fin.texte')}</p>
      <p class="fin-actions" data-anime>${c.lien('contact', { ancre: 'rendez-vous', classe: 'bouton bouton--soleil', texte: c.t('atelier.fin.action'), attrs: 'data-survol="magnetique"' })}</p>
    </div>
    ${c.media({ nom: 'marine-gourlay', alt: I['marine-gourlay'].alt, classe: 'fin-media', ratio: '4 / 5', sizes: '(max-width: 760px) 100vw, 38vw', attrs: 'data-anime="rideau"' })}
  </div>
</section>
`;
};
