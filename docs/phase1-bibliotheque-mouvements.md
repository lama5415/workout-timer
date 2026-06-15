# Phase 1 — Bibliothèque de mouvements & saisie structurée des WODs

> Spec d'implémentation. Objectif : permettre de décrire un WOD avec des
> mouvements **structurés** (mouvement + mesure + charge), tout en gardant le
> champ **texte libre** existant. Aucun changement d'export à ce stade : cette
> phase a de la valeur en soi (saisie, affichage, futures stats) et prépare
> l'export FIT (Phase 2) sans le déclencher.

## 1. Périmètre

**Dans la v1**
- Un catalogue statique de mouvements (`js/movements.js`).
- Un modèle de WOD enrichi d'une liste de mouvements structurés (champ
  `movements`), **en plus** de `description` (texte libre conservé).
- Un éditeur de mouvements dans le formulaire « Nouveau / Modifier le WOD ».
- L'affichage des mouvements structurés dans le résultat et l'historique.

**Hors v1 (phases ultérieures)**
- Export FIT exploitant les mouvements structurés (Phase 2).
- Auto-remplissage des champs structurés depuis le texte libre — parseur
  déterministe d'abord, IA seulement si besoin (Phase 3).
- Glisser-déposer pour réordonner, gestion RX/scaled, variantes d'équipement.
- Statistiques par mouvement (volume, charges) — possible plus tard grâce au
  modèle posé ici.

## 2. Modèle de données

### 2.1 Catalogue — `js/movements.js`

```js
// Catalogue de référence des mouvements. Le mapping `fit` n'est utilisé
// qu'en Phase 2 (export FIT) ; il est optionnel et peut rester incomplet.
export const MOVEMENTS = [
  {
    id: 'thruster',            // slug stable, ne change jamais
    name: 'Thruster',          // libellé affiché
    family: 'halterophilie',   // pour le regroupement/filtre dans l'UI
    aliases: ['thrusters'],    // pour le futur parseur (Phase 3)
    measure: 'reps',           // mesure par défaut : 'reps' | 'm' | 'cal' | 'sec'
    loaded: true,              // porte généralement une charge externe
    equipment: 'full',         // 'none' | 'minimal' | 'full' — voir §2.5
    fit: { category: 'squat', name: 'thruster' }, // à valider sur le profil FIT
  },
  // …
];

// Index pratique pour les lookups O(1).
export const MOVEMENT_BY_ID = Object.fromEntries(MOVEMENTS.map((m) => [m.id, m]));
```

Champs d'un mouvement du catalogue :

| Champ | Type | Rôle |
|---|---|---|
| `id` | `string` | Identifiant stable (référencé par les WODs). **Ne jamais renommer.** |
| `name` | `string` | Libellé FR affiché. |
| `family` | `string` | Regroupement UI : `halterophilie`, `gymnastique`, `monostructural`, `kettlebell`, `core`. |
| `aliases` | `string[]` | Variantes orthographiques, pour le parseur Phase 3. Inutile à l'affichage. |
| `measure` | `'reps' \| 'm' \| 'cal' \| 'sec'` | Mesure par défaut proposée dans l'UI. |
| `loaded` | `boolean` | Si vrai, l'UI propose un champ charge. |
| `equipment` | `'none' \| 'minimal' \| 'full'` | Niveau de matériel requis — voir §2.5. Axe **indépendant** de `family`. |
| `fit` | `{ category, name } \| undefined` | Mapping vers l'exercice FIT. **Optionnel** ; absent = repli générique en Phase 2. |

### 2.5 Niveau d'équipement (`equipment`)

Axe orthogonal à `family`, pour filtrer plus tard « qu'est-ce que je peux faire
avec ce que j'ai ? » :

