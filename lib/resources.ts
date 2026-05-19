import "server-only";

import type { CaseRecord, ResourceEntry } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CaseLike = Pick<CaseRecord, "problemType" | "currentIssue" | "needs" | "availableResources">;

function textIncludes(text: string | null | undefined, keyword: string) {
  return Boolean(text && keyword && text.includes(keyword));
}

export function scoreResourceEntry(caseRecord: CaseLike, resource: ResourceEntry) {
  const terms = [
    caseRecord.problemType,
    ...caseRecord.needs.split(/[，,。；;\s]+/),
    ...caseRecord.currentIssue.split(/[，,。；;\s]+/),
    ...(caseRecord.availableResources || "").split(/[，,。；;\s]+/)
  ]
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)
    .slice(0, 24);

  let score = 0;

  if (resource.category.includes(caseRecord.problemType) || caseRecord.problemType.includes(resource.category)) {
    score += 8;
  }

  for (const term of terms) {
    if (textIncludes(resource.title, term)) score += 3;
    if (textIncludes(resource.keywords, term)) score += 3;
    if (textIncludes(resource.targetGroup, term)) score += 2;
    if (textIncludes(resource.description, term)) score += 1;
  }

  return score;
}

export async function findMatchedResources(caseRecord: CaseLike, limit = 8) {
  const resources = await prisma.resourceEntry.findMany({
    where: { enabled: true },
    orderBy: [{ updatedAt: "desc" }]
  });

  return resources
    .map((resource) => ({ resource, score: scoreResourceEntry(caseRecord, resource) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.resource);
}
