import { Role } from "@prisma/client";
import { createUserAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Notice } from "@/components/notice";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AppShell user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>账号管理</h2>
          <p>第一版由管理员创建账号，社工登录后只能查看自己负责的个案。</p>
        </div>
      </div>
      <Notice error={params.error ? decodeURIComponent(params.error) : undefined} success={params.saved ? "账号已创建" : undefined} />
      <section className="admin-grid">
        <form className="form-card" action={createUserAction}>
          <h3>创建账号</h3>
          <label>
            <span>账号</span>
            <input name="username" required />
          </label>
          <label>
            <span>姓名</span>
            <input name="displayName" required />
          </label>
          <label>
            <span>初始密码</span>
            <input name="password" type="password" minLength={8} required />
          </label>
          <label>
            <span>角色</span>
            <select name="role" defaultValue={Role.WORKER}>
              <option value={Role.WORKER}>社工</option>
              <option value={Role.ADMIN}>管理员</option>
            </select>
          </label>
          <button className="primary-button" type="submit">创建账号</button>
        </form>
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>账号</th>
                <th>姓名</th>
                <th>角色</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.username}</td>
                  <td>{item.displayName}</td>
                  <td>{item.role === Role.ADMIN ? "管理员" : "社工"}</td>
                  <td>{item.status === "ACTIVE" ? "启用" : "停用"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
