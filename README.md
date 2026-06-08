# Movie Rating System (MERN)

A full MERN stack movie rating application with a modern React UI, Express REST API, and MongoDB data models.

## Features

- Browse movies with ratings, genres, runtime, release year, and posters
- Search, genre filtering, and sorting
- Add new movies from the UI
- Submit star ratings and written reviews
- Live rating aggregation
- Express + Mongoose backend with seed data
- Responsive Vite React frontend

## Setup

```bash
npm run install:all
```

Create `server/.env`:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/movie-rating-system
PORT=5000
CLIENT_URL=http://localhost:5173
```

Seed and run:

```bash
npm run seed --prefix server
npm run dev
```

Open `http://localhost:5173`.

If MongoDB is not running locally, start it first or replace `MONGO_URI` with your MongoDB Atlas connection string.
