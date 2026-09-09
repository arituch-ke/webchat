import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const messageDirection = pgEnum("message_direction", [
  "inbound",
  "outbound",
]);
export const messageStatus = pgEnum("message_status", [
  "pending",
  "sent",
  "failed",
]);

export const contacts = pgTable(
  "contacts",
  {
    lineUserId: text("line_user_id").primaryKey(),
    displayName: text("display_name").notNull(),
    pictureUrl: text("picture_url"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("contacts_last_message_at_idx").on(table.lastMessageAt)],
);

export const webhookEvents = pgTable("webhook_events", {
  eventId: text("event_id").primaryKey(),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    lineUserId: text("line_user_id")
      .notNull()
      .references(() => contacts.lineUserId, { onDelete: "cascade" }),
    lineMessageId: text("line_message_id").unique(),
    direction: messageDirection("direction").notNull(),
    status: messageStatus("status").notNull().default("sent"),
    text: text("text").notNull(),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_contact_sent_at_idx").on(table.lineUserId, table.sentAt),
  ],
);
