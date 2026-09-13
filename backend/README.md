# LocalCommerce Backend (Milestones 1, 2, 3, 4, 5, 6, 7, 8, 9 & 10)

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
   node src/scripts/testMilestone7.js
   node src/scripts/testMilestone8.js
   node src/scripts/testMilestone9.js
   node src/scripts/testMilestone10.js
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
| `/api/orders` | POST | 401 | Allowed (201, customer only) | 403 (customer account required) | 403 (customer account required) | 403 (customer account required) | 403 (customer account required) |
| `/api/orders` | GET | 401 | Allowed (own orders) | Allowed (authorized store orders) | Allowed (authorized store orders) | Allowed (authorized store orders) | Allowed (all platform orders) |
| `/api/orders/:id` | GET | 401 | Allowed (own order only) | Allowed (authorized store order only) | Allowed (authorized store order only) | Allowed (authorized store order only) | Allowed (any order) |
| `/api/orders/:id/status` | PATCH | 401 | Allowed (cancellation only) | Allowed (operational store transitions) | Allowed (dispatch: OUT_FOR_DELIVERY, DELIVERED) | Allowed (store order transitions) | 403 (merchant store scoped) |
| `/api/orders/:orderId/delivery-assignment` | POST | 401 | 403 | 403 | 403 | Allowed for own store orders (201/200) | 403 |
| `/api/delivery/assignments` | GET | 401 | 403 | 403 | Allowed (own deliveries only) | Allowed (own store deliveries) | Allowed (all deliveries) |
| `/api/delivery/assignments/:id` | GET | 401 | 403 | 403 | Allowed (own assigned delivery only) | Allowed (own store deliveries only) | Allowed |
| `/api/delivery/assignments/:id/status` | PATCH | 401 | 403 | 403 | Allowed (own assigned delivery only) | 403 | 403 |
| `/api/orders/:orderId/payment` | GET | 401 | Allowed (own order payment) | Allowed (authorized store payment) | 403 | Allowed (authorized store payment) | Allowed (platform-wide) |
| `/api/payments/:id` | GET | 401 | Allowed (own order payment) | Allowed (authorized store payment) | 403 | Allowed (authorized store payment) | Allowed (platform-wide) |
| `/api/orders/:orderId/payment/pay` | POST | 401 | Allowed (own eligible order) | 403 | 403 | 403 | 403 |
| `/api/orders/:orderId/payment/fail` | POST | 401 | Allowed (own eligible order) | 403 | 403 | 403 | 403 |
| `/api/reviews` | POST | 401 | Allowed (own completed order) | 403 | 403 | 403 | 403 |
| `/api/reviews` | GET | Allowed (published) | Allowed (published) | Allowed (published) | Allowed (published) | Allowed (published) | Allowed (all statuses) |
| `/api/reviews/:id` | GET | Allowed (published) | Allowed (published) | Allowed (published) | Allowed (published) | Allowed (published) | Allowed (all statuses) |
| `/api/stores/:storeId/reviews` | GET | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) |
| `/api/global-products/:globalProductId/reviews` | GET | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) | Allowed (200) |
| `/api/customers/me/reviews` | GET | 401 | Allowed (own reviews) | 403 | 403 | 403 | 403 |

## API Endpoints

### 1. Health Check
- **Route:** `GET /api/health`
- **Description:** Verifies that the server is active and can communicate with PostgreSQL.

### 2. Authentication API (Milestone 4)
- **Customer Registration:** `POST /api/auth/register`
- **User Login:** `POST /api/auth/login`
- **Current User Profile:** `GET /api/auth/me`

