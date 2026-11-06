/* Parcours propres à la maquette Agence AE : filtres et cadran des réalisations, visionneuse (lien propre,
   Échap, retour du focus), rendez-vous en cinq étapes (champs requis, préremplissage, tampon « Reçu », pas de double envoi). */
export default async function ({ contexte, attendrePret, attendre, BASE, R, T }) {
  const { ctx, page } = await contexte({ taille: T('1366×768') });
  try {
    await page.goto(BASE + '/realisations', { waitUntil: 'load' });
    await attendrePret(page);
    await page.click('[data-famille-bouton="renovation"]');
    await attendre(900);
    const r = await page.evaluate(() => ({ n: [...document.querySelectorAll('.real-carte')].filter((c) => !c.classList.contains('est-cachee')).length, url: location.search, compte: document.querySelector('[data-real-compte]').textContent }));
    if (r.n !== 8) R.echec('filtres', `Rénovation : ${r.n} projets affichés au lieu de 8`, { page: '/realisations' });
    if (!/famille=renovation/.test(r.url)) R.echec('filtres', 'le filtre n’est pas gardé dans l’adresse', { page: '/realisations' });
    if (!/8/.test(r.compte)) R.echec('filtres', `compteur « ${r.compte} » faux`, { page: '/realisations' });
    await page.goto(BASE + '/realisations?famille=pro', { waitUntil: 'load' });
    await attendrePret(page);
    await attendre(600);
    const n2 = await page.evaluate(() => [...document.querySelectorAll('.real-carte')].filter((c) => !c.classList.contains('est-cachee')).length);
    if (n2 !== 5) R.echec('filtres', `lien profond ?famille=pro : ${n2} projets au lieu de 5`, { page: '/realisations' });
    await page.goto(BASE + '/realisations#projet-remise-pigeonnier-treguennec', { waitUntil: 'load' });
    await attendrePret(page);
    await attendre(900);
    const ouvert = await page.evaluate(() => ({ o: document.querySelector('.visionneuse').open, t: document.querySelector('.vis-titre').textContent, img: document.querySelector('.vis-img').complete && document.querySelector('.vis-img').naturalWidth > 0 }));
    if (!ouvert.o) R.echec('visionneuse', 'le lien #projet-… n’ouvre pas la visionneuse', { page: '/realisations' });
    else {
      if (!/remise/i.test(ouvert.t)) R.echec('visionneuse', `titre inattendu : ${ouvert.t}`, { page: '/realisations' });
      if (!ouvert.img) R.echec('visionneuse', 'photo non chargée', { page: '/realisations' });
      await page.keyboard.press('ArrowRight'); await attendre(300);
      const pos = await page.textContent('.vis-pos');
      if (!/^2 \//.test(pos.trim())) R.echec('visionneuse', `flèche droite : position « ${pos} »`, { page: '/realisations' });
      await page.keyboard.press('Escape'); await attendre(400);
      if (await page.evaluate(() => document.querySelector('.visionneuse').open)) R.echec('visionneuse', 'Échap ne ferme pas', { page: '/realisations' });
    }
    await page.click('.real-carte:not(.est-cachee) .real-lien');
    await attendre(500);
    await page.keyboard.press('Escape'); await attendre(400);
    const focus = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('real-lien'));
    if (!focus) R.regarder('visionneuse', 'le focus ne revient pas sur la carte après fermeture', { page: '/realisations' });

    await page.goto(BASE + '/contact?projet=conseil', { waitUntil: 'load' });
    await attendrePret(page);
    if (!(await page.evaluate(() => document.querySelector('[name="projet"][value="conseil"]').checked))) R.echec('rendez-vous', '?projet=conseil ne présélectionne pas la visite conseil', { page: '/contact' });
    await page.click('[data-suivant]'); await attendre(300);
    await page.click('[data-suivant]'); await attendre(300);
    if (await page.evaluate(() => document.querySelector('[data-etape="3"]').hidden === false)) R.echec('rendez-vous', 'étape 2 franchie sans commune', { page: '/contact' });
    await page.fill('#f-commune', 'Quimper'); await page.click('[data-suivant]'); await attendre(300);
    await page.click('[data-suivant]'); await attendre(300);
    await page.fill('#f-nom', 'Essai Audit'); await page.fill('#f-email', 'essai@exemple.fr');
    await page.click('[data-suivant]'); await attendre(400);
    const recap = await page.textContent('[data-recap] dl');
    if (!/Quimper/.test(recap) || !/Visite conseil/.test(recap)) R.echec('rendez-vous', 'récapitulatif incomplet', { page: '/contact' });
    await page.click('[data-envoyer]');
    await page.click('[data-envoyer]', { force: true, timeout: 1000 }).catch(() => {});
    await attendre(1400);
    const fin = await page.evaluate(() => ({ recu: document.querySelector('[data-recap]').classList.contains('est-recu'), off: document.querySelector('[data-envoyer]').disabled, msg: !document.querySelector('[data-message-envoi]').hidden }));
    if (!fin.recu) R.echec('rendez-vous', 'le tampon « Reçu » ne se pose pas', { page: '/contact' });
    if (!fin.off) R.echec('rendez-vous', 'double envoi possible', { page: '/contact' });
    if (!fin.msg) R.echec('rendez-vous', 'message « simulé » absent', { page: '/contact' });
  } finally { await ctx.close(); }
}
