"use client";

import { Bell, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ConversationSummary = {
  lineUserId: string;
  displayName: string;
  pictureUrl: string | null;
  lastMessageAt: string;
  latestMessage: string | null;
  latestDirection: "inbound" | "outbound" | null;
  unread?: boolean;
};

type InboxShellProps = {
  initialConversations: ConversationSummary[];
  liveMode: boolean;
};

function formatConversationTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(date);
}

function InitialAvatar({ name }: { name: string }) {
  return <span aria-hidden="true" className="initial-avatar">{name.trim().charAt(0)}</span>;
}

export function InboxShell({ initialConversations, liveMode }: InboxShellProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedUserId, setSelectedUserId] = useState(initialConversations[0]?.lineUserId ?? null);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!liveMode) return;
    const controller = new AbortController();
    fetch("/api/conversations", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load conversations");
        return (await response.json()) as { conversations: ConversationSummary[] };
      })
      .then((data) => {
        setConversations(data.conversations);
        setSelectedUserId((current) => data.conversations.some((item) => item.lineUserId === current) ? current : (data.conversations[0]?.lineUserId ?? null));
        setLoadError(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(true);
      });
    return () => controller.abort();
  }, [liveMode]);

  const visibleConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("th");
    if (!normalizedQuery) return conversations;
    return conversations.filter((conversation) => conversation.displayName.toLocaleLowerCase("th").includes(normalizedQuery));
  }, [conversations, query]);
  const selectedConversation = conversations.find((conversation) => conversation.lineUserId === selectedUserId);

  return (
    <main className="inbox-app">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-name">Webchat Inbox</span>
          <span className="connection-label"><span className="connection-dot" />เชื่อมต่อ LINE แล้ว</span>
        </div>
        <div className="operator-controls">
          <button className="icon-button" type="button" aria-label="การแจ้งเตือน"><Bell size={20} strokeWidth={1.8} /></button>
          <span className="operator-avatar">AR</span><span className="operator-name">Admin</span>
          <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" />
        </div>
      </header>

      <div className="inbox-body">
        <aside className="conversation-rail" aria-label="รายการบทสนทนา">
          <div className="search-wrap">
            <Search size={19} strokeWidth={1.8} aria-hidden="true" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาผู้ใช้" aria-label="ค้นหาผู้ใช้" />
          </div>
          {loadError ? <p className="rail-notice" role="alert">โหลดรายชื่อไม่สำเร็จ กรุณาลองใหม่</p> : null}
          <div className="conversation-list">
            {visibleConversations.map((conversation) => {
              const selected = conversation.lineUserId === selectedUserId;
              return (
                <button key={conversation.lineUserId} type="button" className="conversation-row" data-selected={selected} onClick={() => setSelectedUserId(conversation.lineUserId)} aria-pressed={selected}>
                  <InitialAvatar name={conversation.displayName} />
                  <span className="conversation-copy">
                    <span className="conversation-line"><strong>{conversation.displayName}</strong><time dateTime={conversation.lastMessageAt}>{formatConversationTime(conversation.lastMessageAt)}</time></span>
                    <span className="conversation-line preview-line"><span>{conversation.latestMessage ?? "เริ่มบทสนทนาใหม่"}</span>{conversation.unread ? <span className="unread-dot" aria-label="ยังไม่ได้อ่าน" /> : null}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {visibleConversations.length === 0 ? <p className="rail-empty">ไม่พบผู้ใช้ที่ค้นหา</p> : null}
        </aside>

        <section className="workspace" aria-label="พื้นที่สนทนา">
          {selectedConversation ? (
            <header className="chat-header">
              <InitialAvatar name={selectedConversation.displayName} />
              <div><h1>{selectedConversation.displayName}</h1><p><span className="connection-dot" />LINE user</p></div>
            </header>
          ) : (
            <div className="workspace-empty"><h1>ยังไม่มีบทสนทนา</h1><p>เมื่อมีผู้ใช้ส่งข้อความหา LINE OA รายชื่อจะปรากฏที่นี่</p></div>
          )}
          {selectedConversation ? <div className="workspace-placeholder"><p>เลือกข้อความและตอบกลับได้จากพื้นที่นี้</p></div> : null}
        </section>
      </div>
    </main>
  );
}
