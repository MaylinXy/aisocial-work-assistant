import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/cases");
  const params = await searchParams;

  return (
    <main className="login-page">
      <section className="login-visual">
        <img src="/assets/case-desk.png" alt="社工整理个案资料的办公桌场景" />
        <div>
          <span className="eyebrow">社区服务工作台</span>
          <h1>AI社工个案咨询辅助助手</h1>
          <p>注册普通社工账号后，可以新建和管理自己的个案记录。</p>
        </div>
      </section>
      <section className="login-card">
        <h2>注册社工账号</h2>
        <p>注册后默认进入普通社工权限，只能查看和维护自己负责的个案。</p>
        <Notice error={params.error ? decodeURIComponent(params.error) : undefined} />
        <form className="auth-form" action={registerAction}>
          <label>
            <span>账号</span>
            <input name="username" autoComplete="username" minLength={3} required />
          </label>
          <label>
            <span>姓名</span>
            <input name="displayName" autoComplete="name" required />
          </label>
          <label>
            <span>密码</span>
            <input name="password" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <label>
            <span>确认密码</span>
            <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <button className="primary-button" type="submit">创建账号</button>
        </form>
        <p className="auth-switch">
          已有账号？<a href="/login">返回登录</a>
        </p>
      </section>
    </main>
  );
}
