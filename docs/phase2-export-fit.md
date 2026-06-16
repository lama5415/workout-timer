# Phase 2 — Export FIT (Garmin)

> Export d'une séance au format **FIT** (binaire Garmin), en plus du TCX
> existant. Objectif : fixer le **type d'activité** et embarquer les
> **mouvements** (séries + reps + charge), ce que le TCX ne permet pas.
>
> Branche dédiée `claude/garmin-fit-export` — **à tester sur un vrai compte
> Garmin avant fusion.**

## Comment tester

1. Lancer l'app en local sur cette branche :
   ```bash
   python3 -m http.server 8000   # puis http://localhost:8000
   ```
2. Faire (ou ouvrir dans l'historique) une séance avec des mouvements
   structurés — ex. un WOD de référence comme **Fran**.
3. Bouton **« ⬇ FIT (Garmin) »** (écran résultat ou historique) → télécharge un
   `.fit`.
4. Dans Garmin Connect : **Importer des données** → choisir le `.fit`.

## Ce qu'on attend dans Garmin

- L'activité s'importe **sans erreur**.
- **Durée et temps écoulé corrects** (records horodatés).
- **Type d'activité** = entraînement (et non « Autre »).
- Idéalement, un **détail des séries** (reps + charge) issu des mouvements.

## Ce qu'il faut me remonter après ton test

Pour itérer efficacement, note :
1. L'import **passe / échoue** (message éventuel) ?
2. Le **type d'activité** affiché ?
3. La **durée** est-elle bonne ?
4. Les **séries / reps / charges** apparaissent-elles, et comment ?

## Détails d'encodage

Encodeur maison sans dépendance (`js/fit.js`). Messages émis :
`file_id`, `event` (start/stop timer), `record`, `lap`, `set`, `session`,
`activity`, suivis du CRC.

| Donnée app | → | Champ FIT |
|---|---|---|
| `entry.startedAt` / `totalSec` | → | `record` horodatés, `session.total_elapsed_time` |
| `entry.segments` | → | un `lap` par segment |
| type d'activité | → | `session.sport = training (10)`, `sub_sport = strength_training (16)` |
| `movement.value` (ou somme du schéma) | → | `set.repetitions` |
| `movement.load` (kg) | → | `set.weight` (×16) |

### Choix et limites connues (à valider / affiner)

- **sport / sub_sport** : `training (10)` est confirmé ; `sub_sport = 16`
  (strength_training) est un *best-guess* — ces champs sont **cosmétiques**
  (une valeur inexacte n'empêche pas l'import, le type reste réétiquetable dans
  Garmin). À confirmer/ajuster après test, avec d'éventuelles variantes (hiit,
  cardio_training).
- **Pas de `category` d'exercice FIT** dans les `set` pour l'instant : on
  envoie reps + charge sans le code d'exercice (qui exige la table d'enums du
  SDK officiel). Donc Garmin ne nommera pas l'exercice — il montrera la série
  avec ses reps/charge. À ajouter en étape suivante une fois la base validée.
- **Schéma de reps** (ex. 21-15-9) : un `set` par mouvement avec le **total**
  des reps (45). On pourra découper en un set par tranche plus tard.
- **Charge** : seule la charge RX en kg est transmise (le scaled n'est pas dans
  le modèle structuré).
- **Validation** : la **structure binaire** (en-tête, tailles, définitions, les
  deux CRC, parcours complet) est vérifiée par un décodeur de contrôle. La
  validation **sémantique** (acceptation réelle par Garmin) dépend de ton test.

## Suite possible après validation

1. Ajouter la `category`/`category_subtype` d'exercice FIT (mapping déjà amorcé
   dans `movements.js` via le champ `fit`) pour que Garmin **nomme** les
   mouvements.
2. Affiner sport/sub_sport selon le type de WOD (hiit, strength, cardio).
3. Découper le schéma en sets distincts.
