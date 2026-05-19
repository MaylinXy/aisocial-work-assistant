import { describe, expect, it, vi } from "vitest";

vi.stubEnv("SESSION_SECRET", "test-secret-with-more-than-thirty-two-characters");

const { createSessionToken, verifySessionToken } = await import("@/lib/auth");

describe("session token", () => {
  it("verifies a valid signed session token", () => {
    const token = createSessionToken({
      userId: "user_1",
      role: "WORKER",
      exp: Math.floor(Date.now() / 1000) + 60
    });

    expect(verifySessionToken(token)?.userId).toBe("user_1");
  });

  it("rejects a tampered token", () => {
    const token = createSessionToken({
      userId: "user_1",
      role: "WORKER",
      exp: Math.floor(Date.now() / 1000) + 60
    });

    expect(verifySessionToken(`${token}x`)).toBeNull();
  });
});
