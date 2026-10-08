import {
  listBooks as listBooksRepository,
  findBookById,
  createBook as createBookRepository,
  updateBook as updateBookRepository,
  deactivateBook as deactivateBookRepository,
  incrementDownloadCount,
  listBooksByTrainer as listBooksByTrainerRepository,
  updateTrainerBook as updateTrainerBookRepository,
  deactivateTrainerBook as deactivateTrainerBookRepository,
  activateTrainerBook as activateTrainerBookRepository,
  deleteTrainerBook as deleteTrainerBookRepository
} from '../repositories/books.repository.js';






export async function listBooks(filters) {
  return listBooksRepository(filters);
}

export async function getBookById(id) {
  const book = await findBookById(id);

  if (!book) {
    const error = new Error('Livre introuvable');
    error.status = 404;
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  return book;
}

export async function createBook(data) {
  return createBookRepository(data);
}

export async function updateBook(id, data) {
  const book = await updateBookRepository(id, data);

  if (!book) {
    const error = new Error('Livre introuvable');
    error.status = 404;
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  return book;
}

export async function deactivateBook(id) {
  const book = await deactivateBookRepository(id);

  if (!book) {
    const error = new Error('Livre introuvable');
    error.status = 404;
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  return book;
}

export async function registerDownload(id) {
  await incrementDownloadCount(id);
}


export async function getBooksByTrainer(trainerId) {
  return listBooksByTrainerRepository(trainerId);
}

export async function updateTrainerBook(id, trainerId, data) {
  const book = await updateTrainerBookRepository(
    id,
    trainerId,
    data
  );

  if (!book) {
    const error = new Error(
      'Livre introuvable ou vous n’êtes pas son propriétaire'
    );

    error.status = 404;
    error.code = 'BOOK_NOT_FOUND_OR_FORBIDDEN';

    throw error;
  }

  return book;
}

export async function deactivateTrainerBook(id, trainerId) {
  const book = await deactivateTrainerBookRepository(
    id,
    trainerId
  );

  if (!book) {
    const error = new Error(
      'Livre introuvable ou vous n’êtes pas son propriétaire'
    );

    error.status = 404;
    error.code = 'BOOK_NOT_FOUND_OR_FORBIDDEN';

    throw error;
  }

  return book;
}




export async function activateTrainerBook(id, trainerId) {
  const book = await activateTrainerBookRepository(
    id,
    trainerId
  );

  if (!book) {
    const error = new Error(
      'Livre introuvable ou vous n’êtes pas son propriétaire'
    );

    error.status = 404;
    error.code = 'BOOK_NOT_FOUND_OR_FORBIDDEN';

    throw error;
  }

  return book;
}

export async function deleteTrainerBook(id, trainerId) {
  const book = await deleteTrainerBookRepository(
    id,
    trainerId
  );

  if (!book) {
    const error = new Error(
      'Livre introuvable ou vous n’êtes pas son propriétaire'
    );

    error.status = 404;
    error.code = 'BOOK_NOT_FOUND_OR_FORBIDDEN';

    throw error;
  }

  return book;
}