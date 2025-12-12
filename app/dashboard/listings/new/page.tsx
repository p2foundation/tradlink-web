'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Upload, Image as ImageIcon, Sparkles, X, Loader2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { QualityGrade, ListingStatus } from '@/types'
import { getCommodityImage } from '@/lib/commodity-images'

const CROP_TYPES = [
  'Cocoa',
  'Coffee',
  'Cashew',
  'Shea Nuts',
  'Palm Oil',
  'Rice',
  'Maize',
  'Yam',
  'Plantain',
  'Mango',
  'Pineapple',
  'Other',
]

export default function CreateListingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [formData, setFormData] = useState({
    cropType: '',
    cropVariety: '',
    quantity: '',
    unit: 'tons',
    qualityGrade: 'GRADE_A' as QualityGrade,
    pricePerUnit: '',
    harvestDate: '',
    availableFrom: '',
    availableUntil: '',
    description: '',
    certifications: '',
    images: [] as string[],
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const handleGenerateImage = async () => {
    if (!formData.cropType) {
      toast({
        variant: 'destructive',
        title: 'Crop Type Required',
        description: 'Please select a crop type first to generate an image.',
      })
      return
    }

    setGeneratingImage(true)
    try {
      // Simulate AI generation delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Use the commodity images utility to get high-quality images
      const generatedImage = getCommodityImage(formData.cropType)

      if (formData.images.length >= 5) {
        toast({
          variant: 'destructive',
          title: 'Maximum Images',
          description: 'You can only add up to 5 images. Remove one to add more.',
        })
        return
      }

      setFormData({
        ...formData,
        images: [...formData.images, generatedImage],
      })

      toast({
        variant: 'success',
        title: 'Image Generated!',
        description: `AI-generated ${formData.cropType} image added to your listing.`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Failed to generate image. Please try again.',
      })
    } finally {
      setGeneratingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        cropType: formData.cropType,
        cropVariety: formData.cropVariety || undefined,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        qualityGrade: formData.qualityGrade,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        harvestDate: formData.harvestDate ? new Date(formData.harvestDate).toISOString() : undefined,
        availableFrom: new Date(formData.availableFrom).toISOString(),
        availableUntil: formData.availableUntil ? new Date(formData.availableUntil).toISOString() : undefined,
        description: formData.description || undefined,
        certifications: formData.certifications
          ? formData.certifications.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        images: formData.images,
        status: 'ACTIVE' as ListingStatus,
      }

      const response = await apiClient.post('/listings', payload)

      toast({
        variant: 'success',
        title: 'Listing Created!',
        description: 'Your product listing has been created successfully.',
      })

      router.push(`/dashboard/listings/${response.data.id}`)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error.response?.data?.message || 'Failed to create listing. Please check all required fields.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Create New Listing
          </h1>
          <p className="text-gray-400 mt-1">Add a new product listing to connect with buyers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Product Information</CardTitle>
            <CardDescription className="text-gray-400">
              Provide details about your product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cropType" className="text-slate-200">
                  Crop Type <span className="text-red-400">*</span>
                </Label>
                <select
                  id="cropType"
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                  required
                  aria-label="Crop Type"
                >
                  <option value="">Select crop type</option>
                  {CROP_TYPES.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropVariety" className="text-slate-200">
                  Crop Variety (Optional)
                </Label>
                <Input
                  id="cropVariety"
                  value={formData.cropVariety}
                  onChange={(e) => setFormData({ ...formData, cropVariety: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  placeholder="e.g., Forastero, Robusta"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-slate-200">
                  Quantity <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-slate-200">
                  Unit
                </Label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100"
                  aria-label="Unit"
                >
                  <option value="tons">Tons</option>
                  <option value="kg">Kilograms</option>
                  <option value="bags">Bags</option>
                  <option value="crates">Crates</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityGrade" className="text-slate-200">
                  Quality Grade <span className="text-red-400">*</span>
                </Label>
                <select
                  id="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value as QualityGrade })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100"
                  required
                  aria-label="Quality Grade"
                >
                  <option value="PREMIUM">Premium</option>
                  <option value="GRADE_A">Grade A</option>
                  <option value="GRADE_B">Grade B</option>
                  <option value="STANDARD">Standard</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnit" className="text-slate-200">
                  Price per Unit (USD) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvestDate" className="text-slate-200">
                  Harvest Date (Optional)
                </Label>
                <Input
                  id="harvestDate"
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableFrom" className="text-slate-200">
                  Available From <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableUntil" className="text-slate-200">
                  Available Until (Optional)
                </Label>
                <Input
                  id="availableUntil"
                  type="date"
                  value={formData.availableUntil}
                  onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-200">
                Description (Optional)
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 resize-none"
                rows={4}
                placeholder="Describe your product, farming methods, quality standards, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications" className="text-slate-200">
                Certifications (Optional)
              </Label>
              <Input
                id="certifications"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                className="bg-slate-800 border-slate-700 text-slate-100"
                placeholder="Organic, Fair Trade, Rainforest Alliance (comma separated)"
              />
              <p className="text-xs text-gray-400">Separate multiple certifications with commas</p>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-200">Product Images (Optional)</Label>
              <p className="text-xs text-gray-400 mb-3">
                Upload product images or generate one using AI. Images make your listing more engaging for buyers.
              </p>

              {/* Image Upload Section */}
              <div className="space-y-3">
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
                          // Convert files to base64 or upload to storage
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateImage}
                    disabled={!formData.cropType || generatingImage || formData.images.length >= 5}
                    className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                  >
                    {generatingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate AI Image
                      </>
                    )}
                  </Button>
                </div>

                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={`Product image ${index + 1}`}
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
                  <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">
                      No images yet. Upload photos or generate an AI image to make your listing stand out!
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  {formData.images.length}/5 images • {formData.images.length >= 5 ? 'Maximum reached' : 'Add more images to attract buyers'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Listing
                  </span>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