| Valeur | Sens | Exemples |
|---|---|---|
| `none` | Aucun accessoire (poids de corps pur) | Air squat, push-up, sit-up, burpee, fente |
| `minimal` | Haltère **ou** barre de traction | Pull-up, toes-to-bar, mouvements haltère, muscle-up |
| `full` | Barre/rack, kettlebell, machines, anneaux, box… | Thruster, deadlift, kettlebell swing, rameur, box jump |

Note : c'est une **première affectation pragmatique** (un box jump exige un box
mais pas une salle complète) ; à affiner à l'usage. Garder 3 niveaux suffit pour
la v1 — on évite de modéliser chaque accessoire.

### 2.2 WOD enrichi

Le modèle WOD existant (`js/wods.js`) gagne un champ **optionnel** `movements`.
Tout le reste est inchangé ; `description` reste la source de vérité texte.

```js
{
  id: 'fran', name: 'Fran', category: 'girls', type: 'fortime',
  params: { capSec: 600 },
  description: '21-15-9 reps de :\n• Thrusters (43/30 kg)\n• Pull-ups', // conservé
  scheme: [21, 15, 9],          // optionnel — voir 2.4
  movements: [                  // optionnel — absent = WOD « texte seul »
    { movementId: 'thruster', load: { value: 43, unit: 'kg' } },
    { movementId: 'pullup' },
  ],
}
```

Entrée d'un mouvement de WOD (`movements[i]`) :

| Champ | Type | Notes |
|---|---|---|
| `movementId` | `string` | Référence un `id` du catalogue. |
| `measure` | `'reps' \| 'm' \| 'cal' \| 'sec'` | Optionnel ; par défaut celle du catalogue. |
| `value` | `number` | Optionnel. Quantité (reps, mètres…). Ignoré si un `scheme` s'applique (voir 2.4). |
| `load` | `{ value: number, unit: 'kg' \| 'lb' \| '%' \| 'bw' } \| undefined` | Charge. `%` = % du 1RM, `bw` = poids de corps. |
| `note` | `string` | Optionnel. Précision libre (« alternés », « gilet lesté »…). |

### 2.3 Historique

L'entrée d'historique (`js/storage.js`) **fige une copie** des mouvements au
moment de la séance, comme elle fige déjà `segments`. On ajoute donc un champ
optionnel `movements` à l'entrée (même forme qu'en 2.2). Ainsi, modifier le
catalogue plus tard ne réécrit pas l'historique passé.

### 2.4 Schéma de reps (`scheme`) — décision à trancher

Deux notations CrossFit cohabitent :
- **« 21-15-9 reps de A, B »** : un schéma s'applique à tous les mouvements
  listés → `scheme: [21, 15, 9]`, chaque mouvement sans `value`.
- **« 5 rounds : 12 A, 9 B, 6 C »** : reps par mouvement → pas de `scheme`,
  chaque mouvement porte son `value`.

Proposition v1 : supporter **les deux**, avec `scheme` optionnel au niveau du
WOD. Si `scheme` est présent, l'UI masque le champ `value` des mouvements et
affiche « 21-15-9 » en tête. Sinon, chaque mouvement saisit son `value`.
C'est ~1 h d'UI en plus mais ça couvre la majorité des benchmarks (Fran, Diane,
Annie… sont tous des schémas). **Question ouverte** : acceptez-vous ce léger
surcoût, ou on se limite aux reps par mouvement en v1 ?

## 3. Catalogue initial proposé (~38 mouvements)

`measure` par défaut entre parenthèses ; `L` = porte une charge. La colonne FIT
donne la **catégorie** d'exercice FIT visée + un nom suggéré **à valider sur le
profil FIT officiel en Phase 2** (tous n'ont pas de code exact → repli sur la
catégorie seule, voire `total_body`).

