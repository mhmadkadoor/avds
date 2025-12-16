# AVDS API Documentation

This document provides a formal specification of the API endpoints available in the AVDS backend.

## Base URL
All endpoints are relative to the base URL (e.g., `http://localhost:8000/api`).

## Authentication
Most endpoints require authentication using JWT (JSON Web Tokens).
Include the token in the header: `Authorization: Bearer <access_token>`

---

## 1. Authentication & User Management

### Register User
**URL:** `/register/`
**Method:** `POST`
**Description:** Register a new user.
**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (optional)",
  "password": "string (required)",
  "first_name": "string (optional)",
  "last_name": "string (optional)"
}
```
**Response:**
*   `201 Created`: User details (excluding password).
*   `400 Bad Request`: Validation errors.

### Get Token (Login)
**URL:** `/token/`
**Method:** `POST`
**Description:** Obtain access and refresh tokens.
**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Response:**
*   `200 OK`:
    ```json
    {
      "access": "string",
      "refresh": "string"
    }
    ```

### Refresh Token
**URL:** `/token/refresh/`
**Method:** `POST`
**Description:** Refresh an expired access token.
**Request Body:**
```json
{
  "refresh": "string"
}
```
**Response:**
*   `200 OK`: New access token.

### Get Current User
**URL:** `/me/`
**Method:** `GET`
**Headers:** `Authorization: Bearer <token>`
**Description:** Get details of the currently logged-in user.
**Response:**
*   `200 OK`:
    ```json
    {
      "id": integer,
      "username": "string",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "is_staff": boolean,
      "favorites": [integer] // List of vehicle IDs
    }
    ```

---

## 2. Vehicle Data

### List Makes
**URL:** `/makes/`
**Method:** `GET`
**Description:** Get a list of all vehicle makes.
**Response:**
*   `200 OK`: List of make objects.

### List Models
**URL:** `/models/`
**Method:** `GET`
**Query Parameters:**
*   `make_id` (optional): Filter models by make ID.
**Description:** Get a list of vehicle models.
**Response:**
*   `200 OK`: List of model objects.

### List Body Types
**URL:** `/bodies/`
**Method:** `GET`
**Description:** Get a list of vehicle body types.
**Response:**
*   `200 OK`: List of body objects.

### List Drive Types
**URL:** `/drivetypes/`
**Method:** `GET`
**Description:** Get a list of drive types.
**Response:**
*   `200 OK`: List of drive type objects.

### List Vehicles (Search)
**URL:** `/vehicles/`
**Method:** `GET`
**Query Parameters:**
*   `make_id`: Filter by Make ID.
*   `model_id`: Filter by Model ID.
*   `year`: Exact year match.
*   `make_name`: Filter by Make name (case-insensitive).
*   `engine`: Filter by engine text (contains).
*   `min_year`: Minimum year.
*   `max_year`: Maximum year.
*   `min_price`: Minimum calculated price.
*   `max_price`: Maximum calculated price.
*   `q`: General search query (searches vehicle name, make, model).
**Description:** Search and filter vehicles.
**Response:**
*   `200 OK`: List of vehicle objects.
    ```json
    [
      {
        "id": integer,
        "make_name": "string",
        "model_name": "string",
        "body_name": "string",
        "drive_type_name": "string",
        "vehicle_display_name": "string",
        "year": integer,
        "price": number, // Calculated field
        "engine": "string",
        "images": ["string"], // List of image URLs
        "reviews": [...],
        "description": "string",
        "custom_title": "string"
        ...
      }
    ]
    ```

### Update Vehicle (Admin Only)
**URL:** `/vehicles/<id>/update/`
**Method:** `PUT`
**Headers:** `Authorization: Bearer <token>` (User must be staff)
**Description:** Update vehicle metadata (description, custom title).
**Request Body:**
```json
{
  "description": "string",
  "custom_title": "string"
}
```
**Response:**
*   `200 OK`: Updated vehicle details.

### Upload Vehicle Image (Admin Only)
**URL:** `/vehicles/<id>/images/`
**Method:** `POST`
**Headers:** `Authorization: Bearer <token>` (User must be staff)
**Body:** `multipart/form-data`
*   `image`: File
**Description:** Upload a new image for a vehicle.
**Response:**
*   `201 Created`: Image object.

### Delete Vehicle Image (Admin Only)
**URL:** `/images/<id>/`
**Method:** `DELETE`
**Headers:** `Authorization: Bearer <token>` (User must be staff)
**Description:** Delete a specific vehicle image.
**Response:**
*   `204 No Content`.

---

## 3. User Actions

### Manage Favorites
**URL:** `/favorites/`
**Headers:** `Authorization: Bearer <token>`

#### Get Favorites
**Method:** `GET`
**Description:** Get list of favorited vehicles.
**Response:**
*   `200 OK`: List of vehicle objects.

#### Toggle Favorite
**Method:** `POST`
**Request Body:**
```json
{
  "vehicle_id": integer
}
```
**Description:** Add or remove a vehicle from favorites.
**Response:**
*   `200 OK`: `{"status": "added"}` or `{"status": "removed"}`.

### Create Review
**URL:** `/reviews/`
**Method:** `POST`
**Headers:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "vehicle_id": integer,
  "rating": integer,
  "comment": "string"
}
```
**Description:** Add a review for a vehicle.
**Response:**
*   `201 Created`: Review object.

