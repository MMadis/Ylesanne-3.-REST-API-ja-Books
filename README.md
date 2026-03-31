# REST API ja Books

## Autorid
- Madis (individuaaltoo)

## Installatsioonijuhised
1. Paigalda Node.js 20+ (Docker on valikuline).
2. Installeeri paketid:
   - `npm install`
3. Lisa `.env` fail projekti juurkausta:
   - `DATABASE_URL=postgresql://username:password@server:5432/database`
   - `DATA_SOURCE_MODE=mock` (muuda `prisma`, kui soovid DB reziimi)
4. Kaivita PostgreSQL (vali yks variant):
   - Dockeriga: `docker compose up -d`
   - Ilma Dockerita: kasuta kohalikku PostgreSQL serverit (`localhost:5432`)
5. Loo Prisma client, migratsioonid ja seed:
   - `npm run db:setup`

### Ilma Dockerita (kohalik PostgreSQL)
1. Veendu, et kohalik PostgreSQL teenus tootab.
2. Loo andmebaas nimega `library_db` (voi kasuta enda nimega andmebaasi).
3. Sea `.env` failis sobiv yhendusstring, naiteks:
   - `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/library_db`
4. Kaivita:
   - `npm run db:setup`
   - `npm run dev:prisma`

## Kaivitamise kasud
- Fastify rakenduse port: `3001`
- Fastify kaivitus:
  - Mock mode: `npm run dev`
  - Prisma mode (Windows): `npm run dev:prisma`

## Testimine
- Koik mock-testid: `npm test`
- Veakaitumise testid: `npm run test:errors`
- Prisma integratsioonitest: `npm run test:prisma`

Prisma testi eeldused:
- `.env` failis peab olemas olema korrektne `DATABASE_URL`.
- PostgreSQL peab jooksma (Docker voi kohalik teenus).

## Lisaulesanded
- Soft delete: tehtud Prisma mudelites (`deletedAt` valjad) ja Prisma service kustutused uuendavad kirjet, mitte ei kustuta fyysiliselt.
- JWT autentimine: tehtud. Login endpoint `POST /api/auth/login` tagastab tokeni ning `POST/PUT/DELETE /api/v1/*` paringud on kaitstud.
- Rate limiting: tehtud `@fastify/rate-limit` pluginaga (`100` paringut minutis).
- Docker / docker-compose: tehtud. PostgreSQL seadistus on failis `docker-compose.yml`.
- API testid (Jest / Supertest): tehtud. Testifailid asuvad `tests/` kaustas (`api.test.ts`, `api.errors.test.ts`, `api.prisma.test.ts`).

## Koik endpointid
### Auth
- `POST /api/auth/login`

### Books
- `POST /api/v1/books`
- `GET /api/v1/books`
- `GET /api/v1/books/:id`
- `PUT /api/v1/books/:id`
- `DELETE /api/v1/books/:id`
- `POST /api/v1/books/:id/reviews`
- `GET /api/v1/books/:id/reviews`
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

### Genres
- `GET /api/v1/genres`
- `POST /api/v1/genres`
- `GET /api/v1/genres/:id`
- `GET /api/v1/genres/:id/books`

### Reviews
- `GET /api/v1/reviews/:id`
- `PUT /api/v1/reviews/:id`
- `DELETE /api/v1/reviews/:id`

## Query parameterid
### Books list: `GET /api/v1/books`
- `title`: string
- `author`: string
- `genre`: string
- `language`: string
- `year`: number
- `publisher`: string
- `sortBy`: `title | publishedYear`
- `order`: `asc | desc`
- `page`: number
- `limit`: number (max 100)

### Book reviews: `GET /api/v1/books/:id/reviews`
- `rating`: number (1-5)
- `sortBy`: `createdAt`
- `order`: `asc | desc`

### Authors list: `GET /api/v1/authors`
- `lastName`: string
- `nationality`: string
- `sortBy`: `lastName`
- `order`: `asc | desc`

### Publishers list: `GET /api/v1/publishers`
- `name`: string
- `country`: string

## Request body naited
### `POST /api/v1/books`
```json
{
  "title": "Harry Potter and the Chamber of Secrets",
  "isbn": "9780747538493",
  "publishedYear": 1998,
  "pageCount": 251,
  "language": "English",
  "description": "Second book",
  "coverImage": "https://example.com/cover.jpg",
  "authorId": 1,
  "publisherId": 1,
  "genreIds": [1, 2]
}
```

### `PUT /api/v1/books/:id`
```json
{
  "title": "Updated title",
  "pageCount": 320
}
```

### `POST /api/v1/books/:id/reviews`
```json
{
  "userName": "alice",
  "rating": 5,
  "comment": "Great book"
}
```

