import { RiskLevel, type CaseRecord } from "@prisma/client";
import { FormDraft } from "@/components/form-draft";

const problemGroups = [
  { label: "常用综合分类", options: ["老年照护", "困境儿童", "残障支持", "家庭矛盾", "就业与救助", "心理压力", "住房与医疗", "其他综合困难"] },
  { label: "老年服务", options: ["老年照护-独居探访", "老年照护-失能照护", "老年照护-助餐助医"] },
  { label: "儿童与家庭", options: ["困境儿童-监护支持", "困境儿童-学业与陪伴", "家庭矛盾-亲子沟通", "家庭矛盾-照护冲突"] },
  { label: "残障与康复", options: ["残障支持-康复资源", "残障支持-就业与照护", "残障支持-无障碍需求"] },
  { label: "救助与生活保障", options: ["就业与救助-临时救助", "就业与救助-就业支持", "住房与医疗-就医协助", "住房与医疗-居住困难"] },
  { label: "心理与综合支持", options: ["心理压力-情绪支持", "心理压力-危机关注", "资源引导-多方协调", "其他综合困难"] }
];
const scenes = ["常规咨询", "危机干预", "资源引导", "入户探访", "报告撰写"];
const draftFields = ["clientName", "age", "gender", "problemType", "riskLevel", "scene", "currentIssue", "serviceHistory", "needs", "availableResources"];

export function CaseForm({
  action,
  caseRecord,
  submitLabel
}: {
  action: (formData: FormData) => Promise<void>;
  caseRecord?: CaseRecord;
  submitLabel: string;
}) {
  const defaultProblemType = caseRecord?.problemType || "老年照护";

  return (
    <form className="form-card" action={action}>
      {caseRecord ? <input type="hidden" name="id" value={caseRecord.id} /> : null}
      <FormDraft storageKey={`case-form:${caseRecord?.id || "new"}`} fields={draftFields} />
      <div className="form-grid">
        <label>
          <span>姓名或编号</span>
          <input name="clientName" defaultValue={caseRecord?.clientName} placeholder="如：A20260519" required />
        </label>
        <label>
          <span>年龄</span>
          <input name="age" type="number" min={0} max={120} defaultValue={caseRecord?.age ?? ""} placeholder="如：72" />
        </label>
        <label>
          <span>性别</span>
          <select name="gender" defaultValue={caseRecord?.gender || ""}>
            <option value="">未填写</option>
            <option value="女">女</option>
            <option value="男">男</option>
            <option value="其他/不便透露">其他/不便透露</option>
          </select>
        </label>
        <label>
          <span>主要问题</span>
          <select name="problemType" defaultValue={defaultProblemType}>
            {problemGroups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <small className="field-help">优先选择最贴近主诉的细分类型，综合困难可在“当前情况”补充多重问题。</small>
        </label>
        <label>
          <span>风险等级</span>
          <select name="riskLevel" defaultValue={caseRecord?.riskLevel || RiskLevel.LOW}>
            <option value={RiskLevel.LOW}>低风险</option>
            <option value={RiskLevel.MID}>中风险</option>
            <option value={RiskLevel.HIGH}>高风险/需重点跟进</option>
          </select>
          <small className="field-help">低风险适合常规跟进；中风险需设定回访；高风险需优先核实安全、转介和紧急联系人。</small>
        </label>
        <label>
          <span>咨询场景</span>
          <select name="scene" defaultValue={caseRecord?.scene || "常规咨询"}>
            {scenes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <small className="field-help">“报告撰写”偏正式记录模板；“危机干预”会强化安全评估和紧急资源对接。</small>
        </label>
      </div>
      <label>
        <span>当前情况</span>
        <textarea name="currentIssue" defaultValue={caseRecord?.currentIssue} placeholder="示例：服务对象独居，近期因行动不便减少外出，情绪低落；子女在外地，邻里偶有照应。" required />
      </label>
      <label>
        <span>既往服务记录</span>
        <textarea name="serviceHistory" defaultValue={caseRecord?.serviceHistory} placeholder="示例：2026-05-10 社工入户评估；曾协助申请临时救助；志愿者每周三电话关怀。" required />
        <small className="field-help">建议按“时间 + 服务动作 + 当前结果”填写，便于后续生成服务记录。</small>
      </label>
      <label>
        <span>服务对象主要诉求</span>
        <textarea name="needs" defaultValue={caseRecord?.needs} placeholder="示例：希望了解助餐服务申请方式；需要就医陪伴资源；希望有人定期沟通缓解焦虑。" required />
      </label>
      <label>
        <span>已掌握资源</span>
        <textarea name="availableResources" defaultValue={caseRecord?.availableResources || ""} placeholder="示例：居委会联系人王老师；社区卫生服务中心慢病随访；街道养老服务站可咨询助餐。" />
        <small className="field-help">可写已联系机构、联系人、办理材料或限制条件；不确定的信息请标注“待核实”。</small>
      </label>
      <div className="form-actions">
        <button className="primary-button" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
