import { z } from "zod";

import { listMessages } from "@/lib/conversations";

const lineUserIdSchema = z.string().regex(/^U[0-9a-f]{32}$/i);
const querySchema = z.object({
  before: z.iso.datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

type RouteParameters = {
  params: Promise<{ lineUserId: string }>;
};

export async function GET(request: Request, { params }: RouteParameters) {
  const parsedUserId = lineUserIdSchema.safeParse((await params).lineUserId);
  const url = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    before: url.searchParams.get("before") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsedUserId.success || !parsedQuery.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const items = await listMessages({
      lineUserId: parsedUserId.data,
      before: parsedQuery.data.before
        ? new Date(parsedQuery.data.before)
        : undefined,
      limit: parsedQuery.data.limit,
    });
    const nextCursor =
      items.length === parsedQuery.data.limit
        ? items[0]?.sentAt.toISOString()
        : null;

    return Response.json({ messages: items, nextCursor });
  } catch (error) {
    console.error("Failed to load messages", error);
    return Response.json({ error: "Unable to load messages" }, { status: 500 });
  }
}
