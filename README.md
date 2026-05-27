# SkillSwap

A platform where users can offer skills they know and request skills they want to learn — and swap with each other. Includes skill browsing, swap requests, user profiles, and video lecture uploads.

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | HTML, CSS, Vanilla JavaScript     |
| Backend  | Node.js + Express                 |
| Database | MySQL                             |
| Uploads  | Multer (video files)              |

---

## Project Structure

```
skillswap-final/
├── backend/
│   ├── server.js          # Entry point
│   ├── db.js              # MySQL connection pool
│   ├── package.json
│   ├── .env.example       # Copy to .env and fill in values
│   ├── uploads/           # Uploaded video files (auto-created)
│   └── routes/
│       ├── auth.js        # Register / Login
│       ├── skills.js      # Add / list skills
│       ├── swaps.js       # Send / accept / reject swap requests
│       └── videos.js      # Upload / list video lectures
├── frontend/
│   ├── index.html         # Landing page
│   ├── app.js             # Shared JS logic
│   ├── style.css
│   └── pages/
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html
│       ├── browse.html
│       ├── profile.html
│       └── videos.html
└── database/
    └── schema.sql         # Full DB setup with sample data
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [MySQL](https://dev.mysql.com/downloads/) 8.0 or higher

---

## Setup & Run

### 1. Set up the database

Open your MySQL client and run the schema:

```bash
mysql -u root -p < database/schema.sql
```

This creates the `skillswap_final` database, all tables, and sample users/skills.

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=skillswap_final
PORT=3000
```

### 3. Install dependencies

```bash
cd backend
npm install
```

### 4. Start the server

```bash
npm start
```

The app runs at **http://localhost:3000**

---

## Sample Users (from schema.sql)

| Name         | Email            | Password  | Location  |
|--------------|------------------|-----------|-----------|
| Riya Sharma  | riya@test.com    | riya123   | Delhi     |
| Arjun Mehta  | arjun@test.com   | arjun123  | Mumbai    |
| Priya Singh  | priya@test.com   | priya123  | Bangalore |

---

## API Endpoints

| Method | Route                  | Description              |
|--------|------------------------|--------------------------|
| POST   | /api/auth/register     | Register a new user      |
| POST   | /api/auth/login        | Login                    |
| GET    | /api/skills            | List all skills          |
| POST   | /api/skills            | Add a skill              |
| GET    | /api/swaps             | List swap requests       |
| POST   | /api/swaps             | Send a swap request      |
| PATCH  | /api/swaps/:id         | Accept / reject a swap   |
| GET    | /api/videos            | List videos              |
| POST   | /api/videos            | Upload a video lecture   |

---

## Notes

- Passwords are stored in plain text in this version — add `bcrypt` before deploying.
- No JWT/session auth yet — add authentication middleware for production use.
- Uploaded videos are stored locally in `backend/uploads/`.