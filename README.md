## Requirements

- **Node.js** ≥ 18  
- **npm** ≥ 9  

---

## Installation

Install all dependencies in both projects:

npm install
npm run install:alla

## Development

Run both backend and frontend concurrently:
npm run dev

This will start:

Backend on http://localhost:3001
Frontend on http://localhost:5173

For multi-client testing (two browser tabs as two users):

npm run dev:multi

That will start two frontend instances (ports 5173 and 5174) plus the backend.
