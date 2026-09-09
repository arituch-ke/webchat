import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-intro" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="login-mark" aria-hidden="true">
            W
          </span>
          <span>Webchat Inbox</span>
        </div>
        <div className="login-heading">
          <h1 id="login-title">ยินดีต้อนรับกลับ</h1>
          <p>
            เข้าสู่ระบบเพื่อดูและตอบข้อความจากลูกค้าบน LINE Official Account
          </p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="login-security">
          สำหรับผู้ดูแลระบบเท่านั้น · การเข้าสู่ระบบจะหมดอายุภายใน 8 ชั่วโมง
        </p>
      </section>
      <aside className="login-scene" aria-hidden="true">
        <div className="scene-window">
          <span className="scene-status">
            <i />
            พร้อมรับข้อความ
          </span>
          <div className="scene-message scene-message-in">
            สวัสดีครับ ขอสอบถามข้อมูลหน่อยครับ
          </div>
          <div className="scene-message scene-message-out">
            ยินดีค่ะ กำลังตรวจสอบให้ทันที
          </div>
          <div className="scene-composer">
            <span /> <b>ส่ง</b>
          </div>
        </div>
        <p>
          ทุกบทสนทนา
          <br />
          อยู่ในที่เดียว
        </p>
      </aside>
    </main>
  );
}
