'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Shield,
  Download,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export default function ComplianceGuidePage() {
  const countries = [
    {
      code: 'US',
      name: 'United States',
      requirements: [
        {
          type: 'FDA_REGISTRATION',
          name: 'FDA Registration',
          description: 'Food and Drug Administration registration for importing food products to USA',
          mandatory: true,
          processingTime: '10-15 business days',
          cost: 'Varies by product type',
        },
        {
          type: 'USDA_CERTIFICATE',
          name: 'USDA Certificate',
          description: 'USDA certificate for agricultural products',
          mandatory: true,
          processingTime: '5-10 business days',
          cost: 'Included in inspection fee',
        },
        {
          type: 'CERTIFICATE_OF_ORIGIN',
          name: 'Certificate of Origin',
          description: 'Document certifying the country of origin of the goods',
          mandatory: true,
          processingTime: '1-3 business days',
          cost: 'Free - $50',
        },
        {
          type: 'PHYTOSANITARY_CERTIFICATE',
          name: 'Phytosanitary Certificate',
          description: 'Certificate ensuring products are free from pests and diseases',
          mandatory: true,
          processingTime: '3-5 business days',
          cost: 'Free - $100',
        },
      ],
      notes: [
        'All food products must meet FDA food safety standards',
        'USDA approval required for agricultural products',
        'Country of Origin labeling required on all products',
        'Organic certification recommended for premium products',
      ],
    },
    {
      code: 'GB',
      name: 'United Kingdom',
      requirements: [
        {
          type: 'EU_TRACES',
          name: 'EU TRACES Registration',
          description: 'EU Trade Control and Expert System registration',
          mandatory: true,
          processingTime: '5-7 business days',
          cost: 'Free',
        },
        {
          type: 'CERTIFICATE_OF_ORIGIN',
          name: 'Certificate of Origin',
          description: 'Document certifying the country of origin',
          mandatory: true,
          processingTime: '1-3 business days',
          cost: 'Free - $50',
        },
        {
          type: 'PHYTOSANITARY_CERTIFICATE',
          name: 'Phytosanitary Certificate',
          description: 'Plant health certificate',
          mandatory: true,
          processingTime: '3-5 business days',
          cost: 'Free - $100',
        },
        {
          type: 'HEALTH_CERTIFICATE',
          name: 'Health Certificate',
          description: 'Health certificate for food products',
          mandatory: true,
          processingTime: '3-5 business days',
          cost: 'Free - $75',
        },
      ],
      notes: [
        'EU TRACES registration required before first shipment',
        'Must comply with EU food safety regulations',
        'Organic certification recommended for premium products',
        'Fair Trade certification can increase market value',
      ],
    },
    {
      code: 'CN',
      name: 'China',
      requirements: [
        {
          type: 'AQSIQ_CERTIFICATE',
          name: 'AQSIQ Certificate',
          description: 'China quality inspection certificate',
          mandatory: true,
          processingTime: '10-15 business days',
          cost: 'Varies by product',
        },
        {
          type: 'IMPORT_PERMIT',
          name: 'Import Permit',
          description: 'Import permit from Chinese authorities',
          mandatory: true,
          processingTime: '15-20 business days',
          cost: 'Varies',
        },
        {
          type: 'CERTIFICATE_OF_ORIGIN',
          name: 'Certificate of Origin',
          description: 'Document certifying product origin',
          mandatory: true,
          processingTime: '1-3 business days',
          cost: 'Free - $50',
        },
        {
          type: 'QUALITY_CERTIFICATE',
          name: 'Quality Certificate',
          description: 'Quality inspection certificate',
          mandatory: true,
          processingTime: '5-7 business days',
          cost: 'Varies',
        },
      ],
      notes: [
        'AQSIQ approval required before shipment',
        'Import permits must be obtained before shipment',
        'Quality inspection mandatory at port of entry',
        'Some products may require additional certifications',
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/dashboard/compliance">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Compliance
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Import Compliance Guide</h1>
        <p className="text-muted-foreground">
          Comprehensive guide to import requirements for different countries
        </p>
      </div>

      {/* Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-foreground">
            <p>
              This guide provides detailed information about import compliance requirements 
              for different countries. Each country has specific documentation and certification 
              requirements that must be met before products can be imported.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-card/50 rounded-lg">
                <Shield className="h-8 w-8 text-emerald-400 mb-2" />
                <h3 className="text-foreground font-semibold mb-1">Required Documents</h3>
                <p className="text-muted-foreground text-sm">
                  Learn about mandatory documents for each country
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg">
                <FileText className="h-8 w-8 text-cyan-400 mb-2" />
                <h3 className="text-foreground font-semibold mb-1">Processing Times</h3>
                <p className="text-muted-foreground text-sm">
                  Understand how long each document takes to obtain
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg">
                <Globe className="h-8 w-8 text-amber-400 mb-2" />
                <h3 className="text-foreground font-semibold mb-1">Country-Specific</h3>
                <p className="text-muted-foreground text-sm">
                  Get detailed requirements for your target market
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Country Requirements */}
      <div className="space-y-6">
        {countries.map((country) => (
          <Card key={country.code}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{country.name}</CardTitle>
                  <CardDescription>
                    Import requirements and compliance standards
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-400/50">
                  {country.code}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Required Documents */}
                <div>
                  <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-400" />
                    Required Documents
                  </h3>
                  <div className="space-y-3">
                    {country.requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-card/50 rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-foreground font-medium">{req.name}</h4>
                              {req.mandatory && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{req.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground/70">Processing Time:</span>
                            <span className="text-foreground ml-2">{req.processingTime}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground/70">Cost:</span>
                            <span className="text-foreground ml-2">{req.cost}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Notes */}
                <div>
                  <h3 className="text-foreground font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                    Important Notes
                  </h3>
                  <ul className="list-disc list-inside text-foreground text-sm space-y-2 ml-4">
                    {country.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* General Tips */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>General Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-card/50 rounded-lg">
                <h4 className="text-foreground font-semibold mb-2">Start Early</h4>
                <p className="text-sm text-muted-foreground">
                  Begin the document application process as early as possible. Some documents 
                  can take 15-20 business days to process.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg">
                <h4 className="text-foreground font-semibold mb-2">Keep Copies</h4>
                <p className="text-sm text-muted-foreground">
                  Always keep digital and physical copies of all documents. You may need 
                  them for customs clearance and future shipments.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg">
                <h4 className="text-foreground font-semibold mb-2">Verify Validity</h4>
                <p className="text-sm text-muted-foreground">
                  Check expiration dates regularly. Some certificates expire and need to 
                  be renewed before each shipment.
                </p>
              </div>
              <div className="p-4 bg-card/50 rounded-lg">
                <h4 className="text-foreground font-semibold mb-2">Work with Experts</h4>
                <p className="text-sm text-muted-foreground">
                  Consider working with customs brokers or trade consultants who understand 
                  the requirements for your target market.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://www.fda.gov/food/food-imports-exports/importing-food-products-united-states"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-card/50 rounded-lg hover:bg-card transition-colors flex items-center justify-between group border border-border hover:border-emerald-500/50"
            >
              <div>
                <h4 className="text-foreground font-semibold mb-1">FDA Import Guide</h4>
                <p className="text-muted-foreground text-sm">Official FDA import requirements for food products</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400" />
            </a>
            <a
              href="https://food.ec.europa.eu/horizontal-topics/traces_en"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-card/50 rounded-lg hover:bg-card transition-colors flex items-center justify-between group border border-border hover:border-emerald-500/50"
            >
              <div>
                <h4 className="text-foreground font-semibold mb-1">EU TRACES System</h4>
                <p className="text-muted-foreground text-sm">EU Trade Control and Expert System for imports</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400" />
            </a>
            <a
              href="https://food.ec.europa.eu/index_en"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-card/50 rounded-lg hover:bg-card transition-colors flex items-center justify-between group border border-border hover:border-emerald-500/50"
            >
              <div>
                <h4 className="text-foreground font-semibold mb-1">EU Food Safety Portal</h4>
                <p className="text-muted-foreground text-sm">European Commission Food Safety information</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400" />
            </a>
            <a
              href="https://gra.gov.gh/customs/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-card/50 rounded-lg hover:bg-card transition-colors flex items-center justify-between group border border-border hover:border-emerald-500/50"
            >
              <div>
                <h4 className="text-foreground font-semibold mb-1">Ghana Customs</h4>
                <p className="text-muted-foreground text-sm">Ghana Revenue Authority - Customs Division</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400" />
            </a>
            <a
              href="https://www.gepaghana.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-card/50 rounded-lg hover:bg-card transition-colors flex items-center justify-between group border border-border hover:border-emerald-500/50"
            >
              <div>
                <h4 className="text-foreground font-semibold mb-1">GEPA Resources</h4>
                <p className="text-muted-foreground text-sm">Ghana Export Promotion Authority official website</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400" />
            </a>
            <a
              href="https://www.fda.gov/industry/import-program-food-and-drug-administration-fda/import-basics"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-card/50 rounded-lg hover:bg-card transition-colors flex items-center justify-between group border border-border hover:border-emerald-500/50"
            >
              <div>
                <h4 className="text-foreground font-semibold mb-1">FDA Import Basics</h4>
                <p className="text-muted-foreground text-sm">General overview of FDA import procedures</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-emerald-400" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
