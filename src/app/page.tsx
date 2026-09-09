import { InboxShell } from "@/components/inbox/inbox-shell";
import { demoConversations, demoMessages } from "@/lib/demo-data";
import { getConnectionState } from "@/lib/runtime-mode";

export default function Home() {
  const connectionState = getConnectionState(process.env);
  const demoMode = connectionState === "demo";

  return (
    <InboxShell
      connectionState={connectionState}
      initialConversations={demoMode ? demoConversations : []}
      initialMessages={demoMode ? demoMessages : {}}
      liveMode={connectionState === "ready"}
    />
  );
}
