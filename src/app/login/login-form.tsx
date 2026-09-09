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
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
  });

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const validationErrors = {
      username: username ? "" : "กรุณากรอกชื่อผู้ใช้",
      password: password ? "" : "กรุณากรอกรหัสผ่าน",
    };
    setFieldErrors(validationErrors);
    if (validationErrors.username || validationErrors.password) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username,
          password,
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
    <form className="login-form" onSubmit={submit} noValidate>
      <label htmlFor="username">ชื่อผู้ใช้</label>
      <div className="login-field" data-invalid={Boolean(fieldErrors.username)}>
        <UserRound size={19} aria-hidden="true" />
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="กรอกชื่อผู้ใช้"
          aria-invalid={Boolean(fieldErrors.username)}
          aria-describedby={fieldErrors.username ? "username-error" : undefined}
          onChange={() =>
            setFieldErrors((current) => ({ ...current, username: "" }))
          }
          required
          autoFocus
        />
      </div>
      {fieldErrors.username ? (
        <p className="field-error" id="username-error" role="alert">
          {fieldErrors.username}
        </p>
      ) : null}

      <label htmlFor="password">รหัสผ่าน</label>
      <div className="login-field" data-invalid={Boolean(fieldErrors.password)}>
        <LockKeyhole size={19} aria-hidden="true" />
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="กรอกรหัสผ่าน"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          onChange={() =>
            setFieldErrors((current) => ({ ...current, password: "" }))
          }
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
      {fieldErrors.password ? (
        <p className="field-error" id="password-error" role="alert">
          {fieldErrors.password}
        </p>
      ) : null}

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
