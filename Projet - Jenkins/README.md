# Pipeline de CI/CD DevOps avec Jenkins
## ECV - M1 Dev - Master Lead Developement Frontend 2025 - 2026
### Projet DevOps - Intervenant : Yaya DOUMBIA
### Romain THÉRY
---

## Introduction

### Objectifs du projet :
- Mise en place d’une architecture DevOps d’entreprise
- Configuration de l’infrastructure adapté au déploiement continu
- Mettre en place des mesures de sécurité et de surveillance strictes

### Processus du pipeline

Le pipeline est présenté comme un flux de travail linéaire et entièrement automatisé, orchestré par Jenkins. Chaque étape intègre des outils spécifiques pour garantir la qualité, la sécurité et l'efficacité du processus de livraison logicielle.

#### 1. Gestion de la tâche et développement
- Processus : Le cycle débute par la création d'un ticket dans Jira par un client. Un développeur prend en charge la tâche, développe le code en local et effectue les premiers tests.
- Outils : (Jira, Git Bash)
#### 2. Contrôle de version
- Processus : Le code source est poussé vers un dépôt GitHub privé, déclenchant automatiquement le pipeline.
- Outils : (Git, GitHub)
#### 3. Intégration Continue (CI) / Orchestration Jenkins
- Compilation : Jenkins récupère le code et le compile avec Maven pour détecter les erreurs de syntaxe.
- Tests Unitaires : Les tests unitaires sont exécutés pour valider la logique métier du code.
#### 4. Analyse de Qualité et de sécurité / DevSecOps
- Qualité du Code : SonarQube analyse statiquement le code pour identifier les bugs, les "code smells" et les vulnérabilités.
- Scan du Code Source : Trivy scanne le code et ses dépendances pour détecter des données sensibles ou des bibliothèques obsolètes et vulnérables.
#### 5. Gestion des artefacts
- Construction de l'Artefact : Maven package l'application pour créer un artefact (ex. : un fichier .jar).
- Publication de l'Artefact : L'artefact est publié sur Nexus Repository pour une gestion centralisée des versions.
#### 6. Conteneurisation et Scan de sécurité
- Construction de l'Image : Une image Docker est construite à partir de l'artefact.
- Scan de l'Image : Trivy est de nouveau utilisé pour scanner l'image Docker à la recherche de vulnérabilités au niveau du conteneur.
- Publication de l'Image : L'image validée est poussée vers un registre tel que Docker Hub.
#### 7. Déploiement Continu (CD)
- Scan de Sécurité du Cluster : KubeAudit analyse le cluster Kubernetes pour s'assurer qu'il respecte les bonnes pratiques de sécurité avant le déploiement.
- Déploiement : L'application conteneurisée est déployée sur le cluster Kubernetes.
#### 8. Notification et Surveillance
- Notification : Un e-mail est envoyé pour notifier les équipes du succès ou de l'échec du pipeline.
- Surveillance : L'application et l'infrastructure sont surveillées en continu via Blackbox Exporter (disponibilité web) et Node Exporter (ressources système), avec des tableaux de bord sur Grafana.

---

## ..

---

## Conclusion

