'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, ChevronLeft, ChevronRight, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/lib/api-client'
import { Farmer } from '@/types'
import Link from 'next/link'
import { FilterBar, FilterOption } from '@/components/ui/filter-bar'
import { Skeleton } from '@/components/ui/skeleton'

export default function FarmersPage() {
  const { toast } = useToast()
  const [farmers, setFarmers] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [regionFilter, setRegionFilter] = useState<string | null>(null)
  const [verifiedFilter, setVerifiedFilter] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    location: '',
    region: '',
    district: '',
    farmSize: '',
    certifications: '',
    verified: false,
    images: [] as string[],
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [regionFilter, verifiedFilter])

  useEffect(() => {
    fetchFarmers()
  }, [regionFilter, verifiedFilter, pagination.page])

  const fetchFarmers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (regionFilter) params.append('region', regionFilter)
      if (verifiedFilter) params.append('verified', verifiedFilter)
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())

      const response = await apiClient.get(`/farmers?${params.toString()}`)
      setFarmers(response.data.data || [])
      if (response.data.meta) {
        setPagination({
          page: response.data.meta.page || pagination.page,
          limit: response.data.meta.limit || pagination.limit,
          total: response.data.meta.total || 0,
          totalPages: response.data.meta.totalPages || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch farmers:', error)
    } finally {
      setLoading(false)
    }
  }

  const regionOptions: FilterOption[] = [
    { label: 'Ashanti', value: 'Ashanti' },
    { label: 'Greater Accra', value: 'Greater Accra' },
    { label: 'Western', value: 'Western' },
  ]

  const verifiedOptions: FilterOption[] = [
    { label: 'Verified', value: 'true' },
    { label: 'Unverified', value: 'false' },
  ]

  const filteredFarmers = useMemo(() => {
    const term = search.toLowerCase()
    return farmers.filter((farmer) => {
      const text = `${farmer.businessName ?? ''} ${farmer.location ?? ''} ${farmer.region ?? ''} ${farmer.district ?? ''} ${farmer.user?.firstName ?? ''} ${farmer.user?.lastName ?? ''}`.toLowerCase()
      return term ? text.includes(term) : true
    })
  }, [farmers, search])

  const handleAddFarmer = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const payload = {
        businessName: formData.businessName || undefined,
        location: formData.location,
        district: formData.district,
        region: formData.region,
        gpsAddress: undefined,
        farmSize: formData.farmSize ? Number(formData.farmSize) : undefined,
        certifications: formData.certifications
          ? formData.certifications.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          verified: formData.verified,
        },
      }

      const res = await apiClient.post('/farmers', payload)
      const created = res.data?.data || res.data
      
      // If user is an export company, automatically add farmer to supplier network
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.role === 'EXPORT_COMPANY' && created?.id) {
            try {
              await apiClient.post('/supplier-networks', {
                farmerId: created.id,
                relationshipType: 'DIRECT',
                notes: 'Added via farmer management',
              })
            } catch (networkError) {
              // If network creation fails, log but don't fail the whole operation
              console.warn('Failed to add farmer to supplier network:', networkError)
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse user from localStorage:', parseError)
        }
      }
      
      setFarmers((prev) => [created, ...prev])
      toast({
        variant: 'success',
        title: 'Farmer Added',
        description: userStr && JSON.parse(userStr).role === 'EXPORT_COMPANY'
          ? 'Farmer created and added to your supplier network'
          : 'Farmer created successfully',
      })
      setShowForm(false)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        businessName: '',
        location: '',
        region: '',
        district: '',
        farmSize: '',
        certifications: '',
        verified: false,
        images: [],
      })
      setImageFiles([])
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to create farmer. Please check required fields.')
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to create farmer',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farmers</h1>
          <p className="text-gray-300 mt-1">Manage farmer profiles and listings</p>
        </div>
        <Button className="shadow-glow" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showForm ? 'Close' : 'Add Farmer'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-900/80 border-white/10 text-slate-100">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">New Farmer</h2>
            {formError && (
              <div className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {formError}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleAddFarmer}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name (optional)</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size (acres)</Label>
                  <Input
                    id="farmSize"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.farmSize}
                    onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications (comma separated)</Label>
                  <Input
                    id="certifications"
                    placeholder="Organic, Fair Trade"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verified">Verified</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="verified"
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-gray-300">Mark as verified</span>
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label>Farm Images (Optional)</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length > 5) {
                          toast({
                            variant: 'destructive',
                            title: 'Too Many Images',
                            description: 'Please select up to 5 images only.',
                          })
                          return
                        }

                        setUploadingImages(true)
                        try {
                          const imagePromises = files.map((file) => {
                            return new Promise<string>((resolve) => {
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                resolve(reader.result as string)
                              }
                              reader.readAsDataURL(file)
                            })
                          })

                          const imageUrls = await Promise.all(imagePromises)
                          setImageFiles(files)
                          setFormData({
                            ...formData,
                            images: [...formData.images, ...imageUrls].slice(0, 5),
                          })
                        } catch (error) {
                          toast({
                            variant: 'destructive',
                            title: 'Upload Failed',
                            description: 'Failed to process images. Please try again.',
                          })
                        } finally {
                          setUploadingImages(false)
                        }
                      }}
                      className="bg-slate-800 border-slate-700 text-slate-100 cursor-pointer"
                      disabled={uploadingImages || formData.images.length >= 5}
                    />
                  </label>
                </div>

                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                          <img
                            src={imageUrl}
                            alt={`Farm image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== index)
                              setFormData({ ...formData, images: newImages })
                              setImageFiles(imageFiles.filter((_, i) => i !== index))
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.images.length === 0 && (
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">
                      No images yet. Upload photos of your farm to showcase your operation.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Farmer'}
                </Button>
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <FilterBar
        searchPlaceholder="Search farmers..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: 'region',
            label: 'Region',
            options: regionOptions,
            active: regionFilter,
            onChange: (val) => setRegionFilter(val),
          },
          {
            id: 'verified',
            label: 'Verification',
            options: verifiedOptions,
            active: verifiedFilter,
            onChange: (val) => setVerifiedFilter(val),
          },
        ]}
        onClearAll={() => {
          setRegionFilter(null)
          setVerifiedFilter(null)
        }}
      />

      {/* Farmers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFarmers.map((farmer) => (
          <Link key={farmer.id} href={`/dashboard/farmers/${farmer.id}`}>
            <Card className="hover:shadow-glow transition-shadow cursor-pointer bg-slate-900 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-white">
                      {farmer.businessName || `${farmer.user?.firstName} ${farmer.user?.lastName}`}
                    </h3>
                    <p className="text-sm text-gray-300">{farmer.location}</p>
                  </div>
                  {farmer.user?.verified && <Badge variant="success">Verified</Badge>}
                </div>
                <div className="space-y-2 text-sm text-gray-200">
                  <p>
                    <span className="font-medium text-white">Region:</span> {farmer.region}
                  </p>
                  <p>
                    <span className="font-medium text-white">District:</span> {farmer.district}
                  </p>
                  {farmer.farmSize && (
                    <p>
                      <span className="font-medium text-white">Farm Size:</span> {farmer.farmSize} acres
                    </p>
                  )}
                  {farmer.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {farmer.certifications.slice(0, 2).map((cert, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredFarmers.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          No farmers found. Try adjusting your search or filters.
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-sm text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} farmers
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pageNum })}
                    disabled={loading}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

