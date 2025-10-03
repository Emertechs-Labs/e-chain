#!/bin/bash

# Development Server QA Wrapper
# Runs QA checks before starting dev server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[DEV-SERVER]${NC} $1"
}

log_error() {
    echo -e "${RED}[DEV-SERVER]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[DEV-SERVER]${NC} $1"
}

cd "$PROJECT_ROOT"

# Check if this is a dev server command
if echo "$@" | grep -q -E "(dev|start|server)"; then
    log_info "Development server startup detected"
    log_info "Running pre-launch QA checks..."

    # Run QA checks (lighter version for dev)
    if timeout 120 bash scripts/qa-agent.sh --lint-only; then
        log_success "QA checks passed - starting development server"
        log_info "Server will be available at: http://localhost:3000"
        echo ""
    else
        log_error "QA checks failed - not starting dev server"
        log_error "Fix linting issues and try again"
        exit 1
    fi
fi

# Execute the original command
exec "$@"