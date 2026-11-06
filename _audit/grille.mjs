/* Grille wouahou (partie 2 de la skill) : ce qui se vérifie sans juger le goût.
   Chaque point du plan d'animation pose sa marque sur l'élément qui le réalise (plusieurs points sur un même
   élément : data-grille="fil typo") :
     1. data-grille="manipuler"  objet que le visiteur attrape, fait tourner ou glisser (au doigt aussi), sur l'accueil
     2. data-iris-centre          objet d'ouverture de chaque page (une seule fois), et versObjet(…) dans assets/js
     3. data-forme sur le voile   forme du voile autre que « glisse » (donnees/site.json : formeVoile),
                                  ou data-grille="voile" sur une transition propre au projet
     4. data-grille="fil"         fil conducteur, sur chaque page
     5. data-grille="typo"        axe de police animé ou titre fabriqué par le métier, sur chaque page
     6. data-grille="scene"       scène épinglée qui est une mécanique du métier (une galerie générique est signalée)
     7. data-grille="retour"      retour physique de l'action principale (panier, réservation, envoi, filtre)
   Un point écarté exprès se déclare dans _audit/config.json : { "grille": { "dispenses": { "fil": "raison" } } } ;
   il est rappelé dans le rapport au lieu d'échouer. Le goût (l'objet est-il bien celui du métier ? l'effet est-il
   assez fort ?) reste au regard neuf, qui reçoit le tableau de la grille en tête du rapport. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listerFichiers } from './statique.mjs';

export const POINTS = [
  { cle: 'manipuler', nom: '1. L’effet signature se manipule' },
  { cle: 'intro', nom: '2. L’intro devient la page' },
  { cle: 'voile', nom: '3. La transition reprend le motif' },
  { cle: 'fil', nom: '4. Un fil conducteur traverse le site' },
  { cle: 'typo', nom: '5. La typographie bouge aussi' },
  { cle: 'scene', nom: '6. Les scènes épinglées sont des gestes du métier' },
  { cle: 'retour', nom: '7. L’action principale a un retour physique' },
];
const CLES = POINTS.map((p) => p.cle);

const compter = (h, re) => (h.match(re) || []).length;
const marque = (cle) => new RegExp(`data-grille=["'][^"']*\\b${cle}\\b[^"']*["']`, 'g');
const OBJET = /\sdata-iris-centre(?:=["'][^"']*["'])?(?=[\s>/])/g;

/**
 * @returns {{ tableau: {cle, nom, statut, detail}[], pagesContenu: string[] }}
 */