### 3. Customer Profile & Addresses API (Milestone 6)
- **Get Customer Profile:** `GET /api/customers/me` [Authenticated Customer]
- **Update Customer Profile:** `PATCH /api/customers/me` [Authenticated Customer]
- **List Saved Addresses:** `GET /api/customers/me/addresses` [Authenticated Customer]
- **Get Saved Address by ID:** `GET /api/customers/me/addresses/:id` [Authenticated Customer]
- **Create Saved Address:** `POST /api/customers/me/addresses` [Authenticated Customer]
- **Update Saved Address:** `PATCH /api/customers/me/addresses/:id` [Authenticated Customer]
- **Delete Saved Address:** `DELETE /api/customers/me/addresses/:id` [Authenticated Customer]

### 4. Orders API (Milestone 7)
- **Create Order:** `POST /api/orders` [Authenticated Customer]
  - Body: `{ store_id, items: [{ store_product_id, quantity }], fulfillment_type, customer_address_id, payment_method, customer_notes }`
  - Atomic PostgreSQL transaction with `SELECT ... FOR UPDATE` inventory row locking.
  - Server-calculated authoritative subtotals, delivery fees, taxes, and totals.
  - Generates immutable snapshot in `order_items` and delivery address fields.
  - Decrements inventory stock and creates initial `payments` record.
- **List Orders:** `GET /api/orders` [Authenticated]
  - Customers see only their own orders.
  - Store owners/managers/staff see orders for their authorized stores.
  - Delivery staff see orders for their authorized stores.
  - Platform admins see all orders (with optional `?store_id=...` filter).
- **Get Order Details:** `GET /api/orders/:id` [Authenticated]
  - Returns complete order object with `items` and `payment` details.
  - Enforces customer and store authorization (cross-actor access returns 404).
- **Update Order Status:** `PATCH /api/orders/:id/status` [Authenticated]
  - Body: `{ status }`
  - Enforces delivery and pickup state machines.
  - Restocks inventory when an order is transitioned to `CANCELLED`.

### 5. Delivery Operations & Assignment API (Milestone 8)

