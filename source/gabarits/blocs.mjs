/* Blocs partagés entre les pages : projets par famille, carte schématique de la zone, carte de projet. */
import { html, brut } from '../../outils/gabarit.mjs';

export const projetsDe = (c, famille) => c.donnees.projets.filter((p) => !famille || p.categorie === famille);

/* Carte schématique : projection simple (longitude, latitude corrigée du cosinus de 48°). */
const LON0 = -4.78, LON1 = -3.45, LAT0 = 48.08, LAT1 = 47.74, W = 800;
const K = W / (LON1 - LON0), H = Math.round((LAT0 - LAT1) * K * 1.494);
const px = (lon, lat) => [Math.round((lon - LON0) * K), Math.round((LAT0 - lat) * K * 1.494)];
/* Trait de côte simplifié, d'ouest en est (repères connus du littoral : Raz, baie d'Audierne, Penmarc'h,
   Loctudy, Odet, Beg Meil, Concarneau, Trévignon, Aven, Laïta). Schématique, pas un relevé. */
const COTE = [[-4.75, 48.04], [-4.66, 48.03], [-4.56, 48.015], [-4.5, 48.0], [-4.44, 47.975], [-4.405, 47.935], [-4.375, 47.885], [-4.355, 47.845], [-4.37, 47.81], [-4.345, 47.795],
  [-4.28, 47.792], [-4.22, 47.795], [-4.18, 47.81], [-4.165, 47.83], [-4.155, 47.848], [-4.125, 47.862], [-4.108, 47.868], [-4.08, 47.862], [-4.04, 47.85], [-3.99, 47.852], [-3.975, 47.87],
  [-3.99, 47.885], [-3.975, 47.9], [-3.94, 47.885], [-3.915, 47.868], [-3.89, 47.845], [-3.86, 47.81], [-3.85, 47.79], [-3.8, 47.788], [-3.75, 47.797], [-3.715, 47.795], [-3.68, 47.79],
  [-3.62, 47.78], [-3.56, 47.765], [-3.5, 47.77], [-3.45, 47.765]];

export function communesSvg(c) {
  const parCommune = {};
  c.donnees.projets.forEach((p) => { const n = p.commune.split(' · ')[0]; parCommune[n] = (parCommune[n] || 0) + 1; });
  const pts = COTE.map(([lo, la]) => px(lo, la));
  const ligne = 'M' + pts.map((p) => p.join(' ')).join(' L');
  const terre = ligne + ` L ${W} ${pts[pts.length - 1][1]} L ${W} 0 L 0 0 L 0 ${pts[0][1]} Z`;
  const communes = c.donnees.communes.map((m) => ({ ...m, xy: px(m.lon, m.lat), n: parCommune[m.nom] || 0 }));
  const detail = (m) => (m.n ? c.s(m.n > 1 ? 'accueil.zone.projets' : 'accueil.zone.projet', { n: m.n }) : c.s('accueil.zone.aucun'));
  const svg = html`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true" data-fx="trace">
  <path class="carte-terre" d="${brut(terre)}"/>
  <path class="carte-cote" d="${brut(ligne)}" data-fx-trait/>
  ${communes.map((m, i) => { const [x, y] = m.xy; const gauche = x > 650; return html`<g class="carte-commune${m.zone ? ' est-zone' : ''}${m.agence ? ' est-agence' : ''}" data-commune="${m.nom}" style="--i:${i}" transform="translate(${x} ${y})">
    <circle r="${m.agence ? 9 : m.zone ? 6 : 4.5}"/>${m.agence ? brut('<circle class="carte-agence-halo" r="18" data-effet="carte-zone"/>') : ''}
    ${m.discret ? '' : html`<text x="${gauche ? -10 : 10}" y="${m.nom === 'Loctudy' ? 14 : -8}"${gauche ? brut(' text-anchor="end"') : ''}>${m.nom}</text>`}
  </g>`; })}
  <text class="carte-mer" x="${W * 0.36}" y="${H - 22}">Océan Atlantique</text>
</svg>`;
  const liste = communes.filter((m) => m.zone).map((m) => html`<li><button type="button" class="puce" data-commune-bouton="${m.nom}" data-detail="${detail(m)}" aria-pressed="false">${m.nom}</button></li>`);
  return { svg, liste };
}

/* Carte de projet (page Réalisations). */
export function carte(c, p, i) {
  const types = { neuf: c.s('realisations.neuf'), renovation: c.s('realisations.renovation'), pro: c.s('realisations.pro') };
  const g = c.donnees.images.projets[p.id] || [];
  return html`<li class="real-carte" data-famille="${p.categorie}" id="projet-${p.id}" style="--i:${i}">
  <a href="#projet-${p.id}" class="real-lien" data-projet="${p.id}" data-sans-transition aria-haspopup="dialog">
    <figure class="media real-media" style="--cadrage:50% 50%">
      <picture><img src="/assets/images/projets/${p.id}-carte-800.webp" srcset="/assets/images/projets/${p.id}-carte-480.webp 480w, /assets/images/projets/${p.id}-carte-800.webp 800w" sizes="(max-width: 760px) 92vw, (max-width: 1100px) 45vw, 30vw" alt="" width="800" height="600" loading="lazy" decoding="async"></picture>
      <span class="ombre-passe" data-effet="ombre-qui-passe" aria-hidden="true"></span>
    </figure>
    <span class="real-texte"><span class="real-type">${types[p.categorie]}</span><strong>${p.titre}</strong><span>${p.sous} · ${p.commune}</span><span class="real-photos">${c.t(g.length > 1 ? 'realisations.photos' : 'realisations.photo', { n: g.length })}</span></span>
  </a>
</li>`;
}
