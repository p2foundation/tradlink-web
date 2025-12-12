export enum UserRole {
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  EXPORT_COMPANY = 'EXPORT_COMPANY',
  ADMIN = 'ADMIN',
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
}

export enum QualityGrade {
  PREMIUM = 'PREMIUM',
  GRADE_A = 'GRADE_A',
  GRADE_B = 'GRADE_B',
  STANDARD = 'STANDARD',
}

export enum MatchStatus {
  SUGGESTED = 'SUGGESTED',
  CONTACTED = 'CONTACTED',
  NEGOTIATING = 'NEGOTIATING',
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface Farmer {
  id: string
  userId: string
  businessName?: string
  location: string
  district: string
  region: string
  gpsAddress?: string
  farmSize?: number
  certifications: string[]
  user?: User
  listings?: Listing[]
}

export interface Buyer {
  id: string
  userId: string
  companyName: string
  country: string
  industry: string
  website?: string
  companySize?: string
  seekingCrops: string[]
  volumeRequired?: string
  qualityStandards: string[]
  user?: User
}

export interface Listing {
  id: string
  farmerId: string
  cropType: string
  cropVariety?: string
  quantity: number
  unit: string
  qualityGrade: QualityGrade
  pricePerUnit: number
  harvestDate?: string
  availableFrom: string
  availableUntil?: string
  description?: string
  images: string[]
  certifications: string[]
  status: ListingStatus
  farmer?: Farmer
  createdAt: string
  updatedAt: string
}

export interface Match {
  id: string
  listingId: string
  farmerId: string
  buyerId: string
  compatibilityScore: number
  estimatedValue: number
  status: MatchStatus
  aiRecommendation?: string
  contactedAt?: string
  negotiationStartedAt?: string
  contractSignedAt?: string
  completedAt?: string
  listing?: Listing
  farmer?: Farmer
  buyer?: Buyer
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  matchId: string
  buyerId: string
  exportCompanyId?: string
  quantity: number
  agreedPrice: number
  totalValue: number
  currency: string
  paymentStatus: string
  shipmentStatus: string
  paymentDate?: string
  shipmentDate?: string
  deliveryDate?: string
  match?: Match
  buyer?: Buyer
  createdAt: string
  updatedAt: string
}

