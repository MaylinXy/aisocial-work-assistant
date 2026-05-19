import "server-only";

import type { CaseRecord, ResourceEntry } from "@prisma/client";
import { buildCasePrompt, parseAiOutput, promptVersion, type AiOutput } from "@/lib/prompt";

type DeepSeekUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  usage?: DeepSeekUsage;
};

export type AiGenerationResult = {
  output: AiOutput;
  rawOutput: string;
  model: string;
  provider: "deepseek";
  promptVersion: string;
  tokenUsage?: DeepSeekUsage;
  latencyMs: number;
  inputSnapshot: Record<string, unknown>;
};

function requiredApiKey() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured.");
  }
  return apiKey;
}

export async function generateCaseAssistance(caseRecord: CaseRecord, resources: ResourceEntry[]): Promise<AiGenerationResult> {
  const apiKey = requiredApiKey();
  const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";
  const prompt = buildCasePrompt(caseRecord, resources);
  const startedAt = Date.now();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "你是谨慎、专业的中国社区社工辅助系统。你只输出合法 JSON。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0.2,
      max_tokens: 4200
    })
  });

  const payload = (await response.json().catch(() => null)) as DeepSeekResponse | { error?: { message?: string } } | null;

  if (!response.ok) {
    const message = payload && "error" in payload ? payload.error?.message : undefined;
    throw new Error(message || `DeepSeek request failed with status ${response.status}.`);
  }

  const rawOutput = (payload as DeepSeekResponse)?.choices?.[0]?.message?.content;
  if (!rawOutput) {
    throw new Error("DeepSeek response did not include message content.");
  }

  return {
    output: parseAiOutput(rawOutput),
    rawOutput,
    model,
    provider: "deepseek",
    promptVersion,
    tokenUsage: (payload as DeepSeekResponse).usage,
    latencyMs: Date.now() - startedAt,
    inputSnapshot: {
      case: {
        id: caseRecord.id,
        clientName: caseRecord.clientName,
        age: caseRecord.age,
        gender: caseRecord.gender,
        problemType: caseRecord.problemType,
        riskLevel: caseRecord.riskLevel,
        scene: caseRecord.scene,
        currentIssue: caseRecord.currentIssue,
        serviceHistory: caseRecord.serviceHistory,
        needs: caseRecord.needs,
        availableResources: caseRecord.availableResources
      },
      resources: resources.map((resource) => ({
        id: resource.id,
        title: resource.title,
        category: resource.category,
        region: resource.region
      }))
    }
  };
}
