import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Optionally adjust if backend is slow
  timeout: 15000,
})

axiosRetry(api, {
  retries: 3,
  retryDelay: exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors and 5xx
    return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error)
  },
  shouldResetTimeout: true,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Re-throw with a normalized message
    const message = err?.response?.data?.message || err.message || 'Request failed'
    return Promise.reject(new Error(message))
  },
)

export default api

