"use client";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { SubmitEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      if (!response.ok) {
        setError(
          response.status === 503
            ? "ระบบยังไม่ได้ตั้งค่าบัญชีผู้ดูแล"
            : "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="username">ชื่อผู้ใช้</label>
      <div className="login-field">
        <UserRound size={19} aria-hidden="true" />
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="กรอกชื่อผู้ใช้"
          required
          autoFocus
        />
      </div>

      <label htmlFor="password">รหัสผ่าน</label>
      <div className="login-field">
        <LockKeyhole size={19} aria-hidden="true" />
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="กรอกรหัสผ่าน"
          required
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        >
          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>

      <p className="login-error" role="alert" aria-live="polite">
        {error}
      </p>
      <button className="login-submit" type="submit" disabled={submitting}>
        {submitting ? <LoaderCircle className="spin" size={19} /> : null}
        {submitting ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
