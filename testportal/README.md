# Test Portal Website

Complete multi-page website for student testing with:
- Frontend: HTML + Tailwind CSS + Vanilla JavaScript
- Backend: Node.js + Express REST API (Vercel serverless function)
- Database: MongoDB Atlas
- Auth: JWT + bcrypt password hashing

## Pages
- `/index.html` - Student and Admin login
- `/dashboard.html` - Student dashboard, tests, results, discussion, chat
- `/test.html` - Exam interface with timer, navigation, flag, clear, autosave
- `/admin.html` - Admin panel (students, tests, questions, results, discussion, chat, block)

## Folder Structure
```txt
testportal/
|- api/
|  |- index.js
|  |- _lib/
|     |- auth.js
|     |- db.js
|     |- models.js
|- js/
|  |- api.js
|  |- index.js
|  |- dashboard.js
|  |- test.js
|  |- admin.js
|- index.html
|- dashboard.html
|- test.html
|- admin.html
|- styles.css
|- .env.example
|- vercel.json
|- package.json
```

## API Endpoints

### Authentication
- `POST /api/login`
- `POST /api/admin/login`
- `GET /api/me`

### Student Management
- `POST /api/students`
- `GET /api/students`
- `PUT /api/students/:studentId`
- `DELETE /api/students/:studentId`
- `POST /api/block`

### Test + Question Management
- `POST /api/tests`
- `GET /api/tests`
- `GET /api/tests/:testId`
- `POST /api/questions`
- `GET /api/questions/:testId`

### Exam + Results
- `POST /api/progress` (autosave)
- `GET /api/progress/:testId`
- `POST /api/submit`
- `GET /api/results`

### Messaging + Discussions
- `POST /api/message`
- `GET /api/messages`
- `POST /api/discussions`
- `GET /api/discussions`

## Environment Variables
Create `.env` from `.env.example`.

Required:
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`

## Local Run
```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Push this project to GitHub.
2. Import project in Vercel.
3. Add environment variables in Vercel Project Settings.
4. Deploy.

## Security Notes
- Student credential is DOB (`DDMMYYYY`) hashed via bcrypt.
- Admin login uses env password (or hash) only.
- JWT protects student/admin routes.
- Blocked students cannot log in or access data.
