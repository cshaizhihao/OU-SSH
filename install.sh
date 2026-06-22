#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/cshaizhihao/OU-SSH.git"
TARGET_DIR="${OU_SSH_HOME:-/opt/ou-ssh}"
PORT="${OU_SSH_PORT:-8080}"
ENABLE_HTTPS="${OU_SSH_ENABLE_HTTPS:-}"
DOMAIN="${OU_SSH_DOMAIN:-}"
ACME_EMAIL="${ACME_EMAIL:-}"

if [ -t 1 ]; then
  COLOR_BLUE="$(printf '\033[34m')"
  COLOR_GREEN="$(printf '\033[32m')"
  COLOR_YELLOW="$(printf '\033[33m')"
  COLOR_RED="$(printf '\033[31m')"
  COLOR_RESET="$(printf '\033[0m')"
else
  COLOR_BLUE=""
  COLOR_GREEN=""
  COLOR_YELLOW=""
  COLOR_RED=""
  COLOR_RESET=""
fi

step() {
  printf '\n%s▶ %s%s\n' "$COLOR_BLUE" "$1" "$COLOR_RESET"
}

success() {
  printf '%s✔ %s%s\n' "$COLOR_GREEN" "$1" "$COLOR_RESET"
}

warn() {
  printf '%s! %s%s\n' "$COLOR_YELLOW" "$1" "$COLOR_RESET"
}

fail() {
  printf '%s✖ %s%s\n' "$COLOR_RED" "$1" "$COLOR_RESET" >&2
  exit 1
}

banner() {
  cat <<'EOF'
 ██████╗ ██╗   ██╗      ███████╗███████╗██╗  ██╗
██╔═══██╗██║   ██║      ██╔════╝██╔════╝██║  ██║
██║   ██║██║   ██║█████╗███████╗███████╗███████║
██║   ██║██║   ██║╚════╝╚════██║╚════██║██╔══██║
╚██████╔╝╚██████╔╝      ███████║███████║██║  ██║
 ╚═════╝  ╚═════╝       ╚══════╝╚══════╝╚═╝  ╚═╝
                    OU-SSH
EOF
}

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    fail "请使用 root 用户运行安装脚本。"
  fi
}

ensure_pkg_manager() {
  step "安装系统依赖"

  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    DEBIAN_FRONTEND=noninteractive apt-get install -y git curl openssl ca-certificates
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y git curl openssl ca-certificates
  elif command -v yum >/dev/null 2>&1; then
    yum install -y git curl openssl ca-certificates
  else
    fail "暂不支持当前系统包管理器，请使用 Debian/Ubuntu、CentOS、Rocky Linux 或 AlmaLinux。"
  fi

  success "系统依赖已就绪"
}

ensure_docker() {
  step "检查 Docker 与 Docker Compose"

  if ! command -v docker >/dev/null 2>&1; then
    warn "未检测到 Docker，正在自动安装 Docker..."
    curl -fsSL https://get.docker.com | sh
  fi

  if command -v systemctl >/dev/null 2>&1; then
    systemctl enable --now docker >/dev/null 2>&1 || true
  fi

  if ! docker compose version >/dev/null 2>&1; then
    fail "Docker Compose 插件不可用，请确认 Docker 已正确安装。"
  fi

  success "Docker 环境已就绪"
}

ask_yes_no() {
  local prompt="$1"
  local default_answer="${2:-n}"
  local answer

  if [ ! -t 0 ]; then
    [ "$default_answer" = "y" ]
    return
  fi

  read -r -p "$prompt" answer
  answer="${answer:-$default_answer}"
  case "$answer" in
    y|Y|yes|YES|Yes|是|是的) return 0 ;;
    *) return 1 ;;
  esac
}

ask_value() {
  local prompt="$1"
  local default_value="${2:-}"
  local answer

  if [ ! -t 0 ]; then
    printf '%s' "$default_value"
    return
  fi

  read -r -p "$prompt" answer
  printf '%s' "${answer:-$default_value}"
}

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"

  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

read_env_value() {
  local file="$1"
  local key="$2"

  if [ -f "$file" ] && grep -q "^${key}=" "$file"; then
    grep "^${key}=" "$file" | tail -n 1 | cut -d= -f2-
  fi
}

prepare_source() {
  step "准备 OU-SSH 项目代码"

  if [ -d "$TARGET_DIR/.git" ]; then
    echo "检测到已有安装目录：$TARGET_DIR"
    echo "正在拉取最新代码..."
    git -C "$TARGET_DIR" pull --ff-only
  else
    echo "正在克隆项目到：$TARGET_DIR"
    git clone "$REPO_URL" "$TARGET_DIR"
  fi

  success "项目代码已就绪"
}

