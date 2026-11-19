import { getUserNotifications } from "@/features/notifications/actions";
import { NotificationsClient } from "@/features/notifications/components/NotificationsClient";

export default async function StudentNotificationsPage() {
  const { notificationsList, unreadCount } = await getUserNotifications();

  return (
    <NotificationsClient
      initialNotifications={notificationsList}
      initialUnreadCount={unreadCount}
      backHref="/student/dashboard"
    />
  );
}
