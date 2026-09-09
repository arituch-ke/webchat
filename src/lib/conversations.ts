import { and, desc, eq, lt } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { contacts, messages } from "@/db/schema";

export async function listConversations() {
  const database = getDatabase();
  const latestMessage = database
    .selectDistinctOn([messages.lineUserId], {
      lineUserId: messages.lineUserId,
      text: messages.text,
      direction: messages.direction,
      sentAt: messages.sentAt,
    })
    .from(messages)
    .orderBy(messages.lineUserId, desc(messages.sentAt))
    .as("latest_message");

  return database
    .select({
      lineUserId: contacts.lineUserId,
      displayName: contacts.displayName,
      pictureUrl: contacts.pictureUrl,
      lastMessageAt: contacts.lastMessageAt,
      latestMessage: latestMessage.text,
      latestDirection: latestMessage.direction,
    })
    .from(contacts)
    .leftJoin(latestMessage, eq(contacts.lineUserId, latestMessage.lineUserId))
    .orderBy(desc(contacts.lastMessageAt));
}

type ListMessagesOptions = {
  lineUserId: string;
  before?: Date;
  limit: number;
};

export async function listMessages({
  lineUserId,
  before,
  limit,
}: ListMessagesOptions) {
  const filters = before
    ? and(eq(messages.lineUserId, lineUserId), lt(messages.sentAt, before))
    : eq(messages.lineUserId, lineUserId);

  const rows = await getDatabase()
    .select({
      id: messages.id,
      lineMessageId: messages.lineMessageId,
      direction: messages.direction,
      text: messages.text,
      sentAt: messages.sentAt,
    })
    .from(messages)
    .where(filters)
    .orderBy(desc(messages.sentAt))
    .limit(limit);

  return rows.reverse();
}
