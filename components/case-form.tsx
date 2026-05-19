import { RiskLevel, type CaseRecord } from "@prisma/client";

const problemTypes = ["老年照护", "困境儿童", "残障支持", "家庭矛盾", "就业与救助", "心理压力", "住房与医疗", "其他综合困难"];
const scenes = ["常规咨询", "危机干预", "资源引导", "入户探访", "报告撰写"];

export function CaseForm({
  action,
  caseRecord,
  submitLabel
}: {
  action: (formData: FormData) => Promise<void>;
  caseRecord?: CaseRecord;
  submitLabel: string;
}) {
  return (
    <form className="form-card" action={action}>
      {caseRecord ? <input type="hidden" name="id" value={caseRecord.id} /> : null}
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
          <select name="problemType" defaultValue={caseRecord?.problemType || "老年照护"}>
            {problemTypes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>风险等级</span>
          <select name="riskLevel" defaultValue={caseRecord?.riskLevel || RiskLevel.LOW}>
            <option value={RiskLevel.LOW}>低风险</option>
            <option value={RiskLevel.MID}>中风险</option>
            <option value={RiskLevel.HIGH}>高风险/需重点跟进</option>
          </select>
        </label>
        <label>
          <span>咨询场景</span>
          <select name="scene" defaultValue={caseRecord?.scene || "常规咨询"}>
            {scenes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span>当前情况</span>
        <textarea name="currentIssue" defaultValue={caseRecord?.currentIssue} placeholder="描述服务对象当前困难、情绪状态、家庭/社区支持情况等" required />
      </label>
      <label>
        <span>既往服务记录</span>
        <textarea name="serviceHistory" defaultValue={caseRecord?.serviceHistory} placeholder="如：曾申请临时救助；社区志愿者每周探访一次" required />
      </label>
      <label>
        <span>服务对象主要诉求</span>
        <textarea name="needs" defaultValue={caseRecord?.needs} placeholder="如：经济救助、照护资源、心理支持、就医陪伴等" required />
      </label>
      <label>
        <span>已掌握资源</span>
        <textarea name="availableResources" defaultValue={caseRecord?.availableResources || ""} placeholder="如：居委会、街道社工站、社区卫生服务中心" />
      </label>
      <div className="form-actions">
        <button className="primary-button" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