export function controlesGrille(racine, pagesRel, { rapport: R, config = {}, versUrl }) {
  const dispenses = (config.grille && config.grille.dispenses) || {};
  const inconnues = Object.keys(dispenses).filter((k) => !CLES.includes(k));
  if (inconnues.length) R.regarder('grille : dispense inconnue', `${inconnues.join(', ')} (clés possibles : ${CLES.join(', ')})`);
  const tableau = Object.fromEntries(POINTS.map((p) => [p.cle, { ...p, statut: '', detail: '' }]));
  const noter = (cle, statut, detail = '') => Object.assign(tableau[cle], { statut, detail });
  /* Manque : échec (ou à regarder), sauf dispense déclarée. */
  const manque = (cle, niveau, controle, detail, ctx) => {
    if (dispenses[cle]) return;
    R.ajouter(niveau, controle, detail, ctx);
  };

  /* Pages de la langue principale, hors 404 et pages légales (<main data-sans-effet>). */
  const pages = pagesRel
    .filter((rel) => !/(^|\/)404\.html$/.test(rel) && !/^[a-z]{2}\//.test(rel))
    .map((rel) => {
      const h = readFileSync(join(racine, rel), 'utf8');
      const main = (h.match(/<main\b[^>]*>/i) || [''])[0];
      return { rel, url: versUrl(rel) || '/', h, legale: /data-sans-effet/.test(main) };
    });
  const contenu = pages.filter((p) => !p.legale);
  const accueil = contenu.find((p) => p.url === '/') || contenu[0];
  if (!contenu.length) { R.nonLance('grille wouahou', 'aucune page de contenu trouvée'); return { tableau: Object.values(tableau), pagesContenu: [] }; }
  const avec = (cle) => contenu.filter((p) => compter(p.h, marque(cle)));
  const sans = (cle) => contenu.filter((p) => !compter(p.h, marque(cle)));
  const liste = (ps) => ps.map((p) => p.url).join(', ');

  /* 1. Effet signature qui se manipule, sur l'accueil. */
  if (accueil && compter(accueil.h, marque('manipuler'))) noter('manipuler', 'présent', `accueil${avec('manipuler').length > 1 ? ` et ${avec('manipuler').length - 1} autre(s) page(s)` : ''}`);
  else {
    noter('manipuler', 'absent', 'aucun data-grille="manipuler" sur l’accueil');
    manque('manipuler', 'echec', 'grille : effet signature qui ne se manipule pas (point 1)', 'aucun élément data-grille="manipuler" sur l’accueil : objet à attraper, faire tourner ou glisser (module objet-a-faire-tourner, lumiere-au-pointeur…)', { page: accueil ? accueil.url : '/' });
  }

  /* 2. Objet d'ouverture sur chaque page, et intro qui finit sur lui. */
  const sansObjet = [], plusieurs = [];
  for (const p of contenu) {
    const n = compter(p.h, OBJET);
    if (!n) sansObjet.push(p); else if (n > 1) plusieurs.push(p);
  }
  sansObjet.forEach((p) => manque('intro', 'echec', 'grille : objet d’ouverture absent (points 2 et 3)', 'aucun élément data-iris-centre : l’intro et le voile s’ouvrent alors depuis le centre de l’écran, pas depuis l’objet de la page', { page: p.url }));
  plusieurs.forEach((p) => R.echec('grille : plusieurs objets d’ouverture', `${compter(p.h, OBJET)} éléments data-iris-centre : un seul par page`, { page: p.url }));
  let js = '';
  try { js = listerFichiers(join(racine, 'assets/js'), (f) => /\.m?js$/.test(f), ['vendor', 'socle']).map((f) => readFileSync(f, 'utf8')).join('\n'); } catch {}
  const versObjet = /\bversObjet\s*\(/.test(js);
  if (!versObjet) manque('intro', 'echec', 'grille : l’intro ne finit pas sur la page (point 2)', 'versObjet(tl, …) absent de assets/js : l’intro doit finir sur l’objet d’ouverture (socle : import { versObjet } from \'./socle/index.js\')');
  if (!sansObjet.length && versObjet) noter('intro', 'présent', `objet d’ouverture sur ${contenu.length} page(s), versObjet dans l’intro`);
  else noter('intro', 'absent', [!versObjet && 'versObjet absent', sansObjet.length && `sans objet d’ouverture : ${liste(sansObjet)}`].filter(Boolean).join(' ; '));

  /* 3. Forme du voile. */
  const forme = ((accueil.h.match(/<div\s+data-voile\b[^>]*\sdata-forme=["']([^"']+)["']/i) || [])[1]) || 'glisse';
  const propre = pages.some((p) => compter(p.h, marque('voile')));
  if (forme !== 'glisse' || propre) noter('voile', 'présent', propre ? 'transition propre au projet (data-grille="voile")' : `voile en ${forme}`);
  else {
    noter('voile', 'à regarder', 'voile par défaut (glisse)');
    manque('voile', 'regarder', 'grille : voile par défaut (point 3)', 'formeVoile « glisse » : la grille demande la forme du monde du client (iris, vague, rideau dans le socle, ou une forme propre). Si la glisse est voulue (page qu’on tourne, store qui descend), le déclarer dans config.json (grille.dispenses.voile)');
  }

  /* 4. Fil conducteur, sur chaque page ; 5. typographie, sur chaque page. */
  for (const [cle, nom, aide] of [
    ['fil', 'fil conducteur absent (point 4)', 'élément du métier qui relie les sections au défilement (module fil-conducteur), marqué data-grille="fil"'],
    ['typo', 'typographie qui ne bouge pas (point 5)', 'axe de police animé ou titre fabriqué par le métier (modules axes-au-defilement, titre-cousu, texte-grave-en-direct), marqué data-grille="typo"'],
  ]) {
    const a = avec(cle), s = sans(cle);
    if (!a.length) {
      noter(cle, 'absent', 'sur aucune page');
      manque(cle, 'echec', `grille : ${nom}`, `sur aucune page : ${aide}`);
    } else if (s.length) {
      noter(cle, 'à regarder', `présent sur ${liste(a)} ; absent sur ${liste(s)}`);
      s.forEach((p) => manque(cle, 'regarder', `grille : ${nom}`, `absent de cette page : ${aide}`, { page: p.url }));
    } else noter(cle, 'présent', `sur les ${a.length} page(s)`);
  }

  /* 6. Scènes épinglées : une galerie générique est signalée quand rien ne dit que c'est le geste du métier. */
  const generiques = [];
  for (const p of contenu) {
    for (const m of p.h.matchAll(/<[a-z]+\b[^>]*(?:data-fx=["']galerie["']|data-module=["']galerie-horizontale-epinglee["'])[^>]*>/gi)) {
      if (!marque('scene').test(m[0])) generiques.push(p);
    }
  }
  const scenes = avec('scene');
  generiques.forEach((p) => manque('scene', 'regarder', 'grille : galerie horizontale générique (point 6)', 'le métier a-t-il son geste (feuilleter un bac, empiler des planches, tourner les pages, ouvrir un tiroir) ? Modules bac-a-feuilleter, planches-empilees ; si la rangée qui défile est le geste du métier, ajouter data-grille="scene"', { page: p.url }));
  if (generiques.length) noter('scene', 'à regarder', `galerie générique sur ${liste([...new Set(generiques)])}${scenes.length ? ` ; geste du métier sur ${liste(scenes)}` : ''}`);
  else if (scenes.length) noter('scene', 'présent', `geste du métier sur ${liste(scenes)}`);
  else noter('scene', 'sans objet', 'aucune scène épinglée marquée ni galerie générique');

  /* 7. Retour physique de l'action principale, au moins une fois sur le site. */
  const retours = avec('retour');
  if (retours.length) noter('retour', 'présent', `sur ${liste(retours)}`);
  else {
    noter('retour', 'absent', 'sur aucune page');
    manque('retour', 'echec', 'grille : action principale sans retour physique (point 7)', 'ajout au panier, réservation, envoi ou filtre : quelque chose de l’objet part, se pose ou se transforme (module envol-vers-le-panier, tampon « reçu »), marqué data-grille="retour"');
  }

  /* Dispenses déclarées : rappelées, jamais silencieuses. */
  for (const [cle, raison] of Object.entries(dispenses)) {
    if (!tableau[cle]) continue;
    if (tableau[cle].statut !== 'présent') noter(cle, 'dispensé', String(raison || 'sans raison donnée'));
    R.info(`Grille wouahou : point « ${tableau[cle].nom} » dispensé (config.json) : ${raison || 'sans raison donnée'}.`);
  }
  for (const k of CLES) if (tableau[k].statut === 'présent' || tableau[k].statut === 'sans objet' || tableau[k].statut === 'dispensé') R.ok('grille wouahou');
  return { tableau: Object.values(tableau), pagesContenu: contenu.map((p) => p.url) };
}
