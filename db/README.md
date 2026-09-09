# Database migrations

Apply these PostgreSQL migrations exactly once and in filename order:

1. `0001_initial.sql`
2. `0002_message_delivery_status.sql`

The migrations create contacts, webhook event deduplication, inbound/outbound messages, delivery status, and indexes used by the inbox queries.

For a fresh database, run the files through the provider's SQL editor or a PostgreSQL client. Keep production credentials outside the repository.
