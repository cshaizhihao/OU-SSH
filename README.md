# OU-SSH

[![release](https://img.shields.io/badge/release-v0.2.1-blue)](https://github.com/cshaizhihao/OU-SSH)
[![stack](https://img.shields.io/badge/stack-Vue%203%20%2B%20Express%20%2B%20SQLite-green)](https://github.com/cshaizhihao/OU-SSH)

OU-SSH 是一个服务器节点管理面板，包含本地登录、GitHub OAuth、SSH 密钥生成、新机初始化脚本和安全设定流程。

## 版本

`v0.2.1`

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

## 本地开发

```bash
npm install
npm run dev:api
npm run dev:web
```

## 环境变量

复制 `.env.example` 为 `.env` 后按需填写 GitHub OAuth 信息。

## 项目地址

https://github.com/cshaizhihao/OU-SSH
