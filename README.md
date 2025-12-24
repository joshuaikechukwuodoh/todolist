This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Quick Start Guide - TodoApp Backend

## Prerequisites

1. PostgreSQL database (Neon recommended)
2. Google Gemini API key
3. Node.js installed

## Setup (5 minutes)

### 1. Environment Variables

Ensure your `.env.local` has:

```env
DATABASE_URL=postgresql://...
GEMINI_API_KEY=your_key_here
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
```

### 2. Push Database Schema

```bash
npx drizzle-kit push
```

This creates the wallet and transaction tables.

### 3. Start Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Test the API (Step by Step)

### Step 1: Create Account

```bash
POST http://localhost:3000/api/auth/sign-up
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

### Step 2: Sign In

```bash
POST http://localhost:3000/api/auth/sign-in
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

Save the session token from response.

### Step 3: Check Balance

```bash
GET http://localhost:3000/api/economy/balance
Authorization: Bearer <your_session_token>
```

Should return `{ "balance": 100 }` (initial balance)

### Step 4: Create Task

```bash
POST http://localhost:3000/api/task/booking
Authorization: Bearer <your_session_token>
Content-Type: application/json

{
  "title": "Complete Backend",
  "description": "Finish all API routes and test them",
  "stake": 50
}
```

Balance should now be 50 coins.

### Step 5: Generate Quiz

```bash
POST http://localhost:3000/api/quiz/generate
Authorization: Bearer <your_session_token>
Content-Type: application/json

{
  "taskId": "<task_id_from_step_4>"
}
```

You'll get 5 questions. Note the `quizId`.

### Step 6: Submit Quiz

```bash
POST http://localhost:3000/api/quiz/submit
Authorization: Bearer <your_session_token>
Content-Type: application/json

{
  "quizId": "<quiz_id_from_step_5>",
  "answers": [
    "Complete Backend",
    "API routes",
    "Testing",
    "Documentation",
    "Success"
  ]
}
```

If you pass (60%+), you'll get `{ "passed": true }`

### Step 7: Close Day

```bash
POST http://localhost:3000/api/task/close-day
Authorization: Bearer <your_session_token>
```

If quiz passed, you'll receive:

- 100 coins (task completion)
- 50 coins (quiz bonus)
- Total: 150 coins

Balance: 50 → 200 coins (net +100)

### Step 8: View Transactions

```bash
GET http://localhost:3000/api/economy/transaction
Authorization: Bearer <your_session_token>
```

You'll see:

1. Initial balance (+100)
2. Stake deduction (-50)
3. Task reward (+100)
4. Quiz bonus (+50)

### Step 9: Check Leaderboard

```bash
GET http://localhost:3000/api/leaderboard?limit=10
```

No auth required! See your rank.

---

## Quick Reference

### All Endpoints

| Method | Endpoint                   | Auth | Purpose             |
| ------ | -------------------------- | ---- | ------------------- |
| POST   | `/api/auth/sign-up`        | No   | Register            |
| POST   | `/api/auth/sign-in`        | No   | Login               |
| POST   | `/api/auth/sign-out`       | Yes  | Logout              |
| GET    | `/api/economy/balance`     | Yes  | Get balance         |
| GET    | `/api/economy/transaction` | Yes  | Transaction history |
| POST   | `/api/task/booking`        | Yes  | Create task         |
| GET    | `/api/task/today`          | Yes  | Get today's tasks   |
| POST   | `/api/task/close-day`      | Yes  | Close all tasks     |
| POST   | `/api/quiz/generate`       | Yes  | Generate quiz       |
| POST   | `/api/quiz/submit`         | Yes  | Submit answers      |
| GET    | `/api/leaderboard`         | No   | Top users           |

### Coin Flow

```
Start: 100 coins (initial balance)
↓
Create task (-50 stake)
↓
Balance: 50 coins
↓
Complete task + Pass quiz
↓
Rewards: +100 (task) + 50 (quiz) = +150
↓
Balance: 200 coins
↓
Net gain: +100 coins
```

### Rewards

- Task completion: **100 coins**
- Quiz pass bonus: **50 coins**
- Total per task: **150 coins**

### Limits

- Min stake: **10 coins**
- Max stake: **1000 coins**
- Initial balance: **100 coins**

---

## Common Issues

### "Insufficient balance"

- Check your balance first: `GET /api/economy/balance`
- Ensure stake is within your balance

### "Quiz already exists"

- Each task can only have one quiz
- Delete the task and create a new one

### "No active tasks"

- Create a task first: `POST /api/task/booking`

### "Unauthorized"

- Ensure you're logged in
- Include session token in headers

---

## Testing Tools

### Recommended

1. **Thunder Client** (VS Code extension)
2. **Postman**
3. **curl** (command line)

### Example curl

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test"}'

# Get balance
curl http://localhost:3000/api/economy/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Next Steps

1. ✅ Test all endpoints
2. ✅ Verify database has wallet and transaction tables
3. ✅ Check transaction history
4. ✅ View leaderboard
5. 🎯 Build frontend (optional)

---

## Files Created

### Core Libraries

- `lib/constants.ts` - App configuration
- `lib/time.ts` - Date utilities
- `lib/economy.ts` - Wallet & transactions
- `lib/leaderboard.ts` - Rankings
- `lib/quiz.ts` - AI quiz generation

### API Routes

- `app/api/economy/balance/route.ts`
- `app/api/economy/transaction/route.ts`
- `app/api/leaderboard/route.ts`
- `app/api/quiz/generate/route.ts` (updated)

### Updated Routes

- `app/api/task/booking/route.ts` (economy integration)
- `app/api/task/close-day/route.ts` (reward distribution)

### Database

- `db/schema.ts` (added wallet & transaction tables)

### Documentation

- `API_DOCUMENTATION.md` - Full API reference
- `QUICK_START.md` - This file

---

## Support

For detailed information, see:

- `API_DOCUMENTATION.md` - Complete API reference
- `implementation_plan.md` - Technical details
- `walkthrough.md` - What was built

Happy coding! 🚀
