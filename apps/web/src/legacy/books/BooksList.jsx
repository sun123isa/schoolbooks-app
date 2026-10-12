import { useEffect, useState } from 'react';
import { fetchBooks } from '../services/books.api.js';

/**
 * Composant qui affiche la liste des livres.
 * Pour l'instant, pas de filtres dans l'interface, on affiche tout.
 */
export function BooksList() {
  // État pour stocker la liste des livres.
  const [books, setBooks] = useState([]);

  // État pour savoir si on est en train de charger.
  const [isLoading, setIsLoading] = useState(true);

  // État pour stocker une éventuelle erreur.
  const [error, setError] = useState(null);

  // Effet exécuté au montage du composant pour charger les livres.
  useEffect(() => {
    let cancelled = false;

    async function loadBooks() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchBooks();

        if (!cancelled) {
          setBooks(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Erreur inconnue');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBooks();

    // Fonction de nettoyage appelée si le composant est démonté.
    return () => {
      cancelled = true;
    };
  }, []);

  // Affichage pendant le chargement.
  if (isLoading) {
    return <p>Chargement des livres...</p>;
  }

  // Affichage en cas d'erreur.
  if (error) {
    return (
      <div style={{ color: 'red' }}>
        <p>Erreur lors du chargement des livres :</p>
        <p>{error}</p>
      </div>
    );
  }

  // Affichage de la liste.
  if (books.length === 0) {
    return <p>Aucun livre disponible pour le moment.</p>;
  }

  return (
    <div>
      <h2>Liste des livres</h2>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> – {book.level} – {book.subject}
            {book.author ? ` – ${book.author}` : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}