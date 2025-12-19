import axios from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './auth-tokens'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: { resolve: (token?: string) => void; reject: (err: any) => void }[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token || undefined)
    }
  })
  failedQueue = []
}
// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})
// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config
      if (typeof window === 'undefined') return Promise.reject(error)

      if (originalRequest._retry) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + token
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true
      try {
        const refreshToken = getRefreshToken()
        if (!refreshToken) {
          clearTokens()
          window.location.href = '/login'
          return Promise.reject(new Error('No refresh token available'))
        }
        
        const refreshRes = await apiClient.post('/auth/refresh', { refreshToken })
        const { accessToken, refreshToken: newRefresh } = refreshRes.data
        
        if (!accessToken) {
          throw new Error('No access token received from refresh')
        }
        
        setTokens({ accessToken, refreshToken: newRefresh ?? refreshToken })
        processQueue(null, accessToken)
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken
        }
        return apiClient(originalRequest)
      } catch (err: any) {
        // Clear tokens on any refresh error (invalid signature, expired, etc.)
        clearTokens()
        processQueue(err, null)
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient

