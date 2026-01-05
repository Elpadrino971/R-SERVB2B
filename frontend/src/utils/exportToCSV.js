/**
 * Utilitaire pour exporter des données en CSV
 */

/**
 * Convertit un tableau d'objets en CSV
 * @param {Array} data - Tableau d'objets à exporter
 * @param {Array} columns - Colonnes à inclure [{key, label}]
 * @param {String} filename - Nom du fichier à télécharger
 */
export const exportToCSV = (data, columns, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    throw new Error('Aucune donnée à exporter');
  }

  // Créer l'en-tête CSV
  const headers = columns.map(col => col.label).join(',');

  // Créer les lignes CSV
  const rows = data.map(item => {
    return columns.map(col => {
      let value = getNestedValue(item, col.key);

      // Formatter les valeurs
      if (col.format && typeof col.format === 'function') {
        value = col.format(value, item);
      }

      // Échapper les virgules et guillemets
      if (value === null || value === undefined) {
        return '';
      }

      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    }).join(',');
  });

  // Combiner headers et rows
  const csv = [headers, ...rows].join('\n');

  // Créer le Blob et télécharger
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Récupère une valeur nested dans un objet (ex: "user.name")
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Formatters communs pour les exports CSV
 */
export const csvFormatters = {
  date: (value) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('fr-FR');
  },

  datetime: (value) => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleString('fr-FR');
  },

  currency: (value) => {
    if (value === null || value === undefined) return '0,00 €';
    return `${parseFloat(value).toFixed(2).replace('.', ',')} €`;
  },

  percentage: (value) => {
    if (value === null || value === undefined) return '0%';
    return `${parseFloat(value).toFixed(2)}%`;
  },

  boolean: (value) => {
    return value ? 'Oui' : 'Non';
  },

  status: (value) => {
    const statusMap = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      prepaid: 'Prépayée',
      completed: 'Terminée',
      cancelled: 'Annulée',
      no_show: 'No show',
      paid: 'Payé',
      unpaid: 'Impayé'
    };
    return statusMap[value] || value;
  },

  role: (value) => {
    const roleMap = {
      admin: 'Administrateur',
      agent: 'Agent',
      company: 'Entreprise',
      influencer: 'Influenceur'
    };
    return roleMap[value] || value;
  }
};

/**
 * Configurations d'export prédéfinies
 */
export const exportConfigs = {
  reservations: {
    columns: [
      { key: 'reference', label: 'Référence' },
      { key: 'created_at', label: 'Date création', format: csvFormatters.date },
      { key: 'pickup_date', label: 'Date départ', format: csvFormatters.date },
      { key: 'return_date', label: 'Date retour', format: csvFormatters.date },
      { key: 'driver_info.first_name', label: 'Prénom client' },
      { key: 'driver_info.last_name', label: 'Nom client' },
      { key: 'driver_info.email', label: 'Email client' },
      { key: 'vehicle_category_id', label: 'Catégorie véhicule' },
      { key: 'pickup_agency_id', label: 'Agence départ' },
      { key: 'return_agency_id', label: 'Agence retour' },
      { key: 'total_price', label: 'Montant total', format: csvFormatters.currency },
      { key: 'commission_amount', label: 'Commission', format: csvFormatters.currency },
      { key: 'status', label: 'Statut', format: csvFormatters.status },
      { key: 'payment_status', label: 'Paiement', format: csvFormatters.status },
      { key: 'payment_method', label: 'Mode paiement' }
    ],
    filename: 'reservations.csv'
  },

  users: {
    columns: [
      { key: 'email', label: 'Email' },
      { key: 'first_name', label: 'Prénom' },
      { key: 'last_name', label: 'Nom' },
      { key: 'phone', label: 'Téléphone' },
      { key: 'role', label: 'Rôle', format: csvFormatters.role },
      { key: 'created_at', label: 'Date inscription', format: csvFormatters.date },
      { key: 'is_active', label: 'Actif', format: csvFormatters.boolean },
      { key: 'commission_rate', label: 'Taux commission', format: csvFormatters.percentage }
    ],
    filename: 'utilisateurs.csv'
  },

  commissions: {
    columns: [
      { key: 'reservation_reference', label: 'Référence' },
      { key: 'date', label: 'Date', format: csvFormatters.date },
      { key: 'client_name', label: 'Client' },
      { key: 'amount', label: 'Montant réservation', format: csvFormatters.currency },
      { key: 'commission_rate', label: 'Taux', format: csvFormatters.percentage },
      { key: 'commission_amount', label: 'Commission', format: csvFormatters.currency },
      { key: 'status', label: 'Statut', format: csvFormatters.status }
    ],
    filename: 'commissions.csv'
  }
};
