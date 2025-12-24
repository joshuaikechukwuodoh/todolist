# TodoApp Backend API Documentation

Complete API reference for the gamified task manager backend.

---

## Authentication

All endpoints except `/api/leaderboard` require authentication via Better Auth session.

Include session token in request headers.

---

## API Endpoints

### Authentication Routes

#### POST `/api/auth/sign-up`

Register a new user account.

#### POST `/api/auth/sign-in`

Login with email and password.

#### POST `/api/auth/sign-out`

Logout current user.

#### POST `/api/auth/forget-password`

Request password reset email.

#### POST `/api/auth/reset-password`

Reset password with token.

#### GET `/api/auth/me/:id`

Get user profile by ID.

---

### Task Management

#### POST `/api/task/booking`

Create a new task with stake.

**Request**:

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "stake": 50
}
```

**Response**:

```json
{
  "task": {
    "id": "uuid",
    "userId": "uuid",
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "stake": 50,
    "status": "active",
    "startTime": "2025-12-23T22:00:00Z",
    "endTime": "2025-12-23T22:00:00Z",
    "createdAt": "2025-12-23T22:00:00Z",
    "updatedAt": "2025-12-23T22:00:00Z"
  },
  "message": "Task created! 50 coins staked."
}
```

**Validations**:

- Title: 1-100 characters
- Description: 1-1000 characters
- Stake: 10-1000 coins
- User must have sufficient balance

---

#### GET `/api/task/today`

Get all active tasks for today.

**Response**:

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Complete project",
      "description": "Finish the backend",
      "stake": 50,
      "status": "active",
      "startTime": "2025-12-23T08:00:00Z",
      "endTime": "2025-12-23T22:00:00Z"
    }
  ]
}
```

---

#### POST `/api/task/close-day`

Close all active tasks and distribute rewards.

**Response**:

```json
{
  "message": "Day closed successfully",
  "summary": {
    "totalTasks": 3,
    "completed": 2,
    "failed": 1,
    "totalCoinsAwarded": 300
  },
  "tasks": [
    {
      "taskId": "uuid",
      "title": "Complete project",
      "status": "completed",
      "coinsAwarded": 100,
      "bonusAwarded": 50,
      "totalAwarded": 150
    },
    {
      "taskId": "uuid",
      "title": "Study React",
      "status": "completed",
      "coinsAwarded": 100,
      "bonusAwarded": 50,
      "totalAwarded": 150
    },
    {
      "taskId": "uuid",
      "title": "Exercise",
      "status": "failed",
      "coinsAwarded": 0,
      "bonusAwarded": 0,
      "totalAwarded": 0
    }
  ]
}
```

**Logic**:

- Tasks with passed quiz → marked as "completed", awarded 150 coins (100 + 50 bonus)
- Tasks without quiz or failed quiz → marked as "failed", no rewards
- Stake is NOT refunded for failed tasks

---

### Quiz System

#### POST `/api/quiz/generate`

Generate AI-powered quiz for a task.

**Request**:

```json
{
  "taskId": "uuid"
}
```

**Response**:

```json
{
  "quizId": "uuid",
  "questions": [
    { "question": "What is the main objective of this task?" },
    { "question": "What are the key deliverables?" },
    { "question": "What is the deadline for this task?" },
    { "question": "What resources are needed?" },
    { "question": "What is the expected outcome?" }
  ]
}
```

**Notes**:

- Generates 5 questions using Gemini AI
- Questions based on task title and description
- Answers NOT returned (stored for validation)
- Cannot generate duplicate quiz for same task

---

#### POST `/api/quiz/submit`

Submit quiz answers for validation.

**Request**:

```json
{
  "quizId": "uuid",
  "answers": [
    "Complete the backend",
    "API documentation",
    "10 PM today",
    "Database and AI",
    "Functional backend"
  ]
}
```

**Response**:

```json
{
  "passed": true,
  "score": 0.8
}
```

**Scoring**:

- Passing score: 60% (3/5 questions)
- Perfect score: 100% (5/5 questions)
- Case-insensitive matching
- Whitespace trimmed

---

### Economy System

#### GET `/api/economy/balance`

Get user's current coin balance.

**Response**:

```json
{
  "balance": 150,
  "userId": "uuid"
}
```

**Notes**:

- Auto-creates wallet with 100 coins if not exists
- Returns current balance

---

#### GET `/api/economy/transaction`

Get user's transaction history.

**Query Parameters**:

- `limit` (optional, default: 50, max: 100)
- `offset` (optional, default: 0)

**Example**: `/api/economy/transaction?limit=20&offset=0`

**Response**:

