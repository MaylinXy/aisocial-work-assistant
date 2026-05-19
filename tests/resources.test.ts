import { describe, expect, it } from "vitest";
import type { ResourceEntry } from "@prisma/client";
import { scoreResourceEntry } from "@/lib/resources";

const baseResource: ResourceEntry = {
  id: "r1",
  title: "居家养老服务评估",
  category: "老年照护",
  targetGroup: "独居老人",
  region: "本地社区",
  description: "提供助餐、助洁、探访关怀等服务需求评估。",
  materials: null,
  contact: "街道社工站",
  keywords: "独居 助餐 探访 老人",
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe("scoreResourceEntry", () => {
  it("scores matching resources higher than unrelated resources", () => {
    const caseRecord = {
      problemType: "老年照护",
      currentIssue: "独居老人需要助餐和探访",
      needs: "助餐 探访",
      availableResources: ""
    };

    const unrelated = { ...baseResource, id: "r2", category: "就业与救助", keywords: "就业 培训" };

    expect(scoreResourceEntry(caseRecord, baseResource)).toBeGreaterThan(scoreResourceEntry(caseRecord, unrelated));
  });
});
