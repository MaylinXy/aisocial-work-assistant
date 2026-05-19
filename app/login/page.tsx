import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage({
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
          <p>帮助一线社工整理个案信息、生成服务建议、匹配社区资源，并输出可编辑的文书草稿。</p>
        </div>
      </section>
      <section className="login-card">
        <h2>登录</h2>
        <p>请输入管理员或社工账号进入系统。</p>
        <Notice error={params.error ? decodeURIComponent(params.error) : undefined} />
        <form action={loginAction}>
          <label>
            <span>账号</span>
            <input name="username" autoComplete="username" required />
          </label>
          <label>
            <span>密码</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="primary-button" type="submit">进入工作台</button>
        </form>
      </section>
    </main>
  );
}
