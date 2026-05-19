import Link from "next/link";
import { Role } from "@prisma/client";
import { logoutAction } from "@/app/actions";
import type { CurrentUser } from "@/lib/auth";

export function AppShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <aside className="nav-panel">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true" />
          <div>
            <h1>AI社工个案咨询辅助助手</h1>
            <p>面向一线社工与社区服务人员的智能工作台</p>
          </div>
        </div>
        <nav className="nav-list" aria-label="主导航">
          <Link href="/cases">个案工作台</Link>
          <Link href="/cases/new">新建个案</Link>
          {user.role === Role.ADMIN ? (
            <>
              <Link href="/admin/resources">资源库维护</Link>
              <Link href="/admin/users">账号管理</Link>
            </>
          ) : null}
        </nav>
        <div className="user-panel">
          <div>
            <strong>{user.displayName}</strong>
            <span>{user.role === Role.ADMIN ? "管理员" : "社工"}</span>
          </div>
          <form action={logoutAction}>
            <button className="secondary-button" type="submit">退出</button>
          </form>
        </div>
      </aside>
      <main className="main-workspace">{children}</main>
    </div>
  );
}
