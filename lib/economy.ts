import { db } from "@/db";
import { wallet, transaction } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRANSACTION_TYPES, LIMITS } from "./constants";

/**
 * Get or create a user's wallet
 */
export async function getOrCreateWallet(userId: string) {
  // Try to get existing wallet
  const [existingWallet] = await db
    .select()
    .from(wallet)
    .where(eq(wallet.userId, userId))
    .limit(1);

  if (existingWallet) {
    return existingWallet;
  }

  // Create new wallet with initial balance
  const [newWallet] = await db
    .insert(wallet)
    .values({
      userId,
      balance: LIMITS.INITIAL_BALANCE,
    })
    .returning();

  // Record initial balance transaction
  await db.insert(transaction).values({
    userId,
    amount: LIMITS.INITIAL_BALANCE,
    type: TRANSACTION_TYPES.INITIAL,
    description: "Initial balance",
  });

  return newWallet;
}

/**
 * Get user's current balance
 */
export async function getUserBalance(userId: string): Promise<number> {
  const userWallet = await getOrCreateWallet(userId);
  return userWallet.balance;
}

/**
 * Check if user has sufficient balance
 */
export async function hasSufficientBalance(
  userId: string,
  amount: number
): Promise<boolean> {
  const balance = await getUserBalance(userId);
  return balance >= amount;
}

/**
 * Deduct stake from user's wallet when creating a task
 */
export async function deductStake(
  userId: string,
  amount: number,
  taskId: string
): Promise<void> {
  // Get current wallet
  const userWallet = await getOrCreateWallet(userId);

  // Check sufficient balance
  if (userWallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  // Update wallet balance
  await db
    .update(wallet)
    .set({ balance: userWallet.balance - amount })
    .where(eq(wallet.userId, userId));

  // Record transaction
  await db.insert(transaction).values({
    userId,
    amount: -amount, // Negative for deduction
    type: TRANSACTION_TYPES.STAKE,
    description: `Staked ${amount} coins on task`,
    taskId,
  });
}

/**
 * Award reward to user's wallet when completing a task
 */
export async function awardReward(
  userId: string,
  amount: number,
  taskId: string,
  description: string = "Task completion reward"
): Promise<void> {
  // Get current wallet
  const userWallet = await getOrCreateWallet(userId);

  // Update wallet balance
  await db
    .update(wallet)
    .set({ balance: userWallet.balance + amount })
    .where(eq(wallet.userId, userId));

  // Record transaction
  await db.insert(transaction).values({
    userId,
    amount, // Positive for reward
    type: TRANSACTION_TYPES.REWARD,
    description,
    taskId,
  });
}

/**
 * Award bonus to user (e.g., quiz bonus)
 */
export async function awardBonus(
  userId: string,
  amount: number,
  taskId: string,
  description: string
): Promise<void> {
  // Get current wallet
  const userWallet = await getOrCreateWallet(userId);

  // Update wallet balance
  await db
    .update(wallet)
    .set({ balance: userWallet.balance + amount })
    .where(eq(wallet.userId, userId));

  // Record transaction
  await db.insert(transaction).values({
    userId,
    amount,
    type: TRANSACTION_TYPES.BONUS,
    description,
    taskId,
  });
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const transactions = await db
    .select()
    .from(transaction)
    .where(eq(transaction.userId, userId))
    .orderBy(desc(transaction.createdAt))
    .limit(limit)
    .offset(offset);

  return transactions;
}

/**
 * Get total number of transactions for a user
 */
export async function getTransactionCount(userId: string): Promise<number> {
  const transactions = await db
    .select()
    .from(transaction)
    .where(eq(transaction.userId, userId));

  return transactions.length;
}

/**
 * Create a transaction record
 */
export async function createTransaction(
  userId: string,
  amount: number,
  type: string,
  description: string,
  taskId?: string
): Promise<void> {
  await db.insert(transaction).values({
    userId,
    amount,
    type,
    description,
    taskId: taskId || null,
  });
}
