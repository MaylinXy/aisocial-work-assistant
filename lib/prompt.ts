import type { CaseRecord, ResourceEntry } from "@prisma/client";
import { z } from "zod";
import { riskLabel } from "@/lib/validation";

export const aiOutputSchema = z.object({
  summary: z.string(),
  problemCategory: z.string(),
  servicePriorities: z.array(z.string()),
  serviceFlow: z.array(
    z.object({
      title: z.string(),
      description: z.string()
    })
  ),
  policyResources: z.array(
    z.object({
      title: z.string(),
      reason: z.string(),
      action: z.string(),
      verifyNote: z.string()
    })
  ),
  supportScripts: z.array(
    z.object({
      scene: z.string(),
      lines: z.array(z.string())
    })
  ),
  reportDraft: z.string(),
  humanReviewNotes: z.array(z.string())
});

export type AiOutput = z.infer<typeof aiOutputSchema>;

export const promptVersion = "v2";

function scenarioGuidance(scene: string) {
  if (scene.includes("危机")) {
    return "危机干预场景：优先输出安全评估、紧急联系人核实、主管/专业机构转介、即时跟进计划；话术要短句、稳定情绪、避免承诺无法兑现事项。";
  }
  if (scene.includes("报告")) {
    return "报告撰写场景：reportDraft 使用较正式的服务记录结构，包含基本情况、服务过程、评估要点、后续计划和人工核实事项；语言客观可归档。";
  }
  if (scene.includes("资源")) {
    return "资源引导场景：重点说明资源匹配理由、对接步骤、所需材料和需核实信息；不得虚构政策名称、金额、电话或办理条件。";
  }
  if (scene.includes("入户")) {
    return "入户探访场景：重点输出入户前准备、观察要点、沟通重点、风险记录和回访安排。";
  }
  return "常规咨询场景：重点输出信息梳理、情绪支持、服务目标确认、常规跟进计划和可执行话术。";
}

function riskGuidance(riskLevel: CaseRecord["riskLevel"]) {
  if (riskLevel === "HIGH") {
    return "高风险个案：强化安全确认、紧急处理流程、转介建议、跟进频率和责任分工；避免只给泛泛安慰。";
  }
  if (riskLevel === "MID") {
    return "中风险个案：明确短期跟进节点、重点观察信号、资源连接进度和复评安排。";
  }
  return "低风险个案：侧重情绪支持、信息澄清、常规服务流程和自助/社区支持资源。";
}

export function buildCasePrompt(caseRecord: CaseRecord, resources: ResourceEntry[]) {
  const resourceText = resources.length
    ? resources
        .map(
          (resource, index) => `${index + 1}. ${resource.title}
分类：${resource.category}
适用对象：${resource.targetGroup || "未填写"}
地区：${resource.region || "未填写"}
说明：${resource.description}
材料：${resource.materials || "未填写"}
联系方式：${resource.contact || "未填写"}`
        )
        .join("\n\n")
    : "当前后台资源库没有匹配资源。请只给出需人工核实的通用对接方向，不要编造具体机构、金额、政策名称或电话。";

  return `你是“AI社工个案咨询辅助助手”的服务端生成模块，面向中国社区一线社工。

请根据个案资料和后台资源库，生成可供社工二次核实与编辑的辅助内容。

严格要求：
1. 不要编造政策、补贴金额、机构名称、联系电话或办理条件。
2. 只引用“后台资源库”中出现的资源；如果资料不足，明确写“需人工核实”。
3. 不做医疗诊断、法律结论或心理疾病诊断；只能提供社工沟通与转介建议。
4. 避免对服务对象贴标签，用客观、尊重、可执行的语言。
5. 输出必须是合法 JSON，不要 Markdown，不要代码块。

个案资料：
- 服务对象：${caseRecord.clientName}
- 年龄：${caseRecord.age ?? "未填写"}
- 性别：${caseRecord.gender || "未填写"}
- 主要问题：${caseRecord.problemType}
- 风险等级：${riskLabel(caseRecord.riskLevel)}
- 咨询场景：${caseRecord.scene}
- 当前情况：${caseRecord.currentIssue}
- 既往服务：${caseRecord.serviceHistory}
- 主要诉求：${caseRecord.needs}
- 已掌握资源：${caseRecord.availableResources || "未填写"}

场景化生成要求：
- ${scenarioGuidance(caseRecord.scene)}
- ${riskGuidance(caseRecord.riskLevel)}

后台资源库：
${resourceText}

请按以下 JSON 结构输出：
{
  "summary": "个案摘要，150-220字",
  "problemCategory": "问题分类与初步判断",
  "servicePriorities": ["优先事项1", "优先事项2", "优先事项3"],
  "serviceFlow": [
    {"title": "步骤名称", "description": "具体行动建议"}
  ],
  "policyResources": [
    {"title": "资源或政策名称", "reason": "为什么匹配", "action": "建议社工如何对接", "verifyNote": "需要人工核实的事项"}
  ],
  "supportScripts": [
    {"scene": "场景名称", "lines": ["可直接参考的话术1", "可直接参考的话术2"]}
  ],
  "reportDraft": "正式服务记录/报告草稿，分段书写",
  "humanReviewNotes": ["必须由社工核实或补充的事项"]
}`;
}

export function parseAiOutput(raw: string): AiOutput {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
  const parsed = JSON.parse(cleaned);
  return aiOutputSchema.parse(parsed);
}
