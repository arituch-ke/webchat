ALTER TABLE contacts
  ADD COLUMN unread_count integer NOT NULL DEFAULT 0,
  ADD CONSTRAINT contacts_unread_count_check CHECK (unread_count >= 0);
