# Vercel + Neon 免费部署指南

这套方案不需要买云服务器：Vercel 托管网站，Neon 托管 PostgreSQL。DeepSeek API 调用仍按 DeepSeek 自身计费；如果没有 Key，网站能打开，但 AI 生成会提示未配置。

## 1. 准备 GitHub 仓库

1. 在 GitHub 新建一个仓库。
2. 把当前项目推上去。
3. 确认仓库里包含：
   - `package.json`
   - `vercel.json`
   - `prisma/schema.prisma`
   - `prisma/migrations/20260519000100_init/migration.sql`
   - `app/`
   - `public/assets/`

## 2. 创建 Neon 数据库

1. 注册并登录 Neon。
2. 创建一个免费 Postgres 项目。
3. 在 Neon 控制台复制两个连接串：
   - pooled connection string：给 `DATABASE_URL` 使用，适合 Vercel serverless 运行时。
   - direct connection string：给 `DIRECT_URL` 使用，适合 Prisma migration。
4. 两个连接串都建议带上 `sslmode=require`。

示例：

```env
DATABASE_URL="postgresql://user:password@xxx-pooler.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@xxx.region.aws.neon.tech/dbname?sslmode=require"
```

## 3. 在本地执行数据库迁移

在本机项目目录创建 `.env`，填入 Neon 的 `DATABASE_URL` 和 `DIRECT_URL`，然后执行：

```bash
npm install
npm run db:deploy
npm run db:seed
```

`db:seed` 会创建管理员账号，并写入几条示例资源。管理员账号由 `.env` 控制：

```env
SEED_ADMIN_USERNAME="admin"
SEED_ADMIN_PASSWORD="ChangeMe123!"
SEED_ADMIN_DISPLAY_NAME="系统管理员"
```

正式演示前请改掉默认密码。

## 4. 创建 Vercel 项目

1. 登录 Vercel。
2. 选择 `Add New Project`。
3. 导入 GitHub 仓库。
4. Framework Preset 选择 Next.js。
5. Build Command 会读取 `vercel.json`，使用：

```bash
npm run vercel-build
```

## 5. 配置 Vercel 环境变量

在 Vercel 项目 Settings -> Environment Variables 添加：

```env
DATABASE_URL="Neon pooled connection string"
DIRECT_URL="Neon direct connection string"
SESSION_SECRET="至少32位的随机字符串"
DEEPSEEK_API_KEY="你的 DeepSeek API Key"
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-v4-pro"
```

如果暂时没有 DeepSeek Key，可以先留空；登录、建档、资源库、导出等功能仍可部署验证，AI 生成按钮会报“未配置 API Key”。

## 6. 部署与访问

1. 点击 Deploy。
2. 部署完成后，Vercel 会给一个类似下面的地址：

```text
https://your-project.vercel.app
```

3. 打开地址，使用 seed 的管理员账号登录。
4. 管理员可以创建社工账号、维护资源库；社工可以创建个案并生成报告。

## 7. 自定义域名

Vercel 免费项目可以绑定自定义域名。没有域名时，用 `vercel.app` 免费域名即可给别人打开。

## 8. 注意事项

- 免费额度适合演示和小规模试用，不适合长期高并发生产。
- DeepSeek API 不属于 Vercel/Neon 免费额度，真实调用可能产生费用。
- PDF 中文导出依赖运行环境字体。Vercel 上如遇 PDF 中文乱码，优先使用 Word 导出；后续可把 Noto CJK 字体作为项目资产并设置 `PDF_FONT_PATH`。
- 不要在演示环境录入身份证号、完整住址、银行卡等高敏信息。
