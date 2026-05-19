import Link from "next/link";
import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { Notice } from "@/components/notice";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { riskLabel } from "@/lib/validation";

export default async function CasesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; saved?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const q = params.q?.trim();

  const cases = await prisma.caseRecord.findMany({
    where: {
      ...(user.role === Role.WORKER ? { workerId: user.id } : {}),
      ...(q
        ? {
            OR: [
              { clientName: { contains: q, mode: "insensitive" } },
              { problemType: { contains: q, mode: "insensitive" } },
              { needs: { contains: q, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: { worker: { select: { displayName: true } }, generations: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <AppShell user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Case Workspace</span>
          <h2>个案工作台</h2>
          <p>查看历史个案，继续编辑，并生成服务建议和报告。</p>
        </div>
        <Link className="primary-button" href="/cases/new">新建个案</Link>
      </div>
      <Notice
        error={params.error ? decodeURIComponent(params.error) : undefined}
        success={params.saved ? "操作已保存" : undefined}
      />
      <form className="search-bar">
        <input name="q" defaultValue={q} placeholder="搜索姓名/编号、问题类型或诉求" />
        <button className="secondary-button" type="submit">搜索</button>
      </form>
      <section className="case-list">
        {cases.length ? cases.map((caseRecord) => (
          <Link className="case-row" href={`/cases/${caseRecord.id}`} key={caseRecord.id}>
            <div>
              <strong>{caseRecord.clientName}</strong>
              <span>{caseRecord.problemType} · {riskLabel(caseRecord.riskLevel)}</span>
            </div>
            <div>
              <span>{caseRecord.generations.length ? "已生成报告" : "待生成"}</span>
              <small>{user.role === Role.ADMIN ? `负责人：${caseRecord.worker.displayName}` : caseRecord.status}</small>
            </div>
          </Link>
        )) : (
          <div className="empty-card">
            <img src="/assets/case-desk.png" alt="社工整理个案资料的办公桌场景" />
            <h3>还没有个案记录</h3>
            <p>从新建个案开始，保存资料后即可调用 AI 生成辅助内容。</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
