# Booknshow

<p align="center">
  <img src="https://parbet-parbet-db-gradio.hf.space/api/files/g1f525rotpvbopo/pztlpe7mdb2dzcq/c3137922_07f9_4c2d_be10_ebaad4cf70a0_emqVNPlW3p.png?token=" alt="Booknshow Logo" width="340" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Build-Passing-E7364D?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-React_18-333333?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Firebase-EB5B6E?style=for-the-badge&logo=firebase" />
  <img src="https://img.shields.io/badge/API-Node_Serverless-333333?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Payments-Razorpay-E7364D?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-333333?style=for-the-badge" />
</p>

<p align="center">
Global event discovery, ticket booking and digital access management platform for sports, concerts, festivals, theatre and premium live experiences.
</p>

## Platform Overview

Booknshow is a cloud synchronized digital event marketplace developed to manage large scale live event inventory, high concurrency booking requests, secure payment validation and QR based ticket fulfillment across multiple event categories.

The platform provides a unified buyer interface where users can:

- discover live and upcoming events
- search tickets by category, city, venue and date
- reserve seats and quantity based ticket slabs
- complete secure payment checkout
- receive digital QR validated e-tickets
- access booking history and downloadable invoices

Booknshow is designed as a scalable booking commerce engine rather than a static event listing website. Inventory updates, featured rails, hero banners, category promotions, event availability and order persistence are maintained through real-time cloud listeners and admin controlled deployment modules.

## Supported Event Categories

The marketplace currently supports dynamic listing and booking for:

- Sports Events
- Concerts and Music Tours
- Theatre and Drama Shows
- Standup Comedy
- College Festivals
- Trade Expos
- Fan Meets
- Premium VIP Experiences
- Custom Organizer Events

Each event can be configured independently with:

- venue metadata
- city metadata
- booking open and close windows
- ticket tier pricing
- ticket quantity inventory
- hero promotional banners
- recommendation rail placement

## Primary Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Application | React 18 + Vite |
| State Management | Zustand |
| Styling Layer | Tailwind CSS |
| Motion Engine | Framer Motion |
| Authentication | Firebase Auth |
| Cloud Database | Firebase Firestore |
| API Layer | Node.js Serverless Functions |
| Payment Gateway | Razorpay |
| Hosting Infrastructure | Firebase Hosting CDN |
| Ticket Verification | QR UUID Payload |

## Core Functional Systems

### Event Discovery Engine
Booknshow provides categorywise, citywise and keyword based discoverability allowing users to locate available events instantly.

### Dynamic Search Engine
Search indexing is configured to intercept event titles, venue names, cities, tags and organizer metadata in real-time.

### Secure Checkout Pipeline
Every booking request passes through quantity verification, amount calculation, payment order generation, Razorpay callback verification and booking persistence.

### QR Ticket Fulfillment
Successful bookings generate unique digital ticket payloads mapped to cloud order references for verification at venue entry.

### Admin Controlled Inventory Management
Organizers and administrators can deploy new listings, update ticket prices, modify event banners and control homepage promotion rails without rebuilding the buyer application.

## Repository Structure

```bash
booknshow/
├── assets/
│   └── booknshow-logo.svg
├── docs/
│   ├── ARCHITECTURE.md
│   ├── BRANDING_GUIDELINES.md
│   ├── DEPLOYMENT.md
│   ├── FIRESTORE_SCHEMA.md
│   ├── AUTHENTICATION.md
│   ├── API_REFERENCE.md
│   ├── TICKET_SYSTEM.md
│   ├── SEARCH_ENGINE.md
│   ├── ADMIN_MANUAL.md
│   ├── ROADMAP.md
│   ├── SECURITY.md
│   ├── CONTRIBUTING.md
│   ├── LICENSE.md
│   ├── CHANGELOG.md
│   └── CODE_OF_CONDUCT.md
├── src/
├── public/
├── package.json
└── README.md
```

## Local Development

```bash
npm install
npm run dev
```

The development server initializes the Vite runtime, hydrates Firebase environment variables and launches the buyer marketplace locally.

## Production Build

```bash
npm run build
firebase deploy --only hosting
```

Production deployment compiles the optimized buyer application, updates hosting assets and synchronizes CDN delivery for global users.

## Key Buyer Flow

1. User lands on homepage.
2. User browses hero banners and featured event rails.
3. User searches or selects a target event.
4. User opens event detail page.
5. User selects ticket quantity and pricing tier.
6. User authenticates account if required.
7. User completes Razorpay checkout.
8. Payment verification is confirmed through serverless callback.
9. Firestore order document is created.
10. QR validated digital ticket is issued to buyer dashboard.

## Documentation Modules

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Branding Guidelines](./docs/BRANDING_GUIDELINES.md)
- [Deployment Workflow](./docs/DEPLOYMENT.md)
- [Firestore Schema](./docs/FIRESTORE_SCHEMA.md)
- [Authentication Module](./docs/AUTHENTICATION.md)
- [API Reference](./docs/API_REFERENCE.md)
- [Digital Ticket System](./docs/TICKET_SYSTEM.md)
- [Search Engine Logic](./docs/SEARCH_ENGINE.md)
- [Admin Manual](./docs/ADMIN_MANUAL.md)
- [Roadmap](./docs/ROADMAP.md)
- [Security Protocols](./docs/SECURITY.md)
- [Contribution Standards](./docs/CONTRIBUTING.md)
- [License](./docs/LICENSE.md)
- [Changelog](./docs/CHANGELOG.md)
- [Code of Conduct](./docs/CODE_OF_CONDUCT.md)

## License

This repository is maintained under the MIT License. Refer to `docs/LICENSE.md` for complete licensing terms.
