/* =====================================================================
   J'SERAI — RÉGLAGES DE L'AFFICHE
   C'est le seul fichier à modifier quand vous remplacez l'affiche.
   Toutes les positions sont en POURCENTAGES de l'affiche (0 = bord gauche/haut,
   1 = bord droit/bas), donc elles fonctionnent quelle que soit la taille du fichier.
   ===================================================================== */
window.AFFICHE = {

    // --- Textes de la page ---
    titre: "J'serai",
    sousTitre: "Créez votre affiche en 30 secondes : ajoutez votre photo, puis partagez-la !",
    credit: "",                       // ex. "Une initiative de Tillaberi Ganda" (laisser vide pour ne rien afficher)
    couleurPrincipale: "#E5940F",     // couleur des boutons

    // --- Le modèle exporté de Photoshop (PNG) ---
    modele: "assets/affiche.png",
    fond: "#ffffff",                  // couleur visible si le modèle a des parties transparentes

    // --- Zone de la photo ---
    photo: {
        x: 0.15, y: 0.19, w: 0.70, h: 0.56,   // position et taille de la fenêtre photo
        forme: "cercle",              // "cercle", "arrondi" ou "rect"
        rayon: 0.08,                  // arrondi des angles (seulement pour "arrondi")
        // "dessous" : la photo passe DERRIÈRE le modèle (le PNG a un trou transparent à cet endroit)
        // "dessus"  : la photo est posée PAR-DESSUS le modèle (le PNG est plein)
        position: "dessous",
        obligatoire: true             // le téléchargement n'est possible qu'avec une photo
    },

    // --- Textes à écrire sur l'affiche ---
    // Aucun pour l'instant (la personne ajoute seulement sa photo). Si un jour vous voulez un champ « nom »,
    // dites-le : l'application sait déjà le gérer (position, taille, couleur, police).
    textes: [],

    // --- Partage ---
    messagePartage: "Je serai présent(e) ! Crée ta propre affiche J'serai ici :",
    nomFichier: "jserai-affiche.png"
};
