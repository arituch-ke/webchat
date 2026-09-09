CREATE TYPE message_status AS ENUM ('pending', 'sent', 'failed');

ALTER TABLE messages
  ADD COLUMN status message_status NOT NULL DEFAULT 'sent',
  ADD COLUMN error_message text;
