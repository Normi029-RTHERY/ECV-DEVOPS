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

## 

### Création du repository sur DockerHub
screens

### Modification du docker-compose

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

