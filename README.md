# Food E-commerce Monorepo (React + Node + Flask + MongoDB)

## Requirements
- Node.js 18
- Python 3.10
- MongoDB 6.x

## Backend
```
cp backend/.env.example backend/.env
cd backend
npm install
npm run seed
npm run dev
```

## Python service
```
cp BE_python/.env.example BE_python/.env
cd BE_python
python -m venv .venv
# Windows: .\.venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

## Frontend (Vite)
```
cd frontend
npm install
# optional: create .env.local with VITE_API_URL=http://localhost:5000
npm run dev
```

Open:
- Frontend: http://localhost:5173
- Backend:  http://localhost:5000/api/health
- Python:   http://localhost:5001/api/health
