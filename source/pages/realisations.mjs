/* Réalisations · ouverture : fond clair, très grand titre à ombre portée, cadran solaire qu'on tourne pour choisir
   une famille de projets (data-grille="manipuler", objet d'ouverture rond), bandeau de photos qui défile.
   Puis la grille des projets filtrable (filtre gardé dans l'adresse), et la visionneuse de chaque projet (lien propre). */
import { html, brut } from '../../outils/gabarit.mjs';
import { carte, projetsDe } from '../gabarits/blocs.mjs';

export const page = { cle: 'realisations', fichier: 'realisations', imagePartage: 'planche-neuf-1280.webp' };

const FAMILLES = ['tous', 'neuf', 'renovation', 'pro'];

export default (c) => {
  const projets = c.donnees.projets;
  const n = (f) => (f === 'tous' ? projets.length : projetsDe(c, f).length);
  const ruban = projets.filter((p, i) => i % 2 === 0).slice(0, 10);
  const donneesVisionneuse = Object.fromEntries(projets.map((p) => [p.id, {
    t: p.titre, s: `${p.sous} · ${p.commune}`, f: p.categorie,
    d: p.detail ? p.detail.texte : '', su: p.detail ? p.detail.surfaces : [], ma: p.detail ? p.detail.materiaux : [],
    g: (c.donnees.images.projets[p.id] || []).map((x) => [x.k, x.l, x.h]),
  }]));
  return html`
<section class="real-tete" id="debut">
  <div class="conteneur real-tete-grille">
    <div class="real-tete-texte">
      <p class="surtitre" data-anime="gsap" data-ouv>${c.t('realisations.surtitre')}</p>
      <h1 class="titre-ombre real-titre" data-texte="${c.s('realisations.titre')}" data-grille="typo" data-effet="ombre-portee"><span class="ligne-masque"><span class="ouv-ligne" data-anime="gsap">${c.t('realisations.titre')}</span></span></h1>
      <p class="real-intro" data-anime="gsap" data-ouv>${c.t('realisations.texte')}</p>
      <p class="real-actions" data-anime="gsap" data-ouv>
        <a class="bouton" href="#liste" data-action-principale data-sans-transition>${c.t('realisations.voirTous')}</a>
        <span class="real-compte" data-info-cle><span class="pastille-soleil" aria-hidden="true"></span><span data-real-compte>${c.t('realisations.compte', { n: projets.length })}</span></span>
      </p>
    </div>
    <div class="cadran" data-grille="manipuler" data-effet="cadran-filtres">
      <div class="cadran-disque" data-iris-centre="disque" role="slider" tabindex="0" aria-label="${c.s('realisations.cadran')}" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0" aria-valuetext="${c.s('realisations.tous')}">
        <svg viewBox="0 0 400 400" aria-hidden="true">
          <circle class="cadran-fond" cx="200" cy="200" r="196"/>
          <circle class="cadran-anneau" cx="200" cy="200" r="150"/>
          ${Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2, r1 = i % 12 === 0 ? 156 : 166, r2 = 182; return html`<line class="cadran-graduation" x1="${(200 + Math.sin(a) * r1).toFixed(1)}" y1="${(200 - Math.cos(a) * r1).toFixed(1)}" x2="${(200 + Math.sin(a) * r2).toFixed(1)}" y2="${(200 - Math.cos(a) * r2).toFixed(1)}"/>`; })}
          <g class="cadran-gnomon"><path d="M200 200 L189 142 L200 118 L211 142 Z"/><circle cx="200" cy="200" r="16"/></g>
          <g class="cadran-ombre"><path d="M200 200 L195 252 L200 292 L205 252 Z"/></g>
        </svg>
        <span class="cadran-centre" aria-hidden="true"></span>
      </div>
      <ol class="cadran-familles" aria-hidden="true">${FAMILLES.map((f, i) => html`<li class="cadran-famille cadran-famille--${i}" data-index="${i}"><strong>${c.t(`realisations.${f}`)}</strong><span>${n(f)}</span></li>`)}</ol>
      <p class="cadran-indice" aria-hidden="true">${c.t('realisations.indice')}</p>
    </div>
  </div>
  <div class="ruban-real-boite" data-section>
    <div class="ruban-real" id="ruban-real" data-boucle-css data-ruban data-effet="ruban-real"><div class="ruban-real-piste">${[...ruban, ...ruban].map((p, i) => html`<img src="/assets/images/projets/${p.id}-carte-480.webp" alt="" width="480" height="360" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async">`)}</div></div>
    <button type="button" class="ruban-pause" data-pause-pour="ruban-real" data-libelle-pause="${c.s('commun.pause')}" data-libelle-lecture="${c.s('commun.lecture')}"><span data-libelle-bouton>${c.t('commun.pause')}</span></button>
  </div>
</section>

<section class="tour" id="tour" data-grille="manipuler">
  <div class="conteneur tour-tete">
    <p class="surtitre" data-anime>${c.t('realisations.tour.surtitre')}</p>
    <h2 data-anime="gsap" data-lettres>${c.t('realisations.tour.titre')}</h2>
  </div>
  <div class="tour-scene" data-effet="carrousel-3d" role="group" aria-label="${c.s('realisations.tour.region')}">
    <div class="tour-cylindre" data-galerie>${projets.filter((p) => (c.donnees.images.projets[p.id] || []).length).slice(0, 12).map((p, i) => html`<a class="tour-carte" data-superpose href="#projet-${p.id}" data-projet="${p.id}" data-sans-transition style="--i:${i}"><img src="/assets/images/projets/${p.id}-carte-480.webp" alt="" width="480" height="360" loading="lazy" decoding="async"><span><strong>${p.titre}</strong>${p.commune}</span></a>`)}</div>
  </div>
  <p class="tour-commandes conteneur"><button type="button" class="vis-bouton tour-prec" aria-label="${c.s('realisations.tour.precedent')}">←</button><span class="tour-indice"><span class="indice-souris">${c.t('realisations.tour.indice')}</span><span class="indice-tactile">${c.t('realisations.tour.indiceTactile')}</span></span><button type="button" class="vis-bouton tour-suiv" aria-label="${c.s('realisations.tour.suivant')}">→</button></p>
</section>

<section class="real-liste" id="liste">
  <div class="conteneur">
    <div class="real-filtres" role="group" aria-label="${c.s('realisations.filtres')}">
      ${FAMILLES.map((f, i) => html`<button type="button" class="puce" data-famille-bouton="${f}" data-index="${i}" aria-pressed="${f === 'tous' ? 'true' : 'false'}">${c.t(`realisations.${f}`)} <span class="puce-n">${n(f)}</span></button>`)}
    </div>
    <ul class="real-grille" aria-label="${c.s('realisations.region')}">
      ${projets.map((p, i) => carte(c, p, i))}
    </ul>
    <p class="real-note">${c.t('realisations.noteVisuels')}</p>
  </div>
</section>

<dialog class="visionneuse" data-recouvrement aria-labelledby="vis-titre">
  <div class="vis-cadre">
    <figure class="vis-figure"><img class="vis-img" src="/assets/images/projets/maison-tg-combrit-1-640.webp" alt="" width="1280" height="853"><figcaption class="vis-pos" aria-live="polite"></figcaption></figure>
    <div class="vis-texte">
      <p class="surtitre vis-type"></p>
      <h2 id="vis-titre" class="vis-titre"></h2>
      <p class="vis-sous"></p>
      <p class="vis-desc"></p>
      <div class="vis-detail"></div>
      <p class="vis-actions">${c.lien('contact', { ancre: 'rendez-vous', classe: 'bouton bouton--soleil', texte: c.t('realisations.fin.action') })}</p>
    </div>
    <button type="button" class="vis-bouton vis-prec" aria-label="${c.s('realisations.precedent')}">←</button>
    <button type="button" class="vis-bouton vis-suiv" aria-label="${c.s('realisations.suivant')}">→</button>
    <button type="button" class="vis-fermer" aria-label="${c.s('realisations.fermer')}">✕</button>
  </div>
</dialog>
<script type="application/json" id="donnees-projets">${brut(JSON.stringify(donneesVisionneuse).replace(/</g, '\\u003c'))}</script>
<script type="application/json" id="textes-projets">${brut(JSON.stringify({ neuf: c.s('realisations.neuf'), renovation: c.s('realisations.renovation'), pro: c.s('realisations.pro'), tous: c.s('realisations.tous'), compte: c.s('realisations.compte'), surfaces: c.s('realisations.surfaces'), materiaux: c.s('realisations.materiaux'), vide: c.s('realisations.aCompleter') }))}</script>

<section class="fin" id="fin">
  <div class="conteneur fin-grille">
    <div class="fin-texte">
      <h2 class="titre-ombre" data-texte="${c.s('realisations.fin.titre')}" data-effet="ombre-portee" data-anime>${c.t('realisations.fin.titre')}</h2>
      <p data-anime>${c.t('realisations.fin.texte')}</p>
      <p class="fin-actions" data-anime>${c.lien('contact', { ancre: 'rendez-vous', classe: 'bouton bouton--soleil', texte: c.t('realisations.fin.action'), attrs: 'data-survol="magnetique"' })}</p>
    </div>
    ${c.media({ nom: 'planche-renovation', alt: c.donnees.images.images['planche-renovation'].alt, classe: 'fin-media', ratio: '4 / 5', sizes: '(max-width: 760px) 100vw, 38vw', attrs: 'data-anime="rideau"' })}
  </div>
</section>
`;
};
