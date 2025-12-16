'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/lib/api-client'
import { UserRole } from '@/types'

interface UserEditDialogProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
    phone?: string
    verified: boolean
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function UserEditDialog({ user, open, onOpenChange, onSuccess }: UserEditDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    verified: false,
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        verified: user.verified,
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await apiClient.patch(`/users/${user.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      })

      toast({
        variant: 'success',
        title: 'User Updated',
        description: 'User information has been updated successfully',
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update user',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!user) return

    setLoading(true)
    try {
      await apiClient.post(`/users/${user.id}/verify`, {
        verified: !formData.verified,
      })

      setFormData({ ...formData, verified: !formData.verified })

      toast({
        variant: 'success',
        title: 'Verification Updated',
        description: `User has been ${!formData.verified ? 'verified' : 'unverified'}`,
      })

      onSuccess()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update verification status',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-white/10 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-slate-800/50 border-slate-700 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-slate-800 border-slate-700 text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <Label>Verification Status</Label>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-2">
                {formData.verified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-white">
                  {formData.verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleVerify}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
              >
                {formData.verified ? 'Unverify' : 'Verify'}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 shadow-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="bg-slate-800 border-slate-700 text-slate-100"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

