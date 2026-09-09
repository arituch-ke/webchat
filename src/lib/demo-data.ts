import type { ConversationSummary } from "@/components/inbox/inbox-shell";

const now = Date.now();

export const demoConversations: ConversationSummary[] = [
  { lineUserId: "U00000000000000000000000000000001", displayName: "สมชาย ใจดี", pictureUrl: null, lastMessageAt: new Date(now - 2 * 60_000).toISOString(), latestMessage: "ขอสอบถามข้อมูลครับ", latestDirection: "inbound" },
  { lineUserId: "U00000000000000000000000000000002", displayName: "เมย์", pictureUrl: null, lastMessageAt: new Date(now - 49 * 60_000).toISOString(), latestMessage: "สวัสดีค่ะ ยินดีให้บริการ", latestDirection: "outbound", unread: true },
  { lineUserId: "U00000000000000000000000000000003", displayName: "พิพัฒน์", pictureUrl: null, lastMessageAt: new Date(now - 24 * 60 * 60_000).toISOString(), latestMessage: "มีสินค้านี้ไหมครับ", latestDirection: "inbound" },
  { lineUserId: "U00000000000000000000000000000004", displayName: "กฤษณา", pictureUrl: null, lastMessageAt: new Date(now - 3 * 24 * 60 * 60_000).toISOString(), latestMessage: "สอบถามเรื่องการจัดส่งค่ะ", latestDirection: "inbound" },
];
