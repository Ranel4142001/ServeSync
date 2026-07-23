# ServeSync Python Backend

A robust, high-performance helpdesk backend API built using **FastAPI**, **SQLAlchemy 2.0**, **Alembic**, and **python-socketio**. Implements Clean Architecture and SOLID design principles, utilizing sequential **UUID v7** keys for database performance.

---

## Technical Stack & Features
- **FastAPI**: Core web framework utilizing asynchronous handlers and Pydantic validation schemas.
- **SQLAlchemy 2.0**: Declarative ORM mapper with connection pooling and type safety.
- **Alembic**: Database migration framework.
- **python-socketio**: ASGI real-time communication server.
- **UUID v7**: Ordered, non-enumerable, time-based sequential primary keys to optimize PostgreSQL B-Tree index speeds.
- **Clean Architecture Layers**:
  - `domain/`: Business entities and abstract repository interface ports.
  - `application/`: Atomic Use Cases implementing core business rules.
  - `infrastructure/`: Database repositories, S3 providers, and JWT authentication implementations.
  - `presentation/`: API routers, middleware dependencies, and request/response validation schemas.

---

## Setup & Running Guide

### 1. Set Up Virtual Environment
Ensure Python 3.11+ is installed, then create and activate the virtual environment:
```powershell
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
Install the required packages using pip:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Environment Settings
Configure your database and external API connections in `.env` (copied automatically from development settings):
```ini
DATABASE_URL="postgresql://servesync:servesync_dev@localhost:5432/servesync_db"
JWT_SECRET="change-this-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
GEMINI_API_KEY="your-gemini-api-key"
PORT=8000
```

### 4. Database Migrations
Run Alembic migrations to stamp/migrate the PostgreSQL database:
```bash
# Stamp if database tables are already initialized (runs in sync with Node.js schema)
alembic stamp head

# To run migrations or create new revisions:
alembic revision --autogenerate -m "new_change"
alembic upgrade head
```

### 5. Start the Server
Start the Uvicorn ASGI server:
```bash
uvicorn src.main:asgi_app --host 127.0.0.1 --port 8000 --reload
```
The interactive API documentation is available at `http://127.0.0.1:8000/docs`.
