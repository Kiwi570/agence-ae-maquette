/* Contact · ouverture compacte : le numéro en très grand, un petit soleil rond (objet d'ouverture), la côte en bandeau.
   Puis le premier rendez-vous en cinq étapes (prérempli par ?projet=), qui se tamponne « Reçu » à l'envoi
   (data-grille="retour"), et l'accès schématique au Prieuré. */
import { html, brut } from '../../outils/gabarit.mjs';

export const page = { cle: 'contact', fichier: 'contact', imagePartage: 'grok/contact-cote-1280.webp' };

export default (c) => {
  const f = (k) => c.t(`contact.form.${k}`);
  const tel = c.site.contact.telephone;
  const types = ['neuf', 'extension', 'renovation', 'pro', 'conseil'];
  return html`
<section class="contact-tete" id="debut">
  <div class="conteneur contact-tete-grille">
    <div>
      <p class="surtitre" data-anime="gsap" data-ouv>${c.t('contact.surtitre')}</p>
      <h1 class="titre-ombre contact-titre" data-texte="${c.s('contact.titre')}" data-grille="typo" data-effet="ombre-portee"><span class="ligne-masque"><span class="ouv-ligne" data-anime="gsap">${c.t('contact.titre')}</span></span></h1>
      <p class="contact-info" data-anime="gsap" data-ouv data-info-cle><span class="pastille-soleil" aria-hidden="true"></span>${c.t('contact.info')}</p>
    </div>
    <div class="contact-numero-boite">
      <span class="contact-soleil" data-iris-centre="disque" aria-hidden="true"></span>
      <a class="contact-numero" href="tel:${c.site.contact.telephoneLien}" data-effet="numero-trace" aria-label="${c.s('contact.telephone')} ${tel}">${[...tel].map((ch, i) => (ch === ' ' ? html`<span class="num-esp"> </span>` : html`<span class="num-c" style="--i:${i}">${ch}</span>`))}</a>
      <p class="contact-coord" data-anime="gsap" data-ouv><a href="mailto:${c.site.contact.email}">${c.site.contact.email}</a><span>${c.site.contact.adresse}</span></p>
      <p data-anime="gsap" data-ouv><a class="bouton" href="#rendez-vous" data-action-principale data-sans-transition>${f('titre')}</a></p>
    </div>
  </div>
  ${c.media({ nom: 'grok/contact-cote', alt: c.donnees.images.images['grok/contact-cote'].alt, priorite: true, classe: 'contact-bandeau', sizes: '100vw', attrs: 'data-fx="parallaxe" data-fx-force="8"' })}
</section>

<section class="rdv" id="rendez-vous">
  <div class="conteneur rdv-grille">
    <div class="rdv-tete">
      <p class="surtitre" data-anime>${f('surtitre')}</p>
      <h2 data-anime="lignes">${f('titre')}</h2>
      <p data-anime>${f('texte')}</p>
      ${c.media({ nom: 'grok/atelier-table', alt: c.donnees.images.images['grok/atelier-table'].alt, classe: 'rdv-media', ratio: '3 / 2', sizes: '(max-width: 760px) 100vw, 30vw', attrs: 'data-fx="zoom"' })}
      <ol class="rdv-etapes" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => html`<li data-pastille="${n}"${n === 1 ? ' class="est-active"' : ''}><span>${n}</span>${f(`e${n}`)}</li>`)}</ol>
    </div>
    <form class="rdv-form" data-formulaire novalidate>
      <p class="rdv-progression" aria-live="polite" data-progression>${c.t('contact.form.etapes', { n: 1 })}</p>
      <fieldset class="rdv-etape est-active" data-etape="1">
        <legend>${f('type')}</legend>
        <div class="rdv-cartes">${types.map((t, i) => html`<label class="rdv-carte"><input type="radio" name="projet" value="${t}"${i === 0 ? ' checked' : ''} required><span>${f(t)}</span></label>`)}</div>
      </fieldset>
      <fieldset class="rdv-etape" data-etape="2" hidden>
        <legend>${f('e2')}</legend>
        <div class="champ"><label for="f-commune">${f('commune')}</label><input id="f-commune" name="commune" autocomplete="address-level2" placeholder="${c.s('contact.form.communeAide')}" required></div>
        <p class="champ-legende">${f('terrain')}</p>
        <div class="rdv-cartes rdv-cartes--petites"><label class="rdv-carte"><input type="radio" name="terrain" value="oui" checked><span>${f('oui')}</span></label><label class="rdv-carte"><input type="radio" name="terrain" value="non"><span>${f('non')}</span></label></div>
      </fieldset>
      <fieldset class="rdv-etape" data-etape="3" hidden>
        <legend>${f('e3')}</legend>
        <div class="champ"><label for="f-budget">${f('budget')}</label><input id="f-budget" name="budget" inputmode="numeric"></div>
        <div class="champ"><label for="f-delai">${f('delai')}</label><input id="f-delai" name="delai"></div>
        <label class="rdv-case"><input type="checkbox" name="plans" value="oui"> <span>${f('plans')}</span></label>
        <div class="champ"><label for="f-message">${f('message')}</label><textarea id="f-message" name="message" rows="4"></textarea></div>
      </fieldset>
      <fieldset class="rdv-etape" data-etape="4" hidden>
        <legend>${f('e4')}</legend>
        <div class="champ"><label for="f-nom">${f('nom')}</label><input id="f-nom" name="nom" autocomplete="name" required></div>
        <div class="champ"><label for="f-email">${f('email')}</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
        <div class="champ"><label for="f-tel">${f('tel')}</label><input id="f-tel" name="tel" type="tel" autocomplete="tel"></div>
        <p class="mention-donnees">${f('donnees')}</p>
      </fieldset>
      <fieldset class="rdv-etape" data-etape="5" hidden>
        <legend>${f('e5')}</legend>
        <div class="rdv-recap" data-recap data-effet="tampon-recu">
          <dl></dl>
          <div class="tampon" aria-hidden="true"><span class="voile-ae"></span><strong>${f('recu')}</strong></div>
          <span class="rdv-soleil-volant" aria-hidden="true"></span>
        </div>
      </fieldset>
      <div class="rdv-boutons">
        <button type="button" class="bouton bouton--contour" data-precedent hidden>${f('precedent')}</button>
        <button type="button" class="bouton" data-suivant>${f('suivant')}</button>
        <button type="submit" class="bouton bouton--soleil" data-envoyer data-grille="retour" hidden>${f('envoyer')}</button>
      </div>
      <p data-message-envoi data-texte="${c.s('contact.form.simule')} ${c.s('contact.form.recuTexte')}" role="status" tabindex="-1" hidden></p>
    </form>
  </div>
</section>
<script type="application/json" id="textes-rdv">${brut(JSON.stringify({ etapes: c.s('contact.form.etapes'), vide: c.s('contact.form.vide'), types: Object.fromEntries(types.map((t) => [t, c.s(`contact.form.${t}`)])), labels: { projet: c.s('contact.form.type'), commune: c.s('contact.form.commune'), terrain: c.s('contact.form.terrain'), budget: c.s('contact.form.budget'), delai: c.s('contact.form.delai'), plans: c.s('contact.form.plans'), message: c.s('contact.form.message'), nom: c.s('contact.form.nom'), email: c.s('contact.form.email'), tel: c.s('contact.form.tel') }, oui: c.s('contact.form.oui'), non: c.s('contact.form.non') }).replace(/</g, '\\u003c'))}</script>

<section class="acces" id="acces">
  <div class="conteneur acces-grille">
    <div>
      <p class="surtitre" data-anime>${c.t('contact.acces.surtitre')}</p>
      <h2 data-anime="lignes">${c.t('contact.acces.titre')}</h2>
      <p data-anime>${c.t('contact.acces.texte')}</p>
      <dl class="acces-coord" data-anime="cascade">
        <div><dt>${c.t('contact.telephone')}</dt><dd><a href="tel:${c.site.contact.telephoneLien}">${tel}</a></dd></div>
        <div><dt>${c.t('contact.email')}</dt><dd><a href="mailto:${c.site.contact.email}">${c.site.contact.email}</a></dd></div>
        <div><dt>${c.t('contact.adresse')}</dt><dd>${c.site.contact.adresse}</dd></div>
        <div><dt>${c.t('contact.horairesLabel')}</dt><dd>${c.t('contact.horaires')}</dd></div>
        <div><dt>${c.t('contact.reseaux')}</dt><dd><a href="${c.site.contact.instagram}" target="_blank" rel="noopener">Instagram</a> · <a href="${c.site.contact.facebook}" target="_blank" rel="noopener">Facebook</a></dd></div>
      </dl>
    </div>
    <figure class="acces-plan" data-visuel data-effet="plan-acces" role="img" aria-label="${c.s('contact.acces.region')}">
      <svg viewBox="0 0 600 420" aria-hidden="true" data-fx="trace">
        <rect class="plan-fond" width="600" height="420" rx="18"/>
        <path class="plan-riviere" d="M-10 300 C 120 280, 200 330, 300 300 S 480 250, 610 280" data-fx-trait/>
        <path class="plan-rue" d="M40 60 L560 120 M90 400 L250 20 M330 410 L420 10 M20 220 L590 200"/>
        <g class="plan-prieure" transform="translate(300 175)"><rect x="-38" y="-26" width="76" height="52" rx="6"/><circle class="plan-repere" r="12" cx="0" cy="-48"/></g>
        <text class="plan-texte" x="300" y="245" text-anchor="middle">Le Prieuré</text>
              </svg>
      <figcaption>${c.t('contact.acces.note')}</figcaption>
    </figure>
  </div>
</section>
`;
};