#### Lifecycle Architecture & Concept Separation
Order status and delivery assignment status remain completely separate concepts:
- **`orders.status`**: `PLACED` → `CONFIRMED` → `PREPARING` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED` (There is **NO** `ASSIGNED` in `orders.status`).
- **`delivery_assignments.status`**: `assigned` → `out_for_delivery` → `delivered` (and `failed`).
- **Atomic Synchronization**:
  - `assigned` → `out_for_delivery` requires associated order to be `READY`, moving it atomically to `OUT_FOR_DELIVERY`.
  - `out_for_delivery` → `delivered` requires associated order to be `OUT_FOR_DELIVERY`, moving it atomically to `DELIVERED`.
  - Executed in a single database transaction with `FOR UPDATE` row locks on both records.

#### Endpoints
- **Assign / Reassign Delivery Staff:** `POST /api/orders/:orderId/delivery-assignment` [Store Owner / Manager]
  - Assigns an eligible delivery staff member belonging to the same store.
  - Due to the unique constraint on `delivery_assignments.order_id`, calling this on an unfulfilled order safely reassigns it to the new staff member.
  - Request Body:
    ```json
    {
      "delivery_staff_user_id": "00000000-0000-0000-0000-000000000004"
    }
    ```
  - Response (201 / 200):
    ```json
    {
      "success": true,
      "message": "Delivery staff assigned successfully.",
      "data": {
        "id": "63000000-0000-0000-0000-000000000001",
        "order_id": "60000000-0000-0000-0000-000000000001",
        "store_id": "10000000-0000-0000-0000-000000000001",
        "delivery_staff_user_id": "00000000-0000-0000-0000-000000000004",
        "status": "assigned",
        "assigned_at": "2026-09-14T01:00:00.000Z",
        "order_number": "LC-100001",
        "order_status": "READY",
        "fulfillment_type": "delivery",
        "store": {
          "id": "10000000-0000-0000-0000-000000000001",
          "name": "Sharma Supermarket",
          "slug": "sharma-supermarket"
        },
        "delivery_staff": {
          "id": "00000000-0000-0000-0000-000000000004",
          "name": "Demo Delivery Staff",
          "email": "delivery@example.com"
        }
      }
    }
    ```
- **List Delivery Assignments:** `GET /api/delivery/assignments` [Authenticated]
  - Delivery staff: Sees only assignments assigned to their account.
  - Store owner / manager: Sees assignments belonging to stores they own or manage.
  - Platform admin: May inspect platform-wide assignments.
  - Customers / store staff: 403 Forbidden.
- **Get Assignment Details:** `GET /api/delivery/assignments/:id` [Authenticated]
  - Returns complete assignment, customer delivery address, recipient contact, and order metadata.
  - Scoped SQL authorization (cross-staff or cross-store access returns 404 to prevent IDOR and tenant leakage).
- **Update Assignment Status:** `PATCH /api/delivery/assignments/:id/status` [Assigned Delivery Staff]
  - Atomically updates assignment and associated order status in a single database transaction.
  - Request Body:
    ```json
    {
      "status": "out_for_delivery"
    }
    ```
    or
    ```json
    {
      "status": "delivered"
    }
    ```

### 6. Payments & Order Payment Operations (Milestone 9)

> **Important:** Milestone 9 implements a V1 internal/mock backend payment lifecycle. **No real payment gateway (e.g., Razorpay, Stripe) is integrated in this milestone.** Real external gateway integrations will be added in future phases.

#### Payment Model & State Machine
- **One-to-One Model:** Exactly one payment record exists per order, enforced by PostgreSQL's `UNIQUE (order_id)` constraint on the `payments` table.
- **Supported Payment Methods:** `cod`, `upi`, `card`, `net_banking`.
- **Payment Status Lifecycle:**
  ```text
  PENDING ───► PAID
          └───► FAILED
  PAID    ───► REFUNDED (future phase)
  ```
- **Order Status Separation:** Operational fulfillment (`orders.status`: `PLACED`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`) and payment status (`orders.payment_status` & `payments.status`) remain strictly decoupled. Processing mock payment updates `payment_status` but does **not** change `orders.status`.
- **COD Rules:** Cash on Delivery (COD) is not an online transaction. Calling `/pay` or `/fail` on COD orders returns `400 Bad Request`. COD orders remain `PENDING` until physical delivery and collection.
- **Amount & Data Integrity:** Clients cannot override payment amounts, status, or timestamps. The backend derives the amount authoritatively from `orders.total_amount`.
- **Concurrency Safety:** Mock payment endpoints lock the order and payment rows with `SELECT ... FOR UPDATE` inside an atomic transaction. Concurrent attempts to pay the same order will result in exactly one successful transition to `PAID` (200 OK) while the other receives a `409 Conflict`.

#### Endpoints
- **Get Order Payment:** `GET /api/orders/:orderId/payment` [Authenticated]
  - Customer: Only payments for own orders.
  - Store Owner / Manager: Only payments for orders of stores they own/manage.
  - Platform Admin: Platform-wide access.
  - Response (200):
    ```json
    {
      "success": true,
      "data": {
        "id": "62000000-0000-0000-0000-000000000001",
        "order_id": "60000000-0000-0000-0000-000000000001",
        "order_number": "LC-100001",
        "payment_method": "upi",
        "status": "PENDING",
        "amount": "80.00",
        "transaction_reference": null,
        "paid_at": null,
        "created_at": "2026-09-14T01:00:00.000Z",
        "updated_at": "2026-09-14T01:00:00.000Z"
      }
    }
    ```
- **Get Payment by ID:** `GET /api/payments/:id` [Authenticated]
  - Multi-tenant and anti-IDOR scoped: Joins `orders` and verifies customer ownership, store management role, or platform admin role.
  - Unauthorized or cross-tenant access returns `404 Not Found`.
