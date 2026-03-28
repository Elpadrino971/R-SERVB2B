# Créer un compte Admin pour les tests

Ce guide vous permet de créer un compte **Administrateur** temporaire pour tester les fonctionnalités du Super Admin (véhicules, quantités, photos, agences, tarifs, etc.). Vous pourrez le supprimer une fois vos vrais administrateurs configurés.

---

## Méthode 1 : Inscription avec rôle Admin (Frontend)

1. Allez sur : **`/register?role=admin`**
   - Exemple : `http://localhost:2000/register?role=admin`
2. Le formulaire d'inscription affichera l'option **« Administrateur (test) »** dans le type de compte.
3. Remplissez le formulaire et sélectionnez **Administrateur (test)**.
4. Validez l'inscription.
5. Vous serez redirigé vers `/admin` et pourrez tester :
   - Gestion des véhicules (ajout, photos, quantités)
   - Gestion des agences
   - Gestion des tarifs
   - Gestion des utilisateurs
   - Etc.

**Note :** Le backend doit accepter le rôle `admin` à l'inscription. Si vous obtenez une erreur, utilisez la méthode 2.

---

## Méthode 2 : Seed du backend (si disponible)

Si votre backend expose `POST /api/admin/seed` :

```bash
curl -X POST http://localhost:8000/api/admin/seed
```

Le seed crée généralement un utilisateur admin de test. Consultez la documentation ou le code du backend pour connaître les identifiants (email/mot de passe) générés.

---

## Supprimer le compte admin de test

Une fois vos administrateurs configurés :

1. Connectez-vous avec un autre compte admin.
2. Allez dans **Admin → Utilisateurs** (`/admin/users`).
3. Trouvez le compte de test et désactivez-le ou supprimez-le selon les options disponibles.

---

## Checklist des tests Admin

- [ ] Connexion en tant qu'admin
- [ ] Dashboard : statistiques, dernières réservations
- [ ] Véhicules : ajouter, modifier, supprimer, upload photos, quantités
- [ ] Agences : CRUD, horaires
- [ ] Tarifs : saisons, grilles
- [ ] Utilisateurs : liste, activation/désactivation
- [ ] Challenges, Blog, Événements
- [ ] Exports (si implémentés)
