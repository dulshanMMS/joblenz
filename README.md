# JobLenz

A full-stack job management application with AI-powered summaries built for Optiq Labs.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: JWT + Bcrypt
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Project Structure

```
joblenz/
├── backend/    # NestJS REST API
├── frontend/   # React + Vite application
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 9

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd joblenz
   ```

2. Install all dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. Fill in the values in both `.env` files (see Environment Variables section below).

### Running Locally

```bash
# Run backend (http://localhost:3000)
pnpm dev:backend

# Run frontend (http://localhost:5173)
pnpm dev:frontend
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the API runs on (default: 3000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | JWT expiry duration (e.g. `7d`) |
| `GEMINI_API_KEY` | Google Gemini API key for AI summaries |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |

## API Documentation

Swagger docs are available at `http://localhost:3000/api/docs` when running locally.
