import { type Book } from './api';

const SAVED_BOOKS_KEY = 'smartshelf_saved_books';

export function getSavedBooks(): Book[] {
  const data = localStorage.getItem(SAVED_BOOKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBook(book: Book) {
  const saved = getSavedBooks();
  if (!saved.find((b) => b.title === book.title)) {
    saved.unshift(book);
    localStorage.setItem(SAVED_BOOKS_KEY, JSON.stringify(saved));
  }
}

export function unsaveBook(bookTitle: string) {
  const saved = getSavedBooks();
  const filtered = saved.filter((b) => b.title !== bookTitle);
  localStorage.setItem(SAVED_BOOKS_KEY, JSON.stringify(filtered));
}

export function isBookSaved(bookTitle: string): boolean {
  return getSavedBooks().some((b) => b.title === bookTitle);
}

// Keep old exports temporarily to avoid breaking builds while refactoring
export const getWishlist = getSavedBooks;
export const addToWishlist = saveBook;
export const removeFromWishlist = unsaveBook;
export const isInWishlist = isBookSaved;
