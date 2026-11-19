/* J'serai — personnalisation de l'affiche dans le navigateur.
   Rien n'est envoyé à un serveur : tout se passe sur l'appareil du visiteur. */
(function () {
    'use strict';

    var C = window.AFFICHE;
    C.textes = C.textes || [];
    var canvas = document.getElementById('toile');
    var ctx = canvas.getContext('2d');
    var modele = new Image();
    var photo = null;                         // canvas contenant la photo (réduite si très grande)
    var etat = { zoom: 1, dx: 0, dy: 0 };     // dx, dy : décalage de la photo, en pixels d'affiche
    var valeurs = {};
    var pret = false;
    // Mode réglage : ajoutez ?reglage à l'adresse pour voir les zones et lire les coordonnées
    var modeReglage = /[?&]reglage/.test(location.search);

    var el = function (id) { return document.getElementById(id); };
    var W = 0, H = 0;

    /* ---------- Page : textes et couleurs venant de la configuration ---------- */
    document.title = C.titre + ' — Créez votre affiche';
    el('titre').textContent = C.titre;
    el('sous-titre').textContent = C.sousTitre || '';
    el('credit').textContent = C.credit || '';
    document.documentElement.style.setProperty('--principal', C.couleurPrincipale || '#E5940F');

    /* ---------- Champs de texte ---------- */
    var conteneur = el('champs');
    (conteneur ? C.textes : []).forEach(function (t) {
        valeurs[t.id] = '';
        var div = document.createElement('div');
        div.className = 'champ';
        var lab = document.createElement('label');
        lab.htmlFor = 'champ-' + t.id;
        lab.textContent = t.etiquette;
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.id = 'champ-' + t.id;
        inp.placeholder = t.exemple || '';
        inp.maxLength = t.maxCaracteres || 40;
        inp.autocomplete = 'off';
        inp.addEventListener('input', function () { valeurs[t.id] = inp.value; planifier(); });
        div.appendChild(lab);
        div.appendChild(inp);
        conteneur.appendChild(div);
    });

    /* ---------- Chargement du modèle ---------- */
    modele.onload = function () {
        W = canvas.width = modele.naturalWidth;
        H = canvas.height = modele.naturalHeight;
        pret = true;
        el('chargement').hidden = true;
        dessiner(false);
        majBoutons();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { dessiner(false); });
    };
    modele.onerror = function () {
        el('chargement').textContent = "L'affiche n'a pas pu être chargée (" + C.modele + ").";
    };
    modele.src = C.modele;

    /* ---------- Dessin ---------- */
    var attente = false;
    function planifier() {
        if (attente) return;
        attente = true;
        requestAnimationFrame(function () { attente = false; dessiner(false); });
    }

    function zonePhoto() {
        var p = C.photo;
        return { x: p.x * W, y: p.y * H, w: p.w * W, h: p.h * H };
    }

    function tracerForme(z) {
        var f = C.photo.forme;
        ctx.beginPath();
        if (f === 'cercle') {
            ctx.ellipse(z.x + z.w / 2, z.y + z.h / 2, z.w / 2, z.h / 2, 0, 0, Math.PI * 2);
        } else if (f === 'arrondi') {
            var r = (C.photo.rayon || 0.08) * Math.min(z.w, z.h);
            ctx.moveTo(z.x + r, z.y);
            ctx.arcTo(z.x + z.w, z.y, z.x + z.w, z.y + z.h, r);
            ctx.arcTo(z.x + z.w, z.y + z.h, z.x, z.y + z.h, r);
            ctx.arcTo(z.x, z.y + z.h, z.x, z.y, r);
            ctx.arcTo(z.x, z.y, z.x + z.w, z.y, r);
            ctx.closePath();
        } else {
            ctx.rect(z.x, z.y, z.w, z.h);
        }
    }

    function echelleBase(z) {
        return Math.max(z.w / photo.width, z.h / photo.height);
    }

    // Garde la photo toujours à l'intérieur de la zone (pas de bord vide)
    function contraindre() {
        if (!photo) return;
        var z = zonePhoto();
        var s = echelleBase(z) * etat.zoom;
        var maxX = Math.max(0, (photo.width * s - z.w) / 2);
        var maxY = Math.max(0, (photo.height * s - z.h) / 2);
        etat.dx = Math.max(-maxX, Math.min(maxX, etat.dx));
        etat.dy = Math.max(-maxY, Math.min(maxY, etat.dy));
    }

    function dessinerPhoto(exporter) {
        var z = zonePhoto();
        ctx.save();
        tracerForme(z);
        ctx.clip();
        if (photo) {
            var s = echelleBase(z) * etat.zoom;
            var w = photo.width * s, h = photo.height * s;
            ctx.drawImage(photo, z.x + z.w / 2 - w / 2 + etat.dx, z.y + z.h / 2 - h / 2 + etat.dy, w, h);
        } else if (!exporter) {
            ctx.fillStyle = 'rgba(200,200,200,.55)';
            ctx.fillRect(z.x, z.y, z.w, z.h);
            ctx.fillStyle = 'rgba(60,60,60,.8)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold ' + Math.round(z.w * 0.09) + 'px Arial, sans-serif';
            ctx.fillText('＋', z.x + z.w / 2, z.y + z.h / 2 - z.w * 0.07);
            ctx.font = Math.round(z.w * 0.06) + 'px Arial, sans-serif';
            ctx.fillText('Ajoutez votre photo', z.x + z.w / 2, z.y + z.h / 2 + z.w * 0.05);
        }
        ctx.restore();
    }

    function dessinerTextes(exporter) {
        C.textes.forEach(function (t) {
            var texte = (valeurs[t.id] || '').trim();
            var apercu = false;
            if (!texte) {
                if (exporter) return;
                texte = t.exemple ? t.exemple.replace(/^Ex\.\s*:\s*/i, '') : '';
                apercu = true;
            }
            if (!texte) return;
            if (t.majuscules) texte = texte.toLocaleUpperCase('fr-FR');

            var taille = t.taille * H;
            var maxL = t.largeur * W;
            var famille = (t.gras ? 'bold ' : '') ;
            ctx.font = famille + taille + 'px ' + t.police;
            var mesure = ctx.measureText(texte).width;
            if (mesure > maxL) {
                taille = Math.max(taille * 0.4, taille * maxL / mesure);
                ctx.font = famille + taille + 'px ' + t.police;
            }
            ctx.save();
            ctx.textAlign = t.aligne || 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = apercu ? 0.4 : 1;
            if (t.contour) {
                ctx.lineWidth = taille * 0.12;
                ctx.strokeStyle = t.contour;
                ctx.lineJoin = 'round';
                ctx.strokeText(texte, t.x * W, t.y * H);
            }
            ctx.fillStyle = t.couleur || '#000';
            ctx.fillText(texte, t.x * W, t.y * H);
            ctx.restore();
        });
    }

    function dessiner(exporter) {
        if (!pret) return;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = C.fond || '#fff';
        ctx.fillRect(0, 0, W, H);
        if (C.photo.position === 'dessus') {
            ctx.drawImage(modele, 0, 0);
            dessinerPhoto(exporter);
        } else {
            dessinerPhoto(exporter);
            ctx.drawImage(modele, 0, 0);
        }
        dessinerTextes(exporter);
        if (modeReglage && !exporter) dessinerRepères();
    }

    function dessinerRepères() {
        var z = zonePhoto();
        ctx.save();
        ctx.strokeStyle = '#ff0033';
        ctx.fillStyle = '#ff0033';
        ctx.lineWidth = Math.max(2, W / 400);
        ctx.setLineDash([12, 8]);
        ctx.strokeRect(z.x, z.y, z.w, z.h);
        ctx.setLineDash([]);
        C.textes.forEach(function (t) {
            var cx = t.x * W, cy = t.y * H, demi = t.largeur * W / 2;
            ctx.beginPath();
            ctx.moveTo(cx - demi, cy); ctx.lineTo(cx + demi, cy);
            ctx.moveTo(cx, cy - 14); ctx.lineTo(cx, cy + 14);
            ctx.stroke();
        });
        ctx.restore();
    }

    if (modeReglage) {
        var info = document.createElement('div');
        info.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9;background:#000;color:#fff;padding:.6rem .9rem;border-radius:10px;font:14px/1.4 monospace;max-width:90vw';
        info.textContent = "Mode réglage : touchez l'affiche pour lire les coordonnées (x, y).";
        document.body.appendChild(info);
        canvas.addEventListener('click', function (e) {
            var r = canvas.getBoundingClientRect();
            info.textContent = 'x : ' + ((e.clientX - r.left) / r.width).toFixed(3) + '    y : ' + ((e.clientY - r.top) / r.height).toFixed(3);
        });
    }

    /* ---------- Photo du visiteur ---------- */
    el('btn-photo').addEventListener('click', function () { el('fichier-photo').click(); });
    el('fichier-photo').addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        if (!/^image\//.test(f.type)) { message("Ce fichier n'est pas une image.", 'erreur'); return; }
        var url = URL.createObjectURL(f);
        var img = new Image();
        img.onload = function () {
            // On réduit les très grosses photos (téléphones) pour rester fluide
            var max = 2200, k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
            var c = document.createElement('canvas');
            c.width = Math.round(img.naturalWidth * k);
            c.height = Math.round(img.naturalHeight * k);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            photo = c;
            etat.zoom = 1; etat.dx = 0; etat.dy = 0;
            el('zoom').value = 1;
            el('reglage-zoom').hidden = false;
            canvas.classList.add('photo-chargee');
            message('Photo ajoutée. Déplacez-la pour bien vous cadrer.', 'ok');
            dessiner(false);
            majBoutons();
        };
        img.onerror = function () {
            URL.revokeObjectURL(url);
            message("Cette photo n'est pas lisible. Essayez une photo au format JPG ou PNG.", 'erreur');
        };
        img.src = url;
        e.target.value = '';
    });

    el('zoom').addEventListener('input', function (e) {
        etat.zoom = parseFloat(e.target.value);
        contraindre();
        planifier();
    });
    el('btn-recentrer').addEventListener('click', function () {
        etat.zoom = 1; etat.dx = 0; etat.dy = 0;
        el('zoom').value = 1;
        dessiner(false);
    });

    /* ---------- Déplacer / zoomer avec le doigt, la souris ou la molette ---------- */
    var pointeurs = {};
    canvas.addEventListener('pointerdown', function (e) {
        if (!photo) return;
        canvas.setPointerCapture(e.pointerId);
        pointeurs[e.pointerId] = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('pointermove', function (e) {
        var p = pointeurs[e.pointerId];
        if (!p || !photo) return;
        var ids = Object.keys(pointeurs);
        var k = canvas.width / canvas.getBoundingClientRect().width;
        if (ids.length === 1) {
            etat.dx += (e.clientX - p.x) * k;
            etat.dy += (e.clientY - p.y) * k;
        } else if (ids.length === 2) {
            var autre = pointeurs[ids[0] == e.pointerId ? ids[1] : ids[0]];
            var avant = Math.hypot(p.x - autre.x, p.y - autre.y);
            var apres = Math.hypot(e.clientX - autre.x, e.clientY - autre.y);
            if (avant > 0) {
                etat.zoom = Math.max(1, Math.min(3, etat.zoom * apres / avant));
                el('zoom').value = etat.zoom;
            }
        }
        pointeurs[e.pointerId] = { x: e.clientX, y: e.clientY };
        contraindre();
        planifier();
    });
    function lacher(e) { delete pointeurs[e.pointerId]; }
    canvas.addEventListener('pointerup', lacher);
    canvas.addEventListener('pointercancel', lacher);
    canvas.addEventListener('wheel', function (e) {
        if (!photo) return;
        e.preventDefault();
        etat.zoom = Math.max(1, Math.min(3, etat.zoom * (e.deltaY < 0 ? 1.06 : 0.94)));
        el('zoom').value = etat.zoom;
        contraindre();
        planifier();
    }, { passive: false });

    /* ---------- Boutons ---------- */
    function majBoutons() {
        var ok = pret && (!C.photo.obligatoire || !!photo);
        el('btn-telecharger').disabled = !ok;
        el('btn-partager').disabled = !ok;
    }
    majBoutons();

    // Page ouverte par double-clic : l'aperçu marche mais pas le téléchargement
    if (location.protocol === 'file:') {
        var avis = el('avis-local');
        avis.hidden = false;
        avis.innerHTML = '<b>Test en local :</b> pour que le téléchargement fonctionne, n\'ouvrez pas ce fichier par double-clic. ' +
            'Copiez le dossier dans <b>www</b> (WAMP) et ouvrez <b>http://localhost/jserai/</b>, ou double-cliquez sur <b>LANCER-EN-LOCAL.bat</b>.';
    }

    function message(texte, type) {
        var m = el('message');
        m.textContent = texte || '';
        m.className = 'message' + (type ? ' ' + type : '');
    }

    // Exporte l'affiche en pleine résolution, sans les aides visuelles de l'aperçu
    function exporterPNG(cb) {
        dessiner(true);
        try {
            canvas.toBlob(function (blob) {
                dessiner(false);
                cb(blob);
            }, 'image/png');
        } catch (err) {
            // Cas typique : page ouverte par double-clic (adresse file://), le navigateur bloque l'export
            dessiner(false);
            message(location.protocol === 'file:'
                ? "Le navigateur bloque le téléchargement quand la page est ouverte directement. Voir l'encadré jaune en haut de la page."
                : "Impossible de créer l'image.", 'erreur');
        }
    }

    el('btn-telecharger').addEventListener('click', function () {
        exporterPNG(function (blob) {
            if (!blob) { message("Impossible de créer l'image.", 'erreur'); return; }
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = C.nomFichier || 'affiche.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
            message("Affiche téléchargée ! Si rien ne s'affiche sur iPhone, maintenez l'image appuyée pour l'enregistrer.", 'ok');
        });
    });

    function lienPage() { return location.href.split('#')[0]; }
    function texteLien() { return C.messagePartage + ' ' + lienPage(); }

    el('btn-partager').addEventListener('click', function () {
        exporterPNG(function (blob) {
            if (!blob) { message("Impossible de créer l'image.", 'erreur'); return; }
            var fichier = new File([blob], C.nomFichier || 'affiche.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [fichier] })) {
                navigator.share({ files: [fichier], title: C.titre, text: texteLien() })
                    .then(function () { message('Merci de partager !', 'ok'); })
                    .catch(function () { /* partage annulé : rien à faire */ });
            } else {
                // Navigateurs sans partage de fichier (ordinateur) : on télécharge puis on propose WhatsApp
                el('btn-telecharger').click();
                window.open('https://wa.me/?text=' + encodeURIComponent(texteLien()), '_blank', 'noopener');
                message("Image téléchargée : joignez-la à votre message WhatsApp ou à votre publication.", 'ok');
            }
        });
    });

    el('lien-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent(texteLien());
    el('lien-facebook').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(lienPage());
    el('btn-copier').addEventListener('click', function () {
        var url = lienPage();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(
                function () { message('Lien copié !', 'ok'); },
                function () { window.prompt('Copiez ce lien :', url); }
            );
        } else {
            window.prompt('Copiez ce lien :', url);
        }
    });
})();
