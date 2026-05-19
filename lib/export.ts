import "server-only";

import { existsSync } from "node:fs";
import PDFDocument from "pdfkit";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from "docx";
import type { AiGeneration, CaseRecord } from "@prisma/client";
import { riskLabel } from "@/lib/validation";
import { aiOutputSchema, type AiOutput } from "@/lib/prompt";

export type CaseWithGeneration = CaseRecord & {
  generations: AiGeneration[];
};

function latestOutput(caseRecord: CaseWithGeneration): AiOutput | null {
  const latest = caseRecord.generations[0];
  if (!latest) return null;
  return aiOutputSchema.parse(latest.output);
}

function disclaimer() {
  return "声明：本报告由 AI 辅助生成，仅用于社工个案整理和文书草稿参考，不替代社工专业判断、医疗诊断、法律意见或当地主管部门正式政策口径。";
}

function reportLines(caseRecord: CaseWithGeneration) {
  const output = latestOutput(caseRecord);
  return [
    "AI社工个案咨询辅助助手服务报告",
    "",
    `服务对象：${caseRecord.clientName}`,
    `年龄：${caseRecord.age ?? "未填写"}`,
    `性别：${caseRecord.gender || "未填写"}`,
    `主要问题：${caseRecord.problemType}`,
    `风险等级：${riskLabel(caseRecord.riskLevel)}`,
    `咨询场景：${caseRecord.scene}`,
    "",
    "一、个案基础情况",
    caseRecord.currentIssue,
    "",
    "二、既往服务与诉求",
    `既往服务：${caseRecord.serviceHistory}`,
    `主要诉求：${caseRecord.needs}`,
    `已掌握资源：${caseRecord.availableResources || "未填写"}`,
    "",
    "三、AI辅助生成结果",
    output ? output.reportDraft : "尚未生成 AI 报告草稿。",
    "",
    "四、人工复核事项",
    output ? output.humanReviewNotes.map((note, index) => `${index + 1}. ${note}`).join("\n") : "生成前请由社工补充复核事项。",
    "",
    disclaimer()
  ];
}

export async function buildDocx(caseRecord: CaseWithGeneration) {
  const children = reportLines(caseRecord).map((line, index) => {
    if (index === 0) {
      return new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        children: [new TextRun(line)]
      });
    }
    if (/^[一二三四五六七八九十]、/.test(line)) {
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun(line)]
      });
    }
    return new Paragraph({
      spacing: { after: 160 },
      children: [new TextRun(line || " ")]
    });
  });

  const document = new Document({
    sections: [{ children }]
  });

  return Packer.toBuffer(document);
}

export async function buildPdf(caseRecord: CaseWithGeneration) {
  const fontPath = process.env.PDF_FONT_PATH || "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc";

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (existsSync(fontPath)) {
      doc.registerFont("NotoSansCJK", fontPath);
      doc.font("NotoSansCJK");
    }

    const lines = reportLines(caseRecord);
    lines.forEach((line, index) => {
      if (index === 0) {
        doc.fontSize(18).text(line, { align: "center" }).moveDown(1);
        doc.fontSize(11);
        return;
      }
      if (/^[一二三四五六七八九十]、/.test(line)) {
        doc.moveDown(0.5).fontSize(13).text(line).fontSize(11).moveDown(0.2);
        return;
      }
      doc.text(line || " ", { lineGap: 4 }).moveDown(0.2);
    });

    doc.end();
  });
}

export function safeFilename(value: string) {
  return value.replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 60) || "case-report";
}
