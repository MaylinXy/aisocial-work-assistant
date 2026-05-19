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

export const promptVersion = "v1";

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
