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

  if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose plugin is not available."
    exit 1
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
  host_ip="$(hostname -I 2>/dev/null | awk '{print $1}')"
  if [ -z "${host_ip:-}" ]; then
    host_ip="127.0.0.1"
  fi
  frontend_url="http://${host_ip}:${PORT}"

  cat > "$TARGET_DIR/.env" <<EOF
PORT=3000
DATA_DIR=/data
DATABASE_PATH=/data/ou-ssh.sqlite
FRONTEND_URL=${frontend_url}
CORS_ORIGIN=${frontend_url}
GITHUB_CALLBACK_URL=${frontend_url}/api/auth/github/callback
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

main() {
  banner
  require_root
  ensure_pkg_manager
  ensure_docker
  prepare_source
  write_env_file
  run_stack

  cat <<EOF

OU-SSH is ready.
Open: http://$(hostname -I 2>/dev/null | awk '{print $1}'):${PORT}
Default account: admin
Default password: admin
EOF
}

main "$@"
