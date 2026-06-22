# OU-SSH

[![release](https://img.shields.io/badge/release-v0.3.3-blue)](https://github.com/cshaizhihao/OU-SSH)
[![stack](https://img.shields.io/badge/stack-Vue%203%20%2B%20Express%20%2B%20SQLite-green)](https://github.com/cshaizhihao/OU-SSH)

OU-SSH 是一个服务器节点管理面板，包含本地登录、GitHub OAuth、SSH 密钥生成、新机初始化脚本和安全设定流程。

## 版本

`v0.3.3`

## 功能

- 本地账号登录
- 会话级登录状态，关闭网页后需重新登录
- 显式退出登录
- GitHub OAuth 登录与绑定
- 应用内 GitHub OAuth 配置向导
- Ed25519 SSH 密钥生成与 `.zip` 下载
- GitHub 用户名驱动的初始化脚本渲染
- 首次登录强制改密
- 可选域名 HTTPS 自动证书与续签
- 面板内自定义新机 SSH 登录端口，默认 `5522`
- Docker Compose 一键部署

## 安装

```bash
bash <(curl -sL https://raw.githubusercontent.com/cshaizhihao/OU-SSH/main/install.sh)
```

交互式安装会询问是否已有解析到本机的域名；选择域名模式后使用 Caddy 自动申请 HTTPS 证书并自动续签。安装脚本只部署 OU-SSH 面板，不会修改当前服务器的 SSH 登录端口。

非交互安装示例：

```bash
OU_SSH_ENABLE_HTTPS=1 \
OU_SSH_DOMAIN=ssh.example.com \
ACME_EMAIL=admin@example.com \
bash <(curl -sL https://raw.githubusercontent.com/cshaizhihao/OU-SSH/main/install.sh)
```

默认账号：

- 用户名：`admin`
- 密码：`admin`

如需启用 GitHub 授权登录，可以在登录后进入“安全设定”，使用内置 GitHub OAuth 配置向导复制回调地址、打开 GitHub 创建页、保存 Client ID/Secret 并进行授权绑定。

新机 SSH 登录端口在面板“新机初始化指令”中设置，默认 `5522`。复制出的初始化脚本会在目标机器上备份 `sshd_config`、修改端口、放行防火墙端口、禁用密码登录并重启 SSH 服务。

也可以通过安装脚本预置 OAuth 配置：

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
- 域名 HTTPS 模式下改为：`https://你的域名/api/auth/github/callback`
- 权限范围：`read:user user:email`

如果你使用了自定义端口或域名，`FRONTEND_URL` 与 `GITHUB_CALLBACK_URL` 必须和 GitHub OAuth App 中填写的地址完全一致。

```text
http://你的服务器IP:8080/api/auth/github/callback
```

## 项目地址

https://github.com/cshaizhihao/OU-SSH
