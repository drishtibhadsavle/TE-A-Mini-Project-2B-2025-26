// API service layer — connects to your Node.js backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api';
const GOOGLE_BOOKS_KEY = 'AIzaSyAA8iPFssREvP1ZHIXWGe77jjbb1QYgMhg';

export interface Book {
  id?: number;
  title: string;
  author: string;
  description: string;
  rating: number | string;
  image: string;
  extracted_text?: string;
  processing_time?: string;
  genre?: string;
  infoLink?: string;
  pageCount?: number;
  language?: string;
  status?: 'read' | 'unread';
  timestamp?: string;
}

export interface DetectionResult {
  total_books_detected: number;
  books: Book[];
}

// Auth
export async function signup(email: string, password: string) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// Google Books
export async function searchGoogleBooks(query: string, startIndex: number = 0): Promise<Book[]> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${GOOGLE_BOOKS_KEY}&maxResults=10&startIndex=${startIndex}`
  );
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map((item: any) => {
    const v = item.volumeInfo;
    return {
      title: v.title || 'Unknown',
      author: v.authors?.[0] || 'Unknown',
      description: v.description || 'No description available.',
      rating: v.averageRating || 'N/A',
      image: v.imageLinks?.thumbnail || '',
      genre: v.categories?.[0] || 'General',
      infoLink: v.infoLink || '',
      pageCount: v.pageCount,
      language: v.language,
    };
  });
}

export async function searchGoogleBooksByGenre(genre: string, startIndex: number = 0): Promise<Book[]> {
  return searchGoogleBooks(`subject:${genre}`, startIndex);
}

// Detection (via backend → ML service)
export async function detectBooks(file: File): Promise<DetectionResult> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  } catch {
    // Fallback: demo mode with Google Books
    console.warn('Backend unavailable — running in demo mode');
    return demoDetection();
  }
}

async function demoDetection(): Promise<DetectionResult> {
  const demoTexts = ['The Great Gatsby', 'To Kill a Mockingbird', '1984 George Orwell', 'Pride and Prejudice', 'The Catcher in the Rye'];
  const books: Book[] = [];
  for (const text of demoTexts) {
    const start = performance.now();
    const results = await searchGoogleBooks(text);
    const elapsed = ((performance.now() - start) / 1000).toFixed(2);
    if (results.length > 0) {
      books.push({ ...results[0], extracted_text: text, processing_time: elapsed });
    }
  }
  return { total_books_detected: books.length, books };
}

// History
export async function saveToHistory(book: Book, providedToken?: string) {
  const token = providedToken || localStorage.getItem('smartshelf_token');
  try {
    if (!token) throw new Error('No token');
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ book }),
    });
    if (!res.ok) throw new Error('Failed to save to backend');
  } catch (err) {
    console.warn('Backend history save failed, using local storage fallback:', err);
    // Store locally as fallback
    const history = JSON.parse(localStorage.getItem('smartshelf_history') || '[]');
    // Prevent duplicates in local fallback
    const existingIndex = history.findIndex((h: Book) => h.title === book.title);
    if (existingIndex === -1) {
      history.unshift({ ...book, status: 'unread', timestamp: new Date().toISOString() });
      localStorage.setItem('smartshelf_history', JSON.stringify(history));
    }
  }
}

export async function getHistory(providedToken?: string): Promise<Book[]> {
  const token = providedToken || localStorage.getItem('smartshelf_token');
  try {
    if (!token) throw new Error('No token');
    const res = await fetch(`${API_BASE}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch from backend');
    const backendHistory = await res.json();
    const statusMap = getStatusMap();
    return backendHistory.map((b: any) => ({
      ...b,
      status: statusMap[b.title] || 'unread'
    }));
  } catch (err) {
    console.warn('Backend history fetch failed, using local storage fallback:', err);
    return getLocalHistory();
  }
}

export function getLocalHistory(): Book[] {
  const history = JSON.parse(localStorage.getItem('smartshelf_history') || '[]');
  const statusMap = getStatusMap();
  return history.map((b: Book) => ({
    ...b,
    status: statusMap[b.title] || b.status || 'unread'
  }));
}

function getStatusMap(): Record<string, 'read' | 'unread'> {
  return JSON.parse(localStorage.getItem('smartshelf_read_status') || '{}');
}

export function updateHistoryStatus(bookTitle: string, status: 'read' | 'unread') {
  // Update the dedicated status mapper
  const statusMap = getStatusMap();
  statusMap[bookTitle] = status;
  localStorage.setItem('smartshelf_read_status', JSON.stringify(statusMap));
  
  // Also update the fallback history if it exists there (for complete consistency)
  const history = JSON.parse(localStorage.getItem('smartshelf_history') || '[]');
  const index = history.findIndex((b: Book) => b.title === bookTitle);
  if (index !== -1) {
    history[index].status = status;
    localStorage.setItem('smartshelf_history', JSON.stringify(history));
  }
}

// Feedback
export async function submitFeedback(data: Record<string, string>, token?: string) {
  try {
    await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  } catch {
    const feedbacks = JSON.parse(localStorage.getItem('smartshelf_feedback') || '[]');
    feedbacks.push({ ...data, timestamp: new Date().toISOString() });
    localStorage.setItem('smartshelf_feedback', JSON.stringify(feedbacks));
  }
}
