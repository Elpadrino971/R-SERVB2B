# Spécification - Réservations, Paiement & Allotment

## 1. Les 4 volets de paiement

| Mode | Description | Qui paie | Commission agent |
|------|-------------|----------|------------------|
| **pay_on_arrival** | Paiement sur place à la récupération du véhicule | Client (à l'agence) | ✅ Toujours calculée et versée |
| **pay_by_agency** | Facturation / compte agence | Agence (facture) | ✅ Toujours calculée et versée |
| **pay_by_link** | Paiement en ligne via lien envoyé au client | Client (en ligne) | ✅ Toujours calculée et versée |

**Dans les 3 cas** : l'app calcule la commission de l'agent et la verse (quand la réservation est complétée).

> **Note** : `pay_by_link` nécessite un prestataire de paiement (Stripe, etc.). Actuellement désactivé. L'endpoint `/api/payments/create-link` retourne 501.

## 2. Allotment (quota véhicules par site)

- **Quoi** : Planification des quantités par type de véhicule, par agence, par période
- **Exemple** : Agence PTP, catégorie SUV, du 01/03 au 31/03 : 10 véhicules alloués
- **Statut dégressif** : selon le nombre restant

| Restant | Statut | Affichage |
|---------|--------|-----------|
| > 5 | `available` | Disponible |
| 1 à 5 | `limited` | Places limitées |
| 1 | `last` | Dernière place |
| 0 | `sold_out` | Complet |

## 3. Modèle de données

### Reservation
- `payment_mode` : "pay_on_arrival" | "pay_by_agency" | "pay_by_link"
- `commission_amount` : toujours rempli si agent_id
- `payment_status` : pending, prepaid, paid (selon le mode)

### VehicleAllotment
- `agency_id`, `category_id`
- `date_start`, `date_end`
- `quantity` : quota max
- Calcul dynamique : réservations (pending, confirmed, prepaid, completed) sur la période

## 4. API

### Réservations
- `POST /api/reservations` : body inclut `payment_mode` (pay_on_arrival, pay_by_agency, pay_by_link)
- Commission agent calculée automatiquement si agent connecté

### Allotment
- `GET /api/allotments/availability?agency_id=&category_id=&pickup_date=&return_date=` : statut dégressif
- `GET /api/allotments?agency_id=&category_id=` : liste des allotments
- `POST /api/admin/allotments` : créer (admin)
- `PUT /api/admin/allotments/{id}` : modifier (admin)
- `DELETE /api/admin/allotments/{id}` : désactiver (admin)
