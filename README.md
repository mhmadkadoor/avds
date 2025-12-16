# Vehicle Search Platform

A full-stack vehicle search application with a Django backend and React frontend.

## Prerequisites

*   Python 3.8+
*   Node.js 16+
*   npm or yarn

## Project Structure

*   `AVDSBack/`: Django Backend
*   `avds Figma UI/`: React Frontend

## Setup Instructions

### 1. Backend Setup (Django)

1.  Navigate to the backend directory:
    ```bash
    cd AVDSBack
    ```

2.  Create a virtual environment:
    ```bash
    python -m venv .venv
    ```

3.  Activate the virtual environment:
    *   Windows: `.venv\Scripts\activate`
    *   Mac/Linux: `source .venv/bin/activate`

4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

5.  Set up environment variables:
    *   Copy `.env.example` to `.env` (create it if it doesn't exist)
    *   Update the values in `.env` as needed.

6.  Run migrations:
    ```bash
    python manage.py migrate
    ```

7.  Start the server:
    ```bash
    python manage.py runserver
    ```
    The backend will run at `http://localhost:8000`.

### 2. Frontend Setup (React)

1.  Navigate to the frontend directory:
    ```bash
    cd "avds Figma UI"
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will run at `http://localhost:5173` (or similar).

## Features

*   **Vehicle Search**: Search by make, model, year, price, etc.
*   **Admin Dashboard**: Analytics, bulk vehicle upload (CSV), feature management.
*   **AI Chat**: Integrated AI assistant for vehicle queries.
*   **Multilingual**: Support for English, Turkish, and Arabic.

## Deployment

To deploy to production:

1.  **Backend**: Use Gunicorn or Uvicorn behind Nginx/Apache. Set `DEBUG=False` in `.env`.
2.  **Frontend**: Run `npm run build` to generate static files and serve them via Nginx or a CDN (Netlify/Vercel).

## Database

The project uses SQLite by default (`VehicleMakesDB.sqlite`). Ensure this file is present or migrations are run to create a new DB.
