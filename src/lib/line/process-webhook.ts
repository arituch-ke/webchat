import { messagingApi, type webhook } from "@line/bot-sdk";
import { eq } from "drizzle-orm";

import { contacts, messages, webhookEvents } from "@/db/schema";

import type { LineConfig } from "./config";

type Database = ReturnType<typeof import("@/db/client").getDatabase>;

type ProcessingDependencies = {
  database: Database;
  lineConfig: LineConfig;
};

export type WebhookProcessingResult = {
  accepted: number;
  ignored: number;
};

export async function processWebhookEvents(
  events: webhook.Event[],
  { database, lineConfig }: ProcessingDependencies,
): Promise<WebhookProcessingResult> {
  const lineClient = new messagingApi.MessagingApiClient({
    channelAccessToken: lineConfig.channelAccessToken,
  });
  let accepted = 0;
  let ignored = 0;

  for (const event of events) {
    if (
      event.type !== "message" ||
      event.message.type !== "text" ||
      !event.source ||
      event.source.type !== "user" ||
      !event.source.userId
    ) {
      ignored += 1;
      continue;
    }

    const userId = event.source.userId;
    const message = event.message;
    const [existingEvent] = await database
      .select({ eventId: webhookEvents.eventId })
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, event.webhookEventId))
      .limit(1);

    if (existingEvent) {
      ignored += 1;
      continue;
    }

    const profile = await lineClient.getProfile(userId);
    const sentAt = new Date(event.timestamp);
    const wasInserted = await database.transaction(async (transaction) => {
      const insertedEvent = await transaction
        .insert(webhookEvents)
        .values({ eventId: event.webhookEventId })
        .onConflictDoNothing()
        .returning({ eventId: webhookEvents.eventId });

      if (insertedEvent.length === 0) {
        return false;
      }

      await transaction
        .insert(contacts)
        .values({
          lineUserId: userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
          lastMessageAt: sentAt,
        })
        .onConflictDoUpdate({
          target: contacts.lineUserId,
          set: {
            displayName: profile.displayName,
            pictureUrl: profile.pictureUrl,
            lastMessageAt: sentAt,
            updatedAt: new Date(),
          },
        });

      await transaction.insert(messages).values({
        id: crypto.randomUUID(),
        lineUserId: userId,
        lineMessageId: message.id,
        direction: "inbound",
        text: message.text,
        sentAt,
      });

      return true;
    });

    if (wasInserted) {
      accepted += 1;
    } else {
      ignored += 1;
    }
  }

  return { accepted, ignored };
}
