/* Accueil · direction « Course du soleil ».
   Ouverture : photo plein cadre, titre à gauche, soleil à saisir sur sa course (data-grille="manipuler", data-iris-centre="disque").
   Puis : vision (titre à ombre portée), trois savoir-faire en planches empilées, coupe bioclimatique épinglée,
   sélection de projets (ombre qui passe), chiffres, zone d'intervention, témoignage, premier rendez-vous. */
import { html } from '../../outils/gabarit.mjs';
import { carte, projetsDe, communesSvg } from '../gabarits/blocs.mjs';

export const page = { cle: 'accueil', fichier: 'index', imagePartage: 'ouverture-1280.webp' };

const SELECTION = [
  { id: 'maison-tg-combrit', image: 'selection-combrit' },
  { id: 'remise-pigeonnier-treguennec', image: 'selection-treguennec' },
  { id: 'bureaux-ergue', image: 'selection-bureaux' },
  { id: 'maison-vacances-loctudy', image: 'selection-loctudy' },
  { id: 'maison-xvie-lanvenegen', image: 'selection-lanvenegen' },
];

export default (c) => {
  const P = Object.fromEntries(c.donnees.projets.map((p) => [p.id, p]));
  const alt = (n) => c.donnees.images.images[n].alt;
  const types = { neuf: c.s('realisations.neuf'), renovation: c.s('realisations.renovation'), pro: c.s('realisations.pro') };
  const motsManifeste = c.s('accueil.vision.texte').split(' ');
  return html`
<section class="hero" id="debut">
  ${c.media({ nom: 'ouverture', alt: alt('ouverture'), cadrage: '55% 50%', cadrageMobile: '50% 50%', priorite: true, classe: 'hero-media', sizes: '100vw' })}
  <div class="hero-lumiere" aria-hidden="true"><span class="l-aube"></span><span class="l-jour"></span><span class="l-couchant"></span><span class="l-nuit"></span><span class="hero-halo"></span></div>
  <div class="hero-ciel" data-effet="soleil-a-saisir" data-grille="manipuler">
    <svg class="hero-arc" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true"><path d="M60 368 C 200 -60, 800 -60, 940 368"/></svg>
    <div class="hero-soleil" data-iris-centre="disque" tabindex="0" role="slider" aria-label="${c.s('accueil.hero.soleil')}" aria-valuemin="6" aria-valuemax="21" aria-valuenow="17" aria-valuetext="17 h"><span class="hero-soleil-coeur"></span></div>
    <p class="hero-heure" aria-hidden="true"><span data-heure>17 h 15</span><span data-moment>soleil bas</span></p>
    <p class="hero-indice" aria-hidden="true"><span class="indice-souris">${c.t('accueil.hero.indice')}</span><span class="indice-tactile">${c.t('accueil.hero.indiceTactile')}</span></p>
  </div>
  <div class="hero-texte conteneur">
    <p class="surtitre hero-surtitre" data-anime="gsap">${c.t('accueil.hero.surtitre')}</p>
    <h1 class="hero-titre"><span class="ligne-masque"><span data-anime="gsap" class="hero-ligne">${c.t('accueil.hero.titre1')}</span></span><span class="ligne-masque"><span data-anime="gsap" class="hero-ligne">${c.t('accueil.hero.titre2')}</span></span><span class="ligne-masque"><span data-anime="gsap" class="hero-ligne hero-ligne--accent">${c.t('accueil.hero.titre3')}</span></span></h1>
    <p class="hero-intro" data-anime="gsap">${c.t('accueil.hero.texte')}</p>
    <div class="hero-actions" data-anime="gsap">
      ${c.lien('contact', { ancre: 'rendez-vous', classe: 'bouton bouton--soleil', texte: c.t('accueil.hero.action'), attrs: 'data-action-principale data-survol="magnetique"' })}
      ${c.lien('realisations', { classe: 'bouton bouton--clair', texte: c.t('accueil.hero.secondaire') })}
    </div>
    <p class="hero-info" data-anime="gsap" data-info-cle><span class="pastille-soleil" aria-hidden="true"></span>${c.t('accueil.hero.info')}</p>
  </div>
  <p class="hero-legende">${c.t('accueil.hero.legende')}</p>
</section>

<section class="vision" id="vision">
  <div class="conteneur vision-grille">
    <div class="vision-texte">
      <p class="surtitre" data-anime>${c.t('accueil.vision.surtitre')}</p>
      <h2 class="titre-ombre" data-texte="${c.s('accueil.vision.titre')}" data-grille="typo" data-effet="ombre-portee" data-anime>${c.t('accueil.vision.titre')}</h2>
      <p class="manifeste" data-effet="manifeste">${motsManifeste.map((m, i) => html`<span class="mm" style="--i:${i}">${m}</span> `)}</p>
      <p class="vision-suite" data-anime>${c.t('accueil.vision.suite')}</p>
    </div>
    ${c.media({ nom: 'grok/scene-maquette', alt: alt('grok/scene-maquette'), classe: 'vision-media', ratio: '4 / 5', sizes: '(max-width: 760px) 100vw, 40vw', attrs: 'data-fx="zoom"' })}
  </div>
</section>

<section class="savoir" id="savoir-faire">
  <div class="conteneur savoir-tete">
    <p class="surtitre" data-anime>${c.t('accueil.savoir.surtitre')}</p>
    <h2 data-anime="lignes">${c.t('accueil.savoir.titre')}</h2>
  </div>
  <div class="conteneur planches">
    ${['neuf', 'renovation', 'pro'].map((k, i) => html`<article class="planche" style="--i:${i}" data-effet="planches">
      <div class="planche-texte">
        <p class="planche-num">0${i + 1} · ${c.t('accueil.savoir.compte', { n: projetsDe(c, k).length })}</p>
        <h3>${c.t(`accueil.savoir.${k}.titre`)}</h3>
        <p>${c.t(`accueil.savoir.${k}.texte`)}</p>
        ${c.lien('realisations', { params: `famille=${k}`, classe: 'lien-fleche', texte: c.t(`accueil.savoir.${k}.lien`) })}
      </div>
      ${c.media({ nom: `planche-${k}`, alt: alt(`planche-${k}`), classe: 'planche-media', sizes: '(max-width: 760px) 100vw, 55vw' })}
      <span class="planche-ombre" aria-hidden="true"></span>
    </article>`)}
  </div>
</section>

<section class="lumiere ecran epingle" id="lumiere" data-entete-cache data-plein-ecran data-grille="scene" data-effet="maison-ombres">
  <div class="conteneur lumiere-grille">
    <div class="lumiere-texte">
      <p class="surtitre">${c.t('accueil.lumiere.surtitre')}</p>
      <h2 class="lumiere-titre">${c.t('accueil.lumiere.titre')}</h2>
      <ol class="lumiere-etapes">
        ${[1, 2, 3, 4].map((n) => html`<li class="lumiere-etape" data-etape="${n}"><p class="lumiere-num">0${n}</p><h3>${c.t(`accueil.lumiere.e${n}.titre`)}</h3><p>${c.t(`accueil.lumiere.e${n}.texte`)}</p><p class="lumiere-lecture">${c.t(`accueil.lumiere.e${n}.lecture`)}</p></li>`)}
      </ol>
      <div class="lumiere-progres" aria-hidden="true">${[1, 2, 3, 4].map((n) => html`<span data-point="${n}"></span>`)}</div>
    </div>
    <figure class="lumiere-coupe" data-visuel role="img" aria-label="${c.s('accueil.lumiere.region')}" data-tient>
      <svg viewBox="0 0 800 520" aria-hidden="true">
        <defs>
          <linearGradient id="ciel-coupe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ciel-haut)"/><stop offset="1" stop-color="var(--ciel-bas)"/></linearGradient>
          <pattern id="hachure" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V8" stroke="currentColor" stroke-width="1.4" opacity=".45"/></pattern>
          <pattern id="paille" width="10" height="6" patternUnits="userSpaceOnUse"><path d="M0 3 L10 1 M0 6 L10 4" stroke="#b08a3e" stroke-width="1.2"/></pattern>
        </defs>
        <rect class="coupe-ciel" x="0" y="0" width="800" height="430" fill="url(#ciel-coupe)"/>
        <path class="coupe-arc" d="M45 430 A 290 290 0 0 1 330 140" fill="none"/>
        <polygon class="coupe-faisceau-ext" points="56,336 330,280.5 330,430"/>
        <polygon class="coupe-ombre-sol" points="730,430 800,430 800,436 730,436"/>
        <rect class="coupe-sol" x="0" y="430" width="800" height="90"/>
        <text class="coupe-repere" x="40" y="470">Sud</text><text class="coupe-repere" x="740" y="470" text-anchor="end">Nord</text>
        <rect class="coupe-dalle" x="330" y="430" width="400" height="16"/>
        <rect class="coupe-interieur" x="330" y="241" width="370" height="189"/>
        <polygon class="coupe-faisceau" points="330,280.5 330,430 700,430 700,407.8"/>
        <line class="coupe-tache" x1="330" y1="428" x2="700" y2="428"/>
        <line class="coupe-tache-mur" x1="698" y1="430" x2="698" y2="407.8"/>
        <g class="coupe-mur-nord"><rect x="700" y="227" width="30" height="203" class="mur-structure"/><rect x="700" y="227" width="7" height="203" class="mur-enduit"/><rect x="707" y="227" width="12" height="203" fill="url(#paille)"/><rect x="719" y="227" width="6" height="203" class="mur-fibre"/><rect x="725" y="227" width="5" height="203" class="mur-bardage"/></g>
        <rect class="coupe-vitrage" x="326" y="269" width="8" height="161"/>
        <rect class="coupe-linteau" x="324" y="227" width="12" height="42"/>
        <path class="coupe-toit" d="M258 227 L 742 227 L 742 207 L 258 215 Z"/>
        <g class="coupe-vent" opacity="0"><path d="M712 300 h20 M712 340 h20 M712 380 h20"/></g>
        <g class="coupe-chaleur" opacity="0"><ellipse cx="560" cy="380" rx="120" ry="40"/></g>
        <g class="coupe-astre" transform="translate(56 336)"><circle class="coupe-halo" r="46"/><circle class="coupe-soleil" r="22"/></g>
        <text class="coupe-angle" x="86" y="310">19°</text>
      </svg>
      <figcaption class="lumiere-note">${c.t('accueil.lumiere.note')}</figcaption>
    </figure>
  </div>
</section>

<section class="projets" id="projets">
  <div class="conteneur projets-tete">
    <p class="surtitre" data-anime>${c.t('accueil.projets.surtitre')}</p>
    <h2 class="titre-ombre" data-texte="${c.s('accueil.projets.titre')}" data-grille="typo" data-effet="ombre-portee" data-anime>${c.t('accueil.projets.titre')}</h2>
  </div>
  <ul class="conteneur projets-liste">
    ${SELECTION.map((s, i) => { const p = P[s.id]; return html`<li class="projet-sel" style="--i:${i}">
      <a href="${c.url('realisations', `projet-${p.id}`)}" data-libelle="${c.libelle('realisations')}">
        <span class="projet-sel-cadre">
          ${c.media({ nom: s.image, alt: alt(s.image), classe: 'projet-sel-media', sizes: '(max-width: 760px) 92vw, 44vw', attrs: i < 3 ? 'data-fx="onde"' : 'data-fx="parallaxe" data-fx-force="8"' })}
          <span class="ombre-passe" data-effet="ombre-qui-passe" aria-hidden="true"></span>
        </span>
        <span class="projet-sel-texte"><span class="projet-sel-type">${types[p.categorie]}</span><strong>${p.titre}</strong><span>${p.commune}</span></span>
      </a>
    </li>`; })}
  </ul>
  <p class="conteneur projets-tout">${c.lien('realisations', { classe: 'bouton', texte: c.t('accueil.projets.tout'), attrs: 'data-survol="magnetique"' })}</p>
</section>

<section class="chiffres-acc" id="chiffres">
  <div class="conteneur chiffres-grille">
    <div>
      <p class="surtitre" data-anime>${c.t('accueil.chiffres.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('accueil.chiffres.titre')}</h2>
      <ul class="chiffres-liste" data-anime="cascade" data-grille="typo">
        <li><span class="chiffre-boite"><strong class="chiffre-grand" data-compteur="40" data-effet="chiffres-gras">40</strong><span class="chiffre-unite">%</span></span><span class="chiffre-texte">${c.t('accueil.chiffres.c1')}</span></li>
        <li><span class="chiffre-boite"><strong class="chiffre-grand" data-compteur="70" data-effet="chiffres-gras">70</strong><span class="chiffre-unite">%</span></span><span class="chiffre-texte">${c.t('accueil.chiffres.c2')}</span></li>
        <li><span class="chiffre-boite"><strong class="chiffre-grand" data-compteur="800" data-effet="chiffres-gras">800</strong><span class="chiffre-unite">kg</span></span><span class="chiffre-texte">${c.t('accueil.chiffres.c3')}</span></li>
      </ul>
      <p class="chiffres-source">${c.t('accueil.chiffres.source')}</p>
      <p>${c.lien('convictions', { classe: 'lien-fleche', texte: c.t('accueil.chiffres.lien') })}</p>
    </div>
    ${c.media({ nom: 'chaux-chanvre', alt: alt('chaux-chanvre'), classe: 'chiffres-media', ratio: '3 / 4', sizes: '(max-width: 760px) 100vw, 36vw', attrs: 'data-fx="parallaxe"' })}
  </div>
</section>

<section class="zone" id="zone">
  ${c.media({ nom: 'grok/bocage-matin', alt: '', classe: 'zone-fond', sizes: '100vw', attrs: 'data-fx="parallaxe" data-fx-force="8"' })}
  <div class="conteneur zone-carte-boite">
    <div class="zone-texte">
      <p class="surtitre" data-anime>${c.t('accueil.zone.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('accueil.zone.titre')}</h2>
      <p data-anime>${c.t('accueil.zone.texte')}</p>
      <p class="zone-info" aria-live="polite"><strong data-zone-nom>Quimper</strong><span data-zone-detail>${c.t('accueil.zone.aucun')}</span></p>
      <ul class="zone-communes" data-anime="cascade">${communesSvg(c).liste}</ul>
      <p class="zone-indice"><span class="indice-souris">${c.t('accueil.zone.indice')}</span><span class="indice-tactile">${c.t('accueil.zone.indiceTactile')}</span></p>
    </div>
    <figure class="zone-carte" data-visuel role="img" aria-label="${c.s('accueil.zone.region')}">
      ${communesSvg(c).svg}
      <figcaption>${c.t('accueil.zone.note')}</figcaption>
    </figure>
  </div>
</section>

<section class="temoignage" id="temoignage">
  <div class="conteneur temoignage-grille">
    <div class="temoignage-visuel" data-visuel data-anime aria-hidden="true"><span>«</span></div>
    <figure class="temoignage-citation">
      <p class="surtitre">${c.t('accueil.temoignage.surtitre')}</p>
      <blockquote data-anime="mots"><p>${c.t('accueil.temoignage.citation')}</p></blockquote>
      <figcaption><strong>${c.t('accueil.temoignage.auteur')}</strong><span>${c.t('accueil.temoignage.complement')}</span></figcaption>
    </figure>
  </div>
</section>

<section class="fin" id="fin">
  <div class="conteneur fin-grille">
    <div class="fin-texte">
      <h2 class="titre-ombre" data-texte="${c.s('accueil.fin.titre')}" data-effet="ombre-portee" data-anime>${c.t('accueil.fin.titre')}</h2>
      <p data-anime>${c.t('accueil.fin.texte')}</p>
      <p class="fin-actions" data-anime>
        ${c.lien('contact', { ancre: 'rendez-vous', classe: 'bouton bouton--soleil', texte: c.t('accueil.fin.action'), attrs: 'data-survol="magnetique"' })}
        <a class="bouton bouton--contour" href="tel:${c.site.contact.telephoneLien}">${c.t('accueil.fin.appeler')}</a>
      </p>
    </div>
    ${c.media({ nom: 'chemin-mer', alt: c.donnees.images.images['chemin-mer'].alt, classe: 'fin-media', ratio: '4 / 5', sizes: '(max-width: 760px) 100vw, 38vw', attrs: 'data-anime="rideau"' })}
  </div>
</section>
`;
};
