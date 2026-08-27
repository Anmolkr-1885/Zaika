# 🍽️ Zaika — Food Delivery Platform (Microservices Architecture)

Zaika is a complete food-delivery platform built from scratch, inspired by real-world apps like **Zomato/Swiggy**. It's built using a **microservices architecture** with independent, horizontally-scalable backend services communicating via **RabbitMQ**, real-time updates powered by **Socket.IO**, live rider tracking with **Leaflet**, and dual payment gateway support (**Razorpay** + **Stripe**).

This was built as a team project to deeply understand how large-scale food delivery systems work under the hood — from service isolation and async messaging to live GPS tracking and role-based access control.

### 🔗 [Live Application Link](https://zaika-frontend.onrender.com)
### 🎥 [Video Link](https://zaika-demoVideo.com)


## ✨ Features

### 👤 Customer
- Google OAuth login (one-click, no passwords)
- Browse nearby restaurants (geo-location based, sorted by distance)
- Search restaurants, add items to cart, live cart sync
- Multiple saved delivery addresses (interactive map picker)
- Checkout with **Razorpay** or **Stripe**
- Real-time order status updates (placed → accepted → preparing → out for delivery → delivered)
- Live rider location tracking on map with route drawn to your address
- Order history (active + completed)

### 🏪 Restaurant (Seller)
- Restaurant onboarding with image upload & auto-location detection
- Menu management — add/delete items, toggle availability
- Live incoming order dashboard with **sound notifications**
- One-click order status updates
- Open/Closed toggle to control incoming orders

### 🛵 Rider (Delivery Partner)
- Rider profile onboarding (Aadhar, DL, live photo)
- Go online/offline (must be within a geofenced radius of a restaurant "hotspot")
- Real-time incoming delivery requests with **sound alerts** & accept-within-timer
- Live turn-by-turn navigation to restaurant & customer using OSRM routing
- Broadcasts live GPS location every 10s to the customer

### 🛡️ Admin
- Verify pending restaurants and riders before they go live on the platform
- Dedicated admin dashboard, isolated auth flow


## 🏗️ Architecture

Zaika follows a **microservices architecture** — each domain is its own independently deployable Node.js/Express service with its own database access, talking to each other over HTTP (internal API keys) and **RabbitMQ** for async events.

```
                        ┌──────────────────────────┐
                        │      React Frontend      │
                        │  (Vite + TS + Tailwind)  │
                        └─────────────┬────────────┘
                                      │
        ┌───────────────┬─────────────┼─────────────┬───────────────┐
        │               │             │             │               │
        ▼               ▼             ▼             ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐
│ Auth Service │ │  Restaurant  │ │   Rider    │ │   Admin    │ │   Utils   │
│ (Google OAuth│ │   Service    │ │  Service   │ │  Service   │ │  Service  │
│    + JWT)    │ │ (Menu, Cart, │ │ (Profile,  │ │  (Verifi-  │ │ (Uploads, │
│              │ │ Orders,Addr) │ │  Location) │ │  cation)   │ │  Payments)│
└──────────────┘ └──────┬───────┘ └─────┬──────┘ └────────────┘ └───────────┘
                        │               │
                        │    RabbitMQ   │
                        └────────┬──────┘
                                 │  (order / rider events)
                                 ▼
                      ┌─────────────────────────┐
                      │     Realtime Service    │
                      │ (Socket.IO — live order │
                      │ status, rider location  │
                      │       broadcasting)     │
                      └─────────────────────────┘
```

**Why microservices + RabbitMQ?**
- Each service owns its own responsibility and can be scaled/deployed independently.
- RabbitMQ decouples the **Restaurant Service** (order ready) from the **Rider Service** (rider matching), and the **Utils Service** (payment success) from the **Restaurant Service** (order confirmation) — so a slow/down consumer never blocks the producer.
- Internal service-to-service calls (e.g., Rider Service → Restaurant Service to assign a rider) are authenticated using a shared `x-internal-key` header, keeping internal APIs closed to the public.

## 🧰 Tech Stack

**Frontend**
- React 19 + TypeScript + Vite
- Tailwind CSS 4
- React Router v7
- Socket.IO Client
- Leaflet + React-Leaflet + Leaflet Routing Machine (live maps & navigation)
- React Hot Toast
- Google OAuth (`@react-oauth/google`)
- Stripe.js

**Backend (all services)**
- Node.js + Express 5 + TypeScript
- MongoDB + Mongoose (Auth, Restaurant, Rider services)
- MongoDB native driver (Admin service)
- JWT-based authentication
- RabbitMQ (`amqplib`) for async messaging
- Socket.IO (Realtime service)
- Multer + Cloudinary (image uploads)
- Razorpay & Stripe SDKs (payments)
- Morgan (logging)

**Infra**
- Docker (containerized services)
- CloudAMQP (managed RabbitMQ)
- Render (backend + frontend deployment)


## 📦 Microservices Overview

| Service | Responsibility |
|---|---|
| **Auth Service** | Google OAuth login, JWT issuance, role assignment (customer/seller/rider) |
| **Restaurant Service** | Restaurants, menu items, cart, addresses, orders, order lifecycle |
| **Utils Service** | Cloudinary uploads, Razorpay/Stripe payment creation & verification |
| **Realtime Service** | Socket.IO gateway — order updates, rider location, notifications |
| **Rider Service** | Rider onboarding, availability, order acceptance, live location |
| **Admin Service** | Restaurant & rider verification dashboard |

