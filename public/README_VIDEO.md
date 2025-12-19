# Hero Video Setup

## Current Implementation

The hero section uses a video background with multiple fallback sources. If videos fail to load, a static image is shown.

## Video Sources

The video tries to load from these sources in order:
1. Pexels shipping containers video
2. Pexels cargo ship video
3. Coverr free stock video
4. Pixabay video

## If Videos Don't Load

### Option 1: Use a Local Video File (Recommended)

1. Download a free stock video from:
   - [Pexels](https://www.pexels.com/search/videos/shipping%20containers/)
   - [Pixabay](https://pixabay.com/videos/search/shipping%20containers/)
   - [Coverr](https://coverr.co/)

2. Save the video file to: `web/public/videos/hero-video.mp4`

3. Update `web/app/page.tsx` line ~179 to:
   ```tsx
   <source src="/videos/hero-video.mp4" type="video/mp4" />
   ```

### Option 2: Use a Different CDN

Replace the video sources with URLs from:
- Cloudinary
- Vimeo (with embed)
- YouTube (with embed)
- Your own CDN

### Option 3: Keep Using Static Image

The fallback image is already working and looks professional. You can remove the video element entirely and just use the background image.

## Testing

1. Open browser DevTools (F12)
2. Check Console tab for video loading messages
3. Check Network tab to see if video files are being requested
4. Look for CORS errors or 404 errors

## Current Status

If you're seeing the fallback image, it means:
- ✅ The fallback system is working
- ❌ The video URLs are not accessible (blocked, CORS, or network issue)
