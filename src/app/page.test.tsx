import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  afterEach(() => {
    delete process.env.DEMO_MODE;
  });

  it("renders the inbox navigation", () => {
    process.env.DEMO_MODE = "true";
    render(<Home />);

    expect(screen.getByText("Webchat Inbox")).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "ค้นหาผู้ใช้" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /สมชาย ใจดี/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("2 ข้อความที่ยังไม่ได้อ่าน"),
    ).toHaveTextContent("2");
    expect(
      screen.getByRole("heading", { name: "เลือกบทสนทนา" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "สนทนากับ สมชาย ใจดี" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "ค้นหาผู้ใช้" }), {
      target: { value: "ไม่มีชื่อนี้" },
    });
    expect(screen.getByText("ไม่พบผู้ใช้")).toBeInTheDocument();
    expect(screen.getByText("ลองค้นหาด้วยชื่ออื่น")).toBeInTheDocument();
  });

  it("explains when no users have contacted the account", () => {
    render(<Home />);

    expect(screen.getByText("ยังไม่มีผู้ใช้")).toBeInTheDocument();
    expect(
      screen.getByText("เมื่อมีคนทัก LINE OA รายชื่อจะปรากฏที่นี่"),
    ).toBeInTheDocument();
  });
});
