---
name: code-audit
description: |
  Audit code quality, security, performance, and architecture. Use when asked to:
  - Review/audit code, files, or directories
  - Check for security vulnerabilities (OWASP, injections, XSS, secrets)
  - Evaluate clean code principles (naming, DRY, SOLID, readability)
  - Analyze performance issues (complexity, memory leaks, optimizations)
  - Review architecture (patterns, coupling, separation of concerns)
  Triggers: "audit", "review code", "check security", "analyze code quality", "code review"
---

# Code Audit

Audit code for quality, security, performance, and architecture issues.

## Usage

```
/code-audit <path>           # Audit concis (défaut)
/code-audit <path> --detail  # Audit détaillé avec explications
```

## Workflow

1. **Scan** - Lire les fichiers cibles
2. **Analyze** - Évaluer selon les 4 piliers
3. **Report** - Générer le rapport avec scores et recommandations

## Les 4 Piliers

### 1. Clean Code

| Critère | Description |
|---------|-------------|
| Nommage | Variables/fonctions explicites, pas d'abréviations obscures |
| Fonctions | Courtes (<20 lignes), une seule responsabilité |
| DRY | Pas de duplication, extraction des patterns communs |
| SOLID | Single responsibility, Open/closed, Liskov, Interface segregation, Dependency inversion |
| Lisibilité | Code auto-documenté, complexité cognitive faible |

### 2. Sécurité

| Vulnérabilité | Vérifications |
|---------------|---------------|
| Injection | SQL, NoSQL, OS commands, LDAP |
| XSS | Input sanitization, output encoding |
| Auth | Hardcoded credentials, weak crypto, session management |
| Secrets | API keys, tokens, passwords dans le code |
| SSRF | URL validation, allowlists |
| Path Traversal | Input validation sur les chemins fichiers |

### 3. Performance

| Aspect | Points de contrôle |
|--------|-------------------|
| Complexité | O(n²) ou pire dans les boucles, récursion non-optimisée |
| Memory | Leaks, références circulaires, buffers non-libérés |
| I/O | Requêtes N+1, connexions non-poolées, cache absent |
| Async | Blocking calls, race conditions, deadlocks |

### 4. Architecture

| Principe | Évaluation |
|----------|------------|
| Couplage | Dépendances minimales entre modules |
| Cohésion | Fonctions liées groupées ensemble |
| Patterns | Utilisation appropriée (factory, singleton, etc.) |
| Layers | Séparation UI/Business/Data |
| Testabilité | Code injectable, mockable |

## Format du Rapport

### Mode Concis (défaut)

```markdown
## Audit: <path>

**Score Global: X/10**

| Pilier | Score | Issues |
|--------|-------|--------|
| Clean Code | X/10 | N critiques, N warnings |
| Sécurité | X/10 | N critiques, N warnings |
| Performance | X/10 | N critiques, N warnings |
| Architecture | X/10 | N critiques, N warnings |

### Issues Critiques
- [SECU] `file.ts:42` - SQL injection potentielle
- [PERF] `utils.py:15` - Complexité O(n³)

### Recommandations Prioritaires
1. ...
2. ...
```

### Mode Détaillé (--detail)

Inclure pour chaque issue:
- Explication du problème
- Exemple de code problématique
- Code corrigé suggéré
- Ressources pour approfondir

## Scoring

- **9-10**: Excellent, prêt pour production
- **7-8**: Bon, quelques améliorations mineures
- **5-6**: Acceptable, corrections recommandées
- **3-4**: Problématique, corrections nécessaires
- **1-2**: Critique, refactoring majeur requis

## Langages Supportés

Audit générique applicable à tous les langages. Adapter les patterns de détection selon:
- TypeScript/JavaScript: ESLint patterns, React/Vue anti-patterns
- Python: PEP8, type hints, async patterns
- Go: Error handling, goroutine leaks
- Rust: Ownership, unsafe blocks
- etc.
