'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle2, XCircle, Clock, Download, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Document {
  id: string
  name: string
  type: 'certificate' | 'invoice' | 'contract' | 'license' | 'other'
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  uploadedAt: string
  verifiedAt?: string
  expiryDate?: string
  size: string
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Organic Certification.pdf',
      type: 'certificate',
      status: 'verified',
      uploadedAt: '2024-11-15T10:00:00Z',
      verifiedAt: '2024-11-16T14:30:00Z',
      expiryDate: '2025-11-15',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Export License.pdf',
      type: 'license',
      status: 'verified',
      uploadedAt: '2024-11-10T09:00:00Z',
      verifiedAt: '2024-11-11T11:20:00Z',
      expiryDate: '2025-11-10',
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'Trade Contract.pdf',
      type: 'contract',
      status: 'pending',
      uploadedAt: '2024-12-01T15:00:00Z',
      size: '3.2 MB',
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'expired':
        return <Badge variant="warning">Expired</Badge>
      default:
        return <Badge variant="warning">Pending</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      certificate: 'Certificate',
      invoice: 'Invoice',
      contract: 'Contract',
      license: 'License',
      other: 'Other',
    }
    return labels[type] || type
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
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                    <span>{getTypeLabel(doc.type)}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                    {doc.verifiedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-300">
                          Verified {formatDate(doc.verifiedAt)}
                        </span>
                      </>
                    )}
                    {doc.expiryDate && (
                      <>
                        <span>•</span>
                        <span>Expires {formatDate(doc.expiryDate)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(doc.status)}
                <Button variant="ghost" size="icon" className="text-slate-200 hover:text-white">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-200 hover:text-white">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No documents uploaded yet</p>
            <Button className="mt-4" variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

