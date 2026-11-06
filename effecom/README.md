# Effecom

A Uganda-focused public marketing website for Effecom, a Nexus Care initiative
exploring more accessible healthcare communication for deaf and
hard-of-hearing people.

## Development

```bash
npm install
npm run dev
```

The site uses Next.js App Router, TypeScript, Tailwind CSS, and the project's
shadcn UI components.

## Backend-powered tools

Speech-to-text, text-to-speech, translation, and account pages call the Django
API directly.
The API base URL defaults to `http://localhost:8000`; set
`NEXT_PUBLIC_EFFECOM_API_URL` in the frontend environment when the backend
runs at a different origin. Configure the backend's `CORS_ALLOWED_ORIGINS`
with the frontend origin and follow the backend [setup guide](../../effecom-backend/effecom/guide.md)
to migrate the database, seed translation languages, and configure Sunbird.
Keep Sunbird credentials on the backend; the frontend only receives the
backend URL.

Speech-to-text accepts WAV uploads in configured languages. Video captions are
not implemented by the backend and remain marked as in development.

## Pilot registration integration

The interest form is **not connected by default**. When no endpoint is
configured, the site explains that details will not be submitted or stored,
and the API route returns `503` without forwarding any information.

To connect a registration service:

1. Add `EFFECOM_REGISTRATION_ENDPOINT` to the server environment before
   building or starting the site. It must be an HTTPS URL (HTTP is allowed
   only for `localhost` during development).
2. The endpoint must accept a JSON `POST` with `name`,
   `contact_method` (`email` or `phone`), `contact`, optional `district`,
   optional `communication_preference`, and `consent`.
3. If the endpoint requires a bearer token, set
   `EFFECOM_REGISTRATION_API_KEY` as a server-only environment variable. Do
   not prefix it with `NEXT_PUBLIC_`.
4. Confirm the receiving service's data handling, retention, access controls,
   and failure behaviour. The website considers any 2xx response a received
   registration and does not store submitted details itself.

The form submits to the site's `/api/pilot-interest` route. That server route
validates the fields and forwards only the form data to the configured
endpoint. It does not write details to local storage, a database, or logs.
Submissions time out after 10 seconds. Provider errors are reported as
failures, not as successful registrations.

## Owner review before launch

- Verify Sunbird configuration and test each provider-backed feature before
  launch; the product page status labels do not imply that provider credentials
  are configured in production.
- Set a real privacy contact channel in `lib/site-content.ts` and publish an
  operational way for people to ask about, correct, or request removal of
  information before connecting registrations.
- Have the draft privacy notice reviewed for the actual registration
  provider, retention period, and applicable requirements.
- Confirm the content, pilot process, and any future imagery with the
  community. The hero visual is an illustration of a concept, not a working
  product or a Uganda Sign Language demonstration.
- Add the production domain to metadata only once it is confirmed. No
  canonical URL or sitemap domain is currently configured.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
