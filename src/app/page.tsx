import { InboxShell } from "@/components/inbox/inbox-shell";
import { demoConversations, demoMessages } from "@/lib/demo-data";

export default function Home() {
  const liveMode = Boolean(process.env.DATABASE_URL);
  return <InboxShell initialConversations={liveMode ? [] : demoConversations} initialMessages={liveMode ? {} : demoMessages} liveMode={liveMode} />;
}
