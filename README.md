# AI社工个案咨询辅助助手

面向一线社工与社区服务人员的正式 Web 版工作台，支持账号登录、个案建档、云端保存、DeepSeek AI 辅助生成、后台资源维护，以及 Word/PDF 导出。

## 功能范围

- 账号密码登录，角色分为管理员和社工。
- 社工创建、编辑和查看自己的个案；管理员可查看全部个案。
- 管理员维护政策与社区资源库，AI 只基于资源库做具体推荐。
- 个案详情页调用 DeepSeek 生成个案摘要、问题分类、服务流程、政策资源建议、心理支持话术和报告草稿。
- 导出 Word 与 PDF，报告中包含免责声明和人工复核事项。

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 创建环境变量：

```bash
cp .env.example .env
```

3. 启动 PostgreSQL：

```bash
docker compose up -d db
```

4. 迁移并 seed 管理员账号：

```bash
npm run db:migrate
npm run db:seed
```

5. 启动开发服务器：

```bash
npm run dev
```

默认管理员由 `.env` 中的 `SEED_ADMIN_USERNAME` 和 `SEED_ADMIN_PASSWORD` 控制。

## 免费部署：Vercel + Neon

如果不想购买云服务器，推荐用 Vercel 免费托管网站、Neon 免费托管 PostgreSQL。详细步骤见：

[docs/vercel-neon.md](docs/vercel-neon.md)

这个方式可以直接得到一个 `https://xxx.vercel.app` 地址，别人也能打开。注意 DeepSeek API 调用仍按 DeepSeek 自身规则计费。

## 生产部署：自有云服务器

1. 在国内 Ubuntu 云服务器安装 Docker 与 Docker Compose。
2. 配置 `.env`，至少填写 `SESSION_SECRET`、`DEEPSEEK_API_KEY` 和 `SITE_HOST`。
3. 启动服务：

```bash
docker compose up -d --build
docker compose exec web npm run db:seed
```

Caddy 会将外部请求反向代理到 Next.js Web 服务；如果 `SITE_HOST` 是正式域名，Caddy 可自动申请 HTTPS 证书。

## 环境变量

- `DATABASE_URL`：PostgreSQL 连接字符串。
- `SESSION_SECRET`：登录态签名密钥，生产环境至少 32 位。
- `DEEPSEEK_API_KEY`：DeepSeek API Key，只在服务端使用。
- `DEEPSEEK_BASE_URL`：默认 `https://api.deepseek.com`。
- `DEEPSEEK_MODEL`：默认 `deepseek-v4-pro`。
- `PDF_FONT_PATH`：中文 PDF 字体路径，Docker 镜像内默认安装 Noto CJK。

## 测试

```bash
npm run test
```

当前测试覆盖会话签名、AI 输出 JSON 解析和资源匹配评分。

## 隐私边界

第一版不建议录入身份证号、完整住址、银行卡、完整手机号等高敏字段。AI 输出仅作为社工文书辅助，需要人工复核政策口径、医疗/法律风险和资源可用性。
