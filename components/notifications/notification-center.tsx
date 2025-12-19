'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Handshake,
  DollarSign,
  FileText,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'match' | 'payment' | 'document'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'match',
      title: 'New Match Suggestion',
      message: 'You have a new buyer match for your Premium Cocoa listing',
      timestamp: '2024-12-10T10:30:00Z',
      read: false,
      actionUrl: '/dashboard/matches',
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $25,000 received for Transaction TL-2024-001234',
      timestamp: '2024-12-09T14:20:00Z',
      read: false,
      actionUrl: '/dashboard/transactions',
    },
    {
      id: '3',
      type: 'document',
      title: 'Document Verified',
      message: 'Your Organic Certification has been verified',
      timestamp: '2024-12-08T09:15:00Z',
      read: true,
      actionUrl: '/dashboard/documents',
    },
    {
      id: '4',
      type: 'success',
      title: 'Transaction Completed',
      message: 'Transaction TL-2024-001234 has been successfully completed',
      timestamp: '2024-12-07T16:45:00Z',
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case 'match':
        return <Handshake className="h-5 w-5 text-blue-500" />
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />
      case 'document':
        return <FileText className="h-5 w-5 text-purple-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/40'
      case 'warning':
        return 'bg-amber-900/40'
      case 'match':
        return 'bg-blue-900/40'
      case 'payment':
        return 'bg-green-900/40'
      case 'document':
        return 'bg-purple-900/40'
      default:
        return 'bg-blue-900/40'
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all ${
                !notification.read
                  ? 'bg-muted border-border shadow-sm'
                  : 'bg-card/50 border-border hover:bg-card'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">{notification.title}</p>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(notification.timestamp)}
                    </p>
                    {notification.actionUrl && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto p-0 text-primary"
                        onClick={() => {
                          markAsRead(notification.id)
                          window.location.href = notification.actionUrl!
                        }}
                      >
                        View Details →
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