- **Mock Payment Success:** `POST /api/orders/:orderId/payment/pay` [Authenticated Customer]
  - Simulates a successful online transaction for an eligible pending order owned by the customer.
  - Atomically transitions `payments.status = 'PAID'` and `orders.payment_status = 'PAID'`.
  - Sets `paid_at = CURRENT_TIMESTAMP` and assigns a safe development transaction reference (`MOCK-UPI-<order_number>`).
  - Response (200):
    ```json
    {
      "success": true,
      "message": "Payment processed successfully.",
      "data": {
        "id": "62000000-0000-0000-0000-000000000001",
        "order_id": "60000000-0000-0000-0000-000000000001",
        "order_number": "LC-100001",
        "order_status": "PLACED",
        "payment_method": "upi",
        "status": "PAID",
        "order_payment_status": "PAID",
        "amount": "80.00",
        "transaction_reference": "MOCK-UPI-LC-100001",
        "paid_at": "2026-09-14T01:05:00.000Z"
      }
    }
    ```
- **Mock Payment Failure:** `POST /api/orders/:orderId/payment/fail` [Authenticated Customer]
  - Simulates an online transaction failure for an eligible pending order owned by the customer.
  - Atomically transitions `payments.status = 'FAILED'` and `orders.payment_status = 'FAILED'`.
  - Does **not** cancel the order or alter order totals/inventory.
  - Response (200):
    ```json
    {
      "success": true,
      "message": "Payment marked as failed.",
      "data": {
        "id": "62000000-0000-0000-0000-000000000001",
        "order_id": "60000000-0000-0000-0000-000000000001",
        "order_number": "LC-100001",
        "order_status": "PLACED",
        "payment_method": "upi",
        "status": "FAILED",
        "order_payment_status": "FAILED",
        "amount": "80.00"
      }
    }
    ```

### 7. Reviews & Ratings API (Milestone 10)

Milestone 10 implements verified product and store reviews and rating aggregation. Reviews require an authentic purchase verified through a completed order.

#### Architecture: Product Reviews vs Store Reviews
- **Global Product Reviews:** Product reviews attach to `global_products` (`reviews.global_product_id`), representing the global product identity across all merchant store listings.
- **Store Reviews:** Store reviews attach to `stores` (`reviews.store_id`).
- **Database Constraint (`reviews_check`):** Enforces that exactly one of `store_id` or `global_product_id` is populated per review. Submitting both or neither is rejected with `400 Bad Request`.

