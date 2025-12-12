/**
 * Utility for getting high-quality commodity images
 * Uses Unsplash and other free image sources for agricultural commodities
 */

export interface CommodityImage {
  url: string
  alt: string
  credit?: string
}

/**
 * Map of crop types to high-quality commodity images
 * These are curated Unsplash images that are visually appealing and relevant
 */
export const COMMODITY_IMAGES: Record<string, CommodityImage> = {
  'Cocoa': {
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&h=800&fit=crop&q=90',
    alt: 'Fresh cocoa beans and pods',
    credit: 'Unsplash'
  },
  'Coffee': {
    url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200&h=800&fit=crop&q=90&auto=format',
    alt: 'Coffee beans',
    credit: 'Unsplash'
  },
  'Cashew': {
    url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1200&h=800&fit=crop&q=90&auto=format',
    alt: 'Cashew nuts',
    credit: 'Unsplash'
  },
  'Shea Nuts': {
    url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=1200&h=800&fit=crop&q=90&auto=format',
    alt: 'Shea nuts',
    credit: 'Unsplash'
  },
  'Palm Oil': {
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90',
    alt: 'Palm oil fruits',
    credit: 'Unsplash'
  },
  'Rice': {
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&h=800&fit=crop&q=90',
    alt: 'Rice grains',
    credit: 'Unsplash'
  },
  'Maize': {
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90',
    alt: 'Maize corn',
    credit: 'Unsplash'
  },
  'Yam': {
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90',
    alt: 'Yam tubers',
    credit: 'Unsplash'
  },
  'Plantain': {
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90',
    alt: 'Plantain',
    credit: 'Unsplash'
  },
  'Mango': {
    url: 'https://images.unsplash.com/photo-1605027990121-cbae0a5c5c5e?w=1200&h=800&fit=crop&q=90',
    alt: 'Fresh mangoes',
    credit: 'Unsplash'
  },
  'Pineapple': {
    url: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=1200&h=800&fit=crop&q=90',
    alt: 'Pineapple',
    credit: 'Unsplash'
  },
  'Sesame': {
    url: 'https://images.unsplash.com/photo-1606312619070-d48d4cc8d92a?w=1200&h=800&fit=crop&q=90',
    alt: 'Sesame seeds',
    credit: 'Unsplash'
  },
  'Groundnut': {
    url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1200&h=800&fit=crop&q=90',
    alt: 'Groundnuts',
    credit: 'Unsplash'
  },
  'Soybean': {
    url: 'https://images.unsplash.com/photo-1606312619070-d48d4cc8d92a?w=1200&h=800&fit=crop&q=90',
    alt: 'Soybeans',
    credit: 'Unsplash'
  },
  'Cotton': {
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90',
    alt: 'Cotton',
    credit: 'Unsplash'
  },
  'Sorghum': {
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&h=800&fit=crop&q=90',
    alt: 'Sorghum',
    credit: 'Unsplash'
  },
  'Millet': {
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200&h=800&fit=crop&q=90',
    alt: 'Millet',
    credit: 'Unsplash'
  },
  'Cassava': {
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90',
    alt: 'Cassava',
    credit: 'Unsplash'
  },
  'Banana': {
    url: 'https://images.unsplash.com/photo-1605027990121-cbae0a5c5c5e?w=1200&h=800&fit=crop&q=90',
    alt: 'Bananas',
    credit: 'Unsplash'
  },
  'Orange': {
    url: 'https://images.unsplash.com/photo-1605027990121-cbae0a5c5c5e?w=1200&h=800&fit=crop&q=90',
    alt: 'Oranges',
    credit: 'Unsplash'
  },
}

/**
 * Get the default image URL for a crop type
 * @param cropType - The type of crop
 * @returns The image URL or a default placeholder
 */
export function getCommodityImage(cropType: string | null | undefined): string {
  if (!cropType) {
    return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90&auto=format'
  }
  
  const commodity = COMMODITY_IMAGES[cropType]
  return commodity?.url || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90&auto=format'
}

/**
 * Get the full commodity image object for a crop type
 * @param cropType - The type of crop
 * @returns The CommodityImage object or a default
 */
export function getCommodityImageData(cropType: string | null | undefined): CommodityImage {
  if (!cropType) {
    return {
      url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90&auto=format',
      alt: 'Agricultural commodity',
      credit: 'Unsplash'
    }
  }
  
  return COMMODITY_IMAGES[cropType] || {
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=800&fit=crop&q=90&auto=format',
    alt: `${cropType} commodity`,
    credit: 'Unsplash'
  }
}

/**
 * Get all available commodity types that have images
 * @returns Array of crop type strings
 */
export function getAvailableCommodities(): string[] {
  return Object.keys(COMMODITY_IMAGES)
}