### Delete Review
**URL:** `/reviews/<id>/`
**Method:** `DELETE`
**Headers:** `Authorization: Bearer <token>`
**Description:** Delete a review (User can delete their own, Admin can delete any).
**Response:**
*   `204 No Content`.

---

## 4. AI Chat

### Chat with AI
**URL:** `/chat/`
**Method:** `POST`
**Request Body:**
```json
{
  "message": "string (required)",
  "context": "string (optional)",
  "history": [
    {"role": "user", "content": "string"},
    {"role": "assistant", "content": "string"}
  ]
}
```
**Description:** Send a message to the AI assistant.
**Response:**
*   `200 OK`:
    ```json
    {
      "response": "string"
    }
    ```

---

## 5. Admin Dashboard

### Get Admin Stats
**URL:** `/admin/stats/`
**Method:** `GET`
**Headers:** `Authorization: Bearer <token>` (User must be staff)
**Description:** Get general statistics and search analytics.
**Response:**
*   `200 OK`:
    ```json
    {
      "total_vehicles": integer,
      "total_users": integer,
      "total_reviews": integer,
      "daily_searches": [...],
      "monthly_searches": [...]
    }
    ```

### Upload Vehicles (CSV)
**URL:** `/admin/upload-vehicles/`
**Method:** `POST`
**Headers:** `Authorization: Bearer <token>` (User must be staff)
**Body:** `multipart/form-data`
*   `file`: CSV file
**Description:** Bulk upload vehicles via CSV.
**Response:**
*   `200 OK`: Import status and error list.

### Get Upload Template
**URL:** `/admin/upload-template/`
**Method:** `GET`
**Headers:** `Authorization: Bearer <token>` (User must be staff)
**Description:** Download a CSV template for vehicle uploads.
**Response:**
*   `200 OK`: CSV file download.

### Manage Homepage Features
**URL:** `/admin/features/`
**Headers:** `Authorization: Bearer <token>` (User must be staff)

#### Get Features
**Method:** `GET`
**Description:** Get list of homepage features.
**Response:**
*   `200 OK`: List of feature objects.

#### Update Features
**Method:** `POST`
**Request Body:**
```json
[
  {
    "title": "string",
    "description": "string",
    "icon": "string",
    "is_active": boolean
  }
]
```
**Description:** Replace all homepage features with the provided list.
**Response:**
*   `201 Created`: List of created features.
