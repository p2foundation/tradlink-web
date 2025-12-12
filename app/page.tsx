'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowDown, 
  CheckCircle2, 
  Globe, 
  Shield, 
  TrendingUp, 
  Users,
  Quote,
  Star,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone
} from 'lucide-react'
import { Chatbot } from '@/components/chat/chatbot'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const progress = Math.min(scrollY / windowHeight, 1)
      
      setScrollProgress(progress)
      setScrolled(scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroSlideStyle = {
    transform: `translateY(${-scrollProgress * 100}%)`,
    transition: 'transform 0.3s ease-out',
  }

  const testimonials = [
    {
      name: 'Kwame Asante',
      role: 'Cocoa Farmer, Ashanti Region',
      image: '👨‍🌾',
      quote: 'TradeLink+ connected me with buyers from Europe. My income has increased by 40% in just 6 months.',
      rating: 5,
    },
    {
      name: 'Sarah Mensah',
      role: 'Export Company Owner, Accra',
      image: '👩‍💼',
      quote: 'The platform streamlined our entire export process. We\'ve doubled our export volume this year.',
      rating: 5,
    },
    {
      name: 'David Chen',
      role: 'International Buyer, China',
      image: '🌏',
      quote: 'Direct access to verified Ghanaian farmers. Quality is consistent, and transactions are secure.',
      rating: 5,
    },
    {
      name: 'Ama Osei',
      role: 'Cashew Farmer, Bono Region',
      image: '👩‍🌾',
      quote: 'I can now see real-time prices and get matched with the best buyers. This platform changed my life.',
      rating: 5,
    },
  ]

  const features = [
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Global Market Access',
      description: 'Connect with verified international buyers from China, Kenya, Rwanda, USA, and beyond.',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Real-Time Market Intelligence',
      description: 'AI-powered price predictions and market insights to maximize your profits.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure Transactions',
      description: 'End-to-end encryption and verified partners ensure safe and reliable trading.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'AI-Powered Matching',
      description: 'Smart algorithms connect you with the perfect buyers based on your products and needs.',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Hero Section with Video Background */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={heroSlideStyle}
      >
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Video Background with Fallback */}
          {!videoError ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80"
              onError={() => setVideoError(true)}
            >
              {/* Primary: Shipping Containers at Port - Export/Import Theme */}
              <source
                src="https://videos.pexels.com/video-files/2491284/2491284-hd_1920_1080_25fps.mp4"
                type="video/mp4"
              />
              {/* Alternative: Cargo Ship Loading/Unloading */}
              <source
                src="https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_30fps.mp4"
                type="video/mp4"
              />
            </video>
          ) : (
            /* Fallback: Shipping Container Terminal Image - Perfect match for export/import theme */
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80')",
              }}
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl w-full px-6 text-center space-y-8">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
              TradeLink+
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
              AI-Driven MSME Export Platform
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-200">
              Connecting Ghana to the World
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Empower smallholder farmers and export companies with real-time market insights, 
              secure transactions, and direct access to international buyers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button 
                size="lg" 
                className="shadow-glow text-lg px-8 py-6 h-auto bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg"
                variant="outline" 
                className="text-lg px-8 py-6 h-auto border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Live market insights
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              Secure payments
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-amber-300" />
              Verified partners
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2 text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-purple-400" />
              AI-powered matching
            </span>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ArrowDown className="h-6 w-6 text-white/60" />
          </div>
        </div>
      </div>

      {/* Content Sections (Revealed on Scroll) */}
      <div className="relative z-40 pt-[100vh]">
        {/* Partners/Sponsors Section - Horizontal Scrolling */}
        <section className="py-16 px-6 bg-slate-950 border-y border-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-300">
                Trusted Partners & Integrations
              </h3>
              <p className="text-slate-500 text-sm">
                Working with leading organizations to connect Ghana to the world
              </p>
            </div>
            
            {/* Horizontal Scrolling Container */}
            <div className="relative overflow-hidden">
              {/* Gradient Overlays for Smooth Edge Effect */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
              
              {/* Scrolling Content */}
              <div className="flex gap-12 animate-scroll">
                {/* First Set */}
                <div className="flex gap-12 items-center flex-shrink-0">
                  {[
                    { name: 'Ministry of Trade', logo: '🏛️', desc: 'Ghana Government' },
                    { name: 'GEPA', logo: '📦', desc: 'Export Promotion' },
                    { name: 'GRA Customs', logo: '🛃', desc: 'Customs Division' },
                    { name: 'AfCFTA', logo: '🌍', desc: 'Continental Trade' },
                    { name: 'China Trade', logo: '🇨🇳', desc: 'International Partner' },
                    { name: 'Kenya Trade', logo: '🇰🇪', desc: 'Regional Partner' },
                    { name: 'Rwanda Trade', logo: '🇷🇼', desc: 'Regional Partner' },
                    { name: 'USA Commerce', logo: '🇺🇸', desc: 'International Partner' },
                  ].map((partner, index) => (
                    <div
                      key={`set1-${index}`}
                      className="flex flex-col items-center gap-3 min-w-[140px] group"
                    >
                      <div className="w-24 h-24 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-4xl group-hover:bg-slate-800/70 group-hover:border-emerald-500/50 transition-all duration-300 group-hover:scale-110">
                        {partner.logo}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">{partner.name}</p>
                        <p className="text-xs text-slate-500">{partner.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Duplicate Set for Seamless Loop */}
                <div className="flex gap-12 items-center flex-shrink-0" aria-hidden="true">
                  {[
                    { name: 'Ministry of Trade', logo: '🏛️', desc: 'Ghana Government' },
                    { name: 'GEPA', logo: '📦', desc: 'Export Promotion' },
                    { name: 'GRA Customs', logo: '🛃', desc: 'Customs Division' },
                    { name: 'AfCFTA', logo: '🌍', desc: 'Continental Trade' },
                    { name: 'China Trade', logo: '🇨🇳', desc: 'International Partner' },
                    { name: 'Kenya Trade', logo: '🇰🇪', desc: 'Regional Partner' },
                    { name: 'Rwanda Trade', logo: '🇷🇼', desc: 'Regional Partner' },
                    { name: 'USA Commerce', logo: '🇺🇸', desc: 'International Partner' },
                  ].map((partner, index) => (
                    <div
                      key={`set2-${index}`}
                      className="flex flex-col items-center gap-3 min-w-[140px] group"
                    >
                      <div className="w-24 h-24 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-4xl group-hover:bg-slate-800/70 group-hover:border-emerald-500/50 transition-all duration-300 group-hover:scale-110">
                        {partner.logo}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">{partner.name}</p>
                        <p className="text-xs text-slate-500">{partner.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Trusted by Farmers & Buyers
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Join thousands of successful traders connecting across borders
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-emerald-400/50 mb-4" />
                    <p className="text-slate-300 mb-6 italic leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                      <div className="text-3xl">{testimonial.image}</div>
                      <div>
                        <p className="font-semibold text-white">{testimonial.name}</p>
                        <p className="text-sm text-slate-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Why Choose TradeLink+?
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Everything you need to succeed in international trade
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 hover:border-emerald-500/50 group"
                >
                  <CardContent className="p-6">
                    <div className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-emerald-400 mb-2">25K+</div>
                <div className="text-slate-400">Active Farmers</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-cyan-400 mb-2">500+</div>
                <div className="text-slate-400">International Buyers</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-amber-400 mb-2">$50M+</div>
                <div className="text-slate-400">Trade Volume</div>
              </div>
              <div>
                <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-2">98%</div>
                <div className="text-slate-400">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-800 py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">TradeLink+</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Empowering Ghana's agricultural sector with AI-driven export solutions.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/register" className="text-slate-400 hover:text-emerald-400 transition-colors">Get Started</Link></li>
                  <li><Link href="/login" className="text-slate-400 hover:text-emerald-400 transition-colors">Sign In</Link></li>
                  <li><Link href="/dashboard" className="text-slate-400 hover:text-emerald-400 transition-colors">Dashboard</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Support</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-slate-400">
                    <Mail className="h-4 w-4" />
                    <a href="mailto:info@tradelink.gh" className="hover:text-emerald-400 transition-colors">info@tradelink.gh</a>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <Phone className="h-4 w-4" />
                    <a href="tel:+233123456789" className="hover:text-emerald-400 transition-colors">+233 123 456 789</a>
                  </li>
                </ul>
                <div className="flex gap-4 mt-4">
                  <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} TradeLink+. All rights reserved. | Tanbu Lane, East Legon, Accra - Ghana</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Chatbot */}
      <Chatbot />
    </div>
  )
}
