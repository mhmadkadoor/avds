## Backend Architecture Overview

### 1. Layered Structure

```
Request
  ↓
  URL Router (avdsback/urls.py → api/urls.py)
  ↓
  View / Controller (api/views.py)
      - Thin controllers: permissions, serialization, HTTP response codes.
      - Delegates domain logic to services.
  ↓
  Service Layer (api/services.py)
      - VehicleService
      - SearchAnalyticsService
      - FeatureService
      (Single Responsibility for each domain area)
  ↓
  Data Layer (api/models.py via Django ORM)
      - Vehicle, VehicleImage, Review, Favorite, SearchAnalytics, Feature
  ↓
  Database (SQLite dev / upgradeable to PostgreSQL)
```

### 2. Core Models (Domain Entities)
| Model             | Purpose                                              | Key Relations                                              |
|-------------------|------------------------------------------------------|------------------------------------------------------------|
| `Vehicle`         | Represents a vehicle listing                         | `VehicleImage` (1:N), `Review` (1:N), `Favorite` (reverse) |
| `VehicleImage`    | Ordered list of image URLs for a vehicle             | FK → `Vehicle`                                             |
| `Review`          | User feedback on a vehicle                           | FK → `Vehicle`, FK → `User`                                |
| `Favorite`        | User bookmark of a vehicle                           | FK → `User`, FK → `Vehicle` (unique pair)                  |
| `SearchAnalytics` | Daily counts per search query                        | unique (`query`,`date`)                                    |
| `Feature`         | Configurable key/value pairs for admin customization | none                                                       |

### 3. Services and Their Responsibilities

| Service                   | Responsibilities                                                | Notes                                           |
|---------------------------|-----------------------------------------------------------------|-------------------------------------------------|
| `VehicleService`          | Filtering, searching, suggestions, CSV bulk upload              | Encapsulates query param mapping & batch logic  |
| `SearchAnalyticsService`  | Record queries, compute daily/monthly aggregates                | Ready for future external analytics backend     |
| `FeatureService`          | CRUD/upsert feature flags/data                                  | Allows dynamic homepage config                  |

All services expose static methods (pure façade). They can be refactored into instance classes or protocols if DI frameworks are introduced later.

### 4. Viewsets & Endpoints

| Endpoint                             | View/Method               | Service Used | Auth |
|--------------------------------------|---------------------------|-------------- |------|
| `GET /api/vehicles/`                 | `VehicleViewSet.list`     | `VehicleService.filter`          | Public |
| `POST /api/vehicles/`                | `VehicleViewSet.create`   | — (serializer)                   | Admin  |
| `GET /api/vehicles/{id}/`            | `VehicleViewSet.retrieve` | —                                | Public |
| `PUT/PATCH /api/vehicles/{id}/`      | `VehicleViewSet.update`   | —                                | Admin  |
| `DELETE /api/vehicles/{id}/`         | `VehicleViewSet.destroy`  | —                                | Admin  |
| `POST /api/vehicles/upload/`         | `VehicleViewSet.upload`   | `VehicleService.upload_csv`      | Admin  |
| `GET /api/search/`                   | `search`                  | `VehicleService.search`          | Public |
| `GET /api/search/suggestions/`       | `suggestions`             | `VehicleService.suggestions`     | Public |
| `POST /api/analytics/search/`        | `analytics_record`        | `SearchAnalyticsService.record`  | Public |
| `GET /api/analytics/search/daily/`   | `analytics_daily`         | `SearchAnalyticsService.daily`   | Public |
| `GET /api/analytics/search/monthly/` | `analytics_monthly`       | `SearchAnalyticsService.monthly` | Public |
| `GET /api/admin/stats/`              | `admin_stats`             | — (direct counts)                | Admin  |
| `GET /api/admin/features/`           | `feature_list (GET)`      | `FeatureService.list_all`        | Admin  |
| `POST /api/admin/features/`          | `feature_list (POST)`     | `FeatureService.upsert`          | Admin  |
| `GET /api/admin/features/{key}/`     | `feature_update (GET)`    | `FeatureService.get`             | Admin  |
| `PUT /api/admin/features/{key}/`     | `feature_update (PUT)`    | `FeatureService.update`          | Admin  |
| `DELETE /api/admin/features/{key}/`  | `feature_update (DELETE)` | `FeatureService.delete`          | Admin  |
| `POST /api/auth/register/`           | `register`                | —                                | Public |
| `POST /api/auth/login/`              | JWT obtain                | —                                | Public |
| `POST /api/auth/refresh/`            | JWT refresh               | —                                | Auth   |
| `GET /api/auth/me/`                  | `me`                      | —                                | Auth   |
| `GET/POST/DELETE /api/reviews/`      | `ReviewViewSet`           | —                                | Mixed  |
| `GET/POST/DELETE /api/favorites/`    | `FavoriteViewSet`         | —                                | Auth   |

