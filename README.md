# MERN Blog Platform

A full-stack blogging platform ("Fieldnotes") built with MongoDB, Express, React and Node.js. Users can register, write posts with cover images, search, and discuss through comments.

## Features

- Register, login, logout; session persists across reloads (JWT in an httpOnly cookie)
- Create, read, update and delete your own posts, with cover image upload and preview
- Search posts by title, content, excerpt or author (case-insensitive) with pagination
- Comment on posts; delete your own comments
- Profile page (bio, profile image, your posts) and a "My Blogs" management page
- Ownership checks on every edit/delete (403 for other people's content)
- Loading, error and empty states everywhere; responsive layouts with a mobile drawer navbar

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Axios, React Icons, Context API, plain CSS
- **Backend:** Node.js, Express 4, MongoDB, Mongoose, JWT, bcryptjs, cookie-parser, multer, dotenv, cors

## Project Structure

```
backend/
  config/        db connection
  controllers/   auth, user, post, comment logic
  middleware/    auth (JWT), upload (multer), error handling
  models/        User, Post, Comment
  routes/        route definitions
  utils/         AppError, validators, file helpers
  uploads/       uploaded images (served at /uploads)
  server.js
frontend/
  src/
    components/  Navbar, PostCard, PostForm, comments, status views...
    pages/       Home, Login, Register, PostDetails, CreatePost, EditPost, Profile, MyBlogs, NotFound
    context/     AuthContext
    services/    api.js (Axios instance), authService, blogService
    hooks/ utils/ styles/
```

## Installation

You need Node.js 18+ and a running MongoDB (local or Atlas).

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in the values (a ready .env is already included for local use)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

`backend/.env`

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `PORT` | API port (default 5000) |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma-separated |
| `NODE_ENV` | `development` or `production` (production makes the cookie `secure`) |

`frontend/.env` (optional): `VITE_API_URL` — leave empty in development, because Vite proxies `/api` and `/uploads` to `http://localhost:5000`. For a split deployment set it to the API origin, set `COOKIE_SAMESITE=none` on the backend and use HTTPS.

## MongoDB Setup

- **Local:** install MongoDB Community, start it, and use `MONGO_URI=mongodb://127.0.0.1:27017/mern-blog`.
- **Atlas:** create a free cluster, add a database user, allow your IP, and paste the connection string (add the database name, e.g. `/mern-blog`).

## API Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | – | Create account |
| POST | `/api/auth/login` | – | Log in (sets cookie) |
| POST | `/api/auth/logout` | – | Clear cookie |
| GET | `/api/auth/me` | ✔ | Current user |
| PATCH | `/api/users/me` | ✔ | Update bio / profile image (multipart) |
| GET | `/api/posts?q=&page=&limit=` | – | List / search posts, newest first |
| GET | `/api/posts/search?q=` | – | Alias of the list endpoint |
| GET | `/api/posts/mine` | ✔ | Your posts |
| GET | `/api/posts/:id` | – | Post + author + comments |
| POST | `/api/posts` | ✔ | Create post (multipart: title, excerpt, content, image) |
| PUT | `/api/posts/:id` | ✔ owner | Update post (`removeImage=true` clears the cover) |
| DELETE | `/api/posts/:id` | ✔ owner | Delete post and its comments |
| GET | `/api/posts/:postId/comments` | – | List comments |
| POST | `/api/posts/:postId/comments` | ✔ | Add comment |
| DELETE | `/api/comments/:commentId` | ✔ owner | Delete comment |

Errors share one shape: `{ "success": false, "message": "...", "errors": { "field": "..." } }`.

## Running the Application

1. Start MongoDB.
2. `cd backend && npm run dev` — expect "MongoDB connected" and "API running on http://localhost:5000".
3. `cd frontend && npm run dev` — open http://localhost:5173.

## Screenshots

Add screenshots of the Home, Post Details, Create Post and My Blogs pages here (for example in a `docs/` folder).

## Future Improvements

- Email verification and password reset
- Rate limiting and `helmet` security headers
- Markdown or rich-text editing
- Likes, tags and categories
- Automated tests (Jest + Supertest, React Testing Library)
- Cloud image storage (S3 / Cloudinary) instead of local disk
