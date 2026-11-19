"use server";

import { db } from "@/server/db";
import { notifications } from "@/server/db/schema";
import { requireUser } from "@/server/auth/session";
import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  targetUrl: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export async function getUserNotifications(): Promise<{
  notificationsList: NotificationItem[];
  unreadCount: number;
}> {
  const user = await requireUser();

  const list = await db
    .select({
      id: notifications.id,
      title: notifications.title,
      body: notifications.body,
      type: notifications.type,
      targetUrl: notifications.targetUrl,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, user.userId))
    .orderBy(desc(notifications.createdAt))
    .limit(30);

  const [unreadResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, user.userId),
        isNull(notifications.readAt)
      )
    );

  return {
    notificationsList: list,
    unreadCount: Number(unreadResult?.count || 0),
  };
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await requireUser();

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, user.userId)
      )
    );

  revalidatePath("/dashboard");
  revalidatePath("/student/dashboard");
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const user = await requireUser();

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, user.userId),
        isNull(notifications.readAt)
      )
    );

  revalidatePath("/dashboard");
  revalidatePath("/student/dashboard");
  return { success: true };
}
