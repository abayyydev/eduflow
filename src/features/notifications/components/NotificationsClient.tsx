"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, ExternalLink, Clock } from "lucide-react";
import {
  type NotificationItem,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../actions";
import { formatDateTime } from "@/lib/utils";

interface NotificationsClientProps {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
  backHref?: string;
}

export const NotificationsClient: React.FC<NotificationsClientProps> = ({
  initialNotifications,
  initialUnreadCount,
}) => {
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      await markNotificationAsRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });
  };

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
      setUnreadCount(0);
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
              Notifikasi
            </h1>
            {unreadCount > 0 && (
              <Badge variant="primary">
                {unreadCount} Baru
              </Badge>
            )}
          </div>
          <p className="text-sm text-[#667085] mt-0.5">
            Pemberitahuan terkait tugas, penilaian, kehadiran, dan aktivitas akademik Anda.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll}>
            <CheckCheck className="w-4 h-4 mr-1.5" /> Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <Card className="py-16 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-[#F6F8FC] text-[#667085] flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#172033]">
            Tidak Ada Notifikasi
          </h3>
          <p className="text-xs text-[#667085]">
            Semua aktivitas akademik Anda saat ini telah terpantau.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((notif) => {
            const isUnread = !notif.readAt;

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnread
                    ? "bg-white border-[#2457D6]/30 shadow-xs"
                    : "bg-[#FBFBFE] border-[#E4E9F2] opacity-80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0 ${
                        isUnread
                          ? "bg-[#EEF3FF] text-[#2457D6]"
                          : "bg-[#F6F8FC] text-[#667085]"
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#172033]">
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-[#2457D6]" />
                        )}
                      </div>
                      <p className="text-xs text-[#667085] leading-relaxed">
                        {notif.body}
                      </p>

                      <div className="flex items-center gap-4 pt-1 text-[11px] text-[#667085]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(notif.createdAt)}
                        </span>

                        {notif.targetUrl && (
                          <Link
                            href={notif.targetUrl}
                            className="text-[#2457D6] font-medium hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Buka Tautan</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-[11px] font-medium text-[#2457D6] hover:underline shrink-0 px-2 py-1"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
