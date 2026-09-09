import { listConversations } from "@/lib/conversations";

export async function GET() {
  try {
    const conversations = await listConversations();
    return Response.json({ conversations });
  } catch (error) {
    console.error("Failed to load conversations", error);
    return Response.json({ error: "Unable to load conversations" }, { status: 500 });
  }
}