Each backend service lives in `services/<name>` and is a standalone TypeScript + Express app with its own `package.json`, `tsconfig.json`, and Dockerfile-ready structure.


<!-- ## 🔄 Order Lifecycle (End-to-End Flow)

1. **Customer** adds items to cart → checks out → pays via Razorpay/Stripe (`Utils Service`).
2. On successful payment, `Utils Service` publishes a `PAYMENT_SUCCESS` event to RabbitMQ.
3. `Restaurant Service` consumes the event, marks the order `paid`, and emits `order:new` via the `Realtime Service` to the restaurant's dashboard (with a sound alert).
4. Restaurant updates status: `accepted → preparing → ready_for_rider`.
5. On `ready_for_rider`, `Restaurant Service` publishes an `ORDER_READY_FOR_RIDER` event.
6. `Rider Service` consumes it, finds nearby **available & verified** riders using MongoDB geospatial queries, and notifies them in real time (with a 10s accept window + sound alert).
7. First rider to accept gets assigned; `Restaurant Service` locks the order to that rider.
8. Rider picks up the order, and both customer & restaurant get live status pushes over Socket.IO.
9. Rider's live GPS location streams to the customer every 10 seconds, rendered on a Leaflet map with a routed path to the delivery address.
10. Order marked `delivered` once the rider completes the drop. -->


## 📁 Project Structure

```
zaika/
│
├── frontend/                 # React + Vite + TS client
│   ├── src/
│   │   ├── assets/
│   │   ├── components/       # Reusable UI 
│   │   ├── context/          # AppContext (auth/cart/location)
│   │   ├── pages/            # Route-level pages (Home, Cart...)
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── types.ts          # Shared TypeScript interfaces
│
└── services/
│   ├── auth/                 # OAuth + JWT + role management 
│   ├── restaurant/           # Menu, cart, orders, addressess
│   ├── rider/                # Rider onboarding, availability...
│   ├── admin/                # Verification dashboard
│   ├── realtime/             # Socket.IO gateway
│   └── utils/                # Cloudinary uploads + Payments
│
├── .gitignore 
└── README.md
```


## ⚙️ Getting Started (Local Development)

Follow the steps below to run the complete Zaika platform locally.

### Prerequisites

Make sure the following are installed/configured before starting:

- **Node.js ≥ 18**
- **MongoDB** — Local MongoDB or MongoDB Atlas
- **RabbitMQ** — CloudAMQP or a local RabbitMQ instance
- **Cloudinary** account for image storage
- **Razorpay** test API credentials
- **Stripe** test API credentials
- **Google OAuth** Client ID and Client Secret

---

### 1. Clone the Repository

```bash
git clone https://github.com/Anmolkr-1885/Zaika.git
cd Zaika
```

## 2. Install Dependencies

Install dependencies for the frontend and all backend microservices:

```bash
# Frontend
cd frontend
npm install
cd ..

# Auth Service
cd services/auth
npm install
cd ../..

# Restaurant Service
cd services/restaurant
npm install
cd ../..

# Rider Service
cd services/rider
npm install
cd ../..

# Admin Service
cd services/admin
npm install
cd ../..

# Realtime Service
cd services/realtime
npm install
cd ../..

# Utils Service
cd services/utils
npm install
cd ../..
```

---

## 3. Configure Environment Variables

Each microservice requires its own `.env` file.


## 4. Start the Application

Start each service in a separate terminal:

**Terminal 1 — Auth Service**

```bash
cd services/auth
npm run dev
```

**Terminal 2 — Restaurant Service**

```bash
cd services/restaurant
npm run dev
```

**Terminal 3 — Rider Service**

```bash
cd services/rider
npm run dev
```

**Terminal 4 — Admin Service**

```bash
cd services/admin
npm run dev
```

**Terminal 5 — Realtime Service**

```bash
cd services/realtime
npm run dev
```

**Terminal 6 — Utils Service**

```bash
cd services/utils
npm run dev
```

**Terminal 7 — Frontend**

```bash
cd frontend
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## 🚀 Deployment

- **Backend services** — Dockerized and deployed independently on **Render**.
- **Frontend** — Static build deployed on **Render**.
- **Message broker** — **CloudAMQP** (managed RabbitMQ) for cross-service events.
- **Database** — MongoDB Atlas.
- **Media storage** — Cloudinary.

---

## 🗺️ Roadmap / Future Improvements

- [ ] Rider earnings dashboard & payout history
- [ ] Order rating & review system
- [ ] Coupon / promo code engine
- [ ] Push notifications (Web Push / FCM) instead of in-tab sound alerts
- [ ] Horizontal scaling of Realtime Service using Redis adapter for Socket.IO
- [ ] Automated CI/CD pipeline with GitHub Actions

---

## 📄 License

This project was built for educational purposes as part of a team learning exercise in microservices, real-time systems, and payment integrations.

---

## 🙌 Acknowledgements

Built with ❤️ by **Anmol, Kapil, Akash & Vikas** — as a hands-on deep dive into how production food-delivery platforms like Zomato/Swiggy work internally.