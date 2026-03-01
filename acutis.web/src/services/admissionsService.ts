type SaveDraftRequest = Record<string, unknown>;

type SaveDraftResponse = {
  id: string;
};

const AdmissionsService = {
  async saveDraft(_payload: SaveDraftRequest): Promise<SaveDraftResponse> {
    return {
      id: `draft-${Date.now()}`,
    };
  },
};

export default AdmissionsService;
