<p align="center">
  <img src="apps/web/src/assets/ou-logo.jpg" width="120" alt="OU-SSH Logo" />
</p>

<h1 align="center">OU-SSH</h1>

<p align="center">
  Server Node Management Panel · SSH Key Generator · GitHub Trust Bootstrap
</p>

<p align="center">
  <a href="https://github.com/cshaizhihao/OU-SSH"><img src="https://img.shields.io/badge/release-V1.0.3-blue" alt="release"></a>
  <a href="https://github.com/cshaizhihao/OU-SSH"><img src="https://img.shields.io/badge/stack-Vue%203%20%2B%20Express%20%2B%20SQLite-green" alt="stack"></a>
  <a href="https://github.com/cshaizhihao/OU-SSH"><img src="https://img.shields.io/badge/deploy-Docker%20Compose-2496ED" alt="deploy"></a>
</p>

## ✨ 项目简介

OU-SSH 是一个轻量级服务器节点管理面板，用于生成 Ed25519 SSH 密钥、托管 GitHub 公钥、渲染新机初始化脚本，并提供本地账号与 GitHub OAuth 登录能力。

当前版本：**V1.0.3**

## 🚀 核心功能

- 🔐 本地账号登录，首次登录强制修改默认账号密码
- 🧩 GitHub OAuth 登录、绑定与应用内配置向导
- 🗝️ Ed25519 SSH 密钥生成，标准 `.zip` 打包下载
- 🐙 GitHub Username 双向绑定，新机脚本自动渲染
- 🛡️ 新机初始化脚本支持禁用密码登录、禁用键盘交互登录、启用公钥登录
- 🔧 面板内自定义目标机器 SSH 登录端口，默认 `5522`
- 🌐 可选域名 HTTPS，Caddy 自动申请证书并自动续签
- 🧰 安装后提供 `ou` 快捷管理指令，支持一键升级与一键卸载
- 🚪 会话级登录状态，关闭网页后需重新登录，并支持显式退出
- 🐳 Docker Compose 一键部署

## ⚡ 一键安装

```bash
bash <(curl -sL https://raw.githubusercontent.com/cshaizhihao/OU-SSH/main/install.sh)
```

默认账号：

```text
用户名：admin
密码：admin
```

安装脚本采用中文交互，会引导选择 IP + 端口访问或域名 HTTPS 访问。脚本只部署 OU-SSH 面板，不会修改当前服务器的 SSH 登录端口；目标机器的 SSH 端口在面板“新机初始化指令”中设置。

安装完成后会自动写入快捷管理指令：

```bash
ou
```

也可以直接执行：

```bash
ou upgrade
ou uninstall
```

## 🌐 域名 HTTPS 安装

确保域名已经解析到当前服务器后执行：

```bash
OU_SSH_ENABLE_HTTPS=1 \
OU_SSH_DOMAIN=ssh.example.com \
ACME_EMAIL=admin@example.com \
bash <(curl -sL https://raw.githubusercontent.com/cshaizhihao/OU-SSH/main/install.sh)
```

Caddy 会自动申请 HTTPS 证书并处理续签。

## 🐙 GitHub OAuth 配置

登录后进入 **安全设定**，面板会提供：

- OAuth App 创建入口
- Authorization callback URL
- Client ID / Client Secret 保存
- GitHub 授权绑定

GitHub OAuth App 推荐配置：

```text
Homepage URL: http://你的服务器IP:8080
Authorization callback URL: http://你的服务器IP:8080/api/auth/github/callback
HTTPS 模式: https://你的域名/api/auth/github/callback
权限范围: read:user user:email
```

也可以安装时预置：

```bash
GITHUB_CLIENT_ID=你的ClientID \
GITHUB_CLIENT_SECRET=你的ClientSecret \
bash <(curl -sL https://raw.githubusercontent.com/cshaizhihao/OU-SSH/main/install.sh)
```

## 🧪 本地开发

```bash
npm install
npm run dev:api
npm run dev:web
```

构建与检查：

```bash
npm run build
npm run check
```

## 📦 技术栈

- Vue 3 + Vite + Tailwind CSS + Pinia + GSAP
- Node.js + Express + SQLite
- Docker Compose
- Caddy HTTPS

## 🧯 安全提醒

- 首次登录后请立即修改默认账号密码
- 执行新机初始化脚本前请保持一个现有 SSH 会话不关闭
- 修改 SSH 端口和禁用密码登录后，请先新开窗口测试连接
- 部分云服务器会通过 `sshd_config.d` 或 cloud-init 覆盖 SSH 配置，OU-SSH 会写入高优先级加固配置并验证最终生效值
- 私钥文件只应保存在本地可信设备，不要上传到服务器或 GitHub

## 🔗 项目地址

https://github.com/cshaizhihao/OU-SSH
