import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const displayName = process.env.SEED_ADMIN_DISPLAY_NAME || "系统管理员";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { username },
    update: { displayName, passwordHash, role: Role.ADMIN, status: "ACTIVE" },
    create: { username, displayName, passwordHash, role: Role.ADMIN }
  });

  const resources = [
    {
      title: "居家养老服务评估",
      category: "老年照护",
      targetGroup: "高龄、独居、失能或照护不足老人",
      region: "本地社区",
      description: "用于评估居家照护、助餐、助洁、助浴、探访关怀等服务需求，具体条件以街道或民政窗口口径为准。",
      materials: "身份证明、居住证明、健康或能力评估材料、家庭支持情况说明",
      contact: "居委会/街道社工站",
      keywords: "老人 独居 助餐 助洁 助浴 探访 长护险"
    },
    {
      title: "临时救助与困难帮扶咨询",
      category: "就业与救助",
      targetGroup: "突发困难、基本生活暂时受影响的居民",
      region: "本地街道",
      description: "面向遭遇突发事件、重大疾病、收入中断等导致基本生活困难的居民，需由主管部门审核认定。",
      materials: "身份证明、家庭经济状况说明、医疗或突发困难佐证材料",
      contact: "街道民政窗口",
      keywords: "救助 低保 临时救助 医疗救助 困难帮扶"
    },
    {
      title: "社区心理支持与专业转介",
      category: "心理压力",
      targetGroup: "存在焦虑、抑郁、睡眠问题或危机风险的服务对象",
      region: "本地社区",
      description: "社工可先做基础情绪支持和风险识别；中高风险应转介精神卫生中心、心理热线或其他专业机构。",
      materials: "风险观察记录、服务对象授权、紧急联系人信息",
      contact: "社区卫生服务中心/心理热线",
      keywords: "心理 情绪 焦虑 抑郁 危机 自伤 睡眠"
    }
  ];

  for (const resource of resources) {
    await prisma.resourceEntry.upsert({
      where: { id: `seed-${resource.title}` },
      update: resource,
      create: { id: `seed-${resource.title}`, ...resource }
    });
  }

  console.log(`Seeded admin user: ${username}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
