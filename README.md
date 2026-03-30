# Library REST API (Fastify + TypeScript + Prisma)

## Author
- Madis

## Project Status
- Phase 1 (Mock in-memory API): In progress, core implementation created.
- Phase 2 (PostgreSQL + Prisma): Schema and seed scaffolding added.

## Tech Stack
- Node.js
- TypeScript (strict)
- Fastify
- Zod
- PostgreSQL
- Prisma ORM

## Setup
1. Install dependencies:
   - `npm install`
2. Copy environment template:
   - create `.env` from `.env.example`
3. Start development server:
   - `npm run dev`

Server runs on port `3001` by default.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`
- `npm test`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`

## Docker (PostgreSQL)
- Start DB: `docker compose up -d`
- Stop DB: `docker compose down`

## Implemented Endpoints
### Books
- `POST /api/v1/books`
- `GET /api/v1/books`
- `GET /api/v1/books/:id`
- `PUT /api/v1/books/:id`
- `DELETE /api/v1/books/:id`
- `POST /api/v1/books/:bookId/reviews`
- `GET /api/v1/books/:bookId/reviews`
- `GET /api/v1/books/:id/average-rating`

### Authors
- `POST /api/v1/authors`
- `GET /api/v1/authors`
- `GET /api/v1/authors/:id`
- `PUT /api/v1/authors/:id`
- `DELETE /api/v1/authors/:id`
- `GET /api/v1/authors/:id/books`

### Publishers
- `POST /api/v1/publishers`
- `GET /api/v1/publishers`
- `GET /api/v1/publishers/:id`
- `PUT /api/v1/publishers/:id`
- `DELETE /api/v1/publishers/:id`
- `GET /api/v1/publishers/:id/books`

### Reviews
- `GET /api/v1/reviews/:id`
- `PUT /api/v1/reviews/:id`
- `DELETE /api/v1/reviews/:id`

### Genres
- `GET /api/v1/genres`
- `POST /api/v1/genres`
- `GET /api/v1/genres/:id`
- `GET /api/v1/genres/:id/books`

## Query Examples
- `GET /api/v1/books?title=harry`
- `GET /api/v1/books?author=rowling`
- `GET /api/v1/books?genre=Fantasy&language=English&year=2007`
- `GET /api/v1/books?sortBy=publishedYear&order=desc&page=1&limit=10`
- `GET /api/v1/books/1/reviews?rating=5`

## Response Formats
### Pagination
```json
{
  "data": [],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 0,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "isbn",
      "message": "Invalid ISBN format"
    }
  ]
}
```
