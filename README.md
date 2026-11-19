# J'serai — plateforme d'affiche personnalisable

Les visiteurs ouvrent le lien, ajoutent **leur photo** sur l'affiche J'serai, puis la **téléchargent** ou la **partagent** (WhatsApp, Facebook, etc.).
Tout se passe dans leur navigateur : aucune photo n'est envoyée sur un serveur. Le site est 100 % statique (HTML, CSS, JavaScript), donc gratuit sur GitHub Pages.

## Contenu du dossier

```
index.html        la page
css/style.css     l'apparence
js/config.js      ★ RÉGLAGES DE L'AFFICHE (le seul fichier à modifier)
js/app.js         le fonctionnement (à ne pas toucher)
assets/affiche.png  ★ votre affiche exportée de Photoshop (remplace la démo)
LANCER-EN-LOCAL.bat  démarre le site sur votre PC pour le tester (Windows)
.nojekyll         nécessaire pour GitHub Pages
```

## 1. Préparer l'affiche dans Photoshop

Choisissez l'une des deux méthodes.

**Méthode A — la photo passe derrière (recommandée).** Votre affiche contient un trou transparent à l'endroit de la photo (cercle, carré ou autre).
Exportez en **PNG avec transparence** (Fichier → Exporter → Exporter sous… → PNG, cocher « Transparence »). Dans `config.js`, gardez `position: "dessous"`.

**Méthode B — la photo passe devant.** Votre affiche est complète, sans trou. Exportez un PNG normal. Dans `config.js`, mettez `position: "dessus"`.

Conseils : format portrait **1080 × 1350 px** (idéal pour les réseaux sociaux), ou 2160 × 2700 px pour plus de finesse. Enregistrez le fichier sous le nom `affiche.png` dans le dossier `assets` (il remplace la démo).

## 2. Régler la position de la photo

Les positions s'expriment en **pourcentages de l'affiche** : `x: 0.5` = au milieu, `y: 0.8` = à 80 % de la hauteur.

Méthode simple : ouvrez la page avec `?reglage` à la fin de l'adresse (par exemple `http://localhost/jserai/index.html?reglage`).
La zone photo actuelle s'affiche en rouge, et **cliquer sur l'affiche indique les coordonnées** `x` et `y` du point cliqué. Notez le coin en haut à gauche de la fenêtre photo et son coin en bas à droite, puis calculez :

- `x` et `y` = coin haut gauche · `w` = x(coin bas droit) − x · `h` = y(coin bas droit) − y.

Reportez ces valeurs dans le bloc `photo` de `js/config.js`. Vous pouvez aussi y changer la forme (`cercle`, `arrondi`, `rect`), les messages et la couleur des boutons.

## 3. Tester sur votre ordinateur (avant la mise en ligne)

**Important :** ne double-cliquez pas sur `index.html`. Ouverte ainsi, la page s'affiche, mais le navigateur **bloque le téléchargement** de l'image (règle de sécurité des fichiers locaux). Un encadré jaune vous le rappelle.
Passez plutôt par l'une de ces deux méthodes :

1. **Avec WAMP (le plus simple pour vous).** Copiez le dossier `jserai` dans `www`, démarrez WAMP, puis ouvrez `http://localhost/jserai/`.
2. **Avec le lanceur.** Double-cliquez sur `LANCER-EN-LOCAL.bat` : il démarre un petit serveur et ouvre `http://localhost:8000`. Il utilise Python s'il est installé, sinon le PHP de WAMP. Laissez la fenêtre noire ouverte pendant vos essais ; fermez-la pour arrêter.

Test complet : choisissez une photo, déplacez-la, cliquez sur **Télécharger mon affiche** : un fichier `jserai-affiche.png` arrive dans votre dossier Téléchargements.

## 4. Mettre en ligne sur GitHub Pages (gratuit)

1. Créez un compte sur github.com, puis cliquez sur **New repository**. Nom : par exemple `jserai`. Choisissez **Public**, puis **Create repository**.
2. Cliquez sur **uploading an existing file**, glissez **tout le contenu du dossier** (y compris `.nojekyll`, `css`, `js`, `assets`), puis **Commit changes**.
3. Allez dans **Settings → Pages**. Sous « Build and deployment », choisissez **Deploy from a branch**, la branche **main** et le dossier **/ (root)**, puis **Save**.
4. Après 1 à 2 minutes, votre lien est affiché : `https://VOTRE-NOM.github.io/jserai/`. C'est ce lien que vous partagez.

Pour modifier plus tard : remplacez un fichier dans le dépôt (**Add file → Upload files**, ou l'icône crayon). Le site se met à jour en quelques minutes.

## 5. Aperçu propre quand on partage le lien

Pour que WhatsApp et Facebook affichent l'affiche en vignette, ouvrez `index.html` et remplacez la ligne `og:image` par l'adresse complète :

`<meta property="og:image" content="https://VOTRE-NOM.github.io/jserai/assets/affiche.png">`

(Les réseaux sociaux gardent parfois l'ancien aperçu en mémoire pendant quelques heures.)

## Remarques

- Les photos HEIC d'iPhone sont converties par le navigateur ; si une photo est refusée, une photo JPG ou PNG fonctionne toujours.
- Sur ordinateur, « Partager » télécharge l'image puis ouvre WhatsApp ; sur téléphone, il ouvre directement le menu de partage avec l'image jointe. Le partage direct de l'image ne fonctionne que sur la version en ligne (adresse https) ou sur localhost.
- Le dépôt GitHub étant public, ne mettez dans `assets` que des images que vous êtes prêt à rendre publiques.
