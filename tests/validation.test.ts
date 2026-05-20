import { describe, expect, it } from "vitest";
import { registerSchema } from "@/lib/validation";

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
