import { db } from "@/db";
import { wallet, user, task } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";

export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  balance: number;
  tasksCompleted: number;
}

/**
 * Get top users by coin balance
 */
export async function getTopUsers(
  limit: number = 10
): Promise<LeaderboardUser[]> {
  // Ensure limit is reasonable
  const safeLimit = Math.min(Math.max(1, limit), 100);

  // Get users with their wallets and task counts
  const results = await db
    .select({
      userId: user.id,
      name: user.name,
      balance: wallet.balance,
      tasksCompleted: sql<number>`(
        SELECT COUNT(*)::int 
        FROM ${task} 
        WHERE ${task.userId} = ${user.id} 
        AND ${task.status} = 'completed'
      )`,
    })
    .from(user)
    .leftJoin(wallet, eq(wallet.userId, user.id))
    .orderBy(desc(wallet.balance))
    .limit(safeLimit);

  // Add rank to each user
  const leaderboard: LeaderboardUser[] = results.map((result, index) => ({
    rank: index + 1,
    userId: result.userId,
    name: result.name,
    balance: result.balance || 0,
    tasksCompleted: result.tasksCompleted || 0,
  }));

  return leaderboard;
}

/**
 * Get a specific user's rank
 */
export async function getUserRank(userId: string): Promise<number> {
  // Get user's balance
  const [userWallet] = await db
    .select()
    .from(wallet)
    .where(eq(wallet.userId, userId))
    .limit(1);

  if (!userWallet) {
    return 0; // User has no wallet yet
  }

  // Count how many users have higher balance
  const higherBalanceUsers = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(wallet)
    .where(sql`${wallet.balance} > ${userWallet.balance}`);

  const rank = (higherBalanceUsers[0]?.count || 0) + 1;
  return rank;
}

/**
 * Get user statistics for leaderboard display
 */
export async function getUserStats(userId: string) {
  const [userWallet] = await db
    .select()
    .from(wallet)
    .where(eq(wallet.userId, userId))
    .limit(1);

  const userTasks = await db.select().from(task).where(eq(task.userId, userId));

  const completedTasks = userTasks.filter((t) => t.status === "completed");
  const activeTasks = userTasks.filter((t) => t.status === "active");
  const failedTasks = userTasks.filter((t) => t.status === "failed");

  const completionRate =
    userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0;

  return {
    balance: userWallet?.balance || 0,
    totalTasks: userTasks.length,
    completedTasks: completedTasks.length,
    activeTasks: activeTasks.length,
    failedTasks: failedTasks.length,
    completionRate: Math.round(completionRate),
    rank: await getUserRank(userId),
  };
}
