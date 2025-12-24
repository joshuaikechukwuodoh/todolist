// App-wide constants and configuration

// Reward amounts (in coins)
export const REWARDS = {
  TASK_COMPLETION: 100, // Base reward for completing a task
  QUIZ_PASS_BONUS: 50, // Additional bonus for passing the quiz
  PERFECT_QUIZ: 100, // Bonus for 100% quiz score
} as const;

// Limits and constraints
export const LIMITS = {
  MIN_STAKE: 10, // Minimum coins to stake on a task
  MAX_STAKE: 1000, // Maximum coins to stake on a task
  MAX_TASKS_PER_DAY: 10, // Maximum tasks a user can create per day
  INITIAL_BALANCE: 100, // Starting balance for new users
} as const;

// Quiz settings
export const QUIZ = {
  QUESTIONS_PER_QUIZ: 5, // Number of questions to generate
  PASSING_SCORE: 0.6, // 60% to pass
  PERFECT_SCORE: 1.0, // 100% for perfect score bonus
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  STAKE: "stake", // Coins deducted when creating task
  REWARD: "reward", // Coins awarded for task completion
  PENALTY: "penalty", // Coins lost for task failure
  BONUS: "bonus", // Additional rewards (quiz bonuses)
  INITIAL: "initial", // Initial balance for new users
} as const;

// Task statuses
export const TASK_STATUS = {
  ACTIVE: "active", // Task is currently active
  COMPLETED: "completed", // Task completed successfully
  FAILED: "failed", // Task failed (deadline passed)
  CANCELLED: "cancelled", // Task cancelled by user
} as const;
