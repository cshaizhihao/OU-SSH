# OU-SSH

[![release](https://img.shields.io/badge/release-v0.2.9-blue)](https://github.com/cshaizhihao/OU-SSH)
[![stack](https://img.shields.io/badge/stack-Vue%203%20%2B%20Express%20%2B%20SQLite-green)](https://github.com/cshaizhihao/OU-SSH)

OU-SSH 是一个服务器节点管理面板，包含本地登录、GitHub OAuth、SSH 密钥生成、新机初始化脚本和安全设定流程。

## 版本

`v0.2.9`

## 功能

- 本地账号登录
- GitHub OAuth 登录与绑定
- Ed25519 SSH 密钥生成与 `.zip` 下载
- GitHub 用户名驱动的初始化脚本渲染
- 首次登录强制改密
- Docker Compose 一键部署

## 安装

```bash
bash <(curl -sL https://raw.githubusercontent.com/cshaizhihao/OU-SSH/main/install.sh)
```

默认账号：

- 用户名：`admin`
- 密码：`admin`

如需启用 GitHub 授权登录，请先在 GitHub 创建 OAuth App，并使用下面的方式安装或更新配置：

```bash
GITHUB_CLIENT_ID=你的ClientID \
GITHUB_CLIENT_SECRET=你的ClientSecret \
bash <(curl -sL https://raw.githubusercontent.com/cshaizhihao/OU-SSH/main/install.sh)
```

重复执行安装脚本会保留已有 `.env`，并在传入 `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET` 或 `GITHUB_CALLBACK_URL` 时更新对应配置。需要重新生成 `.env` 时可执行：

```bash
OU_SSH_REGENERATE_ENV=1 bash <(curl -sL https://raw.githubusercontent.com/cshaizhihao/OU-SSH/main/install.sh)
```

## 本地开发

```bash
npm install
npm run dev:api
npm run dev:web
```

## 环境变量

复制 `.env.example` 为 `.env` 后按需填写 GitHub OAuth 信息。

GitHub OAuth App 配置：

- Homepage URL：`http://你的服务器IP:8080`
- Authorization callback URL：`http://你的服务器IP:8080/api/auth/github/callback`

如果你使用了自定义端口或域名，`FRONTEND_URL` 与 `GITHUB_CALLBACK_URL` 必须和 GitHub OAuth App 中填写的地址完全一致。

```text
http://你的服务器IP:8080/api/auth/github/callback
```

## 项目地址

https://github.com/cshaizhihao/OU-SSH
