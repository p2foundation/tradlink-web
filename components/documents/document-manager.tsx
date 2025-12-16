'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  X,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'

type DocumentType =
  | 'EXPORT_LICENSE'
  | 'IMPORT_PERMIT'
  | 'CERTIFICATE_OF_ORIGIN'
  | 'PHYTOSANITARY_CERTIFICATE'
  | 'QUALITY_CERTIFICATE'
  | 'ORGANIC_CERTIFICATION'
  | 'FAIR_TRADE_CERTIFICATION'
  | 'COMMERCIAL_INVOICE'
  | 'PACKING_LIST'
  | 'BILL_OF_LADING'
  | 'INSURANCE_CERTIFICATE'
  | 'TRADE_CONTRACT'
  | 'GEPA_LICENSE'
  | 'CUSTOMS_DECLARATION'
  | 'HEALTH_CERTIFICATE'
  | 'OTHER'

type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'

interface Document {
  id: string
  name: string
  type: DocumentType
  status: DocumentStatus
  fileUrl: string
  description?: string
  uploadedAt: string
  verifiedAt?: string
  expiryDate?: string
  referenceNumber?: string
  issuedBy?: string
  verificationNotes?: string
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  EXPORT_LICENSE: 'Export License',
  IMPORT_PERMIT: 'Import Permit',
  CERTIFICATE_OF_ORIGIN: 'Certificate of Origin',
  PHYTOSANITARY_CERTIFICATE: 'Phytosanitary Certificate',
  QUALITY_CERTIFICATE: 'Quality Certificate',
  ORGANIC_CERTIFICATION: 'Organic Certification',
  FAIR_TRADE_CERTIFICATION: 'Fair Trade Certification',
  COMMERCIAL_INVOICE: 'Commercial Invoice',
  PACKING_LIST: 'Packing List',
  BILL_OF_LADING: 'Bill of Lading',
  INSURANCE_CERTIFICATE: 'Insurance Certificate',
  TRADE_CONTRACT: 'Trade Contract',
  GEPA_LICENSE: 'GEPA License',
  CUSTOMS_DECLARATION: 'Customs Declaration',
  HEALTH_CERTIFICATE: 'Health Certificate',
  OTHER: 'Other',
}

export function DocumentManager() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPORT_LICENSE' as DocumentType,
    description: '',
    expiryDate: '',
    referenceNumber: '',
    issuedBy: '',
  })

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/documents')
      setDocuments(response.data.data || [])
    } catch (error: any) {
      console.error('Failed to fetch documents:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load documents',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please select a file smaller than 10MB',
        })
        return
      }
      setSelectedFile(file)
      if (!formData.name) {
        setFormData({ ...formData, name: file.name })
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a file to upload',
      })
      return
    }

    if (!formData.name || !formData.type) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide document name and type',
      })
      return
    }

    setUploading(true)
    try {
      // Convert file to base64
      const fileUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      await apiClient.post('/documents', {
        name: formData.name,
        type: formData.type,
        fileUrl,
        description: formData.description || undefined,
        expiryDate: formData.expiryDate || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        issuedBy: formData.issuedBy || undefined,
      })

      toast({
        variant: 'success',
        title: 'Document Uploaded',
        description: 'Your document has been uploaded and is pending verification',
      })

      setShowUploadForm(false)
      setSelectedFile(null)
      setFormData({
        name: '',
        type: 'EXPORT_LICENSE',
        description: '',
        expiryDate: '',
        referenceNumber: '',
        issuedBy: '',
      })
      fetchDocuments()
    } catch (error: any) {
      console.error('Upload failed:', error)
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload document',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = (doc: Document) => {
    if (doc.fileUrl) {
      const link = document.createElement('a')
      link.href = doc.fileUrl
      link.download = doc.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleView = (document: Document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'EXPIRED':
        return <XCircle className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="success">Verified</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      case 'EXPIRED':
        return <Badge variant="warning">Expired</Badge>
      default:
        return <Badge variant="warning">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <Card className="shadow-lg bg-slate-900/80 border-white/10 text-slate-100">
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-400 mt-4">Loading documents...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg bg-slate-900/80 border-white/10 text-slate-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Document Management
            </CardTitle>
            <p className="text-sm text-gray-300 mt-1">
              Upload, verify, and manage your trade documents
            </p>
          </div>
          <Button onClick={() => setShowUploadForm(!showUploadForm)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showUploadForm && (
          <div className="mb-6 p-4 border border-white/10 rounded-lg bg-slate-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Upload New Document</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowUploadForm(false)
                  setSelectedFile(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Document File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-400 mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="name">Document Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Export License 2024"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Document Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as DocumentType })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-slate-800 text-slate-100">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="referenceNumber">Reference Number (Optional)</Label>
                <Input
                  id="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  placeholder="e.g., GEPA-2024-12345"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="issuedBy">Issued By (Optional)</Label>
                <Input
                  id="issuedBy"
                  value={formData.issuedBy}
                  onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                  placeholder="e.g., GEPA, GRA Customs"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional notes about this document"
                  className="bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadForm(false)
                    setSelectedFile(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg border-white/10 bg-slate-900 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate text-white">{doc.name}</p>
                    {getStatusIcon(doc.status)}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-300 flex-wrap">
                    <span>{DOCUMENT_TYPE_LABELS[doc.type] || doc.type}</span>
                    {doc.referenceNumber && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-xs">{doc.referenceNumber}</span>
                      </>
                    )}
                    {doc.issuedBy && (
                      <>
                        <span>•</span>
                        <span>Issued by: {doc.issuedBy}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                    {doc.verifiedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-300">Verified {formatDate(doc.verifiedAt)}</span>
                      </>
                    )}
                    {doc.expiryDate && (
                      <>
                        <span>•</span>
                        <span>Expires {formatDate(doc.expiryDate)}</span>
                      </>
                    )}
                  </div>
                  {doc.verificationNotes && (
                    <p className="text-xs text-gray-400 mt-1 italic">{doc.verificationNotes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(doc.status)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-200 hover:text-white"
                  onClick={() => handleView(doc)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-200 hover:text-white"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {documents.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No documents uploaded yet</p>
            <Button className="mt-4" variant="outline" onClick={() => setShowUploadForm(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
