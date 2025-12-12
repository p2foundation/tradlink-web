'use client'

import { NotificationCenter } from '@/components/notifications/notification-center'

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
          Notifications
        </h1>
        <p className="text-gray-600 mt-1">Stay updated with your trade activities</p>
      </div>
      <NotificationCenter />
    </div>
  )
}

