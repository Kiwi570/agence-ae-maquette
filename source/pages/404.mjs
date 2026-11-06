/* Page 404 : le cadran solaire ne trouve pas la page. Objet d'ouverture : le cadran (pastille ronde). */
import { html } from '../../outils/gabarit.mjs';

export const page = { cle: '404', fichier: '404', langues: ['fr'], partage: false };

export default (c) => html`
<section class="introuvable" id="debut">
  ${c.media({ nom: 'grok/404-cadran', alt: c.donnees.images.images['grok/404-cadran'].alt, priorite: true, classe: 'introuvable-media', cadrage: '30% 50%', sizes: '100vw', attrs: 'data-fx="parallaxe" data-fx-force="6"' })}
  <div class="conteneur introuvable-texte">
    <span class="introuvable-disque" data-iris-centre="disque" aria-hidden="true">404</span>
    <h1 class="titre-ombre" data-texte="${c.s('introuvable.titre')}" data-grille="typo" data-effet="ombre-portee" data-anime>${c.t('introuvable.titre')}</h1>
    <p data-anime>${c.t('introuvable.texte')}</p>
    <p data-anime>${c.lien('accueil', { classe: 'bouton bouton--soleil', texte: c.t('introuvable.retour'), attrs: 'data-action-principale' })}</p>
    <p class="introuvable-info" data-info-cle>${c.site.contact.telephone}</p>
  </div>
</section>
`;
