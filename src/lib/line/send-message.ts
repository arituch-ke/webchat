import { messagingApi } from "@line/bot-sdk";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { messages } from "@/db/schema";

import { getLineConfig } from "./config";

export async function sendTextMessage(lineUserId: string, text: string) {
  const database = getDatabase();
  const messageId = crypto.randomUUID();
  const sentAt = new Date();

  await database.insert(messages).values({
    id: messageId,
    lineUserId,
    direction: "outbound",
    status: "pending",
    text,
    sentAt,
  });

  try {
    const lineConfig = getLineConfig();
    const client = new messagingApi.MessagingApiClient({
      channelAccessToken: lineConfig.channelAccessToken,
    });
    const result = await client.pushMessage(
      {
        to: lineUserId,
        messages: [{ type: "text", text }],
      },
      messageId,
    );

    await database
      .update(messages)
      .set({
        status: "sent",
        lineMessageId: result.sentMessages[0]?.id,
      })
      .where(eq(messages.id, messageId));

    return {
      id: messageId,
      lineUserId,
      direction: "outbound" as const,
      status: "sent" as const,
      text,
      sentAt,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown LINE API error";

    await database
      .update(messages)
      .set({ status: "failed", errorMessage })
      .where(eq(messages.id, messageId));

    throw error;
  }
}
