import axios from 'axios'

// For calling Next.js internal API routes (same-origin)
const internalApi = axios.create({
  // No baseURL so that relative paths like '/api/...' stay on the Next server
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

export default internalApi

