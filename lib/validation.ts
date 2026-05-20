import { Role, RiskLevel } from "@prisma/client";
import { z } from "zod";

const optionalText = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  },
  z.string().nullable()
);

const optionalAge = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return Number(value);
  },
  z.number().int().min(0).max(120).optional()
);

export const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入账号"),
  password: z.string().min(1, "请输入密码")
});

export const registerSchema = z.object({
  username: z.string().trim().min(3, "账号至少 3 位").max(40).regex(/^[a-zA-Z0-9_.-]+$/, "账号只能包含字母、数字、点、下划线和短横线"),
  displayName: z.string().trim().min(1, "请填写姓名").max(60),
  password: z.string().min(8, "密码至少 8 位").max(120),
  confirmPassword: z.string().min(1, "请再次输入密码")
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"]
});

export const caseSchema = z.object({
  clientName: z.string().trim().min(1, "请填写姓名或编号").max(80),
  age: optionalAge,
  gender: optionalText,
  problemType: z.string().trim().min(1, "请选择主要问题").max(60),
  riskLevel: z.nativeEnum(RiskLevel),
  scene: z.string().trim().min(1).max(60),
  currentIssue: z.string().trim().min(1, "请填写当前情况").max(4000),
  serviceHistory: z.string().trim().min(1, "请填写既往服务记录").max(4000),
  needs: z.string().trim().min(1, "请填写服务对象主要诉求").max(4000),
  availableResources: optionalText
});

export const resourceSchema = z.object({
  id: optionalText,
  title: z.string().trim().min(1, "请填写资源名称").max(120),
  category: z.string().trim().min(1, "请填写分类").max(60),
  targetGroup: optionalText,
  region: optionalText,
  description: z.string().trim().min(1, "请填写资源说明").max(4000),
  materials: optionalText,
  contact: optionalText,
  keywords: optionalText,
  enabled: z.preprocess(
    (value) => (value === undefined ? undefined : value === "on" || value === "true"),
    z.boolean().default(true)
  )
});

export const userSchema = z.object({
  username: z.string().trim().min(3, "账号至少 3 位").max(40).regex(/^[a-zA-Z0-9_.-]+$/, "账号只能包含字母、数字、点、下划线和短横线"),
  displayName: z.string().trim().min(1, "请填写姓名").max(60),
  password: z.string().min(8, "密码至少 8 位").max(120),
  role: z.nativeEnum(Role).default(Role.WORKER)
});

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export function riskLabel(riskLevel: RiskLevel) {
  const labels: Record<RiskLevel, string> = {
    LOW: "低风险",
    MID: "中风险",
    HIGH: "高风险/需重点跟进"
  };
  return labels[riskLevel];
}
