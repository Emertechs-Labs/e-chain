#!/bin/bash

# Docker QA Integration Script
# Ensures QA checks run before Docker operations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[DOCKER-QA]${NC} $1"
}

log_error() {
    echo -e "${RED}[DOCKER-QA]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[DOCKER-QA]${NC} $1"
}

# Check if we're in a Docker operation
if [ -n "$DOCKER_CONTAINER" ] || echo "$@" | grep -q "docker"; then
    log_info "Docker operation detected - running QA checks..."

    cd "$PROJECT_ROOT"

    # Run QA agent
    if bash tools/scripts/qa-agent.sh; then
        log_info "QA checks passed - proceeding with Docker operation"
        exit 0
    else
        log_error "QA checks failed - Docker operation blocked"
        log_error "Please fix QA issues before building/running containers"
        exit 1
    fi
else
    # Not a Docker operation, just run the command
    exec "$@"
fi