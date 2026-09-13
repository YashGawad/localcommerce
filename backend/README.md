# LocalCommerce Backend (Milestones 1, 2, 3, 4, 5 & 6)

This is the backend service for the LocalCommerce platform, built using Node.js, Express, and PostgreSQL (`pg`).

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
   - Update `.env` with your PostgreSQL credentials and JWT configuration:
     ```env
     PORT=5000
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=localcommerce
     DB_USER=postgres
     DB_PASSWORD=your_postgres_password
     JWT_SECRET=your_jwt_secret_key_here
     JWT_EXPIRES_IN=1d
     DEV_SEED_PASSWORD=Password@123
     ```

> **Security Note:** Never commit your `.env` file or commit sensitive credentials.

4. (Optional) Initialize Development Seed Passwords:
   ```bash
   node src/scripts/seedPasswords.js
   ```

5. Run Automated Test Suites:
   ```bash
   node src/scripts/testMilestone5.js
   node src/scripts/testMilestone6.js
   ```

## Starting the Server

Run the start script:
```bash
npm start
```

Upon successful launch, the terminal displays:
```text
LocalCommerce API running on port 5000
```

## Authorization & Multi-Tenant Access Matrix

| Endpoint | Method | Public / Unauth | Customer | Store Staff | Delivery Staff | Store Owner / Manager | Platform Admin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/categories` | GET | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) |
| `/api/categories/:id` | GET | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) |
| `/api/categories` | POST | 401 | 403 | 403 | 403 | Allowed for own store (201) | 403 (unless store member) |
| `/api/categories/:id` | PATCH | 401 | 403 | 403 | 403 | Allowed for own store (200) | 403 (unless store member) |
| `/api/global-products` | GET | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) |
| `/api/global-products/:id` | GET | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) |
| `/api/global-products` | POST | 401 | 403 | 403 | 403 | 403 | Allowed (201) |
| `/api/global-products/:id` | PATCH | 401 | 403 | 403 | 403 | 403 | Allowed (200) |
| `/api/stores/:storeId/products` | GET | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) |
| `/api/stores/:storeId/products/:id` | GET | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) |
| `/api/stores/:storeId/products` | POST | 401 | 403 | 403 | 403 | Allowed for own store (201) | 403 (unless store member) |
| `/api/stores/:storeId/products/:id` | PATCH | 401 | 403 | 403 | 403 | Allowed for own store (200) | 403 (unless store member) |
| `/api/stores` | POST | 401 | 403 | 403 | 403 | 403 (unless business_owner) | Allowed (201) |
| `/api/stores/:id` | PATCH | 401 | 403 | 403 | 403 | Allowed for own store (200) | Allowed (200) |
| `/api/customers/me` | GET | 401 | Allowed (200) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) |
| `/api/customers/me` | PATCH | 401 | Allowed (200) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) |
| `/api/customers/me/addresses` | GET | 401 | Allowed (200) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) |
| `/api/customers/me/addresses/:id` | GET | 401 | Allowed (200, own address only) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) |
| `/api/customers/me/addresses` | POST | 401 | Allowed (201) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) |
| `/api/customers/me/addresses/:id` | PATCH | 401 | Allowed (200, own address only) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) |
| `/api/customers/me/addresses/:id` | DELETE | 401 | Allowed (200, own address only) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) | 404 (no customer record) |

## API Endpoints

### 1. Health Check
- **Route:** `GET /api/health`
- **Description:** Verifies that the server is active and can communicate with PostgreSQL.

### 2. Authentication API (Milestone 4)
- **Customer Registration:** `POST /api/auth/register`
  - Body: `{ name, email, password, phone }`
  - Public registration strictly creates accounts with role `customer`.
- **User Login:** `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns JWT token and sanitized user profile.
- **Current User Profile:** `GET /api/auth/me`
  - Header: `Authorization: Bearer <JWT>`
  - Returns authenticated user details including store-specific roles.

### 3. Customer Profile & Addresses API (Milestone 6)
- **Get Customer Profile:** `GET /api/customers/me` [Authenticated Customer]
- **Update Customer Profile:** `PATCH /api/customers/me` [Authenticated Customer]
  - Allowed fields: `name`, `phone`
  - Protected fields: `role`, `status`, `customer_id`, `user_id`, `email`, `password_hash`
- **List Saved Addresses:** `GET /api/customers/me/addresses` [Authenticated Customer]
- **Get Saved Address by ID:** `GET /api/customers/me/addresses/:id` [Authenticated Customer]
- **Create Saved Address:** `POST /api/customers/me/addresses` [Authenticated Customer]
  - Required fields: `label`, `recipient_name`, `address_line1`, `city`, `state`, `postal_code`
  - Optional fields: `phone`, `address_line2`, `latitude`, `longitude`, `is_default`
- **Update Saved Address:** `PATCH /api/customers/me/addresses/:id` [Authenticated Customer]
  - Allowed fields: `label`, `recipient_name`, `phone`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `latitude`, `longitude`, `is_default`
- **Delete Saved Address:** `DELETE /api/customers/me/addresses/:id` [Authenticated Customer]

### 4. Stores API (Milestone 2 & 5)
- **List All Stores:** `GET /api/stores` [Public]
- **Get Store by ID:** `GET /api/stores/:id` [Public] (UUID format required)
- **Get Store by Slug:** `GET /api/stores/slug/:slug` [Public]
- **Create Store:** `POST /api/stores` [business_owner / admin only]
- **Update Store:** `PATCH /api/stores/:id` [Store Owner / Manager / Platform Admin]

### 5. Categories API (Milestone 3 & 5)
- **List Categories:** `GET /api/categories` [Public]
- **Get Category by ID:** `GET /api/categories/:id` [Public]
- **Create Category:** `POST /api/categories` [Store Owner / Manager for target store_id]
- **Update Category:** `PATCH /api/categories/:id` [Store Owner / Manager for category's store_id]

### 6. Global Products API (Milestone 3 & 5)
- **List Global Products:** `GET /api/global-products` [Public]
- **Get Global Product by ID:** `GET /api/global-products/:id` [Public]
- **Create Global Product:** `POST /api/global-products` [Platform Admin only]
- **Update Global Product:** `PATCH /api/global-products/:id` [Platform Admin only]

### 7. Store Products / Store Listings API (Milestone 3 & 5)
- **List Products for Store:** `GET /api/stores/:storeId/products` [Public]
- **Get Product for Store:** `GET /api/stores/:storeId/products/:id` [Public]
- **Create Store Product:** `POST /api/stores/:storeId/products` [Store Owner / Manager for storeId]
- **Update Store Product:** `PATCH /api/stores/:storeId/products/:id` [Store Owner / Manager for storeId]
