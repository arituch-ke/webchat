import { render, screen } from "@testing-library/react";
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
  });
});
