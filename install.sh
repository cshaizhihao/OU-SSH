#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/cshaizhihao/OU-SSH.git"
TARGET_DIR="${OU_SSH_HOME:-/opt/ou-ssh}"
PORT="${OU_SSH_PORT:-8080}"

banner() {
  cat <<'EOF'
 ██████╗ ██╗   ██╗    ██████╗ ███████╗██╗  ██╗
██╔═══██╗██║   ██║    ██╔══██╗██╔════╝██║  ██║
██║   ██║██║   ██║    ██████╔╝███████╗███████║
██║   ██║██║   ██║    ██╔═══╝ ╚════██║██╔══██║
╚██████╔╝╚██████╔╝    ██║     ███████║██║  ██║
 ╚═════╝  ╚═════╝     ╚═╝     ╚══════╝╚═╝  ╚═╝
EOF
}

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    echo "Please run this installer as root."
    exit 1
  fi
}

ensure_pkg_manager() {
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    DEBIAN_FRONTEND=noninteractive apt-get install -y git curl openssl ca-certificates
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y git curl openssl ca-certificates
  elif command -v yum >/dev/null 2>&1; then
    yum install -y git curl openssl ca-certificates
  else
    echo "Unsupported package manager."
    exit 1
  fi
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    curl -fsSL https://get.docker.com | sh
  fi

  if command -v systemctl >/dev/null 2>&1; then
    systemctl enable --now docker >/dev/null 2>&1 || true
  fi

  if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose plugin is not available."
    exit 1
  fi
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

prepare_source() {
  if [ -d "$TARGET_DIR/.git" ]; then
    git -C "$TARGET_DIR" pull --ff-only
  else
    git clone "$REPO_URL" "$TARGET_DIR"
  fi
}

write_env_file() {
  local frontend_url
  local host_ip
  local env_file
  local env_port
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
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d
EOF
}

run_stack() {
  cd "$TARGET_DIR"
  docker compose up -d --build
}

print_summary() {
  local host_ip
  local public_url
  host_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  if [ -z "${host_ip:-}" ]; then
    host_ip="127.0.0.1"
  fi
  public_url="http://${host_ip}:${PORT}"

  if [ -f "$TARGET_DIR/.env" ] && grep -q '^FRONTEND_URL=' "$TARGET_DIR/.env"; then
    public_url="$(grep '^FRONTEND_URL=' "$TARGET_DIR/.env" | tail -n 1 | cut -d= -f2-)"
  fi

  cat <<EOF

OU-SSH is ready.
Open: ${public_url}
Default account: admin
Default password: admin
EOF
}

main() {
  banner
  require_root
  ensure_pkg_manager
  ensure_docker
  prepare_source
  write_env_file
  run_stack
  print_summary
}

main "$@"
