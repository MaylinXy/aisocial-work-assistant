import { NextResponse } from "next/server";
import { canAccessCase, requireUser } from "@/lib/auth";
import { buildDocx, safeFilename } from "@/lib/export";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await context.params;
  const caseRecord = await prisma.caseRecord.findUnique({
    where: { id },
    include: {
      generations: { take: 1, orderBy: { createdAt: "desc" } }
    }
  });

  if (!caseRecord || !canAccessCase(user, caseRecord.workerId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await buildDocx(caseRecord);
  const filename = `${safeFilename(caseRecord.clientName)}-服务报告.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    }
  });
}
