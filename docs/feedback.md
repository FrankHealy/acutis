# Pilot Feedback

The web app includes a small floating Feedback button for authenticated users.
Submissions are sent to the server-side `POST /api/feedback` route, which creates
a GitHub issue in the configured feedback repository.

## Configuration

Set these values for the Centre web process in `acutis.centre/acutis.centre.web`:

```env
NEXT_PUBLIC_FEEDBACK_ENABLED=true
Feedback__Enabled=true
Feedback__GitHubOwner=FrankHealy
Feedback__GitHubRepo=acutis-feedback
Feedback__GitHubToken=github_pat_or_fine_grained_token
```

`NEXT_PUBLIC_FEEDBACK_ENABLED` only controls whether the browser shows the button.
`Feedback__Enabled` is enforced by the server endpoint.

## GitHub Token

Create a fine-grained GitHub token for `FrankHealy/acutis-feedback` with:

- Repository access: `FrankHealy/acutis-feedback`
- Permissions: Issues read/write

Store that token as `Feedback__GitHubToken` on the web server/container. Do not
prefix it with `NEXT_PUBLIC_`; it must stay server-side.

## Screenshot Capture

The browser attempts to capture the current page with `html2canvas`. If browser
security, cross-origin assets, or payload size make that unreliable, the feedback
still submits without a screenshot.

## Rate Limiting

The endpoint allows 3 submissions per user/IP every 10 minutes. The client also
blocks accidental repeat submits for 60 seconds.

## Required npm Packages

```powershell
cd acutis.centre/acutis.centre.web
npm install html2canvas
```
