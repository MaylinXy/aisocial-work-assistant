import type { AiOutput } from "@/lib/prompt";

export function AiOutputView({
  output,
  caseId,
  reportDraftOverride,
  saveReportDraftAction
}: {
  output: AiOutput;
  caseId?: string;
  reportDraftOverride?: string | null;
  saveReportDraftAction?: (formData: FormData) => Promise<void>;
}) {
  const reportDraft = reportDraftOverride || output.reportDraft;

  return (
    <div className="output-grid">
      <section className="output-card">
        <h3>个案摘要</h3>
        <p>{output.summary}</p>
      </section>
      <section className="output-card">
        <h3>问题分类</h3>
        <p>{output.problemCategory}</p>
      </section>
      <section className="output-card">
        <h3>服务优先级</h3>
        <ul>
          {output.servicePriorities.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      <section className="output-card">
        <h3>服务流程</h3>
        <ol>
          {output.serviceFlow.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="output-card">
        <h3>政策资源建议</h3>
        <div className="resource-photo-small">
          <img src="/assets/resource-map.png" alt="社区资源地图与服务对接讨论场景" />
        </div>
        {output.policyResources.map((item) => (
          <article className="resource-suggestion" key={item.title}>
            <strong>{item.title}</strong>
            <p>{item.reason}</p>
            <p>{item.action}</p>
            <small>{item.verifyNote}</small>
          </article>
        ))}
      </section>
      <section className="output-card">
        <h3>心理支持话术</h3>
        {output.supportScripts.map((script) => (
          <article key={script.scene}>
            <strong>{script.scene}</strong>
            <ul>
              {script.lines.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </article>
        ))}
      </section>
      <section className="output-card output-card-wide">
        <h3>服务记录/报告草稿</h3>
        {caseId && saveReportDraftAction ? (
          <form className="report-editor" action={saveReportDraftAction}>
            <input type="hidden" name="id" value={caseId} />
            <textarea name="reportDraft" defaultValue={reportDraft} aria-label="服务记录/报告草稿" />
            <div className="report-editor-actions">
              <span>{reportDraftOverride ? "当前导出将使用社工编辑稿" : "可直接修改后保存，导出 Word/PDF 会使用保存后的版本"}</span>
              <button className="secondary-button" type="submit">保存报告草稿</button>
            </div>
          </form>
        ) : (
          <pre>{reportDraft}</pre>
        )}
      </section>
      <section className="output-card output-card-wide">
        <h3>人工复核事项</h3>
        <ul>
          {output.humanReviewNotes.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </div>
  );
}
