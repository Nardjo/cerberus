---
name: prd-to-plan
description: Transforme un PRD en plan d'implémentation multi-phases via des tracer bullets verticaux, sauvegardé comme fichier Markdown dans ./plans/. Utilise quand l'utilisateur veut découper un PRD, créer un plan d'implémentation, planifier des phases depuis un PRD, ou mentionne "tracer bullets".
allowed-tools: Read, Grep, Glob, Write, AskUserQuestion
argument-hint: "[PRD en contexte ou chemin vers fichier PRD]"
---

# PRD vers Plan

Découpe un PRD en plan d'implémentation par phases via des slices verticaux (tracer bullets). La sortie est un fichier Markdown dans `./plans/`.

## Processus

### 1. Confirmer la présence du PRD

Le PRD doit déjà être dans le contexte de conversation. Si ce n'est pas le cas, demande à l'utilisateur de le coller ou de te pointer vers le fichier.

### 2. Explorer le codebase

Si tu n'as pas déjà exploré le codebase, fais-le pour comprendre l'architecture actuelle, les patterns existants, et les couches d'intégration.

### 3. Identifier les décisions architecturales durables

Avant de découper, identifie les décisions de haut niveau qui ont peu de chances de changer pendant l'implémentation :

- Structures de routes / patterns d'URL
- Forme du schéma de base de données
- Modèles de données clés
- Approche d'authentification / autorisation
- Frontières des services tiers

Ces décisions vont dans l'en-tête du plan pour que chaque phase puisse y faire référence.

### 4. Découper en slices verticaux

Décompose le PRD en phases **tracer bullet**. Chaque phase est un slice vertical fin qui traverse TOUTES les couches d'intégration end-to-end, PAS un slice horizontal d'une seule couche.

<regles-slice-vertical>
- Chaque slice livre un chemin étroit mais COMPLET à travers toutes les couches (schéma, API, UI, tests)
- Un slice terminé est démontrable ou vérifiable indépendamment
- Préfère plusieurs slices fins à peu de slices épais
- N'inclus PAS de noms de fichiers spécifiques, noms de fonctions, ou détails d'implémentation susceptibles de changer à mesure que les phases suivantes sont construites
- INCLUS les décisions durables : chemins de routes, formes de schéma, noms de modèles de données
</regles-slice-vertical>

### 5. Valider avec l'utilisateur

Présente le découpage proposé comme une liste numérotée. Pour chaque phase, montre :

- **Titre** : nom court et descriptif
- **User stories couvertes** : quelles user stories du PRD cette phase adresse

Demande à l'utilisateur :

- La granularité te semble-t-elle correcte ? (trop grossière / trop fine)
- Des phases devraient-elles être fusionnées ou découpées davantage ?

Itère jusqu'à ce que l'utilisateur approuve le découpage.

### 6. Écrire le fichier de plan

Crée `./plans/` s'il n'existe pas. Écris le plan comme un fichier Markdown nommé d'après la feature (ex: `./plans/onboarding-utilisateur.md`). Utilise le template ci-dessous.

<template-plan>
# Plan : <Nom de la feature>

> PRD source : <identifiant court ou lien>

## Décisions architecturales

Décisions durables qui s'appliquent à toutes les phases :

- **Routes** : ...
- **Schéma** : ...
- **Modèles clés** : ...
- (ajoute/supprime des sections selon le besoin)

---

## Phase 1 : <Titre>

**User stories** : <liste depuis le PRD>

### Ce qu'il faut construire

Description concise de ce slice vertical. Décris le comportement end-to-end, pas l'implémentation couche par couche.

### Critères d'acceptation

- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

---

## Phase 2 : <Titre>

**User stories** : <liste depuis le PRD>

### Ce qu'il faut construire

...

### Critères d'acceptation

- [ ] ...

<!-- Répéter pour chaque phase -->
</template-plan>

## Règles strictes

- **Jamais de chemin de fichier** dans le plan (volatil)
- **Jamais de nom de fonction** dans le plan (volatil)
- **Toujours des décisions durables** uniquement dans la section architecturale
- **Chaque phase doit être démontrable seule** — si non, c'est un slice horizontal, redécoupe

## Étape suivante

Une fois le plan validé et écrit, l'étape suivante est `/tdd` pour exécuter la première phase en rouge-vert.
