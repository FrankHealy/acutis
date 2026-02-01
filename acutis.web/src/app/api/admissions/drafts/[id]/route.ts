import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

const backendBaseURL = process.env.ACUTIS_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const backend = axios.create({
  baseURL: backendBaseURL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
})

axiosRetry(backend, {
  retries: 3,
  retryDelay: exponentialDelay,
  retryCondition: (error) => axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error),
  shouldResetTimeout: true,
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const id = params.id
    const { data, status } = await backend.put(`/admissions/drafts/${id}`, body)
    return NextResponse.json(data, { status: status || 200 })
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Failed to update draft'
    const status = err?.response?.status || 502
    return NextResponse.json({ message }, { status })
  }
}

