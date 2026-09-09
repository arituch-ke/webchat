import { z } from "zod";

import { markConversationRead } from "@/lib/conversations";

const lineUserIdSchema = z.string().regex(/^U[0-9a-f]{32}$/i);

type RouteParameters = {
  params: Promise<{ lineUserId: string }>;
};

export async function PATCH(_request: Request, { params }: RouteParameters) {
  const parsedUserId = lineUserIdSchema.safeParse((await params).lineUserId);
  if (!parsedUserId.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const updated = await markConversationRead(parsedUserId.data);
    return updated
      ? Response.json({ ok: true })
      : Response.json({ error: "Conversation not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to mark conversation as read", error);
    return Response.json(
      { error: "Unable to mark conversation as read" },
      { status: 500 },
    );
  }
}
