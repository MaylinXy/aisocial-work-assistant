import { describe, expect, it } from "vitest";
import { parseAiOutput } from "@/lib/prompt";

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
});