### `PUT /api/v1/reviews/:id`
```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

### `POST /api/v1/authors`
```json
{
  "firstName": "J.K.",
  "lastName": "Rowling",
  "birthYear": 1965,
  "nationality": "British",
  "biography": "Author of Harry Potter"
}
```

### `PUT /api/v1/authors/:id`
```json
{
  "biography": "Updated biography"
}
```

### `POST /api/v1/publishers`
```json
{
  "name": "Bloomsbury",
  "country": "United Kingdom",
  "foundedYear": 1986,
  "website": "https://www.bloomsbury.com"
}
```

### `PUT /api/v1/publishers/:id`
```json
{
  "website": "https://new-site.example"
}
```

### `POST /api/v1/genres`
```json
{
  "name": "Fantasy"
}
```

## Response naited
### Success (201)
```json
{
  "data": {
    "id": 15,
    "title": "Harry Potter and the Chamber of Secrets"
  }
}
```

### Success with pagination (200)
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

### No content (204)
- Vastuse body puudub.

## Voimalikud error vastused
### 400 Validation failed
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

### 404 Resource not found
```json
{
  "error": "Book not found",
  "details": []
}
```

### 409 Conflict
```json
{
  "error": "ISBN already exists",
  "details": []
}
```

### 500 Internal server error
```json
{
  "error": "Internal server error",
  "details": []
}
```

## cURL naited

### 1) Login (JWT)
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{}"
```

### 2) Books list koos query parameetritega
```bash
curl "http://localhost:3001/api/v1/books?title=harry&sortBy=publishedYear&order=desc&page=1&limit=10"
```

### 3) Leia vajalikud ID-d
```bash
curl "http://localhost:3001/api/v1/authors"
curl "http://localhost:3001/api/v1/publishers"
curl "http://localhost:3001/api/v1/genres"
```

### 4) Create book (JWT required)
```bash
curl -X POST "http://localhost:3001/api/v1/books" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "isbn": "9780306406157",
    "publishedYear": 2024,
    "pageCount": 200,
    "language": "English",
    "description": "Demo",
    "authorId": <AUTHOR_ID>,
    "publisherId": <PUBLISHER_ID>,
    "genreIds": [<GENRE_ID>]
  }'
```

### 5) Add review (JWT required)
```bash
curl -X POST "http://localhost:3001/api/v1/books/<BOOK_ID>/reviews" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"userName":"bob","rating":5,"comment":"Excellent"}'
```

## HTTP naited (Windows PowerShell)

### 1) Login (JWT) ja tokeni salvestamine
```powershell
$token = (Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/auth/login" -ContentType "application/json" -Body "{}").token
```

### 2) Books list koos query parameetritega
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3001/api/v1/books?title=harry&sortBy=publishedYear&order=desc&page=1&limit=10"
```

### 3) Leia olemasolevad ID-d (author/publisher/genre)
```powershell
$authorId = (Invoke-RestMethod -Method Get -Uri "http://localhost:3001/api/v1/authors").data[0].id
$publisherId = (Invoke-RestMethod -Method Get -Uri "http://localhost:3001/api/v1/publishers").data[0].id
$genreId = (Invoke-RestMethod -Method Get -Uri "http://localhost:3001/api/v1/genres").data[0].id
```

### 4) Create book (JWT required)
```powershell
$headers = @{ Authorization = "Bearer $token" }
$isbn = "9780306406157" # Kui saad 409 (ISBN already exists), muuda see teiseks kehtivaks ISBN-13 vaartuseks
$bookBody = @{ title = "Test Book"; isbn = $isbn; publishedYear = 2024; pageCount = 200; language = "English"; description = "Demo"; authorId = $authorId; publisherId = $publisherId; genreIds = @($genreId) } | ConvertTo-Json
$createdBook = Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/v1/books" -Headers $headers -ContentType "application/json" -Body $bookBody
$bookId = $createdBook.data.id
```

### 5) Add review to book (JWT required)
```powershell
$reviewBody = @{ userName = "bob"; rating = 5; comment = "Excellent" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/v1/books/$bookId/reviews" -Headers $headers -ContentType "application/json" -Body $reviewBody
```

### 6) Update author (JWT required)
```powershell
$authorBody = @{ biography = "Updated bio" } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri "http://localhost:3001/api/v1/authors/$authorId" -Headers $headers -ContentType "application/json" -Body $authorBody
```

### 7) Delete publisher (JWT required)
```powershell
Invoke-RestMethod -Method Delete -Uri "http://localhost:3001/api/v1/publishers/$publisherId" -Headers $headers
```