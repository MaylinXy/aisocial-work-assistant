import { describe, expect, it } from "vitest";
import { registerSchema, reportDraftSchema } from "@/lib/validation";

describe("registerSchema", () => {
  it("accepts valid worker registration data", () => {
    const parsed = registerSchema.safeParse({
      username: "worker_01",
      displayName: "社区社工",
      password: "ChangeMe123!",
      confirmPassword: "ChangeMe123!"
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const parsed = registerSchema.safeParse({
      username: "worker_01",
      displayName: "社区社工",
      password: "ChangeMe123!",
      confirmPassword: "ChangeMe456!"
    });

    expect(parsed.success).toBe(false);
  });
});

describe("reportDraftSchema", () => {
  it("accepts an edited report draft", () => {
    const parsed = reportDraftSchema.safeParse({ reportDraft: "一、基本情况\n服务对象情况稳定。" });
    expect(parsed.success).toBe(true);
  });

  it("rejects an empty report draft", () => {
    const parsed = reportDraftSchema.safeParse({ reportDraft: "   " });
    expect(parsed.success).toBe(false);
  });
});
