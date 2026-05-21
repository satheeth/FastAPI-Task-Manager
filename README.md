# FastAPI Task Manager

A full-stack task management application built with a **FastAPI** backend and a **React** frontend.

## Live Demo / Deployment

- **Frontend:** [Insert Frontend Deployment Link Here]
- **Backend API (Swagger):** [https://fast-api-task-manager-backend.onrender.com/docs](https://fast-api-task-manager-backend.onrender.com/docs)

## Features

- User Authentication (Register & Login with JWT tokens)
- Create, Read, Update, and Delete (CRUD) tasks
- Filter tasks by status (All, Pending, Completed)
- Pagination for task lists
- Responsive, modern UI 

## Project Structure

- `/Backend` - The FastAPI Python application.
- `/frontend` - The React frontend application (Vite/CRA).

## Prerequisites

- Node.js (v16+ recommended)
- Python (3.8+ recommended)

## Environment Variables

To run this project locally, you may need to configure environment variables.

Create a `.env` file in the `Backend` directory:

```env
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
# DATABASE_URL=sqlite:///./sql_app.db
```

*(Note: The frontend code currently connects to the live backend via `API_BASE_URL`. To connect it to your local backend, update `API_BASE_URL` in `App.jsx` to `http://localhost:8000`)*

## How to Run Locally

### Backend Setup

1. Navigate to the `Backend` directory:

   ```bash
   cd Backend
   ```

2. Create and activate a virtual environment (optional but recommended):

   ```bash
   python -m venv env
   source env/Scripts/activate  # On Windows
   # source env/bin/activate    # On macOS/Linux
   ```

3. Install the Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI server:

   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Install the Node modules:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```
