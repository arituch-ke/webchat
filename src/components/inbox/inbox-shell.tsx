"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ChatWorkspace, type ChatMessage } from "./chat-workspace";
import { InitialAvatar } from "./initial-avatar";
import type { ConnectionState } from "@/lib/runtime-mode";

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
  connectionState: ConnectionState;
  initialConversations: ConversationSummary[];
  liveMode: boolean;
  initialMessages: Record<string, ChatMessage[]>;
};

function formatConversationTime(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
  }).format(date);
}

const connectionCopy: Record<ConnectionState, string> = {
  demo: "ข้อมูลตัวอย่าง",
  ready: "ตั้งค่า LINE แล้ว",
  misconfigured: "ตั้งค่าระบบไม่ครบ",
};

export function InboxShell({
  connectionState,
  initialConversations,
  initialMessages,
  liveMode,
}: InboxShellProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    initialConversations[0]?.lineUserId ?? null,
  );
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!liveMode) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch("/api/conversations", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load conversations");
        const data = (await response.json()) as {
          conversations: ConversationSummary[];
        };
        setConversations(data.conversations);
        setSelectedUserId((current) =>
          data.conversations.some((item) => item.lineUserId === current)
            ? current
            : (data.conversations[0]?.lineUserId ?? null),
        );
        setLoadError(false);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setLoadError(true);
      }
    };
    void load();
    const interval = window.setInterval(load, 5000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [liveMode]);

  const visibleConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("th");
    if (!normalizedQuery) return conversations;
    return conversations.filter((conversation) =>
      conversation.displayName
        .toLocaleLowerCase("th")
        .includes(normalizedQuery),
    );
  }, [conversations, query]);
  const selectedConversation = conversations.find(
    (conversation) => conversation.lineUserId === selectedUserId,
  );

  return (
    <main className="inbox-app">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-name">Webchat Inbox</span>
          <span className="connection-label" data-state={connectionState}>
            <span className="connection-dot" />
            {connectionCopy[connectionState]}
          </span>
        </div>
        <div className="operator-controls">
          <span className="operator-avatar">AR</span>
          <span className="operator-name">Admin</span>
        </div>
      </header>

      <div
        className="inbox-body"
        data-chat-open={Boolean(selectedConversation)}
      >
        <aside className="conversation-rail" aria-label="รายการบทสนทนา">
          <div className="search-wrap">
            <Search size={19} strokeWidth={1.8} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาผู้ใช้"
              aria-label="ค้นหาผู้ใช้"
            />
          </div>
          {loadError ? (
            <p className="rail-notice" role="alert">
              โหลดรายชื่อไม่สำเร็จ กรุณาลองใหม่
            </p>
          ) : null}
          <div className="conversation-list">
            {visibleConversations.map((conversation) => {
              const selected = conversation.lineUserId === selectedUserId;
              return (
                <button
                  key={conversation.lineUserId}
                  type="button"
                  className="conversation-row"
                  data-selected={selected}
                  onClick={() => setSelectedUserId(conversation.lineUserId)}
                  aria-pressed={selected}
                >
                  <InitialAvatar
                    name={conversation.displayName}
                    pictureUrl={conversation.pictureUrl}
                  />
                  <span className="conversation-copy">
                    <span className="conversation-line">
                      <strong>{conversation.displayName}</strong>
                      <time dateTime={conversation.lastMessageAt}>
                        {formatConversationTime(conversation.lastMessageAt)}
                      </time>
                    </span>
                    <span className="conversation-line preview-line">
                      <span>
                        {conversation.latestMessage ?? "เริ่มบทสนทนาใหม่"}
                      </span>
                      {conversation.unread ? (
                        <span
                          className="unread-dot"
                          aria-label="ยังไม่ได้อ่าน"
                        />
                      ) : null}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {visibleConversations.length === 0 ? (
            <p className="rail-empty">ไม่พบผู้ใช้ที่ค้นหา</p>
          ) : null}
        </aside>

        {selectedConversation ? (
          <ChatWorkspace
            key={selectedConversation.lineUserId}
            conversation={selectedConversation}
            initialMessages={
              initialMessages[selectedConversation.lineUserId] ?? []
            }
            liveMode={liveMode}
            onBack={() => setSelectedUserId(null)}
          />
        ) : (
          <section
            className="workspace workspace-empty"
            aria-label="พื้นที่สนทนา"
          >
            <div>
              <h1>
                {connectionState === "misconfigured"
                  ? "ตั้งค่าระบบไม่ครบ"
                  : "ยังไม่มีบทสนทนา"}
              </h1>
              <p>
                {connectionState === "misconfigured"
                  ? "กรอกค่าฐานข้อมูลและ LINE Messaging API ในไฟล์ environment แล้วเปิดระบบใหม่"
                  : "เมื่อมีผู้ใช้ส่งข้อความหา LINE OA รายชื่อจะปรากฏที่นี่"}
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
