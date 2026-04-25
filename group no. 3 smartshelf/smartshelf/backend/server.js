// Backend Reference — Node.js + Express + SQLite
// Save this as backend-reference/server.js and run with: node server.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
const db = new sqlite3.Database(path.join(dbDir, 'smartshelf.db'));

app.use(cors());
app.use(express.json());

const SECRET_KEY = 'smartshelf_secret_key_change_in_production';
const ML_SERVICE_URL = 'http://127.0.0.1:8001';
const GOOGLE_BOOKS_KEY = 'AIzaSyAA8iPFssREvP1ZHIXWGe77jjbb1QYgMhg';

// Database Schema
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    author TEXT,
    description TEXT,
    rating TEXT,
    image TEXT,
    genre TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    q1 TEXT, q2 TEXT, q3 TEXT, q4 TEXT, q5 TEXT,
    suggestions TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// Signup
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const hashed = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashed], function(err) {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.json({ success: true });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token });
  });
});

// Detect books (proxy to ML service)
app.post('/api/detect', upload.single('file'), async (req, res) => {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);
    const mlRes = await axios.post(`${ML_SERVICE_URL}/detect-books`, formData, {
      headers: formData.getHeaders(),
    });
    const detections = mlRes.data;

    // Match with Google Books
    const enrichedBooks = await Promise.all(detections.books.map(async (book) => {
      try {
        const gRes = await axios.get(`https://www.googleapis.com/books/v1/volumes`, {
          params: { q: book.extracted_text, key: GOOGLE_BOOKS_KEY, maxResults: 5 }
        });
        const items = gRes.data.items || [];
        const topMatch = items[0]?.volumeInfo;
        return {
          ...book,
          title: topMatch?.title || 'Unknown',
          author: topMatch?.authors?.[0] || 'Unknown',
          description: topMatch?.description || '',
          rating: topMatch?.averageRating || 'N/A',
          image: topMatch?.imageLinks?.thumbnail || '',
          genre: topMatch?.categories?.[0] || 'General',
          infoLink: topMatch?.infoLink || '',
        };
      } catch { return { ...book, title: 'Unknown', author: 'Unknown' }; }
    }));

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);
    res.json({ total_books_detected: detections.total_books_detected, books: enrichedBooks });
  } catch (err) {
    res.status(500).json({ error: 'Detection failed', details: err.message });
  }
});

// History
app.post('/api/history', authMiddleware, (req, res) => {
  const { book } = req.body;
  
  // Check if already in history
  db.get('SELECT id FROM history WHERE user_id = ? AND title = ? AND author = ?', 
    [req.user.id, book.title, book.author], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row) return res.json({ success: true, message: 'Already in history' });

    db.run(
      'INSERT INTO history (user_id, title, author, description, rating, image, genre) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, book.title, book.author, book.description, book.rating, book.image, book.genre],
      (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save' });
        res.json({ success: true });
      }
    );
  });
});

app.get('/api/history', authMiddleware, (req, res) => {
  db.all('SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC', [req.user.id], (err, rows) => {
    res.json(rows || []);
  });
});

// Feedback
app.post('/api/feedback', (req, res) => {
  const { q1, q2, q3, q4, q5, suggestions } = req.body;
  db.run(
    'INSERT INTO feedback (q1, q2, q3, q4, q5, suggestions) VALUES (?, ?, ?, ?, ?, ?)',
    [q1, q2, q3, q4, q5, suggestions],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save' });
      res.json({ success: true });
    }
  );
});

app.listen(5001, () => console.log('SmartShelf backend running on http://localhost:5001'));
