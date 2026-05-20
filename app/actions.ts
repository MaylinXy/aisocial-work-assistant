"use server";

import bcrypt from "bcryptjs";
import { Prisma, Role, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, requireAdmin, requireUser, setSession, canAccessCase } from "@/lib/auth";
import { generateCaseAssistance } from "@/lib/deepseek";
import { prisma } from "@/lib/prisma";
import { findMatchedResources } from "@/lib/resources";
import {
  caseSchema,
  formDataToObject,
  loginSchema,
  registerSchema,
  resourceSchema,
  userSchema
} from "@/lib/validation";

function encodeError(message: string) {
  return encodeURIComponent(message);
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/login?error=${encodeError("请输入账号和密码")}`);
  }

  const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (!user || user.status !== UserStatus.ACTIVE) {
    redirect(`/login?error=${encodeError("账号不存在或已停用")}`);
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    redirect(`/login?error=${encodeError("账号或密码错误")}`);
  }

  await setSession(user);
  redirect("/cases");
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/register?error=${encodeError(parsed.error.issues[0]?.message || "注册信息校验失败")}`);
  }

  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (existing) {
    redirect(`/register?error=${encodeError("这个账号已经被使用，请换一个")}`);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      role: Role.WORKER,
      passwordHash
    }
  });

  await setSession(user);
  redirect("/cases");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function createCaseAction(formData: FormData) {
  const user = await requireUser();
  const parsed = caseSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/cases/new?error=${encodeError(parsed.error.issues[0]?.message || "表单校验失败")}`);
  }

  const caseRecord = await prisma.caseRecord.create({
    data: {
      ...parsed.data,
      workerId: user.id
    }
  });

  redirect(`/cases/${caseRecord.id}`);
}

export async function updateCaseAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const existing = await prisma.caseRecord.findUnique({ where: { id } });
  if (!existing || !canAccessCase(user, existing.workerId)) {
    redirect("/cases");
  }

  const parsed = caseSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/cases/${id}?error=${encodeError(parsed.error.issues[0]?.message || "表单校验失败")}`);
  }

  await prisma.caseRecord.update({
    where: { id },
    data: parsed.data
  });

  revalidatePath(`/cases/${id}`);
  redirect(`/cases/${id}?saved=1`);
}

export async function generateCaseAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") || "");
  const caseRecord = await prisma.caseRecord.findUnique({ where: { id } });
  if (!caseRecord || !canAccessCase(user, caseRecord.workerId)) {
    redirect("/cases");
  }

  try {
    const matchedResources = await findMatchedResources(caseRecord);
    const result = await generateCaseAssistance(caseRecord, matchedResources);

    await prisma.aiGeneration.create({
      data: {
        caseId: id,
        inputSnapshot: result.inputSnapshot as Prisma.InputJsonValue,
        output: result.output as Prisma.InputJsonValue,
        rawOutput: result.rawOutput,
        provider: result.provider,
        model: result.model,
        promptVersion: result.promptVersion,
        tokenUsage: result.tokenUsage as Prisma.InputJsonValue | undefined,
        latencyMs: result.latencyMs,
        createdById: user.id
      }
    });

    await prisma.caseRecord.update({
      where: { id },
      data: { status: "GENERATED" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 生成失败";
    redirect(`/cases/${id}?error=${encodeError(message)}`);
  }

  revalidatePath(`/cases/${id}`);
  redirect(`/cases/${id}?generated=1`);
}

export async function createResourceAction(formData: FormData) {
  await requireAdmin();
  const parsed = resourceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/admin/resources?error=${encodeError(parsed.error.issues[0]?.message || "资源表单校验失败")}`);
  }

  const { id: _id, ...data } = parsed.data;
  await prisma.resourceEntry.create({ data });
  revalidatePath("/admin/resources");
  redirect("/admin/resources?saved=1");
}

export async function updateResourceAction(formData: FormData) {
  await requireAdmin();
  const parsed = resourceSchema.safeParse(formDataToObject(formData));
  if (!parsed.success || !parsed.data.id) {
    redirect(`/admin/resources?error=${encodeError(parsed.success ? "缺少资源 ID" : parsed.error.issues[0]?.message || "资源表单校验失败")}`);
  }

  const { id, ...data } = parsed.data;
  await prisma.resourceEntry.update({ where: { id }, data });
  revalidatePath("/admin/resources");
  redirect("/admin/resources?saved=1");
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const parsed = userSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    redirect(`/admin/users?error=${encodeError(parsed.error.issues[0]?.message || "用户表单校验失败")}`);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      role: parsed.data.role || Role.WORKER,
      passwordHash
    }
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}
