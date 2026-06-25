# Cerberus — create-harness

Langage du domaine pour le CLI scaffolder qui distribue le harness aux coachés. Glossaire uniquement, pas de détails d'implémentation.

## Language

**Harness**:
L'espace de travail curé et multi-provider (skills, commands, agents) qu'un coaché possède et fait évoluer. Vision Matt Pocock : Agent = Model + Harness.
_Avoid_: setup, config, dotfiles

**Provider**:
Un outil de codage IA cible vers lequel le harness se synchronise, chacun avec sa propre convention de config. Set v1 : Claude Code, OpenCode, Codex, Antigravity CLI (réutilise `~/.gemini`).
_Avoid_: tool, platform, outil

**Coaché**:
Un dev freelance du programme de coaching de Jordan qui reçoit un harness et en devient propriétaire (source de vérité locale).
_Avoid_: client, élève, user

**Starter curé**:
Le sous-ensemble de skills que le CLI installe comme contenu initial du harness. v1 = les 19 skills `engineering/` + `productivity/` de mattpocock/skills (hors `deprecated/`, `personal/`, `misc/`, `in-progress/`).
_Avoid_: template (réservé à l'implémentation)
