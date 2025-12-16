# Vehicle Search Platform Backend (Django)

This Django REST API powers the Vehicle Search Platform UI.

## Quick Start

```pwsh
# Activate virtual environment if not already
# (adjust path if needed)
& .\.venv\Scripts\Activate.ps1

# Install deps
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start dev server
python manage.py runserver 0.0.0.0:8000
```

## Authentication
JWT via `djangorestframework-simplejwt`.

Obtain token:
`POST /api/auth/login/ {"username":"user","password":"pass"}`

Refresh token:
`POST /api/auth/refresh/ {"refresh":"<refresh_token>"}`

Register:
`POST /api/auth/register/ {"username":"u","email":"e@x.com","password":"secret"}`

Current user:
`GET /api/auth/me/` (Authorization: Bearer <access>)

## Core Endpoints

Vehicles:
- `GET /api/vehicles/` list + filters (brand, engineType, fuelType, minPrice, maxPrice, minYear, maxYear, ordering)
- `GET /api/vehicles/{id}/`
- `POST /api/vehicles/` (admin)
- `PUT/PATCH /api/vehicles/{id}/` (admin)
- `DELETE /api/vehicles/{id}/` (admin)
- `POST /api/vehicles/upload/` CSV bulk upload (admin)

Search:
- `GET /api/search/?q=term&brand=&engineType=&fuelType=` paginated
- `GET /api/search/suggestions/?q=partial`

Favorites (auth required):
- `GET /api/favorites/`
- `POST /api/favorites/ {"vehicle_id": <id>}`
- `DELETE /api/favorites/{id}/`

Reviews:
- `GET /api/reviews/?vehicle=<vehicleId>`
- `POST /api/reviews/ {"vehicle": <id>, "rating": 5, "comment": "Nice"}` (auth)

Analytics:
- `GET /api/analytics/search/daily/?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /api/analytics/search/monthly/`
- `POST /api/analytics/search/ {"query":"sedan"}`

Admin:
- `GET /api/admin/stats/`
- `GET /api/admin/features/`
- `POST /api/admin/features/ {"key":"homepage","value":{}}`
- `GET /api/admin/features/{key}/`
- `PUT /api/admin/features/{key}/ {"value": {...}}`
- `DELETE /api/admin/features/{key}/`

## Notes
- CORS is open (`CORS_ALLOW_ALL_ORIGINS = True`). Restrict in production.
- `ALLOWED_HOSTS = ["*"]` for dev convenience.
- Database: SQLite by default; switch ENGINE for Postgres in production.
- For image storage, currently using simple URL fields; integrate S3 or similar for real uploads.

## Next Steps
- Add proper pagination metadata caching for search.
- Integrate real file/image uploads.
- Add rate limiting & throttling.
- Expand analytics aggregation queries.

## License
Internal project.
