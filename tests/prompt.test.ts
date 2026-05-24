import { describe, expect, it } from "vitest";
import { RiskLevel, type CaseRecord } from "@prisma/client";
import { buildCasePrompt, parseAiOutput } from "@/lib/prompt";

describe("parseAiOutput", () => {
  it("parses valid JSON output", () => {
    const output = parseAiOutput(JSON.stringify({
      summary: "摘要",
      problemCategory: "老年照护",
      servicePriorities: ["确认安全"],
      serviceFlow: [{ title: "评估", description: "补齐资料" }],
      policyResources: [{ title: "资源", reason: "匹配", action: "联系窗口", verifyNote: "需核实" }],
      supportScripts: [{ scene: "常规咨询", lines: ["我们先一起梳理"] }],
      reportDraft: "报告草稿",
      humanReviewNotes: ["核实政策口径"]
    }));

    expect(output.policyResources[0]?.verifyNote).toBe("需核实");
  });

  it("throws on malformed output", () => {
    expect(() => parseAiOutput("{bad json")).toThrow();
  });

  it("adds scenario and risk guidance to the generation prompt", () => {
    const caseRecord: CaseRecord = {
      id: "case1",
      clientName: "A001",
      age: 72,
      gender: "女",
      problemType: "心理压力-危机关注",
      riskLevel: RiskLevel.HIGH,
      scene: "危机干预",
      currentIssue: "近期情绪波动大，需要安全确认",
      serviceHistory: "社区已电话关怀一次",
      needs: "情绪支持和紧急资源",
      availableResources: "街道社工站",
      reportDraftOverride: null,
      status: "DRAFT",
      workerId: "u1",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const prompt = buildCasePrompt(caseRecord, []);
    expect(prompt).toContain("危机干预场景");
    expect(prompt).toContain("高风险个案");
    expect(prompt).toContain("不要编造");
  });
});
