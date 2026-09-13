# LocalCommerce Backend (Milestone 1)

This is the foundational backend service for the LocalCommerce platform, built using Node.js, Express, and PostgreSQL (`pg`).

## Prerequisites

- Node.js (v18+)
- PostgreSQL 18+ (with the `localcommerce` database created)
- pgAdmin 4 (recommended for database management)

## Setup and Installation

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file by copying `.env.example`:
     ```bash
     copy .env.example .env
     ```
   - Update `.env` with your PostgreSQL credentials:
     ```env
     PORT=5000
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=localcommerce
     DB_USER=postgres
     DB_PASSWORD=your_postgres_password
     ```

> **Security Note:** Never commit your `.env` file or commit sensitive credentials.

## Starting the Server

Run the start script:
```bash
npm start
```

Upon successful launch, the terminal displays:
```text
LocalCommerce API running on port 5000
```

## Health Check Endpoint

- **Route:** `GET /api/health`
- **Description:** Verifies that the server is active and can communicate with PostgreSQL.

### Responses

- **HTTP 200 OK (Database Connected):**
  ```json
  {
    "success": true,
    "message": "LocalCommerce API is healthy",
    "database": "connected"
  }
  ```

- **HTTP 500 Internal Server Error (Database Disconnected):**
  ```json
  {
    "success": false,
    "message": "LocalCommerce API is running, but database connection failed",
    "database": "disconnected",
    "error": "Unable to connect to the database"
  }
  ```
