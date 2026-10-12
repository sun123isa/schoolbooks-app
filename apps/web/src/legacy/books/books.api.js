// URL de base de l'API (à adapter si tu changes de port ou d'hôte).
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Récupère la liste des livres depuis l'API.
 * @param {Object} filters - Filtres optionnels : { level?, subject?, q? }
 * @returns {Promise<Array>} - Tableau de livres.
 */
export async function fetchBooks(filters = {}) {
  // Construction de la query string à partir des filtres.
  const params = new URLSearchParams();

  if (filters.level && filters.level.trim() !== '') {
    params.append('level', filters.level.trim());
  }

  if (filters.subject && filters.subject.trim() !== '') {
    params.append('subject', filters.subject.trim());
  }

  if (filters.q && filters.q.trim() !== '') {
    params.append('q', filters.q.trim());
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/books${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    // On essaie de lire le message d'erreur renvoyé par l'API.
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erreur HTTP ${response.status}`);
  }

  const json = await response.json();

  // Notre API renvoie : { success: true, data: { items: [...], count: N } }
  return json.data?.items || [];
}