"use client";

import { LogOut, MessageCircle, Search, SearchX } from "lucide-react";
import Image from "next/image";
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
  unreadCount: number;
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
  ready: "Connected LINE OA",
  misconfigured: "ตั้งค่าระบบไม่ครบ",
};

export function InboxShell({
  connectionState,
  initialConversations,
  initialMessages,
  liveMode,
}: InboxShellProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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
            : null,
        );
        setLoadError(false);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setLoadError(true);
      }
    };
    void load();
    const interval = window.setInterval(load, 1000);
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

  useEffect(() => {
    if (!liveMode || !selectedConversation?.unreadCount) return;

    const lineUserId = selectedConversation.lineUserId;
    void fetch(`/api/conversations/${lineUserId}`, { method: "PATCH" }).then(
      (response) => {
        if (!response.ok) {
          setLoadError(true);
          return;
        }
        setConversations((current) =>
          current.map((conversation) =>
            conversation.lineUserId === lineUserId
              ? { ...conversation, unreadCount: 0 }
              : conversation,
          ),
        );
      },
      () => setLoadError(true),
    );
  }, [liveMode, selectedConversation]);

  return (
    <main className="inbox-app">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-identity">
            <Image
              className="brand-logo"
              src="/webchat-logo.png"
              alt=""
              width={36}
              height={36}
              priority
            />
            <span className="brand-name">Webchat Inbox</span>
          </span>
          <span className="connection-label" data-state={connectionState}>
            <span className="connection-dot" />
            {connectionCopy[connectionState]}
          </span>
        </div>
        <div className="operator-controls">
          <span className="operator-name">Admin</span>
          <form action="/api/auth/logout" method="post">
            <button
              className="logout-button"
              type="submit"
              aria-label="ออกจากระบบ"
            >
              <LogOut size={18} />
              <span>ออกจากระบบ</span>
            </button>
          </form>
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
            {visibleConversations.length > 0 ? (
              visibleConversations.map((conversation) => {
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
                        {conversation.unreadCount > 0 ? (
                          <span
                            className="unread-count"
                            aria-label={`${conversation.unreadCount} ข้อความที่ยังไม่ได้อ่าน`}
                          >
                            {conversation.unreadCount > 99
                              ? "99+"
                              : conversation.unreadCount}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rail-empty" role="status">
                {query.trim() ? (
                  <>
                    <SearchX size={26} aria-hidden="true" />
                    <strong>ไม่พบผู้ใช้</strong>
                    <span>ลองค้นหาด้วยชื่ออื่น</span>
                  </>
                ) : (
                  <>
                    <MessageCircle size={26} aria-hidden="true" />
                    <strong>ยังไม่มีผู้ใช้</strong>
                    <span>เมื่อมีคนทัก LINE OA รายชื่อจะปรากฏที่นี่</span>
                  </>
                )}
              </div>
            )}
          </div>
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
                  : conversations.length > 0
                    ? "เลือกบทสนทนา"
                    : "ยังไม่มีบทสนทนา"}
              </h1>
              <p>
                {connectionState === "misconfigured"
                  ? "กรอกค่าฐานข้อมูลและ LINE Messaging API ในไฟล์ environment แล้วเปิดระบบใหม่"
                  : conversations.length > 0
                    ? "เลือกผู้ใช้จากรายการเพื่อดูและตอบข้อความ"
                    : "เมื่อมีผู้ใช้ส่งข้อความหา LINE OA รายชื่อจะปรากฏที่นี่"}
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
