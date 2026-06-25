# 华盛顿州华人总商会 网站 · CCCWA Website

华盛顿州华人总商会（Chinese Chamber of Commerce in Washington State, **CCCWA**）官方网站。
一个**双语（中 / 英）、响应式、无需构建工具**的纯静态网站，集成 **Decap / Netlify CMS** 内容管理后台，让商会工作人员无需懂代码即可更新「新闻」与「活动」。

> 这是 Infinity Academy 高中生 AI 网站开发实习项目的真实客户成果（参见仓库内的项目介绍文档）。

---

## ✨ 功能特性

- **中英双语切换**：右上角「中 / EN」一键切换，偏好保存在浏览器本地。
- **响应式设计**：手机、平板、桌面自适应（Flexbox / Grid + 媒体查询）。
- **6 个页面**：首页、关于我们、活动、新闻、会员名录、联系我们。
- **CMS 内容管理**：新闻 / 活动由 `content/*.json` 驱动，工作人员在 `/admin/` 后台可视化编辑。
- **联系表单**：基于 Netlify Forms，无需后端服务器即可收取留言。
- **无障碍 & SEO**：语义化标签、键盘可达、`meta` 描述、`robots.txt`。
- **零依赖、零构建**：纯 HTML / CSS / JS，直接部署即可上线。

---

## 📁 目录结构

```
.
├── index.html            # 首页
├── about.html            # 关于我们 / 使命
├── events.html           # 活动
├── news.html             # 新闻
├── directory.html        # 会员名录
├── contact.html          # 联系我们（含 Netlify 表单）
├── css/styles.css        # 设计系统与全部样式
├── js/
│   ├── main.js           # 语言切换、导航、滚动动效
│   └── content.js        # 抓取并渲染新闻 / 活动
├── content/
│   ├── news.json         # 新闻数据（由 CMS 编辑）
│   └── events.json       # 活动数据（由 CMS 编辑）
├── admin/
│   ├── index.html        # Decap CMS 入口
│   └── config.yml        # CMS 字段配置
├── assets/               # logo、图标、上传的图片
├── netlify.toml          # Netlify 部署配置
├── robots.txt
└── README.md
```

---

## 🚀 本地预览

因为页面用 `fetch()` 读取 JSON，**不能**直接双击打开 `index.html`（浏览器会拦截本地文件请求）。请启动一个本地静态服务器：

```bash
# 任选其一（在项目根目录运行）
python -m http.server 8080
# 或
npx serve .
```

然后访问 <http://localhost:8080>。

---

## ☁️ 部署到 Netlify

1. 把本目录推送到 GitHub 仓库。
2. 登录 [Netlify](https://app.netlify.com/) → **Add new site → Import an existing project** → 选择该仓库。
3. 构建设置：**Build command 留空**，**Publish directory 填 `.`**（已在 `netlify.toml` 中配置）。
4. 点击 **Deploy**。几十秒后即可获得 `https://<your-site>.netlify.app` 的真实网址，HTTPS 自动开启。
5. （可选）在 **Domain settings** 绑定自定义域名，如 `www.ccc-wa.org`。

---

## 🔐 启用 CMS 后台（让员工自助更新）

后台地址：`https://<your-site>/admin/`

1. Netlify 站点 → **Integrations / Identity** → **Enable Identity**。
2. **Identity → Services → Enable Git Gateway**（让 CMS 能把内容写回 Git）。
3. **Identity → Registration** 建议设为 **Invite only**，再 **Invite users** 邀请商会工作人员邮箱。
4. 工作人员点击邀请邮件 → 设置密码 → 访问 `/admin/` 登录即可编辑。

### 本地调试 CMS（不连 Netlify）

在 `admin/config.yml` 中取消注释 `local_backend: true`，然后：

```bash
npx decap-server      # 终端 1
python -m http.server 8080   # 终端 2
# 访问 http://localhost:8080/admin/
```

---

## 📝 工作人员如何更新内容

1. 打开 `https://<your-site>/admin/` 并登录。
2. 左侧选择 **「新闻 News」** 或 **「活动 Events」**。
3. 点击列表 → **「+ 添加」** 新条目，填写中英文标题、日期、摘要等。
4. 上传配图（可选），点击右上角 **Publish / 发布**。
5. 网站会在 Netlify 自动重新部署（约 1 分钟），内容随即更新——**无需改一行代码**。

### 微信公众号内容同步（手动方案，零成本）

商会在微信公众号发文后：
1. 复制文章标题与摘要；
2. 在 CMS「新闻」里新建一条，粘贴内容；
3. 在 **原文链接 (External Link)** 字段粘贴微信文章链接；
4. 发布。网站「新闻」卡片即可点击跳转到微信原文。

> 进阶（可选）：可后续接入「微信文章 → RSS → 自动写入 JSON」的自动化流程，本版本先采用稳定可靠的手动方案。

---

## 🎨 自定义

- **配色 / 字体 / 圆角等**：集中在 `css/styles.css` 顶部的 `:root` CSS 变量，改一处即可全站生效。
- **导航 / 页脚文案**：每个 `*.html` 顶部 `<header>` 与底部 `<footer>` 中，用 `data-zh` / `data-en` 标记中英文。
- **会员名录**：当前为示例数据，写在 `directory.html` 中，可直接编辑（或按需扩展为 CMS 管理）。
- **替换占位图**：关于页 / 联系页中标注「图片占位」的区域，上传真实图片替换即可。
- **商会名称**：客户文档使用「华盛顿州华人总商会」，官方英文为「Chinese Chamber of Commerce in Washington State」。如需改为「华盛顿州中国总商会」，可全局替换。

---

## 🧰 技术栈

HTML5 · CSS3（Flexbox / Grid / 自定义属性）· 原生 JavaScript（ES5/ES6）· Decap CMS · Netlify（部署 / Identity / Forms / Git Gateway）。

---

© 华盛顿州华人总商会 (CCCWA)。本网站由 Infinity Academy 实习项目设计开发。
