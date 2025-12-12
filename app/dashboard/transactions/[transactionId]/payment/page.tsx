'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Smartphone,
  Globe,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  FileText,
  DollarSign,
} from 'lucide-react'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { useCurrency } from '@/contexts/currency-context'

type PaymentMethod = 'VISA' | 'MASTERCARD' | 'MOBILE_MONEY' | 'PAPSS' | 'MANUAL_PORT'

interface Payment {
  id: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  paymentStatus: string
  isManual: boolean
  receiptDocument?: string
  receiptNumber?: string
  receiptDate?: string
  createdAt: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { formatCurrency } = useCurrency()
  const transactionId = params.transactionId as string
  const [user, setUser] = useState<any>(null)
  const [transaction, setTransaction] = useState<any>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVC, setCardCVC] = useState('')
  const [cardName, setCardName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [mobileNetwork, setMobileNetwork] = useState('MTN')
  
  // Manual payment fields
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptNumber, setReceiptNumber] = useState('')
  const [receiptDate, setReceiptDate] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setCardName(`${JSON.parse(storedUser).firstName} ${JSON.parse(storedUser).lastName}`)
    }
    fetchTransaction()
  }, [transactionId])

  const fetchTransaction = async () => {
    try {
      setLoading(true)
      const [txnResponse, paymentsResponse] = await Promise.all([
        apiClient.get(`/transactions/${transactionId}`),
        apiClient.get(`/payments?transactionId=${transactionId}`),
      ])
      
      setTransaction(txnResponse.data)
      if (paymentsResponse.data.length > 0) {
        setPayment(paymentsResponse.data[0])
        setSelectedMethod(paymentsResponse.data[0].paymentMethod)
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load transaction',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
  }

  const processIntegratedPayment = async () => {
    if (!selectedMethod || !transaction) return

    try {
      setSubmitting(true)

      let provider = ''
      if (selectedMethod === 'VISA' || selectedMethod === 'MASTERCARD') {
        provider = 'stripe' // or 'paystack' for Africa
        // Validate card details
        if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
          toast({
            variant: 'warning',
            title: 'Incomplete Details',
            description: 'Please fill in all card details',
          })
          return
        }
      } else if (selectedMethod === 'MOBILE_MONEY') {
        provider = 'mobile_money'
        if (!mobileNumber) {
          toast({
            variant: 'warning',
            title: 'Incomplete Details',
            description: 'Please provide your mobile money number',
          })
          return
        }
      } else if (selectedMethod === 'PAPSS') {
        provider = 'papss'
      }

      const paymentResponse = await apiClient.post('/payments', {
        transactionId: transaction.id,
        amount: transaction.totalValue,
        currency: transaction.currency,
        paymentMethod: selectedMethod,
        provider,
      })

      toast({
        variant: 'success',
        title: 'Payment Initiated',
        description: 'Your payment is being processed. You will be redirected...',
      })

      // Simulate payment processing (in real app, this would be handled by payment provider callback)
      setTimeout(() => {
        fetchTransaction()
      }, 2000)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error.response?.data?.message || 'Failed to process payment',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleManualPaymentUpload = async () => {
    if (!receiptFile || !receiptNumber || !receiptDate) {
      toast({
        variant: 'warning',
        title: 'Incomplete Details',
        description: 'Please provide receipt file, number, and date',
      })
      return
    }

    try {
      setUploading(true)

      // Upload file (in real app, use proper file upload service)
      const formData = new FormData()
      formData.append('file', receiptFile)
      // const uploadResponse = await apiClient.post('/upload', formData)
      // For now, simulate upload
      const receiptDocument = URL.createObjectURL(receiptFile)

      // Create manual payment
      const paymentResponse = await apiClient.post('/payments', {
        transactionId: transaction.id,
        amount: transaction.totalValue,
        currency: transaction.currency,
        paymentMethod: 'MANUAL_PORT',
        isManual: true,
        receiptNumber,
        receiptDate,
      })

      // Upload receipt document
      await apiClient.post(`/payments/${paymentResponse.data.id}/upload-receipt`, {
        receiptDocument,
        receiptNumber,
        receiptDate,
      })

      toast({
        variant: 'success',
        title: 'Receipt Uploaded',
        description: 'Your payment receipt has been uploaded and is pending verification',
      })

      fetchTransaction()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload receipt',
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Transaction not found</p>
      </div>
    )
  }

  const paymentMethods: { value: PaymentMethod; label: string; icon: any; description: string }[] = [
    { value: 'VISA', label: 'Visa', icon: CreditCard, description: 'Pay with Visa card' },
    { value: 'MASTERCARD', label: 'Mastercard', icon: CreditCard, description: 'Pay with Mastercard' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone, description: 'MTN, Vodafone, AirtelTigo' },
    { value: 'PAPSS', label: 'PAPSS', icon: Globe, description: 'Pan-African Payment and Settlement System' },
    { value: 'MANUAL_PORT', label: 'Ghana Port Manual Payment', icon: Upload, description: 'Upload port receipt/chit' },
  ]

  const isPaid = transaction.paymentStatus === 'paid' || payment?.paymentStatus === 'COMPLETED' || payment?.paymentStatus === 'VERIFIED'
  const isPending = payment?.paymentStatus === 'PENDING' || payment?.paymentStatus === 'PROCESSING'

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
            Payment
          </h1>
          <p className="text-gray-400 mt-1">Complete your transaction payment</p>
        </div>
      </div>

      {/* Transaction Summary */}
      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Amount</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(transaction.totalValue, transaction.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Quantity</p>
              <p className="text-lg font-semibold text-white">{transaction.quantity} tons</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Price per Unit</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(transaction.agreedPrice, transaction.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Status</p>
              {isPaid ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Paid
                </Badge>
              ) : isPending ? (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <XCircle className="h-3 w-3 mr-1" />
                  Unpaid
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isPaid ? (
        <Card className="bg-emerald-900/20 border-emerald-500/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-emerald-300 mb-2">
                  Payment Completed!
                </h3>
                <p className="text-emerald-200/70">
                  Your payment has been successfully processed
                </p>
                {payment?.receiptNumber && (
                  <p className="text-sm text-emerald-200/50 mt-2">
                    Receipt Number: {payment.receiptNumber}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : isPending && payment?.isManual ? (
        <Card className="bg-amber-900/20 border-amber-500/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Clock className="h-16 w-16 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-xl font-semibold text-amber-300 mb-2">
                  Payment Pending Verification
                </h3>
                <p className="text-amber-200/70">
                  Your receipt has been uploaded and is awaiting admin verification
                </p>
                {payment.receiptNumber && (
                  <p className="text-sm text-amber-200/50 mt-2">
                    Receipt Number: {payment.receiptNumber}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Payment Methods */}
          <Card className="bg-slate-900 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Select Payment Method</CardTitle>
              <CardDescription className="text-gray-400">
                Choose how you want to pay for this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = selectedMethod === method.value
                  return (
                    <button
                      key={method.value}
                      onClick={() => handlePaymentMethodSelect(method.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <Icon className="h-6 w-6 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-100">{method.label}</p>
                      <p className="text-xs text-slate-400 mt-1">{method.description}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Payment Forms */}
          {selectedMethod && (
            <Card className="bg-slate-900 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">
                  {selectedMethod === 'MANUAL_PORT' ? 'Upload Payment Receipt' : 'Payment Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedMethod === 'VISA' || selectedMethod === 'MASTERCARD' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="cardName" className="text-slate-200">
                        Cardholder Name
                      </Label>
                      <Input
                        id="cardName"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-slate-200">
                        Card Number
                      </Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry" className="text-slate-200">
                          Expiry Date
                        </Label>
                        <Input
                          id="cardExpiry"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-slate-100"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCVC" className="text-slate-200">
                          CVC
                        </Label>
                        <Input
                          id="cardCVC"
                          type="password"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-slate-100"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <Button
                      onClick={processIntegratedPayment}
                      disabled={submitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {submitting ? 'Processing...' : `Pay ${formatCurrency(transaction.totalValue, transaction.currency)}`}
                    </Button>
                  </>
                ) : selectedMethod === 'MOBILE_MONEY' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="mobileNetwork" className="text-slate-200">
                        Network
                      </Label>
                      <select
                        id="mobileNetwork"
                        value={mobileNetwork}
                        onChange={(e) => setMobileNetwork(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100"
                      >
                        <option value="MTN">MTN Mobile Money</option>
                        <option value="VODAFONE">Vodafone Cash</option>
                        <option value="AIRTELTIGO">AirtelTigo Money</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber" className="text-slate-200">
                        Mobile Money Number
                      </Label>
                      <Input
                        id="mobileNumber"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                        placeholder="0244 123 456"
                      />
                    </div>
                    <Button
                      onClick={processIntegratedPayment}
                      disabled={submitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {submitting ? 'Processing...' : `Pay ${formatCurrency(transaction.totalValue, transaction.currency)}`}
                    </Button>
                  </>
                ) : selectedMethod === 'PAPSS' ? (
                  <>
                    <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                      <p className="text-sm text-blue-300">
                        PAPSS (Pan-African Payment and Settlement System) allows you to pay in your local currency
                        while the recipient receives payment in their preferred currency.
                      </p>
                    </div>
                    <Button
                      onClick={processIntegratedPayment}
                      disabled={submitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {submitting ? 'Processing...' : `Pay via PAPSS`}
                    </Button>
                  </>
                ) : selectedMethod === 'MANUAL_PORT' ? (
                  <>
                    <div className="p-4 bg-amber-900/20 border border-amber-800/50 rounded-lg mb-4">
                      <p className="text-sm text-amber-300">
                        For Ghana Port manual payments, please upload your payment receipt/chit issued by the port.
                        Your payment will be verified by our team before completion.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="receiptFile" className="text-slate-200">
                          Upload Receipt/Chit
                        </Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="receiptFile"
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                            className="bg-slate-800 border-slate-700 text-slate-100"
                          />
                          {receiptFile && (
                            <Badge className="bg-emerald-500/20 text-emerald-400">
                              <FileText className="h-3 w-3 mr-1" />
                              {receiptFile.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="receiptNumber" className="text-slate-200">
                          Receipt Number
                        </Label>
                        <Input
                          id="receiptNumber"
                          value={receiptNumber}
                          onChange={(e) => setReceiptNumber(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-slate-100"
                          placeholder="Enter receipt number from port"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="receiptDate" className="text-slate-200">
                          Receipt Date
                        </Label>
                        <Input
                          id="receiptDate"
                          type="date"
                          value={receiptDate}
                          onChange={(e) => setReceiptDate(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-slate-100"
                        />
                      </div>
                      <Button
                        onClick={handleManualPaymentUpload}
                        disabled={uploading || !receiptFile || !receiptNumber || !receiptDate}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {uploading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Uploading...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Receipt
                          </span>
                        )}
                      </Button>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

