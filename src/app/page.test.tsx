import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("renders the inbox navigation", () => {
    render(<Home />);

    expect(
      screen.getByText("Webchat Inbox"),
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "ค้นหาผู้ใช้" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /สมชาย ใจดี/ })).toBeInTheDocument();
  });
});
