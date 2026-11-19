import { getUserNotifications } from "@/features/notifications/actions";
import { NotificationsClient } from "@/features/notifications/components/NotificationsClient";

export default async function LecturerNotificationsPage() {
  const { notificationsList, unreadCount } = await getUserNotifications();

  return (
    <NotificationsClient
      initialNotifications={notificationsList}
      initialUnreadCount={unreadCount}
      backHref="/dashboard"
    />
  );
}
