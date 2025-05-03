# Kammryndancy Website & API

Kammryndancy is a full-stack web application for homebrewing and nature scavenger hunts. It features a modern Angular frontend and a Node.js/Express REST API backend with MongoDB for persistent storage.

## Website Overview
- **Frontend:** Angular (TypeScript)
- **Backend/API:** Node.js, Express
- **Database:** MongoDB
- **Deployment:** GitHub Actions, PM2, self-hosted/VM

## Features
### Brewing
- Browse a collection of beer recipes, each with malts, hops, yeast, adjuncts, ABV, SRM, IBU, and more.
- Recipes can include images, YouTube links, and external recipe URLs.
- Recipes are prioritized for display using a `userPriority` field.
- Admins can add, update, or delete recipes (protected endpoints).
- Beer recipes can be scraped and imported from Brewfather via the backend.

### Scavenger Hunt
- Explore a database of plants, animals, and insects, each with images and descriptions.
- Generate random scavenger hunt lists filtered by category, season, or count.
- Add, update, or remove scavenger hunt items (admin only).

## API Authentication & Security
- All `/api` endpoints (except `/health`) require authentication.
- Uses HTTP Basic Auth with credentials stored in environment variables (`USER_ID`, `API_KEY`).
- CORS is configured to allow requests from trusted frontend origins only.

## How to Run (Development)
1. **Clone the repository** and install dependencies:
   ```sh
   npm install
   ```
2. **Configure environment variables** in a `.env` file:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   BREWFATHER_USERID=your_brewfather_userid
   BREWFATHER_API_KEY=your_brewfather_api_key
   USER_ID=your_user_id
   API_KEY=your_api_key
   FRONTEND_ORIGIN=http://localhost:4200
   PORT=3000
   ```
3. **Start the backend API:**
   ```sh
   npm run dev
   ```
4. **Start the Angular frontend:**
   ```sh
   cd kammryndancy
   npm install
   npm start
   ```

## API Endpoints (Summary)
### Health
- `GET /health` — App and DB health check
- `GET /health/open` — Liveness check (no DB)

### Beer Recipes
- `GET /api/beerrecipes` — List all recipes (sorted by user priority)
- `GET /api/beerrecipes/:id` — Get recipe by ID
- `GET /api/beerrecipes/by-name/:name` — Search recipes by name
- `POST /api/beerrecipes` — Create recipe (auth required)
- `PUT /api/beerrecipes/:id` — Update recipe (auth required)
- `DELETE /api/beerrecipes/:id` — Delete recipe (auth required)
- `POST /api/scrape` — Scrape/import from Brewfather (auth required)

### Scavenger Hunt
- `GET /api/scavengerhunt` — List all items
- `GET /api/scavengerhunt/filter?...` — Filtered/random hunt items
- `POST /api/scavengerhunt` — Add item (auth required)
- `PUT /api/scavengerhunt/:name/:category/:season` — Update item (auth required)
- `DELETE /api/scavengerhunt/:name/:category/:season` — Remove item (auth required)

## Implementation Notes
- **Backend:**
  - Uses Mongoose for MongoDB models (BeerRecipe, ScavengerHuntItem, BlacklistedBatch).
  - Implements CORS, authentication middleware, and environment-based config.
  - Includes a `userPriority` field for recipe sorting.
- **Frontend:**
  - Angular app with modular components for brewing, scavenger hunt, and more.
  - Environment variables (`environment.ts`) control API URL and keys.
  - Uses modern UI/UX best practices.

## Contributing
- Pull requests and issues are welcome!
- Please add tests for any new features or bug fixes.

## License
MIT
