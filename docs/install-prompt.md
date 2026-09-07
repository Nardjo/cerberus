# Prompt d'installation Cerberus

Copie-colle le bloc ci-dessous dans **n'importe quel agent / LLM** qui peut lancer des commandes (Claude Code, Cursor, Codex, OpenCode, Antigravity, Grok, ChatGPT, etc.).

```
Installe mon harness Cerberus.

1. Prérequis : Node.js >= 18, macOS. Vérifie Node (`node -v`). Si Node manque ou est trop vieux, dis-moi comment l'installer et arrête.
2. Demande-moi où je veux le mettre sur ma machine (chemin parent, ex. `~/Projects`). Nom du dossier : `cerberus` par défaut — propose-le, change seulement si je le demande ou s'il existe déjà.
3. Depuis ce chemin parent, lance exactement :
   npx --yes github:Nardjo/cerberus cerberus
   (adapte le dernier argument si j'ai choisi un autre nom ; ou `pnpm dlx` / `yarn dlx` / `bunx` selon mon package manager.)
4. Ne clone pas le repo à la main, ne réécris pas setup.sh. Ne pose de questions que pour l'emplacement (et le nom si besoin).
5. À la fin, résume : chemin absolu du dossier créé, outils branchés (d'après la sortie), et dis-moi de lire `<dossier>/README.md`.

Si tu ne peux pas exécuter de commandes shell : affiche la commande exacte à coller dans mon terminal et arrête.
```

Lien raw (partage) : https://raw.githubusercontent.com/Nardjo/cerberus/main/docs/install-prompt.md
