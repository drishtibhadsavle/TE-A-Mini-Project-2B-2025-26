# SmartShelf — Backend Reference Files

This project's frontend is fully built and functional in demo mode.
To connect the full backend stack, set up these services locally:

## Quick Start

### 1. Frontend (already built)
```bash
npm install && npm run dev
```

### 2. Backend (Node.js + Express)
```bash
cd backend-reference/
npm install
node server.js
# Runs on http://localhost:5000
```

### 3. ML Service (Python + FastAPI)  
```bash
cd ml-reference/
pip install -r requirements.txt
# Place your best.pt model in ml-reference/models/
uvicorn main:app --port 8000
```

### 4. Connect frontend to backend
Create `.env` in the frontend root:
```
VITE_API_URL=http://localhost:5000/api
```

## Architecture
```
React Frontend → Node.js Backend → Python ML Service → SQLite
                      ↓
               Google Books API
```

## Notes
- The frontend works in **demo mode** without the backend (uses Google Books API directly)
- Place `best.pt` in `ml-reference/models/` to enable real detection
- Google Books API key is embedded in the frontend
