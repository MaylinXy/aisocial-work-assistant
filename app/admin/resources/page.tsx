import { createResourceAction, updateResourceAction } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Notice } from "@/components/notice";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ResourcesPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireAdmin();
  const params = await searchParams;
  const resources = await prisma.resourceEntry.findMany({ orderBy: [{ enabled: "desc" }, { updatedAt: "desc" }] });

  return (
    <AppShell user={user}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>政策与社区资源库</h2>
          <p>AI 只基于这里维护的资源做具体推荐，未维护的信息会提示社工人工核实。</p>
        </div>
      </div>
      <Notice error={params.error ? decodeURIComponent(params.error) : undefined} success={params.saved ? "资源库已保存" : undefined} />
      <section className="admin-grid">
        <form className="form-card" action={createResourceAction}>
          <h3>新增资源</h3>
          <ResourceFields />
          <button className="primary-button" type="submit">新增资源</button>
        </form>
        <div className="stack">
          {resources.map((resource) => (
            <form className="resource-admin-card" action={updateResourceAction} key={resource.id}>
              <input type="hidden" name="id" value={resource.id} />
              <ResourceFields resource={resource} />
              <input type="hidden" name="enabled" value="false" />
              <label className="checkbox-label">
                <input type="checkbox" name="enabled" defaultChecked={resource.enabled} />
                <span>启用</span>
              </label>
              <button className="secondary-button" type="submit">保存资源</button>
            </form>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function ResourceFields({
  resource
}: {
  resource?: {
    title: string;
    category: string;
    targetGroup: string | null;
    region: string | null;
    description: string;
    materials: string | null;
    contact: string | null;
    keywords: string | null;
  };
}) {
  return (
    <>
      <label>
        <span>名称</span>
        <input name="title" defaultValue={resource?.title} required />
      </label>
      <div className="form-grid">
        <label>
          <span>分类</span>
          <input name="category" defaultValue={resource?.category} placeholder="如：老年照护" required />
        </label>
        <label>
          <span>地区</span>
          <input name="region" defaultValue={resource?.region || ""} placeholder="如：本地街道" />
        </label>
      </div>
      <label>
        <span>适用对象</span>
        <input name="targetGroup" defaultValue={resource?.targetGroup || ""} />
      </label>
      <label>
        <span>说明</span>
        <textarea name="description" defaultValue={resource?.description} required />
      </label>
      <label>
        <span>材料</span>
        <textarea name="materials" defaultValue={resource?.materials || ""} />
      </label>
      <label>
        <span>联系方式</span>
        <input name="contact" defaultValue={resource?.contact || ""} />
      </label>
      <label>
        <span>关键词</span>
        <input name="keywords" defaultValue={resource?.keywords || ""} placeholder="用空格分隔，如：独居 助餐 探访" />
      </label>
    </>
  );
}
