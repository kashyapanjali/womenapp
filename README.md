# NearToWomen – Frontend

A simple React frontend for a women‑focused e‑commerce app. Users can browse, search, add to cart, checkout, and view their orders. Admins can switch to a dashboard to manage products and orders.

## Prerequisites
- Node.js 18+
- Backend API running at `http:.....`

## Getting Started
1) Install dependencies
   - `npm install`
2) Start the dev server
   - `npm start`
3) Open the app
   - `http://localhost:3000`

## Configuration
- API base URL is set in `src/api/api.js`:
  - `export const BASE_URL = 'http://.........../api'`
- Ensure the backend exposes `/api` and is running on port 5000.

## Features
- Product listing and details
- Search with live results
- Cart & checkout (COD/UPI)
- User orders page
- Admin dashboard (switch via menu)

## Tips
- Switch views in the URL: `?view=shop` or `?view=admin`
- Multi‑login in same browser: open admin in a tab with `?auth=session`
- If search shows no results, clear filters or select “All” category

## Scripts
- `npm start` – run development server
- `npm test` – run tests
- `npm run build` – build production bundle

## Structure
- `src/components/` – UI components
- `src/components/admin/` – admin screens
- `src/api/` – API endpoints & auth helpers

—
Frontend only. Run the backend separately.