load_existing_env_defaults() {
  local env_file="$TARGET_DIR/.env"
  local existing_value

  if [ ! -f "$env_file" ]; then
    return
  fi

  if [ -z "${OU_SSH_ENABLE_HTTPS:-}" ]; then
    existing_value="$(read_env_value "$env_file" "OU_SSH_ENABLE_HTTPS")"
    ENABLE_HTTPS="${existing_value:-$ENABLE_HTTPS}"
  fi

  if [ -z "${OU_SSH_DOMAIN:-}" ]; then
    existing_value="$(read_env_value "$env_file" "OU_SSH_DOMAIN")"
    DOMAIN="${existing_value:-$DOMAIN}"
  fi

  if [ -z "${ACME_EMAIL:-}" ]; then
    existing_value="$(read_env_value "$env_file" "ACME_EMAIL")"
    ACME_EMAIL="${existing_value:-$ACME_EMAIL}"
  fi
}

collect_domain_settings() {
  local host_ip
  host_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  if [ -z "${host_ip:-}" ]; then
    host_ip="127.0.0.1"
  fi

  step "配置访问方式与 HTTPS 证书"

  if [ -z "$ENABLE_HTTPS" ]; then
    if ask_yes_no "是否已有域名解析到本机 IP（${host_ip}）？输入 y 启用 HTTPS [y/N] " "n"; then
      ENABLE_HTTPS="1"
    else
      ENABLE_HTTPS="0"
    fi
  fi

  if [ "$ENABLE_HTTPS" = "1" ]; then
    if [ -z "$DOMAIN" ]; then
      DOMAIN="$(ask_value "请输入 OU-SSH 面板域名，例如 ssh.example.com：")"
    fi

    if [ -z "$DOMAIN" ]; then
      fail "启用 HTTPS 时必须填写已经解析到本机的域名。"
    fi

    if [ -z "$ACME_EMAIL" ]; then
      ACME_EMAIL="$(ask_value "请输入证书通知邮箱 [admin@${DOMAIN}]：" "admin@${DOMAIN}")"
    fi

    success "已启用域名 HTTPS：Caddy 将自动申请证书并处理续签"
  else
    success "已选择 IP + 端口访问模式"
  fi
}

write_env_file() {
  local frontend_url
  local host_ip
  local env_file
  local env_port
  step "生成运行配置"

  host_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  if [ -z "${host_ip:-}" ]; then
    host_ip="127.0.0.1"
  fi
  env_file="$TARGET_DIR/.env"
  env_port="$PORT"

  if [ -f "$env_file" ] && grep -q '^OU_SSH_PORT=' "$env_file"; then
    env_port="$(grep '^OU_SSH_PORT=' "$env_file" | tail -n 1 | cut -d= -f2-)"
  fi

  PORT="$env_port"
  frontend_url="http://${host_ip}:${PORT}"
  if [ "$ENABLE_HTTPS" = "1" ]; then
    frontend_url="https://${DOMAIN}"
  fi

  if [ -f "$env_file" ] && [ "${OU_SSH_REGENERATE_ENV:-0}" != "1" ]; then
    grep -q '^PORT=' "$env_file" || upsert_env "$env_file" "PORT" "3000"
    grep -q '^DATA_DIR=' "$env_file" || upsert_env "$env_file" "DATA_DIR" "/data"
    grep -q '^DATABASE_PATH=' "$env_file" || upsert_env "$env_file" "DATABASE_PATH" "/data/ou-ssh.sqlite"
    grep -q '^FRONTEND_URL=' "$env_file" || upsert_env "$env_file" "FRONTEND_URL" "${frontend_url}"
    grep -q '^CORS_ORIGIN=' "$env_file" || upsert_env "$env_file" "CORS_ORIGIN" "${frontend_url}"
    grep -q '^GITHUB_CLIENT_ID=' "$env_file" || upsert_env "$env_file" "GITHUB_CLIENT_ID" ""
    grep -q '^GITHUB_CLIENT_SECRET=' "$env_file" || upsert_env "$env_file" "GITHUB_CLIENT_SECRET" ""
    grep -q '^GITHUB_CALLBACK_URL=' "$env_file" || upsert_env "$env_file" "GITHUB_CALLBACK_URL" "${frontend_url}/api/auth/github/callback"
    grep -q '^OU_SSH_PORT=' "$env_file" || upsert_env "$env_file" "OU_SSH_PORT" "${PORT}"
    grep -q '^DEFAULT_ADMIN_USERNAME=' "$env_file" || upsert_env "$env_file" "DEFAULT_ADMIN_USERNAME" "admin"
    grep -q '^DEFAULT_ADMIN_PASSWORD=' "$env_file" || upsert_env "$env_file" "DEFAULT_ADMIN_PASSWORD" "admin"
    grep -q '^JWT_SECRET=' "$env_file" || upsert_env "$env_file" "JWT_SECRET" "$(openssl rand -hex 32)"
    grep -q '^JWT_EXPIRES_IN=' "$env_file" || upsert_env "$env_file" "JWT_EXPIRES_IN" "7d"

    if [ -n "${GITHUB_CLIENT_ID:-}" ]; then
      upsert_env "$env_file" "GITHUB_CLIENT_ID" "$GITHUB_CLIENT_ID"
    fi

    if [ -n "${GITHUB_CLIENT_SECRET:-}" ]; then
      upsert_env "$env_file" "GITHUB_CLIENT_SECRET" "$GITHUB_CLIENT_SECRET"
    fi

    if [ -n "${GITHUB_CALLBACK_URL:-}" ]; then
      upsert_env "$env_file" "GITHUB_CALLBACK_URL" "$GITHUB_CALLBACK_URL"
    fi
    upsert_env "$env_file" "OU_SSH_ENABLE_HTTPS" "$ENABLE_HTTPS"
    upsert_env "$env_file" "OU_SSH_DOMAIN" "$DOMAIN"
    upsert_env "$env_file" "ACME_EMAIL" "$ACME_EMAIL"
    upsert_env "$env_file" "OU_SSH_SITE_ADDRESS" "${DOMAIN}"
    upsert_env "$env_file" "OU_SSH_HTTP_PORT" "80"
    upsert_env "$env_file" "OU_SSH_HTTPS_PORT" "443"

    if [ "$ENABLE_HTTPS" = "1" ]; then
      upsert_env "$env_file" "FRONTEND_URL" "$frontend_url"
      upsert_env "$env_file" "CORS_ORIGIN" "$frontend_url"
      upsert_env "$env_file" "GITHUB_CALLBACK_URL" "${GITHUB_CALLBACK_URL:-${frontend_url}/api/auth/github/callback}"
    fi
    success "运行配置已写入 $env_file"
    return
  fi

  cat > "$env_file" <<EOF
PORT=3000
DATA_DIR=/data
DATABASE_PATH=/data/ou-ssh.sqlite
FRONTEND_URL=${frontend_url}
CORS_ORIGIN=${frontend_url}
GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID:-}
GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET:-}
GITHUB_CALLBACK_URL=${GITHUB_CALLBACK_URL:-${frontend_url}/api/auth/github/callback}
OU_SSH_PORT=${PORT}
OU_SSH_ENABLE_HTTPS=${ENABLE_HTTPS}
OU_SSH_DOMAIN=${DOMAIN}
ACME_EMAIL=${ACME_EMAIL}
OU_SSH_SITE_ADDRESS=${DOMAIN}
OU_SSH_HTTP_PORT=80
OU_SSH_HTTPS_PORT=443
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
EOF

  success "运行配置已写入 $env_file"
}

