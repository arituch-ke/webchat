import { validateSignature, type webhook } from "@line/bot-sdk";
import { z } from "zod";

import { getDatabase } from "@/db/client";
import { getLineConfig } from "@/lib/line/config";
import { processWebhookEvents } from "@/lib/line/process-webhook";

const webhookBodySchema = z.object({
  events: z.array(z.unknown()),
});

export async function POST(request: Request) {
  const signature = request.headers.get("x-line-signature");
  const body = await request.text();
  const lineConfig = getLineConfig();

  if (!signature || !validateSignature(body, lineConfig.channelSecret, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let events: webhook.Event[];

  try {
    const json: unknown = JSON.parse(body);
    const validated = webhookBodySchema.parse(json);
    events = validated.events as webhook.Event[];
  } catch {
    return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  try {
    const result = await processWebhookEvents(events, {
      database: getDatabase(),
      lineConfig,
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("Failed to process LINE webhook", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
