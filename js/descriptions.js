// Descriptions textuelles des mouvements (repères d'exécution).
// Donnée séparée du catalogue (movements.js inchangé). Affichée sur la fiche
// d'un mouvement.

export const MOVEMENT_DESCRIPTIONS = {
  // ---- Haltérophilie ----
  'thruster': "Front squat suivi d'un développé en un mouvement continu : descendre en squat barre sur les épaules, puis remonter en explosant pour propulser la barre au-dessus de la tête, bras tendus.",
  'front-squat': "Squat barre posée sur le haut des épaules (rack avant), coudes hauts. Descendre hanches sous les genoux en gardant le buste droit, puis remonter.",
  'back-squat': "Squat barre sur le haut du dos (trapèzes). Descendre hanches sous les genoux, dos gainé, talons ancrés, puis pousser le sol pour remonter.",
  'overhead-squat': "Squat barre maintenue bras tendus au-dessus de la tête. Demande mobilité d'épaules et de chevilles ; gainage maximal pour stabiliser la barre.",
  'deadlift': "Soulevé de terre : barre au sol, dos plat, pousser le sol avec les jambes puis ouvrir les hanches jusqu'à se tenir debout, barre le long des cuisses.",
  'sdhp': "Sumo deadlift high pull : départ jambes écartées, enchaîner une extension de hanches et un tirage de la barre jusqu'au menton, coudes hauts.",
  'clean': "Épaulé : tirer la barre du sol et la recevoir sur les épaules en passant sous la barre en squat complet, puis se relever.",
  'power-clean': "Épaulé en réception haute : recevoir la barre sur les épaules jambes peu fléchies (sans squat complet).",
  'hang-power-clean': "Épaulé départ cuisses (hang) en réception haute : extension explosive depuis au-dessus du genou, puis réception sur les épaules.",
  'clean-jerk': "Épaulé-jeté : épauler la barre sur les épaules, puis la propulser au-dessus de la tête avec une impulsion de jambes (jerk).",
  'snatch': "Arraché : tirer la barre du sol jusqu'au-dessus de la tête en un seul mouvement, réception bras tendus en squat complet.",
  'power-snatch': "Arraché en réception haute : barre au-dessus de la tête bras tendus, jambes peu fléchies.",
  'push-press': "Développé avec impulsion de jambes : léger fléchissement puis extension pour lancer la barre au-dessus de la tête, finir bras tendus.",
  'push-jerk': "Comme le push press, mais on repasse sous la barre en refléchissant les jambes à la réception, bras tendus.",
  'strict-press': "Développé militaire strict : pousser la barre des épaules au-dessus de la tête sans aide des jambes, gainage serré.",
  'bench-press': "Développé couché : allongé sur le banc, descendre la barre à la poitrine puis pousser jusqu'à bras tendus.",

  // ---- Haltères ----
  'db-snatch': "Arraché d'un haltère d'un bras, du sol jusqu'au-dessus de la tête en un mouvement, bras tendu. Souvent alterné droite/gauche.",
  'db-hang-snatch': "Arraché haltère départ cuisses (hang), sans reposer au sol entre les répétitions.",
  'db-clean': "Épaulé haltère(s) sur l'épaule via une extension de hanches.",
  'db-hang-clean': "Épaulé haltère départ cuisses, réception sur l'épaule.",
  'db-clean-jerk': "Épaulé-jeté haltère(s) : sur l'épaule puis au-dessus de la tête avec impulsion de jambes.",
  'db-thruster': "Front squat haltères sur les épaules puis développé au-dessus de la tête, mouvement continu.",
  'db-push-press': "Développé haltères avec impulsion de jambes.",
  'db-push-jerk': "Développé haltères avec réception sous la charge (re-flexion des jambes).",
  'db-shoulder-press': "Développé haltères strict, des épaules au-dessus de la tête sans aide des jambes.",
  'db-front-squat': "Squat haltères tenus sur les épaules (rack avant).",
  'db-deadlift': "Soulevé de terre haltères posés au sol de part et d'autre des pieds, extension de hanches.",
  'db-walking-lunge': "Fentes marchées haltères en main : grand pas, genou arrière vers le sol, alterner.",
  'db-front-rack-lunge': "Fente haltères tenus sur les épaules, buste droit.",
  'db-overhead-lunge': "Fente avec haltère(s) maintenu(s) bras tendu(s) au-dessus de la tête, gainage maximal.",
  'db-box-step-up': "Montée sur box haltères en main : monter un pied, étendre la hanche, redescendre contrôlé, alterner.",
  'db-overhead-step-up': "Montée sur box avec haltère(s) maintenu(s) au-dessus de la tête.",
  'db-row': "Tirage haltère buste penché : tirer le coude vers l'arrière jusqu'à la hanche, dos plat.",
  'renegade-row': "En planche sur les haltères, tirer un haltère vers la hanche sans laisser tourner le bassin, alterner.",
  'devil-press': "Burpee, puis arraché des deux haltères du sol jusqu'au-dessus de la tête, en un enchaînement.",
  'man-maker': "Par répétition : pompe sur les haltères, un tirage de chaque bras, un épaulé puis un thruster.",
  'db-rdl': "Soulevé de terre roumain : descendre les haltères en charnière de hanche, jambes quasi tendues, étirer les ischios, remonter.",
  'db-bulgarian-split-squat': "Fente bulgare : pied arrière surélevé sur un banc, descendre sur la jambe avant, haltères en main.",
  'db-bench-press': "Développé couché haltères : descendre au niveau de la poitrine, pousser jusqu'à bras tendus.",
  'db-floor-press': "Développé haltères allongé au sol : la course est limitée par les coudes qui touchent le sol.",
  'db-curl': "Flexion des biceps : monter l'haltère vers l'épaule sans balancer le buste, redescendre contrôlé.",
  'db-hammer-curl': "Curl en prise marteau (paumes face à face) : sollicite biceps et avant-bras.",
  'db-lateral-raise': "Élévations latérales : monter les haltères sur les côtés jusqu'à l'horizontale, épaules basses.",
  'db-triceps-extension': "Extension triceps : haltère derrière la nuque, étendre le coude vers le haut.",
  'db-flye': "Écarté couché : bras légèrement fléchis, écarter puis rapprocher les haltères au-dessus de la poitrine en arc de cercle.",
  'turkish-get-up': "Depuis le sol, se relever jusqu'à debout en gardant l'haltère tendu au-dessus de la tête, puis revenir au sol. Lent et contrôlé.",

  // ---- Gymnastique ----
  'pullup': "Traction : suspendu à la barre, tirer jusqu'à passer le menton au-dessus, redescendre bras tendus. Kipping autorisé en WOD.",
  'c2b': "Traction chest-to-bar : tirer plus haut pour toucher la barre avec la poitrine.",
  'muscle-up': "Enchaîner une traction explosive et un passage au-dessus de la barre ou des anneaux pour finir bras tendus en appui.",
  'pushup': "Pompe : corps gainé en planche, descendre la poitrine au sol, pousser jusqu'à bras tendus.",
  'hspu': "Handstand push-up : en appui tête en bas contre un mur, descendre la tête au sol puis pousser bras tendus.",
  'ring-dip': "Dips aux anneaux : en appui bras tendus, descendre épaules sous les coudes puis remonter, en stabilisant les anneaux.",
  'dip': "Dips aux barres parallèles : descendre en pliant les coudes puis pousser jusqu'à bras tendus.",
  'pistol': "Squat sur une jambe : descendre en équilibre sur un pied, l'autre jambe tendue devant, puis remonter.",
  'air-squat': "Squat au poids de corps : hanches sous les genoux, talons au sol, buste droit, puis remonter.",
  'lunge': "Fente au poids de corps : grand pas en avant, genou arrière vers le sol, remonter.",
  'box-jump': "Saut sur box à deux pieds, ouvrir les hanches en haut, puis redescendre.",
  'burpee': "Poitrine au sol, se relever puis sauter avec extension des bras au-dessus de la tête.",
  'burpee-over-bar': "Burpee avec franchissement d'une barre au sol par un saut entre chaque répétition.",
  'wall-ball': "Squat avec medball, puis lancer la balle sur une cible en hauteur, rattraper et enchaîner.",
  'wall-walk': "Départ en planche face au sol, marcher les pieds sur le mur et les mains vers le mur jusqu'à l'ATR, puis revenir.",
  'handstand-walk': "Marche en équilibre sur les mains (ATR), épaules et gainage engagés. Se mesure en distance.",
  'rope-climb': "Montée de corde : grimper en serrant la corde avec les pieds et en tirant avec les bras jusqu'à la cible.",

  // ---- Gainage / core ----
  'situp': "Relevé de buste : allongé, remonter le tronc jusqu'à la position assise (mains au-dessus de la tête), redescendre.",
  'ghd-situp': "Sit-up sur GHD à amplitude étendue : le buste descend sous l'horizontale avant de remonter. Exigeant pour le dos.",
  't2b': "Toes-to-bar : suspendu à la barre, monter les pieds jusqu'à la toucher en gainant, puis redescendre contrôlé.",
  'k2e': "Knees-to-elbow : suspendu, monter les genoux jusqu'aux coudes (version plus accessible que le toes-to-bar).",
  'back-extension': "Extension lombaire (banc / GHD) : descendre le buste en charnière de hanche puis remonter en contractant fessiers et lombaires.",

  // ---- Kettlebell ----
  'kb-swing': "Swing kettlebell : balancer la cloche par extension explosive des hanches (pas avec les bras), jusqu'aux yeux ou au-dessus de la tête selon la version.",
  'goblet-squat': "Squat en tenant une kettlebell ou un haltère contre la poitrine, coudes à l'intérieur des genoux en bas.",
  'farmer-carry': "Portage du fermier : marcher en tenant une charge lourde dans chaque main, gainage et épaules serrés. Se mesure en distance.",

  // ---- Cardio ----
  'run': "Course à pied. Se mesure en mètres.",
  'row': "Rameur (erg) : enchaîner poussée de jambes, bascule du buste et tirage des bras, puis retour. Se mesure en mètres ou calories.",
  'bike': "Vélo / Assault bike : pédaler (et pousser/tirer les bras sur l'assault bike). Se mesure souvent en calories.",
  'double-under': "Corde à sauter qui passe deux fois sous les pieds à chaque saut.",
  'single-under': "Saut à la corde simple : un passage de corde par saut (souvent en scaling des double-unders).",
};

export function descriptionFor(movementId) {
  return MOVEMENT_DESCRIPTIONS[movementId] || '';
}