run_stack() {
  step "启动 OU-SSH 面板服务"

  cd "$TARGET_DIR"
  if [ "$ENABLE_HTTPS" = "1" ]; then
    docker compose -f docker-compose.yml --profile https up -d --build
  else
    docker compose -f docker-compose.yml -f docker-compose.override.yml up -d --build
  fi

  success "服务已启动"
}

print_summary() {
  local host_ip
  local public_url
  local access_mode
  host_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  if [ -z "${host_ip:-}" ]; then
    host_ip="127.0.0.1"
  fi
  public_url="http://${host_ip}:${PORT}"

  if [ -f "$TARGET_DIR/.env" ] && grep -q '^FRONTEND_URL=' "$TARGET_DIR/.env"; then
    public_url="$(grep '^FRONTEND_URL=' "$TARGET_DIR/.env" | tail -n 1 | cut -d= -f2-)"
  fi

  access_mode="IP + 端口访问"
  if [ "$ENABLE_HTTPS" = "1" ]; then
    access_mode="域名 HTTPS 访问"
  fi

  printf '\n%s┌─ OU-SSH 安装完成 ─────────────────────────────%s\n' "$COLOR_GREEN" "$COLOR_RESET"
  printf '%s│%s  访问方式：%s\n' "$COLOR_GREEN" "$COLOR_RESET" "$access_mode"
  printf '%s│%s  面板地址：%s\n' "$COLOR_GREEN" "$COLOR_RESET" "$public_url"
  printf '%s│%s  默认账号：admin\n' "$COLOR_GREEN" "$COLOR_RESET"
  printf '%s│%s  默认密码：admin\n' "$COLOR_GREEN" "$COLOR_RESET"
  printf '%s├──────────────────────────────────────────────%s\n' "$COLOR_GREEN" "$COLOR_RESET"
  printf '%s│%s  首次登录后请立即修改默认账号和密码。\n' "$COLOR_GREEN" "$COLOR_RESET"
  printf '%s│%s  GitHub OAuth 可在面板「安全设定」中配置。\n' "$COLOR_GREEN" "$COLOR_RESET"
  printf '%s└──────────────────────────────────────────────%s\n\n' "$COLOR_GREEN" "$COLOR_RESET"
}

main() {
  banner
  require_root
  ensure_pkg_manager
  ensure_docker
  prepare_source
  load_existing_env_defaults
  collect_domain_settings
  write_env_file
  run_stack
  print_summary
}

main "$@"
