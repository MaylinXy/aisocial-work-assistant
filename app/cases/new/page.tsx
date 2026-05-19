import { createCaseAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { CaseForm } from "@/components/case-form";
import { Notice } from "@/components/notice";
import { requireUser } from "@/lib/auth";

export default async function NewCasePage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  return (
    <AppShell user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">New Case</span>
          <h2>新建个案</h2>
          <p>先录入经服务对象授权的必要信息，避免填写身份证号、完整住址等高敏数据。</p>
        </div>
      </div>
      <Notice error={params.error ? decodeURIComponent(params.error) : undefined} />
      <CaseForm action={createCaseAction} submitLabel="保存个案" />
    </AppShell>
  );
}