### 5. Data Flow Example (Search Request)
1. Client calls `GET /api/search/?q=tesla&minPrice=30000`.
2. `search` view parses query params and calls `VehicleService.search(params)`.
3. `VehicleService.search` builds dynamic `Q` filters + delegates to `filter()` for additional constraints.
4. Queryset returned, paginated in view, serialized by `VehicleSerializer`.
5. Response with JSON payload of vehicles.

### 6. SOLID Application
| Principle                 | Application                                                                                                |
|---------------------------|------------------------------------------------------------------------------------------------------------|
| S (Single Responsibility) | Services each handle one domain slice; views handle HTTP; serializers handle representation.               |
| O (Open/Closed)           | New filtering rules can be added inside `VehicleService.filter` without altering view code.                |
| L (Liskov Substitution)   | Static service façade could be replaced by subclass / alternative implementation without breaking callers. |
| I (Interface Segregation) | Consumers (views) only use the methods they need (`search`, `daily`, `upsert`).                            |
| D (Dependency Inversion)  | Controllers depend on service abstractions rather than concrete business logic embedded inline.            |

### 7. Extension Points
- Replace `VehicleService.search` with an Elasticsearch-backed implementation.
- Add `ImageStorageService` for S3 uploads; update `upload_csv` to call it.
- Introduce `AbstractFeatureStore` for environment-based feature flagging.
- Introduce caching layer (Redis) in `SearchAnalyticsService.monthly` and `.daily`.

### 8. Recommended Next Steps
1. Unit tests per service (mock ORM queries).
2. Error handling standardization (custom exceptions mapped to DRF responses).
3. Introduce repository pattern for complex query composition.
4. Add rate limiting & throttling (REST_FRAMEWORK settings) for analytics endpoints.
5. Document JSON schemas (OpenAPI/Swagger) for frontend consumption.

### 9. High-Level Class Diagram (Textual)

```
+------------------+      +--------------------+
| VehicleService   |      | SearchAnalyticsSvc |
|------------------|      |--------------------|
| filter()         |      | record()           |
| search()         |      | daily()            |
| suggestions()    |      | monthly()          |
| upload_csv()     |      +--------------------+
+--------^---------+                 ^
         |                           |
         | uses                      | aggregates
         |                           |
+------------------+      +--------------------+
| Vehicle (Model)  |<-----| SearchAnalytics    |
+------------------+      +--------------------+
   ^   ^    ^
   |   |    |
   |   |    +---- Review         (Model)
   |   +--------- VehicleImage   (Model)
   +------------- Favorite       (Model)

+------------------+
| FeatureService   |----> Feature (Model)
+------------------+

Views (api/views.py) depend on Services and Serializers → Models.
```

### 10. File Index
| File                    | Responsibility                                  |
|-------------------------|-------------------------------------------------|
| `avdsback/settings.py`  | Framework & third-party config (DRF, JWT, CORS) |
| `avdsback/urls.py`      | Root URL routing to `api` app                   |
| `api/models.py`         | Domain data structures                          |
| `api/serializers.py`    | JSON representation & validation                |
| `api/services.py`       | Business/domain logic layer                     |
| `api/views.py`          | HTTP interface (controllers)                    |
| `api/urls.py`           | API endpoint definitions                        |
| `requirements.txt`      | Dependency versions                             |
| `docs/architecture.md`  | Architecture & mapping document                 |

