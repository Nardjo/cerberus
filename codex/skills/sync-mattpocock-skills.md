---
name: sync-mattpocock-skills
description: Synchronise les skills depuis le repo upstream mattpocock/skills (GitHub) vers cerberus. Détecte les nouveaux skills et les mises à jour, affiche un tableau de statuts, propose les diffs avant import. Utiliser quand : "sync skills", "update mattpocock", "nouveaux skills mattpocock", "mettre à jour les skills".
allowed-tools: Bash, AskUserQuestion
argument-hint: [--all|--check|<skill-name>]
---

# Sync Mattpocock Skills

Synchronise les skills depuis https://github.com/mattpocock/skills vers cerberus.

## Paths

```
CERBERUS=/Users/jordanbastin/Developer/cerberus
UPSTREAM=$CERBERUS/upstream/mattpocock-skills
SKILLS_LOCAL=$CERBERUS/claude/skills
SKILLS_UPSTREAM=$UPSTREAM/skills
```

## Étapes

### 1. Clone / pull upstream

```bash
if [ -d "$UPSTREAM/.git" ]; then
  git -C "$UPSTREAM" pull --ff-only
else
  git clone https://github.com/mattpocock/skills "$UPSTREAM"
fi
```

### 2. Inventaire et comparaison

Lister tous les skills upstream (hors `deprecated/`) :

```bash
find "$SKILLS_UPSTREAM" -mindepth 2 -maxdepth 2 -type d | grep -v deprecated
```

Pour chaque skill `NAME` (basename du path trouvé) :

- Pas de `$SKILLS_LOCAL/$NAME/` → **`[NEW]`**
- Existe mais `diff -rq <upstream> <local>` détecte des différences → **`[UPDATED]`**
- Identique → **`[OK]`**

### 3. Tableau récap

```
SKILL                          CATÉGORIE       STATUS
──────────────────────────────────────────────────────
diagnose                       engineering     [OK]
tdd                            engineering     [UPDATED]
zoom-out                       engineering     [NEW]
caveman                        productivity    [OK]
```

### 4. Sélection et import

**Comportement selon l'argument :**

| Argument | Comportement |
|----------|-------------|
| _(aucun)_ | Importer tous les `[NEW]` et `[UPDATED]` |
| `--check` | Afficher le tableau uniquement, sans importer |
| `--all` | Importer aussi les `[OK]` (réimport forcé) |
| `<skill-name>` | Importer uniquement ce skill |

**Avant d'écraser un `[UPDATED]`** : afficher le diff complet et demander confirmation via AskUserQuestion.

Import d'un skill :

```bash
SRC=$(find "$SKILLS_UPSTREAM" -mindepth 2 -maxdepth 2 -type d -name "$NAME" | grep -v deprecated | head -1)
cp -r "$SRC/" "$SKILLS_LOCAL/$NAME/"
```

### 5. Refresh symlinks

```bash
cd "$CERBERUS" && ./setup.sh install claude
```

### 6. Résumé final

Lister les skills importés/mis à jour avec leur catégorie.

## Règles

- Ignorer `deprecated/` par défaut (sauf si `--all` ET l'utilisateur confirme explicitement)
- Ne jamais écraser un skill `[UPDATED]` sans montrer le diff et obtenir confirmation
- Si un skill local n'existe pas dans l'upstream, ne pas le toucher
