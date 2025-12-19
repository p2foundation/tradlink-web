'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Mail, Phone, MessageSquare, Send } from 'lucide-react'
import apiClient from '@/lib/api-client'

interface ContactSupportDialogProps {
  trigger?: React.ReactNode
}

export function ContactSupportDialog({ trigger }: ContactSupportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    message: '',
    email: '',
    phone: '',
  })

  // Auto-fill user email when dialog opens
  useEffect(() => {
    if (open) {
      const loadUserEmail = async () => {
        try {
          const userRes = await apiClient.get('/auth/me')
          if (userRes.data?.email) {
            setFormData((prev) => ({ ...prev, email: userRes.data.email }))
          }
        } catch (error) {
          // Silently fail - user can enter email manually
        }
      }
      loadUserEmail()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement actual support ticket API endpoint
      // For now, we'll create a mailto link or show success message
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create mailto link as fallback
      const mailtoLink = `mailto:support@tradelink.gh?subject=${encodeURIComponent(formData.subject || 'Support Request')}&body=${encodeURIComponent(
        `Category: ${formData.category}\n\n${formData.message}\n\nContact: ${formData.email} ${formData.phone ? `| ${formData.phone}` : ''}`
      )}`

      // Open email client
      window.location.href = mailtoLink

      toast({
        title: 'Support Request Sent',
        description: 'Your support request has been sent. We will respond within 24 hours.',
      })

      // Reset form
      setFormData({
        subject: '',
        category: '',
        message: '',
        email: '',
        phone: '',
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send support request. Please try again or email us directly.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Contact Support</DialogTitle>
          <DialogDescription>
            Get help with compliance documents, import requirements, or any platform questions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your.email@example.com"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-200">
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-200">
              Category <span className="text-red-400">*</span>
            </Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              aria-label="Support request category"
              title="Select support request category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Select a category</option>
              <option value="compliance">Compliance & Documents</option>
              <option value="import">Import Requirements</option>
              <option value="verification">Verification Process</option>
              <option value="technical">Technical Support</option>
              <option value="billing">Billing & Payments</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-slate-200">
              Subject <span className="text-red-400">*</span>
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              placeholder="Brief description of your issue"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-slate-200">
              Message <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              placeholder="Please describe your question or issue in detail..."
              rows={6}
              className="resize-none"
            />
          </div>

          {/* Contact Methods */}
          <div className="p-4 bg-card/50 rounded-lg border border-border">
            <p className="text-muted-foreground text-sm mb-3">You can also reach us directly:</p>
            <div className="space-y-2">
              <a
                href="mailto:support@tradelink.gh"
                className="flex items-center gap-2 text-foreground hover:text-emerald-400 transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                support@tradelink.gh
              </a>
              <a
                href="tel:+233123456789"
                className="flex items-center gap-2 text-foreground hover:text-emerald-400 transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                +233 123 456 789
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className=""
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
