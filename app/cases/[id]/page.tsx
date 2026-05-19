import Link from "next/link";
import { generateCaseAction, updateCaseAction } from "@/app/actions";
import { AiOutputView } from "@/components/ai-output";
import { AppShell } from "@/components/app-shell";
import { CaseForm } from "@/components/case-form";
import { Notice } from "@/components/notice";
import { canAccessCase, requireUser } from "@/lib/auth";
import { aiOutputSchema } from "@/lib/prompt";
import { prisma } from "@/lib/prisma";
import { riskLabel } from "@/lib/validation";

export default async function CaseDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; generated?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const caseRecord = await prisma.caseRecord.findUnique({
    where: { id },
    include: {
      worker: { select: { displayName: true } },
      generations: { take: 1, orderBy: { createdAt: "desc" } }
    }
  });

  if (!caseRecord || !canAccessCase(user, caseRecord.workerId)) {
    return (
      <AppShell user={user}>
        <div className="empty-card">
          <h2>未找到个案</h2>
          <p>该个案不存在，或当前账号没有访问权限。</p>
          <Link className="primary-button" href="/cases">返回列表</Link>
        </div>
      </AppShell>
    );
  }

  const latest = caseRecord.generations[0];
  const output = latest ? aiOutputSchema.parse(latest.output) : null;

  return (
    <AppShell user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Case Detail</span>
          <h2>{caseRecord.clientName}</h2>
          <p>{caseRecord.problemType} · {riskLabel(caseRecord.riskLevel)} · 负责人：{caseRecord.worker.displayName}</p>
        </div>
        <div className="button-row-inline">
          <form action={generateCaseAction}>
            <input type="hidden" name="id" value={caseRecord.id} />
            <button className="primary-button" type="submit">生成 AI 辅助内容</button>
          </form>
          <Link className="secondary-button" href={`/api/cases/${caseRecord.id}/export/docx`}>导出 Word</Link>
          <Link className="secondary-button" href={`/api/cases/${caseRecord.id}/export/pdf`}>导出 PDF</Link>
        </div>
      </div>
      <Notice
        error={query.error ? decodeURIComponent(query.error) : undefined}
        success={query.saved ? "个案已保存" : query.generated ? "AI 辅助内容已生成" : undefined}
      />
      <div className="detail-layout">
        <section>
          <h3 className="section-title">个案资料</h3>
          <CaseForm action={updateCaseAction} caseRecord={caseRecord} submitLabel="保存修改" />
        </section>
        <section>
          <h3 className="section-title">AI 辅助输出</h3>
          {output ? (
            <AiOutputView output={output} />
          ) : (
            <div className="empty-card">
              <img src="/assets/case-desk.png" alt="社工整理个案资料的办公桌场景" />
              <h3>尚未生成辅助内容</h3>
              <p>保存个案资料后点击“生成 AI 辅助内容”，系统会结合后台资源库生成摘要、流程、话术和报告草稿。</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
