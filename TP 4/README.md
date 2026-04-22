# Déploiement d'une application en micro-service sur Azure
## ECV - M1 Dev - Master Lead Developement Frontend 2025 - 2026
### DevOps TP 4 - Intervenant : Yaya DOUMBIA
### Romain THÉRY
---

## Introduction

### Objectifs
- Création et envoi (push) d’une image Docker sur Docker Hub
- Définition de « Azure App Service »
- Déployer une application multi-conteneur en Azure App service

## WIP

### Mise en place du repository sur DockerHub

Création du repository sur DockerHub pour héberger les images Docker des microservices.

![Création du repository](screenshots/dockerhub_repo_creation.png)

Vue générale du repository après création, prêt à recevoir les images

![Vue générale du repository](screenshots/dockerhub_repo_general.png)

### Modification du docker-compose

On modifie le fichier `docker-compose.yml` pour utiliser les images Docker hébergées sur Docker Hub, si les images sont déjà poussées, sinon on peut les construire localement et les pousser ensuite.

```yml
#...

auth:
  image: theryromain/ecv-devops:auth-0.1

#...

produit:
  image: theryromain/ecv-devops:produit-0.1

#...

commande:
  image: theryromain/ecv-devops:commande-0.1

#...
```

---

## Conclusion

### WIP