### Haltérophilie (barbell)
| id | Nom | mes. | L | FIT (catégorie / nom suggéré) |
|---|---|---|---|---|
| `thruster` | Thruster | reps | L | squat / thruster |
| `front-squat` | Front squat | reps | L | squat / front_squat |
| `back-squat` | Back squat | reps | L | squat / back_squat |
| `overhead-squat` | Overhead squat | reps | L | squat / overhead_squat |
| `deadlift` | Deadlift | reps | L | deadlift / barbell_deadlift |
| `sdhp` | Sumo deadlift high pull | reps | L | deadlift / — |
| `clean` | Squat clean | reps | L | olympic_lift / squat_clean |
| `power-clean` | Power clean | reps | L | olympic_lift / power_clean |
| `hang-power-clean` | Hang power clean | reps | L | olympic_lift / — |
| `clean-jerk` | Clean & jerk | reps | L | olympic_lift / clean_and_jerk |
| `snatch` | Squat snatch | reps | L | olympic_lift / snatch |
| `power-snatch` | Power snatch | reps | L | olympic_lift / power_snatch |
| `push-press` | Push press | reps | L | shoulder_press / push_press |
| `push-jerk` | Push jerk | reps | L | shoulder_press / — |
| `strict-press` | Strict press | reps | L | shoulder_press / overhead_press |

### Gymnastique (poids de corps)
| id | Nom | mes. | L | FIT |
|---|---|---|---|---|
| `pullup` | Pull-up | reps | — | pull_up / pull_up |
| `c2b` | Chest-to-bar | reps | — | pull_up / — |
| `muscle-up` | Muscle-up | reps | — | pull_up / — |
| `t2b` | Toes-to-bar | reps | — | leg_raise / — |
| `pushup` | Push-up | reps | — | push_up / push_up |
| `hspu` | Handstand push-up | reps | — | push_up / — |
| `ring-dip` | Ring dip | reps | — | push_up / ring_dip |
| `dip` | Dip | reps | — | push_up / dip |
| `situp` | Sit-up | reps | — | sit_up / sit_up |
| `ghd-situp` | GHD sit-up | reps | — | sit_up / — |
| `pistol` | Pistol (squat 1 jambe) | reps | — | squat / single_leg_squat |
| `air-squat` | Air squat | reps | — | squat / air_squat |
| `lunge` | Fente | reps | (L) | lunge / lunge |
| `box-jump` | Box jump | reps | — | plyo / box_jump |
| `burpee` | Burpee | reps | — | total_body / burpee |
| `wall-ball` | Wall ball | reps | L | squat / wall_ball |
| `wall-walk` | Wall walk | reps | — | total_body / — |
| `rope-climb` | Montée de corde | reps | — | pull_up / rope_climb |

### Kettlebell / odd object
| id | Nom | mes. | L | FIT |
|---|---|---|---|---|
| `kb-swing` | Kettlebell swing | reps | L | hip_swing / kettlebell_swing |
| `goblet-squat` | Goblet squat | reps | L | squat / goblet_squat |
| `farmer-carry` | Farmer carry | m | L | carry / farmers_walk |

### Monostructural (cardio)
| id | Nom | mes. | L | FIT |
|---|---|---|---|---|
| `run` | Course | m | — | run / run |
| `row` | Rameur | m | — | cardio / — |
| `bike` | Vélo / Assault bike | cal | — | cardio / — |
| `double-under` | Double-under | reps | — | cardio / jump_rope |

> Couverture FIT : on vise un mapping **catégorie** correct pour ~100 % des
> mouvements ci-dessus (fiable) et un **nom** exact quand il existe (à valider).
> Les `—` retomberont sur la catégorie seule en Phase 2 — Garmin affichera alors
> la famille d'exercice, pas le nom précis. À assumer côté attentes.

## 4. Plan UI

### 4.1 Éditeur de WOD (`js/app.js`, vue `renderWodEditor`)

Insérer une section **« Mouvements »** entre le bloc `#params` et le champ
`Description` existant (qu'on **garde** tel quel, libellé « Description / notes
libres »). La section réutilise les styles `.field`, `.field-row`, `.step-row`,
`.del` déjà présents (cf. l'éditeur d'étapes `intervals`), donc peu de CSS neuf.

