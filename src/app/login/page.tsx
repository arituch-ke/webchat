import Image from "next/image";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-intro" aria-labelledby="login-title">
        <div className="login-heading">
          <div className="login-title">
            <Image
              className="login-logo"
              src="/webchat-logo.png"
              alt=""
              width={48}
              height={48}
              priority
            />
            <h1 id="login-title">Webchat Inbox</h1>
          </div>
          <p>
            เข้าสู่ระบบเพื่อดูและตอบข้อความจากลูกค้าบน LINE Official Account
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
