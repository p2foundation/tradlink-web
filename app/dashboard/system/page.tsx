'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Settings,
  Server,
  Database,
  Globe,
  Shield,
  Mail,
  Bell,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import apiClient from '@/lib/api-client'

interface SystemConfig {
  category: string
  settings: {
    key: string
    label: string
    value: string | number | boolean
    type: 'text' | 'number' | 'boolean' | 'select'
    description?: string
    options?: string[]
  }[]
}

export default function SystemPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSystemConfig()
  }, [])

  const fetchSystemConfig = async () => {
    try {
      // TODO: Replace with actual API endpoint
      // const response = await apiClient.get('/admin/system/config')

      // Mock data
      const mockConfigs: SystemConfig[] = [
        {
          category: 'General',
          settings: [
            {
              key: 'platform_name',
              label: 'Platform Name',
              value: 'TradeLink+',
              type: 'text',
              description: 'The name displayed throughout the platform',
            },
            {
              key: 'maintenance_mode',
              label: 'Maintenance Mode',
              value: false,
              type: 'boolean',
              description: 'Enable maintenance mode to restrict access',
            },
            {
              key: 'max_file_size',
              label: 'Max File Upload Size (MB)',
              value: 10,
              type: 'number',
              description: 'Maximum file size for document uploads',
            },
          ],
        },
        {
          category: 'Email',
          settings: [
            {
              key: 'smtp_host',
              label: 'SMTP Host',
              value: 'smtp.gmail.com',
              type: 'text',
              description: 'SMTP server hostname',
            },
            {
              key: 'smtp_port',
              label: 'SMTP Port',
              value: 587,
              type: 'number',
              description: 'SMTP server port',
            },
            {
              key: 'email_from',
              label: 'From Email Address',
              value: 'noreply@tradelink.gh',
              type: 'text',
              description: 'Default sender email address',
            },
            {
              key: 'email_enabled',
              label: 'Enable Email Notifications',
              value: true,
              type: 'boolean',
              description: 'Enable or disable email notifications',
            },
          ],
        },
        {
          category: 'Security',
          settings: [
            {
              key: 'session_timeout',
              label: 'Session Timeout (minutes)',
              value: 30,
              type: 'number',
              description: 'User session timeout in minutes',
            },
            {
              key: 'password_min_length',
              label: 'Minimum Password Length',
              value: 8,
              type: 'number',
              description: 'Minimum required password length',
            },
            {
              key: 'require_2fa',
              label: 'Require Two-Factor Authentication',
              value: false,
              type: 'boolean',
              description: 'Require 2FA for admin accounts',
            },
            {
              key: 'rate_limit',
              label: 'API Rate Limit (requests/minute)',
              value: 100,
              type: 'number',
              description: 'Maximum API requests per minute per user',
            },
          ],
        },
        {
          category: 'Database',
          settings: [
            {
              key: 'backup_frequency',
              label: 'Backup Frequency',
              value: 'daily',
              type: 'select',
              description: 'How often to backup the database',
              options: ['hourly', 'daily', 'weekly'],
            },
            {
              key: 'backup_retention',
              label: 'Backup Retention (days)',
              value: 30,
              type: 'number',
              description: 'Number of days to keep backups',
            },
          ],
        },
        {
          category: 'Notifications',
          settings: [
            {
              key: 'enable_push',
              label: 'Enable Push Notifications',
              value: true,
              type: 'boolean',
              description: 'Enable browser push notifications',
            },
            {
              key: 'enable_sms',
              label: 'Enable SMS Notifications',
              value: false,
              type: 'boolean',
              description: 'Enable SMS notifications (requires SMS provider)',
            },
            {
              key: 'notification_sound',
              label: 'Enable Notification Sound',
              value: true,
              type: 'boolean',
              description: 'Play sound for new notifications',
            },
          ],
        },
      ]

      setConfigs(mockConfigs)
    } catch (error) {
      console.error('Failed to fetch system config:', error)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API endpoint
      // await apiClient.put('/admin/system/config', { configs })

      // Simulate save
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save system config:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (categoryIndex: number, settingIndex: number, value: any) => {
    const newConfigs = [...configs]
    newConfigs[categoryIndex].settings[settingIndex].value = value
    setConfigs(newConfigs)
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      General: Settings,
      Email: Mail,
      Security: Shield,
      Database: Database,
      Notifications: Bell,
    }
    const Icon = icons[category as keyof typeof icons] || Settings
    return <Icon className="h-5 w-5" />
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            System Configuration
          </h1>
          <p className="text-gray-300 mt-1">Manage platform settings and configurations</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <Badge variant="success" className="bg-green-600/20 text-green-300 border-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
          <Button onClick={handleSave} disabled={loading} className="shadow-glow">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">System Status</CardTitle>
            <Server className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">Operational</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">All systems running normally</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Database</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-white">Connected</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Last backup: 2 hours ago</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">API Status</CardTitle>
            <Globe className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-white">Healthy</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Response time: 120ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Sections */}
      <div className="space-y-6">
        {configs.map((config, categoryIndex) => (
          <Card key={config.category} className="bg-slate-900 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {getCategoryIcon(config.category)}
                </div>
                <div>
                  <CardTitle className="text-white">{config.category}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {config.category} settings and preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.settings.map((setting, settingIndex) => (
                <div key={setting.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={setting.key} className="text-gray-300">
                      {setting.label}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    )}
                  </div>
                  {setting.type === 'text' && (
                    <Input
                      id={setting.key}
                      value={setting.value as string}
                      onChange={(e) => updateSetting(categoryIndex, settingIndex, e.target.value)}
                      className="bg-slate-800 border-gray-700 text-white"
                    />
                  )}
                  {setting.type === 'number' && (
                    <Input
                      id={setting.key}
                      type="number"
                      value={setting.value as number}
                      onChange={(e) => updateSetting(categoryIndex, settingIndex, Number(e.target.value))}
                      className="bg-slate-800 border-gray-700 text-white"
                    />
                  )}
                  {setting.type === 'boolean' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={setting.key}
                        checked={setting.value as boolean}
                        onChange={(e) => updateSetting(categoryIndex, settingIndex, e.target.checked)}
                        className="h-4 w-4 text-primary bg-slate-800 border-gray-600 rounded focus:ring-primary"
                      />
                      <Label htmlFor={setting.key} className="text-gray-300 cursor-pointer">
                        {setting.value ? 'Enabled' : 'Disabled'}
                      </Label>
                    </div>
                  )}
                  {setting.type === 'select' && (
                    <select
                      id={setting.key}
                      value={setting.value as string}
                      onChange={(e) => updateSetting(categoryIndex, settingIndex, e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/40"
                    >
                      {setting.options?.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

