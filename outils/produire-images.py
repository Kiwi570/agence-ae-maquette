#!/usr/bin/env python3
"""Repli local du pipeline d'images de la bibliothèque (produire.mjs) : recadrage autour du sujet (cadrage
d'analyse.json, ou du plan), variantes WebP du socle (<nom>-<largeur>.webp, <nom>-mobile-<largeur>.webp),
images de galerie de projet sans recadrage (projets/<id>-<k>-<largeur>.webp), jamais d'agrandissement
au-delà de 1,5 fois. Écrit donnees/images.json (alt, cadrage, dimensions) et liste les « A REGARDER ».
Usage : python3 -I outils/produire-images.py   (depuis la racine du projet)"""
import json, os, sys
from PIL import Image, ImageOps

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECU = os.path.join(RACINE, 'recu')
SORTIE = os.path.join(RACINE, 'assets', 'images')
plan = json.load(open(os.path.join(RACINE, 'plan-images.json')))
analyse = {}
try:
    for x in json.load(open(os.path.join(RECU, 'site', 'analyse.json')))['images']:
        analyse[x['fichier']] = x
except FileNotFoundError:
    pass
regarder, erreurs = [], []


def ratio(r):
    a, b = r.split(':')
    return float(a) / float(b)


def ouvrir(chemin):
    im = Image.open(chemin)
    im = ImageOps.exif_transpose(im)
    return im.convert('RGB')


def cadrage_de(source, defaut):
    if defaut:
        return defaut
    a = analyse.get(os.path.basename(source))
    return a['cadrage'] if a and a.get('cadrage') else [50, 50]


def recadrer(im, r, cad):
    w, h = im.size
    if w / h > r:
        cw, ch = h * r, h
    else:
        cw, ch = w, w / r
    cx, cy = w * cad[0] / 100, h * cad[1] / 100
    x0 = min(max(cx - cw / 2, 0), w - cw)
    y0 = min(max(cy - ch / 2, 0), h - ch)
    return im.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch)))


def ecrire(im, chemin, largeur, nom):
    w, h = im.size
    if largeur > w * 1.5:
        return None
    if largeur > w:
        regarder.append(f'{nom} : agrandi {largeur / w:.2f} fois ({w} px de source)')
    out = im.resize((largeur, round(largeur * h / w)), Image.LANCZOS)
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    q = 80
    while True:
        out.save(chemin, 'WEBP', quality=q, method=5)
        if os.path.getsize(chemin) <= 300_000 or q <= 50:
            break
        q -= 8
    return out.size


images = {}
for e in plan['fixes']:
    src = os.path.join(RECU, e['source'])
    if not os.path.exists(src):
        erreurs.append(f"source introuvable : {e['source']}")
        continue
    im = ouvrir(src)
    cad = cadrage_de(e['source'], e.get('cadrage'))
    rec = recadrer(im, ratio(e['ratio']), cad)
    faites = []
    for L in e['largeurs']:
        d = ecrire(rec, os.path.join(SORTIE, f"{e['nom']}-{L}.webp"), L, e['nom'])
        if d:
            faites.append(L)
    if not faites:
        erreurs.append(f"{e['nom']} : source trop petite")
    m = e.get('mobile')
    if m:
        ims = ouvrir(os.path.join(RECU, m['source']))
        recm = recadrer(ims, ratio(m['ratio']), cadrage_de(m['source'], m.get('cadrage')))
        for L in m['largeurs']:
            ecrire(recm, os.path.join(SORTIE, f"{e['nom']}-mobile-{L}.webp"), L, e['nom'] + ' (mobile)')
    images[e['nom']] = {'alt': e.get('alt', ''), 'cadrage': '50% 50%', 'largeurs': faites, 'ratio': e['ratio']}

projets = {}
for pid, p in plan['projets'].items():
    carte_src = os.path.join(RECU, 'site', p['carte'])
    if not os.path.exists(carte_src):
        erreurs.append(f'{pid} : carte introuvable {p["carte"]}')
        continue
    rec = recadrer(ouvrir(carte_src), 4 / 3, cadrage_de(p['carte'], None))
    for L in (480, 800):
        ecrire(rec, os.path.join(SORTIE, 'projets', f'{pid}-carte-{L}.webp'), L, pid + ' carte')
    galerie = []
    for k, f in enumerate(p['galerie'], 1):
        s = os.path.join(RECU, 'site', f)
        if not os.path.exists(s):
            erreurs.append(f'{pid} : galerie introuvable {f}')
            continue
        im = ouvrir(s)
        w, h = im.size
        base = os.path.join(SORTIE, 'projets', f'{pid}-{k}')
        tailles = []
        for L in (640, 1280):
            lw = L if w >= h else round(L * w / h)
            d = ecrire(im, f'{base}-{L}.webp', lw, f'{pid}-{k}')
            if d:
                tailles.append(L)
                dims = d
        if tailles:
            galerie.append({'k': k, 'largeurs': tailles, 'l': dims[0], 'h': dims[1]})
    projets[pid] = galerie

json.dump({'images': images, 'projets': projets}, open(os.path.join(RACINE, 'donnees', 'images.json'), 'w'), ensure_ascii=False, indent=1)
print('OK :', len(images), 'images fixes,', sum(len(g) for g in projets.values()), 'photos de projets')
for r in regarder:
    print('A REGARDER :', r)
for e in erreurs:
    print('ERREUR :', e)
sys.exit(1 if erreurs else 0)
