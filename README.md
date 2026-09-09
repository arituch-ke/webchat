# Webchat Inbox

A Next.js and TypeScript operator inbox for receiving LINE Official Account webhook messages and replying to individual users. Customers chat in LINE; administrators use this web application to manage those conversations.

## Requirements

- Node.js 20.9 or newer
- npm
- PostgreSQL database
- LINE Official Account with a Messaging API channel

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Environment variables

Copy `.env.example` to `.env.local`. Never commit real credentials.

- `DATABASE_URL`: PostgreSQL connection string
- `DEMO_MODE`: set to `true` only to preview sample data locally
- `LINE_CHANNEL_SECRET`: verifies webhook signatures
- `LINE_CHANNEL_ACCESS_TOKEN`: authorizes LINE Messaging API requests
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`: protect the operator inbox

The inbox and conversation APIs use HTTP Basic authentication. The LINE webhook remains public and relies on LINE signature verification instead.

## LINE webhook

Apply the SQL migrations in filename order, then configure the LINE Developers Console webhook URL as:

```text
https://<deployment-domain>/api/webhooks/line
```

The endpoint verifies `x-line-signature`, ignores unsupported event types, and deduplicates webhook redelivery using `webhookEventId`.

## Deployment checklist

1. Create a PostgreSQL database and apply the files in `db/` in filename order.
2. Import the GitHub repository into Vercel.
3. Add every variable from `.env.example` to the Vercel project. Use strong, unique admin credentials.
4. Deploy the application and copy its HTTPS domain.
5. Set the LINE Messaging API webhook URL to `https://<domain>/api/webhooks/line`.
6. Enable webhooks and webhook redelivery in the LINE Developers Console.
7. Add the LINE OA as a friend, send a text message, and confirm the user appears in the inbox.
8. Select the user in the inbox and verify a reply arrives in LINE.

Do not enable LINE's automatic greeting or auto-response during the round-trip test unless that behavior is intentionally part of the test account.

## Submission checklist

- LINE OA URL used for testing
- Deployed Webchat Inbox URL
- Public GitHub repository URL
- A clean run of lint, type checking, tests, and production build
