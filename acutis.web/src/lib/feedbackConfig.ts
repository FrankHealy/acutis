export type FeedbackConfig = {
  enabled: boolean;
  githubOwner: string;
  githubRepo: string;
  githubToken?: string;
};

const readBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

export const getFeedbackConfig = (): FeedbackConfig => ({
  enabled: readBoolean(process.env.Feedback__Enabled, true),
  githubOwner: process.env.Feedback__GitHubOwner ?? "FrankHealy",
  githubRepo: process.env.Feedback__GitHubRepo ?? "acutis-feedback",
  githubToken: process.env.Feedback__GitHubToken,
});
