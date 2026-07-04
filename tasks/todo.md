# Skill `update-harness` (remplace la commande CLI `update`)

Objectif : le coaché tape « mets à jour mon harness » dans son outil IA ; le skill embarqué va chercher le template curé sur Nardjo/cerberus et applique les mises à jour, sans jamais écraser silencieusement ses modifications.

## Design retenu

- Pivot : plus de sous-commande CLI ; l'update est un **skill livré dans le harness** (`extras/update-harness/`), inspiré de `sync-mattpocock-skills` mais côté coaché, sourcé sur `github.com/Nardjo/cerberus` (template curé, pas mattpocock brut).
- Le skill orchestre (clone/pull dans `.cerberus/upstream/`, tableau, diffs, AskUserQuestion, re-run `setup.sh`) ; la logique de merge vit dans un **moteur embarqué** `scripts/update.mjs` (autonome, Node ≥ 18) : `check` classe chaque unité, `apply` applique et réécrit le manifest.
- Statuts : `new` (ajout), `update` (fix amont, jamais touché → remplacement silencieux), `conflict` (modifié des deux côtés → diff + question), `local` (modifié localement, rien de neuf → laissé), `ok`.
- Manifest `.cerberus/manifest.json` (hashes livrés) écrit au scaffold, bootstrappé par `apply` sur les harness 0.3.0 sans manifest.
- Jamais touchés : `CLAUDE.md`/`AGENTS.md`, skills persos, skills retirés de la curation. Backups dans `.cerberus/backup/`.

## Étapes

- [x] `src/manifest.js` + écriture du manifest dans `scaffold.js`
- [x] `extras/update-harness/scripts/update.mjs` : moteur check/apply autonome
- [x] `extras/update-harness/SKILL.md` : orchestration (localisation du harness via readlink, clone/pull, tableau, conflits, apply, setup.sh)
- [x] Retrait de la commande CLI (`src/update.js`, routing bin, message d'usage)
- [x] `build/manifest.js` : EXTRAS += update-harness ; template régénéré (21 skills)
- [x] Tests : `test/update.test.js` (10 cas sur le moteur) + assertion manifest dans `scaffold.test.js`
- [x] README : section update réécrite autour du skill

## Review

- 44 tests passent + smoke test : scaffold réel → moteur invoqué depuis le harness comme le fera le skill (`check` tout `ok`, modif locale → `local`, `apply []` bootstrap).
- Le moteur duplique volontairement les helpers de hash de `src/manifest.js` : il doit tourner seul dans le harness du coaché, sans le repo.
- La version écrite dans le manifest vient du `package.json` du clone upstream.
- Les décisions « garder » ne sont pas mémorisées : un conflit refusé est reproposé tant qu'il existe (choix assumé, entrées manifest préservées).
