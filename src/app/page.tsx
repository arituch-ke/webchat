import { InboxShell } from "@/components/inbox/inbox-shell";
import { demoConversations } from "@/lib/demo-data";

export default function Home() {
  const liveMode = Boolean(process.env.DATABASE_URL);
  return <InboxShell initialConversations={liveMode ? [] : demoConversations} liveMode={liveMode} />;
}
