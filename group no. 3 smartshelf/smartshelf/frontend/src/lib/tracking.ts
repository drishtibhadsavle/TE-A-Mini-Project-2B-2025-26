import { type Book } from './api';

const TRACKING_KEY = 'smartshelf_interactions';

export interface InteractionHistory {
  genreCount: Record<string, number>;
  clickedBooks: { title: string; genre: string }[];
  searchHistory: string[];
}

export function getInteractionHistory(): InteractionHistory {
  const data = localStorage.getItem(TRACKING_KEY);
  return data ? JSON.parse(data) : { genreCount: {}, clickedBooks: [], searchHistory: [] };
}

export function trackClick(book: Book) {
  const history = getInteractionHistory();
  const genre = book.genre || 'General';
  
  // Update genre count
  history.genreCount[genre] = (history.genreCount[genre] || 0) + 1;
  
  // Update clicked books (limit to 20 last)
  if (!history.clickedBooks.find(b => b.title === book.title)) {
    history.clickedBooks.unshift({ title: book.title, genre });
    if (history.clickedBooks.length > 20) history.clickedBooks.pop();
  }
  
  localStorage.setItem(TRACKING_KEY, JSON.stringify(history));
  console.log('Tracked click:', book.title, 'Genre:', genre);
}

export function trackSearch(query: string) {
  if (!query.trim()) return;
  const history = getInteractionHistory();
  
  // Add to search history (limit to 10 last, no duplicates)
  const q = query.trim().toLowerCase();
  if (!history.searchHistory.includes(q)) {
    history.searchHistory.unshift(q);
    if (history.searchHistory.length > 10) history.searchHistory.pop();
  }
  
  // If search query matches a genre, update genre count
  const commonGenres = ['fiction', 'mystery', 'romance', 'history', 'science', 'technology', 'fantasy', 'thriller', 'biography'];
  commonGenres.forEach(genre => {
    if (q.includes(genre)) {
      history.genreCount[genre] = (history.genreCount[genre] || 0) + 1;
    }
  });

  localStorage.setItem(TRACKING_KEY, JSON.stringify(history));
  console.log('Tracked search:', query);
}

export function getTopGenre(): string | null {
  const history = getInteractionHistory();
  const genres = Object.keys(history.genreCount);
  if (genres.length === 0) return null;
  
  return genres.reduce((a, b) => 
    history.genreCount[a] > history.genreCount[b] ? a : b
  );
}
