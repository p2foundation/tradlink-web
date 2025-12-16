'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Calendar, Shield, CheckCircle2, XCircle, MapPin, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { UserRole } from '@/types'

interface UserViewDialogProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: UserRole
    phone?: string
    verified: boolean
    createdAt: string
    updatedAt: string
    farmer?: any
    buyer?: any
    exportCompany?: any
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserViewDialog({ user, open, onOpenChange }: UserViewDialogProps) {
  if (!user) return null

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      [UserRole.FARMER]: 'bg-green-500/10 text-green-300 border-green-500',
      [UserRole.BUYER]: 'bg-blue-500/10 text-blue-300 border-blue-500',
      [UserRole.EXPORT_COMPANY]: 'bg-purple-500/10 text-purple-300 border-purple-500',
      [UserRole.ADMIN]: 'bg-red-500/10 text-red-300 border-red-500',
    }
    return (
      <Badge variant="outline" className={colors[role]}>
        {role.replace('_', ' ')}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-white/10 text-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <div>{user.firstName} {user.lastName}</div>
              <div className="text-sm font-normal text-gray-400 mt-1">{getRoleBadge(user.role)}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Joined</p>
                  <p className="text-white">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  {user.verified ? (
                    <Badge variant="success" className="bg-green-600/20 text-green-300 border-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-600/20 text-yellow-300 border-yellow-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Role-Specific Information */}
          {user.farmer && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Farmer Profile
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {user.farmer.businessName && (
                  <div>
                    <p className="text-sm text-gray-400">Business Name</p>
                    <p className="text-white">{user.farmer.businessName}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="text-white">{user.farmer.district}, {user.farmer.region}</p>
                  </div>
                </div>
                {user.farmer.farmSize && (
                  <div>
                    <p className="text-sm text-gray-400">Farm Size</p>
                    <p className="text-white">{user.farmer.farmSize} acres</p>
                  </div>
                )}
                {user.farmer.certifications && user.farmer.certifications.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400">Certifications</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.farmer.certifications.map((cert: string, idx: number) => (
                        <Badge key={idx} variant="success" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {user.buyer && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Buyer Profile
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Company Name</p>
                  <p className="text-white">{user.buyer.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Country</p>
                  <p className="text-white">{user.buyer.countryName || user.buyer.country}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Industry</p>
                  <p className="text-white">{user.buyer.industry}</p>
                </div>
                {user.buyer.seekingCrops && user.buyer.seekingCrops.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400">Seeking Crops</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.buyer.seekingCrops.map((crop: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {crop}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {user.exportCompany && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-500" />
                Export Company Profile
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Company Name</p>
                  <p className="text-white">{user.exportCompany.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Registration No</p>
                  <p className="text-white">{user.exportCompany.registrationNo}</p>
                </div>
                {user.exportCompany.gepaLicense && (
                  <div>
                    <p className="text-sm text-gray-400">GEPA License</p>
                    <p className="text-white">{user.exportCompany.gepaLicense}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">User ID</p>
                <p className="text-white font-mono text-xs">{user.id}</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-white">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

