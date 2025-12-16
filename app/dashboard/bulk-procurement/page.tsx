'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Package, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function BulkProcurementPage() {
  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h1 className="text-3xl font-bold">Bulk Procurement</h1>
        <p className="text-gray-300 mt-1">
          Aggregate produce from your supplier network and manage bulk sourcing operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/supplier-network">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-white">Source from Network</CardTitle>
                  <p className="text-sm text-gray-400">Procure from suppliers</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Create bulk orders from your verified supplier network
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/listings">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-white">Browse Listings</CardTitle>
                  <p className="text-sm text-gray-400">Discover products</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Browse all available product listings from farmers
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/transactions">
          <Card className="bg-slate-900 border-white/10 hover:shadow-glow transition-all cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-white">Active Orders</CardTitle>
                  <p className="text-sm text-gray-400">Track transactions</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                View and manage your active procurement orders
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="bg-slate-900 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Bulk Procurement Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-gray-300">
            <p>
              The Bulk Procurement module allows export companies to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Aggregate produce from multiple suppliers in your network</li>
              <li>Create bulk sourcing requests for specific commodities</li>
              <li>Negotiate volume discounts with farmers</li>
              <li>Track procurement orders and fulfillment status</li>
              <li>Manage quality control for bulk shipments</li>
              <li>Coordinate logistics for aggregated produce</li>
            </ul>
            <p className="text-sm text-gray-400 mt-4">
              Start by adding farmers to your supplier network, then create bulk orders from their listings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