Structure d'une ligne mouvement :

```
[ Mouvement ▼ ]  [ valeur ] [ mes. ▼ ]   [ charge ] [ unité ▼ ]  [ note ]  [ × ]
```

- **Mouvement** : `<select>` groupé par `family` (via `<optgroup>`), trié par
  nom. Une 1ʳᵉ option vide « — choisir — ». (Recherche/autocomplétion : repoussée
  à plus tard ; le `<select>` natif suffit pour ~38 entrées.)
- **valeur / mesure** : masqués si un `scheme` global est actif (voir 2.4) ;
  sinon `value` + `<select>` de `measure` pré-rempli depuis le catalogue.
- **charge / unité** : affichés seulement si le mouvement sélectionné a
  `loaded: true`. Unité par défaut `kg`.
- **note** : `<input text>` court, optionnel.
- **×** : supprime la ligne (même logique que `renderSteps`).
- Bouton **« + Ajouter un mouvement »** sous la liste.
- Si `scheme` activable : un champ « Schéma de reps (ex. 21-15-9) » au-dessus de
  la liste, qui parse une saisie `21-15-9` en `[21,15,9]` (vide = pas de schéma).

Lecture/écriture sur le modèle `wod.movements` en miroir exact de
`renderSteps`/`readSteps` (lecture avant tout re-render pour ne rien perdre).
À l'enregistrement : `movements` n'est inclus que s'il est non vide ; sinon on
ne pose pas le champ (WOD « texte seul » reste valide).

### 4.2 Affichage (résultat + historique)

Là où l'app montre aujourd'hui la `description`, si `movements` est présent et
non vide, afficher la liste structurée formatée :

```
21-15-9 reps                     ← si scheme
• Thruster — 43 kg
• Pull-up
```

Helper `formatMovement(entry)` dans un module partagé (p. ex. `js/format.js` si
créé, sinon à côté de `formatClock`). Repli : pas de `movements` → on affiche la
`description` comme aujourd'hui. **Aucune régression** pour les WODs existants.

## 5. Migration & compatibilité

- `movements` et `scheme` sont **optionnels** → les WODs de référence et les
  WODs perso existants restent valides sans rien changer.
- Aucune migration forcée de l'historique : les entrées passées n'ont pas de
  `movements`, elles continuent d'afficher leur `description`.
- On peut enrichir progressivement les WODs de référence de `js/wods.js` avec
  `movements`, WOD par WOD, sans urgence.
- Le service worker (`sw.js`) doit inclure `js/movements.js` (et `js/format.js`
  si créé) dans la liste des assets mis en cache.

## 6. Découpage & estimation

| Lot | Contenu | Effort |
|---|---|---|
| A | `js/movements.js` : schéma + saisie des ~38 mouvements (le gros = data) | 2–4 h |
| B | Modèle WOD + lecture/écriture `movements` (+ `scheme`) dans l'éditeur | 4–6 h |
| C | UI lignes mouvement (select groupé, charge conditionnelle, note, suppr.) | 3–5 h |
| D | Affichage structuré résultat + historique + `formatMovement` | 1–2 h |
| E | Cache SW + tests (lecture/écriture, repli texte) + maj README | 1–2 h |
| **Total** | | **~11–19 h (≈ 1,5–2,5 j)** |

## 7. Décisions (verrouillées)

1. **Schéma 21-15-9** : ✅ supporté en v1 (champ `scheme` optionnel, §2.4).
2. **Unité de charge par défaut** : ✅ `kg`.
3. **Catalogue** : on démarre sur les ~38 du §3. Ajouts attendus ensuite,
   surtout les mouvements **haltère** (dumbbell). Le niveau d'équipement est
   modélisé via `equipment` (§2.5).
4. **WODs de référence** : ✅ pré-remplir `movements` dès cette phase, ce qui
   révèlera les mouvements manquants au passage.
