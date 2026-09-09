# Webchat Inbox

A Next.js and TypeScript shared inbox for receiving LINE Official Account webhook messages and replying to individual users.

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
- `LINE_CHANNEL_SECRET`: verifies webhook signatures
- `LINE_CHANNEL_ACCESS_TOKEN`: authorizes LINE Messaging API requests
- `ADMIN_USERNAME` and `ADMIN_PASSWORD`: protect the operator inbox

Implementation and deployment instructions will be added with their corresponding feature branches.
