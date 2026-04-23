# ECV DevOps - Travaux Pratiques

Un projet DevOps complet démontrant l'apprentissage progressif à travers Node.js, les microservices, la containerisation et le déploiement cloud.

## Aperçu du projet

Ce projet fait partie du programme **M1 Dev - Master Lead Development Frontend 2025-2026** de l'**ECV**, encadré par **Yaya DOUMBIA**. Il démontre les pratiques DevOps modernes à travers des implémentations pratiques.

## Structure

### [TP 1 : Fondamentaux des API REST](https://github.com/Normi029-RTHERY/ECV-DEVOPS/tree/main/TP%201)
- Construction d'une API REST avec endpoints CRUD pour la gestion de véhicules
- Implémentation de l'authentification par cookie

**Stack** : Node.js, Express, MongoDB

#### [TP1-V2 : Version refactorisée du TP 1 utilisant TypeScript](https://github.com/Normi029-RTHERY/ECV-DEVOPS/tree/main/TP1-V2)

### [TP 2 : Architecture en Microservices](https://github.com/Normi029-RTHERY/ECV-DEVOPS/tree/main/TP%202)
- Conception d'un système de gestion de produits et de commandes basé sur les microservices
- Implémentation de trois services indépendants : Authentification, Produits et Commandes
- Communication asynchrone entre services avec RabbitMQ
- Persistance des données avec MongoDB

**Stack** : Node.js, Express, MongoDB, RabbitMQ, Docker

### [TP 3 : Conteneurisation avec Docker](https://github.com/Normi029-RTHERY/ECV-DEVOPS/tree/main/TP%203)
- Conteneurisation de l'architecture en microservices du TP 2
- Création de Dockerfiles optimisés pour chaque microservice
- Orchestration des services avec Docker Compose
- Gestion des volumes pour la persistance des données
- Configuration des variables d'environnement

**Stack technologique** : Docker, Docker Compose, Alpine Linux

### [TP 4 : Déploiement Cloud](https://github.com/Normi029-RTHERY/ECV-DEVOPS/tree/main/TP%204)
- Containerisation des microservices et envoi d'images vers Docker Hub
- Déploiement d'applications multi-conteneurs sur Azure App Service

**Stack technologique** : Docker, Docker Compose, Azure, Docker Hub

---

**Auteur** : Romain THÉRY
