import internalApi from './internalApiClient'

export type AdmissionDraft = {
  // Keep minimal for now; sections can extend this later
  personalInfo?: {
    fullName?: string
    ppsNumber?: string
    dateOfBirth?: string
    phone?: string
    address?: string
  }
  medicalInfo?: Record<string, unknown>
  employment?: Record<string, unknown>
  contraband?: {
    items?: string[]
    notes?: string
  }
  photoTempId?: string
  status?: 'draft'
}

export type SaveDraftResponse = {
  id: string
}

const AdmissionsService = {
  async saveDraft(draft: AdmissionDraft): Promise<SaveDraftResponse> {
    const { data } = await internalApi.post<SaveDraftResponse>('/api/admissions/drafts', {
      status: 'draft',
      ...draft,
    })
    return data
  },

  async updateDraft(id: string, draft: AdmissionDraft): Promise<SaveDraftResponse> {
    const { data } = await internalApi.put<SaveDraftResponse>(`/api/admissions/drafts/${id}`, draft)
    return data
  },
}

export default AdmissionsService
