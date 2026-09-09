CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');

CREATE TABLE contacts (
  line_user_id text PRIMARY KEY,
  display_name text NOT NULL,
  picture_url text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contacts_last_message_at_idx ON contacts (last_message_at);

CREATE TABLE webhook_events (
  event_id text PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id text PRIMARY KEY,
  line_user_id text NOT NULL REFERENCES contacts (line_user_id) ON DELETE CASCADE,
  line_message_id text UNIQUE,
  direction message_direction NOT NULL,
  text text NOT NULL,
  sent_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_contact_sent_at_idx ON messages (line_user_id, sent_at);
