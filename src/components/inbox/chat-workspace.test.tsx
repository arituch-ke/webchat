import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatWorkspace, type ChatMessage } from "./chat-workspace";

const conversation = {
  lineUserId: "U0123456789abcdef0123456789abcdef",
  displayName: "สมชาย ใจดี",
  pictureUrl: null,
  lastMessageAt: "2026-09-10T00:00:00.000Z",
  latestMessage: "สวัสดี",
  latestDirection: "inbound" as const,
  unreadCount: 0,
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("ChatWorkspace", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("keeps an optimistic message when an older poll finishes", async () => {
    const poll = deferred<Response>();
    const send = deferred<Response>();
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
        init?.method === "POST" ? send.promise : poll.promise,
      ),
    );

    render(
      <ChatWorkspace
        conversation={conversation}
        initialMessages={[]}
        liveMode
        onBack={() => undefined}
      />,
    );

    fireEvent.change(screen.getByLabelText("ข้อความตอบกลับ"), {
      target: { value: "กำลังตรวจสอบให้ครับ" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ส่ง" }));

    expect(screen.getByText("กำลังตรวจสอบให้ครับ")).toBeInTheDocument();
    expect(screen.getByText("กำลังส่ง")).toBeInTheDocument();

    await act(async () => {
      poll.resolve({
        ok: true,
        json: async () => ({ messages: [] }),
      } as Response);
      await poll.promise;
    });

    expect(screen.getByText("กำลังตรวจสอบให้ครับ")).toBeInTheDocument();

    const sentMessage: ChatMessage = {
      id: "server-message",
      direction: "outbound",
      status: "sent",
      text: "กำลังตรวจสอบให้ครับ",
      sentAt: "2026-09-10T00:01:00.000Z",
    };
    await act(async () => {
      send.resolve({
        ok: true,
        json: async () => ({ message: sentMessage }),
      } as Response);
      await send.promise;
    });

    expect(screen.getByText("กำลังตรวจสอบให้ครับ")).toBeInTheDocument();
    expect(screen.queryByText("กำลังส่ง")).not.toBeInTheDocument();
  });
});
