#!/bin/bash

# Echain Deployment Script
# =========================
# Automated deployment to Vercel with pre-flight checks

set -e  # Exit on error

echo "======================================"
echo "Echain Deployment Script"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="echain-frontend"
DEPLOY_ENV=${1:-"production"}  # production, preview, or development

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${NC}ℹ $1${NC}"
}

# Pre-flight checks
preflight_checks() {
    print_info "Running pre-flight checks..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the frontend directory?"
        exit 1
    fi
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not installed. Install with: npm i -g vercel"
        exit 1
    fi
    
    # Check if git is clean
    if [[ -n $(git status -s) ]]; then
        print_warning "Git working directory is not clean"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Pre-flight checks passed"
}

# Environment validation
validate_environment() {
    print_info "Validating environment variables..."
    
    # Run environment validation script
    if [ -f "tools/scripts/validate-env.cjs" ]; then
        if npm run validate:env; then
            print_success "Environment variables validated"
        else
            print_error "Environment validation failed"
            exit 1
        fi
    else
        print_warning "Environment validation script not found, skipping..."
    fi
}

# Run tests
run_tests() {
    print_info "Running tests..."
    
    # Type check
    if npm run type-check; then
        print_success "Type check passed"
    else
        print_error "Type check failed"
        exit 1
    fi
    
    # Linting
    if npm run lint; then
        print_success "Linting passed"
    else
        print_warning "Linting found issues (not blocking)"
    fi
    
    # E2E tests (optional, can be slow)
    if [ "$RUN_E2E" = "true" ]; then
        print_info "Running E2E tests..."
        if npm run test:e2e; then
            print_success "E2E tests passed"
        else
            print_error "E2E tests failed"
            exit 1
        fi
    fi
}

# Build check
build_check() {
    print_info "Running build check..."
    
    if npm run build; then
        print_success "Build successful"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_info "Deploying to Vercel ($DEPLOY_ENV)..."
    
    if [ "$DEPLOY_ENV" = "production" ]; then
        vercel --prod
    else
        vercel
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Deployment successful!"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Post-deployment checks
post_deployment_checks() {
    print_info "Running post-deployment checks..."
    
    # Get deployment URL
    DEPLOY_URL=$(vercel inspect --token=$VERCEL_TOKEN 2>/dev/null | grep "https://" | head -1 || echo "")
    
    if [ -n "$DEPLOY_URL" ]; then
        print_info "Deployment URL: $DEPLOY_URL"
        
        # Check health endpoint
        print_info "Checking health endpoint..."
        HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/health" || echo "000")
        
        if [ "$HEALTH_STATUS" = "200" ]; then
            print_success "Health check passed"
        else
            print_warning "Health check returned status: $HEALTH_STATUS"
        fi
    else
        print_warning "Could not retrieve deployment URL"
    fi
}

# Main execution
main() {
    echo "Deployment Environment: $DEPLOY_ENV"
    echo ""
    
    preflight_checks
    validate_environment
    run_tests
    build_check
    deploy_to_vercel
    post_deployment_checks
    
    echo ""
    echo "======================================"
    print_success "Deployment Complete!"
    echo "======================================"
}

# Run main function
main