```json
{
  "transactions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": -50,
      "type": "stake",
      "description": "Staked 50 coins on task",
      "taskId": "uuid",
      "createdAt": "2025-12-23T22:00:00Z"
    },
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": 100,
      "type": "reward",
      "description": "Task completion reward",
      "taskId": "uuid",
      "createdAt": "2025-12-23T23:00:00Z"
    },
    {
      "id": "uuid",
      "userId": "uuid",
      "amount": 50,
      "type": "bonus",
      "description": "Quiz pass bonus",
      "taskId": "uuid",
      "createdAt": "2025-12-23T23:00:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

**Transaction Types**:

- `initial` - Initial balance for new users (100 coins)
- `stake` - Coins deducted when creating task (negative amount)
- `reward` - Coins awarded for task completion (100 coins)
- `bonus` - Additional rewards like quiz bonuses (50 coins)
- `penalty` - Coins lost for violations (not currently used)

---

### Leaderboard

#### GET `/api/leaderboard`

Get top users by coin balance.

**Authentication**: Not required (public endpoint)

**Query Parameters**:

- `limit` (optional, default: 10, max: 100)

**Example**: `/api/leaderboard?limit=20`

**Response**:

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "name": "John Doe",
      "balance": 500,
      "tasksCompleted": 10
    },
    {
      "rank": 2,
      "userId": "uuid",
      "name": "Jane Smith",
      "balance": 450,
      "tasksCompleted": 9
    },
    {
      "rank": 3,
      "userId": "uuid",
      "name": "Bob Johnson",
      "balance": 400,
      "tasksCompleted": 8
    }
  ],
  "total": 20
}
```

---

## Constants & Configuration

### Rewards

- Task completion: **100 coins**
- Quiz pass bonus: **50 coins**
- Perfect quiz bonus: **100 coins** (not yet implemented)

### Limits

- Minimum stake: **10 coins**
- Maximum stake: **1000 coins**
- Maximum tasks per day: **10** (not yet enforced)
- Initial balance: **100 coins**

### Quiz Settings

- Questions per quiz: **5**
- Passing score: **60%** (3/5 questions)
- Perfect score: **100%** (5/5 questions)

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "message": "Error description"
}
```

**Common Status Codes**:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, insufficient balance, etc.)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not authorized to access resource)
- `404` - Not Found
- `500` - Internal Server Error

---

## Example Workflows

### 1. Complete Task Lifecycle

```bash
# 1. Create task
POST /api/task/booking
{ "title": "Study React", "description": "Learn hooks", "stake": 50 }
# Balance: 100 → 50

# 2. Generate quiz
POST /api/quiz/generate
{ "taskId": "task-uuid" }
# Returns 5 questions

# 3. Submit quiz
POST /api/quiz/submit
{ "quizId": "quiz-uuid", "answers": ["useState", "useEffect", ...] }
# Returns: { "passed": true, "score": 0.8 }

# 4. Close day
POST /api/task/close-day
# Awards 150 coins (100 + 50 bonus)
# Balance: 50 → 200

# 5. Check balance
GET /api/economy/balance
# Returns: { "balance": 200 }
```

### 2. View Leaderboard

```bash
# Get top 10 users
GET /api/leaderboard?limit=10

# Get top 50 users
GET /api/leaderboard?limit=50
```

### 3. View Transaction History

```bash
# Get recent transactions
GET /api/economy/transaction?limit=20&offset=0

# Get next page
GET /api/economy/transaction?limit=20&offset=20
```

---

## Database Schema

### Tables

1. **user** - User accounts
2. **session** - Auth sessions
3. **account** - OAuth accounts
4. **verification** - Email verification
5. **task** - User tasks
6. **quiz** - Quiz questions and answers
7. **wallet** - User coin balances (NEW)
8. **transaction** - Transaction history (NEW)

### Relations

- User → Wallet (one-to-one)
- User → Transactions (one-to-many)
- User → Tasks (one-to-many)
- Task → Transactions (one-to-many)
- Task → Quiz (one-to-one)

---

## Setup Instructions

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure environment**:

   ```
   DATABASE_URL=your_postgres_url
   GEMINI_API_KEY=your_gemini_key
   BETTER_AUTH_SECRET=your_secret
   ```

3. **Push database schema**:

   ```bash
   npx drizzle-kit push
   ```

4. **Start dev server**:

   ```bash
   npm run dev
   ```

5. **Test endpoints**:
   Use Postman, Thunder Client, or curl to test the API.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Auth**: Better Auth
- **AI**: Google Gemini AI
- **Validation**: Zod
- **Email**: Nodemailer
- **Language**: TypeScript

---

## Support

For issues or questions, refer to the implementation plan and walkthrough documents.
  