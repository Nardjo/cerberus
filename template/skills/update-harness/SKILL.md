---
name: "update-harness"
description: "Met à jour ce harness Cerberus depuis le repo curé Nardjo/cerberus : nouveaux skills, corrections des skills existants, SKILLS.md, setup.sh. Détecte les modifications locales et ne remplace jamais sans montrer le diff et demander confirmation. Utiliser quand : \"update harness\", \"mets à jour mon harness\", \"update mon harness\", \"nouveaux skills\", \"sync harness\"."
allowed-tools: Bash, AskUserQuestion
argument-hint: [--check]
---

# Update Harness

Met à jour le harness depuis https://github.com/Nardjo/cerberus (template curé).

## Étapes

### 1. Localiser le harness

Le harness est le dossier vers lequel pointent les symlinks des outils :

```bash
HARNESS="$(dirname "$(readlink "$HOME/.claude/CLAUDE.md")")"
```

Fallbacks si `~/.claude/CLAUDE.md` n'est pas un symlink : `readlink` sur
`~/.config/opencode/AGENTS.md`, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md`.
Si aucun ne répond, demander le chemin à l'utilisateur. Vérifier que
`$HARNESS/setup.sh` existe avant de continuer.

### 2. Clone / pull du template curé

```bash
UPSTREAM="$HARNESS/.cerberus/upstream"
if [ -d "$UPSTREAM/.git" ]; then
  git -C "$UPSTREAM" pull --ff-only
else
  git clone --depth 1 https://github.com/Nardjo/cerberus "$UPSTREAM"
fi
TEMPLATE="$UPSTREAM/template"
```

### 3. Comparaison

Le moteur de merge est embarqué dans ce skill :

```bash
ENGINE="$HARNESS/skills/update-harness/scripts/update.mjs"
node "$ENGINE" check "$HARNESS" "$TEMPLATE"
```

Il classe chaque unité (un skill = un dossier, plus `setup.sh` et `SKILLS.md`)
via le manifest `.cerberus/manifest.json` (hashes de ce qui a été livré) :

| Status | Sens | Action |
|--------|------|--------|
| `new` | Nouveau skill curé | Ajouté |
| `update` | Corrigé en amont, jamais modifié ici | Remplacé sans question |
| `conflict` | Modifié ici ET mis à jour en amont | Diff + confirmation |
| `local` | Modifié ici, rien de neuf en amont | Laissé tel quel |
| `ok` | Identique | Rien |

### 4. Tableau récap

```
UNITÉ                          STATUS
──────────────────────────────────────
skills/tdd                     [MAJ]
skills/zoom-out                [NOUVEAU]
skills/grilling                [CONFLIT]
skills/mon-skill-perso         (local, non géré)
setup.sh                       [OK]
```

Si l'argument est `--check` : s'arrêter là.

### 5. Résolution des conflits

Pour chaque unité `conflict`, montrer le diff puis demander via AskUserQuestion
(garder la version locale / prendre la nouvelle, sauvegarde dans
`.cerberus/backup/`) :

```bash
diff -ru "$HARNESS/$UNIT" "$TEMPLATE/$UNIT"
```

### 6. Application

Toujours lancer `apply`, même sans unité (sur un harness sans manifest, ça
bootstrape le manifest). Passer toutes les unités `new` + `update` + les
`conflict` acceptés :

```bash
node "$ENGINE" apply "$HARNESS" "$TEMPLATE" skills/tdd skills/zoom-out ...
```

### 7. Relier les nouveaux skills

```bash
bash "$HARNESS/setup.sh"
```

### 8. Résumé final

Lister ajouts / mises à jour / conservés, et rappeler où sont les backups.

## Règles

- Ne jamais toucher `CLAUDE.md` / `AGENTS.md` du harness : ils appartiennent à l'utilisateur.
- Ne jamais supprimer un skill absent du template (skills persos ou retirés de la curation).
- Ne jamais remplacer un `conflict` sans montrer le diff et obtenir confirmation.
- Les décisions « garder » ne sont pas mémorisées : le conflit sera reproposé tant qu'il existe.
