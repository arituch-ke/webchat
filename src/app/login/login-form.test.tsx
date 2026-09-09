import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "./login-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

describe("LoginForm", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows field errors before submitting an empty form", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "เข้าสู่ระบบ" }));

    expect(screen.getByLabelText("ชื่อผู้ใช้")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("รหัสผ่าน")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("กรุณากรอกชื่อผู้ใช้")).toBeInTheDocument();
    expect(screen.getByText("กรุณากรอกรหัสผ่าน")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
