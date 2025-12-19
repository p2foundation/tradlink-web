'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/lib/api-client'
import { Farmer } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Loader2, UserPlus, CheckCircle2 } from 'lucide-react'

interface AddSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  farmer: Farmer | null
  onSuccess?: () => void
}

export function AddSupplierDialog({
  open,
  onOpenChange,
  farmer,
  onSuccess,
}: AddSupplierDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    relationshipType: 'DIRECT',
    contractStartDate: '',
    contractEndDate: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmer) return

    setLoading(true)
    try {
      await apiClient.post('/supplier-networks', {
        farmerId: farmer.id,
        relationshipType: formData.relationshipType,
        contractStartDate: formData.contractStartDate || undefined,
        contractEndDate: formData.contractEndDate || undefined,
        notes: formData.notes || undefined,
      })

      toast({
        variant: 'success',
        title: 'Supplier Added',
        description: `${farmer.businessName || farmer.user?.firstName} has been added to your supplier network.`,
      })

      // Reset form
      setFormData({
        relationshipType: 'DIRECT',
        contractStartDate: '',
        contractEndDate: '',
        notes: '',
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Add Supplier',
        description: error.response?.data?.message || 'An error occurred while adding the supplier.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!farmer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Add to Supplier Network</DialogTitle>
              <DialogDescription>
                Add {farmer.businessName || `${farmer.user?.firstName} ${farmer.user?.lastName}`} to your supplier network
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Farmer Info Preview */}
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {farmer.businessName || `${farmer.user?.firstName} ${farmer.user?.lastName}`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {farmer.district && farmer.region
                    ? `${farmer.district}, ${farmer.region}`
                    : farmer.location || 'Location not specified'}
                </p>
                {farmer.user?.verified && (
                  <Badge variant="success" className="mt-2 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Relationship Type */}
          <div className="space-y-2">
            <Label htmlFor="relationshipType" className="text-foreground">
              Relationship Type <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Select
              value={formData.relationshipType}
              onValueChange={(value) => setFormData({ ...formData, relationshipType: value })}
            >
              <SelectTrigger id="relationshipType">
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIRECT">Direct Supplier</SelectItem>
                <SelectItem value="COOPERATIVE">Cooperative Member</SelectItem>
                <SelectItem value="CONTRACT">Contract Supplier</SelectItem>
                <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contract Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractStartDate" className="text-foreground">
                Contract Start <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="contractStartDate"
                type="date"
                value={formData.contractStartDate}
                onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contractEndDate" className="text-foreground">
                Contract End <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="contractEndDate"
                type="date"
                value={formData.contractEndDate}
                onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this supplier relationship..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Supplier
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
