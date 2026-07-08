#!/usr/bin/env zsh
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/.run-logs"
mkdir -p "$LOG_DIR"

export SPRING_DEVTOOLS_RESTART_ENABLED=false

export INVEST_DB_URL="jdbc:postgresql://localhost:5432/postgres"
export INVEST_DB_USER="myuser"
export INVEST_DB_PASSWORD="secret"
export INVEST_DB_DRIVER="org.postgresql.Driver"
export INVEST_DB_ADMIN_USER="${INVEST_DB_ADMIN_USER:-$INVEST_DB_USER}"

# Kafka для межсервисного общения. При нативном запуске сервисы ходят на хостовый
# листенер брокера (29092), поднятого через docker compose.
export SPRING_KAFKA_BOOTSTRAP_SERVERS="${SPRING_KAFKA_BOOTSTRAP_SERVERS:-localhost:29092}"

# Секреты (в application.yaml дефолтов больше нет). Значения можно переопределить
# заранее в окружении; иначе берутся dev-значения ниже.
export INVEST_JWT_SECRET="${INVEST_JWT_SECRET:-ZGV2LXNlY3JldC1rZXktZm9yLWFjY291bnQtc2VydmljZS0zMi1ieXRlcw==}"
export INVEST_ADM_SECRET="${INVEST_ADM_SECRET:-dev-admin-key}"
export INVEST_LLM_API_SECRET="${INVEST_LLM_API_SECRET:-dev-llm-api-key}"

cd "$ROOT_DIR"

# Use an already-running postgres on :5432 if there is one (e.g. a native install);
# otherwise fall back to spinning it up via docker compose.
if lsof -nP -iTCP:5432 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "[run-all] postgres already listening on :5432, reusing it (skipping docker)"
  USE_DOCKER_PG=false
else
  echo "[run-all] no postgres on :5432, starting it via docker compose"
  docker compose up -d postgres kafka > "$LOG_DIR/postgres.log" 2>&1
  USE_DOCKER_PG=true

  echo "[run-all] waiting for postgres readiness"
  for _ in {1..30}; do
    if docker compose exec -T postgres pg_isready -U "$INVEST_DB_USER" -d postgres >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if ! docker compose exec -T postgres pg_isready -U "$INVEST_DB_USER" -d postgres >/dev/null 2>&1; then
    echo "[run-all] postgres is not ready, check $LOG_DIR/postgres.log"
    exit 1
  fi
fi

echo "[run-all] fixing schema grants for '$INVEST_DB_USER'"
if [[ "$USE_DOCKER_PG" == "true" ]]; then
  docker compose exec -T postgres psql -U "$INVEST_DB_ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -c "GRANT ALL ON SCHEMA public TO $INVEST_DB_USER;"
elif command -v psql >/dev/null 2>&1; then
  PGPASSWORD="$INVEST_DB_PASSWORD" psql -h localhost -p 5432 -U "$INVEST_DB_ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -c "GRANT ALL ON SCHEMA public TO $INVEST_DB_USER;" || \
    echo "[run-all] could not apply grants (non-fatal), continuing"
else
  echo "[run-all] psql not found, skipping grants (non-fatal)"
fi

for port in 8081 8082; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "[run-all] port $port is already in use. Stop the process on $port first."
    exit 1
  fi
done

wait_for_health() {
  local name="$1"
  local url="$2"
  local allow_401="${3:-false}"
  local http_code=""

  for _ in {1..120}; do
    http_code="$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)"
    if [[ "$http_code" == "200" ]]; then
      echo "[run-all] $name ready ($http_code)"
      return 0
    fi
    if [[ "$allow_401" == "true" && "$http_code" == "401" ]]; then
      echo "[run-all] $name reachable but protected ($http_code)"
      return 0
    fi
    sleep 1
  done

  echo "[run-all] $name not ready, last status=$http_code"
  return 1
}

echo "[run-all] starting account-service on :8081"
./gradlew :account-service:bootRun --no-daemon > "$LOG_DIR/account-service.log" 2>&1 &
echo $! > "$LOG_DIR/account-service.pid"

echo "[run-all] starting market-service on :8082"
./gradlew :market-service:bootRun --no-daemon > "$LOG_DIR/market-service.log" 2>&1 &
echo $! > "$LOG_DIR/market-service.pid"

echo "[run-all] waiting for backend services"
wait_for_health "account-service" "http://localhost:8081/actuator/health"
wait_for_health "market-service" "http://localhost:8082/actuator/health"

echo "[run-all] started. logs: $LOG_DIR"
echo "[run-all] account-service :8081, market-service :8082"
echo "[run-all] запускайте фронтенд отдельно: cd frontend && npm start (http://localhost:3000)"
echo "[run-all] done"

