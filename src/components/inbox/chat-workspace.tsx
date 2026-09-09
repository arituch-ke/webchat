"use client";

import { ArrowLeft, CheckCheck, SendHorizontal } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import type { ConversationSummary } from "./inbox-shell";
import { InitialAvatar } from "./initial-avatar";

export type ChatMessage = {
  id: string;
  lineMessageId?: string | null;
  direction: "inbound" | "outbound";
  status: "pending" | "sent" | "failed";
  text: string;
  sentAt: string;
  errorMessage?: string | null;
};

type ChatWorkspaceProps = {
  conversation: ConversationSummary;
  initialMessages: ChatMessage[];
  liveMode: boolean;
  onBack: () => void;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ChatWorkspace({
  conversation,
  initialMessages,
  liveMode,
  onBack,
}: ChatWorkspaceProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(liveMode);
  const [loadError, setLoadError] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!liveMode) return;
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(
          `/api/conversations/${conversation.lineUserId}/messages`,
        );
        if (!response.ok) throw new Error("Unable to load messages");
        const data = (await response.json()) as { messages: ChatMessage[] };
        if (active) {
          setMessages(data.messages);
          setLoadError(false);
          setLoading(false);
        }
      } catch {
        if (active) {
          setLoadError(true);
          setLoading(false);
        }
      }
    };
    void load();
    const interval = window.setInterval(load, 4000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [conversation.lineUserId, initialMessages, liveMode]);

  useEffect(() => {
    if (typeof timelineRef.current?.scrollTo === "function") {
      timelineRef.current.scrollTo({
        top: timelineRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const optimisticId = `local-${crypto.randomUUID()}`;
    const optimistic: ChatMessage = {
      id: optimisticId,
      direction: "outbound",
      status: "pending",
      text,
      sentAt: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);
    setDraft("");

    if (!liveMode) {
      window.setTimeout(
        () =>
          setMessages((current) =>
            current.map((item) =>
              item.id === optimisticId ? { ...item, status: "sent" } : item,
            ),
          ),
        450,
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/conversations/${conversation.lineUserId}/messages`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text }),
        },
      );
      if (!response.ok) throw new Error("Unable to send message");
      const data = (await response.json()) as { message: ChatMessage };
      setMessages((current) =>
        current.map((item) => (item.id === optimisticId ? data.message : item)),
      );
    } catch {
      setMessages((current) =>
        current.map((item) =>
          item.id === optimisticId
            ? {
                ...item,
                status: "failed",
                errorMessage: "ส่งไม่สำเร็จ กรุณาลองอีกครั้ง",
              }
            : item,
        ),
      );
    }
  }

  return (
    <section
      className="workspace chat-workspace"
      aria-label={`สนทนากับ ${conversation.displayName}`}
    >
      <header className="chat-header">
        <button
          className="mobile-back"
          type="button"
          onClick={onBack}
          aria-label="กลับไปยังรายชื่อผู้ใช้"
        >
          <ArrowLeft size={21} />
        </button>
        <InitialAvatar
          name={conversation.displayName}
          pictureUrl={conversation.pictureUrl}
        />
        <div>
          <h1>{conversation.displayName}</h1>
          <p>
            <span className="connection-dot" />
            LINE user
          </p>
        </div>
      </header>
      <div className="message-timeline" ref={timelineRef} aria-live="polite">
        <div className="date-divider">
          <span>วันนี้</span>
        </div>
        {loading ? (
          <div className="message-loading" aria-label="กำลังโหลดข้อความ">
            <span />
            <span />
            <span />
          </div>
        ) : null}
        {loadError ? (
          <p className="message-error" role="alert">
            โหลดข้อความไม่สำเร็จ ระบบจะลองใหม่อัตโนมัติ
          </p>
        ) : null}
        {!loading && !loadError && messages.length === 0 ? (
          <div className="message-empty">
            <h2>ยังไม่มีข้อความ</h2>
            <p>เริ่มตอบกลับผู้ใช้ได้จากช่องด้านล่าง</p>
          </div>
        ) : null}
        {messages.map((message) => (
          <article
            key={message.id}
            className="message-group"
            data-direction={message.direction}
          >
            <div className="message-bubble">{message.text}</div>
            <div className="message-meta">
              <time dateTime={message.sentAt}>
                {formatMessageTime(message.sentAt)}
              </time>
              {message.direction === "outbound" && message.status === "sent" ? (
                <CheckCheck size={15} aria-label="ส่งแล้ว" />
              ) : null}
              {message.status === "pending" ? <span>กำลังส่ง</span> : null}
              {message.status === "failed" ? (
                <span className="send-failed">
                  {message.errorMessage ?? "ส่งไม่สำเร็จ"}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <form className="composer" onSubmit={submitMessage}>
        <label className="sr-only" htmlFor="message-draft">
          ข้อความตอบกลับ
        </label>
        <textarea
          id="message-draft"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="พิมพ์ข้อความ..."
          rows={1}
          maxLength={5000}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button className="send-button" type="submit" disabled={!draft.trim()}>
          <span>ส่ง</span>
          <SendHorizontal size={18} />
        </button>
      </form>
    </section>
  );
}