#### Verified Purchase & Completed Order Requirements
- **Customer Ownership:** Only the customer who placed the order (`orders.customer_id = customers.id`) may submit a review.
- **Completed Fulfillment:** Only orders in a completed state are eligible:
  - Delivery orders: `status = 'DELIVERED'`
  - Pickup orders: `status = 'PICKED_UP'`
  - Orders in `PLACED`, `CONFIRMED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, or `CANCELLED` cannot be reviewed.
- **Target Verification:**
  - Store review: The order must have been placed at the specified `store_id`.
  - Product review: The order items must include a `store_product` mapped to the specified `global_product_id` (`order_items.store_product_id -> store_products.global_product_id`).
- **Rating Range:** Integer ratings strictly from 1 to 5.
- **Duplicate Prevention:** A customer can submit at most one review for a given target on a given order. Subsequent attempts return `409 Conflict`.

#### Endpoints
- **Create Review:** `POST /api/reviews` [Authenticated Customer]
  - Request Body (Store Review):
    ```json
    {
      "order_id": "60000000-0000-0000-0000-000000000001",
      "store_id": "10000000-0000-0000-0000-000000000001",
      "rating": 5,
      "comment": "Fast delivery and great packaging!"
    }
    ```
  - Request Body (Product Review):
    ```json
    {
      "order_id": "60000000-0000-0000-0000-000000000001",
      "global_product_id": "20000000-0000-0000-0000-000000000002",
      "rating": 4,
      "comment": "Good quality product."
    }
    ```
  - Response (201 Created):
    ```json
    {
      "success": true,
      "message": "Review submitted successfully.",
      "data": {
        "id": "70000000-0000-0000-0000-000000000003",
        "order_id": "60000000-0000-0000-0000-000000000001",
        "order_number": "LC-100001",
        "store_id": "10000000-0000-0000-0000-000000000001",
        "global_product_id": null,
        "rating": 5,
        "comment": "Fast delivery and great packaging!",
        "status": "published",
        "customer": {
          "id": "12000000-0000-0000-0000-000000000001",
          "name": "Demo Customer"
        },
        "created_at": "2026-09-14T01:30:00.000Z",
        "updated_at": "2026-09-14T01:30:00.000Z"
      }
    }
    ```
- **List All Reviews:** `GET /api/reviews` [Public / Authenticated]
  - Supports query parameters `?store_id=...` and `?global_product_id=...`.
  - Public users view `published` reviews. Platform admins can view all statuses.
- **Get Review by ID:** `GET /api/reviews/:id` [Public / Authenticated]
  - Returns sanitized review details with customer display name and target metadata.
- **Get Store Reviews & Aggregates:** `GET /api/stores/:storeId/reviews` [Public]
  - Returns store reviews with computed `average_rating` and `review_count`.
  - Response (200 OK):
    ```json
    {
      "success": true,
      "data": {
        "store_id": "10000000-0000-0000-0000-000000000001",
        "store_name": "Sharma Supermarket",
        "average_rating": 4.5,
        "review_count": 2,
        "reviews": [...]
      }
    }
    ```
- **Get Global Product Reviews & Aggregates:** `GET /api/global-products/:globalProductId/reviews` [Public]
  - Returns product reviews with computed `average_rating` and `review_count`.
  - Response (200 OK):
    ```json
    {
      "success": true,
      "data": {
        "global_product_id": "20000000-0000-0000-0000-000000000001",
        "product_name": "Amul Taaza Milk 1L",
        "average_rating": 5.0,
        "review_count": 1,
        "reviews": [...]
      }
    }
    ```
- **Get Customer Review History:** `GET /api/customers/me/reviews` [Authenticated Customer]
  - Returns the list of all reviews submitted by the authenticated customer.

### 8. Stores API (Milestone 2 & 5)
- **List All Stores:** `GET /api/stores` [Public]
- **Get Store by ID:** `GET /api/stores/:id` [Public]
- **Get Store by Slug:** `GET /api/stores/slug/:slug` [Public]
- **Create Store:** `POST /api/stores` [business_owner / admin only]
- **Update Store:** `PATCH /api/stores/:id` [Store Owner / Manager / Platform Admin]

### 9. Categories API (Milestone 3 & 5)
- **List Categories:** `GET /api/categories` [Public]
- **Get Category by ID:** `GET /api/categories/:id` [Public]
- **Create Category:** `POST /api/categories` [Store Owner / Manager for target store_id]
- **Update Category:** `PATCH /api/categories/:id` [Store Owner / Manager for category's store_id]

### 10. Global Products API (Milestone 3 & 5)
- **List Global Products:** `GET /api/global-products` [Public]
- **Get Global Product by ID:** `GET /api/global-products/:id` [Public]
- **Create Global Product:** `POST /api/global-products` [Platform Admin only]
- **Update Global Product:** `PATCH /api/global-products/:id` [Platform Admin only]

### 11. Store Products / Store Listings API (Milestone 3 & 5)
- **List Products for Store:** `GET /api/stores/:storeId/products` [Public]
- **Get Product for Store:** `GET /api/stores/:storeId/products/:id` [Public]
- **Create Store Product:** `POST /api/stores/:storeId/products` [Store Owner / Manager for storeId]
- **Update Store Product:** `PATCH /api/stores/:storeId/products/:id` [Store Owner / Manager for storeId]
