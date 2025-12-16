# Project Setup & Guide

## 1. Backend Setup (Django)

The backend is built with Django and Django REST Framework. It connects directly to the `VehicleMakesDB.sqlite` database.

### Prerequisites
- Python 3.8+
- [Ollama](https://ollama.com/) (for AI features)

### Installation

1.  Navigate to the backend directory:
    ```bash
    cd AVDSBack
    ```

2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv .venv
    # Windows
    .venv\Scripts\activate
    # Mac/Linux
    source .venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Database Configuration:**
    The project is pre-configured to use `VehicleMakesDB.sqlite` located in the project root. No migration or seeding is required for vehicle data.

5.  **AI Setup (Ollama):**
    The project uses Ollama for the AI Assistant.
    1.  Download and install [Ollama](https://ollama.com/).
    2.  Pull the required model:
        ```bash
        ollama pull gpt-oss:20b-cloud
        ```
    3.  Ensure Ollama is running (default port 11434).

6.  Run the Server:
    ```bash
    python manage.py runserver
    ```
    The API will be available at `http://localhost:8000/api/`.

## 2. Frontend Setup (React/Vite)

The frontend is a React application built with Vite.

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd "avds Figma UI"
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the Development Server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## 3. Features

-   **Vehicle Search & Filtering:** Search by text, brand, engine, year, and price.
-   **Dynamic Pricing:** Prices are estimated based on vehicle year and engine specifications.
-   **AI Assistant:** A chat interface that helps users find vehicles. It is context-aware and knows which vehicle you are currently viewing.
-   **Vehicle Details:** View detailed specifications and reviews.

## 4. Troubleshooting

-   **Images not loading:** The project uses `loremflickr.com` for dynamic placeholder images. Ensure you have internet access.
-   **AI not responding:** Ensure Ollama is running and the `gpt-oss:20b-cloud` model is installed.
-   **Database errors:** Ensure `VehicleMakesDB.sqlite` is present in the root `avds--ag` directory.
