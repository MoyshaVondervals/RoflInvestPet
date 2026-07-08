#!/usr/bin/env zsh
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/.run-logs"

services=(account-service market-service)
ports=(8081 8082)

kill_pid_tree() {
  local pid="$1"
  local label="$2"

  if [[ -z "$pid" ]] || ! [[ "$pid" =~ '^[0-9]+$' ]]; then
    return 0
  fi

  if ! ps -p "$pid" > /dev/null 2>&1; then
    return 0
  fi

  local child_pids=("${(@f)$(pgrep -P "$pid" 2>/dev/null || true)}")
  for child_pid in "${child_pids[@]}"; do
    kill_pid_tree "$child_pid" "$label child"
  done

  echo "[stop-all] stopping $label (pid=$pid)"
  kill "$pid" >/dev/null 2>&1 || true
}

wait_until_stopped() {
  local pid="$1"
  local timeout="${2:-10}"

  for _ in $(seq 1 "$timeout"); do
    if ! ps -p "$pid" > /dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  return 1
}

force_kill_if_needed() {
  local pid="$1"
  local label="$2"

  if [[ -z "$pid" ]] || ! [[ "$pid" =~ '^[0-9]+$' ]]; then
    return 0
  fi

  if ps -p "$pid" > /dev/null 2>&1; then
    echo "[stop-all] force stopping $label (pid=$pid)"
    kill -9 "$pid" >/dev/null 2>&1 || true
  fi
}

for index in {1..${#services[@]}}; do
  service="${services[$index]}"
  pid_file="$LOG_DIR/$service.pid"

  if [[ -f "$pid_file" ]]; then
    pid="$(tr -d '[:space:]' < "$pid_file")"
    kill_pid_tree "$pid" "$service launcher"

    child_pids=("${(@f)$(pgrep -P "$pid" 2>/dev/null || true)}")
    if [[ ${#child_pids[@]} -gt 0 ]]; then
      for child_pid in "${child_pids[@]}"; do
        wait_until_stopped "$child_pid" 5 || force_kill_if_needed "$child_pid" "$service child"
      done
    fi

    wait_until_stopped "$pid" 5 || force_kill_if_needed "$pid" "$service launcher"
    rm -f "$pid_file"
  else
    echo "[stop-all] no pid file for $service"
  fi
done

for port in "${ports[@]}"; do
  port_pids=("${(@f)$(lsof -t -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)}")
  if [[ ${#port_pids[@]} -eq 0 ]]; then
    continue
  fi

  for pid in "${port_pids[@]}"; do
    kill_pid_tree "$pid" "listener on :$port"
    wait_until_stopped "$pid" 5 || force_kill_if_needed "$pid" "listener on :$port"
  done
done

if [[ -f "$ROOT_DIR/compose.yaml" ]]; then
  echo "[stop-all] stopping postgres via docker compose"
  docker compose stop postgres >/dev/null 2>&1 || true
fi

echo "[stop-all] done"
