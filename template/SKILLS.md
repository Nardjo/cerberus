# Skills

Skills disponibles dans ce harness. Chacun vit dans `skills/<nom>/SKILL.md`.

| Skill | Description |
| --- | --- |
| `setup-matt-pocock-skills` | Configure ce repo pour les skills d'ingénierie : met en place son gestionnaire d'issues, le vocabulaire des labels de triage et l'organisation des docs de domaine. À lancer une fois avant la première utilisation des autres skills d'ingénierie. |
| `ask-matt` | Demande quel skill ou flux convient à ta situation. Un routeur vers les skills invocables de ce repo. |
| `grill-with-docs` | Un interrogatoire sans relâche pour affiner un plan ou une conception, qui crée aussi la documentation (ADR et glossaire) au fil de l'eau. |
| `grill-me` | Un interrogatoire sans relâche pour affiner un plan ou une conception. |
| `grilling` | Interroge l'utilisateur sans relâche sur un plan ou une conception. À utiliser quand l'utilisateur veut éprouver un plan avant de construire, ou emploie une formule déclencheuse « grill ». |
| `research` | Enquête une question auprès de sources primaires de confiance et capture les findings en Markdown dans le repo. À utiliser pour déléguer une recherche docs/API à un agent en arrière-plan. |
| `prototype` | Construis un prototype jetable pour étoffer une conception : une app terminal exécutable pour les questions d'état ou de logique métier, ou plusieurs variantes d'UI radicalement différentes basculables depuis une seule route. |
| `wayfinder` | Planifie un gros morceau de travail — trop gros pour une session agent — comme une carte partagée de tickets de décision sur le tracker, résolus un par un jusqu'à ce que la route soit claire. |
| `to-spec` | Transforme la conversation en cours en spec et la publie sur le gestionnaire d'issues du projet : pas d'interrogatoire, juste la synthèse de ce qui a déjà été discuté. |
| `to-tickets` | Découpe un plan, une spec ou la conversation en tickets tracer-bullet, chacun déclarant ses edges bloquantes, publiés sur le tracker configuré (texte local ou liens natifs). |
| `implement` | Implémente un travail à partir d'une spec ou d'un ensemble de tickets. |
| `tdd` | Développement piloté par les tests (TDD). À utiliser quand l'utilisateur veut construire des fonctionnalités ou corriger des bugs en mode test-first, mentionne « red-green-refactor », ou veut des tests d'intégration. |
| `code-review` | Revue des changements depuis un point fixe (commit, branche, tag ou merge-base) sur deux axes — Standards et Spec — en sous-agents parallèles. À utiliser pour revoir une branche, une PR, du WIP, ou sur « review since X ». |
| `triage` | Fait avancer les issues et les PR externes à travers une machine à états de rôles de triage : catégoriser, vérifier, interroger si besoin, et rédiger des briefs prêts pour un agent. |
| `diagnosing-bugs` | Boucle de diagnostic pour les bugs difficiles et les régressions de performance. À utiliser quand l'utilisateur dit « diagnostique »/« debug ça », ou signale quelque chose de cassé, qui plante, qui échoue ou qui est lent. |
| `improve-codebase-architecture` | Analyse une base de code à la recherche d'opportunités d'approfondissement, les présente sous forme de rapport HTML visuel, puis approfondit par interrogatoire celle que tu choisis. |
| `codebase-design` | Vocabulaire commun pour concevoir des modules profonds. À utiliser quand l'utilisateur veut concevoir ou améliorer l'interface d'un module, repérer des opportunités d'approfondissement, décider de l'emplacement d'une couture (seam), rendre le code plus testable ou navigable par l'IA, ou quand un autre skill a besoin du vocabulaire des modules profonds. |
| `domain-modeling` | Construire et affiner le modèle de domaine d'un projet. À utiliser quand l'utilisateur veut fixer la terminologie du domaine ou un langage omniprésent, consigner une décision d'architecture, ou quand un autre skill doit maintenir le modèle de domaine. |
| `handoff` | Condense la conversation en cours en un document de passation qu'un autre agent peut reprendre. |
| `resolving-merge-conflicts` | À utiliser quand tu dois résoudre un conflit de merge/rebase git en cours. |
| `teach` | Enseigne à l'utilisateur un nouveau skill ou concept, au sein de cet espace de travail. |
| `writing-great-skills` | Référence pour bien écrire et éditer des skills : le vocabulaire et les principes qui rendent un skill prévisible. |
| `caveman` | Mode de communication ultra-compressé. Réduit l'usage de tokens d'environ 75 % en supprimant le superflu, les articles et les formules de politesse, tout en gardant une précision technique totale. À utiliser quand l'utilisateur dit « caveman mode », « parle comme un homme des cavernes », « use caveman », « moins de tokens », « sois bref », ou invoque /caveman. |
| `update-harness` | Met à jour ce harness Cerberus depuis le repo curé Nardjo/cerberus : nouveaux skills, corrections des skills existants, SKILLS.md, setup.sh. Détecte les modifications locales et ne remplace jamais sans montrer le diff et demander confirmation. Utiliser quand : \"update harness\", \"mets à jour mon harness\", \"update mon harness\", \"nouveaux skills\", \"sync harness\". |
