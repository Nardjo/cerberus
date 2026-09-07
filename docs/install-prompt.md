# Prompt d'installation Cerberus

Copie-colle le bloc ci-dessous dans **n'importe quel agent / LLM** qui peut lancer des commandes (Claude Code, Cursor, Codex, OpenCode, Antigravity, Grok, ChatGPT, etc.).

```
Installe mon harness Cerberus.

1. Prérequis : Node.js >= 18, macOS. Vérifie Node (`node -v`). Si Node manque ou est trop vieux, dis-moi comment l'installer et arrête.
2. Choisis un nom de dossier (défaut : `mon-harness`). Si le dossier existe déjà, demande-moi un autre nom — ne l'écrase pas.
3. Depuis le répertoire où je travaille, lance exactement :
   npx --yes github:Nardjo/cerberus <dossier>
   (ou l'équivalent : `pnpm dlx` / `yarn dlx` / `bunx` si c'est mon package manager.)
4. Ne clone pas le repo à la main, ne réécris pas setup.sh, ne pose pas de questions hors du nom de dossier.
5. À la fin, résume : chemin du dossier créé, outils branchés (d'après la sortie), et dis-moi de lire `<dossier>/README.md`.

Si tu ne peux pas exécuter de commandes shell : affiche la commande exacte à coller dans mon terminal et arrête.
```

Lien raw (partage) : https://raw.githubusercontent.com/Nardjo/cerberus/main/docs/install-prompt.md
